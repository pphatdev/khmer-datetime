'use client';

import { useState } from 'react';
import { Check, Copy } from "lucide-react";

export function CodeSnippet({ code, children }: { code: string, children: React.ReactNode }) {
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
