import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { brotliDecompressSync } from "node:zlib";

const root = process.cwd();
const vendor = path.join(root, "vendor");
const ASSET_PART_COUNT = 12;
const ASSET_ARCHIVE_SHA256 = "b000263a7d7285491f4fb4aee177b135c03157093e0c3f94a623913a9b152473";

function extractTar(buffer, destination) {
  let offset = 0;
  const destinationRoot = path.resolve(destination) + path.sep;
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const readString = (start, length) =>
      header.subarray(start, start + length).toString("utf8").replace(/\0.*$/s, "");
    const name = readString(0, 100);
    const prefix = readString(345, 155);
    const relative = (prefix ? `${prefix}/${name}` : name).replace(/^\.\//, "");
    const size = Number.parseInt(readString(124, 12).trim() || "0", 8);
    const type = String.fromCharCode(header[156] || 48);
    const output = path.resolve(destination, relative);
    if (!output.startsWith(destinationRoot)) throw new Error(`Unsafe archive path: ${relative}`);
    offset += 512;
    if (type === "5") fs.mkdirSync(output, { recursive: true });
    else if (type === "0" || type === "\0") {
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, buffer.subarray(offset, offset + size));
    }
    offset += Math.ceil(size / 512) * 512;
  }
}

function restoreAssets() {
  if (!fs.existsSync(vendor)) throw new Error("Missing checked-in vendor asset archive");
  const parts = fs.readdirSync(vendor)
    .filter((name) => name.startsWith("template-assets.part-"))
    .sort();
  if (parts.length !== ASSET_PART_COUNT) {
    throw new Error(`Expected ${ASSET_PART_COUNT} template asset parts, found ${parts.length}`);
  }
  const encoded = parts.map((name) => fs.readFileSync(path.join(vendor, name), "utf8").trim()).join("");
  const checksum = createHash("sha256").update(encoded).digest("hex");
  if (checksum !== ASSET_ARCHIVE_SHA256) throw new Error("Template asset archive checksum mismatch");
  const publicDir = path.join(root, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  extractTar(brotliDecompressSync(Buffer.from(encoded, "base64")), publicDir);
}

const sourceMarker = path.join(root, "content", "page-index.ts");
if (!fs.existsSync(sourceMarker)) throw new Error("Next.js source files are missing");
const assetMarker = path.join(root, "public", "assets", "css", "main.css");
if (!fs.existsSync(assetMarker)) restoreAssets();
if (!fs.existsSync(assetMarker)) throw new Error("Visim template assets could not be restored");
console.log("Verified Next.js source and Visim template assets are ready.");
