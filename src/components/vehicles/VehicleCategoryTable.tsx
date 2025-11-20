"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import type { VehicleItem } from '@/types/vehicle';

interface VehicleCategoryTableProps {
  vehicles: VehicleItem[];
  isLoading?: boolean;
}

// Helper to extract first matching crew member by role id or role name heuristic
function findCrew(crew: VehicleItem['crew'], roleIds: string[], roleNames: string[]): string | null {
  const match = crew.find(c => roleIds.includes(c.crew_role_id) || roleNames.some(r => r === c.crew_role_id));
  return match?.name || null;
}

function getDriverName(crew: VehicleItem['crew']): string | null {
  // Known driver role_id examples: '3'
  return findCrew(crew, ['3'], ['DRIVER']);
}

function getConductorName(crew: VehicleItem['crew']): string | null {
  // Known conductor role_id examples: '12'
  return findCrew(crew, ['12'], ['CONDUCTOR']);
}

export function VehicleCategoryTable({ vehicles, isLoading }: VehicleCategoryTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
        ))}
      </Card>
    );
  }

  if (vehicles.length === 0) {
    return <Card className="p-8 text-center text-gray-500">No vehicles found</Card>;
  }

  return (
    <Card className="overflow-x-auto rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Conductor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((v, idx) => {
            const driver = getDriverName(v.crew) || '-';
            const conductor = getConductorName(v.crew) || '-';
            return (
              <TableRow key={v.vehicle_id} className="hover:bg-gray-50">
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="font-medium uppercase">{v.number_plate}</TableCell>
                <TableCell>{driver}</TableCell>
                <TableCell>{conductor}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}