import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';

export default function Header({ title, subtitle }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  // Fetch recent notifications
  const fetchRecentNotifications = async () => {
    try {
      const response = await api.get('/notifications/recent?limit=8', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
      
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Get notification type badge
  const getNotificationTypeBadge = (type) => {
    const badges = {
      consultation: { color: '#2563EB', label: 'Konsultasi' }
    };
    
    return badges[type] || { color: '#6c757d', label: 'Umum' };
  };

  // Handle notification click with navigation (fokus konsultasi saja)
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    // Navigate hanya untuk konsultasi
    if (notification.type === 'consultation') {
      const metadata = notification.metadata || {};
      const action = metadata.action;

      switch (action) {
        case 'new_consultation':
        case 'restart_consultation':
        case 'student_message':
          if (role === 'instruktur' && metadata.student_id) {
            navigate(`/konsultasi/student/${metadata.student_id}`);
          }
          break;
          
        case 'instructor_reply':
        case 'instructor_responded':
          if (role === 'peserta' && metadata.instructor_id) {
            navigate(`/konsultasi/${metadata.instructor_id}`);
          }
          break;
          
        case 'session_ended':
          if (role === 'instruktur' && metadata.student_id) {
            navigate(`/konsultasi/student/${metadata.student_id}`);
          } else if (role === 'peserta' && metadata.instructor_id) {
            navigate(`/konsultasi/${metadata.instructor_id}`);
          } else {
            navigate('/konsultasi');
          }
          break;
          
        case 'instructor_available':
          navigate('/konsultasi');
          break;
          
        default:
          navigate('/konsultasi');
      }
    }

    // Close notification dropdown
    setIsNotificationOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    if (!window.confirm('Apakah Anda yakin ingin logout?')) return;
    
    try {
      await api.post('/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.clear();
    window.location.href = '/login';
  };

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchRecentNotifications();
    fetchUnreadCount();
    
    // Refresh every 30 seconds for real-time notifications
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchRecentNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  };

  // ✅ PERBAIKAN: Tentukan notif link berdasarkan role
  const getNotificationLink = () => {
    if (role === 'admin') {
      return '/admin/notifikasi'; // ← Admin ke Notifikasi Admin
    }
    return '/notifications'; // ← Peserta & Instruktur ke Notifikasi biasa
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e9ecef',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      
      {/* Title Section */}
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#B6252A',
          margin: 0,
          marginBottom: '0.25rem'
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '0.9rem',
            color: '#6c757d',
            margin: 0
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              if (!isNotificationOpen) {
                fetchRecentNotifications();
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0.25rem',
                right: '0.25rem',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: '380px',
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1001,
              marginTop: '0.5rem'
            }}>
              
              {/* Header */}
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                  Notifikasi
                </h3>
                <Link
                  to={getNotificationLink()} // ← PERBAIKAN: Pakai fungsi berdasarkan role
                  onClick={() => setIsNotificationOpen(false)}
                  style={{
                    fontSize: '0.85rem',
                    color: '#B6252A',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  Tampilkan Semua
                </Link>
              </div>

              {/* Notifications List */}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#6c757d',
                    fontSize: '0.9rem'
                  }}>
                    Belum ada notifikasi
                  </div>
                ) : (
                  notifications.map(notification => {
                    const typeBadge = getNotificationTypeBadge(notification.type);
                    
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        style={{
                          padding: '1rem',
                          borderBottom: '1px solid #f8f9fa',
                          cursor: 'pointer',
                          backgroundColor: notification.read_at ? 'white' : '#f8f9fa',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#e9ecef';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = notification.read_at ? 'white' : '#f8f9fa';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          
                          {/* Unread indicator */}
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: notification.read_at ? 'transparent' : '#dc3545',
                            marginTop: '0.5rem',
                            flexShrink: 0
                          }} />
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            
                            {/* Type badge and title */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span style={{
                                backgroundColor: typeBadge.color,
                                color: 'white',
                                fontSize: '0.65rem',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '10px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                flexShrink: 0
                              }}>
                                {typeBadge.label}
                              </span>
                            </div>
                            
                            <div style={{
                              fontWeight: notification.read_at ? '400' : '600',
                              fontSize: '0.85rem',
                              marginBottom: '0.25rem',
                              color: '#212529'
                            }}>
                              {notification.title}
                            </div>
                            
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#6c757d',
                              marginBottom: '0.25rem',
                              lineHeight: '1.3'
                            }}>
                              {notification.message}
                            </div>
                            
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#adb5bd'
                            }}>
                              {formatTimeAgo(notification.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#B6252A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'white'
            }}>
              {name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: '200px',
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1001,
              marginTop: '0.5rem'
            }}>
              
              {/* User Info */}
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid #dee2e6'
              }}>
                <div style={{
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  color: '#212529',
                  marginBottom: '0.25rem'
                }}>
                  {name}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'white',
                  backgroundColor: role === 'admin' ? '#B6252A' : role === 'instruktur' ? '#2563EB' : '#059669',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px',
                  display: 'inline-block',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  {role}
                </div>
              </div>

              {/* Logout */}
              <div style={{ padding: '0.5rem' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '0.5rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    color: '#dc3545',
                    transition: 'background-color 0.2s',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}