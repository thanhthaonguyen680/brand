'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const SIZE_ROWS = [
  { size: 'S', bust: '78 - 83', waist: '56 - 60', hip: '85 - 89' },
  { size: 'M', bust: '84 - 89', waist: '60 - 66', hip: '89 - 94' },
  { size: 'L', bust: '90 - 95', waist: '67 - 72', hip: '95 - 100' },
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
            <h2 className="text-lg font-bold mb-1">Hướng Dẫn Chọn Size</h2>
            <p className="text-xs text-neutral-500 mb-6">Áo, đầm, váy nữ, quần — đơn vị: cm</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
                  <th className="text-left py-2">Size</th>
                  <th className="text-left py-2">Vòng 1</th>
                  <th className="text-left py-2">Vòng 2</th>
                  <th className="text-left py-2">Vòng 3</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map((row) => (
                  <tr key={row.size} className="border-b border-neutral-100">
                    <td className="py-3 font-medium">{row.size}</td>
                    <td className="py-3 text-neutral-600">{row.bust}</td>
                    <td className="py-3 text-neutral-600">{row.waist}</td>
                    <td className="py-3 text-neutral-600">{row.hip}</td>
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
