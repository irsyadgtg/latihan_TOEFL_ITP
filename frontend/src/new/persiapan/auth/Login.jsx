import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, RefreshCw } from 'lucide-react';
import api from '../../shared/services/api';

export default function Login() {
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (message) setMessage('');
    if (needsVerification) setNeedsVerification(false);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/email/resend', { email: verificationEmail });
      setMessage(`✅ ${data.message}`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal mengirim ulang email verifikasi');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage('');
    setNeedsVerification(false);

    try {
      const { data } = await api.post('/login', formData);
      
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('pengguna', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('idPengguna', data.user.idPengguna);
      localStorage.setItem('name', data.user.username);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setSuccess(true);
      setMessage(`Login berhasil! Selamat datang, ${data.user.username}`);
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.message?.includes('belum diverifikasi')) {
        // Email verification required
        setNeedsVerification(true);
        setVerificationEmail(formData.login.includes('@') ? formData.login : '');
        setMessage('Email Anda belum diverifikasi. Silakan cek email untuk melakukan verifikasi.');
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage(error.response?.data?.message || 'Login gagal. Periksa email/username dan password.');
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
    success: { backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' },
    verification: { backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' },
    resendBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '14px', fontWeight: '500', cursor: resendLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Poppins', sans-serif" }
  };

  if (success) {
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
            <div style={styles.success}>
              <h2 style={{ color: '#16a34a', fontSize: '20px', fontWeight: '600', margin: '0 0 1rem 0' }}>Login Berhasil!</h2>
              <p style={{ color: '#16a34a', fontSize: '14px', margin: '0 0 1rem 0' }}>{message}</p>
              <div style={{ fontSize: '13px', color: '#16a34a' }}>Mengalihkan ke dashboard...</div>
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
          
          {/* Logo */}
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>T</span>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Telkom University</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>LANGUAGE CENTER</div>
            </div>
          </div>

          {/* Welcome */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 0.5rem 0' }}>
              Selamat datang di LMS LaC TOEFL ITP
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Silahkan Masuk dengan E-mail Anda</p>
          </div>

          {/* Email Verification Alert */}
          {needsVerification && (
            <div style={styles.verification}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Mail size={20} style={{ color: '#856404', marginRight: '0.5rem' }} />
                <strong style={{ color: '#856404', fontSize: '16px' }}>Verifikasi Email Diperlukan</strong>
              </div>
              <p style={{ color: '#856404', fontSize: '14px', margin: '0 0 1rem 0' }}>
                {message}
              </p>
              <p style={{ color: '#856404', fontSize: '13px', margin: '0 0 1rem 0' }}>
                Belum menerima email? Klik tombol di bawah untuk mengirim ulang link verifikasi.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading || !verificationEmail}
                style={styles.resendBtn}
              >
                {resendLoading ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Kirim Ulang Verifikasi
                  </>
                )}
              </button>
              {!verificationEmail && (
                <p style={{ color: '#d97706', fontSize: '12px', marginTop: '0.5rem' }}>
                  Masukkan email di form login untuk mengirim ulang verifikasi
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {message && !needsVerification && !success && (
            <div style={styles.error}>
              <span style={{ color: '#dc2626', fontSize: '14px' }}>{message}</span>
            </div>
          )}

          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '2rem' }}>Masuk</h2>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            
            {/* Email/Username */}
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Masukkan E-mail/Username"
                style={{ ...styles.input, border: errors.login ? '1px solid #dc2626' : '1px solid #d1d5db' }}
                required
              />
              {errors.login && <small style={{ color: '#dc2626', fontSize: '12px', display: 'block', marginTop: '0.25rem' }}>
                {errors.login[0]}
              </small>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan kata sandi"
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
              {errors.password && <small style={{ color: '#dc2626', fontSize: '12px', display: 'block', marginTop: '0.25rem' }}>
                {errors.password[0]}
              </small>}
            </div>

            {/* Forgot Password */}
            <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
              <button type="button" onClick={() => navigate('/forgot-password')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}>
                Lupa password
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Belum punya akun? </span>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}>
              Registrasi
            </button>
          </div>
        </div>
      </div>
      <div style={styles.rightPanel} />
    </div>
  );
}