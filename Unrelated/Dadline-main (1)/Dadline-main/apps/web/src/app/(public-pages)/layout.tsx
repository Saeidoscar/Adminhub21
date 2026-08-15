import type { ReactNode } from "react"
import DadlineHeader from "./_components/DadlineHeader"
import DadlineFooter from "./_components/DadlineFooter"
import MobileBottomNav from "@/components/mobile-nav/MobileBottomNav"
import { LivePanel } from "@/components/live-panel/LivePanel"

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900/90 text-gray-950 dark:text-white">
      <DadlineHeader />
      <main>{children}</main>
      <DadlineFooter />
      <MobileBottomNav />
      <LivePanel />
    </div>
  )
}

export default PublicLayout
