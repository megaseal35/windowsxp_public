import { Router } from "express";
import multer from "multer";
import { AssetsSvc } from "../services";
import { PostsV2Validator } from "../validators";
import { requireAdmin } from "../auth/middleware";
import { MAX_BYTES } from "../../shared/common";
import { asyncHandler, domainErrorHandler } from "./helpers";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
});

router.post(
  "/",
  requireAdmin,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "no file uploaded" });
      return;
    }
    PostsV2Validator.validateFiles([file]);
    const asset = await AssetsSvc.uploadAsset(file);
    res.status(201).json(asset);
  }),
);

router.use(domainErrorHandler("assets route"));

export default router;
