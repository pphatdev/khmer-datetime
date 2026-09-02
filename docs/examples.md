# Examples

Copy-paste recipes for common formatting tasks.

## Basic Solar Formatting

### ISO-ish date

```typescript
import FormatDateTime from '@pphatdev/format-datetime';

new FormatDateTime(new Date(2026, 6, 13), 'YYYY-MM-dd').formatDate();
// "2026-07-13"
```

### RFC-style with weekday and 12-hour time

```typescript
new FormatDateTime(new Date(2026, 6, 13, 14, 30, 45), 'DDDD, MMMM d, YYYY hh:mm:ss A', 'en-US').formatDate();
// "Monday, July 13, 2026 02:30:45 PM"
```

### 24-hour military time

```typescript
new FormatDateTime(new Date(2026, 6, 13, 14, 30, 45), 'HH:mm:ss').formatDate();
// "14:30:45"
```

### With timezone offset

```typescript
new FormatDateTime(new Date(2026, 6, 13, 14, 30, 45), 'YYYY-MM-ddTHH:mm:ssZ').formatDate();
// e.g. "2026-07-13T14:30:45+07:00"
```

### Compact filename-safe timestamp

```typescript
new FormatDateTime(new Date(), 'YYYYMMdd_HHmmss').formatDate();
// e.g. "20260713_143045" — safe for filenames
```

## Locale Variants

### Khmer full date

```typescript
new FormatDateTime(new Date(2026, 6, 13, 14, 30, 45), 'DDDD, MMMM d, YYYY, hh:mm:ss A', 'km-KH').formatDate();
// "ចន្ទ, កក្កដា ១៣, ២០២៦, ០២:៣០:៤៥ រសៀល"
```

### Just Khmer numerals for year

```typescript
new FormatDateTime(new Date(2026, 0, 1), 'YYYY', 'km-KH').formatDate();
// "២០២៦"
```

### Time-of-day phrase alone

```typescript
new FormatDateTime(new Date(2026, 6, 13, 3, 0, 0), 'a', 'km-KH').formatDate();   // "រំលងអធ្រាត្រ"
new FormatDateTime(new Date(2026, 6, 13, 9, 0, 0), 'a', 'km-KH').formatDate();   // "ព្រឹក"
new FormatDateTime(new Date(2026, 6, 13, 12, 0, 0), 'a', 'km-KH').formatDate();  // "ថ្ងៃត្រង់"
new FormatDateTime(new Date(2026, 6, 13, 14, 0, 0), 'a', 'km-KH').formatDate();  // "រសៀល"
new FormatDateTime(new Date(2026, 6, 13, 18, 0, 0), 'a', 'km-KH').formatDate();  // "ល្ងាច"
new FormatDateTime(new Date(2026, 6, 13, 22, 0, 0), 'a', 'km-KH').formatDate();  // "យប់"
```

### Other locales (Intl-backed)

```typescript
new FormatDateTime(new Date(2026, 6, 13), 'DDDD d MMMM YYYY', 'fr-FR').formatDate();
// "lundi 13 juillet 2026"

new FormatDateTime(new Date(2026, 6, 13, 14, 30), 'DDDD hh:mm A', 'ja-JP').formatDate();
// e.g. "月曜日 02:30 午後"

new FormatDateTime(new Date(2026, 6, 13), 'dd/MM/YYYY', 'ar-EG').formatDate();
// "١٣/٠٧/٢٠٢٦"
```

## Lunar Formatting

### Preset formats via `KhmerDate`

```typescript
import { KhmerDate } from '@pphatdev/format-datetime';

const kd = new KhmerDate(new Date(2026, 6, 13));

kd.toLunarDate('full');
// "ថ្ងៃចន្ទ ១៣រោច ខែបឋមាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០"

kd.toLunarDate('medium');
// "១៣រោច ខែបឋមាសាឍ ព.ស. ២៥៧០"

kd.toLunarDate('short');
// "១៣រោច ខែបឋមាសាឍ"
```

### Custom lunar pattern

```typescript
new KhmerDate(new Date(2026, 6, 13)).toLunarDate('lW ldd lN lM');
// "ចន្ទ ១៣ រោច បឋមាសាឍ"

new KhmerDate(new Date(2026, 6, 13)).toLunarDate('ថ្ងៃlW lddlN ឆ្នាំlA lE ព.ស. BBBB');
// "ថ្ងៃចន្ទ ១៣រោច ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០"
```

### Mixing solar and lunar tokens in one string

```typescript
new FormatDateTime(new Date(2026, 6, 13), 'YYYY-MM-dd (BBBB) lM ld lN lA lE').formatDate();
// "2026-07-13 (2570) បឋមាសាឍ 14 រោច មមី អដ្ឋស័ក"
```

### Combining lunar + Khmer solar

```typescript
const kd = new KhmerDate(new Date(2026, 6, 16));
`${kd.toLunarDate('full')} ត្រូវនឹងថ្ងៃ${kd.toKhmerDate()}`;
// "ថ្ងៃព្រហស្បតិ៍ ២កើត ខែទុតិយាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០ ត្រូវនឹងថ្ងៃទី១៦ ខែកក្កដា ឆ្នាំ២០២៦"
```

### Solar Khmer with custom placeholders

```typescript
const kd = new KhmerDate(new Date(2026, 6, 13));
kd.toKhmerDate('{dayOfWeekKhmer} ទី{day} ខែ{month} ឆ្នាំ{year}');
// "ចន្ទ ទី១៣ ខែកក្កដា ឆ្នាំ២០២៦"

kd.toKhmerDate('{day}/{month}/{year}');
// "១៣/កក្កដា/២០២៦"
```

## Khmer New Year

### Full New Year announcement

```typescript
import FormatDateTime, { KhmerDate } from '@pphatdev/format-datetime';

const ny = KhmerDate.getKhNewYearMoment(2026);
const kd = new KhmerDate(ny);

`${kd.toLunarDate('full')} ត្រូវនឹងថ្ងៃ${kd.toKhmerDate()}`;
// "ថ្ងៃអង្គារ ១២រោច ខែចេត្រ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៦៩ ត្រូវនឹងថ្ងៃទី១៤ ខែមេសា ឆ្នាំ២០២៦"

const km = new FormatDateTime(ny, 'hh:mm', 'km-KH');
const en = new FormatDateTime(ny, 'hh:mm A', 'en-US');
`មហាសង្រ្កាន្ត ម៉ោង ${km.formatDate()} AM (Moha Sankranta at ${en.formatDate()})`;
// "មហាសង្រ្កាន្ត ម៉ោង ១០:៤៨ AM (Moha Sankranta at 10:48 AM)"
```

### Next 5 New Years

```typescript
const startYear = new Date().getFullYear();
for (let i = 0; i < 5; i++) {
  const year = startYear + i;
  const ny = KhmerDate.getKhNewYearMoment(year);
  const kd = new KhmerDate(ny);
  console.log(`${year}: ${kd.toLunarDate('full')}`);
}
```

## Digit Conversion

```typescript
import { KhmerDate } from '@pphatdev/format-datetime';

KhmerDate.arabicToKhmerNumber('12345');     // "១២៣៤៥"
KhmerDate.khmerToArabicNumber('១២៣៤៥');    // "12345"
KhmerDate.getKhmerNumber(2026);              // "២០២៦"

// Works with mixed content
KhmerDate.arabicToKhmerNumber('2026-07-13');  // "២០២៦-០៧-១៣"
KhmerDate.arabicToKhmerNumber('$1,234.56');   // "$១,២៣៤.៥៦"
```

## Parsing and Validation

```typescript
// String parsing (via `new Date(str)`)
new FormatDateTime('2026-01-01', 'YYYY', 'en-US').formatDate();      // "2026"
new FormatDateTime('2026-07-13T14:30:45Z', 'HH:mm').formatDate();    // depends on TZ

// Invalid date returns a sentinel string — no exception
new FormatDateTime('this-is-not-a-date').formatDate();               // "Invalid Date"

// Omitting the date uses `new Date()` at construction time
const now = new FormatDateTime();
now.date instanceof Date;    // true

// Guard clause pattern
function safeFormat(input: string | null): string {
  const dt = new FormatDateTime(input);
  if (isNaN(dt.date.getTime())) return 'N/A';
  return dt.formatDate();
}
```

## React

### Simple formatted date component

```tsx
import FormatDateTime from '@pphatdev/format-datetime';

function KhmerClock({ date }: { date: Date }) {
  const dt = new FormatDateTime(date, 'DDDD d MMMM YYYY, hh:mm:ss A', 'km-KH');
  return <time dateTime={date.toISOString()}>{dt.formatDate()}</time>;
}
```

### Live-updating clock

```tsx
import { useEffect, useState } from 'react';
import FormatDateTime from '@pphatdev/format-datetime';

export function LiveKhmerClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dt = new FormatDateTime(now, 'DDDD d MMMM YYYY hh:mm:ss A', 'km-KH');
  return <span>{dt.formatDate()}</span>;
}
```

### Memoized hook

```tsx
import { useMemo } from 'react';
import FormatDateTime from '@pphatdev/format-datetime';

export function useFormattedDate(date: Date, format: string, locale = 'en-US'): string {
  return useMemo(() => new FormatDateTime(date, format, locale).formatDate(), [date, format, locale]);
}

// usage
const formatted = useFormattedDate(new Date(), 'YYYY-MM-dd', 'km-KH');
```

### i18n locale switch

```tsx
import { useState } from 'react';
import FormatDateTime from '@pphatdev/format-datetime';

export function DateWithLocaleToggle({ date }: { date: Date }) {
  const [locale, setLocale] = useState<'en-US' | 'km-KH'>('en-US');
  const dt = new FormatDateTime(date, 'DDDD, MMMM d, YYYY', locale);
  return (
    <div>
      <span>{dt.formatDate()}</span>
      <button onClick={() => setLocale(l => l === 'en-US' ? 'km-KH' : 'en-US')}>
        {locale === 'en-US' ? 'ខ្មែរ' : 'English'}
      </button>
    </div>
  );
}
```

## Vue

```vue
<script setup lang="ts">
import { computed } from 'vue';
import FormatDateTime from '@pphatdev/format-datetime';

const props = defineProps<{ date: Date; locale?: string }>();
const formatted = computed(() => {
  return new FormatDateTime(props.date, 'DDDD, MMMM d, YYYY', props.locale ?? 'km-KH').formatDate();
});
</script>

<template>
  <time :datetime="date.toISOString()">{{ formatted }}</time>
</template>
```

## Svelte

```svelte
<script lang="ts">
  import FormatDateTime from '@pphatdev/format-datetime';

  export let date: Date;
  export let locale: string = 'km-KH';

  $: formatted = new FormatDateTime(date, 'DDDD, MMMM d, YYYY', locale).formatDate();
</script>

<time datetime={date.toISOString()}>{formatted}</time>
```

## Cloudflare Worker

### Simple JSON endpoint

```typescript
import FormatDateTime, { KhmerDate } from '@pphatdev/format-datetime';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') ?? 'en-US';
    const format = url.searchParams.get('format') ?? 'YYYY-MM-dd HH:mm:ss Z';

    const dt = new FormatDateTime(new Date(), format, locale);
    return Response.json({
      solar: dt.formatDate(),
      lunar: new KhmerDate().toLunarDate('full'),
      timestamp: Date.now(),
    });
  },
};
```

### HTML response

```typescript
import FormatDateTime, { KhmerDate } from '@pphatdev/format-datetime';

export default {
  async fetch(): Promise<Response> {
    const dt = new FormatDateTime(new Date(), 'DDDD, d MMMM YYYY hh:mm A', 'km-KH');
    const kd = new KhmerDate();
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>ថ្ងៃនេះ</title></head>
<body>
  <h1>ថ្ងៃនេះ</h1>
  <p>${dt.formatDate()}</p>
  <p>${kd.toLunarDate('full')}</p>
</body></html>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  },
};
```

## Node.js CLI

```typescript
#!/usr/bin/env node
import FormatDateTime, { KhmerDate } from '@pphatdev/format-datetime';

const [, , input] = process.argv;
const date = input ? new Date(input) : new Date();

if (isNaN(date.getTime())) {
  console.error(`Invalid date: ${input}`);
  process.exit(1);
}

console.log(new FormatDateTime(date, 'DDDD, MMMM d, YYYY', 'en-US').formatDate());
console.log(new KhmerDate(date).toLunarDate('full'));
console.log(new KhmerDate(date).toKhmerDate());
```

Usage:

```bash
$ node cli.js 2026-07-13
Monday, July 13, 2026
ថ្ងៃចន្ទ ១៣រោច ខែបឋមាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០
ទី១៣ ខែកក្កដា ឆ្នាំ២០២៦
```

## Batch Formatting

### Format a list of dates

```typescript
import FormatDateTime from '@pphatdev/format-datetime';

const dates = [
  new Date(2026, 0, 1),
  new Date(2026, 3, 14),   // Moha Songkran
  new Date(2026, 6, 13),
  new Date(2026, 11, 31),
];

dates.map(d => new FormatDateTime(d, 'DDDD, MMMM d, YYYY', 'km-KH').formatDate());
// [
//   "ព្រហស្បតិ៍, មករា ១, ២០២៦",
//   "អង្គារ, មេសា ១៤, ២០២៦",
//   "ចន្ទ, កក្កដា ១៣, ២០២៦",
//   "ព្រហស្បតិ៍, ធ្នូ ៣១, ២០២៦"
// ]
```

### Reuse the formatter across dates

```typescript
const dt = new FormatDateTime(new Date(), 'YYYY-MM-dd');
const formatted: string[] = [];
for (const d of dates) {
  dt.date = d;
  formatted.push(dt.formatDate());
}
```

## Date-Range Picker Display

```tsx
import FormatDateTime from '@pphatdev/format-datetime';

function DateRange({ start, end, locale = 'km-KH' }: { start: Date; end: Date; locale?: string }) {
  const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  const dtStart = new FormatDateTime(start, sameMonth ? 'd' : 'MMMM d', locale);
  const dtEnd = new FormatDateTime(end, 'MMMM d, YYYY', locale);
  return <span>{dtStart.formatDate()} – {dtEnd.formatDate()}</span>;
}
```

## Chart X-Axis Labels

```typescript
import FormatDateTime from '@pphatdev/format-datetime';

const chartData = getMonthlyRevenue();   // [{ date: Date, revenue: number }, ...]

const labels = chartData.map(pt => new FormatDateTime(pt.date, 'MMM YYYY', 'en-US').formatDate());
// e.g. ["Jan 2026", "Feb 2026", "Mar 2026", ...]
```

## Testing Patterns

### Vitest

```typescript
import { describe, it, expect } from 'vitest';
import FormatDateTime, { KhmerDate } from '@pphatdev/format-datetime';

describe('date formatting', () => {
  it('formats Khmer New Year 2026 precisely', () => {
    const ny = KhmerDate.getKhNewYearMoment(2026);
    expect(new FormatDateTime(ny, 'YYYY-MM-dd hh:mm', 'en-US').formatDate())
      .toBe('2026-04-14 10:48');
  });

  it('handles Khmer digits', () => {
    expect(new FormatDateTime(new Date(2026, 0, 1), 'YYYY', 'km-KH').formatDate())
      .toBe('២០២៦');
  });
});
```

### Fixing "now" in tests

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import FormatDateTime from '@pphatdev/format-datetime';

describe('with fake timers', () => {
  beforeEach(() => vi.useFakeTimers().setSystemTime(new Date('2026-07-13T14:30:00Z')));
  afterEach(() => vi.useRealTimers());

  it('defaults to `now`', () => {
    expect(new FormatDateTime(null, 'YYYY-MM-dd').formatDate()).toBe('2026-07-13');
  });
});
```

## Timezone Handling

### Force UTC output

```typescript
const now = new Date();
const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
const utcDate = new Date(utcMs);
new FormatDateTime(utcDate, 'YYYY-MM-dd HH:mm:ss', 'en-US').formatDate();
// UTC-based formatted string
```

### Show both local and Khmer New Year time

```typescript
const ny = KhmerDate.getKhNewYearMoment(2026);
const local = new FormatDateTime(ny, 'YYYY-MM-dd HH:mm Z').formatDate();
const utc = new FormatDateTime(new Date(ny.getTime() + ny.getTimezoneOffset() * 60_000), 'YYYY-MM-dd HH:mm').formatDate() + ' UTC';

console.log(`Local: ${local}`);
console.log(`UTC:   ${utc}`);
```
