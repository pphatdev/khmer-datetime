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
        expect(dt.formatDate()).toBe('2026-07-13 (2570) បឋមាសាឍ 13 រោច មមី អដ្ឋស័ក');
    });

    it('should format lunar date correctly via KhmerDate presets', () => {
        const date = new Date(2026, 6, 13); // July 13, 2026
        const kd = new KhmerDate(date);
        
        expect(kd.toLunarDate('full')).toBe('ថ្ងៃចន្ទ ១៣រោច ខែបឋមាសាឍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០');
        expect(kd.toLunarDate('short')).toBe('១៣រោច ខែបឋមាសាឍ');
        expect(kd.toLunarDate('medium')).toBe('១៣រោច ខែបឋមាសាឍ ព.ស. ២៥៧០');
    });

    it('should format custom lunar date correctly via KhmerDate', () => {
        const date = new Date(2026, 6, 13); // July 13, 2026
        const kd = new KhmerDate(date);
        expect(kd.toLunarDate('lW ldd lN lM')).toBe('ចន្ទ ១៣ រោច បឋមាសាឍ');
    });

    it('should be running in Node runtime', () => {
        expect(typeof process).not.toBe('undefined');
        expect(process.versions.node).toBeDefined();
    });
});
