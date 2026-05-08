import { pool } from "../db";
import { PostsCtrl } from "../controllers";
import { PostsMapper } from "../mappers";
import * as AssetStorage from "./assetStorage";

export type PostDTO = PostsMapper.PostDTO;
type ImageEntry = PostsCtrl.ImageEntry;

const SCOPE: AssetStorage.AssetScope = "posts";

function postDir(postId: number): string {
  return AssetStorage.postDir(SCOPE, postId);
}

const { rmDirSafe } = AssetStorage;

export async function listPosts(limit: number, offset: number): Promise<PostDTO[]> {
  const posts = await PostsCtrl.list(limit, offset);
  return posts.map(PostsMapper.postToDTO);
}

export async function getPost(id: number): Promise<PostDTO> {
  const post = await PostsCtrl.getById(id);
  return PostsMapper.postToDTO(post);
}

export async function createPostWithImages(
  input: PostsCtrl.CreatePostInput,
  files: Express.Multer.File[],
): Promise<PostDTO> {
  const conn = await pool.getConnection();
  let createdId: number | null = null;
  try {
    await conn.beginTransaction();

    createdId = await PostsCtrl.createBlank(conn, input);

    const images: ImageEntry[] = await AssetStorage.writeFiles(SCOPE, createdId, files);
    await PostsCtrl.attachImages(conn, createdId, images);
    const created = await PostsCtrl.getByIdWithConn(conn, createdId);

    await conn.commit();
    return PostsMapper.postToDTO(created);
  } catch (err) {
    await conn.rollback().catch(() => {});
    if (createdId !== null) {
      await rmDirSafe(postDir(createdId));
    }
    throw err;
  } finally {
    conn.release();
  }
}

export async function updatePostWithImages(
  id: number,
  patch: PostsCtrl.UpdatePostInput | undefined,
  files: Express.Multer.File[],
): Promise<PostDTO> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await PostsCtrl.getByIdWithConn(conn, id);

    if (patch) {
      await PostsCtrl.update(conn, id, patch);
    }

    if (files.length > 0) {
      await rmDirSafe(postDir(id));
      const images: ImageEntry[] = await AssetStorage.writeFiles(SCOPE, id, files);
      await PostsCtrl.attachImages(conn, id, images);
    }

    const updated = await PostsCtrl.getByIdWithConn(conn, id);
    await conn.commit();
    return PostsMapper.postToDTO(updated);
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

export async function deletePost(id: number): Promise<void> {
  await PostsCtrl.remove(id);
  await rmDirSafe(postDir(id));
}
