@AGENTS.md

# Витграсс (Alina Boginia) — лендинг по макету Figma

Макет: figma.com/design/IksG4RrSMnbyTjK8qbG5HH, узел 476-21637 (ДВ 123:466, МВ 330:957, UI-кит 225:952,
поиск городов 471:694 и 479:604). Старый сайт со ссылками: vitgrassalina.ru.

- Next 16 + SCSS-модули, `u()` из `src/styles/_core.scss` (ДВ 1440 / контент 1280; МВ ≤1023 — колонка 358, поля 16).
- Тексты и все ссылки — `src/content.ts` (города → Instagram представителей, кнопки → WhatsApp с готовым текстом, мука → Ozon, сублимат → WB).
- Ховеры из UI-кита — миксин `drop()`: капля выезжает слева, при нажатии заливает всю кнопку.
- Первый экран — слайды: `slides[].video` (mp4 в public/), пока пусто — показывается poster; активная точка = прогресс слайда.
- Поиск городов только на МВ: 5 городов по умолчанию, «Все города · 24», подсказка меняется каждые 3 с и замирает при фокусе.
- Проверка: `npm run dev -- -p 3400`; `node scripts/full.mjs http://localhost:3400/ <out> 1440 900` (нужен PW_CHROME),
  МВ: `node scripts/full.mjs http://localhost:3400/ <out> 390 844 webkit`.
- Публикация (только с согласия): `npm run deploy` → ann938.github.io/vitgrass (репо Ann938/vitgrass, noindex).
