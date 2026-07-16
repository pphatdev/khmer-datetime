import { Constants } from "../config/constants.ts";

export interface LunarDateLerngSak {
    day: number;
    month: number;
}

export interface NewYearDaySotin {
    sotin: number;
    angsar: number;
    avaman: number;
}

export interface NewYearTime {
    hour: number;
    minute: number;
}

export interface SoriyatraLerngSakInfo {
    harkun: number;
    kromathopol: number;
    avaman: number;
    bodithey: number;
    has366day: boolean;
    isAthikameas: boolean;
    isChantreathimeas: boolean;
    jesthHas30: boolean;
    dayLerngSak: number;
    lunarDateLerngSak: LunarDateLerngSak;
    newYearsDaySotins: NewYearDaySotin[];
    timeOfNewYear: NewYearTime;
}

/**
 * Soriyatra Lerng Sak calculations for Khmer New Year
 * Ported from getSoriyatraLerngSak.js in momentkh / PPhatDev LunarDate
 */
export class SoriyatraLerngSak {
    /**
     * Calculate Soriyatra Lerng Sak information for a given Jolak Sakaraj year
     */
    static calculate(jsYear: number): SoriyatraLerngSakInfo {
        const info = this.getInfo(jsYear);

        const has366day = this.getHas366day(jsYear);
        const isAthikameas = this.getIsAthikameas(jsYear);
        const isChantreathimeas = this.getIsChantreathimeas(jsYear);
        const jesthHas30 = isChantreathimeas;

        // Calculate day of Lerng Sak
        const dayLerngSak = (info.harkun - 2) % 7;

        // Calculate lunar date of Lerng Sak
        let bodithey = info.bodithey;
        if (this.getIsAthikameas(jsYear - 1) && this.getIsChantreathimeas(jsYear - 1)) {
            bodithey = (bodithey + 1) % 30;
        }

        const lunarDateLerngSak = {
            day: bodithey >= 6 ? bodithey - 1 : bodithey,
            month: bodithey >= 6 ? Constants.LUNAR_MONTHS['ចេត្រ'] : Constants.LUNAR_MONTHS['ពិសាខ']
        };

        // Calculate Sotins for New Year days
        const sotins = has366day ? [363, 364, 365, 366] : [362, 363, 364, 365];
        const newYearsDaySotins = [];

        for (const sotin of sotins) {
            const sunInfo = this.getSunInfo(sotin);
            newYearsDaySotins.push({
                sotin: sotin,
                angsar: sunInfo.angsar,
                avaman: sunInfo.avaman
            });
        }

        // Calculate time of New Year
        const timeOfNewYear = this.calculateNewYearTime(info.kromathopol);

        return {
            harkun: info.harkun,
            kromathopol: info.kromathopol,
            avaman: info.avaman,
            bodithey: info.bodithey,
            has366day,
            isAthikameas,
            isChantreathimeas,
            jesthHas30,
            dayLerngSak,
            lunarDateLerngSak,
            newYearsDaySotins,
            timeOfNewYear
        };
    }

    protected static getInfo(jsYear: number): Record<string, number> {
        const h = 292207 * jsYear + 373;
        const harkun = Math.floor(h / 800) + 1;
        const kromathopol = 800 - (h % 800);

        const a = 11 * harkun + 650;
        const avaman = a % 692;
        const bodithey = (harkun + Math.floor(a / 692)) % 30;

        return { harkun, kromathopol, avaman, bodithey };
    }

    protected static getHas366day(jsYear: number): boolean {
        const info = this.getInfo(jsYear);
        return info.kromathopol <= 207;
    }

    protected static getIsAthikameas(jsYear: number): boolean {
        const info = this.getInfo(jsYear);
        const bodithey = info.bodithey;

        if (bodithey >= 25 || bodithey <= 6) {
            if (bodithey === 25) {
                const nextInfo = this.getInfo(jsYear + 1);
                return nextInfo.bodithey !== 5;
            }
            if (bodithey === 24) {
                const nextInfo = this.getInfo(jsYear + 1);
                return nextInfo.bodithey === 6;
            }
            return true;
        }
        return false;
    }

    protected static getIsChantreathimeas(jsYear: number): boolean {
        const infoOfYear = this.getInfo(jsYear);
        const infoOfNextYear = this.getInfo(jsYear + 1);
        const infoOfPreviousYear = this.getInfo(jsYear - 1);
        const has366day = this.getHas366day(jsYear);

        return ((has366day && infoOfYear.avaman < 127) ||
            (!(infoOfYear.avaman === 137 && infoOfNextYear.avaman === 0) &&
                ((!has366day && infoOfYear.avaman < 138) ||
                    (infoOfPreviousYear.avaman === 137 && infoOfYear.avaman === 0)
                )
            ));
    }

    protected static getSunInfo(sotin: number): Record<string, number> {
        const angsar = sotin % 2;
        const avaman = (sotin * 17) % 692;

        return { angsar, avaman };
    }

    protected static calculateNewYearTime(kromathopol: number): NewYearTime {
        // In the traditional system, a day has 800 kromathopol. 
        // 1 kromathopol = (24 * 60) / 800 = 1.8 minutes.
        // The fractional part of the year that has elapsed since midnight is (800 - kromathopol).
        const elapsedMinutes = (800 - kromathopol) * 1.8;
        const hour = Math.floor(elapsedMinutes / 60);
        const minute = Math.floor(elapsedMinutes % 60);

        return { hour, minute };
    }
}
