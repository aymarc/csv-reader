import { Context, Next } from "koa";
import Busboy from "busboy";
import path from "path";
import fs from "fs";
import os from "os";
import { v4 as uuidv4 } from "uuid";

interface BusboyOptions {
  dest?: string;
  limits?: {
    fileSize?: number;
  };
}

/**
 * Creates a Koa middleware to parse multipart form data.
 * @param {BusboyOptions} options - The configuration options for Busboy.
 */
const busboyMiddleware = (options: BusboyOptions = {}) => {
  return (ctx: Context, next: Next) => {
    return new Promise((resolve, reject) => {
      // Return early if the request is not a multipart form
      if (ctx.request.method !== "POST" || !ctx.request.is("multipart/*")) {
        return next().then(resolve, reject);
      }

      const busBoyparam: any = {
        headers: ctx.req.headers,
        limits: options.limits,
      };
      const busboy: any = Busboy(busBoyparam);

      const fields: Record<string, any> = {};
      const files: Record<string, any> = {};

      // Listener for form fields
      busboy.on("field", (fieldname: string, val: any) => {
        fields[fieldname] = val;
      });

      // Listener for file uploads
      busboy.on("file", (fieldname: string, file: any, filename: string, encoding: string, mimetype: string) => {
        // Instead of writing the file to a temporary location, we attach the readable stream
        // directly to the files object. The downstream middleware can then consume this stream.
        files[fieldname] = {
          fieldname,
          filename,
          mime: mimetype,
          encoding,
          file, // This is the file stream
        };

        file.on("limit", () => {
          console.error(`File limit reached for: ${filename}`);
          ctx.throw(413, "File too large");
        });
      });

      // Listener for when Busboy has finished parsing
      busboy.on("finish", () => {
        // Attach fields and files to the request object
        (ctx.request as any).body = fields;
        (ctx.request as any).files = files;
        next().then(resolve, reject);
      });

      // Listener for errors
      busboy.on("error", (err: any) => {
        reject(err);
      });

      // Pipe the incoming request stream to Busboy
      ctx.req.pipe(busboy);
    });
  };
};

export default busboyMiddleware;
