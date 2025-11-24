'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { CheckIcon } from '@heroicons/react/24/solid';

export interface AutocompleteOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface AutocompleteInputProps {
  options: AutocompleteOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showSelectedMessage?: boolean;
}

export function AutocompleteInput({
  options,
  value,
  onValueChange,
  placeholder = 'Type to search...',
  disabled = false,
  className = '',
  showSelectedMessage = true,
}: AutocompleteInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Reset search when value changes externally
  useEffect(() => {
    if (value && selectedOption) {
      setSearchQuery(selectedOption.label);
    } else {
      setSearchQuery('');
    }
  }, [value, selectedOption]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          handleSelectOption(filteredOptions[selectedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectOption = (optionValue: string) => {
    const option = options.find((opt) => opt.value === optionValue);
    if (option) {
      onValueChange(optionValue);
      setSearchQuery(option.label);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);

    // Clear selection if user modifies the input
    if (selectedOption && newValue !== selectedOption.label) {
      onValueChange('');
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full"
        />

        {showSuggestions && searchQuery && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                  index === selectedIndex
                    ? 'bg-purple-50 text-purple-900'
                    : 'hover:bg-gray-50'
                } ${
                  option.value === value
                    ? 'bg-purple-100'
                    : ''
                }`}
                onClick={() => handleSelectOption(option.value)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.subtitle && (
                    <span className="text-xs text-gray-500">{option.subtitle}</span>
                  )}
                </div>
                {option.value === value && (
                  <CheckIcon className="w-4 h-4 text-purple-700 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        {showSuggestions && searchQuery && filteredOptions.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
            <p className="text-sm text-gray-500">No matches found</p>
          </div>
        )}
      </div>

      {showSelectedMessage && value && selectedOption && (
        <div className="text-sm text-green-600 flex items-center gap-2 mt-2">
          <CheckIcon className="w-4 h-4" />
          <span>Selected: {selectedOption.label}</span>
        </div>
      )}
    </div>
  );
}
