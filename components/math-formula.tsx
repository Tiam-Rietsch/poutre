"use client"

import { useEffect, useRef } from "react"

interface MathFormulaProps {
  latex: string
}

export function MathFormula({ latex }: MathFormulaProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && window.MathJax) {
      window.MathJax.typesetPromise([containerRef.current])
    }
  }, [latex])

  return (
    <div ref={containerRef} className="math-formula">
      {`$$${latex}$$`}
    </div>
  )
}

// Add MathJax type to window
declare global {
  interface Window {
    MathJax: any
  }
}
