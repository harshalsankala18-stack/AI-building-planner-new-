import React from 'react';
import type { Building, Door, Window, CanonicalFurnitureItem } from '@ai-floor-planner/core';
import { DoorType, WindowType, SwingDirection } from '@ai-floor-planner/core';
import {
  X,
  Sliders,
  Trash2,
  Lock,
  Unlock,
  Layers,
  DoorOpen,
  SquareDashedBottom,
  Sofa,
} from 'lucide-react';

export interface SelectedNodeInfo {
  id: string;
  type: 'door' | 'window' | 'wall' | 'item' | 'stair' | 'column' | 'zone' | 'slab' | string;
  data?: any;
}

export interface ElementPropertiesInspectorProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly selectedNode: SelectedNodeInfo | null;
  readonly building?: Building;
  readonly activeFloorId?: string;
  readonly onUpdateDoor?: (doorId: string, updates: Partial<Door>) => void;
  readonly onUpdateWindow?: (windowId: string, updates: Partial<Window>) => void;
  readonly onUpdateFurniture?: (itemId: string, updates: Partial<CanonicalFurnitureItem>) => void;
  readonly onDeleteElement?: (elementId: string, elementType: string) => void;
  readonly onSelectNodeById?: (nodeId: string, type: string) => void;
}

export const DOOR_STYLE_PRESETS = [
  {
    category: 'main_entry_single',
    name: 'Main Entry Single',
    tag: 'D1',
    description: 'Flush single-leaf entry door with lever handle',
    defaultWidth: 1050,
    defaultHeight: 2100,
    type: DoorType.Single,
    leafCount: 1,
  },
  {
    category: 'main_entry_double',
    name: 'Main Entry Double',
    tag: 'ED1',
    description: 'Double-leaf grand entry door with lever handles',
    defaultWidth: 1500,
    defaultHeight: 2100,
    type: DoorType.Double,
    leafCount: 2,
  },
  {
    category: 'bedroom_hinged',
    name: 'Bedroom Hinged',
    tag: 'D2',
    description: 'Recessed two-panel hinged interior room door',
    defaultWidth: 900,
    defaultHeight: 2100,
    type: DoorType.Single,
    leafCount: 1,
  },
  {
    category: 'balcony_sliding_glass',
    name: 'Balcony Sliding Glass',
    tag: 'SD1',
    description: 'Double glazed sliding patio door with bar handle',
    defaultWidth: 1800,
    defaultHeight: 2100,
    type: DoorType.Sliding,
    leafCount: 2,
  },
  {
    category: 'french_double_glass',
    name: 'French Double Glass',
    tag: 'FD1',
    description: 'Double glass french doors with divided lights',
    defaultWidth: 1600,
    defaultHeight: 2100,
    type: DoorType.Double,
    leafCount: 2,
  },
] as const;

export const WINDOW_STYLE_PRESETS = [
  {
    category: 'casement_double',
    name: 'Casement Double',
    tag: 'W1',
    defaultWidth: 1200,
    defaultHeight: 1200,
    defaultSill: 900,
    type: WindowType.Casement,
  },
  {
    category: 'sliding_wide',
    name: 'Sliding Wide Glazing',
    tag: 'SW1',
    defaultWidth: 1800,
    defaultHeight: 1400,
    defaultSill: 800,
    type: WindowType.Sliding,
  },
  {
    category: 'fixed_picture',
    name: 'Fixed Picture Window',
    tag: 'PW1',
    defaultWidth: 1500,
    defaultHeight: 1500,
    defaultSill: 600,
    type: WindowType.Fixed,
  },
  {
    category: 'full_height_glazing',
    name: 'Full Height Glazing',
    tag: 'GW1',
    defaultWidth: 2000,
    defaultHeight: 2400,
    defaultSill: 150,
    type: WindowType.Fixed,
  },
  {
    category: 'kitchen_casement',
    name: 'Kitchen Casement',
    tag: 'KW1',
    defaultWidth: 1200,
    defaultHeight: 1000,
    defaultSill: 1050,
    type: WindowType.Casement,
  },
  {
    category: 'bath_ventilator',
    name: 'Bathroom Louvered Ventilator',
    tag: 'V1',
    defaultWidth: 600,
    defaultHeight: 600,
    defaultSill: 1800,
    type: WindowType.Ventilator,
  },
] as const;

export const FURNITURE_KINDS = [
  { kind: 'sofa_3seater', label: '3-Seater Sofa', category: 'living' },
  { kind: 'sofa_2seater', label: '2-Seater Loveseat', category: 'living' },
  { kind: 'coffee_table', label: 'Coffee Table', category: 'living' },
  { kind: 'tv_console', label: 'Media TV Console', category: 'living' },
  { kind: 'dining_table_6', label: '6-Seater Dining Set', category: 'dining' },
  { kind: 'dining_table_4', label: '4-Seater Dining Set', category: 'dining' },
  { kind: 'bed_queen', label: 'Queen Bed with Headboard', category: 'bedroom' },
  { kind: 'bed_single', label: 'Single Twin Bed', category: 'bedroom' },
  { kind: 'side_table', label: 'Nightstand / Side Table', category: 'bedroom' },
  { kind: 'wardrobe', label: '3-Door Wardrobe Closet', category: 'bedroom' },
  { kind: 'kitchen_counter', label: 'Kitchen Countertop & Cooktop', category: 'kitchen' },
  { kind: 'refrigerator', label: 'Double-Door Refrigerator', category: 'kitchen' },
  { kind: 'wc_toilet', label: 'Wall-Hung Water Closet', category: 'bathroom' },
  { kind: 'wash_basin', label: 'Vanity Wash Basin', category: 'bathroom' },
  { kind: 'shower_tray', label: 'Glass Shower Enclosure', category: 'bathroom' },
  { kind: 'ceiling_fan', label: 'Ceiling Fan with Light', category: 'lighting' },
  { kind: 'ceiling_light_recessed', label: 'Recessed LED Downlight', category: 'lighting' },
  { kind: 'pendant_light', label: 'Modern Dining Pendant Light', category: 'lighting' },
  { kind: 'wall_sconce', label: 'Wall Sconce Accent Light', category: 'lighting' },
];

export const ElementPropertiesInspector: React.FC<ElementPropertiesInspectorProps> = ({
  isOpen,
  onClose,
  selectedNode,
  building,
  activeFloorId,
  onUpdateDoor,
  onUpdateWindow,
  onUpdateFurniture,
  onDeleteElement,
  onSelectNodeById,
}) => {
  const activeFloor = building?.floors.find((f) => f.id === activeFloorId) ?? building?.floors[0];

  // Resolve Canonical element from selectedNode
  const rawId = selectedNode?.id
    ? selectedNode.id.replace(/^(door_|window_|wall_|item_|column_|stair_|zone_|slab_)/, '')
    : '';

  const matchedDoor = activeFloor?.doors.find((d) => d.id === rawId || d.id === selectedNode?.id);
  const matchedWindow = activeFloor?.windows.find((w) => w.id === rawId || w.id === selectedNode?.id);
  const matchedFurniture = activeFloor?.furniture?.find((f) => f.id === rawId || f.id === selectedNode?.id);
  const matchedWall = activeFloor?.walls.find((w) => w.id === rawId || w.id === selectedNode?.id);

  const effectiveType = selectedNode?.type || (matchedDoor ? 'door' : matchedWindow ? 'window' : matchedFurniture ? 'item' : matchedWall ? 'wall' : 'unknown');

  if (!isOpen) return null;

  return (
    <aside
      data-testid="properties-inspector-drawer"
      className="absolute top-0 right-0 bottom-0 w-[300px] bg-slate-900/95 border-l border-slate-800 backdrop-blur z-20 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Properties Inspector
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-Header / Current Element Identity */}
      <div className="px-4 py-2 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {effectiveType === 'door' && <DoorOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          {effectiveType === 'window' && <SquareDashedBottom className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
          {effectiveType === 'item' && <Sofa className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          {effectiveType === 'wall' && <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
          <span className="font-mono text-slate-300 truncate font-medium">
            {selectedNode?.id || 'No element selected'}
          </span>
        </div>
        {selectedNode && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
            {effectiveType}
          </span>
        )}
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300">
        {/* DOOR INSPECTOR */}
        {effectiveType === 'door' && matchedDoor && (
          <div className="space-y-4">
            {/* Style Preset Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Door Style (5 Presets)
              </label>
              <select
                data-testid="door-style-select"
                value={matchedDoor.category || 'main_entry_single'}
                onChange={(e) => {
                  const preset = DOOR_STYLE_PRESETS.find((p) => p.category === e.target.value);
                  if (preset && onUpdateDoor) {
                    onUpdateDoor(matchedDoor.id, {
                      category: preset.category,
                      type: preset.type,
                      leafCount: preset.leafCount,
                      width: preset.defaultWidth,
                      height: preset.defaultHeight,
                    });
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:border-sky-500 focus:outline-hidden"
              >
                {DOOR_STYLE_PRESETS.map((p) => (
                  <option key={p.category} value={p.category}>
                    {p.tag} - {p.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                {DOOR_STYLE_PRESETS.find((p) => p.category === matchedDoor.category)?.description ||
                  'Parametric door with precise CSG wall cutouts and frame depth.'}
              </p>
            </div>

            {/* Width Slider / Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Width (mm)
                </label>
                <span className="font-mono text-sky-400">{matchedDoor.width} mm</span>
              </div>
              <input
                type="range"
                min={750}
                max={2400}
                step={50}
                value={matchedDoor.width}
                onChange={(e) => {
                  onUpdateDoor?.(matchedDoor.id, { width: Number(e.target.value) });
                }}
                className="w-full accent-sky-500"
              />
              <div className="flex gap-1 flex-wrap">
                {[750, 900, 1050, 1200, 1500, 1800].map((w) => (
                  <button
                    key={w}
                    onClick={() => onUpdateDoor?.(matchedDoor.id, { width: w })}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition ${
                      matchedDoor.width === w
                        ? 'bg-sky-950 border-sky-600 text-sky-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Height Slider / Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Height (mm)
                </label>
                <span className="font-mono text-sky-400">{matchedDoor.height} mm</span>
              </div>
              <input
                type="range"
                min={1800}
                max={2700}
                step={50}
                value={matchedDoor.height}
                onChange={(e) => {
                  onUpdateDoor?.(matchedDoor.id, { height: Number(e.target.value) });
                }}
                className="w-full accent-sky-500"
              />
              <div className="flex gap-1">
                {[2000, 2100, 2400].map((h) => (
                  <button
                    key={h}
                    onClick={() => onUpdateDoor?.(matchedDoor.id, { height: h })}
                    className={`px-2 py-0.5 rounded text-[10px] border transition ${
                      matchedDoor.height === h
                        ? 'bg-sky-950 border-sky-600 text-sky-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {h}mm
                  </button>
                ))}
              </div>
            </div>

            {/* Swing Direction */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Swing Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateDoor?.(matchedDoor.id, { swingDirection: SwingDirection.Inward })}
                  className={`py-1.5 rounded border text-center transition ${
                    matchedDoor.swingDirection === SwingDirection.Inward
                      ? 'bg-sky-600/30 border-sky-500 text-sky-200 font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Inward
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateDoor?.(matchedDoor.id, { swingDirection: SwingDirection.Outward })}
                  className={`py-1.5 rounded border text-center transition ${
                    matchedDoor.swingDirection === SwingDirection.Outward
                      ? 'bg-sky-600/30 border-sky-500 text-sky-200 font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Outward
                </button>
              </div>
            </div>

            {/* Delete Element Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onDeleteElement?.(matchedDoor.id, 'door')}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-medium transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Door</span>
              </button>
            </div>
          </div>
        )}

        {/* WINDOW INSPECTOR */}
        {effectiveType === 'window' && matchedWindow && (
          <div className="space-y-4">
            {/* Window Style Preset */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Window Style
              </label>
              <select
                data-testid="window-style-select"
                value={matchedWindow.category || 'casement_double'}
                onChange={(e) => {
                  const preset = WINDOW_STYLE_PRESETS.find((p) => p.category === e.target.value);
                  if (preset && onUpdateWindow) {
                    onUpdateWindow(matchedWindow.id, {
                      category: preset.category,
                      type: preset.type,
                      width: preset.defaultWidth,
                      height: preset.defaultHeight,
                      sillHeight: preset.defaultSill,
                    });
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:border-sky-500 focus:outline-hidden"
              >
                {WINDOW_STYLE_PRESETS.map((p) => (
                  <option key={p.category} value={p.category}>
                    {p.tag} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Width (mm)
                </label>
                <span className="font-mono text-sky-400">{matchedWindow.width} mm</span>
              </div>
              <input
                type="range"
                min={600}
                max={3000}
                step={50}
                value={matchedWindow.width}
                onChange={(e) => onUpdateWindow?.(matchedWindow.id, { width: Number(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Height (mm)
                </label>
                <span className="font-mono text-sky-400">{matchedWindow.height} mm</span>
              </div>
              <input
                type="range"
                min={450}
                max={2400}
                step={50}
                value={matchedWindow.height}
                onChange={(e) => onUpdateWindow?.(matchedWindow.id, { height: Number(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Sill Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Sill Height (mm)
                </label>
                <span className="font-mono text-sky-400">{matchedWindow.sillHeight ?? 900} mm</span>
              </div>
              <input
                type="range"
                min={100}
                max={2100}
                step={50}
                value={matchedWindow.sillHeight ?? 900}
                onChange={(e) => onUpdateWindow?.(matchedWindow.id, { sillHeight: Number(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Delete Element Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onDeleteElement?.(matchedWindow.id, 'window')}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-medium transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Window</span>
              </button>
            </div>
          </div>
        )}

        {/* FURNITURE ITEM INSPECTOR */}
        {effectiveType === 'item' && matchedFurniture && (
          <div className="space-y-4">
            {/* Kind Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                PBR 3D Model Preset
              </label>
              <select
                data-testid="furniture-kind-select"
                value={matchedFurniture.kind || 'sofa_3seater'}
                onChange={(e) => {
                  const targetKind = e.target.value;
                  const itemInfo = FURNITURE_KINDS.find((f) => f.kind === targetKind);
                  if (onUpdateFurniture) {
                    onUpdateFurniture(matchedFurniture.id, {
                      kind: targetKind,
                      label: itemInfo?.label || targetKind,
                    });
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:border-sky-500 focus:outline-hidden"
              >
                {FURNITURE_KINDS.map((f) => (
                  <option key={f.kind} value={f.kind}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rotation */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Rotation
                </label>
                <span className="font-mono text-sky-400">{matchedFurniture.rotationDeg ?? 0}°</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => onUpdateFurniture?.(matchedFurniture.id, { rotationDeg: deg })}
                    className={`py-1 rounded border text-center transition ${
                      (matchedFurniture.rotationDeg ?? 0) === deg
                        ? 'bg-sky-950 border-sky-500 text-sky-200 font-semibold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* Elevation */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Elevation (mm)
                </label>
                <span className="font-mono text-sky-400">{matchedFurniture.elevationMm ?? 0} mm</span>
              </div>
              <input
                type="range"
                min={0}
                max={2800}
                step={50}
                value={matchedFurniture.elevationMm ?? 0}
                onChange={(e) => onUpdateFurniture?.(matchedFurniture.id, { elevationMm: Number(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Lock / Unlock */}
            <div className="flex items-center justify-between py-2 border-y border-slate-800">
              <span className="text-slate-400">Lock Position</span>
              <button
                type="button"
                onClick={() => onUpdateFurniture?.(matchedFurniture.id, { locked: !matchedFurniture.locked })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs transition ${
                  matchedFurniture.locked
                    ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {matchedFurniture.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>{matchedFurniture.locked ? 'Locked' : 'Unlocked'}</span>
              </button>
            </div>

            {/* Delete Element Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onDeleteElement?.(matchedFurniture.id, 'item')}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-medium transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Furniture</span>
              </button>
            </div>
          </div>
        )}

        {/* WALL INSPECTOR */}
        {effectiveType === 'wall' && matchedWall && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Wall Thickness
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[115, 230, 300].map((th) => (
                  <button
                    key={th}
                    className={`py-1.5 rounded border text-center transition ${
                      (matchedWall.thickness ?? 230) === th
                        ? 'bg-sky-950 border-sky-500 text-sky-200 font-semibold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {th} mm
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Wall Use:</span>
                <span className="font-semibold text-slate-200">{matchedWall.wallUse || 'INTERNAL'}</span>
              </div>
              <div className="flex justify-between">
                <span>Start:</span>
                <span className="font-mono text-slate-300">
                  {matchedWall.startPoint.x}, {matchedWall.startPoint.y}
                </span>
              </div>
              <div className="flex justify-between">
                <span>End:</span>
                <span className="font-mono text-slate-300">
                  {matchedWall.endPoint.x}, {matchedWall.endPoint.y}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fallback / List of Floor Elements for Quick Inspection */}
        {(!selectedNode || effectiveType === 'unknown') && (
          <div className="space-y-4">
            <p className="text-slate-400 text-xs leading-relaxed">
              Click any door, window, wall, or furniture item in the 3D viewport to inspect and customize its parameters in real-time.
            </p>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Element Selector
              </span>
              <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                {activeFloor?.doors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onSelectNodeById?.(`door_${d.id}`, 'door')}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{d.id}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">{d.category || 'door'}</span>
                  </button>
                ))}

                {activeFloor?.windows.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => onSelectNodeById?.(`window_${w.id}`, 'window')}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <SquareDashedBottom className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{w.id}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">{w.category || 'window'}</span>
                  </button>
                ))}

                {activeFloor?.furniture?.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onSelectNodeById?.(`item_${f.id}`, 'item')}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Sofa className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{f.label || f.kind}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">{f.kind}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
