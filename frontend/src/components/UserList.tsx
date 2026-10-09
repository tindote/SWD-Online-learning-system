import React, { useState } from 'react';
import { User } from '../types/user';
import { Edit2, Trash2, Search, Users, AlertCircle, RefreshCw, Shield, UserCheck, GraduationCap } from 'lucide-react';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  onEdit,
  onDelete,
  isLoading,
  error,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  });

  const handleDeleteConfirm = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${name}" không?`)) {
      setDeletingId(id);
      onDelete(id);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return (
          <span className="badge role-badge role-admin">
            <Shield size={14} /> Quản trị viên
          </span>
        );
      case 'instructor':
        return (
          <span className="badge role-badge role-instructor">
            <GraduationCap size={14} /> Giảng viên
          </span>
        );
      default:
        return (
          <span className="badge role-badge role-student">
            <UserCheck size={14} /> Học viên
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="state-card">
        <div className="spinner"></div>
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-error">
        <AlertCircle size={40} />
        <h3>Lỗi tải người dùng</h3>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={onRefresh}>
          <RefreshCw size={16} /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="entity-list-container">
      <div className="list-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng theo họ tên, email, vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>
        <div className="catalog-counter">
          Tổng số: <strong>{filteredUsers.length}</strong> người dùng
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="state-card state-empty">
          <Users size={48} />
          <h3>Không tìm thấy người dùng</h3>
          <p>
            {searchTerm
              ? `Không tìm thấy người dùng phù hợp với từ khóa "${searchTerm}".`
              : 'Danh sách người dùng hiện tại đang trống. Nhấn "Thêm người dùng" để bắt đầu.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="courses-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tham gia</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="td-id">#{user.id}</td>
                  <td className="user-name-cell">{user.name}</td>
                  <td className="user-email-cell">{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td className="date-text">{formatDate(user.created_at)}</td>
                  <td className="td-actions text-right">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(user)}
                      title="Chỉnh sửa người dùng"
                    >
                      <Edit2 size={16} />
                      <span>Sửa</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteConfirm(user.id, user.name)}
                      disabled={deletingId === user.id}
                      title="Xóa người dùng"
                    >
                      <Trash2 size={16} />
                      <span>Xóa</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
