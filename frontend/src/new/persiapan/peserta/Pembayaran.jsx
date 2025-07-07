import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Package,
  CreditCard,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Crown,
  FileText,
  DollarSign,
  Calendar
} from 'lucide-react';
import api from '../../shared/services/api';

const Pembayaran = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [paketDetail, setPaketDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: Info, 2: Upload, 3: Success
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    loadPaketDetail();
  }, [id]);

  const loadPaketDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/paket/${id}/beli`);
      setPaketDetail(response.data);
    } catch (error) {
      console.error('Error loading paket detail:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Gagal memuat detail paket');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPaketIcon = (namaPaket) => {
    if (namaPaket && namaPaket.toLowerCase().includes('premium')) {
      return <Crown size={32} style={{ color: '#D4A574' }} />;
    }
    return <Package size={32} style={{ color: '#B6252A' }} />;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('File harus berupa gambar (JPG, PNG) atau PDF');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }

      setUploadedFile(file);
      setError('');
    }
  };

  const handleSubmitPembayaran = async () => {
    if (!uploadedFile) {
      setError('Harap upload bukti pembayaran terlebih dahulu');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('buktiPembayaran', uploadedFile);

      await api.post(`/paket/${id}/beli`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Pembayaran berhasil disubmit! Menunggu verifikasi admin.');
      setStep(3);

    } catch (error) {
      console.error('Error submitting payment:', error);
      setError(error.response?.data?.message || 'Gagal mengupload bukti pembayaran');
    } finally {
      setSubmitting(false);
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
            Memuat detail pembayaran...
          </div>
        </div>
      </div>
    );
  }

  if (error && !paketDetail) {
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
            onClick={() => navigate('/paket-kursus')}
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
            Pembayaran Paket Kursus
          </h1>
        </div>

        {/* Error Message */}
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '0.5rem' 
          }}>
            Tidak Dapat Melanjutkan Pembayaran
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/paket-kursus')}
            style={{
              backgroundColor: '#B6252A',
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
            Kembali ke Paket Kursus
          </button>
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
          onClick={() => navigate('/paket-kursus')}
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
          Pembayaran Paket Kursus
        </h1>
      </div>

      {/* Progress Steps */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: step >= 1 ? '#D4A574' : '#6c757d'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: step >= 1 ? '#D4A574' : '#e9ecef',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              1
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Info Pembayaran</span>
          </div>

          <div style={{
            width: '40px',
            height: '2px',
            backgroundColor: step >= 2 ? '#D4A574' : '#e9ecef'
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: step >= 2 ? '#D4A574' : '#6c757d'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: step >= 2 ? '#D4A574' : '#e9ecef',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              2
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Upload Bukti</span>
          </div>

          <div style={{
            width: '40px',
            height: '2px',
            backgroundColor: step >= 3 ? '#D4A574' : '#e9ecef'
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: step >= 3 ? '#D4A574' : '#6c757d'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: step >= 3 ? '#D4A574' : '#e9ecef',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              3
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Selesai</span>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
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

      {success && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '6px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Step 1: Info Pembayaran */}
      {step === 1 && paketDetail && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem'
        }}>
          {/* Paket Detail */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              background: paketDetail.namaPaket && paketDetail.namaPaket.toLowerCase().includes('premium') 
                ? 'linear-gradient(135deg, #D4A574 0%, #B8956A 100%)'
                : 'linear-gradient(135deg, #B6252A 0%, #A21E23 100%)',
              color: 'white',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                {getPaketIcon(paketDetail.namaPaket)}
              </div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0' 
              }}>
                {paketDetail.namaPaket}
              </h3>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700',
                marginBottom: '0.25rem'
              }}>
                {formatCurrency(paketDetail.harga)}
              </div>
              <div style={{ 
                fontSize: '14px', 
                opacity: 0.9 
              }}>
                Masa berlaku {paketDetail.masaBerlaku} hari
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem' }}>
              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
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
                    {paketDetail.totalPengguna || 0}
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
                    {paketDetail.masaBerlaku} hari
                  </div>
                </div>
              </div>

              {/* Fasilitas */}
              {paketDetail.fasilitas && (
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
                    {paketDetail.fasilitas}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Instructions */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <CreditCard size={24} style={{ color: '#B6252A' }} />
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#2c3e50', 
                margin: 0 
              }}>
                Instruksi Pembayaran
              </h3>
            </div>

            {/* Bank Information */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#2c3e50', 
                marginBottom: '1rem' 
              }}>
                Transfer ke Rekening:
              </h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6c757d', 
                  marginBottom: '0.25rem' 
                }}>
                  Bank:
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#2c3e50' 
                }}>
                  Bank BCA
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6c757d', 
                  marginBottom: '0.25rem' 
                }}>
                  Nomor Rekening:
                </div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: '#B6252A',
                  fontFamily: 'monospace'
                }}>
                  1234567890
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6c757d', 
                  marginBottom: '0.25rem' 
                }}>
                  Atas Nama:
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#2c3e50' 
                }}>
                  PT. LMS TOEFL ITP
                </div>
              </div>

              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                padding: '1rem',
                borderRadius: '6px',
                marginTop: '1rem'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#856404',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Jumlah Transfer:
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#B6252A' 
                }}>
                  {formatCurrency(paketDetail.harga)}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              backgroundColor: '#e3f2fd',
              border: '1px solid #bbdefb',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#1976d2', 
                marginBottom: '0.5rem' 
              }}>
                Langkah-langkah:
              </h4>
              <ol style={{ 
                color: '#1976d2', 
                fontSize: '14px',
                paddingLeft: '1rem',
                margin: 0
              }}>
                <li style={{ marginBottom: '0.25rem' }}>
                  Transfer ke rekening di atas
                </li>
                <li style={{ marginBottom: '0.25rem' }}>
                  Simpan bukti transfer
                </li>
                <li style={{ marginBottom: '0.25rem' }}>
                  Upload bukti pembayaran
                </li>
                <li>
                  Tunggu verifikasi admin (1x24 jam)
                </li>
              </ol>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                backgroundColor: '#D4A574',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              <Upload size={16} />
              Lanjutkan ke Upload Bukti
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Upload Bukti */}
      {step === 2 && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          padding: '2rem'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <Upload size={48} style={{ color: '#D4A574', marginBottom: '1rem' }} />
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#2c3e50', 
              marginBottom: '0.5rem' 
            }}>
              Upload Bukti Pembayaran
            </h3>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>
              Upload bukti transfer atau screenshot pembayaran Anda
            </p>
          </div>

          {/* File Upload */}
          <div style={{
            border: '2px dashed #e9ecef',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            backgroundColor: uploadedFile ? '#f8f9fa' : 'transparent'
          }}>
            <input
              type="file"
              id="buktiPembayaran"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            
            {!uploadedFile ? (
              <>
                <FileText size={32} style={{ color: '#6c757d', marginBottom: '1rem' }} />
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor="buktiPembayaran"
                    style={{
                      backgroundColor: '#D4A574',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'inline-block',
                      fontFamily: "'Poppins', sans-serif"
                    }}
                  >
                    Pilih File
                  </label>
                </div>
                <p style={{ color: '#6c757d', fontSize: '12px', margin: 0 }}>
                  Format: JPG, PNG, PDF (Maksimal 5MB)
                </p>
              </>
            ) : (
              <>
                <CheckCircle size={32} style={{ color: '#28a745', marginBottom: '1rem' }} />
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#2c3e50',
                    marginBottom: '0.25rem'
                  }}>
                    File berhasil dipilih:
                  </div>
                  <div style={{ fontSize: '14px', color: '#6c757d' }}>
                    {uploadedFile.name}
                  </div>
                </div>
                <label
                  htmlFor="buktiPembayaran"
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-block',
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  Ganti File
                </label>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                backgroundColor: 'white',
                color: '#6c757d',
                border: '1px solid #e9ecef',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Kembali
            </button>
            
            <button
              onClick={handleSubmitPembayaran}
              disabled={!uploadedFile || submitting}
              style={{
                flex: 2,
                backgroundColor: (!uploadedFile || submitting) ? '#e9ecef' : '#D4A574',
                color: (!uploadedFile || submitting) ? '#6c757d' : 'white',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (!uploadedFile || submitting) ? 'not-allowed' : 'pointer',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              {submitting ? 'Mengupload...' : 'Submit Pembayaran'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <CheckCircle size={64} style={{ color: '#28a745', marginBottom: '1.5rem' }} />
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#2c3e50', 
            marginBottom: '1rem' 
          }}>
            Pembayaran Berhasil Disubmit!
          </h3>
          <p style={{ 
            color: '#6c757d', 
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            Terima kasih! Bukti pembayaran Anda telah berhasil diupload. 
            Admin akan memverifikasi pembayaran dalam waktu 1x24 jam. 
            Anda akan mendapat notifikasi setelah pembayaran diverifikasi.
          </p>

          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '2rem',
            fontSize: '14px',
            color: '#856404'
          }}>
            <strong>Catatan:</strong> Anda dapat melihat status pembayaran di menu "Riwayat Pembayaran"
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/riwayat-pembayaran')}
              style={{
                backgroundColor: '#D4A574',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Lihat Riwayat Pembayaran
            </button>
            
            <button
              onClick={() => navigate('/paket-kursus')}
              style={{
                backgroundColor: 'white',
                color: '#6c757d',
                border: '1px solid #e9ecef',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Kembali ke Paket Kursus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pembayaran;