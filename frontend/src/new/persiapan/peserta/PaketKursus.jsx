import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  Users, 
  CheckCircle, 
  ShoppingCart, 
  Star, 
  ArrowLeft,
  AlertCircle,
  Lock,
  Crown
} from 'lucide-react';
import api from '../../shared/services/api';

const PaketKursus = () => {
  const navigate = useNavigate();
  const [paketList, setPaketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPaket, setSelectedPaket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eligibilityInfo, setEligibilityInfo] = useState({});

  useEffect(() => {
    loadPaketKursus();
  }, []);

  const loadPaketKursus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/peserta/paket-kursus');
      setPaketList(response.data);
    } catch (error) {
      console.error('Error loading paket kursus:', error);
      setError('Gagal memuat daftar paket kursus');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async (paketId) => {
    try {
      const response = await api.get(`/paket/${paketId}/eligibility`);
      return { eligible: true, message: response.data.message };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      if (error.response && error.response.data && error.response.data.message) {
        return { eligible: false, message: error.response.data.message };
      }
      return { eligible: false, message: 'Gagal memeriksa kelayakan paket' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePaketClick = async (paket) => {
    setSelectedPaket(paket);
    
    // Check eligibility using correct field name
    const eligibility = await checkEligibility(paket.idPaketKursus);
    setEligibilityInfo(eligibility);
    
    setShowModal(true);
  };

  const handleBeliPaket = async () => {
    if (!selectedPaket) return;

    // Check eligibility before proceeding
    if (!eligibilityInfo.eligible) {
      alert(eligibilityInfo.message);
      return;
    }

    navigate(`/paket/${selectedPaket.idPaketKursus}/pembayaran`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPaket(null);
    setEligibilityInfo({});
  };

  const getPaketIcon = (namaPaket) => {
    if (namaPaket.toLowerCase().includes('premium')) {
      return <Crown size={24} style={{ color: '#D4A574' }} />;
    }
    return <Package size={24} style={{ color: '#B6252A' }} />;
  };

  const getPaketBadge = (namaPaket) => {
    if (namaPaket.toLowerCase().includes('premium')) {
      return (
        <span style={{
          backgroundColor: '#D4A574',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          position: 'absolute',
          top: '1rem',
          right: '1rem'
        }}>
          PREMIUM
        </span>
      );
    }
    if (namaPaket.toLowerCase().includes('basic')) {
      return (
        <span style={{
          backgroundColor: '#6c757d',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          position: 'absolute',
          top: '1rem',
          right: '1rem'
        }}>
          BASIC
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: '#f9fafb', 
        minHeight: '100vh',
        fontFamily: "'Poppins', sans-serif"
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', color: '#6c757d' }}>
            Memuat daftar paket kursus...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1.5rem', 
      backgroundColor: '#f9fafb', 
      minHeight: '100vh',
      fontFamily: "'Poppins', sans-serif"
    }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            padding: '0.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ArrowLeft size={20} style={{ color: '#6c757d' }} />
        </button>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#B6252A', 
          margin: 0 
        }}>
          Paket Kursus TOEFL ITP
        </h1>
      </div>

      {/* Info Banner */}
      <div style={{
        backgroundColor: '#e3f2fd',
        border: '1px solid #bbdefb',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <AlertCircle size={20} style={{ color: '#1976d2' }} />
        <div style={{ fontSize: '14px', color: '#1976d2' }}>
          <strong>Syarat Pembelian:</strong> Anda harus memiliki pengajuan skor awal yang disetujui 
          dan mendapat feedback rencana belajar terlebih dahulu.
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Paket Cards */}
      {paketList.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <Package size={48} style={{ color: '#e9ecef', marginBottom: '1rem' }} />
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '500', 
            color: '#6c757d', 
            marginBottom: '0.5rem' 
          }}>
            Belum Ada Paket Tersedia
          </h3>
          <p style={{ color: '#adb5bd' }}>
            Saat ini belum ada paket kursus yang tersedia.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {paketList.map((paket) => (
            <div 
              key={paket.idPaketKursus}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onClick={() => handlePaketClick(paket)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              {/* Badge */}
              {getPaketBadge(paket.namaPaket)}

              {/* Header */}
              <div style={{
                background: paket.namaPaket.toLowerCase().includes('premium') 
                  ? 'linear-gradient(135deg, #D4A574 0%, #B8956A 100%)'
                  : 'linear-gradient(135deg, #B6252A 0%, #A21E23 100%)',
                color: 'white',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  {getPaketIcon(paket.namaPaket)}
                </div>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  margin: '0 0 0.5rem 0' 
                }}>
                  {paket.namaPaket}
                </h3>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '700',
                  marginBottom: '0.25rem'
                }}>
                  {formatCurrency(paket.harga)}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  opacity: 0.9 
                }}>
                  Masa berlaku {paket.masaBerlaku} hari
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem' }}>
                {/* Description */}
                <p style={{ 
                  color: '#6c757d', 
                  fontSize: '14px', 
                  marginBottom: '1.5rem',
                  lineHeight: '1.5'
                }}>
                  {paket.deskripsi}
                </p>

                {/* Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <Users size={16} style={{ color: '#6c757d', marginBottom: '0.25rem' }} />
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Total Pengguna</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                      {paket.totalPengguna || 0}
                    </div>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <Clock size={16} style={{ color: '#6c757d', marginBottom: '0.25rem' }} />
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Masa Berlaku</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                      {paket.masaBerlaku} hari
                    </div>
                  </div>
                </div>

                {/* Fasilitas Preview */}
                {paket.fasilitas && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#2c3e50', 
                      marginBottom: '0.5rem' 
                    }}>
                      Fasilitas:
                    </h4>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6c757d',
                      backgroundColor: '#f8f9fa',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      maxHeight: '80px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {paket.fasilitas}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '20px',
                        background: 'linear-gradient(transparent, #f8f9fa)'
                      }} />
                    </div>
                  </div>
                )}

                {/* Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: paket.aktif ? '#d4edda' : '#f8d7da',
                  color: paket.aktif ? '#155724' : '#721c24',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {paket.aktif ? (
                    <>
                      <CheckCircle size={16} />
                      Tersedia
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Tidak Tersedia
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Paket */}
      {showModal && selectedPaket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: 0,
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              background: selectedPaket.namaPaket.toLowerCase().includes('premium') 
                ? 'linear-gradient(135deg, #D4A574 0%, #B8956A 100%)'
                : 'linear-gradient(135deg, #B6252A 0%, #A21E23 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0',
              position: 'relative'
            }}>
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>

              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  {getPaketIcon(selectedPaket.namaPaket)}
                </div>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  margin: '0 0 0.5rem 0' 
                }}>
                  {selectedPaket.namaPaket}
                </h3>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '700',
                  marginBottom: '0.25rem'
                }}>
                  {formatCurrency(selectedPaket.harga)}
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  opacity: 0.9 
                }}>
                  Masa berlaku {selectedPaket.masaBerlaku} hari
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem' }}>
              
              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '0.5rem'
                }}>
                  Deskripsi Paket:
                </h4>
                <p style={{ 
                  color: '#6c757d', 
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {selectedPaket.deskripsi}
                </p>
              </div>

              {/* Fasilitas */}
              {selectedPaket.fasilitas && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '0.5rem'
                  }}>
                    Fasilitas yang Didapat:
                  </h4>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#6c757d',
                    lineHeight: '1.6'
                  }}>
                    {selectedPaket.fasilitas}
                  </div>
                </div>
              )}

              {/* Ketentuan */}
              {selectedPaket.ketentuan && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '0.5rem'
                  }}>
                    Ketentuan:
                  </h4>
                  <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#856404',
                    lineHeight: '1.6'
                  }}>
                    {selectedPaket.ketentuan}
                  </div>
                </div>
              )}

              {/* Stats Detail */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <Users size={20} style={{ color: '#6c757d', marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '0.25rem' }}>
                    Total Pengguna
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>
                    {selectedPaket.totalPengguna || 0}
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <Clock size={20} style={{ color: '#6c757d', marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '0.25rem' }}>
                    Masa Berlaku
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>
                    {selectedPaket.masaBerlaku} hari
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <Star size={20} style={{ color: '#D4A574', marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '0.25rem' }}>
                    Rating
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>
                    4.8/5
                  </div>
                </div>
              </div>

              {/* Eligibility Info */}
              {eligibilityInfo.message && (
                <div style={{
                  backgroundColor: eligibilityInfo.eligible ? '#d4edda' : '#f8d7da',
                  color: eligibilityInfo.eligible ? '#155724' : '#721c24',
                  border: `1px solid ${eligibilityInfo.eligible ? '#c3e6cb' : '#f5c6cb'}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {eligibilityInfo.eligible ? (
                    <CheckCircle size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <div style={{ fontSize: '14px' }}>
                    {eligibilityInfo.message}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    backgroundColor: 'white',
                    color: '#6c757d',
                    border: '1px solid #e9ecef',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  Tutup
                </button>
                
                <button
                  onClick={handleBeliPaket}
                  disabled={!selectedPaket.aktif || !eligibilityInfo.eligible}
                  style={{
                    flex: 2,
                    backgroundColor: (selectedPaket.aktif && eligibilityInfo.eligible) ? '#D4A574' : '#e9ecef',
                    color: (selectedPaket.aktif && eligibilityInfo.eligible) ? 'white' : '#6c757d',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (selectedPaket.aktif && eligibilityInfo.eligible) ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease',
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  <ShoppingCart size={16} />
                  {!selectedPaket.aktif ? 'Tidak Tersedia' : 
                   !eligibilityInfo.eligible ? 'Tidak Memenuhi Syarat' : 
                   'Beli Paket'}
                </button>
              </div>

              {/* Additional Info */}
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: '#e3f2fd',
                border: '1px solid #bbdefb',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#1976d2',
                textAlign: 'center'
              }}>
                Setelah pembelian, Anda akan mendapat akses penuh ke semua materi dan fitur pembelajaran sesuai paket yang dipilih.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaketKursus;