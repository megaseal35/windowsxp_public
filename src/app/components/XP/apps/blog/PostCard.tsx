import { PostV2DTO } from '../../../../../../shared/posts';
import { useEditor, Tiptap, TiptapContent } from '@tiptap/react'
import { editorExtensions } from './editorExtensions'

function formatDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PostCardProps {
  post: PostV2DTO;
  isAdmin?: boolean;
  onManage?: (post: PostV2DTO) => void;
}

export default function PostCard({ post, isAdmin, onManage }: PostCardProps) {
  const editor = useEditor({
    extensions: editorExtensions(),
    content: post.content,
    editable: false,
    immediatelyRender: false,
  });
  if(!editor) {
    return null;
  }
  return (
    <div className="glass-borders">
      <div className="styled-containers aero-borders">
        <header className="aero-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <h2 className="post-card-title">{post.title}</h2>
          {isAdmin && onManage && (
            <button
              type="button"
              onClick={() => onManage(post)}
              style={{ fontSize: 11, padding: "1px 8px", minWidth: 0 }}
            >
              Manage
            </button>
          )}
        </header>
      <Tiptap editor={editor}>
          <TiptapContent/>
      </Tiptap>
      {/* {img && (
        <img
          className="post-card-image"
          src={img.src}
          srcSet={img.srcSet || undefined}
          sizes="(max-width: 640px) 100vw, 600px"
          alt={post.title}
          loading="lazy"
        />
      )} */}
        {/* <div className="post-card-date">{formatDate(post.createdAt)}</div>
        {post.caption && (
          <p className="post-card-caption">{post.caption}</p>
        )}*/}
      </div>
    </div>
  );
}
