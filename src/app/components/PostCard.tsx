import type { Post } from "../../types";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function getBestImage(post: Post): string {
  if (post.images.length === 0) return post.imageUrl;

  const numerics = post.images.filter((img) => typeof img.width === "number");
  if (numerics.length === 0) {
    return post.images[0].localPath;
  }

  // Pick the image closest to 1024px wide for good quality without being huge
  numerics.sort(
    (a, b) =>
      Math.abs((a.width as number) - 1024) -
      Math.abs((b.width as number) - 1024)
  );
  return numerics[0].localPath;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const imageSrc = getBestImage(post);

  return (
    <div className="post-card">
      {imageSrc && (
        <img
          className="post-card-image"
          src={`/${imageSrc}`}
          alt={post.title}
          loading="lazy"
        />
      )}
      <div className="post-card-body">
        <h2 className="post-card-title">{post.title}</h2>
        <div className="post-card-date">{formatDate(post.date)}</div>
        {post.caption && (
          <p className="post-card-caption">{post.caption}</p>
        )}
        {post.tags.length > 0 && (
          <div className="post-card-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
