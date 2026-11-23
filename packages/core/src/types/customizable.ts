/**
 * Customizable Openings & Furniture Specification Contracts (§1A).
 *
 * Defines design styles, materials, and parametric dimensions for
 * doors, windows, and interior fixtures.
 */

import type { Point } from './geometry';
import { RoomType, type SwingDirection, type DoorType, type WindowType } from './enums';
import type { CanonicalFurnitureItem, InteriorCategory, MountType, InteriorItemKind } from './furniture';

export type { InteriorCategory, MountType, InteriorItemKind } from './furniture';

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

export interface InteriorCatalogItem {
  readonly id: string;
  readonly kind: InteriorItemKind;
  readonly category: InteriorCategory;
  readonly mountType: MountType;
  readonly label: string;
  readonly defaultWidthMm: number;
  readonly defaultDepthMm: number;
  readonly defaultHeightMm: number;
  readonly defaultElevationMm: number;
  readonly defaultRooms: RoomType[];
  readonly tag: string;
  readonly description: string;
}

export const INTERIOR_CATALOG: readonly InteriorCatalogItem[] = [
  // Living
  {
    id: 'sofa_3seater',
    kind: 'sofa_3seater',
    category: 'furniture',
    mountType: 'floor',
    label: '3-Seater Living Sofa',
    defaultWidthMm: 2100,
    defaultDepthMm: 850,
    defaultHeightMm: 820,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Living],
    tag: 'F1',
    description: '2100x850mm 3-seater upholstered living room sofa with cushioned backrest.',
  },
  {
    id: 'sofa_2seater',
    kind: 'sofa_2seater',
    category: 'furniture',
    mountType: 'floor',
    label: '2-Seater Loveseat',
    defaultWidthMm: 1550,
    defaultDepthMm: 850,
    defaultHeightMm: 820,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Living],
    tag: 'F2',
    description: '1550x850mm compact 2-seater loveseat sofa.',
  },
  {
    id: 'coffee_table',
    kind: 'coffee_table',
    category: 'furniture',
    mountType: 'floor',
    label: 'Central Coffee Table',
    defaultWidthMm: 1100,
    defaultDepthMm: 600,
    defaultHeightMm: 420,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Living],
    tag: 'F3',
    description: '1100x600mm central coffee table with solid wood frame.',
  },
  {
    id: 'tv_console',
    kind: 'tv_console',
    category: 'furniture',
    mountType: 'floor',
    label: 'Media TV Unit Console',
    defaultWidthMm: 1600,
    defaultDepthMm: 420,
    defaultHeightMm: 500,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Living],
    tag: 'F4',
    description: '1600x420mm low-profile media TV console unit with cable pass-throughs.',
  },
  // Bedroom
  {
    id: 'bed_queen',
    kind: 'bed_queen',
    category: 'furniture',
    mountType: 'floor',
    label: 'Queen Master Bed',
    defaultWidthMm: 1600,
    defaultDepthMm: 2050,
    defaultHeightMm: 950,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Bedroom],
    tag: 'B1',
    description: '1600x2050mm Queen bed with cushioned headboard and dual pillows.',
  },
  {
    id: 'bed_single',
    kind: 'bed_single',
    category: 'furniture',
    mountType: 'floor',
    label: 'Single Bed',
    defaultWidthMm: 1000,
    defaultDepthMm: 2000,
    defaultHeightMm: 900,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Bedroom],
    tag: 'B2',
    description: '1000x2000mm single bed with mattress and headboard.',
  },
  {
    id: 'side_table',
    kind: 'side_table',
    category: 'furniture',
    mountType: 'floor',
    label: 'Bedside Nightstand',
    defaultWidthMm: 480,
    defaultDepthMm: 450,
    defaultHeightMm: 520,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Bedroom],
    tag: 'ST1',
    description: '480x450mm bedside nightstand with drawer and lamp surface.',
  },
  {
    id: 'wardrobe',
    kind: 'wardrobe',
    category: 'furniture',
    mountType: 'floor',
    label: '3-Door Bedroom Wardrobe',
    defaultWidthMm: 1500,
    defaultDepthMm: 600,
    defaultHeightMm: 2100,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Bedroom],
    tag: 'W1',
    description: '1500x600x2100mm full-height modular bedroom wardrobe.',
  },
  // Dining & Kitchen
  {
    id: 'dining_table_6',
    kind: 'dining_table_6',
    category: 'furniture',
    mountType: 'floor',
    label: '6-Seater Dining Table',
    defaultWidthMm: 1800,
    defaultDepthMm: 950,
    defaultHeightMm: 760,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Dining],
    tag: 'DT1',
    description: '1800x950mm 6-seater solid wood dining table with chairs.',
  },
  {
    id: 'dining_table_4',
    kind: 'dining_table_4',
    category: 'furniture',
    mountType: 'floor',
    label: '4-Seater Dining Table',
    defaultWidthMm: 1200,
    defaultDepthMm: 850,
    defaultHeightMm: 760,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Dining],
    tag: 'DT2',
    description: '1200x850mm compact 4-seater dining set.',
  },
  {
    id: 'kitchen_counter',
    kind: 'kitchen_counter',
    category: 'appliance',
    mountType: 'floor',
    label: 'Modular Kitchen Counter',
    defaultWidthMm: 2200,
    defaultDepthMm: 600,
    defaultHeightMm: 860,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Kitchen],
    tag: 'KC1',
    description: '2200x600mm granite-top modular counter with undermount sink and 4-burner cooktop.',
  },
  {
    id: 'refrigerator',
    kind: 'refrigerator',
    category: 'appliance',
    mountType: 'floor',
    label: 'Double-Door Refrigerator',
    defaultWidthMm: 700,
    defaultDepthMm: 700,
    defaultHeightMm: 1750,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Kitchen],
    tag: 'REF1',
    description: '700x700x1750mm frost-free double door refrigerator unit.',
  },
  // Bathroom
  {
    id: 'wc_toilet',
    kind: 'wc_toilet',
    category: 'sanitary',
    mountType: 'floor',
    label: 'Water Closet Toilet',
    defaultWidthMm: 400,
    defaultDepthMm: 680,
    defaultHeightMm: 760,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Bathroom],
    tag: 'WC1',
    description: '400x680mm ceramic floor-mounted water closet commode with dual-flush cistern.',
  },
  {
    id: 'wash_basin',
    kind: 'wash_basin',
    category: 'sanitary',
    mountType: 'floor',
    label: 'Vanity Wash Basin',
    defaultWidthMm: 600,
    defaultDepthMm: 460,
    defaultHeightMm: 820,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Bathroom],
    tag: 'WB1',
    description: '600x460mm countertop vanity wash basin with chrome mixer tap.',
  },
  {
    id: 'shower_tray',
    kind: 'shower_tray',
    category: 'sanitary',
    mountType: 'floor',
    label: 'Walk-In Shower Enclosure',
    defaultWidthMm: 900,
    defaultDepthMm: 900,
    defaultHeightMm: 100,
    defaultElevationMm: 0,
    defaultRooms: [RoomType.Bathroom],
    tag: 'SH1',
    description: '900x900mm anti-slip shower base tray with tempered glass partition.',
  },
  // Lighting & Ceiling Fans
  {
    id: 'ceiling_fan',
    kind: 'ceiling_fan',
    category: 'lighting',
    mountType: 'ceiling',
    label: '3-Blade Ceiling Fan',
    defaultWidthMm: 1200,
    defaultDepthMm: 1200,
    defaultHeightMm: 320,
    defaultElevationMm: 2680,
    defaultRooms: [RoomType.Living, RoomType.Bedroom, RoomType.Dining],
    tag: 'FAN1',
    description: '1200mm sweep aerodynamic 3-blade ceiling fan suspended 320mm below ceiling.',
  },
  {
    id: 'ceiling_light_recessed',
    kind: 'ceiling_light_recessed',
    category: 'lighting',
    mountType: 'ceiling',
    label: 'Recessed LED Downlight',
    defaultWidthMm: 240,
    defaultDepthMm: 240,
    defaultHeightMm: 40,
    defaultElevationMm: 2960,
    defaultRooms: [RoomType.Living, RoomType.Bedroom, RoomType.Kitchen, RoomType.Bathroom, RoomType.Corridor],
    tag: 'DL1',
    description: '240mm circular warm-white (3000K) recessed ceiling LED downlight.',
  },
  {
    id: 'pendant_light',
    kind: 'pendant_light',
    category: 'lighting',
    mountType: 'ceiling',
    label: 'Dining Pendant Light',
    defaultWidthMm: 450,
    defaultDepthMm: 450,
    defaultHeightMm: 550,
    defaultElevationMm: 2450,
    defaultRooms: [RoomType.Dining],
    tag: 'PL1',
    description: '450mm decorative suspended dining chandelier / pendant fixture.',
  },
  {
    id: 'wall_sconce',
    kind: 'wall_sconce',
    category: 'lighting',
    mountType: 'wall',
    label: 'Architectural Wall Sconce',
    defaultWidthMm: 180,
    defaultDepthMm: 150,
    defaultHeightMm: 280,
    defaultElevationMm: 1800,
    defaultRooms: [RoomType.Living, RoomType.Bedroom],
    tag: 'WS1',
    description: '180x150x280mm wall-mounted warm accent light mounted at 1800mm elevation.',
  },
];

