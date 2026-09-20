'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

const STREAMING_STEPS = [
  "Task Input",
  "Understand Goal",
  "Synthesize Plan",
  "Execute Actions",
  "Verify Output Integrity",
  "Report",
]

export default function StreamingLoader({ isLoading }: { isLoading: boolean }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setCurrentStepIndex(0)
      return
    }

    // Advance steps automatically every 600ms until the last step
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STREAMING_STEPS.length - 1) {
          return prev + 1
        }
        clearInterval(interval)
        return prev
      })
    }, 600)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-white rounded-2xl border border-[#EAEAE2] my-4 shadow-sm max-w-md mx-auto">
      <div className="w-full space-y-3">
        {STREAMING_STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isPending = index > currentStepIndex

          return (
            <div 
              key={step} 
              className={`flex items-center gap-3 transition-opacity duration-300 ${
                isPending ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div>
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-[#4B7355]" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 text-[#4B7355] animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <span className={`text-sm font-semibold ${
                isCurrent ? 'text-[#4B7355]' : isComplete ? 'text-[#1A1A1A]' : 'text-[#888]'
              }`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}