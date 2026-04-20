import { useState, useRef, useEffect, useMemo, useCallback } from "react";

const TEMPLATES = {
  tiktok:    { label: "TikTok",           w: 1080, h: 1920, icon: "TK", color: "#010101", sub: "1080×1920 · 9:16" },
  instagram: { label: "Instagram Reels",  w: 1080, h: 1920, icon: "IG", color: "#833ab4", sub: "1080×1920 · 9:16" },
  youtube:   { label: "YouTube Shorts",   w: 1080, h: 1920, icon: "YT", color: "#ff0000", sub: "1080×1920 · 9:16" },
  custom:    { label: "Custom",           w: 480,  h: 854,  icon: "✦",  color: "#7c3aed", sub: "any size" },
};

const BASE_W = 360;
const PRESET_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Silent Exchange Ad</title><link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}:root{--teal:#0a6b6b;--teal2:#0d8a8a;--orange:#f26f21;--orange2:#ff9c2a;--gold:#f7d94c;--dark:#072d2d;--white:#fff}html,body{width:100%;height:100%;overflow:hidden;background:var(--dark);font-family:'Nunito',sans-serif}.ad{position:relative;width:100%;height:100%;background:var(--dark);overflow:hidden;display:flex;flex-direction:column;align-items:center;padding-bottom:3vh}.bg-pattern{position:absolute;inset:0;z-index:0;background:repeating-linear-gradient(45deg,rgba(10,107,107,.18) 0,rgba(10,107,107,.18) 2px,transparent 2px,transparent 28px),repeating-linear-gradient(-45deg,rgba(242,111,33,.10) 0,rgba(242,111,33,.10) 2px,transparent 2px,transparent 28px),linear-gradient(160deg,#051a1a 0%,#0a3030 50%,#051a1a 100%)}.header{position:relative;z-index:2;width:100%;background:linear-gradient(135deg,var(--teal) 0%,var(--teal2) 100%);border-bottom:.5vh solid var(--orange);padding:2.5vh 5% 5vh;text-align:center;clip-path:polygon(0 0,100% 0,100% 82%,50% 100%,0 82%);flex-shrink:0}.tag{display:inline-block;background:var(--orange);color:var(--white);font-family:'Fredoka One',cursive;font-size:1.8vw;letter-spacing:.3vw;text-transform:uppercase;padding:.4vh 2vw;border-radius:20px;margin-bottom:1vh;animation:pulse 2.4s ease-in-out infinite}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(242,111,33,.5)}50%{box-shadow:0 0 0 1vw rgba(242,111,33,0)}}.headline{font-family:'Fredoka One',cursive;font-size:9vw;line-height:1.05;color:var(--white);text-shadow:.4vw .4vw 0 var(--dark),0 0 3vw rgba(247,217,76,.4);letter-spacing:.05vw}.headline span.orange{color:var(--orange2)}.headline span.gold{color:var(--gold)}.headline-sm{font-family:'Fredoka One',cursive;font-size:6.5vw;line-height:1.1;color:var(--white);margin-top:.5vh}.sub{margin-top:.5vh;font-size:2.8vw;color:rgba(255,255,255,.7);font-weight:700;letter-spacing:.2vw}.grid-wrap{position:relative;z-index:2;width:100%;padding:2.5vh 4% 1vh;display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.5vw;flex-shrink:0}.card{background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:.3vw solid rgba(255,255,255,.1);border-radius:2vw;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;aspect-ratio:3/4;position:relative}.card-art{font-size:10vw;line-height:1;position:absolute;top:50%;left:50%;transform:translate(-50%,-55%);filter:drop-shadow(0 .5vw 1.5vw rgba(0,0,0,.5));animation:floaty 3s ease-in-out infinite}.card:nth-child(2) .card-art{animation-delay:.4s}.card:nth-child(3) .card-art{animation-delay:.8s}.card:nth-child(4) .card-art{animation-delay:1.2s}.card:nth-child(5) .card-art{animation-delay:1.6s}.card:nth-child(6) .card-art{animation-delay:2s}@keyframes floaty{0%,100%{transform:translate(-50%,-55%)}50%{transform:translate(-50%,-62%)}}.card-label{position:relative;width:100%;background:rgba(0,0,0,.55);text-align:center;font-size:2vw;font-weight:900;letter-spacing:.05vw;color:rgba(255,255,255,.9);padding:.7vh .5vw;text-transform:uppercase;line-height:1.3}.badge{position:absolute;top:4%;right:5%;background:var(--orange);color:#fff;font-size:1.6vw;font-weight:900;padding:.3vh .8vw;border-radius:20px;text-transform:uppercase;letter-spacing:.05vw}.card:nth-child(1){border-color:rgba(247,217,76,.3)}.card:nth-child(2){border-color:rgba(242,111,33,.3)}.card:nth-child(3){border-color:rgba(10,138,138,.4)}.card:nth-child(4){border-color:rgba(200,80,80,.3)}.card:nth-child(5){border-color:rgba(247,217,76,.3)}.card:nth-child(6){border-color:rgba(242,111,33,.3)}.cats{position:relative;z-index:2;display:flex;gap:1.5vw;flex-wrap:wrap;justify-content:center;padding:1vh 4% .5vh;flex-shrink:0}.cat{background:rgba(255,255,255,.06);border:.3vw solid rgba(255,255,255,.13);border-radius:20px;font-size:2vw;font-weight:900;letter-spacing:.05vw;color:rgba(255,255,255,.75);padding:.6vh 2.5vw;text-transform:uppercase;white-space:nowrap}.cat.hot{background:rgba(242,111,33,.2);border-color:var(--orange);color:var(--orange2)}.divider{position:relative;z-index:2;width:88%;height:.3vh;margin:1.5vh 0 0;background:linear-gradient(90deg,transparent,var(--orange),var(--gold),var(--orange),transparent);border-radius:2px;flex-shrink:0}.cta{position:relative;z-index:2;text-align:center;padding:2vh 5% 0;flex-shrink:0}.cta-action{font-family:'Fredoka One',cursive;font-size:3.2vw;color:rgba(255,255,255,.6);letter-spacing:.2vw;margin-bottom:.5vh}.cta-url{font-family:'Fredoka One',cursive;font-size:6vw;color:var(--white);letter-spacing:.05vw;line-height:1;animation:glow 2s ease-in-out infinite}@keyframes glow{0%,100%{text-shadow:0 0 2vw rgba(242,111,33,.4)}50%{text-shadow:0 0 4vw rgba(242,111,33,.8),0 0 8vw rgba(247,217,76,.3)}}.btn{display:inline-block;margin-top:1.5vh;background:linear-gradient(135deg,var(--orange),#e85d00);color:#fff;font-family:'Fredoka One',cursive;font-size:4.5vw;letter-spacing:.15vw;padding:1.2vh 8vw;border-radius:50px;text-transform:uppercase;box-shadow:0 1vh 4vw rgba(242,111,33,.5),inset 0 1px 0 rgba(255,255,255,.25);position:relative;overflow:hidden;animation:btn-glow 2.5s ease-in-out infinite}.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.25) 50%,transparent 100%);transform:translateX(-100%);animation:shimmer 2.5s infinite}@keyframes shimmer{0%{transform:translateX(-100%)}40%,100%{transform:translateX(200%)}}@keyframes btn-glow{0%,100%{box-shadow:0 1vh 3vw rgba(242,111,33,.45)}50%{box-shadow:0 1vh 5vw rgba(242,111,33,.8),0 0 8vw rgba(247,217,76,.2)}}.arrows{position:relative;z-index:2;display:flex;gap:.5vw;margin-top:1vh;flex-shrink:0}.arr{font-size:4.5vw;color:var(--gold);animation:bounce-arr .8s ease-in-out infinite}.arr:nth-child(2){animation-delay:.12s;color:var(--orange2)}.arr:nth-child(3){animation-delay:.24s;color:var(--white)}@keyframes bounce-arr{0%,100%{transform:translateX(0);opacity:.5}50%{transform:translateX(.5vw);opacity:1}}.logo{position:relative;z-index:2;margin-top:1.5vh;display:flex;flex-direction:column;align-items:center;gap:.2vh;flex-shrink:0}.logo-word{font-family:'Fredoka One',cursive;font-size:5.5vw;color:var(--orange2);letter-spacing:.5vw;text-transform:uppercase;line-height:1}.logo-sub{font-size:2vw;letter-spacing:.5vw;color:rgba(255,255,255,.45);text-transform:uppercase;font-weight:700}.star{position:absolute;z-index:1;background:var(--gold);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);opacity:.7;animation:twinkle 2.4s ease-in-out infinite}.star:nth-child(1){top:14%;left:6%;width:2.5vw;height:2.5vw;animation-delay:0s}.star:nth-child(2){top:10%;right:8%;width:1.8vw;height:1.8vw;animation-delay:.6s}.star:nth-child(3){top:22%;left:16%;width:1.5vw;height:1.5vw;animation-delay:1.2s}.star:nth-child(4){top:18%;right:20%;width:2vw;height:2vw;animation-delay:1.8s}.star:nth-child(5){bottom:18%;left:8%;width:2vw;height:2vw;animation-delay:.3s}.star:nth-child(6){bottom:22%;right:7%;width:2.5vw;height:2.5vw;animation-delay:.9s}@keyframes twinkle{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.9;transform:scale(1.3)}}</style></head><body><div class="ad"><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="bg-pattern"></div><div class="header"><div class="tag">✦ Now Open ✦</div><div class="headline">Love<br><span class="gold">Collectibles?</span></div><div class="headline-sm"><span class="orange">Buy</span> &nbsp;·&nbsp; <span class="orange">Sell</span> &nbsp;·&nbsp; Trade</div><div class="sub">Trading Cards &amp; More</div></div><div class="grid-wrap"><div class="card"><div class="card-art">🃏</div><div class="badge">PSA 10</div><div class="card-label">Pokémon<br>Cards</div></div><div class="card"><div class="card-art">⚡</div><div class="badge">CGC</div><div class="card-label">Sports<br>Cards</div></div><div class="card"><div class="card-art">🤖</div><div class="card-label">Funko<br>Pops</div></div><div class="card"><div class="card-art">🐉</div><div class="badge">Hot</div><div class="card-label">Yu-Gi-Oh<br>Packs</div></div><div class="card"><div class="card-art">🚗</div><div class="card-label">Hot<br>Wheels</div></div><div class="card"><div class="card-art">🦸</div><div class="card-label">Marvel<br>&amp; More</div></div></div><div class="cats"><span class="cat hot">🔥 Graded Slabs</span><span class="cat">Sealed Packs</span><span class="cat">Vintage</span><span class="cat">New Arrivals</span></div><div class="divider"></div><div class="cta"><div class="cta-action">Visit us at</div><div class="cta-url">SILENTEXCHANGE.STORE</div><div class="btn">Shop Now →</div></div><div class="arrows"><span class="arr">›</span><span class="arr">›</span><span class="arr">›</span></div><div class="logo"><div class="logo-word">Silent Exchange</div><div class="logo-sub">Your Collectibles Marketplace</div></div></div></body></html>`;

const loadScript = (src) => new Promise((resolve, reject) => {
  if (document.querySelector(`script[src="${src}"]`)) return resolve();
  const s = document.createElement("script");
  s.src = src; s.onload = resolve; s.onerror = reject;
  document.head.appendChild(s);
});

const buildCaptureHtml = (userHtml, w, h) =>
  /<!doctype html>|<html[\s>]/i.test(userHtml)
    ? userHtml
    : `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${w},initial-scale=1"><style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:transparent}</style></head><body>${userHtml}</body></html>`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG       = "#080810";
const SURFACE  = "#0f0f1a";
const SURF2    = "#16162a";
const SURF3    = "#1e1e35";
const BORDER   = "rgba(255,255,255,0.07)";
const BORDER2  = "rgba(255,255,255,0.13)";
const ACCENT   = "#6d4fff";
const ACCENTHI = "#9d7fff";
const GOLD     = "#d4a843";
const TEXT     = "#e8e8f0";
const TEXTMID  = "#7878a0";
const TEXTDIM  = "#3a3a58";
const GREEN    = "#1db954";
const RED      = "#e03e3e";

export default function App() {
  const [html, setHtml]               = useState(PRESET_HTML);
  const [templateKey, setTemplateKey] = useState("tiktok");
  const [fps, setFps]                 = useState(18);
  const [duration, setDuration]       = useState(3);
  const [quality, setQuality]         = useState(3);
  const [animSpeed, setAnimSpeed]     = useState(1.0);
  const [loop, setLoop]               = useState(true);
  const [customW, setCustomW]         = useState(480);
  const [customH, setCustomH]         = useState(854);
  const [phase, setPhase]             = useState("idle");
  const [progress, setProgress]       = useState(0);
  const [gifUrl, setGifUrl]           = useState(null);
  const [activeTab, setActiveTab]     = useState("code");
  const [libStatus, setLibStatus]     = useState("loading");
  const [errorMsg, setErrorMsg]       = useState("");
  const captureContainerRef = useRef(null);
  const scriptsReady = useRef(false);
  const lastGifUrl   = useRef(null);

  const settingsRef = useRef({ fps, duration, quality, loop, animSpeed });
  useEffect(() => { settingsRef.current = { fps, duration, quality, loop, animSpeed }; }, [fps, duration, quality, loop, animSpeed]);

  const tpl         = TEMPLATES[templateKey];
  const W           = templateKey === "custom" ? customW : tpl.w;
  const H           = templateKey === "custom" ? customH : tpl.h;
  const totalFrames = useMemo(() => Math.max(1, Math.ceil(fps * duration)), [fps, duration]);
  const aspectPct   = useMemo(() => ((H / W) * 100).toFixed(4), [H, W]);
  const previewSrcDoc = useMemo(() => buildCaptureHtml(html, W, H), [html, W, H]);

  useEffect(() => {
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gifshot/0.3.1/gifshot.min.js"),
    ]).then(() => { scriptsReady.current = true; setLibStatus("ready"); })
      .catch(() => setLibStatus("error"));
  }, []);

  useEffect(() => () => { if (lastGifUrl.current) URL.revokeObjectURL(lastGifUrl.current); }, []);

  const reset = useCallback(() => { setPhase("idle"); setGifUrl(null); setProgress(0); setErrorMsg(""); }, []);

  const convert = useCallback(async () => {
    if (!scriptsReady.current || phase !== "idle") return;
    const container = captureContainerRef.current;
    if (!container) return;

    const { fps: capFps, duration: capDuration, quality: capQuality, loop: capLoop, animSpeed: capAnimSpeed } = settingsRef.current;
    const capTotalFrames   = Math.max(1, Math.ceil(capFps * capDuration));
    const frameIntervalSec = 1 / capFps;
    const frameDelayMs     = Math.max(16, Math.round(1000 / capFps));

    setPhase("capturing"); setProgress(0); setGifUrl(null); setErrorMsg("");
    container.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.sandbox = "allow-scripts allow-same-origin";
    iframe.scrolling = "no";
    iframe.style.cssText = `width:${W}px;height:${H}px;border:none;display:block;position:absolute;top:0;left:0;overflow:hidden;transform:scale(${BASE_W / W});transform-origin:top left;background:transparent`;
    container.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    doc.open(); doc.write(buildCaptureHtml(html, W, H)); doc.close();
    await new Promise(r => setTimeout(r, 1200));

    if (capAnimSpeed !== 1.0) {
      try {
        const cd = iframe.contentDocument || iframe.contentWindow?.document;
        const sc = cd.createElement("script");
        sc.textContent = `(function(){function p(r){r.querySelectorAll('*').forEach(el=>{(el.getAnimations?el.getAnimations():[]).forEach(a=>{try{a.playbackRate=${capAnimSpeed.toFixed(6)}}catch(e){}})});}p(document);setTimeout(()=>p(document),100);setTimeout(()=>p(document),400);})();`;
        cd.head.appendChild(sc);
      } catch(e) {}
    }

    const frames = [];
    try {
      for (let i = 0; i < capTotalFrames; i++) {
        const cd     = iframe.contentDocument || iframe.contentWindow?.document;
        const target = cd.querySelector(".ad") || cd.body;
        await cd.fonts?.ready?.catch?.(() => {});
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const rect   = target.getBoundingClientRect();
        const scale  = W / rect.width;
        const canvas = await window.html2canvas(target, {
          width: rect.width, height: rect.height, windowWidth: rect.width, windowHeight: rect.height,
          scrollX: 0, scrollY: 0, x: 0, y: 0, scale,
          useCORS: true, allowTaint: true, backgroundColor: null, logging: false, foreignObjectRendering: true,
        });
        let out = canvas;
        if (canvas.width !== W || canvas.height !== H) {
          out = document.createElement("canvas"); out.width = W; out.height = H;
          out.getContext("2d").drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, W, H);
        }
        frames.push(out.toDataURL("image/png"));
        setProgress(Math.round(((i + 1) / capTotalFrames) * 65));
        await new Promise(r => setTimeout(r, frameDelayMs));
      }
      setPhase("encoding"); setProgress(66);
      window.gifshot.createGIF({
        images: frames, gifWidth: W, gifHeight: H, interval: frameIntervalSec,
        numWorkers: Math.min(8, navigator.hardwareConcurrency || 4),
        quality: capQuality, repeat: capLoop ? 0 : -1,
        progressCallback: p => setProgress(66 + Math.round(p * 34)),
      }, (obj) => {
        container.innerHTML = "";
        if (obj.error) { setErrorMsg(obj.errorMsg || "GIF generation failed"); setPhase("error"); return; }
        if (lastGifUrl.current) URL.revokeObjectURL(lastGifUrl.current);
        setGifUrl(obj.image); lastGifUrl.current = obj.image;
        setPhase("done"); setProgress(100);
      });
    } catch (err) {
      setErrorMsg(err?.message || "Capture failed");
      container.innerHTML = ""; setPhase("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, html, W, H]);

  const download = useCallback(() => {
    if (!gifUrl) return;
    const a = document.createElement("a");
    a.href = gifUrl; a.download = `${tpl.label.replace(/\s+/g, "_")}_${W}x${H}.gif`; a.click();
  }, [gifUrl, tpl.label, W, H]);

  const isConverting = phase === "capturing" || phase === "encoding";
  const capturedFrameCount = isConverting && phase === "capturing"
    ? Math.min(totalFrames, Math.max(0, Math.round((progress / 65) * totalFrames)))
    : totalFrames;

  // ─── Reusable micro-components ────────────────────────────────────────────
  const Slider = ({ label, val, set, min, max, step, unit = "", hint }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: hint ? 3 : 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: TEXTMID, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: ACCENTHI, fontVariantNumeric: "tabular-nums" }}>{val}{unit}</span>
      </div>
      {hint && <p style={{ margin: "0 0 8px", fontSize: 10, color: TEXTDIM, fontWeight: 500 }}>{hint}</p>}
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => { set(Number(e.target.value)); reset(); }} style={{ width: "100%" }} />
    </div>
  );

  const Divider = () => <div style={{ height: 1, background: BORDER, margin: "4px 0 20px" }} />;

  const statusColor = libStatus === "ready" ? GREEN : libStatus === "error" ? RED : GOLD;
  const statusLabel = libStatus === "ready" ? "Ready" : libStatus === "error" ? "Error" : "Loading";

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter','SF Pro Display',-apple-system,sans-serif", color: TEXT }}>

      {/* ── Global CSS ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BORDER2}; border-radius: 4px; }
        textarea { outline: none; caret-color: ${ACCENTHI}; }
        textarea:focus { border-color: ${ACCENT} !important; }
        input[type=range] {
          -webkit-appearance: none; appearance: none; width: 100%;
          height: 2px; border-radius: 99px; outline: none; cursor: pointer;
          background: ${SURF3};
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
          background: ${ACCENTHI}; cursor: pointer;
          border: 2px solid ${SURFACE};
          box-shadow: 0 0 0 3px rgba(109,79,255,0.25);
          transition: transform 0.1s;
        }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        .btn-p { transition: opacity 0.15s, transform 0.12s; }
        .btn-p:hover { opacity: 0.88; }
        .btn-p:active { transform: scale(0.98); opacity: 0.95; }
        .tpl-card { transition: border-color 0.15s, background 0.15s; }
        .tpl-card:hover { border-color: ${BORDER2} !important; }
        @media (max-width: 640px) {
          .main-grid { grid-template-columns: 1fr !important; }
          .tpl-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .tpl-meta  { display: none !important; }
          .nav-stats { display: none !important; }
        }
      `}</style>

      {/* Off-screen capture sandbox */}
      <div ref={captureContainerRef} style={{ position: "fixed", left: "-9999px", top: 0, overflow: "hidden", pointerEvents: "none", zIndex: -1 }} />

      {/* ══════════════════════════════════ NAV ══════════════════════════════ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 18px",
        background: "rgba(8,8,16,0.92)",
        backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENTHI} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.2px", color: TEXT, lineHeight: 1.2 }}>ReelGIF</div>
            <div style={{ fontSize: 10, color: TEXTDIM, fontWeight: 500, letterSpacing: "0.03em" }}>HTML → GIF Exporter</div>
          </div>
        </div>

        {/* Center stats */}
        <div className="nav-stats" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[`${totalFrames} frames`, `${fps} fps`, `${duration}s`, `${W}×${H}`].map(s => (
            <span key={s} style={{
              padding: "3px 9px", borderRadius: 6,
              background: SURF2, border: `1px solid ${BORDER}`,
              fontSize: 10, fontWeight: 600, color: TEXTMID, letterSpacing: "0.03em",
            }}>{s}</span>
          ))}
        </div>

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: statusColor }}>{statusLabel}</span>
        </div>
      </header>

      {/* ══════════════════════════════════ BODY ══════════════════════════════ */}
      <div style={{ padding: "16px 16px 60px", maxWidth: 920, margin: "0 auto" }}>

        {/* ── Template selector ── */}
        <div className="tpl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          {Object.entries(TEMPLATES).map(([key, t]) => {
            const active = templateKey === key;
            return (
              <div key={key} className="tpl-card" onClick={() => { setTemplateKey(key); reset(); }} style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "9px 11px", borderRadius: 11, cursor: "pointer",
                border: `1px solid ${active ? ACCENT : BORDER}`,
                background: active ? `rgba(109,79,255,0.10)` : SURFACE,
                boxShadow: active ? `0 0 0 1px rgba(109,79,255,0.20)` : "none",
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                  background: t.color, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 900, color: "white",
                }}>{t.icon}</div>
                <div className="tpl-meta" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: active ? TEXT : TEXTMID, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.label}</div>
                  <div style={{ fontSize: 9, color: TEXTDIM, marginTop: 1 }}>{t.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Custom size ── */}
        {templateKey === "custom" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[{ label: "Width", val: customW, set: setCustomW, min: 100, max: 2000 },
              { label: "Height", val: customH, set: setCustomH, min: 100, max: 4000 }].map(({ label, val, set, min, max }) => (
              <div key={label} style={{ background: SURFACE, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: TEXTMID, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ACCENTHI }}>{val}px</span>
                </div>
                <input type="range" min={min} max={max} step={10} value={val} onChange={e => { set(Number(e.target.value)); reset(); }} />
              </div>
            ))}
          </div>
        )}

        {/* ══ Main workspace ══ */}
        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>

          {/* ──────────────── LEFT PANEL ──────────────── */}
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>

            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
              {["code", "settings"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                  background: activeTab === t ? SURF2 : "transparent",
                  color: activeTab === t ? TEXT : TEXTDIM,
                  borderBottom: activeTab === t ? `2px solid ${ACCENT}` : "2px solid transparent",
                  transition: "all 0.15s",
                  letterSpacing: "0.03em",
                }}>
                  {t === "code" ? "Code" : "Settings"}
                </button>
              ))}
            </div>

            {/* ── Code tab ── */}
            {activeTab === "code" && (
              <div style={{ padding: 12 }}>
                <textarea
                  value={html}
                  onChange={e => { setHtml(e.target.value); reset(); }}
                  spellCheck={false}
                  placeholder="Paste your HTML animation here…"
                  style={{
                    width: "100%", height: 260,
                    background: "#05050d",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace",
                    color: "#b0b8e0",
                    lineHeight: 1.75,
                    resize: "vertical",
                  }}
                />
              </div>
            )}

            {/* ── Settings tab ── */}
            {activeTab === "settings" && (
              <div style={{ padding: "18px 16px 14px" }}>

                <Slider label="FPS" val={fps} set={setFps} min={1} max={30} step={0.5} unit=" fps" hint="Lower = fewer frames, smaller file size" />
                <Slider label="Duration" val={duration} set={setDuration} min={0.5} max={12} step={0.5} unit="s" />
                <Slider label="Quality" val={quality} set={setQuality} min={1} max={20} step={1} hint="1 = best quality, higher = faster encode" />

                <Divider />

                {/* Animation speed */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: TEXTMID, letterSpacing: "0.04em", textTransform: "uppercase" }}>Anim speed</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: ACCENTHI }}>{animSpeed.toFixed(2)}×</span>
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: 10, color: TEXTDIM, fontWeight: 500 }}>
                    {animSpeed < 1 ? `${(1/animSpeed).toFixed(1)}× slower — motion stretched out` : animSpeed > 1 ? `${animSpeed.toFixed(1)}× faster — motion compressed` : "Normal playback speed"}
                  </p>
                  <input type="range" min={0.1} max={3} step={0.05} value={animSpeed}
                    onChange={e => { setAnimSpeed(Number(e.target.value)); reset(); }} />
                  <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
                    {[{ label: "¼×", val: 0.25 }, { label: "½×", val: 0.5 }, { label: "¾×", val: 0.75 },
                      { label: "1×", val: 1.0 }, { label: "1.5×", val: 1.5 }, { label: "2×", val: 2.0 }].map(p => {
                      const on = Math.abs(animSpeed - p.val) < 0.01;
                      return (
                        <button key={p.label} onClick={() => { setAnimSpeed(p.val); reset(); }} style={{
                          flex: 1, padding: "6px 0", borderRadius: 7, cursor: "pointer",
                          fontFamily: "inherit", fontSize: 11, fontWeight: 700,
                          border: `1px solid ${on ? ACCENT : BORDER}`,
                          background: on ? `rgba(109,79,255,0.18)` : SURF2,
                          color: on ? ACCENTHI : TEXTDIM,
                          transition: "all 0.12s",
                        }}>{p.label}</button>
                      );
                    })}
                  </div>
                </div>

                <Divider />

                {/* Loop toggle */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: TEXTMID, textTransform: "uppercase", letterSpacing: "0.04em" }}>Loop GIF</div>
                    <div style={{ fontSize: 10, color: TEXTDIM, marginTop: 2 }}>{loop ? "Plays forever" : "Plays once"}</div>
                  </div>
                  <div onClick={() => setLoop(v => !v)} style={{
                    width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                    position: "relative", flexShrink: 0,
                    background: loop ? ACCENT : SURF3,
                    border: `1px solid ${loop ? ACCENTHI : BORDER}`,
                    transition: "all 0.2s",
                  }}>
                    <div style={{
                      position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%",
                      background: loop ? "white" : TEXTMID,
                      transition: "transform 0.2s",
                      transform: loop ? "translateX(23px)" : "translateX(3px)",
                    }} />
                  </div>
                </div>

                {/* Encode summary */}
                <div style={{
                  background: SURF2, borderRadius: 10, border: `1px solid ${BORDER}`,
                  padding: "10px 13px", fontSize: 11, color: TEXTMID,
                  lineHeight: 1.9, fontWeight: 500,
                }}>
                  <span style={{ color: ACCENTHI, fontWeight: 700 }}>Encoding · </span>
                  {Math.ceil(fps * duration)} frames · {fps} fps · {duration}s · {animSpeed.toFixed(2)}× · q{quality} · {loop ? "loop" : "once"}
                </div>
              </div>
            )}

            {/* ── Convert button / progress ── */}
            <div style={{ padding: "0 12px 14px", borderTop: `1px solid ${BORDER}`, paddingTop: 12, marginTop: 4 }}>
              {phase === "idle" && (
                <button className="btn-p" onClick={convert} style={{
                  width: "100%", padding: "13px 0", borderRadius: 11, border: "none",
                  background: libStatus !== "ready" ? SURF3 : `linear-gradient(135deg, ${ACCENT} 0%, #9d5fff 100%)`,
                  color: libStatus !== "ready" ? TEXTDIM : "white",
                  fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                  cursor: libStatus !== "ready" ? "not-allowed" : "pointer",
                  letterSpacing: "0.02em",
                }}>
                  {libStatus !== "ready" ? statusLabel + "…" : `Convert  ·  ${W}×${H}px`}
                </button>
              )}

              {isConverting && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: TEXTMID }}>
                      {phase === "capturing" ? "Capturing frames" : "Encoding GIF"}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: ACCENTHI, fontVariantNumeric: "tabular-nums" }}>{progress}%</span>
                  </div>
                  <div style={{ height: 3, background: SURF3, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENTHI})`, borderRadius: 3, transition: "width 0.3s ease" }} />
                  </div>
                  <p style={{ fontSize: 10, color: TEXTDIM, textAlign: "center", margin: 0, fontWeight: 500 }}>
                    {phase === "capturing"
                      ? `Frame ${capturedFrameCount} / ${totalFrames} · ${fps}fps · ${duration}s`
                      : `Building GIF — ${totalFrames} frames at ${fps}fps…`}
                  </p>
                </div>
              )}

              {phase === "done" && (
                <button className="btn-p" onClick={reset} style={{
                  width: "100%", padding: "13px 0", borderRadius: 11, border: `1px solid ${BORDER2}`,
                  background: SURF2, color: TEXTMID, fontFamily: "inherit", fontWeight: 700,
                  fontSize: 13, cursor: "pointer", letterSpacing: "0.02em",
                }}>
                  ↺ Convert another
                </button>
              )}

              {phase === "error" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 11, color: RED, fontWeight: 600, textAlign: "center", margin: 0 }}>⚠ {errorMsg || "Capture failed"}</p>
                  <button className="btn-p" onClick={reset} style={{
                    width: "100%", padding: "13px 0", borderRadius: 11, border: "none",
                    background: `linear-gradient(135deg, #7f1d1d, ${RED})`,
                    color: "white", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  }}>Try again</button>
                </div>
              )}
            </div>
          </div>

          {/* ──────────────── RIGHT PANEL ──────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Live preview */}
            <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: TEXTMID, textTransform: "uppercase", letterSpacing: "0.05em" }}>Preview</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {[tpl.label, `${W}×${H}`].map(s => (
                    <span key={s} style={{ padding: "2px 8px", borderRadius: 5, background: SURF2, border: `1px solid ${BORDER}`, fontSize: 10, fontWeight: 600, color: TEXTDIM }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ width: "100%", paddingTop: `${aspectPct}%`, position: "relative", borderRadius: 10, overflow: "hidden", background: "#030307", border: `1px solid ${BORDER}` }}>
                  <iframe srcDoc={previewSrcDoc} title="Live Preview" sandbox="allow-scripts allow-same-origin"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", display: "block" }} />
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 10, color: TEXTDIM, textAlign: "center", fontWeight: 500 }}>
                  Scaled to fit · exports at full {W}×{H}px
                </p>
              </div>
            </div>

            {/* GIF output */}
            {gifUrl && (
              <div style={{ background: "rgba(29,185,84,0.05)", borderRadius: 16, border: "1px solid rgba(29,185,84,0.2)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid rgba(29,185,84,0.12)" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: GREEN, textTransform: "uppercase", letterSpacing: "0.05em" }}>Output GIF</span>
                  <span style={{ padding: "2px 9px", borderRadius: 5, background: "rgba(29,185,84,0.12)", border: "1px solid rgba(29,185,84,0.25)", fontSize: 10, fontWeight: 600, color: GREEN }}>
                    ✓ {W}×{H} · {totalFrames}f · {fps}fps
                  </span>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ width: "100%", paddingTop: `${aspectPct}%`, position: "relative", borderRadius: 10, overflow: "hidden", background: "#000", border: "1px solid rgba(29,185,84,0.15)" }}>
                    <img src={gifUrl} alt="GIF output" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <button className="btn-p" onClick={download} style={{
                    width: "100%", marginTop: 12, padding: "13px 0",
                    borderRadius: 11, border: "none",
                    background: `linear-gradient(135deg, #15803d, ${GREEN})`,
                    color: "white", fontFamily: "inherit", fontWeight: 700,
                    fontSize: 13, cursor: "pointer", letterSpacing: "0.02em",
                  }}>
                    ↓ Download {tpl.label} GIF
                  </button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!gifUrl && phase === "idle" && (
              <div style={{
                background: "transparent", borderRadius: 16,
                border: `1px dashed ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: 68,
              }}>
                <p style={{ margin: 0, fontSize: 11, color: TEXTDIM, fontWeight: 500 }}>GIF output appears here after conversion</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}