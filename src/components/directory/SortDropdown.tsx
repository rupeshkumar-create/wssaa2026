"use client";

import { useState } from "react";
import { ChevronDown, ArrowUpDown, User, Trophy, Tag, Calendar } from "lucide-react";

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const sortOptions = [
  { value: "votes", label: "Most Votes", icon: Trophy },
  { value: "name", label: "Name (A-Z)", icon: User },
  { value: "category", label: "Category", icon: Tag },
  { value: "recent", label: "Most Recent", icon: Calendar },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = sortOptions.find(option => option.value === value) || sortOptions[0];
  const SelectedIcon = selectedOption.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00ADC4] to-[#078197] text-white rounded-lg hover:from-[#009BB3] hover:to-[#067086] focus:outline-none focus:ring-2 focus:ring-[#00ADC4] focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <ArrowUpDown className="h-4 w-4 text-white" />
        <SelectedIcon className="h-4 w-4 text-white" />
        <span className="text-white font-medium">{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border-2 border-[#00ADC4]/20 rounded-lg shadow-lg z-20">
            <div className="py-2">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-[#00ADC4]/10 hover:to-[#078197]/10 transition-colors flex items-center gap-3 ${
                      value === option.value ? 'bg-gradient-to-r from-[#00ADC4]/20 to-[#078197]/20 text-[#078197]' : 'text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}