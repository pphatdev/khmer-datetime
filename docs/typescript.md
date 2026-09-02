# TypeScript Guide

The package is authored in TypeScript. tsup emits declaration files (`dist/index.d.ts` and `dist/index.d.mts`) alongside the JS bundles, so TypeScript consumers get full type inference out of the box.

## Import Styles

### Default + named

```typescript
import FormatDateTime, { KhmerDate } from '@pphatdev/format-datetime';
```

### All named

```typescript
import { FormatDateTime, KhmerDate } from '@pphatdev/format-datetime';
```

### Namespace (CJS interop)

```typescript
import * as FD from '@pphatdev/format-datetime';
const dt = new FD.default(new Date());       // default export
const kd = new FD.KhmerDate();
```

### CommonJS require

```typescript
const { FormatDateTime, KhmerDate, default: FD } = require('@pphatdev/format-datetime');
// `FormatDateTime` and `FD` refer to the same class
```

## Type Signatures

### `FormatDateTime`

```typescript
export class FormatDateTime {
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

### `KhmerDate`

```typescript
export class KhmerDate {
  protected dateTime: Date;
  protected static khNewYearCache: Record<number, Date>;

  constructor(date?: string | Date | number | null);

  static create(date?: string | Date | number | null): KhmerDate;
  static createFromDate(dateTime: Date): KhmerDate;

  static findLunarDate(target: Date): {
    day: number;
    month: number;
    epochMoved: Date;
  };
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

  format(_format: string): string;      // placeholder
  add(_interval: string): this;         // placeholder
  subtract(_interval: string): this;    // placeholder
}
```

## Type-Only Utilities

There are no exported utility types (`type` / `interface` declarations at the package boundary). If you need type-safe format strings or token unions, define them locally:

### Union of Supported Tokens

```typescript
type SolarToken =
  | 'YYYY' | 'yyyy' | 'YY' | 'yy'
  | 'MMMM' | 'MMM' | 'MM' | 'M'
  | 'DDDD' | 'DDD' | 'DD' | 'D'
  | 'dd' | 'd'
  | 'HH' | 'H' | 'hh' | 'h'
  | 'mm' | 'm' | 'ss' | 's'
  | 'A' | 'a' | 'aA'
  | 'Z' | 'ZZ' | 'z' | 'zz';

type LunarToken =
  | 'BBBB' | 'JJJJ'
  | 'lA' | 'lE' | 'lM'
  | 'ldd' | 'ld' | 'lN' | 'ln'
  | 'lW' | 'lw';

type Token = SolarToken | LunarToken;
```

### Preset Union

```typescript
type LunarPreset = 'full' | 'medium' | 'short';
type LocaleTag = 'en-US' | 'km-KH' | 'fr-FR' | 'ja-JP' | 'zh-CN' | 'ar-EG' | (string & {});
```

The `(string & {})` trick preserves editor autocomplete for the known values while allowing any string.

## Interfaces from Source-Only Modules

If you're consuming the library on Deno / JSR and importing the internal classes directly, these interfaces are available:

### From `src/lunar/khmer-formatter.ts`

```typescript
export interface LunarDateData {
  day: number;
  month: number;
  dateTime: Date;
}
```

### From `src/lunar/soriyatra-lerng-sak.ts`

```typescript
export interface LunarDateLerngSak {
  day: number;
  month: number;
}

export interface NewYearDaySotin {
  sotin: number;
  angsar: number;
  avaman: number;
}

export interface NewYearTime {
  hour: number;
  minute: number;
}

export interface SoriyatraLerngSakInfo {
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
```

### From `src/utils/utils.ts`

```typescript
export interface KhmerLunarDayInfo {
  day: number;
  count: number;
  moonStatus: number;
  formatted: string;
}

export interface LunarDayOccurrence {
  gregorian: string;
  khmer: string;
  month: number;
}

export interface KhmerDateDiff {
  days: number;
  years: number;
  months: number;
  gregorian_diff: number;
  is_past: boolean;
}

export interface BuddhistHoliday {
  name: string;
  name_en: string;
  date: string;
  khmer_date: string;
}

export interface SeasonInfo {
  name: string;
  name_en: string;
}
```

## Strictness

The package's own `tsconfig.json` sets:

```json
{
  "target": "es2017",
  "module": "esnext",
  "moduleResolution": "bundler",
  "allowImportingTsExtensions": true,
  "emitDeclarationOnly": true,
  "declaration": true,
  "strict": true,
  "esModuleInterop": true,
  "skipLibCheck": true,
  "forceConsistentCasingInFileNames": true
}
```

Consumers with looser strictness will still get correct types. Consumers with stricter settings (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) should not see any issues — the public API surface uses only well-typed returns.

## Common Type Patterns

### Type-safe wrapper

```typescript
import FormatDateTime from '@pphatdev/format-datetime';

interface FormatOptions {
  date?: Date;
  format?: string;
  locale?: 'en-US' | 'km-KH';
}

export function formatDate({ date, format, locale = 'en-US' }: FormatOptions = {}): string {
  return new FormatDateTime(date ?? new Date(), format, locale).formatDate();
}
```

### Discriminated union of presets and custom formats

```typescript
type LunarFormatArg = { kind: 'preset'; value: 'full' | 'medium' | 'short' } | { kind: 'custom'; value: string };

function formatLunar(date: Date, arg: LunarFormatArg): string {
  return new FormatDateTime(date).formatLunarDate(arg.value);
}
```

### React hook

```typescript
import { useMemo } from 'react';
import FormatDateTime from '@pphatdev/format-datetime';

export function useFormatted(date: Date, format: string, locale = 'en-US'): string {
  return useMemo(() => new FormatDateTime(date, format, locale).formatDate(), [date, format, locale]);
}
```

## Ambient Global Type

The IIFE bundle attaches `FormatDateTime` to `globalThis`. If you're writing TypeScript for a CDN-loaded page, declare the global:

```typescript
declare global {
  const FormatDateTime: typeof import('@pphatdev/format-datetime').FormatDateTime;
}

export {};
```

Then `FormatDateTime` is available with full type inference in any browser file.

## Common Mistakes

- **Passing month as 1-indexed**: `new Date(2026, 7, 13)` is *August* 13. Use `new Date(2026, 6, 13)` for July.
- **Assuming `formatDate()` throws on invalid input**: It returns the string `"Invalid Date"`. If your downstream code expects a `Date`-like string, add a validity check first.
- **Deep-importing from npm**: `import { Calculator } from '@pphatdev/format-datetime/src/lunar/calculator.ts'` **does not work** on npm — only `dist/index.mjs` ships. This works on Deno/JSR.
- **Confusing internal `day` (0–29) with display count (1–15)**: `khDay()` returns the internal index. Wrap it in `Calculator.getKhmerLunarDay(day)` for the display pair.
