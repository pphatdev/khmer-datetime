import { BookOpen } from "lucide-react";
import { CodeSnippet } from "@/components/ui/code-snippet";

export function QuickStartSection() {
    return (
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
    );
}
