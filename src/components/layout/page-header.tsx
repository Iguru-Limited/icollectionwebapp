import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export function PageHeader({ title, showBack = true, backHref = '/user', rightAction }: PageHeaderProps) {
  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 pb-3 pt-4">
        {showBack && (
          <Link href={backHref} className="p-2 bg-amber-200 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Back">
            Back
          </Link>
        )}
        <h1 className="text-base font-semibold flex-1 text-gray-900">
          {title}
        </h1>
        {rightAction}
      </div>
    </header>
  );
}
