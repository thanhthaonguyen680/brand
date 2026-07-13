'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/store/cart'
import { useTranslation } from '@/lib/i18n/context'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { t } = useTranslation()

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-4">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <ShoppingBag className="w-12 h-12" />
            </div>
          )}
          {product.compare_price && product.compare_price > product.price && (
            <span className="absolute top-3 left-3 bg-[#c9a96e] text-white text-xs px-2 py-1">
              SALE
            </span>
          )}
          {product.featured && (
            <span className="absolute top-3 right-3 bg-neutral-900 text-white text-xs px-2 py-1">
              NEW
            </span>
          )}
          <button
            onClick={(e) => {
              if (product.sizes && product.sizes.length > 0) return
              e.preventDefault()
              addItem(product)
            }}
            className="absolute bottom-0 left-0 right-0 bg-neutral-900 text-white text-xs tracking-widest uppercase py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {t.products.add_to_cart}
          </button>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-900 mb-1">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-900">{formatPrice(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
