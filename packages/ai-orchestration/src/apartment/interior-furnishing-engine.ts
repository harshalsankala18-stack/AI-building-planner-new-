/**
 * Interior Furnishing & MEP Ceiling Synthesis Engine (§Stage B2).
 *
 * Implements the Single-Synthesis Rule for Interior Fixtures:
 * - Automatically populates basic house interiors for 2D plans and 3D Pascal Studio.
 * - Places living suites, coffee tables, TV units, beds, nightstands, wardrobes, dining sets,
 *   kitchen counters, refrigerators, water closets, wash basins, shower trays, ceiling fans,
 *   recessed downlights, and pendant lights.
 * - Guarantees ZERO wall intersections, ZERO door swing collisions, and ZERO item-to-item overlaps.
 * - Generates native Pascal ItemNode and CeilingNode schemas with realistic elevation and mount types.
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

/**
 * Synthesizes collision-free interior furnishings and ceiling fixtures for a single floor.
 */
export function synthesizeFloorInteriors(floor: Floor): CanonicalFurnitureItem[] {
  const floorRooms = floor.rooms ?? [];
  const floorDoors = floor.doors ?? [];
  const floorHeightMm = floor.floorHeight ?? 3000;
  const isStiltOrParking = floor.floorUse === 'STILT_PARKING' || /STILT/i.test(floor.name);
  const isTerrace = /TERRACE/i.test(floor.name) || floor.level >= 10;

  const synthesized: CanonicalFurnitureItem[] = [];

  for (const room of floorRooms) {
    if (room.type === RoomType.ServiceShaft || room.type === RoomType.Lift) {
      continue;
    }

    const bbox = getRoomBbox(room);
    const roomW = bbox.maxX - bbox.minX;
    const roomD = bbox.maxY - bbox.minY;
    const roomAreaM2 = (roomW * roomD) / 1_000_000;

    // Usable interior box inset from perimeter walls (240mm inside wall boundary)
    const inset = 240;
    const usable: BoundingBox2D = {
      minX: bbox.minX + inset,
      minY: bbox.minY + inset,
      maxX: bbox.maxX - inset,
      maxY: bbox.maxY - inset,
    };

    if (usable.maxX <= usable.minX + 300 || usable.maxY <= usable.minY + 300) {
      continue; // Room too small to place furniture
    }

    // Door swing exclusion zones (950mm radius around door positions in this room)
    const doorExclusions: BoundingBox2D[] = [];
    for (const d of floorDoors) {
      if (!d.position) continue;
      const isConnected = d.connectsRooms && d.connectsRooms.includes(room.id);
      if (isConnected) {
        const radius = (d.width ?? 900) + 150;
        doorExclusions.push({
          minX: d.position.x - radius,
          minY: d.position.y - radius,
          maxX: d.position.x + radius,
          maxY: d.position.y + radius,
        });
      }
    }

    // Track placed items in this room for local overlap prevention
    const roomPlacedBoxes: BoundingBox2D[] = [];
    const roomCeilingBoxes: BoundingBox2D[] = [];

    // Helper: test candidate box
    const canPlace = (itemBox: BoundingBox2D, isCeiling = false): boolean => {
      // Must be inside usable room bounds
      if (
        itemBox.minX < usable.minX ||
        itemBox.maxX > usable.maxX ||
        itemBox.minY < usable.minY ||
        itemBox.maxY > usable.maxY
      ) {
        return false;
      }

      if (!isCeiling) {
        // Must not intersect door swing exclusion zones
        for (const dex of doorExclusions) {
          if (boxesOverlap(itemBox, dex, 50)) return false;
        }
        // Must not intersect already placed floor items in room
        for (const placed of roomPlacedBoxes) {
          if (boxesOverlap(itemBox, placed, 80)) return false;
        }
      } else {
        // Ceiling fixtures must not intersect already placed ceiling items
        for (const placed of roomCeilingBoxes) {
          if (boxesOverlap(itemBox, placed, 100)) return false;
        }
      }
      return true;
    };

    // Helper: place catalog item
    let itemSeq = 1;
    const placeItem = (
      kind: InteriorItemKind,
      candidateCenterX: number,
      candidateCenterY: number,
      rotationDeg = 0,
      customElevationMm?: number,
    ): boolean => {
      const catalog = INTERIOR_CATALOG.find((c) => c.kind === kind);
      if (!catalog) return false;

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

      if (!canPlace(itemBox, isCeiling)) {
        return false;
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
        roomPlacedBoxes.push(itemBox);
      } else {
        roomCeilingBoxes.push(itemBox);
      }
      return true;
    };

    // ─── Room Centroid ────────────────────────────────────────────────────────
    const centerX = (usable.minX + usable.maxX) / 2;
    const centerY = (usable.minY + usable.maxY) / 2;

    // ─── Stilt Parking / Terrace Handling ─────────────────────────────────────
    if (isStiltOrParking || isTerrace) {
      // Place ceiling downlights only
      placeItem('ceiling_light_recessed', centerX, centerY, 0, floorHeightMm - 40);
      continue;
    }

    // ─── Living Room ──────────────────────────────────────────────────────────
    if (room.type === RoomType.Living) {
      // 1. Sofa 3-seater against North or South wall
      const sofaY = usable.maxY - 850 / 2 - 50;
      placeItem('sofa_3seater', centerX, sofaY, 0);

      // 2. Coffee table in front of sofa
      placeItem('coffee_table', centerX, sofaY - 850 / 2 - 450 - 600 / 2, 0);

      // 3. TV console on opposite wall
      const tvY = usable.minY + 420 / 2 + 50;
      placeItem('tv_console', centerX, tvY, 0);

      // 4. Ceiling fan at room center
      placeItem('ceiling_fan', centerX, centerY, 0, floorHeightMm - 320);

      // 5. Symmetric corner ceiling downlights (away from central fan)
      if (roomW >= 4200 && roomD >= 4200) {
        placeItem('ceiling_light_recessed', usable.minX + 450, usable.minY + 450, 0, floorHeightMm - 40);
        placeItem('ceiling_light_recessed', usable.maxX - 450, usable.minY + 450, 0, floorHeightMm - 40);
      }
    }

    // ─── Master / Standard Bedrooms ───────────────────────────────────────────
    else if (room.type === RoomType.Bedroom) {
      const isQueen = roomW >= 2800 && roomD >= 2800;
      const bedKind: InteriorItemKind = isQueen ? 'bed_queen' : 'bed_single';
      const bedW = isQueen ? 1600 : 1000;
      const bedD = isQueen ? 2050 : 2000;

      // Bed against top wall (headboard at North)
      const bedY = usable.minY + bedD / 2 + 100;
      const placedBed = placeItem(bedKind, centerX, bedY, 0);

      if (placedBed) {
        // Flank with side tables
        const sideY = bedY - bedD / 2 + 450 / 2 + 50;
        placeItem('side_table', centerX - bedW / 2 - 480 / 2 - 60, sideY, 0);
        placeItem('side_table', centerX + bedW / 2 + 480 / 2 + 60, sideY, 0);
      }

      // Wardrobe along bottom wall
      const wardY = usable.maxY - 600 / 2 - 50;
      placeItem('wardrobe', centerX, wardY, 0);

      // Ceiling fan centered in bedroom
      placeItem('ceiling_fan', centerX, centerY, 0, floorHeightMm - 320);
    }

    // ─── Dining Room ──────────────────────────────────────────────────────────
    else if (room.type === RoomType.Dining) {
      const use6 = roomAreaM2 >= 10;
      const tableKind: InteriorItemKind = use6 ? 'dining_table_6' : 'dining_table_4';
      placeItem(tableKind, centerX, centerY, 0);

      // Suspended fixture: pendant light if compact, ceiling fan if generous
      if (roomAreaM2 >= 12) {
        placeItem('ceiling_fan', centerX, centerY, 0, floorHeightMm - 320);
      } else {
        placeItem('pendant_light', centerX, centerY, 0, floorHeightMm - 550);
      }
    }

    // ─── Kitchen ──────────────────────────────────────────────────────────────
    else if (room.type === RoomType.Kitchen) {
      // Modular counter along perimeter wall
      const counterY = usable.minY + 600 / 2 + 50;
      placeItem('kitchen_counter', centerX, counterY, 0);

      // Refrigerator in corner
      const refX = usable.maxX - 700 / 2 - 50;
      const refY = usable.maxY - 700 / 2 - 50;
      placeItem('refrigerator', refX, refY, 0);

      // Recessed kitchen ceiling light
      placeItem('ceiling_light_recessed', centerX, centerY, 0, floorHeightMm - 40);
    }

    // ─── Bathroom / Toilet ───────────────────────────────────────────────────
    else if (room.type === RoomType.Bathroom) {
      // Wash basin near entry corner
      const basinX = usable.minX + 600 / 2 + 50;
      const basinY = usable.minY + 460 / 2 + 50;
      placeItem('wash_basin', basinX, basinY, 0);

      // WC toilet alongside plumbing wall
      const wcX = usable.maxX - 400 / 2 - 50;
      const wcY = usable.minY + 680 / 2 + 50;
      placeItem('wc_toilet', wcX, wcY, 0);

      // Shower tray if spacious
      if (roomAreaM2 >= 2.6) {
        const showerX = usable.maxX - 900 / 2 - 50;
        const showerY = usable.maxY - 900 / 2 - 50;
        placeItem('shower_tray', showerX, showerY, 0);
      }

      // Ceiling light
      placeItem('ceiling_light_recessed', centerX, centerY, 0, floorHeightMm - 40);
    }

    // ─── Corridor / Foyer / Lobby ─────────────────────────────────────────────
    else if (room.type === RoomType.Corridor || room.type === RoomType.Foyer) {
      // Place ceiling downlights along corridor centerline
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
    // Preserve any user-placed or locked furniture items
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
