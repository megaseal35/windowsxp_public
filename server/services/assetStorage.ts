import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "../config";
import { MIME_TO_EXT } from "../../shared/common";
import { UploadError } from "../errors";
import type { ImageEntry } from "../../shared/posts";

export type AssetScope = "posts" | "posts-v2";

const EXT_TO_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(MIME_TO_EXT).map(([mime, ext]) => [ext, mime]),
);

export function mimeFromPath(p: string): string {
  const ext = p.toLowerCase().split(".").pop() ?? "";
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}

export function postDir(scope: AssetScope, postId: number): string {
  return path.join(UPLOAD_DIR, scope, String(postId));
}

export function publicPath(
  scope: AssetScope,
  postId: number,
  index: number,
  mime: string,
): string {
  const ext = MIME_TO_EXT[mime];
  if (!ext) throw new UploadError(`no extension mapping for mime ${mime}`);
  return `/uploads/${scope}/${postId}/${index}.${ext}`;
}

export function localPath(
  scope: AssetScope,
  postId: number,
  index: number,
  mime: string,
): string {
  const ext = MIME_TO_EXT[mime];
  return path.join(postDir(scope, postId), `${index}.${ext}`);
}

export async function rmDirSafe(dir: string): Promise<void> {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (err) {
    console.error(`[assetStorage] failed to clean up ${dir}:`, err);
  }
}

export async function writeStandaloneAsset(file: Express.Multer.File): Promise<ImageEntry> {
  const ext = MIME_TO_EXT[file.mimetype];
  if (!ext) throw new UploadError(`no extension mapping for mime ${file.mimetype}`);
  const dir = path.join(UPLOAD_DIR, "assets");
  await fs.mkdir(dir, { recursive: true });
  const name = `${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir, name), file.buffer);
  return { path: `/uploads/assets/${name}`, mime: file.mimetype };
}

export async function writeFiles(
  scope: AssetScope,
  postId: number,
  files: Express.Multer.File[],
  startIndex = 0,
): Promise<ImageEntry[]> {
  await fs.mkdir(postDir(scope, postId), { recursive: true });
  const entries: ImageEntry[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const index = startIndex + i;
    await fs.writeFile(localPath(scope, postId, index, f.mimetype), f.buffer);
    entries.push({ path: publicPath(scope, postId, index, f.mimetype), mime: f.mimetype });
  }
  return entries;
}
