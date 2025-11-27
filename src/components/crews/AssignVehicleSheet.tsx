"use client";
import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { Crew } from "@/types/crew";

interface Vehicle {
  vehicle_id: number | string;
  number_plate: string;
  type_name?: string;
  crew?: { crew_id: string; crew_role_id: string; name?: string }[];
}

interface AssignVehicleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crew: Crew | null;
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onVehicleChange: (vehicleId: string) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function AssignVehicleSheet({
  open,
  onOpenChange,
  crew,
  vehicles,
  selectedVehicleId,
  onVehicleChange,
  onConfirm,
  loading = false,
}: AssignVehicleSheetProps) {
  const [search, setSearch] = useState("");

  const filteredVehicles = useMemo(() => {
    if (!search.trim()) return vehicles;
    const s = search.toLowerCase();
    return vehicles.filter(v =>
      v.number_plate.toLowerCase().includes(s) || (v.type_name || "").toLowerCase().includes(s)
    );
  }, [vehicles, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Assign Vehicle</h2>
          {crew && (
            <p className="mt-1 text-sm text-gray-600">
              {crew.name} {crew.role_name ? `(${crew.role_name})` : ''}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vehicle by plate or type"
                className="w-full pl-10 pr-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:border-purple-400 focus:outline-none text-gray-900 placeholder:text-purple-500"
              />
            </div>

          {/* Vehicle List */}
          <div className="space-y-2">
            {filteredVehicles.map(v => {
              const assigned = v.crew && v.crew.length > 0;
              const isSelected = String(v.vehicle_id) === selectedVehicleId;
              return (
                <button
                  key={v.vehicle_id}
                  onClick={() => onVehicleChange(String(v.vehicle_id))}
                  className={`w-full text-left px-4 py-3 border rounded-lg flex items-center justify-between transition-colors ${
                    isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  disabled={loading}
                >
                  <div>
                    <div className="font-medium text-gray-900 uppercase">{v.number_plate}</div>
                    <div className="text-xs text-gray-500">{v.type_name || 'VEHICLE'}</div>
                  </div>
                  {assigned ? (
                    <span className="text-[10px] font-semibold px-2 py-1 rounded bg-red-100 text-red-700">Assigned</span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-1 rounded bg-green-100 text-green-700">Available</span>
                  )}
                </button>
              );
            })}
            {filteredVehicles.length === 0 && (
              <div className="text-sm text-gray-500 py-6 text-center">No vehicles match your search.</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t">
          <Button
            onClick={onConfirm}
            disabled={loading || !selectedVehicleId}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? 'Assigning...' : 'Assign Vehicle'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
