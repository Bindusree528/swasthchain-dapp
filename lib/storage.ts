export interface Farmer {
  id: string;       // phone used as stable id
  name: string;
  phone: string;
  created_at: string;
}

/**
 * Create or reuse a farmer. Phone number becomes the stable id.
 */
export function saveFarmer(
  farmer: Omit<Farmer, "id" | "created_at">
): Farmer {
  const key = `farmer_${farmer.phone}`;
  const existing = localStorage.getItem(key);
  if (existing) {
    const parsed: Farmer = JSON.parse(existing);
    localStorage.setItem("current_farmer", JSON.stringify(parsed));
    return parsed;
  }

  const newFarmer: Farmer = {
    id: farmer.phone,            // ✅ phone = stable id
    ...farmer,
    created_at: new Date().toISOString(),
  };

  localStorage.setItem(key, JSON.stringify(newFarmer));
  localStorage.setItem("current_farmer", JSON.stringify(newFarmer));
  return newFarmer;
}

export function getCurrentFarmer(): Farmer | null {
  const s = localStorage.getItem("current_farmer");
  return s ? (JSON.parse(s) as Farmer) : null;
}

export function clearCurrentFarmer(): void {
  localStorage.removeItem("current_farmer");
}
