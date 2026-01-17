import React from 'react';
import { Navigation, Footprints, Hospital, Flame, Shield, Satellite, MapPinned } from 'lucide-react';

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

    const openSatelliteView = () => {
        // Opens Google Maps in satellite view centered on the location
        const url = `https://www.google.com/maps/@${latitude},${longitude},18z/data=!3m1!1e3`;
        window.open(url, '_blank');
    };

    const dropPinAndShare = () => {
        // Opens Google Maps with a pin dropped at the location, ready to share
        const url = `https://www.google.com/maps/place/${latitude},${longitude}/@${latitude},${longitude},17z`;
        window.open(url, '_blank');
    };

    const findNearest = (query: string) => {
        const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},15z`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Navigate Driving */}
            <button
                onClick={() => openGoogleMaps('driving')}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors group relative"
                title="Navigate to Incident (Driving)"
            >
                <Navigation size={16} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
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
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Navigate (Walking)
                </span>
            </button>

            {/* Satellite View */}
            <button
                onClick={openSatelliteView}
                className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors group relative"
                title="Satellite View"
            >
                <Satellite size={16} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Satellite View
                </span>
            </button>

            {/* Drop Pin & Share */}
            <button
                onClick={dropPinAndShare}
                className="p-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors group relative"
                title="Drop Pin & Share Location"
            >
                <MapPinned size={16} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Drop Pin & Share
                </span>
            </button>

            {/* Nearest Hospital */}
            <button
                onClick={() => findNearest('hospital')}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors group relative"
                title="Nearest Hospital"
            >
                <Hospital size={16} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
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
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
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
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Nearest Police Station
                </span>
            </button>
        </div>
    );
};
