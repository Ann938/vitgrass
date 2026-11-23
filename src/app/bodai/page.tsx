import type { Metadata } from "next";
import Landing from "@/components/Landing";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

// вариант для сравнения: логотип и палитра из гайдлайна BODAI, Алина остаётся лицом бренда
export const metadata: Metadata = { icons: { icon: `${base}/img/bodai/mark.png` } };

export default function Bodai() {
  return <Landing brand="bodai" />;
}
