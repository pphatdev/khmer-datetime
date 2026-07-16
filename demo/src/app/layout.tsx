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
    title: {
        default: "KH DateTime Formatter | Modern Localization Utility",
        template: "%s | KH DateTime",
    },
    description: "A robust, lightweight TypeScript utility to format dates and times into localized strings, with first-class support for Khmer standard and lunar calendars.",
    keywords: [
        "khmer date formatter", 
        "khmer lunar calendar", 
        "javascript date format", 
        "typescript date format", 
        "pphatdev", 
        "format-datetime", 
        "cambodia datetime"
    ],
    authors: [{ name: "PPhat", url: "https://pphat.me" }],
    creator: "PPhat",
    publisher: "PPhat",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://format-datetime.pphat.me",
        title: "KH DateTime Formatter | Modern Localization Utility",
        description: "A robust, lightweight TypeScript utility to format dates and times into localized strings, featuring built-in Khmer Lunar support.",
        siteName: "KH DateTime Formatter",
    },
    twitter: {
        card: "summary_large_image",
        title: "KH DateTime Formatter | Modern Localization Utility",
        description: "A robust, lightweight TypeScript utility to format dates and times into localized strings, featuring built-in Khmer Lunar support.",
        creator: "@pphatdev",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
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
