import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caption the City",
  description: "Photos of New York, captioned by AI and ranked by Columbia students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <footer className="border-t border-black/10 bg-zinc-50 py-6 text-center text-xs text-zinc-500 dark:border-white/10 dark:bg-black">
          Caption the City · a Columbia class project ·{" "}
          <Link href="/jokes" className="underline hover:text-black dark:hover:text-white">
            Jokes
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="underline hover:text-black dark:hover:text-white">
            Privacy
          </Link>
        </footer>
      </body>
    </html>
  );
}
