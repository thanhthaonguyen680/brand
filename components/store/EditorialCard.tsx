'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/store/cart'
import { useTranslation } from '@/lib/i18n/context'

export function EditorialCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { t } = useTranslation()

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image — tall aspect ratio like a fashion editorial */}
        <div className="relative aspect-[2/3] bg-neutral-100 overflow-hidden mb-4">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover object-top group-hover:scale-103 transition-transform duration-700"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-200">
              <ShoppingBag className="w-16 h-16" />
            </div>
          )}

          {/* Tags */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.featured && (
              <span className="bg-white text-neutral-900 text-[10px] tracking-widest uppercase px-2 py-1 font-medium">
                NEW
              </span>
            )}
            {product.compare_price && product.compare_price > product.price && (
              <span className="bg-[#c9a96e] text-white text-[10px] tracking-widest uppercase px-2 py-1 font-medium">
                SALE
              </span>
            )}
          </div>

          {/* Add to cart overlay */}
          <button
            onClick={(e) => {
              if (product.sizes && product.sizes.length > 0) return
              e.preventDefault()
              addItem(product)
            }}
            className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm text-neutral-900 text-xs tracking-widest uppercase py-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {t.products.add_to_cart}
          </button>
        </div>

        {/* Info */}
        <div className="space-y-1">
          {product.category && (
            <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">
              {(product.category as { name: string }).name}
            </p>
          )}
          <h3 className="text-sm font-medium text-neutral-900 leading-snug">{product.name}</h3>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-sm text-neutral-800">{formatPrice(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs text-neutral-400 line-through">{formatPrice(product.compare_price)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
