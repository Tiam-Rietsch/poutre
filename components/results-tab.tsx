"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCalculationStore } from "@/stores/calculation-store"
import { useConcreteSteelStore } from "@/stores/concrete-steel-store"
import { useGeometryStore } from "@/stores/geometry-store"

export function ResultsTab() {
  const { b, h, d, Med } = useGeometryStore()
  const { typeAcier, Fck, classeStructurelle } = useConcreteSteelStore()
  const { isSCAS, μ, ξ, x, z, As, As_min, As_th, A_s_comprimee } = useCalculationStore()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Résumé des résultats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Données d&apos;entrée</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Largeur (b)</TableCell>
                    <TableCell>{b} m</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Hauteur (h)</TableCell>
                    <TableCell>{h} m</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Hauteur utile (d)</TableCell>
                    <TableCell>{d} m</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Moment fléchissant (Med)</TableCell>
                    <TableCell>{Med} kN·m</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Type d&apos;acier</TableCell>
                    <TableCell>{typeAcier}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Classe de béton</TableCell>
                    <TableCell>C{Fck}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Classe structurelle</TableCell>
                    <TableCell>{classeStructurelle}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Résultats de calcul</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Type de section</TableCell>
                    <TableCell>
                      {isSCAS ? "SCAS (Sans armature comprimée)" : "SAAS (Avec armature comprimée)"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Moment réduit (μ)</TableCell>
                    <TableCell>{μ?.toFixed(4)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Paramètre ξ</TableCell>
                    <TableCell>{ξ?.toFixed(4)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Hauteur zone comprimée (x)</TableCell>
                    <TableCell>{x?.toFixed(4)} m</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bras de levier (z)</TableCell>
                    <TableCell>{z?.toFixed(4)} m</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sections d&apos;armatures</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Section calculée</TableHead>
                <TableHead>Section minimale</TableHead>
                <TableHead>Section théorique</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Armatures tendues</TableCell>
                <TableCell>{(As).toFixed(2)} m²</TableCell>
                <TableCell>{(As_min).toFixed(2)} m²</TableCell>
                <TableCell className="font-bold">{(As_th).toFixed(2)} m²</TableCell>
              </TableRow>
              {!isSCAS && (
                <TableRow>
                  <TableCell className="font-medium">Armatures comprimées</TableCell>
                  <TableCell>{(A_s_comprimee!).toFixed(2)} m²</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="font-bold">{(A_s_comprimee!).toFixed(2)} m²</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Recommandations</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Utiliser des barres de diamètre approprié pour atteindre la section requise</li>
              <li>Respecter les espacements minimaux entre barres selon l&apos;Eurocode 2</li>
              <li>Vérifier les conditions d&apos;ancrage des armatures</li>
              {!isSCAS && <li>Placer les armatures comprimées avec un enrobage suffisant</li>}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
