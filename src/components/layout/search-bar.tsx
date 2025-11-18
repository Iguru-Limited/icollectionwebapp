import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { THEME_COLORS } from '@/lib/utils/constants';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative mb-3">
      <Search 
        className="absolute left-3 top-1/2 -translate-y-1/2" 
        size={16} 
        style={{ color: THEME_COLORS.TEXT_LIGHT }} 
      />
      <Input 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        className="pl-9 h-10 rounded-full" 
      />
    </div>
  );
}
