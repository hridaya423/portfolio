import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { renderMarkdown } from "@/data/case-studies";

const FILE = path.join(process.cwd(), "content", "about.md");

export type AboutMeta = { title: string; description: string; updatedAt: string };

function read() {
  const { content, data } = matter(fs.readFileSync(FILE, "utf-8"));
  for (const key of ["title", "description", "updatedAt"]) {
    if (typeof data[key] !== "string" || !data[key]) {
      throw new Error(`content/about.md is missing "${key}"`);
    }
  }
  return { content, meta: data as AboutMeta };
}

export function getAboutMeta(): AboutMeta {
  return read().meta;
}

export async function getAbout() {
  const { content, meta } = read();
  return { ...meta, ...(await renderMarkdown(content)) };
}
