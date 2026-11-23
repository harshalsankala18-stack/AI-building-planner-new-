/**
 * Customizable Openings & Furniture Specification Contracts (§1A).
 *
 * Defines design styles, materials, and parametric dimensions for
 * doors, windows, and interior fixtures.
 */

import type { Point } from './geometry';
import type { SwingDirection, DoorType, WindowType } from './enums';
import type { CanonicalFurnitureItem } from './furniture';

export type OpeningStyleId =
  | 'FLUSH_TIMBER'
  | 'GLASS_FRENCH'
  | 'SLIDING_UPVC'
  | 'CASEMENT_ALUMINUM'
  | 'FIXED_GLAZING';

export type DoorCategory =
  | 'main_entry_single'
  | 'main_entry_double'
  | 'balcony_sliding_glass'
  | 'french_double_glass'
  | 'service_exterior'
  | 'bedroom_hinged'
  | 'bathroom_flush'
  | 'pocket_sliding'
  | 'interior_double'
  | 'cased_archway';

export type WindowCategory =
  | 'casement_double'
  | 'sliding_wide'
  | 'fixed_picture'
  | 'full_height_glazing'
  | 'kitchen_casement'
  | 'bath_ventilator';

export interface DoorCatalogItem {
  readonly category: DoorCategory;
  readonly name: string;
  readonly placement: 'exterior' | 'interior';
  readonly defaultWidthMm: number;
  readonly defaultHeightMm: number;
  readonly leafCount: number;
  readonly type: DoorType;
  readonly styleId: OpeningStyleId;
  readonly tag: string;
  readonly description: string;
}

export interface WindowCatalogItem {
  readonly category: WindowCategory;
  readonly name: string;
  readonly placement: 'exterior' | 'interior';
  readonly defaultWidthMm: number;
  readonly defaultHeightMm: number;
  readonly defaultSillHeightMm: number;
  readonly leafCount: number;
  readonly type: WindowType;
  readonly styleId: OpeningStyleId;
  readonly tag: string;
  readonly description: string;
}

export const DOOR_CATALOG: readonly DoorCatalogItem[] = [
  // Exterior Doors
  {
    category: 'main_entry_single',
    name: 'Main Entry Single',
    placement: 'exterior',
    defaultWidthMm: 1050,
    defaultHeightMm: 2100,
    leafCount: 1,
    type: 'single' as DoorType,
    styleId: 'FLUSH_TIMBER',
    tag: 'D1',
    description: '1050mm wide single leaf timber entrance door with solid core.',
  },
  {
    category: 'main_entry_double',
    name: 'Main Entry Double',
    placement: 'exterior',
    defaultWidthMm: 1500,
    defaultHeightMm: 2100,
    leafCount: 2,
    type: 'double' as DoorType,
    styleId: 'FLUSH_TIMBER',
    tag: 'ED1',
    description: '1500mm wide double leaf grand entrance door.',
  },
  {
    category: 'balcony_sliding_glass',
    name: 'Balcony Sliding Glass',
    placement: 'exterior',
    defaultWidthMm: 1800,
    defaultHeightMm: 2100,
    leafCount: 2,
    type: 'sliding' as DoorType,
    styleId: 'SLIDING_UPVC',
    tag: 'SD1',
    description: '1800mm wide 2-track sliding UPVC/aluminum balcony glass door.',
  },
  {
    category: 'french_double_glass',
    name: 'French Double Glass Door',
    placement: 'exterior',
    defaultWidthMm: 1600,
    defaultHeightMm: 2100,
    leafCount: 2,
    type: 'double' as DoorType,
    styleId: 'GLASS_FRENCH',
    tag: 'FD1',
    description: '1600mm wide double glazed French casement door.',
  },
  {
    category: 'service_exterior',
    name: 'Service / Utility Door',
    placement: 'exterior',
    defaultWidthMm: 900,
    defaultHeightMm: 2100,
    leafCount: 1,
    type: 'single' as DoorType,
    styleId: 'FLUSH_TIMBER',
    tag: 'SD2',
    description: '900mm wide flush external service door for utility/terrace.',
  },
  // Interior Doors
  {
    category: 'bedroom_hinged',
    name: 'Bedroom Hinged Door',
    placement: 'interior',
    defaultWidthMm: 900,
    defaultHeightMm: 2100,
    leafCount: 1,
    type: 'single' as DoorType,
    styleId: 'FLUSH_TIMBER',
    tag: 'D2',
    description: '900mm standard single leaf hinged bedroom door.',
  },
  {
    category: 'bathroom_flush',
    name: 'Bathroom Flush Door',
    placement: 'interior',
    defaultWidthMm: 750,
    defaultHeightMm: 2100,
    leafCount: 1,
    type: 'single' as DoorType,
    styleId: 'FLUSH_TIMBER',
    tag: 'D3',
    description: '750mm moisture-resistant flush bathroom door.',
  },
  {
    category: 'pocket_sliding',
    name: 'Pocket Sliding Door',
    placement: 'interior',
    defaultWidthMm: 900,
    defaultHeightMm: 2100,
    leafCount: 1,
    type: 'sliding' as DoorType,
    styleId: 'SLIDING_UPVC',
    tag: 'PD1',
    description: '900mm concealed in-wall pocket sliding door.',
  },
  {
    category: 'interior_double',
    name: 'Interior Double Door',
    placement: 'interior',
    defaultWidthMm: 1400,
    defaultHeightMm: 2100,
    leafCount: 2,
    type: 'double' as DoorType,
    styleId: 'FLUSH_TIMBER',
    tag: 'DD1',
    description: '1400mm interior double door for dining or study hall.',
  },
  {
    category: 'cased_archway',
    name: 'Cased Opening / Archway',
    placement: 'interior',
    defaultWidthMm: 1200,
    defaultHeightMm: 2100,
    leafCount: 0,
    type: 'open_passage' as DoorType,
    styleId: 'FLUSH_TIMBER',
    tag: 'OP1',
    description: '1200mm open cased archway passage with no leaf.',
  },
];

export const WINDOW_CATALOG: readonly WindowCatalogItem[] = [
  {
    category: 'casement_double',
    name: 'Casement Double Window',
    placement: 'exterior',
    defaultWidthMm: 1200,
    defaultHeightMm: 1200,
    defaultSillHeightMm: 900,
    leafCount: 2,
    type: 'casement' as WindowType,
    styleId: 'CASEMENT_ALUMINUM',
    tag: 'W1',
    description: '1200x1200mm standard double casement bedroom window (sill 900mm).',
  },
  {
    category: 'sliding_wide',
    name: 'Sliding Wide Window',
    placement: 'exterior',
    defaultWidthMm: 1800,
    defaultHeightMm: 1200,
    defaultSillHeightMm: 900,
    leafCount: 2,
    type: 'sliding' as WindowType,
    styleId: 'SLIDING_UPVC',
    tag: 'W2',
    description: '1800x1200mm wide living room sliding window (sill 900mm).',
  },
  {
    category: 'fixed_picture',
    name: 'Fixed Picture Window',
    placement: 'exterior',
    defaultWidthMm: 1500,
    defaultHeightMm: 1500,
    defaultSillHeightMm: 600,
    leafCount: 1,
    type: 'fixed' as WindowType,
    styleId: 'FIXED_GLAZING',
    tag: 'PW1',
    description: '1500x1500mm unobstructed fixed picture glass window (sill 600mm).',
  },
  {
    category: 'full_height_glazing',
    name: 'Full Height Glazing',
    placement: 'exterior',
    defaultWidthMm: 2100,
    defaultHeightMm: 2100,
    defaultSillHeightMm: 150,
    leafCount: 2,
    type: 'fixed' as WindowType,
    styleId: 'FIXED_GLAZING',
    tag: 'CW1',
    description: '2100x2100mm floor-to-ceiling architectural curtain glazing (sill 150mm).',
  },
  {
    category: 'kitchen_casement',
    name: 'Kitchen Casement Window',
    placement: 'exterior',
    defaultWidthMm: 1050,
    defaultHeightMm: 1050,
    defaultSillHeightMm: 1050,
    leafCount: 2,
    type: 'casement' as WindowType,
    styleId: 'CASEMENT_ALUMINUM',
    tag: 'KW1',
    description: '1050x1050mm above-counter kitchen window (sill 1050mm).',
  },
  {
    category: 'bath_ventilator',
    name: 'Bathroom Louvered Ventilator',
    placement: 'exterior',
    defaultWidthMm: 600,
    defaultHeightMm: 600,
    defaultSillHeightMm: 1650,
    leafCount: 1,
    type: 'ventilator' as WindowType,
    styleId: 'CASEMENT_ALUMINUM',
    tag: 'V1',
    description: '600x600mm high-level bathroom louvered ventilator (sill 1650mm).',
  },
];

/** Customizable architectural door or window opening. */
export interface CustomizableOpening {
  readonly id: string;
  readonly floorId: string;
  readonly wallId: string;
  readonly openingType: 'DOOR' | 'WINDOW';
  readonly styleId: OpeningStyleId;
  readonly materialId?: string;
  readonly widthMm: number;
  readonly heightMm: number;
  readonly sillHeightMm?: number;
  readonly swingDirection?: SwingDirection;
  readonly position: Point;
}

/** Customizable interior architectural fixture and furniture. */
export interface CustomizableFurniture extends CanonicalFurnitureItem {
  readonly styleId?: string;
  readonly materialId?: string;
  readonly heightMm?: number;
  readonly elevationMm?: number;
  readonly color?: string;
}

