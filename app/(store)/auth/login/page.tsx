'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
})

const setPasswordSchema = z.object({
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  confirm: z.string().min(6, 'Nhập lại mật khẩu'),
}).refine((data) => data.password === data.confirm, {
  message: 'Mật khẩu không khớp',
  path: ['confirm'],
})

type FormData = z.infer<typeof schema>
type SetPasswordData = z.infer<typeof setPasswordSchema>

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/account'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingInvite, setCheckingInvite] = useState(true)
  const [isInviteFlow, setIsInviteFlow] = useState(false)
  const [passwordSet, setPasswordSet] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const {
    register: registerSetPassword,
    handleSubmit: handleSetPasswordSubmit,
    formState: { errors: setPasswordErrors },
  } = useForm<SetPasswordData>({ resolver: zodResolver(setPasswordSchema) })

  useEffect(() => {
    const hash = window.location.hash
    const search = window.location.search
    // Supabase redirects invite/recovery links back here with either a PKCE
    // "code" param or (implicit flow) an access_token in the hash, usually
    // alongside "type=invite"/"type=recovery" — check broadly for any of them.
    const params = /type=invite|type=recovery|code=|access_token=/
    if (params.test(hash) || params.test(search)) {
      setIsInviteFlow(true)
    }
    setCheckingInvite(false)
  }, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setError('Email hoặc mật khẩu không đúng')
      setLoading(false)
    } else {
      router.push(redirectTo)
      router.refresh()
    }
  }

  const onSetPassword = async (data: SetPasswordData) => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setPasswordSet(true)
      setLoading(false)
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 1500)
    }
  }

  if (checkingInvite) return null

  if (isInviteFlow) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold tracking-[0.3em]">KHA</Link>
            <h1 className="text-xl font-semibold mt-6 mb-2">Đặt Mật Khẩu</h1>
            <p className="text-sm text-neutral-500">Tạo mật khẩu để hoàn tất kích hoạt tài khoản</p>
          </div>

          {passwordSet ? (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 text-center">
              ✓ Đặt mật khẩu thành công! Đang chuyển hướng...
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSetPasswordSubmit(onSetPassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu mới</Label>
                  <Input id="password" type="password" autoComplete="new-password" {...registerSetPassword('password')} />
                  {setPasswordErrors.password && <p className="text-red-500 text-xs">{setPasswordErrors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Nhập lại mật khẩu</Label>
                  <Input id="confirm" type="password" autoComplete="new-password" {...registerSetPassword('confirm')} />
                  {setPasswordErrors.confirm && <p className="text-red-500 text-xs">{setPasswordErrors.confirm.message}</p>}
                </div>
                <Button variant="brand" type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Đặt Mật Khẩu'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-[0.3em]">KHA</Link>
          <h1 className="text-xl font-semibold mt-6 mb-2">Đăng Nhập</h1>
          <p className="text-sm text-neutral-500">
            {redirectTo.startsWith('/admin') ? 'Đăng nhập vào trang quản trị' : 'Chào mừng trở lại'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="username" {...register('email')} />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          </div>
          <Button variant="brand" type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Chưa có tài khoản?{' '}
          <Link href="/auth/register" className="text-neutral-900 underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
