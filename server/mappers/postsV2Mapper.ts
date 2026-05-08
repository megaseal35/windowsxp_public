import type { PostsV2Repo } from "../repositories";
import type { PostV2DTO } from "../../shared/posts";

export type { PostV2DTO };

type PostV2 = PostsV2Repo.PostV2;

export function postV2ToDTO(post: PostV2): PostV2DTO {
  return {
    id: post.id,
    legacyPostId: post.legacyPostId,
    title: post.title,
    content: post.content,
    assets: post.assets,
    tags: post.tags,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}
