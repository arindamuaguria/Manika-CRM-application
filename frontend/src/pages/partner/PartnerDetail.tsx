import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { Partner, Locality, ApiResponse } from '@/types';
import { ArrowLeft, Building2, CheckCircle2, AlertCircle, Loader2, MapPin, Check } from 'lucide-react';
import { usePermission } from '@/hooks';

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermission();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [allLocalities, setAllLocalities] = useState<Locality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Coverage Edit State
  const [isEditingCoverage, setIsEditingCoverage] = useState(false);
  const [selectedLocalities, setSelectedLocalities] = useState<number[]>([]);
  const [isCoverageLoading, setIsCoverageLoading] = useState(false);

  const fetchPartnerDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<Partner>>(`/partners/${id}`);
      const p = response.data.data;
      setPartner(p);

      // Initialize selected localities from coverageLocalities relationship
      if (p.coverage_localities) {
        setSelectedLocalities(p.coverage_localities.map((l) => l.id));
      }

      // Fetch all localities in the partner's territory for coverage mapping
      if (p.territory_id) {
        const locRes = await api.get<any>(`/localities?territory_id=${p.territory_id}&per_page=100`);
        setAllLocalities(locRes.data.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load partner details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerDetails();
  }, [id]);

  const handleLocalityToggle = (locId: number) => {
    setSelectedLocalities((prev) =>
      prev.includes(locId) ? prev.filter((id) => id !== locId) : [...prev, locId]
    );
  };

  const handleSaveCoverage = async () => {
    if (!partner) return;

    setIsCoverageLoading(true);
    try {
      await api.post(`/partners/${partner.id}/coverage`, {
        locality_ids: selectedLocalities,
      });
      setIsEditingCoverage(false);
      fetchPartnerDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to update service coverage.');
    } finally {
      setIsCoverageLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="mx-auto text-danger-500" size={48} />
        <h2 className="text-xl font-bold text-neutral-900">Error</h2>
        <p className="text-neutral-500">{error || 'Partner not found.'}</p>
        <button
          onClick={() => navigate('/partners')}
          className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow"
        >
          Back to Partners
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/partners')}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to partners
      </button>

      {/* Header Panel */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl">
            <Building2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">{partner.business_name}</h1>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${
                  partner.status === 'active'
                    ? 'bg-success-50 text-success-700 border-success-100'
                    : partner.status === 'suspended'
                    ? 'bg-danger-50 text-danger-700 border-danger-100'
                    : 'bg-warning-50 text-warning-700 border-warning-100'
                }`}
              >
                {partner.status}
              </span>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              Type: <span className="font-semibold uppercase">{partner.partner_type}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side — Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-bold text-neutral-850 border-b border-neutral-100 pb-3">
              Profile Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-400 text-xs font-medium">Contact Person</p>
                <p className="text-neutral-900 font-semibold mt-1">{partner.contact_name}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs font-medium">Mobile Number</p>
                <p className="text-neutral-900 font-semibold mt-1">{partner.contact_mobile}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs font-medium">Email Address</p>
                <p className="text-neutral-900 font-semibold mt-1">{partner.contact_email}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs font-medium">Territory</p>
                <p className="text-neutral-900 font-semibold mt-1">
                  {partner.territory?.name || 'None'}
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-4">
              <p className="text-neutral-400 text-xs font-medium">Business Address</p>
              <p className="text-neutral-700 text-sm mt-1.5">{partner.business_address}</p>
            </div>
          </div>

          {/* Service Coverage Card (Service Person Only) */}
          {partner.partner_type === 'service_person' && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-bold text-neutral-850">Service Coverage Localities</h3>
                {can('partners.update') && (
                  <button
                    onClick={() => setIsEditingCoverage(!isEditingCoverage)}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
                  >
                    {isEditingCoverage ? 'Cancel' : 'Manage Coverage'}
                  </button>
                )}
              </div>

              {isEditingCoverage ? (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-neutral-500">
                    Select the localities in the {partner.territory?.name} territory that this
                    partner can cover:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {allLocalities.map((loc) => (
                      <label
                        key={loc.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLocalities.includes(loc.id)}
                          onChange={() => handleLocalityToggle(loc.id)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                        />
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">{loc.name}</p>
                          <p className="text-[10px] text-neutral-500">{loc.code}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4 border-t border-neutral-100">
                    <button
                      onClick={handleSaveCoverage}
                      disabled={isCoverageLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer text-xs"
                    >
                      <Check size={14} />
                      {isCoverageLoading ? 'Saving...' : 'Save Coverage'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {partner.coverage_localities && partner.coverage_localities.length > 0 ? (
                    partner.coverage_localities.map((loc) => (
                      <div
                        key={loc.id}
                        className="flex items-center gap-2.5 p-3 bg-success-50/50 border border-success-100 rounded-lg text-success-750"
                      >
                        <CheckCircle2 size={16} className="text-success-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">{loc.name}</p>
                          <p className="text-[10px] opacity-75">{loc.code}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500 italic col-span-2">
                      No service coverage localities assigned yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side — Map Location */}
        {partner.latitude && partner.longitude && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-[300px]">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center gap-2">
              <MapPin size={18} className="text-primary-600" />
              <span className="text-sm font-bold text-neutral-800">Business Location</span>
            </div>
            <div className="flex-1 min-h-[200px]">
              {/* Load static or dynamic map container */}
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center border-dashed border-neutral-300">
                <span className="text-xs font-semibold text-neutral-400">Map View Available</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
