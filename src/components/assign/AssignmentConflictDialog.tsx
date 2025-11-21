'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AssignmentConflictDialogProps {
  open: boolean;
  errorMessage: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AssignmentConflictDialog({
  open,
  errorMessage,
  onConfirm,
  onCancel,
  isLoading = false,
}: AssignmentConflictDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Assignment Conflict</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="text-sm text-gray-700">{errorMessage}</div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading}
            className="flex-1 sm:flex-1"
          >
            Cancel Assignment
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="flex-1 sm:flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Processing...' : 'Confirm & Overwrite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
