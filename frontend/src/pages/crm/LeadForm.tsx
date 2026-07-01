import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import MapContainer from '@/components/maps/MapContainer';
import type { Lead, ApiResponse, User } from '@/types';
import { ArrowLeft, Loader2, MapPin, CheckCircle2, XCircle, Building2, User as UserIcon, DollarSign } from 'lucide-react';

export default function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    contact_name: '',
    job_title: '',
    contact_email: '',
    contact_mobile: '',
    alternate_mobile: '',
    company_name: '',
    industry: '',
    company_size: '',
    website: '',
    linkedin_url: '',
    address: '',
    latitude: 20.5937, // Default India center
    longitude: 78.9629,
    priority: 'medium',
    source: 'Direct',
    estimated_deal_value: '',
    preferred_contact_method: 'phone',
    notes: '',
    status: 'new',
    assigned_bdm_id: '' as string | number,
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
  });

  const [bdms, setBdms] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time resolved geo chain details
  const [isResolvingGeo, setIsResolvingGeo] = useState(false);
  const [resolvedGeo, setResolvedGeo] = useState<{
    localityName: string | null;
    territoryName: string | null;
    bdmName: string | null;
    isMapped: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchBdms = async () => {
      try {
        const response = await api.get('/users?role=BDM&per_page=100');
        setBdms(response.data.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBdms();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const fetchLead = async () => {
        setIsLoading(true);
        try {
          const response = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
          const lead = response.data.data;
          setFormData({
            title: lead.title,
            contact_name: lead.contact_name,
            job_title: lead.job_title || '',
            contact_email: lead.contact_email || '',
            contact_mobile: lead.contact_mobile,
            alternate_mobile: lead.alternate_mobile || '',
            company_name: lead.company_name || '',
            industry: lead.industry || '',
            company_size: lead.company_size || '',
            website: lead.website || '',
            linkedin_url: lead.linkedin_url || '',
            address: lead.address || '',
            latitude: lead.latitude || 20.5937,
            longitude: lead.longitude || 78.9629,
            priority: lead.priority,
            source: lead.source || 'Direct',
            estimated_deal_value: lead.estimated_deal_value ? lead.estimated_deal_value.toString() : '',
            preferred_contact_method: lead.preferred_contact_method || 'phone',
            notes: lead.notes || '',
            status: lead.status,
            assigned_bdm_id: lead.assigned_bdm_id || '',
            utm_source: lead.utm_source || '',
            utm_medium: lead.utm_medium || '',
            utm_campaign: lead.utm_campaign || '',
          });

          if (lead.is_mapped) {
            setResolvedGeo({
              localityName: lead.locality?.name || null,
              territoryName: lead.territory?.name || null,
              bdmName: lead.assigned_bdm?.name || null,
              isMapped: true,
            });
          }
        } catch (err) {
          console.error(err);
          setError('Failed to load lead details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchLead();
    }
  }, [id, isEdit]);

  // Run real-time geo identification when coordinates change
  const resolveGeoLocation = async (lat: number, lng: number) => {
    setIsResolvingGeo(true);
    try {
      const response = await api.post('/geo/identify', {
        latitude: lat,
        longitude: lng,
      });
      const data = response.data.data;
      if (data.is_mapped) {
        setResolvedGeo({
          localityName: data.locality.name,
          territoryName: data.territory.name,
          bdmName: data.bdm ? data.bdm.name : null,
          isMapped: true,
        });
        if (data.bdm) {
          setFormData((prev) => ({ ...prev, assigned_bdm_id: data.bdm.id }));
        }
      } else {
        setResolvedGeo({
          localityName: null,
          territoryName: null,
          bdmName: null,
          isMapped: false,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResolvingGeo(false);
    }
  };

  const handleMapClick = (map: google.maps.Map) => {
    let marker: google.maps.Marker | null = null;

    // Show initial marker if editing or coordinates are set
    if (isEdit || (formData.latitude !== 20.5937 && formData.longitude !== 78.9629)) {
      marker = new google.maps.Marker({
        position: { lat: formData.latitude, lng: formData.longitude },
        map,
        draggable: true,
      });
      map.setCenter({ lat: formData.latitude, lng: formData.longitude });
      map.setZoom(14);
    }

    const onPositionSelect = (lat: number, lng: number) => {
      setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      resolveGeoLocation(lat, lng);
    };

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (marker) {
        marker.setPosition({ lat, lng });
      } else {
        marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          draggable: true,
        });
      }

      onPositionSelect(lat, lng);

      marker.addListener('dragend', () => {
        const pos = marker!.getPosition();
        if (pos) {
          onPositionSelect(pos.lat(), pos.lng());
        }
      });
    });

    if (marker) {
      marker.addListener('dragend', () => {
        const pos = marker!.getPosition();
        if (pos) {
          onPositionSelect(pos.lat(), pos.lng());
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitLoading(true);

    try {
      const submitData = {
        ...formData,
        estimated_deal_value: formData.estimated_deal_value ? parseFloat(formData.estimated_deal_value) : null,
      };

      if (isEdit) {
        await api.put(`/leads/${id}`, submitData);
      } else {
        await api.post('/leads', submitData);
      }
      navigate('/crm/leads');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save lead.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/crm/leads')}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to leads
      </button>

      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {isEdit ? 'Edit Lead' : 'Create Lead'}
        </h1>
        <p className="text-neutral-500 text-sm">
          {isEdit ? 'Update lead details and mapping.' : 'Capture lead contact details and map coordinates.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side — Grouped Information Cards (Parallel layout) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          
          {/* Card 1: Lead Title & Business Information */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-150 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <Building2 size={16} />
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 text-sm">Business Information</h3>
                <p className="text-xs text-neutral-500">Lead title and company details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  Lead Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Office Coffee Machine"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                    Industry
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Retail">Retail / E-commerce</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance & Banking</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Services">Professional Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                    Company Size
                  </label>
                  <select
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                  >
                    <option value="">Select Size</option>
                    <option value="1-10">1 - 10 employees</option>
                    <option value="11-50">11 - 50 employees</option>
                    <option value="51-200">51 - 200 employees</option>
                    <option value="201-500">201 - 500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="e.g. www.company.com"
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Contact / Personal Information */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-150 pb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-600">
                <UserIcon size={16} />
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 text-sm">Personal Information</h3>
                <p className="text-xs text-neutral-500">Primary and secondary contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="e.g. Procurement Manager"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_mobile}
                  onChange={(e) => setFormData({ ...formData, contact_mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  Alternate Mobile
                </label>
                <input
                  type="text"
                  value={formData.alternate_mobile}
                  onChange={(e) => setFormData({ ...formData, alternate_mobile: e.target.value })}
                  placeholder="Optional secondary phone"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="e.g. john@company.com"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="e.g. linkedin.com/in/username"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Lead Metrics & Status */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-150 pb-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-600">
                <DollarSign size={16} />
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 text-sm">Lead Metrics & Context</h3>
                <p className="text-xs text-neutral-500">Prioritization, marketing context, and notes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  Estimated Deal Value ($)
                </label>
                <input
                  type="number"
                  value={formData.estimated_deal_value}
                  onChange={(e) => setFormData({ ...formData, estimated_deal_value: e.target.value })}
                  placeholder="e.g. 10000"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  Preferred Contact Method
                </label>
                <select
                  value={formData.preferred_contact_method}
                  onChange={(e) => setFormData({ ...formData, preferred_contact_method: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                >
                  <option value="phone">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  Source
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              {isEdit && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                    >
                      <option value="new">New</option>
                      <option value="assigned">Assigned</option>
                      <option value="qualified">Qualified</option>
                      <option value="deal_created">Deal Created</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                      Override BDM
                    </label>
                    <select
                      value={formData.assigned_bdm_id}
                      onChange={(e) => setFormData({ ...formData, assigned_bdm_id: e.target.value })}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                    >
                      <option value="">Unassigned</option>
                      {bdms.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                  Describe Requirements / Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Provide additional details or requirements..."
                  rows={3}
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side — Google Maps Location Selector (Aligned parallel in 12-column grid) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary-600" />
                <span className="text-sm font-bold text-neutral-800">Pin Lead Location</span>
              </div>
              {isResolvingGeo && (
                <span className="text-xs text-neutral-500 animate-pulse">Resolving assignment...</span>
              )}
            </div>

            <div className="flex-1 min-h-[420px] relative">
              <MapContainer className="w-full h-full min-h-[420px]">
                {(map) => {
                  handleMapClick(map);
                  return null;
                }}
              </MapContainer>
            </div>

            {/* Business Address Textarea */}
            <div className="p-4 border-t border-neutral-150 bg-white">
              <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
                Business Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Pin on the map or enter address manually..."
                rows={2}
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            {/* Real-Time Assignment Results Panel */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-4">
              {resolvedGeo ? (
                resolvedGeo.isMapped ? (
                  <div className="flex items-start gap-3 text-success-750">
                    <CheckCircle2 size={20} className="text-success-600 mt-0.5 animate-scale-up" />
                    <div>
                      <p className="text-sm font-bold">Location Auto-Matched Successfully</p>
                      <div className="text-xs text-neutral-600 mt-0.5 space-y-0.5">
                        <p>
                          <span className="font-semibold text-neutral-700">Locality:</span>{' '}
                          {resolvedGeo.localityName}
                        </p>
                        <p>
                          <span className="font-semibold text-neutral-700">Territory:</span>{' '}
                          {resolvedGeo.territoryName}
                        </p>
                        <p>
                          <span className="font-semibold text-neutral-700">Auto-Assigned BDM:</span>{' '}
                          {resolvedGeo.bdmName || 'None (No BDM assigned to territory)'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-warning-750">
                    <XCircle size={20} className="text-warning-600 mt-0.5 animate-scale-up" />
                    <div>
                      <p className="text-sm font-bold">Unmapped Location</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        This location does not fall inside any registered locality. It will remain in{' '}
                        <span className="font-semibold text-neutral-700">New</span> status.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-xs text-neutral-550">
                  Click on the map to set the lead's location. The system will automatically resolve
                  geographic boundaries and auto-assign the BDM.
                </div>
              )}
            </div>
          </div>

          {/* Form Action Buttons (Fixed at the bottom of the map/form layout) */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 space-y-4">
            {error && (
              <div className="p-3.5 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-xs">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/crm/leads')}
                className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-750 font-semibold rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitLoading}
                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl shadow-sm transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                {isSubmitLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Lead'
                )}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
