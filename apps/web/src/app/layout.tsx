import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { Fira_Code } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Nav } from "@/components/nav";
import { APP_VERSION } from "@/lib/version";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://skillshub.wtf"),
  title: "SkillsHub — AI Agent Skills Registry",
  description:
    "Discover AI agent skills. One API call to find the right skill for any task.",
  openGraph: {
    title: "SkillsHub — AI Agent Skills Registry",
    description:
      "Discover AI agent skills. One API call to find the right skill for any task.",
    url: "https://skillshub.wtf",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SkillsHub — AI Agent Skills Registry",
    description:
      "Discover AI agent skills. One API call to find the right skill for any task.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${firaCode.variable} antialiased bg-[#050505] text-neutral-100`}
      >
        <Nav />
        <main>{children}</main>
        <footer className="border-t border-neutral-800/50 mt-24">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-600">
              <div className="flex items-center gap-2">
                <span className="text-neon-cyan/50">&gt;_</span>
                <span>SkillsHub v{APP_VERSION}</span>
                <span className="text-neutral-700">|</span>
                <span>built by degens, for degens</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://github.com/ComeOnOliver/skillshub" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors">
                  github
                </a>
                <span className="text-neutral-800">│</span>
                <Link href="/skills" className="hover:text-neon-cyan transition-colors">
                  registry
                </Link>
                <span className="text-neutral-800">│</span>
                <span className="text-neutral-700">
                  {"{"}BSC mainnet{"}"}
                </span>
              </div>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
