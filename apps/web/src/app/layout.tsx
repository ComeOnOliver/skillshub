import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Fira_Code } from "next/font/google";
import { Nav } from "@/components/nav";
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
  title: "SkillsHub — AI Agent Skills Registry",
  description: "Discover, share, and monetize AI agent skills. Built by degens, for degens.",
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
                <span>SkillsHub v0.1.0</span>
                <span className="text-neutral-700">|</span>
                <span>built by degens, for degens</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors">
                  github
                </a>
                <span className="text-neutral-800">│</span>
                <a href="/skills" className="hover:text-neon-cyan transition-colors">
                  registry
                </a>
                <span className="text-neutral-800">│</span>
                <span className="text-neutral-700">
                  {"{"}BSC mainnet{"}"}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
