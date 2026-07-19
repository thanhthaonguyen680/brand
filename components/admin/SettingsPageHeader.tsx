'use client'

import { Button } from '@/components/ui/button'

interface SettingsPageHeaderProps {
  title: string
  subtitle: string
  saving: boolean
  saved: boolean
  error: string
  onSave: () => void
}

export function SettingsPageHeader({ title, subtitle, saving, saved, error, onSave }: SettingsPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-neutral-500 text-sm mt-1">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Button onClick={onSave} disabled={saving}>
          {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu' : 'Lưu Thay Đổi'}
        </Button>
        {error && <p className="text-red-500 text-xs max-w-xs text-right">{error}</p>}
      </div>
    </div>
  )
}
