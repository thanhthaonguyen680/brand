export const dynamic = 'force-dynamic'

import { Navbar } from '@/components/store/Navbar'
import { Footer } from '@/components/store/Footer'
import { CartSidebar } from '@/components/store/CartSidebar'
import { LeadPopup } from '@/components/store/LeadPopup'
import { LanguageProvider } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/server'

async function getStoreNav() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_settings')
      .select('logo_url, menu_items, popup_enabled, popup_title, popup_description')
      .eq('id', 1)
      .single()
    return {
      logoUrl: data?.logo_url || null,
      menuItems: data?.menu_items || null,
      popupEnabled: data?.popup_enabled || false,
      popupTitle: data?.popup_title || 'Ưu Đãi Dành Riêng Cho Bạn',
      popupDescription: data?.popup_description || 'Để lại thông tin để nhận ưu đãi mới nhất từ chúng tôi.',
    }
  } catch {
    return { logoUrl: null, menuItems: null, popupEnabled: false, popupTitle: '', popupDescription: '' }
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const { logoUrl, menuItems, popupEnabled, popupTitle, popupDescription } = await getStoreNav()

  return (
    <LanguageProvider>
      <Navbar logoUrl={logoUrl} menuItems={menuItems} />
      <CartSidebar />
      {popupEnabled && <LeadPopup title={popupTitle} description={popupDescription} />}
      <main className="pt-16 min-h-screen">
        {children}
      </main>
      <Footer />
    </LanguageProvider>
  )
}
