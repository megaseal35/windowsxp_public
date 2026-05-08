export type Optional<T> = T | undefined;
export type Nillable<T> = Optional<T> | null;
export const MAX_BYTES = 25 * 1024 * 1024;

export const ALLOWED_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);
export const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
};
