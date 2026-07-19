'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load() {
    try {
      const supabase = createClient()
      let query = supabase
        .from('products')
        .select('*, category:categories(name)')
        .order('created_at', { ascending: false })
      if (search) query = query.ilike('name', `%${search}%`)
      const { data } = await query
      setProducts(data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [search])

  const toggleStatus = async (product: Product) => {
    const supabase = createClient()
    const newStatus = product.status === 'active' ? 'draft' : 'active'
    await supabase.from('products').update({ status: newStatus }).eq('id', product.id)
    setProducts(products.map((p) => p.id === product.id ? { ...p, status: newStatus } : p))
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Xóa sản phẩm này?')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    setProducts(products.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Sản Phẩm</h1>
          <p className="text-neutral-500 text-sm mt-1">{products.length} sản phẩm</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4" />
            Thêm Sản Phẩm
          </Link>
        </Button>
      </div>

      <Card className="mb-6 p-4">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border-0 text-sm focus:outline-none bg-transparent"
        />
      </Card>

      {loading ? (
        <div className="text-center py-20 text-neutral-400">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="mb-4">Chưa có sản phẩm nào</p>
          <Button asChild><Link href="/admin/products/new">Thêm Sản Phẩm Đầu Tiên</Link></Button>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Sản Phẩm</th>
                <th className="text-left px-6 py-3">Danh Mục</th>
                <th className="text-left px-6 py-3">Giá</th>
                <th className="text-left px-6 py-3">Kho</th>
                <th className="text-left px-6 py-3">Trạng Thái</th>
                <th className="text-right px-6 py-3">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 bg-neutral-100 flex-shrink-0">
                        {product.images[0] && (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        {product.sku && <p className="text-xs text-neutral-400">SKU: {product.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {(product.category as { name: string } | undefined)?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-yellow-600' : 'text-neutral-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={product.status === 'active' ? 'success' : product.status === 'draft' ? 'warning' : 'outline'}>
                      {product.status === 'active' ? 'Đang bán' : product.status === 'draft' ? 'Nháp' : 'Ẩn'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(product)}
                        className="p-1.5 hover:bg-neutral-100 rounded"
                        title={product.status === 'active' ? 'Ẩn' : 'Hiện'}
                      >
                        {product.status === 'active' ? <EyeOff className="w-4 h-4 text-neutral-500" /> : <Eye className="w-4 h-4 text-neutral-500" />}
                      </button>
                      <Link href={`/admin/products/${product.id}`} className="p-1.5 hover:bg-neutral-100 rounded">
                        <Edit className="w-4 h-4 text-neutral-500" />
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-1.5 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}
    </div>
  )
}
