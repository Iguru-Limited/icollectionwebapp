import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';

interface FloatingActionButtonProps {
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label?: string;
}

export function FloatingActionButton({ href, icon: Icon, label }: FloatingActionButtonProps) {
  return (
    <Link 
      href={href} 
      className="fixed right-4 bottom-24 rounded-full p-4 shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors" 
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </Link>
  );
}
