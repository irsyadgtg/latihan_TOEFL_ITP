import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText, Calendar, Search, Filter, Eye, X } from 'lucide-react';
import api from '../../shared/services/api';

export default function SeleksiSkorAwal() {
  const [pengajuanList, setPengajuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: '',
    masaBerlakuDokumen: '',
    keterangan: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const token = localStorage.getItem('token');

  // Fetch pengajuan list
  const fetchPengajuan = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/pengajuan-skor-awal', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const pengajuanData = response.data.data || [];
      setPengajuanList(pengajuanData);
      
      // Calculate stats
      const pending = pengajuanData.filter(item => item.status === 'Pending').length;
      const approved = pengajuanData.filter(item => item.status === 'Disetujui').length;
      const rejected = pengajuanData.filter(item => item.status === 'Ditolak').length;
      
      setStats({
        pending,
        approved,
        rejected,
        total: pengajuanData.length
      });
      
    } catch (error) {
      console.error('Error fetching pengajuan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detail pengajuan untuk modal
  const fetchDetailPengajuan = async (idPengajuan) => {
    setLoadingDetail(true);
    try {
      const response = await api.get(`/admin/pengajuan-skor-awal/${idPengajuan}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Detail pengajuan:', response.data);
      setSelectedPengajuan(response.data.data || response.data);
      setReviewData({
        status: '',
        masaBerlakuDokumen: '',
        keterangan: ''
      });
      
    } catch (error) {
      console.error('Error fetching detail pengajuan:', error);
      alert('Gagal memuat detail pengajuan: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle review submission
  const handleReview = async () => {
    if (!reviewData.status) {
      alert('Pilih keputusan terlebih dahulu');
      return;
    }
    
    if (reviewData.status === 'Disetujui' && !reviewData.masaBerlakuDokumen.trim()) {
      alert('Masa berlaku dokumen wajib diisi untuk persetujuan');
      return;
    }
    
    if (reviewData.status === 'Ditolak' && !reviewData.keterangan.trim()) {
      alert('Alasan penolakan wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        status: reviewData.status
      };
      
      if (reviewData.status === 'Disetujui') {
        submitData.masaBerlakuDokumen = reviewData.masaBerlakuDokumen;
      } else {
        submitData.keterangan = reviewData.keterangan;
      }

      await api.patch(`/pengajuan-skor-awal/${selectedPengajuan.id}/seleksi`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Review berhasil disimpan!');
      
      // Refresh list dan tutup modal
      fetchPengajuan();
      setSelectedPengajuan(null);
      setReviewData({ status: '', masaBerlakuDokumen: '', keterangan: '' });
      
    } catch (error) {
      console.error('Error reviewing pengajuan:', error);
      alert('Gagal menyimpan review: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and search logic
  const filteredData = pengajuanList.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = 
      item.namaLengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': { color: '#ffc107', bg: '#fff3cd', label: 'Pending Review', icon: Clock },
      'Disetujui': { color: '#28a745', bg: '#d4edda', label: 'Disetujui', icon: CheckCircle },
      'Ditolak': { color: '#dc3545', bg: '#f8d7da', label: 'Ditolak', icon: XCircle }
    };
    return badges[status] || badges['Pending'];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchPengajuan();
  }, []);

  return (
    <div style={{ 
      padding: '2rem',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          margin: '0 0 0.5rem 0',
          color: '#495057',
          fontSize: '2rem'
        }}>
          Seleksi Skor Awal
        </h1>
        <p style={{ 
          margin: '0',
          color: '#6c757d',
          fontSize: '1.1rem'
        }}>
          Review dan approve pengajuan skor awal dari peserta
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '600', color: '#ffc107' }}>
            {stats.pending}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Pending Review</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '600', color: '#28a745' }}>
            {stats.approved}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Disetujui</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '600', color: '#dc3545' }}>
            {stats.rejected}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Ditolak</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '600', color: '#B6252A' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Total Pengajuan</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #dee2e6'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          
          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={18} color="#6c757d" />
            {[
              { key: 'all', label: 'Semua' },
              { key: 'Pending', label: 'Pending' },
              { key: 'Disetujui', label: 'Disetujui' },
              { key: 'Ditolak', label: 'Ditolak' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  backgroundColor: filter === filterOption.key ? '#B6252A' : 'white',
                  color: filter === filterOption.key ? 'white' : '#495057',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} color="#6c757d" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama peserta, email..."
              style={{
                padding: '0.5rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '0.9rem',
                width: '250px'
              }}
            />
          </div>
        </div>
      </div>

      {/* List Pengajuan */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.25rem',
            color: '#495057'
          }}>
            Daftar Pengajuan Skor Awal ({filteredData.length})
          </h3>
        </div>

        {loading ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            Memuat data pengajuan...
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <FileText size={48} color="#dee2e6" style={{ marginBottom: '1rem' }} />
            <p style={{ margin: 0, fontSize: '1.1rem' }}>
              {searchTerm || filter !== 'all' ? 'Tidak ada data sesuai filter' : 'Belum ada pengajuan'}
            </p>
          </div>
        ) : (
          <div style={{ padding: '1.5rem' }}>
            {filteredData.map((item, index) => {
              const statusBadge = getStatusBadge(item.status);
              const StatusIcon = statusBadge.icon;
              
              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: index < filteredData.length - 1 ? '1rem' : 0,
                    backgroundColor: item.status === 'Disetujui' ? '#f8fff8' : 'white'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.1rem',
                        color: '#495057'
                      }}>
                        {item.namaLengkap || 'Unknown Peserta'}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        color: '#6c757d',
                        fontSize: '0.9rem',
                        flexWrap: 'wrap'
                      }}>
                        <span><strong>Email:</strong> {item.email || 'N/A'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={14} />
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.color,
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        border: `1px solid ${statusBadge.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <StatusIcon size={14} />
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #dee2e6',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    
                    {/* Info Brief */}
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#6c757d'
                    }}>
                      Pengajuan skor awal untuk review dan verifikasi
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => fetchDetailPengajuan(item.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#B6252A',
                        backgroundColor: 'white',
                        border: '1px solid #B6252A',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#B6252A';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#B6252A';
                      }}
                    >
                      <Eye size={14} />
                      Seleksi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPengajuan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #dee2e6'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                color: '#495057'
              }}>
                Detail Pengajuan Skor Awal
              </h3>
              
              <button
                onClick={() => setSelectedPengajuan(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                <X size={20} color="#6c757d" />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#6c757d'
              }}>
                Memuat detail pengajuan...
              </div>
            ) : (
              <>
                {/* Informasi Peserta */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1.5rem',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: '600', color: '#495057' }}>
                    Informasi Peserta
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong style={{ color: '#495057' }}>Nama Lengkap:</strong>
                      <br />
                      <span style={{ color: '#6c757d' }}>{selectedPengajuan.namaLengkap || 'N/A'}</span>
                    </div>
                    
                    <div>
                      <strong style={{ color: '#495057' }}>Email:</strong>
                      <br />
                      <span style={{ color: '#6c757d' }}>{selectedPengajuan.email || 'N/A'}</span>
                    </div>
                    
                    <div>
                      <strong style={{ color: '#495057' }}>Tanggal Pengajuan:</strong>
                      <br />
                      <span style={{ color: '#6c757d' }}>{formatDate(selectedPengajuan.timestamp)}</span>
                    </div>
                    
                    <div>
                      <strong style={{ color: '#495057' }}>Status Saat Ini:</strong>
                      <br />
                      <span style={{ 
                        color: getStatusBadge(selectedPengajuan.status).color,
                        fontWeight: '600' 
                      }}>
                        {getStatusBadge(selectedPengajuan.status).label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detail Skor */}
                <div style={{
                  backgroundColor: '#e3f2fd',
                  padding: '1.5rem',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  border: '1px solid #bbdefb'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: '600', color: '#1565c0' }}>
                    Detail Skor TOEFL/IELTS
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong style={{ color: '#1565c0' }}>Jenis Tes:</strong>
                      <br />
                      <span style={{ 
                        color: '#495057',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                      }}>
                        {selectedPengajuan.namaTes || 'N/A'}
                      </span>
                    </div>
                    
                    <div>
                      <strong style={{ color: '#1565c0' }}>Skor:</strong>
                      <br />
                      <span style={{ 
                        color: '#B6252A',
                        fontSize: '1.5rem',
                        fontWeight: '700'
                      }}>
                        {selectedPengajuan.skor || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dokumen Pendukung */}
                {selectedPengajuan.dokumen_pendukung && (
                  <div style={{
                    backgroundColor: '#fff3cd',
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom: '1.5rem',
                    border: '1px solid #ffeaa7'
                  }}>
                    <strong style={{ color: '#856404', display: 'block', marginBottom: '0.5rem' }}>
                      Dokumen Pendukung:
                    </strong>
                    <a
                      href={selectedPengajuan.dokumen_pendukung}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#856404',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      <FileText size={16} />
                      Lihat Dokumen Sertifikat
                    </a>
                  </div>
                )}

                {/* Form Review - Hanya untuk status Pending */}
                {selectedPengajuan.status === 'Pending' && (
                  <>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '1.5rem',
                      borderRadius: '6px',
                      marginBottom: '1.5rem',
                      border: '1px solid #dee2e6'
                    }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontWeight: '600', color: '#495057' }}>
                        Review Pengajuan
                      </h4>

                      {/* Keputusan */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '0.5rem',
                          fontWeight: '600',
                          color: '#495057'
                        }}>
                          Keputusan *
                        </label>
                        <select
                          value={reviewData.status}
                          onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '1rem'
                          }}
                        >
                          <option value="">Pilih keputusan</option>
                          <option value="Disetujui">Setujui</option>
                          <option value="Ditolak">Tolak</option>
                        </select>
                      </div>

                      {/* Masa Berlaku untuk Approval */}
                      {reviewData.status === 'Disetujui' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#495057'
                          }}>
                            Masa Berlaku Dokumen *
                          </label>
                          <input
                            type="date"
                            value={reviewData.masaBerlakuDokumen}
                            onChange={(e) => setReviewData(prev => ({ ...prev, masaBerlakuDokumen: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid #ced4da',
                              borderRadius: '4px',
                              fontSize: '1rem'
                            }}
                          />
                          <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                            Tentukan sampai kapan skor ini berlaku untuk keperluan rencana belajar
                          </small>
                        </div>
                      )}

                      {/* Keterangan untuk Rejection */}
                      {reviewData.status === 'Ditolak' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#495057'
                          }}>
                            Alasan Penolakan *
                          </label>
                          <textarea
                            value={reviewData.keterangan}
                            onChange={(e) => setReviewData(prev => ({ ...prev, keterangan: e.target.value }))}
                            rows="4"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid #ced4da',
                              borderRadius: '4px',
                              fontSize: '1rem',
                              resize: 'vertical'
                            }}
                            placeholder="Jelaskan alasan penolakan (contoh: dokumen tidak jelas, skor tidak valid, dll)"
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}>
                      <button
                        onClick={() => setSelectedPengajuan(null)}
                        disabled={submitting}
                        style={{
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500'
                        }}
                      >
                        Batal
                      </button>
                      
                      <button
                        onClick={handleReview}
                        disabled={submitting || !reviewData.status}
                        style={{
                          backgroundColor: submitting || !reviewData.status ? '#6c757d' : '#B6252A',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: submitting || !reviewData.status ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500'
                        }}
                      >
                        {submitting ? 'Menyimpan...' : 'Simpan Review'}
                      </button>
                    </div>
                  </>
                )}

                {/* Read-only info untuk status yang sudah diproses */}
                {selectedPengajuan.status !== 'Pending' && (
                  <div style={{
                    backgroundColor: selectedPengajuan.status === 'Disetujui' ? '#d4edda' : '#f8d7da',
                    color: selectedPengajuan.status === 'Disetujui' ? '#155724' : '#721c24',
                    padding: '1rem',
                    borderRadius: '6px',
                    border: `1px solid ${selectedPengajuan.status === 'Disetujui' ? '#c3e6cb' : '#f5c6cb'}`,
                    textAlign: 'center'
                  }}>
                    <strong>
                      Pengajuan telah {selectedPengajuan.status === 'Disetujui' ? 'disetujui' : 'ditolak'}
                    </strong>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                      Status pengajuan sudah final dan tidak dapat diubah
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}