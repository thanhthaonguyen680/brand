import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { StoreSettings } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getStoreSettings(): Promise<Partial<StoreSettings>> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_settings')
      .select('about_title, about_content, about_image_url')
      .eq('id', 1)
      .single()
    return data || {}
  } catch {
    return {}
  }
}

export default async function AboutPage() {
  const settings = await getStoreSettings()

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <p className="text-xs tracking-[0.3em] uppercase text-[#c9a96e] mb-2">Giới Thiệu</p>
      <h1 className="text-3xl font-bold mb-8">{settings.about_title || 'Về Chúng Tôi'}</h1>

      {settings.about_image_url && (
        <div className="relative w-full aspect-[16/9] mb-8 bg-neutral-100">
          <Image
            src={settings.about_image_url}
            alt={settings.about_title || 'Về Chúng Tôi'}
            fill
            className="object-cover"
          />
        </div>
      )}

      {settings.about_content ? (
        <div className="whitespace-pre-line text-neutral-700 leading-relaxed">
          {settings.about_content}
        </div>
      ) : (
        <p className="text-neutral-400">Nội dung đang được cập nhật.</p>
      )}
    </div>
  )
}
