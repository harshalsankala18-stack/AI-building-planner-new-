import {
  type AnyNode,
  WallNode,
  DoorNode,
  WindowNode,
  ZoneNode,
  ItemNode,
} from '@pascal-app/core';
import { type PascalScene, toPascalId } from './canonical-to-pascal.js';

export interface AddOpeningOperation {
  type: 'add_opening';
  id?: string;
  wallId: string;
  openingType: 'door' | 'window';
  position?: [number, number, number];
  offset?: number;
  width?: number;
  height?: number;
  sillHeight?: number;
  name?: string;
  doorType?: string;
  windowType?: string;
}

export interface UpdateWallOperation {
  type: 'update_wall';
  wallId: string;
  thickness?: number;
  height?: number;
  loadBearing?: boolean;
  start?: [number, number];
  end?: [number, number];
}

export interface AddFurnitureItemOperation {
  type: 'add_furniture_item';
  id?: string;
  levelId?: string;
  zoneId?: string;
  name: string;
  itemType?: string;
  category?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  dimensions?: [number, number, number];
}

export interface RenameOrUpdateZoneOperation {
  type: 'rename_or_update_zone';
  zoneId: string;
  name?: string;
  spaceRole?: string;
  polygon?: [number, number][];
}

export interface RemoveNodeOperation {
  type: 'remove_node';
  nodeId: string;
}

export type PascalSceneOperation =
  | AddOpeningOperation
  | UpdateWallOperation
  | AddFurnitureItemOperation
  | RenameOrUpdateZoneOperation
  | RemoveNodeOperation;

export interface PascalMutationResult {
  success: boolean;
  scene: PascalScene;
  appliedOperations: PascalSceneOperation[];
  refusals: string[];
}

/**
 * Checks whether 2D point (x, y) is inside a 2D polygon using standard ray casting.
 */
export function isPointInPolygon2D(p: [number, number], polygon: [number, number][]): boolean {
  let inside = false;
  const px = p[0];
  const py = p[1];
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const p1 = polygon[i];
    const p2 = polygon[j];
    if (!p1 || !p2) continue;
    const xi = p1[0];
    const yi = p1[1];
    const xj = p2[0];
    const yj = p2[1];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks whether a point is inside or near the bounding box of a polygon within tolerance.
 */
export function isPointNearOrInPolygon(
  p: [number, number],
  polygon: [number, number][],
  tolerance = 0.6
): boolean {
  if (polygon.length < 3) return true;
  if (isPointInPolygon2D(p, polygon)) return true;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const pt of polygon) {
    if (!pt) continue;
    const x = pt[0];
    const y = pt[1];
    if (x === undefined || y === undefined) continue;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const px = p[0];
  const py = p[1];
  return (
    px >= minX - tolerance &&
    px <= maxX + tolerance &&
    py >= minY - tolerance &&
    py <= maxY + tolerance
  );
}

/**
 * Recursively collects all descendant node IDs of a given root node.
 */
function collectDescendantIds(nodes: Record<string, AnyNode>, rootId: string): string[] {
  const result: string[] = [];
  const node = nodes[rootId];
  if (!node) return result;

  const children: string[] = (node as any).children || [];
  for (const childId of children) {
    result.push(childId);
    result.push(...collectDescendantIds(nodes, childId));
  }
  return result;
}

/**
 * Executes a list of structured operations on a PascalScene graph headlessly in-process.
 * Every operation is strictly validated against Pascal's Zod node schemas and scene integrity constraints.
 */
export function applyPascalOperations(
  scene: PascalScene,
  operations: PascalSceneOperation[]
): PascalMutationResult {
  const newNodes: Record<string, AnyNode> = JSON.parse(JSON.stringify(scene.nodes));
  const newRootNodeIds = [...scene.rootNodeIds];
  const appliedOperations: PascalSceneOperation[] = [];
  const refusals: string[] = [];

  for (const op of operations) {
    try {
      switch (op.type) {
        case 'add_opening': {
          const wallNode = newNodes[op.wallId] as any;
          if (!wallNode || wallNode.type !== 'wall') {
            refusals.push(`Wall "${op.wallId}" was not found in the scene.`);
            continue;
          }

          const dx = wallNode.end[0] - wallNode.start[0];
          const dy = wallNode.end[1] - wallNode.start[1];
          const wallLen = Math.hypot(dx, dy);

          const width = op.width ?? (op.openingType === 'door' ? 0.9 : 1.2);
          const height = op.height ?? (op.openingType === 'door' ? 2.1 : 1.5);
          const sillHeight = op.sillHeight ?? (op.openingType === 'door' ? 0 : 0.9);

          let s = op.offset;
          if (s === undefined && op.position && op.position.length > 0) {
            s = op.position[0];
          }
          if (s === undefined) {
            s = Math.max(0, (wallLen - width) / 2);
          }

          if (s < 0 || s + width > wallLen + 0.05) {
            refusals.push(
              `Opening (offset: ${s.toFixed(2)}m, width: ${width.toFixed(2)}m) exceeds wall "${op.wallId}" length (${wallLen.toFixed(2)}m).`
            );
            continue;
          }

          const openingId =
            op.id ||
            toPascalId(
              op.openingType,
              `${op.wallId}_${op.openingType}_${Math.floor(Math.random() * 10000)}`
            );

          if (op.openingType === 'door') {
            const doorNode = DoorNode.parse({
              id: openingId,
              name: op.name || `Door ${openingId}`,
              parentId: op.wallId,
              wallId: op.wallId,
              position: [s, 0, 0],
              width,
              height,
              metadata: {
                doorType: op.doorType || 'single',
              },
            });
            newNodes[openingId] = doorNode;
          } else {
            const winNode = WindowNode.parse({
              id: openingId,
              name: op.name || `Window ${openingId}`,
              parentId: op.wallId,
              wallId: op.wallId,
              position: [s, sillHeight, 0],
              width,
              height,
              sillHeight,
              metadata: {
                windowType: op.windowType || 'sliding',
              },
            });
            newNodes[openingId] = winNode;
          }

          if (!Array.isArray(wallNode.children)) {
            wallNode.children = [];
          }
          if (!wallNode.children.includes(openingId)) {
            wallNode.children.push(openingId);
          }

          appliedOperations.push(op);
          break;
        }

        case 'update_wall': {
          const wallNode = newNodes[op.wallId] as any;
          if (!wallNode || wallNode.type !== 'wall') {
            refusals.push(`Wall "${op.wallId}" was not found in the scene.`);
            continue;
          }

          if (op.thickness !== undefined && op.thickness <= 0) {
            refusals.push(`Wall thickness must be positive (received: ${op.thickness}).`);
            continue;
          }
          if (op.height !== undefined && op.height <= 0) {
            refusals.push(`Wall height must be positive (received: ${op.height}).`);
            continue;
          }

          const updatedProps: any = {
            ...wallNode,
            thickness: op.thickness !== undefined ? op.thickness : wallNode.thickness,
            height: op.height !== undefined ? op.height : wallNode.height,
            start: op.start ?? wallNode.start,
            end: op.end ?? wallNode.end,
            metadata: {
              ...(wallNode.metadata || {}),
              ...(op.loadBearing !== undefined ? { loadBearing: op.loadBearing } : {}),
            },
          };

          const parsedWall = WallNode.parse(updatedProps);
          newNodes[op.wallId] = parsedWall;
          appliedOperations.push(op);
          break;
        }

        case 'add_furniture_item': {
          let parentLevelId = op.levelId;
          let zoneNode: any;

          if (op.zoneId) {
            zoneNode = newNodes[op.zoneId];
            if (!zoneNode || zoneNode.type !== 'zone') {
              refusals.push(`Target room zone "${op.zoneId}" was not found.`);
              continue;
            }
            if (!parentLevelId) {
              parentLevelId = zoneNode.parentId;
            }

            // Check if position [x, z] is inside or near the room zone
            const pos2D: [number, number] = [op.position[0], op.position[2]];
            if (zoneNode.polygon && !isPointNearOrInPolygon(pos2D, zoneNode.polygon, 0.8)) {
              refusals.push(
                `Furniture position [${op.position[0].toFixed(2)}, ${op.position[2].toFixed(2)}] is outside the boundary of room "${zoneNode.name || op.zoneId}".`
              );
              continue;
            }
          }

          if (!parentLevelId) {
            const firstLevel = Object.values(newNodes).find((n) => n.type === 'level');
            if (firstLevel) {
              parentLevelId = firstLevel.id;
            } else {
              refusals.push('No Level node found in scene to host furniture item.');
              continue;
            }
          }

          const rawKey = (op.itemType || op.name).toLowerCase().replace(/[^a-z0-9_]/g, '_');
          const itemId =
            op.id ||
            toPascalId(
              'item' as any,
              `${rawKey}_${Math.floor(Math.random() * 10000)}`
            );

          const itemNode = ItemNode.parse({
            id: itemId,
            name: op.name,
            parentId: parentLevelId,
            position: op.position,
            rotation: op.rotation ?? [0, 0, 0],
            scale: op.scale ?? [1, 1, 1],
            asset: {
              id: `asset_${rawKey}`,
              name: op.name,
              category: op.category ?? 'furniture',
              src: `/assets/models/${rawKey}.glb`,
              thumbnail: `/assets/thumbnails/${rawKey}.png`,
            },
            metadata: {
              itemType: op.itemType,
              zoneId: op.zoneId,
            },
          });

          newNodes[itemId] = itemNode;

          const levelNode = newNodes[parentLevelId] as any;
          if (levelNode && Array.isArray(levelNode.children)) {
            if (!levelNode.children.includes(itemId)) {
              levelNode.children.push(itemId);
            }
          }

          appliedOperations.push(op);
          break;
        }

        case 'rename_or_update_zone': {
          const zoneNode = newNodes[op.zoneId] as any;
          if (!zoneNode || zoneNode.type !== 'zone') {
            refusals.push(`Zone "${op.zoneId}" was not found in the scene.`);
            continue;
          }

          const updatedProps: any = {
            ...zoneNode,
            name: op.name ?? zoneNode.name,
            spaceRole: op.spaceRole ?? zoneNode.spaceRole,
            polygon: op.polygon ?? zoneNode.polygon,
          };

          const parsedZone = ZoneNode.parse(updatedProps);
          newNodes[op.zoneId] = parsedZone;
          appliedOperations.push(op);
          break;
        }

        case 'remove_node': {
          const node = newNodes[op.nodeId];
          if (!node) {
            refusals.push(`Node "${op.nodeId}" not found for removal.`);
            continue;
          }
          if (node.type === 'site' || node.type === 'building') {
            refusals.push(`Root node "${op.nodeId}" (${node.type}) cannot be removed.`);
            continue;
          }

          const allIdsToDelete = [op.nodeId, ...collectDescendantIds(newNodes, op.nodeId)];

          // Remove from parent's children
          const parentId = (node as any).parentId;
          if (parentId && newNodes[parentId]) {
            const parent = newNodes[parentId] as any;
            if (Array.isArray(parent.children)) {
              parent.children = parent.children.filter((cid: string) => cid !== op.nodeId);
            }
          }

          for (const delId of allIdsToDelete) {
            delete newNodes[delId];
          }

          appliedOperations.push(op);
          break;
        }
      }
    } catch (err: any) {
      refusals.push(`Operation ${op.type} failed schema validation: ${err.message ?? String(err)}`);
    }
  }

  return {
    success: refusals.length === 0,
    scene: {
      nodes: newNodes,
      rootNodeIds: newRootNodeIds,
    },
    appliedOperations,
    refusals,
  };
}
