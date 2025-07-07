import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import axiosInstance from "../../services/axios";
import axios, { AxiosError } from "axios";

function MateriList() {
  const navigate = useNavigate();

  // FIXED: Determine role berdasarkan URL path untuk handle localStorage bug
  const getCurrentRole = () => {
    const storedRole = localStorage.getItem("role");
    const pathname = window.location.pathname;
    
    // IMMEDIATE redirect jika role mismatch  
    if (storedRole === "peserta" && pathname.includes("/instructor/")) {
      window.location.replace("/student/materi");
      return "peserta";
    }
    
    if (storedRole === "instruktur" && pathname.includes("/student/")) {
      window.location.replace("/instructor/materi");
      return "instruktur";
    }
    
    // PRIORITASKAN localStorage role, bukan URL
    return storedRole;
  };

  const currentRole = getCurrentRole();
  const token = localStorage.getItem("AuthToken");

  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const [unitAccess, setUnitAccess] = useState({
    unlockedUnits: null,
    hasActiveFeedback: false,
    feedbackSkills: [],
    loading: true,
    error: null,
  });

  // FIXED: Urutan modul diubah menjadi listening → structure → reading
  const modulList = [
    {
      id: "listening",
      name: "Materi Listening", 
      color: "#B6252A",
    },
    {
      id: "structure",
      name: "Materi Structure",
      color: "#B6252A",
    },
    {
      id: "reading", 
      name: "Materi Reading",
      color: "#B6252A",
    },
  ];

  const fetchUnlockedUnits = async () => {
    if (currentRole !== "peserta") {
      setUnitAccess({
        unlockedUnits: {
          listening: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          structure: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          reading: [0, 1, 2, 3, 4, 5, 6],
        },
        hasActiveFeedback: true,
        feedbackSkills: [],
        loading: false,
        error: null,
      });
      return;
    }

    try {
      const response = await axiosInstance.get("/units/unlocked", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUnitAccess({
        unlockedUnits: response.data.unlocked_units,
        hasActiveFeedback: response.data.has_active_feedback,
        feedbackSkills: response.data.feedback_skills || [],
        feedbackInfo: response.data.feedback_info,
        loading: false,
        error: null,
      });
    } catch (error) {
      setUnitAccess({
        unlockedUnits: {
          listening: [0],
          structure: [0],
          reading: [0],
        },
        hasActiveFeedback: false,
        feedbackSkills: [],
        loading: false,
        error: error.response?.data?.message || "Gagal memuat akses unit",
      });
    }
  };

  const getBasePath = () => {
    if (currentRole === "instruktur") {
      return "/instructor";
    }
    return "/student";
  };

  useEffect(() => {
    fetchUnlockedUnits();
  }, [currentRole]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
      gap: '1rem'
    }}>
      {modulList.map((modul) => (
        <button
          key={modul.id}
          onClick={() => navigate(`${getBasePath()}/materi/${modul.id}`)}
          style={{
            width: '300px',
            padding: '1rem 2rem',
            backgroundColor: 'white',
            border: `2px solid ${modul.color}`,
            borderRadius: '25px',
            color: modul.color,
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: "'Poppins', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = modul.color;
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = modul.color;
          }}
        >
          {modul.name}
        </button>
      ))}
    </div>
  );
}

export default MateriList;