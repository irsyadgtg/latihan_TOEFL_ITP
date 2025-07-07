import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DashboardInstruktur() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/dashboard/instruktur', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
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
  const overviewPeserta = dashboardData.overview_peserta || {
    total_peserta: 0,
    peserta_paket_aktif: 0,
    peserta_aktif_belajar: 0,
    persentase_paket_aktif: 0,
    persentase_aktif_belajar: 0
  };

  const performaPembelajaran = dashboardData.performa_pembelajaran || {
    per_modul: {
      listening: { rata_rata_progress: 0, rata_rata_nilai: 0, total_soal_dikerjakan: 0, total_benar: 0, peserta_aktif: 0 },
      structure: { rata_rata_progress: 0, rata_rata_nilai: 0, total_soal_dikerjakan: 0, total_benar: 0, peserta_aktif: 0 },
      reading: { rata_rata_progress: 0, rata_rata_nilai: 0, total_soal_dikerjakan: 0, total_benar: 0, peserta_aktif: 0 }
    },
    modul_terpopuler: 'listening',
    total_soal_dikerjakan: 0,
    rata_rata_keseluruhan: 0
  };

  const statusSimulasi = dashboardData.status_simulasi || {
    is_aktif: false,
    peserta_sedang_simulasi: 0,
    simulasi_selesai: 0,
    rata_rata_skor: 0,
    status_text: 'Error',
    can_toggle: false
  };

  // Get user name from localStorage
  const userName = localStorage.getItem('name') || 'Instruktur';

  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  };

  // Calculate overall activity percentage
  const overallActivity = Math.round((overviewPeserta.persentase_paket_aktif + overviewPeserta.persentase_aktif_belajar) / 2);

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
        background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
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
              Pantau progress dan kelola pembelajaran peserta TOEFL ITP
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
              Aktivitas Peserta
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700'
            }}>
              {overallActivity}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Row 1: Cards Utama */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        
        {/* 1. Overview Peserta */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '1rem', 
            color: '#059669'
          }}>
            Overview Peserta
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Total Peserta */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px'
            }}>
              <span style={{ fontWeight: '500', color: '#495057' }}>Total Terdaftar</span>
              <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#059669' 
              }}>
                {overviewPeserta.total_peserta}
              </span>
            </div>

            {/* Paket Aktif */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#f0f9ff',
              borderRadius: '6px'
            }}>
              <div>
                <div style={{ fontWeight: '500', color: '#495057' }}>Paket Aktif</div>
                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                  {overviewPeserta.persentase_paket_aktif}% dari total
                </div>
              </div>
              <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#2563EB' 
              }}>
                {overviewPeserta.peserta_paket_aktif}
              </span>
            </div>

            {/* Aktif Belajar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#fef3e2',
              borderRadius: '6px'
            }}>
              <div>
                <div style={{ fontWeight: '500', color: '#495057' }}>Aktif Belajar (7 hari)</div>
                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                  {overviewPeserta.persentase_aktif_belajar}% dari total
                </div>
              </div>
              <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#D97706' 
              }}>
                {overviewPeserta.peserta_aktif_belajar}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Status Simulasi */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '1rem', 
            color: '#7C3AED'
          }}>
            Status Simulasi
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Status Aktif */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: statusSimulasi.is_aktif ? '#d1f2eb' : '#f8d7da',
              borderRadius: '6px'
            }}>
              <span style={{ fontWeight: '500', color: '#495057' }}>Status Simulasi</span>
              <span style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '12px',
                backgroundColor: statusSimulasi.is_aktif ? '#059669' : '#B6252A',
                color: 'white',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {statusSimulasi.is_aktif ? 'AKTIF' : 'NONAKTIF'}
              </span>
            </div>

            {/* Sedang Mengerjakan */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px'
            }}>
              <span style={{ fontWeight: '500', color: '#495057' }}>Sedang Mengerjakan</span>
              <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#7C3AED' 
              }}>
                {statusSimulasi.peserta_sedang_simulasi}
              </span>
            </div>

            {/* Rata-rata Skor */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#fef3e2',
              borderRadius: '6px'
            }}>
              <div>
                <div style={{ fontWeight: '500', color: '#495057' }}>Rata-rata Skor</div>
                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                  {statusSimulasi.simulasi_selesai} simulasi selesai
                </div>
              </div>
              <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#D97706' 
              }}>
                {statusSimulasi.rata_rata_skor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Performa Pembelajaran */}
      <div style={cardStyle}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: '600', 
          marginBottom: '1.25rem', 
          color: '#B6252A'
        }}>
          Performa Pembelajaran Peserta
        </h3>
        
        {/* Summary Stats */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#B6252A' }}>
              {performaPembelajaran.rata_rata_keseluruhan}%
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
              Rata-rata Nilai
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563EB' }}>
              {performaPembelajaran.total_soal_dikerjakan}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
              Total Soal Dikerjakan
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.2rem', 
              fontWeight: '700', 
              color: '#059669',
              textTransform: 'capitalize'
            }}>
              {performaPembelajaran.modul_terpopuler}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
              Modul Terpopuler
            </div>
          </div>
        </div>

        {/* Per Modul Chart */}
        {performaPembelajaran.total_soal_dikerjakan > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.entries(performaPembelajaran.per_modul).map(([modul, data]) => (
              <div key={modul}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '0.5rem' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ 
                      textTransform: 'capitalize', 
                      fontWeight: '600',
                      color: '#495057',
                      fontSize: '1rem',
                      minWidth: '80px'
                    }}>
                      {modul.charAt(0).toUpperCase() + modul.slice(1)}
                    </span>
                    <span style={{ 
                      fontSize: '0.8rem',
                      color: '#6c757d',
                      backgroundColor: '#e9ecef',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '10px'
                    }}>
                      {data.peserta_aktif} peserta
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontWeight: '700', 
                      color: '#495057',
                      fontSize: '1.1rem'
                    }}>
                      Nilai: {data.rata_rata_nilai}%
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d'
                    }}>
                      Progress: {data.rata_rata_progress}%
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar for Nilai */}
                <div style={{ 
                  width: '100%', 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '10px', 
                  height: '12px',
                  overflow: 'hidden',
                  marginBottom: '0.3rem'
                }}>
                  <div style={{
                    height: '12px',
                    borderRadius: '10px',
                    backgroundColor: modul === 'listening' ? '#2563EB' : 
                                   modul === 'structure' ? '#059669' : '#7C3AED',
                    width: `${Math.max(data.rata_rata_nilai, 2)}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>

                {/* Progress Bar for Materi */}
                <div style={{ 
                  width: '100%', 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '10px', 
                  height: '8px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    height: '8px',
                    borderRadius: '10px',
                    backgroundColor: modul === 'listening' ? 'rgba(37, 99, 235, 0.5)' : 
                                   modul === 'structure' ? 'rgba(5, 150, 105, 0.5)' : 'rgba(124, 58, 237, 0.5)',
                    width: `${Math.max(data.rata_rata_progress, 2)}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>

                <div style={{ 
                  fontSize: '0.85rem', 
                  color: '#adb5bd',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{data.total_benar} / {data.total_soal_dikerjakan} soal benar</span>
                  <span style={{ 
                    color: data.rata_rata_nilai >= 70 ? '#059669' : data.rata_rata_nilai >= 50 ? '#D97706' : '#B6252A',
                    fontWeight: '600'
                  }}>
                    {data.rata_rata_nilai >= 70 ? 'Baik' : data.rata_rata_nilai >= 50 ? 'Cukup' : 'Perlu Perhatian'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center',
            padding: '3rem 0',
            color: '#adb5bd'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>-</div>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Belum ada data pembelajaran
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              Peserta belum mulai mengerjakan latihan
            </div>
          </div>
        )}
      </div>
    </div>
  );
}