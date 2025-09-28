"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentFarmer } from "@/lib/storage"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const farmer = getCurrentFarmer()
    if (farmer) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
