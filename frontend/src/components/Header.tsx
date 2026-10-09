import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  GraduationCap,
  Bell,
  User as UserIcon,
  LogOut,
  KeyRound,
  LayoutDashboard,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../services/notificationApi';
import { AppNotification } from '../types/notification';

interface HeaderProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, showSidebarToggle = true }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch notifications if logged in
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifs = async () => {
      try {
        const res = await notificationApi.getNotifications();
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        // Silently ignore if not authorized
      }
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="main-header">
      <div className="header-left">
        {showSidebarToggle && onToggleSidebar && (
          <button
            className="menu-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu size={24} />
          </button>
        )}
        <Link to="/" className="header-title" style={{ textDecoration: 'none', color: 'inherit' }}>
          <GraduationCap className="header-icon" size={28} />
          <div>
            <h1>Online Learning</h1>
            <p className="subtitle">Nền tảng đào tạo trực tuyến</p>
          </div>
        </Link>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Navigation Quick Links */}
        <nav className="header-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" className="header-nav-link" style={{ textDecoration: 'none', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
            Trang chủ
          </Link>
          <Link to="/courses" className="header-nav-link" style={{ textDecoration: 'none', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
            Khóa học
          </Link>
        </nav>

        {isAuthenticated && user ? (
          <>
            {/* Notification Bell Dropdown */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                className="icon-btn notif-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: showNotifications ? '#eef2ff' : '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
                aria-label="Thông báo"
              >
                <Bell size={20} color={unreadCount > 0 ? '#4f46e5' : '#64748b'} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    width: '340px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    border: '1px solid #e2e8f0',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc'
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>Thông báo</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4f46e5',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCheck size={14} /> Đọc tất cả
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Chưa có thông báo nào
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: !n.is_read ? '#f5f3ff' : '#ffffff',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e1b4b', marginBottom: '4px' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4, marginBottom: '6px' }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {new Date(n.created_at).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'none',
                  border: '1px solid #e2e8f0',
                  padding: '6px 12px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: 'left', display: 'none' }} className="user-meta-desktop">
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
              </button>

              {showUserMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    width: '220px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    border: '1px solid #e2e8f0',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</div>
                    <span
                      className={`badge role-${user.role}`}
                      style={{ marginTop: '6px', fontSize: '0.7rem', display: 'inline-block' }}
                    >
                      {user.role === 'admin' ? 'Quản trị viên' : user.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                    </span>
                  </div>

                  <div style={{ padding: '6px 0' }}>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        textDecoration: 'none',
                        color: '#334155',
                        fontSize: '0.875rem'
                      }}
                    >
                      <LayoutDashboard size={16} /> Bảng điều khiển
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        textDecoration: 'none',
                        color: '#334155',
                        fontSize: '0.875rem'
                      }}
                    >
                      <UserIcon size={16} /> Hồ sơ cá nhân
                    </Link>

                    <Link
                      to="/change-password"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        textDecoration: 'none',
                        color: '#334155',
                        fontSize: '0.875rem'
                      }}
                    >
                      <KeyRound size={16} /> Đổi mật khẩu
                    </Link>

                    <div style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/login"
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
