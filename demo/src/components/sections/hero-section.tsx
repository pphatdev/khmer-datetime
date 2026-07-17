'use client';

import { useState } from 'react';
import { Sparkles, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type PkgManager = 'npm' | 'bun' | 'deno';

const installCommands: Record<PkgManager, string> = {
    npm: "npm i @pphatdev/format-datetime",
    bun: "bun add @pphatdev/format-datetime",
    deno: "deno add npm:@pphatdev/format-datetime"
};

export function HeroSection() {
    const [pkgManager, setPkgManager] = useState<PkgManager>('npm');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(installCommands[pkgManager]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
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
    );
}
