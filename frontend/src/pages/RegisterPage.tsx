import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password rules validation check
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isMatch = password === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường');
      return;
    }

    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) {
      setError('Mật khẩu chưa đáp ứng đầy đủ tiêu chuẩn bảo mật');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword
      });

      navigate('/student/courses', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng ký không thành công');
    } finally {
      setLoading(false);
    }
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
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid #e2e8f0',
          padding: '36px'
        }}
      >
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
            Tạo tài khoản học viên
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Bắt đầu lộ trình học tập công nghệ cùng Online Learning Platform
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
            <label htmlFor="reg-name">
              Họ và tên <span className="required">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              placeholder="Ví dụ: Nguyễn Văn An"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">
              Địa chỉ Email <span className="required">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              placeholder="an.nguyen@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">
              Mật khẩu <span className="required">*</span>
            </label>
            <div className="password-input-group">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 8 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="reg-confirm-password">
              Xác nhận mật khẩu <span className="required">*</span>
            </label>
            <div className="password-input-group">
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Validation Hints */}
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.78rem' }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Tiêu chuẩn mật khẩu an toàn:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <span style={{ color: hasMinLength ? '#15803d' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Ít nhất 8 ký tự
              </span>
              <span style={{ color: hasUpper ? '#15803d' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Chữ hoa (A-Z)
              </span>
              <span style={{ color: hasLower ? '#15803d' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Chữ thường (a-z)
              </span>
              <span style={{ color: hasNumber ? '#15803d' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Chứa chữ số (0-9)
              </span>
            </div>
            {confirmPassword && (
              <div style={{ marginTop: '6px', color: isMatch ? '#15803d' : '#dc2626', fontWeight: 500 }}>
                {isMatch ? '✓ Mật khẩu xác nhận trùng khớp' : '✕ Mật khẩu xác nhận chưa khớp'}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
          >
            <UserPlus size={18} /> {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: '#64748b' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
