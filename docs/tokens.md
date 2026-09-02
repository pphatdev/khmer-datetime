# Token Reference

Format strings are ordinary text with **tokens** interpolated in. `FormatDateTime.formatDate()` builds a token → localized-value dictionary via `generateTokens(date, format, locale)` and then does a **single regex replacement**, with tokens sorted **longest-first** so that `MMMM` is never eaten by `MM`.

Any character that is not a token — spaces, punctuation, Khmer text, digits, parentheses, hyphens — passes through untouched.

## Solar Tokens

### Year

| Token | Description | `en-US` | `km-KH` |
| --- | --- | --- | --- |
| `YYYY` | 4-digit year | `2026` | `២០២៦` |
| `yyyy` | 4-digit year (alias) | `2026` | `២០២៦` |
| `YY` | 2-digit year | `26` | `២៦` |
| `yy` | 2-digit year (alias) | `26` | `២៦` |

Computed as `date.getFullYear()`. The 2-digit form takes `year % 100`.

### Month

| Token | Description | `en-US` | `km-KH` |
| --- | --- | --- | --- |
| `MMMM` | Full month name | `July` | `កក្កដា` |
| `MMM` | Short month name | `Jul` | `កក្កដា` |
| `MM` | 2-digit month | `07` | `០៧` |
| `M` | Month number | `7` | `៧` |

Numeric month uses `date.getMonth() + 1` (1–12). Names come from `Intl.DateTimeFormat(locale, { month: 'long' | 'short' })` for non-Khmer locales, or the hand-coded `Constants.MONTHS` array for Khmer.

For Khmer, `MMMM` and `MMM` return the same string — there is no distinct short form in the tables.

### Day of Week

| Token | Description | `en-US` | `km-KH` |
| --- | --- | --- | --- |
| `DDDD` | Full weekday name | `Monday` | `ចន្ទ` |
| `DDD` | Short weekday name | `Mon` | `ចន្ទ` |
| `DD` | 2-char weekday | `Mo` | `ច` |
| `D` | 1-char weekday | `M` | `ច` |

`DDDD` and `DDD` come from `Intl.DateTimeFormat` (or `Constants.WEEKDAYS` / `Constants.WEEKDAYS_SHORT` for Khmer). `DD` and `D` are `slice(0, 2)` and `slice(0, 1)` of the short form.

### Day of Month

| Token | Description | `en-US` | `km-KH` |
| --- | --- | --- | --- |
| `dd` | 2-digit day (01–31) | `13` | `១៣` |
| `d` | Day (1–31) | `13` | `១៣` |

Computed as `date.getDate()`.

### Hour

| Token | Description | `en-US` | `km-KH` |
| --- | --- | --- | --- |
| `HH` | 24-hour, 2 digits (00–23) | `14` | `១៤` |
| `H` | 24-hour (0–23) | `14` | `១៤` |
| `hh` | 12-hour, 2 digits (01–12) | `02` | `០២` |
| `h` | 12-hour (1–12) | `2` | `២` |

12-hour is computed as `h % 12 || 12` — so 0 and 12 both display as `12`.

### Minute / Second

| Token | Description | `en-US` | `km-KH` |
| --- | --- | --- | --- |
| `mm` | Minutes, 2 digits (00–59) | `30` | `៣០` |
| `m` | Minutes (0–59) | `30` | `៣០` |
| `ss` | Seconds, 2 digits (00–59) | `45` | `៤៥` |
| `s` | Seconds (0–59) | `45` | `៤៥` |

Note that `m` and `mm` display the same for values ≥ 10. The distinction only matters for single-digit values (`5` vs `05`).

### AM/PM / Time-of-Day

| Token | Description | `en-US` | `km-KH` |
| --- | --- | --- | --- |
| `A` | Uppercase AM/PM (localized) | `PM` | `រសៀល` |
| `a` | Lowercase AM/PM (localized) | `pm` | `រសៀល` |
| `aA` | Mixed-case AM/PM | `pm` | `រសៀល` |

For non-Khmer locales, the AM/PM string comes from `Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true }).formatToParts(date)` — searching for the `dayPeriod` part. This means locales like `ja-JP` produce `午前` / `午後`, `ar-EG` produces `ص` / `م`, etc.

For Khmer, one of six phrases based on `date.getHours()`:

| Hour range | Phrase | Meaning |
| --- | --- | --- |
| `0–4` | `រំលងអធ្រាត្រ` | Past midnight / early morning |
| `5–11` | `ព្រឹក` | Morning |
| `12` | `ថ្ងៃត្រង់` | Noon (exact hour 12 only) |
| `13–16` | `រសៀល` | Afternoon |
| `17–19` | `ល្ងាច` | Evening |
| `20–23` | `យប់` | Night |

Both `A` and `a` return the same phrase in Khmer — there is no case distinction for Khmer script.

### Timezone Offset

| Token | Description | Example |
| --- | --- | --- |
| `Z` | ISO 8601 offset with colon | `+07:00` |
| `ZZ` | ISO 8601 offset with colon and seconds | `+07:00:00` |
| `z` | Compact offset without colon | `+0700` |
| `zz` | Compact offset (extended, includes 00 seconds) | `+070000` |

Computed from `date.getTimezoneOffset()` (which returns minutes **west of UTC** — hence the sign is flipped: `tzSign = tzOffset > 0 ? "-" : "+"`).

Sub-minute timezones are not supported (the seconds portion always renders as `00`).

## Lunar Tokens (Khmer only)

Any of these tokens **triggers** the lunar solver. If none appear in the format string, no lunar work is done (cheap early exit).

### Year Tokens

| Token | Description | Example |
| --- | --- | --- |
| `BBBB` | Buddhist Era year (4 digits) | `២៥៧០` |
| `JJJJ` | Jolak Sakaraj year (4 digits) | `១៣៨៨` |

`BBBB` uses `Calculator.getBEYear(date)` — computed relative to Visakha Bochea, so it's 543 or 544 above the Gregorian year depending on whether the date is before or after that lunar day.

`JJJJ` uses `Calculator.getJolakSakarajYear(date)` — computed relative to Khmer New Year (Moha Songkran), so it's `Gregorian + 543 − 1182` before New Year or `Gregorian + 544 − 1182` after.

### Animal & Era Year

| Token | Description | Example |
| --- | --- | --- |
| `lA` | Animal year name | `មមី` |
| `lE` | Era year name (Sak) | `អដ្ឋស័ក` |

12-year animal cycle: `ជូត`, `ឆ្លូវ`, `ខាល`, `ថោះ`, `រោង`, `ម្សាញ់`, `មមី`, `មមែ`, `វក`, `រកា`, `ច`, `កុរ`.

10-year era cycle: `សំរឹទ្ធិស័ក`, `ឯកស័ក`, `ទោស័ក`, `ត្រីស័ក`, `ចត្វាស័ក`, `បញ្ចស័ក`, `ឆស័ក`, `សប្តស័ក`, `អដ្ឋស័ក`, `នព្វស័ក`.

Both cycles roll over on Khmer New Year.

### Lunar Month

| Token | Description | Example |
| --- | --- | --- |
| `lM` | Lunar month name | `បឋមាសាឍ` |

14 possible values: 12 regular months plus `បឋមាសាឍ` (12) and `ទុតិយាសាឍ` (13) which only occur in leap-month years. Full list: `មិគសិរ`, `បុស្ស`, `មាឃ`, `ផល្គុន`, `ចេត្រ`, `ពិសាខ`, `ជេស្ឋ`, `អាសាឍ`, `ស្រាពណ៍`, `ភទ្របទ`, `អស្សុជ`, `កត្ដិក`, `បឋមាសាឍ`, `ទុតិយាសាឍ`.

### Lunar Day & Moon Status

| Token | Description | Example |
| --- | --- | --- |
| `ldd` | Lunar day count (2 digits, 1–15) | `១៣` |
| `ld` | Lunar day count (1–15) | `១៣` |
| `lN` | Moon status | `រោច` (waning) / `កើត` (waxing) |
| `ln` | Moon status (single-char) | `រ` / `ក` |

Each lunar month is split into two halves:

- Days 1–15 (internal `day` 0–14): `កើត` (waxing / bright half)
- Days 16+ (internal `day` 15+): `រោច` (waning / dark half)

The display count resets each half — see `Calculator.getKhmerLunarDay(day)`. So the 20th internal day of a 30-day month displays as `៥ រោច` (5th day of waning half).

### Khmer Weekday

| Token | Description | Example |
| --- | --- | --- |
| `lW` | Khmer weekday (full) | `ចន្ទ` |
| `lw` | Khmer weekday (short) | `ច` |

Weekday order: `អាទិត្យ` (Sun), `ចន្ទ` (Mon), `អង្គារ` (Tue), `ពុធ` (Wed), `ព្រហស្បតិ៍` (Thu), `សុក្រ` (Fri), `សៅរ៍` (Sat). Short forms: first character of each.

Computed from a UTC-normalized copy of the date to prevent timezone drift.

## Precedence Rule

Tokens are matched **longest-first**:

- `MMMM` beats `MMM` beats `MM` beats `M`
- `DDDD` beats `DDD` beats `DD` beats `D`
- `hh` beats `h`, `HH` beats `H`
- `ldd` beats `ld`
- `ZZ` beats `Z`, `zz` beats `z`

This is guaranteed at replacement time by `keys.sort((a, b) => b.length - a.length)` in `formatDate()`. If you add a new token in a fork or contribution, do **not** change this comparator.

## Character Class Guarantees

Every token in `PATTERNS` uses a specific character class:

- Digit tokens (`d`, `dd`, `M`, `MM`, `YYYY`, `YY`, `h`, `hh`, `H`, `HH`, `m`, `mm`, `s`, `ss`, `BBBB`, `JJJJ`, `ldd`, `ld`) — `\d`
- Letter tokens (`D`, `DD`, `DDD`, `DDDD`, `MMM`, `MMMM`) — `[a-zA-Z]`
- Khmer text tokens (`lA`, `lE`, `lM`, `lN`, `lW`) — `[ក-៿]+`
- Single Khmer char (`ln`, `lw`) — `[ក-៿]`
- AM/PM (`a`, `A`, `aA`) — literal strings `am|pm|AM|PM`
- Timezone (`Z`, `ZZ`, `z`, `zz`) — offset patterns like `[+-]\d{2}:\d{2}`

These regex fragments are exposed via `FormatDateTime.patterns` (the `PATTERNS` map). You rarely need them unless you're parsing formatted output back into date parts.

## Escaping

There is **no escape mechanism**. If you need a literal `Y`, `M`, `D`, `h`, `m`, `s`, `a`, `A`, `Z`, `z`, `B`, `J`, or `l` in the output, either:

1. Place it inside content that doesn't match a token pattern (any punctuation or Khmer text acts as a barrier).
2. Bracket the token with characters that don't complete a token. For example, the format `'Year: YYYY'` works fine because `Y` alone isn't a token pattern — only `YY` and `YYYY` are.

In practice this rarely bites. The format `'Time is HH:mm'` works because the `T`, `i`, `m`, `e`, `is` aren't tokens. `'YYYY-MM-dd'` works because `-` isn't consumed. `'ថ្ងៃ DDDD'` works because Khmer text isn't consumed by any `[a-zA-Z]` token.

The main gotcha is the letter `m`: `'HH:mm'` renders correctly, but `'MMs'` would render `s` as seconds. Use a separator: `'MM/s'`.

## Examples

### Solar

```typescript
// ISO date
new FormatDateTime(new Date(2026, 6, 13), 'YYYY-MM-dd', 'en-US').formatDate();
// "2026-07-13"

// 12-hour time with AM/PM
new FormatDateTime(new Date(2026, 6, 13, 14, 30, 45), 'hh:mm:ss A', 'en-US').formatDate();
// "02:30:45 PM"

// Full date with weekday
new FormatDateTime(new Date(2026, 6, 13), 'DDDD, MMMM d, YYYY', 'en-US').formatDate();
// "Monday, July 13, 2026"

// ISO 8601 with timezone
new FormatDateTime(new Date(2026, 6, 13, 14, 30, 45), 'YYYY-MM-ddTHH:mm:ssZ').formatDate();
// e.g. "2026-07-13T14:30:45+07:00" (depends on runtime timezone)

// Compact timezone
new FormatDateTime(new Date(), 'YYYYMMddTHHmmssz').formatDate();
// e.g. "20260713T143045+0700"
```

### Khmer

```typescript
// Full Khmer date
new FormatDateTime(new Date(2026, 6, 13, 14, 30, 45), 'DDDD, MMMM d, YYYY, hh:mm:ss A', 'km-KH').formatDate();
// "ចន្ទ, កក្កដា ១៣, ២០២៦, ០២:៣០:៤៥ រសៀល"

// Time-of-day only
new FormatDateTime(new Date(2026, 6, 13, 3, 0, 0), 'a', 'km-KH').formatDate();  // "រំលងអធ្រាត្រ"
new FormatDateTime(new Date(2026, 6, 13, 9, 0, 0), 'a', 'km-KH').formatDate();  // "ព្រឹក"
new FormatDateTime(new Date(2026, 6, 13, 12, 0, 0), 'a', 'km-KH').formatDate(); // "ថ្ងៃត្រង់"
new FormatDateTime(new Date(2026, 6, 13, 14, 0, 0), 'a', 'km-KH').formatDate(); // "រសៀល"
new FormatDateTime(new Date(2026, 6, 13, 18, 0, 0), 'a', 'km-KH').formatDate(); // "ល្ងាច"
new FormatDateTime(new Date(2026, 6, 13, 22, 0, 0), 'a', 'km-KH').formatDate(); // "យប់"
```

### Lunar

```typescript
// Mixed solar + lunar
new FormatDateTime(new Date(2026, 6, 13), 'YYYY-MM-dd (BBBB) lM ld lN lA lE').formatDate();
// "2026-07-13 (2570) បឋមាសាឍ 14 រោច មមី អដ្ឋស័ក"

// Custom Khmer lunar pattern
new FormatDateTime(new Date(2026, 6, 13)).formatLunarDate('lW ldd lN lM');
// "ចន្ទ ១៣ រោច បឋមាសាឍ"
```

### Other locales

```typescript
new FormatDateTime(new Date(2026, 6, 13, 14, 30), 'DDDD, MMMM d, YYYY, hh:mm A', 'ja-JP').formatDate();
// e.g. "月曜日, 7月 13, 2026, 02:30 午後"

new FormatDateTime(new Date(2026, 6, 13, 14, 30), 'DDDD, MMMM d, YYYY', 'fr-FR').formatDate();
// "lundi, juillet 13, 2026"

new FormatDateTime(new Date(2026, 6, 13), 'dd/MM/YYYY', 'ar-EG').formatDate();
// "١٣/٠٧/٢٠٢٦" (Arabic-Indic digits via Intl.NumberFormat)
```

## Advanced: Building Your Own Format Strings

Because tokens are matched by regex, you can concatenate them freely:

```typescript
'MMMM'          → "July"
'MMMM YYYY'     → "July 2026"
'MMMM d, YYYY'  → "July 13, 2026"
'MMMM d YYYY'   → "July 13 2026"  (spaces are literal)
'MMMM/d/YYYY'   → "July/13/2026"
```

The token generator computes every possible token value up front, so adding more tokens to a format string doesn't cost more than a longer regex — the work is done once per `formatDate()` call.
