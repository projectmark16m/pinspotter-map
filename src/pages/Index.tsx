import React, { useState } from "react";
import MapView from "@/components/Map/MapView";
import AddressForm from "@/components/Map/AddressForm";
import AddressList from "@/components/Map/AddressList";
import { toast } from "sonner";

interface Location {
  id: string;
  address: string;
  coordinates: [number, number];
  details?: string;
}

const Index = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const geocodeAddress = async (address: string): Promise<[number, number]> => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=YOUR_MAPBOX_TOKEN`
    );
    const data = await response.json();
    if (!data.features?.[0]?.center) {
      throw new Error("Address not found");
    }
    return data.features[0].center;
  };

  const handleAddAddress = async (address: string) => {
    setIsLoading(true);
    try {
      const coordinates = await geocodeAddress(address);
      const newLocation: Location = {
        id: Date.now().toString(),
        address,
        coordinates,
      };
      setLocations((prev) => [...prev, newLocation]);
    } catch (error) {
      toast.error("Failed to geocode address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAddress = (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    toast.success("Address removed");
  };

  const handleSelectAddress = (id: string) => {
    // Implementation for selecting and focusing on an address
    // This will be handled by the MapView component
  };

  return (
    <div className="flex h-screen p-4 gap-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-80 flex flex-col gap-4">
        <AddressForm onAddAddress={handleAddAddress} isLoading={isLoading} />
        <AddressList
          addresses={locations}
          onRemove={handleRemoveAddress}
          onSelect={handleSelectAddress}
        />
      </div>
      <div className="flex-1">
        <MapView markers={locations} className="h-full" />
      </div>
    </div>
  );
};

export default Index;