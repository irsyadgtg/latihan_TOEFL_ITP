import { useState } from "react";

export default function StatusToggle() {
  const [isActive, setIsActive] = useState(true);

  const toggleStatus = () => setIsActive(!isActive);

  return (
    <div className="flex items-center justify-end gap-4">
      <span className="text-lg font-semibold">
        Status ({isActive ? "Aktif" : "Nonaktif"})
      </span>
      <div
        onClick={toggleStatus}
        className={`w-20 h-10 flex items-center rounded-full px-1 cursor-pointer transition-colors ${
          isActive ? "bg-gray-300" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-8 h-8 bg-gray-500 rounded-full shadow-md transform transition-transform duration-300 ${
            isActive ? "translate-x-10" : "translate-x-0"
          }`}
        ></div>
      </div>
    </div>
  );
}
