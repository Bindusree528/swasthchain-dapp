export interface Farmer {
  id: string
  name: string
  phone: string
  created_at: string
}

export function saveFarmer(farmer: Omit<Farmer, "id" | "created_at">): Farmer {
  const newFarmer: Farmer = {
    id: Math.random().toString(36).substr(2, 9),
    ...farmer,
    created_at: new Date().toISOString(),
  }

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
