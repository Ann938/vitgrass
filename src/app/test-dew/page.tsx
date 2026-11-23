import type { Metadata } from "next";
import Landing from "@/components/Landing";

// тест: фон страницы — капли росы (основной сайт не меняется)
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <Landing brand="bodai" bg="dew" />;
}
