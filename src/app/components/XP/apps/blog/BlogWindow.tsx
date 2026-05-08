import { useState } from 'react';
import PostFeed from './PostFeed';
import { useGetPostsQuery } from '../../../../store/postsApi';
import PostV2Dialog from './PostV2Dialog';
import { useWindowManager } from '../../WindowManager';
import type { PostV2DTO } from '../../../../../../shared/posts';

interface BlogWindowProps {
    isAdmin?: boolean;
}

const EDITOR_SIZE = { width: 560, height: 640 };

export default function BlogWindow({ isAdmin }: BlogWindowProps) {
    const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
    const { openWindow } = useWindowManager();

    const { data: posts = [], error } = useGetPostsQuery();

    if (error) {
        console.error("Failed to load posts:", error);
    }

    const openEditor = (post: PostV2DTO | "new") => {
        const id = post === "new" ? "post-editor:new" : `post-editor:${post.id}`;
        openWindow({
            id,
            title: post === "new" ? "New post" : "Edit post",
            size: EDITOR_SIZE,
            render: (close) => (
                <PostV2Dialog initialPost={post === "new" ? undefined : post} onClose={close} />
            ),
        });
    };

    return (
        <div
            ref={setScrollRoot}
            className="post-feed-scroll"
            style={{ height: '100%', overflowY: 'auto' }}
        >
            {isAdmin && (
                <section className="field-row" style={{ justifyContent: 'flex-end', padding: 8 }}>
                    <button onClick={() => openEditor("new")}>New post</button>
                </section>
            )}

            <PostFeed
                posts={posts}
                root={scrollRoot}
                isAdmin={isAdmin}
                onManage={isAdmin ? (p) => openEditor(p) : undefined}
            />
        </div>
    );
}
