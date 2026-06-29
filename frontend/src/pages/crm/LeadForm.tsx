import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import MapContainer from '@/components/maps/MapContainer';
import type { Lead, ApiResponse, User } from '@/types';
import { ArrowLeft, Loader2, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export default function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    contact_name: '',
    contact_email: '',
    contact_mobile: '',
    address: '',
    latitude: 20.5937, // Default India center
    longitude: 78.9629,
    priority: 'medium',
    source: 'Direct',
    notes: '',
    status: 'new',
    assigned_bdm_id: '' as string | number,
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
            contact_email: lead.contact_email || '',
            contact_mobile: lead.contact_mobile,
            address: lead.address || '',
            latitude: lead.latitude || 20.5937,
            longitude: lead.longitude || 78.9629,
            priority: lead.priority,
            source: lead.source || 'Direct',
            notes: lead.notes || '',
            status: lead.status,
            assigned_bdm_id: lead.assigned_bdm_id || '',
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

    // Show initial marker if editing
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
      if (isEdit) {
        await api.put(`/leads/${id}`, formData);
      } else {
        await api.post('/leads', formData);
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
    <div className="max-w-5xl mx-auto space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side — Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                Lead Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Office Coffee Machine"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Mobile
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_mobile}
                  onChange={(e) => setFormData({ ...formData, contact_mobile: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Source
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            {isEdit && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
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
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                    Override BDM
                  </label>
                  <select
                    value={formData.assigned_bdm_id}
                    onChange={(e) => setFormData({ ...formData, assigned_bdm_id: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                  >
                    <option value="">Unassigned</option>
                    {bdms.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-xs">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => navigate('/crm/leads')}
                className="flex-1 px-4 py-2 border border-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitLoading}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {isSubmitLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side — Google Maps Location Selector & Real-Time Geo Assignment */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary-600" />
              <span className="text-sm font-bold text-neutral-800">Pin Lead Location</span>
            </div>
            {isResolvingGeo && (
              <span className="text-xs text-neutral-500 animate-pulse">Resolving assignment...</span>
            )}
          </div>

          <div className="flex-1 min-h-[400px] relative">
            <MapContainer className="w-full h-full min-h-[400px]">
              {(map) => {
                handleMapClick(map);
                return null;
              }}
            </MapContainer>
          </div>

          {/* Real-Time Assignment Results Panel */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-4">
            {resolvedGeo ? (
              resolvedGeo.isMapped ? (
                <div className="flex items-start gap-3 text-success-750">
                  <CheckCircle2 size={20} className="text-success-600 mt-0.5" />
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
                  <XCircle size={20} className="text-warning-600 mt-0.5" />
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
              <div className="text-xs text-neutral-500">
                Click on the map to set the lead's location. The system will automatically resolve
                geographic boundaries and auto-assign the BDM.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
