import type { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise";
import { pool } from "../db";
import type {
  CreatePostInput as SharedCreateInput,
  ImageEntry as SharedImageEntry,
  PostDTO,
  UpdatePostInput as SharedUpdateInput,
} from "../../shared/posts";

export type ImageEntry = SharedImageEntry;
export type CreatePostInput = SharedCreateInput;
export type UpdatePostInput = SharedUpdateInput;

export type Post = PostDTO;

interface LegacyImageEntry {
  width: number | "original";
  url: string;
  localPath: string;
}

interface PostRow extends RowDataPacket {
  id: number;
  title: string;
  image_url: string | null;
  images: unknown;
  caption: string | null;
  tags: unknown;
  created_at: Date;
  updated_at: Date;
}

function parseJsonColumn<T>(value: unknown, fallback: T): T {
  if (value == null) {
    return fallback;
  }
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return value as T;
}

function mimeFromExt(p: string): string {
  const ext = p.toLowerCase().split(".").pop() ?? "";
  switch (ext) {
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "png": return "image/png";
    case "gif": return "image/gif";
    case "webp": return "image/webp";
    default: return "application/octet-stream";
  }
}

function normalizeImages(raw: unknown): ImageEntry[] {
  const arr = Array.isArray(raw) ? raw : [];
  const result: ImageEntry[] = [];
  const seen = new Set<string>();
  for (const item of arr) {
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      if (typeof obj.path === "string" && typeof obj.mime === "string") {
        if (!seen.has(obj.path)) {
          seen.add(obj.path);
          result.push({ path: obj.path, mime: obj.mime });
        }
      } else if (typeof obj.localPath === "string") {
        const legacy = obj as unknown as LegacyImageEntry;
        const path = "/" + legacy.localPath.replace(/^\//, "");
        if (!seen.has(path)) {
          seen.add(path);
          result.push({ path, mime: mimeFromExt(path) });
        }
      }
    }
  }
  return result;
}

export function rowToPost(row: PostRow): Post {
  const images = normalizeImages(parseJsonColumn<unknown[]>(row.images, []));
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at.getTime(),
    updatedAt: row.updated_at.getTime(),
    imageUrl: row.image_url ?? (images[0]?.path ?? ""),
    images,
    caption: row.caption ?? "",
    tags: parseJsonColumn<string[]>(row.tags, []),
  };
}

export async function findAll(limit: number, offset: number): Promise<Post[]> {
  const [rows] = await pool.query<PostRow[]>(
    "SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset]
  );
  return rows.map(rowToPost);
}

export async function findById(id: number): Promise<Post | null> {
  const [rows] = await pool.query<PostRow[]>("SELECT * FROM posts WHERE id = ?", [id]);
  return rows.length === 0 ? null : rowToPost(rows[0]);
}

export async function createBlank(
  conn: PoolConnection,
  input: CreatePostInput,
): Promise<number> {
  let ts: Date;
  if (input.date) {
    ts = new Date(input.date);
    if (Number.isNaN(ts.getTime())) {
      throw new Error(`invalid date: ${input.date}`);
    }
  } else {
    ts = new Date();
  }
  const [result] = await conn.query<ResultSetHeader>(
    `INSERT INTO posts (title, image_url, images, caption, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [input.title, "", "[]", input.caption, JSON.stringify(input.tags), ts, ts],
  );
  return result.insertId;
}

export async function setImages(
  conn: PoolConnection,
  id: number,
  images: ImageEntry[],
): Promise<void> {
  const firstPath = images[0]?.path ?? "";
  await conn.query(
    `UPDATE posts SET image_url = ?, images = ?, updated_at = ? WHERE id = ?`,
    [firstPath, JSON.stringify(images), new Date(), id],
  );
}

export async function findByIdWithConn(
  conn: PoolConnection,
  id: number,
): Promise<Post | null> {
  const [rows] = await conn.query<PostRow[]>("SELECT * FROM posts WHERE id = ?", [id]);
  return rows.length === 0 ? null : rowToPost(rows[0]);
}

export async function deleteById(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM posts WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
}

export async function updateFields(
  conn: PoolConnection,
  id: number,
  patch: UpdatePostInput,
): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (patch.title !== undefined) { sets.push("title = ?"); params.push(patch.title); }
  if (patch.caption !== undefined) { sets.push("caption = ?"); params.push(patch.caption); }
  if (patch.tags !== undefined) {
    sets.push("tags = ?");
    params.push(JSON.stringify(patch.tags));
  }
  if (sets.length === 0) return true;
  sets.push("updated_at = ?");
  params.push(new Date());
  params.push(id);
  const [result] = await conn.query<ResultSetHeader>(
    `UPDATE posts SET ${sets.join(", ")} WHERE id = ?`,
    params,
  );
  return result.affectedRows > 0;
}
