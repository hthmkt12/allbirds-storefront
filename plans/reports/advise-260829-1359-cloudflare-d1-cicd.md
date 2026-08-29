# Technical Advisory Report: CI/CD Pipeline & Cloudflare D1 Deployment

- **Ngày lập**: 2026-08-29
- **Trạng thái**: Hoàn tất tư vấn
- **Chủ đề**: Tự động hóa GitHub Actions cho EmDash Backend (Cloudflare Workers + D1 SQLite)

---

## 1. Verdict

Thiết lập pipeline **GitHub Actions** tự động hóa quy trình `Test` → `Build Astro Worker` → `Apply D1 Migrations` → `Wrangler Deploy` là giải pháp tối ưu, tin cậy và không rủi ro cho EmDash Backend. 

Tách biệt hoàn toàn `migrations/` (chạy tự động trong CI) và `seed-d1.sql` (chạy thủ công 1 lần qua CLI) giúp bảo vệ dữ liệu đơn hàng và catalog thực tế trên production khỏi nguy cơ bị ghi đè.

---

## 2. Việc NÊN làm (What you should do)

1. **Thiết lập GitHub Secrets**:
   - `CLOUDFLARE_API_TOKEN`: Token có quyền `Workers Scripts:Edit`, `D1:Edit`, `Account Settings:Read`.
   - `CLOUDFLARE_ACCOUNT_ID`: Account ID trên Cloudflare Dashboard.
2. **Tạo GitHub Actions Workflow (`.github/workflows/deploy-backend.yml`)**:
   - Sử dụng action chính thức `cloudflare/wrangler-action@v3`.
   - Chạy tuần tự:
     - Cài đặt dependencies (`npm ci`).
     - Chạy test và typecheck.
     - Chạy migration D1 remote: `wrangler d1 execute allbirds-emdash-db --remote --file=migrations/0001_content_tables.sql` và `0002_orders_tables.sql`.
     - Deploy Worker: `wrangler deploy`.
3. **Thực hiện Seed Catalog 1 lần duy nhất từ CLI**:
   - `npx wrangler d1 execute allbirds-emdash-db --remote --file=scripts/seed-d1.sql`.
4. **Bật Edge Caching cho Content APIs**:
   - Thêm `Cache-Control: public, max-age=300, s-maxage=3600` tại các API GET để tối đa hóa tốc độ phản hồi và giảm số lượng read requests vào D1.

---

## 3. Việc KHÔNG NÊN làm (What you shouldn't do)

1. **Không đưa lệnh seed data vào file workflow CI/CD**:
   - Tránh việc mỗi lần push code lên nhánh master lại chạy lại lệnh chèn dữ liệu mẫu gây xung đột ID hoặc ghi đè dữ liệu mới.
2. **Không lưu cứng token Cloudflare trong repository**:
   - Không commit file `.env`, `.dev.vars` hoặc secret vào git.
3. **Không deploy khi test hoặc build chưa pass**:
   - Cấu hình pipeline dừng ngay lập tức (fail-fast) nếu bước `npm test` hoặc `npm run build` gặp lỗi.

---

## 4. Work Checklist & Success Metrics

### Work Checklist
- [ ] **Bước 1**: Tạo GitHub Secrets `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID` trong repository settings.
- [ ] **Bước 2**: Tạo file `.github/workflows/deploy-backend.yml` trong codebase.
- [ ] **Bước 3**: Chạy seed data thủ công 1 lần lên D1 remote qua Wrangler CLI.
- [ ] **Bước 4**: Push code lên nhánh master để kích hoạt pipeline deploy tự động.

### Success Metrics
1. **Pipeline Execution Time**: Toàn bộ quy trình CI/CD hoàn tất trong `< 90s`.
2. **Zero Manual Migration**: Schema D1 tự động cập nhật đồng bộ với code backend khi merge.
3. **Live Endpoint Health**: `https://allbirds-emdash-backend.worldnew.workers.dev/api/products` trả về 200 kèm danh sách 8 sản phẩm.
4. **Data Isolation**: Dữ liệu đơn hàng mới tạo qua `POST /api/orders` không bị ảnh hưởng sau các lần deploy tiếp theo.
