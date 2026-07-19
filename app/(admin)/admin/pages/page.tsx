'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Page } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const supabase = createClient()
      const { data } = await supabase.from('pages').select('*').order('title')
      setPages(data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const deletePage = async (id: string) => {
    if (!confirm('Xóa trang này?')) return
    const supabase = createClient()
    await supabase.from('pages').delete().eq('id', id)
    setPages(pages.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Trang Nội Dung</h1>
          <p className="text-neutral-500 text-sm mt-1">{pages.length} trang — dùng để gắn vào Menu Điều Hướng hoặc Footer</p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="w-4 h-4" />
            Thêm Trang
          </Link>
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
              <th className="text-left px-6 py-3">Tiêu Đề</th>
              <th className="text-left px-6 py-3">Link (URL)</th>
              <th className="text-left px-6 py-3">Cập Nhật</th>
              <th className="text-right px-6 py-3">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12 text-neutral-400 text-sm">Đang tải...</td></tr>
            ) : pages.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-neutral-400 text-sm">Chưa có trang nào</td></tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{page.title}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500 font-mono">/pages/{page.slug}</td>
                  <td className="px-6 py-4 text-sm text-neutral-400">{formatDate(page.updated_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/pages/${page.id}`} className="text-neutral-400 hover:text-neutral-900">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => deletePage(page.id)} className="text-neutral-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
