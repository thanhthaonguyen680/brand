'use client'

import { Plus, X } from 'lucide-react'
import { ProductSize } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

interface SizeStockEditorProps {
  sizes: ProductSize[]
  onChange: (sizes: ProductSize[]) => void
}

export function SizeStockEditor({ sizes, onChange }: SizeStockEditorProps) {
  const addSize = () => {
    const next = PRESET_SIZES.find((s) => !sizes.some((sz) => sz.size === s)) || PRESET_SIZES[0]
    onChange([...sizes, { size: next, stock: 0 }])
  }

  const updateSize = (index: number, field: keyof ProductSize, value: string | number) => {
    onChange(sizes.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  const removeSize = (index: number) => {
    onChange(sizes.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {sizes.map((s, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
          <Select value={s.size} onValueChange={(v) => updateSize(i, 'size', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRESET_SIZES.map((preset) => (
                <SelectItem key={preset} value={preset}>{preset}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min={0}
            value={s.stock}
            onChange={(e) => updateSize(i, 'stock', Number(e.target.value))}
            placeholder="Số lượng"
          />
          <button
            type="button"
            onClick={() => removeSize(i)}
            className="text-neutral-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addSize} className="gap-1.5">
        <Plus className="w-4 h-4" /> Thêm size
      </Button>

      {sizes.length > 0 && (
        <p className="text-xs text-neutral-400">
          Tổng theo size: {sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)} sản phẩm
        </p>
      )}
    </div>
  )
}
