import MapContainer from './MapContainer';
import PolygonViewer from './PolygonViewer';
import type { Territory } from '@/types';

interface TerritoryMapViewProps {
  territories: Territory[];
  onTerritoryClick?: (id: number) => void;
  className?: string;
}

export default function TerritoryMapView({
  territories,
  onTerritoryClick,
  className = 'h-[500px] w-full rounded-xl overflow-hidden shadow-sm border border-neutral-200',
}: TerritoryMapViewProps) {
  // Map territory boundaries to PolygonViewer format
  const polygons = territories
    .filter((t) => t.boundaries && t.boundaries.coordinates)
    .map((t) => {
      // GeoJSON: [[[lng, lat], [lng, lat], ...]]
      // Convert to google.maps.LatLngLiteral: [{lat, lng}, {lat, lng}, ...]
      const coords = t.boundaries!.coordinates[0];
      const path = coords.map((c: number[]) => ({
        lat: c[1],
        lng: c[0],
      }));

      // Generate a deterministic color based on territory ID
      const colors = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#ec4899'];
      const color = colors[t.id % colors.length];

      return {
        id: t.id,
        path,
        color,
        label: t.name,
      };
    });

  return (
    <div className={className}>
      <MapContainer className="w-full h-full">
        {(map) => (
          <PolygonViewer map={map} polygons={polygons} onPolygonClick={onTerritoryClick} />
        )}
      </MapContainer>
    </div>
  );
}
