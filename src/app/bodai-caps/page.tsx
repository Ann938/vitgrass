import type { Metadata } from "next";
import Landing from "@/components/Landing";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

// тест: вариант BODAI с заголовками заглавными, как в гайдлайне
export const metadata: Metadata = { icons: { icon: `${base}/img/bodai/mark.png` } };

export default function BodaiCaps() {
  return <Landing brand="bodai" caps />;
}
