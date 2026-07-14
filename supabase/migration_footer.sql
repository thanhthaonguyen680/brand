alter table public.store_settings
  add column if not exists footer_description text default 'Thời trang luxury cao cấp — nơi phong cách gặp gỡ sự tinh tế. Mỗi món đồ là một tuyên ngôn về đẳng cấp.',
  add column if not exists footer_explore_links jsonb default '[
    {"label": "Bộ Sưu Tập", "label_en": "Collection", "href": "/products"},
    {"label": "Áo", "label_en": "Tops", "href": "/products?category=ao"},
    {"label": "Quần", "label_en": "Bottoms", "href": "/products?category=quan"},
    {"label": "Đầm & Váy", "label_en": "Dresses & Skirts", "href": "/products?category=dam-vay"},
    {"label": "Phụ Kiện", "label_en": "Accessories", "href": "/products?category=phu-kien"}
  ]'::jsonb,
  add column if not exists footer_support_links jsonb default '[
    {"label": "Tài Khoản", "label_en": "Account", "href": "/account"},
    {"label": "Liên Hệ", "label_en": "Contact Us", "href": "mailto:info@kha.vn"},
    {"label": "Chính Sách Đổi Trả", "label_en": "Return Policy", "href": "#"},
    {"label": "Hướng Dẫn Size", "label_en": "Size Guide", "href": "#"},
    {"label": "Vận Chuyển", "label_en": "Shipping", "href": "#"}
  ]'::jsonb,
  add column if not exists footer_copyright text default '© 2026 KHA. All rights reserved.',
  add column if not exists footer_payment_text text default 'Thanh toán an toàn với Chuyển Khoản, PayPal & COD';
