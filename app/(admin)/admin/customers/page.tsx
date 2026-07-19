import { createClient } from '@/lib/supabase/server'
import { UserProfile } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

async function getCustomers(): Promise<UserProfile[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Khách Hàng</h1>
        <p className="text-neutral-500 text-sm mt-1">{customers.length} tài khoản</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
              <th className="text-left px-6 py-3">Tên</th>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Điện Thoại</th>
              <th className="text-left px-6 py-3">Vai Trò</th>
              <th className="text-left px-6 py-3">Ngày Tham Gia</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-neutral-400 text-sm">
                  Chưa có khách hàng nào
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-neutral-200 flex items-center justify-center text-sm font-medium text-neutral-600">
                        {(customer.full_name || customer.email)[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{customer.full_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{customer.email}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{customer.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={customer.role === 'admin' ? 'default' : 'outline'}>
                      {customer.role === 'admin' ? 'Admin' : 'Khách hàng'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-400">
                    {formatDate(customer.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  )
}
