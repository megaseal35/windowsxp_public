import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import {
    TextStyle,
    Color,
    FontFamily,
    FontSize,
    BackgroundColor,
} from '@tiptap/extension-text-style';

export function editorExtensions() {
    return [
        StarterKit,
        Image,
        TextStyle,
        FontFamily,
        FontSize,
        Color,
        BackgroundColor,
        Highlight.configure({ multicolor: true }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ];
}

export const FONT_FAMILIES: { label: string; value: string }[] = [
    { label: 'Default', value: '' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Courier New', value: '"Courier New", Courier, monospace' },
    { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
    { label: 'Tahoma', value: 'Tahoma, sans-serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
];

export const FONT_SIZES: { label: string; value: string }[] = [
    { label: 'Size', value: '' },
    { label: '12', value: '12px' },
    { label: '14', value: '14px' },
    { label: '16', value: '16px' },
    { label: '18', value: '18px' },
    { label: '24', value: '24px' },
    { label: '32', value: '32px' },
    { label: '48', value: '48px' },
];
