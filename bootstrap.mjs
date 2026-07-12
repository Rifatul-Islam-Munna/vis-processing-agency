import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { brotliDecompressSync } from "node:zlib";

const root = process.cwd();
const vendor = path.join(root, "vendor");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function safeOutput(destination, relative) {
  const base = path.resolve(destination);
  const output = path.resolve(base, relative.replace(/^\.\//, ""));
  if (output !== base && !output.startsWith(`${base}${path.sep}`)) {
    throw new Error(`Unsafe archive path: ${relative}`);
  }
  return output;
}

function extractTar(buffer, destination) {
  let offset = 0;
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const readString = (start, length) =>
      header.subarray(start, start + length).toString("utf8").replace(/\0.*$/s, "");
    const name = readString(0, 100);
    const prefix = readString(345, 155);
    const relative = prefix ? `${prefix}/${name}` : name;
    const size = Number.parseInt(readString(124, 12).trim() || "0", 8);
    const type = String.fromCharCode(header[156] || 48);
    const output = safeOutput(destination, relative);
    offset += 512;
    if (type === "5") fs.mkdirSync(output, { recursive: true });
    else if (type === "0" || type === "\0") {
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, buffer.subarray(offset, offset + size));
    }
    offset += Math.ceil(size / 512) * 512;
  }
}

function restoreManifestArchive(label, destination) {
  const manifestPath = path.join(vendor, `${label}.manifest.json`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const parts = fs
    .readdirSync(vendor)
    .filter((name) => name.startsWith(`${label}.part-`) && name.endsWith(".b64"))
    .sort();

  if (parts.length !== manifest.parts) {
    throw new Error(`Incomplete ${label}: expected ${manifest.parts} parts, found ${parts.length}`);
  }

  const encoded = parts
    .map((name) => fs.readFileSync(path.join(vendor, name), "utf8").trim())
    .join("");

  if (sha256(encoded) !== manifest.encodedSha256) {
    throw new Error(`${label} encoded checksum mismatch`);
  }

  const tar = brotliDecompressSync(Buffer.from(encoded, "base64"));
  if (sha256(tar) !== manifest.tarSha256) throw new Error(`${label} tar checksum mismatch`);
  extractTar(tar, destination);
  return manifest;
}

function restoreLegacyAssets() {
  const expectedParts = 12;
  const expectedChecksum = "b000263a7d7285491f4fb4aee177b135c03157093e0c3f94a623913a9b152473";
  const parts = fs
    .readdirSync(vendor)
    .filter((name) => /^template-assets\.part-\d+\.txt$/.test(name))
    .sort();

  if (parts.length !== expectedParts) {
    throw new Error(`Incomplete template asset bundle: expected ${expectedParts} parts, found ${parts.length}`);
  }

  const encoded = parts
    .map((name) => fs.readFileSync(path.join(vendor, name), "utf8").trim())
    .join("");

  if (sha256(encoded) !== expectedChecksum) {
    throw new Error("Template asset bundle checksum mismatch");
  }

  const tar = brotliDecompressSync(Buffer.from(encoded, "base64"));
  fs.mkdirSync(path.join(root, "public"), { recursive: true });
  extractTar(tar, path.join(root, "public"));
}

function applyProductionPatches() {
  const files = {
    "lib/pages.ts": `import { defaultPages, defaultPageList, type PageRecord } from "@/content";
import { connectDB, hasDatabase } from "@/lib/db";
import { Page } from "@/lib/models";
import { getSettings, interpolate } from "@/lib/settings";
function plain<T>(value: T): T { return JSON.parse(JSON.stringify(value)); }
export async function getPage(slug: string, includeDraft = false): Promise<PageRecord | null> {
  let page: PageRecord | null = null;
  if (hasDatabase()) try {
    await connectDB();
    const found = await Page.findOne({ slug, ...(includeDraft ? {} : { published: true }) }).lean();
    if (found) page = plain(found) as unknown as PageRecord;
  } catch {}
  if (!page) { const fallback = defaultPages[slug]; if (fallback && (includeDraft || fallback.published)) page = plain(fallback); }
  if (!page) return null;
  const settings = await getSettings();
  return { ...page, title: interpolate(page.title, settings), html: interpolate(page.html, settings), headHtml: interpolate(page.headHtml || "", settings), customCss: interpolate(page.customCss || "", settings), customJs: interpolate(page.customJs || "", settings), seo: { ...page.seo, title: interpolate(page.seo?.title || page.title, settings), description: interpolate(page.seo?.description || "", settings), ogTitle: interpolate(page.seo?.ogTitle || page.title, settings) } };
}
export async function listPages(includeDraft = true) {
  if (hasDatabase()) try {
    await connectDB();
    const rows = await Page.find(includeDraft ? {} : { published: true }).sort({ sortOrder: 1, title: 1 }).lean();
    if (rows.length) return plain(rows) as unknown as PageRecord[];
  } catch {}
  return defaultPageList.filter((page) => includeDraft || page.published).map(plain);
}
`,
    "next.config.ts": `import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: { cpus: 2, staticGenerationMaxConcurrency: 2, staticGenerationMinPagesPerWorker: 1 },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" }
    ] }];
  }
};
export default nextConfig;
`,
  };

  for (const [relative, content] of Object.entries(files)) {
    const output = safeOutput(root, relative);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, content);
  }
}

if (!fs.existsSync(vendor)) throw new Error("Missing vendor archives");

const sourceManifest = path.join(vendor, "source-v4.manifest.json");
if (!fs.existsSync(sourceManifest)) throw new Error("Missing production source manifest");
const source = restoreManifestArchive("source-v4", root);
applyProductionPatches();
console.log(`Restored verified production source (${source.files} files) and audited production patches.`);

const assetMarker = path.join(root, "public", "assets", "css", "main.css");
if (!fs.existsSync(assetMarker)) {
  const modernManifest = path.join(vendor, "template-assets.manifest.json");
  if (fs.existsSync(modernManifest)) {
    const assets = restoreManifestArchive("template-assets", path.join(root, "public"));
    console.log(`Restored verified ZIP runtime assets (${assets.runtimeFiles ?? "complete"} files).`);
  } else {
    restoreLegacyAssets();
    console.log("Restored checksum-verified ZIP runtime assets from 12 parts.");
  }
}

for (const required of [
  "app/(site)/[[...slug]]/route.ts",
  "content/default-pages.json",
  "public/assets/css/main.css",
  "public/assets/js/main.js",
  "public/assets/js/cms-runtime.js",
]) {
  if (!fs.existsSync(path.join(root, required))) throw new Error(`Restoration failed: ${required}`);
}

console.log("Production source and supplied ZIP features are ready.");
