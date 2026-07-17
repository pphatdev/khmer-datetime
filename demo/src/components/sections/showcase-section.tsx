'use client';

import { useState } from 'react';
import { Clock, Sparkles } from "lucide-react";
import { FormatDateTime, KhmerDate } from '@pphatdev/format-datetime';

interface ShowcaseSectionProps {
    mounted: boolean;
    now: Date | null;
}

export function ShowcaseSection({ mounted, now }: ShowcaseSectionProps) {
    const [knyYear, setKnyYear] = useState('');

    let liveTime = 'Loading...';
    let lunarTime = 'Loading...';
    let newYearTime = 'Loading...';

    if (mounted && now) {
        try {
            const liveFdt = new FormatDateTime(now, "DDDD d MMMM, YYYY hh:mm:ss A", "km-KH");
            liveTime = liveFdt.formatDate();
            if (typeof liveFdt.formatLunarDate === 'function') {
                lunarTime = liveFdt.formatLunarDate('full');
            } else {
                lunarTime = "Lunar formatting not available";
            }

            const currentYear = knyYear ? parseInt(knyYear, 10) : now.getFullYear();
            const safeYear = isNaN(currentYear) || currentYear < 1 ? now.getFullYear() : currentYear;
            const nyMoment = KhmerDate.getKhNewYearMoment(safeYear);
            const nyFdt = new FormatDateTime(nyMoment, "DDDD d MMMM, YYYY hh:mm:ss A", "km-KH");
            newYearTime = nyFdt.formatDate();
        } catch (e) {
            liveTime = 'Error computing time';
            lunarTime = 'Error computing lunar time';
            newYearTime = 'Error computing New Year';
        }
    }

    return (
        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Time Card */}
            <div className="md:col-span-2 bg-neutral-50/80 dark:bg-neutral-900/40 backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-3xl p-8 hover:border-neutral-300 dark:hover:border-white/10 transition-colors group">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Live Time
                    </span>
                    <span className="px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 text-xs font-mono">km-KH</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-neutral-900 dark:text-white tracking-tight leading-tight group-hover:text-teal-700 dark:group-hover:text-teal-50 transition-colors">
                    {liveTime}
                </h2>
            </div>

            {/* Lunar Date Card */}
            <div className="bg-neutral-50/80 dark:bg-neutral-900/40 backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-3xl p-8 hover:border-neutral-300 dark:hover:border-white/10 transition-colors group">
                <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold block mb-8">
                    Lunar Date
                </span>
                <h3 className="text-2xl sm:text-3xl font-medium text-neutral-700 dark:text-neutral-200 leading-tight">
                    {lunarTime}
                </h3>
            </div>

            {/* Khmer New Year Card */}
            <div className="md:col-span-3 bg-neutral-50/80 dark:bg-neutral-900/40 backdrop-blur-xl border border-teal-500/20 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-r from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <span className="text-xs uppercase tracking-widest text-teal-600 dark:text-teal-500 font-semibold flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4" /> Khmer New Year Calculator
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-medium text-neutral-900 dark:text-white">
                            {newYearTime}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3 bg-white/50 dark:bg-black/50 p-2 rounded-xl border border-neutral-200 dark:border-white/10 w-full md:w-auto">
                        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 px-2">Target Year:</span>
                        <input
                            type="number"
                            value={knyYear}
                            onChange={(e) => setKnyYear(e.target.value)}
                            placeholder={mounted && now ? now.getFullYear().toString() : ''}
                            className="bg-transparent text-neutral-900 dark:text-white px-3 py-2 rounded-lg w-24 md:w-28 text-center font-mono outline-none focus:bg-black/5 dark:focus:bg-white/5 transition-all"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
