'use client'

import { useStoreSettings } from '@/lib/hooks/useStoreSettings'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsImageInput } from '@/components/admin/SettingsImageInput'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { SettingsPageHeader } from '@/components/admin/SettingsPageHeader'

const FIELDS = [
  'hero_badge', 'hero_title_image_url', 'hero_title', 'hero_subtitle', 'hero_images', 'banner_text',
  'hero2_title', 'hero2_subtitle', 'hero2_image_url', 'hero2_cta', 'member_banner_enabled',
] as const

export default function HomepageSettingsPage() {
  const { settings, setSettings, update, loading, saving, saved, error, save } = useStoreSettings()

  const heroImages: string[] = settings.hero_images || []
  const setHeroImages = (images: string[]) => setSettings((prev) => ({ ...prev, hero_images: images }))

  if (loading) return <div className="text-center py-20 text-neutral-400">Đang tải...</div>

  return (
    <div>
      <SettingsPageHeader
        title="Trang Chủ"
        subtitle="Hero chính và banner thứ 2 của trang chủ"
        saving={saving}
        saved={saved}
        error={error}
        onSave={() => save([...FIELDS])}
      />

      <div className="max-w-2xl space-y-6">
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
              <Label>Hình ảnh Hero (Carousel)</Label>
              <ImageUpload images={heroImages} onChange={setHeroImages} bucket="settings" />
              <p className="text-xs text-neutral-400">Ảnh đầu tiên hiện cùng tiêu đề/nút bên trên (có lớp phủ tối để dễ đọc chữ). Thêm từ ảnh thứ 2 trở đi sẽ tự động chạy carousel — hiện sáng đầy đủ, không chữ, không phủ tối.</p>
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Banner Đặc Quyền Thành Viên</CardTitle>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.member_banner_enabled ?? true}
                  onChange={(e) => setSettings((prev) => ({ ...prev, member_banner_enabled: e.target.checked }))}
                  className="w-4 h-4 accent-[#c9a96e] cursor-pointer"
                />
                Hiện banner
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-400">Khối "Free Shipping / Tạo Tài Khoản Miễn Phí" ở cuối trang chủ. Bỏ chọn để ẩn hoàn toàn khối này khỏi trang chủ.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
