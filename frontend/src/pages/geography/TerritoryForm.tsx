import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import MapContainer from '@/components/maps/MapContainer';
import PolygonDrawer from '@/components/maps/PolygonDrawer';
import type { Territory, Division, ApiResponse, PaginatedResponse } from '@/types';
import { ArrowLeft, Loader2, Map } from 'lucide-react';

export default function TerritoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    division_id: '',
    name: '',
    code: '',
    description: '',
    boundaries: null as any,
    is_active: true,
  });
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Path format for drawing component
  const [polygonPath, setPolygonPath] = useState<google.maps.LatLngLiteral[]>([]);

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const response = await api.get<PaginatedResponse<Division>>('/divisions?per_page=100');
        setDivisions(response.data.data.data);
        if (!isEdit && response.data.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, division_id: response.data.data.data[0].id.toString() }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDivisions();
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) {
      const fetchTerritory = async () => {
        setIsLoading(true);
        try {
          const response = await api.get<ApiResponse<Territory>>(`/territories/${id}`);
          const t = response.data.data;
          setFormData({
            division_id: t.division_id.toString(),
            name: t.name,
            code: t.code,
            description: t.description || '',
            boundaries: t.boundaries,
            is_active: t.is_active,
          });

          if (t.boundaries && t.boundaries.coordinates) {
            // Convert GeoJSON [[[lng, lat], ...]] to Google LatLng [{lat, lng}, ...]
            const coords = t.boundaries.coordinates[0];
            setPolygonPath(coords.map((c: number[]) => ({ lat: c[1], lng: c[0] })));
          }
        } catch (err) {
          console.error(err);
          setError('Failed to load territory details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTerritory();
    }
  }, [id, isEdit]);

  const handlePolygonComplete = (path: google.maps.LatLngLiteral[]) => {
    setPolygonPath(path);
    // Convert to GeoJSON: [[[lng, lat], ...]] and close the polygon loop
    const coordinates = [...path.map((pt) => [pt.lng, pt.lat]), [path[0].lng, path[0].lat]];
    setFormData((prev) => ({
      ...prev,
      boundaries: {
        type: 'Polygon',
        coordinates: [coordinates],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.boundaries) {
      setError('Please draw the territory boundary on the map.');
      return;
    }

    setIsSubmitLoading(true);
    try {
      if (isEdit) {
        await api.put(`/territories/${id}`, formData);
      } else {
        await api.post('/territories', formData);
      }
      navigate('/geography/territories');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save territory.');
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
        onClick={() => navigate('/geography/territories')}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to territories
      </button>

      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {isEdit ? 'Edit Territory' : 'Create Territory'}
        </h1>
        <p className="text-neutral-500 text-sm">
          {isEdit ? 'Update territory boundaries and details.' : 'Draw boundaries and create a new territory.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side — Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Division
              </label>
              <select
                value={formData.division_id}
                onChange={(e) => setFormData({ ...formData, division_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Territory Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Kolkata Territory"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Territory Code
              </label>
              <input
                type="text"
                required
                disabled={isEdit}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. TERR-KOLKATA"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a brief description..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {isEdit && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-neutral-700">
                  Active status
                </label>
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
                onClick={() => navigate('/geography/territories')}
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

        {/* Right Side — Google Maps Boundary Drawer */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center gap-2">
            <Map size={18} className="text-primary-600" />
            <span className="text-sm font-bold text-neutral-800">Draw Territory Boundary</span>
            <span className="text-xs text-neutral-500 ml-auto">
              {polygonPath.length > 0 ? `${polygonPath.length} points defined` : 'Click on the map to start drawing a polygon'}
            </span>
          </div>
          <div className="flex-1 min-h-[500px] relative">
            <MapContainer className="w-full h-full min-h-[500px]">
              {(map) => (
                <PolygonDrawer
                  map={map}
                  onPolygonComplete={handlePolygonComplete}
                  initialPath={polygonPath}
                />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
