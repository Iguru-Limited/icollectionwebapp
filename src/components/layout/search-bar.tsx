import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative mb-3">
      <MagnifyingGlassIcon 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
        width={16}
        height={16}
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
