# Deployment Guide: Allbirds Storefront & Payload CMS

Dự án gồm 2 phần độc lập:
1. **Frontend Storefront**: React + Vite + TypeScript (SPA tĩnh).
2. **Payload CMS Backend**: Next.js 15 + Payload 3.x + SQLite (Node.js SSR Server).

---

## 1. Deploy Frontend Storefront (Vercel hoặc Cloudflare Pages)

### A. Deploy lên Vercel
1. Kết nối repo GitHub với Vercel.
2. Thiết lập dự án:
   - **Root Directory**: `./` (Root)
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   - `VITE_CMS_URL`: `https://<your-deployed-payload-cms-url>` (hoặc để trống nếu dùng chế độ offline/mock fallback mặc định).
4. `vercel.json` đã được cấu hình tự động rewrite SPA routes về `/index.html`.

### B. Deploy lên Cloudflare Pages
1. Kết nối repo với Cloudflare Pages.
2. Cấu hình Build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Environment Variables:
   - `VITE_CMS_URL`: `https://<your-deployed-payload-cms-url>`
4. File `public/_redirects` đã có sẵn rule `/* /index.html 200` để hỗ trợ SPA routing trên Cloudflare.

---

## 2. Deploy Backend Payload CMS (Node.js / Render / Railway / Fly.io / VPS)

Vì Payload CMS 3.x chạy trên Next.js 15 và sử dụng SQLite local file, cần một môi trường hỗ trợ Node.js container/server có persistent storage (hoặc mount volume cho `payload.db` và `public/media/`).

### Cấu hình môi trường cho CMS:
- **Root Directory**: `payload-cms`
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Environment Variables bắt buộc**:
  - `PAYLOAD_SECRET`: Tạo 1 chuỗi random bảo mật cao (ví dụ: `openssl rand -hex 32`).
  - `NEXT_PUBLIC_SERVER_URL`: URL public của backend CMS (ví dụ: `https://cms.yourdomain.com`).
  - `PORT`: `3000` (hoặc port của platform cấp).
- **Seeding Data ban đầu**:
  - Chạy `npm run seed` một lần để khởi tạo danh mục, sản phẩm, hero banner và materials vào SQLite database.

---

## 3. Local Production Preview

Để test bản build production nội bộ:
```bash
# 1. Build & chạy CMS
cd payload-cms
npm run build
npm run start

# 2. Build & preview storefront
cd ..
npm run build
npm run preview
```
