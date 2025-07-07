import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const location = useLocation();

  // Hide sidebar for simulation pages
  const isSimulationPage = location.pathname === '/simulasi/mulai';

  // Get page title based on current route
  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return { title: 'Dashboard', subtitle: 'Selamat datang di LMS TOEFL ITP' };
    if (path === '/materi') return { title: 'Materi Pembelajaran', subtitle: 'Pilih modul yang ingin dipelajari' };
    if (path.startsWith('/materi/')) return { title: 'Materi Pembelajaran', subtitle: 'Pelajari materi secara bertahap' };
    if (path === '/simulasi') return { title: 'Simulasi TOEFL ITP', subtitle: 'Latihan simulasi ujian lengkap' };
    if (path === '/simulasi/hasil') return { title: 'Hasil Simulasi', subtitle: 'Lihat riwayat hasil simulasi Anda' };
    if (path === '/simulasi/kelola') return { title: 'Kelola Simulasi', subtitle: 'Kelola soal dan paket simulasi' };
    if (path.startsWith('/simulasi/hasil/')) return { title: 'Detail Hasil Simulasi', subtitle: 'Analisis hasil simulasi Anda' };
    if (path.startsWith('/konsultasi')) return { title: 'Konsultasi', subtitle: 'Konsultasi dengan instruktur' };
    if (path === '/laporan-pembelajaran') return { title: 'Laporan Pembelajaran', subtitle: 'Pantau progress pembelajaran Anda' };
    if (path === '/laporan-pembelajaran/detail') return { title: 'Detail Laporan', subtitle: 'Analisis mendalam progress pembelajaran' };
    if (path === '/notifications') return { title: 'Notifikasi', subtitle: 'Kelola pemberitahuan Anda' };
    
    return { title: 'LMS TOEFL ITP', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo();

  // If simulation page, render full screen content
  if (isSimulationPage) {
    return (
      <div style={{ 
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#f8f9fa"
      }}>
        <Outlet />
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh',
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: "#f8f9fa",
      overflow: "hidden"
    }}>
      
      {/* Sidebar */}
      <div style={{ 
        width: '260px', 
        backgroundColor: '#B6252A',
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        flexShrink: 0
      }}>
        
        {/* Sidebar Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: '#A21E23',
          color: 'white',
          flexShrink: 0
        }}>
          <h2 style={{ 
            margin: '0',
            fontSize: '1.1rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            LMS TOEFL ITP
          </h2>
        </div>

        {/* Sidebar Navigation */}
        <div style={{ 
          flex: 1, 
          padding: '0.75rem',
          overflowY: 'auto'
        }}>
          <Sidebar />
        </div>

        {/* Bottom space - empty and clean */}
        <div style={{ 
          height: '20px',
          backgroundColor: '#B6252A',
          flexShrink: 0
        }} />
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0
      }}>
        
        {/* Header */}
        <div style={{ flexShrink: 0 }}>
          <Header title={title} subtitle={subtitle} />
        </div>
        
        {/* Page Content */}
        <div style={{ 
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f8f9fa',
          minHeight: 0
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}