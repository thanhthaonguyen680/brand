'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Lead } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const supabase = createClient()
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
      setLeads(data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const deleteLead = async (id: string) => {
    if (!confirm('Xóa khách hàng này?')) return
    const supabase = createClient()
    await supabase.from('leads').delete().eq('id', id)
    setLeads(leads.filter((l) => l.id !== id))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Khách Hàng Tiềm Năng</h1>
        <p className="text-neutral-500 text-sm mt-1">{leads.length} liên hệ từ popup</p>
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
              <th className="text-left px-6 py-3">Tên</th>
              <th className="text-left px-6 py-3">Điện Thoại</th>
              <th className="text-left px-6 py-3">Ngày Gửi</th>
              <th className="text-right px-6 py-3">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-neutral-400 text-sm">Đang tải...</td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-neutral-400 text-sm">Chưa có khách hàng nào</td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 text-sm">{lead.name}</td>
                  <td className="px-6 py-4 text-sm">{lead.phone}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{formatDate(lead.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteLead(lead.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
