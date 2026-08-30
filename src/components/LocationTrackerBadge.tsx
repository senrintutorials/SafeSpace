import React, { useState } from 'react';
import { 
  MapPin, Radio, RefreshCw, Compass, ShieldCheck, AlertTriangle, 
  X, Check, ChevronDown, Navigation, Layers, Satellite, ShieldAlert
} from 'lucide-react';
import { useLocationTracker, CAMPUS_ZONES } from '../utils/locationTracker';

interface LocationTrackerBadgeProps {
  compact?: boolean;
}

export default function LocationTrackerBadge({ compact = false }: LocationTrackerBadgeProps) {
  const { location, refreshLocation, requestGps, setZone, startTracking, stopTracking, zones } = useLocationTracker();
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshLocation();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <>
      {/* Live Header / Bar Location Pill */}
      {compact ? (
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 text-xs shadow-2xs transition-all shrink-0 cursor-pointer"
          title="Click to view live Auto-Location Tracker & Geofence Status"
        >
          <span className="relative flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping absolute opacity-75" />
            <span className="w-2 h-2 rounded-full bg-teal-600 relative" />
          </span>
          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="font-semibold text-[11px] text-slate-800 truncate max-w-[100px]">
            {location.campusZone}
          </span>
        </button>
      ) : (
        <div 
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 shadow-2xs cursor-pointer transition-all hover:border-teal-400 group shrink-0"
          title="Click to view live Auto-Location Tracker & Geofence Status"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping absolute opacity-75" />
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 relative" />
            </div>
            <MapPin className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
            <div className="flex flex-col min-w-0 flex-1 text-left">
              <span className="font-bold text-xs text-slate-900 truncate tracking-tight">
                {location.campusZone}
              </span>
              <span className="font-mono text-[10px] text-teal-700 font-medium truncate">
                {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}° • {location.timestamp}
              </span>
            </div>
          </div>
          {/* GPS Live badge removed per user request */}
        </div>
      )}

      {/* Interactive Location Tracker Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <Satellite className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    Automatic Location Tracker
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time GPS telemetry & campus geofence tracking across SafeSpace platforms
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Current GPS Telemetry Card */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" /> Live Telemetry Data
                  </span>
                  <div className="flex items-center gap-1.5">
                    {location.source === 'GPS_HARDWARE' ? (
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-700/80 flex items-center gap-1">
                        <Satellite className="w-3 h-3 text-emerald-400" /> Real Hardware GPS
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-full border border-amber-700/80 flex items-center gap-1">
                        🏢 Campus Beacon Preset
                      </span>
                    )}
                    <span className="text-[11px] font-mono font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-800">
                      Accuracy ±{location.accuracy}m
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] text-slate-400 block">LATITUDE</span>
                    <span className="text-sm font-mono font-extrabold text-white">{location.latitude}° N</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] text-slate-400 block">LONGITUDE</span>
                    <span className="text-sm font-mono font-extrabold text-white">{location.longitude}° E</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-xs text-slate-400 block uppercase font-semibold">REVERSE-GEOCODED ADDRESS / LANDMARK:</span>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-bold text-slate-200 flex items-start gap-2 leading-relaxed">
                    <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span className="break-words">{location.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Geofence: {location.geofenceStatus}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Updated: {location.timestamp}</span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={async () => {
                    setIsRefreshing(true);
                    await requestGps();
                    setTimeout(() => setIsRefreshing(false), 600);
                  }}
                  disabled={isRefreshing}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
                >
                  <Satellite className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Acquiring Real Device GPS...' : '📍 Acquire Real Device GPS'}</span>
                </button>

                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  title="Ping position updates"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => {
                    if (location.isTrackingActive) {
                      stopTracking();
                    } else {
                      startTracking();
                    }
                  }}
                  className={`px-3 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 cursor-pointer ${
                    location.isTrackingActive 
                      ? 'bg-slate-800 text-teal-300 border-teal-500/40 hover:bg-slate-700' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{location.isTrackingActive ? 'Tracking ON' : 'Resume'}</span>
                </button>
              </div>

              {/* Preset Campus Zones (For Testing / Manual Override) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
                  <span>Simulate / Select Campus Zone:</span>
                  <span className="text-[10px] text-slate-500 font-normal">Auto-Syncs Across Features</span>
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {zones.map((z) => {
                    const isSelected = location.campusZone === z.label;
                    return (
                      <button
                        key={z.id}
                        onClick={() => setZone(z.id)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-teal-950/60 border-teal-500/60 text-teal-200 font-bold'
                            : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                          <div className="truncate">
                            <span className="block truncate">{z.label}</span>
                            <span className="text-[10px] text-slate-400 block truncate font-normal">{z.address}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-400" /> Auto-attached to Reports, Audits & Emergency SOS
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
