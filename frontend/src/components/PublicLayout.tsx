import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Header } from './Header';
import { GraduationCap, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Header showSidebarToggle={false} />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Modern E-Learning Public Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#cbd5e1', paddingTop: '64px', paddingBottom: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '48px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={22} color="#ffffff" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Online Learning</h3>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#94a3b8' }}>
                Nền tảng đào tạo trực tuyến hàng đầu cung cấp các khóa học thực chiến từ chuyên gia trong ngành công nghệ thông tin và chuyển đổi số.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Khám phá</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <li><Link to="/courses" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tất cả khóa học</Link></li>
                <li><Link to="/courses?category=Web%20Development" style={{ color: '#94a3b8', textDecoration: 'none' }}>Lập trình Web Full-Stack</Link></li>
                <li><Link to="/courses?category=Data%20Science%20%26%20AI" style={{ color: '#94a3b8', textDecoration: 'none' }}>Khoa học Dữ liệu & AI</Link></li>
                <li><Link to="/courses?category=DevOps%20%26%20Cloud" style={{ color: '#94a3b8', textDecoration: 'none' }}>Điện toán đám mây & DevOps</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Tài khoản</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <li><Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Đăng nhập</Link></li>
                <li><Link to="/register" style={{ color: '#94a3b8', textDecoration: 'none' }}>Đăng ký tài khoản</Link></li>
                <li><Link to="/student/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Bảng học tập học viên</Link></li>
                <li><Link to="/instructor/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Khu vực Giảng viên</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Liên hệ & Hỗ trợ</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: '#94a3b8' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} color="#6366f1" /> support@onlinelearning.edu.vn
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} color="#6366f1" /> +84 (0) 24 7300 1866
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} color="#6366f1" /> Khu Công nghệ cao Hòa Lạc, Hà Nội
                </li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: '#64748b' }}>
            <p>&copy; {new Date().getFullYear()} Online Learning Platform. Bảo lưu mọi quyền.</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Xây dựng với <Heart size={14} color="#ef4444" fill="#ef4444" /> cho cộng đồng E-Learning
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
