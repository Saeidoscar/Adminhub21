"use client"

import Button from "@/components/ui/Button"
import { useEffect, useRef, useState } from "react"
import { TbEraser, TbSignature } from "react-icons/tb"

type Props = {
  onChange: (dataUrl: string | null) => void
}

const SignatureCanvas = ({ onChange }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasInk, setHasInk] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scale = window.devicePixelRatio || 1
    canvas.width = rect.width * scale
    canvas.height = rect.height * scale
    const context = canvas.getContext("2d")
    if (!context) return
    context.scale(scale, scale)
    context.lineCap = "round"
    context.lineJoin = "round"
    context.lineWidth = 2.4
    context.strokeStyle = "#111827"
  }, [])

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const rect = canvas?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext("2d")
    if (!context) return
    const current = point(event)
    context.beginPath()
    context.moveTo(current.x, current.y)
    setIsDrawing(true)
    setHasInk(true)
  }

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const context = canvasRef.current?.getContext("2d")
    if (!context) return
    const current = point(event)
    context.lineTo(current.x, current.y)
    context.stroke()
    onChange(canvasRef.current?.toDataURL("image/png") ?? null)
  }

  const stop = () => {
    setIsDrawing(false)
    onChange(
      hasInk ? (canvasRef.current?.toDataURL("image/png") ?? null) : null,
    )
  }

  const clear = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
    onChange(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <TbSignature className="text-xl" />
          ترسیم امضا
        </div>
        <Button size="sm" icon={<TbEraser />} onClick={clear}>
          پاک کردن
        </Button>
      </div>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="aspect-square w-full max-w-72 touch-none rounded-lg border border-dashed border-gray-300 bg-white"
          onPointerDown={start}
          onPointerMove={draw}
          onPointerUp={stop}
          onPointerLeave={stop}
        />
      </div>
    </div>
  )
}

export default SignatureCanvas
