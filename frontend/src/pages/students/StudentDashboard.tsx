// src/pages/students/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";

interface ProgresMateri {
  total: { completed: number; total: number; percentage: number };
  per_modul: {
    listening: { completed: number; total: number; percentage: number };
    structure: { completed: number; total: number; percentage: number };
    reading: { completed: number; total: number; percentage: number };
  };
}

interface LatihanSelesai {
  total: { completed: number; total: number; percentage: number };
  per_modul: {
    listening: { completed: number; total: number; percentage: number };
    structure: { completed: number; total: number; percentage: number };
    reading: { completed: number; total: number; percentage: number };
  };
}

interface NilaiRataRata {
  rata_rata: number;
  total_soal: number;
  total_benar: number;
}

interface NilaiPerModul {
  listening: { rata_rata: number; total_soal: number; total_benar: number };
  structure: { rata_rata: number; total_soal: number; total_benar: number };
  reading: { rata_rata: number; total_soal: number; total_benar: number };
}

interface InfoPaket {
  nama_paket: string;
  masa_berlaku: number;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  hari_tersisa: number;
  status: string;
}

interface InfoRencanaBelajar {
  nama_rencana: string;
  target_skor: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  hari_tersisa: number;
  target_jam_total: number;
  hari_per_minggu: number;
  pesan_harian: string;
}

interface DashboardData {
  progres_materi: ProgresMateri;
  latihan_selesai: LatihanSelesai;
  nilai_rata_rata: NilaiRataRata;
  nilai_per_modul: NilaiPerModul;
  info_paket?: InfoPaket;
  info_rencana_belajar?: InfoRencanaBelajar;
}

const StudentDashboard: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Dashboard Peserta");
    setSubtitle("Siap untuk meningkatkan kemampuan TOEFL ITP Anda hari ini?");
    fetchDashboardData();
  }, [setTitle, setSubtitle]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('AuthToken');
      const response = await axios.get('http://localhost:8000/api/dashboard/peserta', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontFamily: "'Segoe UI', sans-serif" 
      }}>
        <div style={{ fontSize: '1.1rem', color: '#6c757d' }}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        fontFamily: "'Segoe UI', sans-serif" 
      }}>
        <div style={{ color: '#B6252A', fontSize: '1.1rem', marginBottom: '1rem' }}>
          Error: {error}
        </div>
        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchDashboardData();
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#B6252A',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ 
        padding: '1.5rem',
        fontFamily: "'Segoe UI', sans-serif",
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ color: '#B6252A' }}>Data tidak tersedia</div>
      </div>
    );
  }

  // Destructure dengan fallback
  const progresMateri = dashboardData.progres_materi || {
    total: { completed: 0, total: 0, percentage: 0 },
    per_modul: {
      listening: { completed: 0, total: 0, percentage: 0 },
      structure: { completed: 0, total: 0, percentage: 0 },
      reading: { completed: 0, total: 0, percentage: 0 }
    }
  };

  const latihanSelesai = dashboardData.latihan_selesai || {
    total: { completed: 0, total: 0, percentage: 0 },
    per_modul: {
      listening: { completed: 0, total: 0, percentage: 0 },
      structure: { completed: 0, total: 0, percentage: 0 },
      reading: { completed: 0, total: 0, percentage: 0 }
    }
  };

  const nilaiRataRata = dashboardData.nilai_rata_rata || {
    rata_rata: 0,
    total_soal: 0,
    total_benar: 0
  };

  const nilaiPerModul = dashboardData.nilai_per_modul || {
    listening: { rata_rata: 0, total_soal: 0, total_benar: 0 },
    structure: { rata_rata: 0, total_soal: 0, total_benar: 0 },
    reading: { rata_rata: 0, total_soal: 0, total_benar: 0 }
  };

  const infoPaket = dashboardData.info_paket;
  const infoRencanaBelajar = dashboardData.info_rencana_belajar;

  // Get user name from localStorage
  const userName = localStorage.getItem('name') || 'Peserta';

  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  };

  return (
    <div style={{ 
      padding: '1.5rem',
      fontFamily: "'Segoe UI', sans-serif",
      backgroundColor: '#f8f9fa',
      paddingBottom: '3rem'
    }}>
      
      {/* Welcome Card */}
      <div style={{
        ...cardStyle,
        background: 'linear-gradient(135deg, #B6252A 0%, #A21E23 100%)',
        color: 'white',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              marginBottom: '0.5rem',
              margin: 0
            }}>
              Selamat Datang, {userName}!
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              opacity: 0.9,
              margin: 0,
              marginTop: '0.5rem'
            }}>
              Siap untuk meningkatkan kemampuan TOEFL ITP Anda hari ini?
            </p>
          </div>
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{ 
              fontSize: '0.9rem', 
              opacity: 0.8,
              marginBottom: '0.3rem'
            }}>
              Progress Keseluruhan
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700'
            }}>
              {Math.round((progresMateri.total.percentage + latihanSelesai.total.percentage) / 2)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Row 1: Stats Utama */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        
        {/* 1. Progres Materi */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '1rem', 
            color: '#2563EB'
          }}>
            Progres Materi
          </h3>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#2563EB', 
            marginBottom: '0.5rem' 
          }}>
            {progresMateri.total.percentage}%
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#6c757d', 
            marginBottom: '1rem' 
          }}>
            {progresMateri.total.completed} / {progresMateri.total.total} halaman selesai
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(progresMateri.per_modul).map(([modul, data]) => (
              <div key={modul} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.9rem',
                padding: '0.3rem 0'
              }}>
                <span style={{ textTransform: 'capitalize', color: '#495057', fontWeight: '500' }}>
                  {modul}:
                </span>
                <span style={{ fontWeight: '600', color: '#2563EB' }}>
                  {data.completed}/{data.total} ({data.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Latihan Selesai */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '1rem', 
            color: '#059669'
          }}>
            Latihan Selesai
          </h3>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#059669', 
            marginBottom: '0.5rem' 
          }}>
            {latihanSelesai.total.percentage}%
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#6c757d', 
            marginBottom: '1rem' 
          }}>
            {latihanSelesai.total.completed} / {latihanSelesai.total.total} unit selesai
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(latihanSelesai.per_modul).map(([modul, data]) => (
              <div key={modul} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.9rem',
                padding: '0.3rem 0'
              }}>
                <span style={{ textTransform: 'capitalize', color: '#495057', fontWeight: '500' }}>
                  {modul}:
                </span>
                <span style={{ fontWeight: '600', color: '#059669' }}>
                  {data.completed}/{data.total} ({data.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Nilai Rata-rata */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '1rem', 
            color: '#B6252A'
          }}>
            Nilai Rata-rata
          </h3>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#B6252A', 
            marginBottom: '0.5rem' 
          }}>
            {nilaiRataRata.rata_rata}%
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#6c757d', 
            marginBottom: '0.5rem' 
          }}>
            Nilai Keseluruhan Latihan
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#adb5bd'
          }}>
            {nilaiRataRata.total_benar} / {nilaiRataRata.total_soal} soal benar
          </div>
          {nilaiRataRata.total_soal === 0 && (
            <div style={{
              fontSize: '0.8rem',
              backgroundColor: '#FFF3CD',
              color: '#856404',
              padding: '0.5rem',
              borderRadius: '4px',
              marginTop: '0.5rem',
              border: '1px solid #FFEAA7'
            }}>
              Belum ada latihan yang dikerjakan
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Paket & Rencana Belajar */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        
        {/* Info Paket Kursus */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '1rem', 
            color: '#7C3AED'
          }}>
            Paket Kursus
          </h3>
          {infoPaket ? (
            <div>
              <div style={{ 
                fontSize: '1.3rem', 
                fontWeight: '700', 
                color: '#7C3AED', 
                marginBottom: '0.5rem' 
              }}>
                {infoPaket.nama_paket}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#6c757d', 
                  marginBottom: '0.3rem' 
                }}>
                  <strong>Masa Berlaku:</strong> {infoPaket.masa_berlaku} bulan
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#6c757d', 
                  marginBottom: '0.3rem' 
                }}>
                  <strong>Periode:</strong> {infoPaket.tanggal_mulai} - {infoPaket.tanggal_berakhir}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: infoPaket.hari_tersisa > 30 ? '#059669' : infoPaket.hari_tersisa > 7 ? '#D97706' : '#B6252A',
                  fontWeight: '600'
                }}>
                  <strong>Sisa Waktu:</strong> {infoPaket.hari_tersisa} hari lagi
                </div>
              </div>
              <div style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '12px',
                display: 'inline-block',
                backgroundColor: infoPaket.status === 'aktif' ? '#d1f2eb' : '#f8d7da',
                color: infoPaket.status === 'aktif' ? '#059669' : '#B6252A',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {infoPaket.status}
              </div>
            </div>
          ) : (
            <div style={{ 
              color: '#adb5bd', 
              fontSize: '0.9rem',
              textAlign: 'center',
              padding: '2rem 0'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>-</div>
              <div>Belum memiliki paket kursus</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>
                Hubungi admin untuk mendaftar paket
              </div>
            </div>
          )}
        </div>

        {/* Info Rencana Belajar */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '1rem', 
            color: '#D97706'
          }}>
            Rencana Belajar
          </h3>
          {infoRencanaBelajar ? (
            <div>
              <div style={{ 
                fontSize: '1.3rem', 
                fontWeight: '700', 
                color: '#D97706', 
                marginBottom: '0.5rem' 
              }}>
                {infoRencanaBelajar.nama_rencana}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#6c757d', 
                  marginBottom: '0.3rem' 
                }}>
                  <strong>Target Skor:</strong> {infoRencanaBelajar.target_skor}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#6c757d', 
                  marginBottom: '0.3rem' 
                }}>
                  <strong>Periode:</strong> {infoRencanaBelajar.tanggal_mulai} - {infoRencanaBelajar.tanggal_selesai}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: infoRencanaBelajar.hari_tersisa > 30 ? '#059669' : infoRencanaBelajar.hari_tersisa > 7 ? '#D97706' : '#B6252A',
                  fontWeight: '600',
                  marginBottom: '0.3rem'
                }}>
                  <strong>Sisa Waktu:</strong> {infoRencanaBelajar.hari_tersisa} hari lagi
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#6c757d'
                }}>
                  <strong>Target Jam Total:</strong> {infoRencanaBelajar.target_jam_total} jam ({infoRencanaBelajar.hari_per_minggu} hari/minggu)
                </div>
              </div>
              <div style={{
                fontSize: '0.9rem',
                backgroundColor: '#FEF3CD',
                color: '#D97706',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #FBBF24',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {infoRencanaBelajar.pesan_harian}
              </div>
            </div>
          ) : (
            <div style={{ 
              color: '#adb5bd', 
              fontSize: '0.9rem',
              textAlign: 'center',
              padding: '2rem 0'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>-</div>
              <div>Belum memiliki rencana belajar</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>
                Buat rencana belajar untuk target yang terarah
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Chart Nilai per Modul */}
      <div style={cardStyle}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: '600', 
          marginBottom: '1.25rem', 
          color: '#6366F1'
        }}>
          Perbandingan Nilai per Modul
        </h3>
        
        {nilaiRataRata.total_soal > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.entries(nilaiPerModul).map(([modul, data]) => (
              <div key={modul}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '0.5rem' 
                }}>
                  <span style={{ 
                    textTransform: 'capitalize', 
                    fontWeight: '600',
                    color: '#495057',
                    fontSize: '1rem'
                  }}>
                    {modul.charAt(0).toUpperCase() + modul.slice(1)}
                  </span>
                  <span style={{ 
                    fontWeight: '700', 
                    color: '#495057',
                    fontSize: '1.1rem'
                  }}>
                    {data.rata_rata}%
                  </span>
                </div>
                <div style={{ 
                  width: '100%', 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '10px', 
                  height: '16px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    height: '16px',
                    borderRadius: '10px',
                    backgroundColor: modul === 'listening' ? '#2563EB' : 
                                   modul === 'structure' ? '#059669' : '#7C3AED',
                    width: `${Math.max(data.rata_rata, 2)}%`,
                    transition: 'width 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '0.5rem'
                  }}>
                    {data.rata_rata > 15 && (
                      <span style={{ 
                        color: 'white', 
                        fontSize: '0.7rem', 
                        fontWeight: '600' 
                      }}>
                        {data.rata_rata}%
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: '#adb5bd',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{data.total_benar} / {data.total_soal} soal benar</span>
                  <span style={{ 
                    color: data.rata_rata >= 70 ? '#059669' : data.rata_rata >= 50 ? '#D97706' : '#B6252A',
                    fontWeight: '600'
                  }}>
                    {data.rata_rata >= 70 ? 'Baik' : data.rata_rata >= 50 ? 'Cukup' : 'Perlu Ditingkatkan'}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Rekomendasi */}
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              borderLeft: '4px solid #6366F1'
            }}>
              <div style={{ fontWeight: '600', color: '#495057', marginBottom: '0.5rem' }}>
                Rekomendasi Belajar:
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                {(() => {
                  const sortedModuls = Object.entries(nilaiPerModul)
                    .filter(([modul, data]) => data.total_soal > 0)
                    .sort(([,a], [,b]) => a.rata_rata - b.rata_rata);
                  
                  if (sortedModuls.length === 0) {
                    return "Mulai mengerjakan latihan untuk mendapatkan rekomendasi belajar yang personal.";
                  }
                  
                  const [weakestModul, weakestData] = sortedModuls[0];
                  
                  if (weakestData.rata_rata < 50) {
                    return `Fokus lebih pada materi ${weakestModul} (${weakestData.rata_rata}%). Perbanyak latihan dan review materi dasar.`;
                  } else if (weakestData.rata_rata < 70) {
                    return `Tingkatkan pemahaman ${weakestModul} (${weakestData.rata_rata}%) dengan latihan tambahan.`;
                  } else {
                    return `Prestasi baik! Pertahankan konsistensi dan siap untuk simulasi lengkap.`;
                  }
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center',
            padding: '3rem 0',
            color: '#adb5bd'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>-</div>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Belum ada data nilai
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              Kerjakan latihan untuk melihat perbandingan nilai per modul
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;