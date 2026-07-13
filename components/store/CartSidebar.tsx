'use client'

import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/store/cart'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCart()
  const { t } = useTranslation()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={closeCart} />
      )}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-lg font-semibold tracking-widest uppercase">{t.cart.title}</h2>
            <button onClick={closeCart} className="hover:opacity-60 transition-opacity">
              <X className="w-5 h-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-neutral-400">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p className="text-sm tracking-wide">{t.cart.empty}</p>
              <Button variant="outline" size="sm" onClick={closeCart} asChild>
                <Link href="/products">{t.cart.explore}</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.map(({ product, quantity, size }) => (
                  <div key={`${product.id}-${size || ''}`} className="flex gap-4">
                    <div className="relative w-20 h-24 bg-neutral-100 flex-shrink-0">
                      {product.images[0] && (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{product.name}</h3>
                      {size && <p className="text-xs text-neutral-500 mt-0.5">Size: {size}</p>}
                      <p className="text-sm text-[#c9a96e] mt-1">{formatPrice(product.price)}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1, size)}
                          className="w-7 h-7 border border-neutral-300 flex items-center justify-center hover:bg-neutral-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-6 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1, size)}
                          className="w-7 h-7 border border-neutral-300 flex items-center justify-center hover:bg-neutral-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(product.id, size)}
                          className="ml-auto text-neutral-400 hover:text-neutral-900 text-xs"
                        >
                          {t.cart.remove}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-neutral-200 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{t.cart.subtotal}</span>
                  <span className="font-medium">{formatPrice(totalPrice())}</span>
                </div>
                <p className="text-xs text-neutral-400">{t.cart.shipping_note}</p>
                <Button className="w-full" size="lg" asChild onClick={closeCart}>
                  <Link href="/checkout">{t.cart.checkout}</Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={closeCart} asChild>
                  <Link href="/products">{t.cart.continue}</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
