import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Eye, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowLeft, 
  Search,
  Filter,
  Download,
  User,
  DollarSign
} from 'lucide-react';
import api from '../../shared/services/api';

const RiwayatTransaksi = () => {
  const navigate = useNavigate();
  const [transaksi, setTransaksi] = useState([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadRiwayatTransaksi();
  }, []);

  useEffect(() => {
    filterTransaksi();
  }, [transaksi, searchTerm, statusFilter]);

  const loadRiwayatTransaksi = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/transaksi');
      
      // Transform data sesuai struktur backend yang benar
      const transformedData = response.data.map(item => ({
        id: item.idTransaksi,
        kodeTransaksi: item.kodeTransaksi,
        namaLengkap: item.peserta_paket?.peserta?.namaLengkap || 'Tidak diketahui',
        email: item.peserta_paket?.peserta?.pengguna?.email || 'Tidak diketahui',
        namaPaket: item.peserta_paket?.paket?.namaPaket || 'Tidak diketahui',
        hargaPaket: item.peserta_paket?.paket?.harga || 0,
        jumlah: item.nominal,
        status: item.status,
        timestamp: item.created_at,
        buktiPembayaran: item.buktiPembayaran,
        keterangan: item.keterangan
      }));
      
      setTransaksi(transformedData);
    } catch (error) {
      console.error('Error loading riwayat transaksi:', error);
      setError('Gagal memuat riwayat transaksi');
    } finally {
      setLoading(false);
    }
  };

  const filterTransaksi = () => {
    let filtered = [...transaksi];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.kodeTransaksi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaLengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaPaket?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredTransaksi(filtered);
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
      month: 'short',
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

  const handleViewDetail = async (transaksiId) => {
    try {
      const response = await api.get(`/admin/transaksi/${transaksiId}`);
      
      // Transform detail data sesuai struktur backend
      const transformedDetail = {
        id: response.data.idTransaksi,
        kodeTransaksi: response.data.kodeTransaksi,
        namaLengkap: response.data.peserta_paket?.peserta?.namaLengkap || 'Tidak diketahui',
        email: response.data.peserta_paket?.peserta?.pengguna?.email || 'Tidak diketahui',
        namaPaket: response.data.peserta_paket?.paket?.namaPaket || 'Tidak diketahui',
        jumlah: response.data.nominal,
        status: response.data.status,
        timestamp: response.data.created_at,
        buktiPembayaran: response.data.buktiPembayaran,
        keterangan: response.data.keterangan
      };
      
      setSelectedTransaksi(transformedDetail);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading detail transaksi:', error);
      setError('Gagal memuat detail transaksi');
    }
  };

  const handleVerifikasi = async (status, keterangan = '') => {try {
      setVerifying(true);
      setError(''); // Clear previous errors
      
      // Payload structure
      const payload = { 
        status: status.toUpperCase() // Ensure uppercase
      };
      
      // Add keterangan for both approval and rejection
      if (status === 'DITOLAK') {
        if (!keterangan.trim()) {
          setError('Keterangan wajib diisi untuk menolak transaksi');
          return;
        }
        payload.keterangan = keterangan.trim();
      } else if (status === 'BERHASIL') {
        // Optional: Add default keterangan for approval
        payload.keterangan = keterangan || 'Pembayaran telah diverifikasi dan disetujui oleh admin';
      }

      console.log('Sending verification payload:', payload);

      const response = await api.patch(
        `/admin/transaksi/${selectedTransaksi.id}/verifikasi`, 
        payload
      );
      
      console.log('Verification response status:', response.status);
      console.log('Verification response data:', response.data);
      
      // PERBAIKAN: Handle both 200 and 204 status codes
      if (response.status === 200 || response.status === 204) {
        console.log('Verification successful');
        
        // Close modal first
        setShowModal(false);
        setSelectedTransaksi(null);
        
        // Show success message
        const successMessage = status === 'BERHASIL' 
          ? `Transaksi ${selectedTransaksi.kodeTransaksi} berhasil disetujui`
          : `Transaksi ${selectedTransaksi.kodeTransaksi} berhasil ditolak`;
        
        console.log(successMessage);
        
        // Reload data with delay to ensure backend processing is complete
        setTimeout(async () => {
          await loadRiwayatTransaksi();
        }, 500);
        
      } else {
        // Handle unexpected status codes
        console.warn('Unexpected response status:', response.status);
        setError('Response tidak sesuai yang diharapkan');
      }
      
    } catch (error) {
      console.error('Verification error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      });
      
      // PERBAIKAN: Better error handling
      let errorMessage = 'Gagal memverifikasi transaksi';
      
      // Handle different error types
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout - coba lagi dalam beberapa saat';
      } else if (error.response?.status === 422) {
        errorMessage = error.response.data?.message || 'Data tidak valid untuk verifikasi';
      } else if (error.response?.status === 404) {
        errorMessage = 'Transaksi tidak ditemukan';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTransaksi(null);
    setError(''); // Clear errors when closing modal
  };

  const handleViewBukti = (buktiUrl) => {
    if (buktiUrl) {
      // FIXED: Handle bukti URL properly
      let fullUrl;
      if (buktiUrl.startsWith('http')) {
        fullUrl = buktiUrl;
      } else if (buktiUrl.startsWith('/storage/')) {
        fullUrl = `http://localhost:8000${buktiUrl}`;
      } else {
        // Backend stores as 'bukti_pembayaran/filename.jpg'
        fullUrl = `http://localhost:8000/storage/${buktiUrl}`;
      }
      
      console.log('Opening bukti URL:', fullUrl);
      window.open(fullUrl, '_blank');
    }
  };

  const getStatusCounts = () => {
    return {
      total: transaksi.length,
      pending: transaksi.filter(t => t.status === 'PENDING').length,
      berhasil: transaksi.filter(t => t.status === 'BERHASIL').length,
      ditolak: transaksi.filter(t => t.status === 'DITOLAK').length
    };
  };

  const statusCounts = getStatusCounts();

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
            Memuat riwayat transaksi...
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
          Riwayat Transaksi
        </h1>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div style={{ color: '#6c757d', fontSize: '14px', marginBottom: '0.5rem' }}>
            Total Transaksi
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#2c3e50' }}>
            {statusCounts.total}
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div style={{ color: '#856404', fontSize: '14px', marginBottom: '0.5rem' }}>
            Menunggu Verifikasi
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#856404' }}>
            {statusCounts.pending}
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div style={{ color: '#155724', fontSize: '14px', marginBottom: '0.5rem' }}>
            Berhasil
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#155724' }}>
            {statusCounts.berhasil}
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div style={{ color: '#721c24', fontSize: '14px', marginBottom: '0.5rem' }}>
            Ditolak
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#721c24' }}>
            {statusCounts.ditolak}
          </div>
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
          <XCircle size={18} />
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6c757d'
            }} />
            <input
              type="text"
              placeholder="Cari kode transaksi, nama peserta, atau paket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: "'Poppins', sans-serif"
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: "'Poppins', sans-serif",
              minWidth: '150px'
            }}
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="BERHASIL">Berhasil</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </div>
      </div>

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
            Daftar Transaksi ({filteredTransaksi.length})
          </h3>
        </div>

        {/* Empty State */}
        {filteredTransaksi.length === 0 ? (
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
              {searchTerm || statusFilter !== 'ALL' ? 'Tidak Ada Transaksi yang Sesuai' : 'Belum Ada Transaksi'}
            </h3>
            <p style={{ color: '#adb5bd' }}>
              {searchTerm || statusFilter !== 'ALL' ? 
                'Coba ubah filter pencarian Anda.' : 
                'Belum ada transaksi pembayaran yang masuk.'}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '120px 150px 150px 120px 120px 100px 100px',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2c3e50',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div>Kode Transaksi</div>
              <div>Peserta</div>
              <div>Paket Kursus</div>
              <div>Tanggal</div>
              <div>Jumlah</div>
              <div>Status</div>
              <div>Aksi</div>
            </div>

            {/* Table Body */}
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {filteredTransaksi.map((item, index) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 150px 150px 120px 120px 100px 100px',
                    gap: '1rem',
                    padding: '1rem',
                    borderBottom: index < filteredTransaksi.length - 1 ? '1px solid #e9ecef' : 'none',
                    fontSize: '14px',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ 
                    fontWeight: '500', 
                    color: '#2c3e50',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}>
                    {item.kodeTransaksi || 'N/A'}
                  </div>
                  
                  <div style={{ color: '#2c3e50' }}>
                    <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                      {item.namaLengkap || 'Tidak diketahui'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {item.email || 'Tidak diketahui'}
                    </div>
                  </div>
                  
                  <div style={{ color: '#2c3e50' }}>
                    <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                      {item.namaPaket || 'Tidak diketahui'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {formatCurrency(item.hargaPaket || 0)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6c757d' 
                  }}>
                    {formatDate(item.timestamp)}
                  </div>
                  
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#B6252A' 
                  }}>
                    {formatCurrency(item.jumlah || 0)}
                  </div>
                  
                  <div>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  <div>
                    <button
                      onClick={() => handleViewDetail(item.id)}
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
                      {item.status === 'PENDING' ? 'Verifikasi' : 'Detail'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Detail & Verifikasi Transaksi */}
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
            maxWidth: '600px',
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
                {selectedTransaksi.status === 'PENDING' ? 'Verifikasi Transaksi' : 'Detail Transaksi'}
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
              
              {/* Error dalam modal */}
              {error && (
                <div style={{
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  border: '1px solid #f5c6cb',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
              
              {/* Informasi Peserta */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <User size={16} />
                  Informasi Peserta
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <strong>Nama:</strong> {selectedTransaksi.namaLengkap || 'Tidak diketahui'}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedTransaksi.email || 'Tidak diketahui'}
                  </div>
                </div>
              </div>

              {/* Informasi Transaksi */}
              <div style={{
                backgroundColor: '#e3f2fd',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1976d2',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <DollarSign size={16} />
                  Informasi Transaksi
                </h4>
                
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Kode Transaksi:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                      {selectedTransaksi.kodeTransaksi || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Paket Kursus:</span>
                    <span style={{ fontWeight: '500' }}>{selectedTransaksi.namaPaket || 'Tidak diketahui'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tanggal:</span>
                    <span>{formatDate(selectedTransaksi.timestamp)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Jumlah:</span>
                    <span style={{ fontWeight: '600', color: '#B6252A' }}>
                      {formatCurrency(selectedTransaksi.jumlah || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Status:</span>
                    <span>{getStatusBadge(selectedTransaksi.status)}</span>
                  </div>
                </div>
              </div>

              {/* Bukti Pembayaran */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FileText size={16} />
                  Bukti Pembayaran
                </h4>
                
                {selectedTransaksi.buktiPembayaran ? (
                  <div style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    padding: '1rem',
                    backgroundColor: '#fdfdfd'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '14px', color: '#6c757d' }}>
                        File: {selectedTransaksi.buktiPembayaran.split('/').pop()}
                      </span>
                      <button
                        onClick={() => handleViewBukti(selectedTransaksi.buktiPembayaran)}
                        style={{
                          backgroundColor: '#2563EB',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontFamily: "'Poppins', sans-serif"
                        }}
                      >
                        Lihat Bukti
                      </button>
                    </div>
                    
                    {/* Preview image jika file adalah gambar */}
                    {selectedTransaksi.buktiPembayaran.match(/\.(jpg|jpeg|png|gif)$/i) && (
                      <div style={{ textAlign: 'center' }}>
                        <img
                          src={selectedTransaksi.buktiPembayaran.startsWith('http') 
                            ? selectedTransaksi.buktiPembayaran 
                            : selectedTransaksi.buktiPembayaran.startsWith('/storage/') 
                            ? `http://localhost:8000${selectedTransaksi.buktiPembayaran}`
                            : `http://localhost:8000/storage/${selectedTransaksi.buktiPembayaran}`}
                          alt="Bukti pembayaran"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            borderRadius: '4px',
                            border: '1px solid #e9ecef'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none', color: '#6c757d', fontStyle: 'italic' }}>
                          Gagal memuat preview gambar
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    color: '#6c757d',
                    textAlign: 'center'
                  }}>
                    Tidak ada bukti pembayaran
                  </div>
                )}
              </div>

              {/* Keterangan jika sudah ada */}
              {selectedTransaksi.keterangan && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '0.5rem'
                  }}>
                    Keterangan:
                  </h4>
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

              {/* Form Verifikasi untuk status PENDING */}
              {selectedTransaksi.status === 'PENDING' && (
                <VerifikasiForm 
                  onVerifikasi={handleVerifikasi}
                  verifying={verifying}
                />
              )}

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component untuk form verifikasi - FIXED VERSION
const VerifikasiForm = ({ onVerifikasi, verifying }) => {
  const [keterangan, setKeterangan] = useState('');
  const [showKeterangan, setShowKeterangan] = useState(false);
  const [approvalKeterangan, setApprovalKeterangan] = useState('');

  const handleApprove = () => {
    // FIXED: Always pass keterangan for approval
    const finalKeterangan = approvalKeterangan.trim() || 'Pembayaran telah diverifikasi dan disetujui oleh admin';
    onVerifikasi('BERHASIL', finalKeterangan);
  };

  const handleReject = () => {
    if (!keterangan.trim()) {
      alert('Keterangan wajib diisi untuk menolak transaksi');
      return;
    }
    onVerifikasi('DITOLAK', keterangan);
  };

  return (
    <div style={{
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '6px',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#856404',
        marginBottom: '1rem'
      }}>
        Verifikasi Pembayaran
      </h4>
      
      <p style={{
        fontSize: '14px',
        color: '#856404',
        marginBottom: '1rem'
      }}>
        Silakan periksa bukti pembayaran dan lakukan verifikasi:
      </p>

      {/* Optional keterangan for approval */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '14px',
          fontWeight: '500',
          color: '#856404'
        }}>
          Catatan Verifikasi (Opsional)
        </label>
        <input
          type="text"
          value={approvalKeterangan}
          onChange={(e) => setApprovalKeterangan(e.target.value)}
          placeholder="Tambahkan catatan untuk persetujuan (opsional)"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '1rem'
          }}
        />
      </div>

      {/* Tombol Verifikasi */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={handleApprove}
          disabled={verifying}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: verifying ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: "'Poppins', sans-serif",
            opacity: verifying ? 0.7 : 1
          }}
        >
          <CheckCircle size={16} />
          {verifying ? 'Memproses...' : 'Setujui'}
        </button>
        
        <button
          onClick={() => setShowKeterangan(!showKeterangan)}
          disabled={verifying}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: verifying ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: "'Poppins', sans-serif",
            opacity: verifying ? 0.7 : 1
          }}
        >
          <XCircle size={16} />
          Tolak
        </button>
      </div>

      {/* Form Keterangan untuk penolakan */}
      {showKeterangan && (
        <div style={{ marginTop: '1rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '14px',
            fontWeight: '500',
            color: '#856404'
          }}>
            Keterangan Penolakan *
          </label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Jelaskan alasan penolakan..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: "'Poppins', sans-serif",
              resize: 'vertical',
              marginBottom: '1rem'
            }}
          />
          <button
            onClick={handleReject}
            disabled={verifying || !keterangan.trim()}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: (verifying || !keterangan.trim()) ? 'not-allowed' : 'pointer',
              fontFamily: "'Poppins', sans-serif",
              opacity: (verifying || !keterangan.trim()) ? 0.7 : 1
            }}
          >
            {verifying ? 'Memproses...' : 'Konfirmasi Tolak'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RiwayatTransaksi;