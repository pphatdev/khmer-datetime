'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import { FormatDateTime } from '@pphatdev/format-datetime';
import { ChevronLeft, ChevronRight, MoonStar, Globe, X, Calendar as CalendarIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function LunarCalendarWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [locale, setLocale] = useState('km-KH');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setMounted(true);
    }, []);

    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
        
        const previousMonthLastDay = new Date(year, month, 0).getDate();
        
        const days = [];

        const getLunarInfo = (date: Date) => {
            try {
                const fdt = new FormatDateTime(date, "ld|lN", locale);
                const [lunarDayNum, lunarPhase] = fdt.formatDate().split('|');
                return { lunarDayNum, lunarPhase };
            } catch(e) {
                return { lunarDayNum: "?", lunarPhase: "" };
            }
        };
        
        // Previous month days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, previousMonthLastDay - i);
            days.push({ date, isCurrentMonth: false, ...getLunarInfo(date) });
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            days.push({ date, isCurrentMonth: true, ...getLunarInfo(date) });
        }
        
        // Next month days to fill the grid (usually 42 cells total for 6 rows)
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false, ...getLunarInfo(date) });
        }
        
        return days;
    }, [currentDate, locale]);

    const nextMonth = () => {
        startTransition(() => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        });
    };

    const prevMonth = () => {
        startTransition(() => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        });
    };

    const jumpToToday = () => {
        startTransition(() => {
            setCurrentDate(new Date());
        });
    };


    const monthNames = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => {
            return new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, i, 1));
        });
    }, [locale]);

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2000, 0, 2 + i)); // 2000-01-02 is Sunday
        });
    }, [locale]);

    const today = new Date();
    const isToday = (date: Date) => {
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    if (!mounted) return null;

    return (
        <div className="w-full relative group">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-teal-500/30 via-purple-500/30 to-sky-500/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            
            <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border border-neutral-200 dark:border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col w-full">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-500/10 dark:bg-teal-500/20 rounded-2xl border border-teal-500/20 shadow-inner">
                            <MoonStar className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2 tracking-tight">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                                {(() => {
                                    try {
                                        const fdt = new FormatDateTime(currentDate, "ឆ្នាំlA ព.ស. BBBB", locale);
                                        return fdt.formatDate();
                                    } catch(e) {
                                        return "Lunar Calendar";
                                    }
                                })()}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <Select value={locale} onValueChange={(v) => startTransition(() => setLocale(v))}>
                                <SelectTrigger className="w-[160px] bg-neutral-100/80 dark:bg-white/5 border border-neutral-200/50 dark:border-white/10 text-neutral-900 dark:text-white rounded-xl backdrop-blur-md focus:ring-teal-500 focus:border-teal-500 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-neutral-500" />
                                        <SelectValue placeholder="Language" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="z-[150]">
                                    <SelectItem value="km-KH">Khmer (km-KH)</SelectItem>
                                    <SelectItem value="en-US">English (en-US)</SelectItem>
                                    <SelectItem value="fr-FR">French (fr-FR)</SelectItem>
                                    <SelectItem value="zh-CN">Chinese (zh-CN)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-100/80 dark:bg-white/5 p-1.5 rounded-2xl border border-neutral-200/50 dark:border-white/5 backdrop-blur-md">
                            <button 
                                onClick={prevMonth}
                                className="p-2 rounded-xl hover:bg-white hover:shadow-sm dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-all duration-200"
                            >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={jumpToToday}
                            className="px-4 py-2 text-sm font-bold rounded-xl hover:bg-white hover:shadow-sm dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 transition-all duration-200"
                        >
                            Today
                        </button>
                        <button 
                            onClick={nextMonth}
                            className="p-2 rounded-xl hover:bg-white hover:shadow-sm dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-all duration-200"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
                <div className="w-full relative z-10">
                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-4">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className={cn("grid grid-cols-7 gap-1 md:gap-2", isPending && "opacity-50 transition-opacity duration-200")}>
                        {calendarData.map((cell, index) => {
                            const isCurrent = cell.isCurrentMonth;
                            const isTodayCell = isToday(cell.date);
                            
                            const { lunarDayNum, lunarPhase } = cell;
                            
                            const isFullMoon = lunarDayNum === "១៥" && lunarPhase.includes("កើត");
                            const isNewMoon = lunarDayNum === "១៥" && lunarPhase.includes("រោច"); 

                            return (
                                <div 
                                    key={index}
                                    onClick={() => setSelectedDate(cell.date)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center p-2 md:p-3 min-h-[70px] md:min-h-[90px] rounded-2xl border transition-all duration-300 group/cell overflow-hidden cursor-pointer",
                                        isCurrent 
                                            ? "bg-white/40 dark:bg-white/5 border-neutral-200/60 dark:border-white/5 hover:border-teal-500/30 hover:bg-teal-500/5 dark:hover:bg-teal-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10" 
                                            : "bg-transparent border-transparent opacity-30",
                                        isTodayCell && "ring-2 ring-teal-500/50 border-teal-500/50 bg-teal-500/10 dark:bg-teal-500/20 shadow-md shadow-teal-500/10"
                                    )}
                                >
                                    {/* Highlights for Full/New Moon */}
                                    {isCurrent && isFullMoon && (
                                        <div className="absolute top-2 right-2 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,1)]" title="Full Moon" />
                                    )}
                                    {isCurrent && isNewMoon && (
                                        <div className="absolute top-2 right-2 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-slate-800 dark:bg-slate-300 shadow-[0_0_10px_rgba(100,116,139,0.5)]" title="New Moon" />
                                    )}

                                    <span className={cn(
                                        "text-lg md:text-xl font-bold z-10",
                                        isTodayCell ? "text-teal-700 dark:text-teal-400" : (isCurrent ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-500")
                                    )}>
                                        {cell.date.getDate()}
                                    </span>
                                    
                                    <div className="flex flex-col items-center mt-1.5 z-10">
                                        <span className={cn(
                                            "text-[11px] md:text-xs font-medium leading-none font-[family-name:var(--font-kantumruy)]",
                                            isCurrent ? "text-teal-600/80 dark:text-teal-400/80" : "text-neutral-400/50"
                                        )}>
                                            {lunarDayNum}
                                        </span>
                                        <span className={cn(
                                            "text-[9px] md:text-[10px] mt-1 font-[family-name:var(--font-kantumruy)]",
                                            isCurrent ? "text-neutral-500 dark:text-neutral-400" : "text-neutral-400/40"
                                        )}>
                                            {lunarPhase}
                                        </span>
                                    </div>
                                    
                                    {/* Hover overlay effect */}
                                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-teal-500/5 opacity-0 group-hover/cell:opacity-100 rounded-2xl transition-opacity pointer-events-none" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Custom Drawer Overlay */}
            <div 
                className={cn(
                    "fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 transition-all duration-300",
                    selectedDate ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            >
                {/* Backdrop */}
                <div 
                    className={cn(
                        "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                        selectedDate ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                    )}
                    onClick={() => setSelectedDate(null)}
                />

                {/* Drawer Content */}
                <div 
                    className={cn(
                        "relative w-full sm:w-[450px] bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl border-t sm:border border-neutral-200 dark:border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl transition-all duration-300 ease-out transform pointer-events-auto",
                        selectedDate ? "translate-y-0 scale-100" : "translate-y-full sm:translate-y-12 sm:scale-95 opacity-0 pointer-events-none"
                    )}
                >
                    <div className="flex items-center justify-between p-6 border-b border-neutral-200/50 dark:border-white/10">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                            <CalendarIcon className="w-5 h-5 text-teal-500" />
                            Date Details
                        </h3>
                        <button 
                            onClick={() => setSelectedDate(null)}
                            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {selectedDate && (
                            <>
                                {/* Gregorian Date */}
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                        <Globe className="w-3.5 h-3.5" /> Gregorian
                                    </div>
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(selectedDate)}
                                    </div>
                                </div>

                                {/* Lunar Date */}
                                <div className="space-y-3 p-4 bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                                    <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <MoonStar className="w-3.5 h-3.5" /> Khmer Lunar
                                    </div>
                                    <div className="text-lg md:text-xl font-medium font-[family-name:var(--font-kantumruy)] text-neutral-800 dark:text-neutral-200 leading-relaxed">
                                        {(() => {
                                            try {
                                                const fdt = new FormatDateTime(selectedDate, "ថ្ងៃlW ទីldlN ខែlM ឆ្នាំlA lE ព.ស. BBBB", locale);
                                                return fdt.formatDate();
                                            } catch (e) {
                                                return "Unable to format lunar date.";
                                            }
                                        })()}
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-2 p-3 bg-neutral-100/50 dark:bg-white/5 rounded-xl text-sm text-neutral-600 dark:text-neutral-400">
                                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>Lunar details are provided by the <code className="text-xs bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">@pphatdev/format-datetime</code> utility.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
