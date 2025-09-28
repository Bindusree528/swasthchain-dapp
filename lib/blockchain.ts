export interface BlockchainTransaction {
  block_id: string
  tx_hash: string
  prev_hash: string
  validator_node: string
  timestamp: string
}

export interface HarvestRecord {
  id: string
  farmer_id: string
  farmer_name: string      // ✅ added
  herb_name: string
  quantity_kg: number
  quality_score: number
  moisture_percent: number
  notes: string
  photo_url?: string
  gps_coordinates: {
    latitude: number
    longitude: number
  }
  blockchain_tx: BlockchainTransaction
  ai_verified: boolean
  recalled: boolean
  created_at: string
}

export function generateBlockchainTransaction(): BlockchainTransaction {
  const blockId = Math.floor(Math.random() * 1000000).toString()
  const txHash = `0x${Math.random().toString(16).substr(2, 64)}`
  const prevHash = `0x${Math.random().toString(16).substr(2, 64)}`

  return {
    block_id: blockId,
    tx_hash: txHash,
    prev_hash: prevHash,
    validator_node: "FabricNode-1",
    timestamp: new Date().toISOString(),
  }
}

export function validateHarvestData(data: {
  quantity_kg: number
  moisture_percent: number
  gps_coordinates?: { latitude: number; longitude: number }
}): { valid: boolean; error?: string } {
  if (data.quantity_kg > 50) return { valid: false, error: "Quantity cannot exceed 50 kg" }
  if (data.moisture_percent > 15) return { valid: false, error: "Moisture percentage cannot exceed 15%" }
  if (!data.gps_coordinates) return { valid: false, error: "GPS coordinates are required" }
  return { valid: true }
}

export function saveLedgerRecord(record: HarvestRecord): void {
  const existingLedger = JSON.parse(localStorage.getItem("ledger") || "[]")
  existingLedger.push(record)
  localStorage.setItem("ledger", JSON.stringify(existingLedger))
}

export function getLedgerRecords(): HarvestRecord[] {
  return JSON.parse(localStorage.getItem("ledger") || "[]")
}

export function updateRecordRecallStatus(recordId: string, recalled: boolean): void {
  const ledger = getLedgerRecords()
  const updatedLedger = ledger.map((record) =>
    record.id === recordId ? { ...record, recalled } : record
  )
  localStorage.setItem("ledger", JSON.stringify(updatedLedger))
}
