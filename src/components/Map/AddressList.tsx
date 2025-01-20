import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Address {
  id: string;
  address: string;
  details?: string;
}

interface AddressListProps {
  addresses: Address[];
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}

const AddressList: React.FC<AddressListProps> = ({ addresses, onRemove, onSelect }) => {
  return (
    <ScrollArea className="h-full bg-white/80 backdrop-blur rounded-lg shadow-sm ring-1 ring-black/5">
      <div className="p-4 space-y-2">
        <h2 className="text-lg font-medium mb-4">Saved Locations</h2>
        {addresses.map((address) => (
          <div
            key={address.id}
            className="group relative p-3 bg-white/50 rounded-md hover:bg-white/80 transition-colors cursor-pointer"
            onClick={() => onSelect(address.id)}
          >
            <div className="pr-8">
              <p className="font-medium text-gray-900">{address.address}</p>
              {address.details && (
                <p className="mt-1 text-sm text-gray-600">{address.details}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(address.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default AddressList;