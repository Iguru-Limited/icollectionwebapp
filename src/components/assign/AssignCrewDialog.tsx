'use client';

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AutocompleteInput, type AutocompleteOption } from '@/components/ui/autocomplete-input';
import type { Crew } from '@/types/crew';

interface AssignCrewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  crews: Crew[];
  selectedCrewId: string;
  onCrewChange: (crewId: string) => void;
  onConfirm: () => void;
  loading?: boolean;
  placeholder?: string;
}

export function AssignCrewDialog({
  open,
  onOpenChange,
  title,
  description,
  crews,
  selectedCrewId,
  onCrewChange,
  onConfirm,
  loading = false,
  placeholder = 'Type to search crew member...',
}: AssignCrewDialogProps) {
  const crewOptions: AutocompleteOption[] = useMemo(
    () =>
      crews.map((crew) => ({
        value: crew.crew_id,
        label: crew.name,
        subtitle: crew.badge_number ? `Badge: ${crew.badge_number}` : crew.role_name || undefined,
      })),
    [crews]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {description && (
            <div className="text-sm text-gray-600">{description}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="crew-search">Select Crew Member</Label>
            <AutocompleteInput
              options={crewOptions}
              value={selectedCrewId}
              onValueChange={onCrewChange}
              placeholder={placeholder}
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading || !selectedCrewId}>
            {loading ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
