"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentFarmer, clearCurrentFarmer, type Farmer } from "@/lib/storage"
import { getLedgerRecords } from "@/lib/blockchain"
import { Plus, FileText, LogOut, Leaf, BarChart3 } from "lucide-react"

export default function DashboardPage() {
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [recordCount, setRecordCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const currentFarmer = getCurrentFarmer()
    if (!currentFarmer) {
      router.push("/login")
      return
    }

    setFarmer(currentFarmer)

    // Count records for this farmer
    const allRecords = getLedgerRecords()
    const farmerRecords = allRecords.filter((record) => record.farmer_id === currentFarmer.id)
    setRecordCount(farmerRecords.length)
  }, [router])

  const handleLogout = () => {
    clearCurrentFarmer()
    router.push("/login")
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">SwasthChain</h1>
              <p className="text-sm text-muted-foreground">Welcome, {farmer.name}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Your Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{recordCount}</div>
                <div className="text-sm text-muted-foreground">Total Harvests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{recordCount > 0 ? "Active" : "New"}</div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/add-harvest")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Plus className="h-6 w-6 text-primary-foreground" />
                </div>
                Add Harvest
              </CardTitle>
              <CardDescription>Record a new harvest and add it to the blockchain ledger</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start New Harvest</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/records")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <FileText className="h-6 w-6 text-secondary-foreground" />
                </div>
                View Records
              </CardTitle>
              <CardDescription>Browse your harvest history and blockchain transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                View All Records
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About SwasthChain</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              SwasthChain ensures the authenticity and traceability of Ayurvedic herbs through blockchain technology.
              Each harvest is recorded with immutable proof, providing transparency from farm to consumer.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
