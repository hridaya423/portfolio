import fs from "fs";
import path from "path";
import matter from "gray-matter";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const DIR = path.join(process.cwd(), "content", "projects");

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
      if (node.type === "element" && node.tagName === "img") {
        node.properties = { ...node.properties, loading: "lazy", decoding: "async" };
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

async function render(markdown: string) {
  const headings: Heading[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSections(headings))
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
  const { html, headings } = await render(content);
  const words = content.split(/\s+/).filter(Boolean).length;
  return { ...readMeta(slug, data), html, headings, words };
}

export function allCaseStudyMeta(): CaseStudyMeta[] {
  return caseStudySlugs()
    .map(getCaseStudyMeta)
    .filter((meta): meta is CaseStudyMeta => meta !== null);
}
