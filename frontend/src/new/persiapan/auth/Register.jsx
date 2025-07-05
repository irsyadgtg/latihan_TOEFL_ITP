import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../shared/services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    username: '',
    nik: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error ketika user mulai mengetik
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage('');
    setSuccess(false);

    console.log('Mengirim data registrasi:', formData);

    try {
      const response = await api.post('/register', formData);
      
      console.log('Registrasi berhasil:', response.data);
      
      setSuccess(true);
      setMessage(response.data.message || 'Registrasi berhasil. Silakan cek email untuk verifikasi.');
      
      // Reset form setelah berhasil
      setFormData({
        namaLengkap: '',
        username: '',
        nik: '',
        email: '',
        password: '',
        password_confirmation: ''
      });

      // Redirect ke login setelah 5 detik
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (error) {
      console.error('Error registrasi:', error.response?.data);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage(error.response?.data?.message || 'Terjadi kesalahan saat mendaftar');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Left Panel - Success Message */}
        <div style={{
          flex: 1,
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            {/* Logo/Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#dc2626',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>T</span>
              </div>
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827',
                  lineHeight: '1.2'
                }}>Telkom University</div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.2'
                }}>LANGUAGE CENTER</div>
              </div>
            </div>

            {/* Success Content */}
            <div style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                color: '#16a34a',
                fontSize: '24px',
                fontWeight: '700',
                margin: '0 0 1rem 0'
              }}>
                Pendaftaran Berhasil!
              </h2>
              <p style={{
                color: '#16a34a',
                fontSize: '16px',
                margin: '0 0 1.5rem 0'
              }}>
                {message}
              </p>
              
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  color: '#856404',
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 1rem 0'
                }}>
                  Langkah Selanjutnya:
                </p>
                <div style={{
                  color: '#856404',
                  fontSize: '14px',
                  textAlign: 'left',
                  lineHeight: '1.6'
                }}>
                  1. Buka email Anda dan klik link verifikasi<br/>
                  2. Setelah verifikasi, Anda dapat login ke sistem<br/>
                  3. Mulai belajar TOEFL ITP dengan materi lengkap
                </div>
              </div>
              
              <div style={{
                fontSize: '14px',
                color: '#16a34a',
                marginBottom: '1rem'
              }}>
                Mengalihkan ke halaman login dalam 5 detik...
              </div>
              
              <button
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: '#eab308',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Langsung ke Login
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Red Background */}
        <div style={{
          flex: 1,
          backgroundColor: '#dc2626'
        }} />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Left Panel - Registration Form */}
      <div style={{
        flex: 1,
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        overflowY: 'auto'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px'
        }}>
          {/* Logo/Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#dc2626',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <span style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>T</span>
            </div>
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                lineHeight: '1.2'
              }}>Telkom University</div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.2'
              }}>LANGUAGE CENTER</div>
            </div>
          </div>

          {/* Info Text */}
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>Silahkan ikuti langkah berikut untuk mendaftarkan akun Anda.</p>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '2rem'
          }}>Registrasi</h2>

          {/* Error Message */}
          {message && !success && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <span style={{
                color: '#dc2626',
                fontSize: '14px'
              }}>{message}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            
            {/* Nama Lengkap */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                name="namaLengkap"
                value={formData.namaLengkap}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.namaLengkap ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
                required
              />
              {errors.namaLengkap && (
                <small style={{
                  color: '#dc2626',
                  fontSize: '12px',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {errors.namaLengkap[0]}
                </small>
              )}
            </div>

            {/* Username */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan username"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.username ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
                required
              />
              {errors.username && (
                <small style={{
                  color: '#dc2626',
                  fontSize: '12px',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {errors.username[0]}
                </small>
              )}
            </div>

            {/* NIK */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                name="nik"
                value={formData.nik}
                onChange={handleChange}
                placeholder="Masukkan NIK (16 digit)"
                maxLength="16"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.nik ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
                required
              />
              {errors.nik && (
                <small style={{
                  color: '#dc2626',
                  fontSize: '12px',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {errors.nik[0]}
                </small>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan E-mail"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
                required
              />
              {errors.email && (
                <small style={{
                  color: '#dc2626',
                  fontSize: '12px',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {errors.email[0]}
                </small>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan kata sandi"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.password ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
                required
              />
              {errors.password && (
                <small style={{
                  color: '#dc2626',
                  fontSize: '12px',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {errors.password[0]}
                </small>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div style={{ marginBottom: '2rem' }}>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Masukkan konfirmasi kata sandi"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.password_confirmation ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
                required
              />
              {errors.password_confirmation && (
                <small style={{
                  color: '#dc2626',
                  fontSize: '12px',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {errors.password_confirmation[0]}
                </small>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: loading ? '#9ca3af' : '#eab308',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {loading ? 'Mendaftarkan...' : 'Daftar'}
            </button>
          </form>

          {/* Login Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '2rem'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Sudah punya akun? 
            </span>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '14px',
                textDecoration: 'underline',
                cursor: 'pointer',
                marginLeft: '4px',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              Masuk
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Red Background */}
      <div style={{
        flex: 1,
        backgroundColor: '#dc2626'
      }} />
    </div>
  );
}