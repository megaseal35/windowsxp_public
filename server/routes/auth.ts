import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { UsersRepo } from "../repositories";
import type { LoginRequest, SessionStatus } from "../../shared/auth";

const router = Router();

const TIMING_DUMMY_HASH =
  "$2b$12$CwTycUXWue0Thq9StjUM0uJ8.RmVMZ7QmI/MhgX1Eaw9rL7nF.xQS";

router.post("/login", async (req: Request, res: Response) => {
  const body = req.body as Partial<LoginRequest> | undefined;
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }
  try {
    const user = await UsersRepo.findAdminByUsername(username);
    const ok = await bcrypt.compare(password, user?.passwordHash ?? TIMING_DUMMY_HASH);
    if (!user || !ok) return res.status(401).json({ error: "invalid credentials" });
    
    req.session.admin = true;
    req.session.userId = user.id;
    req.session.username = user.username;
    const out: SessionStatus = { loggedIn: true, username: user.username };
    res.json(out);
  }catch(err) {
    console.error(`Failed to login`, err);
    throw err;
  }
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "logout failed" });
    }
    res.clearCookie("blog_session");
    const out: SessionStatus = { loggedIn: false };
    res.json(out);
  });
});

router.get("/me", (req: Request, res: Response) => {
  const loggedIn = req.session?.admin === true;
  const out: SessionStatus = loggedIn
    ? { loggedIn: true, username: req.session?.username }
    : { loggedIn: false };
  res.json(out);
});

export default router;
