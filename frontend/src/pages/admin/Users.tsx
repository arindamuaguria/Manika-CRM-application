import { useState, useEffect } from 'react';
import api from '@/services/api';
import type { User, Role, PaginatedResponse, ApiResponse } from '@/types';
import { UserPlus, Search, Edit2, Shield, UserX, UserCheck, Loader2 } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    is_active: true,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        search: search || undefined,
        role: selectedRole || undefined,
      };
      const response = await api.get<PaginatedResponse<User>>('/users', { params });
      setUsers(response.data.data.data);
      setLastPage(response.data.data.last_page);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get<ApiResponse<Role[]>>('/roles');
      setRoles(response.data.data);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: roles[0]?.name || '',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.roles[0]?.name || '',
      is_active: user.is_active,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    try {
      const updatedStatus = !user.is_active;
      await api.put(`/users/${user.id}`, {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.roles[0]?.name || '',
        is_active: updatedStatus,
      });
      setUsers(users.map((u) => (u.id === user.id ? { ...u, is_active: updatedStatus } : u)));
    } catch (err) {
      console.error('Failed to toggle user status', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    try {
      if (editingUser) {
        // Update
        const response = await api.put<ApiResponse<User>>(`/users/${editingUser.id}`, formData);
        setUsers(users.map((u) => (u.id === editingUser.id ? response.data.data : u)));
      } else {
        // Create
        const response = await api.post<ApiResponse<User>>('/users', formData);
        setUsers([response.data.data, ...users]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save user', err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
          <p className="text-neutral-500 text-sm">Manage system users, roles, and account statuses.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        <select
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email / Phone</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-neutral-950">{user.email}</p>
                    <p className="text-xs text-neutral-500">{user.phone || 'No phone'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                      <Shield size={12} />
                      {user.roles[0]?.name || 'No Role'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        user.is_active
                          ? 'bg-success-50 text-success-700 border-success-100'
                          : 'bg-danger-50 text-danger-700 border-danger-100'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`p-1.5 hover:bg-neutral-100 rounded-lg transition-colors ${
                        user.is_active
                          ? 'text-danger-600 hover:text-danger-700'
                          : 'text-success-600 hover:text-success-700'
                      }`}
                      title={user.is_active ? 'Deactivate User' : 'Activate User'}
                    >
                      {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-neutral-200 bg-neutral-50">
            <p className="text-xs text-neutral-500">
              Page {currentPage} of {lastPage}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 bg-white border border-neutral-200 rounded text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 bg-white border border-neutral-200 rounded text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            <h2 className="text-xl font-bold text-neutral-950 mb-4">
              {editingUser ? 'Edit User' : 'Add User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isSubmitLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
