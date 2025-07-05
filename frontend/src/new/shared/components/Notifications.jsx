import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const fetchNotifications = async (page = 1, filterType = 'all') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '15'
      });
      
      if (filterType !== 'all') {
        params.append('filter', filterType);
      }

      const response = await api.get(`/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data.data);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/notifications/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

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
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) return;
    
    try {
      await api.delete(`/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error deleting notification:', error);
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
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    fetchNotifications(1, newFilter);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNotifications(page, filter);
  };

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ 
      padding: '2rem',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      
      {/* Stats Cards */}
      {stats.total > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#B6252A' }}>
              {stats.total || 0}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Total Notifikasi</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#dc3545' }}>
              {stats.unread || 0}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Belum Terbaca</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#2563EB' }}>
              {stats.by_type?.consultation || 0}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Konsultasi</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { key: 'all', label: 'Semua Status' },
              { key: 'unread', label: 'Belum Terbaca' },
              { key: 'read', label: 'Terbaca' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => handleFilterChange(filterOption.key)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  backgroundColor: filter === filterOption.key ? '#2563EB' : 'white',
                  color: filter === filterOption.key ? 'white' : '#495057',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (filter !== filterOption.key) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== filterOption.key) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        
        {loading ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            Memuat notifikasi...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            {filter === 'all' && 'Belum ada notifikasi'}
            {filter === 'unread' && 'Tidak ada notifikasi belum terbaca'}
            {filter === 'read' && 'Tidak ada notifikasi terbaca'}
          </div>
        ) : (
          notifications.map((notification, index) => {
            const typeBadge = getNotificationTypeBadge(notification.type);
            
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  padding: '1.5rem',
                  borderBottom: index < notifications.length - 1 ? '1px solid #f8f9fa' : 'none',
                  backgroundColor: notification.read_at ? 'white' : '#f8f9fa',
                  transition: 'background-color 0.2s',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e9ecef';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = notification.read_at ? 'white' : '#f8f9fa';
                }}
              >
                
                {/* Header with type badge and actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Unread Indicator */}
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: notification.read_at ? 'transparent' : '#dc3545',
                      flexShrink: 0
                    }} />
                    
                    {/* Type Badge */}
                    <span style={{
                      backgroundColor: typeBadge.color,
                      color: 'white',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {typeBadge.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!notification.read_at && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        style={{
                          padding: '0.4rem 0.8rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}
                      >
                        Tandai Dibaca
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div>
                  
                  {/* Title */}
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1rem',
                    fontWeight: notification.read_at ? '500' : '600',
                    color: '#212529'
                  }}>
                    {notification.title}
                  </h3>

                  {/* Message */}
                  <p style={{
                    margin: '0 0 0.75rem 0',
                    fontSize: '0.9rem',
                    color: '#6c757d',
                    lineHeight: '1.5'
                  }}>
                    {notification.message}
                  </p>

                  {/* Metadata info */}
                  {notification.metadata && notification.metadata.action && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#adb5bd',
                      marginBottom: '0.5rem'
                    }}>
                      Action: {notification.metadata.action}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#adb5bd'
                  }}>
                    {formatDateTime(notification.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1.5rem'
        }}>
          
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
              color: currentPage === 1 ? '#6c757d' : '#495057',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Sebelumnya
          </button>

          <span style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            color: '#6c757d'
          }}>
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white',
              color: currentPage === totalPages ? '#6c757d' : '#495057',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}