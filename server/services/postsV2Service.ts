import type { PoolConnection } from "mysql2/promise";
import { pool } from "../db";
import { PostsV2Ctrl } from "../controllers";
import { PostsV2Mapper } from "../mappers";
import * as AssetStorage from "./assetStorage";
import type { ImageEntry, TipTapDoc } from "../../shared/posts";

export type PostV2DTO = PostsV2Mapper.PostV2DTO;

function collectImageSrcs(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const child of node) collectImageSrcs(child, out);
    return out;
  }
  if (node && typeof node === "object") {
    const n = node as Record<string, unknown>;
    if (n.type === "image") {
      const src = (n.attrs as Record<string, unknown> | undefined)?.src;
      if (typeof src === "string") out.push(src);
    }
    if (Array.isArray(n.content)) collectImageSrcs(n.content, out);
  }
  return out;
}

function deriveAssets(doc: TipTapDoc): ImageEntry[] {
  const seen = new Set<string>();
  const assets: ImageEntry[] = [];
  for (const src of collectImageSrcs(doc.content)) {
    if (src.startsWith("/uploads/") && !seen.has(src)) {
      seen.add(src);
      assets.push({ path: src, mime: AssetStorage.mimeFromPath(src) });
    }
  }
  return assets;
}

async function syncAssetsFromContent(
  conn: PoolConnection,
  id: number,
  content: TipTapDoc,
): Promise<void> {
  await PostsV2Ctrl.setAssets(conn, id, deriveAssets(content));
}

export async function listPosts(limit: number, offset: number): Promise<PostV2DTO[]> {
  const posts = await PostsV2Ctrl.list(limit, offset);
  return posts.map(PostsV2Mapper.postV2ToDTO);
}

export async function getPost(id: number): Promise<PostV2DTO> {
  const post = await PostsV2Ctrl.getById(id);
  return PostsV2Mapper.postV2ToDTO(post);
}

export async function createPost(input: PostsV2Ctrl.CreatePostV2Input): Promise<PostV2DTO> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const id = await PostsV2Ctrl.create(conn, input);
    if (input.content) {
      await syncAssetsFromContent(conn, id, input.content);
    }
    const created = await PostsV2Ctrl.getByIdWithConn(conn, id);
    await conn.commit();
    return PostsV2Mapper.postV2ToDTO(created);
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

export async function updatePost(
  id: number,
  patch: PostsV2Ctrl.UpdatePostV2Input,
): Promise<PostV2DTO> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await PostsV2Ctrl.getByIdWithConn(conn, id);

    await PostsV2Ctrl.update(conn, id, patch);
    if (patch.content) {
      await syncAssetsFromContent(conn, id, patch.content);
    }
    const updated = await PostsV2Ctrl.getByIdWithConn(conn, id);
    await conn.commit();
    return PostsV2Mapper.postV2ToDTO(updated);
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

export async function deletePost(id: number): Promise<void> {
  await PostsV2Ctrl.remove(id);
  await AssetStorage.rmDirSafe(AssetStorage.postDir("posts-v2", id));
}
