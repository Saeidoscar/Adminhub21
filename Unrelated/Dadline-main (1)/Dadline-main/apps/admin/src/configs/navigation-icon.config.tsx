import {
  PiChartPieSliceDuotone,
  PiGearSixDuotone,
  PiHeadsetDuotone,
  PiPulseDuotone,
  PiUsersThreeDuotone,
  PiWalletDuotone,
} from "react-icons/pi"
import type { JSX } from "react"

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
  dashboard: <PiChartPieSliceDuotone />,
  users: <PiUsersThreeDuotone />,
  finance: <PiWalletDuotone />,
  operations: <PiPulseDuotone />,
  tickets: <PiHeadsetDuotone />,
  settings: <PiGearSixDuotone />,
}

export default navigationIcon
