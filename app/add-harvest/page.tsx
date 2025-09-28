"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { getCurrentFarmer, type Farmer } from "@/lib/storage";
import {
  validateHarvestData,
  generateBlockchainTransaction,
  saveLedgerRecord,
  type HarvestRecord,
} from "@/lib/blockchain";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Camera, CheckCircle } from "lucide-react";

const HERB_OPTIONS = ["Ashwagandha", "Tulsi", "Amla"];

export default function AddHarvestPage() {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [herbName, setHerbName] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [qualityScore, setQualityScore] = useState<number[]>([3]);
  const [moisturePercent, setMoisturePercent] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const currentFarmer = getCurrentFarmer();
    if (!currentFarmer) {
      router.push("/login");
      return;
    }
    setFarmer(currentFarmer);
  }, [router]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation is not supported by this browser", variant: "destructive" });
      return;
    }

    setIsCapturingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setIsCapturingLocation(false);
        toast({
          title: "Location Captured",
          description: `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`,
        });
      },
      () => {
        setIsCapturingLocation(false);
        toast({ title: "Location Error", description: "Failed to capture location. Please try again.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!farmer) return;

    if (!herbName || !quantityKg || !moisturePercent) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const quantity = Number.parseFloat(quantityKg);
    const moisture = Number.parseFloat(moisturePercent);
    if (Number.isNaN(quantity) || Number.isNaN(moisture)) {
      toast({ title: "Error", description: "Please enter valid numbers for quantity and moisture", variant: "destructive" });
      return;
    }

    const validation = validateHarvestData({
      quantity_kg: quantity,
      moisture_percent: moisture,
      gps_coordinates: gpsCoordinates ?? undefined,
    });
    if (!validation.valid) {
      toast({ title: "Validation Failed", description: validation.error, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const blockchainTx = generateBlockchainTransaction();

      const harvestRecord: HarvestRecord = {
        id: Math.random().toString(36).substr(2, 9),
        farmer_id: farmer.id,      // phone-based identity
        farmer_name: farmer.name,
        herb_name: herbName,
        quantity_kg: quantity,
        quality_score: qualityScore[0],
        moisture_percent: moisture,
        notes: notes.trim(),
        photo_url: photoPreview || undefined,
        gps_coordinates: gpsCoordinates!, // safe due to validation above
        blockchain_tx: blockchainTx,
        ai_verified: !!photoFile,
        recalled: false,
        created_at: new Date().toISOString(),
      };

      saveLedgerRecord(harvestRecord);

      toast({ title: "Success!", description: "Harvest recorded on blockchain" });
      router.push(`/success?block_id=${blockchainTx.block_id}&tx=${blockchainTx.tx_hash}`);
    } catch {
      toast({ title: "Error", description: "Failed to record harvest. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!farmer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary">Add New Harvest</h1>
            <p className="text-sm text-muted-foreground">Record harvest details for blockchain verification</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Harvest Details</CardTitle>
            <CardDescription>Fill in all required information to record your harvest on the blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Herb Selection */}
              <div className="space-y-2">
                <Label htmlFor="herb">Herb Name *</Label>
                <Select value={herbName} onValueChange={(v) => setHerbName(v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an herb" />
                  </SelectTrigger>
                  <SelectContent>
                    {HERB_OPTIONS.map((herb) => (
                      <SelectItem key={herb} value={herb}>
                        {herb}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  placeholder="Enter quantity in kg (max 50)"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Maximum allowed: 50 kg</p>
              </div>

              {/* Quality Score */}
              <div className="space-y-3">
                <Label>Quality Score: {qualityScore[0]}/5</Label>
                <Slider value={qualityScore} onValueChange={(v) => setQualityScore(v)} max={5} min={1} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Poor (1)</span>
                  <span>Excellent (5)</span>
                </div>
              </div>

              {/* Moisture Percentage */}
              <div className="space-y-2">
                <Label htmlFor="moisture">Moisture Percentage *</Label>
                <Input
                  id="moisture"
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  placeholder="Enter moisture % (max 15%)"
                  value={moisturePercent}
                  onChange={(e) => setMoisturePercent(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Maximum allowed: 15%</p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the harvest..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo">Photo Upload</Label>
                <div className="flex items-center gap-4">
                  <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="flex-1" />
                  <Camera className="h-5 w-5 text-muted-foreground" />
                </div>
                {photoPreview && (
                  <div className="mt-2">
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Harvest preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    {photoFile && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        AI Verification Badge will be added
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* GPS Coordinates */}
              <div className="space-y-2">
                <Label>GPS Coordinates *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    value={
                      gpsCoordinates
                        ? `${gpsCoordinates.latitude.toFixed(6)}, ${gpsCoordinates.longitude.toFixed(6)}`
                        : ""
                    }
                    placeholder="GPS coordinates will appear here"
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={captureLocation}
                    disabled={isCapturingLocation}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <MapPin className="h-4 w-4" />
                    {isCapturingLocation ? "Capturing..." : "Capture Location"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  GPS coordinates are required for blockchain verification
                </p>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Recording on Blockchain..." : "Record Harvest"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
