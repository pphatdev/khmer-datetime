# Runtimes

The library ships to **npm** and **JSR** from the same source, but consumers reach it differently:

| Runtime | Channel | What it loads |
| --- | --- | --- |
| Node.js ≥ 20 | npm | `dist/index.js` (CJS) or `dist/index.mjs` (ESM) via `package.json` `exports` |
| Bun | npm | `dist/index.mjs` (ESM) |
| Cloudflare Workers | npm | `dist/index.mjs` (ESM, `sideEffects: false` enables tree-shaking) |
| Deno | JSR | `src/index.ts` **directly** (no build) |
| Browser (bundler) | npm | `dist/index.mjs` |
| Browser (CDN) | UNPKG / jsDelivr | `dist/index.global.js` (IIFE, attaches `FormatDateTime` to `globalThis`) |

The consequence: the code in `src/` must run natively on every one of these targets. Only `Intl.DateTimeFormat`, `Intl.NumberFormat`, and `Date` are used — no `fs`, no `path`, no `process`, no Node built-ins.

## Node.js

### Installation

```bash
npm install @pphatdev/format-datetime
```

### ESM

```typescript
import FormatDateTime, { KhmerDate } from '@pphatdev/format-datetime';

const dt = new FormatDateTime(new Date(), 'YYYY-MM-dd HH:mm:ss');
console.log(dt.formatDate());
```

### CommonJS

```javascript
const FormatDateTime = require('@pphatdev/format-datetime').default;
const { KhmerDate } = require('@pphatdev/format-datetime');

console.log(new FormatDateTime(new Date(), 'YYYY-MM-dd').formatDate());
```

### Minimum Node version

**20.0.0** (see `engines` in `package.json`). Required for consistent `Intl` behavior and the `numberingSystem` option on `Intl.NumberFormat`.

### Full-ICU note

Node.js ships with full ICU data by default since v13. If you're running a slimmed-down Node build (`--with-intl=small-icu`), non-English locale names may fall back to English. All supported runtimes tested in CI use full ICU.

## Bun

```bash
bun add @pphatdev/format-datetime
```

```typescript
import FormatDateTime from '@pphatdev/format-datetime';
```

Bun always uses the ESM entry. TypeScript types are picked up automatically from `dist/index.d.mts`.

Bun's `Intl` implementation is complete — Khmer numbering system, all locales, timezone offsets, all work identically to Node.

## Deno

### Installation

```bash
deno add @pphatdev/format-datetime
```

This adds `"@pphatdev/format-datetime": "jsr:@pphatdev/format-datetime@^0.3.5"` to your `deno.json` imports.

### Import

```typescript
import FormatDateTime, { KhmerDate } from '@pphatdev/format-datetime';
```

Or without adding to your import map:

```typescript
import FormatDateTime from 'jsr:@pphatdev/format-datetime';
```

Or pin a specific version:

```typescript
import FormatDateTime from 'jsr:@pphatdev/format-datetime@0.3.5';
```

### How Deno consumes this package

Deno reads `src/index.ts` **directly** from JSR — that's why every intra-project import uses the `.ts` extension. There is **no build step and no `dist/`** on the Deno side.

The `deno.json` and `jsr.json` at the repo root both set:

```json
{ "exports": "./src/index.ts" }
```

### Permissions

The library needs **zero permissions** — no `--allow-net`, `--allow-read`, `--allow-env`. It's pure computation.

## Cloudflare Workers

### Installation

```bash
npm install @pphatdev/format-datetime
```

### wrangler.toml

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"
# nodejs_compat is NOT needed — this library uses zero Node built-ins.
```

### Worker code

```typescript
import FormatDateTime, { KhmerDate } from '@pphatdev/format-datetime';

export default {
  async fetch(_req: Request): Promise<Response> {
    const dt = new FormatDateTime(new Date(), 'DDDD, MMMM d, YYYY hh:mm A', 'en-US');
    const kd = new KhmerDate();
    return Response.json({
      solar: dt.formatDate(),
      lunar: kd.toLunarDate('full'),
    });
  },
};
```

### Bundle size in Workers

With tree-shaking (`sideEffects: false` is set in `package.json`), the effective size added to your Worker is roughly:

- Solar-only usage: ~4 KB minified+gzipped
- With lunar: ~8 KB minified+gzipped

The `globalThis.FormatDateTime` assignment in the entry is a side-effect statement — the bundler emits it but it costs nothing at runtime in a Worker.

## Browser via Bundler (Vite, Rollup, Webpack, etc.)

```typescript
import FormatDateTime from '@pphatdev/format-datetime';
```

Bundlers pick up `dist/index.mjs` via the `import` condition in `exports`. Tree-shaking works — if you only use `FormatDateTime` (not `KhmerDate` or lunar tokens), the lunar module is dropped.

Framework-specific notes:

- **Next.js (Pages + App Router)**: works in both server and client components. Import at the top of the file; nothing further needed.
- **Nuxt 3**: works out of the box. Use `<script setup>` and import as normal.
- **SvelteKit**: works out of the box. If you need SSR-only formatting, import in `+page.server.ts` or `+layout.server.ts`.
- **Astro**: works out of the box. Ship it in a client-hydrated island or a server-only route.
- **Remix**: works out of the box in loaders (server) and components (client).

## Browser via CDN

### IIFE (works with bare `<script>`)

```html
<script src="https://unpkg.com/@pphatdev/format-datetime"></script>
<script>
  const dt = new FormatDateTime(new Date(), 'YYYY-MM-dd', 'en-US');
  console.log(dt.formatDate());
</script>
```

The IIFE bundle exposes the class as **both**:

- `globalThis.FormatDateTime` (from the entry file's final statement)
- `globalThis.FormatDateTimeBundle` (tsup's `--global-name` option)

Use whichever is clearer. `KhmerDate` is not attached to the global — for lunar features in a CDN scenario, use the ESM build below.

### ESM via CDN

```html
<script type="module">
  import FormatDateTime, { KhmerDate } from 'https://unpkg.com/@pphatdev/format-datetime/dist/index.mjs';
  const kd = new KhmerDate(new Date());
  console.log(kd.toLunarDate('full'));
</script>
```

### jsDelivr

```html
<script src="https://cdn.jsdelivr.net/npm/@pphatdev/format-datetime"></script>
```

Or ESM:

```html
<script type="module">
  import FormatDateTime from 'https://cdn.jsdelivr.net/npm/@pphatdev/format-datetime/dist/index.mjs';
</script>
```

### Version pinning

Always pin the version in production:

```html
<script src="https://unpkg.com/@pphatdev/format-datetime@0.3.5/dist/index.global.js"></script>
```

## Build Output Reference

Running `npm run build` produces the following in `dist/`:

| File | Format | Purpose |
| --- | --- | --- |
| `index.js` | CJS | `require()` and `package.json` `main` |
| `index.mjs` | ESM | `import` and `package.json` `module` |
| `index.global.js` | IIFE | UNPKG / jsDelivr CDN with global name `FormatDateTimeBundle` (also mirrored as `FormatDateTime` on `globalThis`) |
| `index.d.ts` | TypeScript types (CJS) | `package.json` `types` |
| `index.d.mts` | TypeScript types (ESM) | Emitted alongside the ESM build |

All builds are **minified** via tsup with esbuild under the hood. The tsup config lives inline in the `build` script:

```bash
tsup src/index.ts --format cjs,esm,iife --global-name FormatDateTimeBundle --dts --clean --minify
```

- `--format cjs,esm,iife` — three output formats
- `--global-name FormatDateTimeBundle` — the IIFE bundle's global name (in addition to the entry file's `globalThis.FormatDateTime` assignment)
- `--dts` — emit `.d.ts` files alongside JS
- `--clean` — wipe `dist/` before rebuilding
- `--minify` — minify all outputs

## Testing Locally Across Runtimes

```bash
npm run test:node   # Vitest against test/node/
npm run test:deno   # `deno test -A test/deno/`
npm run test        # both, sequentially
```

The two suites are **near-duplicates** on purpose. A behavioral test typically wants to live in both, so that both runtimes stay green independently. If you add a feature that behaves differently on Node vs Deno, add tests that reflect the difference in each suite.

## CI

`.github/workflows/ci.yml` runs `npm run test` on a matrix of Node **20 / 22 / 24 / 26** with Deno also installed. `npm-publish.yml` and `jsr.yml` handle release automation to their respective registries.

## Runtime Feature Matrix

| Feature | Node ≥20 | Bun | Deno | CF Workers | Browser |
| --- | --- | --- | --- | --- | --- |
| `FormatDateTime` (solar) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Khmer locale digits | ✅ | ✅ | ✅ | ✅ | ✅ |
| Khmer time-of-day phrases | ✅ | ✅ | ✅ | ✅ | ✅ |
| `KhmerDate` (lunar) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Timezone tokens (`Z`, `z`) | ✅ | ✅ | ✅ | ✅ (UTC) | ✅ |
| Global `FormatDateTime` via CDN | N/A | N/A | N/A | N/A | ✅ (IIFE) |
| Deep-import internal classes | ❌ | ❌ | ✅ (JSR) | ❌ | ❌ |

Cloudflare Workers always run in UTC — the timezone offset tokens will always output `+00:00`.
