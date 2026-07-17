import { ShieldCheck } from "lucide-react";

export default function Footer() {
    return (
        <div className="relative w-full pb-16 pt-16 flex flex-col items-center overflow-hidden mt-12" >
            {/* Clean Top Border Effect */}
            < div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-2xl h-px bg-linear-to-r from-transparent via-neutral-300 dark:via-white/20 to-transparent" />

            {/* Ambient bottom glow effect */}
            < div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 dark:bg-teal-500/20 blur-[100px] rounded-[100%] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-8">

                {/* Creator Credit */}
                <div className="flex flex-col items-center group">
                    <div className="flex max-w-xs:flex-col gap-4 items-center">
                        <a href="https://www.npmjs.com/package/@pphatdev/format-datetime" target="_blank" rel="noreferrer" className="relative flex items-center gap-3 p-1.5 pr-5 rounded-full bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 backdrop-blur-xl" >
                            <p className="text-sm text-neutral-500 absolute -top-6 dark:text-neutral-400 font-medium">Verified</p>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-bold text-neutral-900 dark:text-white leading-none flex items-center gap-1.5">
                                    NPM Provenance
                                </span>
                                <span className="text-[11px] mt-0.5 text-neutral-500 dark:text-neutral-400">
                                    Provenance
                                </span>
                            </div>
                        </a>
                        <a href="https://pphat.me" target="_blank" rel="noreferrer" className="relative flex items-center gap-3 p-1.5 pr-5 rounded-full bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 backdrop-blur-xl" >
                            <p className="text-sm text-neutral-500 absolute -top-6 dark:text-neutral-400 font-medium">Created by</p>
                            <img src="https://github.com/pphatdev.png" alt="PPhat" className="w-10 h-10 rounded-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-bold text-neutral-900 dark:text-white leading-none flex items-center gap-1.5">
                                    PPhat
                                </span>
                                <span className="text-[11px] mt-0.5 text-neutral-500 dark:text-neutral-400">
                                    Senior Front End Developer
                                </span>
                            </div>
                        </a>

                    </div>
                </div>
            </div>
        </div>
    );
}