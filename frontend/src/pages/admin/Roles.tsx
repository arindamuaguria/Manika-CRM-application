import { useState, useEffect } from 'react';
import api from '@/services/api';
import type { Role, Permission, ApiResponse } from '@/types';
import { ShieldAlert, Plus, Shield, Check, Loader2 } from 'lucide-react';

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const fetchRolesAndPermissions = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permRes] = await Promise.all([
        api.get<ApiResponse<Role[]>>('/roles'),
        api.get<ApiResponse<Permission[]>>('/permissions'),
      ]);
      setRoles(rolesRes.data.data);
      setPermissions(permRes.data.data);
    } catch (err) {
      console.error('Failed to fetch roles & permissions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setRoleName('');
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: Role) => {
    if (role.name === 'Admin') {
      alert('The Admin role cannot be edited.');
      return;
    }
    setEditingRole(role);
    setRoleName(role.name);
    setSelectedPermissions(role.permissions.map((p) => p.name));
    setIsModalOpen(true);
  };

  const handlePermissionToggle = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;

    setIsSubmitLoading(true);
    try {
      if (editingRole) {
        // Update
        const response = await api.put<ApiResponse<Role>>(`/roles/${editingRole.id}`, {
          name: roleName,
          permissions: selectedPermissions,
        });
        setRoles(roles.map((r) => (r.id === editingRole.id ? response.data.data : r)));
      } else {
        // Create
        const response = await api.post<ApiResponse<Role>>('/roles', {
          name: roleName,
          permissions: selectedPermissions,
        });
        setRoles([...roles, response.data.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save role', err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Group permissions by module/category
  const getPermissionGroups = () => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach((p) => {
      const parts = p.name.split('.');
      const groupName = parts[0] ? parts[0].toUpperCase() : 'GENERAL';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(p);
    });
    return groups;
  };

  const permissionGroups = getPermissionGroups();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Role & Permission Management</h1>
          <p className="text-neutral-500 text-sm">Define roles and assign fine-grained permissions.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Create Role
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="p-6 border-b border-neutral-150 bg-neutral-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <Shield className="text-primary-600" size={20} />
                  <h3 className="font-bold text-neutral-900 text-lg">{role.name}</h3>
                </div>
                {role.name !== 'Admin' && (
                  <button
                    onClick={() => handleOpenEditModal(role)}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Edit Permissions
                  </button>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                    Permissions ({role.permissions.length})
                  </h4>
                  {role.name === 'Admin' ? (
                    <div className="p-4 bg-primary-50/50 border border-primary-100 text-primary-800 rounded-xl flex items-center gap-3 text-sm">
                      <ShieldAlert className="shrink-0 text-primary-600" size={18} />
                      <span>This role inherits all system permissions by default.</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {role.permissions.map((p) => (
                        <span
                          key={p.id}
                          className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-xs border border-neutral-200"
                        >
                          {p.name}
                        </span>
                      ))}
                      {role.permissions.length === 0 && (
                        <p className="text-sm text-neutral-500 italic">No permissions assigned.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-bold text-neutral-950 mb-4">
              {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Role'}
            </h2>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingRole}
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Sales Manager"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-100"
                />
              </div>

              {/* Permissions Selector */}
              <div className="flex-1 overflow-y-auto border border-neutral-200 rounded-xl p-4 space-y-6 bg-neutral-50/50">
                <label className="block text-xs font-semibold text-neutral-500 uppercase">
                  Assign Permissions
                </label>

                {Object.entries(permissionGroups).map(([group, perms]) => (
                  <div key={group} className="space-y-2.5">
                    <h4 className="text-xs font-bold text-neutral-700 border-b border-neutral-200 pb-1 uppercase tracking-wider">
                      {group}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {perms.map((p) => {
                        const isChecked = selectedPermissions.includes(p.name);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handlePermissionToggle(p.name)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-primary-50 border-primary-200 text-primary-900 font-semibold'
                                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                            }`}
                          >
                            <span className="truncate mr-1">{p.name}</span>
                            {isChecked && <Check size={14} className="text-primary-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
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
