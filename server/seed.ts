import { readFileSync } from "node:fs";
import path from "node:path";
import { pool } from "./db";
import { reseedPosts, type SeedPost } from "./seedHelpers";

async function main() {
  const limitArg = process.argv[2];
  const limit = limitArg ? Number(limitArg) : undefined;
  if (limitArg !== undefined && (!Number.isInteger(limit) || (limit as number) <= 0)) {
    throw new Error(`invalid limit argument: ${limitArg}`);
  }

  const jsonPath = path.resolve(process.cwd(), "public/posts.json");
  const raw = readFileSync(jsonPath, "utf-8");
  const allPosts = JSON.parse(raw) as SeedPost[];
  const posts = limit ? allPosts.slice(0, limit) : allPosts;

  console.log(
    `[seed] loaded ${posts.length}${limit ? ` of ${allPosts.length}` : ""} posts from ${jsonPath}`,
  );

  const { inserted, total } = await reseedPosts(posts);
  console.log(`[seed] inserted ${inserted}/${total}`);
  await pool.end();
}

main().catch((err) => {
  console.error("[seed] fatal:", err);
  process.exit(1);
});
