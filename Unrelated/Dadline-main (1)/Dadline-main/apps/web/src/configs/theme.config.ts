import { THEME_ENUM } from "@/constants/theme.constant"
import type { Theme } from "@/@types/theme"

export const themeConfig: Theme = {
  themeSchema: "",
  direction: THEME_ENUM.DIR_RTL,
  mode: THEME_ENUM.MODE_LIGHT,
  panelExpand: false,
  controlSize: "md",
  layout: {
    type: THEME_ENUM.LAYOUT_COLLAPSIBLE_SIDE,
    sideNavCollapse: false,
  },
}
