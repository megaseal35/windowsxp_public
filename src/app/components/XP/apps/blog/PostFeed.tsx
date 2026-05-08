import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import PostCard from "./PostCard";
import { Nillable } from '../../../../../../shared/common';
import { PostV2DTO } from '../../../../../../shared/posts';

const BATCH_SIZE = 10;
const NUM_COLUMNS = 3;

interface PostFeedProps {
  posts: PostV2DTO[];
  root: Nillable<HTMLDivElement>
  isAdmin?: boolean;
  onManage?: (post: PostV2DTO) => void;
}

export default function PostFeed({ posts, root, isAdmin, onManage }: PostFeedProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, posts.length));
  }, [posts.length]);

  const { ref, inView } = useInView({ threshold: 0, root });

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView, loadMore]);

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  const columnRefs = useRef<number[]>(new Array(NUM_COLUMNS).fill(0));
  const assignmentCache = useRef<Map<number, number>>(new Map());

  const columns = useMemo(() => {
    const cols: PostV2DTO[][] = Array.from({ length: NUM_COLUMNS }, () => []);

    visiblePosts.forEach((post, i) => {
      let col = assignmentCache.current.get(i);
      if (col === undefined) {
        col = columnRefs.current.indexOf(
          Math.min(...columnRefs.current)
        );
        assignmentCache.current.set(i, col);
        const hasImage = post.assets.length > 0;
        const estimatedHeight =
          (hasImage ? 300 : 0) +
          60 +
          (post.tags.length > 0 ? 30 : 0);
        columnRefs.current[col] += estimatedHeight;
      }
      cols[col].push(post);
    });

    return cols;
  }, [visiblePosts]);

  return (
    <>
      <div className="masonry-grid">
        {columns.map((colPosts, colIdx) => (
          <div className="masonry-column" key={colIdx}>
            {colPosts.map((post) => (
              <PostCard key={`${post.id}-${post.updatedAt}`} post={post} isAdmin={isAdmin} onManage={onManage} />
            ))}
          </div>
        ))}
      </div>
      {hasMore && (
        <div ref={ref} className="loading-sentinel">
          Loading more...
        </div>
      )}
    </>
  );
}
