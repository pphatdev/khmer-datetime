# FAQ

## General

### What is this library for?

Formatting dates and times as localized strings using native `Intl` — with special care for **Khmer**, including Khmer digits, six time-of-day phrases, and the full Khmer lunar calendar (Buddhist Era, Jolak Sakaraj, animal years, waxing/waning moon, Moha Songkran).

### Does it work outside of Khmer?

Yes. For non-Khmer locales, it delegates to `Intl.DateTimeFormat` and `Intl.NumberFormat`, so any locale your runtime supports works — `en-US`, `fr-FR`, `ja-JP`, `zh-CN`, `ar-EG`, `th-TH`, etc.

### Why not use `date-fns` or `dayjs`?

Use those if you don't need Khmer or a lunar calendar. This library is complementary — its tokens are compatible-ish (`YYYY`, `MMMM`, `hh`, `A`) but the value-add is the Khmer support and lunar arithmetic.

### Does it have dependencies?

Zero runtime dependencies. Dev-only: `tsup`, `typescript`, `vitest`, `@types/node`.

### How big is it?

- Solar-only usage: ~4 KB minified+gzipped
- With lunar: ~8 KB minified+gzipped

Tree-shakable (`sideEffects: false` in `package.json`).

## Installation & Setup

### Which Node versions are supported?

**Node ≥ 20.0.0**. Enforced via `engines` in `package.json`. CI runs against 20, 22, 24, and 26.

### How do I use it on Deno?

```bash
deno add @pphatdev/format-datetime
```

Deno pulls raw TypeScript from JSR. No build step involved. See [Runtimes](./runtimes.md#deno).

### Does it work in Cloudflare Workers?

Yes. No Node compat flag needed — the library uses only `Intl`, `Date`, and language builtins. See [Runtimes](./runtimes.md#cloudflare-workers).

### Does it work in React Native / Expo?

Yes, provided Hermes ≥ 0.72 for full `Intl.NumberFormat` support with `numberingSystem: 'khmr'`. Older Hermes still produces correct output because the library has a character-remap fallback via `Constants.KHMER_NUMBERS`.

## Usage

### Why is my month one off?

JavaScript `Date` months are **0-indexed**. `new Date(2026, 6, 13)` is July 13, not June 13. This is not a library bug — it's the underlying `Date` API.

### Why does `formatDate()` return `"Invalid Date"`?

The underlying `Date` object is invalid. Check with `isNaN(dt.date.getTime())`. Common causes:

- Passing an unparseable string: `new Date('this is not a date')`
- Overflow: `new Date('99999-01-01')` on some runtimes

The library returns a string sentinel instead of throwing, so downstream code doesn't crash on bad input.

### Why don't I get Khmer output?

Check `locale`. The Khmer branch triggers on `locale.toLowerCase().startsWith('km')`:

```typescript
new FormatDateTime(new Date(), 'MMMM', 'km-KH').formatDate();   // "កក្កដា"
new FormatDateTime(new Date(), 'MMMM', 'KM-KH').formatDate();   // "កក្កដា" (casing OK)
new FormatDateTime(new Date(), 'MMMM', 'km').formatDate();      // "កក្កដា"
new FormatDateTime(new Date(), 'MMMM').formatDate();            // "July" (default en-US)
```

### How do I get just the Khmer digits without any date logic?

```typescript
import { KhmerDate } from '@pphatdev/format-datetime';

KhmerDate.arabicToKhmerNumber('12345');   // "១២៣៤៥"
KhmerDate.getKhmerNumber(2026);           // "២០២៦"
```

### How do I display a Khmer New Year countdown?

```typescript
import FormatDateTime, { KhmerDate } from '@pphatdev/format-datetime';

function countdown(): string {
  const now = new Date();
  const currentYearNy = KhmerDate.getKhNewYearMoment(now.getFullYear());
  const target = now < currentYearNy
    ? currentYearNy
    : KhmerDate.getKhNewYearMoment(now.getFullYear() + 1);

  const msRemaining = target.getTime() - now.getTime();
  const days = Math.floor(msRemaining / 86_400_000);
  const targetFmt = new FormatDateTime(target, 'DDDD, MMMM d, YYYY hh:mm A', 'km-KH');
  return `${days} ថ្ងៃ ដល់ ${targetFmt.formatDate()}`;
}
```

### Can I format past/future dates?

Yes. The lunar solver handles dates before and after the 1900-01-01 UTC epoch (walks forward or backward as needed). Practical range: ~1500 CE to ~2500 CE holds well; extreme dates may drift from historical Khmer records.

### How do I add days to a `KhmerDate`?

The built-in `add()` and `subtract()` methods are placeholders — they do nothing. Do arithmetic on the underlying `Date`:

```typescript
const kd = new KhmerDate(new Date(2026, 6, 13));
const nextDay = new KhmerDate(new Date(kd.getDateTime().getTime() + 86_400_000));
nextDay.toLunarDate('short');   // one day later
```

## Lunar Calendar

### Why is `khDay()` returning something different from the display?

`khDay()` returns the **internal** day index (0–29). The display uses a count of 1–15 plus a waxing/waning half indicator. Convert with:

```typescript
import { KhmerDate } from '@pphatdev/format-datetime';
// (Calculator is not exported from npm — this is a Deno-only import)

const kd = new KhmerDate(new Date(2026, 6, 13));
const internalDay = kd.khDay();     // e.g. 13
// Display equivalent: `${(internalDay % 15) + 1}${internalDay > 14 ? 'រោច' : 'កើត'}`
// → "14កើត"
```

Or just use `toLunarDate('short')` which does this for you.

### Why does the same date give a different Buddhist Era year in January vs July?

The BE year changes on **Visakha Bochea** (full moon of Pisakha, ~mid-May), not on January 1. Before VB: `Gregorian + 543`. On/after VB: `Gregorian + 544`. So January 2026 is BE 2569 but July 2026 is BE 2570.

If you want the "civil" BE (which changes on January 1), use `Gregorian + 543` naively.

### Why does the Khmer New Year jump between April 13 and 14?

Traditional Khmer astronomy uses a 365.25-day year, so the New Year moment drifts ~6 hours later each year. Every ~4 years the drift crosses midnight, so the day flips. On Gregorian leap years, the day lands on April 13; otherwise April 14. See [Algorithms](./algorithms.md#khmer-new-year-getkhnewyearmomentgregorianyear).

### Is the calendar accurate?

For dates within a few centuries of the 2026 anchor (~1500–2500 CE), yes — matches traditional Khmer records and the royal almanac. For extreme dates (far past or far future), small drifts accumulate; the traditional Soriyatra system itself is an approximation of the true tropical year.

### Where does the algorithm come from?

Traditional Khmer horologia (Soriyatra), same lineage as the Thai calendar. Directly ported from [PPhatDev/LunarDate](https://github.com/PPhatDev/LunarDate) (PHP) and [momentkh](https://github.com/ThyrithSor/momentkh) (JS). See [Algorithms](./algorithms.md) for formula-level detail.

## Tokens

### Why does `A` and `a` produce the same output in Khmer?

Khmer script has no case. Both AM/PM tokens produce the same phrase (e.g. `រសៀល`).

### Can I escape token characters to output them literally?

No formal escape mechanism. Because tokens require specific character sequences (`YYYY`, `MMMM`, etc.), you can usually just insert punctuation between token-like letters and other letters. For example, `'Year: YYYY'` works fine because `Y` alone isn't a token pattern.

Trouble spots: the letter `m` (`'YYYYmm'` would render `mm` as minutes — use a separator: `'YYYY-mm'`).

### What's the difference between `Z` and `z`?

Both are timezone offsets. `Z` uses ISO 8601 format with colon (`+07:00`); `z` is compact (`+0700`). See [tokens](./tokens.md#timezone-offset).

### Why is my `MMM` (short month) returning the same as `MMMM` in Khmer?

The Khmer month table doesn't have a distinct short form. `MMMM` and `MMM` both produce `កក្កដា` for July. If you want abbreviated Khmer month names, you'd need to maintain your own mapping.

## Performance

### How fast is it?

- Solar-only format: ~5–10 µs per call
- With lunar: ~50–200 µs per call (depends on distance from 1900 epoch)

If you're rendering the same date many times, cache the string. If you're rendering many dates in a hot loop, prefer looping and reassigning `dt.date` rather than constructing a new formatter each time.

### Does it cache anything?

Only `KhmerDate.getKhNewYearMoment(year)` results — cached per Gregorian year on the class. The lunar solver (`findLunarDate`) does not cache; each call re-walks from the 1900 epoch.

### Is it thread-safe / Worker-safe?

Yes — no mutable module-level state except the `khNewYearCache` (which is idempotent — repeated writes produce the same value).

## Testing

### How do I mock the current date?

Use your test runner's fake-timers utility:

```typescript
// Vitest
import { vi } from 'vitest';
vi.useFakeTimers().setSystemTime(new Date('2026-07-13T14:30:00Z'));

const dt = new FormatDateTime();   // uses the fake now
```

### The Deno test suite is nearly identical to the Node one. Why?

To keep both runtimes independently verified. Node uses Vitest; Deno uses `@std/testing` + `@std/expect`. A behavioral test typically wants to live in both — if you fix a bug, add tests to both suites.

## Publishing / Contributing

### How is this published?

Two channels from the same source:

- **npm**: pre-built `dist/` via `.github/workflows/npm-publish.yml`
- **JSR**: raw `src/` via `.github/workflows/jsr.yml`

Version bumps must be applied to `package.json`, `deno.json`, and `jsr.json` together.

### Can I contribute?

Yes. Open a PR against `master`. CI runs `npm run build` and `npm run test` (Node 20/22/24/26 + Deno). New tokens or behavior should be tested in both `test/node/` and `test/deno/`.

### Is there a Discord / Slack?

No. Use GitHub Issues at [pphatdev/khmer-datetime](https://github.com/pphatdev/khmer-datetime/issues).

## Miscellaneous

### Why is `defualtPatterns` misspelled?

Historical typo preserved for backwards compatibility. Don't rename it.

### Why is `KhmerDate.arabicToKhmerNumber` a static? Wouldn't a top-level function be cleaner?

Because the port originated from PHP where these were static class methods. Kept as-is to preserve API shape across ports.

### Are there Buddhist holidays included?

`Utils.getBuddhistHolidays(year)` returns Visakha Bochea and Khmer New Year for now. Not re-exported from npm — Deno/JSR consumers can reach it at `src/utils/utils.ts`.

### What's the difference between `formatDate()` and `formatLunarDate()`?

`formatDate()` uses the general token pipeline — solar and lunar tokens both work. `formatLunarDate(preset)` is a shortcut that always returns a Khmer lunar string, accepting either a preset (`'full'`, `'medium'`, `'short'`) or a custom token pattern. Under the hood, `formatLunarDate(fmt)` calls `new KhmerDate(this.date).toLunarDate(fmt)`.
