"use client" // 1536 // 1280 // 1024 // 768 // 640 // 576

import { useEffect, useState } from "react"
import isBrowser from "../isBrowser"

const twBreakpoint: Record<"2xl" | "xl" | "lg" | "md" | "sm" | "xs", string> = {
  "2xl": "1536",
  xl: "1280",
  lg: "1024",
  md: "768",
  sm: "640",
  xs: "576",
}

const breakpointInt = (str = "") => {
  return parseInt(str.replace("px", ""))
}

const breakpoint = {
  "2xl": breakpointInt(twBreakpoint["2xl"]),
  xl: breakpointInt(twBreakpoint.xl),
  lg: breakpointInt(twBreakpoint.lg),
  md: breakpointInt(twBreakpoint.md),
  sm: breakpointInt(twBreakpoint.sm),
  xs: breakpointInt(twBreakpoint.xs),
}

const getAllSizes = (comparator = "smaller") => {
  const currentWindowWidth = window.innerWidth
  return Object.fromEntries(
    Object.entries(breakpoint).map(([key, value]) => [
      key,
      comparator === "larger"
        ? currentWindowWidth > value
        : currentWindowWidth < value,
    ]),
  )
}

const getResponsiveState = () => {
  if (isBrowser) {
    const currentWindowWidth = window.innerWidth
    return {
      windowWidth: currentWindowWidth,
      larger: getAllSizes("larger"),
      smaller: getAllSizes("smaller"),
    }
  }
  return {
    windowWidth: 0,
    larger: {
      lg: false,
      md: false,
      sm: false,
      xs: false,
      xl: false,
      "2xl": false,
    },
    smaller: {
      lg: false,
      md: false,
      sm: false,
      xs: false,
      xl: false,
      "2xl": false,
    },
  }
}

const useResponsive = () => {
  const [responsive, setResponsive] = useState(getResponsiveState())

  const resizeHandler = () => {
    const responsiveState = getResponsiveState()
    setResponsive(responsiveState)
  }

  useEffect(() => {
    if (!isBrowser) return
    window.addEventListener("resize", resizeHandler)
    return () => window.removeEventListener("resize", resizeHandler)
  }, [responsive.windowWidth])

  return responsive
}

export default useResponsive
