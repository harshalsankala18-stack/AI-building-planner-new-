import React, { useState } from 'react';
import {
  Boxes,
  DoorClosed,
  DoorOpen,
  Layers,
  Search,
  Sparkles,
  SquareDashedBottom,
  X,
} from 'lucide-react';
import { DOOR_CATALOG, WINDOW_CATALOG } from '@ai-floor-planner/core';

export interface ElementsCatalogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectElement?: (elementInfo: { type: 'door' | 'window' | 'stair'; category: string; defaultWidthMm: number; defaultHeightMm: number }) => void;
}

export type CatalogCategoryTab = 'all' | 'exterior_doors' | 'interior_doors' | 'windows' | 'stairs' | 'interiors_b2';

export const ElementsCatalogDrawer: React.FC<ElementsCatalogDrawerProps> = ({
  isOpen,
  onClose,
  onSelectElement,
}) => {
  const [activeTab, setActiveTab] = useState<CatalogCategoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  if (!isOpen) return null;

  const exteriorDoors = DOOR_CATALOG.filter(d => d.placement === 'exterior');
  const interiorDoors = DOOR_CATALOG.filter(d => d.placement === 'interior');
  const windows = WINDOW_CATALOG;

  const stairs = [
    {
      id: 'stair_dog_legged',
      name: 'Dog-Legged (U-Shape) Staircase',
      tag: 'ST1',
      category: 'stair_u_shaped',
      defaultWidthMm: 2400,
      defaultLengthMm: 4800,
      riserCount: 18,
      treadMm: 250,
      description: 'Standard 2-flight residential stair with intermediate landing at mid-storey.',
    },
    {
      id: 'stair_straight',
      name: 'Straight Flight Staircase',
      tag: 'ST2',
      category: 'stair_straight',
      defaultWidthMm: 1200,
      defaultLengthMm: 3600,
      riserCount: 18,
      treadMm: 250,
      description: 'Continuous single-run stair ideal for linear circulation corridors.',
    },
    {
      id: 'stair_l_shaped',
      name: 'L-Shaped Quarter Turn Staircase',
      tag: 'ST3',
      category: 'stair_l_shaped',
      defaultWidthMm: 2400,
      defaultLengthMm: 3600,
      riserCount: 18,
      treadMm: 250,
      description: '90-degree corner stair with corner landing for duplex or compact cores.',
    },
  ];

  const handleItemClick = (item: { type: 'door' | 'window' | 'stair'; tag: string; category: string; width: number; height: number }) => {
    setSelectedTag(item.tag);
    onSelectElement?.({
      type: item.type,
      category: item.category,
      defaultWidthMm: item.width,
      defaultHeightMm: item.height,
    });
  };

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="elements-catalog-drawer"
      className="elements-catalog-drawer fixed inset-0 z-[990] flex justify-end bg-black/40 backdrop-blur-2xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-[320px] max-w-full h-full bg-[#FFFFFF] border-l border-[#E2DDD5] shadow-2xl flex flex-col text-[#181D23] animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2DDD5] bg-[#F7F5F0]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-100 text-emerald-800">
              <Boxes className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#181D23]">Elements Catalog</h3>
              <p className="text-[10px] text-[#5C6672]">Doors, Windows & Staircases</p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-elements-catalog-drawer"
            onClick={onClose}
            className="p-1 rounded text-[#5C6672] hover:text-[#181D23] hover:bg-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-[#E2DDD5] bg-white">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search elements by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#D5CFE6] bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-[#E2DDD5] bg-[#FBF9F5] overflow-x-auto text-[11px]">
          <button
            data-testid="catalog-tab-all"
            onClick={() => setActiveTab('all')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap transition ${
              activeTab === 'all' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            data-testid="catalog-tab-exterior_doors"
            onClick={() => setActiveTab('exterior_doors')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap transition ${
              activeTab === 'exterior_doors' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ext. Doors
          </button>
          <button
            data-testid="catalog-tab-interior_doors"
            onClick={() => setActiveTab('interior_doors')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap transition ${
              activeTab === 'interior_doors' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Int. Doors
          </button>
          <button
            data-testid="catalog-tab-windows"
            onClick={() => setActiveTab('windows')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap transition ${
              activeTab === 'windows' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Windows
          </button>
          <button
            data-testid="catalog-tab-stairs"
            onClick={() => setActiveTab('stairs')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap transition ${
              activeTab === 'stairs' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Stairs
          </button>
          <button
            data-testid="catalog-tab-interiors_b2"
            onClick={() => setActiveTab('interiors_b2')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap transition ${
              activeTab === 'interiors_b2' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Interiors
          </button>
        </div>

        {/* Catalog List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Exterior Doors Section */}
          {(activeTab === 'all' || activeTab === 'exterior_doors') && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <DoorClosed className="h-3.5 w-3.5 text-sky-600" />
                <span>Exterior Doors ({exteriorDoors.length})</span>
              </div>
              <div className="space-y-2">
                {exteriorDoors.filter(d => matchesSearch(d.name) || matchesSearch(d.tag)).map((d) => (
                  <div
                    key={d.category}
                    data-testid={`catalog-item-${d.category}`}
                    onClick={() => handleItemClick({ type: 'door', tag: d.tag, category: d.category, width: d.defaultWidthMm, height: d.defaultHeightMm })}
                    className={`p-2.5 rounded-lg border transition cursor-pointer ${
                      selectedTag === d.tag
                        ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                        : 'border-[#E2DDD5] bg-white hover:border-slate-400 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[11px]">{d.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-100 text-sky-800">
                        {d.tag}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{d.defaultWidthMm} × {d.defaultHeightMm} mm</span>
                      <span>·</span>
                      <span>{d.leafCount === 2 ? 'Double Leaf' : 'Single Leaf'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                      {d.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interior Doors Section */}
          {(activeTab === 'all' || activeTab === 'interior_doors') && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <DoorOpen className="h-3.5 w-3.5 text-amber-600" />
                <span>Interior Doors ({interiorDoors.length})</span>
              </div>
              <div className="space-y-2">
                {interiorDoors.filter(d => matchesSearch(d.name) || matchesSearch(d.tag)).map((d) => (
                  <div
                    key={d.category}
                    data-testid={`catalog-item-${d.category}`}
                    onClick={() => handleItemClick({ type: 'door', tag: d.tag, category: d.category, width: d.defaultWidthMm, height: d.defaultHeightMm })}
                    className={`p-2.5 rounded-lg border transition cursor-pointer ${
                      selectedTag === d.tag
                        ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                        : 'border-[#E2DDD5] bg-white hover:border-slate-400 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[11px]">{d.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                        {d.tag}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{d.defaultWidthMm} × {d.defaultHeightMm} mm</span>
                      <span>·</span>
                      <span>{d.leafCount === 0 ? 'Cased Opening' : d.leafCount === 2 ? 'Double Leaf' : 'Single Leaf'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                      {d.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Windows Section */}
          {(activeTab === 'all' || activeTab === 'windows') && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <SquareDashedBottom className="h-3.5 w-3.5 text-emerald-600" />
                <span>Windows & Glazing ({windows.length})</span>
              </div>
              <div className="space-y-2">
                {windows.filter(w => matchesSearch(w.name) || matchesSearch(w.tag)).map((w) => (
                  <div
                    key={w.category}
                    data-testid={`catalog-item-${w.category}`}
                    onClick={() => handleItemClick({ type: 'window', tag: w.tag, category: w.category, width: w.defaultWidthMm, height: w.defaultHeightMm })}
                    className={`p-2.5 rounded-lg border transition cursor-pointer ${
                      selectedTag === w.tag
                        ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                        : 'border-[#E2DDD5] bg-white hover:border-slate-400 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[11px]">{w.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                        {w.tag}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{w.defaultWidthMm} × {w.defaultHeightMm} mm</span>
                      <span>·</span>
                      <span>Sill: {w.defaultSillHeightMm} mm</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                      {w.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staircases Section */}
          {(activeTab === 'all' || activeTab === 'stairs') && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <Layers className="h-3.5 w-3.5 text-purple-600" />
                <span>Native 3D Staircases ({stairs.length})</span>
              </div>
              <div className="space-y-2">
                {stairs.filter(s => matchesSearch(s.name) || matchesSearch(s.tag)).map((s) => (
                  <div
                    key={s.id}
                    data-testid={`catalog-item-${s.id}`}
                    onClick={() => handleItemClick({ type: 'stair', tag: s.tag, category: s.category, width: s.defaultWidthMm, height: s.defaultLengthMm })}
                    className={`p-2.5 rounded-lg border transition cursor-pointer ${
                      selectedTag === s.tag
                        ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                        : 'border-[#E2DDD5] bg-white hover:border-slate-400 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[11px]">{s.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800">
                        {s.tag}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{s.defaultWidthMm} × {s.defaultLengthMm} mm</span>
                      <span>·</span>
                      <span>{s.riserCount} risers</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interiors B2 Section */}
          {(activeTab === 'all' || activeTab === 'interiors_b2') && (
            <div className="p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
              <div className="inline-flex p-2 rounded-full bg-slate-200 text-slate-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-[11px] font-bold text-slate-700">Stage B2 Interior Furnishings</div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Living suites, beds, wardrobes, dining sets, and modular kitchen casework will populate here in Stage B2.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E2DDD5] bg-[#F7F5F0] flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            {selectedTag ? `Selected: ${selectedTag}` : 'Click an item to inspect'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
