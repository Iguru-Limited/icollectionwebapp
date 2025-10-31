"use client";
import { Car, FileText, SquarePen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";

interface Vehicle {
  vehicle_id: number;
  number_plate: string;
  seats?: number;
}

interface VehicleTableProps {
  vehicles: Vehicle[];
  isLoading?: boolean;
  variant?: "table" | "card";
}

export function VehicleTable({ vehicles, isLoading = false, variant = "card" }: VehicleTableProps) {
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
    return (
      <Card className="p-8 text-center text-gray-500">
        No vehicles found
      </Card>
    );
  }

  // Table variant for desktop
  if (variant === "table") {
    return (
      <Card className="rounded-2xl shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-purple-50 hover:bg-purple-50">
              <TableHead className="font-semibold text-purple-900">#</TableHead>
              <TableHead className="font-semibold text-purple-900">
                Number Plate
              </TableHead>
              <TableHead className="font-semibold text-purple-900 text-center">
                Seats
              </TableHead>
              <TableHead className="font-semibold text-purple-900 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle, index) => (
              <TableRow key={vehicle.vehicle_id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-600">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-gray-800 uppercase">
                      {vehicle.number_plate}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-gray-700">
                  {vehicle.seats || 14}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        setSelectedVehicleId(vehicle.vehicle_id);
                        router.push("/user/collection");
                      }}
                    >
                      <SquarePen className="w-3 h-3 mr-1" />
                      Receipt
                    </Button>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-xs"
                      onClick={() =>
                        router.push(`/user/report/${vehicle.vehicle_id}`)
                      }
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Transactions
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

  // Card variant for mobile and default
  return (
    <div className="space-y-3">
      {vehicles.map((vehicle, index) => (
        <Card
          key={vehicle.vehicle_id}
          className="rounded-2xl border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-all p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 uppercase">
                  {vehicle.number_plate}
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  {vehicle.seats || 14} seats
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl h-11 font-semibold text-sm md:text-base transition-all"
              onClick={() => {
                setSelectedVehicleId(vehicle.vehicle_id);
                router.push("/user/collection");
              }}
            >
              Receipts
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 font-semibold text-sm md:text-base shadow-md transition-all"
              onClick={() =>
                router.push(`/user/report/${vehicle.vehicle_id}`)
              }
            >
              Transactions
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
