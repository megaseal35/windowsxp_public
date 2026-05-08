import path from "node:path";
import "dotenv/config";

export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), "uploads");

export const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-only-do-not-use-in-prod";

export const PORT = Number(process.env.PORT ?? 3000);
