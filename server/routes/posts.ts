import { Router } from "express";
import multer from "multer";
import { PostsSvc } from "../services";
import { PostsValidator } from "../validators";
import { requireAdmin } from "../auth/middleware";
import { MAX_BYTES } from '../../shared/common';
import { asyncHandler, domainErrorHandler } from "./helpers";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const offset = Math.max(Number(req.query.offset ?? 0), 0);
    const posts = await PostsSvc.listPosts(limit, offset);
    res.json(posts);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = PostsValidator.parseId(req.params.id);
    const post = await PostsSvc.getPost(id);
    res.json(post);
  }),
);

router.post(
  "/",
  requireAdmin,
  upload.array("images"),
  asyncHandler(async (req, res) => {
    const rawPost = parseMaybeJson(req.body?.post);
    const input = PostsValidator.parseCreateInput(rawPost);
    const files = (req.files as Express.Multer.File[]) ?? [];
    PostsValidator.validateFiles(files);

    const created = await PostsSvc.createPostWithImages(input, files);
    res.status(201).json(created);
  }),
);

router.put(
  "/:id",
  requireAdmin,
  upload.array("images"),
  asyncHandler(async (req, res) => {
    const id = PostsValidator.parseId(req.params.id);
    const rawPost = parseMaybeJson(req.body?.post);
    const patch = rawPost === undefined ? undefined : PostsValidator.parseUpdateInput(rawPost);
    const files = (req.files as Express.Multer.File[]) ?? [];
    PostsValidator.validateFiles(files);

    const updated = await PostsSvc.updatePostWithImages(id, patch, files);
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = PostsValidator.parseId(req.params.id);
    await PostsSvc.deletePost(id);
    res.json({ ok: true });
  }),
);

router.use(domainErrorHandler("posts route"));

function parseMaybeJson(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return undefined; }
}

export default router;
