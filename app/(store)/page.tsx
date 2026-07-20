import { createClient } from '@/lib/supabase/server'
import { Product, StoreSettings } from '@/lib/types'
import { HomeContent } from '@/components/store/HomeContent'

export const dynamic = 'force-dynamic'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('status', 'active')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(8)
    return data || []
  } catch {
    return []
  }
}

async function getNewArrivals(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4)
    return data || []
  } catch {
    return []
  }
}

async function getStoreSettings(): Promise<Partial<StoreSettings>> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('store_settings').select('*').eq('id', 1).single()
    return data || {}
  } catch {
    return {}
  }
}

export default async function HomePage() {
  const [featuredProducts, newArrivals, settings] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getStoreSettings(),
  ])

  return (
    <HomeContent
      featuredProducts={featuredProducts}
      newArrivals={newArrivals}
      heroBadge={settings.hero_badge || null}
      heroImageUrl={settings.hero_image_url || null}
      heroImages={settings.hero_images || []}
      heroTitleImageUrl={settings.hero_title_image_url || null}
      heroTitle={settings.hero_title || null}
      heroSubtitle={settings.hero_subtitle || null}
      hero2ImageUrl={settings.hero2_image_url || null}
      hero2Title={settings.hero2_title || null}
      hero2Subtitle={settings.hero2_subtitle || null}
      hero2Cta={settings.hero2_cta || null}
      memberBannerEnabled={settings.member_banner_enabled ?? true}
    />
  )
}
