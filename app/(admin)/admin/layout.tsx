import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

// Overrides the site-wide manifest (which has start_url "/") so that
// "Add to Home Screen" from any /admin page launches into /admin.
export const metadata: Metadata = {
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KHA Admin',
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-60 px-4 pb-4 pt-20 lg:p-8">
        {children}
      </main>
    </div>
  )
}
