import type { PoolConnection } from "mysql2/promise";
import { PostsRepo } from "../repositories";
import { NotFoundError } from "../errors";

export type CreatePostInput = PostsRepo.CreatePostInput;
export type UpdatePostInput = PostsRepo.UpdatePostInput;
export type Post = PostsRepo.Post;
export type ImageEntry = PostsRepo.ImageEntry;

export async function list(limit: number, offset: number): Promise<Post[]> {
  return PostsRepo.findAll(limit, offset);
}

export async function getById(id: number): Promise<Post> {
  const post = await PostsRepo.findById(id);
  if (!post) throw new NotFoundError();
  return post;
}

export async function createBlank(
  conn: PoolConnection,
  input: CreatePostInput,
): Promise<number> {
  return PostsRepo.createBlank(conn, input);
}

export async function attachImages(
  conn: PoolConnection,
  id: number,
  images: ImageEntry[],
): Promise<void> {
  await PostsRepo.setImages(conn, id, images);
}

export async function getByIdWithConn(
  conn: PoolConnection,
  id: number,
): Promise<Post> {
  const post = await PostsRepo.findByIdWithConn(conn, id);
  if (!post) throw new NotFoundError();
  return post;
}

export async function update(
  conn: PoolConnection,
  id: number,
  patch: UpdatePostInput,
): Promise<void> {
  const ok = await PostsRepo.updateFields(conn, id, patch);
  if (!ok && Object.keys(patch).length > 0) {
    const existing = await PostsRepo.findByIdWithConn(conn, id);
    if (!existing) throw new NotFoundError();
  }
}

export async function remove(id: number): Promise<void> {
  const ok = await PostsRepo.deleteById(id);
  if (!ok) throw new NotFoundError();
}
