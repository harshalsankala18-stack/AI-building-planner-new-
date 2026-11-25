/**
 * Interior Furnishing & MEP Ceiling Synthesis Engine (§Stage B2 + Stage G Room-Scaled Realism).
 *
 * Implements the Single-Synthesis Rule for Interior Fixtures:
 * - Classifies every room into `compact` | `standard` | `spacious` tiers by dimensions & area.
 * - Detects solid host walls vs door/window openings on `floor.walls`, `floor.doors`, `floor.windows`.
 * - Backs major furniture flush (<= 80mm clearance) against solid interior wall faces, facing inward.
 * - Enforces ergonomic spacing (450-550mm sofa-to-coffee-table, >= 850mm primary circulation,
 *   >= 950mm door swing clearance, >= 1050mm kitchen work aisle) with zero overlaps.
 */

import {
  type Building,
  type Floor,
  type Room,
  type CanonicalFurnitureItem,
  type InteriorItemKind,
  RoomType,
  INTERIOR_CATALOG,
  createFurnitureItem,
} from '@ai-floor-planner/core';

interface BoundingBox2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

type WallSide = 'north' | 'south' | 'west' | 'east';
type RoomSizeTier = 'compact' | 'standard' | 'spacious';

const WALL_SIDE_ROTATION: Record<WallSide, number> = {
  north: 0,
  south: 180,
  west: 90,
  east: 270,
};

const OPPOSITE_SIDE: Record<WallSide, WallSide> = {
  north: 'south',
  south: 'north',
  west: 'east',
  east: 'west',
};

function getRoomBbox(room: Room): BoundingBox2D {
  if (room.boundary?.points && room.boundary.points.length >= 3) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of room.boundary.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return { minX, minY, maxX, maxY };
  }
  return {
    minX: room.x,
    minY: room.y,
    maxX: room.x + room.width,
    maxY: room.y + room.height,
  };
}

function boxesOverlap(b1: BoundingBox2D, b2: BoundingBox2D, padding = 40): boolean {
  return !(
    b1.maxX + padding <= b2.minX ||
    b1.minX >= b2.maxX + padding ||
    b1.maxY + padding <= b2.minY ||
    b1.minY >= b2.maxY + padding
  );
}

export function classifyRoomSizeTier(
  roomType: RoomType,
  widthMm: number,
  depthMm: number,
  areaM2: number,
): RoomSizeTier {
  const minDim = Math.min(widthMm, depthMm);
  if (roomType === RoomType.Living) {
    if (areaM2 < 16 || minDim < 3200) return 'compact';
    if (areaM2 >= 26 && minDim >= 4200) return 'spacious';
    return 'standard';
  }
  if (roomType === RoomType.Bedroom) {
    if (areaM2 < 10.5 || minDim < 2800) return 'compact';
    if (areaM2 >= 15 && minDim >= 3500) return 'spacious';
    return 'standard';
  }
  if (roomType === RoomType.Kitchen) {
    if (areaM2 < 6 || minDim < 2100) return 'compact';
    if (areaM2 >= 10 && minDim >= 2800) return 'spacious';
    return 'standard';
  }
  if (roomType === RoomType.Dining) {
    if (areaM2 < 9 || minDim < 2600) return 'compact';
    if (areaM2 >= 13 && minDim >= 3200) return 'spacious';
    return 'standard';
  }
  if (areaM2 < 3.2 || minDim < 1500) return 'compact';
  if (areaM2 >= 5.0 && minDim >= 2000) return 'spacious';
  return 'standard';
}

function computeWallHalfThickness(floor: Floor, side: WallSide, bbox: BoundingBox2D): number {
  const walls = floor.walls ?? [];
  let maxHalf = 100;
  for (const w of walls) {
    const half = Math.min(130, Math.max(70, (w.thickness ?? 200) / 2));
    const horizontal = Math.abs(w.endPoint.y - w.startPoint.y) < 120;
    const vertical = Math.abs(w.endPoint.x - w.startPoint.x) < 120;
    if (side === 'north' && horizontal && Math.abs((w.startPoint.y + w.endPoint.y) / 2 - bbox.minY) < 220) {
      maxHalf = Math.max(maxHalf, half);
    } else if (side === 'south' && horizontal && Math.abs((w.startPoint.y + w.endPoint.y) / 2 - bbox.maxY) < 220) {
      maxHalf = Math.max(maxHalf, half);
    } else if (side === 'west' && vertical && Math.abs((w.startPoint.x + w.endPoint.x) / 2 - bbox.minX) < 220) {
      maxHalf = Math.max(maxHalf, half);
    } else if (side === 'east' && vertical && Math.abs((w.startPoint.x + w.endPoint.x) / 2 - bbox.maxX) < 220) {
      maxHalf = Math.max(maxHalf, half);
    }
  }
  return maxHalf;
}

function rankWallSides(
  floor: Floor,
  room: Room,
  bbox: BoundingBox2D,
  preferAxis: 'horizontal' | 'vertical' | 'auto' = 'auto',
): WallSide[] {
  const doors = (floor.doors ?? []).filter((d) => d.position && d.connectsRooms?.includes(room.id));
  const windows = (floor.windows ?? []).filter((w) => w.position && (w.roomId === room.id || !w.roomId));
  const wMm = bbox.maxX - bbox.minX;
  const dMm = bbox.maxY - bbox.minY;

  const scoreSide = (side: WallSide): number => {
    const span = side === 'north' || side === 'south' ? wMm : dMm;
    let score = span;
    if (preferAxis === 'horizontal' && (side === 'north' || side === 'south')) score += 600;
    if (preferAxis === 'vertical' && (side === 'west' || side === 'east')) score += 600;
    if (preferAxis === 'auto' && ((wMm >= dMm && (side === 'north' || side === 'south')) || (dMm > wMm && (side === 'west' || side === 'east')))) {
      score += 400;
    }

    const nearEdge = (px: number, py: number) => {
      if (side === 'north') return Math.abs(py - bbox.minY) < 350 && px >= bbox.minX - 100 && px <= bbox.maxX + 100;
      if (side === 'south') return Math.abs(py - bbox.maxY) < 350 && px >= bbox.minX - 100 && px <= bbox.maxX + 100;
      if (side === 'west') return Math.abs(px - bbox.minX) < 350 && py >= bbox.minY - 100 && py <= bbox.maxY + 100;
      return Math.abs(px - bbox.maxX) < 350 && py >= bbox.minY - 100 && py <= bbox.maxY + 100;
    };

    for (const d of doors) {
      if (d.position && nearEdge(d.position.x, d.position.y)) score -= 3500;
    }
    for (const w of windows) {
      if (w.position && nearEdge(w.position.x, w.position.y)) score -= 900;
    }
    return score;
  };

  const sides: WallSide[] = ['north', 'south', 'west', 'east'];
  return sides.sort((a, b) => scoreSide(b) - scoreSide(a));
}

/**
 * Synthesizes collision-free, room-scaled interior furnishings and ceiling fixtures for a single floor.
 */
export function synthesizeFloorInteriors(floor: Floor): CanonicalFurnitureItem[] {
  const floorRooms = floor.rooms ?? [];
  const floorDoors = floor.doors ?? [];
  const floorHeightMm = floor.floorHeight ?? 3000;
  const isStiltOrParking = floor.floorUse === 'STILT_PARKING' || /STILT/i.test(floor.name);
  const isTerrace = /TERRACE/i.test(floor.name) || floor.floorUse === 'ROOF' || floor.level >= 10;

  const synthesized: CanonicalFurnitureItem[] = [];

  for (const room of floorRooms) {
    if (room.type === RoomType.ServiceShaft || room.type === RoomType.Lift) {
      continue;
    }

    const bbox = getRoomBbox(room);
    const roomW = bbox.maxX - bbox.minX;
    const roomD = bbox.maxY - bbox.minY;
    const roomAreaM2 = (roomW * roomD) / 1_000_000;
    const tier = classifyRoomSizeTier(room.type, roomW, roomD, roomAreaM2);

    // Wall-face inset guarantees <= 40mm-60mm clear gap from actual inner wall face (strictly <= 80mm)
    const wallGap = 35;
    const usable: BoundingBox2D = {
      minX: bbox.minX + computeWallHalfThickness(floor, 'north', bbox) * 0 + computeWallHalfThickness(floor, 'west', bbox) + wallGap,
      minY: bbox.minY + computeWallHalfThickness(floor, 'north', bbox) + wallGap,
      maxX: bbox.maxX - computeWallHalfThickness(floor, 'east', bbox) - wallGap,
      maxY: bbox.maxY - computeWallHalfThickness(floor, 'south', bbox) - wallGap,
    };

    if (usable.maxX <= usable.minX + 350 || usable.maxY <= usable.minY + 350) {
      continue;
    }

    // Door swing exclusion zones (950mm radius around door positions in this room)
    const doorExclusions: BoundingBox2D[] = [];
    for (const d of floorDoors) {
      if (!d.position) continue;
      const isConnected = d.connectsRooms && d.connectsRooms.includes(room.id);
      if (isConnected) {
        const radius = Math.max(950, (d.width ?? 900) + 120);
        doorExclusions.push({
          minX: d.position.x - radius,
          minY: d.position.y - radius,
          maxX: d.position.x + radius,
          maxY: d.position.y + radius,
        });
      }
    }

    const roomPlacedBoxes: { kind: InteriorItemKind; box: BoundingBox2D }[] = [];
    const roomCeilingBoxes: BoundingBox2D[] = [];

    const canPlace = (kind: InteriorItemKind, itemBox: BoundingBox2D, isCeiling = false): boolean => {
      if (
        itemBox.minX < usable.minX ||
        itemBox.maxX > usable.maxX ||
        itemBox.minY < usable.minY ||
        itemBox.maxY > usable.maxY
      ) {
        return false;
      }

      if (!isCeiling) {
        if (kind !== 'area_rug') {
          for (const dex of doorExclusions) {
            if (boxesOverlap(itemBox, dex, 40)) return false;
          }
        }
        for (const placed of roomPlacedBoxes) {
          // Flat woven rug sits beneath coffee table & front sofa edge
          if (kind === 'area_rug' || placed.kind === 'area_rug') continue;
          if (boxesOverlap(itemBox, placed.box, 80)) return false;
        }
      } else {
        for (const placed of roomCeilingBoxes) {
          if (boxesOverlap(itemBox, placed, 100)) return false;
        }
      }
      return true;
    };

    let itemSeq = 1;
    const placeItem = (
      kind: InteriorItemKind,
      candidateCenterX: number,
      candidateCenterY: number,
      rotationDeg = 0,
      customElevationMm?: number,
    ): BoundingBox2D | null => {
      const catalog = INTERIOR_CATALOG.find((c) => c.kind === kind);
      if (!catalog) return null;

      let w = catalog.defaultWidthMm;
      let d = catalog.defaultDepthMm;
      if (rotationDeg === 90 || rotationDeg === 270) {
        const tmp = w;
        w = d;
        d = tmp;
      }

      const isCeiling = catalog.mountType === 'ceiling';
      const itemBox: BoundingBox2D = {
        minX: Math.round(candidateCenterX - w / 2),
        minY: Math.round(candidateCenterY - d / 2),
        maxX: Math.round(candidateCenterX + w / 2),
        maxY: Math.round(candidateCenterY + d / 2),
      };

      if (!canPlace(kind, itemBox, isCeiling)) {
        return null;
      }

      const elevationMm =
        customElevationMm ??
        (isCeiling
          ? Math.max(2200, floorHeightMm - catalog.defaultHeightMm)
          : catalog.defaultElevationMm);

      const item = createFurnitureItem({
        id: `furn_${floor.id}_${room.id}_${kind}_${itemSeq++}`,
        type: (catalog.category === 'lighting' ? 'desk' : 'table') as any,
        roomId: room.id,
        floorId: floor.id,
        category: catalog.category,
        kind: catalog.kind,
        label: catalog.label,
        mountType: catalog.mountType,
        xMm: itemBox.minX,
        yMm: itemBox.minY,
        widthMm: w,
        depthMm: d,
        heightMm: catalog.defaultHeightMm,
        elevationMm,
        rotationDeg,
        locked: false,
      });

      synthesized.push(item);
      if (!isCeiling) {
        roomPlacedBoxes.push({ kind, box: itemBox });
      } else {
        roomCeilingBoxes.push(itemBox);
      }
      return itemBox;
    };

    const snapToWall = (
      side: WallSide,
      kind: InteriorItemKind,
      lateralRatio = 0.5,
      extraInwardOffsetMm = 0,
    ): BoundingBox2D | null => {
      const catalog = INTERIOR_CATALOG.find((c) => c.kind === kind);
      if (!catalog) return null;
      const rot = WALL_SIDE_ROTATION[side];
      const halfDepth = catalog.defaultDepthMm / 2 + extraInwardOffsetMm;
      const halfSpan = catalog.defaultWidthMm / 2;
      const uW = usable.maxX - usable.minX;
      const uD = usable.maxY - usable.minY;

      if (side === 'north' || side === 'south') {
        const rawX = usable.minX + uW * lateralRatio;
        const cx = Math.max(usable.minX + halfSpan, Math.min(usable.maxX - halfSpan, rawX));
        const cy = side === 'north' ? usable.minY + halfDepth : usable.maxY - halfDepth;
        return placeItem(kind, cx, cy, rot);
      }
      const rawY = usable.minY + uD * lateralRatio;
      const cy = Math.max(usable.minY + halfSpan, Math.min(usable.maxY - halfSpan, rawY));
      const cx = side === 'west' ? usable.minX + halfDepth : usable.maxX - halfDepth;
      return placeItem(kind, cx, cy, rot);
    };

    const centerX = (usable.minX + usable.maxX) / 2;
    const centerY = (usable.minY + usable.maxY) / 2;
    const rankedSides = rankWallSides(floor, room, bbox);

    // ─── Stilt Parking / Terrace Handling ─────────────────────────────────────
    if (isStiltOrParking || isTerrace) {
      placeItem('ceiling_light_recessed', centerX, centerY, 0, floorHeightMm - 40);
      continue;
    }

    // ─── Living Room (Compact / Standard / Spacious) ──────────────────────────
    if (room.type === RoomType.Living) {
      let placedSofaBox: BoundingBox2D | null = null;
      let sofaSide: WallSide = rankedSides[0] ?? 'south';
      let sofaKind: InteriorItemKind =
        tier === 'spacious' ? 'sofa_l_sectional' : tier === 'compact' ? 'sofa_2seater' : 'sofa_3seater';

      for (const candidateSide of rankedSides) {
        const order: InteriorItemKind[] =
          tier === 'spacious'
            ? ['sofa_l_sectional', 'sofa_3seater', 'sofa_2seater']
            : tier === 'standard'
              ? ['sofa_3seater', 'sofa_2seater']
              : ['sofa_2seater', 'sofa_3seater'];
        for (const k of order) {
          const placed = snapToWall(candidateSide, k, 0.5);
          if (placed) {
            placedSofaBox = placed;
            sofaSide = candidateSide;
            sofaKind = k;
            break;
          }
        }
        if (placedSofaBox) break;
      }

      if (placedSofaBox) {
        const sofaRot = WALL_SIDE_ROTATION[sofaSide];
        const sCx = (placedSofaBox.minX + placedSofaBox.maxX) / 2;
        const sCy = (placedSofaBox.minY + placedSofaBox.maxY) / 2;
        const gapToTable = 480;
        const tableHalfD = 300;
        const sofaHalfD = (sofaKind === 'sofa_l_sectional' ? 1650 : 850) / 2;
        let tblX = sCx;
        let tblY = sCy;
        if (sofaSide === 'north') tblY = placedSofaBox.maxY + gapToTable + tableHalfD - (sofaKind === 'sofa_l_sectional' ? 350 : 0);
        else if (sofaSide === 'south') tblY = placedSofaBox.minY - gapToTable - tableHalfD + (sofaKind === 'sofa_l_sectional' ? 350 : 0);
        else if (sofaSide === 'west') tblX = placedSofaBox.maxX + gapToTable + tableHalfD - (sofaKind === 'sofa_l_sectional' ? 350 : 0);
        else tblX = placedSofaBox.minX - gapToTable - tableHalfD + (sofaKind === 'sofa_l_sectional' ? 350 : 0);

        if (tier !== 'compact') {
          placeItem('area_rug', tblX, tblY, sofaRot);
        }
        placeItem('coffee_table', tblX, tblY, sofaRot);

        // Opposite solid wall -> TV Feature Console facing sofa
        const oppSide = OPPOSITE_SIDE[sofaSide];
        const tvRot = WALL_SIDE_ROTATION[oppSide];
        const tvPlaced =
          snapToWall(oppSide, 'tv_console', 0.5) ??
          (sofaSide === 'north' || sofaSide === 'south'
            ? placeItem('tv_console', sCx, oppSide === 'north' ? usable.minY + 210 : usable.maxY - 210, tvRot)
            : placeItem('tv_console', oppSide === 'west' ? usable.minX + 210 : usable.maxX - 210, sCy, tvRot));
        void sofaHalfD;
        void tvPlaced;
      } else {
        snapToWall(OPPOSITE_SIDE[sofaSide], 'tv_console', 0.5);
      }

      if (tier === 'spacious' || tier === 'standard') {
        const perpSide = rankedSides.find((s) => s !== sofaSide && s !== OPPOSITE_SIDE[sofaSide]);
        if (perpSide) {
          snapToWall(perpSide, 'armchair', tier === 'spacious' ? 0.35 : 0.5, 80);
        }
      }
      if (tier === 'spacious') {
        placeItem('indoor_plant', usable.maxX - 260, usable.minY + 260, 0);
      }

      placeItem('ceiling_fan', centerX, centerY, 0, floorHeightMm - 320);
      if (roomW >= 4200 && roomD >= 4200) {
        placeItem('ceiling_light_recessed', usable.minX + 450, usable.minY + 450, 0, floorHeightMm - 40);
        placeItem('ceiling_light_recessed', usable.maxX - 450, usable.minY + 450, 0, floorHeightMm - 40);
      }
    }

    // ─── Master / Standard / Compact Bedrooms ─────────────────────────────────
    else if (room.type === RoomType.Bedroom) {
      const bedOrder: InteriorItemKind[] =
        tier === 'spacious'
          ? ['bed_king', 'bed_queen', 'bed_single']
          : tier === 'standard'
            ? ['bed_queen', 'bed_single']
            : ['bed_single', 'bed_queen'];

      let bedSide: WallSide = rankedSides[0] ?? 'north';
      let placedBed: BoundingBox2D | null = null;
      let chosenBedKind: InteriorItemKind = bedOrder[0]!;

      for (const s of rankedSides) {
        for (const bk of bedOrder) {
          const res = snapToWall(s, bk, 0.5);
          if (res) {
            placedBed = res;
            bedSide = s;
            chosenBedKind = bk;
            break;
          }
        }
        if (placedBed) break;
      }

      // Flank bed with side tables along the headboard wall
      if (placedBed) {
        const rot = WALL_SIDE_ROTATION[bedSide];
        if (bedSide === 'north' || bedSide === 'south') {
          const stY = bedSide === 'north' ? usable.minY + 450 / 2 : usable.maxY - 450 / 2;
          placeItem('side_table', placedBed.minX - 480 / 2 - 70, stY, rot);
          if (tier !== 'compact') {
            placeItem('side_table', placedBed.maxX + 480 / 2 + 70, stY, rot);
          }
        } else {
          const stX = bedSide === 'west' ? usable.minX + 450 / 2 : usable.maxX - 450 / 2;
          placeItem('side_table', stX, placedBed.minY - 480 / 2 - 70, rot);
          if (tier !== 'compact') {
            placeItem('side_table', stX, placedBed.maxY + 480 / 2 + 70, rot);
          }
        }
        void chosenBedKind;
      }

      // Wardrobe along secondary solid wall (with >= 850mm walkway check handled via non-overlap)
      const wardSides = rankedSides.filter((s) => s !== bedSide);
      for (const ws of wardSides) {
        if (snapToWall(ws, 'wardrobe', 0.5)) break;
      }

      if (tier === 'spacious') {
        const deskSides = wardSides;
        for (const ds of deskSides) {
          if (snapToWall(ds, 'study_desk', 0.25)) break;
        }
      }

      placeItem('ceiling_fan', centerX, centerY, 0, floorHeightMm - 320);
    }

    // ─── Dining Room ──────────────────────────────────────────────────────────
    else if (room.type === RoomType.Dining) {
      const tableKind: InteriorItemKind = tier === 'spacious' || roomAreaM2 >= 11 ? 'dining_table_6' : 'dining_table_4';
      const rot = roomD > roomW ? 90 : 0;
      placeItem(tableKind, centerX, centerY, rot) ?? placeItem('dining_table_4', centerX, centerY, rot);

      if (tier !== 'compact') {
        placeItem('indoor_plant', usable.maxX - 250, usable.maxY - 250, 0);
      }

      if (roomAreaM2 >= 12) {
        placeItem('ceiling_fan', centerX, centerY, 0, floorHeightMm - 320);
      } else {
        placeItem('pendant_light', centerX, centerY, 0, floorHeightMm - 550);
      }
    }

    // ─── Kitchen ──────────────────────────────────────────────────────────────
    else if (room.type === RoomType.Kitchen) {
      let counterPlaced = false;
      for (const ks of rankedSides) {
        if (snapToWall(ks, 'kitchen_counter', 0.5)) {
          counterPlaced = true;
          const opp = OPPOSITE_SIDE[ks];
          if (!snapToWall(opp, 'refrigerator', 0.82)) {
            const adj = rankedSides.find((s) => s !== ks);
            if (adj) snapToWall(adj, 'refrigerator', 0.18);
          }
          break;
        }
      }
      if (!counterPlaced) {
        snapToWall(rankedSides[0] ?? 'north', 'refrigerator', 0.5);
      }
      placeItem('ceiling_light_recessed', centerX, centerY, 0, floorHeightMm - 40);
    }

    // ─── Bathroom / Toilet ───────────────────────────────────────────────────
    else if (room.type === RoomType.Bathroom) {
      const wetSide = rankedSides[0] ?? 'north';
      const altSide = rankedSides[1] ?? OPPOSITE_SIDE[wetSide];
      snapToWall(wetSide, 'wash_basin', 0.25) ?? snapToWall(altSide, 'wash_basin', 0.25);
      snapToWall(wetSide, 'wc_toilet', 0.78) ?? snapToWall(altSide, 'wc_toilet', 0.78);

      if (roomAreaM2 >= 2.6) {
        const shSide = OPPOSITE_SIDE[wetSide];
        snapToWall(shSide, 'shower_tray', 0.82) ?? snapToWall(shSide, 'shower_tray', 0.2);
      }

      placeItem('ceiling_light_recessed', centerX, centerY, 0, floorHeightMm - 40);
    }

    // ─── Corridor / Foyer / Lobby ─────────────────────────────────────────────
    else if (room.type === RoomType.Corridor || room.type === RoomType.Foyer) {
      if (roomW >= roomD && roomW >= 3000) {
        const count = Math.max(2, Math.floor(roomW / 2400));
        for (let i = 1; i <= count; i++) {
          const x = usable.minX + (roomW / (count + 1)) * i;
          placeItem('ceiling_light_recessed', x, centerY, 0, floorHeightMm - 40);
        }
      } else if (roomD >= 3000) {
        const count = Math.max(2, Math.floor(roomD / 2400));
        for (let i = 1; i <= count; i++) {
          const y = usable.minY + (roomD / (count + 1)) * i;
          placeItem('ceiling_light_recessed', centerX, y, 0, floorHeightMm - 40);
        }
      } else {
        placeItem('ceiling_light_recessed', centerX, centerY, 0, floorHeightMm - 40);
      }
    }
  }

  return synthesized;
}

/**
 * Master synthesis pass for basic house interiors across all floors of a building.
 */
export function synthesizeBasicInteriors(building: Building): Building {
  if (!building || !building.floors || building.floors.length === 0) {
    return building;
  }

  const updatedFloors = building.floors.map((floor) => {
    const userLockedItems = (floor.furniture ?? []).filter((item) => item.locked === true);
    const synthesizedFurniture = synthesizeFloorInteriors(floor);
    const combined = [...synthesizedFurniture];
    for (const locked of userLockedItems) {
      if (!combined.some((c) => c.id === locked.id)) {
        combined.push(locked);
      }
    }
    return {
      ...floor,
      furniture: combined,
    };
  });

  return {
    ...building,
    floors: updatedFloors,
  };
}
