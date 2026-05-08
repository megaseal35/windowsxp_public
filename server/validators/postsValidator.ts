import { ValidationError } from "../errors";
import { ALLOWED_MIME } from '../../shared/common';
import type { CreatePostInput, UpdatePostInput } from "../../shared/posts";

export function parseCreateInput(raw: unknown): CreatePostInput {
  if (!raw || typeof raw !== "object") {
    throw new ValidationError("body must be an object");
  }
  const b = raw as Record<string, unknown>;

  if (typeof b.title !== "string" || !b.title.trim()) {
    throw new ValidationError("title required");
  }
  if (typeof b.caption !== "string") {
    throw new ValidationError("caption must be a string");
  }
  if (!Array.isArray(b.tags) || b.tags.some((t) => typeof t !== "string")) {
    throw new ValidationError("tags must be a string array");
  }

  return {
    title: b.title,
    caption: b.caption,
    tags: b.tags as string[],
  };
}

export function parseUpdateInput(raw: unknown): UpdatePostInput {
  if (!raw || typeof raw !== "object") {
    throw new ValidationError("body must be an object");
  }
  const b = raw as Record<string, unknown>;
  const out: UpdatePostInput = {};

  if (b.title !== undefined) {
    if (typeof b.title !== "string") throw new ValidationError("title must be a string");
    out.title = b.title;
  }
  if (b.caption !== undefined) {
    if (typeof b.caption !== "string") throw new ValidationError("caption must be a string");
    out.caption = b.caption;
  }
  if (b.tags !== undefined) {
    if (!Array.isArray(b.tags) || b.tags.some((t) => typeof t !== "string")) {
      throw new ValidationError("tags must be a string array");
    }
    out.tags = b.tags as string[];
  }
  return out;
}

export function validateFiles(files: Express.Multer.File[]): void {
  for (const f of files) {
    if (!ALLOWED_MIME.has(f.mimetype)) {
      throw new ValidationError(`unsupported mime type: ${f.mimetype}`);
    }
  }
}

export function parseId(raw: string | string[] | undefined): number {
  if(Array.isArray(raw)) {
    throw new ValidationError(`Invalid id ${JSON.stringify(raw)}`);
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ValidationError(`Invalid id ${JSON.stringify(raw)}`);
  }
  return n;
}
