import { Router } from "express";
import { PostsV2Svc } from "../services";
import { PostsV2Validator } from "../validators";
import { requireAdmin } from "../auth/middleware";
import { asyncHandler, domainErrorHandler } from "./helpers";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const offset = Math.max(Number(req.query.offset ?? 0), 0);
    const posts = await PostsV2Svc.listPosts(limit, offset);
    res.json(posts);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = PostsV2Validator.parseId(req.params.id);
    const post = await PostsV2Svc.getPost(id);
    res.json(post);
  }),
);

router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = PostsV2Validator.parseCreateInput(req.body);
    const created = await PostsV2Svc.createPost(input);
    res.status(201).json(created);
  }),
);

router.put(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = PostsV2Validator.parseId(req.params.id);
    const patch = PostsV2Validator.parseUpdateInput(req.body);
    const updated = await PostsV2Svc.updatePost(id, patch);
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = PostsV2Validator.parseId(req.params.id);
    await PostsV2Svc.deletePost(id);
    res.json({ ok: true });
  }),
);

router.use(domainErrorHandler("posts-v2 route"));

export default router;
