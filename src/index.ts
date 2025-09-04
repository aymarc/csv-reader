import koa from "koa";
import Router from "@koa/router";
import type { Context } from "koa";
import bodyPaser from "koa-bodyparser";
import cors from "koa2-cors";
import config from "./config";

const app = new koa();

app.use(bodyPaser());
app.use(cors({ origin: "*" }));

const router = new Router();
router.post("/test", async (ctx: Context) => {
  try {
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "you have made a successful request",
    };
  } catch (err) {
    console.error(err);
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

app
  .listen(config.PORT, "0.0.0.0", async () => {
    console.log(`Server listening on port: ${config.PORT}`);
  })
  .on("error", (err) => {
    console.error(err);
  });


