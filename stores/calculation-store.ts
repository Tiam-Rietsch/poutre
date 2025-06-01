import { create } from "zustand"
import { useGeometryStore } from "@/stores/geometry-store"
import { useConcreteSteelStore } from "@/stores/concrete-steel-store"
import {
  calculeMomentReduitUltimeDeReference,
  estSansArmatureComprime,
  calculeParametreE,
  calculeEpaisseurDuBetonComprime,
  calculeBrasDeLevierDesForcesInternes,
  calculeDeformationAcier,
  calculeContrainteAcierS500,
  calculeSectionArmature,
  calculeConditionNonFragiliteSCAS,
  calculeTheoriqueArmatureSCAS,
  calculeBrasDeLevierZoneComprimee,
  calculeContrainteAcierTendu,
  calculeSectionArmatureTendueAvecCompression,
  calculeMomentReprisParAcierTendu,
  calculeMomentReprisParAcierComprime,
  calculeSectionArmatureComprimee,
  calculeConditionNonFragiliteSAAS,
  calculeTheoriqueArmatureSAAS,
  calculeFc,
} from "@/lib/calcules"

interface CalculationStep {
  title: string
  latex: string
  result: string
}

interface CalculationStore {
  μ: number
  ξ: number
  x: number
  z: number
  εs: number
  σs: number
  As: number
  As_min: number
  As_th: number
  A_s_comprimee?: number
  isSCAS: boolean
  stepHistory: CalculationStep[]
  runCalculations: () => void
}

export const useCalculationStore = create<CalculationStore>((set, get) => ({
  μ: 0,
  ξ: 0,
  x: 0,
  z: 0,
  εs: 0,
  σs: 0,
  As: 0,
  As_min: 0,
  As_th: 0,
  A_s_comprimee: undefined,
  isSCAS: true,
  stepHistory: [],

  runCalculations: () => {
    const { b, h, d, Med } = useGeometryStore.getState()
    const { Fck, fctm, typeAcier, Fyk, Fyd, ey, ξy, updateMaterialProperties } = useConcreteSteelStore.getState()
    const fcd = calculeFc(Fck)

    // Mettre à jour les propriétés des matériaux
    updateMaterialProperties()

    const steps: CalculationStep[] = []

    // Calcul du moment réduit ultime de référence (μ)
    const μ = calculeMomentReduitUltimeDeReference(Med, b, d, fcd)
    steps.push({
      title: "Calcul du moment réduit ultime de référence (μ)",
      latex: `\\mu = \\frac{M_{Ed}}{b \\cdot d^2 \\cdot f_{cd}} = \\frac{${Med}}{${b.toFixed(2)} \\cdot ${d.toFixed(2)}^2 \\cdot ${fcd.toFixed(2)}}`,
      result: `μ = ${μ.toFixed(4)}`,
    })

    // Vérification si SCAS ou SAAS
    const isSCAS = estSansArmatureComprime(μ, ξy)
    steps.push({
      title: "Vérification du type de section (SCAS ou SAAS)",
      latex: `\\mu ${isSCAS ? "\\leq" : ">"} \\xi_y \\Rightarrow ${μ.toFixed(4)} ${isSCAS ? "\\leq" : ">"} ${ξy.toFixed(4)}`,
      result: isSCAS ? "Section Sans Armature Comprimée (SCAS)" : "Section Avec Armature Comprimée (SAAS)",
    })

    let ξ = 0
    let x = 0
    let z = 0
    let εs = 0
    let σs = 0
    let As = 0
    let As_min = 0
    let As_th = 0
    let A_s_comprimee: number | undefined = undefined

    if (isSCAS) {
      // Calcul du paramètre ξ
      ξ = calculeParametreE(μ)
      steps.push({
        title: "Calcul du paramètre ξ",
        latex: `\\xi = 1.25 \\cdot (1 - \\sqrt{1 - 2\\mu}) = 1.25 \\cdot (1 - \\sqrt{1 - 2 \\cdot ${μ.toFixed(4)}})`,
        result: `ξ = ${ξ.toFixed(4)}`,
      })

      // Calcul de l'épaisseur du béton comprimé (x)
      x = calculeEpaisseurDuBetonComprime(d, ξ)
      steps.push({
        title: "Calcul de l'épaisseur du béton comprimé (x)",
        latex: `x = \\xi \\cdot d = ${ξ.toFixed(4)} \\cdot ${d.toFixed(2)}`,
        result: `x = ${x.toFixed(4)} m`,
      })

      // Calcul du bras de levier des forces internes (z)
      z = calculeBrasDeLevierDesForcesInternes(d, x)
      steps.push({
        title: "Calcul du bras de levier des forces internes (z)",
        latex: `z = d - 0.4 \\cdot x = ${d.toFixed(2)} - 0.4 \\cdot ${x.toFixed(4)}`,
        result: `z = ${z.toFixed(4)} m`,
      })

      // Calcul de la déformation de l'acier (εs)
      εs = calculeDeformationAcier(d, x)
      steps.push({
        title: "Calcul de la déformation de l'acier (εs)",
        latex: `\\varepsilon_s = \\frac{d - x}{x} \\cdot \\varepsilon_c = \\frac{${d.toFixed(2)} - ${x.toFixed(4)}}{${x.toFixed(4)}} \\cdot 3.5 \\cdot 10^{-3}`,
        result: `εs = ${εs.toFixed(6)}`,
      })

      // Calcul de la contrainte dans l'acier (σs)
      if (typeAcier === "S500") {
        σs = calculeContrainteAcierS500(Fyd, εs, ey)
        steps.push({
          title: "Calcul de la contrainte dans l'acier S500 (σs)",
          latex: `\\sigma_s = f_{yd} \\cdot (k + \\frac{(\\varepsilon_s - \\varepsilon_{uk}) \\cdot (k - 1)}{\\varepsilon_{uk} - \\varepsilon_y})`,
          result: `σs = ${σs.toFixed(2)} MPa`,
        })
      } else {
        σs = Fyd
        steps.push({
          title: "Calcul de la contrainte dans l'acier S400 (σs)",
          latex: `\\sigma_s = f_{yd} = ${Fyd.toFixed(2)}`,
          result: `σs = ${σs.toFixed(2)} MPa`,
        })
      }

      // Calcul de la section d'armature (As)
      As = calculeSectionArmature(Med, σs, z)
      steps.push({
        title: "Calcul de la section d'armature (As)",
        latex: `A_s = \\frac{M_{Ed}}{\\sigma_s \\cdot z} = \\frac{${Med}}{${σs.toFixed(2)} \\cdot ${z.toFixed(4)}}`,
        result: `As = ${As.toFixed(6)} m² = ${(As * 10000).toFixed(2)} cm²`,
      })

      // Calcul de la section minimale d'armature (As_min)
      As_min = calculeConditionNonFragiliteSCAS(b, d, fctm, Fyk)
      steps.push({
        title: "Calcul de la section minimale d'armature (As_min)",
        latex: `A_{s,min} = \\frac{0.26 \\cdot b \\cdot d \\cdot f_{ctm}}{f_{yk}} = \\frac{0.26 \\cdot ${b.toFixed(2)} \\cdot ${d.toFixed(2)} \\cdot ${fctm.toFixed(2)}}{${Fyk}}`,
        result: `As_min = ${As_min.toFixed(6)} m² = ${(As_min * 10000).toFixed(2)} cm²`,
      })

      // Calcul de la section théorique d'armature (As_th)
      As_th = calculeTheoriqueArmatureSCAS(As, As_min)
      steps.push({
        title: "Calcul de la section théorique d'armature (As_th)",
        latex: `A_{s,th} = max(A_s, A_{s,min}) = max(${(As * 10000).toFixed(2)}, ${(As_min * 10000).toFixed(2)})`,
        result: `As_th = ${As_th.toFixed(6)} m² = ${(As_th * 10000).toFixed(2)} cm²`,
      })
    } else {
      // SAAS - Section Avec Armature Comprimée
      ξ = ξy
      steps.push({
        title: "Paramètre ξ pour SAAS",
        latex: `\\xi = \\xi_y = ${ξy.toFixed(4)}`,
        result: `ξ = ${ξ.toFixed(4)}`,
      })

      // Calcul de l'épaisseur du béton comprimé (x)
      x = calculeEpaisseurDuBetonComprime(d, ξ)
      steps.push({
        title: "Calcul de l'épaisseur du béton comprimé (x)",
        latex: `x = \\xi \\cdot d = ${ξ.toFixed(4)} \\cdot ${d.toFixed(2)}`,
        result: `x = ${x.toFixed(4)} m`,
      })

      // Calcul du bras de levier des forces internes (z)
      z = calculeBrasDeLevierZoneComprimee(d, x)
      steps.push({
        title: "Calcul du bras de levier des forces internes (z)",
        latex: `z = d - 0.4 \\cdot x = ${d.toFixed(2)} - 0.4 \\cdot ${x.toFixed(4)}`,
        result: `z = ${z.toFixed(4)} m`,
      })

      // Calcul de la contrainte dans l'acier (σs)
      σs = calculeContrainteAcierTendu(Fyd)
      steps.push({
        title: "Calcul de la contrainte dans l'acier (σs)",
        latex: `\\sigma_s = f_{yd} = ${Fyd.toFixed(2)}`,
        result: `σs = ${σs.toFixed(2)} MPa`,
      })

      // Calcul de la section d'armature tendue (As)
      As = calculeSectionArmatureTendueAvecCompression(Med, Fyd, z)
      steps.push({
        title: "Calcul de la section d'armature tendue (As)",
        latex: `A_s = \\frac{M_{Ed}}{f_{yd} \\cdot z} = \\frac{${Med}}{${Fyd.toFixed(2)} \\cdot ${z.toFixed(4)}}`,
        result: `As = ${As.toFixed(6)} m² = ${(As * 10000).toFixed(2)} cm²`,
      })

      // Calcul du moment repris par l'acier tendu (Mu1)
      const Mu1 = calculeMomentReprisParAcierTendu(z, As, Fyd)
      steps.push({
        title: "Calcul du moment repris par l'acier tendu (Mu1)",
        latex: `M_{u1} = A_s \\cdot f_{yd} \\cdot z = ${As.toFixed(6)} \\cdot ${Fyd.toFixed(2)} \\cdot ${z.toFixed(4)}`,
        result: `Mu1 = ${Mu1.toFixed(2)} kN·m`,
      })

      // Calcul du moment repris par l'armature comprimée (Mu2)
      const Mu2 = calculeMomentReprisParAcierComprime(Med, Mu1)
      steps.push({
        title: "Calcul du moment repris par l'armature comprimée (Mu2)",
        latex: `M_{u2} = M_{Ed} - M_{u1} = ${Med} - ${Mu1.toFixed(2)}`,
        result: `Mu2 = ${Mu2.toFixed(2)} kN·m`,
      })

      // Calcul du bras de levier pour l'armature comprimée (Zc)
      const Zc = calculeBrasDeLevierZoneComprimee(d, x)
      steps.push({
        title: "Calcul du bras de levier pour l'armature comprimée (Zc)",
        latex: `Z_c = d - 0.4 \\cdot x = ${d.toFixed(2)} - 0.4 \\cdot ${x.toFixed(4)}`,
        result: `Zc = ${Zc.toFixed(4)} m`,
      })

      // Calcul de la section d'armature comprimée (A's)
      A_s_comprimee = calculeSectionArmatureComprimee(Mu2, Fyd, Zc)
      steps.push({
        title: "Calcul de la section d'armature comprimée (A's)",
        latex: `A'_s = \\frac{M_{u2}}{Z_c \\cdot f_{yd}} = \\frac{${Mu2.toFixed(2)}}{${Zc.toFixed(4)} \\cdot ${Fyd.toFixed(2)}}`,
        result: `A's = ${A_s_comprimee.toFixed(6)} m² = ${(A_s_comprimee * 10000).toFixed(2)} cm²`,
      })

      // Calcul de la section minimale d'armature (As_min)
      As_min = calculeConditionNonFragiliteSAAS(b, d, fctm, Fyk)
      steps.push({
        title: "Calcul de la section minimale d'armature (As_min)",
        latex: `A_{s,min} = \\frac{0.26 \\cdot b \\cdot d \\cdot f_{ctm}}{f_{yk}} = \\frac{0.26 \\cdot ${b.toFixed(2)} \\cdot ${d.toFixed(2)} \\cdot ${fctm.toFixed(2)}}{${Fyk}}`,
        result: `As_min = ${As_min.toFixed(6)} m² = ${(As_min * 10000).toFixed(2)} cm²`,
      })

      // Calcul de la section théorique d'armature (As_th)
      As_th = calculeTheoriqueArmatureSAAS(As, As_min)
      steps.push({
        title: "Calcul de la section théorique d'armature (As_th)",
        latex: `A_{s,th} = max(A_s, A_{s,min}) = max(${(As * 10000).toFixed(2)}, ${(As_min * 10000).toFixed(2)})`,
        result: `As_th = ${As_th.toFixed(6)} m² = ${(As_th * 10000).toFixed(2)} cm²`,
      })
    }

    set({
      μ,
      ξ,
      x,
      z,
      εs,
      σs,
      As,
      As_min,
      As_th,
      A_s_comprimee,
      isSCAS,
      stepHistory: steps,
    })
  },
}))
