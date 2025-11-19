import { useSession } from 'next-auth/react';
import type { UserRight } from '@/types/auth/userauthentication';

/**
 * Hook to easily access user rights/permissions
 * Returns the rights array and helper methods to check specific permissions
 */
export function useUserRights() {
  const { data: session } = useSession();
  const rights = session?.user?.rights || [];

  /**
   * Check if user has a specific right by right_name
   */
  const hasRight = (rightName: string): boolean => {
    return rights.some((right) => right.right_name === rightName);
  };

  /**
   * Get a specific right object by right_name
   */
  const getRight = (rightName: string): UserRight | undefined => {
    return rights.find((right) => right.right_name === rightName);
  };

  return {
    rights,
    hasRight,
    getRight,
    // Specific permission checks based on the API response
    canManageCollection: hasRight('collection'),
    canViewVehicles: hasRight('view_vehicles'),
    canAssignCrew: hasRight('assign_crew'),
    canManageCrew: hasRight('manage_crew'),
    hasAnyRight: () => rights.length > 0,
  };
}
