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
  calculeContrainteAcierS400,
  calculeSectionArmatureTendueAvecCompression,
  calculeMomentReprisParAcierTendu,
  calculeMomentReprisParAcierComprime,
  calculeSectionArmatureComprimee,
  calculeConditionNonFragiliteSAAS,
  calculeTheoriqueArmatureSAAS,
  calculeFc,
  calculeFctm,
  calculeDeformationDeLacierComprimeSAAS,
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
    const { typeAcier, fcd, fctm, Fyk, Fyd, Fck, ey, ξy, μy, updateMaterialProperties } = useConcreteSteelStore.getState()


    // Mettre à jour les propriétés des matériaux
    updateMaterialProperties()

    const steps: CalculationStep[] = []

    // Calcul du moment réduit ultime de référence (μ)
    const μ = calculeMomentReduitUltimeDeReference(Med, b, d, fcd)
    steps.push({
      title: "Calcul du moment réduit ultime de référence (μ)",
      latex: `\\mu = \\frac{M_{Ed}}{b \\cdot d^2 \\cdot f_{cd}} = \\frac{${Med}}{${b.toFixed(2)} \\cdot ${d.toFixed(2)}^2 \\cdot ${fcd.toFixed(2)} \\cdot 10^3}`,
      result: `μ = ${μ.toFixed(4)}`,
    })

    // Vérification si SCAS ou SAAS
    const isSCAS = estSansArmatureComprime(μ, μy)
    steps.push({
      title: "Vérification du type de section (SCAS ou SAAS)",
      latex: `\\mu ${isSCAS ? "\\leq" : ">"} \\mu_y \\Rightarrow ${μ.toFixed(4)} ${isSCAS ? "\\leq" : ">"} ${μy.toFixed(4)}`,
      result: isSCAS ? "Section Sans Armature Comprimée (SCAS)" : "Section Avec Armature Comprimée (SAAS)",
    })

    let ξ = 0
    let x = 0
    let z = 0
    let εs = 0
    let ε_prime_s = 0
    let σs = 0
    let σ_prime_s = 0
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
        σs = calculeContrainteAcierS500(Fyd, εs)
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
      ξ = calculeParametreE(μy)
      steps.push({
        title: "Paramètre ξ pour SAAS",
        latex: `ξ = ξy = 1.25 \\cdot (1 - \\sqrt{1 - 2 \\cdot ${μy.toFixed(4)}})`,
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

      εs = calculeDeformationAcier(d, x)
      steps.push({
        title: "Calcul de la déformation de l'acier (εs)",
        latex: `\\varepsilon_s = \\frac{d - x_y}{x_y} \\cdot \\varepsilon_c = \\frac{${d.toFixed(2)} - ${x.toFixed(4)}}{${x.toFixed(4)}} \\cdot 3.5 \\cdot 10^{-3}`,
        result: `εs = ${εs.toFixed(6)}`,
      })

      // Calcul de la contrainte dans l'acier (σs)

      if (Fyk == 400) {
        σs = calculeContrainteAcierS400(Fyd)
        steps.push({
          title: "Calcul de la contrainte dans l'acier (σs)",
          latex: `\\sigma_s = f_{yd} = ${Fyd.toFixed(2)}`,
          result: `σs = ${σs.toFixed(2)} MPa`,
        })
      } else {
        σs = calculeContrainteAcierS500(Fyd, εs)
        steps.push({
          title: "Calcul de la contrainte dans l'acier (σs)",
          latex: `σs = f_yd \\cdot \\bigl[ K + \\frac{(\\epsilon_s - \\epsilon_{uk})(k - 1)}{\\epsilon_{uk} - \\epsilon_y} \\bigr]`,
          result: `σs = ${σs.toFixed(2)}`
        })
      }

      ε_prime_s = calculeDeformationDeLacierComprimeSAAS(h, ξ)
      steps.push({
        title: "calcul deformation de l'acier tendu",
        latex: `\\epsilon'_s = \\frac{\\epsilon_y - \\frac{d'}{d}}{\\epsilon_y} \\cdot \\epsilon_c = \\frac{${ξ.toFixed(2)} - \\frac{${0.1*h}}{${0.9*h}}}{${ξ.toFixed(2)}} \\cdot 3.5 \\cdot 10^-3`,
        result: `ε's = ${ε_prime_s.toFixed(4)}`
      })

      if (Fyk == 400) {
        σ_prime_s = calculeContrainteAcierS400(Fyd)
        steps.push({
          title: "Calcul de la contrainte dans l'acier comprimee (σs)",
          latex: `\\sigma'_s = f_{yd} = ${Fyd.toFixed(2)}`,
          result: `σ's = ${σ_prime_s.toFixed(3)} MPa`,
        })
      } else {
        σ_prime_s = calculeContrainteAcierS500(Fyd, ε_prime_s)
        steps.push({
          title: "Calcul de la contrainte dans l'acier tendu (σ's)",
          latex: `σ's = f_yd \\cdot \\bigl[ K + \\frac{(\\epsilon'_s - \\epsilon_{uk})(k - 1)}{\\epsilon_{uk} - \\epsilon_y} \\bigr]`,
          result: `σ's = ${σ_prime_s.toFixed(4)}`
        })
      }

      // Calcul du moment repris par l'acier tendu (Mu1)
      const Mu1 = calculeMomentReprisParAcierTendu(z, x, fcd, b)
      steps.push({
        title: "Calcul du moment repris par l'acier tendu (Mu1)",
        latex: `M_{u1} = 0.8 \\cdot b \\cdot x_y \\cdot f_{cd} \\cdot Z_y = 0.8 \\cdot ${b.toFixed(2)} \\cdot ${x.toFixed(2)} \\cdot ${fcd.toFixed(2)} \\cdot ${z.toFixed(2)}`,
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
      // const Zc = calculeBrasDeLevierZoneComprimee(d, x)
      // steps.push({
      //   title: "Calcul du bras de levier pour l'armature comprimée (Zc)",
      //   latex: `Z_c = d - 0.4 \\cdot x = ${d.toFixed(2)} - 0.4 \\cdot ${x.toFixed(4)}`,
      //   result: `Zc = ${Zc.toFixed(4)} m`,
      // })



      // Calcul de la section d'armature comprimée (A's)
      A_s_comprimee = calculeSectionArmatureComprimee(Mu2, σ_prime_s, h)
      steps.push({
        title: "Calcul de la section d'armature comprimée (A's)",
        latex: `A'_{s,calc} = \\frac{M_{u2}}{\\sigma'_s \\cdot (d - d') \\cdot 10^3} = \\frac{${Mu2.toFixed(2)}}{${σ_prime_s.toFixed(4)} \\cdot (${0.9*h} - ${0.1*h}) \\cdot 10^3}`,
        result: `A's,calc = ${A_s_comprimee.toFixed(6)} m² = ${(A_s_comprimee * 10000).toFixed(2)} cm²`,
      })

      // Calcul de la section d'armature tendue (As)
      As = calculeSectionArmatureTendueAvecCompression(Med, σs, z, calculeSectionArmatureComprimee(Mu2, σs, h))
      steps.push({
        title: "Calcul de la section d'armature tendue (As)",
        latex: `A_{s,calc} = \\frac{M_{u1}}{f_{yd} \\cdot z \\cdot 10^3}  + \\frac{M_{u2}}{\\sigma_s \\cdot (d - d') \\cdot 10^3} = \\frac{${Mu1.toFixed(2)}}{${σs.toFixed(2)} \\cdot ${z.toFixed(4)} \\cdot 10^3} + \\frac{${Mu2.toFixed(2)}}{${σs.toFixed(4)} \\cdot (${0.9*h} - ${0.1*h}) \\cdot 10^3}`,
        result: `As = ${As.toFixed(6)} m² = ${(As * 10000).toFixed(2)} cm²`,
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
        title: "Calcul de la section théorique d'armature tendue (As_th)",
        latex: `A_{s,th} = max(A_s, A_{s,min}) = max(${(As * 10000).toFixed(2)}, ${(As_min * 10000).toFixed(2)})`,
        result: `As_th = ${As_th.toFixed(6)} m² = ${(As_th * 10000).toFixed(2)} cm²`,
      })


      // Calcul de la section théorique d'armature (As_th)
      steps.push({
        title: "Calcul de la section théorique d'armature comprimee (A's_th)",
        latex: `A'_{s,th} = A'_{s,calc} = ${A_s_comprimee.toFixed(5)}`,
        result: `As_th = ${A_s_comprimee.toFixed(4)} m² = ${(A_s_comprimee * 10000).toFixed(2)} cm²`,
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
