import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';
import MapContainer from '@/components/maps/MapContainer';
import type { Territory } from '@/types';
import {
  Briefcase, ShoppingBag, Wrench, MapPin, User, CheckCircle, ArrowRight, ArrowLeft,
  Loader2, Compass, Award, Calendar, Clock, FileText, GraduationCap, Building2,
  Truck, Shield, ChevronRight,
} from 'lucide-react';

type PartnerTypeOption = 'bdm' | 'seller' | 'service_person';

interface FormData {
  // Step 1 - Contact
  contact_name: string;
  contact_email: string;
  contact_mobile: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  // Step 2 - Partner Type
  partner_type: PartnerTypeOption | '';
  // Step 3 - BDM
  preferred_territory_ids: number[];
  experience_years: string;
  previous_employer: string;
  experience_description: string;
  education_level: string;
  education_institution: string;
  education_field: string;
  // Step 3 - Seller
  business_name: string;
  business_address: string;
  business_type: string;
  gst_number: string;
  annual_turnover: string;
  product_categories: string[];
  // Step 3 - Service Person
  services_offered: string[];
  has_driving_license: boolean;
  driving_license_number: string;
  license_type: string;
  vehicle_type: string;
  vehicle_registration: string;
  // Step 4 - Appointment
  appointment_date: string;
  appointment_time: string;
  appointment_notes: string;
  // UTM
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

const initialFormData: FormData = {
  contact_name: '',
  contact_email: '',
  contact_mobile: '',
  address: '',
  latitude: null,
  longitude: null,
  partner_type: '',
  preferred_territory_ids: [],
  experience_years: '',
  previous_employer: '',
  experience_description: '',
  education_level: '',
  education_institution: '',
  education_field: '',
  business_name: '',
  business_address: '',
  business_type: '',
  gst_number: '',
  annual_turnover: '',
  product_categories: [],
  services_offered: [],
  has_driving_license: false,
  driving_license_number: '',
  license_type: '',
  vehicle_type: '',
  vehicle_registration: '',
  appointment_date: '',
  appointment_time: '',
  appointment_notes: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
};

const STEPS = [
  { label: 'Contact', icon: User },
  { label: 'Partner Type', icon: Briefcase },
  { label: 'Details', icon: FileText },
  { label: 'Schedule', icon: Calendar },
];

const TIME_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

const PRODUCT_CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Health & Beauty', 'Food & Beverages', 'Automotive', 'Industrial', 'Other'];
const SERVICES_LIST = ['Installation', 'Repair & Maintenance', 'Inspection', 'Consultation', 'Training', 'Delivery', 'Assembly'];

export default function PublicPartnerForm() {
  const location = useLocation();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapMarker, setMapMarker] = useState<google.maps.LatLngLiteral | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // Parse UTM params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFormData((prev) => ({
      ...prev,
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
    }));
  }, [location]);

  // Fetch territories for BDM step
  useEffect(() => {
    const fetchTerritories = async () => {
      try {
        const res = await api.get('/territories/public?per_page=200&is_active=1');
        setTerritories(res.data.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTerritories();
  }, []);

  // Generate available future weekdays (next 30 days)
  const availableDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const day = d.getDay();
      if (day !== 0 && day !== 6) { // skip weekends
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    return dates;
  }, []);

  // Group territories by division
  const territoriesByDivision = useMemo(() => {
    const grouped: Record<string, Territory[]> = {};
    territories.forEach((t) => {
      const divName = t.division?.name || 'Uncategorized';
      if (!grouped[divName]) grouped[divName] = [];
      grouped[divName].push(t);
    });
    return grouped;
  }, [territories]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMapMarker({ lat, lng });
      setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setFormData((prev) => ({ ...prev, address: results[0].formatted_address }));
        }
      });
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapMarker({ lat, lng });
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setFormData((prev) => ({ ...prev, address: results[0].formatted_address }));
          }
          setIsDetectingLocation(false);
        });
      },
      () => {
        alert('Could not detect your location.');
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.contact_name.trim()) errors.contact_name = 'Name is required';
      if (!formData.contact_email.trim()) errors.contact_email = 'Email is required';
      if (!formData.contact_mobile.trim()) errors.contact_mobile = 'Mobile is required';
    } else if (step === 1) {
      if (!formData.partner_type) errors.partner_type = 'Please select a partner type';
    } else if (step === 2) {
      if (formData.partner_type === 'seller') {
        if (!formData.business_name.trim()) errors.business_name = 'Business name is required';
        if (!formData.business_address.trim()) errors.business_address = 'Business address is required';
      }
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setError(null);
    setIsSubmitLoading(true);

    try {
      const appointmentDatetime = formData.appointment_date && formData.appointment_time
        ? `${formData.appointment_date} ${convertTo24(formData.appointment_time)}`
        : null;

      const submitData = {
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_mobile: formData.contact_mobile,
        address: formData.address || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        partner_type: formData.partner_type,
        // BDM
        preferred_territory_ids: formData.partner_type === 'bdm' && formData.preferred_territory_ids.length > 0 ? formData.preferred_territory_ids : null,
        experience_years: formData.partner_type === 'bdm' && formData.experience_years ? parseInt(formData.experience_years) : null,
        previous_employer: formData.partner_type === 'bdm' ? formData.previous_employer || null : null,
        experience_description: formData.partner_type === 'bdm' ? formData.experience_description || null : null,
        education_level: formData.partner_type === 'bdm' ? formData.education_level || null : null,
        education_institution: formData.partner_type === 'bdm' ? formData.education_institution || null : null,
        education_field: formData.partner_type === 'bdm' ? formData.education_field || null : null,
        // Seller
        business_name: formData.partner_type === 'seller' ? formData.business_name : formData.contact_name,
        business_address: formData.partner_type === 'seller' ? formData.business_address : formData.address || null,
        business_type: formData.partner_type === 'seller' ? formData.business_type || null : null,
        gst_number: formData.partner_type === 'seller' ? formData.gst_number || null : null,
        annual_turnover: formData.partner_type === 'seller' ? formData.annual_turnover || null : null,
        product_categories: formData.partner_type === 'seller' && formData.product_categories.length > 0 ? formData.product_categories : null,
        // Service Person
        services_offered: formData.partner_type === 'service_person' && formData.services_offered.length > 0 ? formData.services_offered : null,
        has_driving_license: formData.partner_type === 'service_person' ? formData.has_driving_license : false,
        driving_license_number: formData.partner_type === 'service_person' && formData.has_driving_license ? formData.driving_license_number || null : null,
        license_type: formData.partner_type === 'service_person' && formData.has_driving_license ? formData.license_type || null : null,
        vehicle_type: formData.partner_type === 'service_person' ? formData.vehicle_type || null : null,
        vehicle_registration: formData.partner_type === 'service_person' && formData.vehicle_type && formData.vehicle_type !== 'None' ? formData.vehicle_registration || null : null,
        // Appointment
        appointment_datetime: appointmentDatetime,
        appointment_notes: formData.appointment_notes || null,
        // UTM
        utm_source: formData.utm_source || null,
        utm_medium: formData.utm_medium || null,
        utm_campaign: formData.utm_campaign || null,
      };

      await api.post('/partners/public/register', submitData);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while submitting. Please try again.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const convertTo24 = (time12: string): string => {
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  };

  const toggleArrayItem = (arr: string[], item: string): string[] => {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  };

  const toggleTerritoryId = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      preferred_territory_ids: prev.preferred_territory_ids.includes(id)
        ? prev.preferred_territory_ids.filter((i) => i !== id)
        : [...prev.preferred_territory_ids, id],
    }));
  };

  const inputClass = 'w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm';
  const selectClass = 'w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm';
  const labelClass = 'block text-xs font-medium text-neutral-300 mb-1.5';

  // ==================== SUCCESS SCREEN ====================
  if (isSuccess) {
    const partnerTypeLabel = formData.partner_type === 'bdm' ? 'Business Development Manager' : formData.partner_type === 'seller' ? 'Seller Partner' : 'Service Partner';
    return (
      <div style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a1145 40%, #0d1b3e 70%, #0a0f1f 100%)' }} className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl" style={{ animation: 'scaleUp 0.5s ease-out' }}>
          {/* Animated Checkmark */}
          <div style={{ animation: 'checkPop 0.6s ease-out 0.2s both' }} className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-success-500/20 border-2 border-success-500/40" style={{ animation: 'ringPulse 2s ease-out infinite' }} />
            <div className="w-20 h-20 rounded-full bg-success-500/10 border border-success-500/30 flex items-center justify-center">
              <CheckCircle className="text-success-500 w-10 h-10" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Your Application Has Been Submitted!</h2>
          <div className="space-y-2 mb-6">
            <p className="text-neutral-300 text-sm">
              Partner Type: <span className="font-semibold text-primary-400">{partnerTypeLabel}</span>
            </p>
            {formData.appointment_date && formData.appointment_time && (
              <p className="text-neutral-300 text-sm">
                Appointment: <span className="font-semibold text-primary-400">{new Date(formData.appointment_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {formData.appointment_time}</span>
              </p>
            )}
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            You will receive a welcome email with a calendar invite shortly.
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              setFormData(initialFormData);
              setCurrentStep(0);
              setMapMarker(null);
            }}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Submit Another Application
          </button>
        </div>
        <style>{`
          @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes checkPop { from { transform: scale(0); } to { transform: scale(1); } }
          @keyframes ringPulse { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }
        `}</style>
      </div>
    );
  }

  // ==================== MAIN FORM ====================
  return (
    <div style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a1145 40%, #0d1b3e 70%, #0a0f1f 100%)' }} className="min-h-screen text-neutral-100 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/85">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-600/20">
            M
          </div>
          <span className="font-extrabold text-lg tracking-wide text-white">Manika CRM</span>
        </div>
        <span className="text-xs text-neutral-400 font-semibold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          Partner Onboarding
        </span>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/5" />
            <div className="absolute top-5 left-0 h-0.5 bg-primary-500 transition-all duration-500" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              return (
                <div key={idx} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/30'
                        : isActive
                        ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                        : 'bg-white/5 border-white/10 text-neutral-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`text-xs mt-2 font-semibold ${isActive || isCompleted ? 'text-primary-400' : 'text-neutral-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div style={{ transition: 'opacity 0.3s ease' }}>

          {/* ==================== STEP 1: Contact ==================== */}
          {currentStep === 0 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-white">Contact Information</h2>
                <p className="text-neutral-400 text-sm mt-1">Tell us how to reach you</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <User size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Personal Details</h3>
                    <p className="text-xs text-neutral-400">Your primary contact information</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input type="text" value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} placeholder="John Doe" className={inputClass} />
                    {stepErrors.contact_name && <p className="text-danger-400 text-xs mt-1">{stepErrors.contact_name}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} placeholder="john@example.com" className={inputClass} />
                    {stepErrors.contact_email && <p className="text-danger-400 text-xs mt-1">{stepErrors.contact_email}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Mobile Number *</label>
                    <input type="tel" value={formData.contact_mobile} onChange={(e) => setFormData({ ...formData, contact_mobile: e.target.value })} placeholder="+91 98765 43210" className={inputClass} />
                    {stepErrors.contact_mobile && <p className="text-danger-400 text-xs mt-1">{stepErrors.contact_mobile}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Your location (optional)" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Map Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Pin Your Location</h3>
                      <p className="text-xs text-neutral-400">Optional — helps us find the nearest representative</p>
                    </div>
                  </div>
                  <button type="button" onClick={detectLocation} disabled={isDetectingLocation} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer">
                    {isDetectingLocation ? (<><Loader2 size={12} className="animate-spin" /> Detecting...</>) : (<><Compass size={12} /> Use My Location</>)}
                  </button>
                </div>
                <div className="w-full h-[280px] rounded-xl overflow-hidden border border-white/10 relative">
                  <MapContainer className="w-full h-full min-h-[280px]">
                    {(map) => {
                      google.maps.event.clearListeners(map, 'click');
                      map.addListener('click', handleMapClick);
                      if (mapMarker) {
                        if (markerRef.current) {
                          markerRef.current.setPosition(mapMarker);
                          markerRef.current.setMap(map);
                        } else {
                          markerRef.current = new google.maps.Marker({ position: mapMarker, map, title: 'Your Location' });
                        }
                      } else if (markerRef.current) {
                        markerRef.current.setMap(null);
                        markerRef.current = null;
                      }
                      return null;
                    }}
                  </MapContainer>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STEP 2: Partner Type ==================== */}
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-extrabold text-white">Choose Your Partner Type</h2>
                <p className="text-neutral-400 text-sm mt-1">Select the role that best describes your engagement</p>
                {stepErrors.partner_type && <p className="text-danger-400 text-sm mt-2">{stepErrors.partner_type}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { type: 'bdm' as PartnerTypeOption, icon: Briefcase, title: 'Business Development Manager', desc: 'Drive growth by managing territories and building relationships', gradient: 'from-violet-600/20 to-indigo-600/20', border: 'violet', accent: 'violet' },
                  { type: 'seller' as PartnerTypeOption, icon: ShoppingBag, title: 'Seller Partner', desc: 'Expand your business by listing and selling products on our platform', gradient: 'from-emerald-600/20 to-teal-600/20', border: 'emerald', accent: 'emerald' },
                  { type: 'service_person' as PartnerTypeOption, icon: Wrench, title: 'Service Partner', desc: 'Provide expert services to customers in your area', gradient: 'from-amber-600/20 to-orange-600/20', border: 'amber', accent: 'amber' },
                ].map((card) => {
                  const isSelected = formData.partner_type === card.type;
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.type}
                      type="button"
                      onClick={() => setFormData({ ...formData, partner_type: card.type })}
                      className={`group relative text-left p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer backdrop-blur-xl ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10 scale-[1.02]'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8 hover:scale-[1.01]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle size={20} className="text-primary-400" />
                        </div>
                      )}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                        <Icon size={24} className={isSelected ? 'text-primary-400' : 'text-white/70'} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                      <p className="text-sm text-neutral-400 leading-relaxed">{card.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== STEP 3: Role-Specific Details ==================== */}
          {currentStep === 2 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-white">
                  {formData.partner_type === 'bdm' ? 'BDM Details' : formData.partner_type === 'seller' ? 'Business Details' : 'Service Details'}
                </h2>
                <p className="text-neutral-400 text-sm mt-1">Provide information relevant to your role</p>
              </div>

              {/* ---- BDM Fields ---- */}
              {formData.partner_type === 'bdm' && (
                <>
                  {/* Territory Preferences */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400"><MapPin size={16} /></div>
                      <div><h3 className="font-bold text-white">Territory Preferences</h3><p className="text-xs text-neutral-400">Select territories you'd like to manage</p></div>
                    </div>
                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                      {Object.entries(territoriesByDivision).map(([divName, terrs]) => (
                        <div key={divName}>
                          <p className="text-xs font-semibold text-neutral-400 uppercase mb-2">{divName}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {terrs.map((t) => (
                              <label key={t.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${formData.preferred_territory_ids.includes(t.id) ? 'border-primary-500/50 bg-primary-500/10' : 'border-white/5 hover:border-white/15'}`}>
                                <input type="checkbox" checked={formData.preferred_territory_ids.includes(t.id)} onChange={() => toggleTerritoryId(t.id)} className="w-3.5 h-3.5 rounded text-primary-600" />
                                <span className="text-sm text-neutral-200">{t.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><Award size={16} /></div>
                      <div><h3 className="font-bold text-white">Previous Experience</h3><p className="text-xs text-neutral-400">Tell us about your background</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Years of Experience</label>
                        <input type="number" min="0" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })} placeholder="e.g. 5" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Previous Employer</label>
                        <input type="text" value={formData.previous_employer} onChange={(e) => setFormData({ ...formData, previous_employer: e.target.value })} placeholder="Company name" className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Experience Description</label>
                        <textarea value={formData.experience_description} onChange={(e) => setFormData({ ...formData, experience_description: e.target.value })} placeholder="Describe your relevant experience..." rows={3} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400"><GraduationCap size={16} /></div>
                      <div><h3 className="font-bold text-white">Educational Details</h3><p className="text-xs text-neutral-400">Your academic background</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Education Level</label>
                        <select value={formData.education_level} onChange={(e) => setFormData({ ...formData, education_level: e.target.value })} className={selectClass}>
                          <option value="" className="bg-neutral-900">Select Level</option>
                          {['High School', 'Graduate', 'Post-Graduate', 'MBA', 'PhD', 'Other'].map((l) => (<option key={l} value={l} className="bg-neutral-900">{l}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Institution Name</label>
                        <input type="text" value={formData.education_institution} onChange={(e) => setFormData({ ...formData, education_institution: e.target.value })} placeholder="University / College name" className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Field of Study</label>
                        <input type="text" value={formData.education_field} onChange={(e) => setFormData({ ...formData, education_field: e.target.value })} placeholder="e.g. Business Administration" className={inputClass} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ---- Seller Fields ---- */}
              {formData.partner_type === 'seller' && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-4">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><Building2 size={16} /></div>
                    <div><h3 className="font-bold text-white">Business Information</h3><p className="text-xs text-neutral-400">Tell us about your business</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Business Name *</label>
                      <input type="text" value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })} placeholder="Your business name" className={inputClass} />
                      {stepErrors.business_name && <p className="text-danger-400 text-xs mt-1">{stepErrors.business_name}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Business Type</label>
                      <select value={formData.business_type} onChange={(e) => setFormData({ ...formData, business_type: e.target.value })} className={selectClass}>
                        <option value="" className="bg-neutral-900">Select Type</option>
                        {['Retailer', 'Wholesaler', 'Distributor', 'Manufacturer', 'E-commerce'].map((t) => (<option key={t} value={t} className="bg-neutral-900">{t}</option>))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Business Address *</label>
                      <input type="text" value={formData.business_address} onChange={(e) => setFormData({ ...formData, business_address: e.target.value })} placeholder="Full business address" className={inputClass} />
                      {stepErrors.business_address && <p className="text-danger-400 text-xs mt-1">{stepErrors.business_address}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>GST Number</label>
                      <input type="text" value={formData.gst_number} onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })} placeholder="Optional" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Annual Turnover</label>
                      <select value={formData.annual_turnover} onChange={(e) => setFormData({ ...formData, annual_turnover: e.target.value })} className={selectClass}>
                        <option value="" className="bg-neutral-900">Select Range</option>
                        {['Below ₹5L', '₹5L–₹25L', '₹25L–₹1Cr', '₹1Cr–₹5Cr', 'Above ₹5Cr'].map((t) => (<option key={t} value={t} className="bg-neutral-900">{t}</option>))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Product Categories</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {PRODUCT_CATEGORIES.map((cat) => (
                          <button key={cat} type="button" onClick={() => setFormData({ ...formData, product_categories: toggleArrayItem(formData.product_categories, cat) })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${formData.product_categories.includes(cat) ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'}`}>
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Service Person Fields ---- */}
              {formData.partner_type === 'service_person' && (
                <>
                  {/* Services Offered */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400"><Wrench size={16} /></div>
                      <div><h3 className="font-bold text-white">Services Offered</h3><p className="text-xs text-neutral-400">Select the services you can provide</p></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SERVICES_LIST.map((svc) => (
                        <button key={svc} type="button" onClick={() => setFormData({ ...formData, services_offered: toggleArrayItem(formData.services_offered, svc) })}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${formData.services_offered.includes(svc) ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'}`}>
                          {svc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Driving & Vehicle */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400"><Truck size={16} /></div>
                      <div><h3 className="font-bold text-white">Driving & Vehicle Details</h3><p className="text-xs text-neutral-400">Transportation information</p></div>
                    </div>
                    <div className="space-y-4">
                      {/* Toggle switch */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-neutral-200 font-medium">Has Driving License</label>
                        <button type="button" onClick={() => setFormData({ ...formData, has_driving_license: !formData.has_driving_license })}
                          className={`w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer ${formData.has_driving_license ? 'bg-primary-600' : 'bg-white/10'}`}>
                          <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all duration-300 ${formData.has_driving_license ? 'left-6' : 'left-0.5'}`} />
                        </button>
                      </div>

                      {formData.has_driving_license && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>License Number</label>
                            <input type="text" value={formData.driving_license_number} onChange={(e) => setFormData({ ...formData, driving_license_number: e.target.value })} placeholder="DL number" className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>License Type</label>
                            <select value={formData.license_type} onChange={(e) => setFormData({ ...formData, license_type: e.target.value })} className={selectClass}>
                              <option value="" className="bg-neutral-900">Select Type</option>
                              {['Two-wheeler', 'LMV', 'HMV'].map((t) => (<option key={t} value={t} className="bg-neutral-900">{t}</option>))}
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Vehicle Type</label>
                          <select value={formData.vehicle_type} onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })} className={selectClass}>
                            <option value="" className="bg-neutral-900">Select Vehicle</option>
                            {['Bike', 'Car', 'Van', 'Truck', 'None'].map((t) => (<option key={t} value={t} className="bg-neutral-900">{t}</option>))}
                          </select>
                        </div>
                        {formData.vehicle_type && formData.vehicle_type !== 'None' && (
                          <div>
                            <label className={labelClass}>Vehicle Registration Number</label>
                            <input type="text" value={formData.vehicle_registration} onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value })} placeholder="e.g. MH 01 AB 1234" className={inputClass} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================== STEP 4: Appointment ==================== */}
          {currentStep === 3 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-white">Schedule Your Appointment</h2>
                <p className="text-neutral-400 text-sm mt-1">Choose a convenient date and time for your onboarding call</p>
              </div>

              {/* Date & Time */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400"><Calendar size={16} /></div>
                  <div><h3 className="font-bold text-white">Preferred Date & Time</h3><p className="text-xs text-neutral-400">Weekdays only, next 30 days</p></div>
                </div>

                <div>
                  <label className={labelClass}>Select Date</label>
                  <select value={formData.appointment_date} onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })} className={selectClass}>
                    <option value="" className="bg-neutral-900">Choose a date</option>
                    {availableDates.map((d) => (
                      <option key={d} value={d} className="bg-neutral-900">
                        {new Date(d).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Select Time Slot</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-2">
                    {TIME_SLOTS.map((slot) => (
                      <button key={slot} type="button" onClick={() => setFormData({ ...formData, appointment_time: slot })}
                        className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                          formData.appointment_time === slot
                            ? 'bg-primary-600/30 border-primary-500 text-primary-300 shadow-lg shadow-primary-500/10'
                            : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-200'
                        }`}>
                        <Clock size={14} />
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Appointment Notes</label>
                  <textarea value={formData.appointment_notes} onChange={(e) => setFormData({ ...formData, appointment_notes: e.target.value })} placeholder="Any specific topics you'd like to discuss..." rows={3} className={inputClass} />
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><Shield size={16} /></div>
                  <div><h3 className="font-bold text-white">Application Summary</h3><p className="text-xs text-neutral-400">Review your information before submitting</p></div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-neutral-400">Name</span>
                    <span className="text-white font-medium">{formData.contact_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-neutral-400">Email</span>
                    <span className="text-white font-medium">{formData.contact_email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-neutral-400">Mobile</span>
                    <span className="text-white font-medium">{formData.contact_mobile}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-neutral-400">Partner Type</span>
                    <span className="text-primary-400 font-semibold capitalize">{formData.partner_type === 'service_person' ? 'Service Partner' : formData.partner_type === 'bdm' ? 'BDM' : 'Seller'}</span>
                  </div>
                  {formData.partner_type === 'seller' && formData.business_name && (
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-neutral-400">Business</span>
                      <span className="text-white font-medium">{formData.business_name}</span>
                    </div>
                  )}
                  {formData.appointment_date && formData.appointment_time && (
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-neutral-400">Appointment</span>
                      <span className="text-white font-medium">{new Date(formData.appointment_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at {formData.appointment_time}</span>
                    </div>
                  )}
                  {formData.address && (
                    <div className="flex justify-between py-2">
                      <span className="text-neutral-400">Location</span>
                      <span className="text-white font-medium text-right max-w-[60%]">{formData.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-3xl mx-auto mt-6 p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="max-w-3xl mx-auto mt-8 flex justify-between gap-4">
          {currentStep > 0 ? (
            <button type="button" onClick={handlePrev} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all cursor-pointer">
              <ArrowLeft size={18} /> Previous
            </button>
          ) : <div />}

          {currentStep < 3 ? (
            <button type="button" onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/20 transition-all cursor-pointer">
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={isSubmitLoading} className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 transition-all cursor-pointer">
              {isSubmitLoading ? (<><Loader2 size={18} className="animate-spin" /> Submitting...</>) : (<>Submit Application <ChevronRight size={18} /></>)}
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-white/5 text-center text-xs text-neutral-500">
        <p>&copy; {new Date().getFullYear()} Manika CRM Enterprise. All rights reserved.</p>
      </footer>
    </div>
  );
}
