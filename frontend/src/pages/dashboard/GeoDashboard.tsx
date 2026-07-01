import { useState, useEffect, useMemo } from 'react';
import MapContainer from '@/components/maps/MapContainer';
import PolygonViewer from '@/components/maps/PolygonViewer';
import MarkerLayer from '@/components/maps/MarkerLayer';
import api from '@/services/api';
import { usePermission } from '@/hooks';
import {
  Globe,
  MapPin,
  User,
  ShoppingBag,
  Wrench,
  Search,
  Loader2,
  X,
  Phone,
  Mail,
  Building,
  Navigation,
} from 'lucide-react';
import type { Territory, Locality, Partner } from '@/types';

interface DashboardKpis {
  total_territories: number;
  total_localities: number;
  total_bdms: number;
  total_sellers: number;
  total_service_persons: number;
}

export default function GeoDashboard() {
  const { isBDM } = usePermission();

  // Layers Visibility State
  const [layers, setLayers] = useState({
    territory: true,
    locality: true,
    bdm: true,
    seller: true,
    service_person: true,
  });

  // Autocomplete Searches & Filters State
  const [filters, setFilters] = useState({
    search: '',
    territory_id: '',
    locality_id: '',
    status: '',
  });

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKpis>({
    total_territories: 0,
    total_localities: 0,
    total_bdms: 0,
    total_sellers: 0,
    total_service_persons: 0,
  });

  const [territories, setTerritories] = useState<Territory[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [sellers, setSellers] = useState<Partner[]>([]);
  const [servicePersons, setServicePersons] = useState<Partner[]>([]);

  // Map center/zoom state
  const [mapCenter] = useState({ lat: 22.5726, lng: 88.3639 }); // Kolkata center default
  const [mapZoom] = useState(10);

  // Selected item on map state
  const [selectedItem, setSelectedItem] = useState<{
    type: 'territory' | 'locality' | 'seller' | 'service_person';
    data: any;
  } | null>(null);

  // Fetch Geo Dashboard Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const activeLayers = Object.entries(layers)
        .filter(([_, visible]) => visible)
        .map(([name]) => name);

      const params = new URLSearchParams();
      activeLayers.forEach((l) => params.append('layers[]', l));
      
      if (filters.search) params.append('search', filters.search);
      if (filters.territory_id) params.append('territory_id', filters.territory_id);
      if (filters.locality_id) params.append('locality_id', filters.locality_id);
      if (filters.status) params.append('status', filters.status);

      const res = await api.get(`/geo-dashboard?${params.toString()}`);
      const payload = res.data.data;

      setKpis(payload.kpis);
      if (payload.territories) setTerritories(payload.territories);
      if (payload.localities) setLocalities(payload.localities);
      if (payload.sellers) setSellers(payload.sellers);
      if (payload.service_persons) setServicePersons(payload.service_persons);
    } catch (err) {
      console.error('Error loading geo-dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [layers, filters]);

  // Convert Territory boundaries for PolygonViewer
  const territoryPolygons = useMemo(() => {
    return territories
      .filter((t) => t.boundaries && t.boundaries.coordinates)
      .map((t) => {
        const coords = t.boundaries!.coordinates[0];
        const path = coords.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
        return {
          id: t.id,
          path,
          color: '#3b82f6', // blue
          label: t.name,
          raw: t,
        };
      });
  }, [territories]);

  // Convert Locality polygons for PolygonViewer
  const localityPolygons = useMemo(() => {
    return localities
      .filter((l) => l.polygon && l.polygon.coordinates)
      .map((l) => {
        const coords = l.polygon!.coordinates[0];
        const path = coords.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
        return {
          id: l.id,
          path,
          color: '#10b981', // emerald
          label: l.name,
          raw: l,
        };
      });
  }, [localities]);

  // Combined Polygons for Viewer
  const allPolygons = useMemo(() => {
    const list: any[] = [];
    if (layers.territory) {
      list.push(...territoryPolygons);
    }
    if (layers.locality) {
      list.push(...localityPolygons);
    }
    return list;
  }, [layers, territoryPolygons, localityPolygons]);

  // Convert Seller Markers for MarkerLayer
  const sellerMarkers = useMemo(() => {
    return sellers.map((s) => ({
      id: s.id,
      position: { lat: s.latitude!, lng: s.longitude! },
      title: s.business_name,
      label: 'S',
      raw: s,
    }));
  }, [sellers]);

  // Convert Service Person Markers for MarkerLayer
  const servicePersonMarkers = useMemo(() => {
    return servicePersons.map((sp) => ({
      id: sp.id,
      position: { lat: sp.latitude!, lng: sp.longitude! },
      title: sp.business_name,
      label: 'P',
      raw: sp,
    }));
  }, [servicePersons]);

  // Toggle Layer Helper
  const toggleLayer = (layerName: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
    setSelectedItem(null);
  };

  // Polygon Click Handler
  const handlePolygonClick = (polygonId: number) => {
    // Find in territory list first
    const territoryMatch = territories.find((t) => t.id === polygonId);
    if (territoryMatch) {
      setSelectedItem({ type: 'territory', data: territoryMatch });
      return;
    }

    // Find in locality list
    const localityMatch = localities.find((l) => l.id === polygonId);
    if (localityMatch) {
      setSelectedItem({ type: 'locality', data: localityMatch });
    }
  };

  // Seller Marker Click Handler
  const handleSellerClick = (markerId: number) => {
    const sellerMatch = sellers.find((s) => s.id === markerId);
    if (sellerMatch) {
      setSelectedItem({ type: 'seller', data: sellerMatch });
    }
  };

  // Service Person Marker Click Handler
  const handleServicePersonClick = (markerId: number) => {
    const spMatch = servicePersons.find((sp) => sp.id === markerId);
    if (spMatch) {
      setSelectedItem({ type: 'service_person', data: spMatch });
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-80px)] overflow-hidden">
      {/* 1. Header KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Territory Card */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">{kpis.total_territories}</p>
            <p className="text-xs text-neutral-500 font-medium">Territories</p>
          </div>
        </div>

        {/* Locality Card */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">{kpis.total_localities}</p>
            <p className="text-xs text-neutral-500 font-medium">Localities</p>
          </div>
        </div>

        {/* BDM Card */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">{kpis.total_bdms}</p>
            <p className="text-xs text-neutral-500 font-medium">BDM Users</p>
          </div>
        </div>

        {/* Seller Card */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">{kpis.total_sellers}</p>
            <p className="text-xs text-neutral-500 font-medium">Sellers</p>
          </div>
        </div>

        {/* Service Person Card */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Wrench size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">{kpis.total_service_persons}</p>
            <p className="text-xs text-neutral-500 font-medium">Service Persons</p>
          </div>
        </div>
      </div>

      {/* 2. Main layout: Side Filter Panel + Map Grid */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        
        {/* Left Side: Filter Options */}
        <div className="w-full md:w-80 bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col min-h-0">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="font-bold text-neutral-900">Map Layers & Filters</h2>
            {loading && <Loader2 className="animate-spin text-primary-600" size={18} />}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Search filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Search Name / Code</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to filter..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="w-full text-sm pl-9 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute left-3 top-2.5 text-neutral-400" size={16} />
              </div>
            </div>

            {/* Checkbox visibility selectors */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">Layer Visibility</label>
              
              {/* Territory Toggle */}
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={layers.territory}
                  onChange={() => toggleLayer('territory')}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <Globe size={18} className="text-blue-500" />
                <span>Territory Boundaries</span>
              </label>

              {/* Locality Toggle */}
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={layers.locality}
                  onChange={() => toggleLayer('locality')}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <MapPin size={18} className="text-emerald-500" />
                <span>Locality Polygons</span>
              </label>

              {/* BDM Toggle */}
              {!isBDM && (
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={layers.bdm}
                    onChange={() => toggleLayer('bdm')}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                  />
                  <User size={18} className="text-purple-500" />
                  <span>BDM Assignments</span>
                </label>
              )}

              {/* Seller Toggle */}
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={layers.seller}
                  onChange={() => toggleLayer('seller')}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <ShoppingBag size={18} className="text-orange-500" />
                <span>Seller Markers</span>
              </label>

              {/* Service Person Toggle */}
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={layers.service_person}
                  onChange={() => toggleLayer('service_person')}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <Wrench size={18} className="text-teal-500" />
                <span>Service Person Markers</span>
              </label>
            </div>

            {/* Custom scope filters */}
            <div className="space-y-4 pt-4 border-t border-neutral-200">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">Scope Constraints</label>
              
              {/* Territory dropdown */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Territory</label>
                <select
                  value={filters.territory_id}
                  onChange={(e) => setFilters((prev) => ({ ...prev, territory_id: e.target.value, locality_id: '' }))}
                  className="w-full text-sm border border-neutral-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">All Territories</option>
                  {territories.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>

              {/* Locality dropdown */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Locality</label>
                <select
                  value={filters.locality_id}
                  onChange={(e) => setFilters((prev) => ({ ...prev, locality_id: e.target.value }))}
                  className="w-full text-sm border border-neutral-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  disabled={!filters.territory_id}
                >
                  <option value="">All Localities</option>
                  {localities
                    .filter((l) => !filters.territory_id || l.territory_id === Number(filters.territory_id))
                    .map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                    ))}
                </select>
              </div>

              {/* Status dropdown */}
              {(layers.seller || layers.service_person) && (
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Partner Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full text-sm border border-neutral-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Map Canvas & Info Box Overlay */}
        <div className="flex-1 bg-white rounded-xl border border-neutral-200 shadow-sm relative overflow-hidden min-h-0 flex flex-col">
          <div className="flex-1 relative min-h-0">
            <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full min-h-[500px]">
              {(map) => (
                <>
                  {/* Polygons (Territories & Localities) */}
                  {allPolygons.length > 0 && (
                    <PolygonViewer
                      map={map}
                      polygons={allPolygons}
                      onPolygonClick={handlePolygonClick}
                    />
                  )}

                  {/* Sellers Point Markers */}
                  {layers.seller && sellerMarkers.length > 0 && (
                    <MarkerLayer
                      map={map}
                      markers={sellerMarkers}
                      onMarkerClick={handleSellerClick}
                    />
                  )}

                  {/* Service Persons Point Markers */}
                  {layers.service_person && servicePersonMarkers.length > 0 && (
                    <MarkerLayer
                      map={map}
                      markers={servicePersonMarkers}
                      onMarkerClick={handleServicePersonClick}
                    />
                  )}
                </>
              )}
            </MapContainer>

            {/* Sidebar Map Detail Panel Overlay */}
            {selectedItem && (
              <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-md rounded-xl border border-neutral-200 shadow-lg z-10 animate-fade-in flex flex-col max-h-[80%] overflow-y-auto">
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50 rounded-t-xl">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {selectedItem.type.replace('_', ' ')} Details
                  </span>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* 1. Details for Territory */}
                  {selectedItem.type === 'territory' && (
                    <>
                      <div>
                        <h3 className="text-base font-bold text-neutral-900">{selectedItem.data.name}</h3>
                        <p className="text-xs text-neutral-500 font-mono mt-0.5">{selectedItem.data.code}</p>
                      </div>
                      
                      {selectedItem.data.description && (
                        <div className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                          {selectedItem.data.description}
                        </div>
                      )}

                      <div className="space-y-2.5 text-xs text-neutral-600">
                        <div className="flex items-center gap-2">
                          <Building size={14} className="text-neutral-400" />
                          <span><strong>Division:</strong> {selectedItem.data.division?.name || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-neutral-400" />
                          <span><strong>BDM:</strong> {selectedItem.data.active_assignment?.user?.name || 'Unassigned'}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 2. Details for Locality */}
                  {selectedItem.type === 'locality' && (
                    <>
                      <div>
                        <h3 className="text-base font-bold text-neutral-900">{selectedItem.data.name}</h3>
                        <p className="text-xs text-neutral-500 font-mono mt-0.5">{selectedItem.data.code}</p>
                      </div>
                      
                      {selectedItem.data.description && (
                        <div className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                          {selectedItem.data.description}
                        </div>
                      )}

                      <div className="space-y-2.5 text-xs text-neutral-600">
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-neutral-400" />
                          <span><strong>Territory:</strong> {selectedItem.data.territory?.name || 'Unassigned'}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 3. Details for Seller & Service Person */}
                  {(selectedItem.type === 'seller' || selectedItem.type === 'service_person') && (
                    <>
                      <div>
                        <h3 className="text-base font-bold text-neutral-900">{selectedItem.data.business_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700">
                            {selectedItem.data.partner_type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            selectedItem.data.status === 'active' ? 'bg-success-100 text-success-800' :
                            selectedItem.data.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                            'bg-neutral-100 text-neutral-700'
                          }`}>
                            {selectedItem.data.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-neutral-600 border-t border-b border-neutral-100 py-3">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-neutral-400" />
                          <span><strong>Contact Name:</strong> {selectedItem.data.contact_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-neutral-400" />
                          <span><strong>Mobile:</strong> {selectedItem.data.contact_mobile}</span>
                        </div>
                        {selectedItem.data.contact_email && (
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-neutral-400" />
                            <span><strong>Email:</strong> {selectedItem.data.contact_email}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <Navigation size={14} className="text-neutral-400 mt-0.5" />
                          <span><strong>Address:</strong> {selectedItem.data.business_address}</span>
                        </div>
                      </div>

                      {/* Display coverage localities for Service Person */}
                      {selectedItem.type === 'service_person' && selectedItem.data.coverage_localities && (
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-semibold text-neutral-700">Coverage Areas:</h4>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                            {selectedItem.data.coverage_localities.length === 0 ? (
                              <span className="text-xs text-neutral-400 italic">No assigned localities</span>
                            ) : (
                              selectedItem.data.coverage_localities.map((loc: Locality) => (
                                <span key={loc.id} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-medium">
                                  {loc.name}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
