/**
 * Builds a complete apartment plan structure from a topology partition.
 *
 * This is the bridge between the topology engine and the existing verified
 * geometry contract. It does NOT reimplement room planning: it reuses
 * `sliceFlatRooms`, the routine that already produces living/dining/kitchen
 * bands, bedroom and bathroom stacks, internal passages, inset bedroom
 * balconies and all the connecting doors.
 *
 * The one thing it adds is orientation. `sliceFlatRooms` assumes the common
 * corridor lies on the flat's east or west side. A topology that enters a flat
 * from the north or south is solved in a transposed local frame and mapped back
 * out, so the room bands genuinely rotate with the plan instead of a north-
 * entered flat being handed an east-entered layout.
 *
 * Because every frame map is a composition of integer translation, reflection
 * and axis swap, an exact tiling in the local frame remains exact in world
 * coordinates, which is what the area ledger requires.
 */

import type { DynamicApartmentManifest, ApartmentBhkType } from '@ai-floor-planner/core';
import {
  createConnectingDoor,
  sliceFlatRooms,
  type Box2D as SnapperBox,
  type RoomSlicingArchetypeId,
} from '../interpretation/space-filling-snapper';
import type { ArchitecturalPlacement } from '../interpretation/architectural-placement';
import type {
  ApartmentCoreElement,
  ApartmentPlanFlat,
  ApartmentPlanOpening,
  ApartmentPlanRoom,
  ApartmentPlanStructure,
} from '../interpretation/apartment-plan';
import type { ExtractedRoom } from '../interpretation/extraction';
import { frameFor, type Box2D } from './rect-frame';
import {
  sharedEdgeLength,
  assignUnitTypesToBoxes,
  type ShaftRole,
  type TopologyPartition,
} from './topology-families';
import type { ArchitecturalProgram } from './architectural-intent';

const asSnapper = (b: Box2D): SnapperBox => ({ x: b.x, y: b.y, w: b.w, h: b.h });
const rectToBox = (r: { x: number; y: number; width: number; height: number }): Box2D =>
  ({ x: r.x, y: r.y, w: r.width, h: r.height });
const boxToRect = (b: Box2D) => ({ x: b.x, y: b.y, width: b.w, height: b.h });

/**
 * Maps the interpreted program onto the `ArchitecturalPlacement` knobs that the
 * existing room slicer understands. The topology itself now carries core and
 * ventilation decisions, so only the in-flat preferences are passed through.
 */
export function placementFromProgram(
  program: ArchitecturalProgram,
  opts?: { staggeredBalconies?: boolean; floorVariant?: 'ODD' | 'EVEN' },
): ArchitecturalPlacement {
  const p = program.preferences;
  return {
    liftSide: p.corePreference === 'EAST' ? 'EAST' : 'WEST',
    otsPlacement: p.ventilationStrategy === 'CENTRAL_COURTYARD' ? 'CENTRAL' : 'SIDE',
    coreCompactness: p.coreCompactness,
    kitchenSize: p.kitchenSize === 'LARGER' ? 'LARGER' : 'STANDARD',
    kitchenStyle: p.kitchenStyle === 'OPEN' ? 'OPEN' : 'ENCLOSED',
    sitoutSize: p.sitoutSize,
    entranceStyle: 'LIVING_FIRST',
    bedroomBalconies: p.bedroomBalconies === 'NONE_REQUESTED' ? 'STANDARD' : 'ALL_BEDROOMS',
    ...(opts?.staggeredBalconies ? { staggeredBalconies: true } : {}),
    ...(opts?.floorVariant ? { floorVariant: opts.floorVariant } : {}),
  };
}

export interface AssembleInput {
  readonly partition: TopologyPartition;
  readonly program: ArchitecturalProgram;
  readonly manifest?: DynamicApartmentManifest;
  readonly unitTypes: readonly ApartmentBhkType[];
  readonly rawRooms?: readonly ExtractedRoom[];
  readonly archetype?: RoomSlicingArchetypeId;
  readonly staggeredBalconies?: boolean;
  readonly floorVariant?: 'ODD' | 'EVEN';
}

export interface AssembledPlan {
  readonly structure: ApartmentPlanStructure;
  /** Flats for which no entrance door could be hosted, by flat id. */
  readonly flatsWithoutEntrance: readonly string[];
}

/**
 * Assembles the canonical plan structure for one typical floor.
 *
 * Returns the flats that could not be given an entrance rather than silently
 * emitting an inaccessible dwelling; the caller decides whether to reject the
 * candidate.
 */
export function assembleStructureFromPartition(input: AssembleInput): AssembledPlan {
  const { partition, program, unitTypes } = input;
  const placement = placementFromProgram(program, {
    staggeredBalconies: input.staggeredBalconies,
    floorVariant: input.floorVariant,
  });
  const env = partition.envelope;
  // Balconies are tested against the FLOOR ENVELOPE, not the built outline.
  //
  // The canonical floor boundary is the envelope, and `generateApartmentWalls`
  // derives an exterior wall from a segment with exactly one owning room. A
  // balcony away from the envelope edge therefore cannot own an exterior wall
  // however the built form is outlined, and `validateApartmentClosure` rejects
  // it. Testing against a tightened outline would let such a balcony through
  // and fail later, at the point where the error is far harder to read.
  const builtFace = env;

  const flats: ApartmentPlanFlat[] = [];
  const openings: ApartmentPlanOpening[] = [];
  const flatsWithoutEntrance: string[] = [];
  const interflatOtsShafts: ApartmentCoreElement[] = [];

  // Spaces a flat may legitimately be entered from.
  const circulation: Array<{ id: string; box: Box2D }> = [
    ...partition.corridorBoxes.map((b, i) => ({ id: `corridor_${i + 1}`, box: b })),
    ...partition.lobbyBoxes.map((b, i) => ({ id: `core_lobby_${i + 1}`, box: b })),
  ];

  const assignedUnitTypes = assignUnitTypesToBoxes(partition.flatBoxes, unitTypes);
  for (let i = 0; i < partition.flatBoxes.length; i++) {
    const worldBox = partition.flatBoxes[i]!;
    const accessEdge = partition.accessEdgeForFlat[i]!;
    const flatId = `flat_0${i + 1}`;
    const flatLabel = `Flat 0${i + 1}`;
    const unitType = (assignedUnitTypes[i] ?? unitTypes[i] ?? '2BHK') as ApartmentBhkType;

    // The circulation space this flat actually shares the most wall with; that
    // is the one its entrance can be hosted on.
    const entry = circulation
      .map(c => ({ c, shared: sharedEdgeLength(worldBox, c.box) }))
      .sort((a, b) => b.shared - a.shared)[0];

    // Solve in a local frame where the occupant enters from the local east, so
    // the slicer's corridor-on-east assumption holds for every access edge.
    const frame = frameFor(worldBox, accessEdge);
    const localFlat: Box2D = { x: 0, y: 0, w: frame.localW, h: frame.localH };

    // The corridor's local stand-in: a strip immediately beyond the local east
    // edge, spanning exactly the part of the wall the real corridor touches.
    const localCorridor = entry && entry.shared > 0
      ? localCorridorStrip(frame, worldBox, entry.c.box)
      : { x: localFlat.w, y: 0, w: 1500, h: localFlat.h };

    // The slicer puts the service band — sit-out, utility, kitchen — at one end
    // of the flat, choosing the end from `box.y > envelope.y`. It must land on
    // an end that is genuinely on the building's exterior face, or the sit-out
    // it contains has no exterior wall and is not a balcony at all.
    //
    // So the local envelope is extended past whichever local end is NOT
    // exterior in world terms. That makes the slicer see the flat as sitting
    // against the exterior end, and the band goes where the facade is.
    const localEnvelope = serviceBandEnvelope(frame, worldBox, localFlat, builtFace);

    const sliced = sliceFlatRooms({
      flatId,
      flatLabel,
      unitType,
      box: asSnapper(localFlat),
      corridorIsEast: true,
      rawRooms: input.rawRooms ?? [],
      corridorBox: asSnapper(localCorridor),
      envelope: asSnapper(localEnvelope),
      placement,
      archetype: input.archetype,
    });

    // Carry rooms back into world coordinates.
    const worldRooms: ApartmentPlanRoom[] = sliced.rooms.map(room => ({
      ...room,
      rect: boxToRect(frame.toWorld(rectToBox(room.rect))),
    }));

    // Drop any balcony that does not reach a real exterior face of the building.
    //
    // The slicer places the service band (sit-out, utility, kitchen) at one end
    // of the flat and carves bedroom balconies out of its side walls. In the
    // LOCAL frame those faces all look exterior. In world terms some of them
    // face the corridor, a neighbouring flat or the core, and a balcony there
    // is not a balcony: the canonical model requires a balcony to own an
    // exterior wall, and `validateApartmentClosure` rejects one that does not.
    //
    // Touching the outline rectangle is necessary but NOT sufficient. In a
    // two-row arrangement the inner flats also reach the outline along the row
    // boundary, where their balcony abuts the neighbouring flat rather than the
    // outside. So the test is directional: the balcony must lie against the
    // specific outline face it projects from.
    const balconyIds = new Set([
      ...worldRooms.filter(r => r.type === 'bedroom').map(r => `${r.id}__balcony`),
      `${flatId}__balcony`,
      `${flatId}__utility`,
    ]);
    const keptRooms = worldRooms.filter(room => {
      if (!balconyIds.has(room.id)) return true;
      return projectsToOutsideFace(rectToBox(room.rect), worldBox, builtFace);
    });

    // When a flat's Sit-out Balcony sits on an interior party wall (between
    // adjacent flats) instead of an exterior facade, carve a 5' x 6' (1600 x
    // 1830 mm) Open-To-Sky ventilation shaft directly beside the Sit-out
    // Balcony so natural light and cross-air reach both adjacent flats and
    // the Sit-out remains an open-air balcony instead of an enclosed room.
    const droppedRaw = worldRooms.filter(r => !keptRooms.includes(r));
    const carvedInterflat = carveInterflatOtsForDroppedSitout(
      flatId,
      i,
      keptRooms,
      droppedRaw,
    );
    if (carvedInterflat.otsShaft) {
      interflatOtsShafts.push(carvedInterflat.otsShaft);
    }

    // Re-absorb any dropped balcony into its bedroom so the flat still tiles
    // exactly; an unassigned sliver would fail the area ledger.
    const finalRooms = carvedInterflat.droppedRemaining.length
      ? reabsorbDropped(carvedInterflat.keptRooms, carvedInterflat.droppedRemaining)
      : carvedInterflat.keptRooms;

    // Rebuild in-flat openings in world space AFTER finalRooms are settled so
    // kept Sit-out Balconies preserve their wide sliding doors and dropped rooms
    // leave zero dangling wall/opening references.
    for (const opening of sliced.flatOpenings) {
      if (opening.isFlatEntrance) continue; // entrance is placed below
      const [aId, bId] = opening.connects ?? [];
      const a = finalRooms.find(r => r.id === aId);
      const b = finalRooms.find(r => r.id === bId);
      if (!a || !b) continue;
      const rebuilt = createConnectingDoor(
        opening.id,
        { id: a.id, rect: a.rect },
        { id: b.id, rect: b.rect },
        Math.max(opening.rect.width, opening.rect.height),
        { doorType: opening.doorType, swingDirection: opening.swingDirection },
      );
      if (rebuilt) openings.push(rebuilt);
    }

    // Flat entrance: hosted on the real shared wall with the real corridor.
    if (entry && entry.shared > 0) {
      const target =
        finalRooms.find(r => r.type === 'living' && sharedEdgeLength(rectToBox(r.rect), entry.c.box) >= 1250)
        ?? finalRooms.find(r => r.type === 'foyer' && sharedEdgeLength(rectToBox(r.rect), entry.c.box) >= 1250)
        ?? finalRooms.find(r => r.type === 'dining' && sharedEdgeLength(rectToBox(r.rect), entry.c.box) >= 1250);

      const door = target
        ? createConnectingDoor(
            `${flatId}__door_entrance`,
            { id: entry.c.id, rect: boxToRect(entry.c.box) },
            { id: target.id, rect: target.rect },
            1050,
            { isFlatEntrance: true },
          )
        : null;

      if (door) openings.push(door);
      else flatsWithoutEntrance.push(flatId);
    } else {
      flatsWithoutEntrance.push(flatId);
    }

    flats.push({
      id: flatId,
      label: flatLabel,
      unitType,
      rect: boxToRect(worldBox),
      rooms: finalRooms,
    });
  }

  // Ensure multi-flat floors (>= 2 flats) without an existing internal OTS void
  // or explicit area target have an Inter-Flat O.T.S. ventilation court + plumbing shaft.
  const hasExistingInternalOts = partition.shaftRoles.some(
    (role, idx) => role === 'OPEN_TO_SKY_VOID' && !partition.shaftTags?.[idx]?.includes('recess:perimeter'),
  );
  if (
    flats.length >= 2 &&
    interflatOtsShafts.length === 0 &&
    !hasExistingInternalOts &&
    !program.mandatory.targetAreaSqFt &&
    (!partition.massingShape || partition.massingShape === 'COMPACT_DOUBLE_LOADED') &&
    program.mandatory.ventilationStrategy !== 'PERIMETER_ONLY'
  ) {
    const extraPartyShafts: ApartmentCoreElement[] = [];
    const seenEdges = new Set<string>();
    for (let i = 0; i < flats.length; i++) {
      for (let j = i + 1; j < flats.length; j++) {
        const fA = flats[i]!;
        const fB = flats[j]!;
        const shareHorizontal =
          (Math.abs(fA.rect.y + fA.rect.height - fB.rect.y) <= 2 ||
            Math.abs(fB.rect.y + fB.rect.height - fA.rect.y) <= 2) &&
          Math.min(fA.rect.x + fA.rect.width, fB.rect.x + fB.rect.width) -
            Math.max(fA.rect.x, fB.rect.x) >=
            4800;
        if (!shareHorizontal) continue;

        const yParty =
          Math.abs(fA.rect.y + fA.rect.height - fB.rect.y) <= 2
            ? fB.rect.y
            : fA.rect.y;
        const partyKey = `${Math.round(Math.max(fA.rect.x, fB.rect.x))}:${Math.round(yParty)}`;
        if (seenEdges.has(partyKey)) continue;

        const carveH = 1300;
        const halfCarve = 650;
        const canTrim = (room: ApartmentPlanRoom, stripY: number, stripH: number): boolean => {
          if (room.type !== 'bedroom') return false;
          if (room.rect.height - stripH < 3000 || room.rect.width < 2600) return false;
          return !openings.some((op) => {
            if (!op.connects?.includes(room.id)) return false;
            return Math.min(op.rect.y + op.rect.height, stripY + stripH) > Math.max(op.rect.y, stripY);
          });
        };

        // Strategy A: Symmetrically carve 650mm from Flat i's bedroom + 650mm from Flat j's aligned bedroom
        let carved = false;
        const flatA = flats[i]!;
        const flatB = flats[j]!;
        for (let rAIdx = 0; rAIdx < flatA.rooms.length && !carved; rAIdx++) {
          const rA = flatA.rooms[rAIdx]!;
          const aOnTop = Math.abs(rA.rect.y + rA.rect.height - yParty) <= 2;
          const aOnBot = Math.abs(rA.rect.y - yParty) <= 2;
          if (!aOnTop && !aOnBot) continue;
          const touchesLeftExt = Math.abs(rA.rect.x - builtFace.x) <= 2;
          const touchesRightExt = Math.abs(rA.rect.x + rA.rect.width - (builtFace.x + builtFace.w)) <= 2;
          if (!touchesLeftExt && !touchesRightExt) continue;

          const rBIdx = flatB.rooms.findIndex(
            (rb) =>
              rb.type === 'bedroom' &&
              Math.abs(rb.rect.x - rA.rect.x) <= 20 &&
              Math.abs(rb.rect.width - rA.rect.width) <= 20 &&
              (aOnTop ? Math.abs(rb.rect.y - yParty) <= 2 : Math.abs(rb.rect.y + rb.rect.height - yParty) <= 2),
          );
          if (rBIdx < 0) continue;
          const rB = flatB.rooms[rBIdx]!;
          const cutYA = aOnTop ? yParty - halfCarve : yParty;
          const cutYB = aOnTop ? yParty : yParty - halfCarve;
          if (!canTrim(rA, cutYA, halfCarve) || !canTrim(rB, cutYB, halfCarve)) continue;

          const nextRoomsA = [...flatA.rooms];
          nextRoomsA[rAIdx] = {
            ...rA,
            rect: {
              ...rA.rect,
              y: aOnTop ? rA.rect.y : rA.rect.y + halfCarve,
              height: rA.rect.height - halfCarve,
            },
          };
          const nextRoomsB = [...flatB.rooms];
          nextRoomsB[rBIdx] = {
            ...rB,
            rect: {
              ...rB.rect,
              y: aOnTop ? rB.rect.y + halfCarve : rB.rect.y,
              height: rB.rect.height - halfCarve,
            },
          };
          flats[i] = { ...flatA, rooms: nextRoomsA };
          flats[j] = { ...flatB, rooms: nextRoomsB };

          const bandX = Math.max(rA.rect.x, rB.rect.x);
          const bandW = Math.min(rA.rect.x + rA.rect.width, rB.rect.x + rB.rect.width) - bandX;
          const plumbW = bandW >= 3500 ? 900 : 0;
          const otsW = bandW - plumbW;
          const otsX = touchesLeftExt ? bandX : bandX + plumbW;
          interflatOtsShafts.push({
            id: `core_shaft_interflat_${interflatOtsShafts.length + 1}`,
            architecturalRole: 'OPEN_TO_SKY_VOID',
            name: 'Inter-Flat Ventilation OTS Shaft',
            rect: { x: otsX, y: yParty - halfCarve, width: otsW, height: carveH },
            tags: ['shaft:ots', 'shaft:interflat'],
            assignedFlatId: null,
          });
          if (plumbW >= 900) {
            const plumbX = touchesLeftExt ? bandX + otsW : bandX;
            extraPartyShafts.push({
              id: `core_plumb_shaft_${extraPartyShafts.length + 1}`,
              architecturalRole: 'SERVICE_SHAFT',
              name: `Plumbing Shaft PS${extraPartyShafts.length + 1}`,
              rect: { x: plumbX, y: yParty - halfCarve, width: plumbW, height: carveH },
              tags: ['shaft:plumbing', 'shaft:interflat'],
              assignedFlatId: null,
            });
          }
          carved = true;
        }

        // Strategy B: Fallback single-room carve if room height >= 4300mm
        const tryCarveRoom = (flatIdx: number): boolean => {
          const flat = flats[flatIdx]!;
          for (let rIdx = 0; rIdx < flat.rooms.length; rIdx++) {
            const room = flat.rooms[rIdx]!;
            const r = room.rect;
            const touchesPartyBottom = Math.abs(r.y + r.height - yParty) <= 2;
            const touchesPartyTop = Math.abs(r.y - yParty) <= 2;
            if (!touchesPartyBottom && !touchesPartyTop) continue;
            const touchesLeftExt = Math.abs(r.x - builtFace.x) <= 2;
            const touchesRightExt = Math.abs(r.x + r.width - (builtFace.x + builtFace.w)) <= 2;
            if (!touchesLeftExt && !touchesRightExt) continue;
            const cutY = touchesPartyBottom ? r.y + r.height - carveH : r.y;
            if (!canTrim(room, cutY, carveH)) continue;

            const updatedRoom: ApartmentPlanRoom = {
              ...room,
              rect: {
                ...r,
                y: touchesPartyTop ? r.y + carveH : r.y,
                height: r.height - carveH,
              },
            };
            const mutableRooms = [...flat.rooms];
            mutableRooms[rIdx] = updatedRoom;
            flats[flatIdx] = { ...flat, rooms: mutableRooms };

            const plumbW = r.width >= 3500 ? 900 : 0;
            const otsW = r.width - plumbW;
            const otsX = touchesLeftExt ? r.x : r.x + plumbW;

            interflatOtsShafts.push({
              id: `core_shaft_interflat_${interflatOtsShafts.length + 1}`,
              architecturalRole: 'OPEN_TO_SKY_VOID',
              name: 'Inter-Flat Ventilation OTS Shaft',
              rect: { x: otsX, y: cutY, width: otsW, height: carveH },
              tags: ['shaft:ots', 'shaft:interflat'],
              assignedFlatId: null,
            });
            if (plumbW >= 900) {
              const plumbX = touchesLeftExt ? r.x + otsW : r.x;
              extraPartyShafts.push({
                id: `core_plumb_shaft_${extraPartyShafts.length + 1}`,
                architecturalRole: 'SERVICE_SHAFT',
                name: `Plumbing Shaft PS${extraPartyShafts.length + 1}`,
                rect: { x: plumbX, y: cutY, width: plumbW, height: carveH },
                tags: ['shaft:plumbing', 'shaft:interflat'],
                assignedFlatId: null,
              });
            }
            return true;
          }
          return false;
        };

        if (carved || tryCarveRoom(i) || tryCarveRoom(j)) {
          seenEdges.add(partyKey);
        }
      }
    }
    if (extraPartyShafts.length > 0) {
      interflatOtsShafts.push(...extraPartyShafts);
    }
  }

  // ── Core elements and their circulation graph ──────────────────────────────
  const lifts: ApartmentCoreElement[] = partition.liftBoxes.map((b, i) => ({
    id: `core_lift_${i + 1}`,
    name: `Passenger Lift 0${i + 1}`,
    rect: boxToRect(b),
    assignedFlatId: null,
  }));

  const stairs: ApartmentCoreElement[] = partition.stairBoxes.map((b, i) => ({
    id: `core_stair_${i + 1}`,
    name: i === 0 ? 'Main Fire Staircase' : `Fire Staircase 0${i + 1}`,
    rect: boxToRect(b),
    assignedFlatId: null,
  }));

  const lobbies: ApartmentCoreElement[] = partition.lobbyBoxes.map((b, i) => ({
    id: `core_lobby_${i + 1}`,
    name: partition.lobbyBoxes.length > 1 ? `Lift Lobby 0${i + 1}` : 'Common Lift Lobby',
    rect: boxToRect(b),
    assignedFlatId: null,
  }));

  const corridors: ApartmentCoreElement[] = partition.corridorBoxes.map((b, i) => ({
    id: `corridor_${i + 1}`,
    name: partition.corridorBoxes.length > 1 ? `Common Circulation 0${i + 1}` : 'Common Circulation Spine',
    rect: boxToRect(b),
    assignedFlatId: null,
  }));

  const baseShafts: ApartmentCoreElement[] = partition.shaftBoxes.map((b, i) => {
    const role: ShaftRole = partition.shaftRoles[i] ?? 'SERVICE_SHAFT';
    const tags = partition.shaftTags?.[i];
    const isPerimeterRecess = tags?.includes('recess:perimeter');
    return {
      id: `core_shaft_${i + 1}`,
      architecturalRole: role,
      name: isPerimeterRecess
        ? 'Perimeter Courtyard Setback Recess'
        : role === 'OPEN_TO_SKY_VOID'
          ? 'Open-to-Sky Court / Light and Air Void'
          : `MEP / Plumbing Duct 0${i + 1}`,
      rect: boxToRect(b),
      ...(tags ? { tags } : {}),
      assignedFlatId: null,
    };
  });
  const shafts: ApartmentCoreElement[] = [...baseShafts, ...interflatOtsShafts];

  // Every common/core space must be door-connected, or the closure validator
  // reports a stranded core. Connect each stair and lift to the circulation
  // space it actually shares the most wall with, and chain the circulation.
  const circulationElements = [...corridors, ...lobbies];

  const connectToCirculation = (
    element: ApartmentCoreElement,
    width: number,
    doorType: string,
  ): void => {
    const best = circulationElements
      .map(c => ({ c, shared: sharedEdgeLength(rectToBox(element.rect), rectToBox(c.rect)) }))
      .sort((a, b) => b.shared - a.shared)[0];
    if (!best || best.shared <= 0) return;
    const door = createConnectingDoor(
      `door_${element.id}`,
      { id: best.c.id, rect: best.c.rect },
      { id: element.id, rect: element.rect },
      width,
      { doorType },
    );
    if (door) openings.push(door);
  };

  for (const stair of stairs) connectToCirculation(stair, 1200, 'open_passage');
  for (const lift of lifts) connectToCirculation(lift, 900, 'sliding');

  // Chain circulation spaces to each other so the whole common network is one
  // connected component (two corridors flanking a court, split-core lobbies).
  for (let i = 0; i < circulationElements.length; i++) {
    for (let j = i + 1; j < circulationElements.length; j++) {
      const a = circulationElements[i]!;
      const b = circulationElements[j]!;
      if (sharedEdgeLength(rectToBox(a.rect), rectToBox(b.rect)) < 1500) continue;
      const door = createConnectingDoor(
        `door_link_${a.id}_${b.id}`,
        { id: a.id, rect: a.rect },
        { id: b.id, rect: b.rect },
        1500,
        { doorType: 'open_passage' },
      );
      if (door) openings.push(door);
    }
  }

  const boundary = [
    { x: env.x, y: env.y },
    { x: env.x + env.w, y: env.y },
    { x: env.x + env.w, y: env.y + env.h },
    { x: env.x, y: env.y + env.h },
  ];

  return {
    structure: {
      source: 'DETERMINISTIC_SCHEMATIC',
      boundary,
      flats,
      commonRooms: [],
      ungroupedRooms: [],
      lifts,
      stairs,
      lobbies,
      corridors,
      shafts,
      openings,
    },
    flatsWithoutEntrance,
  };
}

/**
 * The local envelope to hand the slicer so its service band lands on a face
 * that is genuinely exterior.
 *
 * The slicer decides which end of the flat carries the service band — sit-out,
 * utility and kitchen — from `box.y > envelope.y + 100`: flush with the
 * envelope's low edge means the band goes low, otherwise it goes high. Passing
 * the flat as its own envelope always reads as flush, so the band always lands
 * at local y = 0, whether or not that end faces the outside world.
 *
 * This resolves which local end is exterior in WORLD terms and, when it is the
 * high end, returns an envelope extended past the low end. The flat then reads
 * as "not flush", the band moves to the high end, and the sit-out gets the
 * exterior wall it needs.
 */
function serviceBandEnvelope(
  frame: ReturnType<typeof frameFor>,
  worldFlat: Box2D,
  localFlat: Box2D,
  builtFace: Box2D,
): Box2D {
  // Local y = 0 and local y = localH map to two opposite world faces of the
  // flat. Work out which of them is on the outside of the building.
  const lowStrip = frame.toWorld({ x: 0, y: 0, w: frame.localW, h: 10 });
  const highStrip = frame.toWorld({ x: 0, y: frame.localH - 10, w: frame.localW, h: 10 });

  const lowIsExterior = onEnvelopeEdge(lowStrip, builtFace);
  const highIsExterior = onEnvelopeEdge(highStrip, builtFace);

  // Flats in the middle of a row have neither end on the outside: both their
  // short faces are party walls with the next flat. The service band cannot
  // reach a facade along that axis at all, so the sit-out it carries would have
  // no exterior wall wherever it is put.
  //
  // In that case the band is steered to the end facing AWAY from the entrance.
  // The sit-out there is still an interior room and is relabelled downstream,
  // but it keeps the living room between the entrance and the bedrooms, which
  // is what "living-first" asks for; putting the band on the entrance end would
  // also block the front door.
  if (!lowIsExterior && !highIsExterior) {
    // Local east is the entrance side, and the band runs across the local y
    // axis, so neither end is the entrance: leave the default.
    void worldFlat;
    return localFlat;
  }

  // Low end exterior: leave it flush so the band goes low.
  if (lowIsExterior) return localFlat;

  // Only the high end is exterior: extend the envelope past the low end so the
  // flat no longer reads as flush and the band moves to the high end.
  return { x: localFlat.x, y: localFlat.y - 1000, w: localFlat.w, h: localFlat.h + 1000 };
}

/**
 * True when a balcony actually projects onto the outside of the building.
 *
 * Touching the built outline is not enough. A balcony carved from a flat's side
 * wall lies against one FACE of that flat, and in a two-row arrangement the
 * inner flats also reach the outline along the row boundary — where the balcony
 * abuts the neighbouring flat, not the outside. So the face the balcony sits on
 * is identified first, then checked against the corresponding outline face.
 */
function projectsToOutsideFace(
  balcony: Box2D,
  flat: Box2D,
  outline: Box2D,
): boolean {
  const near = (a: number, b: number) => Math.abs(a - b) <= 1;

  // A corner balcony can touch two faces. An internal first face must not
  // hide a genuinely exposed second face.
  return (near(balcony.x, flat.x) && near(outline.x, balcony.x))
    || (near(balcony.x + balcony.w, flat.x + flat.w)
      && near(outline.x + outline.w, balcony.x + balcony.w))
    || (near(balcony.y, flat.y) && near(outline.y, balcony.y))
    || (near(balcony.y + balcony.h, flat.y + flat.h)
      && near(outline.y + outline.h, balcony.y + balcony.h));
}

/**
 * The local-frame strip standing in for the real corridor: it sits just beyond
 * the flat's local east edge and spans exactly the overlap the real corridor
 * has with the real flat wall, so the slicer places the entrance where a door
 * can genuinely be hosted.
 */
function localCorridorStrip(
  frame: ReturnType<typeof frameFor>,
  worldFlat: Box2D,
  worldCorridor: Box2D,
): Box2D {
  const local = frame.toLocal(worldCorridor);
  const lo = Math.max(0, Math.min(local.y, frame.localH));
  const hi = Math.max(lo, Math.min(local.y + local.h, frame.localH));
  void worldFlat;
  return { x: frame.localW, y: lo, w: Math.max(1500, local.w), h: Math.max(0, hi - lo) };
}

/** True when a face strip actually lies along an outer boundary of the buildable envelope. */
function onEnvelopeEdge(box: Box2D, env: Box2D): boolean {
  if (box.w >= box.h) {
    return Math.abs(box.y - env.y) <= 1 || Math.abs(box.y + box.h - (env.y + env.h)) <= 1;
  } else {
    return Math.abs(box.x - env.x) <= 1 || Math.abs(box.x + box.w - (env.x + env.w)) <= 1;
  }
}

/**
 * Reclaims the area of a balcony that could not keep its exterior wall.
 *
 * The flat must still tile exactly — an unassigned sliver fails the area ledger
 * — so the area has to go somewhere. Preference order:
 *
 * 1. Grow an edge-sharing neighbour over it, which is what an architect would
 *    do: the room next door simply gets deeper.
 * 2. Failing that, keep the rectangle but RELABEL it as interior floor area.
 *    Restoring it as a balcony would put back the very room that has no
 *    exterior wall, and the canonical model rejects that.
 */
function carveInterflatOtsForDroppedSitout(
  flatId: string,
  flatIndex: number,
  keptRooms: readonly ApartmentPlanRoom[],
  dropped: readonly ApartmentPlanRoom[],
): {
  keptRooms: ApartmentPlanRoom[];
  droppedRemaining: ApartmentPlanRoom[];
  otsShaft?: ApartmentCoreElement;
} {
  const sitout = dropped.find(r => r.id === `${flatId}__balcony`);
  if (!sitout) {
    return { keptRooms: [...keptRooms], droppedRemaining: [...dropped] };
  }

  const util = dropped.find(r => r.id === `${flatId}__utility`);
  const sBox = rectToBox(sitout.rect);
  const horiz = sBox.w >= sBox.h;
  const uBox = util ? rectToBox(util.rect) : undefined;
  const utilAdjacent =
    uBox !== undefined &&
    (horiz
      ? Math.abs(uBox.y - sBox.y) <= 1 &&
        Math.abs(uBox.h - sBox.h) <= 1 &&
        (Math.abs(uBox.x + uBox.w - sBox.x) <= 1 || Math.abs(sBox.x + sBox.w - uBox.x) <= 1)
      : Math.abs(uBox.x - sBox.x) <= 1 &&
        Math.abs(uBox.w - sBox.w) <= 1 &&
        (Math.abs(uBox.y + uBox.h - sBox.y) <= 1 || Math.abs(sBox.y + sBox.h - uBox.y) <= 1));

  const bandBox: Box2D = utilAdjacent && uBox
    ? {
        x: Math.min(sBox.x, uBox.x),
        y: Math.min(sBox.y, uBox.y),
        w: horiz ? sBox.w + uBox.w : sBox.w,
        h: horiz ? sBox.h : sBox.h + uBox.h,
      }
    : sBox;

  const bandLen = horiz ? bandBox.w : bandBox.h;
  const bandDep = horiz ? bandBox.h : bandBox.w;
  if (bandLen < 4100 || bandDep < 1500) {
    return { keptRooms: [...keptRooms], droppedRemaining: [...dropped] };
  }

  const otsLen = Math.min(1800, Math.max(1550, Math.min(1600, bandLen - 2550)));
  const uLen = utilAdjacent && uBox ? (horiz ? uBox.w : uBox.h) : 0;
  const utilRemLen = utilAdjacent && uLen >= otsLen + 100 ? uLen - otsLen : 0;
  const sitoutLen = bandLen - utilRemLen - otsLen;
  if (sitoutLen < 2500) {
    return { keptRooms: [...keptRooms], droppedRemaining: [...dropped] };
  }

  const utilAtLowSide =
    utilAdjacent && uBox
      ? horiz
        ? uBox.x < sBox.x
        : uBox.y < sBox.y
      : true;
  const bandStart = horiz ? bandBox.x : bandBox.y;
  const makeSpanBox = (offset: number, span: number): Box2D =>
    horiz
      ? { x: bandStart + offset, y: bandBox.y, w: span, h: bandBox.h }
      : { x: bandBox.x, y: bandStart + offset, w: bandBox.w, h: span };

  const utilBoxNew = utilRemLen > 0
    ? makeSpanBox(utilAtLowSide ? 0 : bandLen - utilRemLen, utilRemLen)
    : undefined;
  const otsBox = makeSpanBox(utilAtLowSide ? utilRemLen : sitoutLen, otsLen);
  const sitoutBoxNew = makeSpanBox(utilAtLowSide ? utilRemLen + otsLen : 0, sitoutLen);

  const nextKept = [...keptRooms, { ...sitout, rect: boxToRect(sitoutBoxNew) }];
  const nextDropped = dropped.filter(
    r => r.id !== sitout.id && (!utilAdjacent || r.id !== util?.id),
  );
  if (utilAdjacent && util && utilBoxNew) {
    nextDropped.push({ ...util, rect: boxToRect(utilBoxNew) });
  }

  return {
    keptRooms: nextKept,
    droppedRemaining: nextDropped,
    otsShaft: {
      id: `core_shaft_interflat_${flatIndex + 1}`,
      architecturalRole: 'OPEN_TO_SKY_VOID',
      name: 'Inter-Flat Ventilation OTS Shaft',
      rect: boxToRect(otsBox),
      tags: ['shaft:ots', 'shaft:interflat'],
      assignedFlatId: null,
    },
  };
}

function reabsorbDropped(
  kept: readonly ApartmentPlanRoom[],
  dropped: readonly ApartmentPlanRoom[],
): ApartmentPlanRoom[] {
  const result = [...kept];
  for (const gap of dropped) {
    const g = rectToBox(gap.rect);

    // A sit-out is part of the flat's programme, not an optional projection. If
    // it cannot be a balcony here, it stays as an interior sitting space rather
    // than being merged away: a 2BHK that quietly loses its sit-out no longer
    // matches the brief it was generated from.
    if (/Sit-out/i.test(gap.name)) {
      result.push({
        ...gap,
        name: gap.name.replace(/Sit-out Balcony/i, 'Family Sit-out'),
        type: 'living',
        planningZone: 'PUBLIC',
      });
      continue;
    }

    const idx = result.findIndex(room => {
      const r = rectToBox(room.rect);
      const sameWidth = Math.abs(r.x - g.x) <= 1 && Math.abs(r.w - g.w) <= 1;
      const sameHeight = Math.abs(r.y - g.y) <= 1 && Math.abs(r.h - g.h) <= 1;
      const stacked = sameWidth && (Math.abs(r.y + r.h - g.y) <= 1 || Math.abs(g.y + g.h - r.y) <= 1);
      const beside = sameHeight && (Math.abs(r.x + r.w - g.x) <= 1 || Math.abs(g.x + g.w - r.x) <= 1);
      return stacked || beside;
    });

    if (idx < 0) {
      // No neighbour to grow into. Keep the rectangle, but as an interior room:
      // restoring it as a balcony would put back a balcony with no exterior
      // wall, which the canonical model rejects outright.
      result.push({
        ...gap,
        id: `${gap.id}__interior`,
        name: gap.name.replace(/Sit-out Balcony/i, 'Family Sit-out').replace(/Balcony/i, 'Utility Store').trim(),
        type: /Sit-out/i.test(gap.name) ? 'living' : 'storage',
        planningZone: /Sit-out/i.test(gap.name) ? 'PUBLIC' : 'SERVICE',
      });
      continue;
    }

    const host = result[idx]!;
    const r = rectToBox(host.rect);
    const merged: Box2D = {
      x: Math.min(r.x, g.x),
      y: Math.min(r.y, g.y),
      w: Math.abs(r.y - g.y) <= 1 && Math.abs(r.h - g.h) <= 1 ? r.w + g.w : r.w,
      h: Math.abs(r.x - g.x) <= 1 && Math.abs(r.w - g.w) <= 1 ? r.h + g.h : r.h,
    };
    result[idx] = { ...host, rect: boxToRect(merged) };
  }
  return result;
}
