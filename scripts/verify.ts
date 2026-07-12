import fs from "node:fs";
import path from "node:path";
import { defaultPageList } from "../content/page-index";

const errors: string[] = [];

if (defaultPageList.length !== 25) {
  errors.push(`Expected 25 pages, got ${defaultPageList.length}`);
}

const slugs = new Set(defaultPageList.map((page) => page.slug));
if (slugs.size !== defaultPageList.length) {
  errors.push("Duplicate slugs");
}

for (const page of defaultPageList) {
  if (!page.html.trim()) {
    errors.push(`${page.slug}: empty HTML`);
  }

  for (const match of page.html.matchAll(/["'](\/assets\/[^"'#? )]+)/g)) {
    const file = path.join(process.cwd(), "public", match[1]);
    if (!fs.existsSync(file)) {
      errors.push(`${page.slug}: missing ${match[1]}`);
    }
  }

  if (/\.html(?:[?#"'])/.test(page.html)) {
    errors.push(`${page.slug}: unresolved .html link`);
  }
}

if (errors.length) {
  console.error(errors.slice(0, 100).join("\n"));
  process.exit(1);
}

console.log(
  `Verified ${defaultPageList.length} pages, ${slugs.size} unique routes and local asset references.`,
);
