import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axios';
import axios from 'axios';

export default function LaporanPembelajaran() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // 🔥 APPLY PATTERN: URL-based role detection
  const getCurrentRole = () => {
    const storedRole = localStorage.getItem("role");
    const pathname = window.location.pathname;

    // localStorage role is PRIMARY source of truth
    if (storedRole) {
      return storedRole;
    }

    // Fallback to URL-based detection only if localStorage empty
    if (pathname.includes("/student/")) return "peserta";
    if (pathname.includes("/instructor/")) return "instruktur";
    if (pathname.includes("/admin/")) return "admin";

    return "peserta"; // Default fallback
  };

  const currentRole = getCurrentRole();
  const token = localStorage.getItem('token');

  // 🔥 DEBUG: Log for monitoring
  console.log("LaporanPembelajaran - Current role detected:", currentRole);
  console.log("LaporanPembelajaran - Current pathname:", window.location.pathname);

  // 🔥 APPLY PATTERN: Dynamic base path
  const getBasePath = () => {
    if (currentRole === "instruktur") return "/instructor";
    if (currentRole === "admin") return "/admin";
    return "/student";
  };

  // 🔥 ROUTE VALIDATION: Redirect if URL doesn't match role
  useEffect(() => {
    const pathname = window.location.pathname;

    if (!currentRole) {
      navigate("/login");
      return;
    }

    if (currentRole === "peserta" && pathname.startsWith("/instructor/")) {
      navigate("/student/laporan-pembelajaran", { replace: true });
      return;
    }

    if (currentRole === "instruktur" && pathname.startsWith("/student/")) {
      navigate("/instructor/dashboard", { replace: true });
      return;
    }

    if (
      currentRole === "admin" &&
      (pathname.startsWith("/student/") || pathname.startsWith("/instructor/"))
    ) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
  }, [currentRole, navigate]);

  useEffect(() => {
    if (currentRole === 'peserta') {
      checkProgress();
    } else {
      setError('Hanya peserta yang dapat mengakses laporan pembelajaran');
      setLoading(false);
    }
  }, [currentRole]);

  const checkProgress = async () => {
    try {
      const res = await axiosInstance.get('/laporan/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(res.data);
    } catch (err) {
      console.error('Error checking progress:', err);

      // 🔥 APPLY PATTERN: Enhanced error handling
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      setError(err.response?.data?.message || 'Gagal mengecek progress pembelajaran');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetailedReport = () => {
    if (!progress?.eligible) {
      alert('Selesaikan semua requirements terlebih dahulu');
      return;
    }
    
    // 🔥 FIXED: Use role-based navigation
    navigate(`${getBasePath()}/laporan-pembelajaran/detail`);
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return '#28a745';
    if (percentage >= 50) return '#ffc107';
    return '#dc3545';
  };

  const renderProgressCard = (title, data) => (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{ 
        margin: '0 0 1rem 0', 
        color: '#495057',
        fontSize: '1.1rem',
        fontWeight: '600'
      }}>
        {title}
      </h3>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: getProgressColor(data.percentage)
        }}>
          {data.percentage}%
        </div>
        <div style={{
          fontSize: '0.9rem',
          color: '#6c757d'
        }}>
          {data.completed}/{data.total} selesai
        </div>
      </div>

      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: `${data.percentage}%`,
          height: '100%',
          backgroundColor: getProgressColor(data.percentage),
          transition: 'width 0.3s ease'
        }}></div>
      </div>

      <div style={{
        fontSize: '1rem',
        fontWeight: '600',
        color: data.status === 'Completed' ? '#28a745' : '#ffc107'
      }}>
        {data.status}
      </div>

      {data.breakdown && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
            Breakdown per modul:
          </div>
          {Object.entries(data.breakdown).map(([modul, moduleData]) => (
            <div key={modul} style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: '#6c757d',
              marginBottom: '0.25rem'
            }}>
              <span style={{ textTransform: 'capitalize' }}>{modul}:</span>
              <span>{moduleData.completed}/{moduleData.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Memuat progress pembelajaran...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#dc3545' }}>Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate(`${getBasePath()}`)}
          style={{
            backgroundColor: '#B6252A',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  if (!progress?.has_active_plan) {
    return (
      <div style={{ 
        padding: '2rem',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #ffeaa7',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: '600' }}>
              Tidak Ada Rencana Belajar Aktif
            </h3>
            <p style={{ margin: '0 0 1.5rem 0' }}>
              Anda belum memiliki rencana belajar yang aktif. Silakan ajukan rencana belajar 
              dan tunggu feedback dari instruktur untuk dapat mengakses laporan pembelajaran.
            </p>
            <button 
              onClick={() => navigate(`${getBasePath()}`)}
              style={{
                backgroundColor: '#B6252A',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa',
      paddingBottom: '3rem'
    }}>
      <div style={{ 
        padding: '1.5rem', 
        maxWidth: '1000px', 
        margin: '0 auto'
      }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: '#B6252A',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>
            Laporan Pembelajaran TOEFL ITP
          </h2>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Rencana: {progress.feedback_info?.plan_name} | Target Skor: {progress.feedback_info?.target_score}
          </p>
        </div>

        {/* Overall Progress */}
        <div style={{
          backgroundColor: 'white',
          border: '2px solid #B6252A',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#495057', fontWeight: '600' }}>
            Progress Keseluruhan
          </h3>
          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: getProgressColor(progress.overall_progress),
            marginBottom: '0.5rem'
          }}>
            {progress.overall_progress}%
          </div>
          <div style={{
            fontSize: '1.1rem',
            color: '#6c757d',
            marginBottom: '1rem'
          }}>
            {progress.eligible ? 'Pembelajaran Selesai!' : 'Masih dalam proses'}
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#e9ecef',
            borderRadius: '6px',
            overflow: 'hidden',
            margin: '0 auto',
            maxWidth: '400px'
          }}>
            <div style={{
              width: `${progress.overall_progress}%`,
              height: '100%',
              backgroundColor: getProgressColor(progress.overall_progress),
              transition: 'width 0.5s ease'
            }}></div>
          </div>
        </div>

        {/* Progress Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {renderProgressCard(
            'Materi Pembelajaran',
            progress.progress?.materi
          )}
          
          {renderProgressCard(
            'Latihan Soal',
            progress.progress?.quiz
          )}
          
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#495057',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              Simulasi TOEFL
            </h3>

            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: progress.progress?.simulasi?.completed ? '#28a745' : '#dc3545',
              marginBottom: '1rem'
            }}>
              {progress.progress?.simulasi?.completed ? 'Selesai' : 'Belum Dikerjakan'}
            </div>

            {progress.progress?.simulasi?.score && (
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                  Skor Simulasi:
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#B6252A' }}>
                  {progress.progress.simulasi.score.total}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                  L: {progress.progress.simulasi.score.listening} | 
                  S: {progress.progress.simulasi.score.structure} | 
                  R: {progress.progress.simulasi.score.reading}
                </div>
              </div>
            )}

            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: progress.progress?.simulasi?.completed ? '#28a745' : '#dc3545'
            }}>
              {progress.progress?.simulasi?.status}
            </div>
          </div>
        </div>

        {/* Next Steps or Action */}
        {progress.eligible ? (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: '600' }}>
              Selamat! Pembelajaran Anda Sudah Lengkap
            </h3>
            <p style={{ margin: '0 0 1.5rem 0' }}>
              Anda telah menyelesaikan semua materi, latihan soal, dan simulasi. 
              Kini Anda dapat melihat laporan pembelajaran lengkap.
            </p>
            <button 
              onClick={handleViewDetailedReport}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                marginRight: '1rem'
              }}
            >
              Lihat Laporan Lengkap
            </button>
            <button 
              onClick={() => navigate(`${getBasePath()}`)}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Kembali ke Dashboard
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #ffeaa7',
            marginBottom: '2rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: '600' }}>
              Langkah Selanjutnya
            </h3>
            <p style={{ margin: '0 0 1rem 0' }}>
              Selesaikan semua requirements berikut untuk mengakses laporan pembelajaran lengkap:
            </p>
            <ul style={{ margin: '0 0 1.5rem 1.5rem', paddingLeft: 0 }}>
              {progress.next_steps?.map((step, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  <strong>{step.type.charAt(0).toUpperCase() + step.type.slice(1)}:</strong> {step.message}
                  {step.progress > 0 && (
                    <span style={{ color: '#28a745', marginLeft: '0.5rem' }}>
                      ({step.progress}% selesai)
                    </span>
                  )}
                </li>
              ))}
            </ul>
            
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={handleViewDetailedReport}
                disabled
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  fontSize: '16px',
                  borderRadius: '8px',
                  cursor: 'not-allowed',
                  fontWeight: '500',
                  marginRight: '1rem',
                  opacity: 0.6
                }}
              >
                Lihat Laporan Lengkap (Tidak Tersedia)
              </button>
              <button 
                onClick={() => navigate(`${getBasePath()}/materi`)}
                style={{
                  backgroundColor: '#B6252A',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  fontSize: '16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Lanjut Belajar
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div style={{
          backgroundColor: '#e3f2fd',
          color: '#1565c0',
          padding: '1rem',
          borderRadius: '6px',
          border: '1px solid #bbdefb',
          fontSize: '0.9rem'
        }}>
          <strong>Informasi:</strong> Laporan pembelajaran menampilkan analisis lengkap 
          perjalanan belajar Anda, termasuk statistik performance, rekomendasi, dan pencapaian. 
          Selesaikan semua komponen pembelajaran untuk mengakses laporan lengkap.
        </div>
      </div>
    </div>
  );
}