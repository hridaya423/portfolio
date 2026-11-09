import { DATA } from "@/data/resume";
import { allCaseStudyMeta, latestUpdate } from "@/data/case-studies";
import { caseStudyUrl, FEED, isoDateTime, SITE_URL } from "@/lib/structured-data";

export const dynamic = "force-static";

function escape(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function GET() {
  const studies = allCaseStudyMeta().sort(
    (a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.publishedAt.localeCompare(a.publishedAt),
  );
  const entries = studies.map((study) => {
    const url = caseStudyUrl(study.slug);
    return `  <entry>
    <title>${escape(study.headline)}</title>
    <link rel="alternate" type="text/html" href="${url}"/>
    <id>${url}</id>
    <published>${isoDateTime(study.publishedAt)}</published>
    <updated>${isoDateTime(study.updatedAt)}</updated>
    <summary>${escape(study.summary)}</summary>
  </entry>`;
  });
  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-GB">
  <title>${escape(FEED.title)}</title>
  <id>${SITE_URL}/</id>
  <link rel="self" type="${FEED.type}" href="${SITE_URL}${FEED.url}"/>
  <link rel="alternate" type="text/html" href="${SITE_URL}/projects"/>
  <updated>${isoDateTime(latestUpdate())}</updated>
  <author>
    <name>${escape(DATA.name)}</name>
    <uri>${SITE_URL}</uri>
  </author>
${entries.join("\n")}
</feed>
`;
  return new Response(feed, { headers: { "Content-Type": `${FEED.type}; charset=utf-8` } });
}
