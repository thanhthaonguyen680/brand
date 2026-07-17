'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Category, ProductSize } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SizeStockEditor } from '@/components/admin/SizeStockEditor'
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
  category_id: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ProductEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [sizes, setSizes] = useState<ProductSize[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft', featured: false, is_new: false, on_sale: false, stock: 0, price: 0 },
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: product }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)').eq('id', id).single(),
        supabase.from('categories').select('*').order('name'),
      ])

      if (product) {
        reset({
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          price: product.price,
          compare_price: product.compare_price || undefined,
          stock: product.stock,
          sku: product.sku || '',
          status: product.status,
          featured: product.featured,
          is_new: product.is_new ?? false,
          on_sale: product.on_sale ?? false,
          category_id: product.category_id || undefined,
        })
        setImages(product.images || [])
        setSizes(product.sizes || [])
        setTags(product.tags || [])
      }
      setCategories(cats || [])
      setLoading(false)
    }
    load()
  }, [id, reset])

  const addImage = () => {
    if (imageInput.trim()) {
      setImages([...images, imageInput.trim()])
      setImageInput('')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({
        ...data,
        compare_price: data.compare_price || null,
        category_id: data.category_id || null,
        images,
        sizes,
        tags,
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      router.push('/admin/products')
    }
  }

  if (loading) return <div className="flex justify-center py-20 text-neutral-400">Đang tải...</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="hover:opacity-60">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Chỉnh Sửa Sản Phẩm</h1>
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
                <Input {...register('name')} />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea {...register('description')} rows={4} />
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
                  <Label>Giá gốc (để hiện sale)</Label>
                  <Input type="number" {...register('compare_price', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Số lượng tồn kho</Label>
                  <Input type="number" {...register('stock', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input {...register('sku')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Hình Ảnh</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="URL hình ảnh"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <Button type="button" variant="outline" onClick={addImage}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative aspect-square bg-neutral-100">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                  defaultValue={watch('status')}
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
              <div className="space-y-2 pt-4">
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
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
              <Select
                defaultValue={watch('category_id') || ''}
                onValueChange={(v) => setValue('category_id', v)}
              >
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
