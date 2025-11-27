"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to unassigned vehicles page
export default function PendingCategoriesPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/user/unassigned/vehicles');
  }, [router]);

  return null;
}
