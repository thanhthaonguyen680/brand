'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const DISMISSED_KEY = 'lead_popup_dismissed'

export function LeadPopup({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem(DISMISSED_KEY)) {
      setOpen(true)
    }
  }, [])

  const close = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setOpen(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setSubmitting(true)
    setError('')
    const supabase = createClient()
    const { error: submitError } = await supabase
      .from('leads')
      .insert({ name: name.trim(), phone: phone.trim() })

    if (submitError) {
      setError('Có lỗi xảy ra, vui lòng thử lại.')
      setSubmitting(false)
      return
    }

    sessionStorage.setItem(DISMISSED_KEY, '1')
    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => setOpen(false), 1800)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative bg-white w-full max-w-sm shadow-2xl p-8">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <p className="text-lg font-medium">Cảm ơn bạn!</p>
            <p className="text-sm text-neutral-500 mt-2">Chúng tôi sẽ liên hệ sớm nhất.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2 pr-6">{title}</h2>
            <p className="text-sm text-neutral-500 mb-6">{description}</p>
            <form onSubmit={submit} className="space-y-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Họ và tên"
                required
              />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại"
                type="tel"
                required
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Gửi Thông Tin'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
