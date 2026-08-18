# Advisory Report: Production Hardening, Security & Infrastructure Alignment

**Date**: 2026-08-18  
**Topic**: Allbirds Storefront & Payload CMS Hardening  
**Status**: Confirmed by User

---

## 1. Verdict

Hệ thống Allbirds đã hoàn thiện các tính năng cốt lõi, UI/UX chỉn chu và test suite Playwright E2E rất tốt. Tuy nhiên, trước khi đưa vào môi trường Production thực tế, hệ thống tồn tại 2 lỗ hổng bảo mật và hạ tầng cần xử lý ngay:
1. Endpoint `Orders` mở public read (`access.read: () => true`) gây rò rỉ dữ liệu cá nhân (PII) của khách hàng.
2. Cấu hình volume SQLite và Media uploads trong Docker chưa đồng bộ với runtime Payload CMS, gây rủi ro mất dữ liệu khi restart container.

Giải pháp tối ưu theo triết lý KISS & YAGNI: Giữ nguyên kiến trúc SQLite gọn nhẹ, khóa quyền truy cập Orders cho Admin, bổ sung lookup token cho khách hàng, và đồng bộ hóa đường dẫn lưu trữ Docker volume.

---

## 2. What You Should Do

1. **Khóa quyền đọc Public của Collection Orders**:
   - Sửa `payload-cms/src/collections/Orders.ts`:
     - `read`: Chỉ cho phép `Boolean(req.user)` (Admin đã đăng nhập).
     - `create`: Giữ `() => true` để Storefront tạo đơn hàng.
2. **Bổ sung Order Confirmation Token**:
   - Thêm field `orderToken` (UUID/random string) được sinh tự động khi tạo Order.
   - Thêm custom endpoint hoặc query logic để khách chỉ xem được đơn hàng khi có cặp `id + orderToken`.
3. **Đồng bộ hóa Docker Volume & Paths**:
   - Trong `payload.config.ts`, trỏ đường dẫn SQLite DB qua biến môi trường:
     ```ts
     const dbPath = process.env.DATABASE_PATH || path.resolve(dirname, '../payload.db')
     ```
   - Đảm bảo `docker-compose.yml` cấu hình `DATABASE_PATH=/app/data/payload.db`.
4. **Bảo mật Secret Key**:
   - Cấm fallback secret yếu trong môi trường `NODE_ENV=production`. Throw exception nếu thiếu `PAYLOAD_SECRET`.
5. **Cập nhật E2E Tests**:
   - Kiểm tra các bài test E2E (Tier 5 / Checkout) để đảm bảo luồng tạo đơn và xác nhận đơn hoạt động trơn tru với access rule mới.

---

## 3. What You Shouldn't Do

- **Không xây dựng hệ thống Customer Auth cồng kềnh**: Khách hàng mua sắm dưới dạng Guest Checkout không cần ép tạo tài khoản/password phức tạp.
- **Không vội migrate sang PostgreSQL/Cloud DB**: Hiện tại lưu lượng và phạm vi đơn giản, SQLite đáp ứng tốt, không cần tốn chi phí vận hành DB server độc lập.
- **Không can thiệp sâu vào luồng Storefront Fallback**: Cơ chế 2s timeout fallback về Mock/LocalStorage đang chạy rất ổn định, giữ nguyên kiến trúc này.

---

## 4. What Could Be Better / More Efficient

1. **Client Cache Invalidation**:
   - Bổ sung TTL 5 phút cho `cms-client.ts` thay vì giữ cache promise vĩnh viễn.
2. **Automated SQLite Backup Script**:
   - Bổ sung cron task / bash script sao lưu file `payload.db` định kỳ vào thư mục backup hoặc cloud storage.

---

## 5. Work Checklist & Success Metrics

### Work Checklist
- [ ] Sửa `payload-cms/src/collections/Orders.ts` (Khóa `read`, thêm `orderToken`).
- [ ] Thêm validation / middleware chặn leak PII đơn hàng.
- [ ] Cập nhật `payload.config.ts` hỗ trợ biến môi trường `DATABASE_PATH`.
- [ ] Cập nhật `docker-compose.yml` để map đúng volume SQLite và Media uploads.
- [ ] Chạy lại `npm run build` toàn dự án.
- [ ] Chạy toàn bộ test suite Playwright (`e2e-tests`) và Vitest để verify chất lượng.

### Success Metrics
- **PII Leak Guard**: Gọi `GET http://localhost:3000/api/orders` không có header Auth trả về `401 Unauthorized` hoặc mảng rỗng.
- **Order Placement**: Guest checkout thành công, nhận về Order ID + Order Token hợp lệ.
- **Data Persistence**: Khởi động lại container Docker, dữ liệu `payload.db` và media không bị mất.
- **Test Suite**: 100% Vitest unit tests và Playwright E2E tests PASS.
