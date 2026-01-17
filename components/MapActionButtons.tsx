import React from 'react';
import { Navigation, Footprints, Hospital, Flame, Shield } from 'lucide-react';

interface MapActionButtonsProps {
    latitude: number;
    longitude: number;
    location?: string;
}

export const MapActionButtons: React.FC<MapActionButtonsProps> = ({ latitude, longitude, location }) => {
    const openGoogleMaps = (mode: 'driving' | 'walking') => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${mode}`;
        window.open(url, '_blank');
    };

    const findNearest = (query: string) => {
        const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},15z`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex items-center gap-2">
            {/* Navigate Driving */}
            <button
                onClick={() => openGoogleMaps('driving')}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors group relative"
                title="Navigate (Driving)"
            >
                <Navigation size={16} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Navigate (Driving)
                </span>
            </button>

            {/* Navigate Walking */}
            <button
                onClick={() => openGoogleMaps('walking')}
                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors group relative"
                title="Navigate (Walking)"
            >
                <Footprints size={16} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Navigate (Walking)
                </span>
            </button>

            {/* Nearest Hospital */}
            <button
                onClick={() => findNearest('hospital')}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors group relative"
                title="Nearest Hospital"
            >
                <Hospital size={16} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Nearest Hospital
                </span>
            </button>

            {/* Nearest Fire Station */}
            <button
                onClick={() => findNearest('fire station')}
                className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors group relative"
                title="Nearest Fire Station"
            >
                <Flame size={16} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Nearest Fire Station
                </span>
            </button>

            {/* Nearest Police Station */}
            <button
                onClick={() => findNearest('police station')}
                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors group relative"
                title="Nearest Police Station"
            >
                <Shield size={16} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Nearest Police Station
                </span>
            </button>
        </div>
    );
};
