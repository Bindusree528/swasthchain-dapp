"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getLedgerRecords, type HarvestRecord } from "@/lib/blockchain"
import { ArrowLeft, AlertTriangle, CheckCircle, MapPin, Calendar, Leaf } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export default function QRPage() {
  const [record, setRecord] = useState<HarvestRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState("")
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const recordId = params.id as string
    if (!recordId) {
      router.push("/records")
      return
    }

    // Find the record
    const allRecords = getLedgerRecords()
    const foundRecord = allRecords.find((r) => r.id === recordId)

    if (!foundRecord) {
      router.push("/records")
      return
    }

    setRecord(foundRecord)
    setQrUrl(`${window.location.origin}/qr/${recordId}`)
    setIsLoading(false)
  }, [params.id, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Record not found</p>
            <Button onClick={() => router.push("/records")} className="mt-4">
              Back to Records
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary">Harvest Provenance</h1>
            <p className="text-sm text-muted-foreground">Blockchain-verified harvest details</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Recall Warning */}
        {record.recalled && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>RECALL NOTICE:</strong> This harvest has been marked as recalled. Please do not consume or
              distribute this product.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>Scan to verify harvest authenticity</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <QRCodeSVG value={qrUrl} size={200} level="M" includeMargin />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Share this QR code with consumers to verify harvest authenticity
              </p>
            </CardContent>
          </Card>

          {/* Harvest Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                {record.herb_name}
              </CardTitle>
              <CardDescription>Harvest #{record.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                  <p className="text-lg font-semibold">{record.quantity_kg} kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quality Score</p>
                  <Badge variant="secondary" className="text-lg">
                    {record.quality_score}/5
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Moisture Content</p>
                <p className="text-lg font-semibold">{record.moisture_percent}%</p>
              </div>

              {record.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm">{record.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">Status:</p>
                {record.ai_verified && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    AI Verified
                  </Badge>
                )}
                {record.recalled ? (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Recalled
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Harvest Date
                </p>
                <p className="text-sm">{formatDate(record.created_at)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  GPS Coordinates
                </p>
                <p className="text-sm font-mono">
                  {formatCoordinates(record.gps_coordinates.latitude, record.gps_coordinates.longitude)}
                </p>
              </div>

              {record.photo_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Harvest Photo</p>
                  <img
                    src={record.photo_url || "/placeholder.svg"}
                    alt="Harvest photo"
                    className="w-full h-32 object-cover rounded-lg mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blockchain Details */}
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Verification</CardTitle>
              <CardDescription>Immutable proof of authenticity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Block ID</p>
                <p className="text-sm font-mono">#{record.blockchain_tx.block_id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction Hash</p>
                <p className="text-xs font-mono break-all">{record.blockchain_tx.tx_hash}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Validator Node</p>
                <p className="text-sm">{record.blockchain_tx.validator_node}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Blockchain Timestamp</p>
                <p className="text-sm">{formatDate(record.blockchain_tx.timestamp)}</p>
              </div>

              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                Blockchain Verified
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* JSON Data */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Complete Provenance Data</CardTitle>
            <CardDescription>Full JSON record for technical verification</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">{JSON.stringify(record, null, 2)}</pre>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
