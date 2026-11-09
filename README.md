# hridya.tech

The source of [www.hridya.tech](https://www.hridya.tech), the portfolio of Hridya Agrawal. It has a home page, a project index, an About page and one write-up for each project.

## Run it

You need Node 20 or later.

```sh
npm ci
npx next dev -p 3108
```

Open `http://localhost:3108`.

## Where things are

| Path | Contents |
|---|---|
| `content/projects/*.md` | The write-ups. Each file is one page at `/projects/<name>`. |
| `content/about.md` | The About page. |
| `src/data/portfolio.ts`, `src/data/resume.tsx` | Projects, events, work and certifications. |
| `src/app` | Routes, the sitemap, the feed and the share images. |
| `src/components/portfolio` | Sections of the home page and the article layout. |
| `src/components/portfolio/gl` | The shared WebGL stage. |

## Add a write-up

1. Add `content/projects/<name>.md` with this front matter: `title`, `headline`, `summary`, `kind`, `platform`, `status`, `publishedAt` and `updatedAt`. The optional keys are `site`, `repo`, `award`, `image`, `category` and `license`.
2. Add the project to `projectIndex` in `src/data/portfolio.ts` with the same `id` as the file name.
3. If an image is large, add it to `scripts/optimize-writeup-images.mjs` and run that script. The page then serves a WebP copy.

The sitemap, the feed at `/feed.xml` and the share image take the new page from those files.

## Check a change

```sh
npx tsc --noEmit -p .
npx eslint src/components/portfolio src/components/optical-hero
node scripts/tests/cloud-flow.mjs
npx next build
```

Stop the dev server before `npx next build`. Both write to `.next`.

## After a deploy

`node scripts/indexnow.mjs` sends each sitemap URL to IndexNow. To send only some pages, give their paths: `node scripts/indexnow.mjs /projects/cue /projects/locus`.

## Licence

See [LICENSE](LICENSE).
