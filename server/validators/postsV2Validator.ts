import { ValidationError } from "../errors";
import type { CreatePostV2Input, TipTapDoc, UpdatePostV2Input } from "../../shared/posts";

export { parseId, validateFiles } from "./postsValidator";

function parseTipTapDoc(raw: unknown, field: string): TipTapDoc {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ValidationError(`${field} must be a TipTap document object`);
  }
  const doc = raw as Record<string, unknown>;
  if (doc.type !== "doc") {
    throw new ValidationError(`${field}.type must be "doc"`);
  }
  if (doc.content !== undefined && !Array.isArray(doc.content)) {
    throw new ValidationError(`${field}.content must be an array`);
  }
  return doc as unknown as TipTapDoc;
}

function parseTags(raw: unknown): string[] {
  if (!Array.isArray(raw) || raw.some((t) => typeof t !== "string")) {
    throw new ValidationError("tags must be a string array");
  }
  return raw as string[];
}

export function parseCreateInput(raw: unknown): CreatePostV2Input {
  if (!raw || typeof raw !== "object") {
    throw new ValidationError("body must be an object");
  }
  const b = raw as Record<string, unknown>;

  if (typeof b.title !== "string" || !b.title.trim()) {
    throw new ValidationError("title required");
  }
  const out: CreatePostV2Input = {
    title: b.title,
    tags: parseTags(b.tags),
  };
  if (b.content !== undefined) {
    out.content = parseTipTapDoc(b.content, "content");
  }
  if (b.date !== undefined) {
    if (typeof b.date !== "string" || Number.isNaN(new Date(b.date).getTime())) {
      throw new ValidationError("date must be an ISO 8601 string");
    }
    out.date = b.date;
  }
  return out;
}

export function parseUpdateInput(raw: unknown): UpdatePostV2Input {
  if (!raw || typeof raw !== "object") {
    throw new ValidationError("body must be an object");
  }
  const b = raw as Record<string, unknown>;
  const out: UpdatePostV2Input = {};

  if (b.title !== undefined) {
    if (typeof b.title !== "string" || !b.title.trim()) {
      throw new ValidationError("title must be a non-empty string");
    }
    out.title = b.title;
  }
  if (b.content !== undefined) {
    out.content = parseTipTapDoc(b.content, "content");
  }
  if (b.tags !== undefined) {
    out.tags = parseTags(b.tags);
  }
  return out;
}
