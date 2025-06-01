import { create } from "zustand"

interface GeometryStore {
  b: number
  h: number
  d: number
  Med: number
  setGeometry: (values: { b?: number; h?: number; ratio?: number; Med?: number }) => void
}

export const useGeometryStore = create<GeometryStore>((set) => ({
  b: 0.3,
  h: 0.5,
  d: 0.45,
  Med: 100,
  setGeometry: (values) =>
    set((state) => {
      const newB = values.b !== undefined ? values.b : state.b
      const newH = values.h !== undefined ? values.h : state.h
      const ratio = values.ratio !== undefined ? values.ratio : state.d / state.h
      const newD = newH * ratio
      const newMed = values.Med !== undefined ? values.Med : state.Med

      return {
        b: newB,
        h: newH,
        d: newD,
        Med: newMed,
      }
    }),
}))
