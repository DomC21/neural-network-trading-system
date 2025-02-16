import { ScrollArea } from "../ui/scroll-area"
import { type ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto py-6 px-4">
        <ScrollArea className="h-[calc(100vh-3rem)]">
          <div className="space-y-6">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
