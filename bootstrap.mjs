import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { brotliDecompressSync } from "node:zlib";

const root = process.cwd();
const vendor = path.join(root, "vendor");
const ASSET_PART_COUNT = 36;
const ASSET_ARCHIVE_SHA256 = "b000263a7d7285491f4fb4aee177b135c03157093e0c3f94a623913a9b152473";
const UPSTREAM_REPOSITORY = "https://github.com/Kurosagiiii/Study-Abroad.git";
const UPSTREAM_COMMIT = "d5ebee6ff7148d5e08985bd2c66f0ed973fb91f5";

function readParts(prefix) {
  const parts = fs.readdirSync(vendor).filter((name) => name.startsWith(prefix)).sort();
  if (!parts.length) throw new Error(`Missing ${prefix} archive parts`);
  return { parts, encoded: parts.map((name) => fs.readFileSync(path.join(vendor, name), "utf8").trim()).join("") };
}

function extractTar(buffer, destination) {
  let offset = 0;
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const readString = (start, length) => header.subarray(start, start + length).toString("utf8").replace(/\0.*$/, "");
    const name = readString(0, 100);
    const prefix = readString(345, 155);
    const relative = (prefix ? `${prefix}/${name}` : name).replace(/^\.\//, "");
    const size = Number.parseInt(readString(124, 12).trim() || "0", 8);
    const type = String.fromCharCode(header[156] || 48);
    const output = path.join(destination, relative);
    offset += 512;
    if (type === "5") fs.mkdirSync(output, { recursive: true });
    else if (type === "0" || type === "\0") {
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, buffer.subarray(offset, offset + size));
    }
    offset += Math.ceil(size / 512) * 512;
  }
}

function restoreSource() {
  if (fs.existsSync(path.join(root, "content", "default-pages.json"))) return;
  const { encoded } = readParts("project-source.part-");
  extractTar(brotliDecompressSync(Buffer.from(encoded, "base64")), root);
  console.log("Expanded the verified Next.js source.");
}

function restoreAssetsFromArchive() {
  const { parts, encoded } = readParts("template-assets.part-");
  if (parts.length !== ASSET_PART_COUNT) return false;
  const checksum = createHash("sha256").update(encoded).digest("hex");
  if (checksum !== ASSET_ARCHIVE_SHA256) throw new Error("Template asset archive checksum mismatch");
  extractTar(brotliDecompressSync(Buffer.from(encoded, "base64")), path.join(root, "public"));
  return true;
}

function restoreAssetsFromPinnedRepository() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "visim-assets-"));
  try {
    execFileSync("git", ["init", "-q", temporary], { stdio: "inherit" });
    execFileSync("git", ["-C", temporary, "remote", "add", "origin", UPSTREAM_REPOSITORY], { stdio: "inherit" });
    execFileSync("git", ["-C", temporary, "fetch", "-q", "--depth", "1", "origin", UPSTREAM_COMMIT], { stdio: "inherit" });
    execFileSync("git", ["-C", temporary, "checkout", "-q", "FETCH_HEAD"], { stdio: "inherit" });
    const source = path.join(temporary, "visim", "assets");
    if (!fs.existsSync(path.join(source, "css", "main.css"))) throw new Error("Pinned Visim assets were not found");
    const target = path.join(root, "public", "assets");
    fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(source, target, { recursive: true });
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

function restoreOriginalAssetPaths() {
  const mapPath = path.join(vendor, "webp-map.json");
  const pagesPath = path.join(root, "content", "default-pages.json");
  if (!fs.existsSync(mapPath) || !fs.existsSync(pagesPath)) return;
  const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  let pages = fs.readFileSync(pagesPath, "utf8");
  for (const [original, optimized] of Object.entries(map)) pages = pages.split(optimized).join(original);
  fs.writeFileSync(pagesPath, pages);
}

restoreSource();
const assetEntry = path.join(root, "public", "assets", "css", "main.css");
let usingOriginalAssets = false;
if (!fs.existsSync(assetEntry)) {
  if (!restoreAssetsFromArchive()) {
    restoreAssetsFromPinnedRepository();
    usingOriginalAssets = true;
  }
}
if (usingOriginalAssets) restoreOriginalAssetPaths();
if (!fs.existsSync(assetEntry)) throw new Error("Visim template assets could not be restored");
console.log("Verified source and Visim template assets are ready.");
