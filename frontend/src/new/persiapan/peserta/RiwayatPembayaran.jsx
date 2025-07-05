import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, FileText, Calendar, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import api from '../../shared/services/api';

const RiwayatPembayaran = () => {
  const navigate = useNavigate();
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadRiwayatPembayaran();
  }, []);

  const loadRiwayatPembayaran = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pembayaran/riwayat');
      setTransaksi(response.data);
    } catch (error) {
      console.error('Error loading riwayat pembayaran:', error);
      setError('Gagal memuat riwayat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': {
        color: '#856404',
        backgroundColor: '#fff3cd',
        border: '#ffeaa7',
        icon: <Clock size={14} />
      },
      'BERHASIL': {
        color: '#155724',
        backgroundColor: '#d4edda',
        border: '#c3e6cb',
        icon: <CheckCircle size={14} />
      },
      'DITOLAK': {
        color: '#721c24',
        backgroundColor: '#f8d7da',
        border: '#f5c6cb',
        icon: <XCircle size={14} />
      }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        fontSize: '12px',
        fontWeight: '500',
        borderRadius: '4px',
        color: config.color,
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.border}`
      }}>
        {config.icon}
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewDetail = (transaksiItem) => {
    setSelectedTransaksi(transaksiItem);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTransaksi(null);
  };

  const handleViewBukti = (buktiUrl) => {
    if (buktiUrl) {
      window.open(`http://localhost:8000/storage/${buktiUrl}`, '_blank');
    }
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
            Memuat riwayat pembayaran...
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
          Riwayat Pembayaran
        </h1>
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
          <XCircle size={18} />
          {error}
        </div>
      )}

      {/* Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        overflow: 'hidden'
      }}>
        
        {/* Header Table */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CreditCard size={20} style={{ color: '#B6252A' }} />
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#2c3e50', 
            margin: 0 
          }}>
            Daftar Transaksi Pembayaran
          </h3>
        </div>

        {/* Empty State */}
        {transaksi.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center'
          }}>
            <FileText size={48} style={{ color: '#e9ecef', marginBottom: '1rem' }} />
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '500', 
              color: '#6c757d', 
              marginBottom: '0.5rem' 
            }}>
              Belum Ada Transaksi
            </h3>
            <p style={{ color: '#adb5bd', marginBottom: '1.5rem' }}>
              Anda belum melakukan pembayaran paket kursus apapun.
            </p>
            <button
              onClick={() => navigate('/paket-kursus')}
              style={{
                backgroundColor: '#D4A574',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Lihat Paket Kursus
            </button>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '150px 200px 130px 130px 120px 100px',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2c3e50',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div>Kode Transaksi</div>
              <div>Paket Kursus</div>
              <div>Tanggal</div>
              <div>Jumlah</div>
              <div>Status</div>
              <div>Aksi</div>
            </div>

            {/* Table Body */}
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {transaksi.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 200px 130px 130px 120px 100px',
                    gap: '1rem',
                    padding: '1rem',
                    borderBottom: index < transaksi.length - 1 ? '1px solid #e9ecef' : 'none',
                    fontSize: '14px',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ 
                    fontWeight: '500', 
                    color: '#2c3e50',
                    fontFamily: 'monospace'
                  }}>
                    {item.kodeTransaksi}
                  </div>
                  
                  <div style={{ color: '#2c3e50' }}>
                    <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                      {item.namaPaket}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {formatCurrency(item.hargaPaket)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6c757d' 
                  }}>
                    {formatDate(item.tanggalTransaksi)}
                  </div>
                  
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#B6252A' 
                  }}>
                    {formatCurrency(item.nominalBayar)}
                  </div>
                  
                  <div>
                    {getStatusBadge(item.statusTransaksi)}
                  </div>
                  
                  <div>
                    <button
                      onClick={() => handleViewDetail(item)}
                      style={{
                        backgroundColor: '#2563EB',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontFamily: "'Poppins', sans-serif"
                      }}
                    >
                      <Eye size={12} />
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Detail Transaksi */}
      {showModal && selectedTransaksi && (
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
            borderRadius: '8px',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e9ecef'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#B6252A',
                margin: 0
              }}>
                Detail Transaksi
              </h3>
              <button
                onClick={closeModal}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ fontSize: '14px' }}>
              
              {/* Kode Transaksi */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  display: 'block', 
                  marginBottom: '0.25rem' 
                }}>
                  Kode Transaksi:
                </label>
                <div style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '16px', 
                  color: '#B6252A', 
                  fontWeight: '600' 
                }}>
                  {selectedTransaksi.kodeTransaksi}
                </div>
              </div>

              {/* Paket Kursus */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  display: 'block', 
                  marginBottom: '0.25rem' 
                }}>
                  Paket Kursus:
                </label>
                <div style={{ color: '#2c3e50' }}>
                  {selectedTransaksi.namaPaket}
                </div>
              </div>

              {/* Tanggal Transaksi */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  display: 'block', 
                  marginBottom: '0.25rem' 
                }}>
                  Tanggal Transaksi:
                </label>
                <div style={{ 
                  color: '#2c3e50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Calendar size={16} style={{ color: '#6c757d' }} />
                  {formatDate(selectedTransaksi.tanggalTransaksi)}
                </div>
              </div>

              {/* Nominal */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  display: 'block', 
                  marginBottom: '0.25rem' 
                }}>
                  Jumlah Pembayaran:
                </label>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#B6252A' 
                }}>
                  {formatCurrency(selectedTransaksi.nominalBayar)}
                </div>
              </div>

              {/* Status */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  display: 'block', 
                  marginBottom: '0.25rem' 
                }}>
                  Status:
                </label>
                <div>
                  {getStatusBadge(selectedTransaksi.statusTransaksi)}
                </div>
              </div>

              {/* Keterangan jika ada */}
              {selectedTransaksi.keterangan && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    fontWeight: '600', 
                    color: '#2c3e50', 
                    display: 'block', 
                    marginBottom: '0.25rem' 
                  }}>
                    Keterangan:
                  </label>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    color: '#6c757d',
                    fontStyle: 'italic'
                  }}>
                    {selectedTransaksi.keterangan}
                  </div>
                </div>
              )}

              {/* Bukti Pembayaran */}
              {selectedTransaksi.buktiPembayaran && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontWeight: '600', 
                    color: '#2c3e50', 
                    display: 'block', 
                    marginBottom: '0.5rem' 
                  }}>
                    Bukti Pembayaran:
                  </label>
                  <button
                    onClick={() => handleViewBukti(selectedTransaksi.buktiPembayaran)}
                    style={{
                      backgroundColor: '#2563EB',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontFamily: "'Poppins', sans-serif"
                    }}
                  >
                    <FileText size={16} />
                    Lihat Bukti Pembayaran
                  </button>
                </div>
              )}

              {/* Status Info */}
              <div style={{
                backgroundColor: selectedTransaksi.statusTransaksi === 'PENDING' ? 
                  '#fff3cd' : selectedTransaksi.statusTransaksi === 'BERHASIL' ? 
                  '#d4edda' : '#f8d7da',
                border: `1px solid ${selectedTransaksi.statusTransaksi === 'PENDING' ? 
                  '#ffeaa7' : selectedTransaksi.statusTransaksi === 'BERHASIL' ? 
                  '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '6px',
                padding: '0.75rem',
                fontSize: '12px',
                color: selectedTransaksi.statusTransaksi === 'PENDING' ? 
                  '#856404' : selectedTransaksi.statusTransaksi === 'BERHASIL' ? 
                  '#155724' : '#721c24',
                marginBottom: '1.5rem'
              }}>
                {selectedTransaksi.statusTransaksi === 'PENDING' && (
                  <div>
                    <strong>Status: Menunggu Verifikasi</strong>
                    <br />
                    Pembayaran Anda sedang dalam proses verifikasi oleh admin. 
                    Proses verifikasi biasanya memakan waktu 1x24 jam.
                  </div>
                )}
                {selectedTransaksi.statusTransaksi === 'BERHASIL' && (
                  <div>
                    <strong>Status: Pembayaran Berhasil</strong>
                    <br />
                    Pembayaran Anda telah berhasil diverifikasi. 
                    Anda dapat mengakses paket kursus yang telah dibeli.
                  </div>
                )}
                {selectedTransaksi.statusTransaksi === 'DITOLAK' && (
                  <div>
                    <strong>Status: Pembayaran Ditolak</strong>
                    <br />
                    Pembayaran Anda ditolak. Silakan periksa keterangan di atas 
                    atau hubungi admin untuk informasi lebih lanjut.
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  Tutup
                </button>
                
                {selectedTransaksi.statusTransaksi === 'DITOLAK' && (
                  <button
                    onClick={() => {
                      closeModal();
                      navigate('/paket-kursus');
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#D4A574',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif"
                    }}
                  >
                    Beli Ulang
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiwayatPembayaran;