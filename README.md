# Portfolio Pro — ขั้นตอน Deploy

## สิ่งที่ต้องมี
- Node.js 18+
- Cloudflare account (free tier ได้)
- Wrangler CLI: `npm install -g wrangler`

---

## ขั้นตอน 1: สร้าง D1 Database

```bash
wrangler login
wrangler d1 create portfolio-db
```

คัดลอก `database_id` ที่ได้ ไปใส่ใน `wrangler.toml`

---

## ขั้นตอน 2: รัน Schema

```bash
# Remote (production)
wrangler d1 execute portfolio-db --file=schema.sql --remote

# Local (ทดสอบ)
wrangler d1 execute portfolio-db --file=schema.sql
```

---

## ขั้นตอน 3: ทดสอบ local

```bash
npm install
npm run build
wrangler pages dev dist --d1=DB=portfolio-db
```

เปิด http://localhost:8788
รหัส admin เริ่มต้น: **admin1234** (เปลี่ยนทันทีหลัง deploy!)

---

## ขั้นตอน 4: Deploy

### วิธีที่ 1 — Wrangler CLI
```bash
npm run build
wrangler pages deploy dist
```

### วิธีที่ 2 — GitHub + Cloudflare Pages (แนะนำ)
1. Push โค้ดไป GitHub repo
2. เข้า Cloudflare Dashboard → Pages → Create Project
3. เชื่อม GitHub repo
4. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
5. ไป Settings → Functions → D1 Bindings
   - Variable name: `DB`
   - Database: `portfolio-db`

---

## การจัดการรหัสผ่าน

เข้า login ด้วยรหัส `admin1234` → แท็บ **⚙ Admin**

| รพ. | รหัส | Role |
|-----|------|------|
| Admin | admin1234 | admin |
| รพ.รามา | rama2025 | viewer |
| รพ.พระมงกุฎ | pmk2025 | viewer |

สร้าง/ลบรหัสได้ทันทีจาก Admin Panel — ไม่ต้องแก้โค้ด

---

## ระบบ
- Frontend: React + Vite → Cloudflare Pages
- Backend: Cloudflare Pages Functions (`functions/api/[[route]].js`)
- Database: Cloudflare D1 (SQLite)
- Auth: Bearer token (password) → validate ใน D1 ทุก request
- Session: sessionStorage (ปิด browser = logout)
