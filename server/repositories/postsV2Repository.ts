import type { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise";
import { pool } from "../db";
import type {
  CreatePostV2Input as SharedCreateInput,
  ImageEntry,
  PostV2DTO,
  TipTapDoc,
  UpdatePostV2Input as SharedUpdateInput,
} from "../../shared/posts";

export type CreatePostV2Input = SharedCreateInput;
export type UpdatePostV2Input = SharedUpdateInput;

export type PostV2 = PostV2DTO;

const EMPTY_DOC: TipTapDoc = { type: "doc", content: [] };

interface PostV2Row extends RowDataPacket {
  id: number;
  legacy_post_id: number | null;
  title: string;
  content: unknown;
  assets: unknown;
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

export function rowToPostV2(row: PostV2Row): PostV2 {
  return {
    id: row.id,
    legacyPostId: row.legacy_post_id,
    title: row.title,
    content: parseJsonColumn<TipTapDoc>(row.content, EMPTY_DOC),
    assets: parseJsonColumn<ImageEntry[]>(row.assets, []),
    tags: parseJsonColumn<string[]>(row.tags, []),
    createdAt: row.created_at.getTime(),
    updatedAt: row.updated_at.getTime(),
  };
}

export async function findAll(limit: number, offset: number): Promise<PostV2[]> {
  const [rows] = await pool.query<PostV2Row[]>(
    "SELECT * FROM posts_v2 ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset],
  );
  return rows.map(rowToPostV2);
}

export async function findById(id: number): Promise<PostV2 | null> {
  const [rows] = await pool.query<PostV2Row[]>("SELECT * FROM posts_v2 WHERE id = ?", [id]);
  return rows.length === 0 ? null : rowToPostV2(rows[0]);
}

export async function findByIdWithConn(
  conn: PoolConnection,
  id: number,
): Promise<PostV2 | null> {
  const [rows] = await conn.query<PostV2Row[]>("SELECT * FROM posts_v2 WHERE id = ?", [id]);
  return rows.length === 0 ? null : rowToPostV2(rows[0]);
}

export async function create(
  conn: PoolConnection,
  input: CreatePostV2Input,
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
    `INSERT INTO posts_v2 (legacy_post_id, title, content, assets, tags, created_at, updated_at)
     VALUES (NULL, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      JSON.stringify(input.content ?? EMPTY_DOC),
      "[]",
      JSON.stringify(input.tags),
      ts,
      ts,
    ],
  );
  return result.insertId;
}

export async function updateFields(
  conn: PoolConnection,
  id: number,
  patch: UpdatePostV2Input,
): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (patch.title !== undefined) { sets.push("title = ?"); params.push(patch.title); }
  if (patch.content !== undefined) {
    sets.push("content = ?");
    params.push(JSON.stringify(patch.content));
  }
  if (patch.tags !== undefined) {
    sets.push("tags = ?");
    params.push(JSON.stringify(patch.tags));
  }
  if (sets.length === 0) return true;
  sets.push("updated_at = ?");
  params.push(new Date());
  params.push(id);
  const [result] = await conn.query<ResultSetHeader>(
    `UPDATE posts_v2 SET ${sets.join(", ")} WHERE id = ?`,
    params,
  );
  return result.affectedRows > 0;
}

export async function setAssets(
  conn: PoolConnection,
  id: number,
  assets: ImageEntry[],
): Promise<void> {
  await conn.query(
    `UPDATE posts_v2 SET assets = ?, updated_at = ? WHERE id = ?`,
    [JSON.stringify(assets), new Date(), id],
  );
}

export async function deleteById(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM posts_v2 WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
}
