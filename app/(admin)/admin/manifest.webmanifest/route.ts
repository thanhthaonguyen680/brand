import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// A separate manifest for /admin/* so "Add to Home Screen" from inside the
// admin panel creates an icon that launches straight into /admin instead of
// the storefront homepage (the site-wide app/manifest.ts has start_url "/").
export async function GET() {
  let name = 'KHA'
  let themeColor = '#1a1a1a'
  let icon = '/favicon.ico'

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_settings')
      .select('store_name, primary_color, favicon_url')
      .eq('id', 1)
      .single()
    if (data?.store_name) name = data.store_name
    if (data?.primary_color) themeColor = data.primary_color
    if (data?.favicon_url) icon = data.favicon_url
  } catch {}

  return NextResponse.json({
    name: `${name} Admin`,
    short_name: `${name} Admin`,
    description: 'Trang quản trị cửa hàng',
    start_url: '/admin',
    display: 'standalone',
    background_color: '#171717',
    theme_color: themeColor,
    icons: [{ src: icon, sizes: 'any', type: 'image/png' }],
  })
}
