import express from "express";
import "dotenv/config";
import path from "node:path";
import postsRouter from "./routes/posts";
import postsV2Router from "./routes/postsV2";
import assetsRouter from "./routes/assets";
import authRouter from "./routes/auth";
import { sessionMiddleware } from "./auth/session";
import { PORT, UPLOAD_DIR } from "./config";
import { requestLoggerMiddleware } from './middleware/apiLogger';

const app = express();

app.set("trust proxy", 1);

app.use(sessionMiddleware);
app.use(requestLoggerMiddleware);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/v2/posts", postsV2Router);
app.use("/api/v2/assets", assetsRouter);

app.use(
  "/uploads",
  express.static(UPLOAD_DIR, {
    maxAge: "1d",
  }),
);

if (process.env.NODE_ENV === "production") {
  const distDir = path.resolve(process.cwd(), "dist");
  app.use(express.static(distDir));
  app.get(/^(?!\/api\/|\/uploads\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
  console.log(`[api] uploads stored in ${UPLOAD_DIR}`);
});
