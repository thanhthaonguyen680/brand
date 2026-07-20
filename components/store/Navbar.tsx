'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react'
import { useCart } from '@/store/cart'
import { useTranslation } from '@/lib/i18n/context'
import { LanguageSwitcher } from './LanguageSwitcher'

type NavMenuItem = { label: string; label_en: string; href: string }
type NavCategory = { name: string; slug: string }

const DEFAULT_LINKS: NavMenuItem[] = [
  { href: '/products', label: 'Bộ Sưu Tập', label_en: 'Collection' },
  { href: '/products?featured=true', label: 'Nổi Bật', label_en: 'Featured' },
  { href: '/products?new=true', label: 'Hàng Mới Về', label_en: 'New Arrivals' },
]

const DEFAULT_SUPPORT: NavMenuItem[] = [
  { label: 'Tài Khoản', label_en: 'Account', href: '/account' },
  { label: 'Liên Hệ', label_en: 'Contact Us', href: 'mailto:info@kha.vn' },
]

export function Navbar({
  logoUrl,
  menuItems,
  categories,
  supportLinks,
}: {
  logoUrl?: string | null
  menuItems?: NavMenuItem[] | null
  categories?: NavCategory[] | null
  supportLinks?: NavMenuItem[] | null
}) {
  const { totalItems, openCart } = useCart()
  const { locale, t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const count = totalItems()

  const links = menuItems?.length ? menuItems : DEFAULT_LINKS
  const NAV_LINKS = links.map((item) => ({
    href: item.href,
    label: locale === 'en' ? item.label_en : item.label,
  }))

  const support = supportLinks?.length ? supportLinks : DEFAULT_SUPPORT
  const SUPPORT_LINKS = support.map((item) => ({
    href: item.href,
    label: locale === 'en' ? item.label_en : item.label,
  }))

  const cats = categories || []

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative flex items-center h-16">
            <button
              onClick={() => setMenuOpen(true)}
              className="hover:opacity-60 transition-opacity"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              {logoUrl ? (
                <Image src={logoUrl} alt="KHA" width={80} height={40} className="object-contain h-10 w-auto" />
              ) : (
                <span className="text-4xl text-neutral-900" style={{ fontFamily: 'var(--font-script)' }}>
                  kha.
                </span>
              )}
            </Link>

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
                  <span className="absolute -top-2 -right-2 bg-[var(--color-brand-secondary)] text-white text-[10px] w-4 h-4 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen navigation overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <button
            onClick={() => setMenuOpen(false)}
            className="fixed top-4 right-4 z-10 w-10 h-10 border border-neutral-300 bg-white flex items-center justify-center hover:bg-neutral-100 transition-colors"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-md mx-auto px-6 py-24">
            <nav className="space-y-4 mb-12">
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={`${link.href}-${i}`}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-2xl md:text-3xl font-medium tracking-wide hover:text-[var(--color-brand-secondary)] transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {cats.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-4">Danh Mục</h3>
                <div className="space-y-3">
                  {cats.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="block text-sm tracking-widest uppercase text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-4">Hỗ Trợ</h3>
              <div className="space-y-3">
                {SUPPORT_LINKS.map((link, i) => (
                  <Link
                    key={`${link.href}-${i}`}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block text-sm tracking-widest uppercase text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm tracking-widest uppercase text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  {t.nav.account}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
