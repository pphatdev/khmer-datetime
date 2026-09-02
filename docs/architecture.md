# Architecture

High-level structure of the source tree and how the pieces fit together.

## File Map

```
src/
├── index.ts                    # Public entry: `FormatDateTime` class + `KhmerDate` re-export
├── config/
│   ├── constants.ts            # Khmer month/weekday/animal-year/era-year/digit tables
│   └── tokens.ts               # PATTERNS regex map + generateTokens(date, format, locale)
├── lunar/
│   ├── index.ts                # Barrel export for the lunar subsystem
│   ├── khmer-date.ts           # `KhmerDate` class + `findLunarDate()` solver
│   ├── calculator.ts           # Traditional Khmer astronomical formulas
│   ├── khmer-formatter.ts      # String rendering for lunar dates + Khmer numeric helpers
│   └── soriyatra-lerng-sak.ts  # Deep New-Year astronomical calculations
└── utils/
    └── utils.ts                # Higher-level helpers (not currently re-exported)

test/
├── node/index.test.ts          # Vitest suite
└── deno/index.test.ts          # Deno test suite (near-duplicate)

dist/                           # Build output — populated by `npm run build`
├── index.js                    # CJS
├── index.mjs                   # ESM
├── index.global.js             # IIFE (CDN)
├── index.d.ts / index.d.mts    # TypeScript declarations
```

## Two Independent Systems

The library contains two loosely coupled subsystems that meet at exactly one point.

### 1. Solar / Localized Formatting

- **Entry**: `FormatDateTime.formatDate()` in `src/index.ts`
- **Core**: `generateTokens(date, format, locale)` in `src/config/tokens.ts`
- **Support**: `Constants` in `src/config/constants.ts`

**Flow** (single `formatDate()` call):

```
┌────────────────────────────────┐
│ new FormatDateTime(d, fmt, l)  │
└──────────────┬─────────────────┘
               │
               ▼
     ┌─────────────────────┐
     │ formatDate()        │
     └─────────┬───────────┘
               │
               │ 1. isNaN check → "Invalid Date"
               │
               ▼
     ┌─────────────────────────────────────┐
     │ FormatDateTime.tokens(d, fmt, l)    │
     │ = generateTokens(d, fmt, l)         │
     └─────────┬───────────────────────────┘
               │
               │ 2. Build token dict:
               │    - Solar values (unconditional)
               │    - Locale fork (isKm branch)
               │    - Lunar values (only if lunar tokens in fmt)
               │
               ▼
     ┌─────────────────────────────────────┐
     │ keys.sort((a, b) => b.length -      │
     │   a.length)                         │
     └─────────┬───────────────────────────┘
               │
               │ 3. Build alternation regex
               │
               ▼
     ┌─────────────────────────────────────┐
     │ fmt.replace(regex, m => tokens[m])  │
     └─────────┬───────────────────────────┘
               │
               ▼
          formatted string
```

Two locale-dependent branches inside `generateTokens`:

- `isKm = locale.toLowerCase().startsWith('km')` — forks month/weekday/AM-PM/digit rendering.
- Non-Khmer path delegates to `Intl.DateTimeFormat` (for names) and `Intl.NumberFormat` (for digits).

### 2. Khmer Lunar Calendar

- **Entry**: `KhmerDate` in `src/lunar/khmer-date.ts`
- **Solver**: `KhmerDate.findLunarDate(target)` (walks 1900-01-01 UTC epoch to target)
- **Math**: `Calculator` in `src/lunar/calculator.ts` (aharkun, avoman, bodithey, kromthupul, leap detection, era arithmetic, month/year length rules)
- **Rendering**: `KhmerFormatter` in `src/lunar/khmer-formatter.ts` (preset formats + numeric helpers)
- **Deep astronomical helper**: `SoriyatraLerngSak` in `src/lunar/soriyatra-lerng-sak.ts`

**Flow for `KhmerDate#toLunarDate('full')`**:

```
┌───────────────────────────┐
│ new KhmerDate(date)       │
└──────────┬────────────────┘
           │
           ▼
   ┌───────────────────┐
   │ toLunarDate(fmt)  │
   └───────┬───────────┘
           │
           ▼
   ┌──────────────────────────────────┐
   │ KhmerDate.findLunarDate(this)    │
   │ → { day, month, epochMoved }     │
   └───────┬──────────────────────────┘
           │
           ▼
   ┌──────────────────────────────────┐
   │ KhmerFormatter.format(           │
   │   { day, month, dateTime }, fmt  │
   │ )                                │
   └───────┬──────────────────────────┘
           │
           │ Preset match: full/medium/short
           │ Otherwise: parseCustomFormat → generateTokens (km-KH forced)
           │
           ▼
       lunar string
```

### The One Bridge

`generateTokens(date, format, locale)` checks:

```typescript
if (/(BBBB|JJJJ|lA|lE|lM|ldd|ld|lN|ln|lW|lw)/.test(format)) {
  // Run KhmerDate.findLunarDate + Calculator helpers
  // Merge lunar tokens into the returned dict
}
```

If **any** lunar token appears in the format string, it runs the lunar solver and merges results into the returned dictionary. If no lunar token appears, no lunar work happens — solar formatting stays cheap (no epoch walk, no calculator calls).

This is why `new FormatDateTime(date, 'YYYY-MM-dd').formatDate()` doesn't touch the lunar subsystem at all.

## Why Longest-Token-First Matters

The regex is built as:

```typescript
new RegExp(keys.sort((a, b) => b.length - a.length).join('|'), 'g')
```

Without the longest-first sort, adjacent tokens overlap:

| Format | Wrong result | Right result |
| --- | --- | --- |
| `MMMM` | `MM` + `MM` (two months concatenated) | `MMMM` (full month name) |
| `MMM` | `MM` + `M` | `MMM` (short month) |
| `hh` | `h` + `h` (single-digit hour twice) | `hh` (2-digit hour) |
| `ldd` | `ld` + `d` | `ldd` (2-digit lunar day) |
| `ZZ` | `Z` + `Z` | `ZZ` (offset with seconds) |

Any new token added to `PATTERNS` must not break this invariant. Because the sort happens on the runtime `Object.keys()` at token-generation time, you don't need to declare tokens in any particular order — but never change the sort comparator.

## Why `.ts` Extensions in Imports

Every intra-repo import uses the `.ts` extension:

```typescript
import { PATTERNS, generateTokens } from './config/tokens.ts';
import { KhmerDate } from './lunar/khmer-date.ts';
```

This is required because:

- **Deno consumers** pull `src/index.ts` directly from JSR — Deno requires explicit extensions in imports.
- **tsup** + `tsconfig.json` (`allowImportingTsExtensions: true`, `moduleResolution: "bundler"`, `emitDeclarationOnly: true`) tolerate the `.ts` suffix and let esbuild strip it at bundle time.

Removing the `.ts` extension would break Deno users. Do not "clean up" this pattern.

## Timezone Handling in the Solver

`findLunarDate()` normalizes the target date to UTC 12:00:00 (`Date.UTC(y, m, d, 12, 0, 0)`) before any day-counting. This anchors calculations to the local calendar day even when the raw `Date` is close to a UTC boundary. Concretely:

- Input: `new Date(2026, 6, 13)` — in `+07:00`, this is `2026-07-12T17:00:00Z`
- Normalized: `2026-07-13T12:00:00Z`
- Solver: day-count from epoch to normalized value → stable, timezone-independent lunar answer

If you extend the solver, preserve this normalization or you'll reintroduce off-by-one bugs across timezones.

## Caching

`KhmerDate.getKhNewYearMoment(year)` caches results in the static `khNewYearCache: Record<number, Date>`. The cache is per-class and lives for the lifetime of the process. Given that `getKhNewYearMoment` is called from `Calculator.getJolakSakarajYear` and `Calculator.getAnimalYear` (both invoked inside `generateTokens` when lunar tokens are present), this cache matters in tight loops:

```typescript
// Without cache: 1000 * 2 recomputations of the 2026 new year moment
// With cache:    1000 * 2 dictionary lookups
for (let i = 0; i < 1000; i++) {
  new FormatDateTime(new Date(2026, 6, i % 30 + 1), 'BBBB').formatDate();
}
```

There is no cache for `findLunarDate` itself — each call re-walks from the 1900 epoch. If you're hot-looping over many dates in the same year, consider computing the lunar dates once and reusing them.

## Not Re-Exported

`src/lunar/index.ts` exports `Calculator`, `KhmerDate`, `KhmerFormatter`, `SoriyatraLerngSak`, but `src/index.ts` only re-exports `KhmerDate`.

- **npm consumers** cannot deep-import (only `dist/` ships). This is intentional — it keeps the npm API surface small.
- **JSR/Deno consumers** *can* reach the internal classes by importing them at their file paths:

  ```typescript
  import { Calculator } from 'jsr:@pphatdev/format-datetime/src/lunar/calculator.ts';
  ```

  This is not a supported public API and may change without a semver bump.

If you find yourself needing `Calculator` on npm, open an issue — it may indicate a missing convenience method on `KhmerDate`.

## Global Attachment (Intentional Side Effect)

The final statement of `src/index.ts`:

```typescript
if (typeof globalThis !== "undefined") {
  (globalThis as typeof globalThis & { FormatDateTime?: typeof FormatDateTime }).FormatDateTime = FormatDateTime;
}
```

Exists so the IIFE CDN bundle exposes `FormatDateTime` as a bare identifier in browsers. Do **not** remove when refactoring — it also runs harmlessly in module environments.

For the IIFE bundle, this is in addition to tsup's `--global-name FormatDateTimeBundle`, so **both** globals are available after loading the CDN script:

```html
<script src="https://unpkg.com/@pphatdev/format-datetime"></script>
<script>
  FormatDateTime === FormatDateTimeBundle;   // true
</script>
```

## Sequence Diagram: A Full Lunar Format

Consider `new FormatDateTime(new Date(2026, 6, 13), 'lW ldd lN lM').formatDate()`:

```
User             FormatDateTime      generateTokens        KhmerDate         Calculator
 │                    │                    │                    │                   │
 ├───new(...)────────>│                    │                    │                   │
 │                    │ .date, .format, .locale set             │                   │
 │                    │                    │                    │                   │
 ├───formatDate()────>│                    │                    │                   │
 │                    │──────tokens(d,f,l)────>│                │                   │
 │                    │                    │                    │                   │
 │                    │                    │ (regex tests lunar tokens present)     │
 │                    │                    │                    │                   │
 │                    │                    ├───findLunarDate(d)─>│                  │
 │                    │                    │                    │                   │
 │                    │                    │                    │──getMaybeBEYear─>│
 │                    │                    │                    │<─────────────────│
 │                    │                    │                    │──getNumberOfDayInKhmerYear─>│
 │                    │                    │                    │<─────────────────│
 │                    │                    │                    │  (year walk, month walk)   │
 │                    │                    │                    │                   │
 │                    │                    │<──{day,month,...}──│                   │
 │                    │                    │                    │                   │
 │                    │                    ├───getBEYear(d)─────────>│              │
 │                    │                    │                    │    ├─getKhNewYearMoment─>│
 │                    │                    │                    │    │<──── (cached) ──────│
 │                    │                    │                    │    │─getVisakhaBochea──>│
 │                    │                    │                    │    │<────────────────────│
 │                    │                    │<─────BE year──────────────│              │
 │                    │                    │                    │                   │
 │                    │                    │  (assemble lunar dict entries)         │
 │                    │                    │                    │                   │
 │                    │<──token dict───────│                    │                   │
 │                    │                    │                    │                   │
 │                    │ (sort keys longest-first, build regex, replace)             │
 │                    │                    │                    │                   │
 │<──"ចន្ទ ១៣ រោច..."─│                    │                    │                   │
```

## Extending the Library

If you want to add a new token (say, week-of-year `WW`):

1. Add its regex to `PATTERNS` in `src/config/tokens.ts`:
   ```typescript
   "WW": "(?<WW>\\d{2})",
   ```
2. Compute its value inside `generateTokens`:
   ```typescript
   const weekOfYear = getWeekOfYear(date);   // your implementation
   ```
3. Add it to the returned dict:
   ```typescript
   return {
     // ... existing tokens
     "WW": formatNum(weekOfYear, 2),
   };
   ```
4. Add tests in both `test/node/index.test.ts` and `test/deno/index.test.ts`.
5. Update `docs/tokens.md`.

For new lunar tokens, also update the regex check `/(BBBB|JJJJ|lA|lE|lM|ldd|ld|lN|ln|lW|lw)/` to include your token, so the lunar branch fires when it's present.

## Performance Notes

- **Solar-only format**: ~5–10 µs per `formatDate()` call on modern hardware. Dominated by `Intl.DateTimeFormat` construction.
- **With lunar tokens**: ~50–200 µs per call, depending on the year distance from the 1900 epoch (each year in the walk adds a constant amount of work).
- **`getKhNewYearMoment` caching**: eliminates ~90% of repeated work in loops. First call for a given year costs ~1 µs; subsequent calls are dictionary lookups.
- **No memoization** on `FormatDateTime` — every `formatDate()` re-runs the pipeline. Cache the result if you're rendering the same triple many times.

## Related Documentation

- [Algorithms](./algorithms.md) — the formulas encoded in `Calculator` and `SoriyatraLerngSak`
- [Token Reference](./tokens.md) — user-facing token list
- [API Reference](./api-reference.md) — full method signatures
- [Lunar Calendar](./lunar-calendar.md) — the concepts these classes implement
