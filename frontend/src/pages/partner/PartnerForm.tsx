import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import MapContainer from '@/components/maps/MapContainer';
import type { Partner, ApiResponse, Territory } from '@/types';
import {
  ArrowLeft, Loader2, MapPin, User, Briefcase, Calendar,
  Wrench, ShoppingBag, CheckCircle2, XCircle,
} from 'lucide-react';

export default function PartnerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_mobile: '',
    partner_type: 'seller' as 'bdm' | 'seller' | 'service_person',
    status: 'pending' as 'pending' | 'active' | 'inactive' | 'suspended',
    business_name: '',
    business_address: '',
    latitude: 20.5937,
    longitude: 78.9629,
    // BDM
    preferred_territory_ids: [] as number[],
    experience_years: '',
    previous_employer: '',
    experience_description: '',
    education_level: '',
    education_institution: '',
    education_field: '',
    // Seller
    gst_number: '',
    business_type: '',
    annual_turnover: '',
    product_categories: [] as string[],
    // Service Person
    services_offered: [] as string[],
    has_driving_license: false,
    driving_license_number: '',
    license_type: '',
    vehicle_type: '',
    vehicle_registration: '',
    // Appointment
    appointment_datetime: '',
    appointment_notes: '',
  });

  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isResolvingGeo, setIsResolvingGeo] = useState(false);
  const [resolvedGeo, setResolvedGeo] = useState<{
    localityName: string | null;
    territoryName: string | null;
    bdmName: string | null;
    isMapped: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchTerritories = async () => {
      try {
        const res = await api.get('/territories?per_page=200&is_active=1');
        setTerritories(res.data.data.data);
      } catch (err) { console.error(err); }
    };
    fetchTerritories();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const fetchPartner = async () => {
        setIsLoading(true);
        try {
          const response = await api.get<ApiResponse<Partner>>(`/partners/${id}`);
          const p = response.data.data;
          setFormData({
            contact_name: p.contact_name,
            contact_email: p.contact_email || '',
            contact_mobile: p.contact_mobile,
            partner_type: p.partner_type,
            status: p.status,
            business_name: p.business_name,
            business_address: p.business_address || '',
            latitude: p.latitude || 20.5937,
            longitude: p.longitude || 78.9629,
            preferred_territory_ids: p.preferred_territory_ids || [],
            experience_years: p.experience_years != null ? p.experience_years.toString() : '',
            previous_employer: p.previous_employer || '',
            experience_description: p.experience_description || '',
            education_level: p.education_level || '',
            education_institution: p.education_institution || '',
            education_field: p.education_field || '',
            gst_number: p.gst_number || '',
            business_type: p.business_type || '',
            annual_turnover: p.annual_turnover || '',
            product_categories: p.product_categories || [],
            services_offered: p.services_offered || [],
            has_driving_license: p.has_driving_license,
            driving_license_number: p.driving_license_number || '',
            license_type: p.license_type || '',
            vehicle_type: p.vehicle_type || '',
            vehicle_registration: p.vehicle_registration || '',
            appointment_datetime: p.appointment_datetime || '',
            appointment_notes: p.appointment_notes || '',
          });

          if (p.latitude && p.longitude) {
            resolveGeoLocation(p.latitude, p.longitude);
          }
        } catch (err) {
          console.error(err);
          setError('Failed to load partner details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPartner();
    }
  }, [id, isEdit]);

  const resolveGeoLocation = async (lat: number, lng: number) => {
    setIsResolvingGeo(true);
    try {
      const response = await api.post('/geo/identify', { latitude: lat, longitude: lng });
      const data = response.data.data;
      if (data.is_mapped) {
        setResolvedGeo({
          localityName: data.locality.name,
          territoryName: data.territory.name,
          bdmName: data.bdm ? data.bdm.name : null,
          isMapped: true,
        });
      } else {
        setResolvedGeo({ localityName: null, territoryName: null, bdmName: null, isMapped: false });
      }
    } catch (err) { console.error(err); }
    finally { setIsResolvingGeo(false); }
  };

  const handleMapClick = (map: google.maps.Map) => {
    let marker: google.maps.Marker | null = null;

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
      if (marker) { marker.setPosition({ lat, lng }); }
      else { marker = new google.maps.Marker({ position: { lat, lng }, map, draggable: true }); }
      onPositionSelect(lat, lng);
      marker.addListener('dragend', () => {
        const pos = marker!.getPosition();
        if (pos) onPositionSelect(pos.lat(), pos.lng());
      });
    });

    if (marker) {
      marker.addListener('dragend', () => {
        const pos = marker!.getPosition();
        if (pos) onPositionSelect(pos.lat(), pos.lng());
      });
    }
  };

  const toggleArrayItem = (arr: string[], item: string) => arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitLoading(true);

    try {
      const submitData = {
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        preferred_territory_ids: formData.preferred_territory_ids.length > 0 ? formData.preferred_territory_ids : null,
        product_categories: formData.product_categories.length > 0 ? formData.product_categories : null,
        services_offered: formData.services_offered.length > 0 ? formData.services_offered : null,
        appointment_datetime: formData.appointment_datetime || null,
        appointment_notes: formData.appointment_notes || null,
      };

      if (isEdit) {
        await api.put(`/partners/${id}`, submitData);
      } else {
        await api.post('/partners', submitData);
      }
      navigate('/partners');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save partner.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const inputClass = 'w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20';
  const labelClass = 'block text-xs font-semibold text-neutral-600 uppercase mb-1';

  const PRODUCT_CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Health & Beauty', 'Food & Beverages', 'Automotive', 'Industrial', 'Other'];
  const SERVICES_LIST = ['Installation', 'Repair & Maintenance', 'Inspection', 'Consultation', 'Training', 'Delivery', 'Assembly'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <button onClick={() => navigate('/partners')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
        <ArrowLeft size={16} /> Back to partners
      </button>

      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{isEdit ? 'Edit Partner' : 'Create Partner'}</h1>
        <p className="text-neutral-500 text-sm">{isEdit ? 'Update partner details and configuration.' : 'Add a new partner to the system.'}</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column — Form Cards */}
        <div className="lg:col-span-7 space-y-6">

          {/* Card 1: Contact Information */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-150 pb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-600"><User size={16} /></div>
              <div><h3 className="font-bold text-neutral-800 text-sm">Contact Information</h3><p className="text-xs text-neutral-500">Primary contact for this partner</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contact Name *</label>
                <input type="text" required value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} placeholder="Full name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} placeholder="email@example.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Mobile Number *</label>
                <input type="text" required value={formData.contact_mobile} onChange={(e) => setFormData({ ...formData, contact_mobile: e.target.value })} placeholder="9876543210" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Card 2: Partner Configuration */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-150 pb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600"><Briefcase size={16} /></div>
              <div><h3 className="font-bold text-neutral-800 text-sm">Partner Configuration</h3><p className="text-xs text-neutral-500">Type, status and business info</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Partner Type *</label>
                <select value={formData.partner_type} onChange={(e) => setFormData({ ...formData, partner_type: e.target.value as any })} className={inputClass}>
                  <option value="bdm">BDM</option>
                  <option value="seller">Seller</option>
                  <option value="service_person">Service Person</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Business Name *</label>
                <input type="text" required value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })} placeholder="Business name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Business Address</label>
                <input type="text" value={formData.business_address} onChange={(e) => setFormData({ ...formData, business_address: e.target.value })} placeholder="Address" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Card 3: Role-Specific Details */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-150 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                {formData.partner_type === 'bdm' ? <Briefcase size={16} /> : formData.partner_type === 'seller' ? <ShoppingBag size={16} /> : <Wrench size={16} />}
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 text-sm">
                  {formData.partner_type === 'bdm' ? 'BDM Details' : formData.partner_type === 'seller' ? 'Seller Details' : 'Service Person Details'}
                </h3>
                <p className="text-xs text-neutral-500">Role-specific information</p>
              </div>
            </div>

            {/* BDM Fields */}
            {formData.partner_type === 'bdm' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Years of Experience</label>
                    <input type="number" min="0" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })} placeholder="e.g. 5" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Previous Employer</label>
                    <input type="text" value={formData.previous_employer} onChange={(e) => setFormData({ ...formData, previous_employer: e.target.value })} placeholder="Company name" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Education Level</label>
                    <select value={formData.education_level} onChange={(e) => setFormData({ ...formData, education_level: e.target.value })} className={inputClass}>
                      <option value="">Select Level</option>
                      {['High School', 'Graduate', 'Post-Graduate', 'MBA', 'PhD', 'Other'].map((l) => (<option key={l} value={l}>{l}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Institution Name</label>
                    <input type="text" value={formData.education_institution} onChange={(e) => setFormData({ ...formData, education_institution: e.target.value })} placeholder="University / College" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Field of Study</label>
                    <input type="text" value={formData.education_field} onChange={(e) => setFormData({ ...formData, education_field: e.target.value })} placeholder="e.g. Business Administration" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Experience Description</label>
                  <textarea value={formData.experience_description} onChange={(e) => setFormData({ ...formData, experience_description: e.target.value })} placeholder="Describe relevant experience..." rows={3} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Preferred Territories</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-[200px] overflow-y-auto">
                    {territories.map((t) => (
                      <label key={t.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${formData.preferred_territory_ids.includes(t.id) ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                        <input type="checkbox" checked={formData.preferred_territory_ids.includes(t.id)} onChange={() => setFormData(prev => ({ ...prev, preferred_territory_ids: prev.preferred_territory_ids.includes(t.id) ? prev.preferred_territory_ids.filter(i => i !== t.id) : [...prev.preferred_territory_ids, t.id] }))} className="w-3.5 h-3.5 rounded" />
                        {t.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Seller Fields */}
            {formData.partner_type === 'seller' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>GST Number</label>
                    <input type="text" value={formData.gst_number} onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })} placeholder="Optional" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Business Type</label>
                    <select value={formData.business_type} onChange={(e) => setFormData({ ...formData, business_type: e.target.value })} className={inputClass}>
                      <option value="">Select Type</option>
                      {['Retailer', 'Wholesaler', 'Distributor', 'Manufacturer', 'E-commerce'].map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Annual Turnover</label>
                    <select value={formData.annual_turnover} onChange={(e) => setFormData({ ...formData, annual_turnover: e.target.value })} className={inputClass}>
                      <option value="">Select Range</option>
                      {['Below ₹5L', '₹5L–₹25L', '₹25L–₹1Cr', '₹1Cr–₹5Cr', 'Above ₹5Cr'].map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Product Categories</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <button key={cat} type="button" onClick={() => setFormData({ ...formData, product_categories: toggleArrayItem(formData.product_categories, cat) })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${formData.product_categories.includes(cat) ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Service Person Fields */}
            {formData.partner_type === 'service_person' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Services Offered</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {SERVICES_LIST.map((svc) => (
                      <button key={svc} type="button" onClick={() => setFormData({ ...formData, services_offered: toggleArrayItem(formData.services_offered, svc) })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${formData.services_offered.includes(svc) ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex items-center gap-3">
                    <label className="text-sm font-semibold text-neutral-700">Has Driving License</label>
                    <button type="button" onClick={() => setFormData({ ...formData, has_driving_license: !formData.has_driving_license })}
                      className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${formData.has_driving_license ? 'bg-primary-600' : 'bg-neutral-300'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-all ${formData.has_driving_license ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {formData.has_driving_license && (
                    <>
                      <div>
                        <label className={labelClass}>License Number</label>
                        <input type="text" value={formData.driving_license_number} onChange={(e) => setFormData({ ...formData, driving_license_number: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>License Type</label>
                        <select value={formData.license_type} onChange={(e) => setFormData({ ...formData, license_type: e.target.value })} className={inputClass}>
                          <option value="">Select Type</option>
                          {['Two-wheeler', 'LMV', 'HMV'].map((t) => (<option key={t} value={t}>{t}</option>))}
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className={labelClass}>Vehicle Type</label>
                    <select value={formData.vehicle_type} onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })} className={inputClass}>
                      <option value="">Select Vehicle</option>
                      {['Bike', 'Car', 'Van', 'Truck', 'None'].map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  {formData.vehicle_type && formData.vehicle_type !== 'None' && (
                    <div>
                      <label className={labelClass}>Vehicle Registration</label>
                      <input type="text" value={formData.vehicle_registration} onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value })} placeholder="MH 01 AB 1234" className={inputClass} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Appointment & Scheduling */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-150 pb-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-600"><Calendar size={16} /></div>
              <div><h3 className="font-bold text-neutral-800 text-sm">Appointment & Scheduling</h3><p className="text-xs text-neutral-500">Schedule onboarding appointment</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Appointment Date & Time</label>
                <input type="datetime-local" value={formData.appointment_datetime} onChange={(e) => setFormData({ ...formData, appointment_datetime: e.target.value })} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Appointment Notes</label>
                <textarea value={formData.appointment_notes} onChange={(e) => setFormData({ ...formData, appointment_notes: e.target.value })} placeholder="Notes for the appointment..." rows={3} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Map & Actions */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary-600" />
                <span className="text-sm font-bold text-neutral-800">Pin Partner Location</span>
              </div>
              {isResolvingGeo && <span className="text-xs text-neutral-500 animate-pulse">Resolving...</span>}
            </div>
            <div className="flex-1 min-h-[420px] relative">
              <MapContainer className="w-full h-full min-h-[420px]">
                {(map) => { handleMapClick(map); return null; }}
              </MapContainer>
            </div>
            <div className="p-4 border-t border-neutral-150 bg-white">
              <label className={labelClass}>Business Address</label>
              <textarea value={formData.business_address} onChange={(e) => setFormData({ ...formData, business_address: e.target.value })} placeholder="Pin on the map or enter address..." rows={2} className={inputClass} />
            </div>
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-4">
              {resolvedGeo ? (
                resolvedGeo.isMapped ? (
                  <div className="flex items-start gap-3 text-success-750">
                    <CheckCircle2 size={20} className="text-success-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold">Location Matched</p>
                      <div className="text-xs text-neutral-600 mt-0.5 space-y-0.5">
                        <p><span className="font-semibold text-neutral-700">Locality:</span> {resolvedGeo.localityName}</p>
                        <p><span className="font-semibold text-neutral-700">Territory:</span> {resolvedGeo.territoryName}</p>
                        <p><span className="font-semibold text-neutral-700">BDM:</span> {resolvedGeo.bdmName || 'None'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-warning-750">
                    <XCircle size={20} className="text-warning-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold">Unmapped Location</p>
                      <p className="text-xs text-neutral-500 mt-0.5">This location does not fall inside any registered locality.</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-xs text-neutral-550">Click on the map to set the partner's location.</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 space-y-4">
            {error && (
              <div className="p-3.5 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-xs">{error}</div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/partners')} className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-750 font-semibold rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer text-sm">Cancel</button>
              <button type="submit" disabled={isSubmitLoading} className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl shadow-sm transition-colors cursor-pointer text-sm flex items-center justify-center gap-2">
                {isSubmitLoading ? (<><Loader2 size={16} className="animate-spin" /> Saving...</>) : (isEdit ? 'Update Partner' : 'Create Partner')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
