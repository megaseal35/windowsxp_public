import type { PoolConnection } from "mysql2/promise";
import { PostsV2Repo } from "../repositories";
import { NotFoundError } from "../errors";

export type CreatePostV2Input = PostsV2Repo.CreatePostV2Input;
export type UpdatePostV2Input = PostsV2Repo.UpdatePostV2Input;
export type PostV2 = PostsV2Repo.PostV2;

export async function list(limit: number, offset: number): Promise<PostV2[]> {
  return PostsV2Repo.findAll(limit, offset);
}

export async function getById(id: number): Promise<PostV2> {
  const post = await PostsV2Repo.findById(id);
  if (!post) throw new NotFoundError();
  return post;
}

export async function getByIdWithConn(
  conn: PoolConnection,
  id: number,
): Promise<PostV2> {
  const post = await PostsV2Repo.findByIdWithConn(conn, id);
  if (!post) throw new NotFoundError();
  return post;
}

export async function create(
  conn: PoolConnection,
  input: CreatePostV2Input,
): Promise<number> {
  return PostsV2Repo.create(conn, input);
}

export async function update(
  conn: PoolConnection,
  id: number,
  patch: UpdatePostV2Input,
): Promise<void> {
  const ok = await PostsV2Repo.updateFields(conn, id, patch);
  if (!ok && Object.keys(patch).length > 0) {
    const existing = await PostsV2Repo.findByIdWithConn(conn, id);
    if (!existing) throw new NotFoundError();
  }
}

export async function setAssets(
  conn: PoolConnection,
  id: number,
  assets: PostsV2Repo.PostV2["assets"],
): Promise<void> {
  await PostsV2Repo.setAssets(conn, id, assets);
}

export async function remove(id: number): Promise<void> {
  const ok = await PostsV2Repo.deleteById(id);
  if (!ok) throw new NotFoundError();
}
