"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGeometryStore } from "@/stores/geometry-store";
import { useConcreteSteelStore } from "@/stores/concrete-steel-store";
import { useCalculationStore } from "@/stores/calculation-store";
import { CLASSE_EXPOSITIONS } from "@/lib/constants";
import { InfoIcon } from "lucide-react";

interface ConfigurationTabProps {
  onComplete: () => void;
}

export function ConfigurationTab({ onComplete }: ConfigurationTabProps) {
  const { b, h, d, Med, setGeometry } = useGeometryStore();
  const {
    classesExposition,
    classeStructurelle,
    Fck,
    modeFabrication,
    typeEssai,
    typeAcier,
    setClassesExposition,
    setModeFabrication,
    setTypeEssai,
    setTypeAcier,
    updateClasseStructurelle,
  } = useConcreteSteelStore();
  const { runCalculations } = useCalculationStore();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [heightRatio, setHeightRatio] = useState<string>("0.9");

  const handleGeometryChange = (field: string, value: string) => {
    const numValue = Number.parseFloat(value);
    if (!isNaN(numValue)) {
      if (field === "b") {
        setGeometry({ b: numValue, h, ratio: Number.parseFloat(heightRatio) });
      } else if (field === "h") {
        setGeometry({ b, h: numValue, ratio: Number.parseFloat(heightRatio) });
      } else if (field === "Med") {
        setGeometry({
          b,
          h,
          ratio: Number.parseFloat(heightRatio),
          Med: numValue,
        });
      }
    }
  };

  const handleHeightRatioChange = (value: string) => {
    setHeightRatio(value);
    setGeometry({ b, h, ratio: Number.parseFloat(value) });
  };

  const handleClasseExpositionChange = (checked: boolean, type: string) => {
    let newClasses = [...classesExposition];

    if (checked) {
      if (!newClasses.includes(type)) {
        newClasses.push(type);
      }
    } else {
      newClasses = newClasses.filter((c) => c !== type);
    }

    setClassesExposition(newClasses);
    updateClasseStructurelle();
  };

  const handleValidate = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    runCalculations();
    setShowConfirmation(false);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Données géométriques et mécaniques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="b">Largeur de la poutre (m)</Label>
              <Input
                id="b"
                type="number"
                step="0.01"
                value={b || ""}
                onChange={(e) => handleGeometryChange("b", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="h">Hauteur totale de la poutre (m)</Label>
              <Input
                id="h"
                type="number"
                step="0.01"
                value={h || ""}
                onChange={(e) => handleGeometryChange("h", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-ratio">Hauteur utile</Label>
              <Select
                value={heightRatio}
                onValueChange={handleHeightRatioChange}
              >
                <SelectTrigger id="d-ratio">
                  <SelectValue placeholder="Sélectionner un ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.85">0.85 × h</SelectItem>
                  <SelectItem value="0.9">0.9 × h</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground mt-1">
                Hauteur utile calculée: {d ? d.toFixed(3) : "0"} m
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="Med">Moment fléchissant ultime (kN·m)</Label>
              <Input
                id="Med"
                type="number"
                step="0.1"
                value={Med || ""}
                onChange={(e) => handleGeometryChange("Med", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contexte béton et acier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mode de fabrication</Label>
              <RadioGroup
                value={modeFabrication}
                onValueChange={(value) => {
                  setModeFabrication(value as "sur_place" | "prefabrique");
                  updateClasseStructurelle();
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sur_place" id="sur_place" />
                  <Label htmlFor="sur_place">Sur place</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prefabrique" id="prefabrique" />
                  <Label htmlFor="prefabrique">Préfabriqué</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Type d&apos;essai</Label>
              <RadioGroup
                value={typeEssai}
                onValueChange={(value) => {
                  setTypeEssai(value as "cylindrique" | "cubique");
                  updateClasseStructurelle();
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cylindrique" id="cylindrique" />
                  <Label htmlFor="cylindrique">Cylindrique</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cubique" id="cubique" />
                  <Label htmlFor="cubique">Cubique</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-acier">Type d&apos;acier utilisé</Label>
              <Select
                value={typeAcier}
                onValueChange={(value) => {
                  setTypeAcier(value as "S400" | "S500")
                  updateClasseStructurelle()
                }}
              >
                <SelectTrigger id="type-acier">
                  <SelectValue placeholder="Sélectionner un type d'acier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S400">S400</SelectItem>
                  <SelectItem value="S500">S500</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Classe structurelle retenue:{" "}
                {classeStructurelle || "Non déterminée"}
                <br />
                Fck correspondant: {Fck || "0"} MPa
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classes d&apos;exposition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full">
              <colgroup>
                <col className="w-[80px]" />
                <col className="w-[100px]" />
                <col className="w-[350px]" />
                <col className="w-[300px]" />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Sélection</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[350px]">Description</TableHead>
                  <TableHead className="w-[300px]">Exemples</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CLASSE_EXPOSITIONS.map((classe) => (
                  <TableRow key={classe.type}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={classesExposition.includes(classe.type)}
                        onCheckedChange={(checked) =>
                          handleClasseExpositionChange(
                            checked as boolean,
                            classe.type
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {classe.type}
                    </TableCell>
                    <TableCell className="w-[350px] max-w-[350px] whitespace-normal break-words p-3">
                      <div className="text-sm leading-relaxed">
                        {classe.description}
                      </div>
                    </TableCell>
                    <TableCell className="w-[300px] max-w-[300px] whitespace-normal break-words p-3">
                      <div className="text-sm leading-relaxed text-muted-foreground">
                        {classe.examples}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleValidate}>
          Valider les données et prévisualiser
        </Button>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmation des données</DialogTitle>
            <DialogDescription>
              Veuillez vérifier les données saisies avant de lancer le calcul.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <h3 className="font-medium">Données géométriques</h3>
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
                  <TableCell className="font-medium">
                    Hauteur utile (d)
                  </TableCell>
                  <TableCell>{d} m</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Moment fléchissant (Med)
                  </TableCell>
                  <TableCell>{Med} kN·m</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <h3 className="font-medium">Matériaux</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    Classes d&apos;exposition
                  </TableCell>
                  <TableCell>
                    {classesExposition.join(", ") || "Aucune"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Classe structurelle
                  </TableCell>
                  <TableCell>{classeStructurelle}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Fck</TableCell>
                  <TableCell>{Fck} MPa</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Mode de fabrication
                  </TableCell>
                  <TableCell>
                    {modeFabrication === "sur_place"
                      ? "Sur place"
                      : "Préfabriqué"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Type d&apos;essai
                  </TableCell>
                  <TableCell>
                    {typeEssai === "cylindrique" ? "Cylindrique" : "Cubique"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Type d&apos;acier
                  </TableCell>
                  <TableCell>{typeAcier}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleConfirm}>Lancer le calcul</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}