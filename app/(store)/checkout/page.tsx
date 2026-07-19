'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { useCart } from '@/store/cart'
import { createClient } from '@/lib/supabase/client'
import { StoreSettings } from '@/lib/types'
import { getProvinces, getDistricts, getWards, VnUnit } from '@/lib/vn-address'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice } from '@/lib/utils'

const schema = z.object({
  full_name: z.string().min(2, 'Nhập họ tên'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  address: z.string().min(5, 'Nhập địa chỉ'),
  city: z.string().min(2, 'Nhập tỉnh/thành phố'),
  district: z.string().min(2, 'Nhập quận/huyện'),
  ward: z.string().min(2, 'Nhập phường/xã'),
  notes: z.string().optional(),
  payment_method: z.enum(['bank_transfer', 'paypal', 'cod']),
  promo_code: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const SHIPPING_FEE = 50000
const FREE_SHIPPING_THRESHOLD = 2000000

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: '🏦' },
  { value: 'paypal', label: 'PayPal', icon: '💳' },
  { value: 'cod', label: 'Thanh toán khi nhận hàng', icon: '💵' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [settings, setSettings] = useState<Partial<StoreSettings>>({})
  const [provinces, setProvinces] = useState<VnUnit[]>([])
  const [districts, setDistricts] = useState<VnUnit[]>([])
  const [wards, setWards] = useState<VnUnit[]>([])
  const [addressLoading, setAddressLoading] = useState<'districts' | 'wards' | null>(null)

  const subtotal = totalPrice()
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shippingFee - discount

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { payment_method: 'cod' },
  })

  const paymentMethod = watch('payment_method')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('store_settings')
        .select('bank_name, bank_account_number, bank_account_holder, bank_qr_url, paypal_account')
        .eq('id', 1)
        .single()
      if (data) setSettings(data)
    }
    load()
    getProvinces().then(setProvinces)
  }, [])

  const handleProvinceChange = async (code: string) => {
    const province = provinces.find((p) => String(p.code) === code)
    if (!province) return
    setValue('city', province.name, { shouldValidate: true })
    setValue('district', '')
    setValue('ward', '')
    setDistricts([])
    setWards([])
    setAddressLoading('districts')
    const list = await getDistricts(province.code)
    setDistricts(list)
    setAddressLoading(null)
  }

  const handleDistrictChange = async (code: string) => {
    const district = districts.find((d) => String(d.code) === code)
    if (!district) return
    setValue('district', district.name, { shouldValidate: true })
    setValue('ward', '')
    setWards([])
    setAddressLoading('wards')
    const list = await getWards(district.code)
    setWards(list)
    setAddressLoading(null)
  }

  const handleWardChange = (code: string) => {
    const ward = wards.find((w) => String(w.code) === code)
    if (!ward) return
    setValue('ward', ward.name, { shouldValidate: true })
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500 mb-6">Giỏ hàng trống</p>
        <Button variant="brand" onClick={() => router.push('/products')}>Tiếp Tục Mua Sắm</Button>
      </div>
    )
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            price: i.product.price,
            product_name: i.product.name,
            product_image: i.product.images[0] || null,
            size: i.size || null,
          })),
          shipping_address: {
            full_name: data.full_name,
            phone: data.phone,
            email: data.email,
            address: data.address,
            city: data.city,
            district: data.district,
            ward: data.ward,
            country: 'VN',
          },
          payment_method: data.payment_method,
          subtotal,
          shipping_fee: shippingFee,
          discount,
          total,
          notes: data.notes,
          promo_code: data.promo_code,
        }),
      })

      const result = await res.json()

      if (result.order_id) {
        clearCart()
        router.push(`/checkout/success?order=${result.order_number}`)
      }
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-10">Thanh Toán</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-8">
          {/* Shipping */}
          <div>
            <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-neutral-200">Thông Tin Giao Hàng</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="full_name">Họ và tên</Label>
                  <Input id="full_name" {...register('full_name')} placeholder="Nguyễn Văn A" />
                  {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="email@example.com" />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" {...register('phone')} placeholder="0901234567" />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input id="address" {...register('address')} placeholder="Số nhà, tên đường" />
                {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tỉnh/Thành phố</Label>
                  <Select onValueChange={handleProvinceChange} disabled={provinces.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={provinces.length === 0 ? 'Đang tải...' : 'Chọn tỉnh/thành'} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((p) => (
                        <SelectItem key={p.code} value={String(p.code)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Quận/Huyện</Label>
                  <Select onValueChange={handleDistrictChange} disabled={districts.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={addressLoading === 'districts' ? 'Đang tải...' : 'Chọn quận/huyện'} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d.code} value={String(d.code)}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && <p className="text-red-500 text-xs">{errors.district.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phường/Xã</Label>
                  <Select onValueChange={handleWardChange} disabled={wards.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={addressLoading === 'wards' ? 'Đang tải...' : 'Chọn phường/xã'} />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((w) => (
                        <SelectItem key={w.code} value={String(w.code)}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ward && <p className="text-red-500 text-xs">{errors.ward.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú đơn hàng (tùy chọn)</Label>
                <Input id="notes" {...register('notes')} placeholder="Ghi chú thêm..." />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-neutral-200">Phương Thức Thanh Toán</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                    paymentMethod === method.value ? 'border-[var(--color-brand-primary)] bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <input
                    type="radio"
                    value={method.value}
                    {...register('payment_method')}
                    className="sr-only"
                  />
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-sm font-medium">{method.label}</span>
                  {paymentMethod === method.value && (
                    <span className="ml-auto text-xs text-neutral-500">✓ Đã chọn</span>
                  )}
                </label>
              ))}
            </div>

            {paymentMethod === 'bank_transfer' && (
              <div className="mt-4 bg-[var(--color-brand-accent)] p-5 text-sm flex gap-5">
                {settings.bank_qr_url && (
                  <div className="relative w-32 h-32 flex-shrink-0 bg-white">
                    <Image src={settings.bank_qr_url} alt="QR chuyển khoản" fill className="object-contain" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <p><span className="text-neutral-500">Ngân hàng:</span> <span className="font-medium">{settings.bank_name || 'Đang cập nhật'}</span></p>
                  <p><span className="text-neutral-500">Số tài khoản:</span> <span className="font-medium">{settings.bank_account_number || 'Đang cập nhật'}</span></p>
                  <p><span className="text-neutral-500">Chủ tài khoản:</span> <span className="font-medium">{settings.bank_account_holder || 'Đang cập nhật'}</span></p>
                  <p className="text-neutral-500 pt-2">Vui lòng ghi nội dung chuyển khoản là <span className="font-medium text-neutral-900">họ tên + số điện thoại</span> để chúng tôi đối soát. Đơn hàng sẽ được xử lý sau khi xác nhận đã nhận thanh toán.</p>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="mt-4 bg-[var(--color-brand-accent)] p-5 text-sm space-y-1.5">
                <p><span className="text-neutral-500">Tài khoản PayPal:</span> <span className="font-medium">{settings.paypal_account || 'Đang cập nhật'}</span></p>
                <p className="text-neutral-500 pt-2">Vui lòng ghi chú số điện thoại khi chuyển. Đơn hàng sẽ được xử lý sau khi xác nhận đã nhận thanh toán.</p>
              </div>
            )}
          </div>

          <Button variant="brand" type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Đang xử lý...' : `Đặt Hàng — ${formatPrice(total)}`}
          </Button>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--color-brand-accent)] p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-6">Đơn Hàng ({items.length} sản phẩm)</h2>
            <div className="space-y-4 mb-6">
              {items.map(({ product, quantity, size }) => (
                <div key={`${product.id}-${size || ''}`} className="flex gap-3">
                  <div className="relative w-16 h-20 bg-neutral-200 flex-shrink-0">
                    {product.images[0] && (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    )}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-brand-primary)] text-white text-xs flex items-center justify-center">
                      {quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    {size && <p className="text-xs text-neutral-500">Size: {size}</p>}
                    <p className="text-sm text-neutral-600">{formatPrice(product.price * quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="flex gap-2 mb-6">
              <Input {...register('promo_code')} placeholder="Mã giảm giá" className="bg-white" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  const code = (document.querySelector('[name=promo_code]') as HTMLInputElement)?.value
                  if (!code) return
                  const res = await fetch(`/api/campaigns/validate?code=${code}&total=${subtotal}`)
                  const data = await res.json()
                  if (data.discount) setDiscount(data.discount)
                  else alert('Mã không hợp lệ')
                }}
              >
                Áp dụng
              </Button>
            </div>

            <div className="border-t border-neutral-300 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Phí vận chuyển</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-neutral-300">
                <span>Tổng cộng</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
