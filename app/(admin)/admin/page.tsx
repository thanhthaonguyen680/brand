import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RecentOrdersTable } from '@/components/admin/RecentOrdersTable'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats() {
  try {
    const supabase = await createClient()

    const [products, orders, customers, revenue] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('orders').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
      supabase.from('orders').select('total').eq('payment_status', 'paid'),
    ])

    const totalRevenue = (revenue.data || []).reduce((sum, o) => sum + (o.total || 0), 0)

    return {
      products: products.count || 0,
      orders: orders.count || 0,
      customers: customers.count || 0,
      revenue: totalRevenue,
    }
  } catch {
    return { products: 0, orders: 0, customers: 0, revenue: 0 }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    { label: 'Doanh Thu', value: formatPrice(stats.revenue), icon: TrendingUp, color: 'text-[#c9a96e]' },
    { label: 'Đơn Hàng', value: stats.orders.toString(), icon: ShoppingCart, color: 'text-blue-500' },
    { label: 'Sản Phẩm', value: stats.products.toString(), icon: Package, color: 'text-green-500' },
    { label: 'Khách Hàng', value: stats.customers.toString(), icon: Users, color: 'text-purple-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">Tổng quan hoạt động cửa hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-neutral-500">{label}</span>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Đơn Hàng Gần Đây</CardTitle>
            <Link href="/admin/orders" className="text-sm text-[#c9a96e] hover:underline">
              Xem tất cả →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <RecentOrdersTable />
        </CardContent>
      </Card>
    </div>
  )
}
