import fs from "fs";
import path from "path";
import matter from "gray-matter";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSmartypants from "remark-smartypants";
import { unified } from "unified";

const DIR = path.join(process.cwd(), "content", "projects");
const PUBLIC = path.join(process.cwd(), "public");

export type CaseStudyMeta = {
  slug: string;
  title: string;
  headline: string;
  summary: string;
  kind: string;
  platform: string;
  status: string;
  publishedAt: string;
  updatedAt: string;
  site?: string;
  repo?: string;
  award?: string;
  image?: string;
  category?: string;
  license?: string;
};

export type Heading = { id: string; text: string };

export type CaseStudy = CaseStudyMeta & { html: string; headings: Heading[]; words: number };

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function rehypeSections(headings: Heading[]) {
  return () => (tree: HastNode) => {
    const seen = new Map<string, number>();
    const walk = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "h2") {
        const text = textOf(node);
        const base = slugify(text) || "section";
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        const id = count ? `${base}-${count}` : base;
        node.properties = { ...node.properties, id };
        headings.push({ id, text });
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

function jpegSize(data: Buffer) {
  let at = 2;
  while (at + 9 < data.length && data[at] === 0xff) {
    const marker = data[at + 1];
    const frame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (frame) return { width: data.readUInt16BE(at + 7), height: data.readUInt16BE(at + 5) };
    at += 2 + data.readUInt16BE(at + 2);
  }
  return null;
}

function imageSize(file: string) {
  const data = fs.readFileSync(file);
  if (data.length < 24) return null;
  if (data.readUInt32BE(0) === 0x89504e47) return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  if (data.toString("latin1", 0, 3) === "GIF") return { width: data.readUInt16LE(6), height: data.readUInt16LE(8) };
  if (data.readUInt16BE(0) === 0xffd8) return jpegSize(data);
  return null;
}

function localImage(src: unknown) {
  if (typeof src !== "string" || !src.startsWith("/") || src.startsWith("//")) return null;
  const file = path.join(PUBLIC, decodeURI(src));
  return file.startsWith(PUBLIC + path.sep) && fs.existsSync(file) ? file : null;
}

function rehypeImages() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      node.children = node.children?.map((child) => {
        if (child.type !== "element" || child.tagName !== "img") {
          walk(child);
          return child;
        }
        child.properties = { ...child.properties, loading: "lazy", decoding: "async" };
        const src = child.properties.src as string;
        const file = localImage(src);
        if (!file) return child;
        child.properties = { ...child.properties, ...imageSize(file) };
        if (file.endsWith(".webp") || !fs.existsSync(file.replace(/\.[^.]+$/, ".webp"))) return child;
        const source: HastNode = {
          type: "element",
          tagName: "source",
          properties: { srcSet: src.replace(/\.[^.]+$/, ".webp"), type: "image/webp" },
          children: [],
        };
        return { type: "element", tagName: "picture", properties: {}, children: [source, child] };
      });
    };
    walk(tree);
  };
}

export async function renderMarkdown(markdown: string) {
  const headings: Heading[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSmartypants, { dashes: false })
    .use(remarkRehype)
    .use(rehypeSections(headings))
    .use(rehypeImages)
    .use(rehypePrettyCode, {
      theme: { light: "min-light", dark: "min-dark" },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);
  return { html: file.toString(), headings };
}

function readMeta(slug: string, data: Record<string, unknown>): CaseStudyMeta {
  const required = ["title", "headline", "summary", "kind", "platform", "status", "publishedAt", "updatedAt"];
  for (const key of required) {
    if (typeof data[key] !== "string" || !data[key]) {
      throw new Error(`content/projects/${slug}.md is missing "${key}"`);
    }
  }
  return { slug, ...(data as Omit<CaseStudyMeta, "slug">) };
}

export function caseStudySlugs(): string[] {
  return fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
    .sort();
}

export function getCaseStudyMeta(slug: string): CaseStudyMeta | null {
  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  return readMeta(slug, matter(fs.readFileSync(file, "utf-8")).data);
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { content, data } = matter(fs.readFileSync(file, "utf-8"));
  const { html, headings } = await renderMarkdown(content);
  const words = content.split(/\s+/).filter(Boolean).length;
  return { ...readMeta(slug, data), html, headings, words };
}

export function allCaseStudyMeta(): CaseStudyMeta[] {
  return caseStudySlugs()
    .map(getCaseStudyMeta)
    .filter((meta): meta is CaseStudyMeta => meta !== null);
}

export function latestUpdate(): string {
  return allCaseStudyMeta()
    .map((study) => study.updatedAt)
    .sort()
    .at(-1)!;
}
