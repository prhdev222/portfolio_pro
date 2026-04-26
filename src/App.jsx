import { useState, useEffect, useCallback } from "react";

// ─── API ────────────────────────────────────────────────────────────────────
const API = (path, opts = {}, password = null) => {
  const headers = { "Content-Type": "application/json" };
  if (password) headers["Authorization"] = `Bearer ${password}`;
  return fetch(`/api/${path}`, { headers, ...opts }).then(r => r.json());
};

// ─── Palette (theme via CSS variables) ───────────────────────────────────────
const C = {
  navy: "var(--c-navy)",
  blue: "var(--c-blue)",
  teal: "var(--c-teal)",
  ltTeal: "var(--c-ltTeal)",
  accent: "var(--c-accent)",
  white: "var(--c-white)",
  bg: "var(--c-bg)",
  text: "var(--c-text)",
  heading: "var(--c-heading)",
  muted: "var(--c-muted)",
  border: "var(--c-border)",
  surface: "var(--c-surface)",
  surface2: "var(--c-surface2)",
  success: "var(--c-success)",
  danger: "var(--c-danger)",
};

const THEME_PRESETS = {
  confident: {
    label_th: "โทนมั่นใจ",
    label_en: "Confident",
    vars: {
      "--c-navy": "#0B2447",
      "--c-blue": "#19376D",
      "--c-teal": "#0C7B93",
      "--c-ltTeal": "#27AAB0",
      "--c-accent": "#A5F3FC",
      "--c-white": "#FFFFFF",
      "--c-bg": "#F0F9FF",
      "--c-text": "#1E293B",
      "--c-muted": "#64748B",
      "--c-border": "#CBD5E1",
      "--c-success": "#16A34A",
      "--c-danger": "#DC2626",
      "--font-base": "'Sarabun', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      "--font-display": "'Cormorant Garamond', Georgia, serif",
      "--radius-card": "16px",
      "--radius-pill": "999px",
      "--shadow-card": "0 10px 30px rgba(2,6,23,.06)",
    },
  },
  sweet: {
    label_th: "โทนอ่อนหวาน",
    label_en: "Sweet",
    vars: {
      "--c-navy": "#2A1E3D",
      "--c-blue": "#5B2C83",
      "--c-teal": "#E24E8A",
      "--c-ltTeal": "#F58BB3",
      "--c-accent": "#FFE1EC",
      "--c-white": "#FFFFFF",
      "--c-bg": "#FFF7FB",
      "--c-text": "#2B2430",
      "--c-muted": "#7B6C7A",
      "--c-border": "#E8D7E2",
      "--c-success": "#16A34A",
      "--c-danger": "#DC2626",
      "--font-base": "'Sarabun', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      "--font-display": "'Cormorant Garamond', Georgia, serif",
      "--radius-card": "22px",
      "--radius-pill": "999px",
      "--shadow-card": "0 14px 44px rgba(43,36,48,.10)",
    },
  },
  strong: {
    label_th: "โทนเข้มแข็ง",
    label_en: "Strong",
    vars: {
      "--c-navy": "#071A1C",
      "--c-blue": "#0D3B3E",
      "--c-teal": "#0BBEAA",
      "--c-ltTeal": "#2DE3CF",
      "--c-accent": "#B7FFF6",
      "--c-white": "#FFFFFF",
      "--c-bg": "#F2FFFD",
      "--c-text": "#062427",
      "--c-muted": "#3B6A6E",
      "--c-border": "#BFE6E1",
      "--c-success": "#16A34A",
      "--c-danger": "#DC2626",
      "--font-base": "'Sarabun', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      "--font-display": "'Sarabun', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      "--radius-card": "12px",
      "--radius-pill": "10px",
      "--shadow-card": "0 8px 22px rgba(6,36,39,.10)",
    },
  },
};

const applyTheme = (themePreset, overridesText = "") => {
  const preset = THEME_PRESETS[themePreset] || THEME_PRESETS.confident;
  let overrides = {};
  try {
    if (overridesText && typeof overridesText === "string") overrides = JSON.parse(overridesText);
  } catch {}
  const vars = { ...preset.vars, ...(overrides || {}) };
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
};

const applyUiVars = (ui = {}) => {
  const root = document.documentElement;
  root.style.setProperty("--font-scale", String(ui.fontScale || 1));
  if (ui.dark) {
    root.style.setProperty("--c-bg", "#000000");
    root.style.setProperty("--c-text", "#FFFFFF");
    root.style.setProperty("--c-heading", "#FFFFFF");
    root.style.setProperty("--c-muted", "rgba(255,255,255,.70)");
    root.style.setProperty("--c-blue", "#93C5FD");
    root.style.setProperty("--c-teal", "#2DD4BF");
    root.style.setProperty("--c-border", "rgba(255,255,255,.14)");
    root.style.setProperty("--c-surface", "#0B1220");
    root.style.setProperty("--c-surface2", "#0A1528");
    root.style.setProperty("--shadow-card", "0 10px 28px rgba(0,0,0,.35)");
  } else {
    root.style.setProperty("--c-heading", root.style.getPropertyValue("--c-navy") || "#0B2447");
    root.style.setProperty("--c-surface", "#FFFFFF");
    root.style.setProperty("--c-surface2", "#F8FAFC");
  }
};

// ─── Contact icons (inline SVG) ───────────────────────────────────────────────
const CONTACT_ICON_SIZE = 22;

const IconWrap = ({ children, title }) => (
  <span
    title={title}
    style={{
      width: CONTACT_ICON_SIZE,
      height: CONTACT_ICON_SIZE,
      display:"inline-flex",
      alignItems:"center",
      justifyContent:"center",
      flexShrink:0,
    }}
  >
    {children}
  </span>
);

const GmailIcon = () => (
  <IconWrap title="Gmail">
    <svg width={CONTACT_ICON_SIZE} height={CONTACT_ICON_SIZE} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M2 6.5C2 5.12 3.12 4 4.5 4h15C20.88 4 22 5.12 22 6.5v.64l-10 6.25-10-6.25V6.5z"/>
      <path fill="#34A853" d="M22 8.8V17.5c0 1.38-1.12 2.5-2.5 2.5H18V12.7l4-3.9z"/>
      <path fill="#4285F4" d="M2 8.8l4 3.9V20H4.5C3.12 20 2 18.88 2 17.5V8.8z"/>
      <path fill="#FBBC05" d="M6 12.7l6 3.75 6-3.75V20H6V12.7z"/>
    </svg>
  </IconWrap>
);

const LinkedInIcon = () => (
  <IconWrap title="LinkedIn">
    <svg width={CONTACT_ICON_SIZE} height={CONTACT_ICON_SIZE} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#0A66C2" d="M20.45 20.45H17v-5.56c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.66H9.56V9h3.32v1.56h.05c.46-.88 1.58-1.8 3.25-1.8 3.48 0 4.12 2.29 4.12 5.26v6.43zM5.34 7.43a1.94 1.94 0 1 1 0-3.88 1.94 1.94 0 0 1 0 3.88zM6.99 20.45H3.69V9h3.3v11.45z"/>
    </svg>
  </IconWrap>
);

const LineIcon = () => (
  <IconWrap title="LINE OA">
    <svg width={CONTACT_ICON_SIZE} height={CONTACT_ICON_SIZE} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#06C755" d="M19.6 10.4c0-3.63-3.41-6.58-7.6-6.58S4.4 6.77 4.4 10.4c0 3.25 2.71 5.97 6.37 6.48.25.05.6.15.69.34.08.17.06.45.03.63l-.11.66c-.03.19-.17.73.64.4.8-.32 4.32-2.55 5.89-4.37 1.07-1.18 1.79-2.5 1.79-4.17z"/>
      <path fill="#fff" d="M8.1 9.2h1.05v2.75h1.54v.95H8.1V9.2zm3.2 0h1.05v3.7h-1.05V9.2zm2.05 0h1.05l1.5 2.06V9.2h1.05v3.7h-1.05l-1.5-2.06v2.06H13.35V9.2zm4.18 0h2.88v.93h-1.83v.52h1.83v.93h-1.83v.53h1.83v.93h-2.88V9.2z"/>
    </svg>
  </IconWrap>
);

const GitHubIcon = () => (
  <IconWrap title="GitHub">
    <svg width={CONTACT_ICON_SIZE} height={CONTACT_ICON_SIZE} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#111827" d="M12 .5C5.73.5.75 5.64.75 12.1c0 5.2 3.19 9.6 7.62 11.16.56.11.77-.25.77-.56 0-.28-.01-1.02-.02-2-3.1.7-3.76-1.55-3.76-1.55-.5-1.35-1.23-1.71-1.23-1.71-1-.7.08-.69.08-.69 1.11.08 1.7 1.18 1.7 1.18.98 1.73 2.58 1.23 3.2.94.1-.73.38-1.23.69-1.51-2.47-.29-5.07-1.27-5.07-5.66 0-1.25.42-2.27 1.12-3.07-.11-.29-.49-1.45.11-3.01 0 0 .92-.3 3.02 1.17.88-.25 1.82-.37 2.75-.38.93.01 1.87.13 2.75.38 2.1-1.47 3.02-1.17 3.02-1.17.6 1.56.22 2.72.11 3.01.7.8 1.12 1.82 1.12 3.07 0 4.4-2.6 5.37-5.08 5.65.39.35.73 1.03.73 2.08 0 1.5-.01 2.72-.01 3.09 0 .31.2.68.78.56 4.42-1.56 7.61-5.96 7.61-11.16C23.25 5.64 18.27.5 12 .5z"/>
    </svg>
  </IconWrap>
);

// ─── tiny helpers ────────────────────────────────────────────────────────────
const btn = (label, onClick, style = {}) => (
  <button onClick={onClick} style={{
    border: "none",
    cursor: "pointer",
    borderRadius: "var(--radius-btn, 12px)",
    padding: "7px 16px",
    fontSize: 13,
    fontFamily: "inherit",
    transition: "opacity .15s",
    ...style,
  }}
    onMouseOver={e => e.currentTarget.style.opacity = ".8"}
    onMouseOut={e => e.currentTarget.style.opacity = "1"}
  >{label}</button>
);

const inp = (value, onChange, placeholder = "", multiline = false, rows = 3) => {
  const style = {
    width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box",
    outline: "none", resize: multiline ? "vertical" : "none",
    background: C.surface, color: C.text,
  };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows} style={style} />
    : <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={style} />;
};

// ─── EditOverlay ─────────────────────────────────────────────────────────────
function EditOverlay({ title, children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
      zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "var(--c-surface)", borderRadius: "var(--radius-card)", padding: "28px 32px",
        maxWidth: 600, width: "100%", maxHeight: "85vh", overflowY: "auto",
        boxShadow: "var(--shadow-modal, 0 24px 64px rgba(0,0,0,.25))",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: C.navy, fontSize: 17 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.muted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const normalizeText = (v) =>
  typeof v === "string" ? v.replaceAll("\\n", "\n") : v;

const splitNameLastWord = (name) => {
  if (typeof name !== "string") return { first: "", last: "" };
  const trimmed = name.trim();
  const idx = trimmed.lastIndexOf(" ");
  if (idx <= 0) return { first: trimmed, last: "" };
  return { first: trimmed.slice(0, idx), last: trimmed.slice(idx + 1) };
};

const getYouTubeId = (rawUrl) => {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return null;
  try {
    const url = new URL(rawUrl.trim());
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.replace("/", "") || null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      if (url.pathname.startsWith("/embed/")) return url.pathname.split("/embed/")[1]?.split("/")[0] || null;
      if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/shorts/")[1]?.split("/")[0] || null;
    }
    return null;
  } catch {
    return null;
  }
};

function ImageViewer({ src, title, onClose }) {
  if (!src) return null;
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.75)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
      }}
    >
      <div style={{ width: "min(980px, 96vw)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ color: "rgba(255,255,255,.85)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title || "รูปภาพ"}
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}
            aria-label="close"
          >
            ✕
          </button>
        </div>
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.16)", background: "#000" }}>
          <img
            src={src}
            alt={title || ""}
            style={{ width: "100%", maxHeight: "82vh", objectFit: "contain", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── LOCK SCREEN ─────────────────────────────────────────────────────────────
function LockScreen({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [publicProfile, setPublicProfile] = useState(null);
  const [viewImg, setViewImg] = useState(null); // { src, title }
  const [autoTried, setAutoTried] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/public")
      .then(r => r.json())
      .then(d => { if (alive) setPublicProfile(d?.profile || {}); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const t = publicProfile?.site_title;
    if (t) document.title = t;
  }, [publicProfile]);

  const lockName = splitNameLastWord(publicProfile?.cover_name || publicProfile?.name || "");

  // Auto-login when opened via link/QR like: https://site/?code=XXXX
  useEffect(() => {
    if (autoTried || loading) return;
    const url = new URL(window.location.href);
    const code = (url.searchParams.get("code") || "").trim();
    if (!code) return;
    setAutoTried(true);
    setPw(code);
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: code }),
        }).then(r => r.json());
        if (r?.error) {
          setShake(true); setPw(""); setMsg("รหัสผ่านไม่ถูกต้อง");
          setTimeout(() => { setShake(false); setMsg(""); }, 800);
        } else {
          try {
            url.searchParams.delete("code");
            window.history.replaceState({}, "", url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "") + url.hash);
          } catch {}
          onUnlock(code, r.role, r.hospital, r.theme_preset, r.theme_overrides);
        }
      } catch {
        setMsg("เชื่อมต่อ server ไม่ได้");
      }
      setLoading(false);
    })();
  }, [autoTried, loading, onUnlock]);

  const attempt = async () => {
    if (!pw.trim() || loading) return;
    setLoading(true);
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw.trim() }),
      }).then(r => r.json());
      if (r.error) {
        setShake(true); setPw(""); setMsg("รหัสผ่านไม่ถูกต้อง");
        setTimeout(() => { setShake(false); setMsg(""); }, 800);
      } else {
        onUnlock(pw.trim(), r.role, r.hospital, r.theme_preset, r.theme_overrides);
      }
    } catch {
      setMsg("เชื่อมต่อ server ไม่ได้");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, var(--c-navy, #0B2447) 0%, var(--c-teal, #0C7B93) 70%, var(--c-navy, #0B2447) 100%)`,
      fontFamily: "var(--font-base, 'Sarabun', Georgia, serif)", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        :root {
          --c-navy: #0B2447;
          --c-blue: #19376D;
          --c-teal: #0C7B93;
          --c-ltTeal: #27AAB0;
          --c-accent: #A5F3FC;
          --c-white: #FFFFFF;
          --c-bg: #F0F9FF;
          --c-text: #1E293B;
          --c-heading: #0B2447;
          --c-muted: #64748B;
          --c-border: #CBD5E1;
          --c-success: #16A34A;
          --c-danger: #DC2626;
          --font-base: 'Sarabun', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --radius-card: 16px;
          --radius-pill: 999px;
          --radius-btn: 12px;
          --shadow-card: 0 10px 30px rgba(2,6,23,.06);
          --shadow-modal: 0 24px 64px rgba(0,0,0,.25);
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-10px)} 75%{transform:translateX(10px)} }
        @keyframes ripple { 0%{transform:scale(0.8);opacity:.4} 100%{transform:scale(2.5);opacity:0} }
        @keyframes pulse { 0%,100%{opacity:.06} 50%{opacity:.13} }
        .lock-ring { animation: pulse 3s ease-in-out infinite; }
        .display-font { font-family: var(--font-display); }
        @media (max-width: 640px) {
          .lock-wrap { max-width: 360px !important; }
          .lock-title { font-size: 26px !important; }
          .lock-sub { font-size: 12px !important; margin-bottom: 28px !important; }
          .lock-input { padding: 12px 14px !important; font-size: 14px !important; }
          .name-last { display: block; }
        }
      `}</style>

      {/* Background rings */}
      {[260,420,580,740].map((s,i) => (
        <div key={i} className="lock-ring" style={{
          position:"absolute", width:s, height:s, borderRadius:"50%",
          border:"1px solid rgba(255,255,255,.3)", animationDelay:`${i*0.7}s`,
          pointerEvents:"none",
        }}/>
      ))}

      <div className="lock-wrap" style={{ animation: "fadeUp .8s ease both", textAlign:"center", zIndex:1, padding:"0 24px", width:"100%", maxWidth:420 }}>
        <div style={{
          width:118, height:118, borderRadius:22, margin:"0 auto 22px",
          background:"rgba(255,255,255,.10)", border:"1px solid rgba(255,255,255,.25)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:36,
          overflow:"hidden",
          boxShadow:"0 16px 40px rgba(0,0,0,.25)",
        }}>
          {publicProfile?.avatar_url ? (
            (publicProfile?.avatar_link
              ? (
                <a href={publicProfile.avatar_link} target="_blank" rel="noreferrer" style={{ display:"block", width:"100%", height:"100%" }}>
                  <img
                    src={publicProfile.avatar_url}
                    alt=""
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", cursor:"pointer" }}
                  />
                </a>
              )
              : (
                <img
                  src={publicProfile.avatar_url}
                  alt=""
                  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", cursor:"zoom-in" }}
                  onClick={() => setViewImg({ src: publicProfile.avatar_url, title: publicProfile?.cover_name || publicProfile?.name || "Profile" })}
                />
              )
            )
          ) : "🩺"}
        </div>

        <div style={{ color:"rgba(255,255,255,.5)", fontSize:11, letterSpacing:4, marginBottom:8, textTransform:"uppercase" }}>Private Portfolio</div>
        <h1 className="lock-title display-font" style={{ color:"#fff", fontSize:30, fontWeight:400, margin:"0 0 4px", lineHeight:1.15 }}>
          <span>{lockName.first || "—"}</span>
          {lockName.last ? <span className="name-last"> {lockName.last}</span> : null}
        </h1>
        <div className="lock-sub" style={{ color:"var(--c-accent, #A5F3FC)", fontSize:13, marginBottom:36, letterSpacing:.5 }}>
          {publicProfile?.cover_subtitle || publicProfile?.title || ""}
        </div>

        {/* Input */}
        <div style={{
          animation: shake ? "shake .5s ease" : "none",
          background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.25)",
          borderRadius:10, display:"flex", overflow:"hidden", marginBottom:8,
        }}>
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && attempt()}
            placeholder="Enter password"
            autoFocus
            className="lock-input"
            style={{
              flex:1, padding:"14px 16px", background:"transparent", border:"none",
              outline:"none", color:"#fff", fontSize:15, fontFamily:"monospace", letterSpacing:2,
            }}
          />
          <button onClick={() => setShow(v => !v)} style={{ background:"transparent", border:"none", padding:"0 10px", color:"rgba(255,255,255,.5)", cursor:"pointer" }}>
            {show ? "🙈" : "👁"}
          </button>
          <button onClick={attempt} style={{
            background: "var(--c-teal, #0C7B93)", border:"none", padding:"0 20px", color:"#fff",
            cursor:"pointer", fontSize:18, fontFamily:"monospace",
          }}>
            {loading ? "…" : "→"}
          </button>
        </div>
        {msg && <div style={{ color:"#FCA5A5", fontSize:12, marginTop:4 }}>{msg}</div>}
        <div style={{ color:"rgba(255,255,255,.3)", fontSize:11, marginTop:12 }}>
          Each hospital has a unique access code
        </div>
      </div>

      <ImageViewer
        src={viewImg?.src}
        title={viewImg?.title}
        onClose={() => setViewImg(null)}
      />
    </div>
  );
}

// ─── PORTFOLIO (viewer + admin) ───────────────────────────────────────────────
function Portfolio({ password, role, hospital, onLogout }) {
  const isAdmin = role === "admin";
  const [tab, setTab] = useState("about");
  const [data, setData] = useState(null);   // { profile, projects, articles, passwords }
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("portfolio_lang") || "th"; }
    catch { return "th"; }
  });

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2500); };
  const isEn = lang === "en";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ui, setUi] = useState(() => {
    try {
      const raw = localStorage.getItem("portfolio_ui");
      const v = raw ? JSON.parse(raw) : null;
      return {
        dark: !!v?.dark,
        fontScale: typeof v?.fontScale === "number" ? v.fontScale : 1,
      };
    } catch {
      const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      return { dark: !!prefersDark, fontScale: 1 };
    }
  });

  useEffect(() => { setMobileMenuOpen(false); }, [tab]);
  useEffect(() => {
    try { localStorage.setItem("portfolio_ui", JSON.stringify(ui)); } catch {}
    applyUiVars(ui);
  }, [ui]);

  const setFontPercent = (pct) => {
    const p = Math.max(90, Math.min(160, Number(pct) || 100));
    setUi(u => ({ ...u, fontScale: p / 100 }));
  };
  const fontPercent = Math.round((ui.fontScale || 1) * 100);

  const load = useCallback(async () => {
    setLoading(true);
    const endpoint = isAdmin ? "admin/content" : "content";
    const r = await API(endpoint, {}, password);
    setData(r);
    setLoading(false);
  }, [password, isAdmin]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    // Apply theme based on current access code (per-hospital)
    applyTheme(data?.theme_preset || "confident", data?.theme_overrides || "");
    // Theme presets also set colors, so re-apply user dark/font preferences after theme changes.
    applyUiVars(ui);
  }, [data?.theme_preset, data?.theme_overrides, ui]);
  useEffect(() => {
    const t = data?.profile?.site_title;
    if (t) document.title = t;
  }, [data]);

  const saveProfile = async (key, value) => {
    await API(`profile/${key}`, { method: "PUT", body: JSON.stringify({ value }) }, password);
    setData(d => ({ ...d, profile: { ...d.profile, [key]: value } }));
    showToast(isEn ? "✓ Saved" : "✓ บันทึกแล้ว");
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, fontFamily:"var(--font-base)" }}>
      <div style={{ color:C.teal, fontSize:14 }}>{isEn ? "Loading…" : "กำลังโหลด…"}</div>
    </div>
  );

  const { profile = {}, projects = [], articles = [], passwords = [] } = data || {};

  const TABS = [
    { id:"about", label:"About" },
    { id:"projects", label:`Projects (${projects.filter(p=>p.visible).length})` },
    { id:"articles", label:`${isEn ? "Articles" : "บทความ"} (${articles.filter(a=>a.published).length})` },
    ...(isAdmin ? [{ id:"admin", label:"⚙ Admin" }] : []),
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"var(--font-base)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        :root {
          --c-navy: #0B2447;
          --c-blue: #19376D;
          --c-teal: #0C7B93;
          --c-ltTeal: #27AAB0;
          --c-accent: #A5F3FC;
          --c-white: #FFFFFF;
          --c-bg: #F0F9FF;
          --c-text: #1E293B;
          --c-heading: #0B2447;
          --c-muted: #64748B;
          --c-border: #CBD5E1;
          --c-surface: #FFFFFF;
          --c-surface2: #F8FAFC;
          --c-success: #16A34A;
          --c-danger: #DC2626;
          --font-scale: 1;
          --font-base: 'Sarabun', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --radius-card: 16px;
          --radius-pill: 999px;
          --radius-btn: 12px;
          --shadow-card: 0 10px 30px rgba(2,6,23,.06);
          --shadow-modal: 0 24px 64px rgba(0,0,0,.25);
        }
        body { font-family: var(--font-base); font-size: 14px; background: var(--c-bg); color: var(--c-text); }
        button, input, textarea, select { font-size: 13px; }
        .card { transition: transform .2s, box-shadow .2s; box-shadow: var(--shadow-card)!important; border-radius: var(--radius-card)!important; }
        .card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.10)!important; }
        .edit-btn { opacity:0; transition:opacity .2s; }
        .edit-wrap:hover .edit-btn { opacity:1; }
        input:focus, textarea:focus { border-color:${C.teal}!important; box-shadow:0 0 0 3px rgba(12,123,147,.12); }
        .display-font { font-family: var(--font-display); }
        @media (max-width: 820px) {
          .main-wrap { padding: 28px 16px !important; }
          .nav-wrap { overflow-x: auto; scrollbar-width: none; }
          .nav-wrap::-webkit-scrollbar { display: none; }
        }
        @media (max-width: 640px) {
          .topbar { padding: 0 14px !important; height: 56px !important; }
          .brand-title { font-size: 12px !important; }
          .brand-tagline { font-size: 9px !important; letter-spacing: .8px !important; }
          .tabs-btn { padding: 6px 10px !important; font-size: 11px !important; }
          .nav-wrap { display: none !important; }
          .desktop-actions { display: none !important; }
          .hamburger-btn { display: inline-flex !important; }
          .mobile-menu-overlay { padding: 10px !important; }
          .mobile-menu-panel { width: min(100%, 390px) !important; border-radius: 14px !important; }
          .hero { flex-direction: column !important; align-items: flex-start !important; padding: 26px 20px !important; gap: 16px !important; }
          .hero-avatar { width: 104px !important; height: 104px !important; border-radius: 20px !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
          .card-img { height: 150px !important; }
          .name-last { display: block; }
        }
        .hamburger-btn { display: none; align-items: center; justify-content: center; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:72, right:20, background:C.success, color:"#fff",
          padding:"10px 20px", borderRadius:8, zIndex:999, fontSize:13,
          boxShadow:"0 4px 16px rgba(0,0,0,.15)", animation:"fadeUp .3s ease",
        }}>{toast}</div>
      )}

      {/* Header */}
      <header style={{
        background:C.navy, height:60, display:"flex", alignItems:"center",
        justifyContent:"space-between", padding:"0 32px",
        position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 16px rgba(0,0,0,.3)",
      }} className="topbar">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>🩺</span>
          <div>
            <div className="brand-title" style={{ color:"#fff", fontSize:13, fontWeight:600 }}>
              {(isEn ? (profile.header_name_en || "").trim() : (profile.header_name || "").trim())
                || (isEn ? (profile.name_en || "").trim() : (profile.name || "").trim())
                || "—"}
            </div>
            <div className="brand-tagline" style={{ color:C.accent, fontSize:10, letterSpacing:1 }}>
              {(isEn ? (profile.header_tagline_en || "").trim() : (profile.header_tagline || "").trim()) || ""}
            </div>
          </div>
        </div>

        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(v => !v)}
          aria-label="menu"
          style={{
            background:"rgba(255,255,255,.08)",
            border:"1px solid rgba(255,255,255,.18)",
            color:"rgba(255,255,255,.9)",
            borderRadius:12,
            width:40,
            height:40,
            cursor:"pointer",
            fontSize:18,
            flexShrink:0,
          }}
        >
          ☰
        </button>

        <nav className="nav-wrap" style={{ display:"flex", gap:4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab===t.id ? C.teal : "transparent",
              border:"none", color: tab===t.id ? "#fff" : "rgba(255,255,255,.6)",
              padding:"6px 14px", borderRadius:6, cursor:"pointer",
              fontSize:12, fontFamily:"'Sarabun',Georgia,serif", transition:"all .2s",
            }} className="tabs-btn">{t.label}</button>
          ))}
        </nav>
        <div className="desktop-actions" style={{ display:"flex", alignItems:"center", gap:10 }}>
          {btn(ui.dark ? (isEn ? "Light" : "สว่าง") : (isEn ? "Dark" : "มืด"), () => setUi(u => ({ ...u, dark: !u.dark })), {
            background:"rgba(255,255,255,.08)",
            border:`1px solid rgba(255,255,255,.18)`,
            color:"rgba(255,255,255,.85)",
            fontSize:11,
            padding:"6px 10px",
            borderRadius:999,
          })}
          <div style={{
            display:"flex",
            alignItems:"center",
            gap:8,
            padding:"4px 10px",
            borderRadius:999,
            background:"rgba(255,255,255,.08)",
            border:"1px solid rgba(255,255,255,.18)",
            color:"rgba(255,255,255,.85)",
          }}>
            <span style={{ fontSize:11, opacity:.9, whiteSpace:"nowrap" }}>{isEn ? "Font" : "ตัวอักษร"} {fontPercent}%</span>
            <input
              type="range"
              min="90"
              max="160"
              step="5"
              value={fontPercent}
              onChange={(e) => setFontPercent(e.target.value)}
              style={{ width:110 }}
              aria-label="font size"
            />
          </div>
          <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.18)", padding:3, borderRadius:999 }}>
            <button onClick={() => { setLang("th"); try { localStorage.setItem("portfolio_lang","th"); } catch {} }} style={{
              border:"none", cursor:"pointer", borderRadius:999,
              padding:"4px 10px", fontSize:11, fontFamily:"inherit",
              background: lang==="th" ? C.teal : "transparent",
              color: lang==="th" ? "#fff" : "rgba(255,255,255,.7)",
            }}>TH</button>
            <button onClick={() => { setLang("en"); try { localStorage.setItem("portfolio_lang","en"); } catch {} }} style={{
              border:"none", cursor:"pointer", borderRadius:999,
              padding:"4px 10px", fontSize:11, fontFamily:"inherit",
              background: lang==="en" ? C.teal : "transparent",
              color: lang==="en" ? "#fff" : "rgba(255,255,255,.7)",
            }}>EN</button>
          </div>
          {btn(isEn ? "Logout" : "ออกจากระบบ", onLogout, {
            background:"rgba(255,255,255,.08)",
            border:`1px solid rgba(255,255,255,.18)`,
            color:"rgba(255,255,255,.85)",
            fontSize:11,
            padding:"6px 12px",
            borderRadius:999,
          })}
          <div style={{ color:"rgba(255,255,255,.4)", fontSize:11, whiteSpace:"nowrap" }}>
            {hospital} {isAdmin && <span style={{ color:C.accent }}>· Admin</span>}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={(e) => e.target === e.currentTarget && setMobileMenuOpen(false)}
          style={{
            position:"fixed",
            inset:0,
            background:"rgba(0,0,0,.35)",
            zIndex: 150,
            padding:14,
          }}
        >
          <div className="mobile-menu-panel" style={{
            maxWidth: 420,
            margin:"0 auto",
            background:"var(--c-surface)",
            borderRadius:16,
            overflow:"hidden",
            border:`1px solid ${C.border}`,
            boxShadow:"0 24px 64px rgba(0,0,0,.22)",
          }}>
            <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ color:C.heading, fontWeight:700, fontSize:13 }}>{isEn ? "Menu" : "เมนู"}</div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background:"transparent", border:"none", cursor:"pointer", color:C.muted, fontSize:18 }}>✕</button>
            </div>
            <div style={{ padding:"10px 10px", display:"flex", gap:8, flexWrap:"wrap", borderBottom:`1px solid ${C.border}` }}>
              {btn(ui.dark ? (isEn ? "Light mode" : "โหมดสว่าง") : (isEn ? "Dark mode" : "โหมดมืด"), () => setUi(u => ({ ...u, dark: !u.dark })), { background:C.blue, color:"#fff", fontSize:12, padding:"7px 12px", flex:"1 1 120px" })}
              <div style={{ display:"flex", gap:6, background:C.surface2, border:`1px solid ${C.border}`, padding:3, borderRadius:999, flexShrink:0 }}>
                <button onClick={() => { setLang("th"); try { localStorage.setItem("portfolio_lang","th"); } catch {} }} style={{
                  border:"none", cursor:"pointer", borderRadius:999,
                  padding:"5px 11px", fontSize:12, fontFamily:"inherit",
                  background: lang==="th" ? C.teal : "transparent",
                  color: lang==="th" ? "#fff" : C.muted,
                }}>TH</button>
                <button onClick={() => { setLang("en"); try { localStorage.setItem("portfolio_lang","en"); } catch {} }} style={{
                  border:"none", cursor:"pointer", borderRadius:999,
                  padding:"5px 11px", fontSize:12, fontFamily:"inherit",
                  background: lang==="en" ? C.teal : "transparent",
                  color: lang==="en" ? "#fff" : C.muted,
                }}>EN</button>
              </div>
              <div style={{
                display:"flex",
                alignItems:"center",
                gap:10,
                padding:"7px 12px",
                borderRadius:12,
                background:"var(--c-surface2)",
                border:`1px solid ${C.border}`,
                color:C.text,
                width:"100%",
              }}>
                <div style={{ fontSize:12, whiteSpace:"nowrap" }}>{isEn ? "Font size" : "ขนาดตัวอักษร"} {fontPercent}%</div>
                <input
                  type="range"
                  min="90"
                  max="160"
                  step="5"
                  value={fontPercent}
                  onChange={(e) => setFontPercent(e.target.value)}
                  style={{ width:"100%", accentColor: C.teal }}
                  aria-label="font size"
                />
              </div>
            </div>
            <div style={{ padding:"10px 10px", display:"flex", flexDirection:"column", gap:6 }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setMobileMenuOpen(false); }}
                  style={{
                    textAlign:"left",
                    width:"100%",
                    border:"1px solid " + (tab===t.id ? C.teal : C.border),
                    background: tab===t.id ? "rgba(12,123,147,.08)" : C.surface,
                    color: tab===t.id ? C.teal : C.text,
                    borderRadius:12,
                    padding:"10px 12px",
                    cursor:"pointer",
                    fontSize:13,
                    fontFamily:"inherit",
                  }}
                >
                  {t.label}
                </button>
              ))}
              {btn(isEn ? "Logout" : "ออกจากระบบ", onLogout, {
                background:"transparent",
                border:`1px solid ${C.border}`,
                color:C.muted,
                fontSize:12,
                padding:"10px 12px",
                borderRadius:12,
                textAlign:"left",
                width:"100%",
              })}
            </div>
          </div>
        </div>
      )}

      <main className="main-wrap" style={{ maxWidth:980, margin:"0 auto", padding:"36px 24px", animation:"fadeUp .4s ease", zoom:"var(--font-scale, 1)" }} key={tab}>

        {/* ── ABOUT ─────────────────────────────────────────────────── */}
        {tab === "about" && (
          <AboutTab profile={profile} isAdmin={isAdmin} onSave={saveProfile} password={password} lang={lang} />
        )}

        {/* ── PROJECTS ──────────────────────────────────────────────── */}
        {tab === "projects" && (
          <ProjectsTab projects={projects} isAdmin={isAdmin} password={password} lang={lang}
            onRefresh={load} showToast={showToast} />
        )}

        {/* ── ARTICLES ──────────────────────────────────────────────── */}
        {tab === "articles" && (
          <ArticlesTab articles={articles} isAdmin={isAdmin} password={password} lang={lang}
            onRefresh={load} showToast={showToast} />
        )}

        {/* ── ADMIN PANEL ───────────────────────────────────────────── */}
        {tab === "admin" && isAdmin && (
          <AdminTab passwords={passwords} password={password}
            onRefresh={load} showToast={showToast} />
        )}
      </main>

      <footer style={{ textAlign:"center", padding:"20px", color:C.muted, fontSize:11, marginTop:24 }}>
        © {new Date().getFullYear()} {(isEn ? (profile.name_en || "").trim() : (profile.name || "").trim()) || "—"} · Portfolio (Private)
      </footer>
    </div>
  );
}

// ─── ABOUT TAB ───────────────────────────────────────────────────────────────
function AboutTab({ profile: p, isAdmin, onSave, password, lang }) {
  const [editing, setEditing] = useState(null); // { key, value }
  const [awardsEditing, setAwardsEditing] = useState(false);
  const [awardsDraft, setAwardsDraft] = useState([]);
  const [watching, setWatching] = useState(null); // { title, embedUrl }
  const [viewImg, setViewImg] = useState(null); // { src, title }
  const [bookingOpen, setBookingOpen] = useState(false);
  const [translating, setTranslating] = useState(null); // key

  const parseAwards = (raw) => {
    try {
      const v = JSON.parse(raw || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };

  const isEn = lang === "en";
  const asHttpUrl = (raw) => {
    const v = (raw || "").toString().trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    // allow users to paste "www." or domain without protocol
    return `https://${v.replace(/^\/+/, "")}`;
  };
  const pick = (key) => {
    // In EN mode, only show EN fields (no TH fallback)
    if (lang === "en") return normalizeText(p[`${key}_en`]) || "";
    return normalizeText(p[key]) || "";
  };
  const awards = parseAwards(isEn ? p.awards_en : p.awards);
  const aboutName = splitNameLastWord(pick("name"));
  const fields = [
    { key:"header_name", label:"ชื่อบนแถบเมนู (TH)" },
    { key:"header_name_en", label:"Menu name (EN)" },
    { key:"header_tagline", label:"คำโปรยบนแถบเมนู (TH)" },
    { key:"header_tagline_en", label:"Menu tagline (EN)" },
    { key:"name", label:"ชื่อ (ไทย)" },
    { key:"name_en", label:"Name (English)" },
    { key:"avatar_url", label:"รูปโปรไฟล์ (URL รูปภาพ)" },
    { key:"avatar_link", label:"ลิงก์เมื่อคลิกรูปโปรไฟล์" },
    { key:"booking_url", label:"ลิงก์จองเวลาคุย (Google Calendar)" },
    { key:"education", label:"ประวัติการศึกษา" },
    { key:"education_en", label:"Education (English)" },
    { key:"work_history", label:"ประวัติการทำงาน" },
    { key:"work_history_en", label:"Work history (English)" },
    { key:"awards", label:"ผลงานที่เคยได้รับ" },
    { key:"awards_en", label:"Awards / Achievements (English JSON)" },
    { key:"headline", label:"LinkedIn Headline" },
    { key:"headline_en", label:"LinkedIn Headline (English)" },
    { key:"bio", label:"ประวัติย่อ (ย่อหน้า 1)" },
    { key:"bio_en", label:"Bio (Paragraph 1) — English" },
    { key:"bio2", label:"ประวัติย่อ (ย่อหน้า 2)" },
    { key:"bio2_en", label:"Bio (Paragraph 2) — English" },
    { key:"bio3", label:"ประวัติย่อ (ย่อหน้า 3)" },
    { key:"bio3_en", label:"Bio (Paragraph 3) — English" },
    { key:"email", label:"Email" },
    { key:"linkedin", label:"LinkedIn URL" },
    { key:"line_oa", label:"LINE OA (link)" },
    { key:"github", label:"GitHub" },
    { key:"interest", label:"ความสนใจ / ข้อเสนอ" },
    { key:"interest_en", label:"Interest (English)" },
  ];

  const translatableKeys = new Set([
    "site_title",
    "cover_name",
    "cover_subtitle",
    "header_name",
    "header_tagline",
    "name",
    "education",
    "work_history",
    "headline",
    "bio",
    "bio2",
    "bio3",
    "interest",
  ]);

  const translateToEn = async (key) => {
    setTranslating(key);
    try {
      const text = normalizeText(p[key] || "");
      const r = await API("translate", { method:"POST", body: JSON.stringify({ text, target: "en" }) }, password);
      if (r?.translation) {
        await onSave(`${key}_en`, r.translation);
      }
    } finally {
      setTranslating(null);
    }
  };

  const save = async () => {
    await onSave(editing.key, editing.value);
    setEditing(null);
  };

  const openAwardsEditor = () => {
    setAwardsDraft(awards.map(a => ({
      title: a?.title || "",
      url: a?.url || "",
      image: a?.image || "",
      tags: Array.isArray(a?.tags) ? a.tags.join(", ") : (a?.tags || ""),
    })));
    setAwardsEditing(true);
  };

  const saveAwards = async () => {
    const normalized = awardsDraft
      .map(a => ({
        title: (a.title || "").trim(),
        url: (a.url || "").trim(),
        image: (a.image || "").trim(),
        tags: (a.tags || "").split(",").map(t => t.trim()).filter(Boolean),
      }))
      .filter(a => a.title || a.url || a.image || a.tags.length);
    await onSave(isEn ? "awards_en" : "awards", JSON.stringify(normalized));
    setAwardsEditing(false);
  };

  return (
    <div>
      {/* Hero */}
      <div style={{
        background:`linear-gradient(135deg,${C.navy},${C.teal})`,
        borderRadius:"var(--radius-card)", padding:"40px 48px", marginBottom:28,
        display:"flex", gap:36, alignItems:"center",
      }} className="hero">
        <div style={{
          width:148, height:148, borderRadius:"calc(var(--radius-card) + 6px)",
          background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.28)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:44, flexShrink:0,
          overflow:"hidden",
          boxShadow:"0 18px 48px rgba(0,0,0,.25)",
        }} className="hero-avatar">
          {p.avatar_url ? (
            (p.avatar_link
              ? (
                <a href={p.avatar_link} target="_blank" rel="noreferrer" style={{ display:"block", width:"100%", height:"100%" }}>
                  <img
                    src={p.avatar_url}
                    alt=""
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", cursor:"pointer" }}
                  />
                </a>
              )
              : (
                <img
                  src={p.avatar_url}
                  alt=""
                  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", cursor:"zoom-in" }}
                  onClick={() => setViewImg({ src: p.avatar_url, title: p.name || "Profile" })}
                />
              )
            )
          ) : "👩‍⚕️"}
        </div>
        <div>
          <div style={{ color:C.accent, fontSize:11, letterSpacing:3, marginBottom:6, textTransform:"uppercase" }}>Private Portfolio</div>
          <h1 className="display-font" style={{ color:"#fff", fontSize:32, margin:"0 0 4px", fontWeight:400, lineHeight:1.12 }}>
            <span>{aboutName.first || "—"}</span>
            {aboutName.last ? <span className="name-last"> {aboutName.last}</span> : null}
          </h1>
          <div style={{ color:"rgba(255,255,255,.85)", fontSize:14, marginBottom:10, whiteSpace:"pre-line" }}>{pick("education")}</div>
          <div style={{ color:"rgba(255,255,255,.65)", fontSize:13, whiteSpace:"pre-line" }}>{pick("work_history")}</div>
        </div>
      </div>

      {/* YouTube viewer modal */}
      {watching && (
        <EditOverlay title={watching.title} onClose={() => setWatching(null)}>
          <div style={{ position:"relative", width:"100%", paddingTop:"56.25%", borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}`, background:"#000" }}>
            <iframe
              src={watching.embedUrl}
              title={watching.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:0 }}
            />
          </div>
        </EditOverlay>
      )}

      <ImageViewer
        src={viewImg?.src}
        title={viewImg?.title}
        onClose={() => setViewImg(null)}
      />

      {/* Booking modal (Google Calendar Appointment Schedule) */}
      {bookingOpen && (
        <EditOverlay title={isEn ? "Book a time" : "จองเวลาคุย"} onClose={() => setBookingOpen(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ color:C.muted, fontSize:12, lineHeight:1.6 }}>
              {isEn
                ? "If the embedded calendar does not load, click “Open booking page in a new tab” (Google sometimes blocks embedding)."
                : "ถ้าแสดงผลไม่ขึ้น ให้กด “เปิดหน้าจองในแท็บใหม่” (บางครั้ง Google ไม่อนุญาตการฝัง)"}
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              {p.booking_url && (
                <a href={p.booking_url} target="_blank" rel="noreferrer" style={{
                  fontSize:12, padding:"6px 10px", borderRadius:999,
                  border:`1px solid ${C.border}`, color:C.text, textDecoration:"none",
                  background:C.surface,
                }}>
                  {isEn ? "Open booking page in a new tab ↗" : "เปิดหน้าจองในแท็บใหม่ ↗"}
                </a>
              )}
            </div>
            <div style={{ position:"relative", width:"100%", height:"70vh", borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}`, background:C.surface }}>
              {p.booking_url ? (
                <iframe
                  src={p.booking_url}
                  title="Booking"
                  style={{ width:"100%", height:"100%", border:0 }}
                />
              ) : (
                <div style={{ padding:18, color:C.muted, fontSize:13 }}>{isEn ? "Booking link is not set yet." : "ยังไม่ได้ตั้งค่าลิงก์จองเวลา"}</div>
              )}
            </div>
          </div>
        </EditOverlay>
      )}

      {/* Awards editor modal */}
      {awardsEditing && (
        <EditOverlay title="แก้ไข: ผลงานที่เคยได้รับ" onClose={() => setAwardsEditing(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {awardsDraft.length === 0 ? (
              <div style={{ color:C.muted, fontSize:13 }}>ยังไม่มีรายการ — กด “+ เพิ่มผลงาน” เพื่อเริ่ม</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {awardsDraft.map((a, idx) => (
                  <div key={idx} style={{ border:`1px solid ${C.border}`, borderRadius:12, padding:14, background:C.surface2 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={{ fontSize:12, color:C.muted, fontWeight:600 }}>รายการ #{idx + 1}</div>
                      {btn("ลบ", () => setAwardsDraft(list => list.filter((_, i) => i !== idx)), { background:C.danger, color:"#fff", fontSize:11, padding:"4px 10px" })}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      <div>
                        <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>ชื่อผลงาน/รางวัล</div>
                        {inp(a.title, v => setAwardsDraft(list => list.map((x,i)=> i===idx ? ({...x,title:v}) : x)), "เช่น Best Poster Award")}
                      </div>
                      <div>
                        <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>URL (ถ้ามี)</div>
                        {inp(a.url, v => setAwardsDraft(list => list.map((x,i)=> i===idx ? ({...x,url:v}) : x)), "https://...")}
                      </div>
                      <div>
                        <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>รูป (URL รูปภาพ ถ้ามี)</div>
                        {inp(a.image, v => setAwardsDraft(list => list.map((x,i)=> i===idx ? ({...x,image:v}) : x)), "https://...jpg")}
                      </div>
                      <div>
                        <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Tags (คั่นด้วย , )</div>
                        {inp(a.tags, v => setAwardsDraft(list => list.map((x,i)=> i===idx ? ({...x,tags:v}) : x)), "press, publication")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", gap:10, marginTop:4 }}>
              {btn("+ เพิ่มผลงาน", () => setAwardsDraft(list => [...list, { title:"", url:"", image:"", tags:"" }]), { background:C.blue, color:"#fff", fontSize:12 })}
              <div style={{ display:"flex", gap:8 }}>
                {btn("ยกเลิก", () => setAwardsEditing(false), { background:"#F1F5F9", color:C.muted })}
                {btn("บันทึก", saveAwards, { background:C.teal, color:"#fff" })}
              </div>
            </div>
          </div>
        </EditOverlay>
      )}

      {/* Headline */}
      <div style={{
        background:C.surface, borderRadius:"var(--radius-card)", padding:"18px 24px", marginBottom:20,
        border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12,
      }} className="edit-wrap">
        <span style={{ fontSize:18 }}>💼</span>
        <span style={{ color:C.blue, fontSize:14, fontStyle:"italic", flex:1 }}>{pick("headline")}</span>
        {isAdmin && btn("✏", () => setEditing({ key: isEn ? "headline_en" : "headline", value: pick("headline") }), { background:C.teal, color:"#fff", className:"edit-btn" })}
      </div>

      {/* Bio paragraphs */}
      <div style={{ background:C.surface, borderRadius:"var(--radius-card)", padding:"28px 32px", border:`1px solid ${C.border}`, marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h2 style={{ color:C.heading, fontSize:16, margin:0 }}>{isEn ? "Bio" : "ประวัติส่วนตัว"}</h2>
        </div>
        {["bio","bio2","bio3"].map((key) => (
          <div key={key} className="edit-wrap" style={{ display:"flex", gap:8, marginBottom:14, alignItems:"flex-start" }}>
            <p style={{ color:C.text, lineHeight:1.9, fontSize:14, margin:0, flex:1 }}>{pick(key)}</p>
            {isAdmin && btn("✏", () => setEditing({ key: isEn ? `${key}_en` : key, value: pick(key) }), { background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontSize:11, padding:"3px 8px" })}
          </div>
        ))}
      </div>

      {/* Awards */}
      <div style={{ background:C.surface, borderRadius:"var(--radius-card)", padding:"24px 28px", border:`1px solid ${C.border}`, marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }} className="edit-wrap">
          <h2 style={{ color:C.heading, fontSize:16, margin:0 }}>{isEn ? "Awards / Achievements" : "ผลงานที่เคยได้รับ"}</h2>
          {isAdmin && btn("แก้ไข", openAwardsEditor, { background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontSize:11, padding:"6px 10px" })}
        </div>
        {awards.length === 0 ? (
          <div style={{ color:C.muted, fontSize:13 }}>{isEn ? "No items yet" : "ยังไม่มีข้อมูล"}</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {awards.map((a, i) => (
              (() => {
                const yt = getYouTubeId(a?.url);
                const ytEmbed = yt ? `https://www.youtube.com/embed/${yt}` : null;
                const ytThumb = yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null;
                const canWatch = !!ytEmbed;
                const thumbSrc = a?.image || ytThumb;
                return (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"12px 14px", borderRadius:12, background:C.surface2, border:`1px solid ${C.border}` }}>
                {thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt=""
                    style={{ width:52, height:52, objectFit:"cover", borderRadius:10, border:`1px solid ${C.border}`, cursor:"zoom-in" }}
                    onClick={() => setViewImg({ src: thumbSrc, title: a?.title || (isEn ? "Award" : "ผลงาน") })}
                  />
                ) : (
                  <div style={{ width:52, height:52, borderRadius:10, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", background:C.surface, color:C.muted, fontSize:18 }}>🏅</div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4, wordBreak:"break-word" }}>
                    {a?.url ? (
                      <a href={a.url} target="_blank" rel="noreferrer" style={{ color:C.blue, textDecoration:"none" }}>{a.title || a.url}</a>
                    ) : (
                      (a?.title || "—")
                    )}
                  </div>
                  {Array.isArray(a?.tags) && a.tags.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {a.tags.map((t, ti) => (
                        <span key={ti} style={{ fontSize:11, padding:"2px 10px", borderRadius:999, background:"rgba(12,123,147,.08)", color:C.teal, fontFamily:"monospace" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0, alignItems:"center" }}>
                  {canWatch && btn(isEn ? "Watch" : "ดูวิดีโอ", () => setWatching({ title: a?.title || "YouTube", embedUrl: ytEmbed }), { background:C.teal, color:"#fff", fontSize:11, padding:"5px 10px" })}
                  {a?.url && (
                    <a href={a.url} target="_blank" rel="noreferrer" style={{ fontSize:11, padding:"3px 10px", borderRadius:20, border:`1px solid ${C.teal}`, color:C.teal, textDecoration:"none" }}>
                      Link ↗
                    </a>
                  )}
                </div>
              </div>
                );
              })()
            ))}
          </div>
        )}
      </div>

      {/* Contact */}
      <div style={{ background:C.surface, borderRadius:"var(--radius-card)", padding:"24px 28px", border:`1px solid ${C.border}` }}>
        <h2 style={{ color:C.heading, fontSize:16, margin:"0 0 16px" }}>Contact</h2>
        <div className="contact-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { icon:<GmailIcon />, label:"Email", key:"email" },
            { icon:<LinkedInIcon />, label:"LinkedIn", key:"linkedin" },
            { icon:<LineIcon />, label:"LINE OA", key:"line_oa" },
            { icon:<GitHubIcon />, label:"GitHub", key:"github" },
            { icon:"📅", label: isEn ? "Book a time" : "จองเวลาคุย", key:"booking_url", isBooking:true },
            { icon:"✨", label: isEn ? "Collaboration" : "สนใจร่วมงาน", key:"interest" },
          ].map(f => (
            <div key={f.key} className="edit-wrap" style={{
              display:"flex", gap:12, padding:"12px 16px", borderRadius:10,
              background:C.surface2, border:`1px solid ${C.border}`, alignItems:"flex-start",
            }}>
              {typeof f.icon === "string"
                ? <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
                : <span style={{ flexShrink:0 }}>{f.icon}</span>}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>{f.label}</div>
                {f.isBooking ? (
                  p.booking_url ? (
                    <button
                      onClick={() => setBookingOpen(true)}
                      style={{
                        border: `1px solid ${C.teal}`,
                        background: "rgba(12,123,147,.06)",
                        color: C.teal,
                        borderRadius: 999,
                        padding: "6px 10px",
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {isEn ? "Book ↗" : "จองเวลาคุย ↗"}
                    </button>
                  ) : (
                    <div style={{ color:C.border, fontSize:13 }}>—</div>
                  )
                ) : (
                  (() => {
                    const raw = (f.key === "interest" ? pick("interest") : (p[f.key] || "")).toString();
                    const v = raw.trim();
                    if (!v) return <div style={{ color:C.border, fontSize:13 }}>—</div>;

                    if (f.key === "email") {
                      return (
                        <a
                          href={`mailto:${v}`}
                          style={{ color:C.blue, fontSize:13, wordBreak:"break-all", textDecoration:"none" }}
                        >
                          {v}
                        </a>
                      );
                    }

                    if (f.key === "linkedin" || f.key === "github" || f.key === "line_oa") {
                      const href = asHttpUrl(v);
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color:C.blue, fontSize:13, wordBreak:"break-all", textDecoration:"none" }}
                        >
                          {v}
                        </a>
                      );
                    }

                    return <div style={{ color:C.text, fontSize:13, wordBreak:"break-all" }}>{v}</div>;
                  })()
                )}
              </div>
              {isAdmin && btn("✏", () => setEditing({ key:f.key, value:normalizeText(p[f.key])||"" }), { background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontSize:11, padding:"3px 8px", flexShrink:0 })}
            </div>
          ))}
        </div>
      </div>

      {/* Admin: Edit all fields table */}
      {isAdmin && (
        <div style={{ marginTop:24, background:C.surface, borderRadius:16, padding:"24px 28px", border:`1px solid ${C.border}` }}>
          <h3 style={{ color:C.heading, fontSize:15, margin:"0 0 16px" }}>✏ แก้ไขประวัติทั้งหมด</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {fields.map(f => (
              <div key={f.key} style={{ display:"grid", gridTemplateColumns:"160px 1fr auto", gap:10, alignItems:"center" }}>
                <div style={{ color:C.muted, fontSize:12 }}>{f.label}</div>
                <div style={{ color:C.text, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{normalizeText(p[f.key]) || "—"}</div>
                <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                  {translatableKeys.has(f.key) && !f.key.endsWith("_en") && (
                    btn(translating === f.key ? "กำลังแปล…" : "แปล→EN", () => translateToEn(f.key), { background:C.blue, color:"#fff", fontSize:11 })
                  )}
                  {btn("แก้ไข", () => setEditing({ key:f.key, value:normalizeText(p[f.key])||"" }), { background:C.teal, color:"#fff", fontSize:11 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <EditOverlay title={`แก้ไข: ${fields.find(f=>f.key===editing.key)?.label || editing.key}`} onClose={() => setEditing(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {inp(editing.value, v => setEditing(e => ({...e, value:v})), "ค่าใหม่...", (editing.key === "education" || editing.key === "work_history" || editing.key?.startsWith("bio")) ? true : (editing.value?.length > 80), 5)}
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              {btn("ยกเลิก", () => setEditing(null), { background:"#F1F5F9", color:C.muted })}
              {btn("บันทึก", save, { background:C.teal, color:"#fff" })}
            </div>
          </div>
        </EditOverlay>
      )}
    </div>
  );
}

// ─── PROJECTS TAB ─────────────────────────────────────────────────────────────
function ProjectsTab({ projects, isAdmin, password, lang, onRefresh, showToast }) {
  const [editing, setEditing] = useState(null); // null | { ...project } | "new"
  const [form, setForm] = useState({});
  const [viewImg, setViewImg] = useState(null); // { src, title }
  const isEn = lang === "en";
  const pick = (p, key) => {
    if (isEn) return (p[`${key}_en`] || "").trim();
    return (p[key] || "").trim();
  };
  const [translating, setTranslating] = useState(null); // key

  const openNew = () => {
    setForm({
      title:"", title_en:"",
      url:"", image_url:"",
      description:"", description_en:"",
      tags:"", color:"#0C7B93", sort_order:0, visible:true
    });
    setEditing("new");
  };

  const openEdit = (p) => {
    setForm({ ...p, tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags });
    setEditing(p.id);
  };

  const translateToEn = async (key) => {
    if (!isAdmin) return;
    const map = { title: "title_en", description: "description_en" };
    const dest = map[key];
    if (!dest) return;

    setTranslating(key);
    try {
      const text = (form?.[key] || "").toString();
      const r = await API("translate", { method:"POST", body: JSON.stringify({ text, target: "en" }) }, password);
      if (r?.translation) setForm(f => ({ ...f, [dest]: r.translation }));
    } finally {
      setTranslating(null);
    }
  };

  const save = async () => {
    const payload = {
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      visible: form.visible !== false,
    };
    if (editing === "new") {
      await API("projects", { method:"POST", body:JSON.stringify(payload) }, password);
      showToast(isEn ? "✓ Project added" : "✓ เพิ่ม project แล้ว");
    } else {
      await API(`projects/${editing}`, { method:"PUT", body:JSON.stringify(payload) }, password);
      showToast(isEn ? "✓ Saved" : "✓ บันทึกแล้ว");
    }
    setEditing(null);
    onRefresh();
  };

  const del = async (id) => {
    if (!confirm(isEn ? "Delete this project?" : "ลบ project นี้?")) return;
    await API(`projects/${id}`, { method:"DELETE" }, password);
    showToast(isEn ? "Deleted" : "ลบแล้ว");
    onRefresh();
  };

  const visible = isAdmin ? projects : projects.filter(p => p.visible);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ color:C.heading, margin:0, fontSize:20, letterSpacing:.2 }}>Clinical Digital Tools</h2>
        {isAdmin && btn(isEn ? "+ Add project" : "+ เพิ่ม Project", openNew, { background:C.teal, color:"#fff" })}
      </div>

      <div className="projects-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:20 }}>
        {visible.map(p => (
          <div key={p.id} className="card" style={{
            background:C.surface, borderRadius:18, overflow:"hidden",
            border:`1px solid ${C.border}`, boxShadow:"0 10px 30px rgba(2,6,23,.06)",
            opacity: (!p.visible && isAdmin) ? .55 : 1,
          }}>
            <div style={{ height:4, background:`linear-gradient(90deg, ${p.color || C.teal}, ${C.navy})` }} />

            {p.image_url ? (
              <div className="card-img" style={{ position:"relative", height:170, background:"#0b1220" }}>
                <img
                  src={p.image_url}
                  alt=""
                  loading="lazy"
                  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", filter:"saturate(1.05) contrast(1.02)", cursor:"zoom-in" }}
                  onClick={() => setViewImg({ src: p.image_url, title: p.title || "Project" })}
                />
                <div style={{
                  position:"absolute", inset:0,
                  background:"linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,.55) 72%, rgba(2,6,23,.78) 100%)",
                }} />
                <div style={{ position:"absolute", left:16, right:16, bottom:14, display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:12 }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ color:"rgba(255,255,255,.75)", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>
                      Project
                    </div>
                    <div style={{ color:"#fff", fontSize:16, fontWeight:700, lineHeight:1.25, wordBreak:"break-word" }}>
                      {pick(p, "title") || p.title || "—"}
                    </div>
                  </div>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" style={{
                      fontSize:11, padding:"6px 10px", borderRadius:999,
                      border:"1px solid rgba(255,255,255,.35)", color:"#fff",
                      textDecoration:"none", backdropFilter:"blur(8px)", background:"rgba(255,255,255,.08)",
                      flexShrink:0,
                    }}>Live ↗</a>
                  )}
                </div>
              </div>
            ) : null}

            <div style={{ padding:"18px 20px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:10 }}>
                <div style={{ minWidth:0 }}>
                  <h3 style={{ color:C.heading, fontSize:15, margin:0, lineHeight:1.3 }}>
                    {!p.image_url ? (pick(p, "title") || p.title || "—") : null}
                    {isAdmin && !p.visible && <span style={{ color:C.muted, fontSize:11, marginLeft:8 }}>[ซ่อน]</span>}
                  </h3>
                  {p.url && !p.image_url && (
                    <a href={p.url} target="_blank" rel="noreferrer" style={{
                      display:"inline-block",
                      marginTop:6,
                      fontSize:12,
                      color:C.blue,
                      textDecoration:"none",
                      wordBreak:"break-all",
                    }}>{p.url.replace(/^https?:\/\//, "")} ↗</a>
                  )}
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  {isAdmin && btn("✏", () => openEdit(p), { background:C.blue, color:"#fff", fontSize:11, padding:"5px 10px" })}
                  {isAdmin && btn("✕", () => del(p.id), { background:C.danger, color:"#fff", fontSize:11, padding:"5px 10px" })}
                </div>
              </div>

              <p style={{ color:C.text, fontSize:13.5, lineHeight:1.75, margin:"0 0 12px" }}>
                {pick(p, "description") || p.description || ""}
              </p>

              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {(Array.isArray(p.tags) ? p.tags : []).map((t,i) => (
                  <span key={i} style={{
                    display:"inline-flex", alignItems:"center",
                    padding:"4px 10px", borderRadius:999,
                    fontSize:11, lineHeight:1,
                    background:"rgba(12,123,147,.08)", color:C.teal,
                    border:"1px solid rgba(12,123,147,.16)",
                    fontFamily:"monospace",
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <EditOverlay title={editing === "new" ? (isEn ? "Add project" : "เพิ่ม Project ใหม่") : (isEn ? "Edit project" : "แก้ไข Project")} onClose={() => setEditing(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              ["title","ชื่อ Project (TH)"],
              ["title_en","Title (EN)"],
              ["url","URL (ถ้ามี)"],
              ["image_url","รูป (URL รูปภาพ)"],
              ["description","คำอธิบาย (TH)"],
              ["description_en","Description (EN)"],
              ["tags","Tags (คั่นด้วย , )"],
            ].map(([k,label]) => (
              <div key={k}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:4 }}>
                  <div style={{ fontSize:12, color:C.muted }}>{label}</div>
                  {isAdmin && (k === "title" || k === "description") && (
                    btn(
                      translating === k ? (isEn ? "Translating…" : "กำลังแปล…") : (isEn ? "Translate → EN" : "แปล→EN"),
                      () => translateToEn(k),
                      { background:C.blue, color:"#fff", fontSize:11, padding:"4px 10px" }
                    )
                  )}
                </div>
                {inp(form[k]||"", v => setForm(f => ({...f,[k]:v})), label, k==="description" || k==="description_en", 3)}
              </div>
            ))}
            <div style={{ display:"flex", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>สี (hex)</div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input type="color" value={form.color||"#0C7B93"} onChange={e => setForm(f=>({...f,color:e.target.value}))} style={{ width:40, height:36, border:"none", cursor:"pointer" }}/>
                  {inp(form.color||"", v => setForm(f=>({...f,color:v})), "#0C7B93")}
                </div>
              </div>
              <div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>ลำดับ</div>
                <input type="number" value={form.sort_order||0} onChange={e => setForm(f=>({...f,sort_order:+e.target.value}))}
                  style={{ width:70, padding:"9px 10px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13 }} />
              </div>
            </div>
            <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer" }}>
              <input type="checkbox" checked={form.visible !== false} onChange={e => setForm(f=>({...f,visible:e.target.checked}))} />
              {isEn ? "Visible" : "แสดงสาธารณะ"}
            </label>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
              {btn(isEn ? "Cancel" : "ยกเลิก", () => setEditing(null), { background:"#F1F5F9", color:C.muted })}
              {btn(isEn ? "Save" : "บันทึก", save, { background:C.teal, color:"#fff" })}
            </div>
          </div>
        </EditOverlay>
      )}

      <ImageViewer
        src={viewImg?.src}
        title={viewImg?.title}
        onClose={() => setViewImg(null)}
      />
    </div>
  );
}

// ─── ARTICLES TAB ─────────────────────────────────────────────────────────────
function ArticlesTab({ articles, isAdmin, password, lang, onRefresh, showToast }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [reading, setReading] = useState(null);
  const isEn = lang === "en";
  const pick = (a, key) => {
    if (isEn) return (a[`${key}_en`] || "").trim();
    return (a[key] || "").trim();
  };
  const sourceLabel = (a) => {
    const custom = isEn ? (a.external_label_en || "").trim() : (a.external_label || "").trim();
    if (custom) return custom;
    const type = (a.source_type || "website").toLowerCase();
    if (type === "notion") return isEn ? "Read in Notion" : "อ่านต่อใน Notion";
    if (type === "obsidian") return isEn ? "Open in Obsidian" : "เปิดใน Obsidian";
    return isEn ? "Open source" : "เปิดลิงก์ต้นทาง";
  };
  const [translating, setTranslating] = useState(null); // key

  const translateToEn = async (key) => {
    if (!isAdmin) return;
    const map = { title: "title_en", summary: "summary_en", content: "content_en" };
    const dest = map[key];
    if (!dest) return;

    setTranslating(key);
    try {
      const text = (form?.[key] || "").toString();
      const r = await API("translate", { method:"POST", body: JSON.stringify({ text, target: "en" }) }, password);
      if (r?.translation) setForm(f => ({ ...f, [dest]: r.translation }));
    } finally {
      setTranslating(null);
    }
  };

  const openNew = () => {
    setForm({
      title:"", title_en:"",
      content:"", content_en:"",
      summary:"", summary_en:"",
      external_url:"", external_label:"", external_label_en:"", source_type:"website",
      published:false,
    });
    setEditing("new");
  };
  const openEdit = a => { setForm({...a}); setEditing(a.id); };

  const save = async () => {
    if (editing === "new") {
      await API("articles", { method:"POST", body:JSON.stringify(form) }, password);
      showToast(isEn ? "✓ Article added" : "✓ เพิ่มบทความแล้ว");
    } else {
      await API(`articles/${editing}`, { method:"PUT", body:JSON.stringify(form) }, password);
      showToast(isEn ? "✓ Saved" : "✓ บันทึกแล้ว");
    }
    setEditing(null); onRefresh();
  };

  const del = async id => {
    if (!confirm(isEn ? "Delete this article?" : "ลบบทความนี้?")) return;
    await API(`articles/${id}`, { method:"DELETE" }, password);
    showToast(isEn ? "Deleted" : "ลบแล้ว"); onRefresh();
  };

  const visible = isAdmin ? articles : articles.filter(a => a.published);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ color:C.heading, margin:0, fontSize:20 }}>{isEn ? "Articles" : "บทความ"}</h2>
        {isAdmin && btn(isEn ? "+ Add article" : "+ เพิ่มบทความ", openNew, { background:C.teal, color:"#fff" })}
      </div>

      {visible.length === 0 && (
        <div style={{ background:C.surface, borderRadius:12, padding:"40px", textAlign:"center", color:C.muted, border:`1px solid ${C.border}` }}>
          {isEn ? "No articles yet" : "ยังไม่มีบทความ"}
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {visible.map(a => (
          <div key={a.id} className="card" style={{
            background:C.surface, borderRadius:14, padding:"22px 26px",
            border:`1px solid ${C.border}`, boxShadow:"0 2px 8px rgba(0,0,0,.04)",
            opacity: (!a.published && isAdmin) ? .6 : 1,
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  {!a.published && isAdmin && (
                    <span style={{ background:"#FEF3C7", color:"#92400E", fontSize:10, padding:"2px 8px", borderRadius:20 }}>Draft</span>
                  )}
                  <h3 style={{ color:C.heading, margin:0, fontSize:15, cursor:"pointer" }} onClick={() => setReading(a)}>
                    {pick(a, "title") || a.title || "—"}
                  </h3>
                </div>
                {(pick(a, "summary") || "").length > 0 && (
                  <p style={{ color:C.muted, fontSize:13, margin:"0 0 6px", lineHeight:1.6 }}>
                    {pick(a, "summary")}
                  </p>
                )}
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <div style={{ color:C.border, fontSize:11 }}>{a.updated_at?.slice(0,10) || a.created_at?.slice(0,10)}</div>
                  {a.external_url && (
                    <span style={{
                      fontSize:10,
                      padding:"2px 8px",
                      borderRadius:999,
                      background:"rgba(12,123,147,.08)",
                      color:C.teal,
                      border:`1px solid ${C.border}`,
                    }}>
                      {(a.source_type || "website").toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0, marginLeft:16 }}>
                {btn("อ่าน", () => setReading(a), { background:C.blue, color:"#fff", fontSize:11 })}
                {a.external_url && (
                  <a href={asHttpUrl(a.external_url)} target="_blank" rel="noreferrer" style={{
                    fontSize:11,
                    padding:"7px 10px",
                    borderRadius:"var(--radius-btn, 12px)",
                    background:C.surface2,
                    color:C.teal,
                    border:`1px solid ${C.border}`,
                    textDecoration:"none",
                    whiteSpace:"nowrap",
                  }}>
                    {sourceLabel(a)} ↗
                  </a>
                )}
                {isAdmin && btn("✏", () => openEdit(a), { background:C.teal, color:"#fff", fontSize:11 })}
                {isAdmin && btn("✕", () => del(a.id), { background:C.danger, color:"#fff", fontSize:11, padding:"7px 8px" })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reading modal */}
      {reading && (
        <EditOverlay title={(pick(reading, "title") || reading.title)} onClose={() => setReading(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ color:C.text, fontSize:14, lineHeight:1.9, whiteSpace:"pre-wrap", maxHeight:"60vh", overflowY:"auto" }}>
              {pick(reading, "content") || reading.content || (isEn ? "(No content)" : "(ไม่มีเนื้อหา)")}
            </div>
            {reading.external_url && (
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <a href={asHttpUrl(reading.external_url)} target="_blank" rel="noreferrer" style={{
                  fontSize:12,
                  padding:"8px 12px",
                  borderRadius:999,
                  background:C.teal,
                  color:"#fff",
                  textDecoration:"none",
                }}>
                  {sourceLabel(reading)} ↗
                </a>
              </div>
            )}
          </div>
        </EditOverlay>
      )}

      {/* Edit modal */}
      {editing !== null && (
        <EditOverlay title={editing === "new" ? (isEn ? "Add article" : "เพิ่มบทความใหม่") : (isEn ? "Edit article" : "แก้ไขบทความ")} onClose={() => setEditing(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:4 }}>
                <div style={{ fontSize:12, color:C.muted }}>หัวเรื่อง (TH)</div>
                {isAdmin && btn(
                  translating === "title" ? (isEn ? "Translating…" : "กำลังแปล…") : (isEn ? "Translate → EN" : "แปล→EN"),
                  () => translateToEn("title"),
                  { background:C.blue, color:"#fff", fontSize:11, padding:"4px 10px" }
                )}
              </div>
              {inp(form.title||"", v => setForm(f=>({...f,title:v})), isEn ? "Thai title..." : "หัวเรื่องบทความ...")}
            </div>
            <div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Title (EN)</div>
              {inp(form.title_en||"", v => setForm(f=>({...f,title_en:v})), "Article title...")}
            </div>
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:4 }}>
                <div style={{ fontSize:12, color:C.muted }}>สรุปย่อ (TH)</div>
                {isAdmin && btn(
                  translating === "summary" ? (isEn ? "Translating…" : "กำลังแปล…") : (isEn ? "Translate → EN" : "แปล→EN"),
                  () => translateToEn("summary"),
                  { background:C.blue, color:"#fff", fontSize:11, padding:"4px 10px" }
                )}
              </div>
              {inp(form.summary||"", v => setForm(f=>({...f,summary:v})), isEn ? "Thai summary..." : "สรุปสั้นๆ...", true, 2)}
            </div>
            <div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Summary (EN)</div>
              {inp(form.summary_en||"", v => setForm(f=>({...f,summary_en:v})), "Short summary...", true, 2)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:10 }}>
              <div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{isEn ? "Source type" : "ชนิดลิงก์"}</div>
                <select
                  value={form.source_type || "website"}
                  onChange={e => setForm(f=>({...f,source_type:e.target.value}))}
                  style={{
                    width:"100%",
                    padding:"9px 12px",
                    border:`1px solid ${C.border}`,
                    borderRadius:8,
                    fontSize:13,
                    fontFamily:"inherit",
                    background:C.surface,
                    color:C.text,
                  }}
                >
                  <option value="website">Website</option>
                  <option value="notion">Notion</option>
                  <option value="obsidian">Obsidian</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{isEn ? "External URL" : "ลิงก์ภายนอก"}</div>
                {inp(form.external_url||"", v => setForm(f=>({...f,external_url:v})), "https://...")}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:10 }}>
              <div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{isEn ? "Button label (TH)" : "ชื่อปุ่ม (TH)"}</div>
                {inp(form.external_label||"", v => setForm(f=>({...f,external_label:v})), "อ่านต่อใน Notion")}
              </div>
              <div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{isEn ? "Button label (EN)" : "ชื่อปุ่ม (EN)"}</div>
                {inp(form.external_label_en||"", v => setForm(f=>({...f,external_label_en:v})), "Read in Notion")}
              </div>
            </div>
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:4 }}>
                <div style={{ fontSize:12, color:C.muted }}>เนื้อหา (TH)</div>
                {isAdmin && btn(
                  translating === "content" ? (isEn ? "Translating…" : "กำลังแปล…") : (isEn ? "Translate → EN" : "แปล→EN"),
                  () => translateToEn("content"),
                  { background:C.blue, color:"#fff", fontSize:11, padding:"4px 10px" }
                )}
              </div>
              {inp(form.content||"", v => setForm(f=>({...f,content:v})), isEn ? "Write Thai content here..." : "เขียนเนื้อหาที่นี่...", true, 10)}
            </div>
            <div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Content (EN)</div>
              {inp(form.content_en||"", v => setForm(f=>({...f,content_en:v})), "Write content here...", true, 10)}
            </div>
            <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer" }}>
              <input type="checkbox" checked={!!form.published} onChange={e => setForm(f=>({...f,published:e.target.checked}))} />
              {isEn ? "Published" : "เผยแพร่"} (Published)
            </label>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              {btn(isEn ? "Cancel" : "ยกเลิก", () => setEditing(null), { background:"#F1F5F9", color:C.muted })}
              {btn(isEn ? "Save" : "บันทึก", save, { background:C.teal, color:"#fff" })}
            </div>
          </div>
        </EditOverlay>
      )}
    </div>
  );
}

// ─── ADMIN TAB ────────────────────────────────────────────────────────────────
function AdminTab({ passwords, password, onRefresh, showToast }) {
  const [form, setForm] = useState({ code:"", hospital_name:"", role:"viewer", note:"", theme_preset:"confident", theme_overrides:"" });
  const [adding, setAdding] = useState(false);
  const [qrFor, setQrFor] = useState(null); // { hospital_name, url }

  const buildViewerLink = (code) => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?code=${encodeURIComponent(code || "")}`;
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("คัดลอกแล้ว");
      return;
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("คัดลอกแล้ว");
    } catch {
      showToast("คัดลอกไม่สำเร็จ");
    }
  };

  const add = async () => {
    if (!form.code || !form.hospital_name) return;
    await API("passwords", { method:"POST", body:JSON.stringify(form) }, password);
    showToast("✓ เพิ่มรหัสผ่านแล้ว");
    setForm({ code:"", hospital_name:"", role:"viewer", note:"", theme_preset:"confident", theme_overrides:"" });
    setAdding(false);
    onRefresh();
  };

  const updateRow = async (row, patch) => {
    const next = { ...row, ...patch };
    await API(`passwords/${row.id}`, { method:"PUT", body:JSON.stringify(next) }, password);
    showToast("✓ บันทึกแล้ว");
    // Preview the selected theme immediately in the current admin session.
    if (patch?.theme_preset) {
      try { applyTheme(patch.theme_preset, next.theme_overrides || ""); } catch {}
    }
    onRefresh();
  };

  const del = async id => {
    if (!confirm("ลบรหัสผ่านนี้?")) return;
    await API(`passwords/${id}`, { method:"DELETE" }, password);
    showToast("ลบแล้ว");
    onRefresh();
  };

  return (
    <div>
      <h2 style={{ color:C.heading, fontSize:20, marginTop:0, marginBottom:24 }}>⚙ Admin Panel</h2>

      {/* Passwords table */}
      <div style={{ background:C.surface, borderRadius:16, padding:"24px 28px", border:`1px solid ${C.border}`, marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ color:C.heading, margin:0, fontSize:15 }}>🔑 รหัสผ่านแต่ละโรงพยาบาล</h3>
          {btn("+ เพิ่มรหัส", () => setAdding(true), { background:C.teal, color:"#fff" })}
        </div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:C.surface2 }}>
                {["โรงพยาบาล","รหัสผ่าน","Role","หมายเหตุ","เข้าล่าสุด","ธีม","ลิงก์/QR",""].map((h,i) => (
                  <th key={i} style={{ padding:"10px 14px", textAlign:"left", color:C.muted, fontSize:11, letterSpacing:.5, fontWeight:600, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {passwords.map(p => (
                <tr key={p.id} style={{ borderBottom:`1px solid #F1F5F9` }}>
                  <td style={{ padding:"11px 14px", color:C.text, fontWeight:600 }}>{p.hospital_name}</td>
                  <td style={{ padding:"11px 14px", fontFamily:"monospace", color:C.blue }}>{p.code}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{
                      padding:"2px 10px", borderRadius:20, fontSize:11,
                      background: p.role==="admin" ? "#FEE2E2" : "#EFF6FF",
                      color: p.role==="admin" ? C.danger : C.blue,
                    }}>{p.role}</span>
                  </td>
                  <td style={{ padding:"11px 14px", color:C.muted, fontSize:12 }}>{p.note || "—"}</td>
                  <td style={{ padding:"11px 14px", color:C.muted, fontSize:11 }}>{p.last_access?.slice(0,16) || "ยังไม่เคยเข้า"}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <select
                      value={p.theme_preset || "confident"}
                      onChange={(e) => updateRow(p, { theme_preset: e.target.value })}
                      style={{ padding:"6px 10px", border:`1px solid ${C.border}`, borderRadius:10, fontSize:12, fontFamily:"inherit", background:C.surface, color:C.text }}
                    >
                      <option value="sweet">โทนอ่อนหวาน</option>
                      <option value="strong">โทนเข้มแข็ง</option>
                      <option value="confident">โทนมั่นใจ</option>
                    </select>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {btn("คัดลอกลิงก์", () => copyText(buildViewerLink(p.code)), { background:"#EFF6FF", color:C.blue, fontSize:11, padding:"4px 10px" })}
                      {btn("QR", () => setQrFor({ hospital_name: p.hospital_name, url: buildViewerLink(p.code) }), { background:"#F1F5F9", color:C.muted, fontSize:11, padding:"4px 10px" })}
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    {btn("ลบ", () => del(p.id), { background:C.danger, color:"#fff", fontSize:11, padding:"4px 10px" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR modal */}
      {qrFor && (
        <EditOverlay title={`QR: ${qrFor.hospital_name}`} onClose={() => setQrFor(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ color:C.muted, fontSize:12, lineHeight:1.6 }}>
              สแกนเพื่อเข้าได้เลย (Auto-login) — ลิงก์นี้มีรหัสฝังอยู่ ถ้าต้องปิดสิทธิ์ให้ลบรหัสโรงพยาบาลนี้
            </div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <img
                alt="QR"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrFor.url)}`}
                style={{ width:260, height:260, borderRadius:12, border:`1px solid ${C.border}`, background:"#fff" }}
              />
            </div>
            <div style={{ fontFamily:"monospace", fontSize:12, wordBreak:"break-all", padding:"10px 12px", border:`1px solid ${C.border}`, borderRadius:10, background:C.surface2, color:C.text }}>
              {qrFor.url}
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              {btn("คัดลอกลิงก์", () => copyText(qrFor.url), { background:C.blue, color:"#fff", fontSize:11 })}
              {btn("ปิด", () => setQrFor(null), { background:"#F1F5F9", color:C.muted })}
            </div>
          </div>
        </EditOverlay>
      )}

      {/* Tips */}
      <div style={{ background:"#EFF6FF", borderRadius:12, padding:"18px 22px", border:"1px solid #BFDBFE", fontSize:13, color:C.blue, lineHeight:1.8 }}>
        <b>💡 วิธีใช้งาน</b><br/>
        • สร้างรหัสแยกให้แต่ละโรงพยาบาลที่สมัครงาน — ติดตามได้ว่าใครเข้าดูบ้าง<br/>
        • Role <b>viewer</b> = ดูอย่างเดียว | Role <b>admin</b> = แก้ไขได้ทุกอย่าง<br/>
        • เมื่อสัมภาษณ์เสร็จแล้ว ลบรหัสนั้นออกได้เลย<br/>
        • หน้า About / Projects / Articles แก้ไขได้เลยโดยไม่ต้องเขียนโค้ด
      </div>

      {/* Add password modal */}
      {adding && (
        <EditOverlay title="เพิ่มรหัสผ่านใหม่" onClose={() => setAdding(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["code","รหัสผ่าน (ตัวอักษร+ตัวเลข)"],["hospital_name","ชื่อโรงพยาบาล / หน่วยงาน"],["note","หมายเหตุ (ไม่บังคับ)"]].map(([k,label]) => (
              <div key={k}>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{label}</div>
                {inp(form[k]||"", v => setForm(f=>({...f,[k]:v})), label)}
              </div>
            ))}
            <div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>ธีม (Theme)</div>
              <select value={form.theme_preset || "confident"} onChange={e => setForm(f=>({...f,theme_preset:e.target.value}))} style={{
                width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, fontFamily:"inherit",
                background:C.surface, color:C.text,
              }}>
                <option value="sweet">โทนอ่อนหวาน</option>
                <option value="strong">โทนเข้มแข็ง</option>
                <option value="confident">โทนมั่นใจ</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Role</div>
              <select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))} style={{
                width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, fontFamily:"inherit",
              }}>
                <option value="viewer">viewer — ดูอย่างเดียว</option>
                <option value="admin">admin — แก้ไขได้</option>
              </select>
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              {btn("ยกเลิก", () => setAdding(false), { background:"#F1F5F9", color:C.muted })}
              {btn("เพิ่มรหัส", add, { background:C.teal, color:"#fff" })}
            </div>
          </div>
        </EditOverlay>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(() => {
    try {
      const s = sessionStorage.getItem("portfolio_session");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const handleUnlock = (pw, role, hospital, theme_preset, theme_overrides) => {
    const s = { pw, role, hospital, theme_preset, theme_overrides };
    sessionStorage.setItem("portfolio_session", JSON.stringify(s));
    setSession(s);
  };

  const handleLogout = () => {
    try { sessionStorage.removeItem("portfolio_session"); } catch {}
    setSession(null);
  };

  if (!session) return <LockScreen onUnlock={handleUnlock} />;
  return <Portfolio password={session.pw} role={session.role} hospital={session.hospital} onLogout={handleLogout} />;
}
