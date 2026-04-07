import { useEffect, useState } from "react";
import type { Post } from "../types";
import PostFeed from "./components/PostFeed";

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/posts.json")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load posts:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="feed-container">
        <div className="loading-sentinel">Loading posts...</div>
      </div>
    );
  }

  return (
    <>
      <div className="feed-wrapper" />
      <div className="feed-container">
        <div className="feed-header">
          <h1>GoddessAlexism</h1>
        </div>
        <PostFeed posts={posts} />
      </div>
    </>
  );
}
