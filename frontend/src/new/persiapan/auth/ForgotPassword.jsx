import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../../shared/services/api';

export default function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState('request');
  const [requestData, setRequestData] = useState({ email: '' });
  const [resetData, setResetData] = useState({
    token: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token && email) {
      setCurrentStep('reset');
      setResetData(prev => ({
        ...prev,
        token: token,
        email: email
      }));
    }
  }, [searchParams]);

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (message) setMessage('');
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (message) setMessage('');
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage('');
    setSuccess(false);

    try {
      const { data } = await api.post('/forgot-password', requestData);
      setSuccess(true);
      setMessage(data.message);
      setRequestData({ email: '' });
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.status === 400) {
        setMessage(error.response.data.message || 'Email tidak ditemukan atau belum terdaftar.');
      } else if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        setMessage('Validasi gagal. Periksa format email Anda.');
      } else if (error.response?.status >= 500) {
        setMessage('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
      } else if (!error.response) {
        setMessage('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setMessage('Terjadi kesalahan saat mengirim permintaan reset password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage('');
    setSuccess(false);

    try {
      const { data } = await api.post('/reset-password', resetData);
      setSuccess(true);
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      if (error.response?.status === 410) {
        setMessage('Link reset password sudah kadaluarsa atau tidak valid. Silakan minta link baru.');
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        setMessage('Validasi gagal. Periksa data yang Anda masukkan.');
      } else if (error.response?.status === 400) {
        setMessage(error.response.data.message || 'Gagal melakukan reset password. Token tidak valid.');
      } else if (error.response?.status >= 500) {
        setMessage('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
      } else if (!error.response) {
        setMessage('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setMessage('Terjadi kesalahan saat reset password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reusable styles
  const styles = {
    container: { display: 'flex', height: '100vh', fontFamily: "'Poppins', sans-serif" },
    leftPanel: { flex: 1, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
    rightPanel: { flex: 1, backgroundColor: '#B6252A' },
    form: { width: '100%', maxWidth: '400px' },
    logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' },
    logoIcon: { width: '40px', height: '40px', backgroundColor: '#B6252A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: '#f9fafb', outline: 'none', fontFamily: "'Poppins', sans-serif" },
    button: { width: '100%', padding: '0.875rem', backgroundColor: loading ? '#9ca3af' : '#EDC968', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Poppins', sans-serif" },
    error: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' },
    success: { backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '2rem', marginBottom: '2rem', textAlign: 'center' },
    warning: { backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }
  };

  if (success && currentStep === 'request') {
    return (
      <div style={styles.container}>
        <div style={styles.leftPanel}>
          <div style={{ ...styles.form, maxWidth: '500px', textAlign: 'center' }}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>T</span>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Telkom University</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>LANGUAGE CENTER</div>
              </div>
            </div>

            <div style={styles.success}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle size={24} style={{ color: '#16a34a', marginRight: '0.5rem' }} />
                <h2 style={{ color: '#16a34a', fontSize: '24px', fontWeight: '700', margin: 0 }}>Email Terkirim!</h2>
              </div>
              
              <p style={{ color: '#16a34a', fontSize: '16px', margin: '0 0 1.5rem 0' }}>{message}</p>
              
              <div style={styles.warning}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <Mail size={20} style={{ color: '#856404', marginRight: '0.5rem' }} />
                  <strong style={{ color: '#856404', fontSize: '16px' }}>Langkah Selanjutnya:</strong>
                </div>
                <div style={{ color: '#856404', fontSize: '14px', textAlign: 'left', lineHeight: '1.6' }}>
                  1. Buka email Anda<br/>
                  2. Klik link reset password dalam email<br/>
                  3. Masukkan password baru Anda<br/>
                  4. Login dengan password baru
                </div>
              </div>
              
              <button
                onClick={() => navigate('/login')}
                style={{ ...styles.button, backgroundColor: '#EDC968', width: 'auto', padding: '0.75rem 1.5rem' }}
              >
                Kembali ke Login
              </button>
            </div>
          </div>
        </div>
        <div style={styles.rightPanel} />
      </div>
    );
  }

  if (success && currentStep === 'reset') {
    return (
      <div style={styles.container}>
        <div style={styles.leftPanel}>
          <div style={{ ...styles.form, maxWidth: '500px', textAlign: 'center' }}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>T</span>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Telkom University</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>LANGUAGE CENTER</div>
              </div>
            </div>

            <div style={styles.success}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle size={24} style={{ color: '#16a34a', marginRight: '0.5rem' }} />
                <h2 style={{ color: '#16a34a', fontSize: '24px', fontWeight: '700', margin: 0 }}>Password Berhasil Diperbarui!</h2>
              </div>
              
              <p style={{ color: '#16a34a', fontSize: '16px', margin: '0 0 1.5rem 0' }}>{message}</p>
              
              <div style={{ fontSize: '14px', color: '#16a34a', marginBottom: '1rem' }}>
                Mengalihkan ke halaman login dalam 3 detik...
              </div>
              
              <button
                onClick={() => navigate('/login')}
                style={{ ...styles.button, backgroundColor: '#EDC968', width: 'auto', padding: '0.75rem 1.5rem' }}
              >
                Langsung ke Login
              </button>
            </div>
          </div>
        </div>
        <div style={styles.rightPanel} />
      </div>
    );
  }

  if (currentStep === 'request') {
    return (
      <div style={styles.container}>
        <div style={styles.leftPanel}>
          <div style={styles.form}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>T</span>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Telkom University</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>LANGUAGE CENTER</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Silahkan ikuti langkah berikut untuk melakukan reset password akun Anda.
              </p>
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
              Lupa Password
            </h2>
            
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2rem' }}>
              Masukkan email Anda untuk menerima link reset password.
            </p>

            {/* Error Message */}
            {message && !success && (
              <div style={styles.error}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <AlertCircle size={18} style={{ color: '#dc2626', marginRight: '0.5rem' }} />
                  <span style={{ color: '#dc2626', fontSize: '14px' }}>{message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleRequestSubmit}>
              <div style={{ marginBottom: '2rem' }}>
                <input
                  type="email"
                  name="email"
                  value={requestData.email}
                  onChange={handleRequestChange}
                  placeholder="Isikan Email"
                  style={{ ...styles.input, border: errors.email ? '1px solid #dc2626' : '1px solid #d1d5db' }}
                  required
                />
                {errors.email && (
                  <small style={{ color: '#dc2626', fontSize: '12px', marginTop: '0.25rem', display: 'block' }}>
                    {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                  </small>
                )}
              </div>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
                    Mengirim...
                  </>
                ) : (
                  'Verifikasi'
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Sudah punya akun? </span>
              <button
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
        <div style={styles.rightPanel} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.form}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>T</span>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Telkom University</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>LANGUAGE CENTER</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Silahkan ikuti langkah berikut untuk melakukan reset password akun Anda.
            </p>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            Reset Password
          </h2>
          
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2rem' }}>
            Masukkan password baru untuk akun: <strong>{resetData.email}</strong>
          </p>

          {/* Error Message */}
          {message && !success && (
            <div style={styles.error}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <AlertCircle size={18} style={{ color: '#dc2626', marginRight: '0.5rem' }} />
                <span style={{ color: '#dc2626', fontSize: '14px' }}>{message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleResetSubmit}>
            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={resetData.password}
                  onChange={handleResetChange}
                  placeholder="Isikan password baru"
                  style={{ ...styles.input, paddingRight: '3rem', border: errors.password ? '1px solid #dc2626' : '1px solid #d1d5db' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <small style={{ color: '#dc2626', fontSize: '12px', marginTop: '0.25rem', display: 'block' }}>
                  {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                </small>
              )}
            </div>

            {/* Password Confirmation */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  name="password_confirmation"
                  value={resetData.password_confirmation}
                  onChange={handleResetChange}
                  placeholder="Konfirmasi Password baru"
                  style={{ ...styles.input, paddingRight: '3rem', border: errors.password_confirmation ? '1px solid #dc2626' : '1px solid #d1d5db' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <small style={{ color: '#dc2626', fontSize: '12px', marginTop: '0.25rem', display: 'block' }}>
                  {Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}
                </small>
              )}
            </div>

            {/* Terms */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
              <input type="checkbox" id="terms" required style={{ marginRight: '0.5rem' }} />
              <label htmlFor="terms" style={{ fontSize: '12px', color: '#6b7280' }}>
                Saya menyetujui semua <span style={{ textDecoration: 'underline' }}>Ketentuan</span> dan <span style={{ textDecoration: 'underline' }}>Kebijakan Privasi</span>
              </label>
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? (
                <>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
                  Memperbarui...
                </>
              ) : (
                'Perbarui'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Sudah punya akun? </span>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Masuk
            </button>
          </div>
        </div>
      </div>
      <div style={styles.rightPanel} />
    </div>
  );
}