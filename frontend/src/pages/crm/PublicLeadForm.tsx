import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';
import MapContainer from '@/components/maps/MapContainer';
import { MapPin, CheckCircle, Globe, Building2, User, Award, Compass, ArrowRight, Loader2 } from 'lucide-react';

export default function PublicLeadForm() {
  const location = useLocation();
  
  const [formData, setFormData] = useState({
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
    latitude: null as number | null,
    longitude: null as number | null,
    estimated_deal_value: '',
    preferred_contact_method: 'phone',
    notes: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
  });

  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapMarker, setMapMarker] = useState<google.maps.LatLngLiteral | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Parse UTM parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFormData((prev) => ({
      ...prev,
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
    }));
  }, [location]);

  // Handle map click to set coordinates
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMapMarker({ lat, lng });
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));

      // Reverse geocode to get address if possible (simplified fallback)
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setFormData((prev) => ({
            ...prev,
            address: results[0].formatted_address,
          }));
        }
      });
    }
  };

  // Detect current location
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
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setFormData((prev) => ({
              ...prev,
              address: results[0].formatted_address,
            }));
          }
          setIsDetectingLocation(false);
        });
      },
      (error) => {
        console.error(error);
        alert('Could not detect your location. Please pin it manually on the map.');
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.contact_name || !formData.contact_mobile) {
      setError('Name and Mobile number are required.');
      return;
    }

    setIsSubmitLoading(true);
    try {
      const submitData = {
        ...formData,
        estimated_deal_value: formData.estimated_deal_value ? parseFloat(formData.estimated_deal_value) : null,
      };

      await api.post('/leads/public', submitData);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while submitting. Please try again.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-primary-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl animate-scale-up">
          <div className="w-20 h-20 bg-success-500/10 border border-success-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-success-500 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Inquiry Submitted!</h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            Thank you for reaching out. Your information has been successfully captured and routed to our local BDM. We will contact you shortly.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-primary-950 text-neutral-100 flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/85">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-600/20">
            M
          </div>
          <span className="font-extrabold text-lg tracking-wide text-white">Manika CRM</span>
        </div>
        <span className="text-xs text-neutral-400 font-semibold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          Partner Program
        </span>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl w-full mx-auto px-4 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold">
            <Award size={14} />
            <span>Join Our Exclusive Network</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
              Partner with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Industry Leader</span>
            </h1>
            <p className="text-neutral-400 leading-relaxed text-base">
              Submit your business details and get instantly matched with a dedicated Business Development Manager (BDM) based on your geographic location.
            </p>
          </div>

          {/* Key Benefits */}
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 shrink-0">
                <Compass size={18} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Automated Real-Time Matching</h3>
                <p className="text-xs text-neutral-400 mt-1">Our intelligent Geo-Matching algorithm routes your inquiry to the BDM closest to you.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 shrink-0">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Enterprise Collaboration</h3>
                <p className="text-xs text-neutral-400 mt-1">Work directly with local experts to scale your services and distribution.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Card 1: Personal Details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Contact Information</h3>
                  <p className="text-xs text-neutral-400">Who should our BDM contact?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Job Title</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="e.g. Purchasing Manager"
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contact_mobile}
                    onChange={(e) => setFormData({ ...formData, contact_mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Alternate Mobile</label>
                  <input
                    type="tel"
                    value={formData.alternate_mobile}
                    onChange={(e) => setFormData({ ...formData, alternate_mobile: e.target.value })}
                    placeholder="Optional secondary number"
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Business Details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Building2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Business Information</h3>
                  <p className="text-xs text-neutral-400">Provide details about your company</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  >
                    <option value="" className="bg-neutral-900 text-neutral-400">Select Industry</option>
                    <option value="Technology" className="bg-neutral-900">Technology</option>
                    <option value="Retail" className="bg-neutral-900">Retail / E-commerce</option>
                    <option value="Healthcare" className="bg-neutral-900">Healthcare</option>
                    <option value="Finance" className="bg-neutral-900">Finance & Banking</option>
                    <option value="Manufacturing" className="bg-neutral-900">Manufacturing</option>
                    <option value="Services" className="bg-neutral-900">Professional Services</option>
                    <option value="Other" className="bg-neutral-900">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Company Size</label>
                  <select
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  >
                    <option value="" className="bg-neutral-900 text-neutral-400">Select Size</option>
                    <option value="1-10" className="bg-neutral-900">1 - 10 employees</option>
                    <option value="11-50" className="bg-neutral-900">11 - 50 employees</option>
                    <option value="51-200" className="bg-neutral-900">51 - 200 employees</option>
                    <option value="201-500" className="bg-neutral-900">201 - 500 employees</option>
                    <option value="500+" className="bg-neutral-900">500+ employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="www.company.com"
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Location Pinning */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-450">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Geographic Location</h3>
                    <p className="text-xs text-neutral-400">Pin your location to match with the correct local BDM</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                  className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Compass size={12} />
                      Use My Location
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div className="w-full h-[320px] rounded-xl overflow-hidden border border-white/10 relative">
                  <MapContainer className="w-full h-full min-h-[320px]">
                    {(map) => {
                      // Set click listener
                      google.maps.event.clearListeners(map, 'click');
                      map.addListener('click', handleMapClick);

                      if (mapMarker) {
                        if (markerRef.current) {
                          markerRef.current.setPosition(mapMarker);
                          markerRef.current.setMap(map);
                        } else {
                          markerRef.current = new google.maps.Marker({
                            position: mapMarker,
                            map,
                            title: "Your Business Location",
                          });
                        }
                      } else {
                        if (markerRef.current) {
                          markerRef.current.setMap(null);
                          markerRef.current = null;
                        }
                      }
                      return null;
                    }}
                  </MapContainer>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Business Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Pin on the map or enter your address manually..."
                    rows={2}
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Additional details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <Globe size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Inquiry Context</h3>
                  <p className="text-xs text-neutral-400">Help us prepare for our first conversation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Estimated Deal / Budget Value ($)</label>
                  <input
                    type="number"
                    value={formData.estimated_deal_value}
                    onChange={(e) => setFormData({ ...formData, estimated_deal_value: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Preferred Contact Method</label>
                  <select
                    value={formData.preferred_contact_method}
                    onChange={(e) => setFormData({ ...formData, preferred_contact_method: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  >
                    <option value="phone" className="bg-neutral-900">Phone Call</option>
                    <option value="email" className="bg-neutral-900">Email</option>
                    <option value="whatsapp" className="bg-neutral-900">WhatsApp</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Describe Your Requirements</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Please specify any particular services or product lines you are interested in..."
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitLoading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Lead Details
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-white/5 text-center text-xs text-neutral-500">
        <p>&copy; {new Date().getFullYear()} Manika CRM Enterprise. All rights reserved.</p>
      </footer>
    </div>
  );
}
