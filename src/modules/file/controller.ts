import type { Context } from "koa";
import FileService from "./service";
import { IUploadedFile } from "./types";
import WebSocket from "ws";
import { IWsMessage } from "../../utils/sharedTypes";
import redisClient from "../../utils/redis";

class FileController {
  public static userWsMap: Map<string, WebSocket> = new Map();
  /**
   * @desc: upload and process csv files;
   */
  public static async csvUpload(ctx: Context): Promise<void> {
    const ctxReq = ctx.request as any;
    const file: IUploadedFile = ctxReq.files?.csvFile;
    const token: string = ctxReq.body.token;
    if (!file) {
      ctx.status = 400;
      ctx.body = "No file uploaded.";
      return;
    }
    if (!token) {
      ctx.status = 401;
      ctx.body = "Authentication token is required.";
      return;
    }
    const userEmail = await redisClient.get(token);
    if (!userEmail) {
      ctx.status = 401;
      ctx.body = "Invalid or expired token.";
      return;
    }
    if (file.mime !== "text/csv") {
      console.error("Invalid file type:", file.mime);
      ctx.status = 415;
      ctx.body = "Unsupported Media Type: Only CSV files are allowed.";
      return;
    }
    const onProgress = (progress: number, timeRemaining: number) => {
      const ws = FileController.userWsMap.get(userEmail);
      if (ws && ws.readyState === WebSocket.OPEN) {
        const wsMessage: IWsMessage = { progress, timeRemaining };
        ws.send(JSON.stringify(wsMessage));
      }
    };
    try {
      await FileService.processAndSaveCsv(file, userEmail, onProgress);
      ctx.status = 200;
      ctx.body = `File "${file.filename}" uploaded and processed successfully!`;
    } catch (err) {
      console.error(err);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "Sorry! Upload failed, please contact support if it persists.",
      };
    }
  }
}

export default FileController;
