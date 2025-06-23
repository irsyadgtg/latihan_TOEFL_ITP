// Komponen ui Admin View
import Sidebar, { type SidebarProps } from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";

interface DashboardLayoutProps extends SidebarProps {
  
}

export type DashboardLayoutContextType = {
  title: string;
  subtitle: string;
  setTitle: (value: string) => void;
  setSubtitle: (value: string) => void;
};

export default function DashboardLayout({menuItems}: DashboardLayoutProps) {
  const [title, setTitle] = useState("Profil Saya");
  const [subtitle, setSubtitle] = useState("Isikan profil pengguna Anda");
  return (
    <div className="flex">
      <Sidebar menuItems={menuItems} />
      <div className="ml-[20rem] w-full min-h-screen">
        <Header title={title} note={subtitle} />
        <main className="p-4"><Outlet context={{ title, subtitle, setTitle, setSubtitle }} />
        </main>
      </div>
    </div>
  );
}

export function useDashboardLayoutContext() {
  return useOutletContext<DashboardLayoutContextType>();
}
