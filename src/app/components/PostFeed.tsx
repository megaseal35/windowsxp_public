import { useState, useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { Post } from "../../types";
import PostCard from "./PostCard";

const BATCH_SIZE = 10;

interface PostFeedProps {
  posts: Post[];
}

export default function PostFeed({ posts }: PostFeedProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, posts.length));
  }, [posts.length]);

  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView, loadMore]);

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <>
      {visiblePosts.map((post, i) => (
        <PostCard key={`${post.date}-${i}`} post={post} />
      ))}
      {hasMore && (
        <div ref={ref} className="loading-sentinel">
          Loading more...
        </div>
      )}
    </>
  );
}
