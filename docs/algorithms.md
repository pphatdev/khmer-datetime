# Algorithms

Deep dive on the traditional Khmer astronomical formulas encoded in `src/lunar/calculator.ts` and `src/lunar/soriyatra-lerng-sak.ts`. These are literal ports of the classical Soriyatra tables and rules — not modern astronomical models.

If you just want to *use* the library, skip this document. If you want to understand *why* a specific date returns a specific lunar answer, or you're extending the calendar code, read on.

## The Traditional Constants

The Khmer astronomical system defines a solar year as:

$$
1 \text{ year} = \frac{292207}{800} \text{ days} \approx 365.25875 \text{ days}
$$

The number **292207** is the numerator; **800** is the denominator (called *kromathopol* base). All year-based calculations start from this fraction.

The other magic constant is **373** (used in Soriyatra) or **499** (used in the day-of-year residue), representing the fractional-day offset of the traditional epoch.

## `getAharkun(beYear)` — Elapsed Days

Aharkun (អហគ្គុន) is the traditional count of days elapsed since the astronomical zero-point, for a given Buddhist Era year.

```typescript
static getAharkun(beYear: number): number {
  const t = beYear * 292207 + 499;
  return Math.floor(t / 800) + 4;
}
```

The `+ 499` is the epoch offset; the `+ 4` calibrates to the Khmer new-year convention. Because `beYear` is an integer, `t / 800` gives elapsed days as a rational number; floor + 4 gives the whole-day count.

## `getAharkunMod(beYear)` — Sub-day Residue

The leftover fractional day, expressed in the traditional 800-unit-per-day system:

```typescript
static getAharkunMod(beYear: number): number {
  const t = beYear * 292207 + 499;
  return t % 800;
}
```

Range: 0–799.

## `kromthupul(beYear)` — Solar-year "Slack"

```typescript
static kromthupul(beYear: number): number {
  return 800 - this.getAharkunMod(beYear);
}
```

Range: 1–800. Used to classify solar leap years:

## `isKhmerSolarLeap(beYear)` — 366-day Sun Year

```typescript
static isKhmerSolarLeap(beYear: number): number {
  return this.kromthupul(beYear) <= 207 ? 1 : 0;
}
```

Returns 1 if the solar year has 366 days, 0 otherwise. Note: this is a **solar** leap concept — the lunar leap rules (below) are independent.

## `getAvoman(beYear)` — Minute Residue

Avoman (អាវមាន) is a minute-scale residue used to determine lunar leap days:

```typescript
static getAvoman(beYear: number): number {
  const ahk = this.getAharkun(beYear);
  return (11 * ahk + 25) % 692;
}
```

Range: 0–691. The magic number **692** is derived from the ratio between lunar and solar month lengths.

## `getBodithey(beYear)` — Lunar-cycle Day Position

Bodithey (បដឋេយ្យ) tracks the position of the lunar month within a fixed lunar cycle:

```typescript
static getBodithey(beYear: number): number {
  const ahk = this.getAharkun(beYear);
  const avml = Math.floor((11 * ahk + 25) / 692);
  const m = avml + ahk + 29;
  return m % 30;
}
```

Range: 0–29. The `+ 29` shifts the count so that 0 aligns with a specific traditional reference.

## `getBoditheyLeap(beYear)` — Combined Leap Indicators

Combines bodithey and avoman to classify how a year should be extended (if at all):

```typescript
static getBoditheyLeap(beYear: number): number {
  let result = 0;
  const avoman = this.getAvoman(beYear);
  const bodithey = this.getBodithey(beYear);

  let boditheyLeap = 0;
  if (bodithey >= 25 || bodithey <= 5) boditheyLeap = 1;

  let avomanLeap = 0;
  if (this.isKhmerSolarLeap(beYear)) {
    if (avoman <= 126) avomanLeap = 1;
  } else {
    if (avoman <= 137) {
      if (this.getAvoman(beYear + 1) === 0) avomanLeap = 0;
      else avomanLeap = 1;
    }
  }

  // Edge corrections at boundaries 24-25 and 25-5 with the following year
  if (bodithey === 25 && this.getBodithey(beYear + 1) === 5) boditheyLeap = 0;
  if (bodithey === 24 && this.getBodithey(beYear + 1) === 6) boditheyLeap = 1;

  if (boditheyLeap === 1 && avomanLeap === 1) result = 3;
  else if (boditheyLeap === 1) result = 1;
  else if (avomanLeap === 1) result = 2;
  else result = 0;

  return result;
}
```

Return codes:

| Value | Meaning |
| --- | --- |
| 0 | No leap adjustment |
| 1 | Leap month only (bodithey-driven) |
| 2 | Leap day only (avoman-driven) |
| 3 | Both bodithey and avoman signal leap (need reconciliation) |

## `getProtetinLeap(beYear)` — Final Leap Classification

Reconciles `getBoditheyLeap` into a single answer. The rule: a year can be either a leap month OR a leap day, never both — and there is a "borrow" rule when two consecutive years both want an adjustment:

```typescript
static getProtetinLeap(beYear: number): number {
  const b = this.getBoditheyLeap(beYear);
  if (b === 3) return 1;   // both signaled → this year takes the month
  if (b === 2 || b === 1) return b;
  if (this.getBoditheyLeap(beYear - 1) === 3) return 2;   // previous year borrowed → this year gets the day
  return 0;
}
```

Return codes:

| Value | Meaning | Days in year |
| --- | --- | --- |
| 0 | Regular year | 354 |
| 1 | Adhikamas (leap month) | 384 |
| 2 | Chantreathimeas (leap day) | 355 |

`isKhmerLeapMonth(beYear)` returns `protetin === 1`; `isKhmerLeapDay(beYear)` returns `protetin === 2`.

## `getNumberOfDayInKhmerMonth(beMonth, beYear)`

29 or 30 days per month, with these overrides:

```typescript
static getNumberOfDayInKhmerMonth(beMonth: number, beYear: number): number {
  if (beMonth === LUNAR_MONTHS['ជេស្ឋ'] && this.isKhmerLeapDay(beYear)) return 30;
  if (beMonth === LUNAR_MONTHS['បឋមាសាឍ'] || beMonth === LUNAR_MONTHS['ទុតិយាសាឍ']) return 30;
  return beMonth % 2 === 0 ? 29 : 30;
}
```

- Month 6 (`ជេស្ឋ`): 29 days normally, 30 days in a leap-day year
- Months 12–13 (`បឋមាសាឍ`, `ទុតិយាសាឍ`): always 30 days (only exist in leap-month years)
- Even-indexed months: 29 days
- Odd-indexed months: 30 days

Throws `Error('Invalid Khmer month index: N')` for out-of-range input.

## `getNumberOfDayInKhmerYear(beYear)`

```typescript
static getNumberOfDayInKhmerYear(beYear: number): number {
  if (this.isKhmerLeapMonth(beYear)) return 384;   // +30 for the extra Ashadha
  if (this.isKhmerLeapDay(beYear))   return 355;   // +1 for Jyestha extension
  return 354;                                       // regular
}
```

## Era Conversions

### `getBEYear(dateTime)` — Precise BE

Uses **Visakha Bochea** as the exact cutoff. Requires solving for VB each year:

```typescript
static getBEYear(dateTime: Date): number {
  const vb = this.getVisakhaBochea(dateTime.getFullYear());
  return dateTime.getTime() > vb.getTime() ? dateTime.getFullYear() + 544 : dateTime.getFullYear() + 543;
}
```

### `getMaybeBEYear(dateTime)` — Heuristic BE

Cheap April-cutoff heuristic; used inside `findLunarDate` where precision doesn't yet matter:

```typescript
static getMaybeBEYear(dateTime: Date): number {
  if ((dateTime.getMonth() + 1) <= SOLAR_MONTHS['មេសា'] + 1) {   // month index of April
    return dateTime.getFullYear() + 543;
  } else {
    return dateTime.getFullYear() + 544;
  }
}
```

### `getVisakhaBochea(gregorianYear)` — Scan for the Buddha Day

```typescript
static getVisakhaBochea(gregorianYear: number): Date {
  const date = new Date(Date.UTC(gregorianYear, 0, 1));
  for (let i = 0; i < 365; i++) {
    const lunar = KhmerDate.findLunarDate(date);
    if (lunar.month === LUNAR_MONTHS['ពិសាខ'] && lunar.day === 14) return date;
    date.setUTCDate(date.getUTCDate() + 1);
  }
  throw new Error(`Cannot find Visakha Bochea day for year ${gregorianYear}`);
}
```

Note: `lunar.day === 14` here is the **internal** day index 14, which corresponds to the display "day 15 of the waxing half" — the full moon of Pisakha, the traditional Buddha day.

Throws for `gregorianYear < 1`.

### `getJolakSakarajYear(dateTime)`

Uses Moha Songkran as the cutoff:

```typescript
static getJolakSakarajYear(dateTime: Date): number {
  const ny = KhmerDate.getKhNewYearMoment(dateTime.getFullYear());
  return dateTime.getTime() < ny.getTime()
    ? dateTime.getFullYear() + 543 - 1182
    : dateTime.getFullYear() + 544 - 1182;
}
```

The subtraction of 1182 shifts from BE to JS (BE 2570 = JS 1388).

### `getAnimalYear(dateTime)`

12-year cycle, offset so that year 0 aligns with `ជូត` under BE reckoning:

```typescript
static getAnimalYear(dateTime: Date): number {
  const ny = KhmerDate.getKhNewYearMoment(dateTime.getFullYear());
  return dateTime.getTime() < ny.getTime()
    ? (dateTime.getFullYear() + 543 + 4) % 12
    : (dateTime.getFullYear() + 544 + 4) % 12;
}
```

The `+ 4` calibrates the cycle. Verifies against 2026-07-13 → BE 2570 → `(2570 + 4) % 12 = 6` → `មមី` (Horse). ✓

## The Lunar Solver: `findLunarDate(target)`

```typescript
static findLunarDate(target: Date): { day, month, epochMoved } {
  const t = new Date(Date.UTC(target.getFullYear(), target.getMonth(), target.getDate(), 12, 0, 0));

  const epoch = new Date(Date.UTC(1900, 0, 1));
  let month = LUNAR_MONTHS['បុស្ស'];   // index 1
  let day = 0;

  // Coarse year walk
  if (t > epoch) {
    while ((t - epoch) / 86400000 > getNumberOfDayInKhmerYear(getMaybeBEYear(new Date(epoch.getTime() + 31536000000)))) {
      const days = getNumberOfDayInKhmerYear(getMaybeBEYear(new Date(epoch.getTime() + 31536000000)));
      epoch.setUTCDate(epoch.getUTCDate() + days);
    }
  } else {
    do {
      const days = getNumberOfDayInKhmerYear(getMaybeBEYear(epoch));
      epoch.setUTCDate(epoch.getUTCDate() - days);
    } while ((epoch - t) / 86400000 > 0);
  }

  // Coarse month walk
  while ((t - epoch) / 86400000 > getNumberOfDayInKhmerMonth(month, getMaybeBEYear(epoch))) {
    const days = getNumberOfDayInKhmerMonth(month, getMaybeBEYear(epoch));
    epoch.setUTCDate(epoch.getUTCDate() + days);
    month = nextMonthOf(month, getMaybeBEYear(epoch));
  }

  // Fine day fill
  day += Math.floor((t - epoch) / 86400000);
  const total = getNumberOfDayInKhmerMonth(month, getMaybeBEYear(t));
  if (total <= day) {
    day = day % total;
    month = nextMonthOf(month, getMaybeBEYear(epoch));
  }

  epoch.setUTCDate(epoch.getUTCDate() + Math.floor((t - epoch) / 86400000));

  return { day: Math.floor(day), month, epochMoved: epoch };
}
```

### Why UTC Noon?

Normalizing to UTC 12:00:00 ensures that:

- The day-of-week (`getUTCDay()`) reflects the local calendar day even in far-eastern timezones.
- Day-count arithmetic doesn't cross UTC midnight boundaries in the middle of a lunar day.
- Rounding via `Math.floor((t - epoch) / 86400000)` is stable — noon-to-noon is exactly 86400000 ms.

### Why the 1900 Epoch?

A Sunday, January 1, 1900 UTC is a well-known Julian date, and the lunar month starting shortly before it (`បុស្ស` on approximately 1899-12-05) is traditionally documented. Choosing a lunar month boundary near a Julian round-number is convenient.

The `+ 31536000000` inside the year walk is exactly 365 days in milliseconds — a lookahead to check whether the *next* year's length would overshoot the target. This is a small optimization to avoid decrementing after over-walking.

## Khmer New Year: `getKhNewYearMoment(gregorianYear)`

```typescript
static getKhNewYearMoment(gregorianYear: number): Date {
  if (this.khNewYearCache[gregorianYear]) return new Date(this.khNewYearCache[gregorianYear].getTime());

  const isLeapYear = (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || (gregorianYear % 400 === 0);
  const day = isLeapYear ? 13 : 14;

  let hoursOffset = ((gregorianYear - 2026) * 6) % 24;
  if (hoursOffset < 0) hoursOffset += 24;

  const hour = (10 + hoursOffset) % 24;
  const minute = 48;

  const result = new Date(gregorianYear, 3, day, hour, minute);
  this.khNewYearCache[gregorianYear] = new Date(result.getTime());
  return result;
}
```

Anchor: **14 April 2026, 10:48** local time. Drift: **6 hours per year**. Rationale:

- The tropical year is ~365.2425 days; the Khmer astronomical year is 365.25875 days. Difference ≈ 0.01625 days/year × 24 h ≈ 0.39 h/year — **not** the 6 h/year used here.
- The 6 h/year value is an approximation that matches the traditional cycle of one whole day of drift over 4 years, which is why the day flips between 14 and 13 on Gregorian leap years.
- This is an *approximation of the traditional table*, not a modern astronomical calculation. It stays accurate for a few centuries around the 2026 anchor.

For dates far outside this range (say, before 1500 CE or after 2500 CE), the `SoriyatraLerngSak` calculation is the more traditionally-rigorous approach.

## `SoriyatraLerngSak.calculate(jsYear)`

Computes the full royal-almanac data for a given JS year. Central formulas:

```typescript
protected static getInfo(jsYear: number) {
  const h = 292207 * jsYear + 373;
  const harkun = Math.floor(h / 800) + 1;
  const kromathopol = 800 - (h % 800);

  const a = 11 * harkun + 650;
  const avaman = a % 692;
  const bodithey = (harkun + Math.floor(a / 692)) % 30;

  return { harkun, kromathopol, avaman, bodithey };
}
```

The `+ 373` and `+ 650` are the traditional epoch offsets specific to the Soriyatra Lerng Sak table (note these differ from `Calculator`'s `+ 499` and `+ 25` — the two systems have slightly different reference points because one starts from BE and the other from JS).

**Time-of-New-Year formula** (`calculateNewYearTime(kromathopol)`):

```typescript
// A traditional day = 800 kromathopol. 1 kromathopol = 1.8 minutes.
const elapsedMinutes = (800 - kromathopol) * 1.8;
const hour = Math.floor(elapsedMinutes / 60);
const minute = Math.floor(elapsedMinutes % 60);
```

This lets you compute the precise New Year moment for any JS year without falling back to the 6-h/year approximation.

## Cross-References

- Calling code: [Lunar Calendar](./lunar-calendar.md), [API Reference](./api-reference.md)
- Source: `src/lunar/calculator.ts`, `src/lunar/soriyatra-lerng-sak.ts`, `src/lunar/khmer-date.ts`
- Upstream port: [PPhatDev/LunarDate](https://github.com/PPhatDev/LunarDate) (PHP), [momentkh](https://github.com/ThyrithSor/momentkh) (JS, `getSoriyatraLerngSak.js`)
