import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import MapContainer from '@/components/maps/MapContainer';
import MarkerLayer from '@/components/maps/MarkerLayer';
import type { Lead, PaginatedResponse } from '@/types';
import { Plus, Search, Edit2, Trash2, Target, Phone, Mail, Loader2, MapPin } from 'lucide-react';
import { usePermission } from '@/hooks';

export default function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { can } = usePermission();

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        search: search || undefined,
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
      };
      const response = await api.get<PaginatedResponse<Lead>>('/leads', { params });
      setLeads(response.data.data.data);
      setLastPage(response.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentPage, selectedStatus, selectedPriority]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLeads();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete lead.');
    }
  };

  // Convert leads to Marker format for the Map
  const mapMarkers = leads
    .filter((l) => l.latitude && l.longitude)
    .map((l) => ({
      id: l.id,
      position: { lat: l.latitude!, lng: l.longitude! },
      title: l.title,
      label: l.contact_name.charAt(0),
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Leads</h1>
          <p className="text-neutral-500 text-sm">Track and manage prospective customer leads.</p>
        </div>
        {can('leads.create') && (
          <button
            onClick={() => navigate('/crm/leads/create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Create Lead
          </button>
        )}
      </div>

      {/* Map Overview of Leads */}
      {mapMarkers.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
          <h3 className="text-sm font-bold text-neutral-850 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-primary-600" />
            Leads Location Map
          </h3>
          <div className="h-[250px] w-full rounded-xl overflow-hidden border border-neutral-200">
            <MapContainer className="w-full h-full min-h-[250px]">
              {(map) => (
                <MarkerLayer
                  map={map}
                  markers={mapMarkers}
                  onMarkerClick={(id) => navigate(`/crm/leads/${id}/edit`)}
                />
              )}
            </MapContainer>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 min-w-[280px] flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search leads by title, contact, or mobile..."
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
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="assigned">Assigned</option>
            <option value="qualified">Qualified</option>
            <option value="deal_created">Deal Created</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
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
                <th className="px-6 py-4">Lead Title & Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">BDM Assignment</th>
                <th className="px-6 py-4">Territory / Locality</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                        <Target size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{l.title}</p>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone size={12} /> {l.contact_mobile}
                          </span>
                          {l.contact_email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} /> {l.contact_email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border uppercase ${
                        l.status === 'won'
                          ? 'bg-success-50 text-success-700 border-success-100'
                          : l.status === 'lost'
                          ? 'bg-danger-50 text-danger-700 border-danger-100'
                          : l.status === 'assigned'
                          ? 'bg-primary-50 text-primary-700 border-primary-100'
                          : 'bg-warning-50 text-warning-700 border-warning-100'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border uppercase ${
                        l.priority === 'high'
                          ? 'bg-danger-50 text-danger-700 border-danger-100'
                          : l.priority === 'medium'
                          ? 'bg-warning-50 text-warning-700 border-warning-100'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      {l.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {l.assigned_bdm ? (
                      <span className="font-medium text-neutral-900">{l.assigned_bdm.name}</span>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {l.is_mapped ? (
                      <div>
                        <p className="text-xs font-semibold text-neutral-900">{l.territory?.name}</p>
                        <p className="text-[10px] text-neutral-500">{l.locality?.name}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Not Mapped</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {can('leads.update') && (
                      <button
                        onClick={() => navigate(`/crm/leads/${l.id}/edit`)}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {can('leads.delete') && (
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="p-1.5 hover:bg-neutral-100 text-danger-600 hover:text-danger-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No leads found.
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
