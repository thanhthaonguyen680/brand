'use client'

import Link from 'next/link'
import { Share2, MessageCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

type FooterLink = { label: string; label_en: string; href: string }

const DEFAULT_EXPLORE: FooterLink[] = [
  { label: 'Bộ Sưu Tập', label_en: 'Collection', href: '/products' },
  { label: 'Áo', label_en: 'Tops', href: '/products?category=ao' },
  { label: 'Quần', label_en: 'Bottoms', href: '/products?category=quan' },
  { label: 'Đầm & Váy', label_en: 'Dresses & Skirts', href: '/products?category=dam-vay' },
  { label: 'Phụ Kiện', label_en: 'Accessories', href: '/products?category=phu-kien' },
]

const DEFAULT_SUPPORT: FooterLink[] = [
  { label: 'Tài Khoản', label_en: 'Account', href: '/account' },
  { label: 'Liên Hệ', label_en: 'Contact Us', href: 'mailto:info@kha.vn' },
  { label: 'Chính Sách Đổi Trả', label_en: 'Return Policy', href: '#' },
  { label: 'Hướng Dẫn Size', label_en: 'Size Guide', href: '#' },
  { label: 'Vận Chuyển', label_en: 'Shipping', href: '#' },
]

interface FooterProps {
  description?: string | null
  exploreLinks?: FooterLink[] | null
  supportLinks?: FooterLink[] | null
  copyright?: string | null
  paymentText?: string | null
  socialInstagram?: string | null
  socialFacebook?: string | null
}

export function Footer({
  description,
  exploreLinks,
  supportLinks,
  copyright,
  paymentText,
  socialInstagram,
  socialFacebook,
}: FooterProps) {
  const { t, locale } = useTranslation()

  const explore = exploreLinks?.length ? exploreLinks : DEFAULT_EXPLORE
  const support = supportLinks?.length ? supportLinks : DEFAULT_SUPPORT

  return (
    <footer className="bg-neutral-900 text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold tracking-[0.3em] mb-4">KHA</h2>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
              {description || t.footer.description}
            </p>
            {(socialInstagram || socialFacebook) && (
              <div className="flex gap-4 mt-6">
                {socialInstagram && (
                  <a href={socialInstagram} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                  </a>
                )}
                {socialFacebook && (
                  <a href={socialFacebook} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4 text-neutral-300">{t.footer.explore}</h3>
            <ul className="space-y-3 text-sm text-neutral-400">
              {explore.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {locale === 'en' ? link.label_en : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4 text-neutral-300">{t.footer.support}</h3>
            <ul className="space-y-3 text-sm text-neutral-400">
              {support.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {locale === 'en' ? link.label_en : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-xs">{copyright || t.footer.copyright}</p>
          <p className="text-neutral-500 text-xs">{paymentText || t.footer.payment}</p>
        </div>
      </div>
    </footer>
  )
}
