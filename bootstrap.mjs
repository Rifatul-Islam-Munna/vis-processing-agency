import fs from "node:fs";
import path from "node:path";
import { brotliDecompressSync } from "node:zlib";

const root = process.cwd();

function decodeParts(prefix) {
  const vendor = path.join(root, "vendor");
  const parts = fs.readdirSync(vendor).filter((name) => name.startsWith(prefix)).sort();
  if (!parts.length) throw new Error(`Missing ${prefix} archive parts`);
  const encoded = parts.map((name) => fs.readFileSync(path.join(vendor, name), "utf8").trim()).join("");
  return brotliDecompressSync(Buffer.from(encoded, "base64"));
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

extractTar(decodeParts("project-source.part-"), root);
extractTar(decodeParts("template-assets.part-"), path.join(root, "public"));
console.log("Expanded the verified Next.js source and Visim template assets.");
