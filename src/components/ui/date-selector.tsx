'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDayLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const selected = new Date(date);
  selected.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - selected.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} Days Ago`;
  
  return 'Selected Date';
}

export function DateSelector({ selectedDate, onDateChange, className }: DateSelectorProps) {
  const goToPreviousDay = () => {
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() - 1,
    );
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() + 1,
    );
    onDateChange(newDate);
  };

  return (
    <Card className={`rounded-2xl p-4 shadow-sm bg-white ${className || ''}`}>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-purple-50"
          onClick={goToPreviousDay}
        >
          <ChevronLeft className="w-5 h-5 text-purple-600" />
        </Button>

        <div className="flex-1 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {getDayLabel(selectedDate)}
          </h2>
          <p className="text-xl md:text-2xl text-gray-500">{formatDate(selectedDate)}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-purple-50"
          onClick={goToNextDay}
        >
          <ChevronRight className="w-5 h-5 text-purple-600" />
        </Button>
      </div>
    </Card>
  );
}
