import { createClient } from '@/lib/supabase/server'
import { Product } from '@/lib/types'
import { ProductCard } from '@/components/store/ProductCard'

export const dynamic = 'force-dynamic'

async function getSaleProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('status', 'active')
      .eq('on_sale', true)
      .order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export default async function SalePage() {
  const products = await getSaleProducts()

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#c9a96e] mb-2">Ưu Đãi</p>
        <h1 className="text-3xl font-bold">Khuyến Mãi</h1>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 text-neutral-400">
          <p className="text-lg mb-2">Chưa có sản phẩm khuyến mãi</p>
          <p className="text-sm">Quay lại sau để không bỏ lỡ ưu đãi</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-8">{products.length} sản phẩm</p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
