import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface FloatingActionButtonProps {
  href: string;
  icon: LucideIcon;
  label?: string;
}

export function FloatingActionButton({ href, icon: Icon, label }: FloatingActionButtonProps) {
  return (
    <Link 
      href={href} 
      className="fixed right-4 bottom-24 rounded-full p-4 shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors" 
      aria-label={label}
    >
      <Icon size={18} />
    </Link>
  );
}
