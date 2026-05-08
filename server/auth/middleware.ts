import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.admin === true) {
    return next();
  }
  res.status(401).json({ error: "unauthorized" });
}
