import { Constants } from '../config/constants.ts';
import { Calculator } from '../lunar/calculator.ts';
import { KhmerDate } from '../lunar/khmer-date.ts';

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

export class Utils {
    public static parseKhmerDate(_khmerDateString: string): KhmerDate | null {
        return null;
    }

    public static getKhmerMonthRange(khmerMonth: number, beYear: number): KhmerLunarDayInfo[] {
        const days = Calculator.getNumberOfDayInKhmerMonth(khmerMonth, beYear);
        const range: KhmerLunarDayInfo[] = [];

        for (let day = 0; day < days; day++) {
            const moonDay = Calculator.getKhmerLunarDay(day);
            range.push({
                day: day,
                count: moonDay.count,
                moonStatus: moonDay.moonStatus,
                formatted: moonDay.count.toString() + (moonDay.moonStatus === 0 ? 'កើត' : 'រោច')
            });
        }

        return range;
    }

    public static findLunarDayOccurrences(dayCount: number, moonStatus: number, year: number): LunarDayOccurrence[] {
        const occurrences: LunarDayOccurrence[] = [];
        const startDate = new Date(Date.UTC(year, 0, 1));
        const endDate = new Date(Date.UTC(year + 1, 0, 1));

        const current = new Date(startDate.getTime());
        while (current.getTime() < endDate.getTime()) {
            const khmerDate = new KhmerDate(current);
            const lunarInfo = KhmerDate.findLunarDate(current);
            const moonDay = Calculator.getKhmerLunarDay(lunarInfo.day);

            if (moonDay.count === dayCount && moonDay.moonStatus === moonStatus) {
                occurrences.push({
                    gregorian: current.toISOString().split('T')[0],
                    khmer: khmerDate.toLunarDate(),
                    month: lunarInfo.month
                });
            }

            current.setUTCDate(current.getUTCDate() + 1);
        }

        return occurrences;
    }

    public static diffInKhmer(date1: KhmerDate, date2: KhmerDate): KhmerDateDiff {
        const dt1 = date1.getDateTime();
        const dt2 = date2.getDateTime();

        const diffTime = Math.abs(dt2.getTime() - dt1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
            days: diffDays,
            years: Math.floor(diffDays / 365),
            months: Math.floor(diffDays / 30),
            gregorian_diff: diffDays,
            is_past: dt1.getTime() < dt2.getTime()
        };
    }

    public static getBuddhistHolidays(year: number): Record<string, BuddhistHoliday> {
        const holidays: Record<string, BuddhistHoliday> = {};

        try {
            const visakhaBochea = Calculator.getVisakhaBochea(year);
            holidays['visakha_bochea'] = {
                name: 'ព្រះរាជពិធីវិសាខបូជា',
                name_en: 'Visakha Bochea',
                date: visakhaBochea.toISOString().split('T')[0],
                khmer_date: (new KhmerDate(visakhaBochea)).toLunarDate()
            };

            const khmerNewYear = KhmerDate.getKhNewYearMoment(year);
            holidays['khmer_new_year'] = {
                name: 'បុណ្យចូលឆ្នាំខ្មែរ',
                name_en: 'Khmer New Year',
                date: khmerNewYear.toISOString().split('T')[0],
                khmer_date: (new KhmerDate(khmerNewYear)).toLunarDate()
            };
        } catch (_e) {
            // Handle error silently as per PHP
        }

        return holidays;
    }

    public static convertEra(year: number, fromEra: string, toEra: string): number {
        let adYear = year;
        switch (fromEra.toUpperCase()) {
            case 'BE': adYear = year - 543; break;
            case 'JS': adYear = year + 1182; break;
            case 'AD': default: adYear = year; break;
        }

        switch (toEra.toUpperCase()) {
            case 'BE': return adYear + 543;
            case 'JS': return adYear - 1182;
            case 'AD': default: return adYear;
        }
    }

    public static isValidKhmerDate(day: number, month: number, beYear: number): boolean {
        if (month < 0 || month > 13) return false;

        if (
            (month === Constants.LUNAR_MONTHS['បឋមាសាឍ'] || month === Constants.LUNAR_MONTHS['ទុតិយាសាឍ'])
            && !Calculator.isKhmerLeapMonth(beYear)
        ) {
            return false;
        }

        const maxDays = Calculator.getNumberOfDayInKhmerMonth(month, beYear);
        if (day < 0 || day >= maxDays) return false;

        return true;
    }

    public static getSeason(date: KhmerDate): SeasonInfo {
        const month = date.khMonth();

        if ([Constants.LUNAR_MONTHS['មិគសិរ'], Constants.LUNAR_MONTHS['បុស្ស'], Constants.LUNAR_MONTHS['មាឃ']].includes(month)) {
            return { name: 'រដូវរងារ', name_en: 'Cold Season' };
        } else if ([Constants.LUNAR_MONTHS['ផល្គុន'], Constants.LUNAR_MONTHS['ចេត្រ'], Constants.LUNAR_MONTHS['ពិសាខ']].includes(month)) {
            return { name: 'រដូវក្ដៅ', name_en: 'Hot Season' };
        } else {
            return { name: 'រដូវវស្សា', name_en: 'Rainy Season' };
        }
    }
}
