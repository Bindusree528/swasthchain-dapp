"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, FileText, Home, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [blockId, setBlockId] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [timestamp, setTimestamp] = useState<string | null>(null)

  useEffect(() => {
    const block_id = searchParams.get("block_id")
    const tx = searchParams.get("tx")

    if (!block_id || !tx) {
      router.push("/dashboard")
      return
    }

    setBlockId(block_id)
    setTxHash(tx)
    setTimestamp(new Date().toISOString())
  }, [searchParams, router])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      })
    })
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (!blockId || !txHash) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Success Animation */}
      <div className="bg-gradient-to-b from-green-50 to-background py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-4">Harvest Recorded Successfully!</h1>
          <p className="text-lg text-muted-foreground">
            Your harvest has been securely recorded on the SwasthChain blockchain
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      <main className="max-w-2xl mx-auto px-4 pb-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Blockchain Transaction Details
            </CardTitle>
            <CardDescription>Your harvest is now permanently recorded and traceable</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Block ID */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Block ID</p>
                <p className="text-lg font-mono text-primary">#{blockId}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(blockId, "Block ID")}
                className="text-muted-foreground hover:text-primary"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Transaction Hash */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Transaction Hash</p>
                <p className="text-sm font-mono text-primary truncate">{txHash}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(txHash, "Transaction Hash")}
                className="text-muted-foreground hover:text-primary ml-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Validator Node */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Validator Node</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono text-primary">FabricNode-1</p>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                <p className="text-lg text-primary">{timestamp && formatTimestamp(timestamp)}</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 pt-4">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
              <Badge variant="secondary">Immutable</Badge>
              <Badge variant="secondary">Traceable</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid gap-4 md:grid-cols-2">
          <Button onClick={() => router.push("/records")} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Go to Records
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Information Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                Your harvest data is now permanently stored on the blockchain
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />A unique QR code has been
                generated for traceability
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                Consumers can verify the authenticity of your herbs
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                You can view and manage all records in your dashboard
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
