"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCalculationStore } from "@/stores/calculation-store"
import { MathFormula } from "@/components/math-formula"

interface CalculationsTabProps {
  onComplete: () => void
}

export function CalculationsTab({ onComplete }: CalculationsTabProps) {
  const { stepHistory, isSCAS } = useCalculationStore()

  useEffect(() => {
    // Dynamically load MathJax
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-2">
          Méthode de calcul : {isSCAS ? "SCAS (Sans Armature Comprimée)" : "SAAS (Avec Armature Comprimée)"}
        </h2>
        <p className="text-muted-foreground">
          {isSCAS
            ? "La section est calculée sans armature comprimée car le moment réduit est inférieur à la valeur limite."
            : "La section nécessite des armatures comprimées car le moment réduit dépasse la valeur limite."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {stepHistory.map((step, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row justify-start space-x-4 items-center">
              <div className="bg-primary w-[30px] aspect-square rounded-full text-primary-foreground font-bold text-xl text-center">{index+1}</div>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <MathFormula latex={step.latex} />
              <div className="mt-4 p-2 bg-muted rounded-md">
                <p className="font-medium">Résultat: {step.result}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onComplete}>Voir les résultats finaux</Button>
      </div>
    </div>
  )
}
