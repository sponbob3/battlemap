import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BattleMap — Interactive Battle Explanations",
  description:
    "Animated, AI-researched battle visualizations for history enthusiasts and students of military strategy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} ${playfair.variable} dark`}
    >
      <body className="bg-[#0a0e14] text-[#e0d8c8] antialiased font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
