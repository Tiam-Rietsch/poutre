"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfigurationTab } from "@/components/configuration-tab"
import { CalculationsTab } from "@/components/calculations-tab"
import { ResultsTab } from "@/components/results-tab"
import { useState } from "react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("configuration")

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <main className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Dimensionnement de Poutres en Flexion  Composee
      </h1>
      {/* <h2 className="text-xl text-muted-foreground mb-8 text-center">Selon l&apos;Eurocode 2</h2> */}

      <Tabs defaultValue="configuration" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="calculations">Calculs étape par étape</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
        </TabsList>
        <TabsContent value="configuration">
          <ConfigurationTab onComplete={() => setActiveTab("calculations")} />
        </TabsContent>
        <TabsContent value="calculations">
          <CalculationsTab onComplete={() => setActiveTab("results")} />
        </TabsContent>
        <TabsContent value="results">
          <ResultsTab />
        </TabsContent>
      </Tabs>
    </main>
  )
}
