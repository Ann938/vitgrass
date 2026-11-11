"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  advantages,
  cities,
  compound,
  contacts,
  faq,
  hero,
  links,
  nav,
  products,
  reviews,
  slides,
  story,
} from "@/content";
import s from "./landing.module.scss";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const src = (p: string) => (p.startsWith("/") ? base + p : p);
const d = (i: number) => ({ "--d": i }) as CSSProperties;
const ext = (href: string) => /^https?:/.test(href);

// ссылка: внешние — в новой вкладке
function A({ href, className, children, ...rest }: { href: string; className?: string; children: ReactNode } & Record<string, unknown>) {
  return (
    <a href={href} className={className} {...(ext(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
      {children}
    </a>
  );
}

// «**жирный** текст» и «- пункт» из content.ts
function Rich({ lines }: { lines: string[] }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const bold = (t: string) => t.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p));
  const flush = () => {
    if (list.length) out.push(<ul key={out.length}>{list.map((l, i) => <li key={i}>{bold(l)}</li>)}</ul>);
    list = [];
  };
  for (const l of lines) {
    if (l.startsWith("- ")) list.push(l.slice(2));
    else {
      flush();
      out.push(<p key={out.length}>{bold(l)}</p>);
    }
  }
  flush();
  return <>{out}</>;
}

// ---------- иконки ----------
const Chevron = ({ dir = "right" }: { dir?: "right" | "left" | "down" | "up" }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={s.chev} data-dir={dir}>
    <path d="M9.3 5.3a1.03 1.03 0 0 0 0 1.48L14.45 12l-5.15 5.2a1.03 1.03 0 0 0 0 1.48 1.02 1.02 0 0 0 1.48 0l5.89-5.92a1.03 1.03 0 0 0 0-1.53L10.78 5.3a1.02 1.02 0 0 0-1.48 0Z" fill="currentColor" />
  </svg>
);
const Star = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.33 10.06a.85.85 0 0 0-.72-.56l-4.73-.69-2.13-4.31a.84.84 0 0 0-1.5 0L9.13 8.8l-4.75.7a.84.84 0 0 0-.47 1.4l3.45 3.33-.83 4.73a.84.84 0 0 0 1.22.9L12 17.64l4.25 2.23a.84.84 0 0 0 1.21-.9l-.83-4.73 3.44-3.33a.84.84 0 0 0 .26-.85Z" fill="currentColor" />
  </svg>
);
const Search = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M8.83 2a6.6 6.6 0 0 1 5.24 10.6l3.62 3.62a.9.9 0 1 1-1.28 1.28l-3.63-3.63A6.6 6.6 0 1 1 8.83 2Zm0 1.8a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z" fill="currentColor" />
  </svg>
);

function Logo({ className }: { className?: string }) {
  return (
    <a href="#top" className={className} aria-label="Alina Boginia — на главную">
      <img src={src("/img/logo.png")} alt="Alina Boginia" width={90} height={80} />
    </a>
  );
}

// ---------- шапка ----------
function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  return (
    <header className={s.header} data-open={open || undefined}>
      <div className={s.headerRow}>
        <Logo className={s.logo} />
        <nav className={s.nav} aria-label="Разделы">
          {nav.map((n) => (
            <A key={n.label} href={n.href} className={s.navLink} onClick={() => setOpen(false)}>
              {n.label}
            </A>
          ))}
        </nav>
        <button type="button" className={s.burger} aria-label={open ? "Закрыть меню" : "Открыть меню"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

// ---------- 01 · первый экран: слайды с видео ----------
// Слайд держится SLIDE мс (или до конца ролика), активная точка показывает прогресс.
const SLIDE = 7000;
function Hero() {
  const [i, setI] = useState(0);
  const bar = useRef<HTMLSpanElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), []);
  // версию ролика выбираем в JS: Safari не понимает media у <source> для видео
  const [mobile, setMobile] = useState<boolean | null>(null);
  useEffect(() => setMobile(window.matchMedia("(max-width: 1023px)").matches), []);

  useEffect(() => {
    videos.current.forEach((v, k) => k !== i && v?.pause());
    const v = videos.current[i];
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const vid = videos.current[i];
      const p = vid && vid.duration ? vid.currentTime / vid.duration : (t - start) / SLIDE;
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, p)})`;
      if (p >= 1) go(i + 1);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i, go, mobile]);

  // свайп по первому экрану на телефоне
  const sx = useRef<number | null>(null);
  return (
    <section
      className={s.hero}
      id="top"
      onTouchStart={(e) => (sx.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (sx.current === null) return;
        const dx = e.changedTouches[0].clientX - sx.current;
        if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
        sx.current = null;
      }}
    >
      <div className={s.heroMedia} aria-hidden="true">
        {slides.map((sl, k) => (
          <div key={k} className={s.heroSlide} data-on={k === i || undefined}>
            {mobile !== null ? (
              <video
                ref={(el) => {
                  videos.current[k] = el;
                }}
                src={src(mobile ? sl.videoMobile : sl.video)}
                poster={src(mobile ? sl.posterMobile : sl.poster)}
                muted
                playsInline
                disablePictureInPicture
                preload={k === i ? "auto" : "metadata"}
              />
            ) : (
              <img src={src(sl.poster)} alt="" fetchPriority={k === 0 ? "high" : "low"} />
            )}
          </div>
        ))}
      </div>
      <div className={s.heroContent}>
        <div className={s.heroInfo}>
          <div className={s.heroTexts}>
            {slides.map((sl, k) => (
              <div key={k} className={s.heroText} data-on={k === i || undefined} aria-hidden={k !== i}>
                {(() => {
                  const T = k === 0 ? "h1" : "p";
                  return (
                    <T className={s.h1}>
                      <span className={s.onlyD}>{sl.title}</span>
                      <span className={s.onlyM}>{sl.titleMobile}</span>
                    </T>
                  );
                })()}
                <p className={s.heroLead}>{sl.lead}</p>
              </div>
            ))}
          </div>
          <div className={s.heroBtns}>
            <a href="#products" className={s.btnSecondary}>
              {hero.order}
            </a>
            <A href={links.consult} className={s.btnOutline}>
              {hero.consult}
            </A>
          </div>
        </div>
        <div className={s.carousel}>
          <p className={s.counter} aria-live="polite">
            <b>{i + 1}</b> <span>/ {slides.length}</span>
          </p>
          <div className={s.bullets} role="tablist" aria-label="Слайды">
            {slides.map((_, k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={k === i}
                aria-label={`Слайд ${k + 1}`}
                className={s.bullet}
                data-on={k === i || undefined}
                onClick={() => go(k)}
              >
                {k === i && <span ref={bar} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 02 · продукты ----------
function Products() {
  return (
    <section className={s.products} id="products">
      <h2 className={s.h2} data-reveal>
        {products.title}
      </h2>
      <ul className={s.productGrid}>
        {products.items.map((p, k) => (
          <li key={p.name} className={s.product} data-accent={p.accent || undefined} data-reveal style={d(k % 3)}>
            <div className={s.productImg}>
              <img
                src={src(p.img)}
                alt={p.name.replace(/ /g, " ")}
                loading="lazy"
                data-crop={p.crop ? "" : undefined}
                style={p.crop ? { width: `${p.crop.w}%`, height: `${p.crop.h}%`, left: `${p.crop.l}%`, top: `${p.crop.t}%` } : undefined}
              />
            </div>
            <div className={s.productText}>
              <p className={s.tags}>
                {p.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </p>
              <h3 className={s.productName}>{p.name}</h3>
            </div>
            <A href={p.href} className={s.btnPrimary}>
              {p.cta}
            </A>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- 03 · свойства ----------
function Compound() {
  const Card = ({ c, k }: { c: { title: string; text: string }; k: number }) => (
    <li className={s.propCard} data-reveal style={d(k)}>
      <h3>{c.title}</h3>
      <p>{c.text}</p>
    </li>
  );
  return (
    <section className={s.compound}>
      <img className={s.heartM} src={src("/img/heart.webp")} alt="" aria-hidden="true" loading="lazy" />
      <h2 className={s.h2} data-reveal>
        {compound.title}
      </h2>
      <div className={s.compoundRow}>
        <ul className={s.propCol}>
          {compound.left.map((c, k) => (
            <Card key={c.title} c={c} k={k} />
          ))}
        </ul>
        <div className={s.heart} data-reveal>
          <img src={src("/img/heart.webp")} alt="Сердце из ростков пшеницы и стакан сока" loading="lazy" />
        </div>
        <ul className={s.propCol}>
          {compound.right.map((c, k) => (
            <Card key={c.title} c={c} k={k} />
          ))}
        </ul>
      </div>
      <ul className={s.facts} data-reveal>
        {compound.facts.map((f) => (
          <li key={f.title}>
            <b>{f.title}</b>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- 04 · отзывы ----------
function Reviews() {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);
  const step = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const w = card ? card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : el.clientWidth;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };
  return (
    <section className={s.reviews} id="reviews">
      <img className={s.reviewsBg} src={src("/img/reviews-bg.webp")} alt="" aria-hidden="true" loading="lazy" />
      <div className={s.reviewsHead}>
        <h2 className={s.h2} data-reveal>
          {reviews.title}
        </h2>
        <div className={s.arrows}>
          <button type="button" className={s.btnIcon} aria-label="Предыдущий отзыв" disabled={edge.start} onClick={() => step(-1)}>
            <Chevron dir="left" />
          </button>
          <button type="button" className={s.btnIcon} aria-label="Следующий отзыв" disabled={edge.end} onClick={() => step(1)}>
            <Chevron />
          </button>
        </div>
      </div>
      <ul className={s.reviewTrack} ref={track} onScroll={update}>
        {reviews.items.map((r, k) => (
          <li key={r.name} className={s.review} data-reveal style={d(k)}>
            <div className={s.reviewHead}>
              {"img" in r && r.img ? (
                <img src={src(r.img)} alt="" loading="lazy" />
              ) : (
                <span className={s.initial} aria-hidden="true">
                  {r.name[0]}
                </span>
              )}
              <div>
                <p className={s.stars} aria-label="Оценка 5 из 5">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} />
                  ))}
                </p>
                <p className={s.reviewName}>{r.name}</p>
                <p className={s.reviewCity}>{r.city}</p>
              </div>
            </div>
            <div className={s.reviewText}>
              {r.text.map((t, n) => (
                <p key={n}>{t}</p>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- 05 · преимущества ----------
function Advantages() {
  return (
    <section className={s.advantages}>
      <div className={s.advHead} data-reveal>
        <h2 className={s.h2}>{advantages.title}</h2>
        <p>{advantages.lead}</p>
      </div>
      <ul className={s.advGrid}>
        {advantages.items.map((lines, k) => (
          <li key={lines[0]} className={s.adv} data-reveal style={d(k % 3)}>
            <span className={s.advIcon}>
              <img src={src(`/img/adv-${k + 1}.png`)} alt="" loading="lazy" />
            </span>
            <p>
              {lines.map((l, n) => (
                <span key={n}>{l}</span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- 06 · города ----------
// ДВ: все 24 города в три колонки. МВ: поиск + 5 городов, кнопка раскрывает все.
// Поиск — по всему списку без учёта регистра; подсказка в поле меняется каждые 3 с и замирает при фокусе.
const DEFAULT_COUNT = 5;
const plural = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "Найден" : "Найдено") + ` ${n} ` + (n % 10 === 1 && n % 100 !== 11 ? "город" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "города" : "городов");

function CityItem({ name, href }: { name: string; href: string }) {
  return (
    <li>
      <A href={href} className={s.item}>
        <span>{name}</span>
        <Chevron />
      </A>
    </li>
  );
}

function Cities() {
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const [hint, setHint] = useState(0);
  const [focus, setFocus] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focus || q) return;
    const t = setInterval(() => setHint((h) => (h + 1) % cities.hints.length), 3000);
    return () => clearInterval(t);
  }, [focus, q]);
  const query = q.trim().toLowerCase();
  const found = useMemo(() => (query ? cities.items.filter(([n]) => n.toLowerCase().includes(query)) : null), [query]);
  const reset = () => {
    setQ("");
    input.current?.focus();
  };
  const cols = [0, 1, 2].map((c) => cities.items.slice(c * 8, c * 8 + 8));

  return (
    <section className={s.cities} id="cities">
      <div className={s.citiesHead} data-reveal>
        <h2 className={s.h2}>{cities.title}</h2>
        <p>{cities.lead}</p>
      </div>

      {/* ДВ */}
      <div className={s.cityCols}>
        {cols.map((col, c) => (
          <ul key={c} data-reveal style={d(c)}>
            {col.map(([n, h]) => (
              <CityItem key={n} name={n} href={h} />
            ))}
          </ul>
        ))}
      </div>

      {/* МВ */}
      <div className={s.cityM}>
        <label className={s.search} data-filled={q ? "" : undefined}>
          <Search />
          <input
            ref={input}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            aria-label="Поиск города"
            enterKeyHint="search"
            autoComplete="off"
          />
          {!q && (
            <span className={s.hint} key={hint} aria-hidden="true">
              {cities.hints[hint]}
            </span>
          )}
        </label>

        {found ? (
          found.length ? (
            <>
              <p className={s.found}>{plural(found.length)}</p>
              <ul className={s.cityList}>
                {found.map(([n, h]) => (
                  <CityItem key={n} name={n} href={h} />
                ))}
              </ul>
              <button type="button" className={s.toggle} onClick={reset}>
                Очистить поиск
              </button>
            </>
          ) : (
            <div className={s.empty}>
              <p className={s.emptyTitle}>Город не найден</p>
              <p className={s.emptyText}>Проверьте название города или&nbsp;измените запрос.</p>
              <button type="button" className={s.emptyReset} onClick={reset}>
                Сбросить поиск
              </button>
            </div>
          )
        ) : (
          <>
            <ul className={s.cityList}>
              {cities.items.map(([n, h], k) => (k < DEFAULT_COUNT || all ? <CityItem key={n} name={n} href={h} /> : null))}
            </ul>
            <button type="button" className={s.toggle} aria-expanded={all} onClick={() => setAll(!all)}>
              {all ? "Свернуть список" : `Все города · ${cities.items.length}`}
              <Chevron dir={all ? "up" : "down"} />
            </button>
          </>
        )}
      </div>

      <div className={s.partner} data-reveal>
        <img src={src("/img/reviews-bg.webp")} alt="" aria-hidden="true" loading="lazy" />
        <p>{cities.partner}</p>
        <A href={links.partner} className={s.btnSecondary}>
          {cities.partnerCta}
        </A>
      </div>
    </section>
  );
}

// ---------- 07 · история ----------
function Story() {
  return (
    <section className={s.story}>
      <h2 className={s.h2} data-reveal>
        {story.title}
      </h2>
      <div className={s.storyCard} data-reveal>
        <div className={s.storyText}>
          <h3>{story.name}</h3>
          {story.text.map((t, k) => (
            <p key={k}>{t}</p>
          ))}
          <A href={links.partner} className={s.btnPrimary}>
            {story.cta}
          </A>
        </div>
        <div className={s.storyImg}>
          <img src={src("/img/story.webp")} alt="Алина — основатель Витграсс" loading="lazy" />
        </div>
      </div>
    </section>
  );
}

// ---------- 08 · вопросы ----------
function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className={s.faq} id="faq">
      <h2 className={s.h2} data-reveal>
        {faq.title}
      </h2>
      <ul className={s.faqList}>
        {faq.items.map((f, k) => (
          <li key={f.q} className={s.acc} data-open={open === k || undefined} data-reveal style={d(Math.min(k, 3))}>
            <button type="button" className={s.accHead} aria-expanded={open === k} aria-controls={`faq-${k}`} onClick={() => setOpen(open === k ? null : k)}>
              <span>{f.q}</span>
              <Chevron dir="down" />
            </button>
            <div className={s.accBody} id={`faq-${k}`} role="region">
              <div>
                <div className={s.accText}>
                  <Rich lines={f.a} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- 09 · контакты ----------
function Contacts() {
  return (
    <section className={s.contacts} id="contacts">
      <picture className={s.contactsBg}>
        <source media="(max-width: 1023px)" srcSet={src("/img/contact-bg-m.webp")} />
        <img src={src("/img/contact-bg.webp")} alt="" aria-hidden="true" loading="lazy" />
      </picture>
      <div className={s.contactsCard} data-reveal>
        <div>
          <h2>{contacts.title}</h2>
          <p className={s.leadD}>{contacts.lead}</p>
          <p className={s.leadM}>{contacts.leadMobile}</p>
        </div>
        <div className={s.contactsBtns}>
          <a href={links.phone} className={s.btnPrimary}>
            {contacts.call}
          </a>
          <A href={links.whatsapp} className={s.btnSecondary}>
            {contacts.write}
          </A>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={s.footer}>
      <Logo className={s.logo} />
      <nav className={s.footNav} aria-label="Контакты">
        <a href={links.phone} className={s.navLink}>
          {links.phoneText}
        </a>
        <A href={links.instagram} className={s.navLink}>
          {links.instagramText}
        </A>
      </nav>
    </footer>
  );
}

// появление блоков — один раз
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-revealed", "");
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    document.documentElement.classList.add("motion-ready");
    return () => io.disconnect();
  }, []);
}

export default function Landing() {
  useReveal();
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Products />
        <Compound />
        <Reviews />
        <Advantages />
        <Cities />
        <Story />
        <Faq />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
