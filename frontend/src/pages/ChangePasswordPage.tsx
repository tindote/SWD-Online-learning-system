import React, { useState } from 'react';
import { authApi } from '../services/authApi';
import { KeyRound, ShieldCheck, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const isMatch = newPassword === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Vui lòng điền đầy đủ các trường' });
      return;
    }

    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) {
      setStatusMessage({ type: 'error', text: 'Mật khẩu mới chưa đáp ứng tiêu chuẩn bảo mật' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });

      setStatusMessage({ type: 'success', text: res.message || 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi khi đổi mật khẩu'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Đổi mật khẩu</h1>
          <p className="page-subtitle">Bảo vệ tài khoản của bạn với mật khẩu an toàn</p>
        </div>
      </div>

      {statusMessage && (
        <div className={`alert alert-${statusMessage.type}`}>
          {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="current-pw">
              Mật khẩu hiện tại <span className="required">*</span>
            </label>
            <div className="password-input-group">
              <input
                id="current-pw"
                type={showCurrent ? 'text' : 'password'}
                placeholder="Nhập mật khẩu hiện tại của bạn"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowCurrent(!showCurrent)}
                title={showCurrent ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="new-pw">
              Mật khẩu mới <span className="required">*</span>
            </label>
            <div className="password-input-group">
              <input
                id="new-pw"
                type={showNew ? 'text' : 'password'}
                placeholder="Tối thiểu 8 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNew(!showNew)}
                title={showNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-new-pw">
              Xác nhận mật khẩu mới <span className="required">*</span>
            </label>
            <div className="password-input-group">
              <input
                id="confirm-new-pw"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirm(!showConfirm)}
                title={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Validation Hints */}
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Yêu cầu mật khẩu an toàn:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <span style={{ color: hasMinLength ? '#15803d' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Tối thiểu 8 ký tự
              </span>
              <span style={{ color: hasUpper ? '#15803d' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Ít nhất 1 chữ hoa
              </span>
              <span style={{ color: hasLower ? '#15803d' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Ít nhất 1 chữ thường
              </span>
              <span style={{ color: hasNumber ? '#15803d' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Ít nhất 1 chữ số
              </span>
            </div>
            {confirmPassword && (
              <div style={{ marginTop: '6px', color: isMatch ? '#15803d' : '#dc2626', fontWeight: 500 }}>
                {isMatch ? '✓ Mật khẩu mới trùng khớp' : '✕ Mật khẩu mới chưa khớp'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <KeyRound size={16} /> {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
