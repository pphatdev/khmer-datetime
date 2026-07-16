'use client';

import { useState, useEffect } from 'react';
import { FormatDateTime, KhmerDate } from '@pphatdev/format-datetime';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Globe, Sparkles, Code2, ArrowRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [now, setNow] = useState<Date | null>(null);
    const [knyYear, setKnyYear] = useState('');

    // Interactive inputs
    const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
    const [formatStr, setFormatStr] = useState('DDDD d MMMM, YYYY hh:mm:ss A');
    const [locale, setLocale] = useState('km-KH');
    const [copied, setCopied] = useState(false);

    type PkgManager = 'npm' | 'bun' | 'deno';
    const [pkgManager, setPkgManager] = useState<PkgManager>('npm');

    const installCommands: Record<PkgManager, string> = {
        npm: "npm i @pphatdev/format-datetime",
        bun: "bun add @pphatdev/format-datetime",
        deno: "deno add npm:@pphatdev/format-datetime"
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(installCommands[pkgManager]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        setMounted(true);
        setNow(new Date());

        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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

    let formattedResult = '...';
    let hasError = false;

    if (mounted) {
        try {
            const dateObj = customDate ? customDate : (now || new Date());
            const fdt = new FormatDateTime(dateObj, formatStr || "dd-MM-yyyy hh:mm:ss", locale);
            formattedResult = fdt.formatDate();
        } catch (e: any) {
            formattedResult = 'Error: ' + e.message;
            hasError = true;
        }
    }

    return (
        <div className="min-h-screen font-sans w-full selection:bg-teal-500/30 relative">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <svg className="absolute inset-0 h-full w-full stroke-black/5 dark:stroke-white/5 mask-[radial-gradient(100%_100%_at_top_center,white,transparent)]">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse" x="-1" y="-1">
                            <path d="M.5 40V.5H40" fill="none" strokeDasharray="4 4" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid)" />
                </svg>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] opacity-15 dark:opacity-30 blur-[120px] bg-linear-to-r from-sky-500 via-teal-500 to-green-500 rounded-full mix-blend-multiply dark:mix-blend-screen" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl rounded-full border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <Clock className="w-5 h-5 text-teal-400" />
                    <span className="font-black mb-0.5 max-sm:hidden">KH DateTime</span>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <a href="https://github.com/pphatdev/format-datetime" target="_blank" rel="noreferrer" className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                        <svg aria-hidden="true" viewBox="0 0 24 24" version="1.1" className="w-5 h-5" fill="currentColor"><path d="M12 1C5.9225 1 1 5.9225 1 12C1 16.8675 4.14875 20.9787 8.52125 22.4362C9.07125 22.5325 9.2775 22.2025 9.2775 21.9137C9.2775 21.6525 9.26375 20.7862 9.26375 19.865C6.5 20.3737 5.785 19.1912 5.565 18.5725C5.44125 18.2562 4.905 17.28 4.4375 17.0187C4.0525 16.8125 3.5025 16.3037 4.42375 16.29C5.29 16.2762 5.90875 17.0875 6.115 17.4175C7.105 19.0812 8.68625 18.6137 9.31875 18.325C9.415 17.61 9.70375 17.1287 10.02 16.8537C7.5725 16.5787 5.015 15.63 5.015 11.4225C5.015 10.2262 5.44125 9.23625 6.1425 8.46625C6.0325 8.19125 5.6475 7.06375 6.2525 5.55125C6.2525 5.55125 7.17375 5.2625 9.2775 6.67875C10.1575 6.43125 11.0925 6.3075 12.0275 6.3075C12.9625 6.3075 13.8975 6.43125 14.7775 6.67875C16.8813 5.24875 17.8025 5.55125 17.8025 5.55125C18.4075 7.06375 18.0225 8.19125 17.9125 8.46625C18.6138 9.23625 19.04 10.2125 19.04 11.4225C19.04 15.6437 16.4688 16.5787 14.0213 16.8537C14.42 17.1975 14.7638 17.8575 14.7638 18.8887C14.7638 20.36 14.75 21.5425 14.75 21.9137C14.75 22.2025 14.9563 22.5462 15.5063 22.4362C19.8513 20.9787 23 16.8537 23 12C23 5.9225 18.0775 1 12 1Z"></path></svg>
                        {/* <span className="hidden sm:inline">GitHub</span> */}
                    </a>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col items-center pt-32 pb-24 px-4 sm:px-8 w-full max-w-6xl mx-auto gap-24">

                {/* Hero Section */}
                <section className="flex flex-col items-center text-center max-w-3xl w-full pt-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-medium mb-8">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>The Ultimate Khmer Date Utility</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                        The easiest way to handle <br className="hidden sm:block" />
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-sky-400 via-teal-400 to-green-400">
                            Khmer & Lunar Dates.
                        </span>
                    </h1>

                    <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-3xl leading-relaxed">
                        Stop struggling with complex calendar logic. Easily format local times, calculate precise Lunar phases, and predict the exact moment of the Khmer New Year with a single, elegant library.
                    </p>
                    <div className="w-full max-w-md mx-auto flex flex-col gap-2">
                        <div className="flex items-center gap-1 bg-neutral-100/80 dark:bg-neutral-900/40 p-1 rounded-lg border border-neutral-200 dark:border-white/5 w-fit mx-auto">
                            {(['npm', 'bun', 'deno'] as PkgManager[]).map((pm) => (
                                <button
                                    key={pm}
                                    onClick={() => setPkgManager(pm)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                        pkgManager === pm
                                            ? "bg-white shadow-sm text-neutral-900 dark:bg-white/10 dark:text-white"
                                            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
                                    )}
                                >
                                    {pm}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200 dark:border-white/10 p-2 pl-5 rounded-2xl w-full group hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-colors">
                            <span className="text-neutral-400 dark:text-neutral-500 font-mono select-none">$</span>
                            <code className="text-teal-600 dark:text-teal-300 text-sm md:text-base font-mono flex-1 text-left">
                                {installCommands[pkgManager]}
                            </code>
                            <button
                                onClick={handleCopy}
                                title="Copy to clipboard"
                                className="p-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors border border-transparent dark:border-white/5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white shrink-0"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Showcase Grid */}
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

                {/* Playground Section */}
                <section className="w-full">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10">
                            <Code2 className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Interactive Playground</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Controls */}
                        <div className="lg:col-span-5 bg-neutral-50/80 dark:bg-neutral-900/40 backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Select Date</label>
                                <Popover>
                                    <PopoverTrigger
                                        className={cn(
                                            "flex w-full h-12 items-center justify-start text-left font-normal bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-xl px-4 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-900 dark:text-white transition-all text-base outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500",
                                            !customDate && "text-neutral-500 dark:text-neutral-400"
                                        )}
                                    >
                                        <CalendarIcon className="mr-3 h-5 w-5 text-teal-500" />
                                        {customDate ? format(customDate, "PPP") : <span>Now (Real-time)</span>}
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-3 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-white/10 shadow-2xl flex flex-col gap-3" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={customDate}
                                            onSelect={setCustomDate}
                                            initialFocus
                                            className="rounded-xl pointer-events-auto p-0"
                                        />
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-900 dark:text-neutral-300 border border-transparent dark:border-white/5"
                                            onClick={() => setCustomDate(undefined)}
                                        >
                                            Reset to Real-time
                                        </Button>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="locale-input" className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                    Locale
                                </label>
                                <div className="relative">
                                    <Globe className="w-5 h-5 text-sky-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                        id="locale-input"
                                        className="bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white pl-11 pr-4 h-12 rounded-xl w-full outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-base appearance-none cursor-pointer"
                                        value={locale}
                                        onChange={(e) => setLocale(e.target.value)}
                                    >
                                        <option value="en-US">English (en-US)</option>
                                        <option value="km-KH">Khmer (km-KH)</option>
                                        <option value="fr-FR">French (fr-FR)</option>
                                        <option value="zh-CN">Chinese (zh-CN)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="format-input" className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Format String</label>
                                <input
                                    type="text"
                                    id="format-input"
                                    className="bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white px-4 h-12 rounded-xl w-full outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono text-sm"
                                    value={formatStr}
                                    onChange={(e) => setFormatStr(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Result output */}
                        <div className="lg:col-span-7 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-2xl border border-neutral-200 dark:border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center min-h-[250px]">
                            <div className="absolute inset-0 bg-linear-to-br from-sky-500/5 via-teal-500/5 to-green-500/5" />

                            <div className="relative z-10 flex flex-col items-start gap-4">
                                <span className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-semibold uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
                                    Formatted Output
                                </span>

                                <div className={`text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-wrap w-full leading-tight ${hasError ? 'text-red-500 dark:text-red-400' : 'text-neutral-900 dark:text-white drop-shadow-sm dark:drop-shadow-md'}`}>
                                    {formattedResult}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* Author Profile */}
            <div className="w-full pb-12 pt-8 flex flex-col items-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-3">
                    Created by
                </p>
                <a
                    href="https://pphat.me"
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 p-1.5 pr-5 rounded-full bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
                >
                    <img
                        src="https://github.com/pphatdev.png"
                        alt="PPhat"
                        className="w-9 h-9 rounded-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    />
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white leading-none flex items-center gap-1.5">
                            PPhat
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            Senior Front End Developer
                        </span>
                    </div>
                </a>
            </div>
        </div>
    );
}
