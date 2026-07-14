'use client'

import { Plus, Trash2 } from 'lucide-react'
import { MenuItem } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LinkListEditorProps {
  items: MenuItem[]
  onChange: (items: MenuItem[]) => void
  addLabel?: string
}

export function LinkListEditor({ items, onChange, addLabel = 'Thêm mục' }: LinkListEditorProps) {
  const update = (index: number, field: keyof MenuItem, value: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const add = () => onChange([...items, { label: 'Mục mới', label_en: 'New item', href: '/products' }])
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
          <div>
            {i === 0 && <Label className="text-xs mb-1 block">Tên (VI)</Label>}
            <Input value={item.label} onChange={(e) => update(i, 'label', e.target.value)} placeholder="Tên tiếng Việt" />
          </div>
          <div>
            {i === 0 && <Label className="text-xs mb-1 block">Tên (EN)</Label>}
            <Input value={item.label_en} onChange={(e) => update(i, 'label_en', e.target.value)} placeholder="English name" />
          </div>
          <div>
            {i === 0 && <Label className="text-xs mb-1 block">Link (href)</Label>}
            <Input value={item.href} onChange={(e) => update(i, 'href', e.target.value)} placeholder="/products" />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className={`hover:text-red-500 text-neutral-400 ${i === 0 ? 'mt-5' : ''}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-sm text-[#c9a96e] hover:underline"
      >
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  )
}
