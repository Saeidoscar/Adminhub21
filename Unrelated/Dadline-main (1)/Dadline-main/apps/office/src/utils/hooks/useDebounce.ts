"use client"

// eslint-disable-next-line @typescript-eslint/no-explicit-any

import debounce from "lodash/debounce"
import type { DebounceSettingsLeading } from "lodash"
function useDebounce<T extends (...args: any) => any>(
  func: T,
  wait: number | undefined,
  options?: DebounceSettingsLeading,
) {
  return debounce(func, wait, options)
}

export default useDebounce
