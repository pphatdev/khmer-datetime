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
 * @author PPhat <hi@pphat.top>
 * @repository https://github.com/pphatdev/format-datetime
 * @website https://pphat.me
 * @copyright 2026 (c)
 * @license MIT
 * @version 0.1.9
 */
export class FormatDateTime {
    
    static patterns: Record<string, string> = {
        "d": "(?<d>\\d)",
        "dd": "(?<dd>\\d{2})",
        "D": "(?<D>[a-zA-Z])",
        "DD": "(?<DD>[a-zA-Z]{2})",
        "DDD": "(?<DDD>[a-zA-Z]{3})",
        "DDDD": "(?<DDDD>[a-zA-Z]{4})",
        "M": "(?<M>\\d)",
        "MM": "(?<MM>\\d{2})",
        "MMM": "(?<MMM>[a-zA-Z]{3})",
        "MMMM": "(?<MMMM>[a-zA-Z]{4})",
        "YYYY": "(?<YYYY>\\d{4})",
        "yyyy": "(?<yyyy>\\d{4})",
        "YY": "(?<YY>\\d{2})",
        "yy": "(?<yy>\\d{2})",
        "h": "(?<h>\\d{1,2})",
        "hh": "(?<hh>\\d{2})",
        "H": "(?<H>\\d{1,2})",
        "HH": "(?<HH>\\d{2})",
        "m": "(?<m>\\d{1,2})",
        "mm": "(?<mm>\\d{2})",
        "s": "(?<s>\\d{1,2})",
        "ss": "(?<ss>\\d{2})",
        "a": "(?<a>am|pm)",
        "A": "(?<A>AM|PM)",
        "aA": "(?<aA>am|pm|AM|PM)",
        "Z": "(?<Z>[+-]\\d{2}:\\d{2})",
        "ZZ": "(?<ZZ>[+-]\\d{2}:\\d{2}:\\d{2})",
        "z": "(?<z>[+-]\\d{4})",
        "zz": "(?<zz>[+-]\\d{6})",
    };

    static defualtPatterns: string[] = [ "dd-MM-yyyy hh:mm:ss", ];

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
        
        const y = date.getFullYear();
        const m = date.getMonth();
        const d = date.getDate();
        const h = date.getHours();
        const min = date.getMinutes();
        const s = date.getSeconds();
        
        const ampm = h >= 12 ? 'pm' : 'am';
        const AMPM = h >= 12 ? 'PM' : 'AM';
        
        const h12 = h % 12 || 12;

        const tzOffset = date.getTimezoneOffset();
        const tzSign = tzOffset > 0 ? "-" : "+";
        const absTz = Math.abs(tzOffset);
        const tzHours = String(Math.floor(absTz / 60)).padStart(2, '0');
        const tzMinutes = String(absTz % 60).padStart(2, '0');

        const monthLong = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
        const monthShort = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
        
        const dayLong = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
        const dayShort = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);

        const isKm = locale.toLowerCase().startsWith('km');
        const formatNum = (num: number, digits: number = 1): string => {
            const options: Intl.NumberFormatOptions = { 
                minimumIntegerDigits: digits, 
                useGrouping: false,
            };
            if (isKm) {
                (options as any).numberingSystem = 'khmr';
            }
            return new Intl.NumberFormat(locale, options).format(num);
        };

        let localAmPm = ampm;
        let localAmPmUpper = AMPM;

        if (isKm) {
            if (h >= 0 && h <= 4) localAmPm = 'រំលងអធ្រាត្រ';
            else if (h >= 5 && h <= 11) localAmPm = 'ព្រឹក';
            else if (h === 12) localAmPm = 'ថ្ងៃត្រង់';
            else if (h >= 13 && h <= 16) localAmPm = 'រសៀល';
            else if (h >= 17 && h <= 19) localAmPm = 'ល្ងាច';
            else localAmPm = 'យប់';

            localAmPmUpper = localAmPm;
        } else {
            const parts = new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true })
                .formatToParts(date);
            const dayPeriodMatch = parts.find(part => part.type === 'dayPeriod');
            
            localAmPm = dayPeriodMatch ? dayPeriodMatch.value : ampm;
            localAmPmUpper = dayPeriodMatch ? dayPeriodMatch.value.toUpperCase() : AMPM;
        }
        
        return {
            "YYYY": formatNum(y, 4),                        // → year (4 digits)
            "yyyy": formatNum(y, 4),                        // → year (4 digits)
            "YY": formatNum(y % 100, 2),                    // → year (2 digits)
            "yy": formatNum(y % 100, 2),                    // → year (2 digits)
            "MMMM": monthLong,                              // → month full name (January, February, March, ...)
            "MMM": monthShort,                              // → month abbreviation (Jan, Feb, Mar, ...)
            "MM": formatNum(m + 1, 2),                      // → month with zero padding (01, 02, ...)
            "M": formatNum(m + 1),                          // → month without leading zero (1, 2, ...)
            "DDDD": dayLong,                                // → day full name (Monday, Tuesday, Wednesday, ...)
            "DDD": dayShort,                                // → day first three letters (Mon, Tue, Wed, ...)
            "DD": dayShort.slice(0, 2),                     // → day first two letters (Mo, Tu, We, ...)
            "D": dayShort.slice(0, 1),                      // → day first letter (M, T, W, ...)
            "dd": formatNum(d, 2),                          // → day with zero padding (01, 02, ...)
            "d": formatNum(d),                              // → day without leading zero (1, 2, ...)
            "HH": formatNum(h, 2),                          // → hour (0-23, zero-padded)
            "H": formatNum(h),                              // → hour (0-23)
            "hh": formatNum(h12, 2),                        // → hour (1-12, zero-padded)
            "h": formatNum(h12),                            // → hour (1-12)
            "mm": formatNum(min, 2),                        // → minute (0-59, zero-padded)
            "m": formatNum(min),                            // → minute (0-59)
            "ss": formatNum(s, 2),                          // → second (0-59, zero-padded)
            "s": formatNum(s),                              // → second (0-59)
            "aA": localAmPm,                                // → AM/PM (mixed case)
            "A": localAmPmUpper,                            // → AM/PM (uppercase)
            "a": localAmPm,                                 // → AM/PM (lowercase)
            "ZZ": `${tzSign}${tzHours}:${tzMinutes}:00`,    // → ISO 8601 timezone offset with seconds (e.g. -07:00:15, +05:30:45)
            "Z": `${tzSign}${tzHours}:${tzMinutes}`,        // → ISO 8601 timezone offset (e.g. -07:00, +05:30)
            "zz": `${tzSign}${tzHours}${tzMinutes}00`,      // → ISO 8601 timezone offset with seconds and no colon (e.g. -070015, +053045)
            "z": `${tzSign}${tzHours}${tzMinutes}`          // → ISO 8601 timezone offset without colon (e.g. -0700, +0530)
        };
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
        const regex = new RegExp(Object.keys(tokens).join("|"), "g");
        return this.format.replace(regex, match => tokens[match]);
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

export default FormatDateTime;

// Support global scope for browser environments (e.g. via CDN script tags)
if (typeof globalThis !== "undefined") {
    (globalThis as any).FormatDateTime = FormatDateTime;
}


// Example:
// const formatDate = new FormatDateTime(new Date(), "DDDD, MMMM d, YYYY, hh:mm:ss A", "KM-kh");
// console.log(formatDate.formatDate());