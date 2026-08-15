import { cloneElement } from "react"
import type { CommonProps } from "@/@types/common"
import AuthSideBackground from "@/components/layouts/AuthLayout/AuthSide"

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
  return (
    <div className="flex h-full bg-white p-6 dark:bg-gray-800">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-95 px-8 xl:max-w-112.5">
          {children
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cloneElement(children as React.ReactElement<any>, {
                ...rest,
              })
            : null}
        </div>
      </div>

      <div className="relative hidden max-w-180 flex-1 overflow-hidden lg:flex 2xl:max-w-280">
        <AuthSideBackground />
      </div>
    </div>
  )
}

export default Side
