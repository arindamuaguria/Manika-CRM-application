import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { Locality, Territory, PaginatedResponse, ApiResponse } from '@/types';
import { Plus, Search, Edit2, Trash2, MapPin, Loader2 } from 'lucide-react';
import { usePermission } from '@/hooks';

export default function LocalityList() {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { can } = usePermission();

  const fetchLocalities = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        search: search || undefined,
        territory_id: selectedTerritory || undefined,
      };
      const response = await api.get<PaginatedResponse<Locality>>('/localities', { params });
      setLocalities(response.data.data.data);
      setLastPage(response.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTerritories = async () => {
    try {
      const response = await api.get<ApiResponse<Territory[]>>('/territories?per_page=100');
      setTerritories(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLocalities();
  }, [currentPage, selectedTerritory]);

  useEffect(() => {
    fetchTerritories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLocalities();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this locality?')) return;
    try {
      await api.delete(`/localities/${id}`);
      fetchLocalities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete locality.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Localities</h1>
          <p className="text-neutral-500 text-sm">Manage localities within territories.</p>
        </div>
        {can('localities.create') && (
          <button
            onClick={() => navigate('/geography/localities/create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Create Locality
          </button>
        )}
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search localities by name or code..."
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
          value={selectedTerritory}
          onChange={(e) => {
            setSelectedTerritory(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Territories</option>
          {territories.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
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
                <th className="px-6 py-4">Locality Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Territory</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {localities.map((loc) => (
                <tr key={loc.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                        <MapPin size={18} />
                      </div>
                      <p className="font-semibold text-neutral-900">{loc.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-neutral-600">{loc.code}</td>
                  <td className="px-6 py-4 text-neutral-600">{loc.territory?.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        loc.is_active
                          ? 'bg-success-50 text-success-700 border-success-100'
                          : 'bg-danger-50 text-danger-700 border-danger-100'
                      }`}
                    >
                      {loc.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {can('localities.update') && (
                      <button
                        onClick={() => navigate(`/geography/localities/${loc.id}/edit`)}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {can('localities.delete') && (
                      <button
                        onClick={() => handleDelete(loc.id)}
                        className="p-1.5 hover:bg-neutral-100 text-danger-600 hover:text-danger-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {localities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    No localities found.
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
    </div>
  );
}
