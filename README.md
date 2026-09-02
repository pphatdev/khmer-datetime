# format-datetime

A robust, lightweight utility to format dates and times into localized strings using native JavaScript APIs. It supports custom date/time patterns, localized digits (e.g., Khmer numerals), and time-of-day phrases.

[![NPM Version](https://img.shields.io/npm/v/@pphatdev/format-datetime.svg)](https://www.npmjs.com/package/@pphatdev/format-datetime)
[![JSR Version](https://jsr.io/badges/@pphatdev/format-datetime)](https://jsr.io/@pphatdev/format-datetime)
[![Build and Test](https://github.com/pphatdev/format-datetime/actions/workflows/ci.yml/badge.svg)](https://github.com/pphatdev/format-datetime/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 📅 **Flexible Formatting**: Format dates exactly how you want using familiar tokens (`YYYY`, `MMMM`, `hh`, `A`, etc.).
- 🌍 **Localization (i18n)**: Fully supports BCP 47 locale tags (e.g., `en-US`, `km-KH`, `fr-FR`).
- 🇰🇭 **Khmer Support**: Built-in support for Khmer (`km-KH`) localized digits (e.g., `២០២៦`) and time-of-day phrases (e.g., `ព្រឹក`, `រសៀល`).
- 🌙 **Lunar Calendar**: Full support for Khmer lunar dates, Buddhist era (BE), and animal years.
- ⚡ **Zero Dependencies**: Pure native JavaScript (`Intl.DateTimeFormat`, `Date`).
- 📦 **Multi-Runtime**: Works flawlessly in **Node.js**, **Bun**, **Deno** (via JSR), **Cloudflare Workers** (Edge), and the **Browser**.

## Installation

### Node.js / Bun / Cloudflare Workers
```bash
npm install @pphatdev/format-datetime
# or
bun add @pphatdev/format-datetime
```

### Deno (JSR)
```bash
deno add @pphatdev/format-datetime
```

### Browser (CDN)
You can include it directly in your HTML using UNPKG:
```html
<script src="https://unpkg.com/@pphatdev/format-datetime"></script>
<script>
  const dt = new FormatDateTime(new Date(), "DDDD, MMMM d, YYYY", "km-KH");
  console.log(dt.formatDate()); 
</script>
```

## Usage

### Basic Example

```typescript
import FormatDateTime from '@pphatdev/format-datetime';

// 1. Initialize with Date, format string, and locale
const dt = new FormatDateTime(new Date(), "DDDD, MMMM d, YYYY, hh:mm:ss A", "km-KH");

// 2. Format the date
console.log(dt.formatDate()); 
// Output: "ចន្ទ, កក្កដា ១៣, ២០២៦, ០១:៣០:៤៥ រសៀល"
```

### Khmer Lunar Date Example

```typescript
import { KhmerDate } from '@pphatdev/format-datetime';

const date = new Date(2026, 6, 13); // July 13, 2026
const kd = new KhmerDate(date);

// Built-in presets
console.log(kd.toLunarDate('full')); 
// Output: "ថ្ងៃចន្ទ ១៣រោច ខែបឋមាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០"

console.log(kd.toLunarDate('short')); 
// Output: "១៣រោច ខែបឋមាសាឍ"

// Custom Format Tokens
console.log(kd.toLunarDate('lW ldd lN lM')); 
// Output: "ចន្ទ ១៣ រោច បឋមាសាឍ"
```

### Available Tokens

| Token | Description | Example (en-US) | Example (km-KH) |
| --- | --- | --- | --- |
| `YYYY` / `yyyy` | 4-digit year | `2026` | `២០២៦` |
| `YY` / `yy` | 2-digit year | `26` | `២៦` |
| `MMMM` | Full month name | `July` | `កក្កដា` |
| `MMM` | Short month name | `Jul` | `កក្កដា` |
| `MM` | 2-digit month | `07` | `០៧` |
| `M` | Month number | `7` | `៧` |
| `DDDD` | Full day name | `Monday` | `ចន្ទ` |
| `DDD` | Short day name | `Mon` | `ចន្ទ` |
| `dd` | 2-digit day of month | `13` | `១៣` |
| `d` | Day of month | `13` | `១៣` |
| `HH` | 24-hour time (2 digits) | `14` | `១៤` |
| `H` | 24-hour time | `14` | `១៤` |
| `hh` | 12-hour time (2 digits) | `02` | `០២` |
| `h` | 12-hour time | `2` | `២` |
| `mm` | Minutes (2 digits) | `30` | `៣០` |
| `m` | Minutes | `30` | `៣០` |
| `ss` | Seconds (2 digits) | `45` | `៤៥` |
| `s` | Seconds | `45` | `៤៥` |
| `A` | Uppercase AM/PM | `PM` | `រសៀល` |
| `a` | Lowercase AM/PM | `pm` | `រសៀល` |
| `ZZ` | ISO 8601 offset (w/ sec) | `+07:00:00` | `+07:00:00` |
| `Z` | ISO 8601 offset | `+07:00` | `+07:00` |

### Lunar Date Tokens (Khmer)

| Token | Description | Example |
| --- | --- | --- |
| `BBBB` | Buddhist Era Year | `២៥៧០` |
| `JJJJ` | Jolak Sakaraj Year | `១៣៨៨` |
| `lA` | Animal Year | `មមី` |
| `lE` | Era Year / Sak | `អដ្ឋស័ក` |
| `lM` | Lunar Month | `បឋមាសាឍ` |
| `ldd` | Lunar Day count (2 digits) | `១៣` |
| `ld` | Lunar Day count | `១៣` |
| `lN` | Moon Status | `រោច` / `កើត` |
| `ln` | Moon Status (Short) | `រ` / `ក` |
| `lW` | Day of Week (Khmer) | `ចន្ទ` |
| `lw` | Day of Week (Short) | `ច` |

## API Reference

### `new FormatDateTime(date?, format?, locale?)`

- **`date`** _(string | Date | null)_: The date to format. Can be a string (e.g., `"2026-07-13"`), a `Date` object, or `null`/`undefined` (defaults to the current date and time).
- **`format`** _(string | null)_: The format string containing tokens. Defaults to `"dd-MM-yyyy hh:mm:ss"`.
- **`locale`** _(string)_: The BCP 47 locale tag. Defaults to `"en-US"`.

### `dt.formatDate(): string`
Processes the date and applies the formatting pattern with localized strings.

### `dt.formatLunarDate(format?)`
Shorthand to format the date using the lunar calendar without explicitly instantiating `KhmerDate`.
- **`format`** _(string)_: The lunar format pattern or preset (`"full"`, `"medium"`, `"short"`, etc). Defaults to `"full"`.

### `dt.toString()`
Implicitly calls `dt.formatDate()` when the object is cast to a string.

### `new KhmerDate(date)`

- **`date`** _(Date)_: The date to convert into a Khmer Lunar Date.

### `kd.toLunarDate(format?)`
- **`format`** _(string)_: The format string containing lunar tokens, or a preset (`"full"`, `"medium"`, `"short"`). Defaults to `"full"`.

### `kd.khDay(): number`
Returns the lunar day number.

### `kd.khMonth(): number`
Returns the lunar month index.

### `kd.khYear(): number`
Returns the Buddhist Era (BE) year.

### `kd.toKhmerDate(format?)`
Formats the standard solar date in Khmer language.
- **`format`** _(string)_: Defaults to `"ទី{day} ខែ{month} ឆ្នាំ{year}"`.

### Static Helpers on `KhmerDate`
- **`KhmerDate.getKhmerMonthNames()`**: Returns an array of Khmer lunar month names.
- **`KhmerDate.getAnimalYearNames()`**: Returns an array of animal years (e.g., ជូត, ឆ្លូវ).
- **`KhmerDate.getEraYearNames()`**: Returns an array of era years (e.g., ឯកស័ក, ទោស័ក).
- **`KhmerDate.arabicToKhmerNumber(numberString)`**: Converts an Arabic number string to a Khmer number string (e.g. "123" to "១២៣").
- **`KhmerDate.khmerToArabicNumber(khmerNumberString)`**: Converts a Khmer number string to an Arabic number string.

## Documentation

Long-form docs live under [`docs/`](./docs):

- [Getting Started](./docs/getting-started.md) — installation on each runtime, constructor, framework setup
- [Token Reference](./docs/tokens.md) — every solar and lunar format token
- [API Reference](./docs/api-reference.md) — full `FormatDateTime` and `KhmerDate` TypeScript signatures
- [TypeScript Guide](./docs/typescript.md) — import styles, type patterns, interfaces
- [Lunar Calendar](./docs/lunar-calendar.md) — Buddhist Era, Jolak Sakaraj, animal/era cycles, moon status
- [Algorithms](./docs/algorithms.md) — the traditional Soriyatra formulas explained
- [Architecture](./docs/architecture.md) — how the pieces fit together
- [Runtimes](./docs/runtimes.md) — Node, Bun, Deno, Cloudflare Workers, browser setup
- [Examples](./docs/examples.md) — copy-paste recipes
- [FAQ](./docs/faq.md) — common questions

## AI Agent Guidelines

This project ships with dedicated entry points for AI coding assistants and LLM tools. **If you are an AI agent operating in this repository, read these first.**

### For coding assistants (Claude Code, Cursor, Copilot, etc.)

Start with [`CLAUDE.md`](./CLAUDE.md). It documents:

- Common commands (`npm run build`, `npm run test:node`, `npm run test:deno`, single-test invocations)
- The **dual-publish model** — npm ships `dist/`; JSR ships raw `src/` to Deno. This constrains what you can change.
- Architecture invariants you must not break

### For LLM tools that consume `llms.txt`

Load [`llms.txt`](./llms.txt) at the repo root. It follows the [llmstxt.org](https://llmstxt.org) spec and links to every doc, source file, and workflow via `raw.githubusercontent.com` URLs for direct retrieval.

### Load-bearing invariants

When editing this codebase — human or agent — the following patterns are load-bearing and must be preserved:

1. **`.ts` extensions in every intra-repo import**. Deno consumes `src/index.ts` directly from JSR and requires explicit extensions. Removing them breaks Deno users. `tsconfig.json` tolerates them via `allowImportingTsExtensions: true` + `moduleResolution: "bundler"`.
2. **Longest-token-first regex ordering** in `formatDate()`. The sort `keys.sort((a, b) => b.length - a.length)` prevents `MMMM` from being eaten by `MM`, `hh` by `h`, `ldd` by `ld`. Do not change the comparator.
3. **No Node built-ins in `src/`**. Code must run on Node ≥ 20, Bun, Deno, Cloudflare Workers, and the browser. Only `Intl.DateTimeFormat`, `Intl.NumberFormat`, and `Date` are available.
4. **UTC-noon normalization in the lunar solver**. `KhmerDate.findLunarDate()` normalizes to `Date.UTC(y, m, d, 12, 0, 0)` before day-counting. Removing this reintroduces timezone off-by-ones.
5. **Version bumps must update three files**: `package.json`, `deno.json`, and `jsr.json` together.
6. **Test both runtimes**. `test/node/` (Vitest) and `test/deno/` (`@std/testing` + `@std/expect`) are intentional near-duplicates. New behavioral tests should live in both.
7. **`globalThis.FormatDateTime` attachment** at the end of `src/index.ts` is intentional — the IIFE CDN bundle relies on it. Do not remove.
8. **`defualtPatterns` typo** in `FormatDateTime` is preserved for backwards compatibility. Do not rename.
9. **Placeholder methods on `KhmerDate`** (`format`, `add`, `subtract`) are intentional stubs kept for upstream PHP API-shape parity. Do not "implement" them without discussion — real date arithmetic should go through the underlying `Date`.

### Scope boundaries

- The **public npm API** is `FormatDateTime` + `KhmerDate` only. `Calculator`, `KhmerFormatter`, `SoriyatraLerngSak`, and `Utils` are reachable from `src/lunar/index.ts` but are **not** re-exported from `src/index.ts`. They are Deno/JSR-only and may change without a semver bump.
- Do not introduce feature flags, backwards-compatibility shims, or hypothetical-future-use abstractions.
- Do not add error handling for scenarios that cannot happen — trust internal invariants; validate only at boundaries.

### If in doubt

Ask before making destructive changes (renaming exports, dropping runtimes, removing the global attachment, changing the lunar epoch). The library is stable and consumers pin exact versions — semver breakage is expensive.

## License

[MIT](LICENSE) © PPhat <hi@pphat.me>
