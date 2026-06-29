import { useEffect, useRef } from 'react';

interface MarkerData {
  id: number;
  position: google.maps.LatLngLiteral;
  title: string;
  label?: string;
}

interface MarkerLayerProps {
  map: google.maps.Map;
  markers: MarkerData[];
  onMarkerClick?: (id: number) => void;
}

export default function MarkerLayer({ map, markers, onMarkerClick }: MarkerLayerProps) {
  const activeMarkersRef = useRef<Map<number, google.maps.Marker>>(new Map());

  useEffect(() => {
    if (!map) return;

    // Clear old markers
    activeMarkersRef.current.forEach((marker) => marker.setMap(null));
    activeMarkersRef.current.clear();

    markers.forEach((m) => {
      const marker = new google.maps.Marker({
        position: m.position,
        title: m.title,
        label: m.label ? { text: m.label, color: '#ffffff', fontWeight: 'bold' } : undefined,
        map,
      });

      if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(m.id));
      }

      activeMarkersRef.current.set(m.id, marker);
    });

    return () => {
      activeMarkersRef.current.forEach((marker) => marker.setMap(null));
      activeMarkersRef.current.clear();
    };
  }, [map, markers]);

  return null;
}
