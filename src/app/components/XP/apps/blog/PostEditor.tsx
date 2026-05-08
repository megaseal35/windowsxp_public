import { EditorContent, useEditorState, type Editor } from '@tiptap/react';
import UploadButton from '../../common/UploadButton';
import { FONT_FAMILIES, FONT_SIZES } from './editorExtensions';

interface PostEditorProps {
    editor: Editor | null;
    onPickImage: (file: File) => void;
    uploadingImage?: boolean;
}

const DEFAULT_TEXT_COLOR = '#000000';
const DEFAULT_HIGHLIGHT = '#ffff00';

const sep = (
    <span aria-hidden style={{ width: 1, alignSelf: 'stretch', background: '#c0c0c0', margin: '0 2px' }} />
);

export default function PostEditor({ editor, onPickImage, uploadingImage }: PostEditorProps) {
    const state = useEditorState({
        editor,
        selector: ({ editor: e }) => {
            if (!e) return null;

            const getBlock = () => {
                for(let idx of [1,2,3]) {
                    if(e.isActive('heading', {level: idx})) {
                        return `h${idx}`;
                    }
                }
                return 'paragraph'
            }
            return {
                bold: e.isActive('bold'),
                italic: e.isActive('italic'),
                underline: e.isActive('underline'),
                strike: e.isActive('strike'),
                block: getBlock(),
                fontFamily: (e.getAttributes('textStyle').fontFamily as string) ?? '',
                fontSize: (e.getAttributes('textStyle').fontSize as string) ?? '',
                color: (e.getAttributes('textStyle').color as string) ?? DEFAULT_TEXT_COLOR,
            };
        },
    });

    if (!editor || !state) {
        return null;
    }

    const TBtn = ({
        label,
        active,
        title,
        onClick,
        bold,
        italic,
        underline,
        strike,
    }: {
        label: string;
        active?: boolean;
        title: string;
        onClick: () => void;
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strike?: boolean;
    }) => (
        <button
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            style={{
                minWidth: 24,
                padding: '2px 6px',
                fontWeight: bold ? 700 : undefined,
                fontStyle: italic ? 'italic' : undefined,
                textDecoration: [underline && 'underline', strike && 'line-through']
                    .filter(Boolean)
                    .join(' ') || undefined,
                background: active ? '#cfe0f5' : undefined,
                boxShadow: active ? 'inset 0 0 0 1px #7f9db9' : undefined,
            }}
        >
            {label}
        </button>
    );

    const setBlock = (value: string) => {
        const chain = editor.chain().focus();
        if (value === 'paragraph') chain.setParagraph().run();
        else chain.toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 }).run();
    };

    return (
        <div className="post-editor">
            <div
                className="post-editor-toolbar"
                role="toolbar"
                aria-label="Formatting"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                    padding: 4,
                    border: '1px solid #7f9db9',
                    borderBottom: 'none',
                    background: 'linear-gradient(#fbfbfb, #eef1f5)',
                }}
            >
                <select
                    title="Paragraph style"
                    aria-label="Paragraph style"
                    value={state.block}
                    onChange={(e) => setBlock(e.target.value)}
                    style={{ height: 22 }}
                >
                    <option value="paragraph">Normal</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                </select>

                <select
                    title="Font"
                    aria-label="Font"
                    value={state.fontFamily}
                    onChange={(e) => {
                        const v = e.target.value;
                        v
                            ? editor.chain().focus().setFontFamily(v).run()
                            : editor.chain().focus().unsetFontFamily().run();
                    }}
                    style={{ height: 22, maxWidth: 120 }}
                >
                    {FONT_FAMILIES.map((f) => (
                        <option key={f.label} value={f.value} style={{ fontFamily: f.value || undefined }}>
                            {f.label}
                        </option>
                    ))}
                </select>

                <select
                    title="Font size"
                    aria-label="Font size"
                    value={state.fontSize}
                    onChange={(e) => {
                        const v = e.target.value;
                        v
                            ? editor.chain().focus().setFontSize(v).run()
                            : editor.chain().focus().unsetFontSize().run();
                    }}
                    style={{ height: 22, width: 56 }}
                >
                    {FONT_SIZES.map((s) => (
                        <option key={s.label} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>

                {sep}

                <TBtn label="B" bold title="Bold" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()} />
                <TBtn label="I" italic title="Italic" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
                <TBtn label="U" underline title="Underline" active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()} />
                <TBtn label="S" strike title="Strikethrough" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()} />

                {sep}

                <label
                    title="Text color"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 700, cursor: 'pointer' }}
                >
                    A
                    <input
                        type="color"
                        aria-label="Text color"
                        value={state.color}
                        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                        style={{ width: 22, height: 18, padding: 0, border: '1px solid #7f9db9' }}
                    />
                </label>
                <TBtn label="A⃠" title="Clear text color" onClick={() => editor.chain().focus().unsetColor().run()} />

                <label
                    title="Highlight"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                >
                    <span style={{ background: '#ffff00', padding: '0 2px', fontWeight: 700 }}>H</span>
                    <input
                        type="color"
                        aria-label="Highlight color"
                        defaultValue={DEFAULT_HIGHLIGHT}
                        onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
                        style={{ width: 22, height: 18, padding: 0, border: '1px solid #7f9db9' }}
                    />
                </label>
                <TBtn label="H⃠" title="Clear highlight" onClick={() => editor.chain().focus().unsetHighlight().run()} />

                {sep}

                <UploadButton
                    buttonText={uploadingImage ? 'Uploading…' : '🖼 Image'}
                    onAttachFile={onPickImage}
                    showSizeLimit={false}
                />
            </div>

            <EditorContent
                editor={editor}
                className="post-editor-content"
                style={{
                    border: '1px solid #7f9db9',
                    background: '#fff',
                    minHeight: 160,
                    padding: 6,
                    overflowY: 'auto',
                    overflowX: 'auto',
                }}
            />
        </div>
    );
}
