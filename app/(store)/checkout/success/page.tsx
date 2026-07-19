'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function SuccessContent() {
  const params = useSearchParams()
  const orderNumber = params.get('order')

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold mb-4">Đặt Hàng Thành Công!</h1>
      <p className="text-neutral-600 mb-2">Cảm ơn bạn đã mua sắm tại KHA.</p>
      <p className="text-neutral-600 mb-8">
        KHA sẽ kiểm tra và xử lý đơn hàng của bạn trong thời gian sớm nhất, dự kiến giao hàng trong{' '}
        <span className="font-medium text-neutral-900">3-5 ngày làm việc</span>.
      </p>

      {orderNumber && (
        <div className="bg-[var(--color-brand-accent)] p-6 mb-8">
          <p className="text-sm text-neutral-500 mb-1">Mã đơn hàng của bạn</p>
          <p className="text-lg font-semibold tracking-wide">{orderNumber}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderNumber && (
          <Button variant="brand" size="lg" asChild>
            <Link href={`/track/${orderNumber}`}>Theo Dõi Đơn Hàng</Link>
          </Button>
        )}
        <Button variant="outline" size="lg" asChild>
          <Link href="/products">Tiếp Tục Mua Sắm</Link>
        </Button>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-neutral-300">Đang tải...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
