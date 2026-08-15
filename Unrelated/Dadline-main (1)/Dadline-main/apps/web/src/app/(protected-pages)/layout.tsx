import PostLoginLayout from "@/components/layouts/PostLoginLayout"
import { ReactNode } from "react"
import MobileBottomNav from "@/components/mobile-nav/MobileBottomNav"
import { DashboardHeaderProvider } from "@/components/template/DashboardHeaderProvider"

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="pishkhan-font min-h-screen">
      <DashboardHeaderProvider>
        <PostLoginLayout>
          {children}
          <MobileBottomNav />
        </PostLoginLayout>
      </DashboardHeaderProvider>
    </div>
  )
}

export default Layout
