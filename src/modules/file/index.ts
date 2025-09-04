import Router from "@koa/router";
import FileController from "./controller";

/**
 * @desc: It is the routes  for the file module
 */
class FileRouter {
  public static router: Router = new Router({ prefix: "file" });

  /**
   * @desc: Expose all the routes in file module
   * @returns {Router}
   */
  public static init(): Router {
    this.router.post("/uploadCsv", FileController.csvUpload);
    return this.router;
  }
}
export default FileRouter;
