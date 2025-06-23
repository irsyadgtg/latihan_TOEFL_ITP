import { NavLink } from "react-router-dom";
import Logo from "../../assets/image/logo.jpeg";

interface MenuItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  menuItems: MenuItem[];
}

export default function Sidebar({ menuItems }: SidebarProps) {
  return (
    <aside className="w-[20rem] z-50 h-screen overflow-y-auto bg-primary text-white fixed top-0 left-0 p-4">
      <img src={Logo} alt="Telkom University" className="w-auto" />
      <nav className="space-y-2 block mt-8">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 p-4 rounded-[10px] ${
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