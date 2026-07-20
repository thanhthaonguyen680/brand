'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/store/ProductCard'
import { EditorialCard } from '@/components/store/EditorialCard'
import { useTranslation } from '@/lib/i18n/context'
import { Product } from '@/lib/types'

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80'
const DEFAULT_HERO2_IMG = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80'
const HERO_SLIDE_INTERVAL = 5000

interface HomeContentProps {
  featuredProducts: Product[]
  newArrivals: Product[]
  heroBadge?: string | null
  heroImageUrl?: string | null
  heroImages?: string[]
  heroTitleImageUrl?: string | null
  heroTitle?: string | null
  heroSubtitle?: string | null
  hero2ImageUrl?: string | null
  hero2Title?: string | null
  hero2Subtitle?: string | null
  hero2Cta?: string | null
  memberBannerEnabled?: boolean
}

export function HomeContent({
  featuredProducts,
  newArrivals,
  heroBadge,
  heroImageUrl,
  heroImages,
  heroTitleImageUrl,
  heroTitle,
  heroSubtitle,
  hero2ImageUrl,
  hero2Title,
  hero2Subtitle,
  hero2Cta,
  memberBannerEnabled = true,
}: HomeContentProps) {
  const { t } = useTranslation()

  const slides = heroImages && heroImages.length > 0 ? heroImages : [heroImageUrl || DEFAULT_HERO]
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, HERO_SLIDE_INTERVAL)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <>
      {/* ── Hero 1 ── Carousel; only slide 0 carries the title/CTA + dark overlay */}
      <section className="relative h-[90vh] bg-neutral-900 flex items-center justify-center overflow-hidden">
        {slides.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              i === activeSlide ? 'opacity-100' : 'opacity-0'
            } ${i === 0 ? 'brightness-[0.6]' : ''}`}
            style={{ backgroundImage: `url('${src}')` }}
          />
        ))}

        {activeSlide === 0 && (
          <div className="relative text-center text-white px-4 max-w-3xl mx-auto">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--color-brand-secondary)] mb-4">{heroBadge || t.hero.badge}</p>
            {heroTitleImageUrl ? (
              <div className="mb-6 flex justify-center">
                <img
                  src={heroTitleImageUrl}
                  alt="logo"
                  className="max-h-40 md:max-h-56 w-auto object-contain drop-shadow-lg"
                />
              </div>
            ) : (
              <h1
                className="text-7xl md:text-9xl mb-6 leading-none"
                style={{ fontFamily: 'var(--font-script)' }}
              >
                {heroTitle || 'kha.'}
              </h1>
            )}
            {heroSubtitle && (
              <p className="text-neutral-300 text-2xl mb-10 max-w-md mx-auto" style={{ fontFamily: 'MrDeHaviland, cursive' }}>
                {heroSubtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" asChild>
                <Link href="/products">{t.hero.cta}</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-neutral-900"
                asChild
              >
                <Link href="/products?featured=true">{t.hero.featured_btn}</Link>
              </Button>
            </div>
          </div>
        )}

        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-brand-secondary)] mb-2">{t.sections.featured_label}</p>
              <h2 className="text-3xl font-bold">{t.sections.featured_title}</h2>
            </div>
            <Link href="/products?featured=true" className="text-sm tracking-widest uppercase border-b border-neutral-900 hover:text-[var(--color-brand-secondary)] hover:border-[var(--color-brand-secondary)] transition-colors">
              {t.sections.view_all}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── Hero 2 ── Split layout */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
        {/* Text side */}
        <div className="bg-[var(--color-brand-accent)] flex items-center justify-center px-12 py-20 order-2 lg:order-1">
          <div className="max-w-md">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--color-brand-secondary)] mb-4">
              {t.hero.badge}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              {hero2Title || 'New Season\nCollection'}
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              {hero2Subtitle || 'Những thiết kế mới nhất cho mùa này — tinh tế, sang trọng và đầy cá tính.'}
            </p>
            <Button variant="brand" size="lg" asChild>
              <Link href="/products">{hero2Cta || t.hero.cta}</Link>
            </Button>
          </div>
        </div>
        {/* Image side */}
        <div className="relative min-h-[50vh] lg:min-h-full order-1 lg:order-2 overflow-hidden">
          <Image
            src={hero2ImageUrl || DEFAULT_HERO2_IMG}
            alt="Collection"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* ── Editorial New Arrivals ── Full-body lookbook style */}
      {newArrivals.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-brand-secondary)] mb-2">{t.sections.new_label}</p>
              <h2 className="text-3xl font-bold">{t.sections.new_title}</h2>
            </div>
            <Link href="/products" className="text-sm tracking-widest uppercase border-b border-neutral-900 hover:text-[var(--color-brand-secondary)] hover:border-[var(--color-brand-secondary)] transition-colors">
              {t.sections.view_all}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newArrivals.slice(0, 6).map((product) => (
              <EditorialCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── Member Banner ── */}
      {memberBannerEnabled && (
        <section className="py-24 bg-[var(--color-brand-primary)] text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--color-brand-secondary)] mb-4">{t.banner.label}</p>
            <h2 className="text-4xl font-bold mb-6">{t.banner.title1}<br />{t.banner.title2}</h2>
            <p className="text-neutral-400 mb-8">{t.banner.subtitle}</p>
            <Button variant="gold" size="lg" asChild>
              <Link href="/auth/register">{t.banner.cta}</Link>
            </Button>
          </div>
        </section>
      )}

      {/* ── Empty state ── */}
      {featuredProducts.length === 0 && newArrivals.length === 0 && (
        <section className="py-20 text-center">
          <div className="max-w-md mx-auto px-4">
            <p className="text-neutral-400 mb-6">{t.empty.no_products}</p>
            <Button variant="brand" asChild>
              <Link href="/admin">{t.empty.go_admin}</Link>
            </Button>
          </div>
        </section>
      )}
    </>
  )
}
