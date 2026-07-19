'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus, PaymentStatus } from '@/lib/types'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'default'> = {
  delivered: 'success', shipped: 'info', confirmed: 'info',
  processing: 'warning', pending: 'warning', cancelled: 'destructive', refunded: 'destructive',
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .single()
      setOrder(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', order.id)
    setOrder({ ...order, status })
  }

  const updatePaymentStatus = async (payment_status: PaymentStatus) => {
    if (!order) return
    const supabase = createClient()
    await supabase.from('orders').update({ payment_status }).eq('id', order.id)
    setOrder({ ...order, payment_status })
  }

  if (loading) return <div className="text-center py-20 text-neutral-400">Đang tải...</div>

  if (!order) {
    return (
      <div className="text-center py-20 text-neutral-400">
        <p className="mb-4">Không tìm thấy đơn hàng</p>
        <Link href="/admin/orders" className="text-[#c9a96e] hover:underline">Quay lại danh sách</Link>
      </div>
    )
  }

  const a = order.shipping_address

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="hover:opacity-60">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-neutral-500 text-sm mt-1">Đặt lúc {formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Sản Phẩm</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                  <div className="relative w-16 h-20 bg-neutral-100 flex-shrink-0">
                    {item.product_image && (
                      <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.product_name}</p>
                    {item.size && (
                      <p className="text-xs text-neutral-600 mt-1">
                        Size: <span className="font-medium">{item.size}</span>
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 mt-1">Số lượng: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader><CardTitle>Ghi Chú Của Khách</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-700 whitespace-pre-line">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Tổng Kết</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Địa Chỉ Giao Hàng</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <p className="font-medium">{a.full_name}</p>
              <p className="text-neutral-600">{a.phone}</p>
              <p className="text-neutral-600">{a.email}</p>
              <p className="text-neutral-600 pt-2">{a.address}</p>
              <p className="text-neutral-600">
                {[a.ward, a.district, a.city].filter(Boolean).join(', ')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Trạng Thái Đơn Hàng</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_BADGE[order.status] || 'default'}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(e.target.value as OrderStatus)}
                  className="w-full text-sm border border-neutral-300 px-3 py-2 focus:outline-none bg-white"
                >
                  {Object.entries(ORDER_STATUS_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>
                    {PAYMENT_STATUS_LABELS[order.payment_status]}
                  </Badge>
                  <span className="text-xs text-neutral-400">{PAYMENT_METHOD_LABELS[order.payment_method]}</span>
                </div>
                <select
                  value={order.payment_status}
                  onChange={(e) => updatePaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full text-sm border border-neutral-300 px-3 py-2 focus:outline-none bg-white"
                >
                  {Object.entries(PAYMENT_STATUS_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
