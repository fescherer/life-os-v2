import { Footer } from '@/components/footer'
import { Menu } from '@/components/menu'

export default function LifeOsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Menu />
        <main className="bg-base-200 border-base-300 mx-4 my-2 flex-1 rounded border p-4 shadow">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  )
}
