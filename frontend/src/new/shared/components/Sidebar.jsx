import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, User, Users, BookOpen, Target, 
  MessageCircle, BarChart3, Settings,
  Bell, Search, Calendar, Package, 
  CreditCard, FileText, Inbox, CheckCircle,
  GraduationCap, Play, Edit, Gift, Receipt
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const role = localStorage.getItem('role');

  const menuItems = [
    // ============ ADMIN FEATURES (ADMIN ONLY) ============
    {
      path: '/dashboard',
      label: 'Dashboard Admin',
      icon: Home,
      roles: ['admin']
    },
    {
      path: '/admin/kelola-instruktur',
      label: 'Kelola Instruktur',
      icon: GraduationCap,
      roles: ['admin']
    },
    {
      path: '/admin/seleksi-skor',
      label: 'Seleksi Skor Awal',
      icon: CheckCircle,
      roles: ['admin']
    },
    {
      path: '/admin/pantau-peserta',
      label: 'Pantau Daftar Peserta',
      icon: Users,
      roles: ['admin']
    },
    {
      path: '/admin/transaksi',
      label: 'Riwayat Transaksi',
      icon: CreditCard,
      roles: ['admin']
    },
    {
      path: '/admin/paket-kursus',
      label: 'Kelola Paket Kursus',
      icon: Package,
      roles: ['admin']
    },
    {
      path: '/admin/notifikasi',
      label: 'Notifikasi Admin',
      icon: Bell,
      roles: ['admin']
    },
    {
      path: `/profil/${role}`,
      label: 'Profil Saya',
      icon: User,
      roles: ['admin']
    },

    // ============ INSTRUKTUR FEATURES (INSTRUKTUR ONLY) ============
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['instruktur']
    },
    {
      path: '/instruktur/daftar',
      label: 'Daftar Instruktur',
      icon: FileText,
      roles: ['instruktur']
    },
    {
      path: '/tinjau-rencana',
      label: 'Tinjau Rencana Belajar',
      icon: Search,
      roles: ['instruktur']
    },
    {
      path: '/materi',
      label: 'Kelola Materi',
      icon: BookOpen,
      roles: ['instruktur']
    },
    {
      path: '/simulasi',
      label: 'Kelola Simulasi',
      icon: Settings,
      roles: ['instruktur']
    },
    {
      path: '/konsultasi',
      label: 'Konsultasi',
      icon: MessageCircle,
      roles: ['instruktur']
    },
    {
      path: `/profil/${role}`,
      label: 'Profil Saya',
      icon: User,
      roles: ['instruktur']
    },

    // ============ PESERTA FEATURES (PESERTA ONLY) ============
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['peserta']
    },
    {
      path: '/rencana-belajar',
      label: 'Pengajuan Rencana Belajar',
      icon: Calendar,
      roles: ['peserta']
    },
    {
      path: '/skor-awal',
      label: 'Pengajuan Skor Awal',
      icon: Edit,
      roles: ['peserta']
    },
    {
      path: '/paket-kursus',
      label: 'Berlangganan Paket Kursus',
      icon: Gift,
      roles: ['peserta']
    },
    {
      path: '/riwayat-pembayaran',
      label: 'Riwayat Pembayaran',
      icon: Receipt,
      roles: ['peserta']
    },
    {
      path: '/instruktur/daftar',
      label: 'Daftar Instruktur',
      icon: FileText,
      roles: ['peserta']
    },
    {
      path: '/materi',
      label: 'Materi',
      icon: BookOpen,
      roles: ['peserta']
    },
    {
      path: '/simulasi',
      label: 'Simulasi',
      icon: Play,
      roles: ['peserta']
    },
    {
      path: '/konsultasi',
      label: 'Konsultasi',
      icon: MessageCircle,
      roles: ['peserta']
    },
    {
      path: '/laporan-pembelajaran',
      label: 'Laporan Pembelajaran',
      icon: BarChart3,
      roles: ['peserta']
    },
    {
      path: `/profil/${role}`,
      label: 'Profil Saya',
      icon: User,
      roles: ['peserta']
    }
  ];

  // Filter menu berdasarkan role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(role)
  );

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={{ 
      height: '100%', 
      overflow: 'hidden',
      paddingTop: '1rem',
      paddingBottom: '1rem'
    }}>
      {filteredMenuItems.map((item) => {
        const IconComponent = item.icon;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              textDecoration: 'none',
              color: isActive(item.path) ? '#B6252A' : 'rgba(255,255,255,0.9)',
              backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRight: isActive(item.path) ? '3px solid white' : '3px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              fontWeight: isActive(item.path) ? '600' : '400',
              fontFamily: "'Poppins', sans-serif"
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'rgba(255,255,255,0.9)';
              }
            }}
          >
            <IconComponent size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}