import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/lib/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantity?: number, size?: string | null) => void
  removeItem: (productId: string, size?: string | null) => void
  updateQuantity: (productId: string, quantity: number, size?: string | null) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

const sameLine = (i: CartItem, productId: string, size?: string | null) =>
  i.product.id === productId && (i.size || null) === (size || null)

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, size = null) => {
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, product.id, size))
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, product.id, size)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true,
            }
          }
          return { items: [...state.items, { product, quantity, size: size || null }], isOpen: true }
        })
      },

      removeItem: (productId, size = null) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, size)),
        })),

      updateQuantity: (productId, quantity, size = null) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, productId, size) ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: 'luxe-cart' }
  )
)
