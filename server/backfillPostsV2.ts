import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "./db";
import { rowToPost, type Post } from "./repositories/postsRepository";
import type { TipTapDoc } from "../shared/posts";

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS posts_v2 (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  legacy_post_id INT NULL UNIQUE,
  title          VARCHAR(500) NOT NULL,
  content        JSON NOT NULL,
  assets         JSON NOT NULL,
  tags           JSON NOT NULL,
  created_at     TIMESTAMP NOT NULL,
  updated_at     TIMESTAMP NOT NULL,
  INDEX idx_created_at (created_at)
)`;

function postToTipTapDoc(post: Post): TipTapDoc {
  const content: unknown[] = post.images.map((img) => ({
    type: "image",
    attrs: { src: img.path, alt: post.title },
  }));
  for (const line of post.caption.split("\n")) {
    if (line.trim() === "") continue;
    content.push({
      type: "paragraph",
      content: [{ type: "text", text: line }],
    });
  }
  return { type: "doc", content };
}

export interface BackfillResult {
  total: number;
  inserted: number;
  updated: number;
  failed: number;
}

export async function runBackfillPostsV2(): Promise<BackfillResult> {
  await pool.query(CREATE_TABLE_SQL);

  const [rows] = await pool.query("SELECT * FROM posts ORDER BY id");
  const posts = (rows as Parameters<typeof rowToPost>[0][]).map(rowToPost);
  console.log(`[backfill] loaded ${posts.length} posts`);

  const [existingRows] = await pool.query(
    "SELECT legacy_post_id FROM posts_v2 WHERE legacy_post_id IS NOT NULL",
  );
  const existing = new Set(
    (existingRows as { legacy_post_id: number }[]).map((r) => r.legacy_post_id),
  );

  let inserted = 0;
  let updated = 0;
  let failed = 0;
  for (const post of posts) {
    try {
      const doc = postToTipTapDoc(post);
      await pool.query<ResultSetHeader>(
        `INSERT INTO posts_v2 (legacy_post_id, title, content, assets, tags, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           content = VALUES(content),
           assets = VALUES(assets),
           tags = VALUES(tags),
           created_at = VALUES(created_at),
           updated_at = VALUES(updated_at)`,
        [
          post.id,
          post.title,
          JSON.stringify(doc),
          JSON.stringify(post.images),
          JSON.stringify(post.tags),
          new Date(post.createdAt),
          new Date(post.updatedAt),
        ],
      );
      if (existing.has(post.id)) updated++;
      else inserted++;
    } catch (err) {
      failed++;
      console.error(`[backfill] failed for post ${post.id} "${post.title}":`, err);
    }
  }

  console.log(
    `[backfill] backfilled ${inserted + updated}/${posts.length} posts (${inserted} inserted, ${updated} updated, ${failed} failed)`,
  );
  return { total: posts.length, inserted, updated, failed };
}

async function main() {
  const result = await runBackfillPostsV2();
  await pool.end();
  if (result.failed > 0) process.exit(1);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[backfill] fatal:", err);
    process.exit(1);
  });
}
