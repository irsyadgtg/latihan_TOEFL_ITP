import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';

// icons
import notifikasiIcon from '../../assets/icons/notifRed.svg';

// image
import profil from '../../assets/image/profil.png';

export default function Header({ title, note }: { title: string; note: string }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header
      className={`w-full flex justify-between items-center bg-white p-4 sticky top-0 z-10 transition-shadow ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      {/* Keterangan Halaman */}
      <div>
        <h1 className="text-[28px] font-semibold text-primary">{title}</h1>
        <p className="text-[18px] mt-2 text-textHeader">{note}</p>
      </div>

      {/* Notifikasi & Foto Profil */}
      <div className="flex items-center gap-4">
        <img src={notifikasiIcon} alt="Notifikasi" className="w-6 cursor-pointer" />
        <div className="relative" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="cursor-pointer">
            <ChevronDown
              size={20}
              className={`text-gray-600 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 border border-gray-100">
              <div className="py-1">
                <Link
                  to="/login"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Link>
              </div>
            </div>
          )}
        </div>
        <img
          src={profil}
          alt="Profil"
          className="w-[44px] h-[44px] rounded-full object-cover cursor-pointer"
        />
      </div>
    </header>
  );
}
