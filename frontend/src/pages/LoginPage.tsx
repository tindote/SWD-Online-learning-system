import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogIn, Lock, Mail, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await login({ email, password });
      
      // Determine redirection destination
      if (user.role === 'student') {
        // When logging in as student, redirect to home page '/' (or course if they were viewing one)
        if (from && (from.startsWith('/courses') || from.startsWith('/learn'))) {
          navigate(from, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else if (user.role === 'instructor') {
        if (from && !from.startsWith('/admin')) {
          navigate(from, { replace: true });
        } else {
          navigate('/instructor/dashboard', { replace: true });
        }
      } else if (user.role === 'admin') {
        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick fill
  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid #e2e8f0',
          padding: '36px'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}
          >
            <GraduationCap size={32} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Đăng nhập tài khoản
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Chào mừng bạn quay trở lại với Online Learning Platform
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">
              Địa chỉ Email <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">
              Mật khẩu <span className="required">*</span>
            </label>
            <div className="password-input-group">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '12px', fontSize: '0.95rem' }}
          >
            <LogIn size={18} /> {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Section */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', marginBottom: '10px' }}>
            <Sparkles size={14} />
            Tài khoản mẫu dùng thử (Mật khẩu: Password123!)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('cuong.le@example.com')}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span><strong>Admin:</strong> cuong.le@example.com</span>
              <span className="badge role-admin" style={{ fontSize: '0.65rem' }}>Quản trị</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('alex.morgan@example.com')}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span><strong>Giảng viên:</strong> alex.morgan@example.com</span>
              <span className="badge role-instructor" style={{ fontSize: '0.65rem' }}>Giảng viên</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('an.nguyen@example.com')}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span><strong>Học viên:</strong> an.nguyen@example.com</span>
              <span className="badge role-student" style={{ fontSize: '0.65rem' }}>Học viên</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: '#64748b' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
