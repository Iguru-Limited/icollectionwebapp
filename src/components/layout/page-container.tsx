import { THEME_COLORS } from '@/lib/utils/constants';

interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME_COLORS.BACKGROUND }}>
      {children}
    </div>
  );
}
