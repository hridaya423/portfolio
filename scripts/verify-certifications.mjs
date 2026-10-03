import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://localhost:3108";
const identities = ["az-900", "dp-900", "ai-900", "sc-900", "pl-900", "pl-100", "pega", "oracle", "github"];
const pages = await Promise.all(["/", "/review/fixtures?state=empty", "/review/fixtures?state=single", "/review/fixtures"].map(async path => {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  return response.text();
}));
const credentials = html => [...html.matchAll(/<article[^>]*data-credential="([^"]+)"[^>]*>(.*?)<\/article>/gs)];
const normal = credentials(pages[0]);
assert.deepEqual(normal.map(match => match[1]), identities);
for (const [, id, article] of normal) {
  assert.match(article, /<h3>.+?<\/h3>/s, id);
  assert.match(article, /Earned at.*?(11|13)/s, id);
  assert.match(article, /href="https:\/\/[^\"]+"[^>]*aria-label="Verify /, id);
}
assert.match(normal.find(match => match[1] === "pega")[2], /Verification instructions/);
assert.equal(credentials(pages[1]).length, 0);
assert.match(pages[1], /No credentials in this collection yet/);
assert.doesNotMatch(pages[1], /<canvas[^>]*credential-refraction/);
assert.deepEqual(credentials(pages[2]).map(match => match[1]), ["az-900"]);
assert.deepEqual(credentials(pages[3]).map(match => match[1]), [...identities, "fixture-extra"]);
assert.match(pages[0], /<noscript><style>/);
assert.match(pages[0], /credential-refraction-fallback[^>]*>AZ-900/);
assert.doesNotMatch(pages[0], /microsoft-crystal|sculpture\.svg/);
console.log("Certification SSR checks passed: nine credentials, verification links, empty, single, expanded, and no-JavaScript markup.");
