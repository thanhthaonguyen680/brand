import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STEPS = [
  { key: 'pending', label: 'Đã Đặt Hàng' },
  { key: 'confirmed', label: 'Đã Xác Nhận' },
  { key: 'processing', label: 'Đang Xử Lý' },
  { key: 'shipped', label: 'Đang Giao Hàng' },
  { key: 'delivered', label: 'Đã Giao Hàng' },
]

type TrackedItem = {
  id: string
  product_name: string
  size: string | null
  quantity: number
  price: number
}

type TrackedOrder = {
  order_number: string
  status: string
  subtotal: number
  shipping_fee: number
  discount: number
  total: number
  created_at: string
  items: TrackedItem[]
}

async function getOrder(orderNumber: string): Promise<TrackedOrder | null> {
  try {
    const supabase = await createAdminClient()
    // Only select fields safe to show on a public tracking link — never
    // shipping_address, notes, user_id, or payment details.
    const { data } = await supabase
      .from('orders')
      .select('order_number, status, subtotal, shipping_fee, discount, total, created_at, items:order_items(id, product_name, size, quantity, price)')
      .eq('order_number', orderNumber)
      .single()
    return data
  } catch {
    return null
  }
}

export default async function TrackOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const order = await getOrder(orderNumber)

  if (!order) notFound()

  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status)

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-brand-secondary)] mb-2">Theo Dõi Đơn Hàng</p>
      <h1 className="text-2xl font-bold mb-1">{order.order_number}</h1>
      <p className="text-sm text-neutral-500 mb-10">Đặt lúc {formatDate(order.created_at)}</p>

      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 mb-10 text-sm">
          Đơn hàng đã {order.status === 'cancelled' ? 'bị hủy' : 'được hoàn tiền'}. Nếu có thắc mắc, vui lòng liên hệ với KHA.
        </div>
      ) : (
        <div className="flex items-start mb-10">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                  i <= currentStepIndex ? 'bg-[var(--color-brand-primary)] text-white' : 'bg-neutral-200 text-neutral-400'
                }`}>
                  {i + 1}
                </div>
                <p className={`text-[11px] sm:text-xs text-center mt-2 max-w-[80px] ${i <= currentStepIndex ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>
                  {step.label}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-5 ${i < currentStepIndex ? 'bg-[var(--color-brand-primary)]' : 'bg-neutral-200'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4">Sản Phẩm</h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm gap-4">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  {item.size && <p className="text-neutral-500 text-xs mt-0.5">Size: {item.size} · SL: {item.quantity}</p>}
                </div>
                <p className="flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Tạm tính</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Phí vận chuyển</span>
            <span>{order.shipping_fee === 0 ? 'Miễn phí' : formatPrice(order.shipping_fee)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-neutral-200">
            <span>Tổng cộng</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
