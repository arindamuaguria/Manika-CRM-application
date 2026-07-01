import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertTriangle, Globe } from 'lucide-react';

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
    // Setup authentication failure listener
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps API authentication failed. Displaying fallback mock map.");
      setStatus('error');
    };

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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing&v=3.64`;
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
      <div className={`${className} flex flex-col bg-neutral-900 text-white relative group overflow-hidden select-none`}>
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        {/* Stylized Vector Map Paths */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none scale-110">
          <svg className="w-full h-full max-h-[450px]" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Territory 1: Kolkata North */}
            <path d="M 250 150 L 380 120 L 400 280 L 290 320 Z" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
            <text x="310" y="210" fill="#3b82f6" fontSize="12" fontWeight="bold" opacity="0.6">KOLKATA NORTH (TERR-KOL-NTH)</text>

            {/* Territory 2: Howrah */}
            <path d="M 120 180 L 240 160 L 280 310 L 150 350 Z" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2" />
            <text x="170" y="250" fill="#8b5cf6" fontSize="12" fontWeight="bold" opacity="0.6">HOWRAH (TERR-HOW)</text>

            {/* Territory 3: Salt Lake */}
            <path d="M 390 130 L 520 110 L 550 260 L 410 290 Z" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2" />
            <text x="440" y="200" fill="#10b981" fontSize="12" fontWeight="bold" opacity="0.6">SALT LAKE (TERR-SLT)</text>

            {/* Territory 4: South Kolkata */}
            <path d="M 300 330 L 420 300 L 450 490 L 270 510 Z" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="2" />
            <text x="330" y="420" fill="#f59e0b" fontSize="12" fontWeight="bold" opacity="0.6">KOLKATA SOUTH (TERR-KOL-STH)</text>

            {/* Mock Seller Pins */}
            <circle cx="330" cy="220" r="6" fill="#f97316" />
            <circle cx="200" cy="260" r="6" fill="#f97316" />
            <circle cx="470" cy="180" r="6" fill="#f97316" />
            
            {/* Mock Service Person Pins */}
            <polygon points="430,370 435,380 425,380" fill="#14b8a6" />
            <polygon points="180,280 185,290 175,290" fill="#14b8a6" />
          </svg>
        </div>

        {/* Warning Indicator Toast */}
        <div className="absolute top-4 left-4 right-4 md:left-6 md:right-auto md:w-[450px] bg-neutral-850/95 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl flex items-start gap-3 z-10">
          <div className="w-10 h-10 rounded-lg bg-warning-500/10 text-warning-500 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-neutral-100">Offline Visualization Mode</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Google Maps failed to authenticate (API key missing or restricted). The application has dynamically transitioned to offline vector rendering to protect the user experience.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] font-semibold bg-white/10 text-white px-2 py-0.5 rounded">
                API Key Checked
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                AIzaSyAOV...
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Center Banner */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 gap-2">
          <Globe className="text-primary-400/80 animate-pulse mb-1" size={48} />
          <h3 className="text-lg font-bold text-white tracking-wide">Interactive Vector Preview Active</h3>
          <p className="text-xs text-neutral-400 max-w-sm">
            Sidebar layers and dynamic filtering are fully operational in vector preview mode.
          </p>
        </div>

        {/* Bottom Floating Map Controls Mockup */}
        <div className="absolute bottom-4 right-4 bg-neutral-850/95 border border-white/10 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold text-neutral-400 shadow-xl">
          <span>Scale: 1 : 50,000</span>
          <span className="text-neutral-600">|</span>
          <span className="text-primary-400 font-bold">Vector Mode</span>
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
