import { createClient } from '@/lib/supabase/server'
import { Product, Category } from '@/lib/types'
import { ProductCard } from '@/components/store/ProductCard'
import { ProductSort } from '@/components/store/ProductSort'

async function getProducts(searchParams: {
  category?: string
  featured?: string
  new?: string
  search?: string
  sort?: string
}): Promise<Product[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('status', 'active')

    if (searchParams.category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', searchParams.category)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    if (searchParams.featured === 'true') {
      query = query.eq('featured', true)
    }

    if (searchParams.new === 'true') {
      query = query.eq('is_new', true)
    }

    if (searchParams.search) {
      query = query.ilike('name', `%${searchParams.search}%`)
    }

    const sort = searchParams.sort || 'newest'
    if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else if (sort === 'price_asc') query = query.order('price', { ascending: true })
    else if (sort === 'price_desc') query = query.order('price', { ascending: false })

    const { data } = await query
    return data || []
  } catch {
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('*').order('name')
    return data || []
  } catch {
    return []
  }
}

interface PageProps {
  searchParams: Promise<{ category?: string; featured?: string; new?: string; search?: string; sort?: string }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ])

  const pageTitle = params.new === 'true'
    ? 'Hàng Mới Về'
    : params.featured === 'true'
      ? 'Sản Phẩm Nổi Bật'
      : params.category
        ? categories.find((c) => c.slug === params.category)?.name ?? 'Bộ Sưu Tập'
        : 'Tất Cả Sản Phẩm'

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-brand-secondary)] mb-2">Khám Phá</p>
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
      </div>

      <div className="flex items-center justify-between mb-8">
        <span className="text-sm text-neutral-500">{products.length} sản phẩm</span>
        <ProductSort current={params.sort || 'newest'} />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 text-neutral-400">
          <p className="text-lg mb-2">Không có sản phẩm nào</p>
          <p className="text-sm">Hãy thử danh mục khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
