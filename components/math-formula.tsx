"use client"

import { useEffect, useRef } from "react"

// Proper MathJax type declaration
declare global {
  interface Window {
    MathJax: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>
      typesetClear?: (elements?: HTMLElement[]) => void
      tex2svg?: (input: string, options?: any) => HTMLElement
      startup?: {
        promise?: Promise<any>
        ready?: () => void
      }
      config?: any
    }
  }
}

interface MathFormulaProps {
  latex: string
}

export function MathFormula({ latex }: MathFormulaProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderMath = async () => {
      if (containerRef.current && window.MathJax) {
        try {
          // Wait for MathJax to be ready
          if (window.MathJax.startup?.promise) {
            await window.MathJax.startup.promise
          }
          
          // Clear previous content
          if (window.MathJax.typesetClear) {
            window.MathJax.typesetClear([containerRef.current])
          }
          
          // Render new content
          if (window.MathJax.typesetPromise) {
            await window.MathJax.typesetPromise([containerRef.current])
          }
        } catch (error) {
          console.error('MathJax rendering error:', error)
        }
      }
    }

    renderMath()
  }, [latex])

  return (
    <div ref={containerRef} className="math-formula">
      {`$$${latex}$$`}
    </div>
  )
}