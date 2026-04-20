import { useState, useRef, useEffect, useMemo, useCallback } from "react";

const TEMPLATES = {
  tiktok: { label: "TikTok", w: 1080, h: 1920, icon: "TK", color: "#010101", sub: "1080 × 1920 · 9:16" },
  instagram: { label: "Instagram Reels", w: 1080, h: 1920, icon: "IG", color: "#833ab4", sub: "1080 × 1920 · 9:16" },
  youtube: { label: "YouTube Shorts", w: 1080, h: 1920, icon: "YT", color: "#ff0000", sub: "1080 × 1920 · 9:16" },
  custom: { label: "Custom", w: 480, h: 854, icon: "✦", color: "#7c3aed", sub: "any size" },
};

const BASE_W = 360;
const PRESET_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Silent Exchange Ad</title><link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}:root{--teal:#0a6b6b;--teal2:#0d8a8a;--orange:#f26f21;--orange2:#ff9c2a;--gold:#f7d94c;--dark:#072d2d;--white:#fff}html,body{width:100%;height:100%;overflow:hidden;background:var(--dark);font-family:'Nunito',sans-serif}.ad{position:relative;width:100%;height:100%;background:var(--dark);overflow:hidden;display:flex;flex-direction:column;align-items:center;padding-bottom:3vh}.bg-pattern{position:absolute;inset:0;z-index:0;background:repeating-linear-gradient(45deg,rgba(10,107,107,.18) 0,rgba(10,107,107,.18) 2px,transparent 2px,transparent 28px),repeating-linear-gradient(-45deg,rgba(242,111,33,.10) 0,rgba(242,111,33,.10) 2px,transparent 2px,transparent 28px),linear-gradient(160deg,#051a1a 0%,#0a3030 50%,#051a1a 100%)}.header{position:relative;z-index:2;width:100%;background:linear-gradient(135deg,var(--teal) 0%,var(--teal2) 100%);border-bottom:.5vh solid var(--orange);padding:2.5vh 5% 5vh;text-align:center;clip-path:polygon(0 0,100% 0,100% 82%,50% 100%,0 82%);flex-shrink:0}.tag{display:inline-block;background:var(--orange);color:var(--white);font-family:'Fredoka One',cursive;font-size:1.8vw;letter-spacing:.3vw;text-transform:uppercase;padding:.4vh 2vw;border-radius:20px;margin-bottom:1vh;animation:pulse 2.4s ease-in-out infinite}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(242,111,33,.5)}50%{box-shadow:0 0 0 1vw rgba(242,111,33,0)}}.headline{font-family:'Fredoka One',cursive;font-size:9vw;line-height:1.05;color:var(--white);text-shadow:.4vw .4vw 0 var(--dark),0 0 3vw rgba(247,217,76,.4);letter-spacing:.05vw}.headline span.orange{color:var(--orange2)}.headline span.gold{color:var(--gold)}.headline-sm{font-family:'Fredoka One',cursive;font-size:6.5vw;line-height:1.1;color:var(--white);margin-top:.5vh}.sub{margin-top:.5vh;font-size:2.8vw;color:rgba(255,255,255,.7);font-weight:700;letter-spacing:.2vw}.grid-wrap{position:relative;z-index:2;width:100%;padding:2.5vh 4% 1vh;display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.5vw;flex-shrink:0}.card{background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:.3vw solid rgba(255,255,255,.1);border-radius:2vw;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;aspect-ratio:3/4;position:relative}.card-art{font-size:10vw;line-height:1;position:absolute;top:50%;left:50%;transform:translate(-50%,-55%);filter:drop-shadow(0 .5vw 1.5vw rgba(0,0,0,.5));animation:floaty 3s ease-in-out infinite}.card:nth-child(2) .card-art{animation-delay:.4s}.card:nth-child(3) .card-art{animation-delay:.8s}.card:nth-child(4) .card-art{animation-delay:1.2s}.card:nth-child(5) .card-art{animation-delay:1.6s}.card:nth-child(6) .card-art{animation-delay:2s}@keyframes floaty{0%,100%{transform:translate(-50%,-55%)}50%{transform:translate(-50%,-62%)}}.card-label{position:relative;width:100%;background:rgba(0,0,0,.55);text-align:center;font-size:2vw;font-weight:900;letter-spacing:.05vw;color:rgba(255,255,255,.9);padding:.7vh .5vw;text-transform:uppercase;line-height:1.3}.badge{position:absolute;top:4%;right:5%;background:var(--orange);color:#fff;font-size:1.6vw;font-weight:900;padding:.3vh .8vw;border-radius:20px;text-transform:uppercase;letter-spacing:.05vw}.card:nth-child(1){border-color:rgba(247,217,76,.3)}.card:nth-child(2){border-color:rgba(242,111,33,.3)}.card:nth-child(3){border-color:rgba(10,138,138,.4)}.card:nth-child(4){border-color:rgba(200,80,80,.3)}.card:nth-child(5){border-color:rgba(247,217,76,.3)}.card:nth-child(6){border-color:rgba(242,111,33,.3)}.cats{position:relative;z-index:2;display:flex;gap:1.5vw;flex-wrap:wrap;justify-content:center;padding:1vh 4% .5vh;flex-shrink:0}.cat{background:rgba(255,255,255,.06);border:.3vw solid rgba(255,255,255,.13);border-radius:20px;font-size:2vw;font-weight:900;letter-spacing:.05vw;color:rgba(255,255,255,.75);padding:.6vh 2.5vw;text-transform:uppercase;white-space:nowrap}.cat.hot{background:rgba(242,111,33,.2);border-color:var(--orange);color:var(--orange2)}.divider{position:relative;z-index:2;width:88%;height:.3vh;margin:1.5vh 0 0;background:linear-gradient(90deg,transparent,var(--orange),var(--gold),var(--orange),transparent);border-radius:2px;flex-shrink:0}.cta{position:relative;z-index:2;text-align:center;padding:2vh 5% 0;flex-shrink:0}.cta-action{font-family:'Fredoka One',cursive;font-size:3.2vw;color:rgba(255,255,255,.6);letter-spacing:.2vw;margin-bottom:.5vh}.cta-url{font-family:'Fredoka One',cursive;font-size:6vw;color:var(--white);letter-spacing:.05vw;line-height:1;animation:glow 2s ease-in-out infinite}@keyframes glow{0%,100%{text-shadow:0 0 2vw rgba(242,111,33,.4)}50%{text-shadow:0 0 4vw rgba(242,111,33,.8),0 0 8vw rgba(247,217,76,.3)}}.btn{display:inline-block;margin-top:1.5vh;background:linear-gradient(135deg,var(--orange),#e85d00);color:#fff;font-family:'Fredoka One',cursive;font-size:4.5vw;letter-spacing:.15vw;padding:1.2vh 8vw;border-radius:50px;text-transform:uppercase;box-shadow:0 1vh 4vw rgba(242,111,33,.5),inset 0 1px 0 rgba(255,255,255,.25);position:relative;overflow:hidden;animation:btn-glow 2.5s ease-in-out infinite}.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.25) 50%,transparent 100%);transform:translateX(-100%);animation:shimmer 2.5s infinite}@keyframes shimmer{0%{transform:translateX(-100%)}40%,100%{transform:translateX(200%)}}@keyframes btn-glow{0%,100%{box-shadow:0 1vh 3vw rgba(242,111,33,.45)}50%{box-shadow:0 1vh 5vw rgba(242,111,33,.8),0 0 8vw rgba(247,217,76,.2)}}.arrows{position:relative;z-index:2;display:flex;gap:.5vw;margin-top:1vh;flex-shrink:0}.arr{font-size:4.5vw;color:var(--gold);animation:bounce-arr .8s ease-in-out infinite}.arr:nth-child(2){animation-delay:.12s;color:var(--orange2)}.arr:nth-child(3){animation-delay:.24s;color:var(--white)}@keyframes bounce-arr{0%,100%{transform:translateX(0);opacity:.5}50%{transform:translateX(.5vw);opacity:1}}.logo{position:relative;z-index:2;margin-top:1.5vh;display:flex;flex-direction:column;align-items:center;gap:.2vh;flex-shrink:0}.logo-word{font-family:'Fredoka One',cursive;font-size:5.5vw;color:var(--orange2);letter-spacing:.5vw;text-transform:uppercase;line-height:1}.logo-sub{font-size:2vw;letter-spacing:.5vw;color:rgba(255,255,255,.45);text-transform:uppercase;font-weight:700}.star{position:absolute;z-index:1;background:var(--gold);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);opacity:.7;animation:twinkle 2.4s ease-in-out infinite}.star:nth-child(1){top:14%;left:6%;width:2.5vw;height:2.5vw;animation-delay:0s}.star:nth-child(2){top:10%;right:8%;width:1.8vw;height:1.8vw;animation-delay:.6s}.star:nth-child(3){top:22%;left:16%;width:1.5vw;height:1.5vw;animation-delay:1.2s}.star:nth-child(4){top:18%;right:20%;width:2vw;height:2vw;animation-delay:1.8s}.star:nth-child(5){bottom:18%;left:8%;width:2vw;height:2vw;animation-delay:.3s}.star:nth-child(6){bottom:22%;right:7%;width:2.5vw;height:2.5vw;animation-delay:.9s}@keyframes twinkle{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.9;transform:scale(1.3)}}</style></head><body><div class="ad"><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="bg-pattern"></div><div class="header"><div class="tag">✦ Now Open ✦</div><div class="headline">Love<br><span class="gold">Collectibles?</span></div><div class="headline-sm"><span class="orange">Buy</span> &nbsp;·&nbsp; <span class="orange">Sell</span> &nbsp;·&nbsp; Trade</div><div class="sub">Trading Cards &amp; More</div></div><div class="grid-wrap"><div class="card"><div class="card-art">🃏</div><div class="badge">PSA 10</div><div class="card-label">Pokémon<br>Cards</div></div><div class="card"><div class="card-art">⚡</div><div class="badge">CGC</div><div class="card-label">Sports<br>Cards</div></div><div class="card"><div class="card-art">🤖</div><div class="card-label">Funko<br>Pops</div></div><div class="card"><div class="card-art">🐉</div><div class="badge">Hot</div><div class="card-label">Yu-Gi-Oh<br>Packs</div></div><div class="card"><div class="card-art">🚗</div><div class="card-label">Hot<br>Wheels</div></div><div class="card"><div class="card-art">🦸</div><div class="card-label">Marvel<br>&amp; More</div></div></div><div class="cats"><span class="cat hot">🔥 Graded Slabs</span><span class="cat">Sealed Packs</span><span class="cat">Vintage</span><span class="cat">New Arrivals</span></div><div class="divider"></div><div class="cta"><div class="cta-action">Visit us at</div><div class="cta-url">SILENTEXCHANGE.STORE</div><div class="btn">Shop Now →</div></div><div class="arrows"><span class="arr">›</span><span class="arr">›</span><span class="arr">›</span></div><div class="logo"><div class="logo-word">Silent Exchange</div><div class="logo-sub">Your Collectibles Marketplace</div></div></div></body></html>`;

const loadScript = (src) => new Promise((resolve, reject) => {
  if (document.querySelector(`script[src="${src}"]`)) return resolve();
  const s = document.createElement("script");
  s.src = src;
  s.onload = resolve;
  s.onerror = reject;
  document.head.appendChild(s);
});

const buildCaptureHtml = (userHtml, w, h) =>
  /<!doctype html>|<html[\s>]/i.test(userHtml)
    ? userHtml
    : `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${w},initial-scale=1"><style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:transparent}</style></head><body>${userHtml}</body></html>`;

const S = {
  root: { minHeight: "100vh", background: "linear-gradient(145deg,#fdf4ff 0%,#f0f9ff 55%,#fff7ed 100%)", fontFamily: "'Nunito','Segoe UI',sans-serif", padding: "22px 18px 40px", position: "relative", overflow: "hidden" },
  blob1: { position: "absolute", top: -100, left: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(167,139,250,0.12)", filter: "blur(65px)", pointerEvents: "none" },
  blob2: { position: "absolute", bottom: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(244,114,182,0.09)", filter: "blur(65px)", pointerEvents: "none" },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, position: "relative", zIndex: 1, flexWrap: "wrap" },
  logo: { width: 42, height: 42, borderRadius: 13, flexShrink: 0, background: "linear-gradient(135deg,#a78bfa,#f472b6)", display: "flex", alignItems: "center", justifyContent: "center" },
  title: { margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", background: "linear-gradient(135deg,#7c3aed,#db2777)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sub: { margin: "2px 0 0", fontSize: 12, color: "#94a3b8", fontWeight: 700 },
  pills: { display: "flex", gap: 6, flexWrap: "wrap", marginLeft: "auto" },
  pill: { padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: 700, color: "#64748b", border: "1.5px solid #f1f5f9" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, position: "relative", zIndex: 1 },
  card: { background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", borderRadius: 22, padding: 16, boxShadow: "0 5px 28px rgba(124,58,237,0.07)", border: "1.5px solid rgba(255,255,255,0.95)", display: "flex", flexDirection: "column", gap: 11 },
  tabRow: { display: "flex", gap: 6 },
  tab: { flex: 1, padding: "8px 0", border: "none", borderRadius: 12, background: "#f1f5f9", color: "#94a3b8", fontFamily: "inherit", fontWeight: 800, fontSize: 12, cursor: "pointer", transition: "all 0.15s" },
  tabActive: { background: "linear-gradient(135deg,#a78bfa,#f472b6)", color: "white" },
  editor: { width: "100%", height: 240, border: "2px solid #f1f5f9", borderRadius: 14, padding: "10px 12px", fontSize: 10.5, fontFamily: "'Courier New',monospace", resize: "vertical", background: "#fafbff", color: "#334155", lineHeight: 1.75 },
  sliderLabel: { fontWeight: 700, fontSize: 12, color: "#64748b" },
  sliderVal: { fontWeight: 900, fontSize: 13, color: "#a78bfa" },
  mainBtn: { width: "100%", padding: "12px 0", background: "linear-gradient(135deg,#a78bfa,#f472b6)", border: "none", borderRadius: 16, color: "white", fontFamily: "inherit", fontWeight: 900, fontSize: 13, cursor: "pointer", boxShadow: "0 5px 18px rgba(167,139,250,0.38)", letterSpacing: 0.2, transition: "transform 0.12s,filter 0.12s" },
  track: { height: 8, background: "#f1f5f9", borderRadius: 8, overflow: "hidden" },
  fill: { height: "100%", background: "linear-gradient(90deg,#a78bfa,#f472b6)", borderRadius: 8, transition: "width 0.3s ease" },
  cardLabel: { fontWeight: 800, fontSize: 13, color: "#475569" },
  hint: { margin: 0, fontSize: 10, color: "#94a3b8", fontWeight: 700, textAlign: "center" },
};

export default function App() {
  const [html, setHtml] = useState(PRESET_HTML);
  const [templateKey, setTemplateKey] = useState("tiktok");
  const [fps, setFps] = useState(18);
  const [duration, setDuration] = useState(3);
  const [quality, setQuality] = useState(3);
  const [animSpeed, setAnimSpeed] = useState(1.0);
  const [loop, setLoop] = useState(true);
  const [customW, setCustomW] = useState(480);
  const [customH, setCustomH] = useState(854);
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [gifUrl, setGifUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("code");
  const [libStatus, setLibStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const captureContainerRef = useRef(null);
  const scriptsReady = useRef(false);
  const lastGifUrl = useRef(null);

  // Use refs to always read latest settings inside async callbacks — fixes stale closure bugs
  const settingsRef = useRef({ fps, duration, quality, loop, animSpeed });
  useEffect(() => {
    settingsRef.current = { fps, duration, quality, loop, animSpeed };
  }, [fps, duration, quality, loop, animSpeed]);

  const tpl = TEMPLATES[templateKey];
  const W = templateKey === "custom" ? customW : tpl.w;
  const H = templateKey === "custom" ? customH : tpl.h;
  const totalFrames = useMemo(() => Math.max(1, Math.ceil(fps * duration)), [fps, duration]);
  const aspectPct = useMemo(() => ((H / W) * 100).toFixed(4), [H, W]);
  const previewSrcDoc = useMemo(() => buildCaptureHtml(html, W, H), [html, W, H]);

  useEffect(() => {
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gifshot/0.3.1/gifshot.min.js"),
    ]).then(() => {
      scriptsReady.current = true;
      setLibStatus("ready");
    }).catch(() => setLibStatus("error"));
  }, []);

  useEffect(() => () => {
    if (lastGifUrl.current) URL.revokeObjectURL(lastGifUrl.current);
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setGifUrl(null);
    setProgress(0);
    setErrorMsg("");
  }, []);

  const convert = useCallback(async () => {
    if (!scriptsReady.current || phase !== "idle") return;
    const container = captureContainerRef.current;
    if (!container) return;

    // Snapshot current settings at the moment convert is clicked — prevents drift
    const { fps: capFps, duration: capDuration, quality: capQuality, loop: capLoop, animSpeed: capAnimSpeed } = settingsRef.current;
    const capTotalFrames = Math.max(1, Math.ceil(capFps * capDuration));
    // gifshot interval is seconds per frame
    const frameIntervalSec = 1 / capFps;
    // ms to wait between captures so animations advance at real speed
    const frameDelayMs = Math.max(16, Math.round(1000 / capFps));

    setPhase("capturing");
    setProgress(0);
    setGifUrl(null);
    setErrorMsg("");
    container.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.sandbox = "allow-scripts allow-same-origin";
    iframe.scrolling = "no";
    iframe.style.cssText = `width:${W}px;height:${H}px;border:none;display:block;position:absolute;top:0;left:0;overflow:hidden;transform:scale(${BASE_W / W});transform-origin:top left;background:transparent`;
    container.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    doc.open();
    doc.write(buildCaptureHtml(html, W, H));
    doc.close();

    // Wait for fonts + initial animations to settle
    await new Promise(r => setTimeout(r, 1200));

    // Inject animation speed override — scales all CSS animation durations globally
    // animSpeed < 1 = slower (e.g. 0.5 = half speed), > 1 = faster
    if (capAnimSpeed !== 1.0) {
      try {
        const captureDoc = iframe.contentDocument || iframe.contentWindow?.document;
        const styleEl = captureDoc.createElement("style");
        // Use animation-duration override via factor — divide duration by speed so 0.5x = twice as long
        const factor = 1 / capAnimSpeed;
        styleEl.textContent = `*, *::before, *::after { animation-duration: calc(var(--anim-dur, 1s) * ${factor.toFixed(4)}) !important; animation-play-state: running !important; }`;
        // Better approach: override via playback rate on each animation
        // Instead inject a script that patches all running animations
        styleEl.textContent = "";
        const scriptEl = captureDoc.createElement("script");
        scriptEl.textContent = `
          (function() {
            const factor = ${factor.toFixed(6)};
            function patchAnims(root) {
              const els = root.querySelectorAll('*');
              els.forEach(el => {
                const anims = el.getAnimations ? el.getAnimations() : [];
                anims.forEach(a => { try { a.playbackRate = ${capAnimSpeed.toFixed(6)}; } catch(e){} });
              });
            }
            patchAnims(document);
            // Re-patch after a tick for any deferred animations
            setTimeout(() => patchAnims(document), 100);
            setTimeout(() => patchAnims(document), 400);
          })();
        `;
        captureDoc.head.appendChild(scriptEl);
      } catch(e) { /* sandbox may block, graceful fallback */ }
    }

    const frames = [];

    try {
      for (let i = 0; i < capTotalFrames; i++) {
        const captureDoc = iframe.contentDocument || iframe.contentWindow?.document;
        const target = captureDoc.querySelector(".ad") || captureDoc.body;

        // Wait for fonts inside iframe
        await captureDoc.fonts?.ready?.catch?.(() => {});
        // Sync to animation frame for smoothest capture
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        const rect = target.getBoundingClientRect();
        const scale = W / rect.width;

        const canvas = await window.html2canvas(target, {
          width: rect.width,
          height: rect.height,
          windowWidth: rect.width,
          windowHeight: rect.height,
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0,
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
          foreignObjectRendering: true,
        });

        // Ensure output canvas is exactly W×H
        let out = canvas;
        if (canvas.width !== W || canvas.height !== H) {
          out = document.createElement("canvas");
          out.width = W;
          out.height = H;
          out.getContext("2d").drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, W, H);
        }

        frames.push(out.toDataURL("image/png"));

        // Progress: capturing = 0–65%
        setProgress(Math.round(((i + 1) / capTotalFrames) * 65));

        // Wait exactly one frame's worth of time so animations advance correctly
        await new Promise(r => setTimeout(r, frameDelayMs));
      }

      setPhase("encoding");
      setProgress(66);

      window.gifshot.createGIF(
        {
          images: frames,
          gifWidth: W,
          gifHeight: H,
          // interval = seconds between frames — must match capture rate
          interval: frameIntervalSec,
          numWorkers: Math.min(8, navigator.hardwareConcurrency || 4),
          // gifshot quality: 1 = best, higher = faster/worse. Use snapshotted value.
          quality: capQuality,
          // 0 = loop forever, -1 = no loop
          repeat: capLoop ? 0 : -1,
          progressCallback: p => setProgress(66 + Math.round(p * 34)),
        },
        (obj) => {
          container.innerHTML = "";
          if (obj.error) {
            setErrorMsg(obj.errorMsg || "GIF generation failed");
            setPhase("error");
            return;
          }
          if (lastGifUrl.current) URL.revokeObjectURL(lastGifUrl.current);
          setGifUrl(obj.image);
          lastGifUrl.current = obj.image;
          setPhase("done");
          setProgress(100);
        }
      );
    } catch (err) {
      setErrorMsg(err?.message || "Capture failed");
      container.innerHTML = "";
      setPhase("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, html, W, H]);

  const download = useCallback(() => {
    if (!gifUrl) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = `${tpl.label.replace(/\s+/g, "_")}_${W}x${H}.gif`;
    a.click();
  }, [gifUrl, tpl.label, W, H]);

  const isConverting = phase === "capturing" || phase === "encoding";
  const capturedFrameCount = isConverting && phase === "capturing"
    ? Math.min(totalFrames, Math.max(0, Math.round((progress / 65) * totalFrames)))
    : totalFrames;

  return (
    <div style={S.root}>
      <style>{`*{box-sizing:border-box}textarea:focus{border-color:#c4b5fd!important;outline:none}input[type=range]{-webkit-appearance:none;appearance:none;height:5px;border-radius:99px;outline:none;cursor:pointer;background:#e2e8f0}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;background:white;box-shadow:0 2px 7px rgba(0,0,0,0.18);border:2px solid #a78bfa;cursor:pointer}.mbtn:hover{transform:translateY(-1px);filter:brightness(1.08)}.mbtn:active{transform:scale(.98)}.tcard{transition:all .15s;cursor:pointer}.tcard:hover{transform:translateY(-2px)}`}</style>

      {/* Off-screen capture sandbox */}
      <div
        ref={captureContainerRef}
        style={{ position: "fixed", left: "-9999px", top: 0, overflow: "hidden", pointerEvents: "none", zIndex: -1 }}
      />

      <div style={S.blob1} />
      <div style={S.blob2} />

      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" />
          </svg>
        </div>
        <div>
          <h1 style={S.title}>HTML → Reel GIF</h1>
          <p style={S.sub}>Export at exact social media dimensions</p>
        </div>
        <div style={S.pills}>
          <span style={S.pill}>{totalFrames} frames · {fps}fps · {duration}s</span>
          <span style={S.pill}>{W} × {H}px</span>
          <span style={{
            ...S.pill,
            background: libStatus === "ready" ? "#dcfce7" : libStatus === "error" ? "#fee2e2" : "#fef9c3",
            color: libStatus === "ready" ? "#15803d" : libStatus === "error" ? "#b91c1c" : "#a16207"
          }}>{libStatus}</span>
        </div>
      </div>

      {/* Template picker */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16, position: "relative", zIndex: 1 }}>
        {Object.entries(TEMPLATES).map(([key, t]) => {
          const active = templateKey === key;
          return (
            <div
              key={key}
              className="tcard"
              onClick={() => { setTemplateKey(key); reset(); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 16,
                border: active ? "2px solid #a78bfa" : "1.5px solid rgba(0,0,0,0.07)",
                background: active ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.88)",
                boxShadow: active ? "0 0 0 3px rgba(167,139,250,0.18)" : "none"
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: "white", letterSpacing: -0.5 }}>{t.icon}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.label}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{t.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom size sliders */}
      {templateKey === "custom" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12, position: "relative", zIndex: 1 }}>
          {[{ label: "Width", val: customW, set: setCustomW, min: 100, max: 2000 }, { label: "Height", val: customH, set: setCustomH, min: 100, max: 4000 }].map(({ label, val, set, min, max }) => (
            <div key={label} style={{ ...S.card, padding: "12px 16px", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={S.sliderLabel}>{label}</span>
                <span style={S.sliderVal}>{val}px</span>
              </div>
              <input type="range" min={min} max={max} step={10} value={val} onChange={e => { set(Number(e.target.value)); reset(); }} style={{ width: "100%" }} />
            </div>
          ))}
        </div>
      )}

      {/* Main grid */}
      <div style={S.grid}>
        {/* Left: code + settings */}
        <div style={S.card}>
          <div style={S.tabRow}>
            {["code", "settings"].map(t => (
              <button key={t} style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }} onClick={() => setActiveTab(t)}>
                {t === "code" ? "⌨ Code" : "⚙ Settings"}
              </button>
            ))}
          </div>

          {activeTab === "code" && (
            <textarea
              value={html}
              onChange={e => { setHtml(e.target.value); reset(); }}
              style={S.editor}
              spellCheck={false}
              placeholder="Paste your HTML animation here…"
            />
          )}

          {activeTab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
              {[
                { label: "FPS", val: fps, set: setFps, min: 1, max: 30, step: 0.5, unit: " fps", hint: "Lower = fewer frames, smaller file" },
                { label: "Duration", val: duration, set: setDuration, min: 0.5, max: 12, step: 0.5, unit: "s", hint: null },
                { label: "Quality (1 = best)", val: quality, set: setQuality, min: 1, max: 20, step: 1, unit: "", hint: "Lower = sharper, slower encode" },
              ].map(({ label, val, set, min, max, step, unit, hint }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: hint ? 2 : 7 }}>
                    <span style={S.sliderLabel}>{label}</span>
                    <span style={S.sliderVal}>{val}{unit}</span>
                  </div>
                  {hint && <p style={{ margin: "0 0 6px", fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{hint}</p>}
                  <input type="range" min={min} max={max} step={step} value={val}
                    onChange={e => { set(Number(e.target.value)); reset(); }} style={{ width: "100%" }} />
                </div>
              ))}

              {/* Animation speed */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={S.sliderLabel}>Animation speed</span>
                  <span style={S.sliderVal}>{animSpeed.toFixed(2)}×</span>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>
                  {animSpeed < 1 ? `${(1/animSpeed).toFixed(1)}× slower — animations stretched out` : animSpeed > 1 ? `${animSpeed.toFixed(1)}× faster — animations sped up` : "Normal speed"}
                </p>
                <input type="range" min={0.1} max={3} step={0.05} value={animSpeed}
                  onChange={e => { setAnimSpeed(Number(e.target.value)); reset(); }} style={{ width: "100%" }} />
                {/* Speed presets */}
                <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
                  {[
                    { label: "¼×", val: 0.25 },
                    { label: "½×", val: 0.5 },
                    { label: "¾×", val: 0.75 },
                    { label: "1×", val: 1.0 },
                    { label: "1.5×", val: 1.5 },
                    { label: "2×", val: 2.0 },
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={() => { setAnimSpeed(p.val); reset(); }}
                      style={{
                        flex: 1, padding: "5px 0", border: "none", borderRadius: 8, fontFamily: "inherit",
                        fontWeight: 800, fontSize: 11, cursor: "pointer", transition: "all 0.15s",
                        background: Math.abs(animSpeed - p.val) < 0.01 ? "linear-gradient(135deg,#a78bfa,#f472b6)" : "#f1f5f9",
                        color: Math.abs(animSpeed - p.val) < 0.01 ? "white" : "#64748b",
                      }}
                    >{p.label}</button>
                  ))}
                </div>
              </div>

              {/* Loop toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={S.sliderLabel}>Loop GIF</span>
                <div
                  onClick={() => setLoop(v => !v)}
                  style={{ width: 48, height: 24, borderRadius: 12, cursor: "pointer", position: "relative", flexShrink: 0, background: loop ? "linear-gradient(135deg,#a78bfa,#f472b6)" : "#e2e8f0", transition: "background 0.3s" }}
                >
                  <div style={{ position: "absolute", top: 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "transform 0.3s", transform: loop ? "translateX(26px)" : "translateX(2px)", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }} />
                </div>
              </div>

              {/* Summary of what will be encoded */}
              <div style={{ background: "rgba(167,139,250,0.08)", borderRadius: 12, padding: "10px 12px", fontSize: 11, color: "#64748b", fontWeight: 700, lineHeight: 1.7 }}>
                <span style={{ color: "#7c3aed" }}>Will encode:</span><br />
                {Math.ceil(fps * duration)} frames · {fps}fps · {duration}s · {animSpeed.toFixed(2)}× speed · quality {quality} · {loop ? "looping" : "no loop"}
              </div>
            </div>
          )}

          {/* Action area */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {phase === "idle" && (
              <button
                className="mbtn"
                style={{ ...S.mainBtn, opacity: libStatus !== "ready" ? 0.5 : 1, cursor: libStatus !== "ready" ? "not-allowed" : "pointer" }}
                onClick={convert}
              >
                ✦ Convert — {W}×{H}px
              </button>
            )}

            {isConverting && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: "#64748b" }}>
                    {phase === "capturing" ? "📸 Capturing frames" : "🔄 Encoding GIF"}
                  </span>
                  <span style={{ fontWeight: 900, fontSize: 13, color: "#a78bfa" }}>{progress}%</span>
                </div>
                <div style={S.track}>
                  <div style={{ ...S.fill, width: `${progress}%` }} />
                </div>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 600, textAlign: "center" }}>
                  {phase === "capturing"
                    ? `Frame ${capturedFrameCount} of ${totalFrames} · ${fps}fps · ${duration}s`
                    : `Building GIF — ${totalFrames} frames at ${fps}fps…`}
                </p>
              </div>
            )}

            {phase === "done" && (
              <button className="mbtn" style={{ ...S.mainBtn, background: "linear-gradient(135deg,#818cf8,#a78bfa)" }} onClick={reset}>
                ↺ Convert Another
              </button>
            )}

            {phase === "error" && (
              <>
                <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 700, textAlign: "center", margin: 0 }}>⚠ {errorMsg || "Capture failed"}</p>
                <button className="mbtn" style={{ ...S.mainBtn, background: "linear-gradient(135deg,#f87171,#fb923c)" }} onClick={reset}>↺ Try Again</button>
              </>
            )}
          </div>
        </div>

        {/* Right: preview + output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={S.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={S.cardLabel}>Live Preview</span>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={S.pill}>{tpl.label}</span>
                <span style={S.pill}>{W}×{H}</span>
              </div>
            </div>
            <div style={{ width: "100%", paddingTop: `${aspectPct}%`, position: "relative", borderRadius: 14, overflow: "hidden", background: "#0a0a0a", border: "2px solid #1a1a2a" }}>
              <iframe
                srcDoc={previewSrcDoc}
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", display: "block" }}
              />
            </div>
            <p style={S.hint}>Preview scales to fit. GIF renders at full {W}×{H}px.</p>
          </div>

          {gifUrl && (
            <div style={{ ...S.card, borderColor: "rgba(52,211,153,0.35)", background: "rgba(240,253,244,0.92)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={S.cardLabel}>Output GIF</span>
                <span style={{ ...S.pill, background: "#bbf7d0", color: "#14532d" }}>✓ {W}×{H}px · {totalFrames}f · {fps}fps</span>
              </div>
              <div style={{ width: "100%", paddingTop: `${aspectPct}%`, position: "relative", borderRadius: 12, overflow: "hidden", background: "#000" }}>
                <img src={gifUrl} alt="GIF output" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <button className="mbtn" onClick={download} style={{ ...S.mainBtn, marginTop: 4, background: "linear-gradient(135deg,#34d399,#0ea5e9)", boxShadow: "0 5px 18px rgba(52,211,153,0.35)" }}>
                ↓ Download {tpl.label} GIF — {W}×{H}px
              </button>
            </div>
          )}

          {!gifUrl && phase === "idle" && (
            <div style={{ ...S.card, border: "2px dashed #e2e8f0", background: "rgba(255,255,255,0.4)", alignItems: "center", justifyContent: "center", minHeight: 80, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>GIF preview appears here after conversion</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}