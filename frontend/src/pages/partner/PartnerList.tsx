import { useState, useEffect } from 'react';
import { useNavigate as useAppNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { Partner, Deal, PaginatedResponse, ApiResponse } from '@/types';
import { Plus, Search, Eye, Trash2, Building2, Phone, Loader2 } from 'lucide-react';
import { usePermission } from '@/hooks';

export default function PartnerList() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useAppNavigate();
  const { can } = usePermission();

  // Onboard Partner Modal State
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [wonDeals, setWonDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState('');
  const [partnerType, setPartnerType] = useState<'seller' | 'service_person'>('seller');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [isOnboardLoading, setIsOnboardLoading] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        search: search || undefined,
        partner_type: selectedType || undefined,
        status: selectedStatus || undefined,
      };
      const response = await api.get<PaginatedResponse<Partner>>('/partners', { params });
      setPartners(response.data.data.data);
      setLastPage(response.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWonDeals = async () => {
    try {
      const response = await api.get<PaginatedResponse<Deal>>('/deals?status=won&per_page=100');
      // Filter out deals that already have a partner profile
      setWonDeals(response.data.data.data);
      if (response.data.data.data.length > 0) {
        setSelectedDealId(response.data.data.data[0].id.toString());
        setBusinessName(`${response.data.data.data[0].title} Business`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [currentPage, selectedType, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPartners();
  };

  const handleOpenOnboardModal = () => {
    fetchWonDeals();
    setBusinessAddress('');
    setOnboardError(null);
    setIsOnboardModalOpen(true);
  };

  const handleDealChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dId = e.target.value;
    setSelectedDealId(dId);
    const deal = wonDeals.find((d) => d.id.toString() === dId);
    if (deal) {
      setBusinessName(`${deal.title} Business`);
    }
  };

  const handleOnboardPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealId || !businessName || !businessAddress) return;

    setIsOnboardLoading(true);
    setOnboardError(null);
    try {
      const response = await api.post<ApiResponse<Partner>>('/partners', {
        deal_id: parseInt(selectedDealId),
        partner_type: partnerType,
        business_name: businessName,
        business_address: businessAddress,
      });
      setIsOnboardModalOpen(false);
      navigate(`/partners/${response.data.data.id}`);
    } catch (err: any) {
      setOnboardError(err.response?.data?.message || 'Failed to onboard partner.');
    } finally {
      setIsOnboardLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this partner profile?')) return;
    try {
      await api.delete(`/partners/${id}`);
      fetchPartners();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete partner.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Partner Management</h1>
          <p className="text-neutral-500 text-sm">Manage onboarded Sellers and Service Persons.</p>
        </div>
        {can('partners.convert') && (
          <button
            onClick={handleOpenOnboardModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Onboard Partner
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 min-w-[280px] flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search partners by business or contact name..."
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

        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Types</option>
            <option value="seller">Seller</option>
            <option value="service_person">Service Person</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
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
                <th className="px-6 py-4">Business & Contact</th>
                <th className="px-6 py-4">Partner Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Territory / Locality</th>
                <th className="px-6 py-4">Onboarded At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{p.business_name}</p>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                          <span className="font-medium text-neutral-700">{p.contact_name}</span>
                          <span className="flex items-center gap-1">
                            <Phone size={12} /> {p.contact_mobile}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 uppercase font-medium text-xs text-neutral-600">
                    {p.partner_type === 'seller' ? 'Seller' : 'Service Person'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border uppercase ${
                        p.status === 'active'
                          ? 'bg-success-50 text-success-700 border-success-100'
                          : p.status === 'suspended'
                          ? 'bg-danger-50 text-danger-700 border-danger-100'
                          : 'bg-warning-50 text-warning-700 border-warning-100'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">{p.territory?.name}</p>
                      <p className="text-[10px] text-neutral-500">{p.locality?.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    {p.onboarded_at ? new Date(p.onboarded_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/partners/${p.id}`)}
                      className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
                      title="View Details & Coverage"
                    >
                      <Eye size={16} />
                    </button>
                    {can('partners.delete') && (
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 hover:bg-neutral-100 text-danger-600 hover:text-danger-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No partners found.
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

      {/* Onboard Partner Modal */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in">
            <h2 className="text-xl font-bold text-neutral-950 mb-4">Onboard Approved Partner</h2>
            {onboardError && (
              <div className="mb-4 p-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-xs">
                {onboardError}
              </div>
            )}
            <form onSubmit={handleOnboardPartner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Select Approved Deal
                </label>
                {wonDeals.length > 0 ? (
                  <select
                    required
                    value={selectedDealId}
                    onChange={handleDealChange}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {wonDeals.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} (Value: ₹{(d.value ?? 0).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-danger-600 italic">
                    No approved (won) deals available for onboarding.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Partner Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="partner_type"
                      value="seller"
                      checked={partnerType === 'seller'}
                      onChange={() => setPartnerType('seller')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    Seller
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="partner_type"
                      value="service_person"
                      checked={partnerType === 'service_person'}
                      onChange={() => setPartnerType('service_person')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    Service Person
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Business Address
                </label>
                <textarea
                  required
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOnboardLoading || wonDeals.length === 0}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isOnboardLoading ? 'Onboarding...' : 'Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
