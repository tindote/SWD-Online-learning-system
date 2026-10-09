import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import {
  GraduationCap,
  LogIn,
  Lock,
  Mail,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  X,
  RefreshCw
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || null;

  const handleOpenForgot = () => {
    setForgotEmail(email || '');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError(null);
    setForgotSuccess(null);
    setGeneratedOtp(null);
    setForgotStep(1);
    setShowForgotModal(true);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.trim()) {
      setForgotError('Vui lòng nhập địa chỉ email đã đăng ký');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);
    try {
      const res = await authApi.forgotPassword(forgotEmail.trim());
      setForgotSuccess(res.message);
      if (res.otp) {
        setGeneratedOtp(res.otp);
      }
      setForgotStep(2);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || err.message || 'Không thể gửi yêu cầu đặt lại mật khẩu');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || !forgotNewPassword || !forgotConfirmPassword) {
      setForgotError('Vui lòng điền đầy đủ mã OTP và mật khẩu mới');
      return;
    }
    if (forgotNewPassword.length < 8) {
      setForgotError('Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Mật khẩu xác nhận không khớp');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await authApi.resetPassword({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword,
        confirmPassword: forgotConfirmPassword
      });
      setForgotSuccess(res.message);
      setForgotStep(3);
      // Pre-fill main login form with new credentials
      setEmail(forgotEmail.trim());
      setPassword(forgotNewPassword);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || err.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setForgotLoading(false);
    }
  };

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
        if (from && (from.startsWith('/courses') || from.startsWith('/learn') || from.startsWith('/student'))) {
          navigate(from, { replace: true });
        } else {
          navigate('/student/courses', { replace: true });
        }
      } else if (user.role === 'instructor') {
        if (from && !from.startsWith('/admin') && !from.includes('dashboard')) {
          navigate(from, { replace: true });
        } else {
          navigate('/instructor/courses', { replace: true });
        }
      } else if (user.role === 'admin') {
        if (from && !from.includes('dashboard')) {
          navigate(from, { replace: true });
        } else {
          navigate('/admin/courses', { replace: true });
        }
      } else {
        navigate('/courses', { replace: true });
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="login-password" style={{ marginBottom: 0 }}>
                Mật khẩu <span className="required">*</span>
              </label>
              <button
                type="button"
                onClick={handleOpenForgot}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                Quên mật khẩu?
              </button>
            </div>
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowForgotModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '32px',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                transition: 'background-color 0.2s, color 0.2s'
              }}
              title="Đóng"
            >
              <X size={18} />
            </button>

            {/* Stepper indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '30px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: forgotStep >= 1 ? '#4f46e5' : '#e2e8f0',
                  transition: 'background-color 0.3s'
                }}
              />
              <div
                style={{
                  width: '30px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: forgotStep >= 2 ? '#4f46e5' : '#e2e8f0',
                  transition: 'background-color 0.3s'
                }}
              />
              <div
                style={{
                  width: '30px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: forgotStep === 3 ? '#10b981' : '#e2e8f0',
                  transition: 'background-color 0.3s'
                }}
              />
            </div>

            {/* Error & Success Messages */}
            {forgotError && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                <AlertCircle size={18} />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {forgotStep === 1 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px'
                    }}
                  >
                    <KeyRound size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                    Quên mật khẩu?
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Nhập email đã đăng ký của bạn. Chúng tôi sẽ cung cấp mã xác nhận OTP để bạn đặt lại mật khẩu mới.
                  </p>
                </div>

                <form onSubmit={handleRequestOtp}>
                  <div className="form-group">
                    <label htmlFor="forgot-email">
                      Địa chỉ Email tài khoản <span className="required">*</span>
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="example@domain.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={forgotLoading}
                    style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '16px' }}
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" /> Đang tạo mã OTP...
                      </>
                    ) : (
                      'Tiếp tục nhận mã OTP'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Enter OTP & New Password */}
            {forgotStep === 2 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px'
                    }}
                  >
                    <Lock size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                    Thiết lập mật khẩu mới
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Mã xác nhận cho tài khoản <strong>{forgotEmail}</strong>
                  </p>
                </div>

                {/* Demo OTP Banner */}
                {generatedOtp && (
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      marginBottom: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af' }}>
                        ⚡ Mã OTP thử nghiệm hệ thống:
                      </span>
                      <button
                        type="button"
                        onClick={() => setForgotOtp(generatedOtp)}
                        style={{
                          background: '#dbeafe',
                          border: 'none',
                          color: '#1d4ed8',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Điền nhanh mã này
                      </button>
                    </div>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        letterSpacing: '6px',
                        color: '#1d4ed8',
                        textAlign: 'center',
                        backgroundColor: '#ffffff',
                        padding: '6px',
                        borderRadius: '8px',
                        border: '1px dashed #93c5fd'
                      }}
                    >
                      {generatedOtp}
                    </div>
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  <div className="form-group">
                    <label htmlFor="forgot-otp">
                      Mã xác thực OTP (6 chữ số) <span className="required">*</span>
                    </label>
                    <input
                      id="forgot-otp"
                      type="text"
                      maxLength={6}
                      placeholder="Ví dụ: 123456"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      style={{
                        letterSpacing: '4px',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="forgot-new-password">
                      Mật khẩu mới <span className="required">*</span>
                    </label>
                    <div className="password-input-group">
                      <input
                        id="forgot-new-password"
                        type={showForgotNewPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        tabIndex={-1}
                      >
                        {showForgotNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Tối thiểu 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường và 1 số
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="forgot-confirm-password">
                      Xác nhận mật khẩu mới <span className="required">*</span>
                    </label>
                    <div className="password-input-group">
                      <input
                        id="forgot-confirm-password"
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showForgotConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setForgotStep(1)}
                      style={{ padding: '10px 14px' }}
                    >
                      <ArrowLeft size={16} /> Quay lại
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={forgotLoading}
                      style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                    >
                      {forgotLoading ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" /> Đang xử lý...
                        </>
                      ) : (
                        'Đặt lại mật khẩu'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: Success Screen */}
            {forgotStep === 3 && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#ecfdf5',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                  Đổi mật khẩu thành công!
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                  Mật khẩu tài khoản <strong>{forgotEmail}</strong> đã được cập nhật thành công. Thông tin đã được tự động điền vào khung đăng nhập.
                </p>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowForgotModal(false)}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
                >
                  <LogIn size={18} /> Đăng nhập ngay
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
