// Снимок всей страницы для сверки с макетом: прокручивает до конца (появление блоков), снимает и режет на куски.
// node scripts/full.mjs <url> <out-prefix> <width> <height> [webkit]
import { chromium, webkit } from "playwright";
import sharp from "sharp";
const [, , url, out, w = "1440", h = "900", eng] = process.argv;
const mobile = +w < 800;
const engine = eng === "webkit" ? webkit : chromium;
const exe = engine === chromium ? process.env.PW_CHROME : undefined;
const b = await engine.launch(exe ? { executablePath: exe } : {});
const p = await b.newPage({ viewport: { width: +w, height: +h }, ...(mobile ? { hasTouch: true, deviceScaleFactor: 2 } : {}) });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
p.on("response", (r) => r.status() >= 400 && errs.push(r.status() + " " + r.url()));
await p.goto(url, { waitUntil: "networkidle" });
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += +h / 2) {
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(120);
}
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(1200);
const hs = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
const buf = await p.screenshot({ fullPage: true });
const meta = await sharp(buf).metadata();
const chunk = Math.round(+h * (mobile ? 2 : 1) * 2);
let n = 0;
for (let top = 0; top < meta.height; top += chunk, n++) {
  await sharp(buf).extract({ left: 0, top, width: meta.width, height: Math.min(chunk, meta.height - top) }).resize({ width: mobile ? 600 : 1100 }).jpeg({ quality: 70 }).toFile(`${out}-${n}.jpg`);
}
console.log(`height ${H}, chunks ${n}, hscroll ${hs}, errors`, errs);
await b.close();
