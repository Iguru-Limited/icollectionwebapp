export interface Crew {
  id: string;
  name: string;
  role: 'Driver' | 'Conductor' | string;
  phone?: string;
  employeeNo?: string;
  badgeNo?: string;
  badgeExpiry?: string; // ISO date
  avatarUrl?: string;
}

// Simple in-memory store for demo purposes
const initial: Crew[] = [
  {
    id: '1',
    name: 'James Kariuki',
    role: 'Driver',
    phone: '+254712345678',
    employeeNo: 'EMP-00123',
    badgeNo: 'BDG-98765',
    badgeExpiry: '2024-07-15',
  },
  {
    id: '2',
    name: 'Nadine Mwangi',
    role: 'Conductor',
    phone: '+254701234567',
    employeeNo: 'C-11238',
    badgeNo: 'BDG-54321',
    badgeExpiry: '2026-03-15',
  },
  {
    id: '3',
    name: 'Daniel Otieno',
    role: 'Driver',
    phone: '+254733221144',
    employeeNo: 'B-44591',
    badgeNo: 'BDG-11223',
    badgeExpiry: '2024-08-01',
  },
];

export const crewsStore: Crew[] = initial;
