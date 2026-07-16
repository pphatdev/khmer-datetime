import { Constants } from '../config/constants.ts';
import { KhmerDate } from './khmer-date.ts';

/**
 * Core calculations for Khmer calendar system
 * Ported from PPhatDev/LunarDate
 */
export class Calculator {
    public static getBodithey(beYear: number): number {
        if (beYear < 0) throw new Error('Buddhist Era year must be positive');
        const ahk = this.getAharkun(beYear);
        const avml = Math.floor((11 * ahk + 25) / 692);
        const m = avml + ahk + 29;
        return m % 30;
    }

    public static getAvoman(beYear: number): number {
        if (beYear < 0) throw new Error('Buddhist Era year must be positive');
        const ahk = this.getAharkun(beYear);
        return (11 * ahk + 25) % 692;
    }

    public static getAharkun(beYear: number): number {
        if (beYear < 0) throw new Error('Buddhist Era year must be positive');
        const t = beYear * 292207 + 499;
        return Math.floor(t / 800) + 4;
    }

    public static kromthupul(beYear: number): number {
        const ah = this.getAharkunMod(beYear);
        return 800 - ah;
    }

    public static isKhmerSolarLeap(beYear: number): number {
        return this.kromthupul(beYear) <= 207 ? 1 : 0;
    }

    public static getAharkunMod(beYear: number): number {
        const t = beYear * 292207 + 499;
        return t % 800;
    }

    public static getBoditheyLeap(beYear: number): number {
        let result = 0;
        const avoman = this.getAvoman(beYear);
        const bodithey = this.getBodithey(beYear);

        let boditheyLeap = 0;
        if (bodithey >= 25 || bodithey <= 5) {
            boditheyLeap = 1;
        }

        let avomanLeap = 0;
        if (this.isKhmerSolarLeap(beYear)) {
            if (avoman <= 126) {
                avomanLeap = 1;
            }
        } else {
            if (avoman <= 137) {
                if (this.getAvoman(beYear + 1) === 0) {
                    avomanLeap = 0;
                } else {
                    avomanLeap = 1;
                }
            }
        }

        if (bodithey === 25) {
            const nextBodithey = this.getBodithey(beYear + 1);
            if (nextBodithey === 5) {
                boditheyLeap = 0;
            }
        }

        if (bodithey === 24) {
            const nextBodithey = this.getBodithey(beYear + 1);
            if (nextBodithey === 6) {
                boditheyLeap = 1;
            }
        }

        if (boditheyLeap === 1 && avomanLeap === 1) {
            result = 3;
        } else if (boditheyLeap === 1) {
            result = 1;
        } else if (avomanLeap === 1) {
            result = 2;
        } else {
            result = 0;
        }

        return result;
    }

    public static getProtetinLeap(beYear: number): number {
        const b = this.getBoditheyLeap(beYear);
        if (b === 3) return 1;
        if (b === 2 || b === 1) return b;
        if (this.getBoditheyLeap(beYear - 1) === 3) return 2;
        return 0;
    }

    public static isKhmerLeapMonth(beYear: number): boolean {
        return this.getProtetinLeap(beYear) === 1;
    }

    public static isKhmerLeapDay(beYear: number): boolean {
        return this.getProtetinLeap(beYear) === 2;
    }

    public static isGregorianLeap(adYear: number): boolean {
        return (adYear % 4 === 0 && adYear % 100 !== 0) || (adYear % 400 === 0);
    }

    public static getNumberOfDayInKhmerMonth(beMonth: number, beYear: number): number {
        if (beYear < 0) throw new Error('Buddhist Era year must be positive');

        const validMonths = Object.values(Constants.LUNAR_MONTHS);
        if (!validMonths.includes(beMonth)) {
            throw new Error(`Invalid Khmer month index: ${beMonth}`);
        }

        if (beMonth === Constants.LUNAR_MONTHS['ជេស្ឋ'] && this.isKhmerLeapDay(beYear)) {
            return 30;
        }
        if (beMonth === Constants.LUNAR_MONTHS['បឋមាសាឍ'] || beMonth === Constants.LUNAR_MONTHS['ទុតិយាសាឍ']) {
            return 30;
        }
        return beMonth % 2 === 0 ? 29 : 30;
    }

    public static getNumberOfDayInKhmerYear(beYear: number): number {
        if (this.isKhmerLeapMonth(beYear)) return 384;
        if (this.isKhmerLeapDay(beYear)) return 355;
        return 354;
    }

    public static getNumberOfDayInGregorianYear(adYear: number): number {
        return this.isGregorianLeap(adYear) ? 366 : 365;
    }

    public static getBEYear(dateTime: Date): number {
        const visakhaBochea = this.getVisakhaBochea(dateTime.getFullYear());
        if (dateTime.getTime() > visakhaBochea.getTime()) {
            return dateTime.getFullYear() + 544;
        } else {
            return dateTime.getFullYear() + 543;
        }
    }

    public static getMaybeBEYear(dateTime: Date): number {
        if ((dateTime.getMonth() + 1) <= Constants.SOLAR_MONTHS['មេសា'] + 1) {
            return dateTime.getFullYear() + 543;
        } else {
            return dateTime.getFullYear() + 544;
        }
    }

    public static getVisakhaBochea(gregorianYear: number): Date {
        if (gregorianYear < 1) throw new Error('Gregorian year must be positive');

        const date = new Date(Date.UTC(gregorianYear, 0, 1));
        for (let i = 0; i < 365; i++) {
            const lunarDate = KhmerDate.findLunarDate(date);
            if (lunarDate.month === Constants.LUNAR_MONTHS['ពិសាខ'] && lunarDate.day === 14) {
                return date;
            }
            date.setUTCDate(date.getUTCDate() + 1);
        }
        throw new Error(`Cannot find Visakha Bochea day for year ${gregorianYear}. Please report this bug.`);
    }

    public static getJolakSakarajYear(dateTime: Date): number {
        const gregorianYear = dateTime.getFullYear();
        const newYearMoment = KhmerDate.getKhNewYearMoment(gregorianYear);
        if (dateTime.getTime() < newYearMoment.getTime()) {
            return gregorianYear + 543 - 1182;
        } else {
            return gregorianYear + 544 - 1182;
        }
    }

    public static getAnimalYear(dateTime: Date): number {
        const gregorianYear = dateTime.getFullYear();
        const newYearMoment = KhmerDate.getKhNewYearMoment(gregorianYear);
        if (dateTime.getTime() < newYearMoment.getTime()) {
            return (gregorianYear + 543 + 4) % 12;
        } else {
            return (gregorianYear + 544 + 4) % 12;
        }
    }

    public static getKhmerLunarDay(day: number): { count: number; moonStatus: number } {
        return {
            count: (day % 15) + 1,
            moonStatus: day > 14 ? Constants.MOON_STATUS['រោច'] : Constants.MOON_STATUS['កើត']
        };
    }

    public static nextMonthOf(khmerMonth: number, beYear: number): number {
        if (beYear < 0) throw new Error('Buddhist Era year must be positive');

        switch (khmerMonth) {
            case Constants.LUNAR_MONTHS['មិគសិរ']: return Constants.LUNAR_MONTHS['បុស្ស'];
            case Constants.LUNAR_MONTHS['បុស្ស']: return Constants.LUNAR_MONTHS['មាឃ'];
            case Constants.LUNAR_MONTHS['មាឃ']: return Constants.LUNAR_MONTHS['ផល្គុន'];
            case Constants.LUNAR_MONTHS['ផល្គុន']: return Constants.LUNAR_MONTHS['ចេត្រ'];
            case Constants.LUNAR_MONTHS['ចេត្រ']: return Constants.LUNAR_MONTHS['ពិសាខ'];
            case Constants.LUNAR_MONTHS['ពិសាខ']: return Constants.LUNAR_MONTHS['ជេស្ឋ'];
            case Constants.LUNAR_MONTHS['ជេស្ឋ']:
                return this.isKhmerLeapMonth(beYear) ? Constants.LUNAR_MONTHS['បឋមាសាឍ'] : Constants.LUNAR_MONTHS['អាសាឍ'];
            case Constants.LUNAR_MONTHS['អាសាឍ']: return Constants.LUNAR_MONTHS['ស្រាពណ៍'];
            case Constants.LUNAR_MONTHS['ស្រាពណ៍']: return Constants.LUNAR_MONTHS['ភទ្របទ'];
            case Constants.LUNAR_MONTHS['ភទ្របទ']: return Constants.LUNAR_MONTHS['អស្សុជ'];
            case Constants.LUNAR_MONTHS['អស្សុជ']: return Constants.LUNAR_MONTHS['កត្ដិក'];
            case Constants.LUNAR_MONTHS['កត្ដិក']: return Constants.LUNAR_MONTHS['មិគសិរ'];
            case Constants.LUNAR_MONTHS['បឋមាសាឍ']: return Constants.LUNAR_MONTHS['ទុតិយាសាឍ'];
            case Constants.LUNAR_MONTHS['ទុតិយាសាឍ']: return Constants.LUNAR_MONTHS['ស្រាពណ៍'];
            default:
                throw new Error(`Invalid Khmer month: ${khmerMonth}`);
        }
    }
}
