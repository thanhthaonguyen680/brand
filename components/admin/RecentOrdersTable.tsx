'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/lib/types'
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'default'> = {
  delivered: 'success', shipped: 'info', confirmed: 'info',
  processing: 'warning', pending: 'warning', cancelled: 'destructive', refunded: 'destructive',
}

export function RecentOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setOrders(orders.map((o) => o.id === orderId ? { ...o, status } : o))
  }

  const markAsPaid = async (orderId: string) => {
    const supabase = createClient()
    await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', orderId)
    setOrders(orders.map((o) => o.id === orderId ? { ...o, payment_status: 'paid' } : o))
  }

  if (loading) return <p className="text-center py-8 text-neutral-400 text-sm">Đang tải...</p>
  if (orders.length === 0) return <p className="text-center py-8 text-neutral-400 text-sm">Chưa có đơn hàng nào</p>

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
          <th className="text-left px-6 py-3">Mã ĐH</th>
          <th className="text-left px-6 py-3">Tổng tiền</th>
          <th className="text-left px-6 py-3">Trạng thái</th>
          <th className="text-left px-6 py-3">Thanh toán</th>
          <th className="text-left px-6 py-3">Ngày</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
            <td className="px-6 py-4">
              <Link href="/admin/orders" className="text-sm font-medium hover:text-[#c9a96e]">
                {order.order_number}
              </Link>
            </td>
            <td className="px-6 py-4 text-sm">{formatPrice(order.total)}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_BADGE[order.status] || 'default'}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  className="text-xs border border-neutral-300 px-2 py-1 focus:outline-none bg-white"
                >
                  {Object.entries(ORDER_STATUS_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>
            </td>
            <td className="px-6 py-4">
              <div>
                <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>
                  {PAYMENT_STATUS_LABELS[order.payment_status]}
                </Badge>
                {order.payment_status !== 'paid' && (
                  <button
                    onClick={() => markAsPaid(order.id)}
                    className="block text-xs text-[#c9a96e] hover:underline mt-1"
                  >
                    Đánh dấu đã thanh toán
                  </button>
                )}
              </div>
            </td>
            <td className="px-6 py-4 text-xs text-neutral-400">
              {new Date(order.created_at).toLocaleDateString('vi-VN')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
