import { KhmerDate } from '../lunar/khmer-date.ts';
import { Calculator } from '../lunar/calculator.ts';
import { Constants } from './constants.ts';

export const PATTERNS: Record<string, string> = {
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
    "BBBB": "(?<BBBB>\\d{4})",
    "JJJJ": "(?<JJJJ>\\d{4})",
    "lA": "(?<lA>[\\u1780-\\u17FF]+)",
    "lE": "(?<lE>[\\u1780-\\u17FF]+)",
    "lM": "(?<lM>[\\u1780-\\u17FF]+)",
    "ldd": "(?<ldd>\\d{2})",
    "ld": "(?<ld>\\d{1,2})",
    "lN": "(?<lN>[\\u1780-\\u17FF]+)",
    "ln": "(?<ln>[\\u1780-\\u17FF])",
    "lW": "(?<lW>[\\u1780-\\u17FF]+)",
    "lw": "(?<lw>[\\u1780-\\u17FF])",
};

export function generateTokens(date: Date, format: string, locale: string): Record<string, string> {
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
            (options as Intl.NumberFormatOptions & { numberingSystem?: string }).numberingSystem = 'khmr';
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

    let lunarTokens: Record<string, string> = {};
    if (/(BBBB|JJJJ|lA|lE|lM|ldd|ld|lN|ln|lW|lw)/.test(format)) {
        // Normalize date to UTC 12:00:00 to prevent timezone drift during calculations
        const localUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
        
        const lunarDate = KhmerDate.findLunarDate(localUTC);
        const moonDay = Calculator.getKhmerLunarDay(lunarDate.day);
        const beYear = Calculator.getBEYear(localUTC);
        const animalYear = Calculator.getAnimalYear(localUTC);
        const eraYears = Calculator.getJolakSakarajYear(localUTC) % 10;
        const lunarMonths = Object.keys(Constants.LUNAR_MONTHS);
        const khmerDays = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];

        lunarTokens = {
            "BBBB": formatNum(beYear, 4),
            "JJJJ": formatNum(Calculator.getJolakSakarajYear(date), 4),
            "lA": Constants.ANIMAL_YEARS[animalYear] || '',
            "lE": Constants.ERA_YEARS[eraYears] || '',
            "lM": lunarMonths[lunarDate.month] || '',
            "ldd": formatNum(moonDay.count, 2),
            "ld": formatNum(moonDay.count),
            "lN": moonDay.moonStatus === 0 ? 'កើត' : 'រោច',
            "ln": moonDay.moonStatus === 0 ? 'ក' : 'រ',
            "lW": khmerDays[localUTC.getUTCDay()],
            "lw": khmerDays[localUTC.getUTCDay()].substring(0, 1),
        };
    }

    return {
        "YYYY": formatNum(y, 4),
        "yyyy": formatNum(y, 4),
        "YY": formatNum(y % 100, 2),
        "yy": formatNum(y % 100, 2),
        "MMMM": monthLong,
        "MMM": monthShort,
        "MM": formatNum(m + 1, 2),
        "M": formatNum(m + 1),
        "DDDD": dayLong,
        "DDD": dayShort,
        "DD": dayShort.slice(0, 2),
        "D": dayShort.slice(0, 1),
        "dd": formatNum(d, 2),
        "d": formatNum(d),
        "HH": formatNum(h, 2),
        "H": formatNum(h),
        "hh": formatNum(h12, 2),
        "h": formatNum(h12),
        "mm": formatNum(min, 2),
        "m": formatNum(min),
        "ss": formatNum(s, 2),
        "s": formatNum(s),
        "aA": localAmPm,
        "A": localAmPmUpper,
        "a": localAmPm,
        "ZZ": `${tzSign}${tzHours}:${tzMinutes}:00`,
        "Z": `${tzSign}${tzHours}:${tzMinutes}`,
        "zz": `${tzSign}${tzHours}${tzMinutes}00`,
        "z": `${tzSign}${tzHours}${tzMinutes}`,
        ...lunarTokens
    };
}
