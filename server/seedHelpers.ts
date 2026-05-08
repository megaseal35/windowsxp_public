import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "./db";
import { PostsSvc } from "./services";
import { UPLOAD_DIR } from "./config";

const MIME_FROM_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

function mimeFromPath(p: string): string | undefined {
  const ext = p.toLowerCase().split(".").pop() ?? "";
  return MIME_FROM_EXT[ext];
}

export type JsonImage = { width?: number | "original"; localPath?: string };

export type SeedPost = {
  title: string;
  createdAt: string;
  imageUrl?: string;
  images: JsonImage[];
  caption: string;
  tags: string[];
};

export function pickBestImage(images: JsonImage[] | undefined): JsonImage | undefined {
  if (!images?.length) return undefined;
  const original = images.find((i) => i.width === "original" && i.localPath);
  if (original) return original;
  const numerics = images.filter(
    (i): i is { width: number; localPath: string } =>
      typeof i.width === "number" && typeof i.localPath === "string",
  );
  if (numerics.length > 0) {
    return [...numerics].sort((a, b) => b.width - a.width)[0];
  }
  return images.find((i) => typeof i.localPath === "string");
}

export async function loadAsMulterFile(
  localPath: string,
): Promise<Express.Multer.File | undefined> {
  const abs = path.resolve(process.cwd(), "public", localPath);
  const mime = mimeFromPath(abs);
  if (!mime) {
    console.warn(`[seed] skipping image (unknown mime): ${abs}`);
    return undefined;
  }
  try {
    const buffer = await fs.readFile(abs);
    return {
      fieldname: "images",
      originalname: path.basename(abs),
      encoding: "7bit",
      mimetype: mime,
      buffer,
      size: buffer.length,
    } as Express.Multer.File;
  } catch (err) {
    console.warn(`[seed] missing local image ${abs}:`, err);
    return undefined;
  }
}

export async function reseedPosts(posts: SeedPost[]): Promise<{ inserted: number; total: number }> {
  await pool.query("TRUNCATE TABLE posts");

  const uploadsPostsDir = path.join(UPLOAD_DIR, "posts");
  await fs.rm(uploadsPostsDir, { recursive: true, force: true });

  let inserted = 0;
  for (const p of posts) {
    try {
      const best = pickBestImage(p.images);
      const file = best?.localPath ? await loadAsMulterFile(best.localPath) : undefined;
      const files = file ? [file] : [];

      await PostsSvc.createPostWithImages(
        { title: p.title, caption: p.caption ?? "", tags: p.tags ?? [], date: p.createdAt },
        files,
      );
      inserted++;
    } catch (err) {
      console.error(`[seed] failed for "${p.title}":`, err);
    }
  }

  return { inserted, total: posts.length };
}
