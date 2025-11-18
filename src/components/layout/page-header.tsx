import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { THEME_COLORS } from '@/lib/utils/constants';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export function PageHeader({ title, showBack = true, backHref = '/user', rightAction }: PageHeaderProps) {
  return (
    <header className="px-4 pt-4 pb-3 flex items-center gap-3" style={{ backgroundColor: THEME_COLORS.BACKGROUND }}>
      {showBack && (
        <Link href={backHref} className="p-2" aria-label="Back">
          <ChevronLeft size={20} />
        </Link>
      )}
      <h1 className="text-base font-semibold flex-1" style={{ color: THEME_COLORS.TEXT }}>
        {title}
      </h1>
      {rightAction}
    </header>
  );
}
