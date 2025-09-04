import Router from "@koa/router";
import UserController from "./controller";

/**
 * @desc: Defines the user-related API routes.
 */
class UserRouter {
  public static router: Router = new Router({ prefix: "/user" });

  /**
   * @desc: Expose all the routes in the user module.
   * @returns {Router}
   */
  public static init(): Router {
    this.router.post("/start_session", UserController.startSession);
    return this.router;
  }
}

export default UserRouter;
