// Usage, after a deploy: `node scripts/indexnow.mjs` sends every sitemap URL;
// `node scripts/indexnow.mjs /projects/cue /projects/locus` sends only those paths.
const HOST = "www.hridya.tech";
const KEY = "c27cc0abd819c761816d9558ab1663a3";
const origin = `https://${HOST}`;

const paths = process.argv.slice(2);
const urlList = paths.length
  ? paths.map((path) => new URL(path, origin).href)
  : [...(await (await fetch(`${origin}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

const keyFile = await fetch(`${origin}/${KEY}.txt`);
if (!keyFile.ok || (await keyFile.text()).trim() !== KEY) {
  console.error(`${origin}/${KEY}.txt is not live yet. Deploy first.`);
  process.exit(1);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${origin}/${KEY}.txt`, urlList }),
});
console.log(`${response.status} ${response.statusText}: ${urlList.length} URLs sent`);
process.exit(response.ok ? 0 : 1);
