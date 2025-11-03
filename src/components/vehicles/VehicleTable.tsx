'use client';
import { Car, FileText, SquarePen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';

interface Vehicle {
  vehicle_id: number;
  number_plate: string;
  seats?: number;
}

interface VehicleTableProps {
  vehicles: Vehicle[];
  isLoading?: boolean;
}

export function VehicleTable({ vehicles, isLoading = false }: VehicleTableProps) {
  const router = useRouter();
  const setSelectedVehicleId = useAppStore((s) => s.setSelectedVehicleId);

  if (isLoading) {
    return (
      <Card className="p-8 text-center text-gray-500">
        <div className="animate-pulse">Loading vehicles...</div>
      </Card>
    );
  }

  if (vehicles.length === 0) {
    return <Card className="p-8 text-center text-gray-500">No vehicles found</Card>;
  }

  // Responsive table layout
  return (
    <Card className="rounded-2xl shadow-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-purple-50 hover:bg-purple-50">
            <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl">#</TableHead>
            <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl">Number Plate</TableHead>
            <TableHead className="font-semibold text-purple-900 text-center text-xl md:text-2xl hidden sm:table-cell">
              Seats
            </TableHead>
            <TableHead className="font-semibold text-purple-900 text-right text-xl md:text-2xl">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle, index) => (
            <TableRow key={vehicle.vehicle_id} className="hover:bg-gray-50">
              <TableCell className="font-large text-gray-600 text-xl md:text-2xl">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 md:w-6 md:h-6 text-black-600" />
                  <span className="font-bold text-xl md:text-2xl text-gray-800 uppercase">
                    {vehicle.number_plate}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center text-xl md:text-2xl text-gray-700 hidden sm:table-cell">
                {vehicle.seats || 14}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 md:gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-base md:text-2xl"
                    onClick={() => {
                      setSelectedVehicleId(vehicle.vehicle_id);
                      router.push('/user/collection');
                    }}
                  >
                    <SquarePen className="w-4 h-4 md:w-5 md:h-5 md:mr-1" />
                    <span className="hidden md:inline">Receipt</span>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-base md:text-2xl"
                    onClick={() => router.push(`/user/report/${vehicle.vehicle_id}`)}
                  >
                    <FileText className="w-4 h-4 md:w-5 md:h-5 md:mr-1" />
                    <span className="hidden md:inline">Transactions</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
