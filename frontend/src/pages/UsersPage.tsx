import React, { useState, useEffect } from 'react';
import { User, UserFormData } from '../types/user';
import { userApi } from '../services/userApi';
import { UserList } from '../components/UserList';
import { UserForm } from '../components/UserForm';
import { Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.response?.data?.message || err.message || 'Không thể kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setUserToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setUserToEdit(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setUserToEdit(null);
  };

  const handleFormSubmit = async (formData: UserFormData) => {
    setIsSubmitting(true);
    try {
      if (userToEdit) {
        await userApi.updateUser(userToEdit.id, formData);
        showToast(`Cập nhật người dùng "${formData.name}" thành công!`, 'success');
      } else {
        await userApi.createUser(formData);
        showToast(`Thêm người dùng "${formData.name}" thành công!`, 'success');
      }
      handleCloseForm();
      await fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Thao tác thất bại';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await userApi.deleteUser(id);
      showToast('Xóa người dùng thành công!', 'success');
      await fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa người dùng';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="page-container">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h2 className="page-title">Quản lý người dùng</h2>
          <p className="page-subtitle">Quản lý thông tin học viên, giảng viên và quản trị viên trong hệ thống</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchUsers} title="Làm mới danh sách">
            <RefreshCw size={18} /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={20} /> Thêm người dùng
          </button>
        </div>
      </div>

      <UserList
        users={users}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteUser}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchUsers}
      />

      {isFormOpen && (
        <UserForm
          userToEdit={userToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
