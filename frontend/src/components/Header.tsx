import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  User as UserIcon,
  LogOut,
  KeyRound,
  Compass,
  BookOpen,
  FileText,
  FolderTree,
  Users,
  UserCheck,
  ClipboardList,
  Send,
  CheckCircle,
  ChevronDown,
  Menu,
  X,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../services/notificationApi';
import { AppNotification } from '../types/notification';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const interval = setInterval(fetchNotifs, 30000);
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  const toggleDropdown = (name: string) => {
    setActiveDropdown(prev => (prev === name ? null : name));
  };

  const role = user?.role || 'guest';

  // Logo destination based on role
  const getLogoPath = () => {
    if (!isAuthenticated || !user) return '/';
    if (user.role === 'admin') return '/admin/courses';
    if (user.role === 'instructor') return '/instructor/courses';
    return '/student/courses';
  };

  const isPathActive = (path: string) => location.pathname === path;
  const isGroupActive = (paths: string[]) => paths.some(p => location.pathname.startsWith(p));

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Left: Brand Logo & Role Badge */}
        <div className="header-brand-group">
          <Link to={getLogoPath()} className="header-logo" title="Trang chủ Online Learning">
            <div className="logo-badge">
              <GraduationCap size={24} />
            </div>
            <div className="logo-text">
              <span className="brand-name">Online Learning</span>
              <span className="brand-tagline">Hệ thống đào tạo trực tuyến</span>
            </div>
          </Link>

          {/* Actor Role Pill */}
          {isAuthenticated && user && (
            <span className={`actor-role-pill role-${user.role}`}>
              {user.role === 'admin'
                ? 'Quản trị viên'
                : user.role === 'instructor'
                ? 'Giảng viên'
                : 'Học viên'}
            </span>
          )}
        </div>

        {/* Center: Main Navigation for each Actor */}
        <nav className="header-center-nav" ref={dropdownRef}>
          {/* 1. GUEST NAVIGATION */}
          {!isAuthenticated && (
            <div className="nav-link-group">
              <NavLink to="/" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                <span>Trang chủ</span>
              </NavLink>
              <NavLink to="/courses" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                <Compass size={17} />
                <span>Khám phá khóa học</span>
              </NavLink>
            </div>
          )}

          {/* 2. STUDENT NAVIGATION */}
          {isAuthenticated && role === 'student' && (
            <div className="nav-link-group">
              <NavLink to="/courses" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                <Compass size={17} />
                <span>Khám phá khóa học</span>
              </NavLink>

              <NavLink to="/student/courses" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                <BookOpen size={17} />
                <span>Khóa học của tôi</span>
              </NavLink>

              <NavLink to="/student/assignments" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                <CheckCircle size={17} />
                <span>Bài tập & Nộp bài</span>
              </NavLink>
            </div>
          )}

          {/* 3. INSTRUCTOR NAVIGATION */}
          {isAuthenticated && role === 'instructor' && (
            <div className="nav-link-group">
              <NavLink to="/instructor/courses" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                <BookOpen size={17} />
                <span>Khóa học tôi dạy</span>
              </NavLink>

              <NavLink to="/instructor/lessons" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                <FileText size={17} />
                <span>Bài giảng</span>
              </NavLink>

              {/* Dropdown: Bài tập & Chấm điểm */}
              <div className="nav-dropdown-wrapper">
                <button
                  type="button"
                  className={`header-nav-item dropdown-trigger ${
                    isGroupActive(['/instructor/assignments', '/instructor/submissions']) ? 'active' : ''
                  }`}
                  onClick={() => toggleDropdown('instructor-assignments')}
                >
                  <ClipboardList size={17} />
                  <span>Bài tập & Chấm điểm</span>
                  <ChevronDown size={14} className={`chevron-icon ${activeDropdown === 'instructor-assignments' ? 'rotate' : ''}`} />
                </button>

                {activeDropdown === 'instructor-assignments' && (
                  <div className="nav-dropdown-menu">
                    <Link to="/instructor/assignments" className={`dropdown-item ${isPathActive('/instructor/assignments') ? 'active' : ''}`}>
                      <ClipboardList size={16} />
                      <div>
                        <div className="dropdown-title">Giao bài tập</div>
                        <div className="dropdown-desc">Tạo và quản lý bài tập của các khóa học</div>
                      </div>
                    </Link>
                    <Link to="/instructor/submissions" className={`dropdown-item ${isPathActive('/instructor/submissions') ? 'active' : ''}`}>
                      <Send size={16} />
                      <div>
                        <div className="dropdown-title">Chấm bài học viên</div>
                        <div className="dropdown-desc">Xem bài nộp và đánh giá cho điểm</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <NavLink to="/instructor/enrollments" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                <UserCheck size={17} />
                <span>Học viên đăng ký</span>
              </NavLink>

              <NavLink to="/courses" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                <Compass size={17} />
                <span>Tất cả khóa học</span>
              </NavLink>
            </div>
          )}

          {/* 4. ADMIN NAVIGATION */}
          {isAuthenticated && role === 'admin' && (
            <div className="nav-link-group">
              {/* Dropdown: Đào tạo & Nội dung */}
              <div className="nav-dropdown-wrapper">
                <button
                  type="button"
                  className={`header-nav-item dropdown-trigger ${
                    isGroupActive(['/admin/courses', '/admin/lessons', '/admin/categories']) ? 'active' : ''
                  }`}
                  onClick={() => toggleDropdown('admin-training')}
                >
                  <BookOpen size={17} />
                  <span>Đào tạo & Khóa học</span>
                  <ChevronDown size={14} className={`chevron-icon ${activeDropdown === 'admin-training' ? 'rotate' : ''}`} />
                </button>

                {activeDropdown === 'admin-training' && (
                  <div className="nav-dropdown-menu">
                    <Link to="/admin/courses" className={`dropdown-item ${isPathActive('/admin/courses') ? 'active' : ''}`}>
                      <BookOpen size={16} />
                      <div>
                        <div className="dropdown-title">Quản lý khóa học</div>
                        <div className="dropdown-desc">Thêm, sửa, xóa và kiểm duyệt các khóa học</div>
                      </div>
                    </Link>
                    <Link to="/admin/lessons" className={`dropdown-item ${isPathActive('/admin/lessons') ? 'active' : ''}`}>
                      <FileText size={16} />
                      <div>
                        <div className="dropdown-title">Quản lý bài giảng</div>
                        <div className="dropdown-desc">Soạn thảo video và tài liệu bài giảng</div>
                      </div>
                    </Link>
                    <Link to="/admin/categories" className={`dropdown-item ${isPathActive('/admin/categories') ? 'active' : ''}`}>
                      <FolderTree size={16} />
                      <div>
                        <div className="dropdown-title">Danh mục khóa học</div>
                        <div className="dropdown-desc">Quản lý các nhóm chuyên ngành đào tạo</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Dropdown: Bài tập & Bài nộp */}
              <div className="nav-dropdown-wrapper">
                <button
                  type="button"
                  className={`header-nav-item dropdown-trigger ${
                    isGroupActive(['/admin/assignments', '/admin/submissions']) ? 'active' : ''
                  }`}
                  onClick={() => toggleDropdown('admin-assignments')}
                >
                  <ClipboardList size={17} />
                  <span>Bài tập & Bài nộp</span>
                  <ChevronDown size={14} className={`chevron-icon ${activeDropdown === 'admin-assignments' ? 'rotate' : ''}`} />
                </button>

                {activeDropdown === 'admin-assignments' && (
                  <div className="nav-dropdown-menu">
                    <Link to="/admin/assignments" className={`dropdown-item ${isPathActive('/admin/assignments') ? 'active' : ''}`}>
                      <ClipboardList size={16} />
                      <div>
                        <div className="dropdown-title">Quản lý bài tập</div>
                        <div className="dropdown-desc">Toàn bộ đề bài tập trên hệ thống</div>
                      </div>
                    </Link>
                    <Link to="/admin/submissions" className={`dropdown-item ${isPathActive('/admin/submissions') ? 'active' : ''}`}>
                      <Send size={16} />
                      <div>
                        <div className="dropdown-title">Quản lý bài nộp</div>
                        <div className="dropdown-desc">Danh sách bài nộp và kết quả chấm điểm</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Dropdown: Người dùng & Đăng ký */}
              <div className="nav-dropdown-wrapper">
                <button
                  type="button"
                  className={`header-nav-item dropdown-trigger ${
                    isGroupActive(['/admin/users', '/admin/enrollments']) ? 'active' : ''
                  }`}
                  onClick={() => toggleDropdown('admin-users')}
                >
                  <Users size={17} />
                  <span>Người dùng & Đăng ký</span>
                  <ChevronDown size={14} className={`chevron-icon ${activeDropdown === 'admin-users' ? 'rotate' : ''}`} />
                </button>

                {activeDropdown === 'admin-users' && (
                  <div className="nav-dropdown-menu">
                    <Link to="/admin/users" className={`dropdown-item ${isPathActive('/admin/users') ? 'active' : ''}`}>
                      <Users size={16} />
                      <div>
                        <div className="dropdown-title">Quản lý người dùng</div>
                        <div className="dropdown-desc">Tài khoản học viên, giảng viên và quản trị</div>
                      </div>
                    </Link>
                    <Link to="/admin/enrollments" className={`dropdown-item ${isPathActive('/admin/enrollments') ? 'active' : ''}`}>
                      <UserCheck size={16} />
                      <div>
                        <div className="dropdown-title">Quản lý ghi danh</div>
                        <div className="dropdown-desc">Danh sách đăng ký khóa học của học viên</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <NavLink to="/courses" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                <Compass size={17} />
                <span>Xem Catalog</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Right: Notifications & User Menu (or Login/Register) */}
        <div className="header-right-actions">
          {isAuthenticated && user ? (
            <>
              {/* Notification Bell */}
              <div ref={notifRef} className="header-popover-anchor">
                <button
                  type="button"
                  className={`header-icon-btn ${showNotifications ? 'active' : ''}`}
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Thông báo"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="notif-badge-pill">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="header-popover notif-popover">
                    <div className="popover-header">
                      <span className="popover-title">Thông báo hệ thống</span>
                      {unreadCount > 0 && (
                        <button type="button" onClick={handleMarkAllRead} className="mark-read-btn">
                          <CheckCheck size={14} /> Đã đọc tất cả
                        </button>
                      )}
                    </div>

                    <div className="popover-body">
                      {notifications.length === 0 ? (
                        <div className="empty-notif-msg">Không có thông báo mới</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-desc">{n.message}</div>
                            <div className="notif-time">{new Date(n.created_at).toLocaleString('vi-VN')}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div ref={userMenuRef} className="header-popover-anchor">
                <button
                  type="button"
                  className={`user-profile-btn ${showUserMenu ? 'active' : ''}`}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar-circle">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info-text">
                    <span className="user-display-name">{user.name}</span>
                    <span className="user-role-label">
                      {user.role === 'admin'
                        ? 'Quản trị viên'
                        : user.role === 'instructor'
                        ? 'Giảng viên'
                        : 'Học viên'}
                    </span>
                  </div>
                  <ChevronDown size={14} className="user-chevron" />
                </button>

                {showUserMenu && (
                  <div className="header-popover user-popover">
                    <div className="user-popover-header">
                      <div className="user-popover-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-popover-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        <span className={`badge role-${user.role}`}>
                          {user.role === 'admin' ? 'Quản trị viên' : user.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                        </span>
                      </div>
                    </div>

                    <div className="user-popover-links">
                      {/* Học viên mode links for instructor/admin */}
                      {(user.role === 'instructor' || user.role === 'admin') && (
                        <Link to="/student/courses" className="popover-link" onClick={() => setShowUserMenu(false)}>
                          <BookOpen size={16} /> Khóa học tôi đang học
                        </Link>
                      )}

                      <Link to="/profile" className="popover-link" onClick={() => setShowUserMenu(false)}>
                        <UserIcon size={16} /> Hồ sơ cá nhân
                      </Link>

                      <Link to="/change-password" className="popover-link" onClick={() => setShowUserMenu(false)}>
                        <KeyRound size={16} /> Đổi mật khẩu
                      </Link>

                      <div className="popover-divider" />

                      <button type="button" onClick={handleLogout} className="popover-link logout-link">
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="guest-auth-buttons">
              <Link to="/login" className="btn btn-secondary auth-btn-sm">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary auth-btn-sm">
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay">
          <div className="mobile-drawer-content">
            <div className="mobile-drawer-header">
              <span className="drawer-title">Danh mục điều hướng</span>
              <button type="button" className="drawer-close-btn" onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-body">
              {/* Guest links */}
              {!isAuthenticated && (
                <>
                  <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Trang chủ
                  </Link>
                  <Link to="/courses" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Compass size={18} /> Khám phá khóa học
                  </Link>
                  <div className="mobile-drawer-auth">
                    <Link to="/login" className="btn btn-secondary w-full" onClick={() => setMobileMenuOpen(false)}>
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="btn btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>
                      Đăng ký
                    </Link>
                  </div>
                </>
              )}

              {/* Student links */}
              {isAuthenticated && role === 'student' && (
                <>
                  <Link to="/courses" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Compass size={18} /> Khám phá khóa học
                  </Link>
                  <Link to="/student/courses" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <BookOpen size={18} /> Khóa học của tôi
                  </Link>
                  <Link to="/student/assignments" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <CheckCircle size={18} /> Bài tập & Nộp bài
                  </Link>
                </>
              )}

              {/* Instructor links */}
              {isAuthenticated && role === 'instructor' && (
                <>
                  <div className="mobile-group-title">Giảng dạy & Khóa học</div>
                  <Link to="/instructor/courses" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <BookOpen size={18} /> Khóa học tôi dạy
                  </Link>
                  <Link to="/instructor/lessons" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <FileText size={18} /> Quản lý bài giảng
                  </Link>
                  <Link to="/instructor/assignments" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <ClipboardList size={18} /> Giao bài tập
                  </Link>
                  <Link to="/instructor/submissions" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Send size={18} /> Chấm bài học viên
                  </Link>
                  <Link to="/instructor/enrollments" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <UserCheck size={18} /> Học viên đăng ký
                  </Link>
                  <div className="mobile-group-title">Học tập & Khám phá</div>
                  <Link to="/courses" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Compass size={18} /> Tất cả khóa học
                  </Link>
                  <Link to="/student/courses" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <GraduationCap size={18} /> Khóa học tôi đang học
                  </Link>
                </>
              )}

              {/* Admin links */}
              {isAuthenticated && role === 'admin' && (
                <>
                  <div className="mobile-group-title">Quản lý đào tạo</div>
                  <Link to="/admin/courses" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <BookOpen size={18} /> Quản lý khóa học
                  </Link>
                  <Link to="/admin/lessons" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <FileText size={18} /> Quản lý bài giảng
                  </Link>
                  <Link to="/admin/categories" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <FolderTree size={18} /> Quản lý danh mục
                  </Link>

                  <div className="mobile-group-title">Bài tập & Bài nộp</div>
                  <Link to="/admin/assignments" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <ClipboardList size={18} /> Quản lý bài tập
                  </Link>
                  <Link to="/admin/submissions" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Send size={18} /> Quản lý bài nộp
                  </Link>

                  <div className="mobile-group-title">Người dùng & Đăng ký</div>
                  <Link to="/admin/users" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Users size={18} /> Quản lý người dùng
                  </Link>
                  <Link to="/admin/enrollments" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <UserCheck size={18} /> Quản lý ghi danh
                  </Link>
                  <Link to="/courses" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Compass size={18} /> Xem catalog khóa học
                  </Link>
                </>
              )}

              {/* User settings in mobile drawer */}
              {isAuthenticated && (
                <div className="mobile-drawer-footer">
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <UserIcon size={18} /> Hồ sơ cá nhân
                  </Link>
                  <Link to="/change-password" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <KeyRound size={18} /> Đổi mật khẩu
                  </Link>
                  <button type="button" onClick={handleLogout} className="mobile-nav-link logout-btn">
                    <LogOut size={18} /> Đăng xuất ({user?.name})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
