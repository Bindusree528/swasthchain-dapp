"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCurrentFarmer, type Farmer } from "@/lib/storage"
import { getLedgerRecords, updateRecordRecallStatus, type HarvestRecord } from "@/lib/blockchain"
import { ArrowLeft, QrCode, AlertTriangle, CheckCircle, Eye, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export default function RecordsPage() {
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [records, setRecords] = useState<HarvestRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const currentFarmer = getCurrentFarmer()
    if (!currentFarmer) {
      router.push("/login")
      return
    }

    setFarmer(currentFarmer)

    // Load records for this farmer
    const allRecords = getLedgerRecords()
    const farmerRecords = allRecords.filter((record) => record.farmer_id === currentFarmer.id)
    setRecords(farmerRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    setIsLoading(false)
  }, [router])

  const handleRecallToggle = (recordId: string, currentRecallStatus: boolean) => {
    const newStatus = !currentRecallStatus
    updateRecordRecallStatus(recordId, newStatus)

    // Update local state
    setRecords((prev) => prev.map((record) => (record.id === recordId ? { ...record, recalled: newStatus } : record)))

    toast({
      title: newStatus ? "Record Recalled" : "Recall Removed",
      description: newStatus
        ? "This harvest has been marked as recalled"
        : "This harvest is no longer marked as recalled",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary">Harvest Records</h1>
            <p className="text-sm text-muted-foreground">View and manage your blockchain-verified harvests</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Records Summary</CardTitle>
            <CardDescription>Overview of your harvest records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{records.length}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{records.filter((r) => r.ai_verified).length}</div>
                <div className="text-sm text-muted-foreground">AI Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{records.filter((r) => r.recalled).length}</div>
                <div className="text-sm text-muted-foreground">Recalled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {records.reduce((sum, r) => sum + r.quantity_kg, 0).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Total KG</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Records</CardTitle>
            <CardDescription>Complete list of your harvest records with blockchain verification</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No harvest records found</p>
                <Button onClick={() => router.push("/add-harvest")}>Add Your First Harvest</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Herb</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Block ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{record.herb_name}</span>
                            {record.ai_verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                        </TableCell>
                        <TableCell>{record.quantity_kg} kg</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{record.quality_score}/5</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">#{record.blockchain_tx.block_id}</span>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(record.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {record.recalled ? (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Recalled
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/qr/${record.id}`)}
                              className="flex items-center gap-1"
                            >
                              <QrCode className="h-3 w-3" />
                              QR
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/qr/${record.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRecallToggle(record.id, record.recalled)}
                                  className={record.recalled ? "text-green-600" : "text-red-600"}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  {record.recalled ? "Remove Recall" : "Mark as Recalled"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
