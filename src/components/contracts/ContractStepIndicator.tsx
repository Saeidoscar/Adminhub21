import { Icon } from "../../components/layout/Icon"

interface ContractStepIndicatorProps {
  step: number
  totalSteps: number
  steps: string[]
}

export function ContractStepIndicator({
  step,
  totalSteps,
  steps,
}: ContractStepIndicatorProps) {
  return (
    <div className="flex items-center mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i + 1 < step
                  ? "bg-emerald-500 text-white"
                  : i + 1 === step
                    ? "bg-[#1e3a5f] text-white"
                    : "bg-[#e2e8f0] text-[#94a3b8]"
              }`}
            >
              {i + 1 < step ? <Icon name="check" size={14} /> : i + 1}
            </div>
            <div
              className={`text-xs mt-1 font-medium hidden sm:block ${
                i + 1 === step ? "text-[#1e3a5f]" : "text-[#94a3b8]"
              }`}
            >
              {label}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`step-connector mx-1 mt-0 sm:-mt-4 ${
                i + 1 < step ? "active" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
