'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Minus, Plus, ShoppingBag, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/store/ProductCard'
import { SizeChart } from '@/components/store/SizeChart'
import { useCart } from '@/store/cart'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

export default function ProductDetailPage() {
  const params = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', params.slug)
        .eq('status', 'active')
        .single()

      if (data) {
        setProduct(data)
        setSelectedSize(null)
        setQuantity(1)
        const { data: rel } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('status', 'active')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .limit(4)
        setRelated(rel || [])
      }
      setLoading(false)
    }
    load()
  }, [params.slug])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-pulse text-neutral-300">Đang tải...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500 mb-6">Không tìm thấy sản phẩm</p>
        <Button variant="brand" asChild><Link href="/products">Quay Lại</Link></Button>
      </div>
    )
  }

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const hasSizes = product.sizes && product.sizes.length > 0
  const selectedSizeStock = selectedSize
    ? product.sizes.find((s) => s.size === selectedSize)?.stock ?? 0
    : 0
  const availableStock = hasSizes ? selectedSizeStock : product.stock
  const inStock = hasSizes ? product.sizes.some((s) => s.stock > 0) : product.stock > 0
  const isPreorder = !inStock && product.allow_preorder
  const canOrder = inStock || isPreorder
  const maxQuantity = isPreorder ? 10 : availableStock

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Quay Lại
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                <ShoppingBag className="w-20 h-20" />
              </div>
            )}
            {discount > 0 && (
              <Badge variant="gold" className="absolute top-4 left-4">
                -{discount}%
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square bg-neutral-100 overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-[var(--color-brand-primary)]' : 'border-transparent'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:pt-4">
          {product.category && (
            <p className="text-xs tracking-widest uppercase text-[var(--color-brand-secondary)] mb-3">
              {product.category.name}
            </p>
          )}
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-neutral-400 line-through text-lg">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-neutral-600 leading-relaxed mb-8">{product.description}</p>
          )}

          {inStock ? (
            <p className="text-sm text-green-600 mb-6">
              ✓ Còn hàng{!hasSizes && ` (${product.stock} sản phẩm)`}
              {hasSizes && selectedSize && ` (${availableStock} sản phẩm)`}
            </p>
          ) : isPreorder ? (
            <p className="text-sm text-[var(--color-brand-secondary)] mb-6">🕒 Đặt Trước — sản phẩm sẽ được giao sau khi có hàng</p>
          ) : (
            <p className="text-sm text-red-500 mb-6">✗ Hết hàng</p>
          )}

          {hasSizes && canOrder && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Size:</span>
                <SizeChart />
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const disabled = !isPreorder && s.stock <= 0
                  return (
                    <button
                      key={s.size}
                      type="button"
                      disabled={disabled}
                      onClick={() => { setSelectedSize(s.size); setQuantity(1) }}
                      className={`w-12 h-10 border text-sm transition-colors ${
                        selectedSize === s.size
                          ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white'
                          : disabled
                          ? 'border-neutral-200 text-neutral-300 cursor-not-allowed line-through'
                          : 'border-neutral-300 hover:border-[var(--color-brand-primary)]'
                      }`}
                    >
                      {s.size}
                    </button>
                  )
                })}
              </div>
              {!selectedSize && <p className="text-xs text-neutral-400 mt-2">Vui lòng chọn size</p>}
            </div>
          )}

          {canOrder && (!hasSizes || selectedSize) && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Số Lượng:</span>
                <div className="flex items-center border border-neutral-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button
                variant="brand"
                size="lg"
                className="w-full"
                onClick={() => addItem(product, quantity, selectedSize)}
              >
                <ShoppingBag className="w-4 h-4" />
                {isPreorder ? 'Đặt Trước' : 'Thêm Vào Giỏ'}
              </Button>

              {isPreorder && (
                <p className="text-xs text-neutral-500 mt-3">
                  🕒 Lưu ý: đây là sản phẩm đặt trước — dự kiến giao hàng trong vòng 14 ngày kể từ khi đặt. Món đồ đặc biệt luôn xứng đáng để chờ đợi.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-8">Sản Phẩm Liên Quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
