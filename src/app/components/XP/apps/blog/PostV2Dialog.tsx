import { useState } from 'react';
import { useEditor } from '@tiptap/react';
import type { PostV2DTO, TipTapDoc } from '../../../../../../shared/posts';
import { Optional } from '../../../../../../shared/common';
import {
    useCreatePostMutation,
    useDeletePostMutation,
    useUpdatePostMutation,
    useUploadAssetMutation,
} from '../../../../store/postsApi';
import { ConfirmDialog } from '../admin/ConfirmDialog';
import PostEditor from './PostEditor';
import { editorExtensions } from './editorExtensions';

type PostV2DialogProps = {
    initialPost: Optional<PostV2DTO>;
    onClose?: () => void;
};

const EMPTY_DOC: TipTapDoc = { type: 'doc', content: [{ type: 'paragraph' }] };

function errorMessage(err: unknown, fallback: string): string {
    return err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { error?: string } }).data?.error ?? fallback)
        : fallback;
}

function parseTags(raw: string): string[] {
    return raw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
}

export default function PostV2Dialog({ initialPost, onClose }: PostV2DialogProps) {
    const [title, setTitle] = useState<string>(initialPost?.title ?? '');
    const [tagsInput, setTagsInput] = useState<string>((initialPost?.tags ?? []).join(', '));
    const [errors, setErrors] = useState<string[]>([]);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const [createPost, createState] = useCreatePostMutation();
    const [updatePost, updateState] = useUpdatePostMutation();
    const [deletePost, deleteState] = useDeletePostMutation();
    const [uploadAsset, uploadState] = useUploadAssetMutation();

    const submitting = createState.isLoading || updateState.isLoading;
    const deleting = deleteState.isLoading;

    const editor = useEditor({
        extensions: editorExtensions(),
        content: initialPost?.content ?? EMPTY_DOC,
        editable: true,
    });

    const onPickImage = async (file: File) => {
        try {
            const asset = await uploadAsset(file).unwrap();
            editor?.chain().focus().setImage({ src: asset.path }).run();
        } catch (err) {
            setErrors([errorMessage(err, 'Image upload failed')]);
        }
    };

    const onConfirmDelete = async () => {
        if (!initialPost) return;
        try {
            await deletePost(initialPost.id).unwrap();
            setConfirmingDelete(false);
            onClose?.();
        } catch (err) {
            setErrors([errorMessage(err, 'Delete failed')]);
            setConfirmingDelete(false);
        }
    };

    const onSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setErrors(['Missing title']);
            return;
        }
        setErrors([]);

        const content = (editor?.getJSON() ?? EMPTY_DOC) as TipTapDoc;
        const tags = parseTags(tagsInput);

        try {
            if (initialPost) {
                await updatePost({ id: initialPost.id, patch: { title, tags, content } }).unwrap();
            } else {
                await createPost({ title, tags, content }).unwrap();
            }
            onClose?.();
        } catch (err) {
            setErrors([errorMessage(err, 'Request failed')]);
        }
    };

    return (
        <>
            <form
                onSubmit={onSubmit}
                style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
            >
                    <div className="glass-borders">
                        <div className="styled-containers aero-borders">
                            <header className="aero-header">
                                <input
                                    className="post-card-title post-card-title-input"
                                    aria-label="Title"
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        setTitle(e.target.value);
                                    }}
                                />
                            </header>

                            {initialPost && (
                                <div className="post-card-date">
                                    {new Date(initialPost.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            )}

                            <PostEditor
                                editor={editor}
                                onPickImage={onPickImage}
                                uploadingImage={uploadState.isLoading}
                            />

                            <input
                                className="post-card-caption-input"
                                aria-label="Tags"
                                placeholder="Tags (comma separated)"
                                value={tagsInput}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    setTagsInput(e.target.value);
                                }}
                                style={{ width: '100%', marginTop: 4 }}
                            />
                        </div>
                    </div>

                    {errors.length > 0 && (
                        <ul className="post-dialog-errors">
                            {errors.map((msg, i) => <li key={i}>{msg}</li>)}
                        </ul>
                    )}

                    <section className="field-row" style={{ justifyContent: 'flex-end' }}>
                        {initialPost && (
                            <button
                                type="button"
                                onClick={() => setConfirmingDelete(true)}
                                disabled={submitting || deleting}
                                style={{ marginRight: 'auto' }}
                            >
                                Delete
                            </button>
                        )}
                        {onClose && (
                            <button type="button" onClick={onClose} disabled={submitting || deleting}>
                                Cancel
                            </button>
                        )}
                        <button type="submit" disabled={submitting || deleting}>
                            {submitting ? 'Saving…' : initialPost ? 'Save' : 'Create'}
                        </button>
                    </section>
            </form>

            {confirmingDelete && initialPost && (
                <ConfirmDialog
                    title="Delete post"
                    message={`Delete "${initialPost.title}"? This cannot be undone.`}
                    confirmLabel="Delete"
                    busy={deleting}
                    onConfirm={onConfirmDelete}
                    onCancel={() => setConfirmingDelete(false)}
                />
            )}
        </>
    );
}
