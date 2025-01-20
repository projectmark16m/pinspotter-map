import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AddressFormProps {
  onAddAddress: (address: string) => Promise<void>;
  isLoading?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ onAddAddress, isLoading }) => {
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Please enter an address");
      return;
    }
    try {
      await onAddAddress(address);
      setAddress("");
      toast.success("Address added successfully");
    } catch (error) {
      toast.error("Failed to add address");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-white/80 backdrop-blur rounded-lg shadow-sm ring-1 ring-black/5">
      <Input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter address..."
        className="flex-1"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        Add Pin
      </Button>
    </form>
  );
};

export default AddressForm;