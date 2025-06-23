// src/pages/student/StudentDashboard.tsx
import React from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";

const StudentDashboard: React.FC = () => {
  const { title, subtitle } = useDashboardLayoutContext();

  return (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};

export default StudentDashboard;
