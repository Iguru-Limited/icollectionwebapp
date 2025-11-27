'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XMarkIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Crew } from '@/types/crew';
import type { VehicleItem } from '@/types/vehicle';

interface AssignCrewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: {
    number_plate: string;
    type_name: string;
    vehicle_id?: string;
  } | null;
  conductors: Crew[];
  drivers: Crew[];
  onAssign: (crewId: string, role: 'conductor' | 'driver') => void;
  onRemoveCrew?: (crewId: string, role: 'conductor' | 'driver') => void;
  loading?: boolean;
  removing?: boolean;
  assignedConductor?: Crew | null;
  assignedDriver?: Crew | null;
}

export function AssignCrewSheet({
  open,
  onOpenChange,
  vehicle,
  conductors,
  drivers,
  onAssign,
  onRemoveCrew,
  loading = false,
  removing = false,
  assignedConductor = null,
  assignedDriver = null,
}: AssignCrewSheetProps) {
  const [selectedConductor, setSelectedConductor] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [conductorSearch, setConductorSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [showConductorDropdown, setShowConductorDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; role: 'conductor' | 'driver' | null; crewName: string }>({
    open: false,
    role: null,
    crewName: '',
  });

  // Filter conductors based on search
  const filteredConductors = useMemo(() => {
    if (!conductorSearch.trim()) return conductors;
    const search = conductorSearch.toLowerCase();
    return conductors.filter(c => 
      c.name.toLowerCase().includes(search) || 
      c.badge_number?.toLowerCase().includes(search) ||
      c.phone?.toLowerCase().includes(search)
    );
  }, [conductors, conductorSearch]);

  // Filter drivers based on search
  const filteredDrivers = useMemo(() => {
    if (!driverSearch.trim()) return drivers;
    const search = driverSearch.toLowerCase();
    return drivers.filter(d => 
      d.name.toLowerCase().includes(search) || 
      d.badge_number?.toLowerCase().includes(search) ||
      d.phone?.toLowerCase().includes(search)
    );
  }, [drivers, driverSearch]);

  const handleAssign = () => {
    if (selectedConductor) {
      onAssign(selectedConductor, 'conductor');
    }
    if (selectedDriver) {
      onAssign(selectedDriver, 'driver');
    }
  };

  const selectedConductorObj = conductors.find(c => c.crew_id === selectedConductor);
  const selectedDriverObj = drivers.find(d => d.crew_id === selectedDriver);

  const handleConductorSelect = (conductor: Crew) => {
    setSelectedConductor(conductor.crew_id);
    setConductorSearch(conductor.name);
    setShowConductorDropdown(false);
  };

  const handleDriverSelect = (driver: Crew) => {
    setSelectedDriver(driver.crew_id);
    setDriverSearch(driver.name);
    setShowDriverDropdown(false);
  };

  const handleRemoveClick = (role: 'conductor' | 'driver', crewName: string) => {
    setRemoveDialog({ open: true, role, crewName });
  };

  const handleConfirmRemove = () => {
    if (removeDialog.role && onRemoveCrew) {
      const crewId = removeDialog.role === 'conductor' ? assignedConductor?.crew_id : assignedDriver?.crew_id;
      if (crewId) {
        onRemoveCrew(crewId, removeDialog.role);
      }
    }
    setRemoveDialog({ open: false, role: null, crewName: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Assign Crew to Vehicle</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Vehicle Info */}
          {vehicle && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-gray-900">{vehicle.number_plate}</div>
                <div className="text-sm text-gray-500">{vehicle.type_name}</div>
              </div>
            </div>
          )}

          {/* Conductor Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">CONDUCTOR</span>
              </div>
              <Badge className="bg-red-100 text-red-600 hover:bg-red-100 text-xs">
                {conductors.length} available
              </Badge>
            </div>

            {assignedConductor && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{assignedConductor.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {assignedConductor.badge_number && <span>Badge: {assignedConductor.badge_number}</span>}
                    {assignedConductor.phone && <span>• {assignedConductor.phone}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveClick('conductor', assignedConductor.name)}
                  className="ml-2 p-2 rounded-full hover:bg-red-100 transition-colors"
                  aria-label="Remove conductor"
                >
                  <XMarkIcon className="h-5 w-5 text-red-600" />
                </button>
              </div>
            )}

            <div className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={conductorSearch}
                  onChange={(e) => {
                    setConductorSearch(e.target.value);
                    setShowConductorDropdown(true);
                  }}
                  onFocus={() => setShowConductorDropdown(true)}
                  placeholder="Select conductor"
                  className="w-full pl-10 pr-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:border-red-400 focus:outline-none text-gray-900 placeholder:text-red-500"
                />
              </div>

              {showConductorDropdown && (
                <div className="absolute z-10 w-full mt-1 border border-gray-200 bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredConductors.map((conductor) => (
                    <button
                      key={conductor.crew_id}
                      onClick={() => handleConductorSelect(conductor)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 ${
                        selectedConductor === conductor.crew_id ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{conductor.name}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {conductor.badge_number && <span>Badge: {conductor.badge_number}</span>}
                        {conductor.phone && <span>• {conductor.phone}</span>}
                      </div>
                    </button>
                  ))}
                  {filteredConductors.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">No conductors found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Driver Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">DRIVER</span>
              </div>
              <Badge className="bg-red-100 text-red-600 hover:bg-red-100 text-xs">
                {drivers.length} available
              </Badge>
            </div>

            {assignedDriver && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{assignedDriver.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {assignedDriver.badge_number && <span>Badge: {assignedDriver.badge_number}</span>}
                    {assignedDriver.phone && <span>• {assignedDriver.phone}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveClick('driver', assignedDriver.name)}
                  className="ml-2 p-2 rounded-full hover:bg-red-100 transition-colors"
                  aria-label="Remove driver"
                >
                  <XMarkIcon className="h-5 w-5 text-red-600" />
                </button>
              </div>
            )}

            <div className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={driverSearch}
                  onChange={(e) => {
                    setDriverSearch(e.target.value);
                    setShowDriverDropdown(true);
                  }}
                  onFocus={() => setShowDriverDropdown(true)}
                  placeholder="Select driver"
                  className="w-full pl-10 pr-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:border-red-400 focus:outline-none text-gray-900 placeholder:text-red-500"
                />
              </div>

              {showDriverDropdown && (
                <div className="absolute z-10 w-full mt-1 border border-gray-200 bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredDrivers.map((driver) => (
                    <button
                      key={driver.crew_id}
                      onClick={() => handleDriverSelect(driver)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 ${
                        selectedDriver === driver.crew_id ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{driver.name}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {driver.badge_number && <span>Badge: {driver.badge_number}</span>}
                        {driver.phone && <span>• {driver.phone}</span>}
                      </div>
                    </button>
                  ))}
                  {filteredDrivers.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">No drivers found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t">
          <Button
            onClick={handleAssign}
            disabled={loading || (!selectedConductor && !selectedDriver)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? 'Assigning...' : 'Assign Crew'}
          </Button>
        </div>
      </DialogContent>

      {/* Remove Crew Confirmation Dialog */}
      <Dialog open={removeDialog.open} onOpenChange={(open) => !open && setRemoveDialog({ open: false, role: null, crewName: '' })}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Remove Crew Member?</h2>
              <p className="text-sm text-gray-600">
                Are you sure you want to remove {removeDialog.crewName} from {vehicle?.number_plate}?
              </p>
            </div>
            <div className="flex gap-3 w-full pt-2">
              <Button
                onClick={() => setRemoveDialog({ open: false, role: null, crewName: '' })}
                variant="outline"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 border-0"
                disabled={removing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRemove}
                className="flex-1 bg-red-900 hover:bg-red-800 text-white"
                disabled={removing}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                {removing ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
