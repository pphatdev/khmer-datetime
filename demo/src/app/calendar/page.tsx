'use client';

import { ThemeToggle } from "@/components/theme-toggle";
import { LunarCalendarWidget } from "@/components/lunar-calendar-widget";
import { Clock, Home } from "lucide-react";
import pkg from '../../../../package.json';
import Link from 'next/link';
import Header from '@/components/sections/header'
import Footer from '@/components/sections/footer'

export default function CalendarPage() {
    return (
        <div className="min-h-screen font-sans w-full selection:bg-teal-500/30 relative flex flex-col items-center">
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
            </div>

            <Header />

            <main className="relative z-10 flex flex-col items-center pt-32 pb-24 px-4 sm:px-8 w-full max-w-7xl mx-auto flex-1">
                <section className="w-full">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Lunar Calendar</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
                            A fully interactive calendar synchronized with the Khmer lunar cycle.
                        </p>
                    </div>
                    <LunarCalendarWidget />
                </section>
            </main>

            {/* Footer */}
            <Footer/>
        </div>
    );
}
