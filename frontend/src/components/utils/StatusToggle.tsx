// src/components/utils/StatusToggle.tsx
import React from 'react'; // Penting untuk semua komponen React

// --- Definisi Props untuk StatusToggle ---
export interface StatusToggleProps {
  isActive: boolean; // Status aktif dari parent
  onToggle: (newStatus: boolean) => Promise<void>; // Fungsi untuk mengubah status
  disabled?: boolean; // Opsional: untuk menonaktifkan toggle
  loading?: boolean;  // Opsional: untuk menunjukkan proses loading
}
// ---

export default function StatusToggle({ isActive, onToggle, disabled = false, loading = false }: StatusToggleProps) {
  return (
    <div className="flex items-center space-x-3">
      <span className={`text-xl font-semibold ${isActive ? 'text-green-600' : 'text-red-600'}`}>
        Status: {isActive ? 'Aktif' : 'Non-aktif'}
      </span>
      <button // Menggunakan <button> untuk aksesibilitas
        type="button" // Penting: mencegah button otomatis submit form jika ada
        onClick={() => onToggle(!isActive)} // Panggil fungsi onToggle dari props
        disabled={disabled || loading} // Tombol dinonaktifkan jika disabled atau loading
        className={`relative inline-flex flex-shrink-0 h-8 w-14 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${isActive ? 'bg-green-500' : 'bg-gray-300'}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="switch" // Peran ARIA untuk aksesibilitas switch
        aria-checked={isActive} // Status ARIA untuk aksesibilitas
      >
        <span className="sr-only">Toggle status</span> {/* Teks untuk screen reader */}
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-7 w-7 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
            ${isActive ? 'translate-x-6' : 'translate-x-0'}
          `}
        ></span>
      </button>
      {loading && <span className="text-gray-500 text-sm">Mengubah status...</span>}
    </div>
  );
}