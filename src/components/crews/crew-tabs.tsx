import { THEME_COLORS } from '@/lib/utils/constants';

const tabs = ['All', 'Drivers', 'Conductors'] as const;
export type CrewTab = (typeof tabs)[number];

interface CrewTabsProps {
  activeTab: CrewTab;
  onTabChange: (tab: CrewTab) => void;
}

export function CrewTabs({ activeTab, onTabChange }: CrewTabsProps) {
  return (
    <div className="flex gap-2 mb-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-3 py-1.5 text-xs rounded-full border ${activeTab === tab ? 'font-medium' : ''}`}
          style={{
            backgroundColor: activeTab === tab ? THEME_COLORS.SURFACE : THEME_COLORS.BACKGROUND,
            borderColor: THEME_COLORS.BORDER,
            color: activeTab === tab ? THEME_COLORS.TEXT : THEME_COLORS.TEXT_LIGHT,
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
