import { Button } from '@/components/ui/button';

const tabs = ['All', 'DRIVER', 'CONDUCTOR'] as const;
export type CrewTab = (typeof tabs)[number];

interface CrewTabsProps {
  activeTab: CrewTab;
  onTabChange: (tab: CrewTab) => void;
}

export function CrewTabs({ activeTab, onTabChange }: CrewTabsProps) {
  const getTabLabel = (tab: CrewTab) => {
    if (tab === 'All') return 'All';
    return tab.charAt(0) + tab.slice(1).toLowerCase() + 's';
  };

  return (
    <div className="flex gap-2 mb-4">
      {tabs.map((tab) => (
        <Button
          key={tab}
          onClick={() => onTabChange(tab)}
          variant={activeTab === tab ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
        >
          {getTabLabel(tab)}
        </Button>
      ))}
    </div>
  );
}
