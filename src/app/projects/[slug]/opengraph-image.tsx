import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { caseStudySlugs, getCaseStudyMeta } from "@/data/case-studies";
import { DATA } from "@/data/resume";
import { questionFor, SHARE_IMAGE_SIZE } from "@/lib/structured-data";

export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudySlugs().map((slug) => ({ slug }));
}

const fontDir = join(process.cwd(), "src/lib/fonts");
const [manrope, caveat] = await Promise.all([
  readFile(join(fontDir, "Manrope-Medium.ttf")),
  readFile(join(fontDir, "Caveat-Regular.ttf")),
]);

const PAPER = "#efeff0";
const INK = "#171818";
const SIGNAL = "#d8603a";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getCaseStudyMeta(slug);
  if (!meta) return new Response("Not found", { status: 404 });
  const question = questionFor(slug);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px 68px",
          background: PAPER,
          color: INK,
          fontFamily: "Manrope",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, letterSpacing: "-0.02em" }}>
          <div style={{ width: 14, height: 14, marginRight: 16, borderRadius: 7, background: SIGNAL }} />
          {DATA.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {question && (
            <div
              style={{
                marginBottom: 22,
                color: SIGNAL,
                fontFamily: "Caveat",
                fontSize: 56,
                lineHeight: 1.05,
                textWrap: "balance",
                transform: "rotate(-1.5deg)",
                transformOrigin: "left bottom",
              }}
            >
              {`…what if ${question}`}
            </div>
          )}
          <div style={{ fontSize: 64, lineHeight: 1.08, letterSpacing: "-0.035em", textWrap: "balance" }}>
            {meta.headline}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Manrope", data: manrope, weight: 500, style: "normal" },
        { name: "Caveat", data: caveat, weight: 400, style: "normal" },
      ],
    },
  );
}
