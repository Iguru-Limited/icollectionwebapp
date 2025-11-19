import { Button } from '@/components/ui/button';
import type { CrewRole } from '@/types/crew';

interface CrewTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  roles: CrewRole[];
  isLoading?: boolean;
}

export function CrewTabs({ activeTab, onTabChange, roles, isLoading }: CrewTabsProps) {
  const getTabLabel = (roleName: string) => {
    if (roleName === 'All') return 'All';
    // Pluralize: DRIVER -> Drivers, CONDUCTOR -> Conductors
    return roleName.charAt(0) + roleName.slice(1).toLowerCase() + 's';
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" className="rounded-full" disabled>
          Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      <Button
        onClick={() => onTabChange('All')}
        variant={activeTab === 'All' ? 'default' : 'outline'}
        size="sm"
        className="rounded-full"
      >
        All
      </Button>
      {roles.map((role) => (
        <Button
          key={role.role_id}
          onClick={() => onTabChange(role.role_name)}
          variant={activeTab.toUpperCase() === role.role_name.toUpperCase() ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
        >
          {getTabLabel(role.role_name)}
        </Button>
      ))}
    </div>
  );
}
