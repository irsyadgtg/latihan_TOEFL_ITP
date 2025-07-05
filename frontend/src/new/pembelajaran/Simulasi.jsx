import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../shared/services/api';

export default function Simulasi() {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState(null);
  
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'peserta') {
      checkEligibility();
    } else {
      setLoading(false);
    }
  }, [role]);

  const checkEligibility = async () => {
    try {
      const res = await api.get('/simulations/eligibility?simulation_set_id=1', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEligibility(res.data);
      setAccessError(null);
    } catch (err) {
      console.error('Error checking eligibility:', err);
      
      if (err.response?.status === 403) {
        setAccessError({
          type: 'forbidden',
          message: err.response?.data?.error || 'Akses simulasi tidak diizinkan',
          details: err.response?.data?.details || null
        });
        setEligibility({ eligible: false });
      } else {
        setEligibility({ eligible: false, reason: 'Gagal mengecek kelayakan simulasi' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartSimulation = () => {
    if (accessError?.type === 'forbidden') {
      alert(accessError.message);
      return;
    }
    
    if (!eligibility?.eligible) {
      alert(eligibility?.reason || 'Anda tidak dapat mengerjakan simulasi');
      return;
    }
    navigate('/simulasi/mulai');
  };

  const handleViewResults = () => {
    navigate('/simulasi/hasil');
  };

  const handleUpgradePackage = () => {
    navigate('/paket-kursus');
  };

  const canStartSimulation = () => {
    return !accessError && eligibility?.eligible;
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <h2>Simulasi TOEFL ITP</h2>
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <h2 style={{ color: '#B6252A', marginBottom: '1rem', fontWeight: 'bold' }}>
        Simulasi TOEFL ITP
      </h2>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ color: '#495057', marginBottom: '1rem', fontWeight: 'bold' }}>
          Tentang Simulasi TOEFL ITP
        </h3>
        <p style={{ marginBottom: '1rem', lineHeight: '1.6', color: '#555' }}>
          Simulasi ini menguji kemampuan bahasa Inggris Anda dalam tiga bagian sesuai standar TOEFL ITP:
        </p>
        <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem', color: '#555' }}>
          <li><strong>Listening Comprehension:</strong> 35 menit (50 soal)</li>
          <li><strong>Structure and Written Expression:</strong> 25 menit (40 soal)</li>
          <li><strong>Reading Comprehension:</strong> 55 menit (50 soal)</li>
        </ul>
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '1rem',
          borderRadius: '4px',
          border: '1px solid #ffeaa7'
        }}>
          <strong>Aturan Penting:</strong>
          <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
            <li>Simulasi hanya dapat dikerjakan <strong>1 kali</strong></li>
            <li>Tidak dapat kembali ke soal atau section sebelumnya</li>
            <li>Simulasi dapat dipause dan dilanjutkan (auto-save)</li>
            <li>Audio listening hanya diputar 1 kali</li>
            <li>Urutan pengerjaan: Listening → Structure → Reading</li>
          </ul>
        </div>
      </div>

      <div style={{
        backgroundColor: '#e7f3ff',
        color: '#0c5460',
        padding: '1rem',
        borderRadius: '4px',
        border: '1px solid #bee5eb',
        marginBottom: '2rem'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
          Syarat Mengikuti Simulasi
        </h4>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '14px' }}>
          Untuk mengikuti simulasi TOEFL ITP, Anda memerlukan:
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '14px' }}>
          <li>Paket kursus aktif yang memiliki fasilitas simulasi</li>
          <li>Rencana belajar yang sudah disetujui instruktur</li>
        </ul>
      </div>

      {role === 'peserta' ? (
        <div>
          {accessError?.type === 'forbidden' && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid #f5c6cb',
              marginBottom: '1rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                Akses Simulasi Tidak Tersedia
              </h4>
              <p style={{ margin: '0 0 1rem 0' }}>
                {accessError.message}
              </p>
              
              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={handleUpgradePackage}
                  style={{
                    backgroundColor: '#B6252A',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    fontSize: '14px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginRight: '0.5rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  Lihat Paket Kursus
                </button>
                <button 
                  onClick={() => navigate('/rencana-belajar')}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    fontSize: '14px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  Cek Rencana Belajar
                </button>
              </div>
            </div>
          )}

          {!accessError && eligibility?.eligible && (
            <div>
              {eligibility.has_incomplete ? (
                <div style={{
                  backgroundColor: '#d1ecf1',
                  color: '#0c5460',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #bee5eb',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                    Simulasi Belum Selesai
                  </h4>
                  <p style={{ margin: 0 }}>
                    Anda memiliki simulasi yang belum selesai. Klik "Lanjutkan Simulasi" untuk melanjutkan dari section terakhir.
                  </p>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #c3e6cb',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                    Siap Memulai Simulasi
                  </h4>
                  <p style={{ margin: 0 }}>
                    Anda dapat memulai simulasi TOEFL ITP. Pastikan Anda dalam kondisi siap dan memiliki waktu yang cukup.
                  </p>
                </div>
              )}
            </div>
          )}

          {!accessError && !eligibility?.eligible && (
            <div>
              <div style={{
                backgroundColor: eligibility?.reason?.includes('tidak aktif') ? '#fff3cd' : '#f8d7da',
                color: eligibility?.reason?.includes('tidak aktif') ? '#856404' : '#721c24',
                padding: '1rem',
                borderRadius: '4px',
                border: eligibility?.reason?.includes('tidak aktif') ? '1px solid #ffeaa7' : '1px solid #f5c6cb',
                marginBottom: '1rem'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                  {eligibility?.reason?.includes('tidak aktif') ? 'Simulasi Tidak Aktif' : 'Akses Simulasi Terbatas'}
                </h4>
                <p style={{ margin: '0 0 1rem 0' }}>
                  {(() => {
                    if (eligibility?.reason?.includes('tidak aktif')) {
                      return eligibility.reason;
                    }
                    if (eligibility?.reason?.includes('sudah pernah')) {
                      return 'Anda sudah pernah mengerjakan simulasi ini.';
                    }
                    if (eligibility?.reason?.includes('Tidak ada paket aktif')) {
                      return 'Anda belum memiliki paket kursus aktif. Silakan berlangganan paket terlebih dahulu.';
                    }
                    if (eligibility?.reason?.includes('tidak memiliki akses simulasi')) {
                      return 'Paket kursus Anda tidak mendukung fitur simulasi. Upgrade ke paket yang memiliki fasilitas simulasi.';
                    }
                    if (eligibility?.reason?.includes('Belum ada rencana belajar aktif')) {
                      return 'Rencana belajar Anda belum aktif. Pastikan rencana belajar sudah disetujui instruktur.';
                    }
                    return eligibility?.reason || 'Anda belum dapat mengerjakan simulasi saat ini.';
                  })()}
                </p>
                {eligibility?.existing_result?.completed_at && (
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    <strong>Diselesaikan pada:</strong> {new Date(eligibility.existing_result.completed_at).toLocaleString('id-ID')}
                  </p>
                )}
                
                {eligibility?.reason?.includes('tidak aktif') && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                  }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      <strong>Informasi:</strong> Simulasi sedang dinonaktifkan oleh instruktur. 
                      Silakan hubungi instruktur untuk informasi lebih lanjut tentang jadwal aktivasi simulasi.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <button 
              onClick={handleStartSimulation}
              disabled={!canStartSimulation()}
              style={{
                backgroundColor: canStartSimulation() ? '#B6252A' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '16px',
                borderRadius: '8px',
                cursor: canStartSimulation() ? 'pointer' : 'not-allowed',
                marginRight: '1rem',
                fontWeight: 'bold',
                opacity: canStartSimulation() ? 1 : 0.6,
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              {(() => {
                if (accessError?.type === 'forbidden') return 'Simulasi Tidak Tersedia';
                if (!eligibility?.eligible) {
                  if (eligibility?.reason?.includes('tidak aktif')) return 'Simulasi Tidak Aktif';
                  if (eligibility?.reason?.includes('sudah pernah')) return 'Sudah Dikerjakan';
                  return 'Tidak Dapat Memulai';
                }
                return eligibility?.has_incomplete ? 'Lanjutkan Simulasi' : 'Mulai Simulasi';
              })()}
            </button>
            
            <button 
              onClick={handleViewResults}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Riwayat Hasil Simulasi
            </button>
          </div>
        </div>
      ) : role === 'instruktur' && (
        <div>
          <div style={{
            backgroundColor: '#e2e3e5',
            color: '#383d41',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #d6d8db',
            marginBottom: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
              Panel instruktur
            </h4>
            <p style={{ margin: 0 }}>
              Kelola soal-soal simulasi TOEFL ITP untuk peserta.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/simulasi/kelola')}
            style={{
              backgroundColor: '#B6252A',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Kelola Soal Simulasi
          </button>
        </div>
      )}
    </div>
  );
}