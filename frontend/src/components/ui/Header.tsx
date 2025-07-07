import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; // Pastikan Link diimpor jika diperlukan di tempat lain
import { ChevronDown, LogOut } from "lucide-react"; // Pastikan LogOut diimpor jika diperlukan

// icons
import notifikasiIcon from "../../assets/icons/notifRed.svg"; // Ikon notifikasi Anda

// image
import profil from "../../assets/image/profil.jpg"; // Gambar profil Anda

// --- PERBAIKAN DI SINI: Perbarui interface HeaderProps ---
interface HeaderProps {
  title: string;
  note: string;
  unreadCount: number; // Tambahkan prop ini
}

export default function Header({ title, note, unreadCount }: HeaderProps) {
  // Destrukturisasi prop baru
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const onLogout = () => {
    navigate("/admin/login");
    localStorage.removeItem("AuthToken");
    // Anda mungkin juga ingin membersihkan data user lainnya dari localStorage jika ada
    localStorage.removeItem("userData");
  };

  return (
    <header
      className={`w-full flex justify-between items-center bg-white p-4 sticky top-0 z-10 transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      {/* Keterangan Halaman */}
      <div>
        <h1 className="text-[28px] font-semibold text-primary">{title}</h1>
        <p className="text-[18px] mt-2 text-textHeader">{note}</p>
      </div>

      {/* Notifikasi & Foto Profil */}
      <div className="flex items-center gap-4">
        {/* --- NOTIFIKASI ICON DENGAN BADGE --- */}
        {/* <button
                    onClick={() => {
                        navigate('/admin/notifikasi'); // Navigasi ke halaman notifikasi
                    }}
                    className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" // Tombol pembungkus untuk ikon
                > */}

                
                {/* HANDLE NOTIFIKASI DENGAN SELURUH ROLE */}
        <button
          onClick={() => {
            const role = localStorage.getItem("role");
            if (role === "instruktur") {
              navigate("/instructor/notifications");
            } else if (role === "peserta") {
              navigate("/student/notifications");
            } else {
              navigate("/admin/notifikasi"); // admin tetap ke route lama
            }
          }}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <img
            src={notifikasiIcon}
            alt="Notifikasi"
            className="w-6 cursor-pointer"
          />
          {unreadCount > 0 && ( // Tampilkan badge hanya jika ada notifikasi belum dibaca
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
              {unreadCount}
            </span>
          )}
        </button>
        {/* --- END NOTIFIKASI ICON DENGAN BADGE --- */}

        <div className="relative" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="cursor-pointer">
            <ChevronDown
              size={20}
              className={`text-gray-600 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 border border-gray-100">
              <div className="py-1">
                <button
                  onClick={() => onLogout()}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" // Tambah w-full text-left
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
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
