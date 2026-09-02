# Khmer Lunar Calendar

The lunar calendar arithmetic is **real astronomical arithmetic**, not table-based. Everything derives from a handful of traditional formulas from the Khmer horologia (Soriyatra), packaged for JavaScript.

This document is a working reference. For the raw formulas, see [Algorithms](./algorithms.md).

## Historical Context

The Khmer calendar is a lunisolar system with roots in the ancient Indian calendar (Sūryasiddhānta). It has been in continuous use in Cambodia for more than 1,500 years and is still authoritative for:

- Religious observances (Visakha Bochea, Meak Bochea, Pchum Ben, Kathina, etc.)
- Khmer New Year (Moha Songkran / ចូលឆ្នាំខ្មែរ) in mid-April
- Astrological calculations
- Traditional holidays and seasonal reckoning

Two eras run in parallel with the Gregorian:

- **Buddhist Era** (ព.ស. / BE) — begins 543/544 BCE
- **Jolak Sakaraj** (ចុ.ស. / JS) — a shorter civil era used for calendrical mathematics, begins 638 CE

## Concepts

### Buddhist Era (BE, ព.ស.)

The Khmer Buddhist Era is offset from the Gregorian calendar by **543 or 544 years**, depending on whether the date is before or after **Visakha Bochea** (the traditional Buddha birth day, 14th day of the waning half of the 6th lunar month `ពិសាខ`):

- Before Visakha Bochea: `BE = Gregorian + 543`
- On or after Visakha Bochea: `BE = Gregorian + 544`

Computed by `Calculator.getBEYear(dateTime)`. Example:

```typescript
Calculator.getBEYear(new Date(2026, 0, 1));    // 2569 (Jan is before VB)
Calculator.getBEYear(new Date(2026, 6, 13));   // 2570 (Jul is after VB)
```

The library also has `Calculator.getMaybeBEYear(dateTime)` — a cheap heuristic that uses April as the cutoff instead of computing Visakha Bochea. Used internally in tight loops.

### Jolak Sakaraj (JS, ចុ.ស.)

An older civil era used for calendrical calculations. Offset:

- Before Moha Songkran (Khmer New Year): `JS = Gregorian + 543 − 1182`
- On or after Moha Songkran: `JS = Gregorian + 544 − 1182`

Computed by `Calculator.getJolakSakarajYear(dateTime)`.

```typescript
Calculator.getJolakSakarajYear(new Date(2026, 6, 13));   // 1388
```

### Animal Year (ឆ្នាំ)

12-year cycle beginning at `ជូត` (Rat). Rolls over on Khmer New Year. Order matches the East Asian zodiac but with Khmer names:

| # | Khmer | English |
| --- | --- | --- |
| 0 | ជូត | Rat |
| 1 | ឆ្លូវ | Ox |
| 2 | ខាល | Tiger |
| 3 | ថោះ | Rabbit |
| 4 | រោង | Dragon |
| 5 | ម្សាញ់ | Snake |
| 6 | មមី | Horse |
| 7 | មមែ | Goat |
| 8 | វក | Monkey |
| 9 | រកា | Rooster |
| 10 | ច | Dog |
| 11 | កុរ | Pig |

Computed by `Calculator.getAnimalYear(dateTime)` → 0–11 index into `Constants.ANIMAL_YEARS`.

```typescript
Constants.ANIMAL_YEARS[Calculator.getAnimalYear(new Date(2026, 6, 13))];  // "មមី"
```

### Era Year / Sak (ស័ក)

10-year cycle beginning at `សំរឹទ្ធិស័ក`. Derived as `getJolakSakarajYear(date) % 10`.

| # | Khmer | Meaning |
| --- | --- | --- |
| 0 | សំរឹទ្ធិស័ក | Zero-year |
| 1 | ឯកស័ក | 1st year |
| 2 | ទោស័ក | 2nd year |
| 3 | ត្រីស័ក | 3rd year |
| 4 | ចត្វាស័ក | 4th year |
| 5 | បញ្ចស័ក | 5th year |
| 6 | ឆស័ក | 6th year |
| 7 | សប្តស័ក | 7th year |
| 8 | អដ្ឋស័ក | 8th year |
| 9 | នព្វស័ក | 9th year |

### Moon Status (កើត / រោច)

Each lunar month is split into two halves:

- **Days 1–15** (internal `day` 0–14): **កើត** (waxing / bright half)
- **Days 16+** (internal `day` 15–29): **រោច** (waning / dark half)

The display count resets each half via:

```typescript
Calculator.getKhmerLunarDay(day: number): { count: number; moonStatus: number }
```

Where `count` is 1–15 and `moonStatus` is 0 for waxing (`កើត`) or 1 for waning (`រោច`). Example:

| Internal `day` | `count` | `moonStatus` | Display |
| --- | --- | --- | --- |
| 0 | 1 | 0 | `១កើត` |
| 7 | 8 | 0 | `៨កើត` |
| 14 | 15 | 0 | `១៥កើត` (full moon) |
| 15 | 1 | 1 | `១រោច` |
| 20 | 6 | 1 | `៦រោច` |
| 29 | 15 | 1 | `១៥រោច` (new moon eve) |

### Lunar Months

There are **12 regular lunar months** and **2 extra Ashadha months** used only in leap-month years:

| # | Khmer | Approx. Gregorian |
| --- | --- | --- |
| 0 | មិគសិរ | Nov–Dec |
| 1 | បុស្ស | Dec–Jan |
| 2 | មាឃ | Jan–Feb |
| 3 | ផល្គុន | Feb–Mar |
| 4 | ចេត្រ | Mar–Apr |
| 5 | ពិសាខ | Apr–May |
| 6 | ជេស្ឋ | May–Jun |
| 7 | អាសាឍ | Jun–Jul |
| 8 | ស្រាពណ៍ | Jul–Aug |
| 9 | ភទ្របទ | Aug–Sep |
| 10 | អស្សុជ | Sep–Oct |
| 11 | កត្ដិក | Oct–Nov |
| 12 | បឋមាសាឍ | (leap month year only) |
| 13 | ទុតិយាសាឍ | (leap month year only) |

In a **leap-month year** (Adhikamas / បឋមាសាឍ · ទុតិយាសាឍ), month 7 (`អាសាឍ`) is replaced by the pair 12 → 13. The `Calculator.nextMonthOf()` state machine encodes this:

```typescript
Calculator.nextMonthOf(6, beYear)  // Jyestha → Ashadha OR Pathamasadha (depends on leap year)
Calculator.nextMonthOf(12, beYear) // Pathamasadha → Dvitiyasadha
Calculator.nextMonthOf(13, beYear) // Dvitiyasadha → Sravana
```

### Month Lengths

29 or 30 days per month, with specific rules:

- **Even-indexed months (0, 2, 4, ...)** → 29 days (`ចាន្ទ`)
- **Odd-indexed months (1, 3, 5, ...)** → 30 days (`សុរិយ`)
- **Special case**: Month 6 (`ជេស្ឋ`) gets **30 days instead of 29** in a leap-day year (`isKhmerLeapDay(beYear)`)
- **Special case**: Both `បឋមាសាឍ` (12) and `ទុតិយាសាឍ` (13) always have 30 days

Computed by `Calculator.getNumberOfDayInKhmerMonth(beMonth, beYear)`.

### Year Lengths

Three possible values:

| Kind | Days | Detection |
| --- | --- | --- |
| Regular | 354 | Neither leap classification |
| Leap-day (Chantreathimeas) | 355 | `Calculator.isKhmerLeapDay(beYear)` |
| Leap-month (Adhikamas) | 384 | `Calculator.isKhmerLeapMonth(beYear)` |

Computed by `Calculator.getNumberOfDayInKhmerYear(beYear)`.

Both leap kinds cannot coexist — the year is one, the other, or neither. The `Calculator.getProtetinLeap(beYear)` method returns `0` (regular), `1` (leap month), or `2` (leap day).

## The Lunar Solver

`KhmerDate.findLunarDate(target: Date)` is the workhorse. Algorithm:

1. **Normalize** `target` to UTC 12:00:00 (`Date.UTC(y, m, d, 12, 0, 0)`) — avoids timezone drift during day-counting.
2. **Initialize** an epoch cursor at `1900-01-01 UTC` with the initial month `បុស្ស` (index 1) and day 0.
3. **Coarse year walk**: Jump forward (or backward) one Khmer year at a time using `getNumberOfDayInKhmerYear()` until the cursor is within one year of the target.
4. **Coarse month walk**: Walk forward one month at a time using `getNumberOfDayInKhmerMonth()` and `nextMonthOf()` until the cursor is within one month.
5. **Fine day fill**: `khmerDay = floor((target − cursor) / 86400000)`. If it overflows the current month's day count, wrap to the next month.

Returns `{ day: 0–29, month: 0–13, epochMoved: Date }`. The `day` is the *internal* index; wrap it through `Calculator.getKhmerLunarDay(day)` to get the display `{count: 1–15, moonStatus: 0|1}` pair.

The solver is O(years since 1900). For dates near the year 2100, expect ~200 month-length lookups per call. Cheap in practice — each lookup is arithmetic, no I/O.

## Khmer New Year (Moha Songkran, មហាសង្រ្កាន្ត)

`KhmerDate.getKhNewYearMoment(gregorianYear)` computes the **exact moment** of the New Year, not just the day. Projection from a 2026 anchor:

- Anchor: **14 April 2026, 10:48** local time
- Drift: **6 hours per year forward** on a pure 365.25-day astronomical cycle
- Leap-year adjustment: on a Gregorian leap year, the day is **13 April** instead of 14

Formula:

```typescript
hoursOffset = ((gregorianYear - 2026) * 6) % 24
hour        = (10 + hoursOffset) % 24
minute      = 48
day         = isGregorianLeap(gregorianYear) ? 13 : 14
```

Result is cached per Gregorian year on the class (`khNewYearCache: Record<number, Date>`).

Verified examples:

| Gregorian year | Moha Songkran | BE | Animal | Sak |
| --- | --- | --- | --- | --- |
| 2026 | 14 Apr 2026 10:48 | 2569 | មមី | អដ្ឋស័ក |
| 2027 | 14 Apr 2027 16:48 | 2570 | មមែ | នព្វស័ក |
| 2028 | 13 Apr 2028 22:48 | 2571 | វក | សំរឹទ្ធិស័ក |

## Worked Example: July 13, 2026

Let's trace what happens when you compute the lunar date for `new Date(2026, 6, 13)`:

```typescript
const dt = new FormatDateTime(new Date(2026, 6, 13));
dt.formatLunarDate('full');
// "ថ្ងៃចន្ទ ១៣រោច ខែបឋមាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០"
```

Step-by-step:

1. **Solver runs** `findLunarDate(2026-07-13)` → `{day: 28, month: 12, ...}`
   - month 12 = `បឋមាសាឍ` (proves 2026 is a leap-month year — Adhikamas)
   - day 28 (internal) → `getKhmerLunarDay(28)` → `{count: 14, moonStatus: 1}` → `១៤រោច`
2. **BE year**: `getBEYear(2026-07-13)` = 2570 (July is after Visakha Bochea)
3. **Animal year**: `getAnimalYear(2026-07-13)` = 6 → `មមី` (Horse)
4. **Era year**: `getJolakSakarajYear(2026-07-13) % 10` = 8 → `អដ្ឋស័ក`
5. **Weekday**: `getUTCDay()` of the UTC-noon-normalized date = 1 → `ចន្ទ`

Full format joins these with the template `ថ្ងៃ{lW} {ldd}{lN} ខែ{lM} ឆ្នាំ{lA} {lE} ពុទ្ធសករាជ {BBBB}`.

## The `Calculator` Class

Full method reference (all static; all BE-based methods throw for negative input):

| Method | Purpose | Returns |
| --- | --- | --- |
| `getAharkun(beYear)` | Elapsed days since traditional zero point | number |
| `getAharkunMod(beYear)` | Fractional-day residue | 0–799 |
| `kromthupul(beYear)` | `800 − aharkunMod` | 1–800 |
| `isKhmerSolarLeap(beYear)` | `kromthupul ≤ 207` | 0 or 1 |
| `getBodithey(beYear)` | Days-into-month indicator for New Year setup | 0–29 |
| `getAvoman(beYear)` | Minute-scale residue used for leap-day rules | 0–691 |
| `getBoditheyLeap(beYear)` | Combined leap indicators | 0, 1, 2, or 3 |
| `getProtetinLeap(beYear)` | Final leap classification | 0 (none), 1 (month), 2 (day) |
| `isKhmerLeapMonth(beYear)` | Shortcut for `protetin === 1` | boolean |
| `isKhmerLeapDay(beYear)` | Shortcut for `protetin === 2` | boolean |
| `isGregorianLeap(adYear)` | Standard Gregorian leap rule | boolean |
| `getNumberOfDayInKhmerMonth(m, beYear)` | 29, 30, or leap-adjusted | number |
| `getNumberOfDayInKhmerYear(beYear)` | 354, 355, or 384 | number |
| `getNumberOfDayInGregorianYear(adYear)` | 365 or 366 | number |
| `getBEYear(dateTime)` | 543 vs 544 offset (uses Visakha Bochea) | number |
| `getMaybeBEYear(dateTime)` | Cheap April heuristic (used inside solver) | number |
| `getVisakhaBochea(gregorianYear)` | Scans year for `ពិសាខ` day 14 waning | Date |
| `getJolakSakarajYear(dateTime)` | Uses Moha Songkran cutoff | number |
| `getAnimalYear(dateTime)` | 12-year cycle index | 0–11 |
| `getKhmerLunarDay(day)` | `{count, moonStatus}` from internal day index | object |
| `nextMonthOf(m, beYear)` | Month transition state machine | 0–13 |

All BE-based methods throw `Error('Buddhist Era year must be positive')` for negative input. `getNumberOfDayInKhmerMonth` additionally throws `Error('Invalid Khmer month index: N')` for out-of-range month indices.

## Traditional Seasons

Three seasons based on lunar month (implemented in `Utils.getSeason`):

| Season | Khmer | English | Months |
| --- | --- | --- | --- |
| Cold | រដូវរងារ | Cold Season | មិគសិរ, បុស្ស, មាឃ |
| Hot | រដូវក្ដៅ | Hot Season | ផល្គុន, ចេត្រ, ពិសាខ |
| Rainy | រដូវវស្សា | Rainy Season | ជេស្ឋ, អាសាឍ, ស្រាពណ៍, ភទ្របទ, អស្សុជ, កត្ដិក |

## `SoriyatraLerngSak`

Deep astronomical helper for New Year setup. `SoriyatraLerngSak.calculate(jsYear)` returns:

```typescript
{
  harkun: number,                    // Elapsed days from JS epoch
  kromathopol: number,               // Sub-day residue
  avaman: number,                    // Minute residue
  bodithey: number,                  // Days-into-month for lunar cycle
  has366day: boolean,                // Sun-year length (366 vs 365)
  isAthikameas: boolean,             // Same as isKhmerLeapMonth
  isChantreathimeas: boolean,        // Same as isKhmerLeapDay
  jesthHas30: boolean,               // Whether Jyestha gets 30 days
  dayLerngSak: number,               // Day-of-week Lerng Sak occurs (0-6)
  lunarDateLerngSak: { day, month }, // Lunar date of Lerng Sak
  newYearsDaySotins: Array<{ sotin, angsar, avaman }>,  // 4 sotin days
  timeOfNewYear: { hour, minute }    // Precise New Year time
}
```

Reach for this only if reproducing the full royal almanac. For most needs, `KhmerDate.getKhNewYearMoment(year)` is sufficient.

## Timezone Warning

The lunar solver normalizes to UTC noon internally, so `new Date(2026, 6, 13)` (local midnight, which is likely `2026-07-12T17:00:00Z` in a `+07:00` zone) yields the same lunar answer as `new Date(Date.UTC(2026, 6, 13, 12, 0, 0))`. If you pass a `Date` at or near midnight UTC boundaries and are in a far-eastern timezone, expect the lunar day to reflect the *local calendar day* — which is usually what you want, but worth knowing.

If you need strict UTC-day-boundary semantics for a batch computation, construct dates with `Date.UTC(...)` explicitly.

## Practical Recipes

### Get the current lunar date

```typescript
new KhmerDate().toLunarDate('full');
// "ថ្ងៃចន្ទ ១៣រោច ខែបឋមាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០"
```

### Check if this year has a leap month

```typescript
import { Calculator } from '@pphatdev/format-datetime/src/lunar/calculator.ts';
// Deno / JSR only — not available on npm

const beYear = new KhmerDate().khYear();
Calculator.isKhmerLeapMonth(beYear);   // true or false
Calculator.isKhmerLeapDay(beYear);     // true or false
Calculator.getNumberOfDayInKhmerYear(beYear);   // 354, 355, or 384
```

### Find all full moons in a Gregorian year

```typescript
import { Utils } from '@pphatdev/format-datetime/src/utils/utils.ts';  // Deno only
const fullMoons = Utils.findLunarDayOccurrences(15, 0, 2026);
// Array of { gregorian: 'YYYY-MM-DD', khmer: '...', month: number }
```

### Convert between eras

```typescript
Utils.convertEra(2026, 'AD', 'BE');   // 2569 (before VB heuristic — actual depends on date)
Utils.convertEra(2026, 'AD', 'JS');   // 844
Utils.convertEra(2570, 'BE', 'AD');   // 2027
```
