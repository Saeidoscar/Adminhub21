import { useSyncExternalStore } from "react"

let isOpen = false
const listeners = new Set<() => void>()

export const liveDrawerStore = {
  open: () => {
    isOpen = true
    listeners.forEach((l) => l())
  },
  close: () => {
    isOpen = false
    listeners.forEach((l) => l())
  },
  toggle: () => {
    isOpen = !isOpen
    listeners.forEach((l) => l())
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => isOpen,
}

export const useLiveDrawer = () => {
  const open = useSyncExternalStore(
    liveDrawerStore.subscribe,
    liveDrawerStore.getSnapshot,
    liveDrawerStore.getSnapshot,
  )

  return {
    isOpen: open,
    openDrawer: liveDrawerStore.open,
    closeDrawer: liveDrawerStore.close,
    toggleDrawer: liveDrawerStore.toggle,
  }
}
