import React, { useEffect, useState } from "react";
import { useStudentLayoutContext } from "../../layouts/StudentLayout";
import InstructorGrid from "../../components/InstructorGrid";

const InstructurPage: React.FC = () => {
  const { title, subtitle, setTitle, setSubtitle } = useStudentLayoutContext();

  useEffect(() => {
    setTitle("Daftar instruktur");
    setSubtitle("Melihat daftar instruktur yang tersedia");
  }, []);

  return (
    <div className="mt-4">
      <InstructorGrid />
    </div>
  );
};

export default InstructurPage;
