# API Reference

The public API surface exported from `@pphatdev/format-datetime` is intentionally small:

```typescript
import FormatDateTime, { KhmerDate } from '@pphatdev/format-datetime';
// or
import { FormatDateTime, KhmerDate } from '@pphatdev/format-datetime';
```

Both `FormatDateTime` and `KhmerDate` are named exports; `FormatDateTime` is also the default export.

For Deno / JSR users, the following classes are additionally reachable at their file paths, but are **not part of the stable public API** (may change without a semver bump): `Calculator`, `KhmerFormatter`, `SoriyatraLerngSak`, `Utils`. See [Architecture](./architecture.md) for details.

---

## `FormatDateTime`

Wraps a `Date` and formats it against a token-based pattern and a BCP 47 locale.

### Class Signature

```typescript
class FormatDateTime {
  static patterns: Record<string, string>;
  static defualtPatterns: string[];

  public date: Date;
  public format: string;
  public locale: string;

  constructor(
    date?: string | Date | null,
    format?: string | null,
    locale?: string
  );

  static tokens(date: Date, format: string, locale: string): Record<string, string>;

  formatDate(): string;
  formatLunarDate(format?: string): string;
  toString(): string;
}
```

### Constructor

```typescript
new FormatDateTime(
  date?: string | Date | null,
  format?: string | null,
  locale?: string
)
```

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `date` | `string \| Date \| null` | `new Date()` | Strings are parsed via `new Date(str)`. Invalid strings survive here but return `"Invalid Date"` from `formatDate()`. `Date` instances are stored by reference, not cloned. |
| `format` | `string \| null` | `"dd-MM-yyyy hh:mm:ss"` | Any pattern using [tokens](./tokens.md). Empty string is treated as-is (produces empty output). |
| `locale` | `string` | `"en-US"` | Anything `Intl.DateTimeFormat` accepts. Khmer detection is `locale.toLowerCase().startsWith('km')`. |

Behavior for `date`:

```typescript
new FormatDateTime()                          // now
new FormatDateTime(null)                      // now
new FormatDateTime(undefined)                 // now
new FormatDateTime(new Date(2026, 6, 13))     // that Date
new FormatDateTime('2026-07-13')              // parsed via new Date()
new FormatDateTime('not-a-date')              // stored as Invalid Date
```

### Instance Properties

- **`date: Date`** — the resolved `Date` instance (mutable).
- **`format: string`** — the token pattern (mutable).
- **`locale: string`** — the BCP 47 locale tag (mutable).

All three are public and re-read on every `formatDate()` call, so you can reconfigure and re-format without constructing a new instance:

```typescript
const dt = new FormatDateTime(new Date(2026, 6, 13));
dt.format = 'YYYY';         dt.formatDate(); // "2026"
dt.format = 'MMMM';         dt.formatDate(); // "July"
dt.locale = 'km-KH';        dt.formatDate(); // "កក្កដា"
dt.date = new Date(2027, 0, 1);
dt.formatDate();            // now for Jan 1, 2027 in km-KH
```

### `formatDate(): string`

Runs the token pipeline and returns the formatted string. Returns the literal string `"Invalid Date"` (not a thrown error) if the underlying `Date` is invalid.

Internally:

1. `isNaN(this.date.getTime())` → early exit with `"Invalid Date"`.
2. `FormatDateTime.tokens(this.date, this.format, this.locale)` → `Record<string, string>`.
3. `Object.keys(tokens).sort((a, b) => b.length - a.length)` → tokens ordered longest-first.
4. `new RegExp(sortedKeys.join('|'), 'g')` → single alternation regex.
5. `this.format.replace(regex, m => tokens[m])` → final string.

```typescript
new FormatDateTime('2026-07-13', 'DDDD, MMMM d, YYYY', 'en-US').formatDate();
// "Monday, July 13, 2026"
```

### `formatLunarDate(format?: string): string`

Shorthand for `new KhmerDate(this.date).toLunarDate(format)`. Accepts either a preset (`'full'`, `'medium'`, `'short'`) or a custom lunar token pattern. Defaults to `'full'`.

Returns `"Invalid Date"` if the underlying `Date` is invalid.

```typescript
new FormatDateTime(new Date(2026, 6, 13)).formatLunarDate('full');
// "ថ្ងៃចន្ទ ១៣រោច ខែបឋមាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០"

new FormatDateTime(new Date(2026, 6, 13)).formatLunarDate('short');
// "១៣រោច ខែបឋមាសាឍ"

new FormatDateTime(new Date(2026, 6, 13)).formatLunarDate('medium');
// "១៣រោច ខែបឋមាសាឍ ព.ស. ២៥៧០"

new FormatDateTime(new Date(2026, 6, 13)).formatLunarDate('lW ldd lN lM');
// "ចន្ទ ១៣ រោច បឋមាសាឍ"
```

### `toString(): string`

Alias for `formatDate()`. Enables implicit string coercion:

```typescript
const dt = new FormatDateTime(new Date(2026, 0, 1), 'YYYY');
`${dt}`;              // "2026"
String(dt);           // "2026"
'Year: ' + dt;        // "Year: 2026"
```

### Static: `FormatDateTime.patterns`

```typescript
static patterns: Record<string, string>
```

The `PATTERNS` regex-fragment map used internally (from `src/config/tokens.ts`). Maps token names to regex source fragments — useful only if you're building a **parser** (reversing formatted output back to date parts), which the library itself does not do.

```typescript
FormatDateTime.patterns['YYYY']  // "(?<YYYY>\\d{4})"
FormatDateTime.patterns['MMMM']  // "(?<MMMM>[a-zA-Z]{4})"
FormatDateTime.patterns['lM']    // "(?<lM>[\\u1780-\\u17FF]+)"
```

### Static: `FormatDateTime.defualtPatterns`

```typescript
static defualtPatterns: string[]
```

An array whose first entry is the default format string (`"dd-MM-yyyy hh:mm:ss"`). The typo (`defualt` instead of `default`) is preserved for backwards compatibility — do not rename in-place.

### Static: `FormatDateTime.tokens(date, format, locale)`

```typescript
static tokens(
  date: Date,
  format: string,
  locale: string
): Record<string, string>
```

Direct access to the internal `generateTokens()` function from `src/config/tokens.ts`. Returns the token → localized-value dictionary for a given date/format/locale triple. Useful for building custom format pipelines that reuse the same token semantics.

```typescript
const tokens = FormatDateTime.tokens(new Date(2026, 6, 13), 'YYYY', 'km-KH');
tokens['YYYY'];  // "២០២៦"
tokens['MMMM'];  // "កក្កដា"
tokens['DDDD'];  // "ចន្ទ"
```

Note: lunar tokens are only computed if the `format` string contains at least one lunar token pattern (`BBBB`, `JJJJ`, `lA`, `lE`, `lM`, `ldd`, `ld`, `lN`, `ln`, `lW`, `lw`). Otherwise those entries are absent from the returned dictionary.

---

## `KhmerDate`

Full Khmer lunar calendar wrapper. Constructs from a `Date`, string, Unix seconds, or `null` (current time).

### Class Signature

```typescript
class KhmerDate {
  protected dateTime: Date;
  protected static khNewYearCache: Record<number, Date>;

  constructor(date?: string | Date | number | null);

  static create(date?: string | Date | number | null): KhmerDate;
  static createFromDate(dateTime: Date): KhmerDate;
  static findLunarDate(target: Date): { day: number; month: number; epochMoved: Date };
  static getKhNewYearMoment(gregorianYear: number): Date;
  static getKhmerMonthNames(): string[];
  static getAnimalYearNames(): string[];
  static getEraYearNames(): string[];
  static khmerToArabicNumber(khmerNumber: string): string;
  static arabicToKhmerNumber(arabicNumber: string): string;
  static getKhmerNumber(number: number): string;

  getDateTime(): Date;
  toLunarDate(format?: string | null): string;
  toKhmerDate(format?: string | null): string;
  khDay(): number;
  khMonth(): number;
  khYear(): number;
  getTimestamp(): number;
  copy(): KhmerDate;
  toString(): string;

  format(_format: string): string;    // returns ISO string; placeholder
  add(_interval: string): this;       // no-op placeholder
  subtract(_interval: string): this;  // no-op placeholder
}
```

### Constructor

```typescript
new KhmerDate(date?: string | Date | number | null)
```

| Input | Behavior |
| --- | --- |
| `Date` | Cloned internally (`new Date(date.getTime())`) — mutating the original does **not** affect the `KhmerDate`. |
| `string` | Parsed with `new Date(str)`. |
| `number` | Interpreted as **Unix seconds** (multiplied by 1000). Note: not milliseconds. |
| `null` / omitted | Uses `new Date()`. |
| Any other type | Throws `Error('Invalid date input')`. |

```typescript
new KhmerDate()                          // now
new KhmerDate(new Date(2026, 6, 13))     // cloned
new KhmerDate('2026-07-13T00:00:00')     // parsed
new KhmerDate(1783912800)                // Unix seconds → 2026-07-13 in +07:00
```

### Static Factories

```typescript
KhmerDate.create(date?)           // same as `new KhmerDate(date)`
KhmerDate.createFromDate(date)    // explicitly from a Date instance
```

Both are trivial wrappers around the constructor — use whichever reads clearer at the call site.

### `getDateTime(): Date`

Returns a **defensive copy** of the underlying `Date`. Mutating the returned object does not affect the `KhmerDate` instance:

```typescript
const kd = new KhmerDate(new Date(2026, 6, 13));
const d = kd.getDateTime();
d.setDate(1);                     // does not affect kd
kd.getDateTime().getDate();        // 13
```

### `toLunarDate(format?: string | null): string`

Formats the date using the Khmer lunar calendar. `format` may be:

| Value | Output |
| --- | --- |
| `null` (default) or `'full'` | `"ថ្ងៃចន្ទ ១៣រោច ខែបឋមាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០"` |
| `'medium'` | `"១៣រោច ខែបឋមាសាឍ ព.ស. ២៥៧០"` |
| `'short'` | `"១៣រោច ខែបឋមាសាឍ"` |
| Custom token string | `'lW ldd lN lM'` → `"ចន្ទ ១៣ រោច បឋមាសាឍ"` |

Custom patterns run through the same token pipeline as `FormatDateTime.formatDate()`, with `km-KH` forced as the locale.

### `toKhmerDate(format?: string | null): string`

Formats the **solar** Gregorian date in Khmer script. Uses `{brace}` placeholders (**not** the token system):

| Placeholder | Value |
| --- | --- |
| `{day}` | Day of month in Khmer digits (`១-៣១`) |
| `{month}` | Khmer solar month name (`មករា`…`ធ្នូ`) |
| `{year}` | Year in Khmer digits (e.g. `២០២៦`) |
| `{dayOfWeek}` | Day-of-week number (0–6) in Khmer digits |
| `{dayOfWeekKhmer}` | Full Khmer weekday name (e.g. `ចន្ទ`) |
| `{dayOfWeekShort}` | Short Khmer weekday (e.g. `ច`) |

Default format: `"ទី{day} ខែ{month} ឆ្នាំ{year}"` → `"ទី១៣ ខែកក្កដា ឆ្នាំ២០២៦"`.

```typescript
const kd = new KhmerDate(new Date(2026, 6, 13));
kd.toKhmerDate();
// "ទី១៣ ខែកក្កដា ឆ្នាំ២០២៦"

kd.toKhmerDate('{dayOfWeekKhmer} ទី{day} ខែ{month} ឆ្នាំ{year}');
// "ចន្ទ ទី១៣ ខែកក្កដា ឆ្នាំ២០២៦"
```

Placeholders not present in the format string are simply not substituted. Unknown placeholders are left in place.

### `khDay(): number`

Returns the **internal** lunar day index (0–29). Not the visible day count — feed it into `Calculator.getKhmerLunarDay(day)` to convert to `{count: 1–15, moonStatus: 0|1}`.

```typescript
const kd = new KhmerDate(new Date(2026, 6, 13));
kd.khDay();  // e.g. 13 (internal index)
```

### `khMonth(): number`

Returns the lunar month index (0–13). Values 12 and 13 (`បឋមាសាឍ`, `ទុតិយាសាឍ`) only occur in leap-month years.

### `khYear(): number`

Returns the Buddhist Era (BE) year, computed relative to Visakha Bochea via `Calculator.getBEYear()`.

### `getTimestamp(): number`

Returns **Unix seconds** (`Math.floor(date.getTime() / 1000)`). Symmetric with the `number` constructor input.

### `copy(): KhmerDate`

Returns a new `KhmerDate` with a cloned internal `Date`. Useful before passing to code that mutates.

### `toString(): string`

Alias for `toLunarDate()` with the default `'full'` preset.

```typescript
`${new KhmerDate(new Date(2026, 6, 13))}`
// "ថ្ងៃចន្ទ ១៣រោច ខែបឋមាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០"
```

### Static: `KhmerDate.findLunarDate(target: Date)`

```typescript
static findLunarDate(target: Date): {
  day: number;         // 0-29, internal day index
  month: number;       // 0-13, lunar month index
  epochMoved: Date;    // the epoch cursor after solving
}
```

The raw lunar-date solver — walks from a 1900-01-01 UTC epoch to the target date using astronomical month/year length rules. Input is normalized to UTC noon internally to avoid timezone drift.

Typically you don't call this directly; `toLunarDate()`, `khDay()`, and `khMonth()` all use it.

### Static: `KhmerDate.getKhNewYearMoment(gregorianYear: number): Date`

Returns the exact moment of **Moha Songkran** (Khmer New Year) for the given Gregorian year. Uses a 2026 anchor (14 Apr 2026 10:48 local) and projects forward/backward with a 6-hour-per-year drift on a 365.25-day cycle. On Gregorian leap years, the day is 13 April; otherwise 14 April.

Cached per Gregorian year on the class (`khNewYearCache: Record<number, Date>`).

```typescript
KhmerDate.getKhNewYearMoment(2026);  // 14 Apr 2026 10:48
KhmerDate.getKhNewYearMoment(2027);  // 14 Apr 2027 16:48
KhmerDate.getKhNewYearMoment(2028);  // 13 Apr 2028 22:48 (Gregorian leap)
```

### Static: `KhmerDate.getKhmerMonthNames(): string[]`

Returns the 14 lunar month names in order:

```typescript
[
  'មិគសិរ', 'បុស្ស', 'មាឃ', 'ផល្គុន', 'ចេត្រ',
  'ពិសាខ', 'ជេស្ឋ', 'អាសាឍ', 'ស្រាពណ៍', 'ភទ្របទ',
  'អស្សុជ', 'កត្ដិក', 'បឋមាសាឍ', 'ទុតិយាសាឍ'
]
```

### Static: `KhmerDate.getAnimalYearNames(): string[]`

Returns the 12-year zodiac cycle in order:

```typescript
['ជូត', 'ឆ្លូវ', 'ខាល', 'ថោះ', 'រោង', 'ម្សាញ់', 'មមី', 'មមែ', 'វក', 'រកា', 'ច', 'កុរ']
```

### Static: `KhmerDate.getEraYearNames(): string[]`

Returns the 10 Sak (era) names in order:

```typescript
['សំរឹទ្ធិស័ក', 'ឯកស័ក', 'ទោស័ក', 'ត្រីស័ក', 'ចត្វាស័ក', 'បញ្ចស័ក', 'ឆស័ក', 'សប្តស័ក', 'អដ្ឋស័ក', 'នព្វស័ក']
```

### Static: `KhmerDate.arabicToKhmerNumber(str: string): string`

Digit-swaps `0-9` → `០-៩`. Non-digit characters are left untouched.

```typescript
KhmerDate.arabicToKhmerNumber('12345');           // "១២៣៤៥"
KhmerDate.arabicToKhmerNumber('2026-07-13');      // "២០២៦-០៧-១៣"
KhmerDate.arabicToKhmerNumber('$1,234.56');       // "$១,២៣៤.៥៦"
```

### Static: `KhmerDate.khmerToArabicNumber(str: string): string`

Reverse of the above:

```typescript
KhmerDate.khmerToArabicNumber('១២៣៤៥');           // "12345"
KhmerDate.khmerToArabicNumber('ឆ្នាំ២០២៦');       // "ឆ្នាំ2026"
```

### Static: `KhmerDate.getKhmerNumber(num: number): string`

Convenience wrapper — converts a numeric value to a Khmer digit string:

```typescript
KhmerDate.getKhmerNumber(2026);   // "២០២៦"
KhmerDate.getKhmerNumber(0);      // "០"
KhmerDate.getKhmerNumber(-5);     // "-៥"
```

### Placeholder Methods

The following methods on `KhmerDate` exist for API-shape compatibility with the upstream PHP port but are **stubs**:

- `format(_format: string): string` — returns `this.dateTime.toISOString()` regardless of the argument.
- `add(_interval: string): this` — no-op.
- `subtract(_interval: string): this` — no-op.

Do not depend on these for real date arithmetic. Use `new Date(kd.getDateTime().getTime() + msOffset)` and re-wrap instead.

---

## Source-Only Classes (Deno / JSR)

The following classes exist in `src/lunar/` and `src/utils/` and are exported from `src/lunar/index.ts` for direct source consumption. **They are not re-exported from the package entry** — npm consumers cannot reach them because only `dist/` ships. JSR/Deno consumers can import them at their file paths, but this is not a stable public API.

### `Calculator` (`src/lunar/calculator.ts`)

Traditional Khmer astronomical formulas. All methods are static; all BE-based methods throw `Error('Buddhist Era year must be positive')` for negative input.

```typescript
class Calculator {
  static getAharkun(beYear: number): number;
  static getAharkunMod(beYear: number): number;
  static kromthupul(beYear: number): number;
  static isKhmerSolarLeap(beYear: number): number;              // 0 or 1
  static getBodithey(beYear: number): number;                    // 0-29
  static getAvoman(beYear: number): number;                      // 0-691
  static getBoditheyLeap(beYear: number): number;                // 0, 1, 2, or 3
  static getProtetinLeap(beYear: number): number;                // 0, 1, or 2
  static isKhmerLeapMonth(beYear: number): boolean;
  static isKhmerLeapDay(beYear: number): boolean;
  static isGregorianLeap(adYear: number): boolean;
  static getNumberOfDayInKhmerMonth(beMonth: number, beYear: number): number;    // 29 or 30
  static getNumberOfDayInKhmerYear(beYear: number): number;                       // 354, 355, or 384
  static getNumberOfDayInGregorianYear(adYear: number): number;                   // 365 or 366
  static getBEYear(dateTime: Date): number;
  static getMaybeBEYear(dateTime: Date): number;
  static getVisakhaBochea(gregorianYear: number): Date;
  static getJolakSakarajYear(dateTime: Date): number;
  static getAnimalYear(dateTime: Date): number;                  // 0-11 index
  static getKhmerLunarDay(day: number): { count: number; moonStatus: number };
  static nextMonthOf(khmerMonth: number, beYear: number): number;
}
```

See [Algorithms](./algorithms.md) for the traditional formulas each method encodes.

### `KhmerFormatter` (`src/lunar/khmer-formatter.ts`)

String rendering + Khmer numeric helpers.

```typescript
interface LunarDateData {
  day: number;
  month: number;
  dateTime: Date;
}

class KhmerFormatter {
  toKhmerNumber(number: string): string;
  fromKhmerNumber(khmerNumber: string): string;
  formatNumber(number: number, decimals?: number, thousandsSep?: string): string;
  formatDate(date: Date, format?: 'full' | 'short' | 'medium'): string;
  formatLunarDate(lunarData: LunarDateData, format?: string): string;
  formatCurrency(amount: number, showSymbol?: boolean): string;   // e.g. "១,០០០ រៀល"
  formatTime(time: Date, use24Hour?: boolean): string;
  getDayName(date: Date): string;
  getMonthName(date: Date): string;
  getLunarMonthName(monthIndex: number): string;
  isKhmerText(text: string): boolean;
  formatOrdinal(number: number): string;                          // e.g. "ទី១"

  static format(lunarData: LunarDateData, format?: string | null): string;
}
```

### `SoriyatraLerngSak` (`src/lunar/soriyatra-lerng-sak.ts`)

Deep New-Year astronomical calculations, ported from momentkh's `getSoriyatraLerngSak.js`.

```typescript
interface LunarDateLerngSak { day: number; month: number; }
interface NewYearDaySotin { sotin: number; angsar: number; avaman: number; }
interface NewYearTime { hour: number; minute: number; }

interface SoriyatraLerngSakInfo {
  harkun: number;
  kromathopol: number;
  avaman: number;
  bodithey: number;
  has366day: boolean;
  isAthikameas: boolean;
  isChantreathimeas: boolean;
  jesthHas30: boolean;
  dayLerngSak: number;
  lunarDateLerngSak: LunarDateLerngSak;
  newYearsDaySotins: NewYearDaySotin[];
  timeOfNewYear: NewYearTime;
}

class SoriyatraLerngSak {
  static calculate(jsYear: number): SoriyatraLerngSakInfo;
}
```

Reach for this only if reproducing the full royal almanac. For most needs, `KhmerDate.getKhNewYearMoment(year)` is sufficient.

### `Utils` (`src/utils/utils.ts`)

Higher-level helpers built on top of `Calculator` and `KhmerDate`.

```typescript
interface KhmerLunarDayInfo { day: number; count: number; moonStatus: number; formatted: string; }
interface LunarDayOccurrence { gregorian: string; khmer: string; month: number; }
interface KhmerDateDiff { days: number; years: number; months: number; gregorian_diff: number; is_past: boolean; }
interface BuddhistHoliday { name: string; name_en: string; date: string; khmer_date: string; }
interface SeasonInfo { name: string; name_en: string; }

class Utils {
  static parseKhmerDate(khmerDateString: string): KhmerDate | null;   // stub, returns null
  static getKhmerMonthRange(khmerMonth: number, beYear: number): KhmerLunarDayInfo[];
  static findLunarDayOccurrences(dayCount: number, moonStatus: number, year: number): LunarDayOccurrence[];
  static diffInKhmer(date1: KhmerDate, date2: KhmerDate): KhmerDateDiff;
  static getBuddhistHolidays(year: number): Record<string, BuddhistHoliday>;
  static convertEra(year: number, fromEra: 'AD' | 'BE' | 'JS', toEra: 'AD' | 'BE' | 'JS'): number;
  static isValidKhmerDate(day: number, month: number, beYear: number): boolean;
  static getSeason(date: KhmerDate): SeasonInfo;
}
```

`getBuddhistHolidays` currently returns `visakha_bochea` and `khmer_new_year`; the try/catch silently swallows errors, so partial results are possible for out-of-range years.

`parseKhmerDate` is a stub that returns `null` — do not use for parsing.

---

## Global Attachment

At module load, `src/index.ts` attaches `FormatDateTime` to `globalThis`:

```typescript
if (typeof globalThis !== "undefined") {
  (globalThis as any).FormatDateTime = FormatDateTime;
}
```

This makes the UNPKG `<script>` usage work with no bundler. In server environments it is a benign no-op. Do not depend on the global in application code; prefer explicit `import`.

The tsup IIFE build also exposes the class under the global name `FormatDateTimeBundle`. Both `globalThis.FormatDateTime` and `globalThis.FormatDateTimeBundle` are available after loading the IIFE bundle.
