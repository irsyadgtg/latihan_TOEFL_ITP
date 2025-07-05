import React, { useState, useEffect } from 'react';
import { Upload, FileText, Calendar, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import api from '../../shared/services/api';

export default function PengajuanSkorAwal() {
  const [formData, setFormData] = useState({
    namaTes: '',
    skor: '',
    urlDokumenPendukung: null,
    masaBerlakuDokumen: '',
    keterangan: ''
  });
  const [pengajuanList, setPengajuanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch existing pengajuan
  const fetchPengajuan = async () => {
    setLoadingList(true);
    try {
      const response = await api.get('/pengajuan-skor-awal', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPengajuanList(response.data.riwayat || []);
    } catch (error) {
      console.error('Error fetching pengajuan:', error);
    } finally {
      setLoadingList(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          urlDokumenPendukung: 'Format file harus PDF, JPG, JPEG, atau PNG'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          urlDokumenPendukung: 'Ukuran file maksimal 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        urlDokumenPendukung: file
      }));

      setErrors(prev => ({
        ...prev,
        urlDokumenPendukung: ''
      }));
    }
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    // Client-side validation
    if (!formData.namaTes || !formData.skor || !formData.masaBerlakuDokumen || !formData.urlDokumenPendukung) {
      setErrors({
        general: 'Semua field wajib diisi'
      });
      setLoading(false);
      return;
    }

    const submitData = new FormData();
    submitData.append('namaTes', formData.namaTes);
    submitData.append('skor', formData.skor);
    submitData.append('masaBerlakuDokumen', formData.masaBerlakuDokumen);
    submitData.append('keterangan', formData.keterangan);
    
    // PERBAIKAN: sesuaikan dengan backend expectation
    if (formData.urlDokumenPendukung) {
      submitData.append('dokumenPendukung', formData.urlDokumenPendukung);
    }

    try {
      const response = await api.post('/pengajuan-skor-awal', submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Pengajuan skor awal berhasil disubmit. Menunggu review admin.');
      
      // Reset form
      setFormData({
        namaTes: '',
        skor: '',
        urlDokumenPendukung: null,
        masaBerlakuDokumen: '',
        keterangan: ''
      });
      
      // Clear file input
      const fileInput = document.getElementById('dokumen-upload');
      if (fileInput) fileInput.value = '';

      setShowForm(false);
      fetchPengajuan(); // Refresh list

    } catch (error) {
      console.error('Error submitting pengajuan:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || 'Terjadi kesalahan saat mengajukan skor awal'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': { color: '#ffc107', bg: '#fff3cd', label: 'Menunggu Review' },
      'Disetujui': { color: '#28a745', bg: '#d4edda', label: 'Disetujui' },
      'Ditolak': { color: '#dc3545', bg: '#f8d7da', label: 'Ditolak' }
    };
    return badges[status] || badges['Pending'];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
          Pengajuan Skor Awal
        </h1>
        <p style={{ 
          margin: '0',
          color: '#6c757d',
          fontSize: '1.1rem'
        }}>
          Submit skor TOEFL/IELTS yang sudah dimiliki untuk assessment awal
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              backgroundColor: showForm ? '#6c757d' : '#B6252A',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {showForm ? <X size={18} /> : <FileText size={18} />}
            {showForm ? 'Tutup Form' : 'Ajukan Skor Baru'}
          </button>
        </div>

        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          border: '1px solid #bbdefb',
          fontSize: '0.9rem',
          color: '#1565c0'
        }}>
          <strong>Info:</strong> Skor yang disetujui akan digunakan sebagai baseline untuk rencana belajar
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '6px',
          border: '1px solid #c3e6cb',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '6px',
          border: '1px solid #f5c6cb',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={20} />
          {errors.general}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{
            margin: '0 0 1.5rem 0',
            color: '#495057',
            fontSize: '1.5rem'
          }}>
            Form Pengajuan Skor Awal
          </h3>

          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              
              {/* Nama Tes */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Nama Tes *
                </label>
                <select
                  name="namaTes"
                  value={formData.namaTes}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.namaTes ? '2px solid #dc3545' : '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Pilih jenis tes</option>
                  <option value="TOEFL ITP">TOEFL ITP</option>
                  <option value="TOEFL iBT">TOEFL iBT</option>
                  <option value="IELTS Academic">IELTS Academic</option>
                  <option value="IELTS General">IELTS General</option>
                  <option value="PTE Academic">PTE Academic</option>
                  <option value="EPrT">EPrT</option>
                </select>
                {errors.namaTes && (
                  <small style={{ color: '#dc3545', fontSize: '0.875rem' }}>
                    {errors.namaTes[0]}
                  </small>
                )}
              </div>

              {/* Skor */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Skor *
                </label>
                <input
                  type="number"
                  name="skor"
                  value={formData.skor}
                  onChange={handleChange}
                  min="0"
                  max="990"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.skor ? '2px solid #dc3545' : '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="Contoh: 450"
                />
                {errors.skor && (
                  <small style={{ color: '#dc3545', fontSize: '0.875rem' }}>
                    {errors.skor[0]}
                  </small>
                )}
              </div>

              {/* Masa Berlaku */}
              <div>
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
                  name="masaBerlakuDokumen"
                  value={formData.masaBerlakuDokumen}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.masaBerlakuDokumen ? '2px solid #dc3545' : '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
                {errors.masaBerlakuDokumen && (
                  <small style={{ color: '#dc3545', fontSize: '0.875rem' }}>
                    {errors.masaBerlakuDokumen[0]}
                  </small>
                )}
              </div>
            </div>

            {/* Upload Dokumen */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#495057'
              }}>
                Dokumen Pendukung *
              </label>
              <div style={{
                border: errors.urlDokumenPendukung ? '2px dashed #dc3545' : '2px dashed #ced4da',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f8f9fa'
              }}>
                <Upload size={48} color="#6c757d" style={{ margin: '0 auto 1rem' }} />
                <p style={{ margin: '0 0 1rem 0', color: '#6c757d' }}>
                  Drag & drop file atau klik untuk upload
                </p>
                <input
                  type="file"
                  id="dokumen-upload"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  required
                />
                <label 
                  htmlFor="dokumen-upload"
                  style={{
                    backgroundColor: '#B6252A',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    border: 'none'
                  }}
                >
                  Pilih File
                </label>
                <p style={{ 
                  margin: '1rem 0 0 0', 
                  fontSize: '0.8rem', 
                  color: '#6c757d' 
                }}>
                  Format: PDF, JPG, JPEG, PNG (Max 5MB)
                </p>
                
                {formData.urlDokumenPendukung && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem',
                    backgroundColor: '#d4edda',
                    borderRadius: '4px',
                    color: '#155724'
                  }}>
                    File terpilih: {formData.urlDokumenPendukung.name}
                  </div>
                )}
              </div>
              {errors.urlDokumenPendukung && (
                <small style={{ color: '#dc3545', fontSize: '0.875rem' }}>
                  {errors.urlDokumenPendukung}
                </small>
              )}
            </div>

            {/* Keterangan */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#495057'
              }}>
                Keterangan (Opsional)
              </label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows="4"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Tambahan informasi tentang hasil tes (opsional)"
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#6c757d' : '#B6252A',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Mengajukan...' : 'Submit Pengajuan'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            Riwayat Pengajuan Skor Awal
          </h3>
        </div>

        {loadingList ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            Memuat data pengajuan...
          </div>
        ) : pengajuanList.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <FileText size={48} color="#dee2e6" style={{ marginBottom: '1rem' }} />
            <p style={{ margin: 0, fontSize: '1.1rem' }}>
              Belum ada pengajuan skor awal
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Klik tombol "Ajukan Skor Baru" untuk membuat pengajuan pertama
            </p>
          </div>
        ) : (
          <div style={{ padding: '1.5rem' }}>
            {pengajuanList.map((item, index) => {
              const statusBadge = getStatusBadge(item.status);
              
              return (
                <div
                  key={item.idPengajuanSkorAwal}
                  style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: index < pengajuanList.length - 1 ? '1rem' : 0,
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
                    <div>
                      <h4 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.1rem',
                        color: '#495057'
                      }}>
                        {item.namaTes} - Skor {item.skor}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#6c757d',
                        fontSize: '0.9rem'
                      }}>
                        <Calendar size={16} />
                        Diajukan: {formatDate(item.tglPengajuan || item.created_at)}
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
                        border: `1px solid ${statusBadge.color}30`
                      }}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <strong style={{ color: '#495057' }}>Masa Berlaku:</strong>
                      <br />
                      <span style={{ color: '#6c757d' }}>
                        {item.masaBerlakuDokumen ? formatDate(item.masaBerlakuDokumen) : 'Belum diset'}
                      </span>
                    </div>

                    {item.tglSeleksi && (
                      <div>
                        <strong style={{ color: '#495057' }}>Tanggal Review:</strong>
                        <br />
                        <span style={{ color: '#6c757d' }}>
                          {formatDate(item.tglSeleksi)}
                        </span>
                      </div>
                    )}
                  </div>

                  {item.keterangan && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: '#495057' }}>Keterangan:</strong>
                      <br />
                      <span style={{ color: '#6c757d' }}>{item.keterangan}</span>
                    </div>
                  )}

                  {item.urlDokumenPendukung && (
                    <div>
                      <a
                        href={`http://localhost:8000/storage/${item.urlDokumenPendukung}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#B6252A',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        <FileText size={16} />
                        Lihat Dokumen
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}