import type { Metadata } from "next";
import { Kantumruy_Pro, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const kantumruyPro = Kantumruy_Pro({ 
    subsets: ['khmer'], 
    variable: '--font-kantumruy' 
});

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-poppins'
});

export const metadata: Metadata = {
    title: "FormatDateTime Demo",
    description: "A beautiful interactive demo for @pphatdev/format-datetime",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={cn(poppins.variable, kantumruyPro.variable, "font-sans")} suppressHydrationWarning>
            <body className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-white dark:bg-black text-neutral-900 dark:text-white transition-colors duration-300">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
