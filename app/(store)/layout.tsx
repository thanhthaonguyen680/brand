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
      .select(`
        logo_url, menu_items, popup_enabled, popup_title, popup_description,
        footer_description, footer_explore_links, footer_support_links,
        footer_copyright, footer_payment_text, social_instagram, social_facebook
      `)
      .eq('id', 1)
      .single()
    return {
      logoUrl: data?.logo_url || null,
      menuItems: data?.menu_items || null,
      popupEnabled: data?.popup_enabled || false,
      popupTitle: data?.popup_title || 'Ưu Đãi Dành Riêng Cho Bạn',
      popupDescription: data?.popup_description || 'Để lại thông tin để nhận ưu đãi mới nhất từ chúng tôi.',
      footerDescription: data?.footer_description || null,
      footerExploreLinks: data?.footer_explore_links || null,
      footerSupportLinks: data?.footer_support_links || null,
      footerCopyright: data?.footer_copyright || null,
      footerPaymentText: data?.footer_payment_text || null,
      socialInstagram: data?.social_instagram || null,
      socialFacebook: data?.social_facebook || null,
    }
  } catch {
    return {
      logoUrl: null, menuItems: null, popupEnabled: false, popupTitle: '', popupDescription: '',
      footerDescription: null, footerExploreLinks: null, footerSupportLinks: null,
      footerCopyright: null, footerPaymentText: null, socialInstagram: null, socialFacebook: null,
    }
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const {
    logoUrl, menuItems, popupEnabled, popupTitle, popupDescription,
    footerDescription, footerExploreLinks, footerSupportLinks,
    footerCopyright, footerPaymentText, socialInstagram, socialFacebook,
  } = await getStoreNav()

  return (
    <LanguageProvider>
      <Navbar logoUrl={logoUrl} menuItems={menuItems} />
      <CartSidebar />
      {popupEnabled && <LeadPopup title={popupTitle} description={popupDescription} />}
      <main className="pt-16 min-h-screen">
        {children}
      </main>
      <Footer
        description={footerDescription}
        exploreLinks={footerExploreLinks}
        supportLinks={footerSupportLinks}
        copyright={footerCopyright}
        paymentText={footerPaymentText}
        socialInstagram={socialInstagram}
        socialFacebook={socialFacebook}
      />
    </LanguageProvider>
  )
}
