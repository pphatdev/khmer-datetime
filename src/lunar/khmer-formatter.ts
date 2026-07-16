import { Constants } from "../config/constants.ts";
import { Calculator } from './calculator.ts';
import { generateTokens } from '../config/tokens.ts';

export interface LunarDateData {
    day: number;
    month: number;
    dateTime: Date;
}

export class KhmerFormatter {
    private static readonly KHMER_DIGITS: Record<string, string> = Constants.KHMER_NUMBERS;
    private static readonly KHMER_MONTHS: string[] = Constants.MONTHS;
    private static readonly KHMER_DAYS: string[] = Constants.WEEKDAYS;
    private static readonly LUNAR_MONTHS: string[] = Object.keys(Constants.LUNAR_MONTHS);

    public toKhmerNumber(number: string): string {
        return number.split('').map(char => KhmerFormatter.KHMER_DIGITS[char] || char).join('');
    }

    public fromKhmerNumber(khmerNumber: string): string {
        const reverseDigits = Constants.ARABIC_NUMBERS;
        return khmerNumber.split('').map(char => reverseDigits[char] || char).join('');
    }

    public formatNumber(number: number, decimals: number = 0, thousandsSep: string = ','): string {
        const parts = number.toFixed(decimals).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
        const formatted = parts.join('.');
        return this.toKhmerNumber(formatted);
    }

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

        const regex = new RegExp(Object.keys(tokens).sort((a, b) => b.length - a.length).join("|"), "g");
        return format.replace(regex, match => tokens[match]);
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

    public formatCurrency(amount: number, showSymbol: boolean = true): string {
        const formatted = this.formatNumber(amount, 0, ',');
        return showSymbol ? `${formatted} រៀល` : formatted;
    }

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
