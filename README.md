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

## API Reference

### `new FormatDateTime(date?, format?, locale?)`

- **`date`** _(string | Date | null)_: The date to format. Can be a string (e.g., `"2026-07-13"`), a `Date` object, or `null`/`undefined` (defaults to the current date and time).
- **`format`** _(string | null)_: The format string containing tokens. Defaults to `"dd-MM-yyyy hh:mm:ss"`.
- **`locale`** _(string)_: The BCP 47 locale tag. Defaults to `"en-US"`.

### `dt.formatDate(): string`
Processes the date and applies the formatting pattern with localized strings.

## License

[MIT](LICENSE) © PPhat <hi@pphat.top>
