# Advisory Report: Allbirds UI/UX Modernization via Stitch Design Specification

**Type:** Architecture & Design System Advisory  
**Date:** 2026-09-04  
**Project:** Allbirds Storefront  
**Status:** Ready for Implementation  

---

## 1. Verdict

Storefront Allbirds hiện tại có bộ khung chức năng tốt (React 19 + Vite + EmDash backend), nhưng phần visual presentation đang ở mức prototype: hệ thống CSS thiếu token phân tầng (depth/elevation), chỉ dùng một vài biến màu cơ bản, thẻ sản phẩm phẳng lì, nút bấm và drawer chuyển động giật cục. 

Việc áp dụng triết lý **Stitch specification (9 phần từ `VoltAgent/awesome-design-md`)** để tạo file `DESIGN.md` chuẩn hóa kết hợp mở rộng CSS tokens trực tiếp trong `src/styles.css` là giải pháp tối ưu nhất:
- Không thêm bất kỳ thư viện UI ngoài (0 dependency overhead, 0 KB bundle bloat).
- Thiết lập chuẩn SSOT (Single Source of Truth) cho cả developer và AI coding agent.
- Nâng tầm giao diện từ "prototype" lên chuẩn "D2C luxury retail" (vibe Allbirds, Totême, Apple) mà vẫn bảo toàn 100% logic kinh doanh và backend bindings hiện hữu.

---

## 2. Reframed Scope & Objectives

### Exact Requirements
1. **Thiết lập `DESIGN.md`**: Tuân thủ chuẩn 9 phần (Stitch spec) từ repo `awesome-design-md`, bao quát:
   - Visual Theme & Atmosphere (Warm Organic Minimalist, Zen, Tactile).
   - Color Palette & Semantic Roles (Canvas, Charcoal, Sand, Oat, Sage, Forest, Terracotta, Focus ring).
   - Typography Rules (Playfair Display cho editorial heading + Geograph/Inter cho technical/data).
   - Component Stylings (Buttons, Cards, Inputs, Badges, Drawers, Modals).
   - Layout & Spacing (8pt soft grid, container bounds 1280px).
   - Depth & Elevation (Warm ambient shadows, layered surfaces, không dùng harsh black drop-shadows).
   - Do's and Don'ts (Guarding brand DNA).
   - Responsive Behavior (Mobile-first touch target >= 44px, drawer sheet docking).
   - Agent Prompt Guide (Ready-to-use color tables & prompts cho LLM).
2. **Nâng cấp bộ CSS Tokens trong `src/styles.css`**:
   - Thêm `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-drawer` với ambient warm tints (`rgba(33, 33, 33, 0.06)`).
   - Thêm token chuyển động `--ease-out-spring: cubic-bezier(0.16, 1, 0.3, 1)` và `--duration-fast/normal/slow`.
   - Thêm semantic surface tokens: `--surface-default`, `--surface-subtle`, `--surface-overlay`, `--surface-raised`.
3. **Refactor Visuals & Micro-interactions**:
   - **Header & Navbar**: Hiệu ứng backdrop-filter (frosted glass tinh tế), pill-buttons hover states có micro-lift (-1px), active scale.
   - **Product Cards**: Thêm subtle hover zoom cho ảnh sản phẩm (`scale(1.03)`), swatch selection pill rõ ràng, price tag & badge nổi bật.
   - **Drawers (Cart/Wishlist/Account/Help)**: Nâng cấp header, backdrop overlay mượt mà, layout item có phân cách line tự nhiên, empty-state trau chuốt.
   - **Modals & Search Dialog**: Animation fade-in + scale-up tự nhiên, input search tối giản đẳng cấp.

### Non-Goals
- Không cài đặt Tailwind CSS, MUI, Chakra hay các runtime CSS-in-JS.
- Không thay đổi router, business logic trong cart/checkout/account/EmDash adapter.
- Không thay đổi cấu trúc dữ liệu schema của sản phẩm hoặc API endpoints.

---

## 3. What You Should Do (Phải Làm)

1. **Viết file `DESIGN.md` ở thư mục gốc**:
   - Đóng vai trò là cẩm nang thiết kế chuẩn của Allbirds, giúp cả agent và developer đọc hiểu ngay visual token và styling guardrails.
2. **Mở rộng `:root` trong `src/styles.css`**:
   - Bổ sung đầy đủ 5 tầng token: Colors (semantic), Typography (scale + line-height), Radii, Elevation (ambient shadows), Transitions (spring curves).
3. **Sửa các điểm nghẽn UI trong components**:
   - `src/components/cart-drawer.tsx` & `account-drawer.tsx`: Nâng cấp typography, nút tăng giảm số lượng, spacing thanh thoát.
   - `src/components/product-detail-view.tsx`: Cải thiện image gallery layout, size selector grid (pill bo tròn hoàn hảo, active ring rõ nét).
   - `src/styles.css`: Thay thế các viền `1px solid var(--charcoal)` cứng nhắc ở một số chỗ bằng `var(--line)` hoặc `--line-subtle` để giao diện mềm mại, thở được.
4. **Kiểm thử nghiệm thu (Verification Gate)**:
   - Chạy `npm run build` xác nhận không có lỗi TypeScript hay cú pháp CSS.
   - Kiểm tra E2E/Playwright (`npm run test:e2e` hoặc preview) để bảo đảm không bị layout shift làm vỡ flow mua hàng.

---

## 4. What You Shouldn't Do (Cần Tránh)

1. **Không lạm dụng Drop Shadow đen kịt (`rgba(0, 0, 0, 0.25)`)**: Allbirds là thương hiệu len, len cừu, gỗ balsa và mía đường — phong cách cần sự ấm áp (warm tones), viền mềm, bóng đổ khuếch tán diện rộng (diffused ambient tint).
2. **Không dùng animation lòe loẹt hoặc quá nhanh**: Tránh các chuyển động giật kiểu gaming/crypto. Sử dụng spring curves êm ái, thời gian chuyển từ 200ms - 350ms.
3. **Không hard-code giá trị inline style**: Mọi màu sắc, border-radius, khoảng cách phải bám theo biến CSS token đã định nghĩa trong `DESIGN.md`.
4. **Không làm vỡ responsive mobile**: Đảm bảo tất cả touch targets (nút chọn size, nút đóng drawer, nút thêm giỏ) tối thiểu 44x44px.

---

## 5. What Could Be Better / More Efficient

1. **Hiệu năng CSS**: Giữ toàn bộ token trong CSS Custom Properties thuần giúp trình duyệt render GPU-accelerated mượt mà, không tốn thời gian parse JS hay CSS-in-JS runtime.
2. **Single Source of Truth**: Cặp bài trùng `DESIGN.md` (cho AI reasoning/scouting) + `src/styles.css` (cho code execution) giúp loại bỏ triệt để tình trạng lệch chuẩn thiết kế (design drift) khi nhiều agent hoặc developer cùng tham gia dự án.
3. **Micro-interactions giá trị cao**: Tập trung vào 3 điểm chạm cốt lõi nhất của người dùng e-commerce:
   - Hover & Click Product Card (tạo hứng thú thị giác).
   - Chọn Size & Color (rõ ràng, không gây nhầm lẫn).
   - Mở Drawer Giỏ hàng & Checkout CTA (tạo cảm giác tin cậy và thúc đẩy chuyển đổi).

---

## 6. Recommended Execution Path (Lộ trình chi tiết)

```text
Phase 1: Khởi tạo DESIGN.md (Chuẩn Stitch 9 phần)
   ↓
Phase 2: Nâng cấp Hệ thống Token trong src/styles.css
   ↓
Phase 3: Tinh chỉnh Visual Components (Header, Cards, Sections, Drawers, Modals)
   ↓
Phase 4: Build Verification & Playwright Visual Regression Check
```

### Phase 1: Tạo `DESIGN.md`
- Soạn thảo `DESIGN.md` tại thư mục gốc của repository với đầy đủ 9 chương theo Stitch spec.
- Định hình cụ thể các mã màu Allbirds:
  - `--charcoal`: `#212121`
  - `--canvas`: `#FFFFFF`
  - `--sand`: `#E0DACF`
  - `--oat`: `#ECE9E2`
  - `--sage`: `#D4D9CF`
  - `--terracotta`: `#D1B0A4`
  - `--line`: `#E5E0D8`
  - `--line-focus`: `#212121`

### Phase 2: Refactor CSS Tokens
- Cập nhật khối `:root` trong `src/styles.css`.
- Thêm classes tiện ích cho layout (`.surface-raised`, `.ambient-shadow`, `.smooth-transition`).

### Phase 3: Nâng cấp Components
- Điều chỉnh card hover, image scale, button click ripple/press-down.
- Tinh chỉnh typography hierarchy cho các heading và giá tiền.

### Phase 4: Kiểm thử
- Chạy `npm run build` để kiểm tra build output.
- Kiểm tra trực quan trên trình duyệt desktop và mobile viewport.

---

## 7. Benefits & Trade-offs

### Benefits
- **Giao diện đẳng cấp**: Đưa storefront đạt mức hoàn thiện ngang tầm các website D2C quốc tế cao cấp.
- **Tương thích hoàn hảo với AI**: Agent khi phát triển tính năng mới chỉ cần đọc `DESIGN.md` là có thể viết HTML/CSS khớp 100% ngôn ngữ thiết kế của dự án.
- **Nhẹ & Nhanh**: Giữ nguyên zero-runtime CSS, không tăng tải CPU/network của khách hàng.

### Trade-offs & Rủi ro
- Cần rà soát kỹ các selectors trong `src/styles.css` để tránh phá vỡ giao diện của các drawer hay modal vốn đang phụ thuộc vào vị trí layout hiện tại.
- *Điều kiện khi đề xuất này không còn phù hợp*: Nếu dự án sau này muốn chuyển sang một full design system component library lớn (như Radix UI / shadcn/ui), lúc đó sẽ cần migrate từ CSS thuần sang Tailwind. Hiện tại với cấu trúc hiện có, CSS thuần là nhẹ nhất và an toàn nhất.

---

## 8. Work Checklist & Success Metrics

### Work Checklist
- [ ] Soạn thảo và lưu file `DESIGN.md` chuẩn Stitch specification tại root project.
- [ ] Nâng cấp `:root` token trong `src/styles.css` (Shadows, Surfaces, Timing, Radii).
- [ ] Refactor Navigation Bar & Floating Header (frosted glass + smooth hover).
- [ ] Refactor Product Cards & Grid (subtle zoom, refined borders, badges).
- [ ] Refactor Drawers (Cart, Wishlist, Account, Help) với visual depth và padding chuẩn.
- [ ] Refactor Product Detail View & Size Guide Modal (active states sắc nét, typography thoáng).
- [ ] Chạy lệnh `npm run build` kiểm tra toàn diện lỗi biên dịch.

### Success Metrics
- **Build Clean**: `npm run build` thành công, 0 lỗi TypeScript, 0 lỗi Vite bundling.
- **Visual Depth Index**: 100% các thành phần nổi (drawers, modals, floating nav) sử dụng token ambient shadow thay vì viền thô hoặc bóng đen phẳng.
- **Design Tokens Adherence**: 0 giá trị màu sắc hay box-shadow hardcode ngoài bảng token trong `DESIGN.md`.
- **Responsive Performance**: Đạt 60 FPS mượt mà trên mobile và desktop khi kéo cuộn và mở drawer.
