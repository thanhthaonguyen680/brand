'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, PaymentStatus } from '@/lib/types'
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'default'> = {
  delivered: 'success', shipped: 'info', confirmed: 'info',
  processing: 'warning', pending: 'warning', cancelled: 'destructive', refunded: 'destructive',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  async function load() {
    try {
      const supabase = createClient()
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (filterStatus !== 'all') query = query.eq('status', filterStatus)
      const { data } = await query
      setOrders(data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus])

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setOrders(orders.map((o) => o.id === orderId ? { ...o, status } : o))
  }

  const updatePaymentStatus = async (orderId: string, payment_status: PaymentStatus) => {
    const supabase = createClient()
    await supabase.from('orders').update({ payment_status }).eq('id', orderId)
    setOrders(orders.map((o) => o.id === orderId ? { ...o, payment_status } : o))
  }

  const address = (order: Order) => {
    const a = order.shipping_address
    return `${a.full_name} — ${a.phone}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Đơn Hàng</h1>
          <p className="text-neutral-500 text-sm mt-1">{orders.length} đơn hàng</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([v, label]) => (
              <SelectItem key={v} value={v}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neutral-400">Đang tải...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">Không có đơn hàng nào</div>
      ) : (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Mã ĐH</th>
                <th className="text-left px-6 py-3">Khách Hàng</th>
                <th className="text-left px-6 py-3">Tổng Tiền</th>
                <th className="text-left px-6 py-3">Thanh Toán</th>
                <th className="text-left px-6 py-3">Trạng Thái</th>
                <th className="text-left px-6 py-3">Cập Nhật TT</th>
                <th className="text-left px-6 py-3">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{address(order)}</td>
                  <td className="px-6 py-4 text-sm font-medium">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>
                          {PAYMENT_STATUS_LABELS[order.payment_status]}
                        </Badge>
                        <select
                          value={order.payment_status}
                          onChange={(e) => updatePaymentStatus(order.id, e.target.value as PaymentStatus)}
                          className="text-xs border border-neutral-300 px-2 py-1 focus:outline-none bg-white"
                        >
                          {Object.entries(PAYMENT_STATUS_LABELS).map(([v, label]) => (
                            <option key={v} value={v}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-neutral-400">{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={STATUS_BADGE[order.status] || 'default'}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      className="text-xs border border-neutral-300 px-2 py-1 focus:outline-none bg-white"
                    >
                      {Object.entries(ORDER_STATUS_LABELS).map(([v, label]) => (
                        <option key={v} value={v}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-400">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
