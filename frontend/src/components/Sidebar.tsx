import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  FolderTree,
  FileText,
  UserCheck,
  ClipboardList,
  Send,
  Compass,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  // Role-based navigation items
  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
        { path: '/admin/courses', label: 'Quản lý khóa học', icon: BookOpen },
        { path: '/admin/users', label: 'Quản lý người dùng', icon: Users },
        { path: '/admin/categories', label: 'Quản lý danh mục', icon: FolderTree },
        { path: '/admin/lessons', label: 'Quản lý bài học', icon: FileText },
        { path: '/admin/enrollments', label: 'Quản lý đăng ký', icon: UserCheck },
        { path: '/admin/assignments', label: 'Quản lý bài tập', icon: ClipboardList },
        { path: '/admin/submissions', label: 'Quản lý bài nộp', icon: Send },
        { path: '/student/courses', label: 'Khóa học tôi đang học', icon: GraduationCap },
        { path: '/courses', label: 'Khám phá khóa học', icon: Compass }
      ];
    }

    if (role === 'instructor') {
      return [
        { path: '/instructor/dashboard', label: 'Tổng quan giảng viên', icon: LayoutDashboard },
        { path: '/instructor/courses', label: 'Khóa học tôi dạy', icon: BookOpen },
        { path: '/instructor/lessons', label: 'Quản lý bài giảng', icon: FileText },
        { path: '/instructor/assignments', label: 'Giao bài tập', icon: ClipboardList },
        { path: '/instructor/submissions', label: 'Chấm bài nộp', icon: Send },
        { path: '/student/courses', label: 'Khóa học tôi đang học', icon: GraduationCap },
        { path: '/student/assignments', label: 'Bài tập của tôi', icon: CheckCircle },
        { path: '/courses', label: 'Khám phá khóa học', icon: Compass }
      ];
    }

    // Student navigation
    return [
      { path: '/student/dashboard', label: 'Tổng quan học tập', icon: LayoutDashboard },
      { path: '/student/courses', label: 'Khóa học của tôi', icon: BookOpen },
      { path: '/student/assignments', label: 'Bài tập & Điểm số', icon: ClipboardList },
      { path: '/courses', label: 'Khám phá khóa học', icon: Compass }
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <GraduationCap size={28} />
            </div>
            <div className="brand-text">
              <h2>Online Learning</h2>
              <span>
                {role === 'admin'
                  ? 'Quản trị viên'
                  : role === 'instructor'
                  ? 'Khu vực Giảng viên'
                  : 'Khu vực Học viên'}
              </span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Đóng thanh điều hướng">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p>Online Learning Platform</p>
          <p className="version-badge">Production v1.0</p>
        </div>
      </aside>
    </>
  );
};
