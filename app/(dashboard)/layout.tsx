import Sidebar from '@/components/Sidebar'
import { ToastProvider } from '@/components/Toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Sidebar />
        {/* Main content — offset by sidebar width on md+ */}
        <main className="md:ml-56 px-5 md:px-8 py-6 md:py-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
