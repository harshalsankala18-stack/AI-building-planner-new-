/**
 * Phase 3 — deterministic coordinated MEP synthesis.
 *
 * Produces a drafting-level `CoordinatedMepEngineeringPlan` for a generated
 * building: electrical (M-ELEC), plumbing & vertical stacks (M-PLUMB),
 * reflected ceiling (A-CEIL), fire safety (F-FIRE) and cantilever balcony
 * framing (S-BEAM-CANTILEVER). It reads canonical geometry only and never
 * mutates it, so planar area conservation is untouched.
 *
 * Every element is a coordination proposal for professional review, not a
 * certified engineering design.
 */
import {
  RoomType,
  DoorType,
  type Building,
  type CantileverBeam,
  type CeilingZone,
  type CoordinatedMepEngineeringPlan,
  type Door,
  type Floor,
  type FloorMepEngineeringPlan,
  type MepRun,
  type MepSymbol,
  type MepSymbolKind,
  type Point,
  type Room,
  type Wall,
} from '@ai-floor-planner/core';

interface Box { x: number; y: number; w: number; h: number }

const ELECTRICAL_KINDS = new Set<MepSymbolKind>([
  'DB', 'LT_PANEL', 'ES', 'FAN', 'DL', 'PL', 'BL', 'SB', 'SB_2WAY', 'SOCKET_6A', 'SOCKET_16A', 'TV_DATA', 'GY', 'EF', 'AC_IDU', 'AC_ODU',
]);
const PLUMBING_KINDS = new Set<MepSymbolKind>([
  'PLUMB_SHAFT', 'FT', 'NT', 'WC', 'WB', 'SH', 'KS', 'WM', 'RWP', 'UGWT', 'OHT', 'IC', 'GT',
]);

const LABELS: Readonly<Record<MepSymbolKind, string>> = {
  DB: 'DB', LT_PANEL: 'LT', ES: 'ES', FAN: 'CF', DL: 'CL', PL: 'PL', BL: 'BL',
  SB: 'SB', SB_2WAY: '2W-SB', SOCKET_6A: '6A', SOCKET_16A: '16A', TV_DATA: 'TV', GY: 'GY', EF: 'EF',
  AC_IDU: 'AC', AC_ODU: 'ODU', PLUMB_SHAFT: 'PS', FT: 'FT', NT: 'NT',
  WC: 'WC', WB: 'WB', SH: 'SH', KS: 'KS', WM: 'WM', RWP: 'RWP', UGWT: 'UGWT', OHT: 'OHT', IC: 'IC', GT: 'GT',
  FHR: 'FHR', FHR_HR: 'FHR-HR', FACP: 'FACP', SD: 'SD', HD: 'HD', EXIT_SIGN: 'EXIT', SPRINKLER: 'SPK',
  FE: 'FE',
};

export const PLUMB_SHAFT_MIN = { widthMm: 600, depthMm: 900 } as const;
export const COVE_INSET_MM = 450;
export const CEILING_GRID_MM = 600;
export const SPRINKLER_SPACING_MM = 3000;
export const SWITCH_OFFSET_FROM_FRAME_MM = 150;

const r10 = (v: number) => Math.round(v / 10) * 10;

export function roomBox(room: Room): Box {
  const pts = room.boundary?.points ?? [];
  if (!pts.length) return { x: room.x, y: room.y, w: room.width, h: room.height };
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

const center = (b: Box): Point => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const inside = (b: Box, p: Point, tol = 0) => p.x >= b.x - tol && p.x <= b.x + b.w + tol && p.y >= b.y - tol && p.y <= b.y + b.h + tol;
const rectOutline = (b: Box): Point[] => [
  { x: b.x, y: b.y }, { x: b.x + b.w, y: b.y }, { x: b.x + b.w, y: b.y + b.h }, { x: b.x, y: b.y + b.h },
];

const isLivingLike = (r: Room) => [RoomType.Living, RoomType.Dining, RoomType.FamilyLiving, RoomType.Drawing].includes(r.type);
const isBedroom = (r: Room) => r.type === RoomType.Bedroom;
const isBath = (r: Room) => r.type === RoomType.Bathroom;
const isKitchen = (r: Room) => r.type === RoomType.Kitchen;
const isWetTrapRoom = (r: Room) => isBath(r) || r.type === RoomType.Utility || r.type === RoomType.Balcony;
const isCommonCirculation = (r: Room) =>
  !r.unitId && (r.type === RoomType.Corridor || r.type === RoomType.Foyer || r.architecturalRole === 'LIFT_LOBBY')
  && r.architecturalRole !== 'VEHICLE_AISLE';
const isStilt = (f: Floor) => f.floorUse === 'STILT_PARKING' || /STILT/i.test(f.name);
const isRoof = (f: Floor) => f.floorUse === 'ROOF' || /TERRACE|ROOF/i.test(f.name);
const isResidential = (f: Floor) => !isStilt(f) && !isRoof(f) && f.rooms.length > 0;

function wallDir(w: Wall): Point {
  const dx = w.endPoint.x - w.startPoint.x, dy = w.endPoint.y - w.startPoint.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

/** Unit normal of a wall pointing into the given room box. */
function inwardNormal(w: Wall, b: Box): Point {
  const d = wallDir(w);
  const n = { x: -d.y, y: d.x };
  const mid = { x: (w.startPoint.x + w.endPoint.x) / 2, y: (w.startPoint.y + w.endPoint.y) / 2 };
  const c = center(b);
  return (c.x - mid.x) * n.x + (c.y - mid.y) * n.y >= 0 ? n : { x: -n.x, y: -n.y };
}

const wallRoomIds = (w: Wall): readonly string[] => (w as unknown as { roomIds?: readonly string[] }).roomIds ?? [];

function exteriorWalls(floor: Floor, room: Room): Wall[] {
  return floor.walls.filter(w => {
    const ids = wallRoomIds(w);
    return ids.includes(room.id) && (w.wallUse === 'EXTERNAL' || ids.length === 1) && Math.hypot(w.endPoint.x - w.startPoint.x, w.endPoint.y - w.startPoint.y) >= 1200;
  });
}

class FloorBuilder {
  readonly symbols: MepSymbol[] = [];
  readonly runs: MepRun[] = [];
  readonly ceilings: CeilingZone[] = [];
  readonly cantileverBeams: CantileverBeam[] = [];
  private n = 0;
  constructor(readonly floor: Floor) {}
  id(prefix: string) { return `${this.floor.id}::mep_${prefix}_${++this.n}`; }
  sym(kind: MepSymbolKind, position: Point, extra: Partial<MepSymbol> = {}): MepSymbol {
    const discipline = ELECTRICAL_KINDS.has(kind) ? 'ELECTRICAL' : PLUMBING_KINDS.has(kind) ? 'PLUMBING' : 'FIRE';
    const layer = discipline === 'ELECTRICAL' ? 'M-ELEC-SYMB' : discipline === 'PLUMBING' ? 'M-PLUMB-FIXT' : 'F-FIRE-SYMB';
    const s: MepSymbol = {
      id: this.id(kind.toLowerCase()), kind, discipline, layer,
      position: { x: r10(position.x), y: r10(position.y) }, label: LABELS[kind], ...extra,
    };
    this.symbols.push(s);
    return s;
  }
  run(kind: MepRun['kind'], points: Point[], extra: Partial<MepRun> = {}): void {
    if (points.length < 2) return;
    const isElectrical = kind === 'WIRING_LOOP' || kind === 'WIRING_POWER' || kind === 'WIRING_AC';
    const isFire = kind === 'FIRE_PIPE' || kind === 'FIRE_EGRESS';
    const discipline = isElectrical ? 'ELECTRICAL' : isFire ? 'FIRE' : 'PLUMBING';
    const layer = isElectrical
      ? 'M-ELEC-WIRE'
      : kind === 'FIRE_PIPE'
        ? 'F-FIRE-PIPE'
        : kind === 'FIRE_EGRESS'
          ? 'F-FIRE-EGRESS'
          : 'M-PLUMB-PIPE';
    this.runs.push({
      id: this.id(kind.toLowerCase()), kind,
      discipline,
      layer,
      points: points.map(p => ({ x: r10(p.x), y: r10(p.y) })),
      ...(kind === 'SP'
        ? { diameterMm: 110, label: extra.label ?? 'Ø110 SOIL' }
        : kind === 'WP'
          ? { diameterMm: 75, label: extra.label ?? 'Ø75 WASTE' }
          : kind === 'RWP_PIPE'
            ? { diameterMm: 100, label: extra.label ?? 'Ø100 RWP' }
            : kind === 'CWS'
              ? { diameterMm: 20, label: extra.label ?? 'Ø20 CWS' }
              : kind === 'HWS'
                ? { diameterMm: 20, label: extra.label ?? 'Ø20 HWS' }
                : kind === 'FIRE_PIPE'
                  ? { diameterMm: 100 }
                  : {}),
      ...extra,
    });
  }
  build(): FloorMepEngineeringPlan {
    return { floorId: this.floor.id, floorLevel: this.floor.level, symbols: this.symbols, runs: this.runs, ceilings: this.ceilings, cantileverBeams: this.cantileverBeams };
  }
}

/** Switchboard 150 mm beyond the door frame on the handle side, inside the room. */
function switchboardForDoor(floor: Floor, door: Door, room: Room): Point | null {
  const wall = floor.walls.find(w => w.id === door.wallId);
  if (!wall) return null;
  const b = roomBox(room);
  const d = wallDir(wall);
  const n = inwardNormal(wall, b);
  const along = door.width / 2 + SWITCH_OFFSET_FROM_FRAME_MM;
  for (const sgn of [1, -1]) {
    const p = { x: door.position.x + d.x * along * sgn + n.x * 100, y: door.position.y + d.y * along * sgn + n.y * 100 };
    if (inside(b, p)) return p;
  }
  return null;
}

/** Plumbing shaft location for a bathroom: the corner nearest an exterior or corridor wall. */
function shaftForBath(floor: Floor, bath: Room): Box {
  const b = roomBox(bath);
  const walls = floor.walls.filter(w => wallRoomIds(w).includes(bath.id));
  const ext = walls.find(w => w.wallUse === 'EXTERNAL' || wallRoomIds(w).length === 1)
    ?? walls.find(w => w.wallUse === 'COMMON_CORRIDOR' || w.wallUse === 'SHAFT')
    ?? walls[0];
  const w = PLUMB_SHAFT_MIN.widthMm, h = PLUMB_SHAFT_MIN.depthMm;
  if (!ext) return { x: b.x, y: b.y, w, h };
  const horizontal = Math.abs(ext.endPoint.y - ext.startPoint.y) < 1;
  const wy = ext.startPoint.y, wx = ext.startPoint.x;
  if (horizontal) {
    const top = Math.abs(wy - b.y) <= Math.abs(wy - (b.y + b.h));
    return { x: r10(b.x), y: r10(top ? b.y : b.y + b.h - w), w: h, h: w };
  }
  const left = Math.abs(wx - b.x) <= Math.abs(wx - (b.x + b.w));
  return { x: r10(left ? b.x : b.x + b.w - w), y: r10(b.y), w, h };
}

function synthesizeUnitElectrical(fb: FloorBuilder, floor: Floor, unitRooms: Room[], unitId: string): void {
  const roomIds = new Set(unitRooms.map(r => r.id));
  const entrance = floor.doors.find(d => {
    const [a, b] = d.connectsRooms;
    return (roomIds.has(a) && !roomIds.has(b)) || (roomIds.has(b) && !roomIds.has(a));
  });
  const entryRoom = entrance ? unitRooms.find(r => entrance.connectsRooms.includes(r.id)) : unitRooms.find(isLivingLike);
  let db: MepSymbol | undefined;
  if (entryRoom) {
    const b = roomBox(entryRoom);
    const sb = entrance ? switchboardForDoor(floor, entrance, entryRoom) : null;
    const base = sb ?? { x: b.x + 300, y: b.y + 300 };
    const c = center(b);
    const len = Math.hypot(c.x - base.x, c.y - base.y) || 1;
    const p = { x: base.x + ((c.x - base.x) / len) * 250, y: base.y + ((c.y - base.y) / len) * 250 };
    db = fb.sym('DB', inside(b, p) ? p : c, { roomId: entryRoom.id, unitId, label: 'DB (MAIN)' });
  }
  const fans: Point[] = [];
  const powerPts: Point[] = [];
  const acPts: Point[] = [];
  const bedrooms = unitRooms.filter(isBedroom);
  const master = bedrooms.find(r => /master/i.test(r.name)) ?? [...bedrooms].sort((a, b) => b.area - a.area)[0];
  for (const room of unitRooms) {
    const b = roomBox(room);
    const c = center(b);
    if (isLivingLike(room) || isBedroom(room)) {
      fb.sym('FAN', c, { roomId: room.id, unitId, label: 'CF' });
      fans.push(c);
      const off = Math.max(b.w, b.h) / 4;
      const horizontal = b.w >= b.h;
      fb.sym('DL', horizontal ? { x: c.x - off, y: c.y } : { x: c.x, y: c.y - off }, { roomId: room.id, unitId, label: 'CL' });
      fb.sym('DL', horizontal ? { x: c.x + off, y: c.y } : { x: c.x, y: c.y + off }, { roomId: room.id, unitId, label: 'CL' });
      if (room.type === RoomType.Dining) {
        fb.sym('PL', c, { roomId: room.id, unitId, label: 'PL' });
      }
      if (isLivingLike(room)) {
        const tvSock = { x: b.x + b.w * 0.5, y: b.y + Math.min(b.h - 200, 220) };
        fb.sym('SOCKET_16A', tvSock, { roomId: room.id, unitId, label: 'TV WALL 16A' });
        fb.sym('TV_DATA', { x: tvSock.x + 220, y: tvSock.y }, { roomId: room.id, unitId, label: 'TV/DATA' });
        fb.sym('SOCKET_6A', { x: b.x + 220, y: c.y }, { roomId: room.id, unitId, label: '6A SOFA' });
        powerPts.push(tvSock);
      }
      if (isBedroom(room)) {
        fb.sym('SOCKET_6A', { x: c.x - Math.min(b.w * 0.3, 600), y: b.y + 220 }, { roomId: room.id, unitId, label: '6A BED' });
        fb.sym('SOCKET_6A', { x: c.x + Math.min(b.w * 0.3, 600), y: b.y + 220 }, { roomId: room.id, unitId, label: '6A BED' });
        if (room === master) {
          fb.sym('TV_DATA', { x: c.x, y: b.y + b.h - 220 }, { roomId: room.id, unitId, label: 'TV/DATA' });
        }
      }
      for (const wall of exteriorWalls(floor, room).slice(0, 1)) {
        const mid = { x: (wall.startPoint.x + wall.endPoint.x) / 2, y: (wall.startPoint.y + wall.endPoint.y) / 2 };
        const n = inwardNormal(wall, b);
        const idu = { x: mid.x + n.x * 200, y: mid.y + n.y * 200 };
        fb.sym('AC_IDU', idu, { roomId: room.id, unitId, widthMm: 900, depthMm: 250 });
        fb.sym('AC_ODU', { x: mid.x - n.x * 450, y: mid.y - n.y * 450 }, { roomId: room.id, unitId, widthMm: 850, depthMm: 350 });
        acPts.push(idu);
      }
    }
    if (isBalconyLike(room) || room.type === RoomType.Utility) {
      fb.sym('BL', c, { roomId: room.id, unitId, label: 'BL' });
    }
    if (room === master) {
      const side = b.w >= b.h ? { x: 0, y: 1 } : { x: 1, y: 0 };
      const spread = Math.min(b.w, b.h) * 0.3;
      fb.sym('SB_2WAY', { x: c.x - side.x * spread, y: c.y - side.y * spread }, { roomId: room.id, unitId, label: '2W-SB L' });
      fb.sym('SB_2WAY', { x: c.x + side.x * spread, y: c.y + side.y * spread }, { roomId: room.id, unitId, label: '2W-SB R' });
    }
    if (isKitchen(room)) {
      fb.sym('DL', c, { roomId: room.id, unitId, label: 'CL' });
      fb.sym('EF', { x: b.x + b.w - 220, y: b.y + 220 }, { roomId: room.id, unitId, label: 'EF' });
      const labels = ['16A FRIDGE', '16A MICROWAVE', '16A HOB/CHIMNEY'];
      labels.forEach((label, i) => {
        const t = (i + 1) / (labels.length + 1);
        const pt = b.w >= b.h ? { x: b.x + b.w * t, y: b.y + 150 } : { x: b.x + 150, y: b.y + b.h * t };
        fb.sym('SOCKET_16A', pt, { roomId: room.id, unitId, label });
        powerPts.push(pt);
      });
    }
    if (room.type === RoomType.Utility) {
      const wmSock = { x: b.x + 250, y: c.y };
      fb.sym('SOCKET_16A', wmSock, { roomId: room.id, unitId, label: '16A WM' });
      powerPts.push(wmSock);
    }
    if (isBath(room)) {
      fb.sym('DL', c, { roomId: room.id, unitId, label: 'CL' });
      fb.sym('EF', { x: b.x + 240, y: b.y + 240 }, { roomId: room.id, unitId, label: 'EF' });
      const gyPt = { x: b.x + b.w - 300, y: b.y + 300 };
      fb.sym('GY', gyPt, { roomId: room.id, unitId, label: 'GY 16A' });
      powerPts.push(gyPt);
    }
    // Switchboards beside every hinged room entry door.
    for (const door of floor.doors.filter(d => d.connectsRooms.includes(room.id) && d.type !== DoorType.OpenPassage)) {
      if (isBalconyLike(room)) continue;
      const p = switchboardForDoor(floor, door, room);
      if (p) fb.sym('SB', p, { roomId: room.id, unitId, label: 'SB 6A' });
    }
  }
  if (db && fans.length) fb.run('WIRING_LOOP', [db.position, ...fans], { roomId: db.roomId, circuitId: 'C1-LT', label: 'C1-LT (Lighting)' });
  if (db && powerPts.length) fb.run('WIRING_POWER', [db.position, ...powerPts], { roomId: db.roomId, circuitId: 'C2-PWR', label: 'C2-PWR (16A Power)' });
  if (db && acPts.length) fb.run('WIRING_AC', [db.position, ...acPts], { roomId: db.roomId, circuitId: 'C3-AC', label: 'C3-AC (Split AC)' });
}

const isBalconyLike = (r: Room) => r.type === RoomType.Balcony;

function synthesizeUnitPlumbing(fb: FloorBuilder, floor: Floor, unitRooms: Room[], unitId: string, shafts: Map<string, Box>): void {
  const nearestShaftPt = [...shafts.values()][0] ? center([...shafts.values()][0]!) : undefined;
  for (const room of unitRooms) {
    const b = roomBox(room);
    if (isWetTrapRoom(room)) {
      fb.sym('FT', { x: b.x + b.w / 2, y: b.y + b.h / 2 }, { roomId: room.id, unitId, label: 'FT' });
    }
    if (room.type === RoomType.Balcony) {
      const rwpPt = { x: b.x + 200, y: b.y + b.h - 200 };
      fb.sym('RWP', rwpPt, { roomId: room.id, unitId, label: 'RWP Ø100' });
      const ftPt = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      fb.run('RWP_PIPE', [ftPt, rwpPt], { roomId: room.id, label: 'Ø100 RWP' });
    }
    if (!isBath(room) && !isKitchen(room) && room.type !== RoomType.Utility) continue;
    const shaft = shafts.get(room.id) ?? nearestShaftPt ? shafts.get(room.id) : shaftForBath(floor, room);
    const sc = shaft ? center(shaft) : nearestShaftPt ?? { x: b.x + 150, y: b.y + 150 };
    if (isBath(room)) {
      const nt = fb.sym('NT', { x: b.x + b.w * 0.72, y: b.y + b.h * 0.72 }, { roomId: room.id, unitId, label: 'NT' });
      const wcPt = { x: b.x + b.w * 0.28, y: b.y + b.h - 400 };
      const basinPt = { x: b.x + b.w * 0.72, y: b.y + 320 };
      const shPt = { x: b.x + b.w * 0.78, y: b.y + b.h * 0.55 };
      const gyPt = { x: b.x + b.w - 300, y: b.y + 300 };
      fb.sym('WC', wcPt, { roomId: room.id, unitId, label: 'WC' });
      fb.sym('WB', basinPt, { roomId: room.id, unitId, label: 'WB' });
      fb.sym('SH', shPt, { roomId: room.id, unitId, label: 'SH' });
      // Orthogonal Soil (Ø110mm), Waste (Ø75mm), Cold (Ø20mm) & Hot (Ø20mm) lines
      fb.run('SP', [wcPt, { x: wcPt.x, y: sc.y }, sc], { roomId: room.id, label: 'Ø110 SOIL' });
      fb.run('WP', [basinPt, { x: basinPt.x, y: sc.y }, sc], { roomId: room.id, label: 'Ø75 WASTE' });
      fb.run('WP', [nt.position, { x: nt.position.x, y: sc.y }, sc], { roomId: room.id, label: 'Ø75 WASTE' });
      fb.run('CWS', [sc, { x: sc.x, y: wcPt.y }, wcPt], { roomId: room.id, label: 'Ø20 CWS' });
      fb.run('CWS', [sc, { x: basinPt.x, y: sc.y }, basinPt], { roomId: room.id, label: 'Ø20 CWS' });
      fb.run('HWS', [gyPt, { x: basinPt.x, y: gyPt.y }, basinPt, shPt], { roomId: room.id, label: 'Ø20 HWS' });
    } else if (isKitchen(room)) {
      const sinkPt = { x: b.x + b.w / 2, y: b.y + 320 };
      fb.sym('KS', sinkPt, { roomId: room.id, unitId, label: 'KS' });
      fb.run('WP', [sinkPt, { x: sinkPt.x, y: sc.y }, sc], { roomId: room.id, label: 'Ø75 WASTE' });
      fb.run('CWS', [sc, { x: sc.x, y: sinkPt.y }, sinkPt], { roomId: room.id, label: 'Ø20 CWS' });
    } else if (room.type === RoomType.Utility) {
      const wmPt = { x: b.x + 280, y: b.y + b.h / 2 };
      fb.sym('WM', wmPt, { roomId: room.id, unitId, label: 'WM' });
      fb.run('WP', [wmPt, { x: wmPt.x, y: sc.y }, sc], { roomId: room.id, label: 'Ø75 WM DRAIN' });
      fb.run('CWS', [sc, { x: wmPt.x, y: sc.y }, wmPt], { roomId: room.id, label: 'Ø20 WM CWS' });
    }
  }
}

function synthesizeCeilings(fb: FloorBuilder, floor: Floor, rooms: Room[]): void {
  const unitMaster = new Map<string, Room>();
  for (const r of rooms.filter(isBedroom)) {
    const key = r.unitId ?? 'common';
    const cur = unitMaster.get(key);
    if (/master/i.test(r.name) || !cur || (!/master/i.test(cur.name) && r.area > cur.area)) unitMaster.set(key, r);
  }
  const masters = new Set([...unitMaster.values()].map(r => r.id));
  for (const room of rooms) {
    const b = roomBox(room);
    if ((isLivingLike(room) || masters.has(room.id)) && b.w > 2 * COVE_INSET_MM + 600 && b.h > 2 * COVE_INSET_MM + 600) {
      fb.ceilings.push({
        id: fb.id('cove'), kind: 'COVE_GYPSUM', roomId: room.id, insetMm: COVE_INSET_MM,
        outline: rectOutline({ x: b.x + COVE_INSET_MM, y: b.y + COVE_INSET_MM, w: b.w - 2 * COVE_INSET_MM, h: b.h - 2 * COVE_INSET_MM }),
      });
    }
    if (isBath(room) || room.type === RoomType.Corridor && room.architecturalRole !== 'VEHICLE_AISLE') {
      const gridLines: [Point, Point][] = [];
      for (let x = b.x + CEILING_GRID_MM; x < b.x + b.w; x += CEILING_GRID_MM) gridLines.push([{ x, y: b.y }, { x, y: b.y + b.h }]);
      for (let y = b.y + CEILING_GRID_MM; y < b.y + b.h; y += CEILING_GRID_MM) gridLines.push([{ x: b.x, y }, { x: b.x + b.w, y }]);
      fb.ceilings.push({ id: fb.id('grid'), kind: 'GRID_600', roomId: room.id, outline: rectOutline(b), gridLines });
    }
    if (isLivingLike(room) || isBedroom(room)) {
      const openings = [
        ...floor.windows.filter(w => floor.walls.some(wl => wl.id === w.wallId && wallRoomIds(wl).includes(room.id))),
        ...floor.doors.filter(d => d.connectsRooms.includes(room.id) && rooms.some(o => o.type === RoomType.Balcony && d.connectsRooms.includes(o.id))),
      ];
      for (const op of openings) {
        const wall = floor.walls.find(w => w.id === op.wallId);
        if (!wall) continue;
        const d = wallDir(wall), n = inwardNormal(wall, b);
        const half = op.width / 2 + 150;
        const a = { x: op.position.x - d.x * half, y: op.position.y - d.y * half };
        const c = { x: op.position.x + d.x * half, y: op.position.y + d.y * half };
        fb.ceilings.push({
          id: fb.id('pelmet'), kind: 'PELMET', roomId: room.id,
          outline: [a, c, { x: c.x + n.x * 150, y: c.y + n.y * 150 }, { x: a.x + n.x * 150, y: a.y + n.y * 150 }].map(p => ({ x: r10(p.x), y: r10(p.y) })),
        });
      }
    }
  }
}

function synthesizeFire(fb: FloorBuilder, floor: Floor, stilt: boolean): void {
  const stair = floor.rooms.find(r => r.type === RoomType.Staircase) ?? floor.rooms.find(r => /stair/i.test(r.name));
  const lobby = floor.rooms.find(r => isCommonCirculation(r) && (!stair || sharesEdge(roomBox(r), roomBox(stair))))
    ?? floor.rooms.find(isLivingLike);
  const exitPoint: Point = stair
    ? center(roomBox(stair))
    : (() => {
        const extDoor = floor.doors.find(d => floor.walls.some(w => w.id === d.wallId && w.wallUse === 'EXTERNAL')) ?? floor.doors[0];
        return extDoor?.position ?? (lobby ? center(roomBox(lobby)) : { x: 2000, y: 2000 });
      })();

  if (stair) {
    const sbx = roomBox(stair);
    const host = lobby ? roomBox(lobby) : sbx;
    const anchor = { x: Math.max(host.x + 300, Math.min(host.x + host.w - 300, sbx.x + sbx.w / 2)), y: Math.max(host.y + 300, Math.min(host.y + host.h - 300, sbx.y + sbx.h / 2)) };
    fb.sym('FHR', anchor, { roomId: lobby?.id ?? stair.id, label: 'FHR (WET RISER)' });
    const hrPt = { x: anchor.x + (host.w > host.h ? 500 : 0), y: anchor.y + (host.w > host.h ? 0 : 500) };
    fb.sym('FHR_HR', hrPt, { roomId: lobby?.id ?? stair.id, label: 'FHR-HR (HOSE REEL)' });
    fb.sym('FACP', { x: anchor.x - (host.w > host.h ? 500 : 0), y: anchor.y - (host.w > host.h ? 0 : 500) }, { roomId: lobby?.id ?? stair.id });
    fb.sym('FE', { x: anchor.x + 250, y: anchor.y + 350 }, { roomId: lobby?.id ?? stair.id, label: 'FE ABC 6KG' });
    fb.run('FIRE_PIPE', [anchor, hrPt, exitPoint], { roomId: lobby?.id ?? stair.id, label: '100mm FIRE RISER' });
  } else {
    // Single residence / standalone floor: provide extinguisher near entry/kitchen + exit sign at main door
    fb.sym('FE', { x: exitPoint.x + 300, y: exitPoint.y + 250 }, { roomId: lobby?.id, label: 'FE ABC 6KG' });
    fb.sym('EXIT_SIGN', exitPoint, { roomId: lobby?.id, label: 'EXIT' });
  }

  for (const stairRoom of floor.rooms.filter(r => r.type === RoomType.Staircase || /stair/i.test(r.name))) {
    for (const door of floor.doors.filter(d => d.connectsRooms.includes(stairRoom.id))) {
      fb.sym('EXIT_SIGN', door.position, { roomId: stairRoom.id, label: 'EXIT' });
    }
  }
  for (const room of floor.rooms.filter(isCommonCirculation)) {
    const b = roomBox(room);
    const long = Math.max(b.w, b.h);
    const count = Math.max(1, Math.ceil(long / 7000));
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      fb.sym('SD', b.w >= b.h ? { x: b.x + b.w * t, y: b.y + b.h / 2 } : { x: b.x + b.w / 2, y: b.y + b.h * t }, { roomId: room.id });
    }
  }
  for (const room of floor.rooms.filter(r => isLivingLike(r) || isBedroom(r))) {
    fb.sym('SD', center(roomBox(room)), { roomId: room.id, unitId: room.unitId, label: 'SD' });
  }
  for (const k of floor.rooms.filter(isKitchen)) {
    const kc = center(roomBox(k));
    fb.sym('HD', kc, { roomId: k.id, unitId: k.unitId });
    fb.sym('FE', { x: kc.x + 400, y: kc.y - 300 }, { roomId: k.id, unitId: k.unitId, label: 'FE KITCHEN' });
  }
  if (stilt) {
    for (const room of floor.rooms.filter(r => r.type === RoomType.Parking || r.architecturalRole === 'VEHICLE_AISLE' || r.architecturalRole === 'PARKING_BAY')) {
      const b = roomBox(room);
      for (let x = b.x + SPRINKLER_SPACING_MM / 2; x < b.x + b.w; x += SPRINKLER_SPACING_MM)
        for (let y = b.y + SPRINKLER_SPACING_MM / 2; y < b.y + b.h; y += SPRINKLER_SPACING_MM)
          fb.sym('SPRINKLER', { x, y }, { roomId: room.id });
    }
  }

  // Emergency Egress Paths: from each unit living/entrance room (or bedroom on 2BHK) -> lobby -> staircase/exit
  const egressOrigins = floor.rooms.filter(r => isLivingLike(r));
  const lobbyCenter = lobby ? center(roomBox(lobby)) : exitPoint;
  for (const originRoom of egressOrigins) {
    const oc = center(roomBox(originRoom));
    const pts = dist(oc, lobbyCenter) > 400 ? [oc, lobbyCenter, exitPoint] : [oc, exitPoint];
    const totalDistMm = pts.slice(1).reduce((sum, p, idx) => sum + dist(pts[idx]!, p), 0);
    const totalDistM = Math.round((totalDistMm / 1000) * 10) / 10;
    fb.run('FIRE_EGRESS', pts, {
      roomId: originRoom.id,
      egressDistanceM: totalDistM,
      label: `EGRESS ${totalDistM}m`,
    });
  }
}

function sharesEdge(a: Box, b: Box): boolean {
  const xOverlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const yOverlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return (xOverlap > 0 && (Math.abs(a.y + a.h - b.y) < 1 || Math.abs(b.y + b.h - a.y) < 1))
    || (yOverlap > 0 && (Math.abs(a.x + a.w - b.x) < 1 || Math.abs(b.x + b.w - a.x) < 1));
}

/** Cantilever beams: two per balcony, projecting from the host structural line to the outer edge. */
function synthesizeCantilevers(fb: FloorBuilder, floor: Floor): void {
  const indoor = floor.rooms.filter(r => r.type !== RoomType.Balcony && r.architecturalRole !== 'OPEN_TO_SKY_VOID');
  for (const bal of floor.rooms.filter(r => r.type === RoomType.Balcony)) {
    const b = roomBox(bal);
    const host = indoor.map(roomBox).find(o => sharesEdge(o, b));
    if (!host) continue;
    const hostAbove = Math.abs(host.y + host.h - b.y) < 1;
    const hostBelow = Math.abs(b.y + b.h - host.y) < 1;
    const hostLeft = Math.abs(host.x + host.w - b.x) < 1;
    const beams: [Point, Point, number][] = [];
    if (hostAbove || hostBelow) {
      const y0 = hostAbove ? b.y : b.y + b.h, y1 = hostAbove ? b.y + b.h : b.y;
      for (const x of [b.x + 150, b.x + b.w - 150]) beams.push([{ x, y: y0 }, { x, y: y1 }, b.h]);
    } else {
      const x0 = hostLeft ? b.x : b.x + b.w, x1 = hostLeft ? b.x + b.w : b.x;
      for (const y of [b.y + 150, b.y + b.h - 150]) beams.push([{ x: x0, y }, { x: x1, y }, b.w]);
    }
    for (const [start, end, projection] of beams) {
      fb.cantileverBeams.push({
        id: fb.id('cantilever'), balconyRoomId: bal.id,
        start: { x: r10(start.x), y: r10(start.y) }, end: { x: r10(end.x), y: r10(end.y) },
        projectionMm: r10(projection), widthMm: 230, depthMm: 450,
      });
    }
  }
}

export function synthesizeMepEngineering(building: Building): CoordinatedMepEngineeringPlan {
  const floors = [...building.floors].sort((a, b) => a.level - b.level);
  const residential = floors.filter(isResidential);
  const reference = residential[0];

  // Vertical stacks are fixed from the first typical floor and repeated on every
  // residential floor, so wet cores stack and drop to the stilt collector line.
  const stackBoxes = new Map<string, Box>();
  const stackByKey = new Map<string, { box: Box; floorIds: string[] }>();
  if (reference) {
    for (const bath of reference.rooms.filter(r => isBath(r) || isKitchen(r))) {
      const box = isBath(bath) ? shaftForBath(reference, bath) : undefined;
      if (!box) continue;
      const key = `${box.x}|${box.y}`;
      stackByKey.set(key, { box, floorIds: [] });
    }
  }
  const stiltFloor = floors.find(isStilt);
  const plans: FloorMepEngineeringPlan[] = [];
  for (const floor of floors) {
    const fb = new FloorBuilder(floor);
    if (isResidential(floor)) {
      stackBoxes.clear();
      for (const bath of floor.rooms.filter(isBath)) {
        const own = shaftForBath(floor, bath);
        const stack = stackByKey.get(`${own.x}|${own.y}`);
        const box = stack?.box ?? own;
        stackBoxes.set(bath.id, box);
      }
      for (const [idx, stack] of [...stackByKey.values()].entries()) {
        stack.floorIds.push(floor.id);
        fb.sym('PLUMB_SHAFT', center(stack.box), { widthMm: stack.box.w, depthMm: stack.box.h, label: `PS${idx + 1} 900x1500` });
      }
      const lobby = floor.rooms.find(isCommonCirculation) ?? floor.rooms.find(isLivingLike);
      if (lobby) {
        const lb = roomBox(lobby);
        fb.sym('ES', { x: lb.x + 250, y: lb.y + 250 }, { roomId: lobby.id, widthMm: 600, depthMm: 900, label: 'ES' });
      }
      for (const k of floor.rooms.filter(isKitchen)) {
        const nearest = [...stackByKey.values()].sort((a, b) => dist(center(a.box), center(roomBox(k))) - dist(center(b.box), center(roomBox(k))))[0];
        if (nearest) stackBoxes.set(k.id, nearest.box);
      }
      const byUnit = new Map<string, Room[]>();
      for (const r of floor.rooms) {
        const uKey = r.unitId ?? 'unit_main';
        byUnit.set(uKey, [...(byUnit.get(uKey) ?? []), r]);
      }
      for (const [unitId, unitRooms] of byUnit) {
        synthesizeUnitElectrical(fb, floor, unitRooms, unitId);
        synthesizeUnitPlumbing(fb, floor, unitRooms, unitId, stackBoxes);
      }
      synthesizeCeilings(fb, floor, [...floor.rooms]);
      synthesizeCantilevers(fb, floor);
      synthesizeFire(fb, floor, false);
    } else if (isStilt(floor)) {
      const lobby = floor.rooms.find(isCommonCirculation) ?? floor.rooms[0];
      if (lobby) {
        const lb = roomBox(lobby);
        fb.sym('LT_PANEL', { x: lb.x + 350, y: lb.y + 350 }, { roomId: lobby.id, widthMm: 900, depthMm: 450, label: 'MAIN LT PANEL' });
        fb.sym('ES', { x: lb.x + 350, y: lb.y + Math.min(lb.h - 250, 950) }, { roomId: lobby.id, widthMm: 600, depthMm: 900, label: 'ES' });
      }
      const bPts = floor.boundary?.points ?? [];
      if (bPts.length >= 3) {
        const minX = Math.min(...bPts.map(p => p.x));
        const maxX = Math.max(...bPts.map(p => p.x));
        const minY = Math.min(...bPts.map(p => p.y));
        const maxY = Math.max(...bPts.map(p => p.y));
        fb.sym('UGWT', { x: minX + 1200, y: maxY - 1200 }, { widthMm: 2200, depthMm: 1500, label: 'UGWT' });
        fb.sym('IC', { x: minX + 400, y: minY + 400 }, { label: 'IC-1' });
        fb.sym('IC', { x: maxX - 400, y: minY + 400 }, { label: 'IC-2' });
        fb.sym('GT', { x: minX + 900, y: minY + 600 }, { label: 'GT' });
      }
      const byUnit = new Map<string, Room[]>();
      for (const r of floor.rooms) {
        const uKey = r.unitId ?? 'stilt_common';
        byUnit.set(uKey, [...(byUnit.get(uKey) ?? []), r]);
      }
      for (const [unitId, unitRooms] of byUnit) {
        synthesizeUnitElectrical(fb, floor, unitRooms, unitId);
      }
      synthesizeFire(fb, floor, true);
      const stacks = [...stackByKey.values()];
      for (const [idx, stack] of stacks.entries()) {
        stack.floorIds.push(floor.id);
        fb.sym('PLUMB_SHAFT', center(stack.box), { widthMm: stack.box.w, depthMm: stack.box.h, label: `PS${idx + 1} COLLECTOR` });
      }
      if (stacks.length >= 1) {
        const pts = stacks.map(s => center(s.box)).sort((a, b) => a.x - b.x || a.y - b.y);
        const collectorY = Math.min(...floor.boundary.points.map(p => p.y)) + 300;
        fb.run('SP', [...pts.map(p => ({ x: p.x, y: collectorY })), ...(pts.length === 1 ? [{ x: pts[0]!.x + 1000, y: collectorY }] : [])], { label: 'Ø110 MAIN SEWER' });
      }
    } else if (isRoof(floor)) {
      const bPts = floor.boundary?.points ?? [];
      if (bPts.length >= 3) {
        const minX = Math.min(...bPts.map(p => p.x));
        const maxX = Math.max(...bPts.map(p => p.x));
        const minY = Math.min(...bPts.map(p => p.y));
        const maxY = Math.max(...bPts.map(p => p.y));
        fb.sym('OHT', { x: (minX + maxX) / 2, y: minY + 1800 }, { widthMm: 2400, depthMm: 1800, label: 'OHT' });
        fb.sym('RWP', { x: minX + 350, y: minY + 350 }, { label: 'RWP Ø100' });
        fb.sym('RWP', { x: maxX - 350, y: minY + 350 }, { label: 'RWP Ø100' });
        fb.sym('RWP', { x: minX + 350, y: maxY - 350 }, { label: 'RWP Ø100' });
        fb.sym('RWP', { x: maxX - 350, y: maxY - 350 }, { label: 'RWP Ø100' });
        fb.run('RWP_PIPE', [{ x: minX + 350, y: minY + 350 }, { x: maxX - 350, y: minY + 350 }], { label: 'Ø100 RWP' });
      }
    }
    plans.push(fb.build());
  }

  const all = plans.flatMap(p => p.symbols);
  const count = (k: MepSymbolKind) => all.filter(s => s.kind === k).length;
  return {
    schemaVersion: 'RH-MEP-3.0',
    status: 'COORDINATION_PROPOSAL_NOT_CERTIFIED',
    floors: plans,
    verticalStacks: [...stackByKey.entries()].map(([key, s], i) => ({
      id: `stack_${i + 1}_${key.replace('|', '_')}`,
      position: center(s.box), widthMm: s.box.w, depthMm: s.box.h,
      floorIds: s.floorIds,
      terminatesAtStiltCollector: Boolean(stiltFloor && s.floorIds.includes(stiltFloor.id)),
    })),
    summary: {
      distributionBoards: count('DB'), fans: count('FAN'), downlights: count('DL'), switchboards: count('SB') + count('SB_2WAY'),
      sockets16A: count('SOCKET_16A'), geysers: count('GY'), acIndoorUnits: count('AC_IDU'),
      plumbingShafts: count('PLUMB_SHAFT'), floorTraps: count('FT') + count('NT'),
      fireRisers: count('FHR'), smokeDetectors: count('SD'), heatDetectors: count('HD'), exitSigns: count('EXIT_SIGN'),
      sprinklers: count('SPRINKLER'),
      pipeRuns: plans.reduce((s, p) => s + p.runs.length, 0),
      ceilingZones: plans.reduce((s, p) => s + p.ceilings.length, 0),
      cantileverBeams: plans.reduce((s, p) => s + p.cantileverBeams.length, 0),
    },
  };
}

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Attaches a freshly synthesized plan; pure (returns a new building). */
export function withMepEngineering(building: Building): Building {
  return { ...building, mepEngineering: synthesizeMepEngineering(building) };
}
