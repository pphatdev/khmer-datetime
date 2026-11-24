import { Constants } from "../config/constants.ts";
import { Calculator } from './calculator.ts';
import { generateTokens } from '../config/tokens.ts';

/**
 * Interface representing the data needed to format a lunar date.
 */
export interface LunarDateData {
    day: number;
    month: number;
    dateTime: Date;
}

/**
 * Handles the formatting of numbers, dates, and times into the Khmer language.
 */
export class KhmerFormatter {
    private static readonly KHMER_DIGITS: Record<string, string> = Constants.KHMER_NUMBERS;
    private static readonly KHMER_MONTHS: string[] = Constants.MONTHS;
    private static readonly KHMER_DAYS: string[] = Constants.WEEKDAYS;
    private static readonly LUNAR_MONTHS: string[] = Object.keys(Constants.LUNAR_MONTHS);

    /**
     * Converts an Arabic number string to a Khmer number string.
     * 
     * @param {string} number - The Arabic number string to convert.
     * @returns {string} The Khmer number string.
     */
    public toKhmerNumber(number: string): string {
        return number.split('').map(char => KhmerFormatter.KHMER_DIGITS[char] || char).join('');
    }

    /**
     * Converts a Khmer number string to an Arabic number string.
     * 
     * @param {string} khmerNumber - The Khmer number string to convert.
     * @returns {string} The Arabic number string.
     */
    public fromKhmerNumber(khmerNumber: string): string {
        const reverseDigits = Constants.ARABIC_NUMBERS;
        return khmerNumber.split('').map(char => reverseDigits[char] || char).join('');
    }

    /**
     * Formats a number with decimals and thousand separators in Khmer script.
     * 
     * @param {number} number - The number to format.
     * @param {number} [decimals=0] - The number of decimal places.
     * @param {string} [thousandsSep=','] - The thousands separator.
     * @returns {string} The formatted Khmer number string.
     */
    public formatNumber(number: number, decimals: number = 0, thousandsSep: string = ','): string {
        const parts = number.toFixed(decimals).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
        const formatted = parts.join('.');
        return this.toKhmerNumber(formatted);
    }

    /**
     * Formats a Gregorian date into a Khmer solar date string.
     * 
     * @param {Date} date - The date to format.
     * @param {string} [format='full'] - The format preset ('full', 'short', 'medium').
     * @returns {string} The formatted Khmer solar date string.
     */
    public formatDate(date: Date, format: string = 'full'): string {
        const day = date.getDate().toString();
        const month = date.getMonth();
        const year = date.getFullYear().toString();
        const dayOfWeek = date.getDay();

        switch (format) {
            case 'full':
                return `ថ្ងៃ${KhmerFormatter.KHMER_DAYS[dayOfWeek]} ទី${this.toKhmerNumber(day)} ខែ${KhmerFormatter.KHMER_MONTHS[month]} ឆ្នាំ${this.toKhmerNumber(year)}`;
            case 'short':
                return `${this.toKhmerNumber(day)}/${this.toKhmerNumber((month + 1).toString())}/${this.toKhmerNumber(year)}`;
            case 'medium':
                return `ទី${this.toKhmerNumber(day)} ខែ${KhmerFormatter.KHMER_MONTHS[month]} ឆ្នាំ${this.toKhmerNumber(year)}`;
            default:
                throw new Error(`Invalid date format: ${format}`);
        }
    }

    /**
     * Formats lunar date data into a Khmer lunar date string.
     * 
     * @param {LunarDateData} lunarData - The lunar date data to format.
     * @param {string} [format='full'] - The format pattern or preset ('full', 'short', 'medium').
     * @returns {string} The formatted Khmer lunar date string.
     */
    public formatLunarDate(lunarData: LunarDateData, format: string = 'full'): string {
        const day = lunarData.day;
        const month = lunarData.month;
        const dateTime = lunarData.dateTime;
        const dayOfWeek = dateTime.getDay();

        switch (format) {
            case 'full':
                return this.getFullLunarFormat(day, month, dateTime, dayOfWeek);
            case 'short':
                return this.getShortLunarFormat(day, month, dateTime);
            case 'medium':
                return this.getMediumLunarFormat(day, month, dateTime);
            default:
                return this.parseCustomFormat(format, day, month, dateTime, dayOfWeek);
        }
    }

    private parseCustomFormat(format: string, _day: number, _month: number, dateTime: Date, _dayOfWeek: number): string {
        const tokens = generateTokens(dateTime, format, 'km-KH');
        const lunarTokenKeys = ["BBBB", "JJJJ", "ldd", "ld", "lA", "lE", "lM", "lN", "ln", "lW", "lw"];

        // Only replace lunar tokens in lunar formatter, preventing collision with arbitrary text (e.g. "Time:")
        const keys = lunarTokenKeys.filter(k => k in tokens).sort((a, b) => b.length - a.length);
        if (keys.length === 0) {
            return format.replace(/\[([^\]]*)\]/g, '$1');
        }

        const regex = new RegExp(`\\[([^\\]]*)\\]|(${keys.join("|")})`, "g");
        return format.replace(regex, (match, escaped) => {
            if (escaped !== undefined) return escaped;
            return tokens[match];
        });
    }

    private getFullLunarFormat(day: number, month: number, dateTime: Date, dayOfWeek: number): string {
        const moonDay = Calculator.getKhmerLunarDay(day);
        const beYear = Calculator.getBEYear(dateTime);
        const animalYear = Calculator.getAnimalYear(dateTime);
        const eraYears = Calculator.getJolakSakarajYear(dateTime) % 10;

        return `ថ្ងៃ${KhmerFormatter.KHMER_DAYS[dayOfWeek]} ${this.toKhmerNumber(moonDay.count.toString())}${moonDay.moonStatus === 0 ? 'កើត' : 'រោច'} ខែ${KhmerFormatter.LUNAR_MONTHS[month] || ''} ឆ្នាំ${Constants.ANIMAL_YEARS[animalYear] || ''} ${Constants.ERA_YEARS[eraYears] || ''} ពុទ្ធសករាជ ${this.toKhmerNumber(beYear.toString())}`;
    }

    private getShortLunarFormat(day: number, month: number, _dateTime: Date): string {
        const moonDay = Calculator.getKhmerLunarDay(day);
        return `${this.toKhmerNumber(moonDay.count.toString())}${moonDay.moonStatus === 0 ? 'កើត' : 'រោច'} ខែ${KhmerFormatter.LUNAR_MONTHS[month] || ''}`;
    }

    private getMediumLunarFormat(day: number, month: number, dateTime: Date): string {
        const moonDay = Calculator.getKhmerLunarDay(day);
        const beYear = Calculator.getBEYear(dateTime);
        return `${this.toKhmerNumber(moonDay.count.toString())}${moonDay.moonStatus === 0 ? 'កើត' : 'រោច'} ខែ${KhmerFormatter.LUNAR_MONTHS[month] || ''} ព.ស. ${this.toKhmerNumber(beYear.toString())}`;
    }

    /**
     * Formats an amount as currency in Khmer Riel.
     * 
     * @param {number} amount - The currency amount.
     * @param {boolean} [showSymbol=true] - Whether to include the 'រៀល' symbol.
     * @returns {string} The formatted currency string.
     */
    public formatCurrency(amount: number, showSymbol: boolean = true): string {
        const formatted = this.formatNumber(amount, 0, ',');
        return showSymbol ? `${formatted} រៀល` : formatted;
    }

    /**
     * Formats a time into a Khmer time string.
     * 
     * @param {Date} time - The time to format.
     * @param {boolean} [use24Hour=false] - Whether to use 24-hour format.
     * @returns {string} The formatted Khmer time string.
     */
    public formatTime(time: Date, use24Hour: boolean = false): string {
        if (use24Hour) {
            return `${this.toKhmerNumber(time.getHours().toString().padStart(2, '0'))}ម៉ោង${this.toKhmerNumber(time.getMinutes().toString().padStart(2, '0'))}នាទី`;
        }

        let hour = time.getHours();
        const ampm = hour < 12 ? 'ព្រឹក' : 'ល្ងាច';
        hour = hour % 12 || 12;

        return `${this.toKhmerNumber(hour.toString())}ម៉ោង${this.toKhmerNumber(time.getMinutes().toString().padStart(2, '0'))}នាទី${ampm}`;
    }

    public getDayName(date: Date): string {
        return KhmerFormatter.KHMER_DAYS[date.getDay()];
    }

    public getMonthName(date: Date): string {
        return KhmerFormatter.KHMER_MONTHS[date.getMonth()];
    }

    public getLunarMonthName(monthIndex: number): string {
        return KhmerFormatter.LUNAR_MONTHS[monthIndex] || 'អញ្ញាត';
    }

    public isKhmerText(text: string): boolean {
        return /[\u1780-\u17FF]/.test(text);
    }

    public formatOrdinal(number: number): string {
        return `ទី${this.toKhmerNumber(number.toString())}`;
    }

    public static format(lunarData: LunarDateData, format: string | null = null): string {
        const formatter = new KhmerFormatter();
        return formatter.formatLunarDate(lunarData, format ?? 'full');
    }
}
