/**
 * DateTime Formatting Library
 * 
 * A robust utility to format dates and times into localized strings using native JS APIs.
 * Supports custom date/time patterns, localized digits (e.g. Khmer), and time-of-day phrases.
 * 
 * @param {string|Date} date - The date to format (e.g. "2026-07-13", or a Date object).
 * @param {string} [format="dd-MM-yyyy hh:mm:ss"] - The format string with tokens.
 * @param {string} [locale="en-US"] - The BCP 47 locale tag (e.g. "en-US", "km-KH", "fr-FR").
 * 
 * @returns {string} - The formatted date string.
 * 
 * @example
 * const dt = new FormatDateTime(new Date(), "DDDD d MMMM, YYYY hh:mm:ss A", "km-KH");
 * console.log(dt.formatDate()); // "ចន្ទ ១៣ កក្កដា, ២០២៦ ០១:៣០:៤៥ ល្ងាច"
 * 
 * Format Tokens:
 * YYYY/yyyy : 4-digit year       MMMM/MMM : Month name/abbr     DDDD/DDD : Day name/abbr
 * YY/yy     : 2-digit year       MM/M     : Month (01-12)       dd/d     : Day of month
 * HH/H      : Hour (0-23)        hh/h     : Hour (1-12)         A/a/aA   : AM/PM (Localized)
 * mm/m      : Minute (0-59)      ss/s     : Second (0-59)       Z/ZZ/z   : Timezone offsets
 * 
 * @author PPhat <hi@pphat.me>
 * @repository https://github.com/pphatdev/format-datetime
 * @website https://pphat.me
 * @copyright 2026 (c)
 * @license MIT
 * @version 0.2.0
 */
import { PATTERNS, generateTokens } from './config/tokens.ts';
import { KhmerDate } from './lunar/khmer-date.ts';

export class FormatDateTime {

    static patterns: Record<string, string> = PATTERNS;

    static defualtPatterns: string[] = ["dd-MM-yyyy hh:mm:ss",];

    public date: Date;
    public format: string;
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
        const regex = new RegExp(keys.join("|"), "g");
        return this.format.replace(regex, match => tokens[match]);
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