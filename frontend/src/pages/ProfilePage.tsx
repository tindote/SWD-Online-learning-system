import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import { User, Mail, Shield, Save, CheckCircle, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Họ và tên không được để trống' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      const updated = await authApi.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar.trim()
      });
      updateUser(updated);
      setStatusMessage({ type: 'success', text: 'Cập nhật thông tin hồ sơ thành công!' });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hồ sơ cá nhân</h1>
          <p className="page-subtitle">Quản lý và cập nhật thông tin tài khoản của bạn</p>
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
        {/* User Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 800
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>{user?.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <span className={`badge role-${user?.role || 'student'}`} style={{ textTransform: 'capitalize' }}>
                {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} /> {user?.email}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="profile-email">Địa chỉ Email (Cố định định danh)</label>
            <input
              id="profile-email"
              type="email"
              value={user?.email || ''}
              disabled
              style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-role">Vai trò tài khoản</label>
            <input
              id="profile-role"
              type="text"
              value={user?.role === 'admin' ? 'Quản trị viên hệ thống' : user?.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
              disabled
              style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-name">
              Họ và tên hiển thị <span className="required">*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-avatar">Đường dẫn ảnh đại diện (Avatar URL)</label>
            <input
              id="profile-avatar"
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-bio">Tiểu sử / Giới thiệu bản thân</label>
            <textarea
              id="profile-bio"
              rows={4}
              placeholder="Chia sẻ đôi nét về mục tiêu học tập, kinh nghiệm hoặc kỹ năng của bạn..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
