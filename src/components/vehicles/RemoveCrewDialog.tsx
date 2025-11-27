"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon, TrashIcon } from "@heroicons/react/24/outline";

interface RemoveCrewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewName: string;
  vehiclePlate: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function RemoveCrewDialog({ open, onOpenChange, crewName, vehiclePlate, onConfirm, loading = false }: RemoveCrewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Remove Crew Member?</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to remove {crewName} from {vehiclePlate}?
            </p>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 border-0"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-900 hover:bg-red-800 text-white"
              disabled={loading}
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              {loading ? "Removing..." : "Remove"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
