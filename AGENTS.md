<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Verification

- `npx tsc --noEmit -p .`
- `npx eslint src/components/portfolio src/components/optical-hero` (repo-wide `npm run lint` has older errors in blog, magicui, mdx and utils)
- `node scripts/tests/cloud-flow.mjs`
- `node scripts/verify-certifications.mjs http://localhost:3108` with `npx next dev -p 3108` running
- `npx next build` (stop the dev server first; both write `.next`)

## WebGL

- Every effect draws through one shared renderer in `src/components/portfolio/gl/stage.ts`: a single live canvas moves to the effect that matters most on screen, the others show a copy of their last frame. Add effects with `getStage().add({ placeholder, ratio, render, ... })`, never a new `WebGLRenderer`.
- Quality tiers live in `gl/quality.ts`. `?quality=low|mid|high` pins a tier and turns adaptive resolution off; `<html data-gl-tier>` shows the detected tier.
- Many phones can't render into float targets or linearly filter float textures. Check `renderer.extensions` and fall back to 8-bit or half-float, and only mark a view ready once its targets are complete.
