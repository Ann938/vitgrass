import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Montserrat, Montserrat_Alternates } from "next/font/google";
import { site } from "@/content";
import "@/styles/globals.scss";

// Шрифты макета: заголовки — Montserrat Alternates, тексты — Manrope, кнопки — Inter
const display = Montserrat_Alternates({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
});
const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});
// тест /bodai-caps: заголовки заглавными обычным Montserrat, как на слайдах гайдлайна BODAI
const caps = Montserrat({
  variable: "--font-caps",
  subsets: ["latin", "cyrillic"],
  weight: ["700"],
});
const btn = Inter({
  variable: "--font-btn",
  subsets: ["latin", "cyrillic"],
  weight: ["500"],
});

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  // черновик на GitHub Pages не индексируется
  robots: process.env.PAGES_EXPORT === "1" ? { index: false, follow: false } : undefined,
  title: site.title,
  description: site.description,
  icons: { icon: `${base}/img/logo.png` },
  openGraph: { title: site.title, description: site.description, type: "website", locale: "ru_RU" },
};

export const viewport: Viewport = {
  themeColor: "#f3f3f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable} ${btn.variable} ${caps.variable}`}>
      <body>{children}</body>
    </html>
  );
}
