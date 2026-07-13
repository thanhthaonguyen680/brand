'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StoreSettings } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsImageInput } from '@/components/admin/SettingsImageInput'
import { MenuItem } from '@/lib/types'
import { Plus, Trash2 } from 'lucide-react'

const DEFAULT_SETTINGS: Partial<StoreSettings> = {
  store_name: 'LUXE',
  primary_color: '#1a1a1a',
  secondary_color: '#c9a96e',
  accent_color: '#f5f0e8',
  font_heading: 'Playfair Display',
  font_body: 'Inter',
  hero_title: 'Luxury Redefined',
  hero_subtitle: 'Discover timeless elegance in every piece',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<StoreSettings>>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('store_settings').select('*').eq('id', 1).single()
        if (data) setSettings(data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    setSaveError('')
    const supabase = createClient()
    const { error } = await supabase
      .from('store_settings')
      .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })

    if (error) {
      setSaveError(error.message)
      setSaving(false)
      return
    }

    // Revalidate store pages
    await Promise.all([
      fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/' }) }),
      fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/products' }) }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const update = (key: keyof StoreSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const menuItems: MenuItem[] = (settings.menu_items as MenuItem[]) || []

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    const updated = menuItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setSettings((prev) => ({ ...prev, menu_items: updated }))
  }

  const addMenuItem = () => {
    setSettings((prev) => ({
      ...prev,
      menu_items: [...menuItems, { label: 'Menu mới', label_en: 'New Menu', href: '/products' }],
    }))
  }

  const removeMenuItem = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      menu_items: menuItems.filter((_, i) => i !== index),
    }))
  }

  if (loading) return <div className="text-center py-20 text-neutral-400">Đang tải...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Theme & Cài Đặt</h1>
          <p className="text-neutral-500 text-sm mt-1">Tùy chỉnh giao diện cửa hàng</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button onClick={save} disabled={saving}>
            {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu' : 'Lưu Thay Đổi'}
          </Button>
          {saveError && <p className="text-red-500 text-xs max-w-xs text-right">{saveError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Thông Tin Cửa Hàng</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên cửa hàng</Label>
                <Input value={settings.store_name || ''} onChange={(e) => update('store_name', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email liên hệ</Label>
                  <Input value={settings.contact_email || ''} onChange={(e) => update('contact_email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input value={settings.contact_phone || ''} onChange={(e) => update('contact_phone', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Textarea value={settings.address || ''} onChange={(e) => update('address', e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Trang Chủ (Hero)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Badge text (dòng nhỏ phía trên tiêu đề)</Label>
                <Input value={settings.hero_badge || ''} onChange={(e) => update('hero_badge', e.target.value)} placeholder="Bộ Sưu Tập Mới 2026" />
              </div>
              <div className="space-y-2">
                <Label>Ảnh tiêu đề Hero (logo PNG — ưu tiên hơn chữ)</Label>
                <SettingsImageInput value={settings.hero_title_image_url || ''} onChange={(v) => update('hero_title_image_url', v)} bucket="settings" />
                <p className="text-xs text-neutral-400">Upload ảnh logo PNG nền trong suốt. Nếu để trống sẽ dùng chữ bên dưới.</p>
              </div>
              <div className="space-y-2">
                <Label>Tiêu đề Hero (chữ — dùng khi không có ảnh)</Label>
                <Input value={settings.hero_title || ''} onChange={(e) => update('hero_title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phụ đề Hero</Label>
                <Input value={settings.hero_subtitle || ''} onChange={(e) => update('hero_subtitle', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hình ảnh Hero</Label>
                <SettingsImageInput value={settings.hero_image_url || ''} onChange={(v) => update('hero_image_url', v)} bucket="settings" />
              </div>
              <div className="space-y-2">
                <Label>Banner thông báo (ví dụ: FREE SHIP đơn trên 2tr)</Label>
                <Input value={settings.banner_text || ''} onChange={(e) => update('banner_text', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Hero Banner Thứ 2 (Split Layout)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề</Label>
                <Input value={settings.hero2_title || ''} onChange={(e) => update('hero2_title', e.target.value)} placeholder="New Season Collection" />
              </div>
              <div className="space-y-2">
                <Label>Phụ đề</Label>
                <Textarea value={settings.hero2_subtitle || ''} onChange={(e) => update('hero2_subtitle', e.target.value)} rows={2} placeholder="Mô tả ngắn..." />
              </div>
              <div className="space-y-2">
                <Label>Hình ảnh Hero 2</Label>
                <SettingsImageInput value={settings.hero2_image_url || ''} onChange={(v) => update('hero2_image_url', v)} bucket="settings" />
              </div>
              <div className="space-y-2">
                <Label>Text nút CTA</Label>
                <Input value={settings.hero2_cta || ''} onChange={(e) => update('hero2_cta', e.target.value)} placeholder="Khám Phá Ngay" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Mạng Xã Hội</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input value={settings.social_instagram || ''} onChange={(e) => update('social_instagram', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Facebook URL</Label>
                <Input value={settings.social_facebook || ''} onChange={(e) => update('social_facebook', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Thông Tin Thanh Toán</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-neutral-400">Hiển thị cho khách khi chọn &quot;Chuyển khoản ngân hàng&quot; hoặc &quot;PayPal&quot; ở trang thanh toán.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên ngân hàng</Label>
                  <Input value={settings.bank_name || ''} onChange={(e) => update('bank_name', e.target.value)} placeholder="Vietcombank" />
                </div>
                <div className="space-y-2">
                  <Label>Số tài khoản</Label>
                  <Input value={settings.bank_account_number || ''} onChange={(e) => update('bank_account_number', e.target.value)} placeholder="0123456789" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Chủ tài khoản</Label>
                <Input value={settings.bank_account_holder || ''} onChange={(e) => update('bank_account_holder', e.target.value)} placeholder="NGUYEN VAN A" />
              </div>
              <div className="space-y-2">
                <Label>Mã QR chuyển khoản (tùy chọn)</Label>
                <SettingsImageInput value={settings.bank_qr_url || ''} onChange={(v) => update('bank_qr_url', v)} bucket="settings" />
                <p className="text-xs text-neutral-400">Ảnh QR từ app ngân hàng (VietQR, mã QR tài khoản...). Nếu để trống, chỉ hiện thông tin STK ở trên.</p>
              </div>
              <div className="space-y-2">
                <Label>Tài khoản PayPal (email hoặc paypal.me link)</Label>
                <Input value={settings.paypal_account || ''} onChange={(e) => update('paypal_account', e.target.value)} placeholder="paypal.me/khaoffical" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Menu Điều Hướng</CardTitle>
                <button
                  type="button"
                  onClick={addMenuItem}
                  className="flex items-center gap-1 text-sm text-[#c9a96e] hover:underline"
                >
                  <Plus className="w-4 h-4" /> Thêm mục
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {menuItems.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                  <div>
                    {i === 0 && <Label className="text-xs mb-1 block">Tên (VI)</Label>}
                    <Input
                      value={item.label}
                      onChange={(e) => updateMenuItem(i, 'label', e.target.value)}
                      placeholder="Tên tiếng Việt"
                    />
                  </div>
                  <div>
                    {i === 0 && <Label className="text-xs mb-1 block">Tên (EN)</Label>}
                    <Input
                      value={item.label_en}
                      onChange={(e) => updateMenuItem(i, 'label_en', e.target.value)}
                      placeholder="English name"
                    />
                  </div>
                  <div>
                    {i === 0 && <Label className="text-xs mb-1 block">Link (href)</Label>}
                    <Input
                      value={item.href}
                      onChange={(e) => updateMenuItem(i, 'href', e.target.value)}
                      placeholder="/products"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMenuItem(i)}
                    className={`hover:text-red-500 text-neutral-400 ${i === 0 ? 'mt-5' : ''}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Trang Giới Thiệu (About Us)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề</Label>
                <Input value={settings.about_title || ''} onChange={(e) => update('about_title', e.target.value)} placeholder="Về Chúng Tôi" />
              </div>
              <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <SettingsImageInput value={settings.about_image_url || ''} onChange={(v) => update('about_image_url', v)} bucket="settings" />
              </div>
              <div className="space-y-2">
                <Label>Nội dung</Label>
                <Textarea
                  value={settings.about_content || ''}
                  onChange={(e) => update('about_content', e.target.value)}
                  rows={10}
                  placeholder="Câu chuyện thương hiệu, sứ mệnh, giá trị cốt lõi..."
                />
                <p className="text-xs text-neutral-400">Xuống dòng sẽ được giữ nguyên khi hiển thị. Sau khi lưu, thêm mục menu &quot;About Us&quot; với link &quot;/about&quot; ở phần Menu Điều Hướng để hiện lên navbar.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Popup Thu Thập Khách Hàng</CardTitle>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.popup_enabled || false}
                    onChange={(e) => setSettings((prev) => ({ ...prev, popup_enabled: e.target.checked }))}
                    className="w-4 h-4 accent-[#c9a96e] cursor-pointer"
                  />
                  Bật popup
                </label>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề</Label>
                <Input
                  value={settings.popup_title || ''}
                  onChange={(e) => update('popup_title', e.target.value)}
                  placeholder="Ưu Đãi Dành Riêng Cho Bạn"
                />
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  value={settings.popup_description || ''}
                  onChange={(e) => update('popup_description', e.target.value)}
                  rows={3}
                  placeholder="Để lại thông tin để nhận ưu đãi mới nhất từ chúng tôi."
                />
              </div>
              <p className="text-xs text-neutral-400">Popup hiện 1 lần mỗi phiên truy cập, thu thập tên và số điện thoại. Xem danh sách tại mục &quot;Khách Hàng Tiềm Năng&quot;.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Theme */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Màu Sắc Theme</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Màu chính (nền đen, nút chính)</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.primary_color || '#1a1a1a'}
                    onChange={(e) => update('primary_color', e.target.value)}
                    className="w-10 h-10 border border-neutral-300 cursor-pointer"
                  />
                  <Input
                    value={settings.primary_color || ''}
                    onChange={(e) => update('primary_color', e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Màu phụ (vàng gold)</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.secondary_color || '#c9a96e'}
                    onChange={(e) => update('secondary_color', e.target.value)}
                    className="w-10 h-10 border border-neutral-300 cursor-pointer"
                  />
                  <Input
                    value={settings.secondary_color || ''}
                    onChange={(e) => update('secondary_color', e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Màu nền accent (kem)</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.accent_color || '#f5f0e8'}
                    onChange={(e) => update('accent_color', e.target.value)}
                    className="w-10 h-10 border border-neutral-300 cursor-pointer"
                  />
                  <Input
                    value={settings.accent_color || ''}
                    onChange={(e) => update('accent_color', e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Font Chữ</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Font tiêu đề</Label>
                <Input value={settings.font_heading || ''} onChange={(e) => update('font_heading', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Font nội dung</Label>
                <Input value={settings.font_body || ''} onChange={(e) => update('font_body', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Logo & Favicon</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <SettingsImageInput value={settings.logo_url || ''} onChange={(v) => update('logo_url', v)} bucket="settings" />
              </div>
              <div className="space-y-2">
                <Label>Favicon (icon tab trình duyệt)</Label>
                <SettingsImageInput value={settings.favicon_url || ''} onChange={(v) => update('favicon_url', v)} bucket="settings" />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader><CardTitle>Preview Theme</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-12 flex items-center justify-center font-bold tracking-widest text-sm"
                  style={{ backgroundColor: settings.primary_color, color: '#fff' }}>
                  {settings.store_name}
                </div>
                <div className="h-8 flex items-center justify-center text-xs"
                  style={{ backgroundColor: settings.secondary_color, color: '#fff' }}>
                  Gold Button
                </div>
                <div className="h-12 p-3 text-xs"
                  style={{ backgroundColor: settings.accent_color }}>
                  Accent Background
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
