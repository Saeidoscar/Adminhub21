import { type ReactNode, useState } from "react"

interface TabsProps {
  tabs: {
    id: string
    label: string
    icon?: ReactNode
  }[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeId, onChange, className = "" }: TabsProps) {
  return (
    <div
      className={`flex gap-1 bg-surface2 border border-border rounded-xl p-1 w-fit shadow-sm ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all btn-press ${
            activeId === tab.id
              ? "bg-navy text-white shadow-sm"
              : "text-muted hover:text-text"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

interface StepperProps {
  steps: string[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i + 1 < currentStep
                  ? "bg-emerald-500 text-white"
                  : i + 1 === currentStep
                    ? "bg-navy text-white"
                    : "bg-border text-muted"
              }`}
            >
              {i + 1 < currentStep ? "✓" : i + 1}
            </div>
            <div
              className={`text-xs mt-1 font-medium hidden sm:block ${
                i + 1 === currentStep ? "text-navy" : "text-muted"
              }`}
            >
              {label}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`step-connector mx-1 mt-0 sm:-mt-4 ${
                i + 1 < currentStep ? "active" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
