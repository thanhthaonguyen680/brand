'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const SIZE_ROWS = [
  { size: 'XS', weight: 'Dưới 38kg', height: '1m40 - 1m45' },
  { size: 'S', weight: '38 - 43kg', height: '1m45 - 1m53' },
  { size: 'M', weight: '43 - 46kg', height: '1m50 - 1m55' },
  { size: 'L', weight: '46 - 53kg', height: '1m55 - 1m60' },
  { size: 'XL', weight: '53 - 58kg', height: '1m60 - 1m65' },
  { size: 'XXL', weight: '58 - 66kg', height: '1m65 - 1m70' },
]

export function SizeChart() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs underline text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        Bảng size
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl p-8">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-6">Bảng Size Cho Nữ</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
                  <th className="text-left py-2">Size</th>
                  <th className="text-left py-2">Cân Nặng (kg)</th>
                  <th className="text-left py-2">Chiều Cao (m)</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map((row) => (
                  <tr key={row.size} className="border-b border-neutral-100">
                    <td className="py-3 font-medium">{row.size}</td>
                    <td className="py-3 text-neutral-600">{row.weight}</td>
                    <td className="py-3 text-neutral-600">{row.height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
