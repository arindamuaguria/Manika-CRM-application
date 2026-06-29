import { useEffect, useRef } from 'react';

interface PolygonDrawerProps {
  map: google.maps.Map;
  onPolygonComplete: (path: google.maps.LatLngLiteral[]) => void;
  initialPath?: google.maps.LatLngLiteral[];
  editable?: boolean;
}

export default function PolygonDrawer({
  map,
  onPolygonComplete,
  initialPath,
  editable = true,
}: PolygonDrawerProps) {
  const drawingManagerRef = useRef<any>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map) return;

    // If there is an initial path, draw the polygon
    if (initialPath && initialPath.length > 0) {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }

      const polygon = new google.maps.Polygon({
        paths: initialPath,
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#2563eb',
        fillOpacity: 0.35,
        editable,
        draggable: editable,
        map,
      });

      polygonRef.current = polygon;

      // Fit map to polygon bounds
      const bounds = new google.maps.LatLngBounds();
      initialPath.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds);

      // Listen to edit events
      if (editable) {
        const updatePath = () => {
          const path = polygon.getPath();
          const points: google.maps.LatLngLiteral[] = [];
          for (let i = 0; i < path.getLength(); i++) {
            const xy = path.getAt(i);
            points.push({ lat: xy.lat(), lng: xy.lng() });
          }
          onPolygonComplete(points);
        };

        google.maps.event.addListener(polygon.getPath(), 'insert_at', updatePath);
        google.maps.event.addListener(polygon.getPath(), 'remove_at', updatePath);
        google.maps.event.addListener(polygon.getPath(), 'set_at', updatePath);
      }
      return;
    }

    // Initialize Drawing Manager for drawing new polygon
    if (editable && !drawingManagerRef.current && (google.maps as any).drawing) {
      const drawingManager = new (google.maps as any).drawing.DrawingManager({
        drawingMode: (google.maps as any).drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [(google.maps as any).drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: '#2563eb',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#2563eb',
          clickable: true,
          editable: true,
          zIndex: 1,
        },
      });

      drawingManager.setMap(map);
      drawingManagerRef.current = drawingManager;

      google.maps.event.addListener(
        drawingManager,
        'overlaycomplete',
        (event: any) => {
          if (event.type === (google.maps as any).drawing.OverlayType.POLYGON && event.overlay) {
            // Disable drawing mode after one polygon is drawn
            drawingManager.setDrawingMode(null);
            drawingManager.setOptions({ drawingControl: false });

            const newPolygon = event.overlay as google.maps.Polygon;
            polygonRef.current = newPolygon;

            const path = newPolygon.getPath();
            const points: google.maps.LatLngLiteral[] = [];
            for (let i = 0; i < path.getLength(); i++) {
              const xy = path.getAt(i);
              points.push({ lat: xy.lat(), lng: xy.lng() });
            }
            onPolygonComplete(points);

            // Listen to edit events
            const updatePath = () => {
              const p = newPolygon.getPath();
              const pts: google.maps.LatLngLiteral[] = [];
              for (let i = 0; i < p.getLength(); i++) {
                const xy = p.getAt(i);
                pts.push({ lat: xy.lat(), lng: xy.lng() });
              }
              onPolygonComplete(pts);
            };

            google.maps.event.addListener(newPolygon.getPath(), 'insert_at', updatePath);
            google.maps.event.addListener(newPolygon.getPath(), 'remove_at', updatePath);
            google.maps.event.addListener(newPolygon.getPath(), 'set_at', updatePath);
          }
        }
      );
    }

    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setMap(null);
        drawingManagerRef.current = null;
      }
    };
  }, [map, initialPath, editable]);

  return null;
}
