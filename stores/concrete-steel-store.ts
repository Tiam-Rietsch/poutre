import { create } from "zustand"
import { CLASSES_STRUCTURALES, TYPE_ACIER } from "@/lib/constants"
import {
  calculeFcm,
  calculeFc,
  calculeFctm,
  calculeEcm,
  calculeFyd,
} from "@/lib/calcules"

interface ConcreteSteelStore {
  classesExposition: string[]
  classeStructurelle: string
  Fck: number
  fcm: number
  fcd: number
  fctm: number
  Ecm: number
  modeFabrication: "sur_place" | "prefabrique"
  typeEssai: "cylindrique" | "cubique"
  typeAcier: "S400" | "S500"
  Fyk: number
  Fyd: number
  ey: number
  ξy: number
  setClassesExposition: (classes: string[]) => void
  setModeFabrication: (mode: "sur_place" | "prefabrique") => void
  setTypeEssai: (type: "cylindrique" | "cubique") => void
  setTypeAcier: (type: "S400" | "S500") => void
  updateClasseStructurelle: () => void
  updateMaterialProperties: () => void
}

export const useConcreteSteelStore = create<ConcreteSteelStore>((set, get) => ({
  classesExposition: [],
  classeStructurelle: "",
  Fck: 0,
  fcm: 0,
  fcd: 0,
  fctm: 0,
  Ecm: 0,
  modeFabrication: "sur_place",
  typeEssai: "cylindrique",
  typeAcier: "S500",
  Fyk: TYPE_ACIER.S500.Fyk,
  Fyd: calculeFyd(TYPE_ACIER.S500.Fyk),
  ey: TYPE_ACIER.S500.ey,
  ξy: TYPE_ACIER.S500.uy,

  setClassesExposition: (classes) => set({ classesExposition: classes }),

  setModeFabrication: (mode) =>
    set((state) => {
      const newState = { ...state, modeFabrication: mode }
      return newState
    }),

  setTypeEssai: (type) =>
    set((state) => {
      const newState = { ...state, typeEssai: type }
      return newState
    }),

  setTypeAcier: (type) =>
    set((state) => {
      const acierProps = TYPE_ACIER[type]
      return {
        ...state,
        typeAcier: type,
        Fyk: acierProps.Fyk,
        Fyd: calculeFyd(acierProps.Fyk),
        ey: acierProps.ey,
        ξy: acierProps.uy,
      }
    }),

  updateClasseStructurelle: () =>
    set((state) => {
      if (state.classesExposition.length === 0) {
        return { classeStructurelle: "", Fck: 0 }
      }

      // Trouver la classe structurelle avec la valeur Fck la plus élevée
      let maxFck = 0
      let maxClasseType = ""

      state.classesExposition.forEach((classeType) => {
        if (CLASSES_STRUCTURALES[classeType]) {
          const fckValue = CLASSES_STRUCTURALES[classeType][state.modeFabrication][state.typeEssai]
          if (fckValue > maxFck) {
            maxFck = fckValue
            maxClasseType = classeType
          }
        }
      })

      return {
        classeStructurelle: maxClasseType,
        Fck: maxFck,
      }
    }),

  updateMaterialProperties: () =>
    set((state) => {
      const fcm = calculeFcm(state.Fck)
      const fcd = calculeFc(state.Fck)
      const fctm = calculeFctm(state.Fck)
      const Ecm = calculeEcm(fcm)

      return {
        fcm,
        fcd,
        fctm,
        Ecm,
      }
    }),
}))
