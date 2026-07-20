export type MenuItem = {
  label: string
  label_en: string
  href: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export type Page = {
  id: string
  title: string
  slug: string
  content: string | null
  created_at: string
  updated_at: string
}

export type ProductSize = {
  size: string
  stock: number
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_price: number | null
  images: string[]
  category_id: string | null
  category?: Category
  stock: number
  sizes: ProductSize[]
  sku: string | null
  status: 'active' | 'draft' | 'archived'
  featured: boolean
  is_new: boolean
  on_sale: boolean
  allow_preorder: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'bank_transfer' | 'paypal' | 'cod'

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product?: Product
  quantity: number
  price: number
  product_name: string
  product_image: string | null
  size: string | null
}

export type ShippingAddress = {
  full_name: string
  phone: string
  email: string
  address: string
  city: string
  district: string
  ward: string
  country: string
}

export type Order = {
  id: string
  order_number: string
  user_id: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  subtotal: number
  shipping_fee: number
  discount: number
  total: number
  shipping_address: ShippingAddress
  notes: string | null
  items?: OrderItem[]
  created_at: string
  updated_at: string
}

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'customer' | 'admin'
  created_at: string
}

export type Campaign = {
  id: string
  name: string
  description: string | null
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo'
  value: number
  code: string | null
  min_order_value: number
  max_uses: number | null
  uses_count: number
  start_date: string
  end_date: string | null
  status: 'active' | 'inactive' | 'expired'
  created_at: string
}

export type StoreSettings = {
  id: string
  store_name: string
  logo_url: string | null
  favicon_url: string | null
  banner_url: string | null
  banner_text: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  font_heading: string
  font_body: string
  hero_badge: string | null
  hero_title: string
  hero_title_image_url: string | null
  hero_subtitle: string
  hero_image_url: string | null
  hero_images: string[]
  hero2_title: string | null
  hero2_subtitle: string | null
  hero2_image_url: string | null
  hero2_cta: string | null
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  social_instagram: string | null
  social_facebook: string | null
  menu_items: MenuItem[] | null
  about_title: string | null
  about_content: string | null
  about_image_url: string | null
  popup_enabled: boolean
  popup_title: string | null
  popup_description: string | null
  bank_name: string | null
  bank_account_number: string | null
  bank_account_holder: string | null
  bank_qr_url: string | null
  paypal_account: string | null
  footer_description: string | null
  footer_explore_links: MenuItem[] | null
  footer_support_links: MenuItem[] | null
  footer_copyright: string | null
  footer_payment_text: string | null
  member_banner_enabled: boolean
  updated_at: string
}

export type Lead = {
  id: string
  name: string
  phone: string
  created_at: string
}

export type CartItem = {
  product: Product
  quantity: number
  size: string | null
}
