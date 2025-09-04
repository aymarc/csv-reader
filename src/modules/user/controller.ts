import { Context } from "koa";
import UserService from "./service";

/**
 * @desc: Handles the request/response logic for user endpoints.
 */
class UserController {
  /**
   * @desc: Creates a new user session and returns a token.
   * @param ctx - The Koa context object.
   */
  public static async startSession(ctx: Context): Promise<void> {
    const email  = (ctx.request as any).body?.email || ""

    if (!email) {
      ctx.status = 400;
      ctx.body = {
         success: false,
         message: "Email is required."
        }
      return;
    }

    try {
      const token = await UserService.createSession(email);
      ctx.status = 200;
       ctx.body = {
         success: false,
         message: "Session Started successfully",
         token
       };
    } catch (error) {
      console.error("Error starting user session:", error);
      ctx.status = 500;
      ctx.body = "Failed to start session.";
    }
  }
}

export default UserController;
