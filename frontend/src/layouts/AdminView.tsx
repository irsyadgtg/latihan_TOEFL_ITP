// Komponen ui Admin View
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import React from "react";

interface AdminViewProps {
  title: string;
  note: string;
  children: React.ReactNode;
}

export default function AdminView({ title, note, children }: AdminViewProps) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-[20rem] w-full min-h-screen">
        <Header title={title} note={note} />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
