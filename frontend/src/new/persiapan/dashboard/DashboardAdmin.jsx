import React, { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

const DashboardAdmin = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard-admin');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (bulan) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return months[bulan - 1] || bulan;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>
          Memuat data dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '1.5rem',
        fontFamily: 'Poppins, sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1.5rem',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #B6252A 0%, #A21E23 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          margin: '0 0 0.5rem 0' 
        }}>
          Dashboard Admin
        </h1>
        <p style={{ 
          fontSize: '14px', 
          opacity: '0.9', 
          margin: '0',
          fontWeight: '400'
        }}>
          Pantau statistik sistem dan kelola platform LMS TOEFL ITP
        </p>
      </div>

      {/* Statistik User Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Peserta */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              backgroundColor: '#dbeafe',
              padding: '0.75rem',
              borderRadius: '8px'
            }}>
              <Users size={24} color="#2563eb" />
            </div>
            <div>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#6b7280',
                margin: '0 0 0.25rem 0'
              }}>
                Total Peserta
              </h3>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1f2937',
                margin: '0'
              }}>
                {dashboardData?.totalUserPerRole?.peserta || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Instruktur */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              backgroundColor: '#dcfce7',
              padding: '0.75rem',
              borderRadius: '8px'
            }}>
              <BookOpen size={24} color="#16a34a" />
            </div>
            <div>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#6b7280',
                margin: '0 0 0.25rem 0'
              }}>
                Total Instruktur
              </h3>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1f2937',
                margin: '0'
              }}>
                {dashboardData?.totalUserPerRole?.instruktur || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Admin */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '0.75rem',
              borderRadius: '8px'
            }}>
              <Users size={24} color="#d97706" />
            </div>
            <div>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#6b7280',
                margin: '0 0 0.25rem 0'
              }}>
                Total Admin
              </h3>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1f2937',
                margin: '0'
              }}>
                {dashboardData?.totalUserPerRole?.admin || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        {/* Statistik Paket Kursus */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: '0 0 1.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <BookOpen size={20} />
            Statistik Paket Kursus
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dashboardData?.totalPesertaPerPaket?.map((paket, index) => (
              <div key={index} style={{
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    margin: '0'
                  }}>
                    {paket.namaPaket}
                  </h3>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <span>Total Peserta: {paket.totalPeserta}</span>
                  <span>Aktif: {paket.totalPesertaAktif}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pertumbuhan Peserta */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: '0 0 1.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <TrendingUp size={20} />
            Pertumbuhan Peserta
          </h2>
          
          {dashboardData?.pertumbuhanPeserta?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dashboardData.pertumbuhanPeserta.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color="#6b7280" />
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#1f2937' 
                    }}>
                      {formatMonth(item.bulan)} {item.tahun}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#16a34a',
                    backgroundColor: '#dcfce7',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    +{item.total} peserta
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Belum ada data pertumbuhan peserta
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        marginTop: '2rem'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#1f2937',
          margin: '0 0 1rem 0'
        }}>
          Menu Administrasi
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#e5e7eb';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
          }}>
            Kelola Instruktur
          </button>
          <button style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#e5e7eb';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
          }}>
            Pantau Peserta
          </button>
          <button style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#e5e7eb';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
          }}>
            Kelola Paket Kursus
          </button>
          <button style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#e5e7eb';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
          }}>
            Riwayat Transaksi
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;