import InstructorSidebar from "../components/instructor/InstructorSidebar";
import Header from "../components/ui/Header";
import React from "react";

interface InstructorLayoutProps {
  title: string;
  note: string;
  children: React.ReactNode;
}

export default function InstructorLayout({ title, note, children }: InstructorLayoutProps) {
  return (
    <div className="flex">
      <InstructorSidebar />
      <div className="ml-[20rem] w-full min-h-screen bg-[#F7F8FB]">
        <Header title={title} note={note} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

