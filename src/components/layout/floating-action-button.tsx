import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { THEME_COLORS } from '@/lib/utils/constants';

interface FloatingActionButtonProps {
  href: string;
  icon: LucideIcon;
  label?: string;
}

export function FloatingActionButton({ href, icon: Icon, label }: FloatingActionButtonProps) {
  return (
    <Link 
      href={href} 
      className="fixed right-4 bottom-24 rounded-full p-4 shadow-lg" 
      style={{ backgroundColor: THEME_COLORS.PRIMARY, color: THEME_COLORS.SURFACE }}
      aria-label={label}
    >
      <Icon size={18} />
    </Link>
  );
}
