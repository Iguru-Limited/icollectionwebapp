import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export function PageHeader({ title, showBack = true, backHref = '/user', rightAction }: PageHeaderProps) {
  return (
    <header className="px-4 pt-4 pb-3 flex items-center gap-3 bg-white">
      {showBack && (
        <Link href={backHref} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Back">
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>
      )}
      <h1 className="text-base font-semibold flex-1 text-gray-900">
        {title}
      </h1>
      {rightAction}
    </header>
  );
}
