
import Router from "@koa/router";
import config from "./config";
import FileRouter from "./modules/file/index";
import UserRouter from "./modules/user/index";

const router = new Router({ prefix: config.API_VERSION });

/**
 * The central router where all the modules/services are being initialized.
 * We attach all sub-routers here and then export this main router instance.
 */
const fileRouter = FileRouter.init();
const userRouter = UserRouter.init();
router.use(fileRouter.routes(), fileRouter.allowedMethods());
router.use(userRouter.routes(), userRouter.allowedMethods());

export default router;
