const BASE = 'https://provinces.open-api.vn/api/v1'

export type VnUnit = { code: number; name: string }

export async function getProvinces(): Promise<VnUnit[]> {
  try {
    const res = await fetch(`${BASE}/p/`)
    const data = await res.json()
    return data.map((p: VnUnit) => ({ code: p.code, name: p.name }))
  } catch {
    return []
  }
}

export async function getDistricts(provinceCode: number): Promise<VnUnit[]> {
  try {
    const res = await fetch(`${BASE}/p/${provinceCode}?depth=2`)
    const data = await res.json()
    return (data.districts || []).map((d: VnUnit) => ({ code: d.code, name: d.name }))
  } catch {
    return []
  }
}

export async function getWards(districtCode: number): Promise<VnUnit[]> {
  try {
    const res = await fetch(`${BASE}/d/${districtCode}?depth=2`)
    const data = await res.json()
    return (data.wards || []).map((w: VnUnit) => ({ code: w.code, name: w.name }))
  } catch {
    return []
  }
}
