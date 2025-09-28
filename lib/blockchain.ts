export interface BlockchainTransaction {
  block_id: string;
  tx_hash: string;
  prev_hash: string;
  validator_node: string;
  timestamp: string;
}

export interface HarvestRecord {
  id: string;
  farmer_id: string;     // stable (phone)
  farmer_name: string;   // helpful for legacy migration / display
  herb_name: string;
  quantity_kg: number;
  quality_score: number;
  moisture_percent: number;
  notes: string;
  photo_url?: string;
  gps_coordinates: { latitude: number; longitude: number };
  blockchain_tx: BlockchainTransaction;
  ai_verified: boolean;
  recalled: boolean;
  created_at: string;
}

/* ------------------ core helpers ------------------ */

export function generateBlockchainTransaction(): BlockchainTransaction {
  const blockId = Math.floor(Math.random() * 1_000_000).toString();
  const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  const prevHash = `0x${Math.random().toString(16).substr(2, 64)}`;

  return {
    block_id: blockId,
    tx_hash: txHash,
    prev_hash: prevHash,
    validator_node: "FabricNode-1",
    timestamp: new Date().toISOString(),
  };
}

export function validateHarvestData(data: {
  quantity_kg: number;
  moisture_percent: number;
  gps_coordinates?: { latitude: number; longitude: number };
}): { valid: boolean; error?: string } {
  if (data.quantity_kg > 50) return { valid: false, error: "Quantity cannot exceed 50 kg" };
  if (data.moisture_percent > 15) return { valid: false, error: "Moisture percentage cannot exceed 15%" };
  if (!data.gps_coordinates) return { valid: false, error: "GPS coordinates are required" };
  return { valid: true };
}

export function saveLedgerRecord(record: HarvestRecord): void {
  const existing = getLedgerRecords();
  existing.push(record);
  localStorage.setItem("ledger", JSON.stringify(existing));
}

export function getLedgerRecords(): HarvestRecord[] {
  try {
    return JSON.parse(localStorage.getItem("ledger") || "[]");
  } catch {
    return [];
  }
}

export function updateRecordRecallStatus(recordId: string, recalled: boolean): void {
  const ledger = getLedgerRecords();
  const updated = ledger.map((r) => (r.id === recordId ? { ...r, recalled } : r));
  localStorage.setItem("ledger", JSON.stringify(updated));
}

/* ------------------ new: filtering + migration ------------------ */

/**
 * Return all records for this farmer (by stable id OR by name - legacy).
 */
export function getFarmerRecords(farmer: { id: string; name: string }): HarvestRecord[] {
  const all = getLedgerRecords();
  const nameLC = farmer.name.trim().toLowerCase();
  return all.filter(
    (r) =>
      r.farmer_id === farmer.id ||
      (r.farmer_name && r.farmer_name.trim().toLowerCase() === nameLC)
  );
}

/**
 * One-time migration: if any legacy records were saved with the farmer's name
 * but a different/random farmer_id, rewrite them to use the new stable id.
 */
export function migrateLedgerForFarmer(farmer: { id: string; name: string }): void {
  const all = getLedgerRecords();
  const nameLC = farmer.name.trim().toLowerCase();
  let changed = false;

  const migrated = all.map((r) => {
    if (
      r.farmer_name &&
      r.farmer_name.trim().toLowerCase() === nameLC &&
      r.farmer_id !== farmer.id
    ) {
      changed = true;
      return { ...r, farmer_id: farmer.id };
    }
    return r;
  });

  if (changed) {
    localStorage.setItem("ledger", JSON.stringify(migrated));
  }
}
