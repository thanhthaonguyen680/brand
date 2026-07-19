'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Category, ProductSize } from '@/lib/types'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { SizeStockEditor } from '@/components/admin/SizeStockEditor'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  name: z.string().min(1, 'Nhập tên sản phẩm'),
  slug: z.string().min(1, 'Nhập slug'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá không hợp lệ'),
  compare_price: z.number().optional(),
  stock: z.number().min(0),
  sku: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived']),
  featured: z.boolean(),
  is_new: z.boolean(),
  on_sale: z.boolean(),
  allow_preorder: z.boolean(),
  category_id: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ProductFormPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [sizes, setSizes] = useState<ProductSize[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft', featured: false, is_new: false, on_sale: false, allow_preorder: false, stock: 0, price: 0 },
  })

  const nameValue = watch('name')

  useEffect(() => {
    if (nameValue) setValue('slug', slugify(nameValue))
  }, [nameValue, setValue])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*').order('name')
      setCategories(data || [])
    }
    load()
  }, [])



  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('products').insert({
      ...data,
      compare_price: data.compare_price || null,
      category_id: data.category_id || null,
      images,
      sizes,
      tags,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/products')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="hover:opacity-60">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Thêm Sản Phẩm Mới</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Thông Tin Cơ Bản</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên sản phẩm *</Label>
                <Input {...register('name')} placeholder="VD: Áo Blazer Luxury" />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea {...register('description')} rows={4} placeholder="Mô tả chi tiết sản phẩm..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Giá & Kho</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giá bán (VNĐ) *</Label>
                  <Input type="number" {...register('price', { valueAsNumber: true })} />
                  {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Giá gốc (hiển thị giảm giá)</Label>
                  <Input type="number" {...register('compare_price', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Số lượng tồn kho</Label>
                  <Input type="number" {...register('stock', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input {...register('sku')} placeholder="VD: BLAZER-001" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Hình Ảnh</CardTitle></CardHeader>
            <CardContent>
              <ImageUpload images={images} onChange={setImages} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Size & Số Lượng</CardTitle></CardHeader>
            <CardContent>
              <SizeStockEditor sizes={sizes} onChange={setSizes} />
              <p className="text-xs text-neutral-400 mt-3">Để trống nếu sản phẩm không phân loại theo size.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Thêm tag..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>Thêm</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="bg-neutral-100 text-sm px-3 py-1 flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Xuất Bản</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  defaultValue="draft"
                  onValueChange={(v) => setValue('status', v as 'active' | 'draft' | 'archived')}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang bán</SelectItem>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="archived">Ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" {...register('featured')} className="w-4 h-4" />
                <Label htmlFor="featured">Sản phẩm nổi bật</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_new" {...register('is_new')} className="w-4 h-4" />
                <Label htmlFor="is_new">Hàng mới về</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="on_sale" {...register('on_sale')} className="w-4 h-4" />
                <Label htmlFor="on_sale">Khuyến mãi (Sale Off)</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="allow_preorder" {...register('allow_preorder')} className="w-4 h-4" />
                <Label htmlFor="allow_preorder">Cho đặt trước khi hết hàng (Pre-order)</Label>
              </div>

              <div className="space-y-2 pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/admin/products')}>
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Danh Mục</CardTitle></CardHeader>
            <CardContent>
              <Select onValueChange={(v) => setValue('category_id', v)}>
                <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
