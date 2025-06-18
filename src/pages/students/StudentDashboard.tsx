// src/pages/student/StudentDashboard.tsx
import React from "react";
import { useStudentLayoutContext } from "../../layouts/StudentLayout";

const StudentDashboard: React.FC = () => {
  const { title, subtitle } = useStudentLayoutContext();

  return (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};

export default StudentDashboard;
