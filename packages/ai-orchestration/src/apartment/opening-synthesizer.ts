/**
 * Canonical Opening Synthesizer (§Stage B1).
 *
 * Implements the Single-Synthesis Rule for Doors and Windows:
 * - 100% room reachability via BFS from Main Entrance (doorlessRoomCount === 0).
 * - 100% natural exterior ventilation for habitable rooms & bathrooms (unventilatedRoomCount === 0).
 * - Categorized Doors & Windows Catalog with correct widths, heights, sill heights, leaf counts, and styles.
 * - Non-overlapping openings with >= 150mm corner clearance and >= 200mm inter-opening clearance.
 */

import {
  type Building,
  type Floor,
  type Room,
  type Wall,
  type Door,
  type Window,
  type Point,
  RoomType,
  WallType,
  DoorType,
  WindowType,
  SwingDirection,
  type DoorCategory,
  type WindowCategory,
  DOOR_CATALOG,
} from '@ai-floor-planner/core';

function snap(val: number, grid = 10): number {
  return Math.round(val / grid) * grid;
}

function dist(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

interface OpeningInterval {
  start: number;
  end: number;
  type: 'door' | 'window';
  id: string;
}

/**
 * Checks if an opening of width `widthMm` can fit on a wall of length `wallLength`
 * at offset `centerOffset` without overlapping existing openings or violating 150mm corner clearance.
 */
function canFitOpening(
  wallLength: number,
  centerOffset: number,
  widthMm: number,
  existingIntervals: OpeningInterval[],
  cornerClearance = 150,
  minSpacing = 200,
): boolean {
  const half = widthMm / 2;
  const start = centerOffset - half;
  const end = centerOffset + half;

  if (start < cornerClearance || end > wallLength - cornerClearance) {
    return false;
  }

  for (const iv of existingIntervals) {
    if (start < iv.end + minSpacing && end > iv.start - minSpacing) {
      return false;
    }
  }

  return true;
}

/**
 * Finds a suitable center offset for an opening on a wall.
 */
function findOpeningOffset(
  wallLength: number,
  widthMm: number,
  existingIntervals: OpeningInterval[],
  preferredRatio = 0.5,
): number | null {
  if (wallLength < widthMm + 300) return null;

  // Try preferred position first (e.g. center)
  const preferredOffset = snap(wallLength * preferredRatio);
  if (canFitOpening(wallLength, preferredOffset, widthMm, existingIntervals)) {
    return preferredOffset;
  }

  // Search candidate offsets from center outwards
  const step = 100;
  for (let delta = step; delta < wallLength / 2; delta += step) {
    const offPlus = snap(preferredOffset + delta);
    if (canFitOpening(wallLength, offPlus, widthMm, existingIntervals)) {
      return offPlus;
    }
    const offMinus = snap(preferredOffset - delta);
    if (canFitOpening(wallLength, offMinus, widthMm, existingIntervals)) {
      return offMinus;
    }
  }

  return null;
}

/**
 * Synthesizes complete, categorized doors and windows for a single floor.
 */
export function synthesizeFloorOpenings(floor: Floor): {
  floor: Floor;
  doorlessRoomCount: number;
  unventilatedRoomCount: number;
  synthesizedDoors: number;
  synthesizedWindows: number;
} {
  const rooms = [...(floor.rooms ?? [])];
  if (rooms.length === 0) {
    return {
      floor,
      doorlessRoomCount: 0,
      unventilatedRoomCount: 0,
      synthesizedDoors: 0,
      synthesizedWindows: 0,
    };
  }

  const walls: Wall[] = (floor.walls && floor.walls.length > 0)
    ? floor.walls.map(w => ({ ...w, roomIds: [...(w.roomIds ?? [])] }))
    : [];

  // If walls are missing, synthesize perimeter and dividing walls from rooms
  if (walls.length === 0) {
    let wallSeq = 1;
    for (const r of rooms) {
      const rx2 = r.x + r.width;
      const ry2 = r.y + r.height;
      const corners: [Point, Point][] = [
        [{ x: r.x, y: r.y }, { x: rx2, y: r.y }],
        [{ x: rx2, y: r.y }, { x: rx2, y: ry2 }],
        [{ x: rx2, y: ry2 }, { x: r.x, y: ry2 }],
        [{ x: r.x, y: ry2 }, { x: r.x, y: r.y }],
      ];
      for (const [p1, p2] of corners) {
        walls.push({
          id: `wall_${floor.id}_${wallSeq++}`,
          floorId: floor.id,
          startPoint: p1,
          endPoint: p2,
          thickness: 230,
          type: WallType.Internal,
          wallUse: 'INTERNAL_PARTITION',
          roomIds: [r.id],
          hasOpening: false,
          loadBearing: true,
        });
      }
    }
  }

  const wallMap = new Map<string, Wall>();
  for (const w of walls) {
    wallMap.set(w.id, w);
  }

  // Track intervals per wall
  const wallIntervals = new Map<string, OpeningInterval[]>();
  for (const w of walls) {
    wallIntervals.set(w.id, []);
  }

  const doors: Door[] = [];
  const windows: Window[] = [];

  // Helper to record existing openings
  for (const d of floor.doors ?? []) {
    const hw = wallMap.get(d.wallId);
    if (hw) {
      const len = dist(hw.startPoint, hw.endPoint);
      const dx = (hw.endPoint.x - hw.startPoint.x) / (len || 1);
      const dy = (hw.endPoint.y - hw.startPoint.y) / (len || 1);
      const dpx = d.position?.x ?? hw.startPoint.x;
      const dpy = d.position?.y ?? hw.startPoint.y;
      const s = (dpx - hw.startPoint.x) * dx + (dpy - hw.startPoint.y) * dy;
      const wMm = d.width || 900;
      wallIntervals.get(hw.id)?.push({
        start: s - wMm / 2,
        end: s + wMm / 2,
        type: 'door',
        id: d.id,
      });
      doors.push(d);
    }
  }

  for (const win of floor.windows ?? []) {
    const hw = wallMap.get(win.wallId);
    if (hw) {
      const len = dist(hw.startPoint, hw.endPoint);
      const dx = (hw.endPoint.x - hw.startPoint.x) / (len || 1);
      const dy = (hw.endPoint.y - hw.startPoint.y) / (len || 1);
      const wpx = win.position?.x ?? hw.startPoint.x;
      const wpy = win.position?.y ?? hw.startPoint.y;
      const s = (wpx - hw.startPoint.x) * dx + (wpy - hw.startPoint.y) * dy;
      const wMm = win.width || 1200;
      wallIntervals.get(hw.id)?.push({
        start: s - wMm / 2,
        end: s + wMm / 2,
        type: 'window',
        id: win.id,
      });
      windows.push(win);
    }
  }

  let doorSeq = doors.length + 1;
  let winSeq = windows.length + 1;

  // 1. Group rooms by unit (or treat entire floor as one unit if no unitId)
  const unitRoomsMap = new Map<string, Room[]>();
  for (const r of rooms) {
    const uId = r.unitId || 'default-unit';
    if (!unitRoomsMap.has(uId)) unitRoomsMap.set(uId, []);
    unitRoomsMap.get(uId)!.push(r);
  }

  let newlyAddedDoors = 0;
  let newlyAddedWindows = 0;

  for (const [_unitId, unitRooms] of unitRoomsMap.entries()) {
    // A. Identify Entrance Room
    const entranceRoom = unitRooms.find(r =>
      r.type === RoomType.Living ||
      r.type === RoomType.Foyer ||
      r.type === RoomType.Drawing ||
      r.name.toLowerCase().includes('living') ||
      r.name.toLowerCase().includes('foyer')
    ) ?? unitRooms[0]!;

    // Check if entrance room already has an exterior/entrance door
    const hasExternalDoor = doors.some(d =>
      d.connectsRooms?.includes(entranceRoom.id) &&
      (d.connectsRooms.includes('__outside__') || d.connectsRooms.some(rId => rId.includes('corridor') || rId.includes('lobby') || rId.includes('porch')))
    );

    if (!hasExternalDoor) {
      // Find an exterior or corridor-facing wall of the entrance room
      const candidateWalls = walls.filter(w =>
        w.roomIds.includes(entranceRoom.id) &&
        (w.wallUse === 'EXTERNAL' || w.wallUse === 'COMMON_CORRIDOR' || w.type === WallType.External || w.roomIds.length === 1)
      );

      for (const w of candidateWalls) {
        const wallLen = dist(w.startPoint, w.endPoint);
        const doorWidth = wallLen >= 2000 ? 1050 : 900;
        const intervals = wallIntervals.get(w.id) ?? [];
        const offset = findOpeningOffset(wallLen, doorWidth, intervals, 0.4);
        if (offset !== null) {
          const dx = (w.endPoint.x - w.startPoint.x) / wallLen;
          const dy = (w.endPoint.y - w.startPoint.y) / wallLen;
          const posX = snap(w.startPoint.x + offset * dx);
          const posY = snap(w.startPoint.y + offset * dy);

          const catalogItem = DOOR_CATALOG.find(c => c.category === 'main_entry_single')!;
          const newDoor: Door = {
            id: `door_main_${floor.id}_${entranceRoom.id}_${doorSeq++}`,
            floorId: floor.id,
            wallId: w.id,
            position: { x: posX, y: posY },
            width: catalogItem.defaultWidthMm,
            height: catalogItem.defaultHeightMm,
            type: catalogItem.type,
            swingDirection: SwingDirection.Inward,
            connectsRooms: ['__outside__', entranceRoom.id],
            category: catalogItem.category,
            placement: 'exterior',
            leafCount: catalogItem.leafCount,
            styleId: catalogItem.styleId,
            style: 'solid_timber',
          };

          doors.push(newDoor);
          intervals.push({
            start: offset - catalogItem.defaultWidthMm / 2,
            end: offset + catalogItem.defaultWidthMm / 2,
            type: 'door',
            id: newDoor.id,
          });
          (w as any).hasOpening = true;
          newlyAddedDoors++;
          break;
        }
      }
    }

    // B. Build Reachability Graph via BFS to ensure 100% reachable rooms
    const connectedRoomIds = new Set<string>();
    connectedRoomIds.add(entranceRoom.id);

    // Seed with existing internal doors
    for (const d of doors) {
      if (d.connectsRooms && d.connectsRooms.length >= 2) {
        const [r1, r2] = d.connectsRooms;
        if (unitRooms.some(r => r.id === r1) && unitRooms.some(r => r.id === r2)) {
          if (connectedRoomIds.has(r1)) connectedRoomIds.add(r2);
          if (connectedRoomIds.has(r2)) connectedRoomIds.add(r1);
        }
      }
    }

    // BFS queue
    const queue = Array.from(connectedRoomIds);
    let queueIdx = 0;

    while (queueIdx < queue.length) {
      const currentRoomId = queue[queueIdx++]!;
      const currentRoom = unitRooms.find(r => r.id === currentRoomId);
      if (!currentRoom) continue;

      for (const targetRoom of unitRooms) {
        if (connectedRoomIds.has(targetRoom.id)) continue;

        // Connectivity Rules:
        // Attached bathroom must only connect to its owner bedroom
        if (targetRoom.type === RoomType.Bathroom) {
          const isAttached = targetRoom.bathroomAccessClass === 'ATTACHED' ||
            targetRoom.name.toLowerCase().includes('attached') ||
            targetRoom.name.toLowerCase().includes('ensuite');
          if (isAttached && targetRoom.bathroomOwnerRoomId && targetRoom.bathroomOwnerRoomId !== currentRoom.id) {
            continue;
          }
        }
        // Balcony connects to host room (Living or Bedroom)
        if (targetRoom.type === RoomType.Balcony) {
          if (currentRoom.type !== RoomType.Living && currentRoom.type !== RoomType.Bedroom) {
            continue;
          }
        }

        // Check if currentRoom and targetRoom share a wall with length >= 950mm
        const sharedWall = walls.find(w =>
          w.roomIds.includes(currentRoom.id) &&
          w.roomIds.includes(targetRoom.id) &&
          dist(w.startPoint, w.endPoint) >= 950
        );

        if (sharedWall) {
          const wallLen = dist(sharedWall.startPoint, sharedWall.endPoint);
          const intervals = wallIntervals.get(sharedWall.id) ?? [];

          // Choose door category & dimensions
          let category: DoorCategory = 'bedroom_hinged';
          let doorWidth = 900;
          let doorType = DoorType.Single;
          let leafCount = 1;
          let styleId: any = 'FLUSH_TIMBER';

          if (targetRoom.type === RoomType.Bathroom) {
            category = 'bathroom_flush';
            doorWidth = 750;
          } else if (targetRoom.type === RoomType.Balcony) {
            category = 'balcony_sliding_glass';
            doorWidth = wallLen >= 2000 ? 1800 : Math.max(1200, Math.round(wallLen - 300));
            doorType = DoorType.Sliding;
            leafCount = 2;
            styleId = 'SLIDING_UPVC';
          } else if (targetRoom.type === RoomType.Kitchen) {
            category = wallLen >= 1600 ? 'cased_archway' : 'bedroom_hinged';
            doorWidth = wallLen >= 1600 ? 1200 : 900;
            doorType = wallLen >= 1600 ? DoorType.OpenPassage : DoorType.Single;
            leafCount = wallLen >= 1600 ? 0 : 1;
          }

          const offset = findOpeningOffset(wallLen, doorWidth, intervals, 0.5);
          if (offset !== null) {
            const dx = (sharedWall.endPoint.x - sharedWall.startPoint.x) / wallLen;
            const dy = (sharedWall.endPoint.y - sharedWall.startPoint.y) / wallLen;
            const posX = snap(sharedWall.startPoint.x + offset * dx);
            const posY = snap(sharedWall.startPoint.y + offset * dy);

            const newDoor: Door = {
              id: `door_${floor.id}_${currentRoom.id}_${targetRoom.id}_${doorSeq++}`,
              floorId: floor.id,
              wallId: sharedWall.id,
              position: { x: posX, y: posY },
              width: doorWidth,
              height: 2100,
              type: doorType,
              swingDirection: SwingDirection.Inward,
              connectsRooms: [currentRoom.id, targetRoom.id],
              category,
              placement: targetRoom.type === RoomType.Balcony ? 'exterior' : 'interior',
              leafCount,
              styleId,
              style: category,
            };

            doors.push(newDoor);
            intervals.push({
              start: offset - doorWidth / 2,
              end: offset + doorWidth / 2,
              type: 'door',
              id: newDoor.id,
            });
            (sharedWall as any).hasOpening = true;
            newlyAddedDoors++;
            connectedRoomIds.add(targetRoom.id);
            queue.push(targetRoom.id);
          }
        }
      }
    }

    // Safety sweep: connect any remaining unconnected rooms to any adjacent room
    for (const r of unitRooms) {
      if (connectedRoomIds.has(r.id) || r.type === RoomType.ServiceShaft) continue;

      // Find any wall belonging to this room that connects to ANY room in unit
      const candidateSharedWall = walls.find(w =>
        w.roomIds.includes(r.id) &&
        w.roomIds.some(otherId => otherId !== r.id && connectedRoomIds.has(otherId)) &&
        dist(w.startPoint, w.endPoint) >= 900
      );

      if (candidateSharedWall) {
        const wallLen = dist(candidateSharedWall.startPoint, candidateSharedWall.endPoint);
        const intervals = wallIntervals.get(candidateSharedWall.id) ?? [];
        const otherRoomId = candidateSharedWall.roomIds.find(id => id !== r.id && connectedRoomIds.has(id))!;
        const doorWidth = r.type === RoomType.Bathroom ? 750 : 900;
        const offset = findOpeningOffset(wallLen, doorWidth, intervals, 0.5);

        if (offset !== null) {
          const dx = (candidateSharedWall.endPoint.x - candidateSharedWall.startPoint.x) / wallLen;
          const dy = (candidateSharedWall.endPoint.y - candidateSharedWall.startPoint.y) / wallLen;
          const posX = snap(candidateSharedWall.startPoint.x + offset * dx);
          const posY = snap(candidateSharedWall.startPoint.y + offset * dy);

          const newDoor: Door = {
            id: `door_${floor.id}_${r.id}_${otherRoomId}_${doorSeq++}`,
            floorId: floor.id,
            wallId: candidateSharedWall.id,
            position: { x: posX, y: posY },
            width: doorWidth,
            height: 2100,
            type: DoorType.Single,
            swingDirection: SwingDirection.Inward,
            connectsRooms: [otherRoomId, r.id],
            category: r.type === RoomType.Bathroom ? 'bathroom_flush' : 'bedroom_hinged',
            placement: 'interior',
            leafCount: 1,
            styleId: 'FLUSH_TIMBER',
          };

          doors.push(newDoor);
          intervals.push({
            start: offset - doorWidth / 2,
            end: offset + doorWidth / 2,
            type: 'door',
            id: newDoor.id,
          });
          (candidateSharedWall as any).hasOpening = true;
          newlyAddedDoors++;
          connectedRoomIds.add(r.id);
        }
      }
    }

    // C. Natural Ventilation & Daylight Windows
    for (const r of unitRooms) {
      if (r.type === RoomType.ServiceShaft || r.type === RoomType.Balcony || r.type === RoomType.Corridor) {
        continue;
      }

      // Check if room already has an exterior-facing window
      const hasVentWindow = windows.some(win => win.roomId === r.id);
      if (hasVentWindow) continue;

      // Find external or shaft-facing wall for this room
      const extWalls = walls.filter(w =>
        w.roomIds.includes(r.id) &&
        (w.wallUse === 'EXTERNAL' || w.type === WallType.External || w.wallUse === 'SHAFT' || w.roomIds.length === 1) &&
        w.wallUse !== 'BALCONY' &&
        w.wallUse !== 'PARAPET'
      );

      for (const hw of extWalls) {
        const wallLen = dist(hw.startPoint, hw.endPoint);
        const intervals = wallIntervals.get(hw.id) ?? [];

        // Determine window category & defaults
        let category: WindowCategory = 'casement_double';
        let winWidth = 1200;
        let winHeight = 1200;
        let sillHeight = 900;
        let winType = WindowType.Casement;
        let leafCount = 2;
        let styleId: any = 'CASEMENT_ALUMINUM';

        if (r.type === RoomType.Living) {
          category = 'sliding_wide';
          winWidth = wallLen >= 2400 ? 1800 : Math.max(1200, Math.round(wallLen - 400));
          winHeight = 1200;
          sillHeight = 900;
          winType = WindowType.Sliding;
          leafCount = 2;
          styleId = 'SLIDING_UPVC';
        } else if (r.type === RoomType.Bathroom) {
          category = 'bath_ventilator';
          winWidth = 600;
          winHeight = 600;
          sillHeight = 1650;
          winType = WindowType.Ventilator;
          leafCount = 1;
          styleId = 'CASEMENT_ALUMINUM';
        } else if (r.type === RoomType.Kitchen) {
          category = 'kitchen_casement';
          winWidth = Math.min(1050, Math.max(800, Math.round(wallLen - 300)));
          winHeight = 1050;
          sillHeight = 1050;
          winType = WindowType.Casement;
          leafCount = 2;
          styleId = 'CASEMENT_ALUMINUM';
        } else {
          // Bedrooms & other habitable rooms
          category = 'casement_double';
          winWidth = Math.min(1200, Math.max(900, Math.round(wallLen - 300)));
          winHeight = 1200;
          sillHeight = 900;
          winType = WindowType.Casement;
          leafCount = 2;
          styleId = 'CASEMENT_ALUMINUM';
        }

        const offset = findOpeningOffset(wallLen, winWidth, intervals, 0.5);
        if (offset !== null) {
          const dx = (hw.endPoint.x - hw.startPoint.x) / wallLen;
          const dy = (hw.endPoint.y - hw.startPoint.y) / wallLen;
          const posX = snap(hw.startPoint.x + offset * dx);
          const posY = snap(hw.startPoint.y + offset * dy);

          const newWindow: Window = {
            id: `win_${floor.id}_${r.id}_${winSeq++}`,
            floorId: floor.id,
            wallId: hw.id,
            position: { x: posX, y: posY },
            width: winWidth,
            height: winHeight,
            sillHeight,
            sillHeightMm: sillHeight,
            type: winType,
            roomId: r.id,
            category,
            placement: 'exterior',
            leafCount,
            styleId,
            style: category,
          };

          windows.push(newWindow);
          intervals.push({
            start: offset - winWidth / 2,
            end: offset + winWidth / 2,
            type: 'window',
            id: newWindow.id,
          });
          (hw as any).hasOpening = true;
          newlyAddedWindows++;
          break; // Satisfied ventilation for this room
        }
      }
    }
  }

  // Count unreached rooms and unventilated rooms
  let doorlessRoomCount = 0;
  let unventilatedRoomCount = 0;

  for (const r of rooms) {
    if (r.type === RoomType.ServiceShaft) continue;
    const hasDoor = doors.some(d => d.connectsRooms?.includes(r.id));
    if (!hasDoor) doorlessRoomCount++;

    if (r.type === RoomType.Living || r.type === RoomType.Bedroom || r.type === RoomType.Kitchen || r.type === RoomType.Bathroom) {
      const hasWindow = windows.some(w => w.roomId === r.id);
      if (!hasWindow) unventilatedRoomCount++;
    }
  }

  const updatedFloor: Floor = {
    ...floor,
    walls,
    doors,
    windows,
  };

  return {
    floor: updatedFloor,
    doorlessRoomCount,
    unventilatedRoomCount,
    synthesizedDoors: newlyAddedDoors,
    synthesizedWindows: newlyAddedWindows,
  };
}

/**
 * Synthesizes openings across all floors in a canonical building.
 */
export function synthesizeBuildingOpenings(building: Building): Building {
  const updatedFloors = building.floors.map(floor => {
    const res = synthesizeFloorOpenings(floor);
    return res.floor;
  });

  return {
    ...building,
    floors: updatedFloors,
  };
}
