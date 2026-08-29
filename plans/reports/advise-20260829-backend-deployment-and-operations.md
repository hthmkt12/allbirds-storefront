# Technical Advisory Report: Triển khai & Vận hành EmDash Backend trên Cloudflare Workers + D1

- **Ngày lập**: 2026-08-29
- **Trạng thái**: Hoàn tất tư vấn
- **Chủ đề**: Triển khai, CI/CD, Quản lý D1 Database và Bảo mật Vận hành

---

## 1. Verdict (Đánh giá tổng quan)

Việc chuyển dịch backend sang **Astro trên Cloudflare Workers + D1 SQLite** là quyết định tối ưu về chi phí (Zero Cold Start, Global Edge, miễn phí D1 quota ban đầu). Kiến trúc backend không trạng thái (stateless) kết hợp D1 Database binding trực tiếp giúp giảm độ trễ truy vấn xuống mức microsecond. 

Quy trình triển khai tự động qua **GitHub Actions CI/CD** kết hợp **Migration tự động & Seed thủ công 1 lần** là chuẩn vận hành an toàn nhất, tránh rủi ro ghi đè dữ liệu đơn hàng hoặc catalog tùy chỉnh trên production.

---

## 2. Việc NÊN làm (What you should do)

1. **Thiết lập GitHub Actions Workflow (`.github/workflows/deploy-backend.yml`)**:
   - Sử dụng `cloudflare/wrangler-action` với secret `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID`.
   - Pipeline chuẩn: `Build Astro` → `Run D1 Migrations (0001, 0002)` → `Wrangler Deploy`.
2. **Quản lý D1 Database Binding**:
   - Khai báo D1 database ID (`cff34541-1547-4da2-8a2d-199f111ef5a8`) trong `wrangler.jsonc` hoặc `wrangler.toml`.
   - Sử dụng prepared statements (`.bind()`) và batch transaction (`db.batch()`) như đã cài đặt trong code để đảm bảo ACID khi tạo đơn.
3. **Bảo mật & Rate Limiting**:
   - Bật Cloudflare Free WAF Rate Limiting cho endpoint `POST /api/orders` (tối đa 5 req/phút/IP) để chống spam đơn hàng.
   - Bật Cloudflare Automatic HTTPS Rewrites và HSTS.
4. **CORS & Cache Control**:
   - Cấu hình Cache-Control header cho 6 Content GET routes (`public, max-age=300, s-maxage=3600`) để tận dụng Cloudflare CDN Edge Caching, giảm tải D1 read operations.

---

## 3. Việc KHÔNG NÊN làm (What you shouldn't do)

1. **Không tự động chạy seed script trên mỗi lần deploy**:
   - Chạy `seed-d1.sql` lặp lại sẽ reset ID tự tăng và có nguy cơ ghi đè các cập nhật catalog thực tế. Chỉ chạy seed 1 lần khi khởi tạo database mới.
2. **Không để lộ `CLOUDFLARE_API_TOKEN` hoặc Secret trong code**:
   - Không commit file `.env` chứa token Cloudflare vào repository.
3. **Không gọi D1 tuần tự trong vòng lặp**:
   - Tránh việc execute từng câu lệnh `INSERT` riêng lẻ cho từng item trong đơn hàng; luôn gom vào `db.batch([...])`.

---

## 4. Giải pháp Tối ưu & Tiết kiệm Chi phí (Cost & Efficiency)

- **Edge Caching cho Content APIs**:
  Nội dung catalog (Hero, Categories, Products, Promo Tiles, Materials, Reviews) thay đổi ít. Thêm header `Cache-Control` tại Worker giúp Cloudflare Cache phục vụ 99% request trực tiếp từ RAM của Data Center gần người dùng nhất mà không tốn D1 Read unit.
- **Wrangler Environments**:
  Tách `preview` (dùng D1 local hoặc test DB) và `production` trong file cấu hình `wrangler.jsonc` để test pull request tự động.

---

## 5. Work Checklist (Danh mục hành động bàn giao)

- [ ] **Tạo GitHub Secret**:
  - `CLOUDFLARE_API_TOKEN` (quyền: Workers Scripts:Edit, D1:Edit, Account Settings:Read).
  - `CLOUDFLARE_ACCOUNT_ID`.
- [ ] **Tạo Workflow Deploy `.github/workflows/deploy-backend.yml`**:
  - Trigger: `push` nhánh `master` khi thay đổi file trong `emdash-backend/**`.
- [ ] **Chạy Seed ban đầu lên D1 Remote**:
  - `npx wrangler d1 execute allbirds-emdash-db --remote --file=scripts/seed-d1.sql`
- [ ] **Bật Cloudflare Rate Limiting**:
  - Tạo Rule trên Cloudflare Dashboard: Block/Challenge nếu `URI Path eq "/api/orders"` và số lượng request > 5/phút/IP.
- [ ] **Thêm Edge Caching Headers cho Content Routes**:
  - Thêm `Cache-Control: public, max-age=300, s-maxage=3600` vào `src/lib/cors.ts`.

---

## 6. Success Metrics (Tiêu chí đo lường thành công)

1. **API Response Time**: Content APIs trả về `< 50ms` trên toàn cầu nhờ Edge Worker & D1.
2. **Zero-Downtime Deployment**: GitHub Actions deploy hoàn tất trong `< 60s`, không gián đoạn dịch vụ.
3. **Data Integrity**: Đơn hàng tạo qua checkout lưu chính xác trong D1 và tra cứu được ngay lập tức qua `orderToken`.
4. **Storefront Real Content**: Storefront hiển thị dữ liệu thật từ Worker API, console không còn cảnh báo fallback mock data.
