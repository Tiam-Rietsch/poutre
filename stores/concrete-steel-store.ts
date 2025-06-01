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
  // New method to update everything in one go
  updateAllProperties: () => void
}

export const useConcreteSteelStore = create<ConcreteSteelStore>((set, get) => {
  // Helper function to get initial steel properties
  const getInitialSteelProps = (type: "S400" | "S500") => {
    const acierProps = TYPE_ACIER[type]
    return {
      Fyk: acierProps.Fyk,
      Fyd: calculeFyd(acierProps.Fyk),
      ey: acierProps.ey,
      ξy: acierProps.uy,
    }
  }

  return {
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
    ...getInitialSteelProps("S500"),

    setClassesExposition: (classes) => {
      set({ classesExposition: classes })
      // Automatically update dependent properties
      get().updateAllProperties()
    },

    setModeFabrication: (mode) => {
      set({ modeFabrication: mode })
      // Automatically update dependent properties
      get().updateAllProperties()
    },

    setTypeEssai: (type) => {
      set({ typeEssai: type })
      // Automatically update dependent properties
      get().updateAllProperties()
    },

    setTypeAcier: (type) => {
      const acierProps = TYPE_ACIER[type]
      set({
        typeAcier: type,
        Fyk: acierProps.Fyk,
        Fyd: calculeFyd(acierProps.Fyk),
        ey: acierProps.ey,
        ξy: acierProps.uy,
      })
    },

    updateClasseStructurelle: () => {
      const state = get()
      
      if (state.classesExposition.length === 0) {
        set({ classeStructurelle: "", Fck: 0 })
        return
      }

      // Find the structural class with the highest Fck value
      let maxFck = 0
      let maxClasseType = ""

      state.classesExposition.forEach((classeType) => {
        const classeData = CLASSES_STRUCTURALES[classeType]
        if (classeData) {
          const fckValue = classeData[state.modeFabrication]?.[state.typeEssai]
          if (fckValue && fckValue > maxFck) {
            maxFck = fckValue
            maxClasseType = classeType
          }
        }
      })

      set({
        classeStructurelle: maxClasseType,
        Fck: maxFck,
      })
    },

    updateMaterialProperties: () => {
      const state = get()
      
      if (state.Fck <= 0) {
        // Reset properties if no valid Fck
        set({
          fcm: 0,
          fcd: 0,
          fctm: 0,
          Ecm: 0,
        })
        return
      }

      try {
        const fcm = calculeFcm(state.Fck)
        const fcd = calculeFc(state.Fck)
        const fctm = calculeFctm(state.Fck)
        const Ecm = calculeEcm(fcm)

        set({
          fcm,
          fcd,
          fctm,
          Ecm,
        })
      } catch (error) {
        console.error('Error calculating material properties:', error)
        // Set to safe defaults
        set({
          fcm: 0,
          fcd: 0,
          fctm: 0,
          Ecm: 0,
        })
      }
    },

    updateAllProperties: () => {
      const { updateClasseStructurelle, updateMaterialProperties } = get()
      updateClasseStructurelle()
      updateMaterialProperties()
    },
  }
})