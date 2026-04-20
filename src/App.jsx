import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

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

// ─── Design tokens ─────────────────────────────────────────────────────────
const BG       = "#080810";
const SURFACE  = "#0f0f1a";
const SURF2    = "#16162a";
const SURF3    = "#1e1e35";
const BORDER   = "rgba(255,255,255,0.07)";
const BORDER2  = "rgba(255,255,255,0.13)";
const ACCENT   = "#6d4fff";
const ACCENTHI = "#9d7fff";
const TEXT     = "#e8e8f0";
const TEXTMID  = "#7878a0";
const TEXTDIM  = "#3a3a58";
const GREEN    = "#1db954";
const BLUE     = "#3b82f6";
const BLUEHI   = "#60a5fa";
const RED      = "#e03e3e";

// ─── Singleton FFmpeg instance ──────────────────────────────────────────────
let ffmpegInstance = null;
let ffmpegLoadPromise = null;

async function getFFmpeg(onLog) {
  if (ffmpegInstance) {
    if (onLog) ffmpegInstance.on("log", ({ message }) => onLog(message));
    return ffmpegInstance;
  }
  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = (async () => {
      const ff = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
      await ff.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`,   "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegInstance = ff;
      return ff;
    })();
  }
  const ff = await ffmpegLoadPromise;
  if (onLog) ff.on("log", ({ message }) => onLog(message));
  return ff;
}

// ─── Capture frames ─────────────────────────────────────────────────────────
async function captureFrames({ iframe, W, H, totalFrames, fps, animSpeed, onProgress }) {
  const frameDelayMs = Math.max(16, Math.round(1000 / fps));

  if (animSpeed !== 1.0) {
    try {
      const cd = iframe.contentDocument || iframe.contentWindow?.document;
      const sc = cd.createElement("script");
      sc.textContent = `(function(){function p(r){r.querySelectorAll('*').forEach(el=>{(el.getAnimations?el.getAnimations():[]).forEach(a=>{try{a.playbackRate=${animSpeed.toFixed(6)}}catch(e){}})});}p(document);setTimeout(()=>p(document),100);setTimeout(()=>p(document),400);})();`;
      cd.head.appendChild(sc);
    } catch(e) {}
  }

  const frames = [];
  for (let i = 0; i < totalFrames; i++) {
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
    frames.push(out);
    onProgress(i + 1);
    await new Promise(r => setTimeout(r, frameDelayMs));
  }
  return frames;
}

// ─── Encode MP4 via FFmpeg.wasm (libx264 / H.264) ──────────────────────────
async function encodeMp4({ frames, fps, crf, onWriteProgress, onEncodeProgress, onFFmpegLog }) {
  const ff = await getFFmpeg(onFFmpegLog);

  // Write each canvas frame as PNG into FFmpeg's virtual FS
  for (let i = 0; i < frames.length; i++) {
    const blob = await new Promise(r => frames[i].toBlob(r, "image/png"));
    const buf  = await blob.arrayBuffer();
    await ff.writeFile(`frame${String(i).padStart(4, "0")}.png`, new Uint8Array(buf));
    onWriteProgress(i + 1);
  }

  // Wire up encode progress from FFmpeg log lines ("frame=  N")
  ff.on("log", ({ message }) => {
    const m = message.match(/frame=\s*(\d+)/);
    if (m) onEncodeProgress(parseInt(m[1]));
  });

  // PNG sequence → H.264 MP4
  // -vf scale ensures even width/height (libx264 requirement)
  await ff.exec([
    "-framerate", String(fps),
    "-i",         "frame%04d.png",
    "-c:v",       "libx264",
    "-preset",    "medium",
    "-crf",       String(crf),
    "-pix_fmt",   "yuv420p",
    "-movflags",  "+faststart",
    "-vf",        "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "output.mp4",
  ]);

  const data = await ff.readFile("output.mp4");
  const url  = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));

  // Clean up virtual FS
  for (let i = 0; i < frames.length; i++) {
    try { await ff.deleteFile(`frame${String(i).padStart(4, "0")}.png`); } catch(_) {}
  }
  try { await ff.deleteFile("output.mp4"); } catch(_) {}

  return url;
}

export default function App() {
  const [html, setHtml]               = useState(PRESET_HTML);
  const [templateKey, setTemplateKey] = useState("tiktok");
  const [fps, setFps]                 = useState(18);
  const [duration, setDuration]       = useState(3);
  const [quality, setQuality]         = useState(3);   // GIF: 1=best
  const [crf, setCrf]                 = useState(20);  // MP4: 0=lossless, 18-23 looks great
  const [animSpeed, setAnimSpeed]     = useState(1.0);
  const [loop, setLoop]               = useState(true);
  const [customW, setCustomW]         = useState(480);
  const [customH, setCustomH]         = useState(854);
  const [exportFormat, setExportFormat] = useState("gif");

  const [phase, setPhase]           = useState("idle");
  const [progress, setProgress]     = useState(0);
  const [phaseLabel, setPhaseLabel] = useState("");
  const [gifUrl, setGifUrl]         = useState(null);
  const [videoUrl, setVideoUrl]     = useState(null);
  const [activeTab, setActiveTab]   = useState("code");
  const [libStatus, setLibStatus]   = useState("loading");
  const [ffStatus, setFfStatus]     = useState("idle"); // idle|loading|ready|error
  const [errorMsg, setErrorMsg]     = useState("");

  const captureContainerRef = useRef(null);
  const scriptsReady        = useRef(false);
  const lastGifUrl          = useRef(null);
  const lastVideoUrl        = useRef(null);

  const settingsRef = useRef({ fps, duration, quality, crf, loop, animSpeed, exportFormat });
  useEffect(() => {
    settingsRef.current = { fps, duration, quality, crf, loop, animSpeed, exportFormat };
  }, [fps, duration, quality, crf, loop, animSpeed, exportFormat]);

  const tpl         = TEMPLATES[templateKey];
  const W           = templateKey === "custom" ? customW : tpl.w;
  const H           = templateKey === "custom" ? customH : tpl.h;
  const totalFrames = useMemo(() => Math.max(1, Math.ceil(fps * duration)), [fps, duration]);
  const aspectPct   = useMemo(() => ((H / W) * 100).toFixed(4), [H, W]);
  const previewSrcDoc = useMemo(() => buildCaptureHtml(html, W, H), [html, W, H]);

  // Load html2canvas + gifshot
  useEffect(() => {
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gifshot/0.3.1/gifshot.min.js"),
    ]).then(() => { scriptsReady.current = true; setLibStatus("ready"); })
      .catch(() => setLibStatus("error"));
  }, []);

  // Pre-warm FFmpeg the moment user switches to video mode
  useEffect(() => {
    if (exportFormat === "video" && ffStatus === "idle") {
      setFfStatus("loading");
      getFFmpeg()
        .then(() => setFfStatus("ready"))
        .catch(() => setFfStatus("error"));
    }
  }, [exportFormat, ffStatus]);

  useEffect(() => () => {
    if (lastGifUrl.current)   URL.revokeObjectURL(lastGifUrl.current);
    if (lastVideoUrl.current) URL.revokeObjectURL(lastVideoUrl.current);
  }, []);

  const reset = useCallback(() => {
    setPhase("idle"); setGifUrl(null); setVideoUrl(null);
    setProgress(0); setPhaseLabel(""); setErrorMsg("");
  }, []);

  // ─── Main convert handler ────────────────────────────────────────────────
  const convert = useCallback(async () => {
    if (phase !== "idle" || !scriptsReady.current) return;
    const container = captureContainerRef.current;
    if (!container) return;

    const {
      fps: capFps, duration: capDur, quality: capQ,
      crf: capCrf, loop: capLoop, animSpeed: capSpeed, exportFormat: capFmt,
    } = settingsRef.current;
    const capFrames = Math.max(1, Math.ceil(capFps * capDur));

    setPhase("capturing"); setProgress(0); setPhaseLabel("Capturing frames…");
    setGifUrl(null); setVideoUrl(null); setErrorMsg("");
    container.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.sandbox = "allow-scripts allow-same-origin";
    iframe.scrolling = "no";
    iframe.style.cssText = `width:${W}px;height:${H}px;border:none;display:block;position:absolute;top:0;left:0;overflow:hidden;transform:scale(${BASE_W/W});transform-origin:top left;background:transparent`;
    container.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    doc.open(); doc.write(buildCaptureHtml(html, W, H)); doc.close();
    await new Promise(r => setTimeout(r, 1200));

    try {
      // Step 1 — Capture (0–55%)
      const canvasFrames = await captureFrames({
        iframe, W, H, totalFrames: capFrames, fps: capFps, animSpeed: capSpeed,
        onProgress: i => setProgress(Math.round((i / capFrames) * 55)),
      });
      container.innerHTML = "";
      setPhase("encoding"); setProgress(56);

      if (capFmt === "gif") {
        // ── GIF path ──
        setPhaseLabel("Encoding GIF…");
        const dataUrls = canvasFrames.map(c => c.toDataURL("image/png"));
        window.gifshot.createGIF({
          images: dataUrls, gifWidth: W, gifHeight: H, interval: 1 / capFps,
          numWorkers: Math.min(8, navigator.hardwareConcurrency || 4),
          quality: capQ, repeat: capLoop ? 0 : -1,
          progressCallback: p => setProgress(56 + Math.round(p * 44)),
        }, obj => {
          if (obj.error) { setErrorMsg(obj.errorMsg || "GIF failed"); setPhase("error"); return; }
          if (lastGifUrl.current) URL.revokeObjectURL(lastGifUrl.current);
          setGifUrl(obj.image); lastGifUrl.current = obj.image;
          setPhase("done"); setProgress(100); setPhaseLabel("");
        });

      } else {
        // ── MP4 path (FFmpeg.wasm) ──
        setPhaseLabel("Loading FFmpeg…");
        await getFFmpeg(); // ensure loaded
        setFfStatus("ready");

        setPhaseLabel("Writing frames to encoder…");
        const url = await encodeMp4({
          frames: canvasFrames, fps: capFps, crf: capCrf,
          // 56–80%: writing PNGs
          onWriteProgress: i => {
            setProgress(56 + Math.round((i / capFrames) * 24));
            if (i === capFrames) setPhaseLabel("Encoding MP4 (H.264)…");
          },
          // 80–99%: ffmpeg encoding
          onEncodeProgress: frameNum => {
            const pct = Math.min(19, Math.round((frameNum / capFrames) * 19));
            setProgress(80 + pct);
          },
          onFFmpegLog: () => {},
        });

        if (lastVideoUrl.current) URL.revokeObjectURL(lastVideoUrl.current);
        setVideoUrl(url); lastVideoUrl.current = url;
        setPhase("done"); setProgress(100); setPhaseLabel("");
      }
    } catch (err) {
      setErrorMsg(err?.message || "Conversion failed");
      container.innerHTML = "";
      setPhase("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, html, W, H]);

  const download = useCallback(() => {
    const isVid = exportFormat === "video";
    const url   = isVid ? videoUrl : gifUrl;
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tpl.label.replace(/\s+/g, "_")}_${W}x${H}.${isVid ? "mp4" : "gif"}`;
    a.click();
  }, [exportFormat, gifUrl, videoUrl, tpl.label, W, H]);

  const isConverting = phase === "capturing" || phase === "encoding";
  const capturedCount = isConverting && phase === "capturing"
    ? Math.min(totalFrames, Math.max(0, Math.round((progress / 55) * totalFrames)))
    : totalFrames;

  const outputExists = !!(exportFormat === "video" ? videoUrl : gifUrl);
  const canConvert   = libStatus === "ready" && (exportFormat === "gif" || ffStatus === "ready" || ffStatus === "idle");

  // ─── Micro-components ───────────────────────────────────────────────────
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

  const gifColor = libStatus === "ready" ? GREEN : libStatus === "error" ? RED : "#d4a843";
  const ffColor  = ffStatus  === "ready" ? GREEN : ffStatus === "error"  ? RED : ffStatus === "loading" ? "#d4a843" : TEXTDIM;
  const ffLabel  = { idle: "FFmpeg (loads on use)", loading: "Loading FFmpeg…", ready: "FFmpeg ready", error: "FFmpeg error" }[ffStatus];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter','SF Pro Display',-apple-system,sans-serif", color: TEXT }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box}body{margin:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${BORDER2};border-radius:4px}
        textarea{outline:none;caret-color:${ACCENTHI}}
        textarea:focus{border-color:${ACCENT}!important}
        input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:99px;outline:none;cursor:pointer;background:${SURF3}}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${ACCENTHI};cursor:pointer;border:2px solid ${SURFACE};box-shadow:0 0 0 3px rgba(109,79,255,0.25);transition:transform .1s}
        input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2)}
        .btn-p{transition:opacity .15s,transform .12s}.btn-p:hover{opacity:.88}.btn-p:active{transform:scale(.98);opacity:.95}
        .tpl-card{transition:border-color .15s,background .15s}.tpl-card:hover{border-color:${BORDER2}!important}
        .fmt-btn{transition:all .15s}.fmt-btn:hover{opacity:.85}
        @media(max-width:640px){.main-grid{grid-template-columns:1fr!important}.tpl-grid{grid-template-columns:repeat(2,1fr)!important}.tpl-meta{display:none!important}.nav-stats{display:none!important}}
      `}</style>

      <div ref={captureContainerRef} style={{ position: "fixed", left: "-9999px", top: 0, overflow: "hidden", pointerEvents: "none", zIndex: -1 }} />

      {/* NAV */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100, height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 18px", background: "rgba(8,8,16,0.92)", backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg,${ACCENT},${ACCENTHI})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.2px", color: TEXT, lineHeight: 1.2 }}>ReelGIF</div>
            <div style={{ fontSize: 10, color: TEXTDIM, fontWeight: 500 }}>HTML → GIF / MP4 Exporter</div>
          </div>
        </div>

        <div className="nav-stats" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[`${totalFrames} frames`, `${fps} fps`, `${duration}s`, `${W}×${H}`,
            exportFormat === "video" ? `CRF ${crf}` : `q${quality}`
          ].map(s => (
            <span key={s} style={{ padding: "3px 9px", borderRadius: 6, background: SURF2, border: `1px solid ${BORDER}`, fontSize: 10, fontWeight: 600, color: TEXTMID }}>{s}</span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: gifColor, boxShadow: `0 0 6px ${gifColor}` }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: gifColor }}>
              {libStatus === "ready" ? "GIF ready" : libStatus === "error" ? "GIF error" : "Loading…"}
            </span>
          </div>
          {exportFormat === "video" && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ffColor, boxShadow: `0 0 6px ${ffColor}` }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: ffColor }}>{ffLabel}</span>
            </div>
          )}
        </div>
      </header>

      {/* BODY */}
      <div style={{ padding: "16px 16px 60px", maxWidth: 920, margin: "0 auto" }}>

        {/* Templates */}
        <div className="tpl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          {Object.entries(TEMPLATES).map(([key, t]) => {
            const active = templateKey === key;
            return (
              <div key={key} className="tpl-card" onClick={() => { setTemplateKey(key); reset(); }} style={{
                display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 11, cursor: "pointer",
                border: `1px solid ${active ? ACCENT : BORDER}`,
                background: active ? "rgba(109,79,255,0.10)" : SURFACE,
                boxShadow: active ? "0 0 0 1px rgba(109,79,255,0.20)" : "none",
              }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "white" }}>{t.icon}</div>
                <div className="tpl-meta" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: active ? TEXT : TEXTMID, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.label}</div>
                  <div style={{ fontSize: 9, color: TEXTDIM, marginTop: 1 }}>{t.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom size */}
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

        {/* Main workspace */}
        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>

          {/* LEFT PANEL */}
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
              {["code", "settings"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                  background: activeTab === t ? SURF2 : "transparent",
                  color: activeTab === t ? TEXT : TEXTDIM,
                  borderBottom: activeTab === t ? `2px solid ${ACCENT}` : "2px solid transparent",
                  transition: "all 0.15s",
                }}>{t === "code" ? "Code" : "Settings"}</button>
              ))}
            </div>

            {/* Code */}
            {activeTab === "code" && (
              <div style={{ padding: 12 }}>
                <textarea value={html} onChange={e => { setHtml(e.target.value); reset(); }} spellCheck={false}
                  placeholder="Paste your HTML animation here…"
                  style={{ width: "100%", height: 260, background: "#05050d", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", fontSize: 11, fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace", color: "#b0b8e0", lineHeight: 1.75, resize: "vertical" }} />
              </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
              <div style={{ padding: "18px 16px 14px" }}>
                <Slider label="FPS" val={fps} set={setFps} min={1} max={30} step={0.5} unit=" fps" hint="Lower = fewer frames, smaller file" />
                <Slider label="Duration" val={duration} set={setDuration} min={0.5} max={12} step={0.5} unit="s" />
                {exportFormat === "gif"   && <Slider label="GIF Quality"    val={quality} set={setQuality} min={1}  max={20} step={1}  hint="1 = best · 20 = fastest encode" />}
                {exportFormat === "video" && <Slider label="MP4 Quality (CRF)" val={crf} set={setCrf} min={0} max={51} step={1} hint="0 = lossless · 18 = visually perfect · 28 = smaller file" />}
                <Divider />

                {/* Anim speed */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: TEXTMID, textTransform: "uppercase", letterSpacing: "0.04em" }}>Anim speed</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: ACCENTHI }}>{animSpeed.toFixed(2)}×</span>
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: 10, color: TEXTDIM }}>
                    {animSpeed < 1 ? `${(1/animSpeed).toFixed(1)}× slower` : animSpeed > 1 ? `${animSpeed.toFixed(1)}× faster` : "Normal speed"}
                  </p>
                  <input type="range" min={0.1} max={3} step={0.05} value={animSpeed} onChange={e => { setAnimSpeed(Number(e.target.value)); reset(); }} />
                  <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
                    {[["¼×",.25],["½×",.5],["¾×",.75],["1×",1],["1.5×",1.5],["2×",2]].map(([lbl, val]) => {
                      const on = Math.abs(animSpeed - val) < 0.01;
                      return (
                        <button key={lbl} onClick={() => { setAnimSpeed(val); reset(); }} style={{
                          flex: 1, padding: "6px 0", borderRadius: 7, cursor: "pointer",
                          fontFamily: "inherit", fontSize: 11, fontWeight: 700,
                          border: `1px solid ${on ? ACCENT : BORDER}`,
                          background: on ? "rgba(109,79,255,0.18)" : SURF2,
                          color: on ? ACCENTHI : TEXTDIM, transition: "all 0.12s",
                        }}>{lbl}</button>
                      );
                    })}
                  </div>
                </div>

                <Divider />

                {exportFormat === "gif" && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: TEXTMID, textTransform: "uppercase", letterSpacing: "0.04em" }}>Loop GIF</div>
                      <div style={{ fontSize: 10, color: TEXTDIM, marginTop: 2 }}>{loop ? "Plays forever" : "Plays once"}</div>
                    </div>
                    <div onClick={() => setLoop(v => !v)} style={{ width: 44, height: 24, borderRadius: 12, cursor: "pointer", position: "relative", flexShrink: 0, background: loop ? ACCENT : SURF3, border: `1px solid ${loop ? ACCENTHI : BORDER}`, transition: "all 0.2s" }}>
                      <div style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", background: loop ? "white" : TEXTMID, transition: "transform 0.2s", transform: loop ? "translateX(23px)" : "translateX(3px)" }} />
                    </div>
                  </div>
                )}

                <div style={{ background: SURF2, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "10px 13px", fontSize: 11, color: TEXTMID, lineHeight: 1.9 }}>
                  <span style={{ color: ACCENTHI, fontWeight: 700 }}>{exportFormat === "gif" ? "GIF · " : "MP4 (H.264) · "}</span>
                  {Math.ceil(fps * duration)} frames · {fps} fps · {duration}s · {animSpeed.toFixed(2)}×
                  {exportFormat === "gif" ? ` · q${quality} · ${loop ? "loop" : "once"}` : ` · CRF ${crf}`}
                </div>
              </div>
            )}

            {/* Format toggle + convert */}
            <div style={{ padding: "12px 12px 14px", borderTop: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, background: SURF2, borderRadius: 10, border: `1px solid ${BORDER}`, padding: 4 }}>
                {[
                  { key: "gif",   label: "🎞 GIF",  color: ACCENTHI, bg: "rgba(109,79,255,0.18)", border: ACCENT },
                  { key: "video", label: "🎬 MP4",   color: BLUEHI,   bg: "rgba(59,130,246,0.18)", border: BLUE },
                ].map(({ key, label, color, bg, border }) => {
                  const on = exportFormat === key;
                  return (
                    <button key={key} className="fmt-btn" onClick={() => { setExportFormat(key); reset(); }} style={{
                      flex: 1, padding: "8px 0", borderRadius: 7, cursor: "pointer",
                      fontFamily: "inherit", fontSize: 12, fontWeight: 700,
                      border: `1px solid ${on ? border : "transparent"}`,
                      background: on ? bg : "transparent",
                      color: on ? color : TEXTDIM,
                    }}>{label}</button>
                  );
                })}
              </div>

              {exportFormat === "video" && (
                <p style={{ margin: "0 0 10px", fontSize: 10, color: TEXTDIM, textAlign: "center", lineHeight: 1.6 }}>
                  Real <span style={{ color: BLUEHI }}>H.264 MP4</span> via FFmpeg.wasm · plays everywhere · CRF {crf}
                </p>
              )}

              {phase === "idle" && (
                <button className="btn-p" onClick={convert} disabled={!canConvert} style={{
                  width: "100%", padding: "13px 0", borderRadius: 11, border: "none",
                  background: !canConvert ? SURF3 : exportFormat === "gif"
                    ? `linear-gradient(135deg,${ACCENT},#9d5fff)`
                    : `linear-gradient(135deg,${BLUE},${BLUEHI})`,
                  color: !canConvert ? TEXTDIM : "white",
                  fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                  cursor: !canConvert ? "not-allowed" : "pointer",
                }}>
                  {!canConvert
                    ? (libStatus !== "ready" ? "Loading libraries…" : "Loading FFmpeg…")
                    : `Convert to ${exportFormat === "gif" ? "GIF" : "MP4"}  ·  ${W}×${H}px`}
                </button>
              )}

              {isConverting && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: TEXTMID }}>{phaseLabel || "Working…"}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: exportFormat === "video" ? BLUEHI : ACCENTHI, fontVariantNumeric: "tabular-nums" }}>{progress}%</span>
                  </div>
                  <div style={{ height: 3, background: SURF3, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, borderRadius: 3, transition: "width 0.3s ease", background: exportFormat === "video" ? `linear-gradient(90deg,${BLUE},${BLUEHI})` : `linear-gradient(90deg,${ACCENT},${ACCENTHI})` }} />
                  </div>
                  <p style={{ fontSize: 10, color: TEXTDIM, textAlign: "center", margin: 0 }}>
                    {phase === "capturing" ? `Frame ${capturedCount} / ${totalFrames} · ${fps}fps · ${duration}s` : phaseLabel}
                  </p>
                </div>
              )}

              {phase === "done" && (
                <button className="btn-p" onClick={reset} style={{ width: "100%", padding: "13px 0", borderRadius: 11, border: `1px solid ${BORDER2}`, background: SURF2, color: TEXTMID, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  ↺ Convert another
                </button>
              )}

              {phase === "error" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 11, color: RED, fontWeight: 600, textAlign: "center", margin: 0 }}>⚠ {errorMsg || "Conversion failed"}</p>
                  <button className="btn-p" onClick={reset} style={{ width: "100%", padding: "13px 0", borderRadius: 11, border: "none", background: `linear-gradient(135deg,#7f1d1d,${RED})`, color: "white", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Try again</button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Preview */}
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
                <p style={{ margin: "8px 0 0", fontSize: 10, color: TEXTDIM, textAlign: "center" }}>Scaled to fit · exports at full {W}×{H}px</p>
              </div>
            </div>

            {/* GIF output */}
            {gifUrl && exportFormat === "gif" && (
              <div style={{ background: "rgba(29,185,84,0.05)", borderRadius: 16, border: "1px solid rgba(29,185,84,0.2)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid rgba(29,185,84,0.12)" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: GREEN, textTransform: "uppercase" }}>Output GIF</span>
                  <span style={{ padding: "2px 9px", borderRadius: 5, background: "rgba(29,185,84,0.12)", border: "1px solid rgba(29,185,84,0.25)", fontSize: 10, fontWeight: 600, color: GREEN }}>✓ {W}×{H} · {totalFrames}f · {fps}fps</span>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ width: "100%", paddingTop: `${aspectPct}%`, position: "relative", borderRadius: 10, overflow: "hidden", background: "#000", border: "1px solid rgba(29,185,84,0.15)" }}>
                    <img src={gifUrl} alt="GIF" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <button className="btn-p" onClick={download} style={{ width: "100%", marginTop: 12, padding: "13px 0", borderRadius: 11, border: "none", background: `linear-gradient(135deg,#15803d,${GREEN})`, color: "white", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    ↓ Download {tpl.label} GIF
                  </button>
                </div>
              </div>
            )}

            {/* MP4 output */}
            {videoUrl && exportFormat === "video" && (
              <div style={{ background: "rgba(59,130,246,0.05)", borderRadius: 16, border: "1px solid rgba(59,130,246,0.22)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid rgba(59,130,246,0.12)" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: BLUEHI, textTransform: "uppercase" }}>Output MP4</span>
                  <span style={{ padding: "2px 9px", borderRadius: 5, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", fontSize: 10, fontWeight: 600, color: BLUEHI }}>✓ {W}×{H} · {totalFrames}f · {fps}fps · H.264</span>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ width: "100%", paddingTop: `${aspectPct}%`, position: "relative", borderRadius: 10, overflow: "hidden", background: "#000", border: "1px solid rgba(59,130,246,0.15)" }}>
                    <video src={videoUrl} autoPlay loop muted playsInline style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <button className="btn-p" onClick={download} style={{ width: "100%", marginTop: 12, padding: "13px 0", borderRadius: 11, border: "none", background: `linear-gradient(135deg,#1d4ed8,${BLUEHI})`, color: "white", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    ↓ Download {tpl.label} MP4
                  </button>
                  <p style={{ margin: "8px 0 0", fontSize: 10, color: TEXTDIM, textAlign: "center" }}>H.264 MP4 · plays natively everywhere · TikTok, Instagram, YouTube ready</p>
                </div>
              </div>
            )}

            {!outputExists && phase === "idle" && (
              <div style={{ borderRadius: 16, border: `1px dashed ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 68 }}>
                <p style={{ margin: 0, fontSize: 11, color: TEXTDIM }}>{exportFormat === "gif" ? "GIF" : "MP4"} output appears here after conversion</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}