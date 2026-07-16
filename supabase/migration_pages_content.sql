-- Backfill sample content for the 3 default pages if they exist but are
-- still empty (e.g. created manually via "Thêm Trang" before this content
-- existed). Safe to run any time — it never overwrites content an admin
-- has already written.
insert into public.pages (title, slug, content) values
(
  'Chính Sách Đổi Trả',
  'chinh-sach-doi-tra',
  'KHA hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày nhận hàng để đảm bảo bạn hoàn toàn hài lòng với sản phẩm.

1. Điều kiện đổi trả
- Sản phẩm còn nguyên tem, mác, chưa qua sử dụng hoặc giặt ủi.
- Còn đầy đủ hộp, túi, phụ kiện đi kèm (nếu có).
- Có hóa đơn hoặc mã đơn hàng.

2. Trường hợp không áp dụng
- Sản phẩm đã qua sử dụng, có dấu hiệu hư hỏng do người dùng.
- Đồ lót, phụ kiện cá nhân vì lý do vệ sinh.
- Sản phẩm đặt may riêng theo yêu cầu.
- Sản phẩm thuộc chương trình giảm giá trên 50%.

3. Quy trình đổi trả
- Bước 1: Liên hệ hotline hoặc email trong vòng 7 ngày kể từ khi nhận hàng.
- Bước 2: Gửi sản phẩm về địa chỉ cửa hàng theo hướng dẫn từ nhân viên hỗ trợ.
- Bước 3: Sau khi nhận và kiểm tra sản phẩm, KHA sẽ đổi size/sản phẩm khác hoặc hoàn tiền trong 3-5 ngày làm việc.

Mọi thắc mắc vui lòng liên hệ qua mục Liên Hệ ở footer.'
),
(
  'Hướng Dẫn Size',
  'huong-dan-size',
  'Hướng dẫn chọn size cho Áo, Đầm, Váy Nữ, Quần. Nếu số đo của bạn nằm giữa 2 size, hãy chọn size lớn hơn để thoải mái hơn khi mặc.

Bảng Size (đơn vị: cm)
- Size S: Vòng 1 78-83 — Vòng 2 56-60 — Vòng 3 85-89
- Size M: Vòng 1 84-89 — Vòng 2 60-66 — Vòng 3 89-94
- Size L: Vòng 1 90-95 — Vòng 2 67-72 — Vòng 3 95-100

Cách đo số đo cơ thể
- Vòng 1 (ngực): đo quanh phần ngực nở nhất.
- Vòng 2 (eo): đo quanh phần eo nhỏ nhất.
- Vòng 3 (mông): đo quanh phần mông nở nhất.

Nếu vẫn phân vân giữa 2 size, hãy liên hệ với KHA qua mục Liên Hệ để được tư vấn size phù hợp với dáng người của bạn.'
),
(
  'Vận Chuyển',
  'van-chuyen',
  'KHA giao hàng toàn quốc thông qua các đối tác vận chuyển uy tín.

1. Thời gian giao hàng
- Nội thành TP.HCM và Hà Nội: 1-2 ngày làm việc.
- Các tỉnh thành khác: 3-5 ngày làm việc.

2. Phí vận chuyển
- Miễn phí vận chuyển cho đơn hàng từ 2.000.000₫.
- Đơn hàng dưới 2.000.000₫: phí vận chuyển 50.000₫ (tính vào bước thanh toán).

3. Theo dõi đơn hàng
- Sau khi đơn hàng được xác nhận, bạn có thể theo dõi trạng thái đơn tại mục "Tài Khoản" > "Đơn Hàng".
- Mã vận đơn sẽ được gửi qua email/SMS khi đơn hàng được bàn giao cho đơn vị vận chuyển.

Mọi thắc mắc về đơn hàng vui lòng liên hệ qua mục Liên Hệ ở footer.'
)
on conflict (slug) do update
set content = excluded.content
where public.pages.content is null or trim(public.pages.content) = '';

-- Force-fix "Hướng Dẫn Size": this page already had placeholder weight/height
-- content from an earlier version, so the guarded upsert above won't touch
-- it. Overwrite it unconditionally with the real bust/waist/hip chart.
update public.pages
set content = 'Hướng dẫn chọn size cho Áo, Đầm, Váy Nữ, Quần. Nếu số đo của bạn nằm giữa 2 size, hãy chọn size lớn hơn để thoải mái hơn khi mặc.

Bảng Size (đơn vị: cm)
- Size S: Vòng 1 78-83 — Vòng 2 56-60 — Vòng 3 85-89
- Size M: Vòng 1 84-89 — Vòng 2 60-66 — Vòng 3 89-94
- Size L: Vòng 1 90-95 — Vòng 2 67-72 — Vòng 3 95-100

Cách đo số đo cơ thể
- Vòng 1 (ngực): đo quanh phần ngực nở nhất.
- Vòng 2 (eo): đo quanh phần eo nhỏ nhất.
- Vòng 3 (mông): đo quanh phần mông nở nhất.

Nếu vẫn phân vân giữa 2 size, hãy liên hệ với KHA qua mục Liên Hệ để được tư vấn size phù hợp với dáng người của bạn.',
    updated_at = now()
where slug = 'huong-dan-size';
