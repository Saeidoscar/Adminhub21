"use client"

import { useEffect, useRef } from "react"
import {
  trackPublicView,
  type PublicViewResource,
} from "@/server/actions/trackPublicView"

type Props = {
  resource: PublicViewResource
  slug: string
}

const PublicViewTracker = ({ resource, slug }: Props) => {
  const trackedKey = useRef<string | null>(null)

  useEffect(() => {
    const key = `${resource}:${slug}`
    if (trackedKey.current === key) return

    trackedKey.current = key
    void trackPublicView(resource, slug)
  }, [resource, slug])

  return null
}

export default PublicViewTracker
