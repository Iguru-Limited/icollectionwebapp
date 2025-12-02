"use client";
import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { Crew } from "@/types/crew";

interface Vehicle {
  vehicle_id: number | string;
  number_plate: string;
  fleet_number?: string | null;
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
  
  // Check if crew is active
  const isCrewActive = crew?.active === '1';

  const filteredVehicles = useMemo(() => {
    if (!search.trim()) return vehicles;
    const s = search.toLowerCase();
    return vehicles.filter(v =>
      v.number_plate.toLowerCase().includes(s) || (v.fleet_number || '').toLowerCase().includes(s) || (v.type_name || "").toLowerCase().includes(s)
    );
  }, [vehicles, search]);
  
  const handleConfirm = () => {
    if (!isCrewActive) {
      // Don't proceed if crew is not active
      return;
    }
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Assign Vehicle</h2>
          {crew && (
            <div className="mt-1">
              <p className="text-sm text-gray-600">
                {crew.name} {crew.role_name ? `(${crew.role_name})` : ''}
              </p>
              {!isCrewActive && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-medium">This crew member is inactive and cannot be assigned to a vehicle</span>
                </div>
              )}
            </div>
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
                placeholder="Search vehicle by plate, fleet number, or type"
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
            onClick={handleConfirm}
            disabled={loading || !selectedVehicleId || !isCrewActive}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Assigning...' : !isCrewActive ? 'Crew Inactive - Cannot Assign' : 'Assign Vehicle'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
