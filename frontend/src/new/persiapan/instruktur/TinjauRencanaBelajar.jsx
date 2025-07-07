import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, BookOpen, Calendar, Search, Filter, Eye, MessageSquare, X } from 'lucide-react';
import api from '../../shared/services/api';

export default function TinjauRencanaBelajar() {
  const [pengajuanList, setPengajuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    selectedSkills: [],
    feedback: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    total: 0
  });

  const token = localStorage.getItem('token');

  // FIXED: Fetch pengajuan list - BACKEND RESPONSE STRUCTURE FIXED
  const fetchPengajuan = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pengajuan-rencana-belajar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // BACKEND RESPONSE: response.data.pengajuan (array langsung, bukan nested)
      const pengajuanData = response.data.pengajuan || response.data || [];
      setPengajuanList(pengajuanData);
      
      // Calculate stats berdasarkan status backend yang benar
      const pending = pengajuanData.filter(item => item.status === 'pending').length;
      const approved = pengajuanData.filter(item => item.status === 'sudah ada feedback').length;
      
      setStats({
        pending,
        approved,
        total: pengajuanData.length
      });
      
    } catch (error) {
      console.error('Error fetching pengajuan:', error);
      // IMPROVED ERROR HANDLING
      if (error.response?.status === 500) {
        console.error('Server error details:', error.response?.data);
        alert('Terjadi kesalahan server. Silakan coba lagi atau hubungi administrator.');
      } else if (error.response?.status === 403) {
        alert('Akses ditolak. Pastikan Anda login sebagai instruktur.');
      } else {
        alert('Gagal memuat data pengajuan: ' + (error.response?.data?.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch detail pengajuan + all skills - BACKEND RESPONSE MAPPING FIXED
  const fetchDetailPengajuan = async (idPengajuan) => {
    setLoadingDetail(true);
    try {
      const response = await api.get(`/pengajuan-rencana-belajar/${idPengajuan}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const detailData = response.data;
      setSelectedPengajuan(detailData);
      setAllSkills(detailData.daftar_skill || []);
      
      // Reset feedback form
      setFeedbackData({
        selectedSkills: [],
        feedback: ''
      });
      
    } catch (error) {
      console.error('Error fetching detail pengajuan:', error);
      alert('Gagal memuat detail pengajuan: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle skill selection - MISSING FUNCTION ADDED
  const handleSkillSelection = (skillId) => {
    setFeedbackData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skillId)
        ? prev.selectedSkills.filter(id => id !== skillId)
        : [...prev.selectedSkills, skillId]
    }));
  };

  // Handle feedback submission - BACKEND FORMAT SESUAI API
  const handleSubmitFeedback = async () => {
    if (feedbackData.selectedSkills.length === 0) {
      alert('Pilih minimal satu skill untuk feedback');
      return;
    }

    setSubmitting(true);
    try {
      // Format sesuai backend expectation dari postman
      const submitData = {
        detail: feedbackData.selectedSkills.map(skillId => ({ skill_id: skillId }))
      };

      await api.post(`/pengajuan-rencana-belajar/${selectedPengajuan.id}/feedback`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Feedback berhasil disimpan!');
      
      // Refresh list dan tutup modal
      fetchPengajuan();
      setSelectedPengajuan(null);
      setFeedbackData({ selectedSkills: [], feedback: '' });
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Gagal menyimpan feedback: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and search logic - FIELD MAPPING FIXED
  const filteredData = pengajuanList.filter(item => {
    let matchesFilter = false;
    
    if (filter === 'all') {
      matchesFilter = true;
    } else if (filter === 'pending') {
      matchesFilter = item.status === 'pending';
    } else if (filter === 'approved') {
      matchesFilter = item.status === 'sudah ada feedback';
    }
    
    // BACKEND FIELDS: nama_peserta, email_peserta dari response
    const matchesSearch = 
      item.nama_peserta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email_peserta?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { color: '#ffc107', bg: '#fff3cd', label: 'Menunggu Review', icon: Clock },
      'sudah ada feedback': { color: '#28a745', bg: '#d4edda', label: 'Sudah Ada Feedback', icon: CheckCircle },
      'selesai': { color: '#17a2b8', bg: '#d1ecf1', label: 'Selesai', icon: CheckCircle }
    };
    return badges[status] || badges['pending'];
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

  const getFilteredSkills = (category = 'all') => {
    if (category === 'all') return allSkills;
    return allSkills.filter(skill => skill.kategori === category);
  };

  const getSkillCategories = () => {
    const categories = [...new Set(allSkills.map(skill => skill.kategori))];
    return categories;
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
          Tinjau Rencana Belajar
        </h1>
        <p style={{ 
          margin: '0',
          color: '#6c757d',
          fontSize: '1.1rem'
        }}>
          Review dan berikan feedback untuk rencana belajar peserta
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
          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Menunggu Review</div>
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
          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Sudah Ada Feedback</div>
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
              { key: 'pending', label: 'Menunggu Review' },
              { key: 'approved', label: 'Sudah Ada Feedback' }
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
            Daftar Pengajuan Rencana Belajar ({filteredData.length})
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
            <BookOpen size={48} color="#dee2e6" style={{ marginBottom: '1rem' }} />
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
                    backgroundColor: item.status === 'sudah ada feedback' ? '#f8fff8' : 'white'
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
                        {item.nama_peserta}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        color: '#6c757d',
                        fontSize: '0.9rem',
                        flexWrap: 'wrap'
                      }}>
                        <span><strong>Email:</strong> {item.email_peserta}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={14} />
                          {formatDate(item.tglPengajuan)}
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
                    
                    {/* View Details & Give Feedback */}
                    <button
                      onClick={() => fetchDetailPengajuan(item.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#B6252A',
                        backgroundColor: 'transparent',
                        border: '1px solid #B6252A',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}
                    >
                      <Eye size={14} />
                      {item.status === 'pending' ? 'Berikan Feedback' : 'Lihat Detail'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
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
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                color: '#495057'
              }}>
                {selectedPengajuan.status === 'pending' ? 'Berikan Feedback' : 'Detail'} Rencana Belajar
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
                {/* Pengajuan Summary */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1.5rem',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: '600' }}>
                    {selectedPengajuan.peserta?.nama}
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong>Target Skor:</strong> {selectedPengajuan.target_skor}
                    </div>
                    <div>
                      <strong>Target Waktu:</strong> {selectedPengajuan.target_waktu}
                    </div>
                    <div>
                      <strong>Frekuensi:</strong> {selectedPengajuan.frekuensi_mingguan} hari/minggu
                    </div>
                    <div>
                      <strong>Durasi:</strong> {selectedPengajuan.durasi_harian}
                    </div>
                  </div>

                  {/* Skills yang Dipilih Peserta */}
                  <div>
                    <strong style={{ marginBottom: '0.5rem', display: 'block' }}>
                      Skills yang Dipilih Peserta ({selectedPengajuan.detail_pengajuan?.length || 0}):
                    </strong>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {selectedPengajuan.detail_pengajuan?.map(detail => (
                        <span
                          key={detail.id_detail_pengajuan}
                          style={{
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}
                        >
                          {detail.skill.deskripsi} ({detail.kategori})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              {/* Feedback Section - Only for pending - TANPA FILTER & TOMBOL PILIH/HAPUS SEMUA */}
                {selectedPengajuan.status === 'pending' && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{
                      margin: '0 0 1rem 0',
                      color: '#495057',
                      fontSize: '1.1rem'
                    }}>
                      Pilih Skills untuk Feedback ({feedbackData.selectedSkills.length} dipilih)
                    </h4>

                    {/* Skills Info */}
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '6px',
                      border: '1px solid #bbdefb',
                      marginBottom: '1.5rem',
                      fontSize: '0.9rem',
                      color: '#1565c0'
                    }}>
                      <strong>Instruksi:</strong> Pilih skills yang sesuai untuk peserta ini berdasarkan target dan kemampuan mereka. 
                      Skills yang dipilih akan membuka unit pembelajaran yang sesuai.
                    </div>

                    {/* Skills Selection Grid - TANPA FILTER DAN QUICK ACTIONS */}
                    <div style={{
                      border: '1px solid #ced4da',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                      padding: '1rem'
                    }}>
                      
                      {/* Skills Info - TANPA QUICK ACTIONS */}
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#495057',
                        textAlign: 'center'
                      }}>
                        Skills Tersedia: {allSkills.length} | Terpilih: {feedbackData.selectedSkills.length}
                      </div>

                      {/* Skills Grid - SEMUA SKILLS TANPA FILTER */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1rem',
                        maxHeight: '500px',
                        overflowY: 'auto'
                      }}>
                        {allSkills.map(skill => (
                          <label
                            key={skill.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '1rem',
                              padding: '1.25rem',
                              backgroundColor: feedbackData.selectedSkills.includes(skill.id) ? '#fff3cd' : 'white',
                              borderRadius: '8px',
                              border: feedbackData.selectedSkills.includes(skill.id) ? '2px solid #B6252A' : '1px solid #dee2e6',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: feedbackData.selectedSkills.includes(skill.id) ? '0 4px 8px rgba(182, 37, 42, 0.1)' : '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                              if (!feedbackData.selectedSkills.includes(skill.id)) {
                                e.currentTarget.style.backgroundColor = '#f0f8ff';
                                e.currentTarget.style.borderColor = '#B6252A';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!feedbackData.selectedSkills.includes(skill.id)) {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#dee2e6';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={feedbackData.selectedSkills.includes(skill.id)}
                              onChange={() => handleSkillSelection(skill.id)}
                              style={{
                                marginTop: '0.25rem',
                                transform: 'scale(1.3)',
                                accentColor: '#B6252A'
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              
                              {/* Skill Name */}
                              <div style={{
                                fontWeight: '700',
                                color: feedbackData.selectedSkills.includes(skill.id) ? '#B6252A' : '#495057',
                                marginBottom: '0.5rem',
                                fontSize: '0.95rem',
                                lineHeight: '1.3'
                              }}>
                                {skill.skill}
                              </div>
                              
                              {/* Skill Description */}
                              <div style={{
                                fontSize: '0.85rem',
                                color: '#6c757d',
                                lineHeight: '1.4',
                                marginBottom: '0.75rem'
                              }}>
                                {skill.deskripsi}
                              </div>
                              
                              {/* Module Badge */}
                              <div style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#B6252A',
                                backgroundColor: skill.kategori === 'Listening Comprehension' ? '#e8f5e8' :
                                               skill.kategori === 'Structure and Written Expression' ? '#fff3cd' :
                                               '#e3f2fd',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                display: 'inline-block',
                                border: '1px solid #dee2e6'
                              }}>
                                {skill.kategori === 'Listening Comprehension' ? 'LISTENING' :
                                 skill.kategori === 'Structure and Written Expression' ? 'STRUCTURE' :
                                 'READING'}
                              </div>
                              
                            </div>
                          </label>
                        ))}
                      </div>
                      
                      {allSkills.length === 0 && (
                        <div style={{
                          padding: '2rem',
                          textAlign: 'center',
                          color: '#6c757d'
                        }}>
                          <p style={{ margin: 0, fontSize: '1rem' }}>
                            Tidak ada skills tersedia untuk feedback
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Feedback Summary */}
                    {feedbackData.selectedSkills.length > 0 && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: '#d4edda',
                        borderRadius: '6px',
                        border: '1px solid #c3e6cb',
                        fontSize: '0.9rem',
                        color: '#155724'
                      }}>
                        <strong>Ringkasan Feedback:</strong> {feedbackData.selectedSkills.length} skills dipilih untuk peserta ini. 
                        Skills ini akan membuka unit pembelajaran yang sesuai dan memandu focus belajar peserta.
                      </div>
                    )}
                  </div>
                )}
                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <button
                    onClick={() => setSelectedPengajuan(null)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}
                  >
                    Tutup
                  </button>
                  
                  {selectedPengajuan.status === 'pending' && (
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submitting || feedbackData.selectedSkills.length === 0}
                      style={{
                        backgroundColor: submitting || feedbackData.selectedSkills.length === 0 ? '#6c757d' : '#B6252A',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: submitting || feedbackData.selectedSkills.length === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500'
                      }}
                    >
                      {submitting ? 'Menyimpan...' : `Simpan Feedback (${feedbackData.selectedSkills.length} skills)`}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}