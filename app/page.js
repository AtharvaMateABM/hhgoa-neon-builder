"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";

const POSITION_PRESETS = {
  "TOP LEFT": [-35, -35],
  "TOP": [0, -38],
  "TOP RIGHT": [35, -35],
  "CENTER": [0, 0],
  "BOTTOM LEFT": [-35, 35],
  "BOTTOM": [0, 38],
  "BOTTOM RIGHT": [35, 35]
};

const FILTERS = {
  RAW: "none",
  CYBER: "saturate(1.35) hue-rotate(155deg) contrast(1.08)",
  PINK: "saturate(1.55) hue-rotate(-25deg) contrast(1.08)",
  NOIR: "grayscale(1) contrast(1.35)"
};

const FRAME_TYPES = ["NEON EDGE", "CYBER CUT", "ROUND ID", "SCANLINE"];

export default function Home() {
  const [photo, setPhoto] = useState("");
  const [photoSize, setPhotoSize] = useState({ width: 0, height: 0 });
  const [mode, setMode] = useState("BUILDER");
  const [borderColor, setBorderColor] = useState("#f4d35e");
  const [pfpStyle, setPfpStyle] = useState("GOA RING");
  const [pfpPositionX, setPfpPositionX] = useState(0);
  const [pfpPositionY, setPfpPositionY] = useState(0);
  const [pfpZoom, setPfpZoom] = useState(1);
  const [name, setName] = useState("ATHARVA MATE");
  const [role, setRole] = useState("MODEL FORGER");
  const [stack, setStack] = useState("AI / ML");
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState("RAW");
  const [accent, setAccent] = useState("#ff1f8f");
  const [frameType, setFrameType] = useState("NEON EDGE");
  const [frameDecor, setFrameDecor] = useState("GOA SIGNAL");
  const [customStack, setCustomStack] = useState("");
  const [qrSize, setQrSize] = useState(118);
  const [notice, setNotice] = useState("");
  const fileRef = useRef(null);

  const info = useMemo(() => ({
    name: name || "BUILDER",
    role: role || "BUILDER",
    stack: stack === "OTHER" ? (customStack || "CUSTOM") : (stack || "TECH"),
    event: "Hacker House Goa 2026",
    location: "Goa, India",
    dates: "28–31 October 2026",
    identity: "HHGOA-2026-BUILDER",
    website: "HHGOA2026.COM"
  }), [name, role, stack]);

  const qrText = JSON.stringify(info);

  const choosePhoto = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setNotice("Please choose one image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      setPhoto(src);
      const img = new Image();
      img.onload = () => setPhotoSize({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = src;
      setNotice("1 photo loaded. The editor now shows the complete original photo.");
    };
    reader.readAsDataURL(file);
  };

  const onFile = (e) => choosePhoto(e.target.files?.[0]);

  const removePhoto = () => {
    setPhoto("");
    setNotice("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const applyPosition = (axis, value) => {
    const n = Number(value);
    if (axis === "x") setPositionX(n);
    if (axis === "y") setPositionY(n);
  };

  const reset = () => {
    setPositionX(0);
    setPositionY(0);
    setZoom(1);
    setFilter("RAW");
  };

  const generateQR = async (size = 300) => {
    return QRCode.toDataURL(qrText, {
      width: size,
      margin: 1,
      color: { dark: "#07100e", light: "#f7f7ef" },
      errorCorrectionLevel: "M"
    });
  };

  const getExportBlob = async () => {
    if (!photo) {
      setNotice("Upload one photo before generating the card.");
      return null;
    }

    const canvas = document.createElement("canvas");
    const S = 1600;
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#050807";
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = "#09120f";
    ctx.fillRect(70, 70, 1460, 1460);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(92, 92, 1416, 1416);
    ctx.strokeStyle = "#d7ff00";
    ctx.lineWidth = 3;
    ctx.strokeRect(110, 110, 1380, 1380);

    ctx.fillStyle = "#d7ff00";
    ctx.font = "700 30px Arial";
    ctx.textAlign = "left";
    ctx.fillText("GOA, INDIA  //  28–31 OCT 2026", 145, 165);

    ctx.fillStyle = "#f6f3e8";
    ctx.font = "900 66px Arial";
    ctx.textAlign = "center";
    ctx.fillText("HACKER HOUSE GOA", 800, 250);
    ctx.font = "700 22px Arial";
    ctx.fillText("GOA 2026 / BUILDER IDENTITY", 800, 292);

    const logo = new Image();
    logo.src = "/goa-hacker-house-symbol.png";
    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = reject;
    });

    // Official Hacker House Goa symbol.
    ctx.drawImage(logo, 1210, 110, 280, 285);

    const img = new Image();
    img.src = photo;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const photoW = 920;
    const photoH = 600;
    const frameRadius = frameType === "ROUND ID" ? 460 : frameType === "CYBER CUT" ? 52 : frameType === "SCANLINE" ? 18 : 28;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(800 - photoW / 2, 740 - photoH / 2, photoW, photoH, frameRadius);
    ctx.clip();

    const scale = Math.max(photoW / img.width, photoH / img.height) * zoom;

    const w = img.width * scale;
    const h = img.height * scale;
    ctx.filter = FILTERS[filter];
    ctx.drawImage(img, 800 - w / 2 + positionX * 2, 740 - h / 2 + positionY * 2, w, h);
    ctx.restore();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = frameType === "ROUND ID" ? 18 : 14;
    if (frameType === "SCANLINE") ctx.setLineDash([22, 12]);
    ctx.beginPath();
    ctx.roundRect(800 - photoW / 2, 740 - photoH / 2, photoW, photoH, frameRadius);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = accent;
    ctx.fillRect(220, 1080, 1160, 120);

    ctx.fillStyle = "#050807";
    ctx.font = "900 52px Arial";
    ctx.textAlign = "center";
    ctx.fillText((name || "BUILDER").toUpperCase(), 800, 1160);

    ctx.fillStyle = "#f6f3e8";
    ctx.font = "700 26px Arial";
    ctx.fillText(`${role.toUpperCase()}  //  ${info.stack.toUpperCase()}`, 800, 1260);

    const qr = new Image();
    qr.src = await generateQR(220);
    await new Promise((resolve, reject) => {
      qr.onload = resolve;
      qr.onerror = reject;
    });

    ctx.fillStyle = "#f7f7ef";
    ctx.fillRect(1240, 1260, 220, 220);
    ctx.drawImage(qr, 1260, 1280, 180, 180);

    ctx.textAlign = "left";
    ctx.fillStyle = "#d7ff00";
    ctx.font = "700 18px Arial";
    ctx.fillText("SCAN FOR FULL BUILDER DATA", 150, 1410);
    ctx.fillStyle = "#7fa59a";
    ctx.font = "16px monospace";
    ctx.fillText("HHGOA-2026-BUILDER // VERIFIED", 150, 1450);

    return await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  };

  const getPfpBlob = async () => {
    if (!photo) {
      setNotice("Upload one photo before generating the PFP frame.");
      return null;
    }

    // Match the live PFP card's 500 x 540 CSS geometry at 1080 px wide.
    const W = 1080;
    const H = 1166;
    const K = W / 500;
    const ctxCanvas = document.createElement("canvas");
    ctxCanvas.width = W;
    ctxCanvas.height = H;
    const ctx = ctxCanvas.getContext("2d");

    ctx.fillStyle = "#020504";
    ctx.fillRect(0, 0, W, H);

    const logo = new Image();
    logo.src = "/goa-hacker-house-symbol.png";
    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = reject;
    });

    const img = new Image();
    img.src = photo;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Same outer card proportions as the browser preview.
    const border = 10 * K;
    const radius =
      pfpStyle === "SQUARE" ? 8 * K :
      pfpStyle === "ROUND" ? W / 2 :
      42 * K;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(border, border, W - border * 2, H - border * 2, radius);
    ctx.clip();

    // Card background.
    ctx.fillStyle = "#07100d";
    ctx.fillRect(0, 0, W, H);

    // Same symbol placement as .pfp-brand-symbol:
    // top 15px, centered, 110 x 92.
    const symbolW = 110 * K;
    const symbolH = 92 * K;
    const symbolX = (W - symbolW) / 2;
    const symbolY = 15 * K;
    ctx.drawImage(logo, symbolX, symbolY, symbolW, symbolH);

    // Same photo box as .pfp-photo-wrap:
    // left/right 8%, top 18%, bottom 21%.
    const photoX = W * 0.08;
    const photoY = H * 0.18;
    const photoW = W * 0.84;
    const photoH = H * (1 - 0.18 - 0.21);

    const photoRadius =
      pfpStyle === "SQUARE" ? 8 * K :
      pfpStyle === "ROUND" ? photoW / 2 :
      34 * K;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
    ctx.clip();

    // PFP always uses frame crop. This is intentionally independent of
    // the old Builder "Actual Ratio" option.
    const scale = Math.max(photoW / img.width, photoH / img.height) * pfpZoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = (W - drawW) / 2 + pfpPositionX * K;
    const drawY = photoY + (photoH - drawH) / 2 + pfpPositionY * K;

    ctx.filter = FILTERS[filter];
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Photo border exactly follows the live PFP photo box.
    ctx.filter = "none";
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 5 * K;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
    ctx.stroke();

    // Outer PFP card border.
    ctx.lineWidth = 10 * K;
    ctx.strokeStyle = borderColor;
    ctx.beginPath();
    ctx.roundRect(border, border, W - border * 2, H - border * 2, radius);
    ctx.stroke();

    // Match live text hierarchy.
    ctx.textAlign = "center";
    ctx.fillStyle = borderColor;
    ctx.font = `900 ${14 * K}px Arial`;
    ctx.fillText("HACKER HOUSE GOA", W / 2, H * 0.89);

    ctx.fillStyle = "#f7f3e8";
    ctx.font = `900 ${15 * K}px Arial`;
    ctx.fillText((name || "YOUR NAME").toUpperCase(), W / 2, H * 0.935);

    ctx.fillStyle = "#7f9c92";
    ctx.font = `700 ${6 * K}px Arial`;
    ctx.fillText(
      `${(role || "BUILDER").toUpperCase()} · ${info.stack.toUpperCase()}`,
      W / 2,
      H * 0.968
    );

    return await new Promise(resolve => ctxCanvas.toBlob(resolve, "image/png"));
  };

  const downloadPfp = async () => {
    const blob = await getPfpBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `${(name || "builder").replace(/\s+/g, "-").toLowerCase()}-hhgoa-pfp.png`;
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("PFP frame downloaded successfully.");
  };

  const downloadCard = async () => {
    const blob = await getExportBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `${(name || "builder").replace(/\s+/g, "-").toLowerCase()}-hhgoa2026.png`;
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("PNG downloaded successfully.");
  };

  const shareCard = async () => {
    const blob = await getExportBlob();
    if (!blob) return;

    const file = new File(
      [blob],
      `${(name || "builder").replace(/\s+/g, "-").toLowerCase()}-hhgoa2026.png`,
      { type: "image/png" }
    );

    const shareText = `I'm heading to Hacker House Goa 2026 as ${name || "a builder"} — ${role || "Builder"} / ${info.stack}. #FrameInGoa`;

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          title: "HH Goa 2026 Builder Identity",
          text: shareText,
          files: [file]
        });
        setNotice("Share sheet opened.");
      } else {
        await navigator.clipboard?.writeText(shareText);
        setNotice("Sharing is not supported here. Your caption with #FrameInGoa was copied.");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        await navigator.clipboard?.writeText(shareText).catch(() => {});
        setNotice("Share was unavailable, so the #FrameInGoa caption was copied.");
      }
    }
  };

  const exportCard = async () => {
    await downloadCard();
  };

  return (
    <main style={{ "--accent": accent, "--border-color": borderColor }}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">HH<span>26</span></div>
          <div>
            <div className="brand-name">NEON IDENTITY LAB</div>
            <div className="brand-sub">HACKER HOUSE GOA / BUILDER GENERATOR</div>
          </div>
        </div>
        <div className="status"><i /> SYSTEM ONLINE <button onClick={exportCard}>GENERATE 1 CARD ↗</button></div>
      </header>

      <div className="goa-strip" aria-label="Goa atmosphere">
        <span>🌴 PALM STATE</span>
        <i>•</i>
        <span>🌊 ARABIAN SEA</span>
        <i>•</i>
        <span>☀️ SUNSET MODE</span>
        <i>•</i>
        <span>🛵 GOA AFTER DARK</span>
        <i>•</i>
        <span>🍹 BEACH → BUILD → SHIP</span>
      </div>

      <section className="goa-hero-scene" aria-hidden="true">
        <div className="goa-stars"></div>
        <div className="goa-moon"></div>
        <div className="goa-neon-sign">GOA<br/><small>AFTER DARK</small></div>
        <div className="goa-wire-wire"></div>
        <div className="goa-palm-silhouette palm-one"></div>
        <div className="goa-palm-silhouette palm-two"></div>
        <div className="goa-scooter"></div>
        <div className="goa-road"></div>
        <div className="goa-sea-line"></div>
        <div className="goa-sunset-glow"></div>
        <div className="goa-location-pin">15°29'N · 73°49'E</div>
      </section>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">01 / BUILDER IDENTITY · GOA 2026</div>
          <h1>MAKE YOUR<br/><span>MARK IN GOA.</span></h1>
          <p>One photo. One identity. One generated card. Your complete builder information is packed into the QR code.</p>
          <div className="mode-line">
            <span>BLACKCORE</span><b>×</b><span>NEON SIGNAL</span><b>×</b><span>GOA 2026</span>
          </div>
          <div className="goa-micro">28—31 OCT · GOA, INDIA · BUILD UNDER THE PALMS · SHIP BY THE SEA</div>
        </div>
        <div className="hero-orbit">
          <img className="goa-symbol-hero" src="/goa-hacker-house-symbol.png" alt="Hacker House Goa symbol" />
          <div className="orbit-text">BUILD • SHIP • CONNECT • BUILD • SHIP • CONNECT •</div>
          <div className="hero-ring"></div>
          <div className="hero-dot"></div>
          <span>01</span>
        </div>
      </section>

      <section className="generator-mode">
        <div className="mode-title"><span>GENERATOR / MODE</span><b>{mode === "BUILDER" ? "BUILDER ID" : "PFP FRAME"}</b></div>
        <div className="mode-tabs">
          <button className={mode === "BUILDER" ? "active" : ""} onClick={() => setMode("BUILDER")}>BUILDER ID</button>
          <button className={mode === "PFP" ? "active" : ""} onClick={() => setMode("PFP")}>PFP FRAME</button>
        </div>
      </section>

      {mode === "BUILDER" && (
      <section className="builder-grid">
        <aside className="controls">
          <div className="section-head"><span>INPUT / 01</span><b>ONE PHOTO ONLY</b></div>

          <div className={`photo-editor ${photo ? "has-photo" : ""}`} onClick={() => !photo && fileRef.current?.click()}>
            {photo ? (
              <>
                <div className="editor-toolbar">
                  <span>ORIGINAL PHOTO</span>
                  <b>{photoSize.width && photoSize.height ? `${photoSize.width} × ${photoSize.height}px` : "READING SIZE..."}</b>
                </div>
                <div className="original-photo-stage">
                  <img src={photo} alt="Original uploaded builder photo" />
                  <div className="editor-guide">
                    <span>FULL IMAGE</span>
                    <i>DRAG / SCALE WITH CONTROLS</i>
                  </div>
              </div>
              </>
            ) : (
              <div className="upload-placeholder"><strong>DROP ONE PHOTO</strong><small>JPG · PNG · WEBP · HEIC</small><em>+ CHOOSE PHOTO</em></div>
            )}
          </div>
          <input ref={fileRef} hidden type="file" accept="image/*" onChange={onFile} />
          <div className="upload-actions">
            <button onClick={() => fileRef.current?.click()}>{photo ? "REPLACE PHOTO" : "CHOOSE PHOTO"}</button>
            {photo && <button className="ghost" onClick={removePhoto}>REMOVE</button>}
          </div>
          {notice && <div className="notice">{notice}</div>}

          <div className="control-block">
            <label>NAME <span>REQUIRED</span></label>
            <input value={name} onChange={e => setName(e.target.value.toUpperCase())} placeholder="YOUR NAME" />
          </div>
          <div className="control-block">
            <label>STACK / ROLE</label>
            <select value={stack} onChange={e => setStack(e.target.value)}>
              <option>AI / ML</option>
              <option>WEB3 / RUST</option>
              <option>FULL STACK</option>
              <option>HARDWARE / IOT</option>
              <option>DESIGN / CREATIVE</option>
              <option>OTHER</option>
            </select>
            {stack === "OTHER" && (
              <input className="custom-stack" value={customStack}
                onChange={e => setCustomStack(e.target.value)}
                placeholder="WRITE YOUR STACK / ROLE" maxLength={34}/>
            )}
          </div>
          <div className="control-block">
            <label>BUILDER TITLE</label>
            <input value={role} onChange={e => setRole(e.target.value.toUpperCase())} placeholder="BUILDER TITLE" />
          </div>

          <div className="control-block">
            <label>FRAME TYPE <span>{frameType}</span></label>
            <div className="frame-grid">
              {FRAME_TYPES.map(f => (
                <button key={f} className={frameType === f ? "active" : ""} onClick={() => setFrameType(f)}>
                  {f === "PFP GOA" ? "PFP + QR" : f}
                </button>
              ))}
            </div>
            {frameType === "PFP GOA" && (
              <small className="helper-text pfp-helper">Profile-picture frame with a built-in scannable QR identity badge.</small>
            )}
          </div>

          <div className="control-block">
            <label>EDIT PHOTO POSITION <span>X {positionX}px / Y {positionY}px</span></label>
            <div className="slider-control">
              <div className="slider-row"><small>MOVE HORIZONTAL</small><b>{positionX}px</b></div>
              <input aria-label="Horizontal photo position" type="range" min="-180" max="180" step="1" value={positionX} onChange={e => applyPosition("x", e.target.value)} />
              <div className="slider-row"><small>MOVE VERTICAL</small><b>{positionY}px</b></div>
              <input aria-label="Vertical photo position" type="range" min="-180" max="180" step="1" value={positionY} onChange={e => applyPosition("y", e.target.value)} />
              <div className="slider-row"><small>SCALE PHOTO</small><b>{Math.round(zoom * 100)}%</b></div>
              <input aria-label="Photo zoom" type="range" min=".65" max="1.8" step=".01" value={zoom} onChange={e => setZoom(+e.target.value)} />
            </div>
          </div>

          <div className="control-block">
            <label>IMAGE DNA</label>
            <div className="filter-grid">
              {Object.keys(FILTERS).map(f => <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>{f}</button>)}
            </div>
          </div>

          <div className="control-block">
            <label>NEON SIGNAL</label>
            <div className="colors">
              {["#ff1f8f", "#d7ff00", "#00f5d4", "#8a5cff", "#ff6b35"].map(c =>
                <button key={c} style={{ background: c }} className={accent === c ? "picked" : ""} onClick={() => setAccent(c)} />
              )}
            </div>
          </div>

          <button className="reset" onClick={reset}>↺ RESET POSITION & FILTERS</button>
        </aside>

        <section className="preview">
          <div className="preview-head">
            <div><span>LIVE OUTPUT / 02</span><b>BUILDER IDENTITY CARD</b></div>
            <div className="single-badge">1 PHOTO → 1 CARD</div>
          </div>

          <div className="card-stage">
            <div className="builder-card">
              <div className="card-corners"></div>
              <img className="goa-symbol-card" src="/goa-hacker-house-symbol.png" alt="" aria-hidden="true" />
              <div className="card-top">
                <span>GOA, INDIA</span>
                <b>HACKER HOUSE GOA</b>
                <span>28—31 OCT 2026</span>
              </div>

              <div className={`photo-frame frame-${frameType.toLowerCase().replaceAll(" ", "-")}`}>
                <div className="frame-label frame-label-top">HACKER HOUSE GOA</div>
                <div className="frame-label frame-label-bottom">"GOA 2026 · BUILD / SHIP / CONNECT"</div>
                <div className="frame-sun-corner frame-sun-a"></div>
                <div className="frame-sun-corner frame-sun-b"></div>
                <div className="photo-move">
                  {photo ? (
                    <img
                      className="photo-crop"
                      style={{
                        transform: `translate(${positionX}px, ${positionY}px) scale(${zoom})`,
                        filter: FILTERS[filter]
                      }}
                      src={photo}
                      alt="Builder preview"
                    />
                  ) : <div className="card-empty">UPLOAD<br/>PHOTO</div>}
                </div>
                <div className="frame-glow"></div>
              </div>

              <div className="name-zone">
                <div className="micro">BUILDER / VERIFIED / HHGOA 2026</div>
                <h2>{name || "YOUR NAME"}</h2>
                <div className="role">{role || "BUILDER"} <i>//</i> {stack}</div>
              </div>

              <div className="qr-zone">
                <div className="qr-wrap">
                  <QRCodePreview text={qrText} />
                  <small>SCAN / FULL DATA</small>
                </div>
                <div className="card-footer-data">
                  <b>LESS NOISE.<br/>MORE SIGNAL.</b>
                  <span>HHGOA-2026<br/>BUILDER ID</span>
                </div>
                <div className="yellow-signal">● GOA SIGNAL ACTIVE</div>
              </div>
            </div>
          </div>

          <div className="preview-actions">
            <button className="generate" onClick={downloadCard}>⚡ DOWNLOAD PNG</button>
            <button className="share" onClick={shareCard}>↗ SHARE</button>
            <button className="reset-small" onClick={reset}>RESET</button>
          </div>
          <div className="share-caption">SOCIAL CAPTION: <b>#FrameInGoa</b> is added automatically when sharing.</div>
        </section>
      </section>

      )}

      {mode === "PFP" && (
        <section className="pfp-generator">
          <div className="pfp-controls">
            <div className="section-head"><span>PFP / 01</span><b>SEPARATE PROFILE FRAME</b></div>

            <div className="pfp-upload">
              {photo ? <img src={photo} alt="Selected profile photo" /> : <div className="pfp-empty" onClick={() => fileRef.current?.click()}>UPLOAD ONE PHOTO</div>}
              <button onClick={() => fileRef.current?.click()}>{photo ? "CHANGE PHOTO" : "CHOOSE PHOTO"}</button>
            </div>

            <div className="control-block">
              <label>PFP FRAME STYLE <span>{pfpStyle}</span></label>
              <div className="pfp-style-grid">
                {["GOA RING","SQUARE","ROUND"].map(style => (
                  <button key={style} className={pfpStyle === style ? "active" : ""} onClick={() => setPfpStyle(style)}>{style}</button>
                ))}
              </div>
            </div>

            <div className="control-block">
              <label>PHOTO BORDER COLOR <span>{borderColor.toUpperCase()}</span></label>
              <div className="border-color-row">
                {["#f4d35e","#ff1f8f","#00f5d4","#d7ff00","#8a5cff","#ff6b35","#ffffff"].map(c => (
                  <button key={c} aria-label={"Choose border color " + c} className={borderColor === c ? "picked" : ""} style={{background:c}} onClick={() => setBorderColor(c)} />
                ))}
                <input aria-label="Custom photo border color" type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} />
              </div>
            </div>

            <div className="control-block">
              <label>PHOTO POSITION <span>X {pfpPositionX}px / Y {pfpPositionY}px</span></label>
              <div className="slider-control">
                <div className="slider-row"><small>HORIZONTAL</small><b>{pfpPositionX}px</b></div>
                <input type="range" min="-180" max="180" value={pfpPositionX} onChange={e => setPfpPositionX(Number(e.target.value))} />
                <div className="slider-row"><small>VERTICAL</small><b>{pfpPositionY}px</b></div>
                <input type="range" min="-180" max="180" value={pfpPositionY} onChange={e => setPfpPositionY(Number(e.target.value))} />
                <div className="slider-row"><small>ZOOM</small><b>{Math.round(pfpZoom * 100)}%</b></div>
                <input type="range" min=".7" max="1.8" step=".01" value={pfpZoom} onChange={e => setPfpZoom(Number(e.target.value))} />
              </div>
            </div>

            <div className="pfp-note">PFP CROP MODE · NO QR · QR REMAINS IN BUILDER ID</div>
            <button className="generate" onClick={downloadPfp}>⚡ DOWNLOAD PFP FRAME</button>
          </div>

          <div className="pfp-preview-wrap">
            <div className="preview-head"><div><span>LIVE OUTPUT / PFP</span><b>GOA PROFILE FRAME</b></div><div className="single-badge">NO QR</div></div>
            <div className="pfp-preview">
              <div className={`pfp-card pfp-${pfpStyle.toLowerCase().replaceAll(" ", "-")}`} style={{"--pfp-border": borderColor}}>
                <img className="pfp-brand-symbol" src="/goa-hacker-house-symbol.png" alt="Hacker House Goa" />
                <div className="pfp-photo-wrap">
                  {photo ? <img src={photo} alt="PFP preview" style={{transform:`translate(${pfpPositionX}px, ${pfpPositionY}px) scale(${pfpZoom})`,filter:FILTERS[filter]}} /> : <div className="card-empty">UPLOAD<br/>PHOTO</div>}
                </div>
                <div className="pfp-title">HACKER HOUSE GOA</div>
                <div className="pfp-name">{name || "YOUR NAME"}</div>
                <div className="pfp-role">{role || "BUILDER"} · {info.stack}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="goa-vibe-zone">
        <div className="goa-sky-gradient"></div>
        <div className="goa-sun"></div>
        <div className="goa-sunset-rays"></div>
        <div className="goa-palm palm-left">♣</div>
        <div className="goa-palm palm-right">♣</div>
        <div className="goa-neon-cassette">
          <span>LIVE SIGNAL</span>
          <b>GOA 2026</b>
          <i></i>
          <small>BUILD / BEACH / NIGHT</small>
        </div>
        <div className="goa-wave wave-one"></div>
        <div className="goa-wave wave-two"></div>
        <div className="goa-vibe-copy">
          <span>GOA MODE // 28—31 OCT // 15°29'N · 73°49'E</span>
          <h2>BUILD BY DAY.<br/><b>GLOW BY NIGHT.</b></h2>
          <p>Salt in the air. Neon on the streets. A sunset behind the palms. Your builder identity should feel like it came from Goa, not from a generic tech template.</p>
          <div className="goa-tags"><b>#FrameInGoa</b><b>#HHGoa2026</b><b>#BuildInGoa</b><b>#GoaAfterDark</b></div>
        </div>
        <div className="goa-route">
          <span>BEACH</span><i></i><span>BUILD</span><i></i><span>SHIP</span><i></i><span>REPEAT</span>
        </div>
      </section>

      <section className="qr-explanation">
        <div>
          <div className="eyebrow">03 / QR INTELLIGENCE</div>
          <h2>EVERY DETAIL.<br/><span>ONE SCAN.</span></h2>
        </div>
        <div className="qr-info">
          <div className="qr-real"><QRCodePreview text={qrText} /></div>
          <div>
            <h3>YOUR QR CONTAINS</h3>
            <p><b>NAME</b> · {info.name}</p>
            <p><b>ROLE</b> · {info.role}</p>
            <p><b>STACK</b> · {info.stack}</p>
            <p><b>EVENT</b> · {info.event}</p>
            <p><b>LOCATION</b> · {info.location}</p>
            <p><b>DATES</b> · {info.dates}</p>
            <p><b>ID</b> · {info.identity}</p>
          </div>
        </div>
      </section>

      <section className="social-section">
        <div>
          <div className="eyebrow">04 / SHIP IT</div>
          <h2>DOWNLOAD.<br/><span>SHARE. GO.</span></h2>
          <p>Your generated card is ready as a PNG. The social share text automatically includes <b>#FrameInGoa</b>.</p>
        </div>
        <div className="social-actions">
          <button onClick={downloadCard}>↓ DOWNLOAD CARD</button>
          <button onClick={shareCard}>↗ SHARE TO SOCIAL</button>
        </div>
      </section>

      <footer>
        <span>🌴 HACKER HOUSE GOA 2026</span>
        <span>BLACKCORE / NEON SIGNAL / ARABIAN SEA</span>
        <span>#FrameInGoa · ONE PHOTO. ONE IDENTITY.</span>
      </footer>
    </main>
  );
}

function QRCodePreview({ text }) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError("");
    QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#07100e", light: "#f7f7ef" }
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setError("QR ERROR");
      });
    return () => { cancelled = true; };
  }, [text]);

  if (error) return <div className="qr-error">{error}</div>;
  return src ? <img className="qr-image" src={src} alt="Builder information QR code" /> : <div className="qr-loading">GENERATING…</div>;
}
