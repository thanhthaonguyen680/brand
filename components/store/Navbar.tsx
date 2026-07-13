'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react'
import { useCart } from '@/store/cart'
import { useTranslation } from '@/lib/i18n/context'
import { LanguageSwitcher } from './LanguageSwitcher'

type NavMenuItem = { label: string; label_en: string; href: string }

const DEFAULT_LINKS = [
  { href: '/products', label: 'Bộ Sưu Tập', label_en: 'Collection' },
  { href: '/products?featured=true', label: 'Nổi Bật', label_en: 'Featured' },
  { href: '/products?new=true', label: 'Hàng Mới Về', label_en: 'New Arrivals' },
]

export function Navbar({ logoUrl, menuItems }: { logoUrl?: string | null; menuItems?: NavMenuItem[] | null }) {
  const { totalItems, openCart } = useCart()
  const { locale, t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const count = totalItems()

  const links = menuItems?.length ? menuItems : DEFAULT_LINKS
  const NAV_LINKS = links.map((item) => ({
    href: item.href,
    label: locale === 'en' ? item.label_en : item.label,
  }))

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-8">
          <Link href="/" className="flex-shrink-0">
            {logoUrl ? (
              <Image src={logoUrl} alt="KHA" width={80} height={40} className="object-contain h-10 w-auto" />
            ) : (
              <span className="text-4xl text-neutral-900" style={{ fontFamily: 'var(--font-script)' }}>
                kha.
              </span>
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-8 flex-1">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={`${link.href}-${i}`}
                href={link.href}
                className="text-xs tracking-widest uppercase text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 ml-auto">
            <LanguageSwitcher />
            <button className="hidden lg:flex hover:opacity-60 transition-opacity">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/account" className="hidden lg:flex hover:opacity-60 transition-opacity">
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={openCart}
              className="relative hover:opacity-60 transition-opacity"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#c9a96e] text-white text-[10px] w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <button
              className="lg:hidden hover:opacity-60"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white">
          <nav className="flex flex-col px-4 py-4 gap-4">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={`${link.href}-${i}`}
                href={link.href}
                className="text-sm tracking-widest uppercase text-neutral-600 hover:text-neutral-900"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account"
              className="text-sm tracking-widest uppercase text-neutral-600 hover:text-neutral-900"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.account}
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
