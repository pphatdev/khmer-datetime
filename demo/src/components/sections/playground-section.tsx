'use client';

import { useState } from 'react';
import { Code2, Globe, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormatDateTime } from '@pphatdev/format-datetime';

interface PlaygroundSectionProps {
    mounted: boolean;
    now: Date | null;
}

export function PlaygroundSection({ mounted, now }: PlaygroundSectionProps) {
    const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
    const [formatStr, setFormatStr] = useState('DDDD d MMMM, YYYY hh:mm:ss A');
    const [locale, setLocale] = useState('km-KH');

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
                                    autoFocus
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
    );
}
