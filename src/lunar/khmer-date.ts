import { Constants } from '../config/constants.ts';
import { Calculator } from './calculator.ts';
import { KhmerFormatter } from './khmer-formatter.ts';

/**
 * Main class for Khmer date conversion and formatting
 * Ported from PPhatDev/LunarDate
 */
export class KhmerDate {
    protected dateTime: Date;
    protected static khNewYearCache: Record<number, Date> = {};

    constructor(date: string | Date | number | null = null) {
        if (date === null) {
            this.dateTime = new Date();
        } else if (date instanceof Date) {
            this.dateTime = new Date(date.getTime());
        } else if (typeof date === 'string') {
            this.dateTime = new Date(date);
        } else if (typeof date === 'number') {
            this.dateTime = new Date(date * 1000);
        } else {
            throw new Error('Invalid date input');
        }
    }

    public static create(date: string | Date | number | null = null): KhmerDate {
        return new KhmerDate(date);
    }

    public static createFromDate(dateTime: Date): KhmerDate {
        return new KhmerDate(dateTime);
    }

    public getDateTime(): Date {
        return new Date(this.dateTime.getTime());
    }

    public static findLunarDate(target: Date): { day: number; month: number; epochMoved: Date } {
        const normalizedTarget = new Date(Date.UTC(target.getFullYear(), target.getMonth(), target.getDate(), 12, 0, 0));
        // Epoch Date: January 1, 1900
        const epochMoment = new Date(Date.UTC(1900, 0, 1));
        let khmerMonth = Constants.LUNAR_MONTHS['បុស្ស'];
        let khmerDay = 0; // 0 - 29 

        const differentFromEpoch = normalizedTarget.getTime() - epochMoment.getTime();

        if (differentFromEpoch > 0) {
            while (
                (normalizedTarget.getTime() - epochMoment.getTime()) / 86400000 >
                Calculator.getNumberOfDayInKhmerYear(
                    Calculator.getMaybeBEYear(new Date(epochMoment.getTime() + 31536000000))
                )
            ) {
                const nextYearDate = new Date(epochMoment.getTime() + 31536000000);
                const days = Calculator.getNumberOfDayInKhmerYear(Calculator.getMaybeBEYear(nextYearDate));
                epochMoment.setUTCDate(epochMoment.getUTCDate() + days);
            }
        } else {
            do {
                const days = Calculator.getNumberOfDayInKhmerYear(Calculator.getMaybeBEYear(epochMoment));
                epochMoment.setUTCDate(epochMoment.getUTCDate() - days);
            } while ((epochMoment.getTime() - normalizedTarget.getTime()) / 86400000 > 0);
        }

        while (
            (normalizedTarget.getTime() - epochMoment.getTime()) / 86400000 >
            Calculator.getNumberOfDayInKhmerMonth(khmerMonth, Calculator.getMaybeBEYear(epochMoment))
        ) {
            const days = Calculator.getNumberOfDayInKhmerMonth(
                khmerMonth,
                Calculator.getMaybeBEYear(epochMoment)
            );
            epochMoment.setUTCDate(epochMoment.getUTCDate() + days);
            khmerMonth = Calculator.nextMonthOf(khmerMonth, Calculator.getMaybeBEYear(epochMoment));
        }

        khmerDay += Math.floor((normalizedTarget.getTime() - epochMoment.getTime()) / 86400000);

        const totalDaysOfTheMonth = Calculator.getNumberOfDayInKhmerMonth(khmerMonth, Calculator.getMaybeBEYear(normalizedTarget));
        if (totalDaysOfTheMonth <= khmerDay) {
            khmerDay = khmerDay % totalDaysOfTheMonth;
            khmerMonth = Calculator.nextMonthOf(khmerMonth, Calculator.getMaybeBEYear(epochMoment));
        }

        epochMoment.setUTCDate(epochMoment.getUTCDate() + Math.floor((normalizedTarget.getTime() - epochMoment.getTime()) / 86400000));

        return {
            day: Math.floor(khmerDay),
            month: khmerMonth,
            epochMoved: epochMoment
        };
    }

    public static getKhNewYearMoment(gregorianYear: number): Date {
        if (this.khNewYearCache[gregorianYear]) {
            return new Date(this.khNewYearCache[gregorianYear].getTime());
        }

        // Dynamically project the Moha Songkran (New Year) exact moment based on the 
        // 365.25-day astronomical solar cycle, aligning with the 2026 Royal Almanac epoch (14-04-2026 10:48).
        const isLeapYear = (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || (gregorianYear % 400 === 0);
        const day = isLeapYear ? 13 : 14;

        // Every year the time advances by exactly 6 hours (360 minutes).
        // 2026 is our anchor year: 10:48 AM.
        let hoursOffset = ((gregorianYear - 2026) * 6) % 24;
        if (hoursOffset < 0) hoursOffset += 24;

        const hour = (10 + hoursOffset) % 24;
        const minute = 48; // Minute remains constant in a pure 365.25 day progression

        const result = new Date(gregorianYear, 3, day, hour, minute);
        this.khNewYearCache[gregorianYear] = new Date(result.getTime());

        return result;
    }

    public toLunarDate(format: string | null = null): string {
        const lunarDate = KhmerDate.findLunarDate(this.dateTime);

        return KhmerFormatter.format({
            day: lunarDate.day,
            month: lunarDate.month,
            dateTime: this.dateTime
        }, format);
    }

    public khDay(): number {
        return KhmerDate.findLunarDate(this.dateTime).day;
    }

    public khMonth(): number {
        return KhmerDate.findLunarDate(this.dateTime).month;
    }

    public khYear(): number {
        return Calculator.getBEYear(this.dateTime);
    }

    public toKhmerDate(format: string | null = null): string {
        const dateTime = this.dateTime;
        const formatter = new KhmerFormatter();

        if (format === null) {
            format = "ទី{day} ខែ{month} ឆ្នាំ{year}";
        }

        let result = format;
        result = result.replace('{day}', formatter.toKhmerNumber(dateTime.getDate().toString()));
        result = result.replace('{month}', Object.keys(Constants.SOLAR_MONTHS)[dateTime.getMonth()] || '');
        result = result.replace('{year}', formatter.toKhmerNumber(dateTime.getFullYear().toString()));
        result = result.replace('{dayOfWeek}', formatter.toKhmerNumber(dateTime.getDay().toString()));
        result = result.replace('{dayOfWeekKhmer}', Constants.WEEKDAYS[dateTime.getDay()] || '');
        result = result.replace('{dayOfWeekShort}', Constants.WEEKDAYS_SHORT[dateTime.getDay()] || '');

        return result;
    }

    public format(_format: string): string {
        // Needs a JS implementation of formatting date if needed, but we keep the method for signature
        // Using `FormatDateTime` could work, but for now we just return ISO string or basic format
        return this.dateTime.toISOString(); // simplified
    }

    public getTimestamp(): number {
        return Math.floor(this.dateTime.getTime() / 1000);
    }

    public add(_interval: string): this {
        // Simplified, normally use a library or regex to parse interval
        return this;
    }

    public subtract(_interval: string): this {
        // Simplified
        return this;
    }

    public copy(): KhmerDate {
        return new KhmerDate(this.dateTime);
    }

    public toString(): string {
        return this.toLunarDate();
    }

    public static getKhmerMonthNames(): string[] {
        return Object.keys(Constants.LUNAR_MONTHS);
    }

    public static getAnimalYearNames(): string[] {
        return Constants.ANIMAL_YEARS;
    }

    public static getEraYearNames(): string[] {
        return Constants.ERA_YEARS;
    }

    public static khmerToArabicNumber(khmerNumber: string): string {
        const formatter = new KhmerFormatter();
        return formatter.fromKhmerNumber(khmerNumber);
    }

    public static arabicToKhmerNumber(arabicNumber: string): string {
        const formatter = new KhmerFormatter();
        return formatter.toKhmerNumber(arabicNumber);
    }

    public static getKhmerNumber(number: number): string {
        return this.arabicToKhmerNumber(number.toString());
    }
}
