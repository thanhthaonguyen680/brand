'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Campaign } from '@/lib/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const TYPE_LABELS: Record<string, string> = {
  percentage: 'Giảm theo %',
  fixed: 'Giảm cố định (VNĐ)',
  free_shipping: 'Miễn phí vận chuyển',
  bogo: 'Mua 1 tặng 1',
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', type: 'percentage', value: 0,
    code: '', min_order_value: 0, max_uses: '',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: '', status: 'active',
  })

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })
    setCampaigns(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('campaigns').insert({
      ...form,
      value: Number(form.value),
      min_order_value: Number(form.min_order_value),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      end_date: form.end_date || null,
      code: form.code || null,
    })
    if (!error) {
      await load()
      setOpen(false)
    }
    setSaving(false)
  }

  const deleteCampaign = async (id: string) => {
    if (!confirm('Xóa chiến dịch này?')) return
    const supabase = createClient()
    await supabase.from('campaigns').delete().eq('id', id)
    setCampaigns(campaigns.filter((c) => c.id !== id))
  }

  const toggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'inactive' : 'active'
    const supabase = createClient()
    await supabase.from('campaigns').update({ status: newStatus }).eq('id', campaign.id)
    setCampaigns(campaigns.map((c) => c.id === campaign.id ? { ...c, status: newStatus as Campaign['status'] } : c))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Chiến Dịch & Khuyến Mãi</h1>
          <p className="text-neutral-500 text-sm mt-1">{campaigns.length} chiến dịch</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4" />Tạo Chiến Dịch</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tạo Chiến Dịch Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tên chiến dịch *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại giảm giá</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Giá trị {form.type === 'percentage' ? '(%)' : '(VNĐ)'}</Label>
                  <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã voucher</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: SALE20" />
                </div>
                <div className="space-y-2">
                  <Label>Đơn tối thiểu (VNĐ)</Label>
                  <Input type="number" value={form.min_order_value} onChange={(e) => setForm({ ...form, min_order_value: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày bắt đầu</Label>
                  <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Ngày kết thúc</Label>
                  <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Giới hạn số lần dùng (để trống = không giới hạn)</Label>
                <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={save} className="flex-1" disabled={!form.name || saving}>
                  {saving ? 'Đang lưu...' : 'Tạo Chiến Dịch'}
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neutral-400">Đang tải...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="mb-4">Chưa có chiến dịch nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'expired' ? 'destructive' : 'outline'}>
                        {campaign.status === 'active' ? 'Đang chạy' : campaign.status === 'expired' ? 'Hết hạn' : 'Tạm dừng'}
                      </Badge>
                      <Badge variant="outline">{TYPE_LABELS[campaign.type]}</Badge>
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-neutral-500 mb-3">{campaign.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                      <span>Giảm: <strong>{campaign.type === 'percentage' ? `${campaign.value}%` : formatPrice(campaign.value)}</strong></span>
                      {campaign.code && <span>Mã: <strong className="font-mono bg-neutral-100 px-2">{campaign.code}</strong></span>}
                      {campaign.min_order_value > 0 && <span>Đơn tối thiểu: <strong>{formatPrice(campaign.min_order_value)}</strong></span>}
                      <span>Đã dùng: <strong>{campaign.uses_count}{campaign.max_uses ? `/${campaign.max_uses}` : ''}</strong></span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      {formatDate(campaign.start_date)} {campaign.end_date ? `→ ${formatDate(campaign.end_date)}` : '→ Không giới hạn'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(campaign)}>
                      {campaign.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                    </Button>
                    <button onClick={() => deleteCampaign(campaign.id)} className="p-1.5 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
