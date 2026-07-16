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
        const dt = new FormatDateTime(date, 'hh:mm:ss A', 'en-US');
        expect(dt.formatDate()).toBe('02:30:45 PM');
    });

    it('should correctly format Khmer (km-KH) numeric tokens', () => {
        const date = new Date(2026, 6, 13);
        const dt = new FormatDateTime(date, 'YYYY', 'km-KH');
        // 2026 in Khmer numerals is ២០២៦
        expect(dt.formatDate()).toBe('២០២៦');
    });

    it('should output Khmer time-of-day phrases', () => {
        const morningDate = new Date(2026, 6, 13, 9, 0, 0); // 9 AM
        const dtMorning = new FormatDateTime(morningDate, 'a', 'km-KH');
        expect(dtMorning.formatDate()).toBe('ព្រឹក'); // Morning

        const afternoonDate = new Date(2026, 6, 13, 14, 0, 0); // 2 PM
        const dtAfternoon = new FormatDateTime(afternoonDate, 'a', 'km-KH');
        expect(dtAfternoon.formatDate()).toBe('រសៀល'); // Afternoon
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
