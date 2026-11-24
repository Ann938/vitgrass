import type { Metadata } from "next";
import Landing from "@/components/Landing";

// тест: сплошное пшеничное поле на фоне (только локально, не публикуется)
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <Landing brand="bodai" bg="field" />;
}
