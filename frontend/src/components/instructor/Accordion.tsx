import React, { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 focus:outline-none"
      >
        <span>{title}</span>
        <IoIosArrowDown 
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen mt-4' : 'max-h-0'}`}>
        <div className="text-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
