import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { NotFoundError, UploadError, ValidationError } from "../errors";

export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: T, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export function domainErrorHandler(tag: string) {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof UploadError) {
      return res.status(500).json({ error: err.message });
    }
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.code });
    }
    console.error(`[${tag}] unexpected:`, err);
    res.status(500).json({ error: "internal_error" });
  };
}
