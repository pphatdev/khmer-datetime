import { describe, it, expect } from 'vitest';
import { FormatDateTime } from '../../src/index.ts';
import { KhmerDate } from '../../src/lunar/index.ts';
import process from 'node:process';

describe('FormatDateTime', () => {
    it('should handle basic token replacement for year and month', () => {
        // Using a local date string to avoid timezone CI issues
        const date = new Date(2026, 6, 13, 14, 30, 45); // July 13, 2026 14:30:45 local
        const dt = new FormatDateTime(date, 'YYYY-MM-dd', 'en-US');
        expect(dt.formatDate()).toBe('2026-07-13');
    });

    it('should correctly format time with AM/PM', () => {
        const date = new Date(2026, 6, 13, 14, 30, 45); // 2:30:45 PM
        const dtUpper = new FormatDateTime(date, 'hh:mm:ss A', 'en-US');
        expect(dtUpper.formatDate()).toBe('02:30:45 PM');

        const dtLower = new FormatDateTime(date, 'hh:mm:ss a', 'en-US');
        expect(dtLower.formatDate()).toBe('02:30:45 pm');

        const morningDate = new Date(2026, 6, 13, 9, 15, 0); // 9:15:00 AM
        const dtMorningLower = new FormatDateTime(morningDate, 'hh:mm a', 'en-US');
        expect(dtMorningLower.formatDate()).toBe('09:15 am');

        const dtMorningUpper = new FormatDateTime(morningDate, 'hh:mm A', 'en-US');
        expect(dtMorningUpper.formatDate()).toBe('09:15 AM');
    });

    it('should preserve literal text escaped with square brackets', () => {
        const date = new Date(2026, 6, 13, 14, 30, 5);
        const dt1 = new FormatDateTime(date, '[Time is] HH:mm', 'en-US');
        expect(dt1.formatDate()).toBe('Time is 14:30');

        const dt2 = new FormatDateTime(date, '[Year]: YYYY', 'en-US');
        expect(dt2.formatDate()).toBe('Year: 2026');

        const dt3 = new FormatDateTime(date, '[Today is] DDDD [at] hh:mm a', 'en-US');
        expect(dt3.formatDate()).toBe('Today is Monday at 02:30 pm');
    });

    it('should correctly format Khmer (km-KH) numeric tokens', () => {
        const date = new Date(2026, 6, 13);
        const dt = new FormatDateTime(date, 'YYYY', 'km-KH');
        // 2026 in Khmer numerals is ២០២៦
        expect(dt.formatDate()).toBe('២០២៦');
    });

    it('should output Khmer time-of-day phrases', () => {
        // Test all 6 distinct Khmer time-of-day intervals:
        // 0-4: រំលងអធ្រាត្រ, 5-11: ព្រឹក, 12: ថ្ងៃត្រង់, 13-16: រសៀល, 17-19: ល្ងាច, 20-23: យប់
        const testHours = [
            { hour: 2, expected: 'រំលងអធ្រាត្រ' },
            { hour: 9, expected: 'ព្រឹក' },
            { hour: 12, expected: 'ថ្ងៃត្រង់' },
            { hour: 15, expected: 'រសៀល' },
            { hour: 18, expected: 'ល្ងាច' },
            { hour: 22, expected: 'យប់' },
        ];

        for (const { hour, expected } of testHours) {
            const dt = new FormatDateTime(new Date(2026, 6, 13, hour, 0, 0), 'a', 'km-KH');
            expect(dt.formatDate()).toBe(expected);
        }
    });

    it('should format padded and unpadded date and time tokens correctly', () => {
        // Date with single-digit month, day, hour, minute, second: 2026-05-09 04:05:07
        const date = new Date(2026, 4, 9, 4, 5, 7);

        // Year tokens
        expect(new FormatDateTime(date, 'YYYY', 'en-US').formatDate()).toBe('2026');
        expect(new FormatDateTime(date, 'yyyy', 'en-US').formatDate()).toBe('2026');
        expect(new FormatDateTime(date, 'YY', 'en-US').formatDate()).toBe('26');
        expect(new FormatDateTime(date, 'yy', 'en-US').formatDate()).toBe('26');

        // Month tokens
        expect(new FormatDateTime(date, 'MMMM', 'en-US').formatDate()).toBe('May');
        expect(new FormatDateTime(date, 'MMM', 'en-US').formatDate()).toBe('May');
        expect(new FormatDateTime(date, 'MM', 'en-US').formatDate()).toBe('05');
        expect(new FormatDateTime(date, 'M', 'en-US').formatDate()).toBe('5');

        // Day tokens
        expect(new FormatDateTime(date, 'dd', 'en-US').formatDate()).toBe('09');
        expect(new FormatDateTime(date, 'd', 'en-US').formatDate()).toBe('9');

        // Hour tokens (4 AM)
        expect(new FormatDateTime(date, 'HH', 'en-US').formatDate()).toBe('04');
        expect(new FormatDateTime(date, 'H', 'en-US').formatDate()).toBe('4');
        expect(new FormatDateTime(date, 'hh', 'en-US').formatDate()).toBe('04');
        expect(new FormatDateTime(date, 'h', 'en-US').formatDate()).toBe('4');

        // Hour tokens (14 / 2 PM)
        const afternoon = new Date(2026, 4, 9, 14, 0, 0);
        expect(new FormatDateTime(afternoon, 'HH', 'en-US').formatDate()).toBe('14');
        expect(new FormatDateTime(afternoon, 'H', 'en-US').formatDate()).toBe('14');
        expect(new FormatDateTime(afternoon, 'hh', 'en-US').formatDate()).toBe('02');
        expect(new FormatDateTime(afternoon, 'h', 'en-US').formatDate()).toBe('2');

        // Minute and second tokens
        expect(new FormatDateTime(date, 'mm', 'en-US').formatDate()).toBe('05');
        expect(new FormatDateTime(date, 'm', 'en-US').formatDate()).toBe('5');
        expect(new FormatDateTime(date, 'ss', 'en-US').formatDate()).toBe('07');
        expect(new FormatDateTime(date, 's', 'en-US').formatDate()).toBe('7');
    });

    it('should format weekday tokens across DDDD, DDD, DD, and D', () => {
        const monday = new Date(2026, 6, 13); // Monday
        expect(new FormatDateTime(monday, 'DDDD', 'en-US').formatDate()).toBe('Monday');
        expect(new FormatDateTime(monday, 'DDD', 'en-US').formatDate()).toBe('Mon');
        expect(new FormatDateTime(monday, 'DD', 'en-US').formatDate()).toBe('Mo');
        expect(new FormatDateTime(monday, 'D', 'en-US').formatDate()).toBe('M');

        expect(new FormatDateTime(monday, 'DDDD', 'km-KH').formatDate()).toBe('ចន្ទ');
        expect(new FormatDateTime(monday, 'DDD', 'km-KH').formatDate()).toBe('ចន');
        expect(new FormatDateTime(monday, 'DD', 'km-KH').formatDate()).toBe('ចន');
        expect(new FormatDateTime(monday, 'D', 'km-KH').formatDate()).toBe('ច');
    });

    it('should format timezone offset tokens matching ISO patterns', () => {
        const date = new Date(2026, 6, 13, 14, 30, 45);
        expect(new FormatDateTime(date, 'Z').formatDate()).toMatch(/^[+-]\d{2}:\d{2}$/);
        expect(new FormatDateTime(date, 'ZZ').formatDate()).toMatch(/^[+-]\d{2}:\d{2}:00$/);
        expect(new FormatDateTime(date, 'z').formatDate()).toMatch(/^[+-]\d{4}$/);
        expect(new FormatDateTime(date, 'zz').formatDate()).toMatch(/^[+-]\d{6}$/);
    });

    it('should format individual lunar tokens for both waning and waxing moon', () => {
        // Waning moon date: July 13, 2026 (14 Roch Pathamasadh)
        const waningDate = new Date(2026, 6, 13);
        const dtWaning = new FormatDateTime(waningDate, 'BBBB JJJJ lA lE lM ldd ld lN ln lW lw', 'en-US');
        expect(dtWaning.formatDate()).toBe('2570 1388 មមី អដ្ឋស័ក បឋមាសាឍ 14 14 រោច រ ចន្ទ ច');

        // Khmer digits formatting for lunar tokens
        const dtKm = new FormatDateTime(waningDate, 'BBBB JJJJ ldd ld', 'km-KH');
        expect(dtKm.formatDate()).toBe('២៥៧០ ១៣៨៨ ១៤ ១៤');

        // Waxing moon date: July 16, 2026 (2 Kaeut Tutiyasadh)
        const waxingDate = new Date(2026, 6, 16);
        const dtWaxing = new FormatDateTime(waxingDate, 'ld ldd lN ln', 'en-US');
        expect(dtWaxing.formatDate()).toBe('2 02 កើត ក');
    });

    it('should parse valid date strings', () => {
        const dt = new FormatDateTime('2026-01-01', 'YYYY', 'en-US');
        expect(dt.formatDate()).toBe('2026');
    });

    it('should handle invalid date strings gracefully', () => {
        const dt = new FormatDateTime('this-is-not-a-date');
        expect(dt.formatDate()).toBe('Invalid Date');
    });

    it('should default to the current date if omitted', () => {
        const dt = new FormatDateTime();
        expect(dt.date).toBeInstanceOf(Date);
        // The date should be created very recently
        const diff = Date.now() - dt.date.getTime();
        expect(diff).toBeLessThan(5000);
    });

    it('should implicitly format via toString()', () => {
        const date = new Date(2026, 0, 1); // Jan 1, 2026
        const dt = new FormatDateTime(date, 'YYYY');
        expect(String(dt)).toBe('2026');
    });

    it('should format lunar date correctly via FormatDateTime tokens', () => {
        const date = new Date(2026, 6, 13); // July 13, 2026
        const dt = new FormatDateTime(date, 'YYYY-MM-dd (BBBB) lM ld lN lA lE');
        expect(dt.formatDate()).toBe('2026-07-13 (2570) បឋមាសាឍ 14 រោច មមី អដ្ឋស័ក');
    });

    it('should format lunar date correctly via KhmerDate presets', () => {
        const date = new Date(2026, 6, 13); // July 13, 2026
        const kd = new KhmerDate(date);
        
        expect(kd.toLunarDate('full')).toBe('ថ្ងៃចន្ទ ១៤រោច ខែបឋមាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០');
        expect(kd.toLunarDate('short')).toBe('១៤រោច ខែបឋមាសាឍ');
        expect(kd.toLunarDate('medium')).toBe('១៤រោច ខែបឋមាសាឍ ព.ស. ២៥៧០');
    });

    it('should format custom lunar date correctly via KhmerDate', () => {
        const date = new Date(2026, 6, 13); // July 13, 2026
        const kd = new KhmerDate(date);
        expect(kd.toLunarDate('lW ldd lN lM')).toBe('ចន្ទ ១៤ រោច បឋមាសាឍ');
        expect(kd.toLunarDate('Time: lW ldd lN lM')).toBe('Time: ចន្ទ ១៤ រោច បឋមាសាឍ');
        expect(kd.toLunarDate('Time lW ldd lN lM')).toBe('Time ចន្ទ ១៤ រោច បឋមាសាឍ');
    });

    it('should format full lunar date and solar date together', () => {
        const date = new Date(2026, 6, 16); // July 16, 2026
        const kd = new KhmerDate(date);
        const combined = `${kd.toLunarDate('full')} ត្រូវនឹងថ្ងៃ${kd.toKhmerDate()}`;
        expect(combined).toBe('ថ្ងៃព្រហស្បតិ៍ ២កើត ខែទុតិយាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០ ត្រូវនឹងថ្ងៃទី១៦ ខែកក្កដា ឆ្នាំ២០២៦');
    });

    it('should format Khmer new year date 2026 correctly', () => {
        const nyDate = KhmerDate.getKhNewYearMoment(2026);
        const kd = new KhmerDate(nyDate);
        
        const combined = `${kd.toLunarDate('full')} ត្រូវនឹងថ្ងៃ${kd.toKhmerDate()}`;
        expect(combined).toBe('ថ្ងៃអង្គារ ១២រោច ខែចេត្រ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៦៩ ត្រូវនឹងថ្ងៃទី១៤ ខែមេសា ឆ្នាំ២០២៦');
        
        const dtKm = new FormatDateTime(nyDate, 'hh:mm', 'km-KH');
        const dtEn = new FormatDateTime(nyDate, 'hh:mm A', 'en-US');
        const nyString = `ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិ - មហាសង្រ្កាន្ត ម៉ោង ${dtKm.formatDate()} AM (Khmer New Year - Moha Sankranta at ${dtEn.formatDate()})`;
        
        expect(nyString).toBe('ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិ - មហាសង្រ្កាន្ត ម៉ោង ១០:៤៨ AM (Khmer New Year - Moha Sankranta at 10:48 AM)');
    });

    it('should format Khmer new year date 2027 correctly', () => {
        const nyDate = KhmerDate.getKhNewYearMoment(2027);
        const kd = new KhmerDate(nyDate);
        
        const combined = `${kd.toLunarDate('full')} ត្រូវនឹងថ្ងៃ${kd.toKhmerDate()}`;
        expect(combined).toBe('ថ្ងៃពុធ ៨កើត ខែចេត្រ ឆ្នាំមមែ នព្វស័ក ពុទ្ធសករាជ ២៥៧០ ត្រូវនឹងថ្ងៃទី១៤ ខែមេសា ឆ្នាំ២០២៧');
        
        const dtKm = new FormatDateTime(nyDate, 'hh:mm', 'km-KH');
        const dtEn = new FormatDateTime(nyDate, 'hh:mm A', 'en-US');
        const nyString = `ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិ - មហាសង្រ្កាន្ត ម៉ោង ${dtKm.formatDate()} PM (Khmer New Year - Moha Sankranta at ${dtEn.formatDate()})`;
        
        expect(nyString).toBe('ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិ - មហាសង្រ្កាន្ត ម៉ោង ០៤:៤៨ PM (Khmer New Year - Moha Sankranta at 04:48 PM)');
    });

    it('should be running in Node runtime', () => {
        expect(typeof process).not.toBe('undefined');
        expect(process.versions.node).toBeDefined();
    });
});
