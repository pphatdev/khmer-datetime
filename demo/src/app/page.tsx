'use client';

import { useState, useEffect } from 'react';
import { FormatDateTime, KhmerDate } from '@pphatdev/format-datetime';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Globe, Sparkles, Code2, ArrowRight, Copy, Check, BookOpen } from "lucide-react";
import pkg from '../../package.json';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme-toggle";

function CodeSnippet({ code, children }: { code: string, children: React.ReactNode }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group bg-[#0d1117] dark:bg-black rounded-xl border border-neutral-200/10 dark:border-white/10 mt-auto">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/5 z-10"
                title="Copy code"
            >
                {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-neutral-300 leading-relaxed pr-8">
                    {children}
                </pre>
            </div>
        </div>
    );
}

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

        if (typeof navigator !== 'undefined' && navigator.language) {
            const lang = navigator.language.toLowerCase();
            if (lang.startsWith('en')) setLocale('en-US');
            else if (lang.startsWith('fr')) setLocale('fr-FR');
            else if (lang.startsWith('zh')) setLocale('zh-CN');
            // defaults to 'km-KH'
        }

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

                {/* Main Ambient Lights */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 dark:opacity-30 blur-[120px] bg-linear-to-r from-sky-500 via-teal-500 to-green-500 rounded-full mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] opacity-10 dark:opacity-20 blur-[150px] bg-teal-500 rounded-full mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute top-[60%] right-[-10%] w-[600px] h-[600px] opacity-10 dark:opacity-20 blur-[150px] bg-sky-500 rounded-full mix-blend-multiply dark:mix-blend-screen" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl rounded-full border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/10 backdrop-blur-md px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <Clock className="w-5 h-5 text-teal-400" />
                    <span className="font-black mb-0.5 max-sm:hidden">KH DateTime</span>
                    <span className="text-[10px] font-mono bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full mb-0.5 border border-teal-500/20 max-sm:hidden">
                        v{pkg.version}
                    </span>
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

                {/* How to Use / Documentation Section */}
                <section className="w-full flex flex-col gap-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10">
                            <BookOpen className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Quick Start Guide</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Example 1 */}
                        <div className="bg-neutral-50/80 dark:bg-neutral-900/40 backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-3xl p-6 flex flex-col gap-4 hover:border-teal-500/30 transition-colors">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">1. Basic Formatting</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Format any standard JavaScript Date object into localized strings using familiar tokens.</p>
                            <CodeSnippet code={`import { FormatDateTime } from '@pphatdev/format-datetime';\n\nconst date = new Date();\nconst formatted = FormatDateTime.format(date, 'DD MMMM YYYY', 'km');\n// Result: "០១ មករា ២០២៤"`}>
                                <code className="text-[#ff7b72]">import</code> {'{ '}FormatDateTime{' }'} <code className="text-[#ff7b72]">from</code> <code className="text-[#a5d6ff]">'@pphatdev/format-datetime'</code>;<br /><br />
                                <code className="text-[#ff7b72]">const</code> date = <code className="text-[#ff7b72]">new</code> <code className="text-[#d2a8ff]">Date</code>();<br />
                                <code className="text-[#ff7b72]">const</code> formatted = <code className="text-[#79c0ff]">FormatDateTime</code>.<code className="text-[#d2a8ff]">format</code>(date, <code className="text-[#a5d6ff]">'DD MMMM YYYY'</code>, <code className="text-[#a5d6ff]">'km'</code>);<br />
                                <code className="text-[#8b949e]">// Result: &quot;<span className="font-[family-name:var(--font-kantumruy)]">០១ មករា ២០២៤</span>&quot;</code>
                            </CodeSnippet>
                        </div>

                        {/* Example 2 */}
                        <div className="bg-neutral-50/80 dark:bg-neutral-900/40 backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-3xl p-6 flex flex-col gap-4 hover:border-teal-500/30 transition-colors">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">2. Lunar Date Conversion</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Instantly convert Gregorian dates into the traditional Khmer Lunar calendar system.</p>
                            <CodeSnippet code={`import { FormatDateTime } from '@pphatdev/format-datetime';\n\nconst date = new Date();\nconst lunar = FormatDateTime.getLunarDate(date);\n// Result: "ថ្ងៃចន្ទ ទី១ ខែមករា ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៨"`}>
                                <code className="text-[#ff7b72]">import</code> {'{ '}FormatDateTime{' }'} <code className="text-[#ff7b72]">from</code> <code className="text-[#a5d6ff]">'@pphatdev/format-datetime'</code>;<br /><br />
                                <code className="text-[#ff7b72]">const</code> date = <code className="text-[#ff7b72]">new</code> <code className="text-[#d2a8ff]">Date</code>();<br />
                                <code className="text-[#ff7b72]">const</code> lunar = <code className="text-[#79c0ff]">FormatDateTime</code>.<code className="text-[#d2a8ff]">getLunarDate</code>(date);<br />
                                <code className="text-[#8b949e]">// Result: &quot;<span className="font-[family-name:var(--font-kantumruy)]">ថ្ងៃចន្ទ ទី១ ខែមករា ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៨</span>&quot;</code>
                            </CodeSnippet>
                        </div>

                        {/* Example 3 */}
                        <div className="lg:col-span-2 bg-neutral-50/80 dark:bg-neutral-900/40 backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-6 hover:border-teal-500/30 transition-colors">
                            <div className="flex flex-col gap-4 md:w-1/3">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">3. Khmer New Year Calculation</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">Calculate the exact time and date of the Khmer New Year (Moha Sangkran) for any given year.</p>
                            </div>
                            <div className="md:w-2/3">
                                <CodeSnippet code={`import { FormatDateTime } from '@pphatdev/format-datetime';\n\nconst kny = FormatDateTime.getKhmerNewYear(2024);\nconsole.log(kny);\n/* \nResult: {\n  date: "2024-04-13T15:17:00.000Z",\n  lunarDate: "ថ្ងៃសៅរ៍ ទី៥ ខែចេត្រ ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៨",\n  angel: "មហោធរៈទេវី"\n}\n*/`}>
                                    <code className="text-[#ff7b72]">import</code> {'{ '}FormatDateTime{' }'} <code className="text-[#ff7b72]">from</code> <code className="text-[#a5d6ff]">'@pphatdev/format-datetime'</code>;<br /><br />
                                    <code className="text-[#ff7b72]">const</code> kny = <code className="text-[#79c0ff]">FormatDateTime</code>.<code className="text-[#d2a8ff]">getKhmerNewYear</code>(<code className="text-[#79c0ff]">2024</code>);<br />
                                    <code className="text-[#79c0ff]">console</code>.<code className="text-[#d2a8ff]">log</code>(kny);<br />
                                    <code className="text-[#8b949e]">/*
                                        Result: {'{'}
                                        date: "2024-04-13T15:17:00.000Z",
                                        lunarDate: &quot;<span className="font-[family-name:var(--font-kantumruy)]">ថ្ងៃសៅរ៍ ទី៥ ខែចេត្រ ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៨</span>&quot;,
                                        angel: &quot;<span className="font-[family-name:var(--font-kantumruy)]">មហោធរៈទេវី</span>&quot;
                                        {'}'}
                                        */</code>
                                </CodeSnippet>
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
                            <div className="flex flex-col gap-2">
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
                                <div className="flex flex-wrap items-center gap-2 pt-2">
                                    <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">Try:</span>
                                    {['DDD MMMM YYYY', 'DDD MM YYYY hh:mm A', 'DDDD d MMMM', 'hh:mm:ss A', 'ថ្ងៃlW ទីldlN ខែlM', 'ឆ្នាំlA ព.ស. BBBB'].map((fmt) => (
                                        <button key={fmt} onClick={() => setFormatStr(fmt)} className="text-[11px] px-2 py-1 bg-black/5 dark:bg-white/5 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 text-neutral-600 dark:text-neutral-400 border border-transparent hover:border-teal-500/20 rounded-md transition-colors font-mono" >
                                            {fmt}
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-4 mt-2 border-t border-neutral-200 dark:border-white/5 space-y-4">
                                    <div>
                                        <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">Standard Tokens</p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-2 gap-x-2 text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                                            <div><span className="text-teal-600 dark:text-teal-400 font-bold">YYYY</span> Year</div>
                                            <div><span className="text-teal-600 dark:text-teal-400 font-bold">MMMM</span> Month</div>
                                            <div><span className="text-teal-600 dark:text-teal-400 font-bold">DDDD</span> Day</div>
                                            <div><span className="text-teal-600 dark:text-teal-400 font-bold">dd</span> Date</div>
                                            <div><span className="text-teal-600 dark:text-teal-400 font-bold">hh</span> 12 Hour</div>
                                            <div><span className="text-teal-600 dark:text-teal-400 font-bold">HH</span> 24 Hour</div>
                                            <div><span className="text-teal-600 dark:text-teal-400 font-bold">mm</span> Minute</div>
                                            <div><span className="text-teal-600 dark:text-teal-400 font-bold">ss</span> Second</div>
                                            <div><span className="text-teal-600 dark:text-teal-400 font-bold">A</span> AM/PM</div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">Lunar Tokens</p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-2 gap-x-2 text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                                            <div><span className="text-purple-500 dark:text-purple-400 font-bold">BBBB</span> BE Year</div>
                                            <div><span className="text-purple-500 dark:text-purple-400 font-bold">JJJJ</span> JS Year</div>
                                            <div><span className="text-purple-500 dark:text-purple-400 font-bold">lA</span> Animal</div>
                                            <div><span className="text-purple-500 dark:text-purple-400 font-bold">lE</span> Sak</div>
                                            <div><span className="text-purple-500 dark:text-purple-400 font-bold">lM</span> Month</div>
                                            <div><span className="text-purple-500 dark:text-purple-400 font-bold">ld</span> Day Num</div>
                                            <div><span className="text-purple-500 dark:text-purple-400 font-bold">lN</span> Phase</div>
                                            <div><span className="text-purple-500 dark:text-purple-400 font-bold">lW</span> Weekday</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Result output */}
                        <div className="lg:col-span-7 relative group flex">
                            {/* Animated background glow */}
                            <div className="absolute -inset-0.5 bg-linear-to-r from-teal-500 via-sky-500 to-green-500 rounded-[2rem] blur-xl opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />

                            <div className="bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-3xl border border-neutral-200 dark:border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex flex-col justify-center min-h-[300px] w-full">
                                {/* Ambient light orbs */}
                                <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full" />
                                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full" />

                                {/* Grid Pattern */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_50%,transparent_100%)]"></div>

                                <div className="relative z-10 flex flex-col items-start gap-8 w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]"></span>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
                                            Live Output
                                        </span>
                                    </div>

                                    <div className={`text-4xl md:text-5xl lg:text-[4rem] font-bold tracking-tight text-wrap w-full leading-[1.2] pb-2 ${hasError
                                        ? 'text-red-500 dark:text-red-400'
                                        : 'bg-linear-to-br from-neutral-800 to-neutral-400 dark:from-white dark:to-neutral-500 bg-clip-text text-transparent'
                                        }`}>
                                        {formattedResult}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer Area */}
            <div className="relative w-full pb-16 pt-16 flex flex-col items-center overflow-hidden mt-12">
                {/* Clean Top Border Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-2xl h-px bg-linear-to-r from-transparent via-neutral-300 dark:via-white/20 to-transparent" />

                {/* Ambient bottom glow effect */}
                <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 dark:bg-teal-500/20 blur-[100px] rounded-[100%] pointer-events-none" />

                <p className="relative z-10 text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-3">
                    Created by
                </p>
                <div className="relative z-10 group">

                    <a
                        href="https://pphat.me"
                        target="_blank"
                        rel="noreferrer"
                        className="relative flex items-center gap-3 p-1.5 pr-5 rounded-full bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 backdrop-blur-xl"
                    >
                        <img
                            src="https://github.com/pphatdev.png"
                            alt="PPhat"
                            className="w-10 h-10 rounded-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
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
        </div>
    );
}
