/**
 * Format dates and times into localized strings, with support for the Khmer
 * lunar calendar.
 *
 * Uses native JavaScript `Intl` APIs, so it works in Deno, Node.js, Bun,
 * browsers and edge runtimes with no dependencies. Supports custom date/time
 * patterns, localized digits (e.g. Khmer numerals), time-of-day phrases and
 * Khmer lunar dates.
 *
 * Format tokens:
 *
 * | Token       | Meaning           | Token       | Meaning            |
 * | ----------- | ----------------- | ----------- | ------------------ |
 * | `YYYY/yyyy` | 4-digit year      | `MMMM/MMM`  | Month name / abbr. |
 * | `YY/yy`     | 2-digit year      | `MM/M`      | Month (01-12)      |
 * | `DDDD/DDD`  | Day name / abbr.  | `dd/d`      | Day of month       |
 * | `HH/H`      | Hour (0-23)       | `hh/h`      | Hour (1-12)        |
 * | `mm/m`      | Minute (0-59)     | `ss/s`      | Second (0-59)      |
 * | `A/a/aA`    | AM/PM (localized) | `Z/ZZ/z`    | Timezone offset    |
 *
 * Text inside square brackets (e.g. `[at]`) is output as-is.
 *
 * @example Format a date in Khmer
 * ```ts
 * import FormatDateTime from "@pphatdev/format-datetime";
 *
 * const dt = new FormatDateTime("2026-07-13 13:30:45", "DDDD d MMMM, YYYY hh:mm:ss A", "km-KH");
 * dt.formatDate(); // "ចន្ទ ១៣ កក្កដា, ២០២៦ ០១:៣០:៤៥ រសៀល"
 * ```
 *
 * @example Get the Khmer lunar date
 * ```ts
 * import FormatDateTime from "@pphatdev/format-datetime";
 *
 * new FormatDateTime("2026-07-13").formatLunarDate();
 * ```
 *
 * @module
 */
import { PATTERNS, generateTokens } from './config/tokens.ts';
import { KhmerDate } from './lunar/khmer-date.ts';

/**
 * Formats a date into a localized string using format tokens, and into a Khmer
 * lunar date.
 *
 * Converting an instance to a string (e.g. in a template literal) calls
 * {@linkcode FormatDateTime.prototype.formatDate}.
 *
 * @example
 * ```ts
 * import FormatDateTime from "@pphatdev/format-datetime";
 *
 * const dt = new FormatDateTime(new Date(), "dd-MM-yyyy hh:mm A", "en-US");
 * console.log(`${dt}`); // e.g. "13-07-2026 01:30 PM"
 * ```
 */
export class FormatDateTime {

    /** Named format patterns that can be used in place of a format string. */
    static patterns: Record<string, string> = PATTERNS;

    /** Default format patterns. The first one is used when no format is given. */
    static defualtPatterns: string[] = ["dd-MM-yyyy hh:mm:ss",];

    /** The date being formatted. */
    public date: Date;
    /** The format pattern, made of format tokens and `[escaped text]`. */
    public format: string;
    /** The BCP 47 locale tag used for names and digits (e.g. `"en-US"`, `"km-KH"`). */
    public locale: string;

    /**
     * Initializes a new FormatDateTime instance.
     * 
     * @param {string|Date|null} [date=null] - The date to format. If not a Date object, it will be parsed.
     * @param {string|null} [format=null] - The format pattern. Defaults to "dd-MM-yyyy hh:mm:ss".
     * @param {string} [locale="en-US"] - The locale string for localization (e.g., "km-KH").
     */
    constructor(date: string | Date | null = null, format: string | null = null, locale: string = "en-US") {
        if (date instanceof Date) {
            this.date = date;
        } else {
            this.date = date ? new Date(date) : new Date();
        }

        this.format = format || FormatDateTime.defualtPatterns[0];
        this.locale = locale;
    }


    /**
     * Generates a dictionary mapping formatting tokens to their corresponding date values.
     * 
     * @param {Date} date - The date object to extract values from.
     * @param {string} format - The format pattern.
     * @param {string} locale - The locale string for localization.
     * @returns {Record<string, string>} An object mapping format tokens to their evaluated string values.
     */
    static tokens(date: Date, format: string, locale: string): Record<string, string> {
        return generateTokens(date, format, locale);
    }

    /**
     * Processes the date and applies the formatting pattern with localized strings.
     * 
     * @returns {string} The fully formatted and localized date string.
     */
    formatDate(): string {
        if (isNaN(this.date.getTime())) return "Invalid Date";

        const tokens = FormatDateTime.tokens(this.date, this.format, this.locale);

        // Match tokens from longest to shortest to prevent partial matches
        const keys = Object.keys(tokens).sort((a, b) => b.length - a.length);
        const regex = new RegExp(`\\[([^\\]]*)\\]|(${keys.join("|")})`, "g");
        return this.format.replace(regex, (match, escaped) => {
            if (escaped !== undefined) return escaped;
            return tokens[match];
        });
    }

    /**
     * Formats the date using the lunar calendar format.
     * 
     * @param {string} [format="full"] - The lunar format pattern ("full", "short", "medium", or custom tokens).
     * @returns {string} The fully formatted and localized lunar date string.
     */
    formatLunarDate(format: string = 'full'): string {
        if (isNaN(this.date.getTime())) return "Invalid Date";
        return new KhmerDate(this.date).toLunarDate(format);
    }

    /**
     * Automatically formats the date when the object is cast to a string.
     * 
     * @returns {string} The fully formatted and localized date string.
     */
    toString(): string {
        return this.formatDate();
    }
}

export { KhmerDate };
export default FormatDateTime;

// Support global scope for browser environments (e.g. via CDN script tags)
if (typeof globalThis !== "undefined") {
    (globalThis as typeof globalThis & { FormatDateTime?: typeof FormatDateTime }).FormatDateTime = FormatDateTime;
}