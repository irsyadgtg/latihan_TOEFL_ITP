import React, { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

interface DropdownProps {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ options, selectedValue, onSelect, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center text-left ${
          disabled ? 'bg-gray-200 text-gray-500' : 'bg-gray-50 cursor-pointer'
        }`}
      >
        <span>{selectedValue}</span>
        <IoIosArrowDown className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
