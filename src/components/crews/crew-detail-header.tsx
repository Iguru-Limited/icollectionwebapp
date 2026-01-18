'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { UserIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { Crew } from '@/types/crew';

interface CrewDetailHeaderProps {
  crew: Crew;
  active: 'bio' | 'actions' | 'history';
  onSelect: (key: 'bio' | 'actions' | 'history') => void;
}

export function CrewDetailHeader({ crew, active, onSelect }: CrewDetailHeaderProps) {
  const initials = crew.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CR';
  const isActive = crew.active === '1';
  const [imageOpen, setImageOpen] = useState(false);
  const hasPhoto = Boolean(crew.photo);
  const photoSrc = crew.photo ?? '';

  return (
    <div className="bg-white pb-4">
      <div className="mx-auto max-w-4xl px-4">
        {/* Avatar and Name Section */}
        <div className="flex items-start gap-4 pt-4">
          <Dialog open={imageOpen} onOpenChange={setImageOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={`relative flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${hasPhoto ? 'cursor-pointer' : 'cursor-default'}`}
                aria-label={hasPhoto ? 'View crew photo' : 'Crew photo unavailable'}
                disabled={!hasPhoto}
              >
                <Avatar className="h-16 w-16 bg-red-600">
                  {crew.photo && <AvatarImage src={crew.photo} alt={crew.name || 'Crew'} />}
                  <AvatarFallback className="text-2xl bg-red-600 text-white font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {hasPhoto && (
                  <span className="absolute inset-0 rounded-full bg-black/25 opacity-0 transition-opacity duration-150 hover:opacity-100" aria-hidden />
                )}
              </button>
            </DialogTrigger>

            {hasPhoto && (
              <DialogContent className="max-w-4xl border-none bg-transparent shadow-none">
                <div className="overflow-hidden rounded-xl bg-black/90 p-2">
                  <img
                    src={photoSrc}
                    alt={crew.name || 'Crew'}
                    className="max-h-[80vh] w-full object-contain"
                  />
                </div>
              </DialogContent>
            )}
          </Dialog>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{crew.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                N/A
              </Badge>
              <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => onSelect('bio')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                active === 'bio'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserIcon className="w-4 h-4 inline mr-1" />
              Bio Info
            </button>
            <button
              onClick={() => onSelect('actions')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                active === 'actions'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Actions
            </button>
            <button
              onClick={() => onSelect('history')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                active === 'history'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClockIcon className="w-4 h-4 inline mr-1" />
              History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
