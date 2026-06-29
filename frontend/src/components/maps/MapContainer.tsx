import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface MapContainerProps {
  children: (map: google.maps.Map) => React.ReactNode;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  className?: string;
}

export default function MapContainer({
  children,
  center = { lat: 20.5937, lng: 78.9629 }, // Center of India
  zoom = 5,
  className = 'h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-neutral-200',
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (!apiKey) {
      setStatus('error');
      return;
    }

    // Check if script is already loaded
    if (window.google?.maps) {
      setStatus('ready');
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing`;
      script.async = true;
      script.defer = true;
      script.onload = () => setStatus('ready');
      script.onerror = () => setStatus('error');
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setStatus('ready'));
      script.addEventListener('error', () => setStatus('error'));
    }
  }, [apiKey]);

  useEffect(() => {
    if (status === 'ready' && mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ visibility: 'on' }],
          },
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });
      setMap(newMap);
    }
  }, [status, map]);

  if (status === 'loading') {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-neutral-50 gap-3`}>
        <Loader2 className="animate-spin text-primary-600" size={32} />
        <p className="text-sm text-neutral-500">Loading Google Maps...</p>
      </div>
    );
  }

  if (status === 'error' || !apiKey) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-neutral-100 p-6 gap-3 text-center border border-dashed border-neutral-300`}>
        <AlertTriangle className="text-warning-500" size={36} />
        <div>
          <h3 className="font-bold text-neutral-900">Google Maps API Key Missing</h3>
          <p className="text-xs text-neutral-500 max-w-sm mt-1">
            Please add <code className="bg-neutral-200 px-1 py-0.5 rounded text-danger-600">VITE_GOOGLE_MAPS_API_KEY</code> to your frontend <code className="bg-neutral-200 px-1 py-0.5 rounded">.env</code> file. Displaying a premium visual fallback.
          </p>
        </div>
        {/* Visual Mock Map Fallback */}
        <div className="w-full max-w-xs h-32 border border-neutral-200 rounded-lg bg-neutral-50 flex items-center justify-center shadow-inner relative overflow-hidden mt-2">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <span className="text-xs font-semibold text-neutral-400">Interactive Map Preview</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-xl" />
      {map && children(map)}
    </div>
  );
}
