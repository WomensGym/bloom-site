// Bloom · landing page motion. Same vocabulary as the launch video: the petal unfurl, words that
// rise out of masks or land on a spring, the bloom (a petal-edged circle opening onto a new field),
// the whip between phone screens, UI pieces lifting out of the phone, and the flipbook repping.
// Everything here is transform/opacity. Without GSAP, or with reduced motion, the page is static.
(() => {
  "use strict";
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // The video loads only when asked for, so the page stays light. Works with or without motion.
  $$("[data-yt]").forEach((a) =>
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${a.dataset.yt}?autoplay=1&rel=0&playsinline=1`;
      f.title = "Bloom promotional video";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      a.replaceWith(f);
      f.focus();
    })
  );

  const { gsap, ScrollTrigger } = window;
  if (!html.classList.contains("motion") || !gsap || !ScrollTrigger) {
    html.classList.remove("motion");
    return;
  }
  window.bloomReady = true;
  gsap.registerPlugin(ScrollTrigger);

  // ---------- helpers ----------
  // Words into spans. "spring" words land by scale, so they get no clipping mask.
  $$("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    const masked = el.dataset.split !== "spring";
    el.textContent = "";
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = w;
      if (masked) {
        const m = document.createElement("span");
        m.className = "wm";
        m.appendChild(s);
        el.appendChild(m);
      } else el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });
  const word = $(".close-word");
  word.innerHTML = [...word.textContent].map((c) => `<span class="c">${c}</span>`).join("");

  const RISE = { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.055 };
  const rise = (targets, extra = {}) => gsap.fromTo(targets, { yPercent: 118 }, { ...RISE, ...extra });

  // Petal unfurl: five petals open about their base (200, 300), centre first.
  const CLOSED = { c: 0, ml: 34, mr: -34, ol: 58, or: -58 };
  function unfurl(svg, { dur = 0.62, step = 0.08, from = 0.25 } = {}) {
    const tl = gsap.timeline();
    ["c", "ml", "mr", "ol", "or"].forEach((k, i) =>
      tl.fromTo(
        svg.querySelector(".pt-" + k),
        { rotation: CLOSED[k], scale: from, opacity: 0, svgOrigin: "200 300" },
        { rotation: 0, scale: 1, opacity: 1, svgOrigin: "200 300", duration: dur, ease: "back.out(1.9)" },
        i * step
      )
    );
    return tl;
  }

  // A UI piece lifts out of the phone: it starts part-way toward the screen centre, small, and springs out.
  function liftOut(el, device) {
    const d = device.getBoundingClientRect();
    const p = el.getBoundingClientRect();
    const dx = d.left + d.width / 2 - (p.left + p.width / 2);
    const dy = d.top + d.height / 2 - (p.top + p.height / 2);
    return gsap.fromTo(
      el,
      { x: dx * 0.42, y: dy * 0.42, scale: 0.62, opacity: 0 },
      { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.85, ease: "back.out(1.55)" }
    );
  }

  // Each beat's piece has its own small choreography, built once and played or reversed.
  function pieceTimeline(beat) {
    const fig = $(".fig", beat);
    const el = $(".piece-in", fig);
    const device = $(".device", fig);
    const tl = gsap.timeline({ paused: true });
    const kind = beat.dataset.beat;
    if (kind === "swap") {
      // the swap flips in like a card being turned over
      tl.fromTo(el, { rotationY: -100, transformPerspective: 900, x: -40, opacity: 0 }, { rotationY: 0, x: 0, opacity: 1, duration: 0.9, ease: "back.out(1.35)" });
      tl.fromTo($(".chip", el), { scale: 0, transformOrigin: "0% 50%" }, { scale: 1, duration: 0.45, ease: "back.out(3)" }, 0.45);
    } else {
      tl.add(liftOut(el, device));
    }
    if (kind === "plan") {
      tl.fromTo($$(".bl", el), { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "power3.out", stagger: 0.28 }, 0.45);
      tl.fromTo($$(".bl .tick", el), { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(3)", stagger: 0.28 }, 0.55);
    }
    if (kind === "weights") {
      tl.fromTo($(".try-v", el), { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "power4.out" }, 0.3);
      tl.fromTo($(".units .on", el), { scale: 0.6 }, { scale: 1, duration: 0.45, ease: "back.out(3)" }, 0.5);
    }
    if (kind === "feel") {
      const sel = $(".feel-sel", el);
      const gap = parseFloat(getComputedStyle($(".feel-row", el)).columnGap) || 0;
      tl.fromTo(sel, { x: () => -2 * (sel.offsetWidth + gap) }, { x: 0, duration: 0.7, ease: "back.out(1.5)" }, 0.35);
      tl.fromTo($(".feel-row .on", el), { color: "#3e2f2c" }, { color: "#fffbf8", duration: 0.2 }, 0.75);
      tl.fromTo($(".feel-k", el), { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }, 0.8);
      tl.fromTo($(".feel-next", el), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, 0.95);
    }
    return tl;
  }

  // ---------- hero ----------
  const hero = gsap.timeline({ delay: 0.12 });
  hero
    .add(unfurl($(".brand .lotus"), { step: 0.07 }), 0)
    .add(unfurl($(".hero-ghost"), { dur: 1.5, step: 0.14, from: 0.5 }), 0.05)
    .fromTo(".hero .eyebrow", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.2)
    .add(rise(".hero-title .line:not(.accent) .w", { stagger: 0.06 }), 0.28)
    .fromTo(
      ".hero-title .accent .w",
      { yPercent: 30, scale: 1.28, opacity: 0, transformOrigin: "50% 80%" },
      { yPercent: 0, scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)", stagger: 0.07 },
      0.8
    )
    .fromTo(".hero .lede", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 1.08)
    .fromTo(".hero .stores .badge, .hero .beta", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.08 }, 1.2)
    .fromTo(".hero-stage .device", { y: 120, rotation: 3, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 1.3, ease: "expo.out" }, 0.4);
  const heroDevice = $(".hero-stage .device");
  const floats = [];
  $$(".hero-stage .piece-in").forEach((p, i) => {
    hero.add(liftOut(p, heroDevice), 1.1 + i * 0.14);
    floats.push(gsap.to(p, { y: "-=7", duration: 2.3 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.6 + i * 0.2 }));
  });
  html.classList.add("ready");

  ScrollTrigger.create({
    trigger: ".hero",
    start: "top bottom",
    end: "bottom top",
    onToggle: (s) => floats.forEach((t) => (s.isActive ? t.resume() : t.pause())),
  });
  const heroScrub = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".hero-stage .device", { yPercent: -7, ease: "none", scrollTrigger: heroScrub });
  $$(".hero-stage .piece").forEach((el, i) => gsap.to(el, { y: [-80, -150, -50][i], ease: "none", scrollTrigger: heroScrub }));
  gsap.to(".hero-ghost", { rotation: 9, yPercent: 8, transformOrigin: "50% 75%", ease: "none", scrollTrigger: heroScrub });

  // ---------- the bloom: a petal-edged circle opens onto each colored field, driven by scroll ----------
  $$("[data-bloom-origin]").forEach((sec) => {
    const b = $(".bloom", sec);
    const fill = $(".bloom-fill", b);
    const rim = $(".bloom-rim", b);
    let R = 1;
    const layout = () => {
      const o = sec.dataset.bloomOrigin;
      const w = sec.offsetWidth;
      const h = sec.offsetHeight;
      let ox, oy;
      if (/^[\d.]+ [\d.]+$/.test(o)) {
        const [fx, fy] = o.split(" ").map(Number);
        ox = fx * w;
        oy = fy * h;
      } else {
        const t = $(o, sec);
        const sr = sec.getBoundingClientRect();
        const r = t.getBoundingClientRect();
        ox = r.left - sr.left + r.width / 2;
        oy = r.top - sr.top + r.height / 2;
      }
      // the petal edge dips to 87% of the radius, so size the shape to cover the far corner at its dips
      R = Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy)) / 0.86;
      Object.assign(b.style, { left: ox - R + "px", top: oy - R + "px", width: 2 * R + "px", height: 2 * R + "px" });
    };
    layout();
    ScrollTrigger.addEventListener("refreshInit", layout);
    const p = { v: 0 };
    const draw = () => {
      const v = p.v;
      const turn = 34 * (1 - v);
      gsap.set(fill, { scale: v, rotation: turn });
      gsap.set(rim, { scale: v <= 0 ? 0 : Math.min(1, v * 1.035 + (26 / R) * (1 - v) + 4 / R), rotation: turn + 5 });
    };
    gsap.to(p, { v: 1, ease: "power1.in", onUpdate: draw, scrollTrigger: { trigger: sec, start: "top 96%", end: "top 8%", scrub: 0.5 } });
    draw();
  });

  // ---------- generic reveals ----------
  $$('[data-split=""]').forEach((el) => {
    const inField = el.closest(".field");
    rise($$(".w", el), { scrollTrigger: { trigger: el, start: inField ? "top 76%" : "top 84%", once: true } });
  });
  $$("[data-rise]").forEach((el) => {
    const inField = el.closest(".field");
    gsap.fromTo(
      el,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.18, scrollTrigger: { trigger: el, start: inField ? "top 82%" : "top 88%", once: true } }
    );
  });

  // ---------- chapter 1 extras: goals get picked, weeks build ----------
  const goals = $$(".goal");
  gsap
    .timeline({ scrollTrigger: { trigger: ".goals", start: "top 86%", once: true } })
    .fromTo(
      goals,
      { x: (i) => [-90, 0, 90][i % 3], y: (i) => (i < 3 ? -50 : 70), rotation: (i) => (i % 2 ? 9 : -9), scale: 0.7, opacity: 0 },
      { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.3)", stagger: 0.06 }
    )
    .to(goals.slice(1), { opacity: 0.6, scale: 0.97, duration: 0.4, ease: "power2.out" }, "+=0.2")
    .fromTo(".goal.is-picked", { scale: 0.93 }, { scale: 1.04, duration: 0.5, ease: "back.out(2.4)" }, "<")
    .fromTo(".goal-check", { scale: 0 }, { scale: 1, duration: 0.45, ease: "back.out(3)" }, "<0.05");

  gsap
    .timeline({ scrollTrigger: { trigger: ".weeks", start: "top 86%", once: true } })
    .fromTo(".wk-bars i", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.5, ease: "back.out(1.7)", stagger: 0.09 })
    .fromTo(".wk-nums span", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", stagger: 0.05 }, 0.25)
    .fromTo(".wk-caps span", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out", stagger: 0.15 }, 0.6);

  // ---------- chapters: one phone, screens whip past as the beats scroll by ----------
  const mm = gsap.matchMedia();
  mm.add("(min-width: 960px)", () => {
    $$(".chapter").forEach((ch) => {
      const beats = $$(".beat", ch);
      const figs = beats.map((b) => $(".fig", b));
      const imgs = beats.map((b) => $(".screen img", b));
      const tls = beats.map(pieceTimeline);
      let active = 0;
      let pending;
      gsap.set(imgs.slice(1), { xPercent: 100 });
      gsap.set(figs, { zIndex: (i) => (i === 0 ? 2 : 1) });
      const go = (i) => {
        if (i === active) return;
        const prev = active;
        const dir = i > prev ? 1 : -1;
        active = i;
        gsap.set(figs, { zIndex: (k) => (k === i ? 2 : 1) });
        imgs.forEach((img, k) => k !== i && k !== prev && gsap.set(img, { xPercent: 100, overwrite: true }));
        gsap.to(imgs[prev], { xPercent: -100 * dir, duration: 0.75, ease: "expo.inOut", overwrite: true });
        gsap.fromTo(imgs[i], { xPercent: 100 * dir }, { xPercent: 0, duration: 0.75, ease: "expo.inOut", overwrite: true });
        tls[prev].timeScale(2.4).reverse();
        if (pending) pending.kill();
        pending = gsap.delayedCall(0.4, () => tls[i].timeScale(1).play(0));
      };
      ScrollTrigger.create({ trigger: $(".beat-text", beats[0]), start: "top 55%", once: true, onEnter: () => active === 0 && tls[0].play() });
      beats.forEach((b, i) =>
        ScrollTrigger.create({ trigger: $(".beat-text", b), start: "top center", end: "bottom center", onToggle: (s) => s.isActive && go(i) })
      );
      return () => tls.forEach((t) => t.kill());
    });
  });
  mm.add("(max-width: 959.98px)", () => {
    $$(".beat").forEach((b) => {
      const tl = pieceTimeline(b);
      gsap.fromTo($(".device", b), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: $(".fig", b), start: "top 88%", once: true } });
      ScrollTrigger.create({ trigger: $(".fig", b), start: "top 70%", once: true, onEnter: () => tl.play() });
    });
  });

  // ---------- your month ----------
  const num = $(".dial-num .n");
  const count = { v: 0 };
  gsap
    .timeline({ scrollTrigger: { trigger: ".dial", start: "top 72%", once: true } })
    .fromTo(".dial-arc", { strokeDashoffset: 86 }, { strokeDashoffset: 0, duration: 1.7, ease: "power2.inOut" }, 0)
    .fromTo(count, { v: 0 }, { v: 86, duration: 1.7, ease: "power2.inOut", onUpdate: () => (num.textContent = Math.round(count.v)) }, 0)
    .fromTo(".dial-num", { scale: 0.92 }, { scale: 1, duration: 0.55, ease: "back.out(2.6)" }, 1.7);
  gsap.to(".dial-ticks", { rotation: 40, svgOrigin: "0 0", ease: "none", scrollTrigger: { trigger: ".month", start: "top bottom", end: "bottom top", scrub: true } });
  const opt = $(".opt-row");
  opt.classList.remove("is-on");
  gsap.set(".opt-ok", { scale: 0 });
  gsap
    .timeline({ scrollTrigger: { trigger: opt, start: "top 80%", once: true } })
    .fromTo(opt, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" })
    .to(opt, { scale: 0.97, duration: 0.12, ease: "power2.in" }, 0.9)
    .add(() => opt.classList.toggle("is-on", true), 1.02)
    .to(opt, { scale: 1, duration: 0.4, ease: "back.out(2.2)" }, 1.02)
    .to(".opt-ok", { scale: 1, duration: 0.45, ease: "back.out(3)" }, 1.08);

  // ---------- every move: the grid pushes in, and every still reps on the same beat ----------
  gsap.fromTo(
    ".flipbook li",
    { scale: 0.82, y: 40, opacity: 0 },
    { scale: 1, y: 0, opacity: 1, duration: 0.75, ease: "expo.out", stagger: { each: 0.05, from: "center", grid: "auto" }, scrollTrigger: { trigger: ".flipbook", start: "top 82%", once: true } }
  );
  gsap.fromTo(".flipbook", { scale: 1 }, { scale: 1.06, ease: "none", scrollTrigger: { trigger: ".moves", start: "top bottom", end: "bottom top", scrub: true } });
  const p2 = $$(".flipbook .p2");
  let up = 0;
  const reps = gsap.to({}, { duration: 0.8, repeat: -1, paused: true, onRepeat: () => gsap.to(p2, { opacity: (up ^= 1), duration: 0.08, ease: "none" }) });
  ScrollTrigger.create({ trigger: ".flipbook", start: "top 90%", end: "bottom 10%", onToggle: (s) => (s.isActive ? reps.play() : reps.pause()) });

  // ---------- more women ----------
  gsap
    .timeline({ scrollTrigger: { trigger: ".women", start: "top 80%", once: true } })
    .fromTo(".w-more", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" })
    .fromTo(".w-women", { scale: 0.4, opacity: 0, transformOrigin: "0% 80%" }, { scale: 1, opacity: 1, duration: 0.85, ease: "back.out(1.6)" }, 0.16)
    .add(rise(".w-rest .w", { stagger: 0.06 }), 0.42)
    .fromTo(".women sup", { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(3)" }, 0.95);

  // ---------- close: the line lands, then the mark unfurls and the word rises ----------
  gsap
    .timeline({ scrollTrigger: { trigger: ".close-title", start: "top 78%", once: true } })
    .add(rise(".close-line .w", { stagger: 0.05 }), 0)
    .add(unfurl($(".close-logo .lotus"), { dur: 0.7, step: 0.09 }), 0.62)
    .fromTo(".close-word .c", { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "power4.out", stagger: 0.045 }, 0.78)
    .fromTo(".close .stores .badge, .close .beta", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.08 }, 1.15);

  // Fonts change line heights; re-measure once they land.
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
