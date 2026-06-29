import { useEffect, useRef } from 'react';

interface PolygonViewerProps {
  map: google.maps.Map;
  polygons: Array<{
    id: number;
    path: google.maps.LatLngLiteral[];
    color?: string;
    label?: string;
  }>;
  onPolygonClick?: (id: number) => void;
}

export default function PolygonViewer({ map, polygons, onPolygonClick }: PolygonViewerProps) {
  const renderedPolygonsRef = useRef<Map<number, google.maps.Polygon>>(new Map());

  useEffect(() => {
    if (!map) return;

    // Clear existing polygons
    renderedPolygonsRef.current.forEach((poly) => poly.setMap(null));
    renderedPolygonsRef.current.clear();

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    polygons.forEach((p) => {
      if (!p.path || p.path.length === 0) return;

      const poly = new google.maps.Polygon({
        paths: p.path,
        strokeColor: p.color || '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: p.color || '#2563eb',
        fillOpacity: 0.25,
        map,
      });

      if (onPolygonClick) {
        poly.addListener('click', () => onPolygonClick(p.id));
      }

      renderedPolygonsRef.current.set(p.id, poly);

      p.path.forEach((pt) => {
        bounds.extend(pt);
        hasPoints = true;
      });
    });

    if (hasPoints && polygons.length > 0) {
      map.fitBounds(bounds);
    }

    return () => {
      renderedPolygonsRef.current.forEach((poly) => poly.setMap(null));
      renderedPolygonsRef.current.clear();
    };
  }, [map, polygons]);

  return null;
}
