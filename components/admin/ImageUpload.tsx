'use client'

import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  bucket?: string
}

export function ImageUpload({ images, onChange, bucket = 'products' }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const addUrl = () => {
    if (urlInput.trim()) {
      onChange([...images, urlInput.trim()])
      setUrlInput('')
    }
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      onChange([...images, data.publicUrl])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      await uploadFile(file)
    }
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Upload buttons */}
      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Dán URL ảnh..."
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={addUrl} className="flex-shrink-0">
          + URL
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-shrink-0 gap-2"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Đang tải...</>
          ) : (
            <><Upload className="w-4 h-4" /> Từ máy</>
          )}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-square bg-neutral-100 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-neutral-900/70 text-white text-[10px] px-1.5 py-0.5">
                  Chính
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
