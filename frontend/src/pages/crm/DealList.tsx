import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { Deal, Lead, PaginatedResponse, ApiResponse } from '@/types';
import { Plus, Search, Eye, Trash2, FileText, Loader2 } from 'lucide-react';
import { usePermission } from '@/hooks';

export default function DealList() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { can } = usePermission();

  // Create Deal Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [dealTitle, setDealTitle] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [dealDescription, setDealDescription] = useState('');
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        search: search || undefined,
        status: selectedStatus || undefined,
      };
      const response = await api.get<PaginatedResponse<Deal>>('/deals', { params });
      setDeals(response.data.data.data);
      setLastPage(response.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableLeads = async () => {
    try {
      // Fetch leads that are assigned/qualified and don't have deals yet
      const response = await api.get<PaginatedResponse<Lead>>('/leads?per_page=100');
      // Filter out leads that are already won/lost or already have a deal
      const filtered = response.data.data.data.filter(
        (l) => l.status === 'assigned' || l.status === 'qualified'
      );
      setLeads(filtered);
      if (filtered.length > 0) {
        setSelectedLeadId(filtered[0].id.toString());
        setDealTitle(`${filtered[0].title} - Deal`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [currentPage, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDeals();
  };

  const handleOpenCreateModal = () => {
    fetchAvailableLeads();
    setDealValue('');
    setDealDescription('');
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lId = e.target.value;
    setSelectedLeadId(lId);
    const lead = leads.find((l) => l.id.toString() === lId);
    if (lead) {
      setDealTitle(`${lead.title} - Deal`);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !dealTitle || !dealValue) return;

    setIsCreateLoading(true);
    setCreateError(null);
    try {
      const response = await api.post<ApiResponse<Deal>>('/deals', {
        lead_id: parseInt(selectedLeadId),
        title: dealTitle,
        value: parseFloat(dealValue),
        description: dealDescription,
      });
      setIsCreateModalOpen(false);
      navigate(`/crm/deals/${response.data.data.id}`);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create deal.');
    } finally {
      setIsCreateLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      await api.delete(`/deals/${id}`);
      fetchDeals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete deal.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Deals Pipeline</h1>
          <p className="text-neutral-500 text-sm">Convert qualified leads and manage contract verification.</p>
        </div>
        {can('deals.create') && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Create Deal
          </button>
        )}
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search deals by title..."
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
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="documentation">Documentation</option>
          <option value="verification">Verification</option>
          <option value="approval">Approval</option>
          <option value="won">Won (Approved)</option>
          <option value="lost">Lost (Rejected)</option>
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
                <th className="px-6 py-4">Deal Title & Lead</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">BDM</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {deals.map((d) => (
                <tr key={d.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{d.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Lead: {d.lead?.contact_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-neutral-900">
                    ₹{(d.value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border uppercase ${
                        d.status === 'won'
                          ? 'bg-success-50 text-success-700 border-success-100'
                          : d.status === 'lost'
                          ? 'bg-danger-50 text-danger-700 border-danger-100'
                          : d.status === 'approval'
                          ? 'bg-purple-50 text-purple-700 border-purple-100'
                          : 'bg-warning-50 text-warning-700 border-warning-100'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        d.verification_status === 'verified'
                          ? 'bg-success-50 text-success-700 border-success-100'
                          : d.verification_status === 'rejected'
                          ? 'bg-danger-50 text-danger-700 border-danger-100'
                          : 'bg-neutral-55 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {d.verification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{d.assigned_bdm?.name}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/crm/deals/${d.id}`)}
                      className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
                      title="View Details & Documents"
                    >
                      <Eye size={16} />
                    </button>
                    {can('deals.delete') && (
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 hover:bg-neutral-100 text-danger-600 hover:text-danger-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {deals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No deals found.
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

      {/* Create Deal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in">
            <h2 className="text-xl font-bold text-neutral-950 mb-4">Create New Deal</h2>
            {createError && (
              <div className="mb-4 p-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-xs">
                {createError}
              </div>
            )}
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Select Lead
                </label>
                {leads.length > 0 ? (
                  <select
                    required
                    value={selectedLeadId}
                    onChange={handleLeadChange}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.contact_name})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-danger-600 italic">
                    No qualified or assigned leads available without deals.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Deal Title
                </label>
                <input
                  type="text"
                  required
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Deal Value (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-400">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="50000.00"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={dealDescription}
                  onChange={(e) => setDealDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreateLoading || leads.length === 0}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isCreateLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
