# Technical Advice: Codebase Optimization & Lazy Loading

- **Date:** 2026-08-29
- **Scope:** Storefront Bundle Optimization & Stability

## 1. Verdict
App hiện đóng gói toàn bộ `CheckoutView`, `SearchDialog`, `AccountDrawer`, `HelpDrawer`, `WishlistDrawer` vào một file `index-BDQ_7u_N.js` (278 kB thô). Khách truy cập lần đầu chỉ duyệt sản phẩm nhưng phải tải toàn bộ logic checkout và các modal hiếm khi dùng. Giải pháp tối ưu: **Code-splitting thông qua `React.lazy` + `Suspense` cho các Drawers và CheckoutView**.

## 2. Việc nên làm (Do)
1. Chuyển `CheckoutView` thành `React.lazy(() => import('./components/checkout/checkout-view'))`.
2. Chuyển các non-critical Drawers/Dialogs (`SearchDialog`, `AccountDrawer`, `HelpDrawer`, `WishlistDrawer`) sang dynamic imports.
3. Bọc fallback UI nhẹ/trong suốt (hoặc null) bằng `<Suspense fallback={null}>` tại các vị trí mount.
4. Giữ nguyên toàn bộ logic state, hooks (`useWishlist`, `useDrawerA11y`) và contract hiện tại.
5. Chạy `npm test` và `npm run build` xác nhận chunking thành công và test pass 100%.

## 3. Việc không nên làm (Don't)
1. Không lạm dụng code splitting xuống từng nút hay component con nhỏ gây giật layout (layout shift) hoặc overhead request HTTP.
2. Không thay đổi cấu trúc state management toàn cục hoặc cơ chế routing hiện tại khi chưa có yêu cầu.
3. Không bỏ qua fallback `Suspense` gây lỗi crash runtime khi chunk đang tải qua mạng chậm.

## 4. Lộ trình thực hiện & Tiêu chí nghiệm thu

### Work Checklist
- [ ] Chuyển đổi `import` tĩnh của `CheckoutView` sang `lazy()` trong `App.tsx`.
- [ ] Chuyển đổi các drawer ít dùng (`SearchDialog`, `AccountDrawer`, `HelpDrawer`, `WishlistDrawer`) sang `lazy()`.
- [ ] Thêm `<Suspense fallback={null}>` bao quanh các component lazy khi render điều kiện.
- [ ] Kiểm tra `npm test` xác nhận 50 test cases không bị ảnh hưởng.
- [ ] Kiểm tra `npm run build` xác nhận Vite sinh ra các file chunk riêng (`CheckoutView-*.js`, `drawers-*.js`).

### Success Metrics
- Main entry chunk (`index-*.js`) giảm dung lượng tối thiểu 15-25%.
- Vite build tạo ra ít nhất 2 dynamic chunks mới.
- 100% test suite (8 test files, 50 tests) tiếp tục PASS.
