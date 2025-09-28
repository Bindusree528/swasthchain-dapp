export interface Farmer {
  id: string
  name: string
  phone: string
  created_at: string
}

// ✅ Keep the same farmer record if they already exist (avoid new ID)
export function saveFarmer(farmer: Omit<Farmer, "id" | "created_at">): Farmer {
  const existing = localStorage.getItem(`farmer_${farmer.phone}`)
  if (existing) {
    const parsed = JSON.parse(existing)
    localStorage.setItem("current_farmer", JSON.stringify(parsed))
    return parsed
  }

  const newFarmer: Farmer = {
    id: farmer.phone, // Use phone as unique ID
    ...farmer,
    created_at: new Date().toISOString(),
  }

  localStorage.setItem(`farmer_${farmer.phone}`, JSON.stringify(newFarmer))
  localStorage.setItem("current_farmer", JSON.stringify(newFarmer))
  return newFarmer
}

export function getCurrentFarmer(): Farmer | null {
  const farmerData = localStorage.getItem("current_farmer")
  return farmerData ? JSON.parse(farmerData) : null
}

export function clearCurrentFarmer(): void {
  localStorage.removeItem("current_farmer")
}
