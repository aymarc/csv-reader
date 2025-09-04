import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import csv from "csv-parser";
import client from "../../utils/dbconfig"; // Import the shared client instance
import { IUploadedFile } from "./types";
import { ILogDetails } from "../../utils/sharedTypes";

// Type for the progress callback function
type ProgressCallback = (progress: number, timeRemaining: number) => void;

/**
 * @desc: Define the business logic behind each api call. Caller agnostic.
 * It should not have any knowledge of HTTP, WebSocket, etc.
 */
class FileService {
  /**
   * Creates the log table if it does not exist.
   */
  public static async createLogTable(): Promise<void> {
    try {
      const createTableQuery = `
                CREATE TABLE IF NOT EXISTS upload_log (
                    id SERIAL PRIMARY KEY,
                    user_email VARCHAR(255) NOT NULL,
                    original_filename VARCHAR(255) NOT NULL,
                    unique_filename VARCHAR(255) NOT NULL,
                    time_start_upload TIMESTAMP WITH TIME ZONE,
                    time_end_upload TIMESTAMP WITH TIME ZONE,
                    upload_date DATE,
                    file_size INTEGER,
                    number_rows INTEGER,
                    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `;
      await client.query(createTableQuery);
      console.log("Log table ensured to exist.");
    } catch (err) {
      console.error("Error creating log table:", err);
    }
  }

  /**
   * Logs a successful upload to the database.
   * @param logDetails - The details of the uploaded file.
   */
  private static async logUpload(logDetails: ILogDetails): Promise<void> {
    try {
      const insertQuery = `
                INSERT INTO upload_log (user_email, original_filename, unique_filename, time_start_upload, time_end_upload, upload_date, file_size, number_rows)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
            `;
      await client.query(insertQuery, [
        logDetails.userEmail,
        logDetails.originalFilename,
        logDetails.uniqueFilename,
        logDetails.timeStartUpload,
        logDetails.timeEndUpload,
        logDetails.date,
        logDetails.fileSize,
        logDetails.numberRows,
      ]);
      console.log("Upload logged successfully.");
    } catch (err) {
      console.error("Error logging upload:", err);
    }
  }

  /**
   * @desc: Process, validate, and save CSV files.
   * @param file - The uploaded file object.
   * @param userEmail - The email of the user.
   * @param progressCallback - A callback function to report progress.
   */
  public static async processAndSaveCsv(file: IUploadedFile, userEmail: string, progressCallback: ProgressCallback): Promise<void> {
    const originalFilename: string = file.filename;
    const uniqueFilename: string = `${uuidv4()}.csv`;

    console.log(`Starting upload for: ${originalFilename} as ${uniqueFilename}`);

    const fileReadStream = fs.createReadStream(file.filepath);
    // @ts-ignore
    const csvParserStream = fileReadStream.pipe(csv());

    let firstRow = true;
    let rowCount = 0;
    const totalSize = file.size;
    let uploadedBytes = 0;
    const startTime = Date.now();
    let timeStartUpload = new Date();

    await new Promise<void>((resolve, reject) => {

      fileReadStream.on("data", (chunk: any) => {
        uploadedBytes += chunk.length;
        const progress = (uploadedBytes / totalSize) * 100;
        const elapsedTime = (Date.now() - startTime) / 1000;
        const transferRate = uploadedBytes / elapsedTime;
        const timeRemaining = (totalSize - uploadedBytes) / transferRate;

        progressCallback(parseFloat(progress.toFixed(2)), parseFloat(timeRemaining.toFixed(2)));
      });

      csvParserStream.on("data", async (row: Record<string, string>) => {
        rowCount++;
        if (firstRow) {
          firstRow = false;
          const headers = Object.keys(row);
          const sanitizedHeaders = headers.map((header) => `"${header.replace(/[^a-zA-Z0-9_]/g, "")}" VARCHAR(255)`);

          try {
            const createTableQuery = `
                            CREATE TABLE IF NOT EXISTS "${uniqueFilename.replace(".csv", "")}" (
                                id SERIAL PRIMARY KEY,
                                ${sanitizedHeaders.join(", ")}
                            );
                        `;
            await client.query(createTableQuery);
            console.log(`New table created: ${uniqueFilename.replace(".csv", "")}`);
          } catch (err) {
            console.error("Error creating dynamic table:", err);
            csvParserStream.destroy(err as Error);
            return;
          }
          return;
        }

        const columns = Object.keys(row);
        const values = Object.values(row);
        const sanitizedColumns = columns.map((col) => `"${col.replace(/[^a-zA-Z0-9_]/g, "")}"`).join(", ");
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

        const insertQuery = `
                        INSERT INTO "${uniqueFilename.replace(".csv", "")}" (${sanitizedColumns})
                        VALUES (${placeholders});
                    `;

        try {
          await client.query(insertQuery, values);
        } catch (err) {
          console.error("Error inserting row:", err);
        }
      });

      csvParserStream.on("end", async () => {
        console.log("CSV stream processing finished.");
        const timeEndUpload = new Date();

        const uploadDetails: ILogDetails = {
          userEmail,
          originalFilename,
          uniqueFilename,
          timeStartUpload,
          timeEndUpload,
          date: new Date(),
          fileSize: totalSize,
          numberRows: rowCount,
        };

        await FileService.logUpload(uploadDetails);

        fs.unlinkSync(file.filepath);

        resolve();
      });

      csvParserStream.on("error", (err) => {
        console.error("CSV stream processing error:", err);
        fs.unlinkSync(file.filepath);
        reject(err);
      });
    });
  }
}

// Call the table creation method when the service is loaded
FileService.createLogTable();

export default FileService;
