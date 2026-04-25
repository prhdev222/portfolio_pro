import { useState, useEffect, useCallback } from "react";

// ─── API ────────────────────────────────────────────────────────────────────
const API = (path, opts = {}, password = null) => {
  const headers = { "Content-Type": "application/json" };
  if (password) headers["Authorization"] = `Bearer ${password}`;
  return fetch(`/api/${path}`, { headers, ...opts }).then(r => r.json());
};

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy: "#0B2447", blue: "#19376D", teal: "#0C7B93",
  ltTeal: "#27AAB0", accent: "#A5F3FC", white: "#FFFFFF",
  bg: "#F0F9FF", text: "#1E293B", muted: "#64748B",
  border: "#CBD5E1", success: "#16A34A", danger: "#DC2626",
};

// ─── tiny helpers ────────────────────────────────────────────────────────────
const btn = (label, onClick, style = {}) => (
  <button onClick={onClick} style={{
    border: "none", cursor: "pointer", borderRadius: 6, padding: "7px 16px",
    fontSize: 13, fontFamily: "inherit", transition: "opacity .15s", ...style,
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
    background: "#fff", color: C.text,
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
        background: "#fff", borderRadius: 16, padding: "28px 32px",
        maxWidth: 600, width: "100%", maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,.25)",
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
        onUnlock(pw.trim(), r.role, r.hospital);
      }
    } catch {
      setMsg("เชื่อมต่อ server ไม่ได้");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${C.navy} 0%, ${C.teal} 70%, ${C.navy} 100%)`,
      fontFamily: "'Sarabun', Georgia, serif", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-10px)} 75%{transform:translateX(10px)} }
        @keyframes ripple { 0%{transform:scale(0.8);opacity:.4} 100%{transform:scale(2.5);opacity:0} }
        @keyframes pulse { 0%,100%{opacity:.06} 50%{opacity:.13} }
        .lock-ring { animation: pulse 3s ease-in-out infinite; }
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

      <div className="lock-wrap" style={{ animation: "fadeUp .8s ease both", textAlign:"center", zIndex:1, padding:"0 24px", width:"100%", maxWidth:400 }}>
        <div style={{
          width:96, height:96, borderRadius:18, margin:"0 auto 24px",
          background:"rgba(255,255,255,.10)", border:"1px solid rgba(255,255,255,.25)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:36,
          overflow:"hidden",
          boxShadow:"0 16px 40px rgba(0,0,0,.25)",
        }}>
          {publicProfile?.avatar_url ? (
            <img
              src={publicProfile.avatar_url}
              alt=""
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", cursor:"zoom-in" }}
              onClick={() => setViewImg({ src: publicProfile.avatar_url, title: publicProfile?.cover_name || publicProfile?.name || "Profile" })}
            />
          ) : "🩺"}
        </div>

        <div style={{ color:"rgba(255,255,255,.5)", fontSize:11, letterSpacing:4, marginBottom:8, textTransform:"uppercase" }}>Private Portfolio</div>
        <h1 className="lock-title" style={{ fontFamily:"'Cormorant Garamond', Georgia", color:"#fff", fontSize:30, fontWeight:400, margin:"0 0 4px", lineHeight:1.15 }}>
          <span>{lockName.first || "—"}</span>
          {lockName.last ? <span className="name-last"> {lockName.last}</span> : null}
        </h1>
        <div className="lock-sub" style={{ color:C.accent, fontSize:13, marginBottom:36, letterSpacing:.5 }}>
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
            background: C.teal, border:"none", padding:"0 20px", color:"#fff",
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
function Portfolio({ password, role, hospital }) {
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

  const load = useCallback(async () => {
    setLoading(true);
    const endpoint = isAdmin ? "admin/content" : "content";
    const r = await API(endpoint, {}, password);
    setData(r);
    setLoading(false);
  }, [password, isAdmin]);

  useEffect(() => { load(); }, [load]);
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
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, fontFamily:"'Sarabun',Georgia,serif" }}>
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
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Sarabun',Georgia,serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .card { transition: transform .2s, box-shadow .2s; }
        .card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.10)!important; }
        .edit-btn { opacity:0; transition:opacity .2s; }
        .edit-wrap:hover .edit-btn { opacity:1; }
        input:focus, textarea:focus { border-color:${C.teal}!important; box-shadow:0 0 0 3px rgba(12,123,147,.12); }
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
          .hero { flex-direction: column !important; align-items: flex-start !important; padding: 26px 20px !important; gap: 16px !important; }
          .hero-avatar { width: 104px !important; height: 104px !important; border-radius: 20px !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
          .card-img { height: 150px !important; }
          .name-last { display: block; }
        }
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
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
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
          <div style={{ color:"rgba(255,255,255,.4)", fontSize:11, whiteSpace:"nowrap" }}>
            {hospital} {isAdmin && <span style={{ color:C.accent }}>· Admin</span>}
          </div>
        </div>
      </header>

      <main className="main-wrap" style={{ maxWidth:980, margin:"0 auto", padding:"36px 24px", animation:"fadeUp .4s ease" }} key={tab}>

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
  const pick = (key) => {
    // In EN mode, only show EN fields (no TH fallback)
    if (lang === "en") return normalizeText(p[`${key}_en`]) || "";
    return normalizeText(p[key]) || "";
  };
  const awards = parseAwards(isEn ? p.awards_en : p.awards);
  const aboutName = splitNameLastWord(pick("name"));
  const fields = [
    { key:"name", label:"ชื่อ (ไทย)" },
    { key:"name_en", label:"Name (English)" },
    { key:"avatar_url", label:"รูปโปรไฟล์ (URL รูปภาพ)" },
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
        borderRadius:20, padding:"40px 48px", marginBottom:28,
        display:"flex", gap:36, alignItems:"center",
      }} className="hero">
        <div style={{
          width:124, height:124, borderRadius:22,
          background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.28)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:44, flexShrink:0,
          overflow:"hidden",
          boxShadow:"0 18px 48px rgba(0,0,0,.25)",
        }} className="hero-avatar">
          {p.avatar_url ? (
            <img
              src={p.avatar_url}
              alt=""
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", cursor:"zoom-in" }}
              onClick={() => setViewImg({ src: p.avatar_url, title: p.name || "Profile" })}
            />
          ) : "👩‍⚕️"}
        </div>
        <div>
          <div style={{ color:C.accent, fontSize:11, letterSpacing:3, marginBottom:6, textTransform:"uppercase" }}>Private Portfolio</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia", color:"#fff", fontSize:32, margin:"0 0 4px", fontWeight:400, lineHeight:1.12 }}>
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
                  background:"#fff",
                }}>
                  {isEn ? "Open booking page in a new tab ↗" : "เปิดหน้าจองในแท็บใหม่ ↗"}
                </a>
              )}
            </div>
            <div style={{ position:"relative", width:"100%", height:"70vh", borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}`, background:"#fff" }}>
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
                  <div key={idx} style={{ border:`1px solid ${C.border}`, borderRadius:12, padding:14, background:"#F8FAFC" }}>
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
        background:"#fff", borderRadius:12, padding:"18px 24px", marginBottom:20,
        border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12,
      }} className="edit-wrap">
        <span style={{ fontSize:18 }}>💼</span>
        <span style={{ color:C.blue, fontSize:14, fontStyle:"italic", flex:1 }}>{pick("headline")}</span>
        {isAdmin && btn("✏", () => setEditing({ key: isEn ? "headline_en" : "headline", value: pick("headline") }), { background:C.teal, color:"#fff", className:"edit-btn" })}
      </div>

      {/* Bio paragraphs */}
      <div style={{ background:"#fff", borderRadius:16, padding:"28px 32px", border:`1px solid ${C.border}`, marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h2 style={{ color:C.navy, fontSize:16, margin:0 }}>{isEn ? "Bio" : "ประวัติส่วนตัว"}</h2>
        </div>
        {["bio","bio2","bio3"].map((key) => (
          <div key={key} className="edit-wrap" style={{ display:"flex", gap:8, marginBottom:14, alignItems:"flex-start" }}>
            <p style={{ color:"#374151", lineHeight:1.9, fontSize:14, margin:0, flex:1 }}>{pick(key)}</p>
            {isAdmin && btn("✏", () => setEditing({ key: isEn ? `${key}_en` : key, value: pick(key) }), { background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontSize:11, padding:"3px 8px" })}
          </div>
        ))}
      </div>

      {/* Awards */}
      <div style={{ background:"#fff", borderRadius:16, padding:"24px 28px", border:`1px solid ${C.border}`, marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }} className="edit-wrap">
          <h2 style={{ color:C.navy, fontSize:16, margin:0 }}>{isEn ? "Awards / Achievements" : "ผลงานที่เคยได้รับ"}</h2>
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
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"12px 14px", borderRadius:12, background:"#F8FAFC", border:`1px solid ${C.border}` }}>
                {thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt=""
                    style={{ width:52, height:52, objectFit:"cover", borderRadius:10, border:`1px solid ${C.border}`, cursor:"zoom-in" }}
                    onClick={() => setViewImg({ src: thumbSrc, title: a?.title || (isEn ? "Award" : "ผลงาน") })}
                  />
                ) : (
                  <div style={{ width:52, height:52, borderRadius:10, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", color:C.muted, fontSize:18 }}>🏅</div>
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
      <div style={{ background:"#fff", borderRadius:16, padding:"24px 28px", border:`1px solid ${C.border}` }}>
        <h2 style={{ color:C.navy, fontSize:16, margin:"0 0 16px" }}>Contact</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { icon:"📧", label:"Email", key:"email" },
            { icon:"💼", label:"LinkedIn", key:"linkedin" },
            { icon:"💻", label:"GitHub", key:"github" },
            { icon:"📅", label: isEn ? "Book a time" : "จองเวลาคุย", key:"booking_url", isBooking:true },
            { icon:"✨", label: isEn ? "Collaboration" : "สนใจร่วมงาน", key:"interest" },
          ].map(f => (
            <div key={f.key} className="edit-wrap" style={{
              display:"flex", gap:12, padding:"12px 16px", borderRadius:10,
              background:"#F8FAFC", border:`1px solid ${C.border}`, alignItems:"flex-start",
            }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
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
                  <div style={{ color:C.text, fontSize:13, wordBreak:"break-all" }}>
                    {(f.key === "interest" ? pick("interest") : (p[f.key] || "")) || <span style={{ color:C.border }}>—</span>}
                  </div>
                )}
              </div>
              {isAdmin && btn("✏", () => setEditing({ key:f.key, value:normalizeText(p[f.key])||"" }), { background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontSize:11, padding:"3px 8px", flexShrink:0 })}
            </div>
          ))}
        </div>
      </div>

      {/* Admin: Edit all fields table */}
      {isAdmin && (
        <div style={{ marginTop:24, background:"#fff", borderRadius:16, padding:"24px 28px", border:`1px solid ${C.border}` }}>
          <h3 style={{ color:C.navy, fontSize:15, margin:"0 0 16px" }}>✏ แก้ไขประวัติทั้งหมด</h3>
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
        <h2 style={{ color:C.navy, margin:0, fontSize:20, letterSpacing:.2 }}>Clinical Digital Tools</h2>
        {isAdmin && btn(isEn ? "+ Add project" : "+ เพิ่ม Project", openNew, { background:C.teal, color:"#fff" })}
      </div>

      <div className="projects-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:20 }}>
        {visible.map(p => (
          <div key={p.id} className="card" style={{
            background:"#fff", borderRadius:18, overflow:"hidden",
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
                  <h3 style={{ color:C.navy, fontSize:15, margin:0, lineHeight:1.3 }}>
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

              <p style={{ color:"#334155", fontSize:13.5, lineHeight:1.75, margin:"0 0 12px" }}>
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
    setForm({ title:"", title_en:"", content:"", content_en:"", summary:"", summary_en:"", published:false });
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
        <h2 style={{ color:C.navy, margin:0, fontSize:20 }}>{isEn ? "Articles" : "บทความ"}</h2>
        {isAdmin && btn(isEn ? "+ Add article" : "+ เพิ่มบทความ", openNew, { background:C.teal, color:"#fff" })}
      </div>

      {visible.length === 0 && (
        <div style={{ background:"#fff", borderRadius:12, padding:"40px", textAlign:"center", color:C.muted, border:`1px solid ${C.border}` }}>
          {isEn ? "No articles yet" : "ยังไม่มีบทความ"}
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {visible.map(a => (
          <div key={a.id} className="card" style={{
            background:"#fff", borderRadius:14, padding:"22px 26px",
            border:`1px solid ${C.border}`, boxShadow:"0 2px 8px rgba(0,0,0,.04)",
            opacity: (!a.published && isAdmin) ? .6 : 1,
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  {!a.published && isAdmin && (
                    <span style={{ background:"#FEF3C7", color:"#92400E", fontSize:10, padding:"2px 8px", borderRadius:20 }}>Draft</span>
                  )}
                  <h3 style={{ color:C.navy, margin:0, fontSize:15, cursor:"pointer" }} onClick={() => setReading(a)}>
                    {pick(a, "title") || a.title || "—"}
                  </h3>
                </div>
                {(pick(a, "summary") || "").length > 0 && (
                  <p style={{ color:C.muted, fontSize:13, margin:"0 0 6px", lineHeight:1.6 }}>
                    {pick(a, "summary")}
                  </p>
                )}
                <div style={{ color:C.border, fontSize:11 }}>{a.updated_at?.slice(0,10) || a.created_at?.slice(0,10)}</div>
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0, marginLeft:16 }}>
                {btn("อ่าน", () => setReading(a), { background:C.blue, color:"#fff", fontSize:11 })}
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
          <div style={{ color:C.text, fontSize:14, lineHeight:1.9, whiteSpace:"pre-wrap", maxHeight:"60vh", overflowY:"auto" }}>
            {pick(reading, "content") || reading.content || (isEn ? "(No content)" : "(ไม่มีเนื้อหา)")}
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
  const [form, setForm] = useState({ code:"", hospital_name:"", role:"viewer", note:"" });
  const [adding, setAdding] = useState(false);

  const add = async () => {
    if (!form.code || !form.hospital_name) return;
    await API("passwords", { method:"POST", body:JSON.stringify(form) }, password);
    showToast("✓ เพิ่มรหัสผ่านแล้ว");
    setForm({ code:"", hospital_name:"", role:"viewer", note:"" });
    setAdding(false);
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
      <h2 style={{ color:C.navy, fontSize:20, marginTop:0, marginBottom:24 }}>⚙ Admin Panel</h2>

      {/* Passwords table */}
      <div style={{ background:"#fff", borderRadius:16, padding:"24px 28px", border:`1px solid ${C.border}`, marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ color:C.navy, margin:0, fontSize:15 }}>🔑 รหัสผ่านแต่ละโรงพยาบาล</h3>
          {btn("+ เพิ่มรหัส", () => setAdding(true), { background:C.teal, color:"#fff" })}
        </div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"#F8FAFC" }}>
                {["โรงพยาบาล","รหัสผ่าน","Role","หมายเหตุ","เข้าล่าสุด",""].map((h,i) => (
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
                    {btn("ลบ", () => del(p.id), { background:C.danger, color:"#fff", fontSize:11, padding:"4px 10px" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

  const handleUnlock = (pw, role, hospital) => {
    const s = { pw, role, hospital };
    sessionStorage.setItem("portfolio_session", JSON.stringify(s));
    setSession(s);
  };

  if (!session) return <LockScreen onUnlock={handleUnlock} />;
  return <Portfolio password={session.pw} role={session.role} hospital={session.hospital} />;
}
