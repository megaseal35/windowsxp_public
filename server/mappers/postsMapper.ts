import type { PostsRepo } from "../repositories";
import type { PostDTO } from "../../shared/posts";

export type { PostDTO };

type Post = PostsRepo.Post;

export function postToDTO(post: Post): PostDTO {
  return {
    id: post.id,
    title: post.title,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    imageUrl: post.imageUrl,
    images: post.images,
    caption: post.caption,
    tags: post.tags,
  };
}
