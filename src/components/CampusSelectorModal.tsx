import React, { useState } from 'react';
import { X, MapPin, Check, Building2 } from 'lucide-react';
import { CAMPUSES } from '../data/campuses';
import { CampusOption } from '../types';

interface CampusSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCampus: CampusOption;
  selectedZone: string;
  onSelect: (campus: CampusOption, zone: string) => void;
}

export const CampusSelectorModal: React.FC<CampusSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCampus,
  selectedZone,
  onSelect,
}) => {
  const [activeCampus, setActiveCampus] = useState<CampusOption>(selectedCampus);
  const [activeZone, setActiveZone] = useState<string>(selectedZone);

  if (!isOpen) return null;

  const handleSave = () => {
    onSelect(activeCampus, activeZone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-cream-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-900">Select Campus & Zone</h3>
              <p className="text-xs text-charcoal-500">Pick where you are craving and ordering food</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-charcoal-800 hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
              Campuses with Active Craving Hubs
            </label>
            <div className="grid grid-cols-1 gap-2">
              {CAMPUSES.map((campus) => {
                const isSelected = activeCampus.id === campus.id;
                return (
                  <button
                    key={campus.id}
                    onClick={() => {
                      setActiveCampus(campus);
                      setActiveZone(campus.zones[0]);
                    }}
                    className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${isSelected ? 'bg-brand-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-charcoal-900">{campus.name}</div>
                        <div className="text-xs text-charcoal-500">{campus.city} · {campus.activeCravingsCount} active cravings</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
              Delivery Zone at {activeCampus.name.split(',')[0]}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeCampus.zones.map((zone) => {
                const isZoneSelected = activeZone === zone;
                return (
                  <button
                    key={zone}
                    onClick={() => setActiveZone(zone)}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isZoneSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-800 font-bold ring-1 ring-brand-400'
                        : 'border-stone-200 text-charcoal-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{zone}</span>
                    {isZoneSelected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-stone-50 border-t border-stone-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Switch to This Campus
          </button>
        </div>
      </div>
    </div>
  );
};
