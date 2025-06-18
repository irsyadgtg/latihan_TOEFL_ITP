import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";

import {
  User,
  FileText,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Menu,
  X,
  Bell,
  ArrowDown,
} from "lucide-react";

export type StudentLayoutContextType = {
  title: string;
  subtitle: string;
  setTitle: (value: string) => void;
  setSubtitle: (value: string) => void;
};

const StudentLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [title, setTitle] = useState("Profil Saya");
  const [subtitle, setSubtitle] = useState("Isikan profil pengguna Anda");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#A80532] text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={closeSidebar}
            className="p-2 text-white hover:bg-white hover:text-[#A80532] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 text-center border-b border-white/20">
          <img src="/Logo-dashboard.png" alt="Logo" className="mx-auto mb-4" />
        </div>

        <nav className="flex-1 p-4 space-y-2 text-sm font-medium overflow-y-auto">
          {/* Link NavLink seperti sebelumnya */}
          <NavLink
            to="/student/rencana"
            className={linkClass}
            onClick={closeSidebar}
          >
            <img src="/pengajuan-rencana-beljar.png"></img>
            <span className="truncate">Pengajuan Rencana Belajar</span>
          </NavLink>
          <NavLink
            to="/student/awal"
            className={linkClass}
            onClick={closeSidebar}
          >
            <img src="/pengajuan-skor-awal.png"></img>
            <span className="truncate">Pengajuan Skor Awal</span>
          </NavLink>
          <NavLink
            to="/student/pembayaran"
            className={linkClass}
            onClick={closeSidebar}
          >
            <img src="/riwayat-pembayaran.png"></img>
            <span className="truncate">Riwayat Pembayaran</span>
          </NavLink>
          <NavLink
            to="/student/instruktur"
            className={linkClass}
            onClick={closeSidebar}
          >
            <img src="/instruktur.png"></img>
            <span className="truncate">Daftar Instruktur</span>
          </NavLink>
          <NavLink
            to="/student/langganan"
            className={linkClass}
            onClick={closeSidebar}
          >
            <img src="/subscribe.png"></img>

            <span className="truncate">Berlangganan Paket Kursus</span>
          </NavLink>
          <NavLink
            to="/student/profil"
            className={linkClass}
            onClick={closeSidebar}
          >
            <img src="/profile.png" alt="" />
            <span className="truncate">Profil</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <header className="flex justify-between items-center p-4 bg-white shadow-sm border-b">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-[#A80532] hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm text-gray-400 truncate"></h1>
          </div>
          <div className="relative flex items-center gap-3" ref={dropdownRef}>
            <button className="relative p-2 text-gray-600 hover:text-[#A80532] hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex">
                <Bell size={18} />
              </div>
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 border-2 border-white" />
            </button>

            <button
              onClick={() => setOpen((prev) => !prev)}
              className="focus:outline-none"
            >
              <IoIosArrowDown />
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[hsl(343,94%,34%)] to-pink-600 flex items-center justify-center">
              <NavLink to={"/student/profil"}>
                <User size={16} className="text-white" />
              </NavLink>
            </div>

            {open && (
              <div className="absolute right-0 top-12 mt-1 w-40 bg-white shadow-lg rounded-md z-50">
                <button
                  onClick={() => {
                    navigate("/");
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <h3 className="text-[#A80532] font-bold text-[28px]">{title}</h3>
          <p className="text-[#8E8E8E] text-[18px]">{subtitle}</p>
          <Outlet context={{ title, subtitle, setTitle, setSubtitle }} />
        </main>
      </div>
    </div>
  );
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center  gap-3 p-3 rounded-lg transition-all duration-200 ${
    isActive
      ? "border border-white  shadow-md"
      : "hover:bg-white/10 hover:translate-x-1"
  }`;

export default StudentLayout;

export function useStudentLayoutContext() {
  return useOutletContext<StudentLayoutContextType>();
}
