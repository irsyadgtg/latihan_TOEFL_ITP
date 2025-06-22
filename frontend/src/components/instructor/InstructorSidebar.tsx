import { NavLink } from "react-router-dom";
import { ClipboardList, BookOpen, User } from "lucide-react";

// image
import Logo from "../../assets/image/logo.jpeg";

// Daftar menu navigasi
const menuItems = [
  { label: "Daftar Instruktur", path: "/instructor/daftar-instruktur", icon: <ClipboardList size={20} /> },
  { label: "Tinjau Rencana Belajar", path: "/instructor/tinjau-rencana-belajar", icon: <BookOpen size={20} /> },
  { label: "Profil", path: "/instructor/profil", icon: <User size={20} /> },
];

export default function InstructorSidebar() {
  return (
    <aside className="w-[20rem] z-50 h-screen overflow-y-auto bg-primary text-white fixed top-0 left-0 p-4">
      <img src={Logo} alt="Telkom University" className="w-auto"/>
      <nav className="space-y-2 block mt-8">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 p-4 rounded-[10px]  ${
                isActive ? "border border-borderColor" : ""
              }`
            }
          >
            {item.icon}
            <span className="text-[20px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
