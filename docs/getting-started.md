# Getting Started

`@pphatdev/format-datetime` is a zero-dependency utility for formatting dates and times into localized strings using native JavaScript APIs (`Intl.DateTimeFormat`, `Date`). It ships with first-class Khmer (`km-KH`) support including localized digits, six time-of-day phrases, and full Khmer lunar calendar arithmetic — Buddhist Era, Jolak Sakaraj, animal years, era years (Sak), waxing/waning moon, and precise Khmer New Year (Moha Songkran) timing.

Everything is written in TypeScript, compiled to CJS/ESM/IIFE for npm and consumed as raw TypeScript source on Deno via JSR.

## Requirements

- **Runtime**: Node.js ≥ 20.0.0, Bun, Deno, Cloudflare Workers, or any modern browser (Chrome ≥ 71, Firefox ≥ 78, Safari ≥ 14)
- **`Intl` support**: The runtime must ship `Intl.DateTimeFormat` and `Intl.NumberFormat` with the `numberingSystem: 'khmr'` option (required for Khmer digits). All supported runtimes qualify.
- **TypeScript** (optional): ≥ 5.0 for the ambient types shipped in `dist/index.d.ts` and `dist/index.d.mts`

Nothing else — the package has zero runtime dependencies.

## Installation

### Node.js

```bash
npm install @pphatdev/format-datetime
# or
yarn add @pphatdev/format-datetime
# or
pnpm add @pphatdev/format-datetime
```

The `package.json` `exports` field automatically picks the right build:

- `import` → `dist/index.mjs` (ESM)
- `require` → `dist/index.js` (CJS)
- `types` → `dist/index.d.ts`

### Bun

```bash
bun add @pphatdev/format-datetime
```

Bun always uses the ESM entry. TypeScript types work out of the box.

### Deno (JSR)

```bash
deno add @pphatdev/format-datetime
```

Or without adding to your import map, use the JSR specifier directly:

```typescript
import FormatDateTime from 'jsr:@pphatdev/format-datetime';
```

Deno pulls the raw TypeScript source (`src/index.ts`) directly from JSR — no build step is involved on the Deno side. This is why every intra-repo `import` uses an explicit `.ts` extension.

### Cloudflare Workers

```bash
npm install @pphatdev/format-datetime
```

```toml
# wrangler.toml
compatibility_date = "2024-01-01"
# No nodejs_compat flag needed — the library uses zero Node built-ins.
```

The ESM build is picked up automatically; `sideEffects: false` in `package.json` allows tree-shaking of unused paths.

### Browser via CDN (UNPKG / jsDelivr)

```html
<!-- IIFE bundle, `FormatDateTime` attached to globalThis -->
<script src="https://unpkg.com/@pphatdev/format-datetime"></script>
<script>
  const dt = new FormatDateTime(new Date(), "DDDD, MMMM d, YYYY", "km-KH");
  console.log(dt.formatDate());
</script>

<!-- ESM module (also gives you KhmerDate) -->
<script type="module">
  import FormatDateTime, { KhmerDate } from 'https://unpkg.com/@pphatdev/format-datetime/dist/index.mjs';
  console.log(new KhmerDate(new Date()).toLunarDate('full'));
</script>
```

The IIFE bundle exposes the class as the tsup global name `FormatDateTimeBundle` **and** attaches `FormatDateTime` to `globalThis` from the entry file's final statement. Both work; prefer the bare `FormatDateTime`.

### Framework Setup

- **Next.js**: Works in both server and client components. In client components, the class-per-render cost is negligible. Use `import FormatDateTime from '@pphatdev/format-datetime'` — the ESM build is picked up.
- **Nuxt / Vite / SvelteKit**: Same story — ESM build, no config needed.
- **Remix**: Works in loaders (server) and components (client).
- **Astro**: Same. If you ship it in a client-hydrated island, it adds ~5 KB minified+gzipped.
- **Expo / React Native**: Requires Hermes ≥ 0.72 for the `numberingSystem: 'khmr'` option. Older Hermes builds render Khmer digits with a fallback swap and still produce correct output.

## Your First Format

```typescript
import FormatDateTime from '@pphatdev/format-datetime';

const dt = new FormatDateTime(new Date(), "DDDD, MMMM d, YYYY, hh:mm:ss A", "km-KH");
console.log(dt.formatDate());
// ចន្ទ, កក្កដា ១៣, ២០២៦, ០១:៣០:៤៥ រសៀល
```

Three inputs, three outputs, one call. That's the whole API for the common case.

### Constructor Signature

```typescript
new FormatDateTime(
  date?: string | Date | null,   // defaults to `new Date()`
  format?: string | null,        // defaults to "dd-MM-yyyy hh:mm:ss"
  locale?: string                // defaults to "en-US" (any BCP 47 tag)
)
```

| Input for `date` | Behavior |
| --- | --- |
| `Date` instance | Used directly (stored by reference — the constructor does **not** clone). |
| `string` | Parsed via `new Date(str)`. Accepts ISO 8601 (`"2026-07-13"`, `"2026-07-13T14:30:45Z"`), RFC 2822, and other browser-parseable formats. |
| `null` / `undefined` | Uses `new Date()` (current wall clock at construction time). |
| Invalid string | Stored as an invalid `Date`; `formatDate()` returns the literal string `"Invalid Date"` without throwing. |

### Instance Fields

All three constructor arguments become public, mutable properties:

```typescript
class FormatDateTime {
  date: Date;
  format: string;
  locale: string;
}
```

Mutating them takes effect on the next `formatDate()` call, enabling patterns like:

```typescript
const dt = new FormatDateTime();
dt.format = 'YYYY';         // "2026"
dt.format = 'MMMM';         // "July"
dt.locale = 'km-KH';        // "កក្កដា"
```

Note: because `FormatDateTime` stores the `Date` by reference, mutating the original `Date` after construction affects future `formatDate()` output. If this matters, clone first: `new FormatDateTime(new Date(original.getTime()), ...)`.

## Locale Behavior

The library forks internally on `locale.toLowerCase().startsWith('km')`:

- **Khmer locales** (`km`, `km-KH`, `km-Khmr`, etc.):
  - Month names come from hand-coded `Constants.MONTHS` table (12 solar months in Khmer).
  - Weekday names come from `Constants.WEEKDAYS` (long) and `Constants.WEEKDAYS_SHORT` (short).
  - Numbers pass through `Intl.NumberFormat` with `numberingSystem: 'khmr'` and are then character-remapped through `Constants.KHMER_NUMBERS` (double-safety: works even when the runtime ignores the numbering system).
  - AM/PM (`A`, `a`, `aA`) becomes one of six time-of-day phrases based on hour ranges (see [tokens](./tokens.md)).
- **All other locales**:
  - Month, weekday, and AM/PM come from `Intl.DateTimeFormat(locale, ...)`.
  - Numbers come from `Intl.NumberFormat(locale, ...)` (which will use the locale's native numbering system if any — e.g. Arabic-Indic digits for `ar-EG`).
  - Anything the host runtime's `Intl` supports works: `en-US`, `en-GB`, `fr-FR`, `ja-JP`, `zh-CN`, `ar-EG`, `th-TH`, …

## Lunar Formatting Shortcut

For the common case of "just give me the Khmer lunar date," the `formatLunarDate` shortcut avoids constructing `KhmerDate` yourself:

```typescript
import FormatDateTime from '@pphatdev/format-datetime';

const dt = new FormatDateTime(new Date(2026, 6, 13));
console.log(dt.formatLunarDate('full'));
// ថ្ងៃចន្ទ ១៣រោច ខែបឋមាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០

console.log(dt.formatLunarDate('short'));
// ១៣រោច ខែបឋមាសាឍ

console.log(dt.formatLunarDate('lW ldd lN lM'));
// ចន្ទ ១៣ រោច បឋមាសាឍ
```

`formatLunarDate()` delegates to `new KhmerDate(this.date).toLunarDate(format)` under the hood. See [Lunar Calendar](./lunar-calendar.md) for the full Khmer calendar API.

## Common Pitfalls

- **Passing month as human-readable number**: `Date` months are 0-indexed. `new Date(2026, 6, 13)` is **July** 13, not June.
- **Timezone in string parsing**: `new Date('2026-07-13')` is parsed as UTC midnight (00:00 UTC), which appears as the previous day in western hemispheres. Prefer `new Date('2026-07-13T00:00:00')` for local midnight or explicit constructor `new Date(2026, 6, 13)`.
- **Trusting the invalid-date sentinel**: `formatDate()` returns the string `"Invalid Date"` for invalid dates but doesn't throw. Downstream code that expects a real formatted string may want an explicit `!isNaN(dt.date.getTime())` check.
- **Sharing mutable `Date`**: The constructor doesn't clone. Mutating the original `Date` after construction affects the formatter.
- **Locale casing**: `'KM-KH'` works (the check is lowercased), but stick with the canonical `'km-KH'` for clarity.
- **Custom lunar tokens inside solar format string**: You can freely mix, e.g. `'YYYY-MM-dd (BBBB) lM ld lN lA lE'`. The token generator detects any lunar token and runs the lunar solver once.

## Next Steps

- [Token Reference](./tokens.md) — every format token, precedence rules, escaping notes
- [API Reference](./api-reference.md) — full `FormatDateTime` and `KhmerDate` API surface with TypeScript signatures
- [TypeScript Guide](./typescript.md) — all exported types and interfaces
- [Lunar Calendar](./lunar-calendar.md) — how the Khmer calendar arithmetic works
- [Algorithms](./algorithms.md) — deep dive on the traditional Soriyatra formulas
- [Runtimes](./runtimes.md) — platform-specific setup notes
- [Examples](./examples.md) — copy-paste recipes for common scenarios
- [Architecture](./architecture.md) — how the pieces fit together internally
- [FAQ](./faq.md) — answers to common questions
