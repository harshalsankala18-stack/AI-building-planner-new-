/**
 * Canonical Furniture & Plancraft DSL Contracts (§1A).
 *
 * Defines the canonical types for interior architectural fixtures and furniture
 * on AIA CAD layer A-FURN. Furniture items are visual/CAD fixtures and do NOT
 * subtract from Usable Carpet Area in the planar area ledger (Delta = 0.000 mm²).
 */

export type PlancraftFurnitureElementType =
  | 'bathtub'
  | 'bed'
  | 'bookshelf'
  | 'car'
  | 'chair'
  | 'coffee_table'
  | 'conference_table'
  | 'counter'
  | 'desk'
  | 'executive_desk'
  | 'filing_cabinet'
  | 'floor_lamp'
  | 'fridge'
  | 'l_sofa'
  | 'office_chair'
  | 'oven'
  | 'round_table'
  | 'sectional_sofa'
  | 'shower'
  | 'sink'
  | 'sofa'
  | 'spiral_staircase'
  | 'staircase'
  | 'stove'
  | 'table'
  | 'toilet'
  | 'tv_console'
  | 'wardrobe'
  | 'whiteboard';

export type InteriorCategory = 'furniture' | 'lighting' | 'appliance' | 'sanitary';
export type MountType = 'floor' | 'wall' | 'ceiling';
export type InteriorItemKind =
  | 'sofa_3seater'
  | 'sofa_2seater'
  | 'coffee_table'
  | 'tv_console'
  | 'bed_queen'
  | 'bed_single'
  | 'side_table'
  | 'wardrobe'
  | 'dining_table_6'
  | 'dining_table_4'
  | 'kitchen_counter'
  | 'refrigerator'
  | 'wc_toilet'
  | 'wash_basin'
  | 'shower_tray'
  | 'ceiling_fan'
  | 'ceiling_light_recessed'
  | 'pendant_light'
  | 'wall_sconce';

export interface CanonicalFurnitureItem {
  readonly id: string;
  readonly type: PlancraftFurnitureElementType;
  readonly roomId: string;
  readonly floorId?: string;
  readonly category?: InteriorCategory;
  readonly kind?: InteriorItemKind | string;
  readonly label?: string;
  readonly mountType?: MountType;
  readonly positionMm?: { readonly x: number; readonly y: number; readonly z: number };
  readonly dimensionsMm?: { readonly width: number; readonly depth: number; readonly height: number };
  readonly siteZoneId?: string;
  readonly flatId?: string;
  readonly xMm: number;
  readonly yMm: number;
  readonly widthMm: number;
  readonly depthMm: number;
  readonly rotationDeg: number;
  readonly anchorWall?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTER';
  readonly layer: 'A-FURN';
  readonly styleId?: string;
  readonly materialId?: string;
  readonly heightMm?: number;
  readonly elevationMm?: number;
  readonly color?: string;
  readonly locked?: boolean;
}

export interface PlancraftDslOutput {
  readonly pcText: string;
  readonly pcfText: string;
}
