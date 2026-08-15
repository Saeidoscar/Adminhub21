import type { ReactNode } from "react"

const ContractLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900/90 text-gray-950 dark:text-white">
      <main>{children}</main>
    </div>
  )
}

export default ContractLayout
