import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "https://goddessalexism.com/author/goddessalexism/";
const TOTAL_PAGES = 35;
const DATA_DIR = path.join(__dirname, "..", "data");
const IMAGES_DIR = path.join(DATA_DIR, "images");
const OUTPUT_FILE = path.join(DATA_DIR, "posts.json");
const DELAY_MS = 500;
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://goddessalexism.com/",
};

interface ImageEntry {
  width: number | "original";
  url: string;
  localPath: string;
}

interface Post {
  title: string;
  createdAt: string;
  imageUrl: string;
  images: ImageEntry[];
  caption: string;
  tags: string[];
}

function sanitizeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function getExtFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname);
    return ext || ".jpg";
  } catch {
    const match = url.match(/\.(jpe?g|png|gif|webp)/i);
    return match ? `.${match[1]}` : ".jpg";
  }
}

function cleanImageUrl(url: string): string {
  return url.replace(/[&?]ssl=1/g, "").replace(/\?$/, "");
}

function parseSrcset(srcset: string): { url: string; width: number }[] {
  return srcset
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const parts = entry.split(/\s+/);
      const url = cleanImageUrl(parts[0]);
      const widthStr = parts[1]?.replace("w", "");
      const width = parseInt(widthStr, 10);
      return { url, width: isNaN(width) ? 0 : width };
    })
    .filter((e) => e.url && e.width > 0);
}

async function downloadImage(url: string, dest: string): Promise<void> {
  const dir = path.dirname(dest);
  fs.mkdirSync(dir, { recursive: true });

  const response = await axios.get(url, {
    responseType: "arraybuffer",
    headers: HEADERS,
  });
  fs.writeFileSync(dest, response.data);
}

function extractPostsFromPage($: cheerio.CheerioAPI): Post[] {
  const posts: Post[] = [];

  $("article").each((_i, el) => {
    const article = $(el);

    const title = article.find("h2.entry-title a").text().trim();
    if (!title) return;

    const createdAt =
      article.find("time.entry-date.published").attr("datetime") || "";

    const imgEl = article.find("a.post-thumbnail img.wp-post-image");
    const imageUrl = cleanImageUrl(imgEl.attr("src") || "");
    const srcset = imgEl.attr("srcset") || "";

    const caption = article.find("div.entry-content").text().trim();

    const tags: string[] = [];
    article.find('span.tags-links a[rel="tag"]').each((_j, tagEl) => {
      tags.push($(tagEl).text().trim());
    });

    const images: ImageEntry[] = [];
    const slug = sanitizeSlug(title);
    const ext = getExtFromUrl(imageUrl);

    if (srcset) {
      const srcsetEntries = parseSrcset(srcset);
      for (const entry of srcsetEntries) {
        const entryExt = getExtFromUrl(entry.url);
        images.push({
          width: entry.width,
          url: entry.url,
          localPath: `data/images/${slug}/${entry.width}${entryExt}`,
        });
      }
    }

    if (imageUrl && images.length === 0) {
      images.push({
        width: "original",
        url: imageUrl,
        localPath: `data/images/${slug}/original${ext}`,
      });
    }

    posts.push({ title, createdAt, imageUrl, images, caption, tags });
  });

  return posts;
}

async function downloadPostImages(post: Post): Promise<void> {
  const downloads = post.images.map(async (img) => {
    const dest = path.join(__dirname, "..", img.localPath);
    try {
      await downloadImage(img.url, dest);
    } catch (err: any) {
      console.error(
        `  Failed to download ${img.url}: ${err.message}`
      );
    }
  });
  await Promise.all(downloads);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("Starting scraper...");
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const allPosts: Post[] = [];

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const url = page === 1 ? BASE_URL : `${BASE_URL}page/${page}/`;
    console.log(`Fetching page ${page}/${TOTAL_PAGES}: ${url}`);

    try {
      const { data: html } = await axios.get(url, { headers: HEADERS });
      const $ = cheerio.load(html);
      const posts = extractPostsFromPage($);

      console.log(`  Found ${posts.length} posts`);

      for (const post of posts) {
        console.log(`  Downloading images for: ${post.title}`);
        await downloadPostImages(post);
        allPosts.push(post);
      }
    } catch (err: any) {
      console.error(`  Error fetching page ${page}: ${err.message}`);
    }

    if (page < TOTAL_PAGES) {
      await sleep(DELAY_MS);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPosts, null, 2), "utf-8");
  console.log(`\nDone! Scraped ${allPosts.length} posts.`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main().catch(console.error);
