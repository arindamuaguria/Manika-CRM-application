import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { Territory, Division, User, PaginatedResponse, ApiResponse } from '@/types';
import { Plus, Search, Edit2, Trash2, Map, Users, Loader2 } from 'lucide-react';
import { usePermission } from '@/hooks';

export default function TerritoryList() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [bdms, setBdms] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { can, isAdmin } = usePermission();

  // Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTerritory, setAssigningTerritory] = useState<Territory | null>(null);
  const [selectedBdmId, setSelectedBdmId] = useState('');
  const [isAssignLoading, setIsAssignLoading] = useState(false);

  const fetchTerritories = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        search: search || undefined,
        division_id: selectedDivision || undefined,
      };
      const response = await api.get<PaginatedResponse<Territory>>('/territories', { params });
      setTerritories(response.data.data.data);
      setLastPage(response.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDivisionsAndBdms = async () => {
    try {
      const [divRes, bdmRes] = await Promise.all([
        api.get<ApiResponse<Division[]>>('/divisions?per_page=100'),
        api.get<PaginatedResponse<User>>('/users?role=BDM&per_page=100'),
      ]);
      setDivisions(divRes.data.data);
      setBdms(bdmRes.data.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTerritories();
  }, [currentPage, selectedDivision]);

  useEffect(() => {
    fetchDivisionsAndBdms();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTerritories();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this territory?')) return;
    try {
      await api.delete(`/territories/${id}`);
      fetchTerritories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete territory.');
    }
  };

  const handleOpenAssignModal = (t: Territory) => {
    setAssigningTerritory(t);
    setSelectedBdmId(t.active_assignment?.user_id?.toString() || '');
    setIsAssignModalOpen(true);
  };

  const handleAssignBdm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTerritory || !selectedBdmId) return;

    setIsAssignLoading(true);
    try {
      await api.post(`/territories/${assigningTerritory.id}/assign-bdm`, {
        user_id: parseInt(selectedBdmId),
      });
      setIsAssignModalOpen(false);
      fetchTerritories();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssignLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Territories</h1>
          <p className="text-neutral-500 text-sm">Manage geographic territories and BDM assignments.</p>
        </div>
        {can('territories.create') && (
          <button
            onClick={() => navigate('/geography/territories/create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Create Territory
          </button>
        )}
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search territories by name or code..."
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
          value={selectedDivision}
          onChange={(e) => {
            setSelectedDivision(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Divisions</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase">
                <th className="px-6 py-4">Territory Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Division</th>
                <th className="px-6 py-4">Assigned BDM</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {territories.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                        <Map size={18} />
                      </div>
                      <p className="font-semibold text-neutral-900">{t.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-neutral-600">{t.code}</td>
                  <td className="px-6 py-4 text-neutral-600">{t.division?.name}</td>
                  <td className="px-6 py-4">
                    {t.active_assignment?.user ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-bold">
                          {t.active_assignment.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-neutral-900">
                          {t.active_assignment.user.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        t.is_active
                          ? 'bg-success-50 text-success-700 border-success-100'
                          : 'bg-danger-50 text-danger-700 border-danger-100'
                      }`}
                    >
                      {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {isAdmin() && (
                      <button
                        onClick={() => handleOpenAssignModal(t)}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
                        title="Assign BDM"
                      >
                        <Users size={16} />
                      </button>
                    )}
                    {can('territories.update') && (
                      <button
                        onClick={() => navigate(`/geography/territories/${t.id}/edit`)}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {can('territories.delete') && (
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 hover:bg-neutral-100 text-danger-600 hover:text-danger-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {territories.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No territories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

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

      {/* Assign BDM Modal */}
      {isAssignModalOpen && assigningTerritory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            <h2 className="text-xl font-bold text-neutral-950 mb-4">
              Assign BDM — {assigningTerritory.name}
            </h2>
            <form onSubmit={handleAssignBdm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Select BDM
                </label>
                <select
                  required
                  value={selectedBdmId}
                  onChange={(e) => setSelectedBdmId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">-- Choose BDM --</option>
                  {bdms.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssignLoading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isAssignLoading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
