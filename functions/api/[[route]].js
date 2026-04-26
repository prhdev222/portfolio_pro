// functions/api/[[route]].js
// Cloudflare Pages Function — handles all /api/* routes
// Bind D1 database as "DB" in wrangler.toml / Pages dashboard

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: CORS });

const err = (msg, status = 400) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: CORS });

async function translateViaOpenRouter(env, { text, target = 'en' }) {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');

  const model = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const referer = env.OPENROUTER_REFERER || 'https://portfolio-pro.pages.dev';
  const title = env.OPENROUTER_APP_TITLE || 'portfolio-pro';

  const prompt = [
    `Translate the text to ${target}.`,
    'Rules:',
    '- Preserve meaning and professional tone.',
    '- Keep proper nouns, hospital names, and acronyms as-is.',
    '- Preserve bullet points and line breaks.',
    '- Output ONLY the translated text (no quotes, no markdown).',
    '',
    'Text:',
    text ?? '',
  ].join('\n');

  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': referer,
      'X-Title': title,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a precise bilingual translator.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    throw new Error(`OpenRouter error ${r.status}: ${msg || r.statusText}`);
  }
  const data = await r.json();
  const out = data?.choices?.[0]?.message?.content;
  if (!out || typeof out !== 'string') throw new Error('Invalid translation response');
  return out.trim();
}

// ─── Auth helper ───
async function getAuth(request, DB, env) {
  const header = request.headers.get('Authorization') || '';
  const code = header.replace('Bearer ', '').trim();
  if (!code) return null;

  // Admin override via secret env var (no DB record needed)
  const adminPw = (env?.ADMIN_PASSWORD || '').trim();
  if (adminPw && code === adminPw) {
    return { id: 0, hospital_name: 'Admin', role: 'admin' };
  }

  const row = await DB.prepare(
    'SELECT id, hospital_name, role, theme_preset, theme_overrides FROM passwords WHERE code = ?'
  ).bind(code).first();
  if (row) {
    await DB.prepare(
      'UPDATE passwords SET last_access = datetime("now") WHERE code = ?'
    ).bind(code).run();
  }
  return row; // { id, hospital_name, role } or null
}

export async function onRequest(context) {
  const { request, env } = context;
  const DB = env.DB;

  // OPTIONS preflight
  if (request.method === 'OPTIONS')
    return new Response(null, { headers: CORS });

  const url = new URL(request.url);
  // Strip /api/ prefix → "auth", "content", "admin/content", "projects/3", etc.
  const path = url.pathname.replace(/^\/api\//, '').replace(/\/$/, '');
  const segments = path.split('/');

  try {
    // ── GET /api/public  (no auth) ─────────────────────────────────────
    // Minimal public config so the lock screen / <title> can be driven from DB.
    if (path === 'public' && request.method === 'GET') {
      const profileRows = await DB.prepare('SELECT key, value FROM profile').all();
      const profile = {};
      profileRows.results.forEach(r => { profile[r.key] = r.value; });
      return json({ profile });
    }

    // ── POST /api/auth ──────────────────────────────────────────────────
    if (path === 'auth' && request.method === 'POST') {
      const { password } = await request.json();
      const adminPw = (env?.ADMIN_PASSWORD || '').trim();
      if (adminPw && (password || '').trim() === adminPw) {
        return json({ hospital: 'Admin', role: 'admin', theme_preset: 'confident', theme_overrides: '' });
      }
      const row = await DB.prepare(
        'SELECT hospital_name, role, theme_preset, theme_overrides FROM passwords WHERE code = ?'
      ).bind(password).first();
      if (!row) return err('รหัสผ่านไม่ถูกต้อง', 401);
      await DB.prepare(
        'UPDATE passwords SET last_access = datetime("now") WHERE code = ?'
      ).bind(password).run();
      return json({ hospital: row.hospital_name, role: row.role, theme_preset: row.theme_preset, theme_overrides: row.theme_overrides || '' });
    }

    // ── GET /api/content  (viewer + admin) ─────────────────────────────
    if (path === 'content' && request.method === 'GET') {
      const auth = await getAuth(request, DB, env);
      if (!auth) return err('Unauthorized', 401);

      const [profileRows, projectRows, articleRows] = await Promise.all([
        DB.prepare('SELECT key, value FROM profile').all(),
        DB.prepare('SELECT * FROM projects WHERE visible=1 ORDER BY sort_order').all(),
        DB.prepare('SELECT * FROM articles WHERE published=1 ORDER BY created_at DESC').all(),
      ]);

      const profile = {};
      profileRows.results.forEach(r => { profile[r.key] = r.value; });

      return json({
        profile,
        projects: projectRows.results.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') })),
        articles: articleRows.results,
        role: auth.role,
        hospital: auth.hospital_name,
        theme_preset: auth.theme_preset,
        theme_overrides: auth.theme_overrides || '',
      });
    }

    // ── GET /api/admin/content  (admin only — includes unpublished) ─────
    if (path === 'admin/content' && request.method === 'GET') {
      const auth = await getAuth(request, DB, env);
      if (!auth || auth.role !== 'admin') return err('Admin only', 403);

      const [profileRows, projectRows, articleRows, passwordRows] = await Promise.all([
        DB.prepare('SELECT key, value FROM profile').all(),
        DB.prepare('SELECT * FROM projects ORDER BY sort_order').all(),
        DB.prepare('SELECT * FROM articles ORDER BY created_at DESC').all(),
        DB.prepare('SELECT id, hospital_name, code, role, note, theme_preset, theme_overrides, created_at, last_access FROM passwords ORDER BY created_at').all(),
      ]);

      const profile = {};
      profileRows.results.forEach(r => { profile[r.key] = r.value; });

      return json({
        profile,
        projects: projectRows.results.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') })),
        articles: articleRows.results,
        passwords: passwordRows.results,
        // Allow admin sessions to also receive/apply a theme
        theme_preset: auth.theme_preset || 'confident',
        theme_overrides: auth.theme_overrides || '',
      });
    }

    // ── Admin write routes ──────────────────────────────────────────────
    const auth = await getAuth(request, DB, env);
    if (!auth || auth.role !== 'admin') return err('Admin only', 403);

    // ── POST /api/translate (admin only) ────────────────────────────────
    if (path === 'translate' && request.method === 'POST') {
      const { text, target } = await request.json();
      const translation = await translateViaOpenRouter(env, { text, target: target || 'en' });
      return json({ translation });
    }

    // PUT /api/profile/:key
    if (segments[0] === 'profile' && segments[1] && request.method === 'PUT') {
      const { value } = await request.json();
      await DB.prepare(
        'INSERT OR REPLACE INTO profile (key, value, updated_at) VALUES (?, ?, datetime("now"))'
      ).bind(segments[1], value).run();
      return json({ ok: true });
    }

    // ── Projects ────────────────────────────────────────────────────────
    if (segments[0] === 'projects') {
      const id = segments[1];

      if (!id && request.method === 'POST') {
        const d = await request.json();
        const r = await DB.prepare(
          'INSERT INTO projects (title, title_en, url, image_url, description, description_en, tags, color, sort_order, visible) VALUES (?,?,?,?,?,?,?,?,?,?)'
        ).bind(
          d.title,
          d.title_en || '',
          d.url || '',
          d.image_url || '',
          d.description || '',
          d.description_en || '',
          JSON.stringify(d.tags || []),
          d.color || '#0C7B93',
          d.sort_order || 0,
          1
        ).run();
        return json({ id: r.meta.last_row_id });
      }

      if (id && request.method === 'PUT') {
        const d = await request.json();
        await DB.prepare(
          'UPDATE projects SET title=?,title_en=?,url=?,image_url=?,description=?,description_en=?,tags=?,color=?,sort_order=?,visible=?,updated_at=datetime("now") WHERE id=?'
        ).bind(
          d.title,
          d.title_en || '',
          d.url || '',
          d.image_url || '',
          d.description || '',
          d.description_en || '',
          JSON.stringify(d.tags || []),
          d.color || '#0C7B93',
          d.sort_order ?? 0,
          d.visible ? 1 : 0,
          id
        ).run();
        return json({ ok: true });
      }

      if (id && request.method === 'DELETE') {
        await DB.prepare('DELETE FROM projects WHERE id=?').bind(id).run();
        return json({ ok: true });
      }
    }

    // ── Articles ────────────────────────────────────────────────────────
    if (segments[0] === 'articles') {
      const id = segments[1];

      if (!id && request.method === 'POST') {
        const d = await request.json();
        const r = await DB.prepare(
          'INSERT INTO articles (title, title_en, content, content_en, summary, summary_en, published) VALUES (?,?,?,?,?,?,?)'
        ).bind(
          d.title,
          d.title_en || '',
          d.content || '',
          d.content_en || '',
          d.summary || '',
          d.summary_en || '',
          d.published ? 1 : 0
        ).run();
        return json({ id: r.meta.last_row_id });
      }

      if (id && request.method === 'PUT') {
        const d = await request.json();
        await DB.prepare(
          'UPDATE articles SET title=?,title_en=?,content=?,content_en=?,summary=?,summary_en=?,published=?,updated_at=datetime("now") WHERE id=?'
        ).bind(
          d.title,
          d.title_en || '',
          d.content || '',
          d.content_en || '',
          d.summary || '',
          d.summary_en || '',
          d.published ? 1 : 0,
          id
        ).run();
        return json({ ok: true });
      }

      if (id && request.method === 'DELETE') {
        await DB.prepare('DELETE FROM articles WHERE id=?').bind(id).run();
        return json({ ok: true });
      }
    }

    // ── Passwords ────────────────────────────────────────────────────────
    if (segments[0] === 'passwords') {
      const id = segments[1];

      if (!id && request.method === 'POST') {
        const d = await request.json();
        await DB.prepare(
          'INSERT INTO passwords (code, hospital_name, role, note, theme_preset, theme_overrides) VALUES (?,?,?,?,?,?)'
        ).bind(
          d.code,
          d.hospital_name,
          d.role || 'viewer',
          d.note || '',
          d.theme_preset || 'confident',
          d.theme_overrides || ''
        ).run();
        return json({ ok: true });
      }

      if (id && request.method === 'PUT') {
        const d = await request.json();
        await DB.prepare(
          'UPDATE passwords SET hospital_name=?, role=?, note=?, theme_preset=?, theme_overrides=? WHERE id=?'
        ).bind(
          d.hospital_name,
          d.role || 'viewer',
          d.note || '',
          d.theme_preset || 'confident',
          d.theme_overrides || '',
          id
        ).run();
        return json({ ok: true });
      }

      if (id && request.method === 'DELETE') {
        await DB.prepare('DELETE FROM passwords WHERE id=?').bind(id).run();
        return json({ ok: true });
      }
    }

    return err('Not found', 404);

  } catch (e) {
    console.error(e);
    return err(e.message, 500);
  }
}
