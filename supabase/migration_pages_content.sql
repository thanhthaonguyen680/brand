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
  'Bảng size dưới đây giúp bạn chọn được form dáng vừa vặn nhất. Nếu số đo của bạn nằm giữa 2 size, hãy chọn size lớn hơn để thoải mái hơn khi mặc.

Bảng Size Cho Nữ
- XS: Dưới 38kg — Cao 1m40 - 1m45
- S: 38 - 43kg — Cao 1m45 - 1m53
- M: 43 - 46kg — Cao 1m50 - 1m55
- L: 46 - 53kg — Cao 1m55 - 1m60
- XL: 53 - 58kg — Cao 1m60 - 1m65
- XXL: 58 - 66kg — Cao 1m65 - 1m70

Cách đo số đo cơ thể
- Vòng ngực: đo quanh phần ngực nở nhất.
- Vòng eo: đo quanh phần eo nhỏ nhất.
- Vòng mông: đo quanh phần mông nở nhất.

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
