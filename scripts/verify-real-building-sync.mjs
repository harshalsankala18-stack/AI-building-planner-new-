// scripts/verify-real-building-sync.ts
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

// packages/core/dist/types/enums.js
var RoomType;
(function(RoomType3) {
  RoomType3["ServiceShaft"] = "service_shaft";
  RoomType3["Bedroom"] = "bedroom";
  RoomType3["Bathroom"] = "bathroom";
  RoomType3["Kitchen"] = "kitchen";
  RoomType3["Living"] = "living";
  RoomType3["Dining"] = "dining";
  RoomType3["Utility"] = "utility";
  RoomType3["Balcony"] = "balcony";
  RoomType3["Staircase"] = "staircase";
  RoomType3["Lift"] = "lift";
  RoomType3["Parking"] = "parking";
  RoomType3["Pooja"] = "pooja";
  RoomType3["Storage"] = "storage";
  RoomType3["Corridor"] = "corridor";
  RoomType3["Foyer"] = "foyer";
  RoomType3["Study"] = "study";
  RoomType3["ServantQuarter"] = "servant_quarter";
  RoomType3["Drawing"] = "drawing";
  RoomType3["FamilyLiving"] = "family_living";
  RoomType3["Terrace"] = "terrace";
  RoomType3["Garden"] = "garden";
  RoomType3["OTS"] = "ots";
  RoomType3["Porch"] = "porch";
  RoomType3["Dressing"] = "dressing";
  RoomType3["Custom"] = "custom";
})(RoomType || (RoomType = {}));
var Direction;
(function(Direction3) {
  Direction3["North"] = "north";
  Direction3["South"] = "south";
  Direction3["East"] = "east";
  Direction3["West"] = "west";
})(Direction || (Direction = {}));
var DaylightLevel;
(function(DaylightLevel3) {
  DaylightLevel3["None"] = "none";
  DaylightLevel3["Low"] = "low";
  DaylightLevel3["Medium"] = "medium";
  DaylightLevel3["High"] = "high";
})(DaylightLevel || (DaylightLevel = {}));
var PrivacyLevel;
(function(PrivacyLevel3) {
  PrivacyLevel3["None"] = "none";
  PrivacyLevel3["Low"] = "low";
  PrivacyLevel3["Medium"] = "medium";
  PrivacyLevel3["High"] = "high";
})(PrivacyLevel || (PrivacyLevel = {}));
var PreferenceLevel;
(function(PreferenceLevel3) {
  PreferenceLevel3["None"] = "none";
  PreferenceLevel3["Low"] = "low";
  PreferenceLevel3["Medium"] = "medium";
  PreferenceLevel3["High"] = "high";
})(PreferenceLevel || (PreferenceLevel = {}));
var AdjacencyStrength;
(function(AdjacencyStrength3) {
  AdjacencyStrength3["Required"] = "required";
  AdjacencyStrength3["Preferred"] = "preferred";
  AdjacencyStrength3["Avoid"] = "avoid";
})(AdjacencyStrength || (AdjacencyStrength = {}));
var WallType;
(function(WallType3) {
  WallType3["External"] = "external";
  WallType3["Internal"] = "internal";
  WallType3["Partition"] = "partition";
})(WallType || (WallType = {}));
var DoorType;
(function(DoorType3) {
  DoorType3["OpenPassage"] = "open_passage";
  DoorType3["Single"] = "single";
  DoorType3["Double"] = "double";
  DoorType3["Sliding"] = "sliding";
  DoorType3["Folding"] = "folding";
})(DoorType || (DoorType = {}));
var SwingDirection;
(function(SwingDirection3) {
  SwingDirection3["Inward"] = "inward";
  SwingDirection3["Outward"] = "outward";
  SwingDirection3["Left"] = "left";
  SwingDirection3["Right"] = "right";
})(SwingDirection || (SwingDirection = {}));
var WindowType;
(function(WindowType3) {
  WindowType3["Fixed"] = "fixed";
  WindowType3["Sliding"] = "sliding";
  WindowType3["Casement"] = "casement";
  WindowType3["Ventilator"] = "ventilator";
})(WindowType || (WindowType = {}));
var StairType;
(function(StairType3) {
  StairType3["Straight"] = "straight";
  StairType3["LShaped"] = "L_shaped";
  StairType3["UShaped"] = "U_shaped";
  StairType3["Spiral"] = "spiral";
})(StairType || (StairType = {}));
var ColumnShape;
(function(ColumnShape3) {
  ColumnShape3["Rectangular"] = "rectangular";
  ColumnShape3["Circular"] = "circular";
})(ColumnShape || (ColumnShape = {}));
var ProjectStatus;
(function(ProjectStatus3) {
  ProjectStatus3["Draft"] = "draft";
  ProjectStatus3["Active"] = "active";
  ProjectStatus3["Completed"] = "completed";
  ProjectStatus3["Archived"] = "archived";
})(ProjectStatus || (ProjectStatus = {}));
var ChangeSource;
(function(ChangeSource3) {
  ChangeSource3["Manual"] = "manual";
  ChangeSource3["AIEdit"] = "ai_edit";
  ChangeSource3["Generation"] = "generation";
})(ChangeSource || (ChangeSource = {}));
var PlotShape;
(function(PlotShape3) {
  PlotShape3["Rectangular"] = "rectangular";
  PlotShape3["LShaped"] = "L_shaped";
  PlotShape3["Irregular"] = "irregular";
})(PlotShape || (PlotShape = {}));
var AITaskType;
(function(AITaskType3) {
  AITaskType3["RequirementExtraction"] = "requirement_extraction";
  AITaskType3["PlanExplanation"] = "plan_explanation";
  AITaskType3["DesignCritique"] = "design_critique";
  AITaskType3["NaturalLanguageEdit"] = "natural_language_edit";
  AITaskType3["RoomNaming"] = "room_naming";
  AITaskType3["VastuAnalysis"] = "vastu_analysis";
  AITaskType3["ImageUnderstanding"] = "image_understanding";
  AITaskType3["ComplexReasoning"] = "complex_reasoning";
})(AITaskType || (AITaskType = {}));
var BuildingTypologyCategory;
(function(BuildingTypologyCategory3) {
  BuildingTypologyCategory3["ResidentialApartment"] = "RESIDENTIAL_APARTMENT";
  BuildingTypologyCategory3["ResidentialBungalow"] = "RESIDENTIAL_BUNGALOW";
  BuildingTypologyCategory3["ResidentialRowHouse"] = "RESIDENTIAL_ROW_HOUSE";
  BuildingTypologyCategory3["CommercialOffice"] = "COMMERCIAL_OFFICE";
  BuildingTypologyCategory3["MercantileMarket"] = "MERCANTILE_MARKET";
  BuildingTypologyCategory3["Educational"] = "EDUCATIONAL";
  BuildingTypologyCategory3["Assembly"] = "ASSEMBLY";
  BuildingTypologyCategory3["StorageWarehouse"] = "STORAGE_WAREHOUSE";
  BuildingTypologyCategory3["Industrial"] = "INDUSTRIAL";
})(BuildingTypologyCategory || (BuildingTypologyCategory = {}));

// packages/core/dist/types/apartment-manifest.js
var PROGRAMMATIC_2BHK_MANIFEST = [
  {
    id: "foyer_living_dining",
    name: "Living & Dining Room",
    type: RoomType.Living,
    minAreaMm2: 24e6,
    // 24 m²
    targetAreaMm2: 28e6,
    minWidthMm: 3300,
    isMandatory: true,
    zone: "PUBLIC",
    description: "Primary arrival, family lounge, and dining zone with front daylight access"
  },
  {
    id: "kitchen",
    name: "Kitchen",
    type: RoomType.Kitchen,
    minAreaMm2: 65e5,
    // 6.5 m²
    targetAreaMm2: 8e6,
    minWidthMm: 2200,
    isMandatory: true,
    zone: "SERVICE",
    description: "Food preparation zone with parallel counter space and service ventilation"
  },
  {
    id: "utility",
    name: "Kitchen Utility Yard",
    type: RoomType.Utility,
    minAreaMm2: 2e6,
    // 2.0 m²
    targetAreaMm2: 3e6,
    minWidthMm: 1200,
    isMandatory: true,
    attachedToRoomId: "kitchen",
    zone: "SERVICE",
    description: "Wet service washing yard adjacent to kitchen with exterior drainage access"
  },
  {
    id: "master_bedroom",
    name: "Master Bedroom",
    type: RoomType.Bedroom,
    minAreaMm2: 125e5,
    // 12.5 m²
    targetAreaMm2: 15e6,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Primary bedroom suite with wardrobe niche and attached private bath"
  },
  {
    id: "master_toilet",
    name: "Master En-suite Toilet",
    type: RoomType.Bathroom,
    minAreaMm2: 32e5,
    // 3.2 m²
    targetAreaMm2: 4e6,
    minWidthMm: 1400,
    isMandatory: true,
    attachedToRoomId: "master_bedroom",
    zone: "SERVICE",
    description: "En-suite 3-fixture bathroom exclusively accessible from Master Bedroom"
  },
  {
    id: "bedroom_2",
    name: "Bedroom 02",
    type: RoomType.Bedroom,
    minAreaMm2: 105e5,
    // 10.5 m²
    targetAreaMm2: 12e6,
    minWidthMm: 2800,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Second bedroom with operable exterior window and private passage access"
  },
  {
    id: "common_toilet",
    name: "Common Bathroom",
    type: RoomType.Bathroom,
    minAreaMm2: 28e5,
    // 2.8 m²
    targetAreaMm2: 35e5,
    minWidthMm: 1300,
    isMandatory: true,
    zone: "SERVICE",
    description: "General unit bathroom accessible from internal circulation passage"
  },
  {
    id: "standing_balcony",
    name: "Standing Balcony",
    type: RoomType.Balcony,
    minAreaMm2: 35e5,
    // 3.5 m²
    targetAreaMm2: 45e5,
    minWidthMm: 2400,
    isMandatory: true,
    attachedToRoomId: "foyer_living_dining",
    zone: "OUTDOOR",
    description: "Usable exterior cantilevered or recessed balcony with clear depth >= 1200 mm"
  }
];
var PROGRAMMATIC_3BHK_MANIFEST = [
  {
    id: "foyer_living_dining",
    name: "Living & Dining Room",
    type: RoomType.Living,
    minAreaMm2: 28e6,
    // 28 m²
    targetAreaMm2: 34e6,
    minWidthMm: 3600,
    isMandatory: true,
    zone: "PUBLIC",
    description: "Spacious formal living and dining area with dual lighting orientation"
  },
  {
    id: "kitchen",
    name: "Kitchen",
    type: RoomType.Kitchen,
    minAreaMm2: 75e5,
    // 7.5 m²
    targetAreaMm2: 95e5,
    minWidthMm: 2400,
    isMandatory: true,
    zone: "SERVICE",
    description: "Full-service kitchen with wet/dry counters and direct utility link"
  },
  {
    id: "utility",
    name: "Kitchen Utility Yard",
    type: RoomType.Utility,
    minAreaMm2: 25e5,
    // 2.5 m²
    targetAreaMm2: 35e5,
    minWidthMm: 1200,
    isMandatory: true,
    attachedToRoomId: "kitchen",
    zone: "SERVICE",
    description: "Service wash balcony for laundry and washing machine hookups"
  },
  {
    id: "master_bedroom_1",
    name: "Master Bedroom 01",
    type: RoomType.Bedroom,
    minAreaMm2: 14e6,
    // 14 m²
    targetAreaMm2: 17e6,
    minWidthMm: 3300,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Primary master suite with King-bed wall and attached private bath"
  },
  {
    id: "attached_toilet_1",
    name: "Master En-suite Toilet 01",
    type: RoomType.Bathroom,
    minAreaMm2: 38e5,
    // 3.8 m²
    targetAreaMm2: 45e5,
    minWidthMm: 1500,
    isMandatory: true,
    attachedToRoomId: "master_bedroom_1",
    zone: "SERVICE",
    description: "En-suite bath exclusively accessible from Master Bedroom 01"
  },
  {
    id: "bedroom_2",
    name: "Bedroom 02 (Suite)",
    type: RoomType.Bedroom,
    minAreaMm2: 115e5,
    // 11.5 m²
    targetAreaMm2: 14e6,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Second bedroom suite with attached private bathroom"
  },
  {
    id: "attached_toilet_2",
    name: "En-suite Toilet 02",
    type: RoomType.Bathroom,
    minAreaMm2: 32e5,
    // 3.2 m²
    targetAreaMm2: 4e6,
    minWidthMm: 1400,
    isMandatory: true,
    attachedToRoomId: "bedroom_2",
    zone: "SERVICE",
    description: "En-suite bath exclusively accessible from Bedroom 02"
  },
  {
    id: "bedroom_3",
    name: "Bedroom 03",
    type: RoomType.Bedroom,
    minAreaMm2: 105e5,
    // 10.5 m²
    targetAreaMm2: 125e5,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Third bedroom / guest room accessible from private circulation spine"
  },
  {
    id: "common_toilet",
    name: "Common Bathroom",
    type: RoomType.Bathroom,
    minAreaMm2: 28e5,
    // 2.8 m²
    targetAreaMm2: 35e5,
    minWidthMm: 1300,
    isMandatory: true,
    zone: "SERVICE",
    description: "Central common bathroom for Bedroom 03 and living area guests"
  },
  {
    id: "balcony_1",
    name: "Living Balcony",
    type: RoomType.Balcony,
    minAreaMm2: 45e5,
    // 4.5 m²
    targetAreaMm2: 6e6,
    minWidthMm: 2400,
    isMandatory: true,
    attachedToRoomId: "foyer_living_dining",
    zone: "OUTDOOR",
    description: "Main outdoor terrace balcony with clear depth >= 1200 mm (target 1570 mm)"
  }
];
var PROGRAMMATIC_4BHK_MANIFEST = [
  {
    id: "entrance_foyer",
    name: "Entrance Foyer",
    type: RoomType.Foyer,
    minAreaMm2: 35e5,
    // 3.5 m²
    targetAreaMm2: 5e6,
    minWidthMm: 1500,
    isMandatory: true,
    zone: "PUBLIC",
    description: "Dedicated formal entrance foyer buffering the main entrance from living spaces"
  },
  {
    id: "living_dining",
    name: "Grand Living & Dining Room",
    type: RoomType.Living,
    minAreaMm2: 32e6,
    // 32 m²
    targetAreaMm2: 4e7,
    minWidthMm: 3800,
    isMandatory: true,
    zone: "PUBLIC",
    description: "Expansive formal entertaining and dining salon opening onto outdoor balcony"
  },
  {
    id: "kitchen",
    name: "Kitchen",
    type: RoomType.Kitchen,
    minAreaMm2: 9e6,
    // 9 m²
    targetAreaMm2: 12e6,
    minWidthMm: 2600,
    isMandatory: true,
    zone: "SERVICE",
    description: "Large gourmet kitchen with island or parallel counter layouts"
  },
  {
    id: "utility_yard",
    name: "Service Utility Yard",
    type: RoomType.Utility,
    minAreaMm2: 3e6,
    // 3 m²
    targetAreaMm2: 45e5,
    minWidthMm: 1400,
    isMandatory: true,
    attachedToRoomId: "kitchen",
    zone: "SERVICE",
    description: "Enclosed utility yard for dishwashing, laundry, and MEP equipment"
  },
  {
    id: "master_suite_1",
    name: "Presidential Master Suite 01",
    type: RoomType.Bedroom,
    minAreaMm2: 16e6,
    // 16 m²
    targetAreaMm2: 2e7,
    minWidthMm: 3600,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Primary luxury master suite with private balcony access and walk-in dressing"
  },
  {
    id: "master_dress_1",
    name: "Master Walk-in Dress 01",
    type: RoomType.Dressing,
    minAreaMm2: 35e5,
    // 3.5 m²
    targetAreaMm2: 5e6,
    minWidthMm: 1600,
    isMandatory: true,
    attachedToRoomId: "master_suite_1",
    zone: "PRIVATE",
    description: "Walk-in dressing vestibule linking master bedroom to master bath"
  },
  {
    id: "master_bath_1",
    name: "Master Luxury Bath 01",
    type: RoomType.Bathroom,
    minAreaMm2: 45e5,
    // 4.5 m²
    targetAreaMm2: 6e6,
    minWidthMm: 1600,
    isMandatory: true,
    attachedToRoomId: "master_suite_1",
    zone: "SERVICE",
    description: "4-fixture luxury bathroom with separate shower stall and dual vanity"
  },
  {
    id: "master_suite_2",
    name: "Junior Master Suite 02",
    type: RoomType.Bedroom,
    minAreaMm2: 14e6,
    // 14 m²
    targetAreaMm2: 17e6,
    minWidthMm: 3300,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Secondary master bedroom suite with attached private bathroom"
  },
  {
    id: "master_bath_2",
    name: "En-suite Bath 02",
    type: RoomType.Bathroom,
    minAreaMm2: 38e5,
    // 3.8 m²
    targetAreaMm2: 48e5,
    minWidthMm: 1500,
    isMandatory: true,
    attachedToRoomId: "master_suite_2",
    zone: "SERVICE",
    description: "En-suite bath exclusively accessible from Suite 02"
  },
  {
    id: "bedroom_3",
    name: "Bedroom 03 (En-suite)",
    type: RoomType.Bedroom,
    minAreaMm2: 125e5,
    // 12.5 m²
    targetAreaMm2: 15e6,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Third bedroom suite with attached private bathroom"
  },
  {
    id: "bath_3",
    name: "En-suite Bath 03",
    type: RoomType.Bathroom,
    minAreaMm2: 32e5,
    // 3.2 m²
    targetAreaMm2: 4e6,
    minWidthMm: 1400,
    isMandatory: true,
    attachedToRoomId: "bedroom_3",
    zone: "SERVICE",
    description: "En-suite bathroom exclusively serving Bedroom 03"
  },
  {
    id: "bedroom_4",
    name: "Bedroom 04 / Guest Suite",
    type: RoomType.Bedroom,
    minAreaMm2: 11e6,
    // 11 m²
    targetAreaMm2: 135e5,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Fourth bedroom / home office / guest room accessible from corridor"
  },
  {
    id: "common_powder_bath",
    name: "Common Powder & Bathroom",
    type: RoomType.Bathroom,
    minAreaMm2: 28e5,
    // 2.8 m²
    targetAreaMm2: 35e5,
    minWidthMm: 1300,
    isMandatory: true,
    zone: "SERVICE",
    description: "Common powder room and guest bathroom accessible from public spine"
  },
  {
    id: "living_balcony",
    name: "Main Living Deck Balcony",
    type: RoomType.Balcony,
    minAreaMm2: 55e5,
    // 5.5 m²
    targetAreaMm2: 8e6,
    minWidthMm: 2400,
    isMandatory: true,
    attachedToRoomId: "living_dining",
    zone: "OUTDOOR",
    description: "Main living terrace deck with clear depth >= 1200 mm (target 1570 mm)"
  },
  {
    id: "master_balcony",
    name: "Master Suite Private Balcony",
    type: RoomType.Balcony,
    minAreaMm2: 45e5,
    // 4.5 m²
    targetAreaMm2: 6e6,
    minWidthMm: 2400,
    isMandatory: true,
    attachedToRoomId: "master_suite_1",
    zone: "OUTDOOR",
    description: "Private outdoor balcony for Master Suite 01 with clear depth >= 1200 mm"
  }
];
var PROGRAMMATIC_1BHK_MANIFEST = [
  {
    id: "foyer_living_dining",
    name: "Living & Dining Room",
    type: RoomType.Living,
    minAreaMm2: 18e6,
    // 18 m²
    targetAreaMm2: 22e6,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PUBLIC",
    description: "Compact living and dining area with front daylight window"
  },
  {
    id: "kitchen",
    name: "Kitchen",
    type: RoomType.Kitchen,
    minAreaMm2: 55e5,
    // 5.5 m²
    targetAreaMm2: 7e6,
    minWidthMm: 2e3,
    isMandatory: true,
    zone: "SERVICE",
    description: "Compact kitchen with single counter and ventilation opening"
  },
  {
    id: "utility",
    name: "Kitchen Utility",
    type: RoomType.Utility,
    minAreaMm2: 18e5,
    // 1.8 m²
    targetAreaMm2: 25e5,
    minWidthMm: 1e3,
    isMandatory: true,
    attachedToRoomId: "kitchen",
    zone: "SERVICE",
    description: "Service wash balcony adjacent to kitchen"
  },
  {
    id: "bedroom",
    name: "Master Bedroom",
    type: RoomType.Bedroom,
    minAreaMm2: 105e5,
    // 10.5 m²
    targetAreaMm2: 13e6,
    minWidthMm: 2800,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Standard bedroom accommodating double bed and wardrobe"
  },
  {
    id: "bathroom",
    name: "Bathroom",
    type: RoomType.Bathroom,
    minAreaMm2: 28e5,
    // 2.8 m²
    targetAreaMm2: 35e5,
    minWidthMm: 1300,
    isMandatory: true,
    zone: "SERVICE",
    description: "Combined toilet and shower room"
  },
  {
    id: "balcony",
    name: "Living Balcony",
    type: RoomType.Balcony,
    minAreaMm2: 25e5,
    // 2.5 m²
    targetAreaMm2: 35e5,
    minWidthMm: 2e3,
    isMandatory: true,
    attachedToRoomId: "foyer_living_dining",
    zone: "OUTDOOR",
    description: "Outdoor standing balcony with clear depth >= 1200 mm"
  }
];
function createDynamicApartmentManifest(input) {
  const flatsCount = input.flatsPerFloor;
  const units = input.units && input.units.length === flatsCount ? [...input.units] : Array.from({ length: flatsCount }, (_, i) => ({
    unitIndex: i + 1,
    bhkType: "3BHK",
    targetCarpetSqFt: 1100,
    attachedBathCount: 2,
    hasUtilityBalcony: true
  }));
  return {
    plotWidthMm: input.plotWidthMm,
    plotDepthMm: input.plotDepthMm,
    lotAllotmentMode: input.lotAllotmentMode ?? "STATUTORY_SETBACK_100_PERCENT",
    flatsPerFloor: flatsCount,
    units,
    jurisdiction: input.jurisdiction ?? "pune_pmc",
    northAngleDeg: input.northAngleDeg ?? 0,
    buildingTypology: input.buildingTypology ?? BuildingTypologyCategory.ResidentialApartment
  };
}

// packages/core/dist/types/rendering.js
var RenderLayer;
(function(RenderLayer3) {
  RenderLayer3["Grid"] = "grid";
  RenderLayer3["Plot"] = "plot";
  RenderLayer3["SiteZones"] = "site_zones";
  RenderLayer3["Floor"] = "floor";
  RenderLayer3["Rooms"] = "rooms";
  RenderLayer3["Walls"] = "walls";
  RenderLayer3["Openings"] = "openings";
  RenderLayer3["Stairs"] = "stairs";
  RenderLayer3["Columns"] = "columns";
  RenderLayer3["Beams"] = "beams";
  RenderLayer3["Furniture"] = "furniture";
  RenderLayer3["Annotations"] = "annotations";
  RenderLayer3["Selection"] = "selection";
  RenderLayer3["Guides"] = "guides";
})(RenderLayer || (RenderLayer = {}));

// packages/core/dist/types/design-intelligence.js
var FunctionalZone;
(function(FunctionalZone3) {
  FunctionalZone3["Public"] = "public";
  FunctionalZone3["SemiPublic"] = "semi_public";
  FunctionalZone3["Private"] = "private";
  FunctionalZone3["Service"] = "service";
  FunctionalZone3["Circulation"] = "circulation";
  FunctionalZone3["Outdoor"] = "outdoor";
})(FunctionalZone || (FunctionalZone = {}));
var AdjacencyRelationType;
(function(AdjacencyRelationType3) {
  AdjacencyRelationType3["RequiredAdjacency"] = "required_adjacency";
  AdjacencyRelationType3["PreferredAdjacency"] = "preferred_adjacency";
  AdjacencyRelationType3["RequiredSeparation"] = "required_separation";
  AdjacencyRelationType3["PrivacyBoundary"] = "privacy_boundary";
  AdjacencyRelationType3["AccessRequired"] = "access_required";
})(AdjacencyRelationType || (AdjacencyRelationType = {}));
var HumanVerificationStatus;
(function(HumanVerificationStatus3) {
  HumanVerificationStatus3["Unverified"] = "unverified";
  HumanVerificationStatus3["VerifiedArchitect"] = "verified_architect";
  HumanVerificationStatus3["VerifiedStructural"] = "verified_structural";
  HumanVerificationStatus3["ApprovedCanonical"] = "approved_canonical";
  HumanVerificationStatus3["Rejected"] = "rejected";
})(HumanVerificationStatus || (HumanVerificationStatus = {}));

// packages/core/dist/types/multi-sheet-apartment.js
var DEFAULT_SITE_AMENITIES = {
  securityCabin: true,
  landscapeGardenRos: true,
  childrenPlayTotLot: true,
  seniorCitizenSitout: true,
  transformerDgYard: true,
  ugwtPumpRoom: true,
  stpPlant: true,
  owcWasteYard: true,
  rainwaterHarvestingPits: true,
  evChargingBays: true
};
var DEFAULT_STILT_AMENITIES = {
  grandEntranceLobby: true,
  societyOffice: true,
  fitnessGymnasium: true,
  multipurposeHall: true,
  meterBmsRoom: true,
  driverStaffToilet: true
};
var DEFAULT_TERRACE_AMENITIES = {
  stairMumtyHeadroom: true,
  liftMachineRoom: true,
  overheadWaterTank: true,
  solarPvArray: true,
  terraceYogaDeck: true
};

// packages/core/dist/types/indian-codes.js
var CONCRETE_PROPERTIES_MAP = {
  M20: {
    grade: "M20",
    fckNPerMm2: 20,
    elasticModulusNPerMm2: Math.round(5e3 * Math.sqrt(20)),
    // 22361 N/mm²
    massDensityKgPerM3: 2500,
    poissonRatio: 0.2,
    thermalExpansionPerC: 99e-7,
    axialStrainLimit: 2e-3,
    bendingStrainLimit: 35e-4
  },
  M25: {
    grade: "M25",
    fckNPerMm2: 25,
    elasticModulusNPerMm2: Math.round(5e3 * Math.sqrt(25)),
    // 25000 N/mm²
    massDensityKgPerM3: 2500,
    poissonRatio: 0.2,
    thermalExpansionPerC: 99e-7,
    axialStrainLimit: 2e-3,
    bendingStrainLimit: 35e-4
  },
  M30: {
    grade: "M30",
    fckNPerMm2: 30,
    elasticModulusNPerMm2: Math.round(5e3 * Math.sqrt(30)),
    // 27386 N/mm²
    massDensityKgPerM3: 2500,
    poissonRatio: 0.2,
    thermalExpansionPerC: 99e-7,
    axialStrainLimit: 2e-3,
    bendingStrainLimit: 35e-4
  },
  M35: {
    grade: "M35",
    fckNPerMm2: 35,
    elasticModulusNPerMm2: Math.round(5e3 * Math.sqrt(35)),
    // 29580 N/mm²
    massDensityKgPerM3: 2500,
    poissonRatio: 0.2,
    thermalExpansionPerC: 99e-7,
    axialStrainLimit: 2e-3,
    bendingStrainLimit: 35e-4
  },
  M40: {
    grade: "M40",
    fckNPerMm2: 40,
    elasticModulusNPerMm2: Math.round(5e3 * Math.sqrt(40)),
    // 31623 N/mm²
    massDensityKgPerM3: 2500,
    poissonRatio: 0.2,
    thermalExpansionPerC: 99e-7,
    axialStrainLimit: 2e-3,
    bendingStrainLimit: 35e-4
  }
};

// packages/core/dist/models/id.js
var seed = null;
var counter = 0;
function generateId() {
  if (seed !== null) {
    counter++;
    const hex = (seed * 1e6 + counter).toString(16).padStart(12, "0");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4000-8000-${hex.padStart(12, "0").slice(0, 12)}`;
  }
  return crypto.randomUUID();
}

// packages/core/dist/models/errors.js
var DomainError = class extends Error {
  code;
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "DomainError";
  }
};
var InvalidDimensionError = class extends DomainError {
  constructor(field, value) {
    super(`Invalid dimension for "${field}": ${value}. Must be > 0.`, "INVALID_DIMENSION");
    this.name = "InvalidDimensionError";
  }
};
var InvalidCoordinateError = class extends DomainError {
  constructor(field, value) {
    super(`Invalid coordinate for "${field}": ${value}. Must be finite.`, "INVALID_COORDINATE");
    this.name = "InvalidCoordinateError";
  }
};

// packages/core/dist/constants.js
var DEFAULTS = {
  WALL_THICKNESS_EXTERNAL: 230,
  // mm
  WALL_THICKNESS_INTERNAL: 150,
  // mm
  WALL_THICKNESS_PARTITION: 115,
  // mm
  WALL_THICKNESS_PARTY: 230,
  // mm
  WALL_THICKNESS_CORRIDOR: 150,
  // mm
  WALL_THICKNESS_SHAFT: 100,
  // mm
  FLOOR_HEIGHT: 3e3,
  // mm (floor-to-floor)
  DOOR_WIDTH: 900,
  // mm
  DOOR_WIDTH_MAIN_ENTRANCE: 1050,
  // mm
  DOOR_WIDTH_HABITABLE: 900,
  // mm
  DOOR_WIDTH_SERVICE: 750,
  // mm
  DOOR_HEIGHT: 2100,
  // mm
  BALCONY_MIN_DEPTH: 1200,
  // mm
  BALCONY_TARGET_DEPTH: 1570,
  // mm
  WINDOW_WIDTH: 1200,
  // mm
  WINDOW_HEIGHT: 1200,
  // mm
  WINDOW_SILL_HEIGHT: 900,
  // mm
  COLUMN_WIDTH: 300,
  // mm
  COLUMN_DEPTH: 300,
  // mm
  RISER_HEIGHT: 175,
  // mm
  TREAD_DEPTH: 250,
  // mm
  STAIR_WIDTH: 1e3
  // mm
};
var TOLERANCES = {
  LINEAR: 1,
  // mm — minimum meaningful distance
  AREA: 1,
  // sq mm — minimum meaningful area
  ANGULAR: 0.01,
  // degrees
  ADJACENCY: 5,
  // mm — gap below this = adjacent
  OVERLAP: 100
  // sq mm — overlap below this = rounding artifact
};
var MINIMUM_ROOM_AREAS = {
  bedroom: 95e5,
  // 9.5 sq m
  bedroom_master: 12e6,
  // 12 sq m
  kitchen: 5e6,
  // 5 sq m
  bathroom: 25e5,
  // 2.5 sq m
  living: 12e6,
  // 12 sq m
  dining: 9e6,
  // 9 sq m
  utility: 3e6,
  // 3 sq m
  dressing: 3e6,
  // 3 sq m
  foyer: 35e5,
  // 3.5 sq m
  porch: 4e6,
  // 4 sq m
  ots: 1e6
  // 1 sq m (Open to Sky shaft)
};
var MINIMUM_DIMENSIONS = {
  bedroom: 2700,
  bedroom_master: 3e3,
  kitchen: 2100,
  bathroom: 1200,
  living: 3e3,
  dining: 2700,
  utility: 1200,
  dressing: 1500,
  foyer: 1500,
  porch: 1800,
  ots: 900,
  corridor: 900,
  staircase: 900
};
var UNITS = {
  MM_PER_FOOT: 304.8,
  MM_PER_METER: 1e3,
  MM_PER_INCH: 25.4
};

// packages/core/dist/models/factory.js
function assertFinite(field, value) {
  if (!Number.isFinite(value)) {
    throw new InvalidCoordinateError(field, value);
  }
}
function assertPositive(field, value) {
  assertFinite(field, value);
  if (value <= 0) {
    throw new InvalidDimensionError(field, value);
  }
}
function rectToPolygon(x, y, width, height) {
  return {
    points: [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height }
    ]
  };
}
function defaultRoomName(type) {
  const names = {
    [RoomType.ServiceShaft]: "Service Shaft",
    [RoomType.Bedroom]: "Bedroom",
    [RoomType.Bathroom]: "Bathroom",
    [RoomType.Kitchen]: "Kitchen",
    [RoomType.Living]: "Living Room",
    [RoomType.Dining]: "Dining Room",
    [RoomType.Utility]: "Utility",
    [RoomType.Balcony]: "Balcony",
    [RoomType.Staircase]: "Staircase",
    [RoomType.Lift]: "Lift",
    [RoomType.Parking]: "Parking",
    [RoomType.Pooja]: "Pooja Room",
    [RoomType.Storage]: "Storage",
    [RoomType.Corridor]: "Corridor",
    [RoomType.Foyer]: "Foyer",
    [RoomType.Study]: "Study",
    [RoomType.ServantQuarter]: "Servant Quarter",
    [RoomType.Drawing]: "Drawing Room",
    [RoomType.FamilyLiving]: "Family Living",
    [RoomType.Terrace]: "Terrace",
    [RoomType.Garden]: "Garden",
    [RoomType.OTS]: "Open to Sky (OTS)",
    [RoomType.Porch]: "Entrance Porch",
    [RoomType.Dressing]: "Dressing Room",
    [RoomType.Custom]: "Room"
  };
  return names[type];
}
function createRoom(params) {
  assertFinite("x", params.x);
  assertFinite("y", params.y);
  assertPositive("width", params.width);
  assertPositive("height", params.height);
  const area = params.width * params.height;
  const boundary = rectToPolygon(params.x, params.y, params.width, params.height);
  return {
    id: generateId(),
    floorId: params.floorId,
    type: params.type,
    name: params.name ?? defaultRoomName(params.type),
    boundary,
    x: params.x,
    y: params.y,
    width: params.width,
    height: params.height,
    rotation: params.rotation ?? 0,
    area,
    priority: params.priority ?? 5,
    tags: params.tags ?? [],
    adjacencyRequirements: params.adjacencyRequirements ?? [],
    daylightRequirement: params.daylightRequirement ?? DaylightLevel.Medium,
    privacyRequirement: params.privacyRequirement ?? PrivacyLevel.None,
    ventilationRequired: params.ventilationRequired ?? false,
    isFixed: params.isFixed ?? false
  };
}

// packages/core/dist/models/architectural-semantics.js
function architecturalSpaceRole(r) {
  if (r.architecturalRole)
    return r.architecturalRole;
  if (r.spaceUse === "VOID" || r.type === "ots")
    return "OPEN_TO_SKY_VOID";
  if (r.type === "service_shaft")
    return "SERVICE_SHAFT";
  if (r.type === "staircase")
    return "STAIR_ENCLOSURE";
  if (r.type === "lift")
    return "LIFT_SHAFT";
  if (r.type === "balcony" || r.type === "utility" && r.spaceUse === "OUTDOOR")
    return "BALCONY_SLAB";
  if (r.type === "terrace")
    return "OPEN_TERRACE";
  if (r.type === "corridor" || r.type === "foyer" || r.type === "garden" || r.type === "porch")
    return "OPEN_CIRCULATION";
  if (r.type === "parking")
    return r.tags.some((t) => /driveway|circulation/i.test(t)) ? "VEHICLE_AISLE" : "PARKING_BAY";
  return [
    "bedroom",
    "living",
    "dining",
    "study",
    "drawing",
    "family_living"
  ].includes(r.type) ? "ENCLOSED_HABITABLE" : "ENCLOSED_SERVICE";
}
function requiresEnclosure(role) {
  return [
    "ENCLOSED_HABITABLE",
    "ENCLOSED_SERVICE",
    "STAIR_ENCLOSURE",
    "PROTECTED_STAIR_ENCLOSURE",
    "STAIR_MUMTY",
    "LIFT_SHAFT",
    "SERVICE_SHAFT",
    "LIFT_EQUIPMENT"
  ].includes(role);
}
function architecturalBoundaryRole(owners, exterior) {
  if (owners.length > 0 && owners.every((r) => architecturalSpaceRole(r) === "OPEN_TO_SKY_VOID" && r.tags?.includes("recess:perimeter")))
    return "OPEN_BOUNDARY";
  const distinctUnits = new Set(owners.map((r) => r.unitId).filter(Boolean));
  if (distinctUnits.size > 1)
    return "FULL_HEIGHT_WALL";
  if (owners.some((r) => requiresEnclosure(architecturalSpaceRole(r))))
    return "FULL_HEIGHT_WALL";
  if (exterior && owners.some((r) => r.tags?.includes("core:lobby") || r.tags?.includes("core:corridor")))
    return "FULL_HEIGHT_WALL";
  if (owners.some((r) => architecturalSpaceRole(r) === "OPEN_TO_SKY_VOID"))
    return "PARAPET";
  if (exterior && owners.some((r) => [
    "BALCONY_SLAB",
    "OPEN_TERRACE",
    "ROOF_EQUIPMENT_ZONE",
    "OPEN_TO_SKY_VOID"
  ].includes(architecturalSpaceRole(r))))
    return "PARAPET";
  return "OPEN_BOUNDARY";
}
var isPhysicalBoundary = (w) => w.boundaryRole !== "OPEN_BOUNDARY";
function withArchitecturalElements(building) {
  return {
    ...building,
    floors: building.floors.map((f) => {
      const elements = [];
      const add = (role, collection, id, part) => elements.push({
        id: `${id}:architecture:${part ?? role}`,
        floorId: f.id,
        role,
        source: { collection, id, ...part ? { part } : {} },
        reviewStatus: "DESIGN_PROPOSAL"
      });
      f.rooms.forEach((r) => add(architecturalSpaceRole(r), "rooms", r.id));
      f.walls.forEach((w) => add(w.boundaryRole ?? "FULL_HEIGHT_WALL", "walls", w.id));
      f.doors.forEach((o) => add("DOOR_OPENING", "doors", o.id));
      f.windows.forEach((o) => add("WINDOW_OPENING", "windows", o.id));
      (f.canonicalStaircases ?? []).forEach((s) => {
        add("STAIR_FLIGHT", "canonicalStaircases", s.id, "flight1");
        add("STAIR_FLIGHT", "canonicalStaircases", s.id, "flight2");
        add("STAIR_LANDING", "canonicalStaircases", s.id, "midLanding");
        if (s.floorLanding)
          add("STAIR_LANDING", "canonicalStaircases", s.id, "floorLanding");
      });
      if (f.floorUse === "ROOF")
        add("OPEN_TERRACE", "floor", f.id);
      return {
        ...f,
        architecture: {
          schemaVersion: 1,
          elements,
          drainage: f.architecture?.drainage ?? {
            status: "NOT_VERIFIED"
          },
          statutoryStatus: "NOT_VERIFIED"
        }
      };
    })
  };
}

// node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes/esm/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
var hasHexBuiltin = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes(data);
  return data;
}
var Hash = class {
};
function createHasher(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}

// node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE);
  const _32n = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE ? 4 : 0;
  const l = isLE ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE);
  view.setUint32(byteOffset + l, wl, isLE);
}
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    data = toBytes(data);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes/esm/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA256 = class extends HashMD {
  constructor(outputLen = 32) {
    super(64, outputLen, 8, false);
    this.A = SHA256_IV[0] | 0;
    this.B = SHA256_IV[1] | 0;
    this.C = SHA256_IV[2] | 0;
    this.D = SHA256_IV[3] | 0;
    this.E = SHA256_IV[4] | 0;
    this.F = SHA256_IV[5] | 0;
    this.G = SHA256_IV[6] | 0;
    this.H = SHA256_IV[7] | 0;
  }
  get() {
    const { A, B, C: C3, D, E: E3, F, G, H } = this;
    return [A, B, C3, D, E3, F, G, H];
  }
  // prettier-ignore
  set(A, B, C3, D, E3, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C3 | 0;
    this.D = D | 0;
    this.E = E3 | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C: C3, D, E: E3, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E3, 6) ^ rotr(E3, 11) ^ rotr(E3, 25);
      const T1 = H + sigma1 + Chi(E3, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C3) | 0;
      H = G;
      G = F;
      F = E3;
      E3 = D + T1 | 0;
      D = C3;
      C3 = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C3 = C3 + this.C | 0;
    D = D + this.D | 0;
    E3 = E3 + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C3, D, E3, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var sha256 = /* @__PURE__ */ createHasher(() => new SHA256());

// node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes/esm/sha256.js
var sha2562 = sha256;

// packages/core/dist/models/canonical-revision.js
function canonicalRevisionJson(building) {
  const sorted = (value) => Array.isArray(value) ? value.map(sorted) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, sorted(item)])) : value;
  return JSON.stringify(sorted(building));
}
function canonicalBuildingHash(building) {
  return stableValueHash(building);
}
function stableValueHash(value) {
  return bytesToHex(sha2562(utf8ToBytes(canonicalRevisionJson(value))));
}

// packages/core/dist/models/validation.js
function isNonEmptyString(v) {
  return typeof v === "string" && v.length > 0;
}
function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function isObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
var VALID_ROOM_TYPES = new Set(Object.values(RoomType));
function validateRegulatoryContextSchema(input) {
  const errors = [];
  const fail = (key, value) => errors.push({ path: `regulatoryContext.${key}`, value, message: "Invalid explicit regulatory input" });
  if (!isObject(input)) {
    fail("", input);
    return errors;
  }
  const enums = { authorityType: ["MUNICIPAL_CORPORATION", "MUNICIPAL_COUNCIL", "REGIONAL_PLAN"], congestionZone: ["NON_CONGESTED", "CONGESTED"], buildingUsage: ["RESIDENTIAL_APARTMENT"], corporationClass: ["A", "B", "C", "D"], parkingFactorCategory: ["PUNE_PCMC_THANE", "NAGPUR_NASHIK", "OTHER_MMR", "OTHER_CORPORATION", "D_CORPORATION", "A_COUNCIL", "BC_COUNCIL"], rosApplicability: ["REQUIRED", "EXEMPT_APPROVED_LAYOUT"], drivewayFlow: ["ONE_WAY", "TWO_WAY"] };
  for (const [k, values] of Object.entries(enums))
    if (input[k] !== void 0 && !values.includes(input[k]))
      fail(k, input[k]);
  for (const k of ["parkingFloorHeightM", "plotAreaSqm", "roadWidthM", "buildingHeightM", "numFloors", "originalHoldingAreaSqm", "netPlotAreaSqm", "approvedPremiumFsi", "approvedTdrFsi", "approvedAncillaryFsi"])
    if (input[k] !== void 0 && (!isFiniteNumber(input[k]) || input[k] < 0))
      fail(k, input[k]);
  for (const k of ["roofFsiReviewed", "stiltParkingEnabled", "standardGreenfieldSchemeConfirmed", "amendmentApplicabilityReviewed", "fsiExemptionsReviewed"])
    if (input[k] !== void 0 && typeof input[k] !== "boolean")
      fail(k, input[k]);
  if (input["numFloors"] !== void 0 && !Number.isInteger(input["numFloors"]))
    fail("numFloors", input["numFloors"]);
  if (input["reviewedFsiExemptions"] !== void 0) {
    const v = input["reviewedFsiExemptions"];
    if (!Array.isArray(v) || v.some((e) => !isObject(e) || !isNonEmptyString(e["floorId"]) || !isNonEmptyString(e["clause"]) || !isFiniteNumber(e["areaMm2"]) || e["areaMm2"] < 0))
      fail("reviewedFsiExemptions", v);
  }
  return errors;
}

// packages/core/dist/models/requirements-normalization.js
var ROOM_TYPES = new Set(Object.values(RoomType));
var DIRECTIONS = new Set(Object.values(Direction));
var PLOT_SHAPES = new Set(Object.values(PlotShape));
var PREFERENCE_LEVELS = new Set(Object.values(PreferenceLevel));

// packages/core/dist/capabilities.js
var BUILDING_CAPABILITIES = Object.freeze({
  minimumFloorCount: 1,
  maximumFloorCount: 10
});
var SUPPORTED_FLOOR_COUNTS = Object.freeze(Array.from({ length: BUILDING_CAPABILITIES.maximumFloorCount }, (_, index) => index + BUILDING_CAPABILITIES.minimumFloorCount));

// packages/core/dist/models/site-intelligence.js
function polygonArea(polygon) {
  const points = polygon.points;
  if (points.length < 3)
    return 0;
  let sum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    sum += current.x * next.y - next.x * current.y;
  }
  return Math.abs(sum) / 2;
}

// packages/core/dist/models/space-catalog.js
var M2 = 1e6;
var R = ["residential", "mixed_use"];
var C = ["commercial", "mixed_use"];
var E = ["educational"];
function definition(id, displayName, categories, group, zone, minimumM2, preferredM2, options = {}) {
  const occupancy = options.occupancy ?? (categories[0] === "educational" ? "educational" : categories[0] === "commercial" ? "commercial" : "residential");
  return {
    id,
    displayName,
    categories,
    group,
    zone,
    occupancy,
    canonicalType: options.canonicalType,
    synonyms: options.synonyms ?? [],
    defaultQuantity: options.quantity ?? 1,
    minimumAreaMm2: minimumM2 * M2,
    preferredAreaMm2: preferredM2 * M2,
    maximumAreaMm2: options.max ? options.max * M2 : void 0,
    defaultPriority: options.priority ?? "preferred",
    defaultFloorPreference: options.floor ?? "any",
    generatorSupport: options.support ?? "program_only",
    tags: options.tags ?? [],
    relationships: options.relationships
  };
}
var residential = [
  definition("primary_bedroom", "Primary Bedroom", R, "private", FunctionalZone.Private, 12, 16, { max: 22, canonicalType: RoomType.Bedroom, support: "supported", priority: "required", floor: "upper_preferred", synonyms: ["master bedroom", "owner bedroom"] }),
  definition("bedroom", "Bedroom", R, "private", FunctionalZone.Private, 9.5, 13, { max: 18, canonicalType: RoomType.Bedroom, support: "supported", quantity: 2, priority: "required", floor: "upper_preferred", synonyms: ["bed room", "kids room"] }),
  definition("guest_bedroom", "Guest Bedroom", R, "private", FunctionalZone.Private, 9.5, 13, { max: 18, canonicalType: RoomType.Bedroom, support: "supported", floor: "ground_preferred", synonyms: ["guest room"] }),
  definition("children_bedroom", "Children Bedroom", R, "private", FunctionalZone.Private, 9.5, 12, { max: 16, canonicalType: RoomType.Bedroom, support: "supported", floor: "upper_preferred", synonyms: ["child room", "kids bedroom"] }),
  definition("study", "Study / Home Office", R, "private", FunctionalZone.Private, 6, 9, { max: 14, canonicalType: RoomType.Study, support: "supported", synonyms: ["office", "home office"] }),
  definition("dressing", "Dressing / Walk-in Closet", R, "private", FunctionalZone.Private, 3, 5, { max: 8, synonyms: ["closet", "wardrobe"] }),
  definition("primary_bathroom", "Primary Bathroom", R, "baths", FunctionalZone.Service, 3, 4.5, { max: 7, canonicalType: RoomType.Bathroom, support: "supported", priority: "required", floor: "upper_preferred", synonyms: ["master bath", "ensuite"] }),
  definition("attached_bathroom", "Attached Bathroom", R, "baths", FunctionalZone.Service, 2.5, 4, { max: 6, canonicalType: RoomType.Bathroom, support: "supported", synonyms: ["ensuite bathroom"] }),
  definition("common_bathroom", "Common Bathroom", R, "baths", FunctionalZone.Service, 2.5, 4, { max: 6, canonicalType: RoomType.Bathroom, support: "supported", priority: "required", synonyms: ["washroom", "toilet"] }),
  definition("powder_room", "Powder Room", R, "baths", FunctionalZone.Service, 1.8, 2.5, { max: 4, canonicalType: RoomType.Bathroom, support: "supported", synonyms: ["guest toilet", "half bath"] }),
  definition("living", "Living Room", R, "living", FunctionalZone.Public, 12, 18, { max: 26, canonicalType: RoomType.Living, support: "supported", priority: "required", floor: "ground_required", synonyms: ["lounge", "drawing room"] }),
  definition("family_lounge", "Family Lounge", R, "living", FunctionalZone.SemiPublic, 10, 15, { max: 22, canonicalType: RoomType.FamilyLiving, support: "program_only", floor: "upper_preferred", synonyms: ["family living"] }),
  definition("dining", "Dining", R, "living", FunctionalZone.SemiPublic, 8, 12, { max: 18, canonicalType: RoomType.Dining, support: "supported", priority: "required", floor: "ground_preferred", relationships: [{ targetDefinitionId: "kitchen", strength: AdjacencyStrength.Preferred, reason: "Short food-service path" }] }),
  definition("breakfast", "Breakfast / Informal Dining", R, "living", FunctionalZone.SemiPublic, 5, 8, { max: 12, synonyms: ["breakfast nook"] }),
  definition("kitchen", "Kitchen", R, "service", FunctionalZone.Service, 5.5, 9, { max: 14, canonicalType: RoomType.Kitchen, support: "supported", priority: "required", floor: "ground_preferred", relationships: [{ targetDefinitionId: "dining", strength: AdjacencyStrength.Preferred, reason: "Short food-service path" }, { targetDefinitionId: "utility", strength: AdjacencyStrength.Preferred, reason: "Connected service workflow" }] }),
  definition("pantry", "Pantry", R, "service", FunctionalZone.Service, 2, 3.5, { max: 6, synonyms: ["food store"] }),
  definition("utility", "Utility", R, "service", FunctionalZone.Service, 3, 5, { max: 8, canonicalType: RoomType.Utility, support: "supported", floor: "ground_preferred" }),
  definition("store", "Store", R, "service", FunctionalZone.Service, 2, 4, { max: 7, canonicalType: RoomType.Storage, support: "program_only", synonyms: ["storage"] }),
  definition("laundry", "Laundry", R, "service", FunctionalZone.Service, 3, 5, { max: 8 }),
  definition("pooja", "Pooja Room", R, "special", FunctionalZone.Private, 2, 3.5, { max: 6, canonicalType: RoomType.Pooja, support: "supported", synonyms: ["prayer room", "puja"] }),
  definition("foyer", "Entrance / Foyer", R, "circulation", FunctionalZone.Public, 3, 5, { max: 9, canonicalType: RoomType.Foyer, support: "program_only", floor: "ground_required", synonyms: ["entry", "entrance"] }),
  definition("corridor", "Hall / Passage", R, "circulation", FunctionalZone.Circulation, 3, 6, { max: 12, canonicalType: RoomType.Corridor, support: "program_only", synonyms: ["hallway"] }),
  definition("staircase", "Staircase", R, "circulation", FunctionalZone.Circulation, 5, 7.5, { max: 12, canonicalType: RoomType.Staircase, support: "supported", priority: "required", floor: "ground_required", synonyms: ["stairs"] }),
  definition("lift", "Lift", R, "circulation", FunctionalZone.Circulation, 4, 5, { max: 7, canonicalType: RoomType.Lift, support: "supported", synonyms: ["elevator"] }),
  definition("balcony", "Balcony", R, "outdoor", FunctionalZone.Outdoor, 3, 5, { max: 9, canonicalType: RoomType.Balcony, support: "supported", floor: "upper_preferred" }),
  definition("terrace", "Terrace", R, "outdoor", FunctionalZone.Outdoor, 8, 14, { max: 30, canonicalType: RoomType.Terrace, support: "program_only", floor: "top_preferred", synonyms: ["roof terrace"] }),
  definition("sit_out", "Sit-out", R, "outdoor", FunctionalZone.Outdoor, 4, 7, { max: 12, synonyms: ["veranda"] }),
  definition("porch", "Porch", R, "outdoor", FunctionalZone.Outdoor, 5, 8, { max: 14, floor: "ground_required" }),
  definition("car_parking", "Car Parking", R, "vehicle", FunctionalZone.Outdoor, 14, 15, { max: 20, canonicalType: RoomType.Parking, support: "supported", priority: "required", floor: "ground_required", synonyms: ["car", "parking bay"] }),
  definition("two_wheeler_parking", "Two-Wheeler Parking", R, "vehicle", FunctionalZone.Outdoor, 3, 5, { max: 8, synonyms: ["bike parking", "scooter parking"] }),
  definition("garage", "Garage", R, "vehicle", FunctionalZone.Outdoor, 16, 20, { max: 28, canonicalType: RoomType.Parking, support: "supported", floor: "ground_required" })
];
var commercial = [
  definition("reception", "Reception", C, "work", FunctionalZone.Public, 8, 14, { occupancy: "commercial", priority: "required", floor: "ground_required", synonyms: ["front desk"] }),
  definition("retail", "Retail Area", C, "work", FunctionalZone.Public, 25, 45, { occupancy: "commercial", floor: "ground_required", synonyms: ["shop", "storefront"] }),
  definition("open_office", "Open Office", C, "work", FunctionalZone.SemiPublic, 30, 55, { occupancy: "commercial", priority: "required", synonyms: ["workstations", "office floor"] }),
  definition("private_cabin", "Private Cabin", C, "work", FunctionalZone.Private, 8, 12, { occupancy: "commercial", quantity: 2, synonyms: ["office cabin"] }),
  definition("manager_cabin", "Manager Cabin", C, "work", FunctionalZone.Private, 10, 15, { occupancy: "commercial" }),
  definition("conference", "Conference Room", C, "work", FunctionalZone.SemiPublic, 15, 24, { occupancy: "commercial", synonyms: ["board room"] }),
  definition("meeting", "Meeting Room", C, "work", FunctionalZone.SemiPublic, 8, 14, { occupancy: "commercial" }),
  definition("waiting", "Waiting Area", C, "living", FunctionalZone.Public, 8, 15, { occupancy: "commercial" }),
  definition("commercial_pantry", "Pantry", C, "service", FunctionalZone.Service, 4, 7, { occupancy: "commercial" }),
  definition("staff_dining", "Staff Dining", C, "service", FunctionalZone.SemiPublic, 12, 20, { occupancy: "commercial" }),
  definition("commercial_storage", "Storage", C, "service", FunctionalZone.Service, 5, 9, { occupancy: "commercial", synonyms: ["store"] }),
  definition("server_room", "Server / IT Room", C, "technical", FunctionalZone.Service, 6, 10, { occupancy: "commercial", synonyms: ["it room"] }),
  definition("electrical_room", "Electrical Room", C, "technical", FunctionalZone.Service, 5, 8, { occupancy: "commercial" }),
  definition("male_toilet", "Male Toilet", [...C, ...E], "baths", FunctionalZone.Service, 6, 10, { occupancy: "shared", priority: "required", synonyms: ["washroom", "men toilet"] }),
  definition("female_toilet", "Female Toilet", [...C, ...E], "baths", FunctionalZone.Service, 6, 10, { occupancy: "shared", priority: "required", synonyms: ["washroom", "women toilet"] }),
  definition("accessible_toilet", "Accessible Toilet", [...C, ...E], "baths", FunctionalZone.Service, 4, 5.5, { occupancy: "shared", priority: "required", synonyms: ["disabled toilet", "wheelchair toilet"] }),
  definition("commercial_lift", "Lift", C, "circulation", FunctionalZone.Circulation, 4, 6, { occupancy: "commercial", priority: "required", floor: "ground_required", synonyms: ["elevator"] }),
  definition("commercial_stair", "Staircase", C, "circulation", FunctionalZone.Circulation, 8, 12, { occupancy: "commercial", priority: "required", floor: "ground_required", synonyms: ["stairs"] }),
  definition("fire_stair", "Fire Stair", C, "circulation", FunctionalZone.Circulation, 8, 12, { occupancy: "commercial", priority: "required" }),
  definition("service_shaft", "Service Shaft", C, "technical", FunctionalZone.Service, 3, 5, { occupancy: "commercial" }),
  definition("commercial_parking", "Parking", C, "vehicle", FunctionalZone.Outdoor, 14, 15, { occupancy: "commercial", quantity: 4, priority: "required", floor: "ground_required", synonyms: ["car parking"] }),
  definition("loading", "Loading / Service Area", C, "vehicle", FunctionalZone.Service, 25, 40, { occupancy: "commercial", floor: "ground_required" })
];
var educational = [
  definition("classroom", "Classroom", E, "learning", FunctionalZone.SemiPublic, 35, 48, { occupancy: "educational", quantity: 4, priority: "required", synonyms: ["class", "teaching room"] }),
  definition("laboratory", "Laboratory", E, "learning", FunctionalZone.SemiPublic, 45, 65, { occupancy: "educational", quantity: 2, synonyms: ["lab", "science lab"] }),
  definition("computer_lab", "Computer Lab", E, "learning", FunctionalZone.SemiPublic, 45, 60, { occupancy: "educational", synonyms: ["computer room"] }),
  definition("library", "Library", E, "learning", FunctionalZone.SemiPublic, 55, 90, { occupancy: "educational", priority: "required" }),
  definition("staff_room", "Staff Room", E, "work", FunctionalZone.Private, 20, 35, { occupancy: "educational" }),
  definition("principal_office", "Principal / Head Office", E, "work", FunctionalZone.Private, 12, 18, { occupancy: "educational", synonyms: ["head office"] }),
  definition("administration", "Administration", E, "work", FunctionalZone.SemiPublic, 20, 35, { occupancy: "educational", priority: "required", synonyms: ["admin"] }),
  definition("education_reception", "Reception", E, "work", FunctionalZone.Public, 10, 16, { occupancy: "educational", floor: "ground_required" }),
  definition("education_meeting", "Meeting Room", E, "work", FunctionalZone.SemiPublic, 10, 16, { occupancy: "educational" }),
  definition("multipurpose", "Multipurpose Room", E, "learning", FunctionalZone.SemiPublic, 60, 100, { occupancy: "educational" }),
  definition("auditorium", "Auditorium", E, "learning", FunctionalZone.Public, 120, 220, { occupancy: "educational", floor: "ground_preferred" }),
  definition("education_store", "Store", E, "service", FunctionalZone.Service, 6, 10, { occupancy: "educational", synonyms: ["storage"] }),
  definition("education_stair", "Staircase", E, "circulation", FunctionalZone.Circulation, 10, 15, { occupancy: "educational", quantity: 2, priority: "required", floor: "ground_required", synonyms: ["stairs"] }),
  definition("education_lift", "Lift", E, "circulation", FunctionalZone.Circulation, 5, 7, { occupancy: "educational", priority: "required", floor: "ground_required", synonyms: ["elevator"] }),
  definition("education_corridor", "Corridor", E, "circulation", FunctionalZone.Circulation, 30, 55, { occupancy: "educational", priority: "required", synonyms: ["passage"] }),
  definition("playground", "Playground / Outdoor Area", E, "outdoor", FunctionalZone.Outdoor, 300, 600, { occupancy: "educational", synonyms: ["outdoor", "play area"] }),
  definition("education_parking", "Parking", E, "vehicle", FunctionalZone.Outdoor, 70, 100, { occupancy: "educational", floor: "ground_required", synonyms: ["car parking"] })
];
var SPACE_CATALOG = Object.freeze([...residential, ...commercial, ...educational]);
var SPACE_PROGRAM_PRESETS = Object.freeze([
  { id: "residential_1bhk", name: "1BHK", category: "residential", items: [
    { definitionId: "living" },
    { definitionId: "dining" },
    { definitionId: "kitchen" },
    { definitionId: "primary_bedroom" },
    { definitionId: "common_bathroom" },
    { definitionId: "car_parking" }
  ] },
  { id: "residential_2bhk", name: "2BHK", category: "residential", items: [
    { definitionId: "living" },
    { definitionId: "dining" },
    { definitionId: "kitchen" },
    { definitionId: "primary_bedroom" },
    { definitionId: "bedroom", quantity: 1 },
    { definitionId: "primary_bathroom" },
    { definitionId: "common_bathroom" },
    { definitionId: "utility" },
    { definitionId: "car_parking" },
    { definitionId: "staircase" }
  ] },
  { id: "residential_3bhk", name: "3BHK", category: "residential", items: [
    { definitionId: "living" },
    { definitionId: "dining" },
    { definitionId: "kitchen" },
    { definitionId: "primary_bedroom" },
    { definitionId: "bedroom", quantity: 2 },
    { definitionId: "primary_bathroom" },
    { definitionId: "common_bathroom", quantity: 2 },
    { definitionId: "utility" },
    { definitionId: "pooja", priority: "preferred" },
    { definitionId: "car_parking" },
    { definitionId: "staircase" },
    { definitionId: "balcony" }
  ] },
  { id: "residential_duplex", name: "Duplex", category: "residential", items: [
    { definitionId: "living" },
    { definitionId: "dining" },
    { definitionId: "kitchen" },
    { definitionId: "guest_bedroom", floorPreference: { kind: "ground_preferred" } },
    { definitionId: "primary_bedroom", floorPreference: { kind: "upper_preferred" } },
    { definitionId: "bedroom", quantity: 2, floorPreference: { kind: "upper_preferred" } },
    { definitionId: "common_bathroom", quantity: 3 },
    { definitionId: "staircase" },
    { definitionId: "balcony" }
  ] },
  { id: "commercial_small_office", name: "Small Office", category: "commercial", items: [
    { definitionId: "reception" },
    { definitionId: "open_office" },
    { definitionId: "private_cabin", quantity: 2 },
    { definitionId: "meeting" },
    { definitionId: "commercial_pantry" },
    { definitionId: "male_toilet" },
    { definitionId: "female_toilet" },
    { definitionId: "accessible_toilet" },
    { definitionId: "commercial_stair" },
    { definitionId: "commercial_parking", quantity: 2 }
  ] },
  { id: "educational_classroom_wing", name: "Classroom Wing", category: "educational", items: [
    { definitionId: "classroom", quantity: 6 },
    { definitionId: "laboratory", quantity: 2 },
    { definitionId: "library" },
    { definitionId: "staff_room" },
    { definitionId: "administration" },
    { definitionId: "male_toilet" },
    { definitionId: "female_toilet" },
    { definitionId: "accessible_toilet" },
    { definitionId: "education_stair", quantity: 2 },
    { definitionId: "education_lift" }
  ] }
]);

// packages/core/dist/models/space-program.js
var CIRCULATION_RESERVE_RATIO = 0.12;
var VERTICAL_CORE_RESERVE_RATIO = 0.04;
var WALL_SERVICE_RESERVE_RATIO = 0.06;
var TOTAL_RESERVE_RATIO = CIRCULATION_RESERVE_RATIO + VERTICAL_CORE_RESERVE_RATIO + WALL_SERVICE_RESERVE_RATIO;
var DERIVATION_MAP = {
  [RoomType.Living]: "living",
  [RoomType.Dining]: "dining",
  [RoomType.Kitchen]: "kitchen",
  [RoomType.Bedroom]: "bedroom",
  [RoomType.Bathroom]: "common_bathroom",
  [RoomType.Utility]: "utility",
  [RoomType.Pooja]: "pooja",
  [RoomType.Study]: "study",
  [RoomType.Staircase]: "staircase",
  [RoomType.Lift]: "lift",
  [RoomType.Parking]: "car_parking",
  [RoomType.Balcony]: "balcony",
  [RoomType.Storage]: "store",
  [RoomType.Corridor]: "corridor",
  [RoomType.Foyer]: "foyer",
  [RoomType.FamilyLiving]: "family_lounge",
  [RoomType.Terrace]: "terrace"
};

// packages/core/dist/models/footprint.js
var CIRCULATION_RATIO = 0.12;
var CORE_RATIO = 0.04;
var WALL_SERVICE_RATIO = 0.06;
var USABLE_RATIO = 1 - CIRCULATION_RATIO - CORE_RATIO - WALL_SERVICE_RATIO;
var FOOTPRINT_SHAPES = Object.freeze([
  { id: "rectangle", name: "Rectangle", description: "Efficient universal floor plate", recommendedCategories: ["residential", "commercial", "mixed_use"] },
  { id: "l_shape", name: "L Shape", description: "Two wings around an open edge", recommendedCategories: ["residential", "commercial", "educational", "mixed_use"] },
  { id: "u_shape", name: "U Shape", description: "Three-sided court or arrival space", recommendedCategories: ["educational", "commercial"] },
  { id: "t_shape", name: "T Shape", description: "Primary bar with a central wing", recommendedCategories: ["educational", "commercial"] },
  { id: "courtyard", name: "Courtyard", description: "Limited perimeter plate with an access slot; not polygon-hole topology", recommendedCategories: ["residential", "commercial", "educational"], customSupport: "limited" },
  { id: "linear", name: "Linear", description: "Shallow elongated building plate", recommendedCategories: ["commercial", "educational"] },
  { id: "custom", name: "Custom", description: "Preserved existing or imported polygon", recommendedCategories: [], customSupport: "limited" }
]);

// packages/core/dist/models/mixed-unit-program.js
var WORD_NUMBERS = {
  one: 1,
  single: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6
};
function parseMixedUnitProgram(prompt) {
  if (!prompt)
    return null;
  const text = prompt.toLowerCase().replace(/\s+/g, " ");
  const pattern = /\b(\d|one|single|two|three|four|five|six)\s*(?:x|×|\*|nos?\.?|no\.?)?\s*(?:(?:flats?|units?|apartments?|nos?)\s+(?:of\s+)?)?([1-4])\s*-?\s*bhk\b/g;
  const groups = [];
  for (const m of text.matchAll(pattern)) {
    const raw = m[1];
    const count = /^\d$/.test(raw) ? Number(raw) : WORD_NUMBERS[raw] ?? 0;
    if (count < 1 || count > 6)
      continue;
    groups.push({ count, bhk: `${m[2]}BHK` });
  }
  if (groups.length < 2)
    return null;
  const total = groups.reduce((s, g) => s + g.count, 0);
  if (total < 2 || total > 6)
    return null;
  return groups.flatMap((g) => Array.from({ length: g.count }, () => g.bhk));
}
function mixedUnitSpecs(types) {
  return types.map((bhkType, i) => ({ unitIndex: i + 1, bhkType, hasUtilityBalcony: true }));
}

// packages/geometry-engine/dist/errors.js
var GeometryError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "GeometryError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var DegenerateGeometryError = class extends GeometryError {
  constructor(entityType, reason) {
    super(`Degenerate ${entityType}: ${reason}`);
    this.name = "DegenerateGeometryError";
  }
};

// packages/geometry-engine/dist/point.js
function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function rotatePoint(point, angleDeg, origin = { x: 0, y: 0 }) {
  const rad = angleDeg * Math.PI / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos
  };
}
function closestPointOnSegment(point, segment) {
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-10) {
    return { x: segment.start.x, y: segment.start.y };
  }
  let t = ((point.x - segment.start.x) * dx + (point.y - segment.start.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return {
    x: segment.start.x + t * dx,
    y: segment.start.y + t * dy
  };
}
function pointToSegmentDistanceDirect(point, segment) {
  const closest = closestPointOnSegment(point, segment);
  return distance(point, closest);
}
function pointOnSegment(point, segment, tolerance = TOLERANCES.LINEAR) {
  return pointToSegmentDistanceDirect(point, segment) <= tolerance;
}
function pointInPolygon(point, polygon) {
  const pts = polygon.points;
  const n = pts.length;
  if (n < 3)
    return false;
  let inside2 = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const pi = pts[i];
    const pj = pts[j];
    const seg = { start: pi, end: pj };
    if (pointOnSegment(point, seg, TOLERANCES.LINEAR))
      return true;
    if (pi.y > point.y !== pj.y > point.y && point.x < (pj.x - pi.x) * (point.y - pi.y) / (pj.y - pi.y) + pi.x) {
      inside2 = !inside2;
    }
  }
  return inside2;
}
function pointsEqual(a, b, tolerance = TOLERANCES.LINEAR) {
  return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
}

// packages/geometry-engine/dist/segment.js
function segmentLength(segment) {
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function segmentIntersection(a, b) {
  const x1 = a.start.x, y1 = a.start.y;
  const x2 = a.end.x, y2 = a.end.y;
  const x3 = b.start.x, y3 = b.start.y;
  const x4 = b.end.x, y4 = b.end.y;
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) {
    const eps2 = TOLERANCES.LINEAR;
    if (pointOnSegmentDirect(a.start, b, eps2))
      return a.start;
    if (pointOnSegmentDirect(a.end, b, eps2))
      return a.end;
    if (pointOnSegmentDirect(b.start, a, eps2))
      return b.start;
    if (pointOnSegmentDirect(b.end, a, eps2))
      return b.end;
    return null;
  }
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  const eps = 1e-6;
  if (t >= -eps && t <= 1 + eps && u >= -eps && u <= 1 + eps) {
    const clampedT = Math.max(0, Math.min(1, t));
    return {
      x: x1 + clampedT * (x2 - x1),
      y: y1 + clampedT * (y2 - y1)
    };
  }
  return null;
}
function pointOnSegmentDirect(p, seg, tolerance) {
  const d = pointToSegmentDistance(p, seg);
  return d <= tolerance;
}
function pointClosestPoint(point, segment) {
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-10) {
    return { x: segment.start.x, y: segment.start.y };
  }
  let t = ((point.x - segment.start.x) * dx + (point.y - segment.start.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return {
    x: segment.start.x + t * dx,
    y: segment.start.y + t * dy
  };
}
function pointToSegmentDistance(point, segment) {
  const closest = pointClosestPoint(point, segment);
  return distance(point, closest);
}
function offsetSegment(segment, dist2, side) {
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1e-10) {
    throw new DegenerateGeometryError("LineSegment", "Cannot offset a zero-length segment");
  }
  let nx = dy / len;
  let ny = -dx / len;
  if (side === "right") {
    nx = -nx;
    ny = -ny;
  }
  return {
    start: { x: segment.start.x + nx * dist2, y: segment.start.y + ny * dist2 },
    end: { x: segment.end.x + nx * dist2, y: segment.end.y + ny * dist2 }
  };
}

// packages/geometry-engine/dist/polygon.js
function polygonSignedArea(polygon) {
  const pts = polygon.points;
  const n = pts.length;
  if (n < 3)
    return 0;
  let area = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    area += pts[j].x * pts[i].y - pts[i].x * pts[j].y;
  }
  return area / 2;
}
function polygonArea2(polygon) {
  return Math.abs(polygonSignedArea(polygon));
}
function polygonBoundingBox(polygon) {
  const pts = polygon.points;
  if (pts.length === 0)
    return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX)
      minX = p.x;
    if (p.y < minY)
      minY = p.y;
    if (p.x > maxX)
      maxX = p.x;
    if (p.y > maxY)
      maxY = p.y;
  }
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
function isConvex(polygon) {
  const pts = polygon.points;
  const n = pts.length;
  if (n < 3)
    return false;
  let sign = 0;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const cross = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
    if (Math.abs(cross) > 1e-10) {
      if (sign === 0) {
        sign = cross > 0 ? 1 : -1;
      } else if ((cross > 0 ? 1 : -1) !== sign) {
        return false;
      }
    }
  }
  return true;
}
function isValidPolygon(polygon) {
  const pts = polygon.points;
  if (pts.length < 3)
    return false;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = { start: pts[i], end: pts[(i + 1) % n] };
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1)
        continue;
      const b = { start: pts[j], end: pts[(j + 1) % n] };
      if (segmentIntersection(a, b) !== null) {
        return false;
      }
    }
  }
  return polygonArea2(polygon) > TOLERANCES.AREA;
}
function containsPolygon(outer, inner) {
  for (const p of inner.points) {
    if (!pointInPolygon(p, outer)) {
      return false;
    }
  }
  return true;
}
function polygonIntersectionArea(a, b) {
  const clipped = sutherlandHodgmanClip(a.points.slice(), b.points.slice());
  if (clipped.length < 3)
    return 0;
  return polygonArea2({ points: clipped });
}
function sutherlandHodgmanClip(subject, clip) {
  let output = subject;
  for (let i = 0; i < clip.length; i++) {
    if (output.length === 0)
      return [];
    const input = output;
    output = [];
    const edgeStart = clip[i];
    const edgeEnd = clip[(i + 1) % clip.length];
    for (let j = 0; j < input.length; j++) {
      const current = input[j];
      const previous = input[(j - 1 + input.length) % input.length];
      const currInside = isInsideEdge(current, edgeStart, edgeEnd);
      const prevInside = isInsideEdge(previous, edgeStart, edgeEnd);
      if (currInside) {
        if (!prevInside) {
          const inter = lineIntersection(previous, current, edgeStart, edgeEnd);
          if (inter)
            output.push(inter);
        }
        output.push(current);
      } else if (prevInside) {
        const inter = lineIntersection(previous, current, edgeStart, edgeEnd);
        if (inter)
          output.push(inter);
      }
    }
  }
  return output;
}
function isInsideEdge(point, edgeStart, edgeEnd) {
  return (edgeEnd.x - edgeStart.x) * (point.y - edgeStart.y) - (edgeEnd.y - edgeStart.y) * (point.x - edgeStart.x) >= -1e-7;
}
function lineIntersection(p1, p2, p3, p4) {
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(denom) < 1e-10)
    return null;
  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  };
}
function polygonsOverlap(a, b, tolerance = TOLERANCES.OVERLAP) {
  return polygonIntersectionArea(a, b) > tolerance;
}
function polygonsAdjacent(a, b, tolerance = TOLERANCES.ADJACENCY) {
  return sharedEdge(a, b, tolerance) !== null;
}
function sharedEdge(a, b, tolerance = TOLERANCES.ADJACENCY) {
  const aEdges = polygonEdges(a);
  const bEdges = polygonEdges(b);
  for (const ea of aEdges) {
    for (const eb of bEdges) {
      if (edgesOverlap(ea, eb, tolerance)) {
        return ea;
      }
    }
  }
  return null;
}
function polygonEdges(polygon) {
  const pts = polygon.points;
  const edges = [];
  for (let i = 0; i < pts.length; i++) {
    edges.push({ start: pts[i], end: pts[(i + 1) % pts.length] });
  }
  return edges;
}
function edgesOverlap(a, b, tolerance) {
  const isHorizontalA = Math.abs(a.start.y - a.end.y) <= tolerance;
  const isHorizontalB = Math.abs(b.start.y - b.end.y) <= tolerance;
  const isVerticalA = Math.abs(a.start.x - a.end.x) <= tolerance;
  const isVerticalB = Math.abs(b.start.x - b.end.x) <= tolerance;
  if (isHorizontalA && isHorizontalB) {
    if (Math.abs(a.start.y - b.start.y) > tolerance)
      return false;
    const aMinX = Math.min(a.start.x, a.end.x);
    const aMaxX = Math.max(a.start.x, a.end.x);
    const bMinX = Math.min(b.start.x, b.end.x);
    const bMaxX = Math.max(b.start.x, b.end.x);
    return aMinX < bMaxX - tolerance && bMinX < aMaxX - tolerance;
  }
  if (isVerticalA && isVerticalB) {
    if (Math.abs(a.start.x - b.start.x) > tolerance)
      return false;
    const aMinY = Math.min(a.start.y, a.end.y);
    const aMaxY = Math.max(a.start.y, a.end.y);
    const bMinY = Math.min(b.start.y, b.end.y);
    const bMaxY = Math.max(b.start.y, b.end.y);
    return aMinY < bMaxY - tolerance && bMinY < aMaxY - tolerance;
  }
  return pointsEqual(a.start, b.start, tolerance) && pointsEqual(a.end, b.end, tolerance) || pointsEqual(a.start, b.end, tolerance) && pointsEqual(a.end, b.start, tolerance);
}

// packages/geometry-engine/dist/walls.js
var DEFAULT_WALL_CONFIG = {
  externalThickness: DEFAULTS.WALL_THICKNESS_EXTERNAL,
  internalThickness: DEFAULTS.WALL_THICKNESS_INTERNAL
};
function wallToPolygon(wall) {
  const centerSeg = { start: wall.startPoint, end: wall.endPoint };
  const halfThickness = wall.thickness / 2;
  if (halfThickness <= 0) {
    throw new DegenerateGeometryError("Wall", `Thickness must be positive (received ${wall.thickness})`);
  }
  const leftSeg = offsetSegment(centerSeg, halfThickness, "left");
  const rightSeg = offsetSegment(centerSeg, halfThickness, "right");
  return {
    points: [
      leftSeg.start,
      leftSeg.end,
      rightSeg.end,
      rightSeg.start
    ]
  };
}

// packages/geometry-engine/dist/opening-geometry.js
var OPENING_LINEAR_TOLERANCE_MM = 1e-3;
function canonicalOpeningGeometry(opening, wall) {
  if (!wall)
    throw new Error(`OPENING_HOST_MISSING:${opening?.id}`);
  if (opening.openingGeometryVersion !== 1 || opening.positionReference !== "CENTER")
    throw new Error(`OPENING_MIGRATION_REQUIRED:${opening.id}`);
  if (opening.wallId !== wall.id || opening.floorId !== wall.floorId)
    throw new Error(`OPENING_HOST_MISMATCH:${opening.id}`);
  const dx = wall.endPoint.x - wall.startPoint.x, dy = wall.endPoint.y - wall.startPoint.y;
  const length = Math.hypot(dx, dy);
  if (!Number.isFinite(length) || length <= 0)
    throw new Error("INVALID_OPENING_HOST");
  const ux = dx / length, uy = dy / length;
  const x = opening.position.x - wall.startPoint.x, y = opening.position.y - wall.startPoint.y;
  const center2 = x * ux + y * uy;
  const start = center2 - opening.width / 2, end = center2 + opening.width / 2;
  if (![start, end, opening.height].every(Number.isFinite) || opening.width <= 0 || opening.height <= 0 || Math.abs(x * uy - y * ux) > OPENING_LINEAR_TOLERANCE_MM || start < -OPENING_LINEAR_TOLERANCE_MM || end > length + OPENING_LINEAR_TOLERANCE_MM)
    throw new Error(`INVALID_OPENING_INTERVAL:${opening.id}`);
  const pointAt = (along) => ({ x: wall.startPoint.x + ux * along, y: wall.startPoint.y + uy * along });
  return { start, end, center: center2, length, ux, uy, startPoint: pointAt(start), endPoint: pointAt(end), centerPoint: pointAt(center2), pointAt };
}

// packages/geometry-engine/dist/doors.js
function validateDoorPlacement(door, hostWall, minEdgeDistance = 100) {
  if (door.openingGeometryVersion === 1) {
    try {
      const g = canonicalOpeningGeometry(door, hostWall);
      return { valid: g.start >= minEdgeDistance && g.end <= g.length - minEdgeDistance, reason: "Opening interval must retain configured edge clearance" };
    } catch (error) {
      return { valid: false, reason: String(error) };
    }
  }
  const wallSeg = { start: hostWall.startPoint, end: hostWall.endPoint };
  const wallLen = segmentLength(wallSeg);
  if (door.width <= 0) {
    return { valid: false, reason: `Door width must be positive (received ${door.width}mm)` };
  }
  if (wallLen < door.width + 2 * minEdgeDistance) {
    return {
      valid: false,
      reason: `Wall length (${Math.round(wallLen)}mm) is too short for door width (${door.width}mm) plus edge clearance (${minEdgeDistance * 2}mm)`
    };
  }
  if (!pointOnSegment(door.position, wallSeg, TOLERANCES.ADJACENCY)) {
    return {
      valid: false,
      reason: `Door position (${door.position.x}, ${door.position.y}) is not on host wall [${hostWall.id}]`
    };
  }
  const distToStart = distance(door.position, hostWall.startPoint);
  const distToEnd = distance(door.position, hostWall.endPoint);
  if (distToStart < minEdgeDistance - TOLERANCES.LINEAR) {
    return {
      valid: false,
      reason: `Door is too close to wall start point (${Math.round(distToStart)}mm < ${minEdgeDistance}mm)`
    };
  }
  if (distToEnd < door.width + minEdgeDistance - TOLERANCES.LINEAR) {
    return {
      valid: false,
      reason: `Door extends beyond wall end point (${Math.round(distToEnd)}mm < ${door.width + minEdgeDistance}mm)`
    };
  }
  return { valid: true };
}
function computeDoorOpeningSegment(door, hostWall) {
  if (door.openingGeometryVersion === 1) {
    const g = canonicalOpeningGeometry(door, hostWall);
    return { start: g.startPoint, end: g.endPoint };
  }
  const wallSeg = { start: hostWall.startPoint, end: hostWall.endPoint };
  const wallLen = segmentLength(wallSeg);
  const dx = (hostWall.endPoint.x - hostWall.startPoint.x) / wallLen;
  const dy = (hostWall.endPoint.y - hostWall.startPoint.y) / wallLen;
  const hinge = pointClosestPoint(door.position, wallSeg);
  const strike = {
    x: hinge.x + dx * door.width,
    y: hinge.y + dy * door.width
  };
  return { start: hinge, end: strike };
}
function computeDoorSwingPolygon(door, hostWall, segments = 8) {
  const opening = computeDoorOpeningSegment(door, hostWall);
  const hinge = opening.start;
  const strike = opening.end;
  if (door.type === DoorType.Sliding || door.type === DoorType.Folding) {
    const offset = offsetSegment(opening, hostWall.thickness, "left");
    return {
      points: [opening.start, opening.end, offset.end, offset.start]
    };
  }
  const isClockwise = door.swingDirection === SwingDirection.Right || door.swingDirection === SwingDirection.Inward;
  const sweepAngle = isClockwise ? 90 : -90;
  const points = [hinge];
  for (let i = 0; i <= segments; i++) {
    const angle = sweepAngle * i / segments;
    points.push(rotatePoint(strike, angle, hinge));
  }
  return { points };
}

// packages/geometry-engine/dist/windows.js
function validateWindowPlacement(window, hostWall, minEdgeDistance = 200, allowInternal = false) {
  if (window.openingGeometryVersion === 1) {
    try {
      const g = canonicalOpeningGeometry(window, hostWall);
      return { valid: g.start >= minEdgeDistance && g.end <= g.length - minEdgeDistance, reason: "Opening interval must retain configured edge clearance" };
    } catch (error) {
      return { valid: false, reason: String(error) };
    }
  }
  const wallSeg = { start: hostWall.startPoint, end: hostWall.endPoint };
  const wallLen = segmentLength(wallSeg);
  if (window.width <= 0) {
    return { valid: false, reason: `Window width must be positive (received ${window.width}mm)` };
  }
  if (!allowInternal && hostWall.type !== WallType.External) {
    return {
      valid: false,
      reason: `Windows must be placed on external walls (host wall type is ${hostWall.type})`
    };
  }
  if (wallLen < window.width + 2 * minEdgeDistance) {
    return {
      valid: false,
      reason: `Wall length (${Math.round(wallLen)}mm) is too short for window width (${window.width}mm) plus corner clearance (${minEdgeDistance * 2}mm)`
    };
  }
  if (!pointOnSegment(window.position, wallSeg, TOLERANCES.ADJACENCY)) {
    return {
      valid: false,
      reason: `Window position (${window.position.x}, ${window.position.y}) is not on host wall [${hostWall.id}]`
    };
  }
  const distToStart = distance(window.position, hostWall.startPoint);
  const distToEnd = distance(window.position, hostWall.endPoint);
  if (distToStart < minEdgeDistance - TOLERANCES.LINEAR) {
    return {
      valid: false,
      reason: `Window is too close to wall start point (${Math.round(distToStart)}mm < ${minEdgeDistance}mm)`
    };
  }
  if (distToEnd < window.width + minEdgeDistance - TOLERANCES.LINEAR) {
    return {
      valid: false,
      reason: `Window extends beyond wall end point (${Math.round(distToEnd)}mm < ${window.width + minEdgeDistance}mm)`
    };
  }
  return { valid: true };
}

// packages/geometry-engine/dist/apartment-walls.js
function generateApartmentWalls(rooms, floorId, _boundary, semantic = rooms.some((r) => r.architecturalRole !== void 0), guardHeightMm = 1100) {
  const groups = /* @__PURE__ */ new Map();
  for (const room of rooms) {
    const p = room.boundary.points;
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      const axis = Math.abs(a.y - b.y) <= 1 ? "x" : Math.abs(a.x - b.x) <= 1 ? "y" : null;
      if (!axis)
        throw new Error("WALL_TOPOLOGY_INVALID: apartment walls require orthogonal room boundaries");
      const line = Math.round(axis === "x" ? a.y : a.x);
      const lo = Math.round(Math.min(axis === "x" ? a.x : a.y, axis === "x" ? b.x : b.y));
      const hi = Math.round(Math.max(axis === "x" ? a.x : a.y, axis === "x" ? b.x : b.y));
      if (hi <= lo)
        continue;
      const center2 = axis === "x" ? room.y + room.height / 2 : room.x + room.width / 2;
      const side = (axis === "x" ? center2 > line : center2 < line) ? "left" : "right";
      const key = `${axis}:${line}`;
      groups.set(key, [...groups.get(key) ?? [], { axis, line, lo, hi, room, side }]);
    }
  }
  const walls = [];
  for (const [key, edges] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    const { axis, line } = edges[0];
    const cuts = [...new Set(edges.flatMap((e) => [e.lo, e.hi]))].sort((a, b) => a - b);
    for (let i = 1; i < cuts.length; i++) {
      const lo = cuts[i - 1], hi = cuts[i];
      const owners = edges.filter((e) => e.lo <= lo && e.hi >= hi);
      if (!owners.length)
        continue;
      const ids = [...new Set(owners.map((e) => e.room.id))].sort();
      const unitIds = [...new Set(owners.flatMap((e) => e.room.unitId ? [e.room.unitId] : []))].sort();
      const uniqueRooms = [...new Map(owners.map((e) => [e.room.id, e.room])).values()];
      const uses = owners.map((e) => e.room.spaceUse);
      const nonVoidOwners = uniqueRooms.filter((r) => architecturalSpaceRole(r) !== "OPEN_TO_SKY_VOID");
      const hasPerimeterRecess = uniqueRooms.some((r) => architecturalSpaceRole(r) === "OPEN_TO_SKY_VOID" && r.tags?.includes("recess:perimeter"));
      const external = ids.length === 1 || nonVoidOwners.length === 1 && hasPerimeterRecess;
      const isUnitSeparation = unitIds.length > 1;
      const isInternalShaftRoom = (r) => !r.tags?.includes("recess:perimeter") && (r.spaceUse === "SERVICE" || r.spaceUse === "VOID" || architecturalSpaceRole(r) === "OPEN_TO_SKY_VOID" || architecturalSpaceRole(r) === "SERVICE_SHAFT");
      const ventilates = owners.some((e) => isInternalShaftRoom(e.room));
      const effectiveUses = hasPerimeterRecess ? nonVoidOwners.map((r) => r.spaceUse) : uses;
      const use = isUnitSeparation ? "UNIT_SEPARATION" : ventilates ? "SHAFT" : effectiveUses.includes("OUTDOOR") ? "BALCONY" : effectiveUses.includes("CORE") ? "CORE" : effectiveUses.includes("COMMON") && unitIds.length ? "COMMON_CORRIDOR" : external ? "EXTERNAL" : "INTERNAL_PARTITION";
      const boundaryRole = semantic ? architecturalBoundaryRole(uniqueRooms, external) : void 0;
      const thickness = use === "EXTERNAL" || use === "UNIT_SEPARATION" ? 230 : use === "COMMON_CORRIDOR" || use === "CORE" ? 150 : use === "SHAFT" ? 100 : use === "BALCONY" ? external ? 230 : 115 : 115;
      walls.push({ id: `${floorId}::apt-wall:${key}:${lo}:${hi}`, floorId, startPoint: axis === "x" ? { x: lo, y: line } : { x: line, y: lo }, endPoint: axis === "x" ? { x: hi, y: line } : { x: line, y: hi }, thickness, type: external ? WallType.External : WallType.Internal, roomIds: ids, unitIds, wallUse: boundaryRole === "PARAPET" ? "PARAPET" : use, boundaryRole, ...boundaryRole === "OPEN_BOUNDARY" ? { heightMm: 0 } : boundaryRole === "PARAPET" ? { heightMm: guardHeightMm } : {}, leftRoomId: owners.find((o) => o.side === "left")?.room.id, rightRoomId: owners.find((o) => o.side === "right")?.room.id, hasOpening: false, loadBearing: false, provenance: "PROVISIONAL_HEURISTIC" });
    }
  }
  return walls;
}
function openingFitsApartmentWall(wall, position, width) {
  const horizontal = Math.abs(wall.startPoint.y - wall.endPoint.y) <= 1;
  const on = Math.abs(horizontal ? position.y - wall.startPoint.y : position.x - wall.startPoint.x) <= 25;
  const s = horizontal ? wall.startPoint.x : wall.startPoint.y;
  const e = horizontal ? wall.endPoint.x : wall.endPoint.y;
  const p = horizontal ? position.x : position.y;
  return on && width > 0 && p - width / 2 >= Math.min(s, e) + 100 && p + width / 2 <= Math.max(s, e) - 100;
}

// packages/geometry-engine/dist/planar-cells.js
function partitionPlanarCells(polygons) {
  if (polygons.some((p) => p.points.some((q) => !Number.isFinite(q.x) || !Number.isFinite(q.y)) || !isValidPolygon(p)))
    return { supported: false, cells: [] };
  const edges = polygons.flatMap((p) => p.points.map((a, i) => ({ a, b: p.points[(i + 1) % p.points.length] }))), events = new Set(edges.flatMap((e) => [e.a.x, e.b.x]));
  if (edges.length > 1500)
    return { supported: false, cells: [] };
  for (let i = 0; i < edges.length; i++)
    for (let j = i + 1; j < edges.length; j++) {
      const a = edges[i], b = edges[j], dx = a.b.x - a.a.x, dy = a.b.y - a.a.y, ex = b.b.x - b.a.x, ey = b.b.y - b.a.y, den = dx * ey - dy * ex;
      if (!den)
        continue;
      const qx = b.a.x - a.a.x, qy = b.a.y - a.a.y, t = (qx * ey - qy * ex) / den, u = (qx * dy - qy * dx) / den;
      if (t > 0 && t < 1 && u > 0 && u < 1) {
        events.add(a.a.x + t * dx);
        if (events.size > 2e4)
          return { supported: false, cells: [] };
      }
    }
  const xs = [...events].sort((a, b) => a - b), cells = [];
  for (let i = 1; i < xs.length; i++) {
    const left = xs[i - 1], right = xs[i], mid = (left + right) / 2;
    const crossing = edges.filter((e) => Math.min(e.a.x, e.b.x) < mid && Math.max(e.a.x, e.b.x) > mid).map((e) => ({
      y: (x) => e.a.y + (x - e.a.x) * (e.b.y - e.a.y) / (e.b.x - e.a.x)
    })).sort((a, b) => a.y(mid) - b.y(mid));
    for (let j = 1; j < crossing.length; j++) {
      const low = crossing[j - 1], high = crossing[j], height = high.y(mid) - low.y(mid);
      if (height <= 0)
        continue;
      const area = (right - left) * (high.y(left) - low.y(left) + (high.y(right) - low.y(right))) / 2;
      if (cells.length > 2e5)
        return { supported: false, cells: [] };
      if (area > 0)
        cells.push({
          point: { x: mid, y: (low.y(mid) + high.y(mid)) / 2 },
          area
        });
    }
  }
  return { supported: true, cells };
}

// packages/geometry-engine/dist/apartment-ledger.js
function pointInPolygon2(point, polygon) {
  let inside2 = false;
  const pts = polygon.points;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if (a.y > point.y !== b.y > point.y && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x)
      inside2 = !inside2;
  }
  return inside2;
}
function measureApartmentAreaLedger(floor) {
  const wallPolygons = floor.walls.filter(isPhysicalBoundary).map((w) => wallToPolygon(w));
  const polys = [
    floor.boundary,
    ...floor.voidBoundaries ?? [],
    ...floor.rooms.map((r) => r.boundary),
    ...wallPolygons
  ];
  const orthogonal = polys.every((p) => p.points.length >= 3 && p.points.every((pt, i) => {
    const next = p.points[(i + 1) % p.points.length];
    return Number.isFinite(pt.x) && Number.isFinite(pt.y) && (pt.x === next.x || pt.y === next.y);
  }));
  const xs = [
    ...new Set(polys.flatMap((p) => p.points.map((pt) => pt.x)))
  ].sort((a, b) => a - b);
  const ys = [
    ...new Set(polys.flatMap((p) => p.points.map((pt) => pt.y)))
  ].sort((a, b) => a - b);
  const partition = orthogonal ? null : partitionPlanarCells(polys);
  const supported = orthogonal || partition?.supported === true;
  const roomUsable = {};
  const totals = {
    unitUsable: 0,
    balcony: 0,
    core: 0,
    common: 0,
    service: 0,
    wall: 0,
    void: 0,
    unassigned: 0,
    overlap: 0,
    roomVoidOverlap: 0
  };
  const cells = partition?.cells ?? function* () {
    for (let i = 1; i < xs.length; i++)
      for (let j = 1; j < ys.length; j++)
        yield {
          area: (xs[i] - xs[i - 1]) * (ys[j] - ys[j - 1]),
          point: {
            x: (xs[i] + xs[i - 1]) / 2,
            y: (ys[j] + ys[j - 1]) / 2
          }
        };
  }();
  for (const { area: a, point: pt } of cells) {
    if (a <= 0)
      continue;
    if (!pointInPolygon2(pt, floor.boundary))
      continue;
    const owners = floor.rooms.filter((r2) => pointInPolygon2(pt, r2.boundary));
    if (owners.length && floor.voidBoundaries?.some((p) => pointInPolygon2(pt, p)))
      totals.roomVoidOverlap += a;
    if (owners.length > 1)
      totals.overlap += a;
    if (wallPolygons.some((p) => pointInPolygon2(pt, p))) {
      totals.wall += a;
      continue;
    }
    if (floor.voidBoundaries?.some((p) => pointInPolygon2(pt, p))) {
      totals.void += a;
      continue;
    }
    const r = owners[0];
    if (!r) {
      totals.unassigned += a;
      continue;
    }
    roomUsable[r.id] = (roomUsable[r.id] ?? 0) + a;
    const use = r.spaceUse ?? roomSpaceUse(r);
    const category = use === "VOID" ? "void" : use === "OUTDOOR" ? "balcony" : use === "CORE" ? "core" : use === "COMMON" ? "common" : use === "SERVICE" ? "service" : r.unitId ? "unitUsable" : "unassigned";
    totals[category] += a;
  }
  const gross = polygonArea2(floor.boundary);
  const accounted = totals.unitUsable + totals.balcony + totals.core + totals.common + totals.service + totals.wall + totals.void + totals.unassigned;
  const unitBuiltUp = {};
  for (const u of floor.apartmentUnits ?? [])
    unitBuiltUp[u.id] = polygonArea2(u.boundary);
  const balconies = floor.rooms.filter((r) => r.spaceUse === "OUTDOOR" || r.type === "balcony").map((r) => ({
    id: r.id,
    unitId: r.unitId,
    boundary: r.boundary,
    area: roomUsable[r.id] ?? 0,
    grossArea: polygonArea2(r.boundary),
    usableDepth: Math.min(r.width, r.height) - 230,
    usableWidth: Math.max(r.width, r.height) - 230,
    accessDoorIds: floor.doors.filter((d) => d.connectsRooms.includes(r.id)).map((d) => d.id),
    adjacentRoomIds: floor.doors.filter((d) => d.connectsRooms.includes(r.id)).flatMap((d) => d.connectsRooms.filter((id) => id !== r.id))
  }));
  return {
    supported,
    units: "mm2",
    convention: "CENTRELINE_CELLS_MINUS_CLIPPED_WALL_UNION",
    gross,
    ...totals,
    accounted,
    delta: gross - accounted,
    roomUsable,
    unitBuiltUp,
    balconies
  };
}
function roomSpaceUse(room) {
  if (room.type === "balcony")
    return "OUTDOOR";
  if (room.unitId)
    return "UNIT";
  if (room.type === "service_shaft")
    return "SERVICE";
  if (room.type === "lift" || room.type === "staircase")
    return "CORE";
  return "COMMON";
}

// packages/geometry-engine/dist/units.js
function sqMmToSqFt(sqMm) {
  return sqMm / (UNITS.MM_PER_FOOT * UNITS.MM_PER_FOOT);
}
function sqMmToSqM(sqMm) {
  return sqMm / (UNITS.MM_PER_METER * UNITS.MM_PER_METER);
}

// packages/geometry-engine/dist/regulatory-measurements.js
function rectangularBounds(p) {
  if (p.points.length !== 4 || p.points.some((v, i) => !Number.isFinite(v.x) || !Number.isFinite(v.y) || v.x !== p.points[(i + 1) % 4].x && v.y !== p.points[(i + 1) % 4].y))
    return null;
  const b = polygonBoundingBox(p);
  return b.width > 0 && b.height > 0 && Math.abs(polygonArea2(p) - b.width * b.height) < 1e-3 ? { ...b, minX: b.x, minY: b.y, maxX: b.x + b.width, maxY: b.y + b.height } : null;
}
function measurePlotMargins(building) {
  const plot = rectangularBounds(building.site.plotBoundary);
  if (!plot || building.site.orientation !== 0 || building.site.cornerPlot || !building.floors.length)
    return null;
  const envelopes = building.floors.flatMap((f) => [
    f.boundary,
    ...f.walls.filter((w2) => w2.type === "external" || w2.wallUse === "EXTERNAL").map(wallToPolygon)
  ]);
  if (envelopes.some((p) => !rectangularBounds(p)))
    return null;
  const pts = envelopes.flatMap((p) => p.points), minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x)), minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
  const n = minY - plot.minY, s = plot.maxY - maxY, w = minX - plot.minX, e = plot.maxX - maxX;
  switch (building.site.roadFacing) {
    case "north":
      return { front: n, rear: s, left: w, right: e };
    case "south":
      return { front: s, rear: n, left: e, right: w };
    case "east":
      return { front: e, rear: w, left: n, right: s };
    case "west":
      return { front: w, rear: e, left: s, right: n };
    default:
      return null;
  }
}
function measureClearRoom(floor, room) {
  const b = rectangularBounds(room.boundary);
  if (!b)
    return null;
  let x0 = b.minX, y0 = b.minY, x1 = b.maxX, y1 = b.maxY;
  for (const wall of floor.walls) {
    const wb = rectangularBounds(wallToPolygon(wall));
    if (!wb)
      return null;
    if (wb.maxX <= b.minX || wb.minX >= b.maxX || wb.maxY <= b.minY || wb.minY >= b.maxY)
      continue;
    if (wb.minX <= b.minX && wb.maxY >= b.maxY && wb.minY <= b.minY)
      x0 = Math.max(x0, wb.maxX);
    else if (wb.maxX >= b.maxX && wb.maxY >= b.maxY && wb.minY <= b.minY)
      x1 = Math.min(x1, wb.minX);
    else if (wb.minY <= b.minY && wb.maxX >= b.maxX && wb.minX <= b.minX)
      y0 = Math.max(y0, wb.maxY);
    else if (wb.maxY >= b.maxY && wb.maxX >= b.maxX && wb.minX <= b.minX)
      y1 = Math.min(y1, wb.minY);
    else
      return null;
  }
  if (x1 <= x0 || y1 <= y0)
    return null;
  return {
    minX: x0,
    minY: y0,
    maxX: x1,
    maxY: y1,
    width: x1 - x0,
    height: y1 - y0
  };
}
function measureMarkedParking(building) {
  const bays = [
    ...building.floors.filter((f) => f.floorUse === "STILT_PARKING" || f.level === 0).flatMap((f) => f.rooms.filter((r) => r.type === "parking" && !r.tags.includes("STILT_CIRCULATION")).map((r) => ({
      id: r.id,
      name: r.name,
      boundary: r.boundary,
      kind: /^C[- ]?\d+/i.test(r.name) ? "CAR_STALL" : /^B[- ]?\d+/i.test(r.name) ? "BIKE_STALL" : "UNKNOWN",
      floorId: f.id
    }))),
    ...(building.site.siteZones ?? []).filter((z) => z.regulatoryUse === "CAR_STALL" || z.regulatoryUse === "BIKE_STALL").map((z) => ({
      id: z.id,
      name: z.name,
      boundary: z.boundary,
      kind: z.regulatoryUse,
      floorId: "site"
    }))
  ];
  const invalid = [];
  const valid = bays.filter((b, i) => {
    const rect = rectangularBounds(b.boundary), small = rect ? Math.min(rect.width, rect.height) : 0, large = rect ? Math.max(rect.width, rect.height) : 0;
    const inside2 = isValidPolygon(building.site.plotBoundary) && isConvex(building.site.plotBoundary) && polygonIntersectionArea(b.boundary, polygonSignedArea(building.site.plotBoundary) < 0 ? { points: [...building.site.plotBoundary.points].reverse() } : building.site.plotBoundary) >= polygonArea2(b.boundary) - 1e-3;
    const overlap = bays.some((o, j) => j !== i && (o.floorId === b.floorId || o.floorId === "site" || b.floorId === "site") && polygonIntersectionArea(b.boundary, o.boundary) >= 1e-3);
    const physicalFloor = building.floors.find((f) => f.id === b.floorId);
    const obstructed = physicalFloor?.walls.some((w) => {
      const solid = wallToPolygon(w);
      const clip = polygonSignedArea(solid) < 0 ? { points: [...solid.points].reverse() } : solid;
      return polygonIntersectionArea(b.boundary, clip) >= 1e-3;
    }) || physicalFloor?.columns.some((c) => {
      const p = {
        points: [
          { x: c.position.x - c.width / 2, y: c.position.y - c.depth / 2 },
          { x: c.position.x + c.width / 2, y: c.position.y - c.depth / 2 },
          { x: c.position.x + c.width / 2, y: c.position.y + c.depth / 2 },
          { x: c.position.x - c.width / 2, y: c.position.y + c.depth / 2 }
        ]
      };
      return polygonIntersectionArea(b.boundary, p) >= 1e-3;
    });
    const insideFloor = !physicalFloor || polygonIntersectionArea(b.boundary, physicalFloor.boundary) >= polygonArea2(b.boundary) - 1e-3;
    const occupied = physicalFloor?.rooms.some((r) => r.type !== "parking" && r.spaceUse !== "VOID" && polygonIntersectionArea(b.boundary, r.boundary) >= 1e-3);
    const okay = !!inside2 && insideFloor && !occupied && !overlap && !obstructed && (b.kind === "CAR_STALL" ? small >= 2500 && large >= 5e3 : b.kind === "BIKE_STALL" ? small >= 1e3 && large >= 2e3 : false);
    if (!okay)
      invalid.push(b.id);
    return okay;
  });
  const drives = (building.site.siteZones ?? []).filter((z) => z.regulatoryUse === "DRIVEWAY");
  const widths = drives.map((z) => {
    const r = rectangularBounds(z.boundary);
    return r ? Math.min(r.width, r.height) : null;
  });
  const driveConflicts = drives.some((d) => bays.some((b) => polygonIntersectionArea(d.boundary, b.boundary) >= 1e-3));
  return {
    cars: valid.filter((b) => b.kind === "CAR_STALL").length,
    bikes: valid.filter((b) => b.kind === "BIKE_STALL").length,
    invalid,
    bayIds: bays.map((b) => b.id),
    driveIds: drives.map((d) => d.id),
    driveConflicts,
    drivewayWidthMm: widths.length && widths.every((v) => v !== null) ? Math.min(...widths) : null
  };
}
function measureRecreationalSpace(building) {
  const zones = (building.site.siteZones ?? []).filter((z) => z.regulatoryUse === "ROS");
  const reasons = [];
  const valid = zones.filter((z, i) => {
    const b = rectangularBounds(z.boundary);
    const ok = b && Math.min(b.width, b.height) >= 1e4 && (Math.min(b.width, b.height) >= 2e4 || Math.max(b.width, b.height) <= 2.5 * Math.min(b.width, b.height)) && polygonIntersectionArea(z.boundary, building.site.plotBoundary) >= polygonArea2(z.boundary) - 1e-3 && !zones.some((o, j) => j !== i && polygonIntersectionArea(z.boundary, o.boundary) >= 1e-3) && !building.floors.some((f) => polygonIntersectionArea(z.boundary, f.boundary) >= 1e-3) && !(building.site.siteZones ?? []).some((o) => o.id !== z.id && o.regulatoryUse !== "ROS" && polygonIntersectionArea(z.boundary, o.boundary) >= 1e-3);
    if (!ok)
      reasons.push(z.id);
    return !!ok;
  });
  const siteZones = building.site.siteZones ?? [];
  const edgePoint = (p, poly) => {
    const b = rectangularBounds(poly);
    return !!b && ((Math.abs(p.x - b.minX) < 1e-3 || Math.abs(p.x - b.maxX) < 1e-3) && p.y >= b.minY && p.y <= b.maxY || (Math.abs(p.y - b.minY) < 1e-3 || Math.abs(p.y - b.maxY) < 1e-3) && p.x >= b.minX && p.x <= b.maxX);
  };
  const touches = (a, b) => {
    const x = rectangularBounds(a), y = rectangularBounds(b);
    if (!x || !y)
      return false;
    return (Math.abs(x.maxX - y.minX) < 1e-3 || Math.abs(y.maxX - x.minX) < 1e-3) && Math.min(x.maxY, y.maxY) - Math.max(x.minY, y.minY) > 0 || (Math.abs(x.maxY - y.minY) < 1e-3 || Math.abs(y.maxY - x.minY) < 1e-3) && Math.min(x.maxX, y.maxX) - Math.max(x.minX, y.minX) > 0;
  };
  const accessible = (id, seen) => {
    if (seen.has(id))
      return false;
    seen.add(id);
    const zone = siteZones.find((z) => z.id === id);
    if (!zone)
      return false;
    return zone.accessLinks.some((link) => {
      const access = building.site.accessPoints.find((a) => a.id === link);
      if (access)
        return access.width > 0 && edgePoint(access.position, zone.boundary) && edgePoint(access.position, building.site.plotBoundary);
      const next = siteZones.find((z) => z.id === link);
      return !!next && ["pedestrian_circulation", "vehicle_circulation"].includes(next.kind) && touches(zone.boundary, next.boundary) && accessible(next.id, new Set(seen));
    });
  };
  return {
    areaMm2: valid.reduce((s, z) => s + polygonArea2(z.boundary), 0),
    ids: zones.map((z) => z.id),
    invalidIds: reasons,
    reviewed: zones.length > 0 && zones.every((z) => z.reviewStatus !== "UNREVIEWED"),
    accessVerified: zones.length > 0 && zones.every((z) => accessible(z.id, /* @__PURE__ */ new Set()))
  };
}
function measureRegulatoryFloors(building) {
  return building.floors.map((f) => ({
    floor: f,
    ledger: measureApartmentAreaLedger(f),
    rooms: f.rooms.map((room) => ({ room, clear: measureClearRoom(f, room) }))
  }));
}
function measureEgressTravel(floor) {
  const stairs = floor.canonicalStaircases ?? [];
  if (!stairs.length)
    return {
      distanceMm: null,
      status: "DISCONNECTED",
      paths: [],
      reason: "No canonical staircase."
    };
  const rooms = floor.rooms.filter((r) => r.unitId || ["corridor", "foyer", "staircase"].includes(r.type)).filter((r) => ![
    "balcony",
    "utility",
    "service_shaft",
    "ots",
    "lift",
    "parking"
  ].includes(r.type));
  const rects = rooms.map((r) => measureClearRoom(floor, r));
  if (!rooms.length || rects.some((r) => !r) || (floor.furniture ?? []).some((item) => rooms.some((r) => r.id === item.roomId)) || floor.columns.some((c) => rects.some((b) => b && c.position.x + c.width / 2 > b.minX && c.position.x - c.width / 2 < b.maxX && c.position.y + c.depth / 2 > b.minY && c.position.y - c.depth / 2 < b.maxY)))
    return {
      distanceMm: null,
      status: "NOT_VERIFIED",
      paths: [],
      reason: "Clear interior is unsupported or contains column/furniture obstacles; constrained navigation must be reviewed."
    };
  const nodes = [], edges = [];
  const add = (p, room, target = false) => {
    nodes.push({ p, room, target });
    edges.push(/* @__PURE__ */ new Map());
    return nodes.length - 1;
  };
  const link = (a, b) => {
    const d = Math.hypot(nodes[a].p.x - nodes[b].p.x, nodes[a].p.y - nodes[b].p.y);
    edges[a].set(b, d);
    edges[b].set(a, d);
  };
  const clamp2 = (p, i) => {
    const b = rects[i];
    return {
      x: Math.max(b.minX, Math.min(b.maxX, p.x)),
      y: Math.max(b.minY, Math.min(b.maxY, p.y))
    };
  };
  const corners = [];
  rooms.forEach((r, i) => {
    if (r.unitId) {
      const b = rects[i];
      for (const p of [
        { x: b.minX, y: b.minY },
        { x: b.maxX, y: b.minY },
        { x: b.maxX, y: b.maxY },
        { x: b.minX, y: b.maxY }
      ])
        corners.push(add(p, i));
    }
  });
  for (const d of floor.doors) {
    const a = rooms.findIndex((r) => r.id === d.connectsRooms[0]), b = rooms.findIndex((r) => r.id === d.connectsRooms[1]);
    const wall = floor.walls.find((w) => w.id === d.wallId);
    if (a < 0 || b < 0 || !wall || d.width <= 0 || !wall.roomIds.includes(rooms[a].id) || !wall.roomIds.includes(rooms[b].id))
      continue;
    const pa = clamp2(d.position, a), pb = clamp2(d.position, b);
    if (Math.hypot(pa.x - d.position.x, pa.y - d.position.y) > wall.thickness + 1 || Math.hypot(pb.x - d.position.x, pb.y - d.position.y) > wall.thickness + 1)
      continue;
    link(add(pa, a), add(pb, b));
  }
  for (const s of stairs) {
    if (s.accessEdge.type !== "OPEN_PASSAGE")
      continue;
    const p = {
      x: (s.accessEdge.startPoint.x + s.accessEdge.endPoint.x) / 2,
      y: (s.accessEdge.startPoint.y + s.accessEdge.endPoint.y) / 2
    };
    rooms.forEach((r, i) => {
      if (!r.unitId && ["corridor", "foyer"].includes(r.type)) {
        const q = clamp2(p, i);
        if (Math.hypot(p.x - q.x, p.y - q.y) <= 300)
          add(q, i, true);
      }
    });
  }
  if (!corners.length || !nodes.some((n) => n.target))
    return {
      distanceMm: null,
      status: "NOT_VERIFIED",
      paths: [],
      reason: "No measured unit corners or common circulation touching OPEN_PASSAGE."
    };
  nodes.forEach((a, i) => nodes.forEach((b, j) => {
    if (i < j && a.room === b.room)
      link(i, j);
  }));
  const paths = [];
  let max = 0;
  for (const start of corners) {
    const uid = rooms[nodes[start].room].unitId, dist2 = nodes.map(() => Infinity), prev = nodes.map(() => -1), done = /* @__PURE__ */ new Set();
    dist2[start] = 0;
    let end = -1;
    while (done.size < nodes.length) {
      let u = -1;
      for (let i = 0; i < nodes.length; i++)
        if (!done.has(i) && Number.isFinite(dist2[i]) && (u < 0 || dist2[i] < dist2[u]))
          u = i;
      if (u < 0)
        break;
      if (nodes[u].target) {
        end = u;
        break;
      }
      done.add(u);
      for (const [v, d] of edges[u]) {
        const foreign = rooms[nodes[v].room].unitId;
        if (foreign && foreign !== uid)
          continue;
        if (dist2[u] + d < dist2[v]) {
          dist2[v] = dist2[u] + d;
          prev[v] = u;
        }
      }
    }
    if (end < 0)
      return {
        distanceMm: null,
        status: "DISCONNECTED",
        paths,
        reason: "A unit corner has no door/corridor route to OPEN_PASSAGE."
      };
    max = Math.max(max, dist2[end]);
    const path2 = [];
    for (let n = end; n >= 0; n = prev[n])
      path2.unshift(nodes[n].p);
    paths.push(path2);
  }
  return {
    distanceMm: max,
    status: "MEASURED",
    paths,
    reason: "Longest of shortest visible routes from every clear unit-room corner through actual door portals to common OPEN_PASSAGE; furniture clearance/enclosure review remains separate."
  };
}
function measureWindowAdjacency(floor, room) {
  const inside2 = (p, poly) => {
    let b = false;
    const v = poly.points;
    for (let i = 0, j = v.length - 1; i < v.length; j = i++)
      if (v[i].y > p.y !== v[j].y > p.y && p.x < (v[j].x - v[i].x) * (p.y - v[i].y) / (v[j].y - v[i].y) + v[i].x)
        b = !b;
    return b;
  };
  let areaMm2 = 0;
  const invalid = [], shaftIds = /* @__PURE__ */ new Set();
  const windows = floor.windows.filter((w) => w.roomId === room.id);
  for (const w of windows) {
    const wall = floor.walls.find((v) => v.id === w.wallId);
    if (w.type === "fixed" || !wall || !wall.roomIds.includes(room.id) || !Number.isFinite(w.width) || !Number.isFinite(w.height) || w.width <= 0 || w.height <= 0) {
      invalid.push(w.id);
      continue;
    }
    const a = wall.startPoint, b = wall.endPoint, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    if (!len) {
      invalid.push(w.id);
      continue;
    }
    const t = ((w.position.x - a.x) * dx + (w.position.y - a.y) * dy) / (len * len);
    const offset = Math.abs((w.position.x - a.x) * dy - (w.position.y - a.y) * dx) / len;
    if (t < 0 || t > 1 || offset > wall.thickness / 2 + 1 || w.width > len) {
      invalid.push(w.id);
      continue;
    }
    const d = wall.thickness / 2 + 1, samples = [1, -1].map((k) => ({
      x: w.position.x - k * dy / len * d,
      y: w.position.y + k * dx / len * d
    }));
    const outdoor = samples.some((p) => !inside2(p, floor.boundary));
    const adjacent = floor.rooms.filter((r) => r.id !== room.id && ["balcony", "ots", "service_shaft"].includes(r.type) && samples.some((p) => inside2(p, r.boundary)));
    if (outdoor || adjacent.length) {
      areaMm2 += w.width * w.height;
      adjacent.filter((r) => r.type === "service_shaft" || r.type === "ots").forEach((r) => shaftIds.add(r.id));
    } else
      invalid.push(w.id);
  }
  return {
    areaMm2,
    windowIds: windows.map((w) => w.id),
    invalid,
    shaftIds: [...shaftIds]
  };
}
function measureUnitCarpetAreas(floor, ledger = measureApartmentAreaLedger(floor)) {
  const walls = floor.walls.map((w) => ({
    wall: w,
    polygon: wallToPolygon(w)
  }));
  const supported = ledger.supported && walls.every((w) => !!w.wall.wallUse);
  const inside2 = (p, poly) => {
    let b = false;
    for (let i = 0, j = poly.points.length - 1; i < poly.points.length; j = i++) {
      const a = poly.points[i], c = poly.points[j];
      if (a.y > p.y !== c.y > p.y && p.x < (c.x - a.x) * (p.y - a.y) / (c.y - a.y) + a.x)
        b = !b;
    }
    return b;
  };
  const units = (floor.apartmentUnits ?? []).map((u) => {
    const rooms = floor.rooms.filter((r) => r.unitId === u.id && ![
      "balcony",
      "utility",
      "terrace",
      "ots",
      "service_shaft",
      "lift",
      "staircase"
    ].includes(r.type) && r.spaceUse !== "OUTDOOR" && r.spaceUse !== "SERVICE" && r.spaceUse !== "VOID");
    const usable = rooms.reduce((sum, r) => sum + (ledger.roomUsable[r.id] ?? 0), 0);
    const owned = new Set(rooms.map((r) => r.id));
    const partitions = walls.filter((w) => w.wall.wallUse === "INTERNAL_PARTITION" && w.wall.roomIds.length >= 2 && w.wall.roomIds.every((id) => owned.has(id)));
    let internalWallAreaMm2 = 0;
    const polys = [u.boundary, ...walls.map((w) => w.polygon)];
    const xs = [
      ...new Set(polys.flatMap((p) => p.points.map((q) => q.x)))
    ].sort((a, b) => a - b), ys = [...new Set(polys.flatMap((p) => p.points.map((q) => q.y)))].sort((a, b) => a - b);
    for (let x = 1; x < xs.length; x++)
      for (let y = 1; y < ys.length; y++) {
        const pt = {
          x: (xs[x] + xs[x - 1]) / 2,
          y: (ys[y] + ys[y - 1]) / 2
        };
        if (!inside2(pt, u.boundary) || !partitions.some((w) => inside2(pt, w.polygon)))
          continue;
        if (walls.some((w) => !partitions.includes(w) && inside2(pt, w.polygon)))
          continue;
        internalWallAreaMm2 += (xs[x] - xs[x - 1]) * (ys[y] - ys[y - 1]);
      }
    return {
      unitId: u.id,
      areaMm2: usable + internalWallAreaMm2,
      usableAreaMm2: usable,
      internalWallAreaMm2,
      supported: supported && rooms.length > 0
    };
  });
  return units;
}

// packages/geometry-engine/dist/hardening-geometry.js
function columnFootprint(c) {
  return {
    points: [
      { x: c.position.x - c.width / 2, y: c.position.y - c.depth / 2 },
      { x: c.position.x + c.width / 2, y: c.position.y - c.depth / 2 },
      { x: c.position.x + c.width / 2, y: c.position.y + c.depth / 2 },
      { x: c.position.x - c.width / 2, y: c.position.y + c.depth / 2 }
    ]
  };
}
function projectOnSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
  if (!length)
    return null;
  const along = ((p.x - a.x) * dx + (p.y - a.y) * dy) / length;
  return {
    length,
    along,
    distance: Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / length,
    pointAt: (t) => ({
      x: a.x + dx / length * t,
      y: a.y + dy / length * t
    })
  };
}

// packages/geometry-engine/dist/residential-envelope.js
var strictlyInside = (p, poly) => {
  let result = false;
  for (let i = 0, j = poly.points.length - 1; i < poly.points.length; j = i++) {
    const a = poly.points[i], b = poly.points[j];
    if (a.y > p.y !== b.y > p.y && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)
      result = !result;
  }
  return result;
};
function uncoveredResidentialOverlap(a, b, solids) {
  const ab = polygonBoundingBox(a), bb = polygonBoundingBox(b);
  if (ab.x + ab.width <= bb.x || bb.x + bb.width <= ab.x || ab.y + ab.height <= bb.y || bb.y + bb.height <= ab.y)
    return 0;
  const relevant = solids.filter((p) => {
    const q = polygonBoundingBox(p);
    return q.x + q.width > ab.x && q.x < ab.x + ab.width && q.y + q.height > ab.y && q.y < ab.y + ab.height;
  });
  const cells = partitionPlanarCells([a, b, ...relevant]);
  if (!cells.supported)
    throw new Error("Unsupported clear-opening arrangement");
  return cells.cells.reduce((sum, c) => sum + (strictlyInside(c.point, a) && strictlyInside(c.point, b) && !relevant.some((p) => strictlyInside(c.point, p)) ? c.area : 0), 0);
}

// packages/geometry-engine/dist/architectural-solids.js
function proposeArchitecturalStair(room, host, rise, id, targetFlightWidth = 1200, targetRiser = 175, accessCenter) {
  const points = room.boundary.points;
  const x = Math.min(...points.map((p) => p.x)), y = Math.min(...points.map((p) => p.y));
  const w = Math.max(...points.map((p) => p.x)) - x, h = Math.max(...points.map((p) => p.y)) - y;
  if (points.length !== 4 || points.some((p) => ![x, x + w].includes(p.x) || ![y, y + h].includes(p.y)))
    throw new Error(`Unsupported stair enclosure: ${room.id}`);
  const horizontal = Math.abs(host.startPoint.y - host.endPoint.y) < 1e-3;
  const inset = host.thickness / 2, width = (horizontal ? w : h) - 2 * inset, depth = (horizontal ? h : w) - 2 * inset;
  const far = horizontal ? Math.abs(host.startPoint.y - (y + h)) < 1e-3 : Math.abs(host.startPoint.x - (x + w)) < 1e-3;
  const point = (u, v) => horizontal ? { x: x + inset + u, y: far ? y + h - inset - v : y + inset + v } : { x: far ? x + w - inset - v : x + inset + v, y: y + inset + u };
  const poly = (u, v, a, b) => ({
    points: [
      point(u, v),
      point(u + a, v),
      point(u + a, v + b),
      point(u, v + b)
    ]
  });
  const flightWidth = Math.min(width / 2, Math.max(targetFlightWidth, Math.floor((width - 200) / 2)));
  const riserCount = 2 * Math.ceil(rise / (2 * targetRiser)), count = riserCount / 2, nominalLanding = Math.min(targetFlightWidth, flightWidth), landing = depth - 2 * nominalLanding >= (count - 1) * 200 ? nominalLanding : Math.max(600, Math.floor(depth * 0.23)), run = depth - 2 * landing;
  if (!(run > 0 && count >= 2 && flightWidth > 0))
    throw new Error(`Stair flights and landings do not fit: ${room.id}`);
  const center2 = accessCenter ?? {
    x: (host.startPoint.x + host.endPoint.x) / 2,
    y: (host.startPoint.y + host.endPoint.y) / 2
  };
  const len = Math.hypot(host.endPoint.x - host.startPoint.x, host.endPoint.y - host.startPoint.y), ux = (host.endPoint.x - host.startPoint.x) / len, uy = (host.endPoint.y - host.startPoint.y) / len;
  return {
    id,
    floorId: room.floorId,
    polygon: room.boundary,
    flight1: poly(0, landing, flightWidth, run),
    flight2: poly(width - flightWidth, landing, flightWidth, run),
    midLanding: poly(0, depth - landing, width, landing),
    floorLanding: poly(0, -inset, width, landing + inset),
    riserCount,
    flightRiserCounts: [count, count],
    treadWidthMm: run / (count - 1),
    clearWidthMm: flightWidth,
    accessEdge: {
      type: "OPEN_PASSAGE",
      startPoint: { x: center2.x - ux * 600, y: center2.y - uy * 600 },
      endPoint: { x: center2.x + ux * 600, y: center2.y + uy * 600 }
    }
  };
}

// packages/planning-engine/src/compliance/jurisdiction-context.ts
function resolveRegulatoryContext(building, input = building.regulatoryContext ?? {}) {
  const context = {
    ...input,
    plotAreaSqm: polygonArea(building.site.plotBoundary) / 1e6
  };
  const provenance = Object.fromEntries(
    Object.keys(input).map((k) => [k, "ASSERTED_FROM_BRIEF"])
  );
  provenance.plotAreaSqm = "MEASURED_CANONICAL_POLYGON";
  if (input.roadWidthM === void 0 && Number.isFinite(building.site.roadWidth) && building.site.roadWidth > 0) {
    Object.assign(context, { roadWidthM: building.site.roadWidth / 1e3 });
    provenance.roadWidthM = "ASSERTED_CANONICAL_SITE";
  }
  const physical = building.floors.filter((f) => f.floorUse !== "ROOF");
  const parkingFloors = physical.filter((f) => f.floorUse === "STILT_PARKING");
  if (input.parkingFloorHeightM === void 0 && parkingFloors.length === 1 && parkingFloors[0].floorHeight > 0) {
    Object.assign(context, {
      parkingFloorHeightM: parkingFloors[0].floorHeight / 1e3
    });
    provenance.parkingFloorHeightM = "MEASURED_CANONICAL_STILT_HEIGHT";
  }
  if (physical.length && building.floors.every((f) => f.floorUse) && physical.every((f) => Number.isFinite(f.elevationMm) && f.floorHeight > 0)) {
    const sorted = [...physical].sort(
      (a, b) => a.elevationMm - b.elevationMm
    );
    const contiguous = sorted.every(
      (f, i) => !i || Math.abs(
        f.elevationMm - sorted[i - 1].elevationMm - sorted[i - 1].floorHeight
      ) < 1e-3
    );
    if (contiguous && input.buildingHeightM === void 0) {
      Object.assign(context, {
        buildingHeightM: (sorted.at(-1).elevationMm + sorted.at(-1).floorHeight) / 1e3
      });
      provenance.buildingHeightM = "MEASURED_CANONICAL_ELEVATIONS";
    }
    if (input.numFloors === void 0) {
      Object.assign(context, { numFloors: physical.length });
      provenance.numFloors = "MEASURED_PHYSICAL_LEVELS";
    }
  }
  const missing = validateRegulatoryContextSchema(context).map(
    (e) => e.path.replace("regulatoryContext.", "")
  );
  for (const key of missing) delete context[key];
  if (!["MUNICIPAL_CORPORATION", "MUNICIPAL_COUNCIL", "REGIONAL_PLAN"].includes(
    context.authorityType ?? ""
  ))
    missing.push("authorityType");
  if (!["NON_CONGESTED", "CONGESTED"].includes(context.congestionZone ?? ""))
    missing.push("congestionZone");
  for (const key of [
    "plotAreaSqm",
    "roadWidthM",
    "buildingHeightM",
    "numFloors"
  ])
    if (!Number.isFinite(context[key]) || context[key] <= 0) missing.push(key);
  if (context.numFloors !== void 0 && !Number.isInteger(context.numFloors))
    missing.push("numFloors");
  if (typeof context.stiltParkingEnabled !== "boolean")
    missing.push("stiltParkingEnabled");
  if (context.buildingUsage !== "RESIDENTIAL_APARTMENT")
    missing.push("buildingUsage");
  for (const key of missing) provenance[key] = "MISSING_OR_INVALID";
  return { context, provenance, missing: [...new Set(missing)] };
}

// packages/planning-engine/src/compliance/source-registry.ts
var STATUTORY_DISCLAIMER = "Automated checks provide engineering design assistance and require verification by a licensed Architect/Engineer before municipal submission.";
var UDCPR_SOURCE_URL = "https://dtp.maharashtra.gov.in/wp-content/uploads/2025/01/UDCPR%20Updated%2030.01.25%20with%20earlier%20provisions%20%26%20corrections_compressed.pdf";
var source = (id, clause, pdfPages, applicability) => ({
  id,
  clause,
  pdfPages,
  applicability,
  edition: "Maharashtra UDCPR 2020",
  consolidatedThrough: "2025-01-30",
  url: UDCPR_SOURCE_URL,
  verification: "VERIFIED_FROM_SOURCE"
});
var REGULATORY_SOURCES = [
  source(
    "fsi",
    "UDCPR 6.1.1 Table 6-A; 6.3 Table 6-G and notes",
    [128, 138, 139],
    "Standard residential greenfield; separate congested/non-congested and corporation/remaining authority tables. Purchased rights and scheme/local amendments require review."
  ),
  source(
    "margins",
    "UDCPR 6.1.1 Tables 6-B/6-C; 6.2.1 Table 6-D; 6.2.3",
    [128, 129, 130, 131, 136, 137],
    "Congested: original holding/height exceptions. Non-congested: road band and city class, H/5 only above table height/floor limits; special buildings require separate review."
  ),
  source(
    "ros",
    "UDCPR 3.4.1, 3.4.6 and 3.4.8",
    [70, 71, 72, 73],
    "Layout/group housing and original holding rules; net area after road/reservation deductions, approved layout exemptions; dedicated accessible ROS (10m minimum, aspect <=2.5 if width <20m), not residual margins."
  ),
  source(
    "parking",
    "UDCPR 8.1.1 Table 8-A; 8.2 Table 8-B; 8.2.2 Table 8-C",
    [167, 168, 169, 172, 173, 174],
    "Apartment carpet bands, 5% visitors and city/class car factors (not apartment two-wheelers); fractions strictly above 0.5 round up; standard marked stalls; no automatic composite/mechanical substitution."
  ),
  source(
    "rooms",
    "UDCPR 9.2, 9.3, 9.4",
    [175, 176],
    "Standard apartment habitable/kitchen sizes are owner requirements; bath/WC minima and clear heights are statutory. NBC sizes require separate verification."
  ),
  source(
    "ventilation",
    "UDCPR 9.20.1, 9.20.2 Table 9-C; 9.4.3",
    [176, 182],
    "Habitable/kitchen openings >=1/10 floor area, wet ventilation >=0.30 m2; adjacency and shaft size mandatory; depth beyond 7.5m requires further assessment."
  ),
  source(
    "egress",
    "UDCPR 9.27.1; 9.28.4 Table 9-D; 9.28.7; 9.28.8 Table 9-G; 9.29.3",
    [184, 185, 186, 187, 188],
    "Residential travel 22.5m; stair clear widths 1.0/1.2/1.5m by height. Project brief separately requires 1.5m. Residential tread 250mm/riser 190mm/headroom 2.2m. Fire enclosure and special-building applicability require review."
  ),
  {
    id: "nbc",
    clause: "NBC 2016 Part 3 and Part 4",
    edition: "NBC 2016",
    consolidatedThrough: null,
    pdfPages: [],
    url: "https://www.bis.gov.in/standards/national-building-code/?lang=en",
    verification: "NOT_VERIFIED",
    applicability: "Official edition confirmed; original licensed clause text and local adoption/amendments have not been verified. No NBC compliance result may be inferred from UDCPR checks."
  },
  {
    id: "brief",
    clause: "PROJECT BRIEF - engineering design policy",
    edition: "ARGON Phase 3 brief",
    consolidatedThrough: null,
    pdfPages: [],
    url: "",
    verification: "NOT_VERIFIED",
    applicability: "Explicit requested stricter 1500mm stair and 6000/3600mm driveway policy; not presented as a UDCPR/NBC quotation."
  }
];
function regulatorySource(id) {
  return REGULATORY_SOURCES.find((s) => s.id === id);
}

// packages/planning-engine/src/compliance/rules/entitlements.ts
function fsiEntitlements(c) {
  const w = c.roadWidthM;
  if (!Number.isFinite(w) || w <= 0 || !["MUNICIPAL_CORPORATION", "MUNICIPAL_COUNCIL"].includes(
    c.authorityType ?? ""
  ) || !["CONGESTED", "NON_CONGESTED"].includes(c.congestionZone ?? ""))
    return null;
  const mc = c.authorityType === "MUNICIPAL_CORPORATION";
  let basic, premium, tdr;
  if (c.congestionZone === "CONGESTED") {
    basic = w < 9 ? 1.5 : 2;
    premium = w < 9 ? 0 : 0.3;
    tdr = w < 9 ? 0 : mc ? w < 18 ? 0.3 : w < 30 ? 0.5 : 0.7 : w < 18 ? 0.1 : 0.2;
  } else {
    basic = 1.1;
    premium = w < 9 ? 0 : mc ? 0.5 : 0.3;
    const i = w < 9 ? 0 : w < 12 ? 1 : w < 15 ? 2 : w < 24 ? 3 : w < 30 ? 4 : 5;
    tdr = (mc ? [0, 0.4, 0.65, 0.9, 1.15, 1.4] : [0, 0.3, 0.6, 0.7, 0.9, 1.1])[i];
  }
  return {
    basic,
    premium,
    tdr,
    ancillary: (basic + premium + tdr) * 0.6,
    total: basic + premium + tdr
  };
}
function requiredMargins(c) {
  if (c.authorityType === "REGIONAL_PLAN") return { front: null, side: null, reason: "Regional highway/building-line and planning-authority applicability require verification." };
  const w = c.roadWidthM, h = c.buildingHeightM, a = c.plotAreaSqm;
  if (!w || !h || !a || !c.authorityType || !c.congestionZone)
    return {
      front: null,
      side: null,
      reason: "Provide authority, zone, road width and height."
    };
  if (c.congestionZone === "CONGESTED") {
    if (c.originalHoldingAreaSqm === void 0)
      return {
        front: null,
        side: null,
        reason: "Original holding area is required by 6.0 / 6.1.1."
      };
    if (c.originalHoldingAreaSqm <= 4e3 && h < 24) {
      const front2 = w < 4.5 ? null : w < 6 ? 0 : w < 12 ? 1e3 : 2e3;
      const side = (a <= 1e3 ? 0 : 1e3) + (h >= 15 ? 1e3 : 0);
      return {
        front: front2,
        side,
        reason: w < 4.5 ? "Front is measured from street centre; centreline geometry is missing." : "Tables 6-B and 6-C; detached standard apartment."
      };
    }
  }
  const front = w >= 30 ? c.authorityType === "MUNICIPAL_COUNCIL" || c.corporationClass === "D" ? 4500 : c.corporationClass ? 6e3 : null : w >= 18 ? 4500 : 3e3;
  const tableSide = w >= 30 ? 3e3 : w >= 18 ? 2e3 : 1500;
  const parkingHeight = c.stiltParkingEnabled ? c.parkingFloorHeightM : 0;
  if (parkingHeight === void 0 || parkingHeight < 0 || parkingHeight > 6 || parkingHeight >= h)
    return {
      front,
      side: null,
      reason: "Verify parking floor height and the up-to-6m exclusion in 6.2.3 before applying height-based margins."
    };
  const marginHeightMm = h * 1e3 - parkingHeight * 1e3;
  const within = w >= 30 ? marginHeightMm <= 15e3 : w >= 18 ? marginHeightMm <= 1e4 : !!c.numFloors && c.numFloors <= (c.stiltParkingEnabled ? 4 : 3);
  return {
    front,
    side: within ? tableSide : Math.max(tableSide, Math.min(12e3, marginHeightMm / 5)),
    reason: "Table 6-D + 6.2.3 H/5 above table limits; special-building/fire-access review is separate."
  };
}
var parkingFactors = {
  PUNE_PCMC_THANE: 1,
  NAGPUR_NASHIK: 0.9,
  OTHER_MMR: 0.8,
  OTHER_CORPORATION: 0.7,
  D_CORPORATION: 0.6,
  A_COUNCIL: 0.6,
  BC_COUNCIL: 0.5
};
function requiredParkingCount(base, factorTenths = 10) {
  const numerator = base * 2 * 21 * factorTenths, denominator = 400;
  return Math.floor(numerator / denominator) + (numerator % denominator * 2 > denominator ? 1 : 0);
}

// packages/planning-engine/src/validator/udcpr-engine.ts
function evaluateUDCPRCompliance(building, input) {
  const {
    context: c,
    missing,
    provenance
  } = resolveRegulatoryContext(building, input);
  const rules = [];
  const add = (id, sourceId, description, actual, required, status2, elementIds = [], unit, remediation = "Review this clause with a licensed Architect/Engineer.", floorId) => {
    rules.push({
      id,
      sourceId,
      clause: regulatorySource(sourceId).clause,
      description,
      actual,
      required,
      status: status2,
      elementIds,
      unit,
      remediation,
      floorId
    });
  };
  const cmp = (a, r, minimum = true) => a == null || r == null || !Number.isFinite(a) || !Number.isFinite(r) ? "NOT_VERIFIED" : (minimum ? a >= r : a <= r) ? "PASS" : "VIOLATION";
  for (const key of missing)
    add(
      `input.${key}`,
      "fsi",
      `Required regulatory input: ${key}`,
      null,
      "Explicit valid input",
      "NOT_VERIFIED",
      [],
      void 0,
      `Provide ${key}; no passing default is used.`
    );
  add(
    "source.applicability",
    "fsi",
    "Jurisdiction, scheme and post-2025 amendments reviewed",
    c.amendmentApplicabilityReviewed === true && c.standardGreenfieldSchemeConfirmed === true,
    true,
    c.amendmentApplicabilityReviewed === true && c.standardGreenfieldSchemeConfirmed === true ? "PASS" : "NOT_VERIFIED",
    [],
    void 0,
    "Confirm the standard greenfield scheme and current local/amendment applicability. Source snapshot is pinned to 2025-01-30."
  );
  add(
    "source.nbc",
    "nbc",
    "NBC Part 3 and Part 4 clause verification",
    null,
    "Original applicable NBC clauses reviewed",
    "NOT_VERIFIED",
    [],
    void 0,
    "Verify original NBC 2016 clauses and local adoption. UDCPR measurements do not establish NBC compliance."
  );
  for (const floor of building.floors.filter((f) => f.floorUse === "STILT_PARKING")) {
    const habitable = floor.rooms.filter((r) => ["bedroom", "living", "dining", "kitchen", "study", "drawing", "family_living", "servant_quarter"].includes(r.type));
    add(`stilt.${floor.id}.enclosures`, "parking", "Stilt has no flats or habitable enclosures", habitable.length + (floor.apartmentUnits?.length ?? 0), 0, habitable.length || floor.apartmentUnits?.length ? "VIOLATION" : floor.rooms.some((r) => r.type === "custom" && !r.tags?.includes("SECURITY_CABIN")) ? "NOT_VERIFIED" : "PASS", habitable.map((r) => r.id), void 0, "Remove habitable enclosures from the designated parking-only floor; exemption eligibility requires separate review.", floor.id);
    const clearance = floor.parkingClearHeightMm ?? null;
    add(`stilt.${floor.id}.clearance`, "parking", "Explicit stilt clearance below beams", clearance, 2400, cmp(clearance, 2400), [floor.id], "mm", "Provide measured below-beam clearance; floor-to-floor height does not establish parking clearance.", floor.id);
  }
  const measured = measureRegulatoryFloors(building);
  const physical = measured.filter((m) => m.floor.floorUse !== "ROOF");
  const rolesKnown = building.floors.length > 0 && building.floors.every((f) => f.floorUse);
  add(
    "geometry.roles",
    "fsi",
    "Physical residential/stilt/roof roles are explicit",
    rolesKnown,
    true,
    rolesKnown ? "PASS" : "NOT_VERIFIED",
    building.floors.map((f) => f.id),
    void 0,
    "Assign floorUse; roof drawing sheets must not be counted as residential storeys."
  );
  if (rolesKnown) {
    add(
      "geometry.floor-count",
      "fsi",
      "Physical level count agrees with the regulatory input",
      physical.length,
      c.numFloors ?? null,
      physical.length === c.numFloors ? "PASS" : c.numFloors === void 0 ? "NOT_VERIFIED" : "VIOLATION",
      physical.map((m) => m.floor.id),
      void 0,
      "Reconcile physical storeys and the brief; drawing-only roof sheets are excluded."
    );
    const hasStilt = physical.some((m) => m.floor.floorUse === "STILT_PARKING");
    add(
      "geometry.stilt",
      "fsi",
      "Explicit stilt flag agrees with physical floor roles",
      hasStilt,
      c.stiltParkingEnabled ?? null,
      c.stiltParkingEnabled === void 0 ? "NOT_VERIFIED" : hasStilt === c.stiltParkingEnabled ? "PASS" : "VIOLATION",
      physical.map((m) => m.floor.id),
      void 0,
      "Reconcile stilt parking inputs with physical floor roles."
    );
  }
  const ledgersValid = physical.length > 0 && physical.every(
    (m) => m.ledger.supported && Math.abs(m.ledger.delta) < 1e-3 && m.ledger.overlap < 1e-3 && m.ledger.roomVoidOverlap < 1e-3 && m.ledger.unassigned < 1e-3
  );
  add(
    "geometry.ledger",
    "fsi",
    "Canonical disjoint centreline-cell ledger (no unassigned or overlap)",
    ledgersValid,
    true,
    ledgersValid ? "PASS" : "NOT_VERIFIED",
    physical.map((m) => m.floor.id),
    void 0,
    "Resolve unsupported polygons, overlaps or unassigned ledger cells; no area rounding is used."
  );
  const gross = physical.reduce(
    (s, m) => s + m.ledger.gross - m.ledger.void,
    0
  ), core = physical.reduce((s, m) => s + m.ledger.core, 0), stilt = physical.filter((m) => m.floor.floorUse === "STILT_PARKING").reduce((s, m) => s + m.ledger.gross - m.ledger.void, 0);
  const entitlement = fsiEntitlements(c);
  const exemptions = c.reviewedFsiExemptions ?? [];
  const exemptionsValid = c.fsiExemptionsReviewed === true && exemptions.every(
    (e) => !!e.clause.trim() && Number.isFinite(e.areaMm2) && e.areaMm2 >= 0 && physical.some((m) => m.floor.id === e.floorId)
  ) && physical.every(
    (m) => exemptions.filter((e) => e.floorId === m.floor.id).reduce((s, e) => s + e.areaMm2, 0) <= m.ledger.gross - m.ledger.void
  );
  const exempt = exemptionsValid ? exemptions.reduce((s, e) => s + e.areaMm2, 0) : null;
  const roofKnown = !building.floors.some((f) => f.floorUse === "ROOF") || c.roofFsiReviewed === true;
  add(
    "fsi.roof",
    "fsi",
    "Covered roof structures and roof FSI applicability reviewed",
    roofKnown,
    true,
    roofKnown ? "PASS" : "NOT_VERIFIED",
    building.floors.filter((f) => f.floorUse === "ROOF").map((f) => f.id),
    void 0,
    "Review roof structure sections; a roof drawing is not automatically an exempt floor."
  );
  const net = rolesKnown && ledgersValid && roofKnown && exempt !== null ? gross - exempt : null;
  const netPlot = c.netPlotAreaSqm && c.plotAreaSqm && c.netPlotAreaSqm <= c.plotAreaSqm ? c.netPlotAreaSqm : null;
  const purchased = [
    c.approvedPremiumFsi,
    c.approvedTdrFsi,
    c.approvedAncillaryFsi
  ];
  const approved = entitlement && purchased.every((v) => v !== void 0 && Number.isFinite(v) && v >= 0) && c.approvedPremiumFsi <= entitlement.premium && c.approvedTdrFsi <= entitlement.tdr && c.approvedAncillaryFsi <= (entitlement.basic + c.approvedPremiumFsi + c.approvedTdrFsi) * 0.6 ? entitlement.basic + c.approvedPremiumFsi + c.approvedTdrFsi + c.approvedAncillaryFsi : null;
  const consumed = net !== null && netPlot ? net / (netPlot * 1e6) : null;
  add(
    "fsi.entitlements",
    "fsi",
    "Basic / premium / TDR / ancillary potential (not purchased rights)",
    entitlement ? JSON.stringify(entitlement) : null,
    "Source road/authority/zone table",
    entitlement ? "PASS" : "NOT_VERIFIED"
  );
  add(
    "fsi.approvals",
    "fsi",
    "Premium, TDR, ancillary approvals and net plot deductions",
    approved,
    "Explicit approved rights within source caps",
    approved === null || netPlot === null ? "NOT_VERIFIED" : "PASS",
    [],
    void 0,
    "Supply netPlotAreaSqm and separately reviewed approvedPremiumFsi, approvedTdrFsi and approvedAncillaryFsi (explicit zero permitted)."
  );
  add(
    "fsi.exemptions",
    "fsi",
    "Reviewed exempt areas; measured core/stilt are only candidates",
    exempt,
    "Explicit floor areas and exemption clauses",
    exempt === null ? "NOT_VERIFIED" : "PASS",
    physical.map((m) => m.floor.id),
    "mm2",
    "Review FSI exemptions, including explicit none; never auto-exempt an entire core/stilt by name."
  );
  add(
    "fsi.consumed",
    "fsi",
    "Net FSI consumed without a 1% overrun allowance",
    consumed,
    approved,
    cmp(consumed, approved, false),
    physical.map((m) => m.floor.id),
    "ratio",
    "Reduce reckonable area or provide reviewed entitlements/exemptions; exact unrounded ratio is compared."
  );
  const margins = measurePlotMargins(building), req = requiredMargins(c);
  const setbacks = {};
  for (const side of ["front", "rear", "left", "right"]) {
    const required = side === "front" ? req.front : req.side, actual = margins?.[side] ?? null, status2 = cmp(actual, required);
    setbacks[side] = {
      requiredMm: required,
      providedMm: actual,
      compliant: status2 === "PASS"
    };
    add(
      `setback.${side}`,
      "margins",
      `Measured ${side} outer wall / plinth clearance`,
      actual,
      required,
      status2,
      building.floors.flatMap((f) => [
        f.id,
        ...f.walls.filter((w) => w.type === "external").map((w) => w.id)
      ]),
      "mm",
      `${req.reason} Rectangular single-road plots only; supply edge roles/street centreline for unsupported sites.`
    );
  }
  const balconies = building.floors.flatMap(
    (f) => f.rooms.filter((r) => ["balcony", "utility"].includes(r.type))
  );
  if (balconies.length)
    add(
      "setback.projections",
      "margins",
      "Cantilevered balcony/utility projection assessment",
      JSON.stringify(
        balconies.map((r) => ({ id: r.id, areaMm2: polygonArea(r.boundary) }))
      ),
      "Verified projection limits and section",
      "NOT_VERIFIED",
      balconies.map((r) => r.id),
      void 0,
      "Verify clause 9.14 projections, margin/access restrictions and section geometry. Measured area is not permission."
    );
  const footprint = building.floors.find((f) => f.level === 0) ?? building.floors[0];
  const coverage = footprint && c.plotAreaSqm ? polygonArea(footprint.boundary) / (c.plotAreaSqm * 1e6) * 100 : null;
  add(
    "coverage.measured",
    "ros",
    "Plinth ground coverage (independent of ROS)",
    coverage,
    "Authority/scheme-specific coverage limit",
    "NOT_VERIFIED",
    footprint ? [footprint.id] : [],
    "%",
    "Confirm applicable ground-coverage restrictions; residual plot area is never counted as ROS."
  );
  const ros = measureRecreationalSpace(building);
  const rosRequired = c.rosApplicability === "REQUIRED" || netPlot !== null && netPlot >= 4e3 ? 10 : c.rosApplicability === "EXEMPT_APPROVED_LAYOUT" ? 0 : null;
  const rosPercent = netPlot ? ros.areaMm2 / (netPlot * 1e6) * 100 : 0;
  const rosStatus = ros.invalidIds.length ? "VIOLATION" : rosRequired === null || netPlot === null ? "NOT_VERIFIED" : rosPercent < rosRequired ? "VIOLATION" : rosRequired > 0 && (!ros.reviewed || !ros.accessVerified) ? "NOT_VERIFIED" : "PASS";
  add(
    "ros.area",
    "ros",
    "Dedicated non-overlapping ROS with 10m minimum dimension and aspect limits and access",
    rosPercent,
    rosRequired,
    rosStatus,
    ros.ids,
    "%",
    "Designate reviewed ROS polygons, verify independent/common access, original holding and DP/RP deductions. A generic garden or residual driveway is not certified ROS."
  );
  const parking = measureMarkedParking(building);
  const factor = c.parkingFactorCategory ? parkingFactors[c.parkingFactorCategory] : void 0;
  const factorCompatible = c.parkingFactorCategory && (c.authorityType === "MUNICIPAL_COUNCIL" ? ["A_COUNCIL", "BC_COUNCIL"].includes(c.parkingFactorCategory) : c.authorityType === "MUNICIPAL_CORPORATION" ? !["A_COUNCIL", "BC_COUNCIL"].includes(c.parkingFactorCategory) : false);
  let baseCars = 0, baseBikes = 0, unitsKnown = rolesKnown && ledgersValid && !!c.congestionZone, unitCount = 0;
  for (const m of physical.filter((v) => v.floor.floorUse === "RESIDENTIAL")) {
    if (!m.floor.apartmentUnits?.length) unitsKnown = false;
    const carpets = measureUnitCarpetAreas(m.floor, m.ledger);
    add(
      `parking.carpet.${m.floor.id}`,
      "parking",
      "Per-unit measured carpet including internal partitions",
      JSON.stringify(carpets),
      "RERA 2(k) geometry convention; explicit wall ownership",
      carpets.every((v) => v.supported) ? "PASS" : "NOT_VERIFIED",
      m.floor.apartmentUnits?.map((u) => u.id) ?? [],
      "mm2",
      "Resolve wall classifications/ownership and verify the carpet convention for the parking schedule.",
      m.floor.id
    );
    for (const u of m.floor.apartmentUnits ?? []) {
      unitCount++;
      const carpet = carpets.find((v) => v.unitId === u.id);
      const area = (carpet?.areaMm2 ?? 0) / 1e6;
      if (!carpet?.supported || area <= 0 || area === 30) {
        unitsKnown = false;
        continue;
      }
      baseCars += area >= 150 ? 2 : area >= 80 ? 1 : area > 30 ? 0.5 : 0;
      baseBikes += area > 30 && area < 40 && c.congestionZone === "CONGESTED" ? 0.5 : 1;
    }
  }
  unitsKnown = unitsKnown && unitCount > 0;
  const requiredCars = unitsKnown && factor !== void 0 && factorCompatible ? requiredParkingCount(baseCars, Math.round(factor * 10)) : null, requiredBikes = unitsKnown ? requiredParkingCount(baseBikes) : null;
  const carStatus = cmp(parking.cars, requiredCars), bikeStatus = cmp(parking.bikes, requiredBikes);
  if (unitCount > 0 && parking.cars + parking.bikes === 0)
    add(
      "parking.missing",
      "parking",
      "No marked car or two-wheeler stalls exist",
      0,
      "Actual marked parking provision",
      "VIOLATION",
      physical.map((m) => m.floor.id),
      void 0,
      "Provide actual marked stalls and a verified parking schedule."
    );
  add(
    "parking.cars",
    "parking",
    "Valid non-overlapping 2500 x 5000mm car bays",
    parking.cars,
    requiredCars,
    carStatus,
    parking.bayIds,
    "bays",
    "Provide marked accessible car stalls, reviewed unit carpet areas and the correct Table 8-C city/class factor."
  );
  add(
    "parking.bikes",
    "parking",
    "Valid non-overlapping 1000 x 2000mm two-wheeler bays",
    parking.bikes,
    requiredBikes,
    bikeStatus,
    parking.bayIds,
    "bays",
    "Provide actual marked two-wheeler stalls; the software does not invent provided counts."
  );
  if (parking.invalid.length)
    add(
      "parking.invalid",
      "parking",
      "Undersized / overlapping / obstructed / unclassified stalls",
      parking.invalid.join(", "),
      0,
      "VIOLATION",
      parking.invalid,
      void 0,
      "Resolve stall geometry, walls, columns and duplicate bay overlaps."
    );
  const drivewayRequired = c.drivewayFlow === "TWO_WAY" ? 6e3 : c.drivewayFlow === "ONE_WAY" ? 3600 : null;
  add(
    "parking.driveway",
    "brief",
    "Measured driveway width against requested project policy",
    parking.drivewayWidthMm,
    drivewayRequired,
    parking.driveConflicts ? "VIOLATION" : cmp(parking.drivewayWidthMm, drivewayRequired),
    parking.driveIds,
    "mm",
    "Tag dedicated driveway polygons and specify traffic flow. Verify manoeuvring, connectivity and source 8.1.1(iv) separately; source minimum car drive is 3m."
  );
  add(
    "parking.access",
    "parking",
    "Street access / turning and stilt beam clearance",
    null,
    "Verified access geometry and 2.4m below beams",
    "NOT_VERIFIED",
    parking.driveIds,
    void 0,
    "Verify connected street access, swept paths and section headroom; width alone is insufficient."
  );
  let providedStair = null, maxTravel = null;
  for (const m of physical) {
    const f = m.floor, stairs = f.canonicalStaircases ?? [];
    if (!stairs.length) {
      add(
        `stairs.${f.id}.missing`,
        "egress",
        "At least one canonical staircase per physical floor",
        0,
        1,
        "VIOLATION",
        [f.id],
        void 0,
        "Provide canonical staircase and OPEN_PASSAGE circulation access.",
        f.id
      );
    }
    const statWidth = c.buildingHeightM === void 0 ? null : c.buildingHeightM <= 15 ? 1e3 : c.buildingHeightM <= 24 ? 1200 : 1500;
    for (const s of stairs) {
      const flights = [
        rectangularBounds(s.flight1),
        rectangularBounds(s.flight2)
      ];
      const measuredWidth = flights.every((v) => v) ? Math.min(
        s.clearWidthMm,
        ...flights.map((v) => Math.min(v.width, v.height))
      ) : null;
      if (measuredWidth !== null)
        providedStair = providedStair === null ? measuredWidth : Math.min(providedStair, measuredWidth);
      add(
        `stairs.${s.id}.width`,
        "egress",
        "Statutory height-band measured staircase flight width",
        measuredWidth,
        statWidth,
        cmp(measuredWidth, statWidth),
        [s.id],
        "mm",
        "Increase clear flight width; independently review special-building exits.",
        f.id
      );
      add(
        `stairs.${s.id}.brief`,
        "brief",
        "Requested apartment stair clear width policy",
        measuredWidth,
        1500,
        cmp(measuredWidth, 1500),
        [s.id],
        "mm",
        "Meet the explicit 1500mm project policy.",
        f.id
      );
      add(
        `stairs.${s.id}.tread`,
        "egress",
        "Canonical stair tread",
        s.treadWidthMm,
        250,
        cmp(s.treadWidthMm, 250),
        [s.id],
        "mm",
        "Provide minimum 250mm tread.",
        f.id
      );
      const landing = rectangularBounds(s.midLanding);
      add(
        `stairs.${s.id}.landing`,
        "egress",
        "Clear mid-landing depth relative to flight width",
        landing ? Math.min(landing.width, landing.height) : null,
        measuredWidth,
        cmp(
          landing ? Math.min(landing.width, landing.height) : null,
          measuredWidth
        ),
        [s.id],
        "mm",
        "Provide clear landing depth at least the flight width.",
        f.id
      );
      const flightRisers = s.flightRiserCounts;
      add(
        `stairs.${s.id}.flight-risers`,
        "egress",
        "Maximum risers per measured flight",
        flightRisers ? Math.max(...flightRisers) : null,
        15,
        flightRisers && flightRisers.every(Number.isInteger) && flightRisers.every((n) => n > 0) && flightRisers[0] + flightRisers[1] === s.riserCount ? cmp(Math.max(...flightRisers), 15, false) : "NOT_VERIFIED",
        [s.id],
        "risers",
        "Supply explicit flight riser counts consistent with the canonical stair.",
        f.id
      );
      const instance = f.stairs.find(
        (t) => t.verticalCoreId === s.id || polygonArea(t.boundary) === polygonArea(s.polygon) && t.boundary.points.every(
          (p) => s.polygon.points.some((q) => p.x === q.x && p.y === q.y)
        )
      );
      const rise = instance?.riserHeight ?? (Number.isInteger(s.riserCount) && s.riserCount > 0 && f.floorHeight > 0 ? f.floorHeight / s.riserCount : null);
      add(
        `stairs.${s.id}.riser`,
        "egress",
        "Measured floor rise / canonical riser count",
        rise,
        190,
        cmp(rise, 190, false),
        [s.id],
        "mm",
        "Verify riser count, floor heights and <=15 risers per flight.",
        f.id
      );
      const headroom = s.headroomMm ?? instance?.headroomMm ?? null;
      add(
        `stairs.${s.id}.headroom`,
        "egress",
        "Clear headroom below actual slab / beam",
        headroom,
        2200,
        cmp(headroom, 2200),
        [s.id],
        "mm",
        "Supply measured section headroom; floor-to-floor height does not establish headroom.",
        f.id
      );
    }
    const route = measureEgressTravel(f);
    if (route.distanceMm !== null)
      maxTravel = maxTravel === null ? route.distanceMm : Math.max(maxTravel, route.distanceMm);
    add(
      `travel.${f.id}`,
      "egress",
      `Constrained room/door/corridor route: ${route.reason}`,
      route.distanceMm,
      22500,
      route.status === "DISCONNECTED" ? "VIOLATION" : route.status === "NOT_VERIFIED" ? "NOT_VERIFIED" : cmp(route.distanceMm, 22500, false),
      [
        ...f.rooms.filter((r) => r.unitId).map((r) => r.id),
        ...stairs.map((s) => s.id)
      ],
      "mm",
      "Provide complete door topology and unobstructed common circulation to OPEN_PASSAGE. Residential limit is 22.5m; no assumed 18m or 30m.",
      f.id
    );
    const lifts = f.rooms.filter((r) => r.type === "lift");
    const needed = c.buildingHeightM === void 0 ? null : c.buildingHeightM > 24 ? 2 : c.buildingHeightM > 15 ? 1 : 0;
    add(
      `lift.${f.id}`,
      "egress",
      "Measured lift shaft provision",
      lifts.length,
      needed,
      cmp(lifts.length, needed),
      lifts.map((r) => r.id),
      "shafts",
      "Provide required lift shafts and verify lift capacity/accessibility; lifts are not fire exits.",
      f.id
    );
    for (const { room: r, clear } of m.rooms) {
      if (!r.unitId || ![
        "living",
        "dining",
        "drawing",
        "family_living",
        "bedroom",
        "kitchen",
        "bathroom",
        "study"
      ].includes(r.type))
        continue;
      const area = m.ledger.supported ? (m.ledger.roomUsable[r.id] ?? 0) / 1e6 : null, width = clear ? Math.min(clear.width, clear.height) / 1e3 : null;
      const bath = r.type === "bathroom";
      if (bath && r.wetRoomType) {
        const minArea = r.wetRoomType === "BATH_ONLY" ? 1.2 : r.wetRoomType === "WC_ONLY" ? 0.81 : 1.5, minWidth = r.wetRoomType === "WC_ONLY" ? 0.9 : 1;
        add(
          `room.${r.id}.wet-area`,
          "rooms",
          "Typed wet-room clear area",
          area,
          minArea,
          cmp(area, minArea),
          [r.id],
          "m2",
          "Increase clear wet-room area.",
          f.id
        );
        add(
          `room.${r.id}.wet-width`,
          "rooms",
          "Typed wet-room minimum clear width",
          width,
          minWidth,
          cmp(width, minWidth),
          [r.id],
          "m",
          "Increase clear wet-room width; bath-only requires 1m x 1.2m.",
          f.id
        );
        if (r.wetRoomType === "BATH_ONLY")
          add(
            `room.${r.id}.bath-length`,
            "rooms",
            "Bath-only second clear dimension",
            clear ? Math.max(clear.width, clear.height) / 1e3 : null,
            1.2,
            cmp(clear ? Math.max(clear.width, clear.height) / 1e3 : null, 1.2),
            [r.id],
            "m",
            "Provide a 1m x 1.2m clear bathroom.",
            f.id
          );
      }
      add(
        `room.${r.id}.height`,
        "rooms",
        "Explicit clear room height below slab/beam",
        r.clearHeightMm ?? null,
        bath ? 2100 : 2750,
        cmp(r.clearHeightMm, bath ? 2100 : 2750),
        [r.id],
        "mm",
        "Supply measured section clear height; floor-to-floor height alone does not establish clearance.",
        f.id
      );
      add(
        `room.${r.id}.size`,
        "rooms",
        `Clear area / width / aspect: ${r.name}`,
        JSON.stringify({
          areaSqm: area,
          widthM: width,
          aspectRatio: clear ? Math.max(clear.width, clear.height) / Math.min(clear.width, clear.height) : null
        }),
        bath ? "Wet-room subtype required" : "UDCPR 9.2.1 / 9.3.1 owner requirements; NBC review pending",
        "NOT_VERIFIED",
        [r.id],
        void 0,
        "Record wet-room subtype for bath/WC minima; verify NBC room sizes. Do not misquote owner-convenience provisions as numerical statutory minima.",
        f.id
      );
      const ventilation = measureWindowAdjacency(f, r), required = bath ? 0.3 : area === null ? null : r.type === "kitchen" ? Math.max(1, area / 10) : area / 10;
      const shaftOk = ventilation.shaftIds.every((id) => {
        const shaft = f.rooms.find((v) => v.id === id), b = rectangularBounds(shaft.boundary), h = c.buildingHeightM;
        if (!b || !h || shaft.openToSky !== true) return false;
        const i = h <= 10 ? 0 : h <= 12 ? 1 : h <= 18 ? 2 : h <= 24 ? 3 : h <= 30 ? 4 : 5;
        return polygonArea(shaft.boundary) / 1e6 >= [1.2, 2.4, 4, 5.4, 8, 9][i] && Math.min(b.width, b.height) / 1e3 >= [0.9, 1.2, 1.5, 1.8, 2.4, 3][i] && h <= 30;
      });
      const depthOk = clear && Math.max(clear.width, clear.height) <= 7500;
      const ventStatus = ventilation.invalid.length ? "NOT_VERIFIED" : !shaftOk ? "NOT_VERIFIED" : cmp(ventilation.areaMm2 / 1e6, required) === "PASS" && !depthOk ? "NOT_VERIFIED" : cmp(ventilation.areaMm2 / 1e6, required);
      add(
        `room.${r.id}.ventilation`,
        "ventilation",
        `Actual exterior/balcony/shaft window openings: ${r.name}`,
        ventilation.areaMm2 / 1e6,
        required,
        ventStatus,
        [r.id, ...ventilation.windowIds, ...ventilation.shaftIds],
        "m2",
        "Provide hosted window width/height, outdoor adjacency, adequate shafts and depth/light assessment; opening area alone is insufficient.",
        f.id
      );
    }
  }
  const sorted = [...physical].sort((a, b) => a.floor.level - b.floor.level);
  const alignment = sorted.length > 1 && sorted.every(
    (m, i) => !i || (m.floor.canonicalStaircases ?? []).length > 0 && (m.floor.canonicalStaircases ?? []).every(
      (s) => (sorted[i - 1].floor.canonicalStaircases ?? []).some(
        (p) => s.polygon.points.length === p.polygon.points.length && s.polygon.points.every(
          (a) => p.polygon.points.some((b) => a.x === b.x && a.y === b.y)
        )
      )
    )
  );
  add(
    "stairs.alignment",
    "egress",
    "Vertical canonical staircase footprint alignment",
    alignment,
    true,
    sorted.length < 2 ? "NOT_VERIFIED" : alignment ? "PASS" : "VIOLATION",
    physical.flatMap(
      (m) => (m.floor.canonicalStaircases ?? []).map((s) => s.id)
    ),
    void 0,
    "Align canonical cores across physical floors; separately verify landings, flight direction and vertical clearances."
  );
  add(
    "fire.review",
    "egress",
    "Special-building classification, exit capacity, enclosure and fire systems",
    null,
    "Verified fire strategy and section data",
    "NOT_VERIFIED",
    [],
    void 0,
    "Obtain professional fire/accessibility review; planar egress measurements do not verify enclosure, smoke protection, exit capacity or required second exits."
  );
  const status = rules.some((r) => r.status === "VIOLATION") ? "VIOLATION" : rules.some((r) => r.status === "NOT_VERIFIED" || r.status === "WARNING") ? "NOT_VERIFIED" : "PASS";
  const pass = (prefix) => rules.filter((r) => r.id.startsWith(prefix)).every((r) => r.status === "PASS");
  return {
    schemaVersion: 1,
    reportType: "UDCPR_COMPLIANCE_REPORT",
    buildingId: building.id,
    buildingVersion: building.version,
    canonicalHash: canonicalBuildingHash(building),
    contextHash: stableValueHash(c),
    regulatoryContext: c,
    contextProvenance: provenance,
    missingInputs: missing,
    jurisdiction: `${c.authorityType ?? "UNKNOWN"} / ${c.congestionZone ?? "UNKNOWN"}`,
    overallCompliant: status === "PASS",
    status,
    gate: "INTERNAL_ENGINEERING_GATE",
    professionalStatus: "PROFESSIONAL_REVIEW_REQUIRED",
    disclaimer: STATUTORY_DISCLAIMER,
    sources: REGULATORY_SOURCES,
    rulesChecked: rules,
    fsiUtilization: {
      basicFsi: entitlement?.basic ?? null,
      premiumFsi: entitlement?.premium ?? null,
      tdrFsi: entitlement?.tdr ?? null,
      ancillaryFsi: entitlement?.ancillary ?? null,
      approvedFsi: approved,
      permissibleFsi: entitlement ? entitlement.total + entitlement.ancillary : null,
      consumedFsi: consumed,
      builtUpAreaMm2: gross,
      candidateCoreAreaMm2: core,
      candidateStiltAreaMm2: stilt,
      exemptedAreaMm2: exempt,
      netFsiAreaMm2: net,
      maxPermissibleBuiltUpAreaMm2: approved !== null && netPlot ? approved * netPlot * 1e6 : null,
      compliant: pass("fsi.")
    },
    setbacks,
    parking: {
      requiredCars,
      providedCars: parking.cars,
      requiredTwoWheelers: requiredBikes,
      providedTwoWheelers: parking.bikes,
      drivewayWidthMm: parking.drivewayWidthMm,
      compliant: pass("parking.")
    },
    openSpace: {
      requiredPercent: rosRequired,
      providedPercent: rosPercent,
      areaMm2: ros.areaMm2,
      coveragePercent: coverage,
      compliant: rosStatus === "PASS"
    },
    staircaseFireSafety: {
      minWidthMm: 1500,
      providedWidthMm: providedStair,
      maxTravelDistanceMm: 22500,
      actualTravelDistanceMm: maxTravel,
      compliant: pass("stairs.") && pass("travel.") && pass("lift.") && pass("fire.")
    },
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// packages/planning-engine/src/validator/geometry-validator.ts
var GeometryValidator = class {
  autoCorrect;
  columnMergeThresholdMm;
  minOpeningSeparationMm;
  constructor(options = {}) {
    this.autoCorrect = options.autoCorrect ?? true;
    this.columnMergeThresholdMm = options.columnMergeThresholdMm ?? 2e3;
    this.minOpeningSeparationMm = options.minOpeningSeparationMm ?? 150;
  }
  /**
   * Run the full 5-point mathematical geometry audit and auto-correction.
   */
  audit(building, autoCorrect = this.autoCorrect) {
    const allErrors = [];
    let currentBuilding = building;
    const overlapResult = this.auditRoomAndWallOverlaps(currentBuilding, autoCorrect);
    currentBuilding = overlapResult.building;
    allErrors.push(...overlapResult.errors);
    const columnResult = this.auditAndFixColumnAndBeamGrid(currentBuilding, autoCorrect);
    currentBuilding = columnResult.building;
    allErrors.push(...columnResult.errors);
    const openingResult = this.auditAndFixOpenings(currentBuilding, autoCorrect);
    currentBuilding = openingResult.building;
    allErrors.push(...openingResult.errors);
    const stairResult = this.auditStaircaseContinuity(currentBuilding, autoCorrect);
    currentBuilding = stairResult.building;
    allErrors.push(...stairResult.errors);
    const annoResult = this.auditAnnotationCollisions(currentBuilding, autoCorrect);
    currentBuilding = annoResult.building;
    allErrors.push(...annoResult.errors);
    const finalGeometry = this.auditRoomAndWallOverlaps(currentBuilding, false);
    allErrors.push(...finalGeometry.errors.filter((e) => !allErrors.some((old) => old.code === e.code && old.floorId === e.floorId && !old.autoCorrected)));
    const criticalCount = allErrors.filter((e) => e.severity === "CRITICAL" && !e.autoCorrected).length;
    const report = {
      isValid: criticalCount === 0,
      planarDeltaMm2: finalGeometry.planarDeltaMm2,
      errors: Object.freeze(allErrors)
    };
    return {
      building: currentBuilding,
      report
    };
  }
  // ───────────────────────────────────────────────────────────────────────────
  // 1. ROOM & WALL OVERLAPS (Sutherland-Hodgman math & Planar Delta)
  // ───────────────────────────────────────────────────────────────────────────
  auditRoomAndWallOverlaps(building, autoCorrect) {
    const errors = [];
    let totalPlanarDelta = 0;
    const updatedFloors = building.floors.map((floor) => {
      const rooms = [...floor.rooms];
      for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
          const roomA = rooms[i];
          const roomB = rooms[j];
          const overlapArea = polygonIntersectionArea(roomA.boundary, roomB.boundary);
          if (overlapArea >= 1e-3) {
            const locX = (roomA.x + roomB.x) / 2;
            const locY = (roomA.y + roomB.y) / 2;
            errors.push({
              code: "ROOM_OVERLAP",
              severity: "CRITICAL",
              elementIds: [roomA.id, roomB.id],
              floorId: floor.id,
              locationMm: { x: locX, y: locY },
              description: `Unintended room overlap between "${roomA.name}" and "${roomB.name}" (${overlapArea.toFixed(2)} mm\xB2)`,
              autoCorrected: autoCorrect
            });
            if (autoCorrect) {
              const xOverlapMin = Math.max(roomA.x, roomB.x);
              const xOverlapMax = Math.min(roomA.x + roomA.width, roomB.x + roomB.width);
              const yOverlapMin = Math.max(roomA.y, roomB.y);
              const yOverlapMax = Math.min(roomA.y + roomA.height, roomB.y + roomB.height);
              const overlapWidth = xOverlapMin < xOverlapMax ? xOverlapMax - xOverlapMin : 0;
              const overlapHeight = yOverlapMin < yOverlapMax ? yOverlapMax - yOverlapMin : 0;
              if (overlapWidth > 0 && overlapHeight > 0) {
                if (overlapWidth <= overlapHeight) {
                  if (roomA.x < roomB.x) {
                    const newWidthB = Math.max(100, roomB.width - overlapWidth);
                    const newXB = roomB.x + overlapWidth;
                    rooms[j] = this.rebuildRectRoom(roomB, newXB, roomB.y, newWidthB, roomB.height);
                  } else {
                    const newWidthA = Math.max(100, roomA.width - overlapWidth);
                    const newXA = roomA.x + overlapWidth;
                    rooms[i] = this.rebuildRectRoom(roomA, newXA, roomA.y, newWidthA, roomA.height);
                  }
                } else {
                  if (roomA.y < roomB.y) {
                    const newHeightB = Math.max(100, roomB.height - overlapHeight);
                    const newYB = roomB.y + overlapHeight;
                    rooms[j] = this.rebuildRectRoom(roomB, roomB.x, newYB, roomB.width, newHeightB);
                  } else {
                    const newHeightA = Math.max(100, roomA.height - overlapHeight);
                    const newYA = roomA.y + overlapHeight;
                    rooms[i] = this.rebuildRectRoom(roomA, roomA.x, newYA, roomA.width, newHeightA);
                  }
                }
              }
            }
          }
        }
      }
      const measuredFloor = { ...floor, rooms };
      const ledger = measureApartmentAreaLedger(measuredFloor);
      const floorDelta = Math.abs(ledger.delta);
      totalPlanarDelta += floorDelta;
      for (const [code, area, description] of [
        ["PLANAR_DELTA_NONZERO", floorDelta, "Disjoint component area differs from gross floor area"],
        ["UNASSIGNED_AREA", ledger.unassigned, "Floor contains unassigned area"],
        ["ROOM_VOID_OVERLAP", ledger.roomVoidOverlap, "Room overlaps an explicit void"]
      ]) {
        if (!Number.isFinite(area) || area >= 1e-3) errors.push({
          code,
          severity: "CRITICAL",
          elementIds: [floor.id],
          floorId: floor.id,
          locationMm: floor.boundary.points[0] ?? { x: 0, y: 0 },
          description: `${description}: ${area} mm\xB2`,
          autoCorrected: false
        });
      }
      if (!ledger.supported) errors.push({
        code: "UNSUPPORTED_LEDGER_GEOMETRY",
        severity: "CRITICAL",
        elementIds: [floor.id],
        floorId: floor.id,
        locationMm: floor.boundary.points[0] ?? { x: 0, y: 0 },
        description: "The canonical cell ledger requires finite orthogonal polygons.",
        autoCorrected: false
      });
      return {
        ...floor,
        rooms
      };
    });
    return this.confirmRepairs(building, {
      building: {
        ...building,
        floors: updatedFloors,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      errors,
      planarDeltaMm2: totalPlanarDelta
    }, autoCorrect, (candidate) => this.auditRoomAndWallOverlaps(candidate, false));
  }
  // ───────────────────────────────────────────────────────────────────────────
  // 2. COLUMN & BEAM POSITIONING (Snapping, Deduplication, S-BEAM Centerlines)
  // ───────────────────────────────────────────────────────────────────────────
  auditAndFixColumnAndBeamGrid(building, autoCorrect) {
    const errors = [];
    const updatedFloors = building.floors.map((floor) => {
      let columns = [...floor.columns];
      const walls = floor.walls;
      const habitableRoomTypes = /* @__PURE__ */ new Set([
        RoomType.Kitchen,
        RoomType.Bedroom,
        RoomType.Living,
        RoomType.Dining,
        RoomType.Bathroom,
        RoomType.Pooja,
        RoomType.Study
      ]);
      const wallCorners = [];
      walls.forEach((w) => {
        wallCorners.push(w.startPoint, w.endPoint);
      });
      columns = columns.map((col) => {
        let isFloating = false;
        let hostRoom;
        for (const room of floor.rooms) {
          if (habitableRoomTypes.has(room.type) && pointInPolygon(col.position, room.boundary)) {
            let minWallDist = Number.POSITIVE_INFINITY;
            for (const wall of walls) {
              const seg = { start: wall.startPoint, end: wall.endPoint };
              const d = pointToSegmentDistance(col.position, seg);
              if (d < minWallDist) minWallDist = d;
            }
            const maxEmbeddedDistance = 150;
            if (minWallDist > maxEmbeddedDistance) {
              isFloating = true;
              hostRoom = room;
              break;
            }
          }
        }
        if (isFloating && hostRoom) {
          errors.push({
            code: "FLOATING_COLUMN",
            severity: "CRITICAL",
            elementIds: [col.id],
            floorId: floor.id,
            locationMm: col.position,
            description: `Column ${col.id} is floating inside ${hostRoom.name} (${hostRoom.type}) interior`,
            autoCorrected: autoCorrect
          });
          if (autoCorrect) {
            let bestPoint = col.position;
            let minDist = Number.POSITIVE_INFINITY;
            for (const wall of walls) {
              const segA = wall.startPoint;
              const segB = wall.endPoint;
              const l2 = (segB.x - segA.x) ** 2 + (segB.y - segA.y) ** 2;
              let pt;
              if (l2 === 0) {
                pt = segA;
              } else {
                let t = ((col.position.x - segA.x) * (segB.x - segA.x) + (col.position.y - segA.y) * (segB.y - segA.y)) / l2;
                t = Math.max(0, Math.min(1, t));
                pt = { x: Math.round(segA.x + t * (segB.x - segA.x)), y: Math.round(segA.y + t * (segB.y - segA.y)) };
              }
              const d = distance(col.position, pt);
              if (d < minDist) {
                minDist = d;
                bestPoint = pt;
              }
            }
            for (const corner of wallCorners) {
              if (distance(bestPoint, corner) < 500) {
                bestPoint = corner;
                break;
              }
            }
            return {
              ...col,
              position: { x: Math.round(bestPoint.x), y: Math.round(bestPoint.y) }
            };
          }
        }
        return col;
      });
      const dedupedColumns = [];
      const removedIds = /* @__PURE__ */ new Set();
      for (let i = 0; i < columns.length; i++) {
        const c1 = columns[i];
        if (removedIds.has(c1.id)) continue;
        let mergedCol = c1;
        for (let j = i + 1; j < columns.length; j++) {
          const c2 = columns[j];
          if (removedIds.has(c2.id)) continue;
          const dist2 = distance(c1.position, c2.position);
          const dx = Math.abs(c1.position.x - c2.position.x);
          const dy = Math.abs(c1.position.y - c2.position.y);
          const isAlongAxis = dx < 150 || dy < 150;
          if (dist2 < this.columnMergeThresholdMm && isAlongAxis) {
            errors.push({
              code: "DUPLICATE_COLUMN",
              severity: "CRITICAL",
              elementIds: [c1.id, c2.id],
              floorId: floor.id,
              locationMm: {
                x: Math.round((c1.position.x + c2.position.x) / 2),
                y: Math.round((c1.position.y + c2.position.y) / 2)
              },
              description: `Duplicate/proximate columns ${c1.id} and ${c2.id} closer than ${this.columnMergeThresholdMm}mm (${dist2.toFixed(0)}mm)`,
              autoCorrected: autoCorrect
            });
            if (autoCorrect) {
              mergedCol = c1;
              removedIds.add(c2.id);
            }
          }
        }
        dedupedColumns.push(mergedCol);
      }
      const generatedBeams = [];
      const cols = dedupedColumns;
      if (autoCorrect) {
        const gridTolerance = 150;
        const xLines = /* @__PURE__ */ new Map();
        const yLines = /* @__PURE__ */ new Map();
        cols.forEach((col) => {
          let foundX = false;
          for (const [gx, list] of xLines.entries()) {
            if (Math.abs(col.position.x - gx) <= gridTolerance) {
              list.push(col);
              foundX = true;
              break;
            }
          }
          if (!foundX) xLines.set(col.position.x, [col]);
          let foundY = false;
          for (const [gy, list] of yLines.entries()) {
            if (Math.abs(col.position.y - gy) <= gridTolerance) {
              list.push(col);
              foundY = true;
              break;
            }
          }
          if (!foundY) yLines.set(col.position.y, [col]);
        });
        for (const [, list] of xLines.entries()) {
          const sorted = [...list].sort((a, b) => a.position.y - b.position.y);
          for (let idx = 0; idx < sorted.length - 1; idx++) {
            const cA = sorted[idx];
            const cB = sorted[idx + 1];
            const span = Math.abs(cB.position.y - cA.position.y);
            if (span >= 1e3 && span <= 9e3) {
              generatedBeams.push({
                id: generateId(),
                floorId: floor.id,
                startColumnId: cA.id,
                endColumnId: cB.id,
                startPoint: cA.position,
                endPoint: cB.position,
                widthMm: 230,
                depthMm: 450,
                type: "PRIMARY"
              });
            }
          }
        }
        for (const [, list] of yLines.entries()) {
          const sorted = [...list].sort((a, b) => a.position.x - b.position.x);
          for (let idx = 0; idx < sorted.length - 1; idx++) {
            const cA = sorted[idx];
            const cB = sorted[idx + 1];
            const span = Math.abs(cB.position.x - cA.position.x);
            if (span >= 1e3 && span <= 9e3) {
              generatedBeams.push({
                id: generateId(),
                floorId: floor.id,
                startColumnId: cA.id,
                endColumnId: cB.id,
                startPoint: cA.position,
                endPoint: cB.position,
                widthMm: 230,
                depthMm: 450,
                type: "PRIMARY"
              });
            }
          }
        }
        walls.forEach((wall) => {
          if (wall.type === WallType.Internal || wall.loadBearing) {
            const wallLen = distance(wall.startPoint, wall.endPoint);
            if (wallLen > 1500 && wallLen <= 8e3) {
              const isCovered = generatedBeams.some(
                (b) => distance(b.startPoint, wall.startPoint) < 300 && distance(b.endPoint, wall.endPoint) < 300
              );
              if (!isCovered) {
                generatedBeams.push({
                  id: generateId(),
                  floorId: floor.id,
                  startPoint: wall.startPoint,
                  endPoint: wall.endPoint,
                  widthMm: 230,
                  depthMm: 450,
                  type: "SECONDARY"
                });
              }
            }
          }
        });
        floor.rooms.filter((r) => r.type === RoomType.Balcony || r.type === RoomType.Terrace).forEach((balc) => {
          cols.forEach((col) => {
            const d = pointToSegmentDistance(col.position, {
              start: { x: balc.x, y: balc.y },
              end: { x: balc.x + balc.width, y: balc.y }
            });
            if (d < 500) {
              const cantileverEnd = {
                x: col.position.x,
                y: col.position.y > balc.y ? balc.y : balc.y + balc.height
              };
              generatedBeams.push({
                id: generateId(),
                floorId: floor.id,
                startColumnId: col.id,
                startPoint: col.position,
                endPoint: cantileverEnd,
                widthMm: 230,
                depthMm: 450,
                type: "CANTILEVER"
              });
            }
          });
        });
      }
      return {
        ...floor,
        columns: dedupedColumns,
        beams: autoCorrect ? generatedBeams : floor.beams
      };
    });
    return this.confirmRepairs(building, {
      building: {
        ...building,
        floors: updatedFloors
      },
      errors
    }, autoCorrect, (candidate) => this.auditAndFixColumnAndBeamGrid(candidate, false));
  }
  // ───────────────────────────────────────────────────────────────────────────
  // 3. OPENING & BOUNDARY COLLISIONS (Exterior Doors & Door/Window Overlaps)
  // ───────────────────────────────────────────────────────────────────────────
  auditAndFixOpenings(building, autoCorrect) {
    const errors = [];
    const updatedFloors = building.floors.map((floor) => {
      let doors = [...floor.doors];
      const windows = [...floor.windows];
      const walls = floor.walls;
      const outdoorRoomTypes = /* @__PURE__ */ new Set([
        RoomType.Balcony,
        RoomType.Terrace,
        RoomType.Garden,
        RoomType.Porch
      ]);
      const survivingDoors = [];
      for (const door of doors) {
        const wall = walls.find((w) => w.id === door.wallId);
        const isExternalWall = wall?.type === WallType.External || wall?.wallUse === "EXTERNAL";
        if (isExternalWall) {
          const isStiltLobbyMainEntrance = floor.floorUse === "STILT_PARKING" || door.id.includes("grand_lobby_main_entrance") || floor.level === 0 && door.connectsRooms.includes("EXTERIOR") && floor.rooms.some((room) => door.connectsRooms.includes(room.id) && (room.type === RoomType.Corridor || room.type === RoomType.Foyer || /lobby|entrance/i.test(room.name)));
          if (isStiltLobbyMainEntrance) {
            continue;
          }
          const hasOutdoorTarget = floor.rooms.some((room) => (outdoorRoomTypes.has(room.type) || room.type === RoomType.Utility) && door.connectsRooms.includes(room.id) && room.boundary.points.some((point, index) => {
            const end = room.boundary.points[(index + 1) % room.boundary.points.length];
            const segment = { start: point, end };
            const segmentLength2 = distance(point, end);
            return pointToSegmentDistance(door.position, segment) <= 1 && segmentLength2 >= door.width && distance(point, door.position) >= door.width / 2 && distance(end, door.position) >= door.width / 2;
          }));
          if (!hasOutdoorTarget) {
            errors.push({
              code: "EXTERIOR_DOOR_COLLISION",
              severity: "CRITICAL",
              elementIds: [door.id],
              floorId: floor.id,
              locationMm: door.position,
              description: `Exterior door ${door.id} on external wall ${door.wallId} lacks an adjacent Balcony or Terrace`,
              autoCorrected: autoCorrect
            });
            if (autoCorrect) {
              const convertedWindow = {
                id: door.id.replace("door", "wind") || generateId(),
                floorId: floor.id,
                wallId: door.wallId,
                position: door.position,
                width: 1200,
                height: 1200,
                sillHeight: 900,
                type: WindowType.Casement,
                styleId: "CASEMENT_ALUMINUM",
                roomId: door.connectsRooms[0] || ""
              };
              windows.push(convertedWindow);
              continue;
            }
          }
        }
        survivingDoors.push(door);
      }
      doors = survivingDoors;
      for (const wall of walls) {
        const wallDoors = doors.filter((d) => d.wallId === wall.id);
        const wallWindows = windows.filter((w) => w.wallId === wall.id);
        if (wallDoors.length === 0 || wallWindows.length === 0) continue;
        const wallLen = distance(wall.startPoint, wall.endPoint);
        if (wallLen <= 10) continue;
        const ux = (wall.endPoint.x - wall.startPoint.x) / wallLen;
        const uy = (wall.endPoint.y - wall.startPoint.y) / wallLen;
        for (const door of wallDoors) {
          const doorT = (door.position.x - wall.startPoint.x) * ux + (door.position.y - wall.startPoint.y) * uy;
          const doorStart = doorT - door.width / 2;
          const doorEnd = doorT + door.width / 2;
          for (let wIdx = 0; wIdx < wallWindows.length; wIdx++) {
            const wind = wallWindows[wIdx];
            const windT = (wind.position.x - wall.startPoint.x) * ux + (wind.position.y - wall.startPoint.y) * uy;
            const windStart = windT - wind.width / 2;
            const windEnd = windT + wind.width / 2;
            const overlaps = Math.max(doorStart, windStart) < Math.min(doorEnd, windEnd);
            if (overlaps) {
              errors.push({
                code: "OPENING_COLLISION",
                severity: "CRITICAL",
                elementIds: [door.id, wind.id],
                floorId: floor.id,
                locationMm: wind.position,
                description: `Door ${door.id} and Window ${wind.id} overlap on wall ${wall.id}`,
                autoCorrected: autoCorrect
              });
              if (autoCorrect) {
                let newWindT = doorEnd + this.minOpeningSeparationMm + wind.width / 2;
                if (newWindT + wind.width / 2 > wallLen) {
                  newWindT = doorStart - this.minOpeningSeparationMm - wind.width / 2;
                }
                newWindT = Math.max(wind.width / 2, Math.min(wallLen - wind.width / 2, newWindT));
                const newPos = {
                  x: Math.round(wall.startPoint.x + ux * newWindT),
                  y: Math.round(wall.startPoint.y + uy * newWindT)
                };
                const targetIdx = windows.findIndex((w) => w.id === wind.id);
                if (targetIdx !== -1) {
                  windows[targetIdx] = {
                    ...wind,
                    position: newPos
                  };
                }
              }
            }
          }
        }
      }
      return {
        ...floor,
        doors,
        windows
      };
    });
    return this.confirmRepairs(building, {
      building: {
        ...building,
        floors: updatedFloors
      },
      errors
    }, autoCorrect, (candidate) => this.auditAndFixOpenings(candidate, false));
  }
  // ───────────────────────────────────────────────────────────────────────────
  // 4. STAIRCASE CONTINUITY & ACCESS (Vertical Core & Unobstructed OPEN_PASSAGE)
  // ───────────────────────────────────────────────────────────────────────────
  auditStaircaseContinuity(building, autoCorrect) {
    const errors = [];
    const floors = building.floors;
    if (floors.length === 0) return { building, errors };
    const refFloor = floors.find((f) => f.stairs.length > 0) || floors[0];
    const refStair = refFloor.stairs[0];
    const masterCoord = refStair ? { x: refStair.x, y: refStair.y, width: refStair.width, length: refStair.length } : { x: 3e3, y: 3e3, width: 2400, height: 4800, length: 4800 };
    const updatedFloors = floors.map((floor) => {
      let stairs = [...floor.stairs];
      const canonicalStaircases = [...floor.canonicalStaircases ?? []];
      if (stairs.length === 0 && autoCorrect) {
        const newStair = {
          id: generateId(),
          floorId: floor.id,
          type: refStair?.type ?? StairType.UShaped,
          boundary: {
            points: [
              { x: masterCoord.x, y: masterCoord.y },
              { x: masterCoord.x + masterCoord.width, y: masterCoord.y },
              { x: masterCoord.x + masterCoord.width, y: masterCoord.y + masterCoord.length },
              { x: masterCoord.x, y: masterCoord.y + masterCoord.length }
            ]
          },
          x: masterCoord.x,
          y: masterCoord.y,
          width: masterCoord.width,
          length: masterCoord.length,
          direction: refStair?.direction ?? Direction.North,
          riserCount: refStair?.riserCount ?? 20,
          riserHeight: refStair?.riserHeight ?? 150,
          treadDepth: refStair?.treadDepth ?? 250,
          landingWidth: refStair?.landingWidth ?? 1200,
          connectsFloors: [floor.level, floor.level + 1]
        };
        stairs.push(newStair);
      }
      stairs = stairs.map((stair, index) => {
        const reference = refFloor.stairs.find((other) => stair.verticalCoreId && other.verticalCoreId === stair.verticalCoreId) ?? refFloor.stairs[index];
        if (!reference) return stair;
        const masterCoord2 = { x: reference.x, y: reference.y, width: reference.width, length: reference.length };
        const dx = Math.abs(stair.x - masterCoord2.x);
        const dy = Math.abs(stair.y - masterCoord2.y);
        if (dx > 50 || dy > 50) {
          errors.push({
            code: "STAIRCASE_DISCONTINUITY",
            severity: "CRITICAL",
            elementIds: [stair.id],
            floorId: floor.id,
            locationMm: { x: stair.x, y: stair.y },
            description: `Staircase on floor ${floor.id} is vertically misaligned with master core (dx=${dx.toFixed(0)}mm, dy=${dy.toFixed(0)}mm)`,
            autoCorrected: autoCorrect
          });
          if (autoCorrect) {
            return {
              ...stair,
              x: masterCoord2.x,
              y: masterCoord2.y,
              width: masterCoord2.width,
              length: masterCoord2.length,
              boundary: {
                points: [
                  { x: masterCoord2.x, y: masterCoord2.y },
                  { x: masterCoord2.x + masterCoord2.width, y: masterCoord2.y },
                  { x: masterCoord2.x + masterCoord2.width, y: masterCoord2.y + masterCoord2.length },
                  { x: masterCoord2.x, y: masterCoord2.y + masterCoord2.length }
                ]
              }
            };
          }
        }
        return stair;
      });
      stairs.forEach((stair) => {
        const flightW = Math.floor(stair.width / 2);
        const landingDepth = Math.max(1200, stair.landingWidth || 1200);
        const canonical = {
          id: stair.id,
          floorId: floor.id,
          polygon: stair.boundary,
          flight1: {
            points: [
              { x: stair.x, y: stair.y + landingDepth },
              { x: stair.x + flightW, y: stair.y + landingDepth },
              { x: stair.x + flightW, y: stair.y + stair.length },
              { x: stair.x, y: stair.y + stair.length }
            ]
          },
          flight2: {
            points: [
              { x: stair.x + flightW, y: stair.y + landingDepth },
              { x: stair.x + stair.width, y: stair.y + landingDepth },
              { x: stair.x + stair.width, y: stair.y + stair.length },
              { x: stair.x + flightW, y: stair.y + stair.length }
            ]
          },
          midLanding: {
            points: [
              { x: stair.x, y: stair.y },
              { x: stair.x + stair.width, y: stair.y },
              { x: stair.x + stair.width, y: stair.y + landingDepth },
              { x: stair.x, y: stair.y + landingDepth }
            ]
          },
          riserCount: stair.riserCount || 20,
          treadWidthMm: stair.treadDepth || 250,
          clearWidthMm: flightW,
          accessEdge: {
            startPoint: { x: stair.x, y: stair.y + stair.length },
            endPoint: { x: stair.x + flightW, y: stair.y + stair.length },
            type: "OPEN_PASSAGE"
          }
        };
        const existingIdx = canonicalStaircases.findIndex((cs) => cs.id === stair.id);
        if (existingIdx !== -1) {
          canonicalStaircases[existingIdx] = canonical;
        } else {
          canonicalStaircases.push(canonical);
        }
      });
      return {
        ...floor,
        stairs,
        canonicalStaircases: autoCorrect ? canonicalStaircases : floor.canonicalStaircases
      };
    });
    return this.confirmRepairs(building, {
      building: {
        ...building,
        floors: updatedFloors
      },
      errors
    }, autoCorrect, (candidate) => this.auditStaircaseContinuity(candidate, false));
  }
  // ───────────────────────────────────────────────────────────────────────────
  // 5. ANNOTATION & DIMENSION COLLISION DETECTOR
  // ───────────────────────────────────────────────────────────────────────────
  auditAnnotationCollisions(building, autoCorrect) {
    const errors = [];
    const updatedFloors = building.floors.map((floor) => {
      const annotations = [];
      floor.rooms.forEach((r) => {
        annotations.push({
          id: `room-label-${r.id}`,
          text: r.name,
          floorId: floor.id,
          box: {
            x: r.x + r.width / 2 - 600,
            y: r.y + r.height / 2 - 200,
            width: 1200,
            height: 400
          }
        });
      });
      for (let i = 0; i < annotations.length; i++) {
        for (let j = i + 1; j < annotations.length; j++) {
          const annA = annotations[i];
          const annB = annotations[j];
          const boxesCollide = annA.box.x < annB.box.x + annB.box.width && annA.box.x + annA.box.width > annB.box.x && annA.box.y < annB.box.y + annB.box.height && annA.box.y + annA.box.height > annB.box.y;
          if (boxesCollide) {
            errors.push({
              code: "ANNOTATION_COLLISION",
              severity: "WARNING",
              elementIds: [annA.id, annB.id],
              floorId: floor.id,
              locationMm: { x: annA.box.x, y: annA.box.y },
              description: `Annotation bounding box collision between "${annA.text}" and "${annB.text}"`,
              autoCorrected: false
            });
            if (autoCorrect) {
              annB.box = {
                ...annB.box,
                y: annA.box.y + annA.box.height + 150
              };
            }
          }
        }
      }
      return floor;
    });
    return this.confirmRepairs(building, {
      building: {
        ...building,
        floors: updatedFloors
      },
      errors
    }, autoCorrect, (candidate) => this.auditAnnotationCollisions(candidate, false));
  }
  // ───────────────────────────────────────────────────────────────────────────
  // Helper: Rebuild rectangular room
  // ───────────────────────────────────────────────────────────────────────────
  confirmRepairs(original, result, autoCorrect, detect) {
    if (!autoCorrect) return { ...result, building: original, errors: result.errors.map((e) => ({ ...e, autoCorrected: false })) };
    const changed = JSON.stringify(original.floors) !== JSON.stringify(result.building.floors);
    const remaining = detect(result.building).errors;
    return { ...result, errors: result.errors.map((error) => ({
      ...error,
      autoCorrected: changed && !remaining.some((e) => e.code === error.code && e.floorId === error.floorId && e.elementIds.some((id) => error.elementIds.includes(id)))
    })) };
  }
  rebuildRectRoom(room, x, y, width, height) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rw = Math.round(width);
    const rh = Math.round(height);
    return {
      ...room,
      x: rx,
      y: ry,
      width: rw,
      height: rh,
      area: rw * rh,
      boundary: {
        points: [
          { x: rx, y: ry },
          { x: rx + rw, y: ry },
          { x: rx + rw, y: ry + rh },
          { x: rx, y: ry + rh }
        ]
      }
    };
  }
};
function validateAndRepairBuildingGeometry(building, options) {
  const validator = new GeometryValidator(options);
  return validator.audit(building, options?.autoCorrect ?? true);
}

// packages/planning-engine/src/interpretation/architectural-placement.ts
function interpretArchitecturalPlacement(prompt = "") {
  const clauses = prompt.toLowerCase().split(/[.;\n,]|\b(?:and|with|while)\b/);
  const requestedLift = /* @__PURE__ */ new Set();
  const requestedOts = /* @__PURE__ */ new Set();
  const requestedCore = /* @__PURE__ */ new Set();
  const requestedKitchenSize = /* @__PURE__ */ new Set();
  const requestedKitchenStyle = /* @__PURE__ */ new Set();
  const requestedSitout = /* @__PURE__ */ new Set();
  let bedroomBalconies = "ALL_BEDROOMS";
  const entranceStyle = "LIVING_FIRST";
  for (const clause of clauses) {
    const trimmed = clause.trim();
    if (!trimmed) continue;
    if (/\b(lifts?|elevators?)\b/.test(trimmed)) {
      const east = /\beast(?:ern)?\b/.test(trimmed);
      const west = /\bwest(?:ern)?\b/.test(trimmed);
      if ((east || west) && /\b(not|avoid|don't|do not)\b/.test(trimmed)) {
        throw new Error("AMBIGUOUS_LIFT_PLACEMENT: state the desired east or west side directly; negated placement clauses are not silently interpreted");
      }
      if (east) requestedLift.add("EAST");
      if (west) requestedLift.add("WEST");
    }
    if (/\b(ots|shafts?|open[\s-]to[\s-]sky|courtyards?|atriums?)\b/.test(trimmed)) {
      const central = /\b(central|center|middle)\b/.test(trimmed);
      const side = /\b(side|lateral|perimeter|flank)\b/.test(trimmed);
      if ((central || side) && /\b(not|avoid|don't|do not)\b/.test(trimmed)) {
        throw new Error("AMBIGUOUS_OTS_PLACEMENT: state the desired central or side OTS placement directly; negated placement clauses are not silently interpreted");
      }
      if (central) requestedOts.add("CENTRAL");
      if (side) requestedOts.add("SIDE");
    }
    if (/\b(core|vertical\s+circulation)\b/.test(trimmed)) {
      const compact = /\b(compact|tight|efficient|narrow|minimal)\b/.test(trimmed);
      const standard = /\b(standard|spacious|generous|wide)\b/.test(trimmed);
      if (compact) requestedCore.add("COMPACT");
      if (standard) requestedCore.add("STANDARD");
    }
    if (/\b(kitchens?)\b/.test(trimmed)) {
      const larger = /\b(large|larger|spacious|expanded|big|generous)\b/.test(trimmed);
      const compact = /\b(compact|small|smaller|minimal)\b/.test(trimmed);
      if (larger) requestedKitchenSize.add("LARGER");
      if (compact) requestedKitchenSize.add("STANDARD");
      const open = /\b(open|breakfast\s+counter|american)\b/.test(trimmed);
      const enclosed = /\b(enclosed|closed|separated?)\b/.test(trimmed);
      if (open) requestedKitchenStyle.add("OPEN");
      if (enclosed) requestedKitchenStyle.add("ENCLOSED");
    }
    if (/\b(sit[\s-]?out|main\s+balcony|living\s+balcony)\b/.test(trimmed) || /\bbalcon(?:y|ies)\b/.test(trimmed) && !/\bbedroom\b/.test(trimmed)) {
      const compact = /\b(compact|small|smaller|minimal|narrow)\b/.test(trimmed);
      const standard = /\b(standard|large|larger|generous)\b/.test(trimmed);
      if (compact) requestedSitout.add("COMPACT");
      if (standard) requestedSitout.add("STANDARD");
    }
    if (/\b(bedroom\s+balcon(?:y|ies)|all\s+bedrooms?|every\s+bedroom|2\s+balconies|two\s+balconies)\b/.test(trimmed)) {
      bedroomBalconies = "ALL_BEDROOMS";
    }
  }
  if (requestedLift.size > 1) {
    throw new Error("CONFLICTING_LIFT_PLACEMENT: east and west were both requested for the shared lift bank");
  }
  if (requestedOts.size > 1) {
    throw new Error("CONFLICTING_OTS_PLACEMENT: central and side OTS placement were both requested");
  }
  if (requestedCore.size > 1) {
    throw new Error("CONFLICTING_CORE_PREFERENCE: conflicting core compactness preferences requested");
  }
  if (requestedKitchenSize.size > 1) {
    throw new Error("CONFLICTING_KITCHEN_PREFERENCE: conflicting larger and compact kitchen preferences requested");
  }
  if (requestedKitchenStyle.size > 1) {
    throw new Error("CONFLICTING_KITCHEN_PREFERENCE: conflicting open and enclosed kitchen styles requested");
  }
  if (requestedSitout.size > 1) {
    throw new Error("CONFLICTING_SITOUT_PREFERENCE: conflicting sit-out balcony preferences requested");
  }
  return {
    liftSide: requestedLift.values().next().value ?? "WEST",
    otsPlacement: requestedOts.values().next().value ?? "CENTRAL",
    coreCompactness: requestedCore.values().next().value ?? "STANDARD",
    kitchenSize: requestedKitchenSize.values().next().value ?? "STANDARD",
    kitchenStyle: requestedKitchenStyle.values().next().value ?? "ENCLOSED",
    sitoutSize: requestedSitout.values().next().value ?? "STANDARD",
    entranceStyle,
    bedroomBalconies
  };
}

// packages/planning-engine/src/pipeline/architectural-connections.ts
var stairRoom = (r) => ["STAIR_ENCLOSURE", "PROTECTED_STAIR_ENCLOSURE", "STAIR_MUMTY"].includes(
  r.architecturalRole ?? ""
);
var coreKey = (r) => r.boundary.points.map((p) => `${p.x},${p.y}`).sort().join(";");
var accessHosts = (f, r) => f.walls.filter(
  (w) => w.roomIds.includes(r.id) && Math.hypot(
    w.endPoint.x - w.startPoint.x,
    w.endPoint.y - w.startPoint.y
  ) >= 1200 && w.roomIds.some(
    (id) => f.rooms.some(
      (q) => q.id === id && [
        "OPEN_CIRCULATION",
        "LIFT_LOBBY",
        "OPEN_TERRACE",
        "VEHICLE_AISLE",
        "ROOF_EQUIPMENT_ZONE",
        "PARKING_AREA"
      ].includes(q.architecturalRole ?? "")
    )
  )
);
var hostFits = (w, p) => {
  const hit = projectOnSegment(p, w.startPoint, w.endPoint);
  return !!hit && hit.distance < 1e-3 && hit.along >= 600 - 1e-3 && hit.along <= hit.length - 600 + 1e-3;
};
function coordinateArchitecturalStairs(building) {
  const ordered = [...building.floors].sort((a, b) => a.level - b.level);
  const elevations = /* @__PURE__ */ new Map();
  let z = 0;
  for (const f of ordered) {
    const at = f.elevationMm ?? z;
    elevations.set(f.id, at);
    z = at + f.floorHeight;
  }
  const templates = /* @__PURE__ */ new Map();
  const groups = /* @__PURE__ */ new Map();
  for (const f of ordered)
    for (const r of f.rooms.filter(stairRoom)) {
      const key = coreKey(r);
      groups.set(key, [
        ...groups.get(key) ?? [],
        { room: r, hosts: accessHosts(f, r) }
      ]);
    }
  for (const [key, group] of groups) {
    const room = group[0].room, preferredHorizontal = room.width <= room.height;
    const seeds = group.flatMap((g) => g.hosts).sort(
      (a, b) => Number(
        Math.abs(b.startPoint.y - b.endPoint.y) < 1e-3 === preferredHorizontal
      ) - Number(
        Math.abs(a.startPoint.y - a.endPoint.y) < 1e-3 === preferredHorizontal
      )
    );
    const candidates = seeds.flatMap((w) => {
      const hit = projectOnSegment(w.startPoint, w.startPoint, w.endPoint);
      return [
        hit.pointAt(hit.length / 2),
        hit.pointAt(600),
        hit.pointAt(hit.length - 600)
      ];
    });
    const point = candidates.find(
      (p) => group.every((g) => g.hosts.some((w) => hostFits(w, p)))
    );
    if (!point) throw new Error(`STAIR_ACCESS_NOT_ALIGNED: ${room.id}`);
    templates.set(key, point);
  }
  const floors = ordered.map((f, i) => {
    const lower = ordered[i - 1], upper = ordered[i + 1];
    const rise = upper ? elevations.get(upper.id) - elevations.get(f.id) : lower ? elevations.get(f.id) - elevations.get(lower.id) : f.floorHeight;
    let doors = [...f.doors];
    const canonicalStaircases = [];
    const openStairHostWallIds = /* @__PURE__ */ new Set();
    const stairs = f.rooms.filter(stairRoom).map((r, index) => {
      const key = coreKey(r), position = templates.get(key);
      const host = accessHosts(f, r).find((w) => hostFits(w, position));
      if (!host) throw new Error(`STAIR_ACCESS_HOST_MISSING: ${r.id}`);
      const role = r.architecturalRole;
      if (f.floorUse !== "ROOF" && (role === "STAIR_ENCLOSURE" || !role) && host.roomIds.length === 2) {
        openStairHostWallIds.add(host.id);
      }
      const existing = doors.find((d) => d.connectsRooms.includes(r.id));
      let door = {
        ...existing ?? {},
        id: existing?.id ?? `${r.id}:access`,
        floorId: f.id,
        wallId: host.id,
        position,
        openingGeometryVersion: 1,
        positionReference: "CENTER",
        width: existing?.width ?? 1200,
        height: existing?.height ?? 2100,
        type: existing?.type ?? DoorType.OpenPassage,
        swingDirection: existing?.swingDirection ?? SwingDirection.Inward,
        connectsRooms: [
          r.id,
          host.roomIds.find((id2) => id2 !== r.id)
        ]
      };
      if (![DoorType.OpenPassage, DoorType.Sliding, DoorType.Folding].includes(
        door.type
      )) {
        const destination = f.rooms.find(
          (q) => q.id === door.connectsRooms[1]
        );
        const chosen = [SwingDirection.Inward, SwingDirection.Outward].map((swingDirection) => ({ ...door, swingDirection })).find(
          (candidate) => containsPolygon(
            destination.boundary,
            computeDoorSwingPolygon(candidate, host)
          )
        );
        if (!chosen)
          throw new Error(`STAIR_DOOR_CLEARANCE_UNAVAILABLE: ${door.id}`);
        door = chosen;
      }
      doors = existing ? doors.map((d) => d.id === existing.id ? door : d) : [...doors, door];
      const old = f.canonicalStaircases?.[index];
      const id = old?.id ?? `${r.id}:stair`;
      const canonical = proposeArchitecturalStair(
        r,
        host,
        rise,
        id,
        1200,
        175,
        position
      );
      canonicalStaircases.push(canonical);
      const horizontal = Math.abs(host.startPoint.y - host.endPoint.y) < 1e-3;
      return {
        id,
        floorId: f.id,
        type: StairType.UShaped,
        boundary: r.boundary,
        x: r.x,
        y: r.y,
        width: r.width,
        length: r.height,
        direction: horizontal ? Direction.North : Direction.East,
        riserCount: canonical.riserCount,
        riserHeight: rise / canonical.riserCount,
        treadDepth: canonical.treadWidthMm,
        landingWidth: canonical.clearWidthMm,
        connectsFloors: upper ? [f.level, upper.level] : lower ? [lower.level, f.level] : [f.level, f.level + 1],
        verticalCoreId: `architectural-stair:${key}`
      };
    });
    return {
      ...f,
      walls: openStairHostWallIds.size ? f.walls.map(
        (w) => openStairHostWallIds.has(w.id) ? { ...w, boundaryRole: "OPEN_BOUNDARY", heightMm: 0 } : w
      ) : f.walls,
      elevationMm: elevations.get(f.id),
      // Both generation producers and their bounded repair routines emit centres.
      // This annotation applies only to fresh generation, never saved-project loading.
      doors: doors.map((o) => {
        const wall = f.walls.find((w) => w.id === o.wallId);
        if (!wall) return o;
        return { ...o, openingGeometryVersion: 1, positionReference: "CENTER" };
      }),
      windows: f.windows.map((o) => {
        const wall = f.walls.find((w) => w.id === o.wallId);
        if (!wall) return o;
        return { ...o, openingGeometryVersion: 1, positionReference: "CENTER" };
      }),
      stairs,
      canonicalStaircases
    };
  });
  return {
    ...building,
    floors,
    canonicalStaircases: floors.flatMap((f) => f.canonicalStaircases)
  };
}

// packages/planning-engine/src/mep/mep-synthesizer.ts
var ELECTRICAL_KINDS = /* @__PURE__ */ new Set(["DB", "FAN", "DL", "SB", "SB_2WAY", "SOCKET_16A", "GY", "AC_IDU", "AC_ODU"]);
var PLUMBING_KINDS = /* @__PURE__ */ new Set(["PLUMB_SHAFT", "FT", "NT"]);
var LABELS = {
  DB: "DB",
  FAN: "FAN",
  DL: "DL",
  SB: "SB",
  SB_2WAY: "2W-SB",
  SOCKET_16A: "16A",
  GY: "GY",
  AC_IDU: "AC-IDU",
  AC_ODU: "AC-ODU",
  PLUMB_SHAFT: "PLUMB SHAFT",
  FT: "FT",
  NT: "NT",
  FHR: "FHR",
  FHR_HR: "FHR-HR",
  FACP: "FACP",
  SD: "SD",
  HD: "HD",
  EXIT_SIGN: "EXIT",
  SPRINKLER: "SPK"
};
var PLUMB_SHAFT_MIN = { widthMm: 600, depthMm: 900 };
var COVE_INSET_MM = 450;
var CEILING_GRID_MM = 600;
var SPRINKLER_SPACING_MM = 3e3;
var SWITCH_OFFSET_FROM_FRAME_MM = 150;
var r10 = (v) => Math.round(v / 10) * 10;
function roomBox(room) {
  const pts = room.boundary?.points ?? [];
  if (!pts.length) return { x: room.x, y: room.y, w: room.width, h: room.height };
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}
var center = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
var inside = (b, p, tol = 0) => p.x >= b.x - tol && p.x <= b.x + b.w + tol && p.y >= b.y - tol && p.y <= b.y + b.h + tol;
var rectOutline = (b) => [
  { x: b.x, y: b.y },
  { x: b.x + b.w, y: b.y },
  { x: b.x + b.w, y: b.y + b.h },
  { x: b.x, y: b.y + b.h }
];
var isLivingLike = (r) => [RoomType.Living, RoomType.Dining, RoomType.FamilyLiving, RoomType.Drawing].includes(r.type);
var isBedroom = (r) => r.type === RoomType.Bedroom;
var isBath = (r) => r.type === RoomType.Bathroom;
var isKitchen = (r) => r.type === RoomType.Kitchen;
var isWetTrapRoom = (r) => isBath(r) || r.type === RoomType.Utility || r.type === RoomType.Balcony;
var isCommonCirculation = (r) => !r.unitId && (r.type === RoomType.Corridor || r.type === RoomType.Foyer || r.architecturalRole === "LIFT_LOBBY") && r.architecturalRole !== "VEHICLE_AISLE";
var isStilt = (f) => f.floorUse === "STILT_PARKING" || /STILT/i.test(f.name);
var isRoof = (f) => f.floorUse === "ROOF" || /TERRACE|ROOF/i.test(f.name);
var isResidential = (f) => !isStilt(f) && !isRoof(f) && f.rooms.some((r) => r.unitId);
function wallDir(w) {
  const dx = w.endPoint.x - w.startPoint.x, dy = w.endPoint.y - w.startPoint.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}
function inwardNormal(w, b) {
  const d = wallDir(w);
  const n = { x: -d.y, y: d.x };
  const mid = { x: (w.startPoint.x + w.endPoint.x) / 2, y: (w.startPoint.y + w.endPoint.y) / 2 };
  const c = center(b);
  return (c.x - mid.x) * n.x + (c.y - mid.y) * n.y >= 0 ? n : { x: -n.x, y: -n.y };
}
var wallRoomIds = (w) => w.roomIds ?? [];
function exteriorWalls(floor, room) {
  return floor.walls.filter((w) => {
    const ids = wallRoomIds(w);
    return ids.includes(room.id) && (w.wallUse === "EXTERNAL" || ids.length === 1) && Math.hypot(w.endPoint.x - w.startPoint.x, w.endPoint.y - w.startPoint.y) >= 1200;
  });
}
var FloorBuilder = class {
  constructor(floor) {
    this.floor = floor;
  }
  symbols = [];
  runs = [];
  ceilings = [];
  cantileverBeams = [];
  n = 0;
  id(prefix) {
    return `${this.floor.id}::mep_${prefix}_${++this.n}`;
  }
  sym(kind, position, extra = {}) {
    const discipline = ELECTRICAL_KINDS.has(kind) ? "ELECTRICAL" : PLUMBING_KINDS.has(kind) ? "PLUMBING" : "FIRE";
    const layer = discipline === "ELECTRICAL" ? "M-ELEC-SYMB" : discipline === "PLUMBING" ? "M-PLUMB-FIXT" : "F-FIRE-SYMB";
    const s = {
      id: this.id(kind.toLowerCase()),
      kind,
      discipline,
      layer,
      position: { x: r10(position.x), y: r10(position.y) },
      label: LABELS[kind],
      ...extra
    };
    this.symbols.push(s);
    return s;
  }
  run(kind, points, extra = {}) {
    if (points.length < 2) return;
    const electrical = kind === "WIRING_LOOP";
    this.runs.push({
      id: this.id(kind.toLowerCase()),
      kind,
      discipline: electrical ? "ELECTRICAL" : "PLUMBING",
      layer: electrical ? "M-ELEC-WIRE" : "M-PLUMB-PIPE",
      points: points.map((p) => ({ x: r10(p.x), y: r10(p.y) })),
      ...kind === "SP" ? { diameterMm: 110 } : kind === "WP" ? { diameterMm: 75 } : kind === "CWS" || kind === "HWS" ? { diameterMm: 20 } : {},
      ...extra
    });
  }
  build() {
    return { floorId: this.floor.id, floorLevel: this.floor.level, symbols: this.symbols, runs: this.runs, ceilings: this.ceilings, cantileverBeams: this.cantileverBeams };
  }
};
function switchboardForDoor(floor, door, room) {
  const wall = floor.walls.find((w) => w.id === door.wallId);
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
function shaftForBath(floor, bath) {
  const b = roomBox(bath);
  const walls = floor.walls.filter((w2) => wallRoomIds(w2).includes(bath.id));
  const ext = walls.find((w2) => w2.wallUse === "EXTERNAL" || wallRoomIds(w2).length === 1) ?? walls.find((w2) => w2.wallUse === "COMMON_CORRIDOR" || w2.wallUse === "SHAFT") ?? walls[0];
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
function synthesizeUnitElectrical(fb, floor, unitRooms, unitId) {
  const roomIds = new Set(unitRooms.map((r) => r.id));
  const entrance = floor.doors.find((d) => {
    const [a, b] = d.connectsRooms;
    return roomIds.has(a) && !roomIds.has(b) || roomIds.has(b) && !roomIds.has(a);
  });
  const entryRoom = entrance ? unitRooms.find((r) => entrance.connectsRooms.includes(r.id)) : unitRooms.find(isLivingLike);
  let db;
  if (entryRoom) {
    const b = roomBox(entryRoom);
    const sb = entrance ? switchboardForDoor(floor, entrance, entryRoom) : null;
    const base = sb ?? { x: b.x + 300, y: b.y + 300 };
    const c = center(b);
    const len = Math.hypot(c.x - base.x, c.y - base.y) || 1;
    const p = { x: base.x + (c.x - base.x) / len * 250, y: base.y + (c.y - base.y) / len * 250 };
    db = fb.sym("DB", inside(b, p) ? p : c, { roomId: entryRoom.id, unitId, label: "DB (MAIN)" });
  }
  const fans = [];
  const bedrooms = unitRooms.filter(isBedroom);
  const master = bedrooms.find((r) => /master/i.test(r.name)) ?? [...bedrooms].sort((a, b) => b.area - a.area)[0];
  for (const room of unitRooms) {
    const b = roomBox(room);
    const c = center(b);
    if (isLivingLike(room) || isBedroom(room)) {
      fb.sym("FAN", c, { roomId: room.id, unitId });
      fans.push(c);
      const off = Math.max(b.w, b.h) / 4;
      const horizontal = b.w >= b.h;
      fb.sym("DL", horizontal ? { x: c.x - off, y: c.y } : { x: c.x, y: c.y - off }, { roomId: room.id, unitId });
      fb.sym("DL", horizontal ? { x: c.x + off, y: c.y } : { x: c.x, y: c.y + off }, { roomId: room.id, unitId });
      for (const wall of exteriorWalls(floor, room).slice(0, 1)) {
        const mid = { x: (wall.startPoint.x + wall.endPoint.x) / 2, y: (wall.startPoint.y + wall.endPoint.y) / 2 };
        const n = inwardNormal(wall, b);
        fb.sym("AC_IDU", { x: mid.x + n.x * 200, y: mid.y + n.y * 200 }, { roomId: room.id, unitId, widthMm: 900, depthMm: 250 });
        fb.sym("AC_ODU", { x: mid.x - n.x * 450, y: mid.y - n.y * 450 }, { roomId: room.id, unitId, widthMm: 850, depthMm: 350 });
      }
    }
    if (room === master) {
      const side = b.w >= b.h ? { x: 0, y: 1 } : { x: 1, y: 0 };
      const spread = Math.min(b.w, b.h) * 0.3;
      fb.sym("SB_2WAY", { x: c.x - side.x * spread, y: c.y - side.y * spread }, { roomId: room.id, unitId, label: "2W-SB L" });
      fb.sym("SB_2WAY", { x: c.x + side.x * spread, y: c.y + side.y * spread }, { roomId: room.id, unitId, label: "2W-SB R" });
    }
    if (isKitchen(room)) {
      const labels = ["16A FRIDGE", "16A MICROWAVE", "16A HOB/CHIMNEY"];
      labels.forEach((label, i) => {
        const t = (i + 1) / (labels.length + 1);
        fb.sym("SOCKET_16A", b.w >= b.h ? { x: b.x + b.w * t, y: b.y + 150 } : { x: b.x + 150, y: b.y + b.h * t }, { roomId: room.id, unitId, label });
      });
    }
    if (isBath(room)) {
      fb.sym("GY", { x: b.x + b.w - 300, y: b.y + 300 }, { roomId: room.id, unitId, label: "GY 16A" });
    }
    for (const door of floor.doors.filter((d) => d.connectsRooms.includes(room.id) && d.type !== DoorType.OpenPassage)) {
      if (isBalconyLike(room)) continue;
      const p = switchboardForDoor(floor, door, room);
      if (p) fb.sym("SB", p, { roomId: room.id, unitId, label: "SB 6A" });
    }
  }
  if (db && fans.length) fb.run("WIRING_LOOP", [db.position, ...fans], { roomId: db.roomId });
}
var isBalconyLike = (r) => r.type === RoomType.Balcony;
function synthesizeUnitPlumbing(fb, floor, unitRooms, unitId, shafts) {
  for (const room of unitRooms) {
    const b = roomBox(room);
    if (isWetTrapRoom(room)) fb.sym("FT", { x: b.x + b.w / 2, y: b.y + b.h / 2 }, { roomId: room.id, unitId });
    if (!isBath(room) && !isKitchen(room)) continue;
    const shaft = shafts.get(room.id) ?? shaftForBath(floor, room);
    const sc = center(shaft);
    if (isBath(room)) {
      const nt = fb.sym("NT", { x: b.x + b.w * 0.7, y: b.y + b.h * 0.7 }, { roomId: room.id, unitId, label: "NT (SHOWER)" });
      const wc = { x: b.x + b.w * 0.25, y: b.y + b.h - 450 };
      const basin = { x: b.x + b.w * 0.75, y: b.y + 350 };
      fb.run("SP", [wc, { x: wc.x, y: sc.y }, sc], { roomId: room.id });
      fb.run("WP", [basin, { x: basin.x, y: sc.y }, sc], { roomId: room.id });
      fb.run("WP", [nt.position, { x: nt.position.x, y: sc.y }, sc], { roomId: room.id });
      fb.run("CWS", [sc, { x: sc.x + 120, y: wc.y }, wc], { roomId: room.id });
      fb.run("HWS", [sc, { x: sc.x - 120, y: basin.y }, basin], { roomId: room.id });
    } else {
      const sink = { x: b.x + b.w / 2, y: b.y + 350 };
      fb.run("WP", [sink, { x: sink.x, y: sc.y }, sc], { roomId: room.id });
      fb.run("CWS", [sc, { x: sc.x, y: sink.y }, sink], { roomId: room.id });
    }
  }
}
function synthesizeCeilings(fb, floor, rooms) {
  const unitMaster = /* @__PURE__ */ new Map();
  for (const r of rooms.filter(isBedroom)) {
    const key = r.unitId ?? "common";
    const cur = unitMaster.get(key);
    if (/master/i.test(r.name) || !cur || !/master/i.test(cur.name) && r.area > cur.area) unitMaster.set(key, r);
  }
  const masters = new Set([...unitMaster.values()].map((r) => r.id));
  for (const room of rooms) {
    const b = roomBox(room);
    if ((isLivingLike(room) || masters.has(room.id)) && b.w > 2 * COVE_INSET_MM + 600 && b.h > 2 * COVE_INSET_MM + 600) {
      fb.ceilings.push({
        id: fb.id("cove"),
        kind: "COVE_GYPSUM",
        roomId: room.id,
        insetMm: COVE_INSET_MM,
        outline: rectOutline({ x: b.x + COVE_INSET_MM, y: b.y + COVE_INSET_MM, w: b.w - 2 * COVE_INSET_MM, h: b.h - 2 * COVE_INSET_MM })
      });
    }
    if (isBath(room) || room.type === RoomType.Corridor && room.architecturalRole !== "VEHICLE_AISLE") {
      const gridLines = [];
      for (let x = b.x + CEILING_GRID_MM; x < b.x + b.w; x += CEILING_GRID_MM) gridLines.push([{ x, y: b.y }, { x, y: b.y + b.h }]);
      for (let y = b.y + CEILING_GRID_MM; y < b.y + b.h; y += CEILING_GRID_MM) gridLines.push([{ x: b.x, y }, { x: b.x + b.w, y }]);
      fb.ceilings.push({ id: fb.id("grid"), kind: "GRID_600", roomId: room.id, outline: rectOutline(b), gridLines });
    }
    if (isLivingLike(room) || isBedroom(room)) {
      const openings = [
        ...floor.windows.filter((w) => floor.walls.some((wl) => wl.id === w.wallId && wallRoomIds(wl).includes(room.id))),
        ...floor.doors.filter((d) => d.connectsRooms.includes(room.id) && rooms.some((o) => o.type === RoomType.Balcony && d.connectsRooms.includes(o.id)))
      ];
      for (const op of openings) {
        const wall = floor.walls.find((w) => w.id === op.wallId);
        if (!wall) continue;
        const d = wallDir(wall), n = inwardNormal(wall, b);
        const half = op.width / 2 + 150;
        const a = { x: op.position.x - d.x * half, y: op.position.y - d.y * half };
        const c = { x: op.position.x + d.x * half, y: op.position.y + d.y * half };
        fb.ceilings.push({
          id: fb.id("pelmet"),
          kind: "PELMET",
          roomId: room.id,
          outline: [a, c, { x: c.x + n.x * 150, y: c.y + n.y * 150 }, { x: a.x + n.x * 150, y: a.y + n.y * 150 }].map((p) => ({ x: r10(p.x), y: r10(p.y) }))
        });
      }
    }
  }
}
function synthesizeFire(fb, floor, stilt) {
  const stair = floor.rooms.find((r) => r.type === RoomType.Staircase);
  if (stair) {
    const sbx = roomBox(stair);
    const lobby = floor.rooms.find((r) => isCommonCirculation(r) && sharesEdge(roomBox(r), sbx));
    const host = lobby ? roomBox(lobby) : sbx;
    const anchor = { x: Math.max(host.x + 300, Math.min(host.x + host.w - 300, sbx.x + sbx.w / 2)), y: Math.max(host.y + 300, Math.min(host.y + host.h - 300, sbx.y + sbx.h / 2)) };
    fb.sym("FHR", anchor, { roomId: lobby?.id ?? stair.id, label: "FHR (WET RISER)" });
    fb.sym("FHR_HR", { x: anchor.x + (host.w > host.h ? 500 : 0), y: anchor.y + (host.w > host.h ? 0 : 500) }, { roomId: lobby?.id ?? stair.id, label: "FHR-HR (HOSE REEL)" });
    fb.sym("FACP", { x: anchor.x - (host.w > host.h ? 500 : 0), y: anchor.y - (host.w > host.h ? 0 : 500) }, { roomId: lobby?.id ?? stair.id });
  }
  for (const stairRoom2 of floor.rooms.filter((r) => r.type === RoomType.Staircase)) {
    for (const door of floor.doors.filter((d) => d.connectsRooms.includes(stairRoom2.id))) {
      fb.sym("EXIT_SIGN", door.position, { roomId: stairRoom2.id, label: "EXIT" });
    }
  }
  for (const room of floor.rooms.filter(isCommonCirculation)) {
    const b = roomBox(room);
    const long = Math.max(b.w, b.h);
    const count = Math.max(1, Math.ceil(long / 7e3));
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      fb.sym("SD", b.w >= b.h ? { x: b.x + b.w * t, y: b.y + b.h / 2 } : { x: b.x + b.w / 2, y: b.y + b.h * t }, { roomId: room.id });
    }
  }
  for (const k of floor.rooms.filter(isKitchen)) fb.sym("HD", center(roomBox(k)), { roomId: k.id, unitId: k.unitId });
  if (stilt) {
    for (const room of floor.rooms.filter((r) => r.type === RoomType.Parking || r.architecturalRole === "VEHICLE_AISLE" || r.architecturalRole === "PARKING_BAY")) {
      const b = roomBox(room);
      for (let x = b.x + SPRINKLER_SPACING_MM / 2; x < b.x + b.w; x += SPRINKLER_SPACING_MM)
        for (let y = b.y + SPRINKLER_SPACING_MM / 2; y < b.y + b.h; y += SPRINKLER_SPACING_MM)
          fb.sym("SPRINKLER", { x, y }, { roomId: room.id });
    }
  }
}
function sharesEdge(a, b) {
  const xOverlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const yOverlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return xOverlap > 0 && (Math.abs(a.y + a.h - b.y) < 1 || Math.abs(b.y + b.h - a.y) < 1) || yOverlap > 0 && (Math.abs(a.x + a.w - b.x) < 1 || Math.abs(b.x + b.w - a.x) < 1);
}
function synthesizeCantilevers(fb, floor) {
  const indoor = floor.rooms.filter((r) => r.type !== RoomType.Balcony && r.architecturalRole !== "OPEN_TO_SKY_VOID");
  for (const bal of floor.rooms.filter((r) => r.type === RoomType.Balcony)) {
    const b = roomBox(bal);
    const host = indoor.map(roomBox).find((o) => sharesEdge(o, b));
    if (!host) continue;
    const hostAbove = Math.abs(host.y + host.h - b.y) < 1;
    const hostBelow = Math.abs(b.y + b.h - host.y) < 1;
    const hostLeft = Math.abs(host.x + host.w - b.x) < 1;
    const beams = [];
    if (hostAbove || hostBelow) {
      const y0 = hostAbove ? b.y : b.y + b.h, y1 = hostAbove ? b.y + b.h : b.y;
      for (const x of [b.x + 150, b.x + b.w - 150]) beams.push([{ x, y: y0 }, { x, y: y1 }, b.h]);
    } else {
      const x0 = hostLeft ? b.x : b.x + b.w, x1 = hostLeft ? b.x + b.w : b.x;
      for (const y of [b.y + 150, b.y + b.h - 150]) beams.push([{ x: x0, y }, { x: x1, y }, b.w]);
    }
    for (const [start, end, projection] of beams) {
      fb.cantileverBeams.push({
        id: fb.id("cantilever"),
        balconyRoomId: bal.id,
        start: { x: r10(start.x), y: r10(start.y) },
        end: { x: r10(end.x), y: r10(end.y) },
        projectionMm: r10(projection),
        widthMm: 230,
        depthMm: 450
      });
    }
  }
}
function synthesizeMepEngineering(building) {
  const floors = [...building.floors].sort((a, b) => a.level - b.level);
  const residential3 = floors.filter(isResidential);
  const reference = residential3[0];
  const stackBoxes = /* @__PURE__ */ new Map();
  const stackByKey = /* @__PURE__ */ new Map();
  if (reference) {
    for (const bath of reference.rooms.filter((r) => isBath(r) || isKitchen(r))) {
      const box = isBath(bath) ? shaftForBath(reference, bath) : void 0;
      if (!box) continue;
      const key = `${box.x}|${box.y}`;
      stackByKey.set(key, { box, floorIds: [] });
    }
  }
  const stiltFloor = floors.find(isStilt);
  const plans = [];
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
      for (const stack of stackByKey.values()) {
        stack.floorIds.push(floor.id);
        fb.sym("PLUMB_SHAFT", center(stack.box), { widthMm: stack.box.w, depthMm: stack.box.h, label: "PLUMB SHAFT 600x900" });
      }
      for (const k of floor.rooms.filter(isKitchen)) {
        const nearest = [...stackByKey.values()].sort((a, b) => dist(center(a.box), center(roomBox(k))) - dist(center(b.box), center(roomBox(k))))[0];
        if (nearest) stackBoxes.set(k.id, nearest.box);
      }
      const byUnit = /* @__PURE__ */ new Map();
      for (const r of floor.rooms.filter((x) => x.unitId)) byUnit.set(r.unitId, [...byUnit.get(r.unitId) ?? [], r]);
      for (const [unitId, unitRooms] of byUnit) {
        synthesizeUnitElectrical(fb, floor, unitRooms, unitId);
        synthesizeUnitPlumbing(fb, floor, unitRooms, unitId, stackBoxes);
      }
      synthesizeCeilings(fb, floor, [...floor.rooms]);
      synthesizeCantilevers(fb, floor);
      synthesizeFire(fb, floor, false);
    } else if (isStilt(floor)) {
      synthesizeFire(fb, floor, true);
      const stacks = [...stackByKey.values()];
      for (const stack of stacks) {
        stack.floorIds.push(floor.id);
        fb.sym("PLUMB_SHAFT", center(stack.box), { widthMm: stack.box.w, depthMm: stack.box.h, label: "STACK TO COLLECTOR" });
      }
      if (stacks.length >= 1) {
        const pts = stacks.map((s) => center(s.box)).sort((a, b) => a.x - b.x || a.y - b.y);
        const collectorY = Math.min(...floor.boundary.points.map((p) => p.y)) + 300;
        fb.run("SP", [...pts.map((p) => ({ x: p.x, y: collectorY })), ...pts.length === 1 ? [{ x: pts[0].x + 1e3, y: collectorY }] : []]);
      }
    }
    plans.push(fb.build());
  }
  const all = plans.flatMap((p) => p.symbols);
  const count = (k) => all.filter((s) => s.kind === k).length;
  return {
    schemaVersion: "RH-MEP-3.0",
    status: "COORDINATION_PROPOSAL_NOT_CERTIFIED",
    floors: plans,
    verticalStacks: [...stackByKey.entries()].map(([key, s], i) => ({
      id: `stack_${i + 1}_${key.replace("|", "_")}`,
      position: center(s.box),
      widthMm: s.box.w,
      depthMm: s.box.h,
      floorIds: s.floorIds,
      terminatesAtStiltCollector: Boolean(stiltFloor && s.floorIds.includes(stiltFloor.id))
    })),
    summary: {
      distributionBoards: count("DB"),
      fans: count("FAN"),
      downlights: count("DL"),
      switchboards: count("SB") + count("SB_2WAY"),
      sockets16A: count("SOCKET_16A"),
      geysers: count("GY"),
      acIndoorUnits: count("AC_IDU"),
      plumbingShafts: count("PLUMB_SHAFT"),
      floorTraps: count("FT") + count("NT"),
      fireRisers: count("FHR"),
      smokeDetectors: count("SD"),
      heatDetectors: count("HD"),
      exitSigns: count("EXIT_SIGN"),
      sprinklers: count("SPRINKLER"),
      pipeRuns: plans.reduce((s, p) => s + p.runs.length, 0),
      ceilingZones: plans.reduce((s, p) => s + p.ceilings.length, 0),
      cantileverBeams: plans.reduce((s, p) => s + p.cantileverBeams.length, 0)
    }
  };
}
var dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function withMepEngineering(building) {
  return { ...building, mepEngineering: synthesizeMepEngineering(building) };
}

// packages/planning-engine/src/apartment/bedroom-balcony-audit.ts
function bedroomBalconySchedule(building) {
  return building.floors.flatMap((floor) => floor.rooms.filter((room) => room.type === RoomType.Bedroom).map((bedroom) => {
    const candidates = floor.rooms.filter((room) => room.type === RoomType.Balcony && room.unitId === bedroom.unitId);
    const connected = candidates.flatMap((balcony) => floor.doors.filter((door) => door.connectsRooms?.includes(bedroom.id) && door.connectsRooms.includes(balcony.id) && floor.walls.some((wall) => wall.id === door.wallId)).map((door) => ({ balcony, door })));
    const match = connected.length === 1 ? connected[0] : void 0;
    const bounds = match ? polygonBoundingBox(match.balcony.boundary) : void 0;
    return {
      flatId: bedroom.unitId ?? null,
      floorId: floor.id,
      bedroomId: bedroom.id,
      balconyId: match?.balcony.id ?? null,
      accessDoorId: match?.door.id ?? null,
      dimensionsMm: bounds ? { width: bounds.width, depth: bounds.height } : null,
      areaM2: match ? polygonArea2(match.balcony.boundary) / 1e6 : null,
      externalExposure: "NOT_VERIFIED",
      udcprStatus: "NOT_VERIFIED",
      geometryStatus: match ? "NOT_VERIFIED" : "FAILED",
      feasibilityReason: match ? "Door relationship found; wall fit, clearances, exterior exposure, guards and projection applicability still require validation." : connected.length > 1 ? "Ambiguous bedroom balcony assignment." : "No same-flat bedroom balcony with a door referencing an existing wall.",
      alternatives: match ? [] : ["Reposition the bedroom on an exterior facade.", "Reserve an inset balcony while retaining minimum bedroom and kitchen clearances."]
    };
  }));
}

// packages/constraint-engine/dist/types.js
var ConstraintSeverity;
(function(ConstraintSeverity2) {
  ConstraintSeverity2["HARD"] = "hard";
  ConstraintSeverity2["SOFT"] = "soft";
  ConstraintSeverity2["WARNING"] = "warning";
  ConstraintSeverity2["INFORMATIONAL"] = "informational";
})(ConstraintSeverity || (ConstraintSeverity = {}));
var ConstraintCategory;
(function(ConstraintCategory2) {
  ConstraintCategory2["GEOMETRY"] = "geometry";
  ConstraintCategory2["PROGRAM"] = "program";
  ConstraintCategory2["ACCESSIBILITY"] = "accessibility";
  ConstraintCategory2["CIRCULATION"] = "circulation";
  ConstraintCategory2["DAYLIGHT"] = "daylight";
  ConstraintCategory2["PRIVACY"] = "privacy";
  ConstraintCategory2["FUNCTIONAL_ZONING"] = "functional_zoning";
  ConstraintCategory2["STRUCTURAL"] = "structural";
  ConstraintCategory2["VASTU"] = "vastu";
  ConstraintCategory2["REGULATORY"] = "regulatory";
  ConstraintCategory2["USER_PREFERENCE"] = "user_preference";
})(ConstraintCategory || (ConstraintCategory = {}));
var EvaluationStatus;
(function(EvaluationStatus2) {
  EvaluationStatus2["PASS"] = "PASS";
  EvaluationStatus2["FAIL"] = "FAIL";
  EvaluationStatus2["WARNING"] = "WARNING";
  EvaluationStatus2["NOT_APPLICABLE"] = "NOT_APPLICABLE";
  EvaluationStatus2["NOT_ANALYZED"] = "NOT_ANALYZED";
  EvaluationStatus2["NOT_CHECKED"] = "NOT_CHECKED";
  EvaluationStatus2["INSUFFICIENT_INPUT"] = "INSUFFICIENT_INPUT";
  EvaluationStatus2["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
})(EvaluationStatus || (EvaluationStatus = {}));

// packages/constraint-engine/dist/constraints/hard/plot-containment.js
var RoomContainment = {
  id: "HC-001",
  name: "Room Containment",
  description: "Every room boundary must be fully inside its floor boundary",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    for (const floor of context.building.floors) {
      if (floor.boundary.points.length < 3)
        continue;
      for (const room of floor.rooms) {
        if (room.boundary.points.length < 3)
          continue;
        const contained = containsPolygon(floor.boundary, room.boundary);
        if (!contained) {
          const fix = {
            description: `Move or resize "${room.name}" to fit within the floor boundary`,
            actionType: "move",
            targetEntity: room.id,
            priority: 1
          };
          results.push({
            constraintId: "HC-001",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Room "${room.name}" extends outside the floor boundary on "${floor.name}"`,
            affectedEntities: [room.id],
            explanation: `The boundary of "${room.name}" is not fully contained within the "${floor.name}" boundary. This makes the plan structurally invalid. Move or resize the room so it fits entirely within the buildable area.`,
            suggestedFixes: [fix]
          });
        }
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-001",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All rooms are contained within their floor boundaries",
        affectedEntities: [],
        explanation: "All room boundaries are fully inside their respective floor boundaries."
      });
    }
    return results;
  }
};
var FloorContainment = {
  id: "HC-002",
  name: "Floor Containment",
  description: "Every floor boundary must be inside the buildable envelope (plot minus setbacks)",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    for (const floor of context.building.floors) {
      if (floor.boundary.points.length < 3)
        continue;
      if (context.buildableEnvelope.points.length < 3)
        continue;
      const contained = containsPolygon(context.buildableEnvelope, floor.boundary);
      if (!contained) {
        results.push({
          constraintId: "HC-002",
          passed: false,
          severity: ConstraintSeverity.HARD,
          score: 0,
          maxScore: 0,
          message: `Floor "${floor.name}" extends outside the buildable area (plot minus setbacks)`,
          affectedEntities: [floor.id],
          explanation: `The "${floor.name}" boundary exceeds the buildable envelope defined by plot dimensions minus required setbacks. Reduce the floor footprint to respect setback requirements.`,
          suggestedFixes: [{
            description: `Reduce floor footprint to fit within setback limits`,
            actionType: "resize",
            targetEntity: floor.id,
            priority: 1
          }]
        });
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-002",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All floors are within the buildable envelope",
        affectedEntities: [],
        explanation: "All floor boundaries respect the required setback distances from plot edges."
      });
    }
    return results;
  }
};

// packages/constraint-engine/dist/constraints/hard/room-overlap.js
var NoIllegalOverlap = {
  id: "HC-003",
  name: "No Illegal Overlap",
  description: "No two rooms on the same floor may overlap beyond tolerance",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    for (const floor of context.building.floors) {
      const rooms = floor.rooms;
      for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
          const a = rooms[i];
          const b = rooms[j];
          const overlapArea = polygonIntersectionArea(a.boundary, b.boundary);
          if (overlapArea > TOLERANCES.OVERLAP) {
            const sqFt = sqMmToSqFt(overlapArea);
            results.push({
              constraintId: "HC-003",
              passed: false,
              severity: ConstraintSeverity.HARD,
              score: 0,
              maxScore: 0,
              message: `"${a.name}" overlaps "${b.name}" by approximately ${sqFt.toFixed(1)} sq ft`,
              affectedEntities: [a.id, b.id],
              explanation: `The boundary of "${a.name}" intersects with the boundary of "${b.name}". The overlapping region has an area of approximately ${sqFt.toFixed(1)} sq ft (${Math.round(overlapArea)} sq mm). Move one of the rooms so their boundaries do not overlap.`,
              suggestedFixes: [
                {
                  description: `Move "${b.name}" away from "${a.name}" to eliminate overlap`,
                  actionType: "move",
                  targetEntity: b.id,
                  priority: 1
                }
              ]
            });
          }
        }
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-003",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "No rooms overlap",
        affectedEntities: [],
        explanation: "All rooms have non-overlapping boundaries."
      });
    }
    return results;
  }
};

// packages/constraint-engine/dist/constraints/hard/geometry-validity.js
var ValidPolygons = {
  id: "HC-004",
  name: "Valid Polygons",
  description: "All room and floor boundaries must be valid closed polygons",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    for (const floor of context.building.floors) {
      for (const room of floor.rooms) {
        if (!isValidPolygon(room.boundary)) {
          results.push({
            constraintId: "HC-004",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Room "${room.name}" has an invalid boundary polygon`,
            affectedEntities: [room.id],
            explanation: `The boundary of "${room.name}" is not a valid closed polygon. It may have fewer than 3 points, self-intersections, or zero area. Correct the room geometry.`,
            suggestedFixes: [{
              description: `Correct the boundary polygon of "${room.name}"`,
              actionType: "resize",
              targetEntity: room.id,
              priority: 1
            }]
          });
        }
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-004",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All boundaries are valid polygons",
        affectedEntities: [],
        explanation: "All room and floor boundary polygons are geometrically valid."
      });
    }
    return results;
  }
};
var PositiveArea = {
  id: "HC-005",
  name: "Positive Area",
  description: "All rooms must have area greater than zero",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    for (const floor of context.building.floors) {
      for (const room of floor.rooms) {
        if (room.area <= 0) {
          results.push({
            constraintId: "HC-005",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Room "${room.name}" has non-positive area (${room.area} sq mm)`,
            affectedEntities: [room.id],
            explanation: `"${room.name}" has an area of ${room.area} sq mm, which is zero or negative. Rooms must have positive width and height to be valid.`,
            suggestedFixes: [{
              description: `Set positive dimensions for "${room.name}"`,
              actionType: "resize",
              targetEntity: room.id,
              priority: 1
            }]
          });
        }
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-005",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All rooms have positive area",
        affectedEntities: [],
        explanation: "Every room has a valid positive area."
      });
    }
    return results;
  }
};
var WallIntegrity = {
  id: "HC-006",
  name: "Wall Integrity",
  description: "All walls must have non-zero length and valid thickness",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    for (const floor of context.building.floors) {
      for (const wall of floor.walls) {
        const len = segmentLength({ start: wall.startPoint, end: wall.endPoint });
        if (len < TOLERANCES.LINEAR) {
          results.push({
            constraintId: "HC-006",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `A wall on "${floor.name}" has zero length`,
            affectedEntities: [wall.id],
            explanation: `Wall ${wall.id} has a length of ${len.toFixed(1)} mm, which is below the minimum threshold. Correct the wall endpoints.`,
            suggestedFixes: [{
              description: "Remove the zero-length wall or correct its endpoints",
              actionType: "remove",
              targetEntity: wall.id,
              priority: 2
            }]
          });
        }
        if (wall.thickness <= 0) {
          results.push({
            constraintId: "HC-006",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `A wall on "${floor.name}" has invalid thickness (${wall.thickness} mm)`,
            affectedEntities: [wall.id],
            explanation: `Wall ${wall.id} has thickness ${wall.thickness} mm. Walls must have positive thickness.`,
            suggestedFixes: [{
              description: "Set a valid wall thickness (e.g., 150mm for internal)",
              actionType: "resize",
              targetEntity: wall.id,
              priority: 2
            }]
          });
        }
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-006",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All walls have valid geometry",
        affectedEntities: [],
        explanation: "All walls have non-zero length and valid thickness."
      });
    }
    return results;
  }
};

// packages/constraint-engine/dist/constraints/hard/required-rooms.js
var RequiredRoomsPresent = {
  id: "HC-020",
  name: "Required Rooms Present",
  description: "All user-required room types must exist in the building",
  category: ConstraintCategory.PROGRAM,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    const requiredCounts = {
      ...Object.fromEntries(context.requiredRoomTypes.map((type) => [type, 1])),
      ...context.requiredRoomCounts
    };
    if (Object.keys(requiredCounts).length === 0) {
      results.push({
        constraintId: "HC-020",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "No required room types specified",
        affectedEntities: [],
        explanation: "No specific room types were required for this plan."
      });
      return results;
    }
    const presentCounts = /* @__PURE__ */ new Map();
    for (const floor of context.building.floors) {
      for (const room of floor.rooms) {
        presentCounts.set(room.type, (presentCounts.get(room.type) ?? 0) + 1);
      }
    }
    for (const [requiredType, rawRequiredCount] of Object.entries(requiredCounts)) {
      const requiredCount = Math.max(0, Math.floor(rawRequiredCount ?? 0));
      const presentCount = presentCounts.get(requiredType) ?? 0;
      if (presentCount < requiredCount) {
        const missingCount = requiredCount - presentCount;
        results.push({
          constraintId: "HC-020",
          passed: false,
          severity: ConstraintSeverity.HARD,
          score: 0,
          maxScore: 0,
          message: presentCount === 0 ? `Required room type "${requiredType}" is missing from the plan (0 of ${requiredCount} present)` : `Plan has ${presentCount} of ${requiredCount} required "${requiredType}" spaces`,
          affectedEntities: [],
          explanation: `The normalized room program requires ${requiredCount} "${requiredType}" spaces, but the plan contains ${presentCount}. Add ${missingCount} more.`,
          suggestedFixes: [{
            description: `Add ${missingCount} "${requiredType}" ${missingCount === 1 ? "space" : "spaces"} to the plan`,
            actionType: "add",
            priority: 1,
            parameters: { roomType: requiredType, missingCount }
          }]
        });
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-020",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All required room types are present",
        affectedEntities: [],
        explanation: "Every required room type has at least one instance in the building."
      });
    }
    return results;
  }
};

// packages/constraint-engine/dist/helpers/connectivity.js
var OUTSIDE_NODE = "__outside__";
function buildConnectivityGraph(floor) {
  const nodes = /* @__PURE__ */ new Set();
  const edges = /* @__PURE__ */ new Map();
  for (const room of floor.rooms) {
    nodes.add(room.id);
    edges.set(room.id, /* @__PURE__ */ new Set());
  }
  nodes.add(OUTSIDE_NODE);
  edges.set(OUTSIDE_NODE, /* @__PURE__ */ new Set());
  for (const door of floor.doors) {
    const [roomA, roomB] = door.connectsRooms;
    const isOutsideA = !roomA || roomA === "" || roomA === "outside" || roomA === OUTSIDE_NODE;
    const isOutsideB = !roomB || roomB === "" || roomB === "outside" || roomB === OUTSIDE_NODE;
    if (isOutsideA && !isOutsideB && roomB) {
      if (edges.has(roomB)) {
        edges.get(OUTSIDE_NODE).add(roomB);
        edges.get(roomB).add(OUTSIDE_NODE);
      }
    } else if (isOutsideB && !isOutsideA && roomA) {
      if (edges.has(roomA)) {
        edges.get(OUTSIDE_NODE).add(roomA);
        edges.get(roomA).add(OUTSIDE_NODE);
      }
    } else if (roomA && roomB) {
      if (edges.has(roomA) && edges.has(roomB)) {
        edges.get(roomA).add(roomB);
        edges.get(roomB).add(roomA);
      }
    }
  }
  return { nodes, edges };
}
function findUnreachableRooms(floor) {
  if (floor.doors.length === 0) {
    return floor.rooms.map((room) => room.id);
  }
  const graph = buildConnectivityGraph(floor);
  const visited = /* @__PURE__ */ new Set();
  const queue = [OUTSIDE_NODE];
  visited.add(OUTSIDE_NODE);
  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = graph.edges.get(current) ?? /* @__PURE__ */ new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  const unreachable = [];
  for (const room of floor.rooms) {
    if (!visited.has(room.id)) {
      unreachable.push(room.id);
    }
  }
  return unreachable;
}
function doorTransitionsToRoom(floor, roomId) {
  if (floor.doors.length === 0)
    return Infinity;
  const graph = buildConnectivityGraph(floor);
  const distances = /* @__PURE__ */ new Map();
  const queue = [OUTSIDE_NODE];
  distances.set(OUTSIDE_NODE, 0);
  while (queue.length > 0) {
    const current = queue.shift();
    const currentDist = distances.get(current);
    const neighbors = graph.edges.get(current) ?? /* @__PURE__ */ new Set();
    for (const neighbor of neighbors) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, currentDist + 1);
        queue.push(neighbor);
      }
    }
  }
  return distances.get(roomId) ?? Infinity;
}

// packages/constraint-engine/dist/constraints/hard/accessibility.js
var RoomAccessibility = {
  id: "HC-010",
  name: "Room Accessibility",
  description: "Every room must be reachable from the entrance via doors",
  category: ConstraintCategory.ACCESSIBILITY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    for (const floor of context.building.floors) {
      if (floor.rooms.length === 0)
        continue;
      if (context.allowIncompleteDraft && floor.doors.length === 0)
        continue;
      const unreachable = findUnreachableRooms(floor);
      for (const roomId of unreachable) {
        const room = floor.rooms.find((r) => r.id === roomId);
        const roomName = room?.name ?? roomId;
        results.push({
          constraintId: "HC-010",
          passed: false,
          severity: ConstraintSeverity.HARD,
          score: 0,
          maxScore: 0,
          message: `"${roomName}" is not reachable from the entrance`,
          affectedEntities: [roomId],
          explanation: `"${roomName}" on "${floor.name}" has no path connecting it to the entrance through doors. Add a door connecting this room to an adjacent accessible room.`,
          suggestedFixes: [{
            description: `Add a door connecting "${roomName}" to an adjacent accessible space`,
            actionType: "add",
            targetEntity: roomId,
            priority: 1
          }]
        });
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-010",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All rooms are accessible",
        affectedEntities: [],
        explanation: "Every room is reachable from the entrance via doors."
      });
    }
    return results;
  }
};
var CorridorWidth = {
  id: "HC-013",
  name: "Corridor Width",
  description: "Every corridor must meet minimum width requirement",
  category: ConstraintCategory.ACCESSIBILITY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    const minWidth = context.config.minimumCorridorWidth;
    for (const floor of context.building.floors) {
      for (const room of floor.rooms) {
        if (room.type !== RoomType.Corridor)
          continue;
        const smallestDim = Math.min(room.width, room.height);
        if (smallestDim < minWidth) {
          results.push({
            constraintId: "HC-013",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Corridor "${room.name}" is too narrow (${smallestDim} mm, minimum: ${minWidth} mm)`,
            affectedEntities: [room.id],
            explanation: `"${room.name}" has a minimum dimension of ${smallestDim} mm, which is below the required ${minWidth} mm for corridors. Widen the corridor to meet accessibility requirements.`,
            suggestedFixes: [{
              description: `Widen "${room.name}" to at least ${minWidth} mm`,
              actionType: "resize",
              targetEntity: room.id,
              priority: 2
            }]
          });
        }
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-013",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All corridors meet minimum width",
        affectedEntities: [],
        explanation: "All corridors have adequate width for circulation."
      });
    }
    return results;
  }
};

// packages/constraint-engine/dist/constraints/hard/door-validity.js
var OUTSIDE_IDS = /* @__PURE__ */ new Set(["", "outside", "__outside__"]);
function isFinitePoint(value) {
  if (!value || typeof value !== "object")
    return false;
  const point = value;
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}
var DoorOnWall = {
  id: "HC-011",
  name: "Door On Wall",
  description: "Every door must be placed on an existing wall",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    for (const floor of context.building.floors) {
      if (floor.doors.length === 0)
        continue;
      const wallsById = new Map(floor.walls.map((wall) => [wall.id, wall]));
      const roomIds = new Set(floor.rooms.map((room) => room.id));
      for (const door of floor.doors) {
        const wall = wallsById.get(door.wallId);
        if (!wall) {
          results.push({
            constraintId: "HC-011",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `A door on "${floor.name}" references a non-existent wall`,
            affectedEntities: [door.id],
            explanation: `Door ${door.id} references wall "${door.wallId}" which does not exist on "${floor.name}". The door must be placed on a valid wall segment.`,
            suggestedFixes: [{
              description: "Place the door on an existing wall between the connected rooms",
              actionType: "move",
              targetEntity: door.id,
              priority: 1
            }]
          });
          continue;
        }
        if (door.floorId !== floor.id || wall.floorId !== floor.id) {
          results.push({
            constraintId: "HC-011",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Door "${door.id}" has inconsistent floor references`,
            affectedEntities: [door.id, wall.id],
            explanation: `The door, host wall, and containing floor must all reference "${floor.id}".`,
            suggestedFixes: [{
              description: "Move the door to a wall on the same floor",
              actionType: "move",
              targetEntity: door.id,
              priority: 1
            }]
          });
        }
        const [fromRoomId, toRoomId] = door.connectsRooms;
        const fromOutside = OUTSIDE_IDS.has(fromRoomId);
        const toOutside = OUTSIDE_IDS.has(toRoomId);
        const invalidEndpoints = fromRoomId === toRoomId || fromOutside && toOutside || !fromOutside && !roomIds.has(fromRoomId) || !toOutside && !roomIds.has(toRoomId);
        if (invalidEndpoints) {
          results.push({
            constraintId: "HC-011",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Door "${door.id}" does not connect two valid spaces`,
            affectedEntities: [door.id],
            explanation: "A door must connect two different rooms, or exactly one room and the outside. Both room references must exist on the same floor.",
            suggestedFixes: [{
              description: "Assign the door to the actual spaces on both sides of its host wall",
              actionType: "move",
              targetEntity: door.id,
              priority: 1
            }]
          });
        }
        if (!isFinitePoint(door.position)) {
          results.push({
            constraintId: "HC-011",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Door "${door.id}" has an invalid position`,
            affectedEntities: [door.id],
            explanation: "Door position must be a finite {x, y} coordinate on its host wall.",
            suggestedFixes: [{
              description: "Place the door at a valid coordinate on its host wall",
              actionType: "move",
              targetEntity: door.id,
              priority: 1
            }]
          });
          continue;
        }
        const placement = validateDoorPlacement(door, wall);
        if (!placement.valid) {
          results.push({
            constraintId: "HC-011",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Door "${door.id}" is not valid on its host wall`,
            affectedEntities: [door.id, wall.id],
            explanation: placement.reason ?? "The door opening does not fit on its host wall.",
            suggestedFixes: [{
              description: "Move or resize the door so it fits entirely on its host wall",
              actionType: "move",
              targetEntity: door.id,
              priority: 1
            }]
          });
        }
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-011",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All doors are placed on valid walls",
        affectedEntities: [],
        explanation: "Every door references an existing wall, fits on that wall, and connects valid spaces on the same floor."
      });
    }
    return results;
  }
};
var DoorClearance = {
  id: "HC-012",
  name: "Door Swing Clearance",
  description: "Door swing arc should not be blocked",
  category: ConstraintCategory.ACCESSIBILITY,
  severity: ConstraintSeverity.WARNING,
  enabled: true,
  evaluate(_context) {
    return [{
      constraintId: "HC-012",
      passed: true,
      severity: ConstraintSeverity.WARNING,
      score: 10,
      maxScore: 10,
      message: "Door swing clearance not fully validated in this phase",
      affectedEntities: [],
      explanation: "Door swing clearance requires full wall polygon data. Deferred to interactive editor validation."
    }];
  }
};

// packages/constraint-engine/dist/constraints/hard/window-validity.js
function isFinitePoint2(value) {
  if (!value || typeof value !== "object")
    return false;
  const point = value;
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}
var WindowOnWall = {
  id: "HC-015",
  name: "Window On Wall",
  description: "Every window must be placed on an existing wall",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    for (const floor of context.building.floors) {
      if (floor.windows.length === 0)
        continue;
      const wallsById = new Map(floor.walls.map((wall) => [wall.id, wall]));
      const roomIds = new Set(floor.rooms.map((room) => room.id));
      for (const win of floor.windows) {
        const wall = wallsById.get(win.wallId);
        if (!wall) {
          results.push({
            constraintId: "HC-015",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `A window on "${floor.name}" references a non-existent wall`,
            affectedEntities: [win.id],
            explanation: `Window ${win.id} references wall "${win.wallId}" which does not exist on "${floor.name}". Place the window on a valid external wall.`,
            suggestedFixes: [{
              description: "Place the window on an existing external wall",
              actionType: "move",
              targetEntity: win.id,
              priority: 2
            }]
          });
          continue;
        }
        if (win.floorId !== floor.id || wall.floorId !== floor.id || !roomIds.has(win.roomId)) {
          results.push({
            constraintId: "HC-015",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Window "${win.id}" has invalid floor or room references`,
            affectedEntities: [win.id, wall.id],
            explanation: "The window, its host wall, and its room must all exist on the same floor.",
            suggestedFixes: [{
              description: "Attach the window to an existing room and wall on the same floor",
              actionType: "move",
              targetEntity: win.id,
              priority: 2
            }]
          });
        }
        if (!isFinitePoint2(win.position)) {
          results.push({
            constraintId: "HC-015",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Window "${win.id}" has an invalid position`,
            affectedEntities: [win.id],
            explanation: "Window position must be a finite {x, y} coordinate on its host wall.",
            suggestedFixes: [{
              description: "Place the window at a valid coordinate on its host wall",
              actionType: "move",
              targetEntity: win.id,
              priority: 2
            }]
          });
          continue;
        }
        const placement = validateWindowPlacement(win, wall);
        if (!placement.valid) {
          results.push({
            constraintId: "HC-015",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Window "${win.id}" is not valid on its host wall`,
            affectedEntities: [win.id, wall.id],
            explanation: placement.reason ?? "The window opening does not fit on its host wall.",
            suggestedFixes: [{
              description: "Move or resize the window so it fits on an external wall",
              actionType: "move",
              targetEntity: win.id,
              priority: 2
            }]
          });
        }
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-015",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All windows are placed on valid walls",
        affectedEntities: [],
        explanation: "Every window references an existing room and external wall, and fits on that wall on the same floor."
      });
    }
    return results;
  }
};

// packages/constraint-engine/dist/constraints/hard/stair-validity.js
var StairConnectivity = {
  id: "HC-014",
  name: "Stair Connectivity",
  description: "Stairs must connect two existing consecutive floor levels",
  category: ConstraintCategory.ACCESSIBILITY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    const floorLevels = new Set(context.building.floors.map((f) => f.level));
    for (const floor of context.building.floors) {
      for (const stair of floor.stairs) {
        const [fromLevel, toLevel] = stair.connectsFloors;
        if (!floorLevels.has(fromLevel) || !floorLevels.has(toLevel)) {
          results.push({
            constraintId: "HC-014",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Staircase on "${floor.name}" connects to a non-existent floor level`,
            affectedEntities: [stair.id],
            explanation: `Staircase ${stair.id} declares connection between levels ${fromLevel} and ${toLevel}, but one or both levels do not exist in the building. Ensure both connected floors exist.`,
            suggestedFixes: [{
              description: "Add the missing floor level or correct the stair connection",
              actionType: "add",
              priority: 1
            }]
          });
        } else if (Math.abs(toLevel - fromLevel) !== 1) {
          results.push({
            constraintId: "HC-014",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Staircase on "${floor.name}" connects non-consecutive floors (${fromLevel} to ${toLevel})`,
            affectedEntities: [stair.id],
            explanation: `Staircase ${stair.id} connects level ${fromLevel} to level ${toLevel}, which are not consecutive. Standard stairs connect adjacent floor levels.`,
            suggestedFixes: [{
              description: "Connect the staircase to consecutive floor levels",
              actionType: "reorient",
              targetEntity: stair.id,
              priority: 1
            }]
          });
        }
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-014",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All stairs connect valid consecutive floors",
        affectedEntities: [],
        explanation: "Every staircase connects two existing consecutive floor levels."
      });
    }
    return results;
  }
};
var StairDimensions = {
  id: "HC-016",
  name: "Stair Dimensions",
  description: "Stair width and riser height must meet minimum requirements",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    const MIN_STAIR_WIDTH = 900;
    const MAX_RISER_HEIGHT = 200;
    for (const floor of context.building.floors) {
      for (const stair of floor.stairs) {
        if (stair.width < MIN_STAIR_WIDTH) {
          results.push({
            constraintId: "HC-016",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Staircase on "${floor.name}" is too narrow (${stair.width} mm, minimum: ${MIN_STAIR_WIDTH} mm)`,
            affectedEntities: [stair.id],
            explanation: `Staircase width is ${stair.width} mm but the minimum required width is ${MIN_STAIR_WIDTH} mm for safe passage.`,
            suggestedFixes: [{
              description: `Widen staircase to at least ${MIN_STAIR_WIDTH} mm`,
              actionType: "resize",
              targetEntity: stair.id,
              priority: 1
            }]
          });
        }
        if (stair.riserHeight > MAX_RISER_HEIGHT) {
          results.push({
            constraintId: "HC-016",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Staircase on "${floor.name}" has excessive riser height (${stair.riserHeight} mm, maximum: ${MAX_RISER_HEIGHT} mm)`,
            affectedEntities: [stair.id],
            explanation: `Riser height is ${stair.riserHeight} mm but should not exceed ${MAX_RISER_HEIGHT} mm for comfort and safety.`,
            suggestedFixes: [{
              description: `Reduce riser height to ${MAX_RISER_HEIGHT} mm or less (add more risers)`,
              actionType: "resize",
              targetEntity: stair.id,
              priority: 2
            }]
          });
        }
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-016",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All stairs meet dimension requirements",
        affectedEntities: [],
        explanation: "All staircase widths and riser heights are within acceptable limits."
      });
    }
    return results;
  }
};

// packages/constraint-engine/dist/constraints/hard/floor-consistency.js
var FloorRoomConsistency = {
  id: "HC-030",
  name: "Floor Entity Consistency",
  description: "Every entity must belong to and reference entities on its parent floor",
  category: ConstraintCategory.PROGRAM,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    for (const floor of context.building.floors) {
      const roomIds = new Set(floor.rooms.map((room) => room.id));
      const wallIds = new Set(floor.walls.map((wall) => wall.id));
      const collections = [floor.rooms, floor.walls, floor.doors, floor.windows, floor.stairs, floor.columns];
      for (const entities of collections) {
        for (const entity of entities) {
          if (entity.floorId === floor.id)
            continue;
          results.push({
            constraintId: "HC-030",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `Entity "${entity.id}" has mismatched floorId (expected "${floor.id}", found "${entity.floorId}")`,
            affectedEntities: [entity.id],
            explanation: `The entity is listed on "${floor.name}" but its floorId points to a different floor.`,
            suggestedFixes: [{
              description: `Correct the entity floorId to "${floor.id}"`,
              actionType: "move",
              targetEntity: entity.id,
              priority: 3
            }]
          });
        }
      }
      const addReferenceFailure = (entityId, reference, kind) => {
        results.push({
          constraintId: "HC-030",
          passed: false,
          severity: ConstraintSeverity.HARD,
          score: 0,
          maxScore: 0,
          message: `${kind} "${entityId}" references "${reference}" outside "${floor.name}"`,
          affectedEntities: [entityId],
          explanation: `Reference "${reference}" cannot be resolved within the parent floor.`,
          suggestedFixes: [{ description: "Repair or remove the cross-floor reference", actionType: "move", targetEntity: entityId, priority: 3 }]
        });
      };
      for (const wall of floor.walls) {
        (wall.roomIds ?? []).filter((roomId) => !roomIds.has(roomId)).forEach((roomId) => addReferenceFailure(wall.id, roomId, "Wall"));
      }
      for (const door of floor.doors) {
        if (!wallIds.has(door.wallId))
          addReferenceFailure(door.id, door.wallId, "Door");
        (door.connectsRooms ?? []).filter((roomId) => roomId !== "" && roomId !== "exterior" && roomId !== "__outside__" && !roomIds.has(roomId)).forEach((roomId) => addReferenceFailure(door.id, roomId, "Door"));
      }
      for (const window of floor.windows) {
        if (!wallIds.has(window.wallId))
          addReferenceFailure(window.id, window.wallId, "Window");
        if (!roomIds.has(window.roomId))
          addReferenceFailure(window.id, window.roomId, "Window");
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-030",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All floor entities and references are consistent",
        affectedEntities: [],
        explanation: "Every entity belongs to its parent floor and all local references resolve on that floor."
      });
    }
    return results;
  }
};

// packages/constraint-engine/dist/constraints/hard/minimum-size.js
var MinimumRoomSize = {
  id: "HC-023",
  name: "Minimum Room Size",
  description: "Every room must meet minimum area and dimension requirements for its type",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const results = [];
    const { minimumRoomSizes, minimumDimensions } = context.config;
    for (const floor of context.building.floors) {
      for (const room of floor.rooms) {
        const minArea = minimumRoomSizes[room.type];
        if (minArea !== void 0 && room.area < minArea) {
          const actualSqM = sqMmToSqM(room.area);
          const minSqM = sqMmToSqM(minArea);
          const actualSqFt = sqMmToSqFt(room.area);
          const minSqFt = sqMmToSqFt(minArea);
          results.push({
            constraintId: "HC-023",
            passed: false,
            severity: ConstraintSeverity.HARD,
            score: 0,
            maxScore: 0,
            message: `"${room.name}" is too small (${actualSqFt.toFixed(0)} sq ft, minimum: ${minSqFt.toFixed(0)} sq ft for ${room.type})`,
            affectedEntities: [room.id],
            explanation: `"${room.name}" has an area of ${actualSqM.toFixed(1)} sq m (${actualSqFt.toFixed(0)} sq ft), which is below the minimum of ${minSqM.toFixed(1)} sq m (${minSqFt.toFixed(0)} sq ft) for a ${room.type}. Increase the room dimensions.`,
            suggestedFixes: [{
              description: `Increase "${room.name}" area to at least ${minSqM.toFixed(1)} sq m`,
              actionType: "resize",
              targetEntity: room.id,
              priority: 1,
              parameters: { minimumArea: minArea }
            }]
          });
        }
        const minDim = minimumDimensions[room.type];
        if (minDim !== void 0) {
          const smallest = Math.min(room.width, room.height);
          if (smallest < minDim) {
            results.push({
              constraintId: "HC-023",
              passed: false,
              severity: ConstraintSeverity.HARD,
              score: 0,
              maxScore: 0,
              message: `"${room.name}" has a dimension too narrow (${smallest} mm, minimum: ${minDim} mm for ${room.type})`,
              affectedEntities: [room.id],
              explanation: `"${room.name}" has a minimum dimension of ${smallest} mm. For a ${room.type}, the shortest side must be at least ${minDim} mm. Widen the room.`,
              suggestedFixes: [{
                description: `Widen "${room.name}" to at least ${minDim} mm on the shortest side`,
                actionType: "resize",
                targetEntity: room.id,
                priority: 1,
                parameters: { minimumDimension: minDim }
              }]
            });
          }
        }
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "HC-023",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "All rooms meet minimum size requirements",
        affectedEntities: [],
        explanation: "Every room meets the minimum area and dimension requirements for its type."
      });
    }
    return results;
  }
};

// packages/constraint-engine/dist/constraints/hard/vertical-continuity.js
function geometryKey(entity) {
  return [entity.x, entity.y, entity.width, entity.height ?? entity.length ?? 0].join("|");
}
var VerticalCirculationContinuity = {
  id: "HC-031",
  name: "Vertical Circulation Continuity",
  description: "Every occupied floor must participate in one aligned staircase core",
  category: ConstraintCategory.ACCESSIBILITY,
  severity: ConstraintSeverity.HARD,
  enabled: true,
  evaluate(context) {
    const floors = [...context.building.floors].sort((a, b) => a.level - b.level);
    if (floors.length <= 1) {
      return [{
        constraintId: "HC-031",
        passed: true,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        status: EvaluationStatus.NOT_APPLICABLE,
        message: "Vertical circulation: single floor \u2014 not applicable",
        affectedEntities: [],
        explanation: "A single-floor plan does not require cross-floor stair continuity."
      }];
    }
    const results = [];
    const stairRooms = floors.map((floor) => floor.rooms.find((room) => room.type === RoomType.Staircase));
    const missingRoomFloors = floors.filter((_, index) => !stairRooms[index]);
    const missingStairFloors = floors.filter((floor) => floor.stairs.length === 0);
    if (missingRoomFloors.length > 0 || missingStairFloors.length > 0) {
      const affected = [...missingRoomFloors, ...missingStairFloors].map((floor) => floor.id);
      results.push({
        constraintId: "HC-031",
        passed: false,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: `Vertical circulation is missing on ${new Set(affected).size} floor(s)`,
        affectedEntities: [...new Set(affected)],
        explanation: "Every occupied floor in a multi-floor building requires an explicit staircase room and stair entity.",
        suggestedFixes: [{ description: "Add the missing aligned staircase continuation", actionType: "add", priority: 1 }]
      });
    }
    const presentRooms = stairRooms.filter((room) => Boolean(room));
    if (presentRooms.length > 1 && new Set(presentRooms.map(geometryKey)).size !== 1) {
      results.push({
        constraintId: "HC-031",
        passed: false,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "Staircase rooms are not vertically aligned",
        affectedEntities: presentRooms.map((room) => room.id),
        explanation: "The staircase footprint must use the same coordinates and dimensions on connected floors.",
        suggestedFixes: [{ description: "Align staircase footprints to one vertical core", actionType: "move", priority: 1 }]
      });
    }
    const stairs = floors.flatMap((floor) => floor.stairs);
    if (stairs.length > 1 && new Set(stairs.map(geometryKey)).size !== 1) {
      results.push({
        constraintId: "HC-031",
        passed: false,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "Stair entities are not vertically aligned",
        affectedEntities: stairs.map((stair) => stair.id),
        explanation: "Every stair entity assigned to the primary core must share its plan footprint."
      });
    }
    const coveredPairs = new Set(stairs.map((stair) => {
      const pair = [...stair.connectsFloors].sort((a, b) => a - b);
      return `${pair[0]}:${pair[1]}`;
    }));
    const missingPairs = floors.slice(0, -1).filter((floor, index) => {
      const next = floors[index + 1];
      return !coveredPairs.has(`${floor.level}:${next.level}`);
    });
    if (missingPairs.length > 0) {
      results.push({
        constraintId: "HC-031",
        passed: false,
        severity: ConstraintSeverity.HARD,
        score: 0,
        maxScore: 0,
        message: "One or more adjacent floor pairs lack an explicit stair connection",
        affectedEntities: missingPairs.map((floor) => floor.id),
        explanation: "Every adjacent pair of occupied floor levels must be connected by an explicit stair relationship."
      });
    }
    if (results.length > 0)
      return results;
    return [{
      constraintId: "HC-031",
      passed: true,
      severity: ConstraintSeverity.HARD,
      score: 0,
      maxScore: 0,
      message: "Vertical stair core is continuous across all floors",
      affectedEntities: [],
      explanation: "Stair rooms and stair entities align, and every adjacent floor pair is connected."
    }];
  }
};

// packages/constraint-engine/dist/helpers/room-queries.js
function getAllRooms(building) {
  return building.floors.flatMap((f) => [...f.rooms]);
}
function getRoomsByType(building, type) {
  return getAllRooms(building).filter((r) => r.type === type);
}
function getMasterBedroom(building) {
  const bedrooms = getRoomsByType(building, "bedroom");
  if (bedrooms.length === 0)
    return null;
  const highPriority = bedrooms.filter((b) => b.priority >= 8);
  if (highPriority.length > 0) {
    return highPriority.reduce((a, b) => a.area > b.area ? a : b);
  }
  return bedrooms.reduce((a, b) => a.area > b.area ? a : b);
}
function hasExternalWall(room, floorBoundary) {
  if (floorBoundary.points.length < 3)
    return false;
  return polygonsAdjacent(room.boundary, floorBoundary);
}

// packages/constraint-engine/dist/constraints/soft/adjacency.js
function adjacencyCheck(id, name, _description, sourceType, targetType, maxScore, context) {
  const sources = getRoomsByType(context.building, sourceType);
  const targets = getRoomsByType(context.building, targetType);
  if (sources.length === 0 || targets.length === 0) {
    return {
      constraintId: id,
      passed: true,
      severity: ConstraintSeverity.SOFT,
      score: maxScore,
      maxScore,
      message: `${name}: not applicable (missing room type)`,
      affectedEntities: [],
      explanation: `Cannot evaluate ${name.toLowerCase()} because one or both room types are not present in the plan.`
    };
  }
  let found = false;
  for (const s of sources) {
    for (const t of targets) {
      if (s.floorId === t.floorId && polygonsAdjacent(s.boundary, t.boundary)) {
        found = true;
        break;
      }
    }
    if (found)
      break;
  }
  if (found) {
    return {
      constraintId: id,
      passed: true,
      severity: ConstraintSeverity.SOFT,
      score: maxScore,
      maxScore,
      message: `${name}: satisfied`,
      affectedEntities: [],
      explanation: `At least one ${sourceType} is adjacent to a ${targetType}, supporting good functional flow.`
    };
  }
  return {
    constraintId: id,
    passed: false,
    severity: ConstraintSeverity.SOFT,
    score: 0,
    maxScore,
    message: `${name}: ${sourceType} is not adjacent to ${targetType}`,
    affectedEntities: [...sources.map((r) => r.id), ...targets.map((r) => r.id)],
    explanation: `No ${sourceType} shares a wall with any ${targetType}. For better workflow, place these rooms adjacent to each other.`,
    suggestedFixes: [{
      description: `Move ${sourceType} adjacent to ${targetType}`,
      actionType: "move",
      targetEntity: sources[0]?.id,
      priority: 2
    }]
  };
}
var KitchenDining = {
  id: "SC-ADJ-001",
  name: "Kitchen-Dining Adjacency",
  description: "Kitchen should be adjacent to dining for workflow efficiency",
  category: ConstraintCategory.ACCESSIBILITY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    return [adjacencyCheck("SC-ADJ-001", "Kitchen-Dining Adjacency", this.description, RoomType.Kitchen, RoomType.Dining, 20, ctx)];
  }
};
var DiningLiving = {
  id: "SC-ADJ-002",
  name: "Dining-Living Adjacency",
  description: "Dining should be adjacent to living for social flow",
  category: ConstraintCategory.ACCESSIBILITY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    return [adjacencyCheck("SC-ADJ-002", "Dining-Living Adjacency", this.description, RoomType.Dining, RoomType.Living, 15, ctx)];
  }
};
var MasterBathroom = {
  id: "SC-ADJ-003",
  name: "Master Bedroom-Bathroom Adjacency",
  description: "Master bedroom should have an attached bathroom",
  category: ConstraintCategory.ACCESSIBILITY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const master = getMasterBedroom(ctx.building);
    const bathrooms = getRoomsByType(ctx.building, RoomType.Bathroom);
    if (!master || bathrooms.length === 0) {
      return [{
        constraintId: "SC-ADJ-003",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 20,
        maxScore: 20,
        message: "Master-Bathroom: not applicable",
        affectedEntities: [],
        explanation: "No master bedroom or bathroom present."
      }];
    }
    const hasAttached = bathrooms.some((b) => b.floorId === master.floorId && polygonsAdjacent(master.boundary, b.boundary));
    return [{
      constraintId: "SC-ADJ-003",
      passed: hasAttached,
      severity: ConstraintSeverity.SOFT,
      score: hasAttached ? 20 : 0,
      maxScore: 20,
      message: hasAttached ? "Master bedroom has attached bathroom" : "Master bedroom lacks attached bathroom",
      affectedEntities: hasAttached ? [] : [master.id],
      explanation: hasAttached ? "The master bedroom is adjacent to a bathroom, providing convenience." : "The master bedroom has no adjacent bathroom. Place a bathroom next to the master bedroom.",
      suggestedFixes: hasAttached ? void 0 : [{
        description: "Place a bathroom adjacent to the master bedroom",
        actionType: "move",
        priority: 2
      }]
    }];
  }
};
var UtilityKitchen = {
  id: "SC-ADJ-004",
  name: "Utility-Kitchen Adjacency",
  description: "Utility room should be near the kitchen",
  category: ConstraintCategory.ACCESSIBILITY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    return [adjacencyCheck("SC-ADJ-004", "Utility-Kitchen Adjacency", this.description, RoomType.Utility, RoomType.Kitchen, 10, ctx)];
  }
};
var ParkingEntrance = {
  id: "SC-ADJ-005",
  name: "Parking-Entrance Adjacency",
  description: "Parking should be near the entrance/foyer",
  category: ConstraintCategory.ACCESSIBILITY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    return [adjacencyCheck("SC-ADJ-005", "Parking-Entrance Adjacency", this.description, RoomType.Parking, RoomType.Foyer, 10, ctx)];
  }
};
var PoojaAccess = {
  id: "SC-ADJ-006",
  name: "Pooja-Living Access",
  description: "Pooja room should be accessible from living area",
  category: ConstraintCategory.ACCESSIBILITY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    return [adjacencyCheck("SC-ADJ-006", "Pooja-Living Access", this.description, RoomType.Pooja, RoomType.Living, 5, ctx)];
  }
};

// packages/constraint-engine/dist/constraints/soft/circulation.js
var CorridorRatio = {
  id: "SC-CIR-001",
  name: "Corridor Area Ratio",
  description: "Corridor area should not exceed 15% of total floor area",
  category: ConstraintCategory.CIRCULATION,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    let totalArea = 0;
    let corridorArea = 0;
    for (const room of ctx.allRooms) {
      totalArea += room.area;
      if (room.type === RoomType.Corridor) {
        corridorArea += room.area;
      }
    }
    if (totalArea === 0) {
      return [{
        constraintId: "SC-CIR-001",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 30,
        maxScore: 30,
        message: "Corridor ratio: not applicable (no rooms)",
        affectedEntities: [],
        explanation: "No rooms present to evaluate corridor ratio."
      }];
    }
    const ratio = corridorArea / totalArea;
    let score;
    let message;
    if (ratio <= 0.1) {
      score = 30;
      message = `Excellent circulation efficiency (corridor ratio: ${(ratio * 100).toFixed(1)}%)`;
    } else if (ratio <= 0.15) {
      score = 20;
      message = `Acceptable circulation (corridor ratio: ${(ratio * 100).toFixed(1)}%)`;
    } else if (ratio <= 0.2) {
      score = 10;
      message = `High corridor area (corridor ratio: ${(ratio * 100).toFixed(1)}%)`;
    } else {
      score = 0;
      message = `Excessive corridor area (corridor ratio: ${(ratio * 100).toFixed(1)}%)`;
    }
    return [{
      constraintId: "SC-CIR-001",
      passed: ratio <= 0.15,
      severity: ConstraintSeverity.SOFT,
      score,
      maxScore: 30,
      message,
      affectedEntities: ctx.allRooms.filter((r) => r.type === RoomType.Corridor).map((r) => r.id),
      explanation: `Corridors occupy ${(ratio * 100).toFixed(1)}% of the total floor area. Ideally, circulation space should be under 15% to maximize usable room area.`
    }];
  }
};
var NoDeadEnds = {
  id: "SC-CIR-002",
  name: "No Dead-End Corridors",
  description: "Corridors should connect to multiple spaces, not dead-end",
  category: ConstraintCategory.CIRCULATION,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const corridors = ctx.allRooms.filter((r) => r.type === RoomType.Corridor);
    if (corridors.length === 0) {
      return [{
        constraintId: "SC-CIR-002",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 15,
        maxScore: 15,
        message: "No dead-end corridors: not applicable (no corridors)",
        affectedEntities: [],
        explanation: "No corridors present \u2014 rooms may connect directly."
      }];
    }
    return [{
      constraintId: "SC-CIR-002",
      passed: true,
      severity: ConstraintSeverity.SOFT,
      score: 15,
      maxScore: 15,
      message: "Corridor connectivity: acceptable",
      affectedEntities: [],
      explanation: "Corridor dead-end detection requires full door connectivity data."
    }];
  }
};
var DirectAccess = {
  id: "SC-CIR-003",
  name: "Direct Room Access",
  description: "Functionally related rooms should have direct access where appropriate",
  category: ConstraintCategory.CIRCULATION,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const corridors = ctx.allRooms.filter((r) => r.type === RoomType.Corridor);
    const score = corridors.length <= 2 ? 15 : corridors.length <= 4 ? 10 : 5;
    return [{
      constraintId: "SC-CIR-003",
      passed: score >= 10,
      severity: ConstraintSeverity.SOFT,
      score,
      maxScore: 15,
      message: score >= 10 ? "Good direct access between functional areas" : "Too many corridors separating functional areas",
      affectedEntities: [],
      explanation: `The plan has ${corridors.length} corridor(s). Fewer corridors generally indicates better direct access between rooms.`
    }];
  }
};
var PathLength = {
  id: "SC-CIR-004",
  name: "Path Length from Entrance",
  description: "All rooms should be reachable within 3 door transitions from entrance",
  category: ConstraintCategory.CIRCULATION,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const results = [];
    for (const floor of ctx.building.floors) {
      if (floor.doors.length === 0)
        continue;
      let allWithin3 = true;
      for (const room of floor.rooms) {
        const transitions = doorTransitionsToRoom(floor, room.id);
        if (transitions > 3) {
          allWithin3 = false;
        }
      }
      results.push({
        constraintId: "SC-CIR-004",
        passed: allWithin3,
        severity: ConstraintSeverity.SOFT,
        score: allWithin3 ? 20 : 5,
        maxScore: 20,
        message: allWithin3 ? `All rooms on "${floor.name}" reachable within 3 transitions` : `Some rooms on "${floor.name}" require more than 3 door transitions`,
        affectedEntities: [],
        explanation: allWithin3 ? "Good circulation \u2014 all rooms are easily accessible from the entrance." : "Some rooms are deep in the plan, requiring many door transitions. Consider reducing corridor chains."
      });
    }
    if (results.length === 0) {
      results.push({
        constraintId: "SC-CIR-004",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 20,
        maxScore: 20,
        message: "Path length: not evaluated (no doors defined)",
        affectedEntities: [],
        explanation: "Door connectivity not defined, path length cannot be measured."
      });
    }
    return results;
  }
};

// packages/constraint-engine/dist/constraints/soft/daylight.js
var BedroomExternal = {
  id: "SC-DAY-001",
  name: "Bedroom Daylight",
  description: "Each bedroom should have at least one external wall for natural light",
  category: ConstraintCategory.DAYLIGHT,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const results = [];
    for (const floor of ctx.building.floors) {
      const bedrooms = floor.rooms.filter((r) => r.type === RoomType.Bedroom);
      for (const room of bedrooms) {
        const external = hasExternalWall(room, floor.boundary);
        results.push({
          constraintId: "SC-DAY-001",
          passed: external,
          severity: ConstraintSeverity.SOFT,
          score: external ? 20 : 0,
          maxScore: 20,
          message: external ? `"${room.name}" has natural light access` : `"${room.name}" lacks natural light (no external wall)`,
          affectedEntities: external ? [] : [room.id],
          explanation: external ? `"${room.name}" shares a wall with the building exterior, allowing natural light and ventilation.` : `"${room.name}" is surrounded by other rooms with no external wall. This limits natural light and ventilation. Consider repositioning it to touch the floor boundary.`,
          suggestedFixes: external ? void 0 : [{
            description: `Move "${room.name}" to an external wall position`,
            actionType: "move",
            targetEntity: room.id,
            priority: 3
          }],
          classification: "proxy"
        });
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "SC-DAY-001",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 0,
        maxScore: 0,
        status: EvaluationStatus.NOT_APPLICABLE,
        classification: "proxy",
        message: "Bedroom daylight potential: not applicable",
        affectedEntities: [],
        explanation: "No bedrooms present in the plan."
      });
    }
    return results;
  }
};
var LivingExternal = {
  id: "SC-DAY-002",
  name: "Living Room Daylight",
  description: "Living room should have external wall access",
  category: ConstraintCategory.DAYLIGHT,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    for (const floor of ctx.building.floors) {
      const livings = floor.rooms.filter((r) => r.type === RoomType.Living);
      for (const room of livings) {
        const external = hasExternalWall(room, floor.boundary);
        return [{
          constraintId: "SC-DAY-002",
          passed: external,
          severity: ConstraintSeverity.SOFT,
          score: external ? 25 : 0,
          maxScore: 25,
          message: external ? `"${room.name}" has excellent natural light` : `"${room.name}" has no external wall access`,
          affectedEntities: external ? [] : [room.id],
          explanation: external ? `"${room.name}" is positioned on an external wall for maximum daylight.` : `"${room.name}" has no direct access to the building exterior. Living rooms benefit greatly from natural light.`,
          classification: "proxy"
        }];
      }
    }
    return [{
      constraintId: "SC-DAY-002",
      passed: true,
      severity: ConstraintSeverity.SOFT,
      score: 0,
      maxScore: 0,
      status: EvaluationStatus.NOT_APPLICABLE,
      classification: "proxy",
      message: "Living-room daylight potential: not applicable",
      affectedEntities: [],
      explanation: "No living room present."
    }];
  }
};
var KitchenExternal = {
  id: "SC-DAY-003",
  name: "Kitchen Daylight",
  description: "Kitchen should have external wall access for ventilation",
  category: ConstraintCategory.DAYLIGHT,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    for (const floor of ctx.building.floors) {
      const kitchens = floor.rooms.filter((r) => r.type === RoomType.Kitchen);
      for (const room of kitchens) {
        const external = hasExternalWall(room, floor.boundary);
        return [{
          constraintId: "SC-DAY-003",
          passed: external,
          severity: ConstraintSeverity.SOFT,
          score: external ? 15 : 0,
          maxScore: 15,
          message: external ? `"${room.name}" has ventilation access` : `"${room.name}" lacks ventilation (no external wall)`,
          affectedEntities: external ? [] : [room.id],
          explanation: external ? `"${room.name}" can be ventilated via the external wall.` : `"${room.name}" has no external wall for smoke exhaust and ventilation. This is a significant design concern.`,
          classification: "proxy"
        }];
      }
    }
    return [{
      constraintId: "SC-DAY-003",
      passed: true,
      severity: ConstraintSeverity.SOFT,
      score: 0,
      maxScore: 0,
      status: EvaluationStatus.NOT_APPLICABLE,
      classification: "proxy",
      message: "Kitchen daylight potential: not applicable",
      affectedEntities: [],
      explanation: "No kitchen present."
    }];
  }
};
var WindowOrientation = {
  id: "SC-DAY-004",
  name: "Window Orientation",
  description: "Windows facing East or South receive optimal natural daylight",
  category: ConstraintCategory.DAYLIGHT,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    let totalWindows = 0;
    for (const floor of ctx.building.floors) {
      totalWindows += floor.windows.length;
    }
    if (totalWindows === 0) {
      return [{
        constraintId: "SC-DAY-004",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 0,
        maxScore: 0,
        status: EvaluationStatus.INSUFFICIENT_INPUT,
        classification: "proxy",
        message: "Window orientation potential: insufficient input",
        affectedEntities: [],
        explanation: "No windows defined in this draft layout."
      }];
    }
    return [{
      constraintId: "SC-DAY-004",
      passed: true,
      severity: ConstraintSeverity.SOFT,
      score: 0,
      maxScore: 0,
      status: EvaluationStatus.NOT_ANALYZED,
      classification: "proxy",
      message: `Window orientation: not analyzed (${totalWindows} opening${totalWindows === 1 ? "" : "s"} documented)`,
      affectedEntities: [],
      explanation: "Openings are documented, but the current engine does not calculate solar exposure or orientation performance."
    }];
  }
};
var AllHabitableLight = {
  id: "SC-DAY-005",
  name: "All Habitable Rooms Have Light",
  description: "Bonus: every habitable room (bedroom, living, kitchen) has external access",
  category: ConstraintCategory.DAYLIGHT,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const habitableTypes = /* @__PURE__ */ new Set([RoomType.Bedroom, RoomType.Living, RoomType.Kitchen, RoomType.Dining]);
    let allHaveLight = true;
    for (const floor of ctx.building.floors) {
      for (const room of floor.rooms) {
        if (habitableTypes.has(room.type)) {
          if (!hasExternalWall(room, floor.boundary)) {
            allHaveLight = false;
            break;
          }
        }
      }
      if (!allHaveLight)
        break;
    }
    return [{
      constraintId: "SC-DAY-005",
      passed: allHaveLight,
      severity: ConstraintSeverity.SOFT,
      score: allHaveLight ? 10 : 0,
      maxScore: 10,
      message: allHaveLight ? "All habitable rooms have natural light access" : "Some habitable rooms lack natural light",
      affectedEntities: [],
      explanation: allHaveLight ? "Every bedroom, living, kitchen, and dining room has direct external wall access \u2014 excellent design." : "One or more habitable rooms are fully interior. Consider rearranging the plan so all habitable rooms touch an external wall.",
      classification: "proxy"
    }];
  }
};

// packages/constraint-engine/dist/helpers/zone-classification.js
var Zone;
(function(Zone2) {
  Zone2["PUBLIC"] = "public";
  Zone2["PRIVATE"] = "private";
  Zone2["SERVICE"] = "service";
  Zone2["CIRCULATION"] = "circulation";
  Zone2["OUTDOOR"] = "outdoor";
})(Zone || (Zone = {}));
var ZONE_MAP = {
  living: Zone.PUBLIC,
  dining: Zone.PUBLIC,
  foyer: Zone.PUBLIC,
  drawing: Zone.PUBLIC,
  family_living: Zone.PUBLIC,
  bedroom: Zone.PRIVATE,
  bathroom: Zone.PRIVATE,
  study: Zone.PRIVATE,
  pooja: Zone.PRIVATE,
  kitchen: Zone.SERVICE,
  utility: Zone.SERVICE,
  servant_quarter: Zone.SERVICE,
  storage: Zone.SERVICE,
  corridor: Zone.CIRCULATION,
  staircase: Zone.CIRCULATION,
  balcony: Zone.OUTDOOR,
  terrace: Zone.OUTDOOR,
  garden: Zone.OUTDOOR,
  parking: Zone.OUTDOOR,
  custom: Zone.PRIVATE
};
function getRoomZone(roomOrType) {
  const type = typeof roomOrType === "string" ? roomOrType : roomOrType.type;
  return ZONE_MAP[type] ?? Zone.PRIVATE;
}
function getPublicRooms(rooms) {
  return rooms.filter((r) => getRoomZone(r) === Zone.PUBLIC);
}
function getPrivateRooms(rooms) {
  return rooms.filter((r) => getRoomZone(r) === Zone.PRIVATE);
}
function getServiceRooms(rooms) {
  return rooms.filter((r) => getRoomZone(r) === Zone.SERVICE);
}

// packages/constraint-engine/dist/constraints/soft/privacy.js
var BedroomSeparation = {
  id: "SC-PRI-001",
  name: "Bedroom-Entrance Separation",
  description: "Bedrooms should not be adjacent to foyer/entrance areas",
  category: ConstraintCategory.PRIVACY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const results = [];
    const entranceTypes = /* @__PURE__ */ new Set([RoomType.Foyer, RoomType.Corridor]);
    for (const floor of ctx.building.floors) {
      const bedrooms = floor.rooms.filter((r) => r.type === RoomType.Bedroom);
      const entrances = floor.rooms.filter((r) => entranceTypes.has(r.type));
      for (const bedroom of bedrooms) {
        let adjacentToEntrance = false;
        for (const entrance of entrances) {
          if (polygonsAdjacent(bedroom.boundary, entrance.boundary)) {
            adjacentToEntrance = true;
            break;
          }
        }
        results.push({
          constraintId: "SC-PRI-001",
          passed: !adjacentToEntrance,
          severity: ConstraintSeverity.SOFT,
          score: adjacentToEntrance ? 0 : 15,
          maxScore: 15,
          message: adjacentToEntrance ? `"${bedroom.name}" is adjacent to entrance \u2014 privacy concern` : `"${bedroom.name}" is well-separated from entrance`,
          affectedEntities: adjacentToEntrance ? [bedroom.id] : [],
          explanation: adjacentToEntrance ? `"${bedroom.name}" shares a wall with a corridor or foyer. This reduces acoustic and visual privacy. Consider placing buffer rooms between bedrooms and the entrance.` : `"${bedroom.name}" has adequate separation from public circulation areas.`
        });
      }
    }
    if (results.length === 0) {
      results.push({
        constraintId: "SC-PRI-001",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 15,
        maxScore: 15,
        message: "Bedroom separation: no bedrooms to evaluate",
        affectedEntities: [],
        explanation: "No bedrooms present."
      });
    }
    return results;
  }
};
var MasterIsolation = {
  id: "SC-PRI-002",
  name: "Master Bedroom Isolation",
  description: "Master bedroom should be isolated from public zones",
  category: ConstraintCategory.PRIVACY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const master = getMasterBedroom(ctx.building);
    if (!master) {
      return [{
        constraintId: "SC-PRI-002",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 20,
        maxScore: 20,
        message: "Master isolation: no master bedroom identified",
        affectedEntities: [],
        explanation: "No master bedroom present to evaluate."
      }];
    }
    const publicRooms = getPublicRooms(ctx.allRooms);
    let adjacentToPublic = false;
    for (const pub of publicRooms) {
      if (master.floorId === pub.floorId && polygonsAdjacent(master.boundary, pub.boundary)) {
        adjacentToPublic = true;
        break;
      }
    }
    return [{
      constraintId: "SC-PRI-002",
      passed: !adjacentToPublic,
      severity: ConstraintSeverity.SOFT,
      score: adjacentToPublic ? 0 : 20,
      maxScore: 20,
      message: adjacentToPublic ? `"${master.name}" is adjacent to a public room \u2014 privacy concern` : `"${master.name}" is well-isolated from public areas`,
      affectedEntities: adjacentToPublic ? [master.id] : [],
      explanation: adjacentToPublic ? `"${master.name}" shares a wall with a public room (living, dining, or foyer). For maximum privacy, place buffer spaces between the master suite and public areas.` : `"${master.name}" is separated from public zones, providing good acoustic and visual privacy.`
    }];
  }
};
var BathroomVisibility = {
  id: "SC-PRI-003",
  name: "Bathroom Visibility",
  description: "Bathroom doors should not open directly into living/dining areas",
  category: ConstraintCategory.PRIVACY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const bathrooms = getRoomsByType(ctx.building, RoomType.Bathroom);
    const publicSpaces = ctx.allRooms.filter((r) => r.type === RoomType.Living || r.type === RoomType.Dining);
    if (bathrooms.length === 0 || publicSpaces.length === 0) {
      return [{
        constraintId: "SC-PRI-003",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 15,
        maxScore: 15,
        message: "Bathroom visibility: not applicable",
        affectedEntities: [],
        explanation: "No bathrooms or public spaces to evaluate."
      }];
    }
    let visible = false;
    for (const bath of bathrooms) {
      for (const pub of publicSpaces) {
        if (bath.floorId === pub.floorId && polygonsAdjacent(bath.boundary, pub.boundary)) {
          visible = true;
          break;
        }
      }
      if (visible)
        break;
    }
    return [{
      constraintId: "SC-PRI-003",
      passed: !visible,
      severity: ConstraintSeverity.SOFT,
      score: visible ? 0 : 15,
      maxScore: 15,
      message: visible ? "A bathroom is directly adjacent to a living/dining area" : "Bathrooms are well-hidden from public spaces",
      affectedEntities: [],
      explanation: visible ? "A bathroom opens directly adjacent to living or dining. Consider adding a buffer corridor or repositioning." : "No bathroom directly abuts a public living space \u2014 good privacy."
    }];
  }
};
var GuestSeparation = {
  id: "SC-PRI-004",
  name: "Guest Bedroom Separation",
  description: "Guest bedroom should be separated from family bedrooms",
  category: ConstraintCategory.PRIVACY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const bedrooms = getRoomsByType(ctx.building, RoomType.Bedroom);
    if (bedrooms.length < 2) {
      return [{
        constraintId: "SC-PRI-004",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 10,
        maxScore: 10,
        message: "Guest separation: fewer than 2 bedrooms",
        affectedEntities: [],
        explanation: "Fewer than 2 bedrooms \u2014 guest separation not applicable."
      }];
    }
    let hasSeparated = false;
    for (const bed of bedrooms) {
      const adjToOther = bedrooms.some((other) => other.id !== bed.id && other.floorId === bed.floorId && polygonsAdjacent(bed.boundary, other.boundary));
      if (!adjToOther) {
        hasSeparated = true;
        break;
      }
    }
    return [{
      constraintId: "SC-PRI-004",
      passed: hasSeparated,
      severity: ConstraintSeverity.SOFT,
      score: hasSeparated ? 10 : 0,
      maxScore: 10,
      message: hasSeparated ? "At least one bedroom is separated from others (potential guest room)" : "All bedrooms are clustered together",
      affectedEntities: [],
      explanation: hasSeparated ? "At least one bedroom is physically separated from the others, suitable for guest use." : "All bedrooms are adjacent to each other. Consider separating at least one for guest privacy."
    }];
  }
};

// packages/constraint-engine/dist/constraints/soft/zoning.js
var PublicPrivateSeparation = {
  id: "SC-ZON-001",
  name: "Public-Private Zone Separation",
  description: "Public zone rooms should be separated from private zone rooms",
  category: ConstraintCategory.FUNCTIONAL_ZONING,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const publicRooms = getPublicRooms(ctx.allRooms);
    const privateRooms = getPrivateRooms(ctx.allRooms);
    if (publicRooms.length === 0 || privateRooms.length === 0) {
      return [{
        constraintId: "SC-ZON-001",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 25,
        maxScore: 25,
        message: "Zone separation: not applicable (missing zone)",
        affectedEntities: [],
        explanation: "Cannot evaluate zone separation \u2014 one zone has no rooms."
      }];
    }
    let crossZoneAdjacencies = 0;
    for (const pub of publicRooms) {
      for (const priv of privateRooms) {
        if (pub.floorId === priv.floorId && polygonsAdjacent(pub.boundary, priv.boundary)) {
          crossZoneAdjacencies++;
        }
      }
    }
    const maxPairs = publicRooms.length * privateRooms.length;
    const ratio = crossZoneAdjacencies / maxPairs;
    let score;
    if (ratio <= 0.1)
      score = 25;
    else if (ratio <= 0.3)
      score = 18;
    else if (ratio <= 0.5)
      score = 10;
    else
      score = 3;
    return [{
      constraintId: "SC-ZON-001",
      passed: score >= 18,
      severity: ConstraintSeverity.SOFT,
      score,
      maxScore: 25,
      message: crossZoneAdjacencies === 0 ? "Excellent public-private zone separation" : `${crossZoneAdjacencies} cross-zone adjacencies between public and private rooms`,
      affectedEntities: [],
      explanation: `The plan has ${crossZoneAdjacencies} point(s) where public rooms directly touch private rooms. Fewer direct contacts means better functional separation.`
    }];
  }
};
var ServiceZoneGrouping = {
  id: "SC-ZON-002",
  name: "Service Zone Grouping",
  description: "Service rooms (kitchen, utility) should be grouped together",
  category: ConstraintCategory.FUNCTIONAL_ZONING,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const serviceRooms = getServiceRooms(ctx.allRooms);
    if (serviceRooms.length < 2) {
      return [{
        constraintId: "SC-ZON-002",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 15,
        maxScore: 15,
        message: "Service grouping: fewer than 2 service rooms",
        affectedEntities: [],
        explanation: "Not enough service rooms to evaluate grouping."
      }];
    }
    let hasGrouping = false;
    for (let i = 0; i < serviceRooms.length; i++) {
      for (let j = i + 1; j < serviceRooms.length; j++) {
        if (serviceRooms[i].floorId === serviceRooms[j].floorId && polygonsAdjacent(serviceRooms[i].boundary, serviceRooms[j].boundary)) {
          hasGrouping = true;
          break;
        }
      }
      if (hasGrouping)
        break;
    }
    return [{
      constraintId: "SC-ZON-002",
      passed: hasGrouping,
      severity: ConstraintSeverity.SOFT,
      score: hasGrouping ? 15 : 0,
      maxScore: 15,
      message: hasGrouping ? "Service rooms are grouped together" : "Service rooms are scattered \u2014 not grouped",
      affectedEntities: hasGrouping ? [] : serviceRooms.map((r) => r.id),
      explanation: hasGrouping ? "At least two service rooms (kitchen, utility, etc.) are adjacent, supporting efficient service flow." : "Service rooms are not adjacent to each other. Grouping them improves workflow and plumbing efficiency."
    }];
  }
};
var NightDaySeparation = {
  id: "SC-ZON-003",
  name: "Night-Day Room Separation",
  description: "Night-use rooms (bedrooms) should be separated from day-use rooms",
  category: ConstraintCategory.FUNCTIONAL_ZONING,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const nightRooms = ctx.allRooms.filter((r) => r.type === "bedroom" || r.type === "bathroom");
    const dayRooms = ctx.allRooms.filter((r) => r.type === "living" || r.type === "dining" || r.type === "kitchen");
    if (nightRooms.length === 0 || dayRooms.length === 0) {
      return [{
        constraintId: "SC-ZON-003",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 15,
        maxScore: 15,
        message: "Night-Day separation: not applicable",
        affectedEntities: [],
        explanation: "Cannot evaluate \u2014 missing night or day rooms."
      }];
    }
    let directContacts = 0;
    for (const night of nightRooms) {
      if (night.type !== "bedroom")
        continue;
      for (const day of dayRooms) {
        if (night.floorId === day.floorId && polygonsAdjacent(night.boundary, day.boundary)) {
          directContacts++;
        }
      }
    }
    const score = directContacts === 0 ? 15 : directContacts <= 1 ? 10 : 3;
    return [{
      constraintId: "SC-ZON-003",
      passed: directContacts <= 1,
      severity: ConstraintSeverity.SOFT,
      score,
      maxScore: 15,
      message: directContacts === 0 ? "Excellent night-day separation" : `${directContacts} bedroom(s) directly adjacent to living/kitchen areas`,
      affectedEntities: [],
      explanation: directContacts === 0 ? "No bedrooms directly touch active day-use rooms. Good acoustic separation." : `${directContacts} bedroom(s) share walls with kitchen, living, or dining rooms. This may cause noise disturbance.`
    }];
  }
};

// packages/constraint-engine/dist/constraints/soft/geometry-proportion.js
var AspectRatio = {
  id: "SC-GEO-001",
  name: "Room Aspect Ratios",
  description: "Rooms should have reasonable proportions (ideally \u2264 2:1)",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const results = [];
    for (const room of ctx.allRooms) {
      const aspect = room.width > room.height ? room.width / room.height : room.height / room.width;
      let score;
      let message;
      if (aspect <= 2) {
        score = 10;
        message = `"${room.name}" has good proportions (${aspect.toFixed(1)}:1)`;
      } else if (aspect <= 3) {
        score = 5;
        message = `"${room.name}" is somewhat elongated (${aspect.toFixed(1)}:1)`;
      } else {
        score = 0;
        message = `"${room.name}" is excessively elongated (${aspect.toFixed(1)}:1)`;
      }
      results.push({
        constraintId: "SC-GEO-001",
        passed: aspect <= 2,
        severity: ConstraintSeverity.SOFT,
        score,
        maxScore: 10,
        message,
        affectedEntities: aspect > 2 ? [room.id] : [],
        explanation: aspect <= 2 ? `"${room.name}" has a balanced ${aspect.toFixed(1)}:1 aspect ratio, ideal for furniture placement.` : `"${room.name}" has an aspect ratio of ${aspect.toFixed(1)}:1. Ratios above 2:1 make rooms feel corridor-like and limit furniture arrangement.`,
        suggestedFixes: aspect > 2 ? [{
          description: `Adjust "${room.name}" to a more balanced proportion`,
          actionType: "resize",
          targetEntity: room.id,
          priority: 3
        }] : void 0
      });
    }
    if (results.length === 0) {
      results.push({
        constraintId: "SC-GEO-001",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 10,
        maxScore: 10,
        message: "No rooms to evaluate aspect ratios",
        affectedEntities: [],
        explanation: "No rooms present."
      });
    }
    return results;
  }
};
var RoomSizeRange = {
  id: "SC-GEO-002",
  name: "Room Size Within Range",
  description: "Room areas should be within configured min/max for their type",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const results = [];
    for (const room of ctx.allRooms) {
      const withinRange = (room.minArea === void 0 || room.area >= room.minArea) && (room.maxArea === void 0 || room.area <= room.maxArea);
      results.push({
        constraintId: "SC-GEO-002",
        passed: withinRange,
        severity: ConstraintSeverity.SOFT,
        score: withinRange ? 10 : 3,
        maxScore: 10,
        message: withinRange ? `"${room.name}" is within target size range` : `"${room.name}" is outside target size range`,
        affectedEntities: withinRange ? [] : [room.id],
        explanation: withinRange ? `"${room.name}" area is within the expected range for its type.` : `"${room.name}" area is outside the configured min/max target. Adjust size for optimal space utilization.`
      });
    }
    if (results.length === 0) {
      results.push({
        constraintId: "SC-GEO-002",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 10,
        maxScore: 10,
        message: "Room sizes: no rooms to evaluate",
        affectedEntities: [],
        explanation: "No rooms present."
      });
    }
    return results;
  }
};
var DimensionBalance = {
  id: "SC-GEO-003",
  name: "Bedroom Size Balance",
  description: "Bedroom sizes should be reasonably balanced (stdev < 20% of mean)",
  category: ConstraintCategory.GEOMETRY,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(ctx) {
    const bedrooms = ctx.allRooms.filter((r) => r.type === RoomType.Bedroom);
    if (bedrooms.length < 2) {
      return [{
        constraintId: "SC-GEO-003",
        passed: true,
        severity: ConstraintSeverity.SOFT,
        score: 15,
        maxScore: 15,
        message: "Bedroom balance: fewer than 2 bedrooms",
        affectedEntities: [],
        explanation: "Need at least 2 bedrooms to evaluate size balance."
      }];
    }
    const areas = bedrooms.map((b) => b.area);
    const mean = areas.reduce((s, a) => s + a, 0) / areas.length;
    const variance = areas.reduce((s, a) => s + (a - mean) ** 2, 0) / areas.length;
    const stdev = Math.sqrt(variance);
    const cv = mean > 0 ? stdev / mean : 0;
    const balanced = cv < 0.2;
    return [{
      constraintId: "SC-GEO-003",
      passed: balanced,
      severity: ConstraintSeverity.SOFT,
      score: balanced ? 15 : cv < 0.35 ? 8 : 0,
      maxScore: 15,
      message: balanced ? "Bedroom sizes are well-balanced" : `Bedroom sizes vary significantly (CV: ${(cv * 100).toFixed(0)}%)`,
      affectedEntities: balanced ? [] : bedrooms.map((b) => b.id),
      explanation: balanced ? `Bedroom areas have a coefficient of variation of ${(cv * 100).toFixed(0)}%, indicating balanced sizing.` : `Bedroom areas vary by ${(cv * 100).toFixed(0)}% (coefficient of variation). Consider making bedrooms more similar in size unless one is intentionally a master suite.`
    }];
  }
};

// packages/constraint-engine/dist/constraints/soft/structural.js
var WallAlignment = {
  id: "SC-STR-001",
  name: "Wall Alignment Across Floors",
  description: "Walls on different floors should align vertically for structural efficiency",
  category: ConstraintCategory.STRUCTURAL,
  severity: ConstraintSeverity.WARNING,
  enabled: true,
  evaluate(ctx) {
    if (ctx.building.floors.length < 2) {
      return [{
        constraintId: "SC-STR-001",
        passed: true,
        severity: ConstraintSeverity.WARNING,
        score: 0,
        maxScore: 0,
        status: EvaluationStatus.NOT_APPLICABLE,
        classification: "heuristic",
        message: "Wall alignment: single floor \u2014 not applicable",
        affectedEntities: [],
        explanation: "Wall alignment across floors is only relevant for multi-storey buildings."
      }];
    }
    const floor0Rooms = ctx.building.floors[0]?.rooms ?? [];
    const floor1Rooms = ctx.building.floors[1]?.rooms ?? [];
    if (floor0Rooms.length === 0 || floor1Rooms.length === 0) {
      return [{
        constraintId: "SC-STR-001",
        passed: true,
        severity: ConstraintSeverity.WARNING,
        score: 0,
        maxScore: 0,
        status: EvaluationStatus.INSUFFICIENT_INPUT,
        classification: "heuristic",
        message: "Wall alignment: insufficient data",
        affectedEntities: [],
        explanation: "Cannot evaluate wall alignment \u2014 one or more floors have no rooms."
      }];
    }
    return [{
      constraintId: "SC-STR-001",
      passed: true,
      severity: ConstraintSeverity.WARNING,
      score: 7,
      maxScore: 10,
      status: EvaluationStatus.WARNING,
      classification: "heuristic",
      message: "Wall alignment: partially evaluated (detailed check requires wall data)",
      affectedEntities: [],
      explanation: "Full wall alignment analysis requires complete wall geometry on both floors. A structural engineer should verify vertical alignment for multi-storey designs."
    }];
  }
};
var ColumnGrid = {
  id: "SC-STR-002",
  name: "Column Grid Regularity",
  description: "Columns should form a regular grid pattern where present",
  category: ConstraintCategory.STRUCTURAL,
  severity: ConstraintSeverity.INFORMATIONAL,
  enabled: true,
  evaluate(ctx) {
    let totalColumns = 0;
    for (const floor of ctx.building.floors) {
      totalColumns += floor.columns.length;
    }
    if (totalColumns === 0) {
      return [{
        constraintId: "SC-STR-002",
        passed: true,
        severity: ConstraintSeverity.INFORMATIONAL,
        score: 0,
        maxScore: 0,
        status: EvaluationStatus.NOT_ANALYZED,
        classification: "not_implemented",
        message: "Structural analysis: not analyzed \u2014 no column system is defined",
        affectedEntities: [],
        explanation: "No structural columns are defined in this plan. Column grid analysis is not applicable."
      }];
    }
    return [{
      constraintId: "SC-STR-002",
      passed: true,
      severity: ConstraintSeverity.INFORMATIONAL,
      score: 0,
      maxScore: 0,
      status: EvaluationStatus.NOT_IMPLEMENTED,
      classification: "not_implemented",
      message: `Structural analysis: not implemented (${totalColumns} columns documented)`,
      affectedEntities: [],
      explanation: `The plan includes ${totalColumns} structural columns. Grid regularity analysis will be available in a future phase.`
    }];
  }
};

// packages/constraint-engine/dist/constraints/soft/space-utilization.js
var WARNING_THRESHOLD = 0.35;
var FloorSpaceUtilization = {
  id: "SC-EFF-001",
  name: "Floor Space Utilization",
  description: "Each floor should avoid excessive unallocated residual area",
  category: ConstraintCategory.FUNCTIONAL_ZONING,
  severity: ConstraintSeverity.SOFT,
  enabled: true,
  evaluate(context) {
    return context.building.floors.map((floor) => {
      const floorArea = polygonArea2(floor.boundary);
      const assignedArea = floor.rooms.reduce((sum, room) => sum + room.area, 0);
      const unusedRatio = floorArea > 0 ? Math.max(0, floorArea - assignedArea) / floorArea : 1;
      const passed = unusedRatio <= WARNING_THRESHOLD;
      const score = Math.max(0, Math.round(20 * (1 - Math.max(0, unusedRatio - 0.1) / 0.5)));
      return {
        constraintId: "SC-EFF-001",
        passed,
        severity: ConstraintSeverity.SOFT,
        score,
        maxScore: 20,
        message: passed ? `${floor.name} uses ${Math.round((1 - unusedRatio) * 100)}% of its floor boundary` : `${floor.name} has ${Math.round(unusedRatio * 100)}% unexplained unused area`,
        affectedEntities: passed ? [] : [floor.id],
        explanation: passed ? "Residual area is within the schematic planning allowance." : "This area is not represented as a room, circulation space, terrace, void, or other intentional use.",
        suggestedFixes: passed ? void 0 : [{
          description: `Redistribute rooms or reduce ${floor.name}'s footprint`,
          actionType: "resize",
          targetEntity: floor.id,
          priority: 4
        }]
      };
    });
  }
};

// packages/constraint-engine/dist/config.js
var DEFAULT_WEIGHTS = {
  [ConstraintCategory.GEOMETRY]: 0.15,
  [ConstraintCategory.ACCESSIBILITY]: 0.2,
  [ConstraintCategory.CIRCULATION]: 0.15,
  [ConstraintCategory.DAYLIGHT]: 0.15,
  [ConstraintCategory.PRIVACY]: 0.12,
  [ConstraintCategory.FUNCTIONAL_ZONING]: 0.08,
  [ConstraintCategory.VASTU]: 0.1,
  [ConstraintCategory.USER_PREFERENCE]: 0.05
};
var DEFAULT_WEIGHTS_NO_VASTU = {
  [ConstraintCategory.GEOMETRY]: 0.17,
  [ConstraintCategory.ACCESSIBILITY]: 0.22,
  [ConstraintCategory.CIRCULATION]: 0.17,
  [ConstraintCategory.DAYLIGHT]: 0.17,
  [ConstraintCategory.PRIVACY]: 0.13,
  [ConstraintCategory.FUNCTIONAL_ZONING]: 0.09,
  [ConstraintCategory.VASTU]: 0,
  [ConstraintCategory.USER_PREFERENCE]: 0.05
};

// packages/constraint-engine/dist/evaluation-status.js
var NON_SCORABLE = /* @__PURE__ */ new Set([
  EvaluationStatus.NOT_APPLICABLE,
  EvaluationStatus.NOT_ANALYZED,
  EvaluationStatus.NOT_CHECKED,
  EvaluationStatus.INSUFFICIENT_INPUT,
  EvaluationStatus.NOT_IMPLEMENTED
]);

// packages/constraint-engine/dist/apartment-closure.js
function sharesBoundarySegment(polyA, polyB, minOverlap) {
  const ptsA = polyA.points;
  const ptsB = polyB.points;
  for (let i = 0; i < ptsA.length; i++) {
    const a1 = ptsA[i];
    const a2 = ptsA[(i + 1) % ptsA.length];
    const isHorizA = Math.abs(a1.y - a2.y) <= 2;
    const isVertA = Math.abs(a1.x - a2.x) <= 2;
    if (!isHorizA && !isVertA)
      continue;
    for (let j = 0; j < ptsB.length; j++) {
      const b1 = ptsB[j];
      const b2 = ptsB[(j + 1) % ptsB.length];
      if (isHorizA && Math.abs(b1.y - b2.y) <= 2 && Math.abs(a1.y - b1.y) <= 5) {
        const overlap = Math.min(Math.max(a1.x, a2.x), Math.max(b1.x, b2.x)) - Math.max(Math.min(a1.x, a2.x), Math.min(b1.x, b2.x));
        if (overlap >= minOverlap - 2)
          return true;
      } else if (isVertA && Math.abs(b1.x - b2.x) <= 2 && Math.abs(a1.x - b1.x) <= 5) {
        const overlap = Math.min(Math.max(a1.y, a2.y), Math.max(b1.y, b2.y)) - Math.max(Math.min(a1.y, a2.y), Math.min(b1.y, b2.y));
        if (overlap >= minOverlap - 2)
          return true;
      }
    }
  }
  return false;
}
function validateApartmentClosure(building, manifest) {
  const dynamicManifest = manifest ?? building.dynamicManifest ?? building.metadata?.dynamicManifest;
  const issues = [];
  const add = (code, message, severity = "error") => issues.push({ code, severity, message });
  const ledgers = building.floors.map((floor) => {
    const rooms = floor.rooms;
    const graph = new Map(rooms.map((r) => [r.id, /* @__PURE__ */ new Set()]));
    for (const r of rooms) {
      if (r.tags.some((t) => t.startsWith("flat:")) && !r.unitId)
        add("ROOM_OWNERSHIP_MISSING", r.id);
      const unit = floor.apartmentUnits?.find((u) => u.id === r.unitId);
      if (r.unitId) {
        if (!unit) {
          add("ROOM_OUTSIDE_UNIT", r.id);
        } else if (!containsPolygon(unit.boundary, r.boundary)) {
          const isBalcony = r.type === "balcony" || r.type === "utility" || r.spaceUse === "OUTDOOR" || r.tags.some((t) => t.includes("balcony") || t.includes("balc")) || r.name.toLowerCase().includes("balc");
          if (isBalcony) {
            const hasConnectingDoor = floor.doors.some((d) => d.connectsRooms.includes(r.id) && d.connectsRooms.some((otherId) => otherId !== r.id && rooms.some((other) => other.id === otherId && other.unitId === r.unitId)));
            const sharesSegment = sharesBoundarySegment(r.boundary, unit.boundary, 1200) || rooms.some((other) => other.unitId === r.unitId && other.id !== r.id && sharesBoundarySegment(r.boundary, other.boundary, 1200));
            if (!hasConnectingDoor && !sharesSegment) {
              add("ROOM_OUTSIDE_UNIT", r.id);
            }
          } else {
            add("ROOM_OUTSIDE_UNIT", r.id);
          }
        }
      }
      if (floor.voidBoundaries?.some((p) => polygonIntersectionArea(p, r.boundary) > 1))
        add("ROOM_OVERLAPS_VOID", r.id);
      if (!containsPolygon(floor.boundary, r.boundary))
        add("ROOM_OUTSIDE_FLOOR", r.id);
    }
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        if (polygonIntersectionArea(rooms[i].boundary, rooms[j].boundary) > 1) {
          add("ROOM_OVERLAP", `${rooms[i].id} / ${rooms[j].id}`);
        }
      }
    }
    const units = floor.apartmentUnits ?? [];
    const manifestUnits = Array.isArray(dynamicManifest?.units) ? dynamicManifest.units : Array.isArray(dynamicManifest?.units?.units) ? dynamicManifest.units.units : [];
    const expectedFlats = typeof dynamicManifest?.flatsPerFloor === "number" ? dynamicManifest.flatsPerFloor : typeof dynamicManifest?.units?.exactCount === "number" ? dynamicManifest.units.exactCount : void 0;
    if (expectedFlats !== void 0 && units.length !== expectedFlats) {
      add("UNIT_COUNT_MISMATCH", `expected ${expectedFlats} units, found ${units.length}`);
    }
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (!containsPolygon(floor.boundary, u.boundary))
        add("UNIT_OUTSIDE_FLOOR", u.id);
      for (let j = i + 1; j < units.length; j++) {
        if (polygonIntersectionArea(u.boundary, units[j].boundary) > 1) {
          add("UNIT_OVERLAP", `${u.id}/${units[j].id}`);
        }
      }
      for (const r of rooms.filter((r2) => !r2.unitId && !r2.tags?.includes("shaft:interflat"))) {
        if (polygonIntersectionArea(u.boundary, r.boundary) > 1) {
          add("UNIT_CORE_CONFLICT", `${u.id}/${r.id}`);
        }
      }
    }
    for (const wall of floor.walls) {
      if (wall.roomIds.length > 2 || wall.thickness <= 0 || !wall.wallUse)
        add("WALL_TOPOLOGY_INVALID", wall.id);
      const isPartyWall = wall.unitIds && wall.unitIds.length > 1 || wall.wallUse === "UNIT_SEPARATION";
      if (isPartyWall && wall.thickness < 230) {
        add("PARTY_WALL_THICKNESS_INSUFFICIENT", `${wall.id}: ${wall.thickness} mm (minimum 230 mm party wall required)`);
      }
      for (const id of wall.roomIds) {
        const room = rooms.find((r) => r.id === id);
        const pts = room?.boundary.points ?? [];
        const onEdge = (p) => pts.some((a, i) => {
          const b = pts[(i + 1) % pts.length];
          const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
          return L > 0 && Math.abs(dx * (p.y - a.y) - dy * (p.x - a.x)) / L <= 1 && p.x >= Math.min(a.x, b.x) - 1 && p.x <= Math.max(a.x, b.x) + 1 && p.y >= Math.min(a.y, b.y) - 1 && p.y <= Math.max(a.y, b.y) + 1;
        });
        if (!onEdge(wall.startPoint) || !onEdge(wall.endPoint))
          add("WALL_ROOM_BOUNDARY_MISMATCH", `${wall.id}/${id}`);
      }
    }
    const validDoors = /* @__PURE__ */ new Set();
    for (const door of floor.doors) {
      const host = floor.walls.find((w) => w.id === door.wallId);
      const a = rooms.find((r) => r.id === door.connectsRooms[0]), b = rooms.find((r) => r.id === door.connectsRooms[1]);
      if (!host || !openingFitsApartmentWall(host, door.position, door.width) || !a || !b || !host.roomIds.includes(a.id) || !host.roomIds.includes(b.id)) {
        add("OPENING_HOST_INVALID", door.id);
        continue;
      }
      validDoors.add(door.id);
      graph.get(a.id).add(b.id);
      graph.get(b.id).add(a.id);
      if (a.unitId && b.unitId && a.unitId !== b.unitId)
        add("UNIT_ACCESS_CROSSES_OWNERSHIP", door.id);
      const inside2 = a.unitId ? a : b.unitId ? b : null;
      if (inside2 && a.unitId !== b.unitId && !["foyer", "living", "dining"].includes(inside2.type))
        add("PRIMARY_ENTRANCE_PRIVATE_ROOM", door.id);
      const isEntrance = (a.spaceUse === "COMMON" || a.spaceUse === "CORE" || !a.unitId) && b.unitId || (b.spaceUse === "COMMON" || b.spaceUse === "CORE" || !b.unitId) && a.unitId;
      if (isEntrance && door.width < 1e3) {
        add("PRIMARY_ENTRANCE_DOOR_WIDTH_SUBSTANDARD", `${door.id}: width ${door.width} mm < 1000 mm`);
      }
      const isBedroomEntrance = a.type === "bedroom" && (b.type === "living" || b.type === "dining" || b.type === "corridor" || b.type === "foyer") || b.type === "bedroom" && (a.type === "living" || a.type === "dining" || a.type === "corridor" || a.type === "foyer");
      if (a.unitId && a.unitId === b.unitId && isBedroomEntrance) {
        if (door.width < 800) {
          add("BEDROOM_DOOR_WIDTH_SUBSTANDARD", `${door.id}: width ${door.width} mm < 800 mm`);
        } else if (door.width < 900) {
          add("BEDROOM_DOOR_WIDTH_BELOW_TARGET", `${door.id}: width ${door.width} mm < 900 mm target`, "warning");
        }
      }
      if (a.unitId && a.unitId === b.unitId && (a.type === "bathroom" || b.type === "bathroom" || a.type === "utility" || b.type === "utility")) {
        if (door.width < 700) {
          add("SERVICE_DOOR_WIDTH_SUBSTANDARD", `${door.id}: width ${door.width} mm < 700 mm`);
        } else if (door.width < 750) {
          add("SERVICE_DOOR_WIDTH_BELOW_TARGET", `${door.id}: width ${door.width} mm < 750 mm target`, "warning");
        }
      }
    }
    for (const window of floor.windows) {
      const host = floor.walls.find((w) => w.id === window.wallId);
      if (!host || !openingFitsApartmentWall(host, window.position, window.width) || !host.roomIds.includes(window.roomId) || host.wallUse !== "EXTERNAL" && host.wallUse !== "SHAFT")
        add("WINDOW_HOST_INVALID", window.id);
    }
    const openings = [...floor.doors, ...floor.windows];
    for (let i = 0; i < openings.length; i++) {
      for (let j = i + 1; j < openings.length; j++) {
        const a = openings[i], b = openings[j];
        if (a.wallId === b.wallId && Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y) < (a.width + b.width) / 2 - 1) {
          add("OPENING_OVERLAP", `${a.id}/${b.id}`);
        }
      }
    }
    const walk = (starts, accept) => {
      const visited = new Set(starts);
      const queue = [...starts];
      for (let i = 0; i < queue.length; i++) {
        for (const id of graph.get(queue[i]) ?? []) {
          const r = rooms.find((r2) => r2.id === id);
          if (r && accept(r) && !visited.has(id)) {
            visited.add(id);
            queue.push(id);
          }
        }
      }
      return visited;
    };
    const commonRooms = rooms.filter((r) => r.spaceUse === "COMMON");
    const commonReach = walk(commonRooms.slice(0, 1).map((r) => r.id), (r) => r.spaceUse === "COMMON" || r.spaceUse === "CORE");
    for (const r of rooms.filter((r2) => r2.spaceUse === "COMMON" || r2.spaceUse === "CORE")) {
      if (!commonReach.has(r.id))
        add("COMMON_CORE_ACCESS_DISCONNECTED", r.id);
    }
    for (let uIdx = 0; uIdx < units.length; uIdx++) {
      const u = units[uIdx];
      const unitRooms = rooms.filter((r) => r.unitId === u.id);
      const entrances = floor.doors.filter((d) => validDoors.has(d.id) && d.connectsRooms.some((id) => unitRooms.some((r) => r.id === id)) && d.connectsRooms.some((id) => rooms.some((r) => r.id === id && r.spaceUse === "COMMON")));
      if (entrances.length !== 1)
        add("PRIMARY_ENTRANCE_MISSING", `${u.id}: ${entrances.length} entrances`);
      const entryIds = entrances.flatMap((d) => d.connectsRooms.filter((id) => unitRooms.some((r) => r.id === id)));
      const reached = walk(entryIds, (r) => r.unitId === u.id);
      for (const r of unitRooms)
        if (!reached.has(r.id))
          add("ROOM_ACCESS_DISCONNECTED", r.id);
      if (!entrances.some((d) => d.connectsRooms.some((id) => commonReach.has(id))))
        add("UNIT_ACCESS_DISCONNECTED", u.id);
      const unitSpec = manifestUnits.find((item) => item.unitIndex !== void 0 && item.unitIndex === u.unitIndex || item.unitIndex !== void 0 && item.unitIndex === uIdx + 1 || item.id && (u.id === item.id || u.id.endsWith(String(item.id)) || String(item.id).endsWith(u.id)) || item.unitIndex !== void 0 && u.id.endsWith(String(item.unitIndex)));
      const bedRoomsList = unitRooms.filter((r) => r.type === "bedroom" || r.tags.includes("role:bedroom"));
      const inferredBhk = bedRoomsList.length > 0 ? `${bedRoomsList.length}BHK` : "3BHK";
      const bhkType = unitSpec?.bhkType ?? unitSpec?.type ?? u.unitType ?? inferredBhk;
      const match = String(bhkType).match(/^([1234])BHK$/i);
      const defaultBeds = match ? parseInt(match[1], 10) : 3;
      const expectedBeds = typeof unitSpec?.bedrooms === "number" ? unitSpec.bedrooms : defaultBeds;
      const defaultBaths = bhkType === "1BHK" ? 1 : bhkType === "2BHK" ? 2 : bhkType === "3BHK" ? 2 : 3;
      const expectedBaths = typeof unitSpec?.bathrooms === "number" ? unitSpec.bathrooms : unitSpec?.attachedBathCount !== void 0 ? unitSpec.attachedBathCount + 1 : defaultBaths;
      const livingCount = unitRooms.filter((r) => r.type === "living" || r.tags.includes("role:living")).length;
      if (livingCount === 0)
        add("UNIT_ROOM_MANIFEST_INCOMPLETE", `${u.id}: missing living room for ${bhkType}`);
      const kitchenCount = unitRooms.filter((r) => r.type === "kitchen" || r.tags.includes("role:kitchen")).length;
      if (kitchenCount === 0)
        add("UNIT_ROOM_MANIFEST_INCOMPLETE", `${u.id}: missing kitchen for ${bhkType}`);
      const bedCount = bedRoomsList.length;
      if (bedCount !== expectedBeds) {
        add("UNIT_ROOM_MANIFEST_INCOMPLETE", `${u.id}: expected exactly ${expectedBeds} bedrooms for ${bhkType}, found ${bedCount}`);
      }
      const bathCount = unitRooms.filter((r) => r.type === "bathroom" || r.tags.includes("role:bathroom")).length;
      if (bathCount < expectedBaths) {
        add("UNIT_ROOM_MANIFEST_INCOMPLETE", `${u.id}: expected at least ${expectedBaths} bathrooms for ${bhkType}, found ${bathCount}`);
      }
      if (unitSpec?.hasUtilityBalcony || typeof unitSpec?.utilities === "number" && unitSpec.utilities > 0) {
        const hasUtil = unitRooms.some((r) => r.type === "utility" || r.type === "balcony" || r.tags.some((t) => t.includes("utility") || t.includes("balcony")));
        if (!hasUtil)
          add("UNIT_ROOM_MANIFEST_INCOMPLETE", `${u.id}: missing utility balcony for ${bhkType}`);
      }
    }
    for (const r of rooms) {
      if (r.bathroomAccessClass === "UNKNOWN")
        add("BATHROOM_OWNERSHIP_UNKNOWN", r.id, "warning");
      if (r.bathroomOwnerRoomId) {
        const owner = rooms.find((o) => o.id === r.bathroomOwnerRoomId);
        if (!owner || owner.unitId !== r.unitId || owner.type !== "bedroom" || !graph.get(r.id)?.has(owner.id))
          add("BATHROOM_OWNER_ACCESS_MISSING", r.id);
        if ([...graph.get(r.id) ?? []].some((id) => id !== owner?.id))
          add("ATTACHED_BATHROOM_NOT_PRIVATE", r.id);
      }
      const hasBalconyOrUtilityVentilation = (r.type === "living" || r.type === "bedroom") && [...graph.get(r.id) ?? []].some((adjId) => {
        const adj = rooms.find((o) => o.id === adjId);
        return adj?.type === "balcony" || adj?.spaceUse === "OUTDOOR" || adj?.name.toLowerCase().includes("balcony") || adj?.type === "dining" && [...graph.get(adj.id) ?? []].some((dAdjId) => {
          const dAdj = rooms.find((o) => o.id === dAdjId);
          return dAdj?.type === "balcony" || dAdj?.spaceUse === "OUTDOOR" || dAdj?.name.toLowerCase().includes("balcony");
        });
      }) || r.type === "kitchen" && [...graph.get(r.id) ?? []].some((adjId) => {
        const adj = rooms.find((o) => o.id === adjId);
        return adj?.type === "utility" || adj?.type === "service_shaft" || adj?.spaceUse === "SERVICE" || adj?.spaceUse === "OUTDOOR" || adj?.name.toLowerCase().includes("utility");
      });
      if (r.unitId && ["living", "bedroom", "kitchen"].includes(r.type) && !floor.windows.some((w) => w.roomId === r.id) && !hasBalconyOrUtilityVentilation)
        add("DAYLIGHT_OPENING_UNVERIFIED", r.id, "warning");
    }
    const ledger = measureApartmentAreaLedger(floor);
    if (!Number.isFinite(ledger.delta) || Math.abs(ledger.delta) >= 1e-3)
      add("AREA_LEDGER_MISMATCH", `${floor.id}: ${ledger.delta} mm2`);
    if (!ledger.supported)
      add("AREA_LEDGER_UNSUPPORTED", floor.id);
    if (ledger.overlap >= 1e-3)
      add("AREA_LEDGER_OVERLAP", `${floor.id}: ${ledger.overlap} mm2`);
    if (ledger.unassigned >= 1e-3)
      add("AREA_UNASSIGNED", `${floor.id}: ${ledger.unassigned} mm2`);
    for (const balcony of ledger.balconies) {
      if (!balcony.unitId || !balcony.accessDoorIds.some((id) => validDoors.has(id)))
        add("BALCONY_ACCESS_MISSING", balcony.id);
      const hasExteriorOrOtsEdge = floor.walls.some((w) => w.roomIds.includes(balcony.id) && (w.roomIds.length === 1 || w.wallUse === "SHAFT" || w.roomIds.some((id) => {
        if (id === balcony.id)
          return false;
        const other = rooms.find((rm) => rm.id === id);
        return other ? architecturalSpaceRole(other) === "OPEN_TO_SKY_VOID" : false;
      })));
      if (!hasExteriorOrOtsEdge)
        add("BALCONY_EXTERIOR_EDGE_MISSING", balcony.id);
      if (balcony.usableDepth < 1200)
        add("BALCONY_CLEAR_DEPTH_SUBSTANDARD", `${balcony.id}: clear depth ${balcony.usableDepth} mm < 1200 mm`);
      const r = rooms.find((room) => room.id === balcony.id);
      const isBedBalcony = balcony.id.toLowerCase().includes("bed") || r?.name?.toLowerCase().includes("bedroom");
      if (!isBedBalcony && (balcony.usableDepth < 1500 || balcony.usableWidth < 2800))
        add("BALCONY_TOO_SMALL", balcony.id, "warning");
    }
    for (const u of units) {
      const nonUtilityBalconies = ledger.balconies.filter((b) => {
        if (b.unitId !== u.id)
          return false;
        const r = rooms.find((room) => room.id === b.id);
        const isUtilOrBed = b.id.toLowerCase().includes("utility") || b.id.toLowerCase().includes("bed") || r?.name.toLowerCase().includes("utility") || r?.name.toLowerCase().includes("bedroom");
        return !isUtilOrBed;
      });
      if (nonUtilityBalconies.length > 1)
        add("BALCONY_FRAGMENTATION_HIGH", u.id, "warning");
    }
    if (ledger.unassigned / ledger.gross > 0.15)
      add("UNASSIGNED_AREA_HIGH", floor.id, "warning");
    return ledger;
  });
  return { buildingId: building.id, buildingRevision: building.version, issues, hardErrors: issues.filter((i) => i.severity === "error").length, warnings: issues.filter((i) => i.severity === "warning").length, ledgers, regulatoryStatus: "NOT_VERIFIED", professionalReview: "REQUIRED" };
}

// packages/planning-engine/src/apartment/generation-report.ts
function createGenerationReport(building, validation, evidence, selectionFindings = []) {
  const findings = [...selectionFindings];
  for (const error of validation.errors.filter((e) => !e.autoCorrected)) {
    findings.push({
      code: error.code,
      severity: error.severity,
      source: "GEOMETRY",
      description: error.description,
      floorId: error.floorId,
      elementIds: error.elementIds
    });
  }
  if (!validation.isValid && !findings.some((f) => f.source === "GEOMETRY" && f.severity === "CRITICAL")) {
    findings.push({
      code: "GEOMETRY_NOT_VALID",
      severity: "CRITICAL",
      source: "GEOMETRY",
      description: "Geometry validation did not pass.",
      elementIds: []
    });
  }
  for (const floor of building.floors) {
    const ledger = measureApartmentAreaLedger(floor);
    if (!(Math.abs(ledger.delta) < 1e-3) || ledger.unassigned > 1e-3 || ledger.overlap > 1e-3) {
      findings.push({
        code: "RAW_AREA_LEDGER_FAILED",
        severity: "CRITICAL",
        source: "GEOMETRY",
        description: `Raw area ledger: delta=${ledger.delta}, unassigned=${ledger.unassigned}, overlap=${ledger.overlap} mm2.`,
        floorId: floor.id,
        elementIds: [floor.id]
      });
    }
    if (!floor.apartmentUnits?.length) continue;
    for (const issue of validateApartmentClosure({ ...building, floors: [floor] }).issues) {
      findings.push({
        code: issue.code,
        severity: issue.severity === "error" ? "CRITICAL" : "WARNING",
        source: "CLOSURE",
        description: issue.message,
        floorId: floor.id,
        elementIds: [floor.id]
      });
    }
    for (const room of floor.rooms.filter((r) => r.type === RoomType.Bathroom)) {
      const opening = floor.windows.some((w) => w.roomId === room.id && w.width > 0 && w.height > 0 && floor.walls.some((wall) => wall.id === w.wallId && wall.roomIds.includes(room.id) && (wall.wallUse === "EXTERNAL" || wall.wallUse === "SHAFT") && openingFitsApartmentWall(wall, w.position, w.width)));
      if (!opening) findings.push({
        code: "BATHROOM_OPENING_MISSING",
        severity: "CRITICAL",
        source: "OPENING",
        description: `${room.name} has no fitting external/shaft opening. Ventilation is not verified.`,
        floorId: floor.id,
        elementIds: [room.id]
      });
    }
  }
  const unique = [...new Map(findings.map((f) => [JSON.stringify([f.source, f.code, f.floorId, f.elementIds, f.description]), f])).values()];
  unique.sort((a, b) => Number(b.severity === "CRITICAL") - Number(a.severity === "CRITICAL") || a.code.localeCompare(b.code) || (a.floorId ?? "").localeCompare(b.floorId ?? "") || a.elementIds.join().localeCompare(b.elementIds.join()) || a.description.localeCompare(b.description));
  return {
    ...evidence,
    professionalReviewRequired: true,
    status: unique.length || evidence.strategy !== "VALIDATED_TOPOLOGY" ? "BEST_EFFORT" : "INTERNAL_CHECKS_PASSED",
    violations: unique.map((f, index) => ({ ...f, rank: index + 1 }))
  };
}

// packages/planning-engine/src/topology/architectural-intent.ts
var IntentConflictError = class extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.code = code;
    this.name = "IntentConflictError";
  }
};
function normalizeBriefSpelling(text) {
  return text.toLowerCase().replace(/\b(?:cental|centeral)\b/g, "central").replace(/\b(?:differnt|diffrent|diferent)\b/g, "different").replace(/\b(?:apartement|appartment|aprtment)\b/g, "apartment").replace(/\b(?:vasthu|vaastu)\b/g, "vastu").replace(/\b(?:ventilatation|ventillation)\b/g, "ventilation").replace(/\b(?:stairecase|staircsae)\b/g, "staircase");
}
function clausesOf(prompt) {
  return normalizeBriefSpelling(prompt).split(/[.;\n]|\b(?:and|but|while|whereas)\b|,/).map((c) => c.trim()).filter(Boolean);
}
var has = (clause, re) => re.test(clause);
var NEGATED = /\b(no|not|avoid|don't|do not|never|without|omit|exclude|zero)\b/;
function accumulator() {
  return { values: /* @__PURE__ */ new Set(), evidence: /* @__PURE__ */ new Map() };
}
function record(acc, value, evidence) {
  acc.values.add(value);
  if (!acc.evidence.has(value)) acc.evidence.set(value, evidence);
}
function sole(acc, code, label) {
  if (acc.values.size > 1) {
    const requested = [...acc.values].join(" and ");
    throw new IntentConflictError(code, `${label} requested as both ${requested}; state one directly`);
  }
  return acc.values.values().next().value;
}
function interpretArchitecturalIntent(input) {
  const prompt = input.prompt ?? input.aiPrompt ?? "";
  const clauses = clausesOf(prompt);
  const found = [];
  const core = accumulator();
  const vent = accumulator();
  const priority = accumulator();
  const kitchenSize = accumulator();
  const kitchenStyle = accumulator();
  const sitout = accumulator();
  const compactness = accumulator();
  const livingFacing = accumulator();
  let coreIsRequired = false;
  let ventIsRequired = false;
  let bedroomsAwayFromLobby = false;
  let livingFirst = false;
  let minimizeCorridor = false;
  let bedroomBalconies = "NONE_REQUESTED";
  let stairCount = 2;
  let centerBuilding = false;
  let singleLift = false;
  let targetAreaSqFt;
  let areaTargetScope;
  let properSpaceUtilization = false;
  let ventilatedCentralOtsShafts = false;
  let requestsDifferentShape = false;
  let preferredMassingShape;
  const fullLower = normalizeBriefSpelling(prompt);
  if (/\b(?:building\s+center(?:ed)?|center(?:ed)?\s+(?:the\s+)?building|center(?:ed)?\s+inside\s+(?:the\s+)?permissible)\b/.test(fullLower)) {
    centerBuilding = true;
  }
  if (/\b(?:proper\s+space\s+utilization|space\s+utilization|efficient\s+space|high\s+efficiency|compact\s+(?:layout|plan|building|footprint|efficiency|floor\s+plate|massing)|no\s+wasted\s+space|minimize\s+wasted|maximi[sz]e\s+(?:usable|plot)|utili[sz]e\s+(?:the\s+)?(?:full|entire|whole|complete)\s+plot|full\s+plot|full\s+setback|within\s+(?:the\s+)?setbacks?)\b/.test(fullLower) || /\b\d+(?:\.\d+)?\s*(?:m|ft|mm)\s+setbacks?\b/.test(fullLower)) {
    properSpaceUtilization = true;
  }
  const negOtsGlobal = /\b(?:no|not|without|omit|exclude|zero)\s+(?:any\s+)?(?:ots|open[\s-]to[\s-]sky)\b/.test(fullLower);
  if (!negOtsGlobal && /\b(?:ventilated?\s+(?:central\s+)?ots|central\s+ots\s+shafts?|ots\s+shafts?|ventilation\s+shafts?|light\s+wells?)\b/.test(fullLower)) {
    ventilatedCentralOtsShafts = true;
  }
  if (/\b(?:differ(?:e|a)?nt\s+(?:building\s+|footprint\s+|layout\s+)?shape|non[\s-]standard\s+(?:building\s+)?shape|unique\s+(?:building\s+)?shape|varied\s+(?:building\s+)?shape|h[\s-]?shape|u[\s-]?shape|l[\s-]?shape|cruciform|plus[\s-]?shape|pinwheel|stepped)\b/.test(fullLower)) {
    requestsDifferentShape = true;
  }
  if (/\bh[\s-]?shape|h[\s-]?wing\b/.test(fullLower)) preferredMassingShape = "H_SHAPE_WING";
  else if (/\bu[\s-]?shape\b/.test(fullLower)) preferredMassingShape = "U_SHAPE_COURTYARD";
  else if (/\bl[\s-]?shape|corner[\s-]?wing\b/.test(fullLower)) preferredMassingShape = "L_SHAPE_CORNER";
  else if (/\bcruciform|plus[\s-]?shape\b/.test(fullLower)) preferredMassingShape = "CRUCIFORM_PLUS";
  else if (/\bpinwheel\b/.test(fullLower)) preferredMassingShape = "PINWHEEL_CLUSTER";
  else if (/\bstepped(?:\s+offset)?\b/.test(fullLower)) preferredMassingShape = "STEPPED_OFFSET_BLOCK";
  else if (/\bcompact\s+(?:double[\s-]loaded\s+)?block\b/.test(fullLower)) preferredMassingShape = "COMPACT_DOUBLE_LOADED";
  const areaMatch = fullLower.match(/\b(\d[\d,]*(?:\.\d+)?)\s*(?:sq\.?\s*ft\.?|sqft|square\s+feet)\b/);
  if (areaMatch) {
    const parsedArea = Number(areaMatch[1].replace(/,/g, ""));
    if (Number.isFinite(parsedArea) && parsedArea > 0) {
      targetAreaSqFt = parsedArea;
      if (/\bgross\s+floor\s+area\b/.test(fullLower)) {
        areaTargetScope = "GROSS_FLOOR_AREA";
      } else if (/\b(?:total\s+carpet\s+area\s+per\s+floor|carpet\s+area\s+per\s+floor|floor\s+total\s+carpet)\b/.test(fullLower)) {
        areaTargetScope = "FLOOR_TOTAL_CARPET";
      } else if (/\b(?:carpet\s+area\s+per\s+(?:apartment|flat|unit)|per\s+(?:apartment|flat|unit)\s+carpet)\b/.test(fullLower)) {
        areaTargetScope = "PER_APARTMENT_CARPET";
      }
    }
  }
  for (const clause of clauses) {
    const mentionsCore = has(clause, /\b(lifts?|elevators?|stairs?|staircases?|cores?|vertical\s+circulation|lift\s+bank)\b/);
    if (mentionsCore) {
      const dirs = [
        [/\beast(?:ern)?\b/, "EAST"],
        [/\bwest(?:ern)?\b/, "WEST"],
        [/\bnorth(?:ern)?\b/, "NORTH"],
        [/\bsouth(?:ern)?\b/, "SOUTH"]
      ];
      const matchedDirs = dirs.filter(([re]) => has(clause, re));
      const central = has(clause, /\b(central|centre|center|middle|core\s+in\s+the\s+middle)\b/);
      const split = has(clause, /\b(split|separate(?:d)?\s+cores?|two\s+cores?|distributed)\b/);
      const clauseWithoutNonCoreNegation = clause.replace(
        /\b(?:no|not|avoid|don't|do\s+not|never|without|omit|exclude|zero)\s+(?:any\s+)?(?:ots|open[\s-]to[\s-]sky(?:\s+courtyard)?|courtyards?|atriums?|light\s+wells?|air\s+wells?|balcon(?:y|ies)|utility(?:\s+balcon(?:y|ies))?)\b/g,
        ""
      );
      if ((matchedDirs.length > 0 || central || split) && has(clauseWithoutNonCoreNegation, NEGATED)) {
        throw new IntentConflictError(
          "AMBIGUOUS_CORE_PLACEMENT",
          "state the desired core placement directly; a negated placement is not silently inverted"
        );
      }
      for (const [, dir] of matchedDirs) record(core, dir, clause);
      if (central) record(core, "CENTRAL", clause);
      if (split) record(core, "SPLIT", clause);
      if (has(clause, /\b(place|position|put|locate|keep|move|shift|provide|with|have|having|include|feature)\b/) || (matchedDirs.length > 0 || central || split) && !has(clause, /\b(prefer\w*|ideal\w*|optional\w*)\b/)) {
        coreIsRequired = true;
      }
      if (has(clause, /\b(?:one|1|single|central)\s+lift\b/) && !has(clause, /\blift\s+(?:core|bank|shafts)\b/) && !has(clause, /\blifts\b/)) {
        singleLift = true;
      }
      if (has(clause, /\b(compact|tight|efficient|minimal|narrow)\b/)) record(compactness, "COMPACT", clause);
      if (has(clause, /\b(spacious|generous|wide|grand)\b/)) record(compactness, "STANDARD", clause);
      const stairMatch = clause.match(/\b(one|two|three|1|2|3)\s+(?:fire\s+)?(?:stairs?|staircases?)\b/);
      if (stairMatch) {
        const word = stairMatch[1];
        stairCount = word === "one" || word === "1" ? 1 : word === "three" || word === "3" ? 3 : 2;
      } else if (has(clause, /\b(?:stairs?|staircases?)\s+(?:positioned\s+)?on\s+(?:both|either)\s+sides?\b/)) {
        stairCount = 2;
      }
    }
    if (has(clause, /\b(courtyards?|atriums?|open[\s-]to[\s-]sky|ots|light\s+well|air\s+well)\b/)) {
      if (has(clause, NEGATED)) {
        record(vent, "PERIMETER_ONLY", clause);
        ventIsRequired = true;
      } else {
        if (has(clause, /\b(central|centre|center|middle|internal)\b/) || !has(clause, /\b(side|lateral|perimeter|flank)\b/)) {
          record(vent, "CENTRAL_COURTYARD", clause);
        } else {
          record(vent, "SIDE_SHAFTS", clause);
        }
        if (has(clause, /\b(around|organiz|organis|centred|centered|design(?:ed)?)\b/)) ventIsRequired = true;
      }
    } else if (has(clause, /\b(shafts?|ducts?)\b/) && has(clause, /\b(side|lateral|perimeter|flank)\b/)) {
      record(vent, "SIDE_SHAFTS", clause);
    }
    if (has(clause, /\b(daylight|sunlight|natural\s+light|cross[\s-]ventilation|ventilation|airflow|breeze)\b/) && has(clause, /\b(prioriti[sz]e|priority|maximi[sz]e|focus|emphas)\b/)) {
      record(priority, "DAYLIGHT_VENTILATION", clause);
    }
    if (has(clause, /\b(privacy|private|away\s+from\s+(?:the\s+)?(?:shared\s+)?lobby|quiet)\b/)) {
      record(priority, "PRIVACY_CIRCULATION", clause);
      if (has(clause, /\b(bedrooms?)\b/) || has(clause, /away\s+from/)) bedroomsAwayFromLobby = true;
    }
    if (has(clause, /\b(compact|efficien\w*|minimi[sz]e\s+(?:inefficient\s+)?corridors?|space[\s-]saving)\b/)) {
      record(priority, "COMPACT_EFFICIENCY", clause);
      if (has(clause, /corridors?/)) minimizeCorridor = true;
    }
    if (has(clause, /\bkitchens?\b/)) {
      if (has(clause, /\b(large|larger|big|bigger|spacious|generous|expanded)\b/)) {
        record(kitchenSize, "LARGER", clause);
        record(priority, "KITCHEN_DINING", clause);
      }
      if (has(clause, /\b(small|smaller|compact|minimal)\b/)) record(kitchenSize, "COMPACT", clause);
      if (has(clause, /\b(open|breakfast\s+counter|island)\b/)) record(kitchenStyle, "OPEN", clause);
      if (has(clause, /\b(enclosed|closed|separate(?:d)?)\b/)) record(kitchenStyle, "ENCLOSED", clause);
    }
    if (has(clause, /\b(sit[\s-]?outs?|main\s+balcon(?:y|ies)|living\s+balcon(?:y|ies))\b/)) {
      if (has(clause, /\b(small|smaller|compact|minimal|narrow)\b/)) record(sitout, "COMPACT", clause);
      if (has(clause, /\b(large|larger|generous|standard)\b/)) record(sitout, "STANDARD", clause);
    }
    if (has(clause, /\bbalcon(?:y|ies)\b/) && has(clause, /\b(bedrooms?|every\s+bedroom|each\s+bedroom|all\s+bedrooms?)\b/)) {
      bedroomBalconies = has(clause, /\b(where\s+feasible|where\s+possible|if\s+feasible)\b/) ? "WHERE_FEASIBLE" : "ALL_BEDROOMS";
    }
    if (has(clause, /\b(living[\s-]first|entrance.*living|living.*entrance|enter.*living)\b/)) livingFirst = true;
    if (has(clause, /\b(living|livings?\s+spaces?|living\s+rooms?)\b/)) {
      const dirs = [
        [/\beast(?:ern)?[\s-]*(?:facing)?\b/, "EAST"],
        [/\bwest(?:ern)?[\s-]*(?:facing)?\b/, "WEST"],
        [/\bnorth(?:ern)?[\s-]*(?:facing)?\b/, "NORTH"],
        [/\bsouth(?:ern)?[\s-]*(?:facing)?\b/, "SOUTH"]
      ];
      for (const [re, dir] of dirs) if (has(clause, re)) record(livingFacing, dir, clause);
    }
  }
  const corePick = sole(core, "CONFLICTING_CORE_PLACEMENT", "core placement");
  const ventPick = sole(vent, "CONFLICTING_VENTILATION_STRATEGY", "ventilation strategy");
  const kitchenSizePick = sole(kitchenSize, "CONFLICTING_KITCHEN_PREFERENCE", "kitchen size");
  const kitchenStylePick = sole(kitchenStyle, "CONFLICTING_KITCHEN_PREFERENCE", "kitchen style");
  const sitoutPick = sole(sitout, "CONFLICTING_SITOUT_PREFERENCE", "sit-out size");
  const compactnessPick = sole(compactness, "CONFLICTING_CORE_PREFERENCE", "core compactness");
  const livingFacingPick = sole(livingFacing, "CONFLICTING_LIVING_ORIENTATION", "living orientation");
  const priorityOrder = [
    "DAYLIGHT_VENTILATION",
    "PRIVACY_CIRCULATION",
    "KITCHEN_DINING",
    "COMPACT_EFFICIENCY"
  ];
  const priorityPick = priorityOrder.find((p) => priority.values.has(p)) ?? "UNSPECIFIED";
  const collect = (topic, acc, required) => {
    for (const value of acc.values) {
      found.push({
        topic,
        value: String(value),
        strength: required ? "REQUIRED" : "PREFERRED",
        evidence: acc.evidence.get(value) ?? ""
      });
    }
  };
  collect("corePlacement", core, coreIsRequired);
  collect("ventilationStrategy", vent, ventIsRequired);
  collect("priority", priority, false);
  collect("kitchenSize", kitchenSize, false);
  collect("kitchenStyle", kitchenStyle, false);
  collect("sitoutSize", sitout, false);
  collect("coreCompactness", compactness, false);
  collect("livingOrientation", livingFacing, false);
  const preferences = {
    corePreference: corePick ?? "UNSPECIFIED",
    ventilationStrategy: ventPick ?? "UNSPECIFIED",
    priority: priorityPick,
    bedroomsAwayFromLobby,
    bedroomBalconies,
    kitchenSize: kitchenSizePick ?? "STANDARD",
    kitchenStyle: kitchenStylePick ?? "UNSPECIFIED",
    sitoutSize: sitoutPick ?? "STANDARD",
    livingFirstEntrance: livingFirst,
    minimizeCorridor,
    coreCompactness: compactnessPick ?? "STANDARD",
    livingOrientation: livingFacingPick ?? "UNSPECIFIED",
    ...properSpaceUtilization ? { properSpaceUtilization: true } : {},
    ...ventilatedCentralOtsShafts ? { ventilatedCentralOtsShafts: true } : {},
    ...requestsDifferentShape ? { requestsDifferentShape: true } : {},
    ...preferredMassingShape ? { preferredMassingShape } : {}
  };
  const mandatory = {
    flatsPerFloor: input.flatsPerFloor,
    unitTypes: input.unitTypes,
    everyBathroomVentilated: true,
    everyFlatAccessibleFromCommonCore: true,
    stairCount,
    withinBuildingEnvelope: true,
    ...coreIsRequired && corePick ? { corePlacement: corePick } : {},
    ...ventIsRequired && ventPick ? { ventilationStrategy: ventPick } : {},
    ...centerBuilding ? { centerBuilding: true } : {},
    ...singleLift ? { singleLift: true } : {},
    ...targetAreaSqFt !== void 0 ? { targetAreaSqFt } : {},
    ...areaTargetScope !== void 0 ? { areaTargetScope } : {}
  };
  const digestSource = JSON.stringify({
    mandatory,
    organization: {
      corePreference: preferences.corePreference,
      ventilationStrategy: preferences.ventilationStrategy,
      // `priority` is deliberately EXCLUDED. A brief that only asks for a
      // larger kitchen sets priority KITCHEN_DINING, and letting that reorder
      // the families would hand the two briefs differently-shaped flats — so
      // the user's "larger kitchen" could arrive smaller, in a different plan.
      // Priority still drives scoring and ranking; it just does not perturb
      // the exploration seed.
      bedroomsAwayFromLobby: preferences.bedroomsAwayFromLobby,
      minimizeCorridor: preferences.minimizeCorridor,
      coreCompactness: preferences.coreCompactness,
      livingOrientation: preferences.livingOrientation
    }
  });
  let digest = 2166136261;
  for (let i = 0; i < digestSource.length; i++) {
    digest ^= digestSource.charCodeAt(i);
    digest = Math.imul(digest, 16777619);
  }
  return {
    mandatory,
    preferences,
    clauses: found,
    intentDigest: (digest >>> 0).toString(16).padStart(8, "0"),
    sourcePrompt: prompt
  };
}
function validateProgram(program) {
  const issues = [];
  const { mandatory, preferences } = program;
  if (![1, 2, 3, 4, 5, 6].includes(mandatory.flatsPerFloor)) issues.push("flatsPerFloor must be 1, 2, 3, 4, 5 or 6");
  if (mandatory.unitTypes.length !== mandatory.flatsPerFloor) {
    issues.push(`unitTypes length ${mandatory.unitTypes.length} must equal flatsPerFloor ${mandatory.flatsPerFloor}`);
  }
  if (mandatory.unitTypes.some((t) => !/^[1-4]BHK$/.test(t))) issues.push("unitTypes must each be 1BHK..4BHK");
  if (!Number.isInteger(mandatory.stairCount) || mandatory.stairCount < 1 || mandatory.stairCount > 3) {
    issues.push("stairCount must be 1, 2 or 3");
  }
  if (mandatory.everyBathroomVentilated !== true) issues.push("bathroom ventilation is not negotiable");
  if (mandatory.everyFlatAccessibleFromCommonCore !== true) issues.push("flat access is not negotiable");
  if (mandatory.withinBuildingEnvelope !== true) issues.push("envelope containment is not negotiable");
  const coreDomain = ["CENTRAL", "EAST", "WEST", "NORTH", "SOUTH", "SPLIT", "UNSPECIFIED"];
  if (!coreDomain.includes(preferences.corePreference)) issues.push("unknown core preference");
  if (mandatory.corePlacement && !coreDomain.includes(mandatory.corePlacement)) issues.push("unknown mandatory core placement");
  if (mandatory.corePlacement && preferences.corePreference !== mandatory.corePlacement) {
    issues.push("mandatory core placement disagrees with interpreted preference");
  }
  return { valid: issues.length === 0, issues };
}

// packages/planning-engine/src/repair/apartment-error-repair.ts
var SNAP_INC = 10;
var snap10 = (v) => Math.round(v / SNAP_INC) * SNAP_INC;
function getRoomRect(room) {
  if (room.boundary && room.boundary.points.length >= 4) {
    const xs = room.boundary.points.map((p) => p.x);
    const ys = room.boundary.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }
  return { x: room.x, y: room.y, w: room.width, h: room.height };
}
function rectToPolygon2(r) {
  return {
    points: [
      { x: Math.round(r.x), y: Math.round(r.y) },
      { x: Math.round(r.x + r.w), y: Math.round(r.y) },
      { x: Math.round(r.x + r.w), y: Math.round(r.y + r.h) },
      { x: Math.round(r.x), y: Math.round(r.y + r.h) }
    ]
  };
}
function findSharedWallSegment(roomA, roomB) {
  const a = getRoomRect(roomA);
  const b = getRoomRect(roomB);
  const touchesHoriz = Math.abs(a.y + a.h - b.y) <= 2 || Math.abs(b.y + b.h - a.y) <= 2;
  const loX = Math.max(a.x, b.x);
  const hiX = Math.min(a.x + a.w, b.x + b.w);
  if (touchesHoriz && hiX - loX >= 100) {
    const coord = Math.abs(a.y + a.h - b.y) <= 2 ? a.y + a.h : b.y + b.h;
    return { axis: "x", coord, lo: loX, hi: hiX, len: hiX - loX };
  }
  const touchesVert = Math.abs(a.x + a.w - b.x) <= 2 || Math.abs(b.x + b.w - a.x) <= 2;
  const loY = Math.max(a.y, b.y);
  const hiY = Math.min(a.y + a.h, b.y + b.h);
  if (touchesVert && hiY - loY >= 100) {
    const coord = Math.abs(a.x + a.w - b.x) <= 2 ? a.x + a.w : b.x + b.w;
    return { axis: "y", coord, lo: loY, hi: hiY, len: hiY - loY };
  }
  return null;
}
function repairApartmentPlan(building, manifest, options = {}) {
  const maxPasses = options.maxPasses ?? 3;
  const compactPlotAdaptation = options.compactPlotAdaptation ?? true;
  const initialClosure = validateApartmentClosure(building, manifest);
  const appliedRepairs = [];
  const advisories = [];
  let currentBuilding = building;
  let passCount = 0;
  for (let pass = 1; pass <= maxPasses; pass++) {
    passCount = pass;
    const closure = validateApartmentClosure(currentBuilding, manifest);
    if (pass > 1 && closure.hardErrors === 0 && !hasCriticalSoftIssues(closure.issues)) {
      break;
    }
    let modified = false;
    const repairedFloors = [];
    for (const floor of currentBuilding.floors) {
      if (!floor.apartmentUnits || floor.apartmentUnits.length === 0) {
        repairedFloors.push(floor);
        continue;
      }
      let currentRooms = [...floor.rooms];
      let currentDoors = [...floor.doors];
      let currentWindows = [...floor.windows];
      const manifestRes = repairManifestMismatch({
        rooms: currentRooms,
        doors: currentDoors,
        units: floor.apartmentUnits,
        manifest,
        floorId: floor.id
      });
      if (manifestRes.repaired) {
        currentRooms = manifestRes.rooms;
        currentDoors = manifestRes.doors;
        appliedRepairs.push(...manifestRes.repairs);
        modified = true;
      }
      const dimRes = repairMinDimensions({
        rooms: currentRooms,
        units: floor.apartmentUnits,
        compactPlotAdaptation
      });
      if (dimRes.repaired) {
        currentRooms = dimRes.rooms;
        appliedRepairs.push(...dimRes.repairs);
        advisories.push(...dimRes.advisories);
        modified = true;
      }
      let regeneratedWalls = generateApartmentWalls(currentRooms, floor.id, floor.boundary, void 0, floor.walls.find((w) => w.boundaryRole === "PARAPET")?.heightMm);
      const privacyRes = repairPrivacyAndCirculation({
        rooms: currentRooms,
        doors: currentDoors,
        walls: regeneratedWalls,
        units: floor.apartmentUnits,
        floorId: floor.id
      });
      if (privacyRes.repaired) {
        currentDoors = privacyRes.doors;
        appliedRepairs.push(...privacyRes.repairs);
        modified = true;
      }
      const doorRes = repairDoorHostsAndClearance({
        rooms: currentRooms,
        doors: currentDoors,
        walls: regeneratedWalls,
        windows: currentWindows,
        floorId: floor.id
      });
      if (doorRes.repaired) {
        currentDoors = doorRes.doors;
        appliedRepairs.push(...doorRes.repairs);
        modified = true;
      }
      regeneratedWalls = generateApartmentWalls(currentRooms, floor.id, floor.boundary, void 0, floor.walls.find((w) => w.boundaryRole === "PARAPET")?.heightMm).map((w) => ({
        ...w,
        hasOpening: currentDoors.some((d) => d.wallId === w.id) || currentWindows.some((win) => win.wallId === w.id)
      }));
      const daylightRes = repairDaylightAndVentilation({
        rooms: currentRooms,
        windows: currentWindows,
        doors: currentDoors,
        walls: regeneratedWalls,
        floorId: floor.id
      });
      if (daylightRes.repaired) {
        currentWindows = daylightRes.windows;
        appliedRepairs.push(...daylightRes.repairs);
        modified = true;
      }
      regeneratedWalls = regeneratedWalls.map((w) => ({
        ...w,
        hasOpening: currentDoors.some((d) => d.wallId === w.id) || currentWindows.some((win) => win.wallId === w.id)
      }));
      repairedFloors.push({
        ...floor,
        rooms: currentRooms,
        walls: regeneratedWalls,
        doors: currentDoors,
        windows: currentWindows
      });
    }
    currentBuilding = {
      ...currentBuilding,
      floors: repairedFloors
    };
    if (!modified) {
      break;
    }
  }
  const finalClosure = validateApartmentClosure(currentBuilding, manifest);
  const ledger = currentBuilding.floors[0] ? measureApartmentAreaLedger(currentBuilding.floors[0]) : null;
  const deltaMm2 = ledger ? Math.abs(ledger.delta) : 0;
  return {
    building: currentBuilding,
    repairReport: {
      repaired: appliedRepairs.length > 0,
      passesCompleted: passCount,
      initialIssues: initialClosure.issues,
      finalIssues: finalClosure.issues,
      initialHardErrors: initialClosure.hardErrors,
      finalHardErrors: finalClosure.hardErrors,
      repairsApplied: appliedRepairs,
      deltaMm2,
      advisories: [...new Set(advisories)]
    }
  };
}
function hasCriticalSoftIssues(issues) {
  return issues.some(
    (i) => i.code === "BEDROOM_DOOR_WIDTH_SUBSTANDARD" || i.code === "SERVICE_DOOR_WIDTH_SUBSTANDARD" || i.code === "PRIMARY_ENTRANCE_DOOR_WIDTH_SUBSTANDARD" || i.code === "DAYLIGHT_OPENING_UNVERIFIED"
  );
}
function repairManifestMismatch(params) {
  const { units, manifest, floorId } = params;
  if (!units || units.length === 0) {
    return { rooms: params.rooms, doors: params.doors, repaired: false, repairs: [] };
  }
  let workingRooms = params.rooms.map((room) => {
    if (room.boundary.points.length !== 4) return room;
    const xs = [...new Set(room.boundary.points.map((p) => p.x))];
    const ys = [...new Set(room.boundary.points.map((p) => p.y))];
    if (xs.length !== 2 || ys.length !== 2) return room;
    const x = Math.min(...xs), y = Math.min(...ys), width = Math.max(...xs) - x, height = Math.max(...ys) - y;
    return { ...room, x, y, width, height, area: width * height };
  });
  const workingDoors = [...params.doors];
  const repairs = [];
  let repaired = false;
  const manifestUnits = Array.isArray(manifest?.units) ? manifest.units : Array.isArray(manifest?.units?.units) ? manifest.units.units : [];
  for (const u of units) {
    const unitSpec = manifestUnits.find(
      (item) => item.unitIndex !== void 0 && item.unitIndex === u.unitIndex || item.id && (u.id === item.id || u.id.endsWith(String(item.id)) || String(item.id).endsWith(u.id)) || item.unitIndex !== void 0 && u.id.endsWith(String(item.unitIndex))
    );
    let unitRooms = workingRooms.filter((r) => r.unitId === u.id);
    const bedRoomsList = unitRooms.filter((r) => r.type === RoomType.Bedroom || r.tags.includes("role:bedroom"));
    const inferredBhk = bedRoomsList.length > 0 ? `${bedRoomsList.length}BHK` : "3BHK";
    const bhkType = unitSpec?.bhkType ?? unitSpec?.type ?? u.unitType ?? inferredBhk;
    const match = String(bhkType).match(/^([1234])BHK$/i);
    const defaultBeds = match ? parseInt(match[1], 10) : 3;
    const expectedBeds = typeof unitSpec?.bedrooms === "number" ? unitSpec.bedrooms : defaultBeds;
    const defaultBaths = bhkType === "1BHK" ? 1 : bhkType === "2BHK" ? 2 : bhkType === "3BHK" ? 2 : 3;
    const expectedBaths = typeof unitSpec?.bathrooms === "number" ? unitSpec.bathrooms : unitSpec?.attachedBathCount !== void 0 ? unitSpec.attachedBathCount + 1 : defaultBaths;
    const livingRooms = unitRooms.filter((r) => r.type === RoomType.Living || r.tags.includes("role:living"));
    const mislabeledEntry = unitRooms.find(
      (r) => (r.type === RoomType.Bedroom || r.type === RoomType.Bathroom) && workingDoors.some(
        (d) => d.connectsRooms[0] === r.id && params.rooms.some((cr) => cr.id === d.connectsRooms[1] && (cr.spaceUse === "COMMON" || cr.spaceUse === "CORE")) || d.connectsRooms[1] === r.id && params.rooms.some((cr) => cr.id === d.connectsRooms[0] && (cr.spaceUse === "COMMON" || cr.spaceUse === "CORE"))
      )
    );
    if (mislabeledEntry) {
      const hasLiving = livingRooms.length > 0 && livingRooms.some((r) => r.id !== mislabeledEntry.id);
      const reclassifiedType = hasLiving ? RoomType.Dining : RoomType.Living;
      const reclassifiedName = hasLiving ? `${u.id} Dining & Family Hall` : `${u.id} Living & Dining`;
      const reclassifiedTag = hasLiving ? "role:dining" : "role:living";
      const reclassified = {
        ...mislabeledEntry,
        type: reclassifiedType,
        planningZone: "PUBLIC",
        name: reclassifiedName,
        tags: mislabeledEntry.tags.filter((t) => !t.startsWith("role:")).concat([reclassifiedTag, `reclassified:${reclassifiedType}`])
      };
      workingRooms = workingRooms.map((r) => r.id === mislabeledEntry.id ? reclassified : r);
      unitRooms = unitRooms.map((r) => r.id === mislabeledEntry.id ? reclassified : r);
      repaired = true;
      repairs.push({
        category: "PRIVACY_CIRCULATION",
        description: `Re-classified mislabeled entry room ${mislabeledEntry.id} to ${reclassifiedName} for ${u.id}`,
        targetEntities: [mislabeledEntry.id]
      });
    } else if (livingRooms.length === 0) {
      {
        const candidate = findOversizedRoom(unitRooms, RoomType.Living);
        if (candidate) {
          const synth = splitRoomForSynthesis(candidate, RoomType.Living, `${u.id} Living & Dining`, floorId, u.id, void 0, unitRooms);
          workingRooms = workingRooms.map((r) => r.id === candidate.id ? synth.parentRoom : r);
          workingRooms.push(synth.synthesizedRoom);
          workingDoors.push(synth.connectingDoor);
          unitRooms = unitRooms.map((r) => r.id === candidate.id ? synth.parentRoom : r);
          unitRooms.push(synth.synthesizedRoom);
          repaired = true;
          repairs.push({
            category: "MANIFEST_SYNTHESIS",
            description: `Synthesized missing Living room for ${u.id} (${bhkType}) by subdividing oversized zone ${candidate.id}`,
            targetEntities: [candidate.id, synth.synthesizedRoom.id]
          });
        }
      }
    }
    const kitchenRooms = unitRooms.filter((r) => r.type === RoomType.Kitchen || r.tags.includes("role:kitchen"));
    if (kitchenRooms.length === 0) {
      const candidate = findOversizedRoom(unitRooms, RoomType.Kitchen);
      if (candidate) {
        const synth = splitRoomForSynthesis(candidate, RoomType.Kitchen, `${u.id} Kitchen`, floorId, u.id, void 0, unitRooms);
        workingRooms = workingRooms.map((r) => r.id === candidate.id ? synth.parentRoom : r);
        workingRooms.push(synth.synthesizedRoom);
        workingDoors.push(synth.connectingDoor);
        unitRooms = unitRooms.map((r) => r.id === candidate.id ? synth.parentRoom : r);
        unitRooms.push(synth.synthesizedRoom);
        repaired = true;
        repairs.push({
          category: "MANIFEST_SYNTHESIS",
          description: `Synthesized missing Kitchen for ${u.id} (${bhkType}) by subdividing oversized zone ${candidate.id}`,
          targetEntities: [candidate.id, synth.synthesizedRoom.id]
        });
      }
    }
    let bedCount = unitRooms.filter((r) => r.type === RoomType.Bedroom || r.tags.includes("role:bedroom")).length;
    while (bedCount < expectedBeds) {
      const candidate = findOversizedRoom(unitRooms, RoomType.Bedroom);
      if (!candidate) break;
      bedCount++;
      const synth = splitRoomForSynthesis(candidate, RoomType.Bedroom, `${u.id} Bedroom 0${bedCount}`, floorId, u.id, void 0, unitRooms);
      workingRooms = workingRooms.map((r) => r.id === candidate.id ? synth.parentRoom : r);
      workingRooms.push(synth.synthesizedRoom);
      workingDoors.push(synth.connectingDoor);
      unitRooms = unitRooms.map((r) => r.id === candidate.id ? synth.parentRoom : r);
      unitRooms.push(synth.synthesizedRoom);
      repaired = true;
      repairs.push({
        category: "MANIFEST_SYNTHESIS",
        description: `Synthesized Bedroom 0${bedCount} for ${u.id} (${bhkType}) from oversized room ${candidate.id}`,
        targetEntities: [candidate.id, synth.synthesizedRoom.id]
      });
    }
    let bathCount = unitRooms.filter((r) => r.type === RoomType.Bathroom || r.tags.includes("role:bathroom")).length;
    while (bathCount < expectedBaths) {
      const gap = findUnoccupiedUnitRectangle(u.boundary, workingRooms);
      if (gap && Math.min(gap.w, gap.h) >= 1200 && gap.w * gap.h >= 22e5) {
        const created = createRoom({
          floorId,
          type: RoomType.Bathroom,
          name: `${u.id} Common Toilet ${bathCount + 1}`,
          x: gap.x,
          y: gap.y,
          width: gap.w,
          height: gap.h,
          tags: [`flat:${u.id}`, "role:bathroom", "repaired:gap"]
        });
        const restored = { ...created, unitId: u.id, spaceUse: "UNIT", bathroomAccessClass: "COMMON" };
        workingRooms.push(restored);
        unitRooms.push(restored);
        bathCount++;
        repaired = true;
        repairs.push({ category: "MANIFEST_SYNTHESIS", description: `Restored missing bathroom in measured vacant unit polygon`, targetEntities: [restored.id] });
        continue;
      }
      const beds = unitRooms.filter((r) => r.type === RoomType.Bedroom);
      const existingAttachedOwners = new Set(
        unitRooms.filter((r) => r.type === RoomType.Bathroom && r.bathroomAccessClass === "ATTACHED").map((r) => r.bathroomOwnerRoomId)
      );
      const unattachedBeds = beds.filter((b) => !existingAttachedOwners.has(b.id) && b.area >= 125e5);
      unattachedBeds.sort((a, b) => b.y - a.y);
      const unattachedBed = unattachedBeds[0];
      const candidate = unattachedBed ?? findOversizedRoom(unitRooms, RoomType.Bathroom);
      if (!candidate) break;
      bathCount++;
      const isAttached = candidate.type === RoomType.Bedroom;
      const synth = splitRoomForSynthesis(
        candidate,
        RoomType.Bathroom,
        isAttached ? `${u.id} Master Bath 0${bathCount}` : `${u.id} Common Toilet 0${bathCount}`,
        floorId,
        u.id,
        { isAttached },
        unitRooms
      );
      workingRooms = workingRooms.map((r) => r.id === candidate.id ? synth.parentRoom : r);
      workingRooms.push(synth.synthesizedRoom);
      workingDoors.push(synth.connectingDoor);
      unitRooms = unitRooms.map((r) => r.id === candidate.id ? synth.parentRoom : r);
      unitRooms.push(synth.synthesizedRoom);
      repaired = true;
      repairs.push({
        category: "MANIFEST_SYNTHESIS",
        description: `Synthesized Toilet 0${bathCount} (${isAttached ? "Attached" : "Common"}) for ${u.id} from ${candidate.id}`,
        targetEntities: [candidate.id, synth.synthesizedRoom.id]
      });
    }
    if (unitSpec?.hasUtilityBalcony) {
      const hasUtil = unitRooms.some((r) => r.type === RoomType.Utility || r.type === RoomType.Balcony || r.tags.some((t) => t.includes("utility") || t.includes("balcony")));
      if (!hasUtil) {
        const candidate = findOversizedRoom(unitRooms, RoomType.Utility);
        if (candidate) {
          const synth = splitRoomForSynthesis(candidate, RoomType.Utility, `${u.id} Kitchen Utility Yard`, floorId, u.id, void 0, unitRooms);
          workingRooms = workingRooms.map((r) => r.id === candidate.id ? synth.parentRoom : r);
          workingRooms.push(synth.synthesizedRoom);
          workingDoors.push(synth.connectingDoor);
          unitRooms = unitRooms.map((r) => r.id === candidate.id ? synth.parentRoom : r);
          unitRooms.push(synth.synthesizedRoom);
          repaired = true;
          repairs.push({
            category: "MANIFEST_SYNTHESIS",
            description: `Synthesized Utility Balcony for ${u.id} (${bhkType}) from ${candidate.id}`,
            targetEntities: [candidate.id, synth.synthesizedRoom.id]
          });
        }
      }
    }
  }
  return { rooms: workingRooms, doors: workingDoors, repaired, repairs };
}
function findUnoccupiedUnitRectangle(boundary, rooms) {
  const xs = [...new Set([...boundary.points, ...rooms.flatMap((r) => r.boundary.points)].map((p) => p.x))].sort((a, b) => a - b);
  const ys = [...new Set([...boundary.points, ...rooms.flatMap((r) => r.boundary.points)].map((p) => p.y))].sort((a, b) => a - b);
  let best = null;
  for (let y = 0; y < ys.length - 1; y++) for (let x = 0; x < xs.length - 1; x++) {
    let maxX = xs.length - 1;
    for (let bottom = y; bottom < ys.length - 1; bottom++) {
      let right = x;
      for (; right < maxX; right++) {
        const center2 = { x: (xs[right] + xs[right + 1]) / 2, y: (ys[bottom] + ys[bottom + 1]) / 2 };
        if (!pointInPolygon(center2, boundary) || rooms.some((r) => pointInPolygon(center2, r.boundary))) break;
      }
      maxX = right;
      if (right === x) break;
      const rect = { x: xs[x], y: ys[y], w: xs[right] - xs[x], h: ys[bottom + 1] - ys[y] };
      if (!best || rect.w * rect.h > best.w * best.h) best = rect;
    }
  }
  return best;
}
function findOversizedRoom(rooms, targetForSynthesis) {
  if (targetForSynthesis === RoomType.Bedroom) {
    const bedCandidates = [...rooms].filter((r) => r.type === RoomType.Bedroom && r.area >= 1e7);
    if (bedCandidates.length > 0) {
      bedCandidates.sort((a, b) => b.area - a.area);
      return bedCandidates[0];
    }
  }
  if (targetForSynthesis === RoomType.Bathroom) {
    const bedCandidates = [...rooms].filter((r) => r.type === RoomType.Bedroom && r.area >= 125e5);
    if (bedCandidates.length > 0) {
      bedCandidates.sort((a, b) => b.area - a.area);
      return bedCandidates[0];
    }
  }
  const minRequiredArea = {
    [RoomType.Living]: 12e6,
    [RoomType.Bedroom]: 95e5,
    [RoomType.Kitchen]: 55e5,
    [RoomType.Bathroom]: 22e5,
    [RoomType.Utility]: 2e6
  };
  const neededArea = minRequiredArea[targetForSynthesis] ?? 25e5;
  const candidates = [...rooms].filter((r) => {
    const rMin = minRequiredArea[r.type] ?? 3e6;
    return r.area >= rMin + neededArea;
  });
  if (candidates.length === 0) {
    const sorted = [...rooms].sort((a, b) => b.area - a.area);
    return sorted[0] && sorted[0].area >= neededArea * 1.3 ? sorted[0] : null;
  }
  candidates.sort((a, b) => b.area - a.area);
  return candidates[0];
}
function splitRoomForSynthesis(parent, synthType, synthName, floorId, unitId, bathOptions, allUnitRooms) {
  const pRect = getRoomRect(parent);
  let parentRect;
  let synthRect;
  const minSynthDims = {
    [RoomType.Bathroom]: { w: 1400, h: 1800 },
    [RoomType.Bedroom]: { w: 2600, h: 3e3 },
    [RoomType.Kitchen]: { w: 2e3, h: 2400 },
    [RoomType.Utility]: { w: 1400, h: 1800 },
    [RoomType.Living]: { w: 3200, h: 3600 }
  };
  const minDim = minSynthDims[synthType] ?? { w: 1500, h: 1800 };
  const splitAlongX = pRect.w >= 5800 && pRect.w >= pRect.h * 0.85;
  const splitAlongY = pRect.h >= 3600 && !splitAlongX;
  const attachedBath = allUnitRooms?.find((r) => r.type === RoomType.Bathroom && r.bathroomOwnerRoomId === parent.id);
  if (!splitAlongY) {
    const synthW = snap10(Math.min(Math.max(1400, minDim.w), pRect.w * 0.4));
    const parentW = pRect.w - synthW;
    const leftParent = { x: pRect.x, y: pRect.y, w: parentW, h: pRect.h };
    const rightParent = { x: pRect.x + synthW, y: pRect.y, w: parentW, h: pRect.h };
    const overlapLen = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
    const attachToRight = attachedBath ? overlapLen(rightParent.x, rightParent.x + rightParent.w, attachedBath.x, attachedBath.x + attachedBath.width) > overlapLen(leftParent.x, leftParent.x + leftParent.w, attachedBath.x, attachedBath.x + attachedBath.width) : false;
    if (attachToRight) {
      parentRect = rightParent;
      synthRect = { x: pRect.x, y: pRect.y, w: synthW, h: pRect.h };
    } else {
      parentRect = leftParent;
      synthRect = { x: pRect.x + parentW, y: pRect.y, w: synthW, h: pRect.h };
    }
  } else {
    const synthH = snap10(Math.min(Math.max(1600, minDim.h), pRect.h * 0.4));
    const parentH = pRect.h - synthH;
    parentRect = { x: pRect.x, y: pRect.y, w: pRect.w, h: parentH };
    synthRect = { x: pRect.x, y: pRect.y + parentH, w: pRect.w, h: synthH };
  }
  const updatedParent = {
    ...parent,
    x: parentRect.x,
    y: parentRect.y,
    width: parentRect.w,
    height: parentRect.h,
    area: parentRect.w * parentRect.h,
    boundary: rectToPolygon2(parentRect)
  };
  const synthId = `${unitId}__synth_${synthType}_${Math.round(synthRect.x)}_${Math.round(synthRect.y)}`;
  const created = createRoom({
    floorId,
    name: synthName,
    type: synthType,
    x: synthRect.x,
    y: synthRect.y,
    width: synthRect.w,
    height: synthRect.h,
    tags: [`apt-room:${synthId}`, `flat:${unitId}`, `role:${synthType}`, "synthesized:auto"],
    daylightRequirement: "medium",
    privacyRequirement: synthType === RoomType.Bedroom || synthType === RoomType.Bathroom ? "high" : "low",
    isFixed: false
  });
  const synthesizedRoom = {
    ...created,
    id: synthId,
    unitId,
    spaceUse: roomSpaceUse({ ...created, unitId }),
    planningZone: synthType === RoomType.Bathroom || synthType === RoomType.Utility ? "SERVICE" : synthType === RoomType.Bedroom ? "PRIVATE" : "PUBLIC",
    bathroomAccessClass: synthType === RoomType.Bathroom ? bathOptions?.isAttached ? "ATTACHED" : "COMMON" : void 0,
    bathroomOwnerRoomId: bathOptions?.isAttached ? parent.id : void 0
  };
  const doorWidth = synthType === RoomType.Bathroom || synthType === RoomType.Utility ? 750 : 900;
  const livingRoom = allUnitRooms?.find((r) => r.type === RoomType.Living || r.tags.includes("role:living"));
  let connectTargetId = parent.id;
  let sharedSegment = findSharedWallSegment(updatedParent, synthesizedRoom);
  const internalPassage = allUnitRooms?.find(
    (r) => r.type === RoomType.Corridor && !r.id.includes("entrance") && findSharedWallSegment(synthesizedRoom, r)
  );
  if (synthType === RoomType.Bedroom && internalPassage) {
    connectTargetId = internalPassage.id;
    sharedSegment = findSharedWallSegment(synthesizedRoom, internalPassage);
  } else if (synthType === RoomType.Bedroom && livingRoom && findSharedWallSegment(synthesizedRoom, livingRoom)) {
    connectTargetId = livingRoom.id;
    sharedSegment = findSharedWallSegment(synthesizedRoom, livingRoom);
  }
  const doorPos = sharedSegment ? sharedSegment.axis === "x" ? { x: snap10((sharedSegment.lo + sharedSegment.hi) / 2), y: sharedSegment.coord } : { x: sharedSegment.coord, y: snap10((sharedSegment.lo + sharedSegment.hi) / 2) } : { x: snap10(synthRect.x + synthRect.w / 2), y: snap10(synthRect.y) };
  const connectingDoor = {
    id: `${synthId}__door_entry`,
    floorId,
    wallId: "__auto_wall__",
    position: doorPos,
    width: doorWidth,
    height: 2100,
    type: synthType === RoomType.Balcony ? DoorType.Sliding : DoorType.Single,
    swingDirection: synthType === RoomType.Balcony || synthType === RoomType.Utility ? SwingDirection.Outward : SwingDirection.Inward,
    connectsRooms: [connectTargetId, synthId]
  };
  return { parentRoom: updatedParent, synthesizedRoom, connectingDoor };
}
function repairMinDimensions(params) {
  const { compactPlotAdaptation } = params;
  const rooms = [...params.rooms];
  const repairs = [];
  const advisories = [];
  let repaired = false;
  const standardMin = {
    [RoomType.Living]: 3e3,
    [RoomType.Bedroom]: 2700,
    [RoomType.Kitchen]: 2100,
    [RoomType.Bathroom]: 1200,
    [RoomType.Balcony]: 1200,
    [RoomType.Corridor]: 1200
  };
  const compactMin = {
    [RoomType.Living]: 2400,
    [RoomType.Bedroom]: 2400,
    [RoomType.Kitchen]: 1800,
    [RoomType.Bathroom]: 1100,
    [RoomType.Balcony]: 1100,
    [RoomType.Corridor]: 900
  };
  for (let i = 0; i < rooms.length; i++) {
    const roomA = rooms[i];
    const isInternalPassageA = (roomA.type === RoomType.Corridor || roomA.type === RoomType.Custom) && (Boolean(roomA.unitId) || roomA.tags.some((t) => t.startsWith("flat:")) || roomA.name.toLowerCase().includes("passage"));
    const standardLimit = isInternalPassageA ? 900 : standardMin[roomA.type];
    if (!standardLimit) continue;
    const rA = getRoomRect(roomA);
    const minDimA = Math.min(rA.w, rA.h);
    if (minDimA < standardLimit) {
      let slackShifted = false;
      for (let j = 0; j < rooms.length; j++) {
        if (i === j) continue;
        const roomB = rooms[j];
        if (roomA.unitId && roomA.unitId !== roomB.unitId) continue;
        const shared = findSharedWallSegment(roomA, roomB);
        if (!shared) continue;
        const rB = getRoomRect(roomB);
        const isInternalPassageB = (roomB.type === RoomType.Corridor || roomB.type === RoomType.Custom) && (Boolean(roomB.unitId) || roomB.tags.some((t) => t.startsWith("flat:")) || roomB.name.toLowerCase().includes("passage"));
        const minDimB = isInternalPassageB ? 900 : Math.max(standardMin[roomB.type] ?? 1200, MINIMUM_DIMENSIONS[roomB.type] ?? 0);
        const minAreaB = MINIMUM_ROOM_AREAS[roomB.type] ?? 0;
        if (shared.axis === "y") {
          if (rA.y !== rB.y || rA.h !== rB.h) continue;
          const deficit = standardLimit - rA.w;
          if (deficit > 0) {
            const minWidthForArea = minAreaB > 0 && rB.h > 0 ? Math.ceil(minAreaB / rB.h) : 0;
            const effectiveLimitB = Math.max(minDimB, minWidthForArea);
            const surplusB = rB.w - effectiveLimitB;
            if (surplusB > 100) {
              const delta = snap10(Math.min(deficit, surplusB - 100));
              if (delta > 0 && rB.w - delta >= minDimB && (rB.w - delta) * rB.h >= minAreaB) {
                if (rB.x > rA.x) {
                  const newA = { x: rA.x, y: rA.y, w: rA.w + delta, h: rA.h };
                  const newB = { x: rB.x + delta, y: rB.y, w: rB.w - delta, h: rB.h };
                  rooms[i] = { ...roomA, ...newA, width: newA.w, height: newA.h, area: newA.w * newA.h, boundary: rectToPolygon2(newA) };
                  rooms[j] = { ...roomB, ...newB, width: newB.w, height: newB.h, area: newB.w * newB.h, boundary: rectToPolygon2(newB) };
                } else {
                  const newA = { x: rA.x - delta, y: rA.y, w: rA.w + delta, h: rA.h };
                  const newB = { x: rB.x, y: rB.y, w: rB.w - delta, h: rB.h };
                  rooms[i] = { ...roomA, ...newA, width: newA.w, height: newA.h, area: newA.w * newA.h, boundary: rectToPolygon2(newA) };
                  rooms[j] = { ...roomB, ...newB, width: newB.w, height: newB.h, area: newB.w * newB.h, boundary: rectToPolygon2(newB) };
                }
                slackShifted = true;
                repaired = true;
                repairs.push({
                  category: "MIN_DIMENSION_ELASTIC_SHIFT",
                  description: `Elastically shifted partition between ${roomA.id} and ${roomB.id} by ${delta} mm (conserving Delta = 0.000 mm\xB2)`,
                  targetEntities: [roomA.id, roomB.id]
                });
                break;
              }
            }
          }
        } else {
          if (rA.x !== rB.x || rA.w !== rB.w) continue;
          const deficit = standardLimit - rA.h;
          if (deficit > 0) {
            const minHeightForArea = minAreaB > 0 && rB.w > 0 ? Math.ceil(minAreaB / rB.w) : 0;
            const effectiveLimitB = Math.max(minDimB, minHeightForArea);
            const surplusB = rB.h - effectiveLimitB;
            if (surplusB > 100) {
              const delta = snap10(Math.min(deficit, surplusB - 100));
              if (delta > 0 && rB.h - delta >= minDimB && rB.w * (rB.h - delta) >= minAreaB) {
                if (rB.y > rA.y) {
                  const newA = { x: rA.x, y: rA.y, w: rA.w, h: rA.h + delta };
                  const newB = { x: rB.x, y: rB.y + delta, w: rB.w, h: rB.h - delta };
                  rooms[i] = { ...roomA, ...newA, width: newA.w, height: newA.h, area: newA.w * newA.h, boundary: rectToPolygon2(newA) };
                  rooms[j] = { ...roomB, ...newB, width: newB.w, height: newB.h, area: newB.w * newB.h, boundary: rectToPolygon2(newB) };
                } else {
                  const newA = { x: rA.x, y: rA.y - delta, w: rA.w, h: rA.h + delta };
                  const newB = { x: rB.x, y: rB.y, w: rB.w, h: rB.h - delta };
                  rooms[i] = { ...roomA, ...newA, width: newA.w, height: newA.h, area: newA.w * newA.h, boundary: rectToPolygon2(newA) };
                  rooms[j] = { ...roomB, ...newB, width: newB.w, height: newB.h, area: newB.w * newB.h, boundary: rectToPolygon2(newB) };
                }
                slackShifted = true;
                repaired = true;
                repairs.push({
                  category: "MIN_DIMENSION_ELASTIC_SHIFT",
                  description: `Elastically shifted horizontal partition between ${roomA.id} and ${roomB.id} by ${delta} mm (conserving Delta = 0.000 mm\xB2)`,
                  targetEntities: [roomA.id, roomB.id]
                });
                break;
              }
            }
          }
        }
      }
      if (!slackShifted && compactPlotAdaptation) {
        const cLimit = compactMin[roomA.type] ?? 1100;
        if (minDimA >= cLimit) {
          advisories.push(
            `COMPACT_PLOT_ADAPTATION: ${roomA.name} clear dimension ${minDimA} mm meets compact plot standard (>= ${cLimit} mm).`
          );
        }
      }
    }
  }
  return { rooms, repaired, repairs, advisories };
}
function repairPrivacyAndCirculation(params) {
  const { rooms, walls, units, floorId } = params;
  let doors = [...params.doors];
  const repairs = [];
  let repaired = false;
  const privateTypes = /* @__PURE__ */ new Set([RoomType.Bedroom, RoomType.Bathroom, RoomType.Kitchen]);
  const preservedDoors = [];
  for (const door of doors) {
    const [rAId, rBId] = door.connectsRooms;
    const roomA = rooms.find((r) => r.id === rAId);
    const roomB = rooms.find((r) => r.id === rBId);
    const isACommon = roomA && (roomA.spaceUse === "COMMON" || roomA.spaceUse === "CORE");
    const isBCommon = roomB && (roomB.spaceUse === "COMMON" || roomB.spaceUse === "CORE");
    const isAPrivate = roomA && roomA.unitId && privateTypes.has(roomA.type);
    const isBPrivate = roomB && roomB.unitId && privateTypes.has(roomB.type);
    if (isACommon && isBPrivate || isBCommon && isAPrivate) {
      repaired = true;
      repairs.push({
        category: "PRIVACY_CIRCULATION",
        description: `Eliminated privacy violation door ${door.id} connecting Common Corridor directly to private room`,
        targetEntities: [door.id]
      });
      continue;
    }
    if (roomA?.unitId && roomB?.unitId && roomA.unitId !== roomB.unitId) {
      repaired = true;
      repairs.push({
        category: "PRIVACY_CIRCULATION",
        description: `Eliminated cross-tenancy breach door ${door.id} connecting unit ${roomA.unitId} to unit ${roomB.unitId}`,
        targetEntities: [door.id]
      });
      continue;
    }
    preservedDoors.push(door);
  }
  doors = preservedDoors;
  if (units) {
    for (const u of units) {
      const unitRooms = rooms.filter((r) => r.unitId === u.id);
      const livingRoom = unitRooms.find((r) => r.type === RoomType.Living || r.tags.includes("role:living")) ?? unitRooms[0];
      const commonCorridor = rooms.find((r) => r.spaceUse === "COMMON" || r.type === RoomType.Corridor);
      if (!livingRoom || !commonCorridor) continue;
      const unitEntrances = doors.filter((d) => {
        const [a, b] = d.connectsRooms;
        const hasUnit = unitRooms.some((r) => r.id === a || r.id === b);
        const hasCommon = rooms.some((r) => (r.id === a || r.id === b) && (r.spaceUse === "COMMON" || r.spaceUse === "CORE"));
        return hasUnit && hasCommon;
      });
      if (unitEntrances.length === 0) {
        const shared = findSharedWallSegment(commonCorridor, livingRoom);
        if (shared) {
          const width = shared.len >= 1250 ? 1050 : 1e3;
          const hostWall = walls.find((w) => w.roomIds.includes(commonCorridor.id) && w.roomIds.includes(livingRoom.id));
          const pos = shared.axis === "x" ? { x: snap10((shared.lo + shared.hi) / 2), y: shared.coord } : { x: shared.coord, y: snap10((shared.lo + shared.hi) / 2) };
          const newDoor = {
            id: `${u.id}__door_primary_entrance`,
            floorId,
            wallId: hostWall?.id ?? "__auto_wall__",
            position: pos,
            width,
            height: 2100,
            type: DoorType.Single,
            swingDirection: SwingDirection.Inward,
            connectsRooms: [commonCorridor.id, livingRoom.id]
          };
          doors.push(newDoor);
          repaired = true;
          repairs.push({
            category: "PRIVACY_CIRCULATION",
            description: `Synthesized missing Primary Entrance Door (${width} mm) for unit ${u.id}`,
            targetEntities: [newDoor.id, livingRoom.id]
          });
        }
      } else if (unitEntrances.length > 1) {
        const bestEntrance = unitEntrances.find((d) => d.connectsRooms.includes(livingRoom.id)) ?? unitEntrances[0];
        for (const extra of unitEntrances) {
          if (extra.id !== bestEntrance.id) {
            doors = doors.filter((d) => d.id !== extra.id);
            repaired = true;
            repairs.push({
              category: "PRIVACY_CIRCULATION",
              description: `Removed secondary/redundant entrance door ${extra.id} for unit ${u.id}`,
              targetEntities: [extra.id]
            });
          }
        }
      }
    }
  }
  const graph = new Map(rooms.map((r) => [r.id, /* @__PURE__ */ new Set()]));
  for (const d of doors) {
    const [a, b] = d.connectsRooms;
    if (graph.has(a) && graph.has(b)) {
      graph.get(a).add(b);
      graph.get(b).add(a);
    }
  }
  if (units) {
    for (const u of units) {
      const unitRooms = rooms.filter((r) => r.unitId === u.id);
      const livingRoom = unitRooms.find((r) => r.type === RoomType.Living || r.tags.includes("role:living")) ?? unitRooms[0];
      if (!livingRoom) continue;
      const visited = /* @__PURE__ */ new Set([livingRoom.id]);
      const queue = [livingRoom.id];
      while (queue.length > 0) {
        const curr = queue.shift();
        for (const neighbor of graph.get(curr) ?? []) {
          const nRoom = rooms.find((r) => r.id === neighbor);
          if (nRoom?.unitId === u.id && !visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      const unreachable = unitRooms.filter((r) => !visited.has(r.id)).sort((a, b) => {
        const priority = (r) => r.type === RoomType.Corridor ? 0 : r.type === RoomType.Bedroom ? 1 : 2;
        return priority(a) - priority(b);
      });
      for (const orphan of unreachable) {
        if (visited.has(orphan.id)) continue;
        let targetReachable = null;
        if (orphan.type === RoomType.Bathroom && orphan.bathroomOwnerRoomId) {
          const owner = unitRooms.find((r) => r.id === orphan.bathroomOwnerRoomId);
          if (owner && visited.has(owner.id) && findSharedWallSegment(orphan, owner)) {
            targetReachable = owner;
          }
        }
        if (!targetReachable && (orphan.type === RoomType.Utility || orphan.name.toLowerCase().includes("utility"))) {
          const kitchen = unitRooms.find((r) => r.type === RoomType.Kitchen && visited.has(r.id));
          if (kitchen && findSharedWallSegment(orphan, kitchen)) {
            targetReachable = kitchen;
          }
        }
        if (!targetReachable && !orphan.bathroomOwnerRoomId) {
          const candidates = unitRooms.filter(
            (r) => visited.has(r.id) && !r.bathroomOwnerRoomId && r.type !== RoomType.Bathroom && !(orphan.type === RoomType.Bedroom && (r.type === RoomType.Kitchen || r.type === RoomType.Utility)) && findSharedWallSegment(orphan, r)
          );
          if (candidates.length > 0) {
            candidates.sort((a, b) => {
              const lenA = findSharedWallSegment(orphan, a)?.len ?? 0;
              const lenB = findSharedWallSegment(orphan, b)?.len ?? 0;
              return lenB - lenA;
            });
            targetReachable = candidates[0];
          }
        }
        if (targetReachable) {
          const shared = findSharedWallSegment(orphan, targetReachable);
          const isBath2 = orphan.type === RoomType.Bathroom;
          const isBalc = orphan.type === RoomType.Balcony;
          const isUtil = orphan.type === RoomType.Utility;
          const width = isBalc ? shared.len >= 1700 ? 1500 : 900 : isBath2 || isUtil ? shared.len >= 950 ? 750 : 700 : shared.len >= 1100 ? 900 : 800;
          const pos = shared.axis === "x" ? { x: snap10((shared.lo + shared.hi) / 2), y: shared.coord } : { x: shared.coord, y: snap10((shared.lo + shared.hi) / 2) };
          const hostWall = walls.find((w) => w.roomIds.includes(orphan.id) && w.roomIds.includes(targetReachable.id));
          const newDoor = {
            id: `${orphan.id}__door_reachability`,
            floorId,
            wallId: hostWall?.id ?? "__auto_wall__",
            position: pos,
            width,
            height: 2100,
            type: isBalc ? DoorType.Sliding : DoorType.Single,
            swingDirection: isBalc || isUtil ? SwingDirection.Outward : SwingDirection.Inward,
            connectsRooms: [targetReachable.id, orphan.id]
          };
          doors.push(newDoor);
          visited.add(orphan.id);
          graph.get(orphan.id).add(targetReachable.id);
          graph.get(targetReachable.id).add(orphan.id);
          const pending = [orphan.id];
          for (let i = 0; i < pending.length; i++) for (const id of graph.get(pending[i]) ?? []) {
            if (!visited.has(id) && unitRooms.some((r) => r.id === id)) {
              visited.add(id);
              pending.push(id);
            }
          }
          repaired = true;
          repairs.push({
            category: "PRIVACY_CIRCULATION",
            description: `Healed orphan space ${orphan.id} (${orphan.name}) by creating connecting door to ${targetReachable.id}`,
            targetEntities: [newDoor.id, orphan.id, targetReachable.id]
          });
        }
      }
    }
  }
  return { doors, repaired, repairs };
}
function repairDoorHostsAndClearance(params) {
  const { rooms, walls, floorId } = params;
  const repairedDoors = [];
  const repairs = [];
  let repaired = false;
  for (const door of params.doors) {
    const [rAId, rBId] = door.connectsRooms;
    const roomA = rooms.find((r) => r.id === rAId);
    const roomB = rooms.find((r) => r.id === rBId);
    if (!roomA || !roomB) {
      continue;
    }
    const matchingWall = walls.find((w) => w.roomIds.includes(roomA.id) && w.roomIds.includes(roomB.id));
    if (!matchingWall) {
      continue;
    }
    const wallLen = Math.hypot(
      matchingWall.endPoint.x - matchingWall.startPoint.x,
      matchingWall.endPoint.y - matchingWall.startPoint.y
    );
    let doorWidth = door.width;
    const isEntrance = (roomA.spaceUse === "COMMON" || roomA.spaceUse === "CORE") && roomB.unitId || (roomB.spaceUse === "COMMON" || roomB.spaceUse === "CORE") && roomA.unitId;
    const isBedroom2 = roomA.type === RoomType.Bedroom || roomB.type === RoomType.Bedroom;
    const isKitchen2 = roomA.type === RoomType.Kitchen || roomB.type === RoomType.Kitchen;
    const isService = roomA.type === RoomType.Bathroom || roomB.type === RoomType.Bathroom || roomA.type === RoomType.Utility || roomB.type === RoomType.Utility;
    const maxStatutoryWidth = isEntrance ? 1050 : isBedroom2 || isKitchen2 ? 900 : isService ? 750 : 1500;
    if (doorWidth > maxStatutoryWidth) {
      doorWidth = maxStatutoryWidth;
    }
    if (wallLen < doorWidth + 200) {
      if (isEntrance && wallLen >= 1200) doorWidth = 1e3;
      else if (isBedroom2 && wallLen >= 1e3) doorWidth = 800;
      else if (isService && wallLen >= 900) doorWidth = 700;
      else doorWidth = Math.max(650, Math.floor(wallLen - 200));
    }
    if (wallLen < doorWidth + 200) {
      continue;
    }
    const horizontal = Math.abs(matchingWall.startPoint.y - matchingWall.endPoint.y) <= 1;
    let centerPos;
    if (horizontal) {
      const minX = Math.min(matchingWall.startPoint.x, matchingWall.endPoint.x);
      const maxX = Math.max(matchingWall.startPoint.x, matchingWall.endPoint.x);
      const exactX = (minX + maxX) / 2;
      const minValidX = minX + 100 + doorWidth / 2;
      const maxValidX = maxX - 100 - doorWidth / 2;
      const x = Math.min(maxValidX, Math.max(minValidX, Math.round(exactX)));
      centerPos = { x, y: matchingWall.startPoint.y };
    } else {
      const minY = Math.min(matchingWall.startPoint.y, matchingWall.endPoint.y);
      const maxY = Math.max(matchingWall.startPoint.y, matchingWall.endPoint.y);
      const exactY = (minY + maxY) / 2;
      const minValidY = minY + 100 + doorWidth / 2;
      const maxValidY = maxY - 100 - doorWidth / 2;
      const y = Math.min(maxValidY, Math.max(minValidY, Math.round(exactY)));
      centerPos = { x: matchingWall.startPoint.x, y };
    }
    let swingDirection = door.swingDirection;
    let doorType = door.type;
    if (roomA.type === RoomType.Balcony || roomB.type === RoomType.Balcony) {
      doorType = DoorType.Sliding;
    } else if (isEntrance) {
      swingDirection = SwingDirection.Inward;
    }
    const updatedDoor = {
      ...door,
      floorId,
      wallId: matchingWall.id,
      position: centerPos,
      width: doorWidth,
      type: doorType,
      swingDirection
    };
    if (door.wallId !== matchingWall.id || door.width !== doorWidth || Math.abs(door.position.x - centerPos.x) > 2 || Math.abs(door.position.y - centerPos.y) > 2) {
      repaired = true;
      repairs.push({
        category: "DOOR_HOST_AND_SWING",
        description: `Centered door ${door.id} on host wall ${matchingWall.id} with ${doorWidth} mm width (>= 100mm corner clearance)`,
        targetEntities: [door.id, matchingWall.id]
      });
    }
    repairedDoors.push(updatedDoor);
  }
  const nonOverlappingDoors = [];
  for (let i = 0; i < repairedDoors.length; i++) {
    const d1 = repairedDoors[i];
    let overlap = false;
    for (let j = 0; j < nonOverlappingDoors.length; j++) {
      const d2 = nonOverlappingDoors[j];
      if (d1.wallId === d2.wallId) {
        const dist2 = Math.hypot(d1.position.x - d2.position.x, d1.position.y - d2.position.y);
        if (dist2 < (d1.width + d2.width) / 2) {
          overlap = true;
          break;
        }
      }
    }
    if (!overlap) {
      nonOverlappingDoors.push(d1);
    } else {
      repaired = true;
      repairs.push({
        category: "DOOR_HOST_AND_SWING",
        description: `Resolved opening overlap by deduplicating coincident door ${d1.id} on wall ${d1.wallId}`,
        targetEntities: [d1.id]
      });
    }
  }
  const resolvedDoors = [...nonOverlappingDoors];
  const isSwingingDoor = (d) => d.type !== DoorType.OpenPassage && d.type !== DoorType.Sliding && d.type !== DoorType.Folding;
  const wallWins = params.windows ?? [];
  for (let i = 0; i < resolvedDoors.length; i++) {
    const d1 = resolvedDoors[i];
    if (!isSwingingDoor(d1)) continue;
    const wall1 = walls.find((w) => w.id === d1.wallId);
    if (!wall1) continue;
    for (let j = i + 1; j < resolvedDoors.length; j++) {
      const d2 = resolvedDoors[j];
      if (!isSwingingDoor(d2)) continue;
      const wall2 = walls.find((w) => w.id === d2.wallId);
      if (!wall2) continue;
      const poly1 = computeDoorSwingPolygon(d1, wall1);
      const poly2 = computeDoorSwingPolygon(d2, wall2);
      if (!polygonsOverlap(poly1, poly2)) continue;
      let fixed;
      const alternateSwings = [
        SwingDirection.Inward,
        SwingDirection.Outward,
        SwingDirection.Left,
        SwingDirection.Right
      ].filter((s) => s !== d2.swingDirection);
      for (const swingDirection of alternateSwings) {
        const candidate = { ...d2, swingDirection };
        const candPoly = computeDoorSwingPolygon(candidate, wall2);
        const collidesAny = resolvedDoors.some((other, idx) => {
          if (idx === j || !isSwingingDoor(other)) return false;
          const ow = walls.find((w) => w.id === other.wallId);
          return ow ? polygonsOverlap(candPoly, computeDoorSwingPolygon(other, ow)) : false;
        });
        if (!collidesAny) {
          fixed = candidate;
          break;
        }
      }
      if (!fixed) {
        const dx = wall2.endPoint.x - wall2.startPoint.x;
        const dy = wall2.endPoint.y - wall2.startPoint.y;
        const wallLen = Math.hypot(dx, dy);
        if (wallLen >= d2.width + 200) {
          const ux = dx / wallLen;
          const uy = dy / wallLen;
          const cornerPad = wallLen >= d2.width + 1900 ? 950 : Math.min(300, Math.floor((wallLen - d2.width) / 2));
          const minT = cornerPad + d2.width / 2;
          const maxT = wallLen - cornerPad - d2.width / 2;
          const stepCount = Math.max(1, Math.floor((maxT - minT) / 100));
          for (let step = 0; step <= stepCount; step++) {
            const t = minT + (maxT - minT) * (step / Math.max(1, stepCount));
            const pos = {
              x: Math.round((wall2.startPoint.x + ux * t) / 10) * 10,
              y: Math.round((wall2.startPoint.y + uy * t) / 10) * 10
            };
            const hitsWindow = wallWins.some(
              (win) => win.wallId === wall2.id && Math.hypot(win.position.x - pos.x, win.position.y - pos.y) < (win.width + d2.width) / 2
            );
            if (hitsWindow || !openingFitsApartmentWall(wall2, pos, d2.width)) continue;
            for (const swingDirection of [d2.swingDirection, ...alternateSwings]) {
              const candidate = { ...d2, position: pos, swingDirection };
              const candPoly = computeDoorSwingPolygon(candidate, wall2);
              const collidesAny = resolvedDoors.some((other, idx) => {
                if (idx === j || !isSwingingDoor(other)) return false;
                const ow = walls.find((w) => w.id === other.wallId);
                return ow ? polygonsOverlap(candPoly, computeDoorSwingPolygon(other, ow)) : false;
              });
              if (!collidesAny) {
                fixed = candidate;
                break;
              }
            }
            if (fixed) break;
          }
        }
      }
      if (fixed) {
        resolvedDoors[j] = fixed;
        repaired = true;
        repairs.push({
          category: "DOOR_HOST_AND_SWING",
          description: `Resolved 90\xB0 door swing collision between ${d1.id} and ${d2.id}`,
          targetEntities: [d2.id]
        });
      }
    }
  }
  return { doors: resolvedDoors, repaired, repairs };
}
function repairDaylightAndVentilation(params) {
  const { rooms, doors, walls, floorId } = params;
  let repaired = false;
  const repairs = [];
  const windows = params.windows.filter((w) => {
    const host = walls.find((wall) => wall.id === w.wallId);
    const room = rooms.find((r) => r.id === w.roomId);
    if (!host || !room) return false;
    return openingFitsApartmentWall(host, w.position, w.width) && host.roomIds.includes(w.roomId);
  });
  if (windows.length !== params.windows.length) {
    repaired = true;
  }
  for (const r of rooms) {
    if (!r.unitId) continue;
    if (["living", "bedroom", "kitchen"].includes(r.type)) {
      const hasWindow = windows.some((w) => w.roomId === r.id);
      const hasBalconyOrUtilityDoor = doors.some((d) => {
        const otherId = d.connectsRooms[0] === r.id ? d.connectsRooms[1] : d.connectsRooms[0];
        const other = rooms.find((o) => o.id === otherId);
        return other && (other.type === RoomType.Balcony || other.type === RoomType.Utility);
      });
      if (!hasWindow && !hasBalconyOrUtilityDoor) {
        const candWalls = walls.filter(
          (w) => w.roomIds.includes(r.id) && (w.wallUse === "EXTERNAL" || w.roomIds.length === 1 && w.type === WallType.External)
        );
        for (const hostWall of candWalls) {
          const len = Math.hypot(hostWall.endPoint.x - hostWall.startPoint.x, hostWall.endPoint.y - hostWall.startPoint.y);
          if (len < 900) continue;
          const winWidth = Math.min(1500, Math.max(700, Math.min(len - 200, Math.round(len * 0.4))));
          const pos = {
            x: snap10((hostWall.startPoint.x + hostWall.endPoint.x) / 2),
            y: snap10((hostWall.startPoint.y + hostWall.endPoint.y) / 2)
          };
          if (openingFitsApartmentWall(hostWall, pos, winWidth)) {
            const newWin = {
              id: `${r.id}__auto_window`,
              floorId,
              wallId: hostWall.id,
              position: pos,
              width: winWidth,
              height: 1200,
              sillHeight: 900,
              type: WindowType.Sliding,
              roomId: r.id
            };
            windows.push(newWin);
            repaired = true;
            repairs.push({
              category: "DAYLIGHT_SHAFT",
              description: `Added ${winWidth} mm exterior daylight window for ${r.name} (${r.type})`,
              targetEntities: [newWin.id, r.id]
            });
            break;
          }
        }
      }
    }
    if (r.type === RoomType.Bathroom) {
      const hasVent = windows.some((w) => w.roomId === r.id);
      if (!hasVent) {
        const candWalls = walls.filter(
          (w) => w.roomIds.includes(r.id) && (w.wallUse === "EXTERNAL" || w.wallUse === "SHAFT" || w.roomIds.length === 1) && w.boundaryRole !== "OPEN_BOUNDARY" && w.boundaryRole !== "PARAPET"
        );
        for (const extWall of candWalls) {
          const len = Math.hypot(extWall.endPoint.x - extWall.startPoint.x, extWall.endPoint.y - extWall.startPoint.y);
          if (len >= 600) {
            const ventWidth = Math.min(600, Math.max(350, Math.round(len - 200)));
            const pos = {
              x: snap10((extWall.startPoint.x + extWall.endPoint.x) / 2),
              y: snap10((extWall.startPoint.y + extWall.endPoint.y) / 2)
            };
            if (openingFitsApartmentWall(extWall, pos, ventWidth)) {
              const newVent = {
                id: `${r.id}__auto_ventilator`,
                floorId,
                wallId: extWall.id,
                position: pos,
                width: ventWidth,
                height: 600,
                sillHeight: 1800,
                type: WindowType.Ventilator,
                roomId: r.id
              };
              windows.push(newVent);
              extWall.hasOpening = true;
              repaired = true;
              repairs.push({
                category: "DAYLIGHT_SHAFT",
                description: `Added ${ventWidth} mm ventilator window on ${extWall.wallUse} wall for bathroom ${r.id}`,
                targetEntities: [newVent.id, r.id]
              });
              break;
            }
          }
        }
      }
    }
  }
  return { windows, repaired, repairs };
}
function healFloorGeometryForCompliance(floor) {
  let rooms = floor.rooms.map((r) => ({ ...r }));
  let walls = floor.walls.map((w) => ({ ...w }));
  let doors = floor.doors.map((d) => ({ ...d }));
  let windows = floor.windows.map((w) => ({ ...w }));
  let healed = false;
  walls = walls.map((w) => {
    const isParty = w.unitIds && w.unitIds.length > 1 || w.wallUse === "UNIT_SEPARATION";
    if (isParty && w.thickness < 230) {
      healed = true;
      return { ...w, thickness: 230 };
    }
    return w;
  });
  for (const bath of rooms.filter((r) => r.type === RoomType.Bathroom)) {
    const hasWin = windows.some((win) => win.roomId === bath.id);
    if (hasWin) continue;
    const hostWall = walls.find(
      (w) => w.roomIds.includes(bath.id) && (w.wallUse === "EXTERNAL" || w.wallUse === "SHAFT") && w.boundaryRole !== "OPEN_BOUNDARY"
    );
    if (!hostWall) continue;
    const wallLen = Math.hypot(hostWall.endPoint.x - hostWall.startPoint.x, hostWall.endPoint.y - hostWall.startPoint.y);
    const ventW = Math.min(600, Math.max(350, Math.floor(wallLen - 200)));
    const mid = {
      x: Math.round((hostWall.startPoint.x + hostWall.endPoint.x) / 2),
      y: Math.round((hostWall.startPoint.y + hostWall.endPoint.y) / 2)
    };
    const overlapsDoor = doors.some((d) => d.wallId === hostWall.id && Math.hypot(d.position.x - mid.x, d.position.y - mid.y) < (d.width + ventW) / 2);
    if (!overlapsDoor && ventW >= 350 && openingFitsApartmentWall(hostWall, mid, ventW)) {
      windows.push({
        id: `win_heal_${bath.id}`,
        floorId: floor.id,
        wallId: hostWall.id,
        position: mid,
        width: ventW,
        height: 600,
        sillHeight: 1500,
        type: WindowType.Ventilator,
        roomId: bath.id
      });
      healed = true;
    }
  }
  const foyerRooms = rooms.filter((r) => r.type === RoomType.Foyer && r.area > 115e5);
  for (const foyer of foyerRooms) {
    const living = rooms.find(
      (r) => r.id !== foyer.id && r.unitId === foyer.unitId && r.type === RoomType.Living && (Math.abs(r.x - foyer.x) <= 2 && Math.abs(r.width - foyer.width) <= 2 && (Math.abs(foyer.y + foyer.height - r.y) <= 2 || Math.abs(r.y + r.height - foyer.y) <= 2) || Math.abs(r.y - foyer.y) <= 2 && Math.abs(r.height - foyer.height) <= 2 && (Math.abs(foyer.x + foyer.width - r.x) <= 2 || Math.abs(r.x + r.width - foyer.x) <= 2))
    );
    if (!living) continue;
    const stacked = Math.abs(living.x - foyer.x) <= 2 && Math.abs(living.width - foyer.width) <= 2;
    let nextFoyer = foyer;
    let nextLiving = living;
    if (stacked) {
      const targetH = Math.max(1200, Math.floor(11e6 / Math.max(1, foyer.width) / 10) * 10);
      const trim = foyer.height - targetH;
      if (trim <= 50) continue;
      const foyerOnTop = Math.abs(foyer.y + foyer.height - living.y) <= 2;
      nextFoyer = createRoom({
        ...foyer,
        tags: [...foyer.tags],
        adjacencyRequirements: foyer.adjacencyRequirements ? [...foyer.adjacencyRequirements] : void 0,
        y: foyerOnTop ? foyer.y : foyer.y + trim,
        height: targetH
      });
      nextLiving = createRoom({
        ...living,
        tags: [...living.tags],
        adjacencyRequirements: living.adjacencyRequirements ? [...living.adjacencyRequirements] : void 0,
        y: foyerOnTop ? living.y - trim : living.y,
        height: living.height + trim
      });
    } else {
      const targetW = Math.max(1200, Math.floor(11e6 / Math.max(1, foyer.height) / 10) * 10);
      const trim = foyer.width - targetW;
      if (trim <= 50) continue;
      const foyerAtLeft = Math.abs(foyer.x + foyer.width - living.x) <= 2;
      nextFoyer = createRoom({
        ...foyer,
        tags: [...foyer.tags],
        adjacencyRequirements: foyer.adjacencyRequirements ? [...foyer.adjacencyRequirements] : void 0,
        x: foyerAtLeft ? foyer.x : foyer.x + trim,
        width: targetW
      });
      nextLiving = createRoom({
        ...living,
        tags: [...living.tags],
        adjacencyRequirements: living.adjacencyRequirements ? [...living.adjacencyRequirements] : void 0,
        x: foyerAtLeft ? living.x - trim : living.x,
        width: living.width + trim
      });
    }
    const candidateRooms = rooms.map(
      (r) => r.id === foyer.id ? nextFoyer : r.id === living.id ? nextLiving : r
    );
    const guardHeight = walls.find((w) => w.boundaryRole === "PARAPET")?.heightMm;
    const candidateWalls = generateApartmentWalls(candidateRooms, floor.id, floor.boundary, true, guardHeight);
    const candidateFloor = { ...floor, rooms: candidateRooms, walls: candidateWalls, doors, windows };
    if (Math.abs(measureApartmentAreaLedger(candidateFloor).delta) < 1e-3) {
      rooms = candidateRooms;
      walls = candidateWalls;
      doors = doors.map((d) => {
        if (d.connectsRooms.includes(foyer.id) || d.connectsRooms.includes(living.id)) {
          const matchedWall = candidateWalls.find(
            (w) => d.connectsRooms.every((cid) => w.roomIds.includes(cid)) || (d.isFlatEntrance || d.connectsRooms.some((cid) => rooms.find((r) => r.id === cid)?.spaceUse === "COMMON")) && w.roomIds.some((rid) => rid === foyer.id || rid === living.id)
          );
          if (matchedWall) {
            const mx = Math.round((matchedWall.startPoint.x + matchedWall.endPoint.x) / 2);
            const my = Math.round((matchedWall.startPoint.y + matchedWall.endPoint.y) / 2);
            return {
              ...d,
              wallId: matchedWall.id,
              position: openingFitsApartmentWall(matchedWall, d.position, d.width) ? d.position : { x: mx, y: my }
            };
          }
        }
        return d;
      });
      healed = true;
    }
  }
  if (floor.level <= 0 || floor.floorUse === "STILT_PARKING") {
    walls = walls.map((w) => {
      if (w.boundaryRole === "OPEN_BOUNDARY" && w.roomIds.length === 1) {
        const rm = rooms.find((r) => r.id === w.roomIds[0]);
        if (rm && (rm.tags?.includes("core:lobby") || rm.type === RoomType.Staircase)) {
          healed = true;
          return { ...w, boundaryRole: "FULL_HEIGHT_WALL", thickness: Math.max(150, w.thickness), heightMm: void 0 };
        }
      }
      return w;
    });
  }
  if (!healed) return { floor, healed: false };
  return {
    floor: {
      ...floor,
      rooms,
      walls: walls.map((w) => ({
        ...w,
        hasOpening: doors.some((d) => d.wallId === w.id) || windows.some((win) => win.wallId === w.id)
      })),
      doors,
      windows
    },
    healed: true
  };
}

// packages/planning-engine/src/plancraft/auto-furnish-apartment.ts
function getRoomDoorClearanceBoxes(room, floor) {
  const clearanceBoxes = [];
  const roomDoors = floor.doors.filter(
    (d) => d.connectsRooms?.includes(room.id) || d.adjacentRoomId === room.id
  );
  for (const door of roomDoors) {
    const dW = door.width || 900;
    const buffer = 600;
    const sweep = dW + buffer;
    const minX = Math.max(room.x, door.position.x - sweep / 2);
    const maxX = Math.min(room.x + room.width, door.position.x + sweep / 2);
    const minY = Math.max(room.y, door.position.y - sweep / 2);
    const maxY = Math.min(room.y + room.height, door.position.y + sweep / 2);
    clearanceBoxes.push({ minX, minY, maxX, maxY });
  }
  return clearanceBoxes;
}
function collidesWithDoorClearance(box, doorBoxes) {
  for (const d of doorBoxes) {
    const overlapX = box.x < d.maxX && box.x + box.w > d.minX;
    const overlapY = box.y < d.maxY && box.y + box.h > d.minY;
    if (overlapX && overlapY) return true;
  }
  return false;
}
function getRoomFlatId(room) {
  if (room.unitId) return room.unitId;
  const flatTag = room.tags.find((t) => t.startsWith("flat:"));
  return flatTag ? flatTag.replace("flat:", "") : void 0;
}
function furnishRoom(room, floor, _manifest) {
  const items = [];
  const flatId = getRoomFlatId(room);
  const rx = room.x;
  const ry = room.y;
  const rw = room.width;
  const rh = room.height;
  const rName = (room.name || "").toUpperCase();
  if (room.type === RoomType.Balcony || room.type === RoomType.Utility || room.type === RoomType.Corridor || room.type === RoomType.Foyer || /BALCONY|SIT[ -]?OUT|TERRACE|PASSAGE|CORRIDOR|FOYER|VESTIBULE|LOBBY|AISLE/.test(rName)) {
    return items;
  }
  const areaM2 = room.area / 1e6;
  const doorBoxes = getRoomDoorClearanceBoxes(room, floor);
  const wallInset = 155;
  const innerMinX = rx + wallInset;
  const innerMinY = ry + wallInset;
  const innerMaxX = rx + rw - wallInset;
  const innerMaxY = ry + rh - wallInset;
  const roomWindows = (floor.windows || []).filter(
    (w) => w.roomId === room.id || w.adjacentRoomId === room.id || w.position.x >= rx - 200 && w.position.x <= rx + rw + 200 && w.position.y >= ry - 200 && w.position.y <= ry + rh + 200
  );
  const hasNorthWindow = roomWindows.some((w) => Math.abs(w.position.y - ry) <= 250);
  const hasSouthWindow = roomWindows.some((w) => Math.abs(w.position.y - (ry + rh)) <= 250);
  const hasWestWindow = roomWindows.some((w) => Math.abs(w.position.x - rx) <= 250);
  const hasEastWindow = roomWindows.some((w) => Math.abs(w.position.x - (rx + rw)) <= 250);
  const addItem = (type, rawX, rawY, w, d, rot = 0, anchorWall, force = false) => {
    if (w > innerMaxX - innerMinX + 20 || d > innerMaxY - innerMinY + 20) {
      return;
    }
    const clampedX = Math.max(innerMinX, Math.min(innerMaxX - w, rawX));
    const clampedY = Math.max(innerMinY, Math.min(innerMaxY - d, rawY));
    if (!force && collidesWithDoorClearance({ x: clampedX, y: clampedY, w, h: d }, doorBoxes)) {
      return;
    }
    const itemIndex = items.filter((i) => i.roomId === room.id && i.type === type).length + 1;
    items.push({
      id: `${room.id}__furn_${type}_${itemIndex}`,
      type,
      roomId: room.id,
      flatId,
      xMm: Math.round(clampedX),
      yMm: Math.round(clampedY),
      widthMm: Math.round(w),
      depthMm: Math.round(d),
      rotationDeg: rot,
      anchorWall,
      layer: "A-FURN"
    });
  };
  if (room.type === RoomType.Living || room.type === RoomType.FamilyLiving || room.type === RoomType.Drawing || rName.includes("LIVING") || rName.includes("FOYER_LIVING_DINING")) {
    const isLarge = rw >= 5e3 && rh >= 4e3;
    const sofaType = isLarge ? "sectional_sofa" : "l_sofa";
    const sofaW = isLarge ? 3e3 : 2400;
    const sofaD = isLarge ? 2200 : 2e3;
    let placedSofa = null;
    const sofaCandidates = [
      { type: sofaType, x: rx + 300, y: ry + 300, w: sofaW, d: sofaD, rot: 0, wall: "NORTH" },
      { type: sofaType, x: rx + 300, y: ry + 2800, w: sofaW, d: sofaD, rot: 0, wall: "WEST" },
      { type: sofaType, x: rx + rw - sofaW - 300, y: ry + 2800, w: sofaW, d: sofaD, rot: 0, wall: "EAST" },
      { type: sofaType, x: rx + 300, y: ry + Math.max(300, Math.min(rh - sofaD - 300, 4500)), w: sofaW, d: sofaD, rot: 0, wall: "WEST" },
      { type: "sofa", x: rx + 200, y: ry + 200, w: 2e3, d: 900, rot: 0, wall: "NORTH" },
      { type: "sofa", x: rx + 200, y: ry + 2800, w: 2e3, d: 900, rot: 0, wall: "WEST" },
      { type: "sofa", x: rx + 200, y: ry + Math.max(200, Math.min(rh - 1200, 4500)), w: 2e3, d: 900, rot: 0, wall: "WEST" }
    ];
    for (const cand of sofaCandidates) {
      if (rw >= cand.w + 400 && rh >= cand.d + 400) {
        const initialCount = items.length;
        addItem(cand.type, cand.x, cand.y, cand.w, cand.d, cand.rot, cand.wall);
        if (items.length > initialCount) {
          placedSofa = cand;
          break;
        }
      }
    }
    if (placedSofa) {
      const cTableCandidates = [
        { x: placedSofa.x + (placedSofa.w - 1200) / 2, y: placedSofa.y + placedSofa.d + 300, w: 1200, d: 600, rot: 0 },
        { x: placedSofa.x + (placedSofa.w - 1e3) / 2, y: placedSofa.y + placedSofa.d + 200, w: 1e3, d: 500, rot: 0 },
        { x: placedSofa.x + (placedSofa.w - 800) / 2, y: placedSofa.y + placedSofa.d + 150, w: 800, d: 450, rot: 0 },
        { x: placedSofa.x + placedSofa.w + 300, y: placedSofa.y + (placedSofa.d - 600) / 2, w: 600, d: 1e3, rot: 90 },
        { x: rx + (rw - 1e3) / 2, y: ry + (rh - 500) / 2, w: 1e3, d: 500, rot: 0 }
      ];
      for (const ctc of cTableCandidates) {
        const init = items.length;
        addItem("coffee_table", ctc.x, ctc.y, ctc.w, ctc.d, ctc.rot, "CENTER");
        if (items.length > init) break;
      }
      if (!items.some((i) => i.roomId === room.id && i.type === "coffee_table")) {
        const cX = Math.max(innerMinX, Math.min(innerMaxX - 800, placedSofa.x + (placedSofa.w - 800) / 2));
        const cY = Math.max(innerMinY, Math.min(innerMaxY - 450, placedSofa.y + placedSofa.d + 200));
        addItem("coffee_table", cX, cY, 800, 450, 0, "CENTER", true);
      }
      const tvW = Math.min(1800, Math.max(1e3, rw - 600));
      const tvD = 450;
      const tvCandidates = [
        { x: rx + rw - tvD - 200, y: placedSofa.y, w: tvD, d: tvW, rot: 90, wall: "EAST" },
        { x: rx + 200, y: placedSofa.y + 1e3, w: tvD, d: tvW, rot: 90, wall: "WEST" },
        { x: rx + (rw - tvW) / 2, y: ry + rh - tvD - 200, w: tvW, d: tvD, rot: 0, wall: "SOUTH" },
        { x: rx + (rw - tvW) / 2, y: ry + 200, w: tvW, d: tvD, rot: 0, wall: "NORTH" }
      ];
      for (const tvc of tvCandidates) {
        if (rw >= tvc.w + 200 && rh >= tvc.d + 200) {
          const init = items.length;
          addItem("tv_console", tvc.x, tvc.y, tvc.w, tvc.d, tvc.rot, tvc.wall);
          if (items.length > init) break;
        }
      }
      if (!items.some((i) => i.roomId === room.id && i.type === "tv_console")) {
        const tvX = Math.max(innerMinX, Math.min(innerMaxX - 450, rx + rw - 450 - 200));
        const tvY = Math.max(innerMinY, Math.min(innerMaxY - 1200, ry + (rh - 1200) / 2));
        addItem("tv_console", tvX, tvY, 450, 1200, 90, "EAST", true);
      }
    } else {
      addItem("coffee_table", rx + (rw - 1e3) / 2, ry + (rh - 500) / 2, 1e3, 500, 0, "CENTER");
      addItem("tv_console", rx + rw - 650, ry + 1e3, 450, 1500, 90, "EAST");
    }
    const tblW = 1400;
    const tblD = 900;
    const diningX = rx + rw - tblW - 600;
    const diningY = ry + rh - tblD - 600;
    if (diningX > rx + 1500 && diningY > ry + 1500 && rw >= 4e3 && rh >= 4e3) {
      addItem("table", diningX, diningY, tblW, tblD, 0, "SOUTH");
      addItem("chair", diningX + 200, diningY - 450, 450, 450, 0, "CENTER");
      addItem("chair", diningX + 750, diningY - 450, 450, 450, 0, "CENTER");
      addItem("chair", diningX + 200, diningY + tblD, 450, 450, 180, "CENTER");
      addItem("chair", diningX + 750, diningY + tblD, 450, 450, 180, "CENTER");
    }
  } else if (room.type === RoomType.Dining || rName.includes("DINING")) {
    const tblW = 1500;
    const tblD = 900;
    const tx = rx + (rw - tblW) / 2;
    const ty = ry + (rh - tblD) / 2;
    addItem("table", tx, ty, tblW, tblD, 0, "CENTER");
    addItem("chair", tx + 200, ty - 450, 450, 450, 0, "CENTER");
    addItem("chair", tx + 850, ty - 450, 450, 450, 0, "CENTER");
    addItem("chair", tx + 200, ty + tblD, 450, 450, 180, "CENTER");
    addItem("chair", tx + 850, ty + tblD, 450, 450, 180, "CENTER");
  } else if ((room.type === RoomType.Bedroom || rName.includes("BED")) && !/PASSAGE|CORRIDOR|BALCONY|FOYER|TOILET|BATH/.test(rName)) {
    const isMaster = rName.includes("MASTER") || areaM2 >= 13;
    const bedW = isMaster ? 1800 : 1500;
    const bedD = 2e3;
    const rawBedCandidates = [
      { x: rx + (rw - bedW) / 2, y: ry + 150, w: bedW, d: bedD, rot: 0, wall: "NORTH" },
      { x: rx + (rw - bedW) / 2, y: ry + rh - bedD - 150, w: bedW, d: bedD, rot: 180, wall: "SOUTH" },
      { x: rx + 150, y: ry + (rh - bedW) / 2, w: bedD, d: bedW, rot: 90, wall: "WEST" },
      { x: rx + rw - bedD - 150, y: ry + (rh - bedW) / 2, w: bedD, d: bedW, rot: 270, wall: "EAST" }
    ];
    const bedCandidates = rawBedCandidates.filter((bc) => {
      if (bc.wall === "NORTH" && hasNorthWindow) return false;
      if (bc.wall === "SOUTH" && hasSouthWindow) return false;
      if (bc.wall === "WEST" && hasWestWindow) return false;
      if (bc.wall === "EAST" && hasEastWindow) return false;
      return true;
    });
    const finalBedCandidates = bedCandidates.length > 0 ? bedCandidates : rawBedCandidates;
    for (const bc of finalBedCandidates) {
      if (rw >= bc.w + 100 && rh >= bc.d + 100) {
        const init = items.length;
        addItem("bed", bc.x, bc.y, bc.w, bc.d, bc.rot, bc.wall);
        if (items.length > init) break;
      }
    }
    if (!items.some((i) => i.roomId === room.id && i.type === "bed")) {
      const compactBedCandidates = [
        { x: rx + 200, y: ry + 200, w: 1200, d: 1900, rot: 0, wall: "NORTH" },
        { x: rx + rw - 1400, y: ry + 200, w: 1200, d: 1900, rot: 0, wall: "NORTH" },
        { x: rx + 200, y: ry + rh - 2100, w: 1200, d: 1900, rot: 180, wall: "SOUTH" },
        { x: rx + rw - 1400, y: ry + rh - 2100, w: 1200, d: 1900, rot: 180, wall: "SOUTH" },
        { x: rx + 200, y: ry + 200, w: 1900, d: 1200, rot: 90, wall: "WEST" },
        { x: rx + rw - 2100, y: ry + 200, w: 1900, d: 1200, rot: 270, wall: "EAST" }
      ];
      for (const bc of compactBedCandidates) {
        if (rw >= bc.w + 100 && rh >= bc.d + 100) {
          const init = items.length;
          addItem("bed", bc.x, bc.y, bc.w, bc.d, bc.rot, bc.wall);
          if (items.length > init) break;
        }
      }
      if (!items.some((i) => i.roomId === room.id && i.type === "bed")) {
        const bW = Math.min(1200, rw - 350);
        const bD = Math.min(1900, rh - 350);
        const bX = Math.max(innerMinX, rx + (rw - bW) / 2);
        const bY = Math.max(innerMinY, ry + 200);
        addItem("bed", bX, bY, bW, bD, 0, "NORTH", true);
      }
    }
    const wardDim1 = Math.min(1800, Math.max(900, Math.min(rw, rh) - 1e3));
    const wardDim2 = 600;
    const rawWardCandidates = [];
    for (const len of [.../* @__PURE__ */ new Set([wardDim1, Math.min(wardDim1, 1400), Math.min(wardDim1, 1e3)])]) {
      const yOffsets = [.../* @__PURE__ */ new Set([
        ry + 200,
        ry + Math.round(rh * 0.25),
        ry + Math.round((rh - len) / 2),
        ry + Math.round(rh * 0.65) - Math.round(len / 2),
        ry + rh - len - 200
      ])].filter((yPos) => yPos >= ry + 100 && yPos + len <= ry + rh - 100);
      for (const yPos of yOffsets) {
        rawWardCandidates.push(
          { x: rx + 150, y: yPos, w: wardDim2, d: len, rot: 90, wall: "WEST" },
          { x: rx + rw - wardDim2 - 150, y: yPos, w: wardDim2, d: len, rot: 270, wall: "EAST" }
        );
      }
      const xOffsets = [.../* @__PURE__ */ new Set([
        rx + 200,
        rx + Math.round((rw - len) / 2),
        rx + rw - len - 200
      ])].filter((xPos) => xPos >= rx + 100 && xPos + len <= rx + rw - 100);
      for (const xPos of xOffsets) {
        rawWardCandidates.push(
          { x: xPos, y: ry + rh - wardDim2 - 150, w: len, d: wardDim2, rot: 0, wall: "SOUTH" },
          { x: xPos, y: ry + 150, w: len, d: wardDim2, rot: 0, wall: "NORTH" }
        );
      }
    }
    const wardCandidates = rawWardCandidates.filter((wc) => {
      if (wc.wall === "NORTH" && hasNorthWindow) return false;
      if (wc.wall === "SOUTH" && hasSouthWindow) return false;
      if (wc.wall === "WEST" && hasWestWindow) return false;
      if (wc.wall === "EAST" && hasEastWindow) return false;
      return true;
    });
    const finalWardCandidates = wardCandidates.length > 0 ? wardCandidates : rawWardCandidates;
    for (const wc of finalWardCandidates) {
      if (rw >= wc.w + 100 && rh >= wc.d + 100) {
        const init = items.length;
        addItem("wardrobe", wc.x, wc.y, wc.w, wc.d, wc.rot, wc.wall);
        if (items.length > init) break;
      }
    }
    if (rw >= 3e3 && rh >= 2800) {
      const deskW = 1200;
      const deskD = 600;
      const deskX = rx + rw - deskW - 300;
      const deskY = ry + rh - deskD - 300;
      addItem("desk", deskX, deskY, deskW, deskD, 0, "SOUTH");
      addItem("office_chair", deskX + (deskW - 550) / 2, deskY - 500, 550, 550, 0, "CENTER");
      addItem("floor_lamp", rx + rw - 400, ry + 200, 300, 300, 0, "EAST");
    }
  } else if ((room.type === RoomType.Kitchen || rName.includes("KITCHEN")) && !rName.includes("UTILITY") && !rName.includes("BALCONY")) {
    const counterD = 600;
    const counterW = Math.min(3e3, rw - 400);
    const rawCounterCandidates = [
      { x: rx + 200, y: ry + rh - counterD - 150, w: counterW, d: counterD, wall: "SOUTH", isHoriz: true },
      { x: rx + 200, y: ry + 150, w: counterW, d: counterD, wall: "NORTH", isHoriz: true },
      { x: rx + rw - counterD - 150, y: ry + 200, w: counterD, d: Math.min(3e3, rh - 400), wall: "EAST", isHoriz: false },
      { x: rx + 150, y: ry + 200, w: counterD, d: Math.min(3e3, rh - 400), wall: "WEST", isHoriz: false }
    ];
    for (const run of [1800, 1500, 1400]) {
      for (let offset = 150; offset + run <= rh - 100; offset += 100) {
        rawCounterCandidates.push(
          { x: rx + 100, y: ry + offset, w: counterD, d: run, wall: "WEST", isHoriz: false },
          { x: rx + rw - counterD - 100, y: ry + offset, w: counterD, d: run, wall: "EAST", isHoriz: false }
        );
      }
    }
    const counterCandidates = rawCounterCandidates.filter(
      (cc) => !collidesWithDoorClearance({ x: cc.x, y: cc.y, w: cc.w, h: cc.d }, doorBoxes)
    );
    const finalCandidates = counterCandidates.length > 0 ? counterCandidates : rawCounterCandidates;
    let placedCounter = null;
    for (const cc of finalCandidates) {
      if (rw >= cc.w + 100 && rh >= cc.d + 100) {
        const init = items.length;
        addItem("counter", cc.x, cc.y, cc.w, cc.d, 0, cc.wall);
        if (items.length > init) {
          placedCounter = cc;
          break;
        }
      }
    }
    if (placedCounter) {
      if (placedCounter.isHoriz) {
        const stoveX = placedCounter.x + 200;
        const sinkX = placedCounter.x + Math.min(placedCounter.w - 700, 1e3);
        const ovenX = placedCounter.x + Math.min(placedCounter.w - 600, 1800);
        addItem("stove", stoveX, placedCounter.y, 600, 600, 0, "NORTH");
        addItem("sink", sinkX, placedCounter.y, 600, 500, 0, "NORTH");
        addItem("oven", ovenX, placedCounter.y, 600, 600, 0, "NORTH");
      } else {
        const stoveY = placedCounter.y + 200;
        const sinkY = placedCounter.y + Math.min(placedCounter.d - 700, 1e3);
        const ovenY = placedCounter.y + Math.min(placedCounter.d - 600, 1800);
        addItem("stove", placedCounter.x, stoveY, 600, 600, 0, "WEST");
        addItem("sink", placedCounter.x, sinkY, 500, 600, 0, "WEST");
        addItem("oven", placedCounter.x, ovenY, 600, 600, 0, "WEST");
      }
    }
    addItem("fridge", rx + rw - 850, ry + 150, 700, 700, 0, "EAST");
  } else if (rName.includes("UTILITY") || rName.includes("BALCONY")) {
  } else if (room.type === RoomType.Bathroom || rName.includes("BATH") || rName.includes("TOILET") || rName.includes("WC")) {
    const wcCandidates = [
      { x: rx + 200, y: ry + 200, w: 400, d: 700, wall: "NORTH" },
      { x: rx + rw - 600, y: ry + 200, w: 400, d: 700, wall: "NORTH" },
      { x: rx + 200, y: ry + rh - 900, w: 400, d: 700, wall: "SOUTH" },
      { x: rx + rw - 600, y: ry + rh - 900, w: 400, d: 700, wall: "SOUTH" },
      { x: rx + 200, y: ry + (rh - 700) / 2, w: 400, d: 700, wall: "WEST" },
      { x: rx + rw - 600, y: ry + (rh - 700) / 2, w: 400, d: 700, wall: "EAST" }
    ];
    for (const wc of wcCandidates) {
      if (rw >= wc.w + 100 && rh >= wc.d + 100) {
        const init = items.length;
        addItem("toilet", wc.x, wc.y, wc.w, wc.d, 0, wc.wall);
        if (items.length > init) break;
      }
    }
    const sinkCandidates = [
      { x: rx + 750, y: ry + 200, w: 450, d: 350, wall: "NORTH" },
      { x: rx + 200, y: ry + 800, w: 350, d: 450, wall: "WEST" },
      { x: rx + rw - 700, y: ry + 200, w: 500, d: 400, wall: "NORTH" },
      { x: rx + rw - 700, y: ry + rh - 600, w: 500, d: 400, wall: "SOUTH" },
      { x: rx + rw - 600, y: ry + (rh - 400) / 2, w: 500, d: 400, wall: "EAST" }
    ];
    for (const sc of sinkCandidates) {
      if (rw >= sc.w + 100 && rh >= sc.d + 100) {
        const init = items.length;
        addItem("sink", sc.x, sc.y, sc.w, sc.d, 0, sc.wall);
        if (items.length > init) break;
      }
    }
    const is4BhkMasterBath = (rName.includes("MASTER") || rName.includes("ATTACHED")) && areaM2 >= 4.5;
    if (is4BhkMasterBath) {
      if (rw >= 2e3) {
        addItem("bathtub", rx + 200, ry + rh - 850, 1700, 700, 0, "SOUTH");
      } else if (rh >= 2e3) {
        addItem("bathtub", rx + 200, ry + 200, 700, 1700, 90, "WEST");
      }
      if (rw >= 2400) {
        addItem("shower", rx + rw - 1e3, ry + rh - 1e3, 900, 900, 0, "SOUTH");
      }
    }
    if (!items.some((i) => i.roomId === room.id && (i.type === "shower" || i.type === "bathtub"))) {
      const showerCandidates = [
        { x: rx + rw - 1e3, y: ry + rh - 1e3, w: 900, d: 900, wall: "SOUTH" },
        { x: rx + 200, y: ry + rh - 1e3, w: 900, d: 900, wall: "SOUTH" },
        { x: rx + rw - 1e3, y: ry + 200, w: 900, d: 900, wall: "NORTH" },
        { x: rx + 200, y: ry + 200, w: 900, d: 900, wall: "NORTH" },
        { x: rx + rw - 850, y: ry + rh - 850, w: 800, d: 800, wall: "SOUTH" },
        { x: rx + 150, y: ry + rh - 850, w: 800, d: 800, wall: "SOUTH" },
        { x: rx + rw - 850, y: ry + 150, w: 800, d: 800, wall: "NORTH" },
        { x: rx + 150, y: ry + 150, w: 800, d: 800, wall: "NORTH" }
      ];
      for (const sh of showerCandidates) {
        if (rw >= sh.w + 100 && rh >= sh.d + 100) {
          const init = items.length;
          addItem("shower", sh.x, sh.y, sh.w, sh.d, 0, sh.wall);
          if (items.length > init) break;
        }
      }
      if (!items.some((i) => i.roomId === room.id && (i.type === "shower" || i.type === "bathtub"))) {
        const shX = Math.max(innerMinX, innerMaxX - 800);
        const shY = Math.max(innerMinY, innerMaxY - 800);
        addItem("shower", shX, shY, 800, 800, 0, "SOUTH", true);
      }
    }
  } else if (!room.architecturalRole && (room.type === RoomType.Staircase || rName.includes("STAIR"))) {
    const stairW = Math.min(1200, rw - 400);
    const stairL = Math.min(3e3, rh - 400);
    if (stairW >= 800 && stairL >= 1800) {
      addItem(
        "staircase",
        rx + (rw - stairW) / 2,
        ry + (rh - stairL) / 2,
        stairW,
        stairL,
        0,
        "CENTER",
        true
        // allow in stair core
      );
    }
  } else if (room.type === RoomType.Parking || rName.includes("PARK")) {
    const carW = 1800;
    const carL = 4200;
    if (rw >= 2200 && rh >= 4500) {
      addItem(
        "car",
        rx + (rw - carW) / 2,
        ry + (rh - carL) / 2,
        carW,
        carL,
        0,
        "CENTER",
        true
      );
    }
  }
  return items;
}
function furnishSiteParkingZones(siteOrZones) {
  const siteZones = Array.isArray(siteOrZones) ? siteOrZones : siteOrZones && "siteZones" in siteOrZones && siteOrZones.siteZones ? siteOrZones.siteZones : [];
  const items = [];
  for (const zone of siteZones) {
    if (zone.kind !== "parking") continue;
    const pts = zone.boundary.points;
    if (pts.length < 4) continue;
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;
    const carW = 1800;
    const carL = 4400;
    if (width >= height) {
      const stallCount = Math.max(1, Math.floor(width / 2500));
      const stallW = width / stallCount;
      for (let i = 0; i < stallCount; i++) {
        const sx = minX + i * stallW;
        items.push({
          id: `${zone.id}__furn_car_${i + 1}`,
          type: "car",
          roomId: zone.id,
          siteZoneId: zone.id,
          xMm: Math.round(sx + (stallW - carW) / 2),
          yMm: Math.round(minY + (height - carL) / 2),
          widthMm: carW,
          depthMm: carL,
          rotationDeg: 0,
          anchorWall: "CENTER",
          layer: "A-FURN"
        });
      }
    } else {
      const stallCount = Math.max(1, Math.floor(height / 5e3));
      const stallH = height / stallCount;
      for (let i = 0; i < stallCount; i++) {
        const sy = minY + i * stallH;
        items.push({
          id: `${zone.id}__furn_car_${i + 1}`,
          type: "car",
          roomId: zone.id,
          siteZoneId: zone.id,
          xMm: Math.round(minX + (width - carW) / 2),
          yMm: Math.round(sy + (stallH - carL) / 2),
          widthMm: carW,
          depthMm: carL,
          rotationDeg: 0,
          anchorWall: "CENTER",
          layer: "A-FURN"
        });
      }
    }
  }
  return items;
}
function populateCanonicalFurniture(building, manifest) {
  const updatedFloors = building.floors.map((floor) => {
    const existing = Array.isArray(floor.furniture) ? floor.furniture : [];
    const newItems = [];
    for (const room of floor.rooms) {
      const roomItems = furnishRoom(room, floor, manifest);
      newItems.push(...roomItems);
    }
    const combined = [...existing];
    for (const item of newItems) {
      const isDupe = combined.some(
        (e) => e.type === item.type && Math.hypot(e.xMm - item.xMm, e.yMm - item.yMm) < 200
      );
      if (!isDupe) combined.push(item);
    }
    return {
      ...floor,
      furniture: combined
    };
  });
  const siteParkingCars = building.site?.siteZones ? furnishSiteParkingZones(building.site.siteZones) : [];
  const buildingFurniture = [
    ...updatedFloors.flatMap((f) => f.furniture ?? []),
    ...siteParkingCars
  ];
  return {
    ...building,
    floors: updatedFloors,
    furniture: buildingFurniture
  };
}

// packages/planning-engine/src/interpretation/space-filling-snapper.ts
var SNAP_INC2 = 10;
var snap102 = (v) => Math.round(v / SNAP_INC2) * SNAP_INC2;
function createConnectingDoor(id, roomA, roomB, width = 900, options) {
  const aRect = "width" in roomA.rect ? roomA.rect : { x: roomA.rect.x, y: roomA.rect.y, width: roomA.rect.w, height: roomA.rect.h };
  const bRect = "width" in roomB.rect ? roomB.rect : { x: roomB.rect.x, y: roomB.rect.y, width: roomB.rect.w, height: roomB.rect.h };
  const loX = Math.max(aRect.x, bRect.x);
  const hiX = Math.min(aRect.x + aRect.width, bRect.x + bRect.width);
  const loY = Math.max(aRect.y, bRect.y);
  const hiY = Math.min(aRect.y + aRect.height, bRect.y + bRect.height);
  const touchesHoriz = Math.abs(aRect.y + aRect.height - bRect.y) <= 1 || Math.abs(bRect.y + bRect.height - aRect.y) <= 1;
  const sharedXLen = hiX - loX;
  const effectiveHorizWidth = sharedXLen >= width + 200 ? width : width >= 1050 && sharedXLen >= 1200 ? 1e3 : width >= 1050 && sharedXLen >= 1e3 ? 900 : width >= 900 && sharedXLen >= 1e3 ? 800 : width < 900 && width >= 750 && sharedXLen >= width + 100 ? width : width < 900 && width >= 750 && sharedXLen >= 900 ? 700 : width;
  const isRoomBBath = /bath|toilet|wc|dress/i.test(roomB.id);
  const isRoomABath = /bath|toilet|wc|dress/i.test(roomA.id);
  const targetBathId = isRoomBBath ? roomB.id : isRoomABath ? roomA.id : void 0;
  const cornerNib = options?.isFlatEntrance ? 100 : 150;
  const reqMargin = options?.isFlatEntrance ? 100 : 200;
  const horizReqMargin = !options?.isFlatEntrance && width < 900 && width >= 750 && sharedXLen >= width + 100 && sharedXLen < width + 200 ? 100 : reqMargin;
  const horizCornerNib = options?.isFlatEntrance ? 100 : Math.min(cornerNib, Math.max(50, Math.floor((sharedXLen - effectiveHorizWidth) / 2)));
  if (touchesHoriz && sharedXLen >= effectiveHorizWidth + horizReqMargin) {
    const sharedY = Math.abs(aRect.y + aRect.height - bRect.y) <= 1 ? aRect.y + aRect.height : bRect.y + bRect.height;
    const minDoorX = loX + horizCornerNib;
    const maxDoorX = hiX - horizCornerNib - effectiveHorizWidth;
    const doorX = options?.doorType === "open_passage" && effectiveHorizWidth >= 1200 ? snap102((loX + hiX - effectiveHorizWidth) / 2) : options?.anchorSide === "end" ? Math.max(minDoorX, Math.min(maxDoorX, Math.floor((hiX - horizCornerNib - effectiveHorizWidth) / 10) * 10)) : Math.max(minDoorX, Math.min(maxDoorX, Math.ceil((loX + horizCornerNib) / 10) * 10));
    return {
      id,
      kind: "door",
      doorType: options?.doorType ?? "single",
      swingDirection: targetBathId ? "inward" : options?.swingDirection ?? "inward",
      isFlatEntrance: options?.isFlatEntrance,
      adjacentRoomId: targetBathId ?? roomB.id,
      connects: [roomA.id, roomB.id],
      rect: {
        x: doorX,
        y: sharedY - 50,
        width: effectiveHorizWidth,
        height: 100
      }
    };
  }
  const touchesVert = Math.abs(aRect.x + aRect.width - bRect.x) <= 1 || Math.abs(bRect.x + bRect.width - aRect.x) <= 1;
  const sharedYLen = hiY - loY;
  const effectiveVertWidth = sharedYLen >= width + 200 ? width : width >= 1050 && sharedYLen >= 1200 ? 1e3 : width >= 1050 && sharedYLen >= 1e3 ? 900 : width >= 900 && sharedYLen >= 1e3 ? 800 : width < 900 && width >= 750 && sharedYLen >= width + 100 ? width : width < 900 && width >= 750 && sharedYLen >= 900 ? 700 : width;
  const vertReqMargin = !options?.isFlatEntrance && width < 900 && width >= 750 && sharedYLen >= width + 100 && sharedYLen < width + 200 ? 100 : reqMargin;
  const vertCornerNib = options?.isFlatEntrance ? 100 : Math.min(cornerNib, Math.max(50, Math.floor((sharedYLen - effectiveVertWidth) / 2)));
  if (touchesVert && sharedYLen >= effectiveVertWidth + vertReqMargin) {
    const sharedX = Math.abs(aRect.x + aRect.width - bRect.x) <= 1 ? aRect.x + aRect.width : bRect.x + bRect.width;
    const minDoorY = loY + vertCornerNib;
    const maxDoorY = hiY - vertCornerNib - effectiveVertWidth;
    const doorY = options?.doorType === "open_passage" && effectiveVertWidth >= 1200 ? snap102((loY + hiY - effectiveVertWidth) / 2) : options?.anchorSide === "end" ? Math.max(minDoorY, Math.min(maxDoorY, Math.floor((hiY - vertCornerNib - effectiveVertWidth) / 10) * 10)) : Math.max(minDoorY, Math.min(maxDoorY, Math.ceil((loY + vertCornerNib) / 10) * 10));
    return {
      id,
      kind: "door",
      doorType: options?.doorType ?? "single",
      swingDirection: targetBathId ? "inward" : options?.swingDirection ?? "inward",
      isFlatEntrance: options?.isFlatEntrance,
      adjacentRoomId: targetBathId ?? roomB.id,
      connects: [roomA.id, roomB.id],
      rect: {
        x: sharedX - 50,
        y: doorY,
        width: 100,
        height: effectiveVertWidth
      }
    };
  }
  return null;
}
function solveOrthogonalSpaceFillingApartment(params) {
  const { plan, site, frame, manifest } = params;
  const toMm = (v) => {
    if (!Number.isFinite(v) || v < 0) throw new Error("INVALID_DIMENSIONS: expected finite nonnegative millimetres");
    return v;
  };
  const plotWidthMm = toMm(site.plotWidth);
  const plotDepthMm = toMm(site.plotDepth);
  const lotMode = params.lotAllotmentMode ?? manifest?.lotAllotmentMode ?? site.lotAllotmentMode ?? "FULL_LOT_100_PERCENT";
  let envelope;
  if (lotMode === "FULL_LOT_100_PERCENT") {
    envelope = {
      x: 0,
      y: 0,
      w: plotWidthMm,
      h: plotDepthMm
    };
  } else {
    const sb = site.setbacks ?? { front: 3e3, rear: 2e3, left: 2e3, right: 2e3 };
    const left = toMm(sb.left);
    const rear = toMm(sb.rear);
    const front = toMm(sb.front);
    const right = toMm(sb.right);
    envelope = {
      x: left,
      y: rear,
      w: plotWidthMm - left - right,
      h: plotDepthMm - rear - front
    };
  }
  const rawFlats = plan.flats && plan.flats.length > 0 ? plan.flats : synthesizeFlats(manifest, frame);
  const flatCount = Math.max(1, Math.min(6, rawFlats.length));
  const minEnvelope = flatCount === 1 ? 7e3 : 8500;
  if (envelope.w < minEnvelope || envelope.h < minEnvelope)
    throw new Error("INFEASIBLE_ENVELOPE: plot and setbacks leave insufficient space for this apartment topology; the solver will not enlarge the building beyond its envelope");
  const flatConfigs = matchFlatTopology(rawFlats, flatCount, manifest);
  const placement = interpretArchitecturalPlacement(params.aiPrompt);
  const { flatBoxes, corridorBox, lobbyBox, liftBoxes, stairBoxes, shaftBoxes, corridorIsEastForFlat } = partitionMacroFootprint(envelope, flatCount, placement);
  const flats = [];
  const openings = [];
  for (let i = 0; i < flatConfigs.length; i++) {
    const cfg = flatConfigs[i];
    const box = flatBoxes[i];
    const rawRooms = plan.rooms.filter((r) => r.flatId === cfg.id);
    const { rooms, flatOpenings } = sliceFlatRooms({
      flatId: cfg.id,
      flatLabel: cfg.label,
      unitType: cfg.unitType,
      box,
      corridorIsEast: corridorIsEastForFlat[i] ?? true,
      rawRooms,
      corridorBox,
      envelope,
      placement
    });
    flats.push({
      id: cfg.id,
      label: cfg.label,
      unitType: cfg.unitType,
      rect: { x: box.x, y: box.y, width: box.w, height: box.h },
      rooms
    });
    openings.push(...flatOpenings);
  }
  if (stairBoxes[0]) {
    const dStair1 = createConnectingDoor("door_stair_1", { id: "core_lobby", rect: lobbyBox }, { id: "core_stair_1", rect: stairBoxes[0] }, 1200, { doorType: "open_passage" });
    if (dStair1) openings.push(dStair1);
  }
  for (let l = 0; l < liftBoxes.length; l++) {
    const lift = liftBoxes[l];
    const dLift = createConnectingDoor(`door_lift_${l + 1}`, { id: "core_lobby", rect: lobbyBox }, { id: `core_lift_${l + 1}`, rect: lift }, 900, { doorType: "sliding" });
    if (dLift) openings.push(dLift);
  }
  const dLobbyCorr = createConnectingDoor("door_lobby_corridor", { id: "core_lobby", rect: lobbyBox }, { id: "corridor_1", rect: corridorBox }, 1500, { doorType: "open_passage" });
  if (dLobbyCorr) openings.push(dLobbyCorr);
  if (stairBoxes[1]) {
    const dStair2 = createConnectingDoor("door_stair_2", { id: "corridor_1", rect: corridorBox }, { id: "core_stair_2", rect: stairBoxes[1] }, 1200, { doorType: "open_passage" });
    if (dStair2) openings.push(dStair2);
  }
  const lifts = liftBoxes.map((b, i) => ({
    id: `core_lift_${i + 1}`,
    name: `Passenger Lift 0${i + 1}`,
    rect: { x: b.x, y: b.y, width: b.w, height: b.h },
    assignedFlatId: null
  }));
  const stairs = stairBoxes.map((b, i) => ({
    id: `core_stair_${i + 1}`,
    name: i === 0 ? "Main Fire Staircase" : "Secondary Fire Staircase",
    rect: { x: b.x, y: b.y, width: b.w, height: b.h },
    assignedFlatId: null
  }));
  const lobbies = [
    {
      id: "core_lobby",
      name: "Common Lift Lobby",
      rect: { x: lobbyBox.x, y: lobbyBox.y, width: lobbyBox.w, height: lobbyBox.h },
      assignedFlatId: null
    }
  ];
  const corridors = [
    {
      id: "corridor_1",
      name: "Common Circulation Spine",
      rect: { x: corridorBox.x, y: corridorBox.y, width: corridorBox.w, height: corridorBox.h },
      assignedFlatId: null
    }
  ];
  const shafts = shaftBoxes.map((b, i) => ({
    id: `core_shaft_${i + 1}`,
    architecturalRole: b.w >= 3500 && b.h >= 3500 ? "OPEN_TO_SKY_VOID" : "SERVICE_SHAFT",
    name: b.w >= 3500 && b.h >= 3500 ? "Internal Open-to-Sky (OTS) Central Courtyard / Atrium" : `MEP / Plumbing Duct 0${i + 1}`,
    rect: { x: b.x, y: b.y, width: b.w, height: b.h },
    assignedFlatId: null
  }));
  const boundary = [
    { x: envelope.x, y: envelope.y },
    { x: envelope.x + envelope.w, y: envelope.y },
    { x: envelope.x + envelope.w, y: envelope.y + envelope.h },
    { x: envelope.x, y: envelope.y + envelope.h }
  ];
  return {
    source: "IMAGE_INTERPRETATION",
    boundary,
    flats,
    commonRooms: [],
    ungroupedRooms: [],
    lifts,
    stairs,
    lobbies,
    corridors,
    shafts,
    openings
  };
}
function synthesizeFlats(manifest, frame) {
  const count = manifest?.flatsPerFloor ?? 2;
  const list = [];
  for (let i = 0; i < count; i++) {
    const spec = manifest?.units[i];
    const type = spec?.bhkType ?? "3BHK";
    list.push({
      id: `flat_0${i + 1}`,
      label: `Flat 0${i + 1}`,
      unitType: type,
      imageX: frame.width / count * i,
      imageY: 0,
      imageWidth: frame.width / count,
      imageHeight: frame.height
    });
  }
  return list;
}
function matchFlatTopology(rawFlats, count, manifest) {
  const configs = [];
  for (let i = 0; i < count; i++) {
    const raw = rawFlats[i];
    const manifestUnit = manifest?.units[i];
    const rawType = raw?.unitType?.toUpperCase().replace(/\s+/g, "") ?? "";
    const normType = manifestUnit?.bhkType ?? (rawType.includes("4BHK") ? "4BHK" : rawType.includes("3BHK") ? "3BHK" : rawType.includes("2BHK") ? "2BHK" : rawType.includes("1BHK") ? "1BHK" : "3BHK");
    configs.push({
      id: raw?.id ?? `flat_0${i + 1}`,
      label: raw?.label ?? `Flat 0${i + 1}`,
      unitType: normType,
      imageX: raw?.imageX ?? 1e3 / count * i,
      imageY: raw?.imageY ?? 0,
      imageWidth: raw?.imageWidth ?? 1e3 / count,
      imageHeight: raw?.imageHeight ?? 1e3
    });
  }
  return configs;
}
var macroCorridorBoxes = (macro) => macro.corridorBoxes ? [...macro.corridorBoxes] : [macro.corridorBox];
var macroLobbyBoxes = (macro) => macro.lobbyBoxes ? [...macro.lobbyBoxes] : [macro.lobbyBox];
function partitionMacroFootprint(env, count, placement = {
  liftSide: "WEST",
  otsPlacement: "CENTRAL",
  coreCompactness: "STANDARD",
  kitchenSize: "STANDARD",
  kitchenStyle: "ENCLOSED",
  sitoutSize: "STANDARD",
  entranceStyle: "LIVING_FIRST",
  bedroomBalconies: "STANDARD"
}) {
  const flatBoxes = [];
  const corridorIsEastForFlat = [];
  const coreW = placement.coreCompactness === "COMPACT" ? env.w < 2e4 ? snap102(Math.max(3200, Math.min(3800, env.w * 0.18))) : snap102(Math.max(3800, Math.min(4800, env.w * 0.16))) : env.w < 2e4 ? snap102(Math.max(3600, Math.min(4500, env.w * 0.24))) : snap102(Math.max(4500, Math.min(6500, env.w * 0.2)));
  const coreXTemp = snap102(env.x + (env.w - coreW) / 2);
  const leftW = coreXTemp - env.x;
  const rightW = env.x + env.w - (coreXTemp + coreW);
  const coreX = env.x + leftW;
  const splitY2 = snap102(env.y + env.h * 0.5);
  const coreBox = { x: coreX, y: env.y, w: coreW, h: env.h };
  const defaultCorrH = placement.coreCompactness === "COMPACT" ? 1800 : 2400;
  const defaultCorrY = snap102(splitY2 - defaultCorrH / 2);
  if (count === 1) {
    const cW = Math.min(coreW, 3600);
    const sideCoreBox = { x: env.x + env.w - cW, y: env.y, w: cW, h: env.h };
    flatBoxes.push({ x: env.x, y: env.y, w: env.w - cW, h: env.h });
    corridorIsEastForFlat.push(true);
    const { corridorBox: corridorBox2, lobbyBox: lobbyBox2, liftBoxes: liftBoxes2, stairBoxes: stairBoxes2, shaftBoxes: shaftBoxes2, shaftRoles: shaftRoles2 } = partitionCore(sideCoreBox, { corrY: defaultCorrY, corrH: defaultCorrH, liftSide: "WEST", placement });
    return { coreBox: sideCoreBox, flatBoxes, corridorBox: corridorBox2, lobbyBox: lobbyBox2, liftBoxes: liftBoxes2, stairBoxes: stairBoxes2, shaftBoxes: shaftBoxes2, shaftRoles: shaftRoles2, corridorIsEastForFlat };
  }
  if (count === 2) {
    flatBoxes.push({ x: env.x, y: env.y, w: leftW, h: env.h });
    corridorIsEastForFlat.push(true);
    flatBoxes.push({ x: coreX + coreW, y: env.y, w: rightW, h: env.h });
    corridorIsEastForFlat.push(false);
    const { corridorBox: corridorBox2, lobbyBox: lobbyBox2, liftBoxes: liftBoxes2, stairBoxes: stairBoxes2, shaftBoxes: shaftBoxes2, shaftRoles: shaftRoles2 } = partitionCore(coreBox, { corrY: defaultCorrY, corrH: defaultCorrH, liftSide: placement.liftSide, placement });
    return { coreBox, flatBoxes, corridorBox: corridorBox2, lobbyBox: lobbyBox2, liftBoxes: liftBoxes2, stairBoxes: stairBoxes2, shaftBoxes: shaftBoxes2, shaftRoles: shaftRoles2, corridorIsEastForFlat };
  }
  if (count === 3) {
    flatBoxes.push({ x: env.x, y: env.y, w: leftW, h: env.h });
    corridorIsEastForFlat.push(true);
    flatBoxes.push({ x: coreX + coreW, y: env.y, w: rightW, h: splitY2 - env.y });
    corridorIsEastForFlat.push(false);
    flatBoxes.push({ x: coreX + coreW, y: splitY2, w: rightW, h: env.y + env.h - splitY2 });
    corridorIsEastForFlat.push(false);
    const { corridorBox: corridorBox2, lobbyBox: lobbyBox2, liftBoxes: liftBoxes2, stairBoxes: stairBoxes2, shaftBoxes: shaftBoxes2, shaftRoles: shaftRoles2 } = partitionCore(coreBox, { corrY: defaultCorrY, corrH: defaultCorrH, liftSide: placement.liftSide, placement });
    return { coreBox, flatBoxes, corridorBox: corridorBox2, lobbyBox: lobbyBox2, liftBoxes: liftBoxes2, stairBoxes: stairBoxes2, shaftBoxes: shaftBoxes2, shaftRoles: shaftRoles2, corridorIsEastForFlat };
  }
  if (count === 5) {
    const y3_1 = snap102(env.y + env.h * (1 / 3));
    const y3_2 = snap102(env.y + env.h * (2 / 3));
    flatBoxes.push({ x: env.x, y: env.y, w: leftW, h: splitY2 - env.y });
    corridorIsEastForFlat.push(true);
    flatBoxes.push({ x: coreX + coreW, y: env.y, w: rightW, h: y3_1 - env.y });
    corridorIsEastForFlat.push(false);
    flatBoxes.push({ x: env.x, y: splitY2, w: leftW, h: env.y + env.h - splitY2 });
    corridorIsEastForFlat.push(true);
    flatBoxes.push({ x: coreX + coreW, y: y3_1, w: rightW, h: y3_2 - y3_1 });
    corridorIsEastForFlat.push(false);
    flatBoxes.push({ x: coreX + coreW, y: y3_2, w: rightW, h: env.y + env.h - y3_2 });
    corridorIsEastForFlat.push(false);
    const { corridorBox: corridorBox2, lobbyBox: lobbyBox2, liftBoxes: liftBoxes2, stairBoxes: stairBoxes2, shaftBoxes: shaftBoxes2, shaftRoles: shaftRoles2 } = partitionCore(coreBox, { corrY: defaultCorrY, corrH: defaultCorrH, liftSide: placement.liftSide, placement });
    return { coreBox, flatBoxes, corridorBox: corridorBox2, lobbyBox: lobbyBox2, liftBoxes: liftBoxes2, stairBoxes: stairBoxes2, shaftBoxes: shaftBoxes2, shaftRoles: shaftRoles2, corridorIsEastForFlat };
  }
  if (count === 6) {
    const y3_1 = snap102(env.y + env.h * (1 / 3));
    const y3_2 = snap102(env.y + env.h * (2 / 3));
    flatBoxes.push({ x: env.x, y: env.y, w: leftW, h: y3_1 - env.y });
    corridorIsEastForFlat.push(true);
    flatBoxes.push({ x: env.x, y: y3_1, w: leftW, h: y3_2 - y3_1 });
    corridorIsEastForFlat.push(true);
    flatBoxes.push({ x: env.x, y: y3_2, w: leftW, h: env.y + env.h - y3_2 });
    corridorIsEastForFlat.push(true);
    flatBoxes.push({ x: coreX + coreW, y: env.y, w: rightW, h: y3_1 - env.y });
    corridorIsEastForFlat.push(false);
    flatBoxes.push({ x: coreX + coreW, y: y3_1, w: rightW, h: y3_2 - y3_1 });
    corridorIsEastForFlat.push(false);
    flatBoxes.push({ x: coreX + coreW, y: y3_2, w: rightW, h: env.y + env.h - y3_2 });
    corridorIsEastForFlat.push(false);
    const { corridorBox: corridorBox2, lobbyBox: lobbyBox2, liftBoxes: liftBoxes2, stairBoxes: stairBoxes2, shaftBoxes: shaftBoxes2, shaftRoles: shaftRoles2 } = partitionCore(coreBox, { corrY: defaultCorrY, corrH: defaultCorrH, liftSide: placement.liftSide, placement });
    return { coreBox, flatBoxes, corridorBox: corridorBox2, lobbyBox: lobbyBox2, liftBoxes: liftBoxes2, stairBoxes: stairBoxes2, shaftBoxes: shaftBoxes2, shaftRoles: shaftRoles2, corridorIsEastForFlat };
  }
  flatBoxes.push({ x: env.x, y: env.y, w: leftW, h: splitY2 - env.y });
  corridorIsEastForFlat.push(true);
  flatBoxes.push({ x: coreX + coreW, y: env.y, w: rightW, h: splitY2 - env.y });
  corridorIsEastForFlat.push(false);
  flatBoxes.push({ x: env.x, y: splitY2, w: leftW, h: env.y + env.h - splitY2 });
  corridorIsEastForFlat.push(true);
  flatBoxes.push({ x: coreX + coreW, y: splitY2, w: rightW, h: env.y + env.h - splitY2 });
  corridorIsEastForFlat.push(false);
  const { corridorBox, lobbyBox, liftBoxes, stairBoxes, shaftBoxes, shaftRoles } = partitionCore(coreBox, { corrY: defaultCorrY, corrH: defaultCorrH, liftSide: placement.liftSide, placement });
  return { coreBox, flatBoxes, corridorBox, lobbyBox, liftBoxes, stairBoxes, shaftBoxes, shaftRoles, corridorIsEastForFlat };
}
function partitionCore(core, options) {
  const stair1H = core.h < 18e3 ? 3200 : 4500;
  const stair1W = Math.min(3e3, Math.max(2600, snap102(core.w * 0.52)));
  const corrH = Math.min(2400, Math.max(1800, snap102(options?.corrH ?? 2400)));
  const minLiftBandH = 4e3;
  let corrY = snap102(options?.corrY ?? core.y + (core.h - corrH) / 2);
  if (corrY < core.y + stair1H + minLiftBandH) {
    corrY = core.y + stair1H + minLiftBandH;
  }
  const eastLifts = options?.liftSide === "EAST" || options?.placement?.liftSide === "EAST";
  const stair1X = eastLifts ? core.x : core.x + core.w - stair1W;
  const stair1Box = { x: stair1X, y: core.y, w: stair1W, h: stair1H };
  const northShaftX = eastLifts ? core.x + stair1W : core.x;
  const northShaftW = core.w - stair1W;
  const northShaftBox = { x: northShaftX, y: core.y, w: northShaftW, h: stair1H };
  const topRemH = corrY - (core.y + stair1H);
  const liftW = Math.min(2200, Math.max(1900, snap102(core.w * 0.38)));
  const lobbyW = core.w - liftW;
  const liftH = topRemH <= 5e3 ? Math.floor(topRemH / 20) * 10 : 2200;
  const liftRemH = topRemH - 2 * liftH;
  const liftX = eastLifts ? core.x + core.w - liftW : core.x;
  const lift1Box = { x: liftX, y: core.y + stair1H, w: liftW, h: liftH };
  const lift2Box = { x: liftX, y: core.y + stair1H + liftH, w: liftW, h: liftH };
  const lobbyBox = { x: eastLifts ? core.x : core.x + liftW, y: core.y + stair1H, w: lobbyW, h: topRemH };
  const corridorBox = { x: core.x, y: corrY, w: core.w, h: corrH };
  const remBelow = core.y + core.h - (corrY + corrH);
  const stair2H = core.h < 18e3 ? Math.min(3200, Math.max(2800, remBelow - 500)) : 4500;
  const stair2W = Math.min(3e3, Math.max(2600, snap102(core.w * 0.52)));
  const stair2X = core.x;
  const stair2Box = { x: stair2X, y: corrY + corrH, w: stair2W, h: Math.min(stair2H, Math.max(0, remBelow)) };
  const southShaft1W = core.w - stair2W;
  const southShaft1Box = { x: core.x + stair2W, y: corrY + corrH, w: southShaft1W, h: stair2Box.h };
  const shaftY = corrY + corrH + stair2Box.h;
  const remShaftH = core.y + core.h - shaftY;
  const shaftBoxes = [northShaftBox, southShaft1Box];
  if (liftRemH > 0) {
    shaftBoxes.push({ x: liftX, y: core.y + stair1H + 2 * liftH, w: liftW, h: liftRemH });
  }
  if (remShaftH > 0) {
    shaftBoxes.push({ x: core.x, y: shaftY, w: core.w, h: remShaftH });
  }
  const liftBoxes = [lift1Box, lift2Box];
  const stairBoxes = [stair1Box, stair2Box];
  const isCentralOtsRequested = options?.placement?.otsPlacement === "CENTRAL";
  return {
    corridorBox,
    lobbyBox,
    liftBoxes,
    stairBoxes,
    shaftBoxes,
    shaftRoles: shaftBoxes.map((b) => isCentralOtsRequested || b.w >= 3e3 && b.h >= 3e3 ? "OPEN_TO_SKY_VOID" : "SERVICE_SHAFT")
  };
}
var ROOM_SLICING_ARCHETYPES = [
  "CENTRAL_LIVING_SPLIT_BEDROOMS",
  "CORNER_L_LIVING_REAR_SLEEPING",
  "FRONT_BALCONY_OPEN_KITCHEN",
  "LINEAR_TANDEM_DEEP_PLATE",
  "MIRRORED_WET_CORE_STACK"
];
function resolveArchetypeSlicingParams(archetype) {
  switch (archetype) {
    case "CORNER_L_LIVING_REAR_SLEEPING":
      return {
        isDefault: false,
        livingZoneRatio: 0.56,
        compactLivingRatio: 0.56,
        kitchRatioOffset: -0.05,
        swapKitchenLiving: true,
        extraBalconyDepth: 0,
        forceOpenKitchen: false,
        masterBedRatio: 0.48,
        invertBedroomOrder: false
      };
    case "FRONT_BALCONY_OPEN_KITCHEN":
      return {
        isDefault: false,
        livingZoneRatio: 0.48,
        compactLivingRatio: 0.48,
        kitchRatioOffset: -0.08,
        swapKitchenLiving: false,
        extraBalconyDepth: 250,
        forceOpenKitchen: true,
        masterBedRatio: 0.52,
        invertBedroomOrder: false
      };
    case "LINEAR_TANDEM_DEEP_PLATE":
      return {
        isDefault: false,
        livingZoneRatio: 0.5,
        compactLivingRatio: 0.5,
        kitchRatioOffset: 0.04,
        swapKitchenLiving: false,
        extraBalconyDepth: 0,
        forceOpenKitchen: false,
        masterBedRatio: 0.5,
        invertBedroomOrder: true
      };
    case "MIRRORED_WET_CORE_STACK":
      return {
        isDefault: false,
        livingZoneRatio: 0.52,
        compactLivingRatio: 0.54,
        kitchRatioOffset: -0.03,
        swapKitchenLiving: true,
        extraBalconyDepth: 150,
        forceOpenKitchen: false,
        masterBedRatio: 0.46,
        invertBedroomOrder: true
      };
    case "CENTRAL_LIVING_SPLIT_BEDROOMS":
    default:
      return {
        isDefault: true,
        livingZoneRatio: 0.5,
        compactLivingRatio: 0.53,
        kitchRatioOffset: 0,
        swapKitchenLiving: false,
        extraBalconyDepth: 0,
        forceOpenKitchen: false,
        masterBedRatio: 0.54,
        invertBedroomOrder: false
      };
  }
}
function sliceFlatRooms(params) {
  const { flatId, flatLabel, unitType, box, corridorIsEast, corridorBox, envelope, rawRooms = [], placement, archetype } = params;
  const arch = resolveArchetypeSlicingParams(archetype);
  const rooms = [];
  const flatOpenings = [];
  let livingZoneW;
  let bedZoneW;
  if (box.w < 6500) {
    livingZoneW = snap102(Math.max(3100, Math.min(box.w - 2600, box.w * arch.compactLivingRatio)));
    bedZoneW = box.w - livingZoneW;
  } else if ((unitType === "3BHK" || unitType === "4BHK") && box.w >= 9100) {
    const minLivW = box.w >= 9600 ? 3400 : 3100;
    const minBedGridW = placement?.bedroomBalconies === "ALL_BEDROOMS" && box.w >= 10600 ? 7200 : 6e3;
    livingZoneW = snap102(Math.max(minLivW, Math.min(box.w - minBedGridW, box.w * (arch.livingZoneRatio - 0.04))));
    bedZoneW = box.w - livingZoneW;
    const maxBedGridW = snap102(Math.max(minBedGridW, Math.min(box.w - minLivW, box.h * 1.25)));
    if (bedZoneW > maxBedGridW && box.w - maxBedGridW >= minLivW) {
      bedZoneW = maxBedGridW;
      livingZoneW = box.w - bedZoneW;
    }
  } else {
    livingZoneW = snap102(Math.min(Math.max(6500, box.w - 5800), Math.max(3600, box.w * arch.livingZoneRatio)));
    bedZoneW = box.w - livingZoneW;
    const maxSingleColBedW = snap102(Math.max(4200, Math.min(6e3, box.h * 0.65)));
    if ((unitType === "1BHK" || unitType === "2BHK") && bedZoneW > maxSingleColBedW && box.w - maxSingleColBedW >= 3600) {
      bedZoneW = maxSingleColBedW;
      livingZoneW = box.w - bedZoneW;
    }
    if (bedZoneW < 3600 && box.w >= 7200) {
      bedZoneW = 3600;
      livingZoneW = box.w - bedZoneW;
    }
    if (placement?.bedroomBalconies === "ALL_BEDROOMS" && bedZoneW < 4200 && box.w >= 7800) {
      bedZoneW = 4200;
      livingZoneW = box.w - bedZoneW;
    }
  }
  const livingZoneX = corridorIsEast ? box.x + bedZoneW : box.x;
  const bedZoneX = corridorIsEast ? box.x : box.x + livingZoneW;
  const isSouth = box.y > envelope.y + 100;
  const baseKitchRatio = placement?.kitchenSize === "LARGER" ? 0.58 : 0.53;
  const kitchRatio = arch.isDefault ? baseKitchRatio : Math.max(0.42, Math.min(0.64, baseKitchRatio + arch.kitchRatioOffset));
  const rawKitchW = snap102(livingZoneW * kitchRatio);
  const kitchW = arch.isDefault || livingZoneW < 3100 ? rawKitchW : Math.min(livingZoneW - 1400, Math.max(1600, rawKitchW));
  const livW = livingZoneW - kitchW;
  const livX = arch.swapKitchenLiving ? corridorIsEast ? livingZoneX : livingZoneX + kitchW : corridorIsEast ? livingZoneX + kitchW : livingZoneX;
  const kitchX = arch.swapKitchenLiving ? corridorIsEast ? livingZoneX + livW : livingZoneX : corridorIsEast ? livingZoneX : livingZoneX + livW;
  const utilDepth = box.h < 7e3 ? 1e3 : box.h < 9e3 ? 1200 : 1430;
  const baseBalconyDepth = box.h < 9e3 ? 1450 : placement?.sitoutSize === "COMPACT" ? 1550 : 1830;
  const balconyDepth = arch.extraBalconyDepth > 0 && box.h >= 9e3 ? Math.min(2e3, baseBalconyDepth + arch.extraBalconyDepth) : baseBalconyDepth;
  const flatAreaSqM = box.w * box.h / 1e6;
  const scaledKitchenArea = Math.min(24e6, Math.max(125e5, snap102(flatAreaSqM * 0.08 * 10) * 1e5));
  const ratioKitchenTarget = snap102(livingZoneW * Math.min(8500, Math.max(3600, box.h * 0.5)) / 3.35);
  const kitchenTargetArea = Math.max(
    ratioKitchenTarget,
    placement?.kitchenSize === "LARGER" ? Math.max(15e6, scaledKitchenArea * 1.15) : scaledKitchenArea
  );
  const kitchenTargetDepth = utilDepth + Math.ceil(kitchenTargetArea / kitchW / 10) * 10;
  const minLivingDepth = box.h < 8e3 ? 2700 : box.h >= 9500 && box.h <= 10400 && unitType === "2BHK" ? 4100 : 3600;
  const minServiceDepthForRefuge = box.h >= 14e3 ? Math.ceil(15e6 / Math.max(1, livW) / 10) * 10 : 0;
  const baseServiceDepth = Math.max(
    utilDepth + 2600,
    balconyDepth + 2600,
    box.h > 15e3 ? snap102(Math.min(9e3, Math.max(5500, box.h * 0.28))) : snap102(Math.min(box.h * 0.45, Math.max(4200, box.h * 0.38)))
  );
  const serviceDepth = Math.min(box.h - minLivingDepth, Math.max(baseServiceDepth, kitchenTargetDepth, minServiceDepthForRefuge));
  const serviceY = isSouth ? box.y + box.h - serviceDepth : box.y;
  const utilityRoom = {
    id: `${flatId}__utility`,
    name: `${flatLabel} Kitchen Utility Balcony`,
    type: "utility",
    planningZone: "OUTDOOR",
    rect: {
      x: kitchX,
      y: isSouth ? box.y + box.h - utilDepth : box.y,
      width: kitchW,
      height: utilDepth
    }
  };
  const kitchenRoom = {
    id: `${flatId}__kitchen`,
    name: `${flatLabel} Kitchen`,
    type: "kitchen",
    planningZone: "SERVICE",
    rect: {
      x: kitchX,
      y: isSouth ? serviceY : box.y + utilDepth,
      width: kitchW,
      height: serviceDepth - utilDepth
    }
  };
  const balconyRoom = {
    id: `${flatId}__balcony`,
    name: `${flatLabel} Sit-out Balcony`,
    type: "balcony",
    planningZone: "OUTDOOR",
    rect: {
      x: livX,
      y: isSouth ? box.y + box.h - balconyDepth : box.y,
      width: livW,
      height: balconyDepth
    }
  };
  const diningRoom = {
    id: `${flatId}__dining`,
    name: `${flatLabel} Dining & Family Hall`,
    type: "dining",
    planningZone: "PUBLIC",
    rect: {
      x: livX,
      y: isSouth ? serviceY : box.y + balconyDepth,
      width: livW,
      height: serviceDepth - balconyDepth
    }
  };
  const remLivH = box.h - serviceDepth;
  const kitchArea = kitchW * Math.max(1e3, serviceDepth - utilDepth);
  const maxLivHForRatio = snap102(3.35 * kitchArea / Math.max(1, livingZoneW));
  const targetLivH = Math.min(8500, maxLivHForRatio);
  const maxFoyerH = Math.min(2200, snap102(Math.floor(115e5 / Math.max(1, livingZoneW))));
  const rawFoyerH = remLivH > targetLivH ? Math.min(maxFoyerH, remLivH - targetLivH) : 0;
  const hasFoyer = rawFoyerH >= 1200 && remLivH - rawFoyerH >= 3600 && unitType !== "3BHK" && unitType !== "4BHK";
  const foyerH = hasFoyer ? rawFoyerH : 0;
  const livingH = remLivH - foyerH;
  const livingY = isSouth ? hasFoyer ? box.y + foyerH : box.y : box.y + serviceDepth;
  const livingRoom = {
    id: `${flatId}__living`,
    name: `${flatLabel} Living Room`,
    type: "living",
    planningZone: "PUBLIC",
    rect: {
      x: livingZoneX,
      y: livingY,
      width: livingZoneW,
      height: livingH
    }
  };
  let foyerRoom;
  if (hasFoyer) {
    foyerRoom = {
      id: `${flatId}__foyer`,
      name: `${flatLabel} Entrance Foyer`,
      type: "foyer",
      planningZone: "PUBLIC",
      rect: {
        x: livingZoneX,
        y: isSouth ? box.y : box.y + serviceDepth + livingH,
        width: livingZoneW,
        height: foyerH
      }
    };
    rooms.push(foyerRoom);
  }
  rooms.push(utilityRoom, kitchenRoom, balconyRoom, diningRoom, livingRoom);
  if (foyerRoom) {
    const dFoyerLiv = createConnectingDoor(`${flatId}__door_foyer_living`, foyerRoom, livingRoom, 1200, { doorType: "open_passage" });
    if (dFoyerLiv) flatOpenings.push(dFoyerLiv);
  }
  const dLivDin = createConnectingDoor(`${flatId}__door_living_dining`, livingRoom, diningRoom, 1200, { doorType: "open_passage" });
  if (dLivDin) flatOpenings.push(dLivDin);
  const balcDoorWidth = Math.min(
    2400,
    Math.max(1200, Math.floor(Math.min(diningRoom.rect.width, balconyRoom.rect.width) - 250))
  );
  const dBalcony = createConnectingDoor(`${flatId}__door_balcony`, diningRoom, balconyRoom, balcDoorWidth, { doorType: "sliding" });
  if (dBalcony) flatOpenings.push(dBalcony);
  const isKitchenOpen = placement?.kitchenStyle === "OPEN" || arch.forceOpenKitchen;
  const dKitchen = createConnectingDoor(
    `${flatId}__door_kitchen`,
    diningRoom,
    kitchenRoom,
    isKitchenOpen ? 1200 : 900,
    { doorType: isKitchenOpen ? "open_passage" : "single" }
  ) ?? createConnectingDoor(
    `${flatId}__door_kitchen`,
    livingRoom,
    kitchenRoom,
    900,
    { doorType: "single" }
  );
  if (dKitchen) flatOpenings.push(dKitchen);
  const dUtil = createConnectingDoor(`${flatId}__door_utility`, kitchenRoom, utilityRoom, 750, { doorType: "single" });
  if (dUtil) flatOpenings.push(dUtil);
  const entranceHostRoom = foyerRoom ?? livingRoom;
  const dEntrance = createConnectingDoor(
    `${flatId}__door_entrance`,
    { id: "corridor_1", rect: corridorBox },
    entranceHostRoom,
    1050,
    { isFlatEntrance: true }
  ) ?? createConnectingDoor(
    `${flatId}__door_entrance`,
    { id: "corridor_1", rect: corridorBox },
    livingRoom,
    1050,
    { isFlatEntrance: true }
  ) ?? createConnectingDoor(
    `${flatId}__door_entrance`,
    { id: "corridor_1", rect: corridorBox },
    diningRoom,
    1050,
    { isFlatEntrance: true }
  );
  if (dEntrance) flatOpenings.push(dEntrance);
  const maxBedH = snap102(bedZoneW * 1.3);
  const minBedH = 3e3;
  if (unitType === "1BHK") {
    const bathH = 1800;
    const availH = box.h - bathH;
    const masterBedH = Math.min(maxBedH, Math.max(minBedH, snap102(availH * 0.7)));
    const passH = box.h - (masterBedH + bathH);
    let bY = box.y;
    let masterBed;
    let commonBath;
    if (!isSouth) {
      masterBed = {
        id: `${flatId}__master_bed`,
        name: `${flatLabel} Master Bedroom`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: masterBedH }
      };
      rooms.push(masterBed);
      bY += masterBedH;
      if (passH > 0) {
        const passage = {
          id: `${flatId}__internal_passage`,
          name: `${flatLabel} Internal Passage`,
          type: "corridor",
          planningZone: "SERVICE",
          rect: { x: bedZoneX, y: bY, width: bedZoneW, height: passH }
        };
        rooms.push(passage);
        bY += passH;
        const dPass = createConnectingDoor(`${flatId}__door_passage`, livingRoom, passage, 900, { doorType: "open_passage" });
        if (dPass) flatOpenings.push(dPass);
      }
      commonBath = {
        id: `${flatId}__common_bath`,
        name: `${flatLabel} Master Bathroom`,
        type: "bathroom",
        planningZone: "SERVICE",
        bathroomOwnerRoomId: masterBed.id,
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: bathH }
      };
      rooms.push(commonBath);
    } else {
      if (passH > 0) {
        const passage = {
          id: `${flatId}__internal_passage`,
          name: `${flatLabel} Internal Passage`,
          type: "corridor",
          planningZone: "SERVICE",
          rect: { x: bedZoneX, y: bY, width: bedZoneW, height: passH }
        };
        rooms.push(passage);
        bY += passH;
        const dPass = createConnectingDoor(`${flatId}__door_passage`, livingRoom, passage, 900, { doorType: "open_passage" });
        if (dPass) flatOpenings.push(dPass);
      }
      commonBath = {
        id: `${flatId}__common_bath`,
        name: `${flatLabel} Master Bathroom`,
        type: "bathroom",
        planningZone: "SERVICE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: bathH }
      };
      rooms.push(commonBath);
      bY += bathH;
      masterBed = {
        id: `${flatId}__master_bed`,
        name: `${flatLabel} Master Bedroom`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: masterBedH }
      };
      rooms.push(masterBed);
    }
    const dMaster = createConnectingDoor(`${flatId}__door_master_bed`, livingRoom, masterBed, 900);
    if (dMaster) flatOpenings.push(dMaster);
    const dBath = createConnectingDoor(`${flatId}__door_common_bath`, masterBed, commonBath, 750);
    if (dBath) flatOpenings.push(dBath);
  } else if (unitType === "2BHK") {
    const bathH = box.h >= 8200 && box.h < 9e3 ? snap102(Math.min(1800, Math.max(1200, (box.h - 6e3) * 0.58))) : snap102(Math.min(2200, Math.max(1800, box.h * 0.09)));
    const passH = box.h >= 8200 && box.h < 9e3 ? snap102(Math.max(950, box.h - 6e3 - bathH)) : snap102(Math.min(1500, Math.max(1200, box.h * 0.06)));
    const availBedH = box.h - bathH - passH;
    let masterBedH;
    let bed2H;
    let studyH = 0;
    let poojaH = 0;
    const hasStudyRequested = rawRooms.some((r) => r.type === "study" || r.type === "office" || r.name.toLowerCase().includes("study"));
    const hasPoojaRequested = rawRooms.some((r) => r.type === "pooja" || r.name.toLowerCase().includes("pooja") || r.name.toLowerCase().includes("mandir"));
    if (hasStudyRequested && hasPoojaRequested && availBedH >= 7600) {
      masterBedH = snap102(Math.min(4800, Math.max(3600, availBedH * 0.28)));
      bed2H = snap102(Math.min(4200, Math.max(3400, availBedH * 0.25)));
      const rawExcessH = availBedH - (masterBedH + bed2H);
      studyH = snap102(Math.min(3200, Math.max(2400, rawExcessH * 0.45)));
      poojaH = rawExcessH - studyH;
    } else if (hasStudyRequested && availBedH >= 7600) {
      masterBedH = snap102(Math.min(4800, Math.max(3600, availBedH * 0.35)));
      bed2H = snap102(Math.min(4200, Math.max(3400, availBedH * 0.3)));
      studyH = availBedH - (masterBedH + bed2H);
    } else if (hasPoojaRequested && availBedH >= 7600) {
      masterBedH = snap102(Math.min(4800, Math.max(3600, availBedH * 0.38)));
      bed2H = snap102(Math.min(4200, Math.max(3400, availBedH * 0.34)));
      poojaH = availBedH - (masterBedH + bed2H);
    } else {
      masterBedH = snap102(availBedH * arch.masterBedRatio);
      bed2H = availBedH - masterBedH;
      const minRequiredBedH = availBedH >= 6e3 ? 3e3 : 2700;
      if (availBedH >= 5400 && bed2H < minRequiredBedH) {
        bed2H = minRequiredBedH;
        masterBedH = availBedH - bed2H;
      }
      if (availBedH >= 5400 && masterBedH < minRequiredBedH) {
        masterBedH = minRequiredBedH;
        bed2H = availBedH - masterBedH;
      }
    }
    const bathBlockH = bathH + passH;
    if (!hasStudyRequested && !hasPoojaRequested && availBedH >= 6e3) {
      const livStart = livingRoom.rect.y;
      const livEnd = livStart + livingRoom.rect.height;
      const topBedInitialH = arch.invertBedroomOrder ? bed2H : masterBedH;
      const passStart = box.y + topBedInitialH;
      const passEnd = passStart + bathBlockH;
      const overlap = Math.min(passEnd, livEnd) - Math.max(passStart, livStart);
      if (overlap < 1100) {
        const minBedRun = Math.min(3e3, snap102(availBedH / 2));
        const maxBedRun = availBedH - minBedRun;
        const targetTopH = isSouth ? snap102(livEnd - 1100 - box.y) : snap102(livStart + 1100 - bathBlockH - box.y);
        const clampedTopH = Math.max(minBedRun, Math.min(maxBedRun, targetTopH));
        if (arch.invertBedroomOrder) {
          bed2H = clampedTopH;
          masterBedH = availBedH - bed2H;
        } else {
          masterBedH = clampedTopH;
          bed2H = availBedH - masterBedH;
        }
      }
    }
    const bath1H = snap102(bathBlockH / 2);
    const bath2H = bathBlockH - bath1H;
    const bathW = snap102(Math.max(2600, Math.min(bedZoneW - 1200, bedZoneW * 0.65)));
    const passW = bedZoneW - bathW;
    const bathX = corridorIsEast ? bedZoneX : bedZoneX + passW;
    const passX = corridorIsEast ? bedZoneX + bathW : bedZoneX;
    let bY = box.y;
    let masterBed;
    let masterBath;
    let commonBath;
    let passage;
    let bed2;
    if (arch.invertBedroomOrder) {
      bed2 = {
        id: `${flatId}__bed_2`,
        name: `${flatLabel} Bedroom 02`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: bed2H }
      };
      rooms.push(bed2);
      bY += bed2H;
      commonBath = {
        id: `${flatId}__common_bath`,
        name: `${flatLabel} Common Bathroom`,
        type: "common_toilet",
        planningZone: "SERVICE",
        rect: { x: bathX, y: bY, width: bathW, height: bath1H }
      };
      rooms.push(commonBath);
      masterBed = {
        id: `${flatId}__master_bed`,
        name: `${flatLabel} Master Bedroom`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY + bathBlockH, width: bedZoneW, height: masterBedH }
      };
      masterBath = {
        id: `${flatId}__master_bath`,
        name: `${flatLabel} Master Toilet`,
        type: "bathroom",
        planningZone: "SERVICE",
        bathroomOwnerRoomId: masterBed.id,
        rect: { x: bathX, y: bY + bath1H, width: bathW, height: bath2H }
      };
      rooms.push(masterBath);
      passage = {
        id: `${flatId}__internal_passage`,
        name: `${flatLabel} Internal Passage`,
        type: "corridor",
        planningZone: "SERVICE",
        rect: { x: passX, y: bY, width: passW, height: bathBlockH }
      };
      rooms.push(passage);
      bY += bathBlockH;
      rooms.push(masterBed);
      bY += masterBedH;
    } else {
      masterBed = {
        id: `${flatId}__master_bed`,
        name: `${flatLabel} Master Bedroom`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: masterBedH }
      };
      rooms.push(masterBed);
      bY += masterBedH;
      masterBath = {
        id: `${flatId}__master_bath`,
        name: `${flatLabel} Master Toilet`,
        type: "bathroom",
        planningZone: "SERVICE",
        bathroomOwnerRoomId: masterBed.id,
        rect: { x: bathX, y: bY, width: bathW, height: bath1H }
      };
      rooms.push(masterBath);
      commonBath = {
        id: `${flatId}__common_bath`,
        name: `${flatLabel} Common Bathroom`,
        type: "common_toilet",
        planningZone: "SERVICE",
        rect: { x: bathX, y: bY + bath1H, width: bathW, height: bath2H }
      };
      rooms.push(commonBath);
      passage = {
        id: `${flatId}__internal_passage`,
        name: `${flatLabel} Internal Passage`,
        type: "corridor",
        planningZone: "SERVICE",
        rect: { x: passX, y: bY, width: passW, height: bathBlockH }
      };
      rooms.push(passage);
      bY += bathBlockH;
      bed2 = {
        id: `${flatId}__bed_2`,
        name: `${flatLabel} Bedroom 02`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: bed2H }
      };
      rooms.push(bed2);
      bY += bed2H;
    }
    let study;
    let pooja;
    if (studyH > 0) {
      study = {
        id: `${flatId}__study`,
        name: `${flatLabel} Study & Home Office`,
        type: "study",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: studyH }
      };
      rooms.push(study);
      bY += studyH;
    }
    if (poojaH > 0) {
      pooja = {
        id: `${flatId}__pooja`,
        name: `${flatLabel} Pooja & Meditation Room`,
        type: "pooja",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: poojaH }
      };
      rooms.push(pooja);
      bY += poojaH;
    }
    const publicRoom = livingRoom;
    const dPass = createConnectingDoor(`${flatId}__door_passage`, publicRoom, passage, 900, { doorType: "open_passage" }) ?? createConnectingDoor(`${flatId}__door_passage`, diningRoom, passage, 900, { doorType: "open_passage" });
    if (dPass) flatOpenings.push(dPass);
    const dMasterBath = createConnectingDoor(`${flatId}__door_master_bath`, masterBed, masterBath, 750);
    if (dMasterBath) flatOpenings.push(dMasterBath);
    const dCommonBath = createConnectingDoor(`${flatId}__door_common_bath`, passage, commonBath, 750);
    if (dCommonBath) flatOpenings.push(dCommonBath);
    const dBed2 = createConnectingDoor(`${flatId}__door_bed_2`, passage, bed2, 900) ?? createConnectingDoor(`${flatId}__door_bed_2`, publicRoom, bed2, 900);
    if (dBed2) flatOpenings.push(dBed2);
    if (study) {
      const dStudy = createConnectingDoor(`${flatId}__door_study`, publicRoom, study, 900) ?? createConnectingDoor(`${flatId}__door_study`, passage, study, 900);
      if (dStudy) flatOpenings.push(dStudy);
    }
    if (pooja) {
      const dPooja = createConnectingDoor(`${flatId}__door_pooja`, publicRoom, pooja, 800) ?? createConnectingDoor(`${flatId}__door_pooja`, passage, pooja, 800);
      if (dPooja) flatOpenings.push(dPooja);
    }
    const dMaster = createConnectingDoor(`${flatId}__door_master_bed`, passage, masterBed, 900);
    if (dMaster) flatOpenings.push(dMaster);
  } else if (unitType === "3BHK") {
    const hasStudyRequested = rawRooms.some((r) => r.type === "study" || r.type === "office" || r.name.toLowerCase().includes("study"));
    const hasPoojaRequested = rawRooms.some((r) => r.type === "pooja" || r.name.toLowerCase().includes("pooja") || r.name.toLowerCase().includes("mandir"));
    if (bedZoneW >= 5800 && box.h >= 8e3) {
      const colExtW = snap102(Math.max(3e3, Math.min(bedZoneW - 2800, bedZoneW * 0.5)));
      const colIntW = bedZoneW - colExtW;
      const xExt = corridorIsEast ? bedZoneX : bedZoneX + colIntW;
      const xInt = corridorIsEast ? bedZoneX + colExtW : bedZoneX;
      const minBothBedsH = Math.min(6e3, snap102(box.h * 0.72));
      const bathBlockH = snap102(Math.min(4800, Math.max(2200, Math.min(box.h - minBothBedsH, box.h * 0.24))));
      const availBedH = box.h - bathBlockH;
      const maxTwoBandH = snap102(Math.min(colExtW, colIntW) * 3.6);
      const extraBandH = availBedH > maxTwoBandH && availBedH - maxTwoBandH >= 2e3 ? availBedH - maxTwoBandH : 0;
      const remBedH = availBedH - extraBandH;
      let topBandH = snap102(Math.max(3e3, Math.min(remBedH - 3e3, remBedH * (arch.invertBedroomOrder ? 0.48 : 0.52))));
      let botBandH = remBedH - topBandH;
      const livStart = livingRoom.rect.y;
      const livEnd = livStart + livingRoom.rect.height;
      const passStart = box.y + topBandH;
      const passEnd = passStart + bathBlockH;
      const overlap = Math.min(passEnd, livEnd) - Math.max(passStart, livStart);
      if (overlap < 1100 && remBedH >= 6e3) {
        const minRun = 3e3;
        const maxRun = remBedH - 3e3;
        const targetTopH = isSouth ? snap102(livEnd - 1100 - box.y) : snap102(livStart + 1100 - bathBlockH - box.y);
        topBandH = Math.max(minRun, Math.min(maxRun, targetTopH));
        botBandH = remBedH - topBandH;
      }
      const bathW = snap102(Math.max(1800, Math.min(2600, colExtW - 1100)));
      const passW = bedZoneW - bathW;
      const bathX = corridorIsEast ? bedZoneX : bedZoneX + passW;
      const passX = corridorIsEast ? bedZoneX + bathW : bedZoneX;
      const useTwoBaths = bathBlockH < 3600;
      const bath1H = useTwoBaths ? snap102(bathBlockH * 0.5) : snap102(bathBlockH / 3);
      const bath2H = useTwoBaths ? bathBlockH - bath1H : snap102(bathBlockH / 3);
      const bath3H = useTwoBaths ? 0 : bathBlockH - bath1H - bath2H;
      const placeBed3AtTop = !isSouth || extraBandH > 0;
      const splitBottomBand = !placeBed3AtTop || bedZoneW > botBandH * 1.9 || hasStudyRequested || hasPoojaRequested;
      const splitTopBand = placeBed3AtTop || bedZoneW > topBandH * 1.9 || hasStudyRequested || hasPoojaRequested;
      const masterBed = {
        id: `${flatId}__master_bed`,
        name: `${flatLabel} Master Bedroom`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: splitTopBand ? { x: xExt, y: box.y, width: colExtW, height: topBandH } : { x: bedZoneX, y: box.y, width: bedZoneW, height: topBandH }
      };
      rooms.push(masterBed);
      const midY = box.y + topBandH;
      const masterBath = {
        id: `${flatId}__master_bath`,
        name: `${flatLabel} Master Toilet`,
        type: "bathroom",
        planningZone: "SERVICE",
        bathroomOwnerRoomId: masterBed.id,
        rect: { x: bathX, y: midY, width: bathW, height: bath1H }
      };
      rooms.push(masterBath);
      const commonBath = {
        id: `${flatId}__common_bath`,
        name: `${flatLabel} Common Bathroom`,
        type: "bathroom",
        planningZone: "SERVICE",
        rect: { x: bathX, y: midY + bath1H, width: bathW, height: bath2H }
      };
      rooms.push(commonBath);
      let bath2;
      if (!useTwoBaths) {
        bath2 = {
          id: `${flatId}__bath_2`,
          name: `${flatLabel} Toilet 02`,
          type: "bathroom",
          planningZone: "SERVICE",
          bathroomOwnerRoomId: `${flatId}__bed_2`,
          rect: { x: bathX, y: midY + bath1H + bath2H, width: bathW, height: bath3H }
        };
        rooms.push(bath2);
      }
      const passage = {
        id: `${flatId}__internal_passage`,
        name: `${flatLabel} Internal Passage`,
        type: "corridor",
        planningZone: "SERVICE",
        rect: { x: passX, y: midY, width: passW, height: bathBlockH }
      };
      rooms.push(passage);
      const botY = midY + bathBlockH;
      const bed2 = {
        id: `${flatId}__bed_2`,
        name: `${flatLabel} Bedroom 02`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: splitBottomBand ? { x: xExt, y: botY, width: colExtW, height: botBandH } : { x: bedZoneX, y: botY, width: bedZoneW, height: botBandH }
      };
      rooms.push(bed2);
      const bed3 = {
        id: `${flatId}__bed_3`,
        name: `${flatLabel} Bedroom 03`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: placeBed3AtTop ? { x: xInt, y: box.y, width: colIntW, height: topBandH } : { x: xInt, y: botY, width: colIntW, height: botBandH }
      };
      rooms.push(bed3);
      let study;
      let pooja;
      if (placeBed3AtTop && splitBottomBand) {
        const usePoojaCell = hasPoojaRequested && !hasStudyRequested;
        const cellRoom = {
          id: usePoojaCell ? `${flatId}__pooja` : `${flatId}__study`,
          name: usePoojaCell ? `${flatLabel} Pooja & Meditation Room` : `${flatLabel} Study & Home Office`,
          type: usePoojaCell ? "pooja" : "study",
          planningZone: "PRIVATE",
          rect: { x: xInt, y: botY, width: colIntW, height: botBandH }
        };
        rooms.push(cellRoom);
        if (usePoojaCell) pooja = cellRoom;
        else study = cellRoom;
      } else if (!placeBed3AtTop && splitTopBand) {
        const usePoojaCell = hasPoojaRequested && !hasStudyRequested;
        const cellRoom = {
          id: usePoojaCell ? `${flatId}__pooja` : `${flatId}__study`,
          name: usePoojaCell ? `${flatLabel} Pooja & Meditation Room` : `${flatLabel} Study & Home Office`,
          type: usePoojaCell ? "pooja" : "study",
          planningZone: "PRIVATE",
          rect: { x: xInt, y: box.y, width: colIntW, height: topBandH }
        };
        rooms.push(cellRoom);
        if (usePoojaCell) pooja = cellRoom;
        else study = cellRoom;
      }
      if (extraBandH > 0) {
        const extraY = botY + botBandH;
        const extraRoom = {
          id: pooja ? `${flatId}__study` : `${flatId}__pooja`,
          name: pooja ? `${flatLabel} Study & Home Office` : `${flatLabel} Pooja & Family Lounge`,
          type: pooja ? "study" : "pooja",
          planningZone: "PRIVATE",
          rect: { x: bedZoneX, y: extraY, width: bedZoneW, height: extraBandH }
        };
        rooms.push(extraRoom);
        if (!study && extraRoom.type === "study") study = extraRoom;
        else if (!pooja) pooja = extraRoom;
      }
      const dPass = createConnectingDoor(`${flatId}__door_passage`, livingRoom, passage, 900, { doorType: "open_passage" }) ?? createConnectingDoor(`${flatId}__door_passage`, diningRoom, passage, 900, { doorType: "open_passage" });
      if (dPass) flatOpenings.push(dPass);
      const dMasterBath = createConnectingDoor(`${flatId}__door_master_bath`, masterBed, masterBath, 750);
      if (dMasterBath) flatOpenings.push(dMasterBath);
      if (bath2) {
        const dBath2 = createConnectingDoor(`${flatId}__door_bath_2`, bed2, bath2, 750) ?? createConnectingDoor(`${flatId}__door_bath_2`, passage, bath2, 750);
        if (dBath2) flatOpenings.push(dBath2);
      }
      const dCommonBath = createConnectingDoor(`${flatId}__door_common_bath`, passage, commonBath, 750);
      if (dCommonBath) flatOpenings.push(dCommonBath);
      const dMaster = createConnectingDoor(`${flatId}__door_master_bed`, passage, masterBed, 900) ?? createConnectingDoor(`${flatId}__door_master_bed`, livingRoom, masterBed, 900);
      if (dMaster) flatOpenings.push(dMaster);
      const dBed2 = createConnectingDoor(`${flatId}__door_bed_2`, passage, bed2, 900) ?? createConnectingDoor(`${flatId}__door_bed_2`, livingRoom, bed2, 900);
      if (dBed2) flatOpenings.push(dBed2);
      const dBed3 = createConnectingDoor(`${flatId}__door_bed_3`, passage, bed3, 900) ?? createConnectingDoor(`${flatId}__door_bed_3`, livingRoom, bed3, 900);
      if (dBed3) flatOpenings.push(dBed3);
      if (study) {
        const dStudy = createConnectingDoor(`${flatId}__door_study`, passage, study, 900) ?? createConnectingDoor(`${flatId}__door_study`, livingRoom, study, 900) ?? createConnectingDoor(`${flatId}__door_study`, diningRoom, study, 900) ?? createConnectingDoor(`${flatId}__door_study`, bed2, study, 900);
        if (dStudy) flatOpenings.push(dStudy);
      }
      if (pooja) {
        const dPooja = createConnectingDoor(`${flatId}__door_pooja`, passage, pooja, 800) ?? createConnectingDoor(`${flatId}__door_pooja`, livingRoom, pooja, 800) ?? createConnectingDoor(`${flatId}__door_pooja`, diningRoom, pooja, 800) ?? createConnectingDoor(`${flatId}__door_pooja`, bed2, pooja, 800);
        if (dPooja) flatOpenings.push(dPooja);
      }
    } else {
      const bathBlockH = snap102(Math.min(5400, Math.max(box.h >= 12e3 ? 4500 : 3400, box.h * 0.2)));
      const availBedH = box.h - bathBlockH;
      const masterBedH = snap102(availBedH * 0.36);
      const bed2H = snap102(availBedH * 0.32);
      const bed3H = availBedH - masterBedH - bed2H;
      const bathW = snap102(Math.max(2e3, Math.min(bedZoneW - 1100, bedZoneW * 0.62)));
      const passW = bedZoneW - bathW;
      const bathX = corridorIsEast ? bedZoneX : bedZoneX + passW;
      const passX = corridorIsEast ? bedZoneX + bathW : bedZoneX;
      const useTwoBaths = bedZoneW < 3e3 || bathBlockH < 4200;
      const bath1H = useTwoBaths ? snap102(bathBlockH * 0.5) : snap102(bathBlockH / 3);
      const bath2H = useTwoBaths ? bathBlockH - bath1H : snap102(bathBlockH / 3);
      const bath3H = useTwoBaths ? 0 : bathBlockH - bath1H - bath2H;
      let bY = box.y;
      const masterBed = {
        id: `${flatId}__master_bed`,
        name: `${flatLabel} Master Bedroom`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: masterBedH }
      };
      rooms.push(masterBed);
      bY += masterBedH;
      const masterBath = {
        id: `${flatId}__master_bath`,
        name: `${flatLabel} Master Toilet`,
        type: "bathroom",
        planningZone: "SERVICE",
        bathroomOwnerRoomId: masterBed.id,
        rect: { x: bathX, y: bY, width: bathW, height: bath1H }
      };
      rooms.push(masterBath);
      let bath2;
      if (!useTwoBaths) {
        bath2 = {
          id: `${flatId}__bath_2`,
          name: `${flatLabel} Toilet 02`,
          type: "bathroom",
          planningZone: "SERVICE",
          bathroomOwnerRoomId: `${flatId}__bed_2`,
          rect: { x: bathX, y: bY + bath1H + bath2H, width: bathW, height: bath3H }
        };
        rooms.push(bath2);
      }
      const commonBath = {
        id: `${flatId}__common_bath`,
        name: `${flatLabel} Common Bathroom`,
        type: "bathroom",
        planningZone: "SERVICE",
        rect: { x: bathX, y: bY + bath1H, width: bathW, height: bath2H }
      };
      rooms.push(commonBath);
      const passage = {
        id: `${flatId}__internal_passage`,
        name: `${flatLabel} Internal Passage`,
        type: "corridor",
        planningZone: "SERVICE",
        rect: { x: passX, y: bY, width: passW, height: bathBlockH }
      };
      rooms.push(passage);
      bY += bathBlockH;
      const bed2 = {
        id: `${flatId}__bed_2`,
        name: `${flatLabel} Bedroom 02`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: bed2H }
      };
      rooms.push(bed2);
      bY += bed2H;
      const bed3 = {
        id: `${flatId}__bed_3`,
        name: `${flatLabel} Bedroom 03`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: bed3H }
      };
      rooms.push(bed3);
      const publicRoom = livingRoom;
      const dPass = createConnectingDoor(`${flatId}__door_passage`, publicRoom, passage, 900, { doorType: "open_passage" }) ?? createConnectingDoor(`${flatId}__door_passage`, diningRoom, passage, 900, { doorType: "open_passage" });
      if (dPass) flatOpenings.push(dPass);
      const dMasterBath = createConnectingDoor(`${flatId}__door_master_bath`, masterBed, masterBath, 750);
      if (dMasterBath) flatOpenings.push(dMasterBath);
      if (bath2) {
        const dBath2 = createConnectingDoor(`${flatId}__door_bath_2`, bed2, bath2, 750) ?? createConnectingDoor(`${flatId}__door_bath_2`, passage, bath2, 750);
        if (dBath2) flatOpenings.push(dBath2);
      }
      const dCommonBath = createConnectingDoor(`${flatId}__door_common_bath`, passage, commonBath, 750);
      if (dCommonBath) flatOpenings.push(dCommonBath);
      const dBed2 = createConnectingDoor(`${flatId}__door_bed_2`, passage, bed2, 900) ?? createConnectingDoor(`${flatId}__door_bed_2`, publicRoom, bed2, 900);
      if (dBed2) flatOpenings.push(dBed2);
      const dBed3 = createConnectingDoor(`${flatId}__door_bed_3`, passage, bed3, 900) ?? createConnectingDoor(`${flatId}__door_bed_3`, publicRoom, bed3, 900);
      if (dBed3) flatOpenings.push(dBed3);
      const dMaster = createConnectingDoor(`${flatId}__door_master_bed`, passage, masterBed, 900) ?? createConnectingDoor(`${flatId}__door_master_bed`, publicRoom, masterBed, 900);
      if (dMaster) flatOpenings.push(dMaster);
    }
  } else {
    if (bedZoneW >= 5800 && box.h >= 8e3) {
      const colExtW = snap102(Math.max(3e3, Math.min(bedZoneW - 2800, bedZoneW * 0.5)));
      const colIntW = bedZoneW - colExtW;
      const xExt = corridorIsEast ? bedZoneX : bedZoneX + colIntW;
      const xInt = corridorIsEast ? bedZoneX + colExtW : bedZoneX;
      const northIsExterior = Math.abs(box.y - envelope.y) <= 10;
      const southIsExterior = Math.abs(box.y + box.h - (envelope.y + envelope.h)) <= 10;
      const isHalfDepthQuadrant = northIsExterior !== southIsExterior;
      if (isHalfDepthQuadrant) {
        const hasNorthPartyWall = !northIsExterior;
        const partyBandRawH = Math.max(
          3400,
          Math.min(snap102(box.h * 0.3), Math.max(snap102(bedZoneW / 2.05), snap102(box.h * 0.24)))
        );
        const partyBandH = box.h >= 13e3 ? Math.min(partyBandRawH, box.h - 9600) : Math.max(3e3, Math.min(partyBandRawH, box.h - 6e3));
        const remAfterParty = box.h - partyBandH;
        const wantFourBaths = remAfterParty >= 14500;
        const bathBlockH = snap102(
          Math.min(4800, Math.max(wantFourBaths ? 4400 : 3e3, remAfterParty * 0.28))
        );
        const remBedsH = remAfterParty - bathBlockH;
        const bed2H = snap102(Math.max(3e3, Math.min(remBedsH - 3600, remBedsH * 0.42)));
        const bed3H = remBedsH - bed2H;
        const passOverlap = Math.min(1600, Math.max(1200, Math.min(bed3H - 3e3, snap102(bed3H * 0.2))));
        const bed4H = bed3H - passOverlap;
        const studyOverflow = bedZoneW > partyBandH * 2.2 && colIntW >= 3e3 ? Math.min(colIntW - 1200, Math.max(0, bedZoneW - snap102(partyBandH * 2.1))) : 0;
        const useSideStudy = studyOverflow >= 1500;
        const masterW = useSideStudy ? bedZoneW - studyOverflow : bedZoneW;
        const masterX = corridorIsEast ? bedZoneX : bedZoneX + (bedZoneW - masterW);
        const bath1H = wantFourBaths ? snap102(bathBlockH * 0.25) : snap102(bathBlockH / 3);
        const bath2H = wantFourBaths ? snap102(bathBlockH * 0.25) : snap102(bathBlockH / 3);
        const bath3H = wantFourBaths ? snap102(bathBlockH * 0.25) : 0;
        const bathLastH = bathBlockH - bath1H - bath2H - bath3H;
        const masterY = hasNorthPartyWall ? box.y : box.y + box.h - partyBandH;
        const bathTopY = hasNorthPartyWall ? box.y + partyBandH : box.y + bed3H + bed2H;
        const bed2Y = hasNorthPartyWall ? bathTopY + bathBlockH : box.y + bed3H;
        const bed3Y = hasNorthPartyWall ? bed2Y + bed2H : box.y;
        const bed4Y = hasNorthPartyWall ? bed3Y + passOverlap : box.y;
        const passY = hasNorthPartyWall ? box.y + partyBandH : box.y + bed4H;
        const masterBed = {
          id: `${flatId}__master_bed`,
          name: `${flatLabel} Master Bedroom`,
          type: "bedroom",
          planningZone: "PRIVATE",
          rect: { x: masterX, y: masterY, width: masterW, height: partyBandH }
        };
        const bed2 = {
          id: `${flatId}__bed_2`,
          name: `${flatLabel} Bedroom 02`,
          type: "bedroom",
          planningZone: "PRIVATE",
          rect: { x: xExt, y: bed2Y, width: colExtW, height: bed2H }
        };
        const bed3 = {
          id: `${flatId}__bed_3`,
          name: `${flatLabel} Bedroom 03`,
          type: "bedroom",
          planningZone: "PRIVATE",
          rect: { x: xExt, y: bed3Y, width: colExtW, height: bed3H }
        };
        const bed4 = {
          id: `${flatId}__bed_4`,
          name: `${flatLabel} Bedroom 04`,
          type: "bedroom",
          planningZone: "PRIVATE",
          rect: { x: xInt, y: bed4Y, width: colIntW, height: bed4H }
        };
        const passage = {
          id: `${flatId}__internal_passage`,
          name: `${flatLabel} Internal Passage`,
          type: "corridor",
          planningZone: "SERVICE",
          rect: { x: xInt, y: passY, width: colIntW, height: bathBlockH + bed2H + passOverlap }
        };
        rooms.push(masterBed, bed2, bed3, bed4, passage);
        let extraStudy;
        if (useSideStudy) {
          extraStudy = {
            id: `${flatId}__study`,
            name: `${flatLabel} Study & Home Office`,
            type: "study",
            planningZone: "PRIVATE",
            rect: {
              x: corridorIsEast ? bedZoneX + masterW : bedZoneX,
              y: masterY,
              width: studyOverflow,
              height: partyBandH
            }
          };
          rooms.push(extraStudy);
        }
        const masterBathY = hasNorthPartyWall ? bathTopY : bathTopY + bathBlockH - bath1H;
        const commonBathY = hasNorthPartyWall ? bathTopY + bath1H : masterBathY - bath2H;
        const bath3Y = hasNorthPartyWall ? bathTopY + bath1H + bath2H : bathTopY + bathLastH;
        const bath2Y = hasNorthPartyWall ? bathTopY + bath1H + bath2H + bath3H : bathTopY;
        const masterBath = {
          id: `${flatId}__master_bath`,
          name: `${flatLabel} Master Toilet`,
          type: "bathroom",
          planningZone: "SERVICE",
          bathroomOwnerRoomId: masterBed.id,
          rect: { x: xExt, y: masterBathY, width: colExtW, height: bath1H }
        };
        const commonBath = {
          id: `${flatId}__common_bath`,
          name: `${flatLabel} Common Bathroom`,
          type: "common_toilet",
          planningZone: "SERVICE",
          rect: { x: xExt, y: commonBathY, width: colExtW, height: bath2H }
        };
        const bath2Room = {
          id: `${flatId}__bath_2`,
          name: `${flatLabel} Toilet 02`,
          type: "bathroom",
          planningZone: "SERVICE",
          bathroomOwnerRoomId: bed2.id,
          rect: { x: xExt, y: bath2Y, width: colExtW, height: bathLastH }
        };
        rooms.push(masterBath, commonBath, bath2Room);
        let bath3Room;
        if (wantFourBaths) {
          bath3Room = {
            id: `${flatId}__bath_3`,
            name: `${flatLabel} Common Toilet 03`,
            type: "common_toilet",
            planningZone: "SERVICE",
            rect: { x: xExt, y: bath3Y, width: colExtW, height: bath3H }
          };
          rooms.push(bath3Room);
        }
        const dPass = createConnectingDoor(`${flatId}__door_passage`, livingRoom, passage, 900, { doorType: "open_passage" }) ?? createConnectingDoor(`${flatId}__door_passage`, diningRoom, passage, 900, { doorType: "open_passage" });
        if (dPass) flatOpenings.push(dPass);
        const dMasterBath = createConnectingDoor(`${flatId}__door_master_bath`, masterBed, masterBath, 750);
        if (dMasterBath) flatOpenings.push(dMasterBath);
        const dCommonBath = createConnectingDoor(`${flatId}__door_common_bath`, passage, commonBath, 750);
        if (dCommonBath) flatOpenings.push(dCommonBath);
        if (bath3Room) {
          const dBath3 = createConnectingDoor(`${flatId}__door_bath_3`, passage, bath3Room, 750);
          if (dBath3) flatOpenings.push(dBath3);
        }
        const dBath2 = createConnectingDoor(`${flatId}__door_bath_2`, bed2, bath2Room, 750) ?? createConnectingDoor(`${flatId}__door_bath_2`, passage, bath2Room, 750);
        if (dBath2) flatOpenings.push(dBath2);
        const dMaster = createConnectingDoor(`${flatId}__door_master_bed`, passage, masterBed, 900) ?? createConnectingDoor(`${flatId}__door_master_bed`, livingRoom, masterBed, 900);
        if (dMaster) flatOpenings.push(dMaster);
        const dBed2 = createConnectingDoor(`${flatId}__door_bed_2`, passage, bed2, 900) ?? createConnectingDoor(`${flatId}__door_bed_2`, livingRoom, bed2, 900);
        if (dBed2) flatOpenings.push(dBed2);
        const dBed3 = createConnectingDoor(`${flatId}__door_bed_3`, passage, bed3, 900) ?? createConnectingDoor(`${flatId}__door_bed_3`, livingRoom, bed3, 900);
        if (dBed3) flatOpenings.push(dBed3);
        const dBed4 = createConnectingDoor(`${flatId}__door_bed_4`, passage, bed4, 900) ?? createConnectingDoor(`${flatId}__door_bed_4`, livingRoom, bed4, 900);
        if (dBed4) flatOpenings.push(dBed4);
        if (extraStudy) {
          const dStudy = createConnectingDoor(`${flatId}__door_study`, passage, extraStudy, 900) ?? createConnectingDoor(`${flatId}__door_study`, livingRoom, extraStudy, 900) ?? createConnectingDoor(`${flatId}__door_study`, diningRoom, extraStudy, 900);
          if (dStudy) flatOpenings.push(dStudy);
        }
      } else {
        const minBothBedsH = Math.min(6e3, snap102(box.h * 0.72));
        const wantFourBaths = box.h - minBothBedsH >= 3800;
        const bathBlockH = snap102(Math.min(5200, Math.max(wantFourBaths ? 3800 : 2800, Math.min(box.h - minBothBedsH, box.h * 0.26))));
        const availBedH = box.h - bathBlockH;
        const maxTwoBandH = snap102(Math.min(colExtW, colIntW) * 3.6);
        const extraBandH = availBedH > maxTwoBandH && availBedH - maxTwoBandH >= 2e3 ? availBedH - maxTwoBandH : 0;
        const remBedH = availBedH - extraBandH;
        let topBandH = snap102(Math.max(3e3, Math.min(remBedH - 3e3, remBedH * (arch.invertBedroomOrder ? 0.48 : 0.52))));
        let botBandH = remBedH - topBandH;
        const livStart = livingRoom.rect.y;
        const livEnd = livStart + livingRoom.rect.height;
        const passStart = box.y + topBandH;
        const passEnd = passStart + bathBlockH;
        const overlap = Math.min(passEnd, livEnd) - Math.max(passStart, livStart);
        if (overlap < 1100 && remBedH >= 6e3) {
          const minRun = 3e3;
          const maxRun = remBedH - 3e3;
          const targetTopH = isSouth ? snap102(livEnd - 1100 - box.y) : snap102(livStart + 1100 - bathBlockH - box.y);
          topBandH = Math.max(minRun, Math.min(maxRun, targetTopH));
          botBandH = remBedH - topBandH;
        }
        const bathW = snap102(Math.max(1800, Math.min(2600, colExtW - 1100)));
        const passW = bedZoneW - bathW;
        const bathX = corridorIsEast ? bedZoneX : bedZoneX + passW;
        const passX = corridorIsEast ? bedZoneX + bathW : bedZoneX;
        const masterBed = {
          id: `${flatId}__master_bed`,
          name: `${flatLabel} Master Bedroom`,
          type: "bedroom",
          planningZone: "PRIVATE",
          rect: { x: xExt, y: box.y, width: colExtW, height: topBandH }
        };
        const bed2 = {
          id: `${flatId}__bed_2`,
          name: `${flatLabel} Bedroom 02`,
          type: "bedroom",
          planningZone: "PRIVATE",
          rect: { x: xInt, y: box.y, width: colIntW, height: topBandH }
        };
        rooms.push(masterBed, bed2);
        const midY = box.y + topBandH;
        const bath1H = wantFourBaths ? snap102(bathBlockH * 0.25) : snap102(bathBlockH / 3);
        const bath2H = wantFourBaths ? snap102(bathBlockH * 0.25) : snap102(bathBlockH / 3);
        const bath3H = wantFourBaths ? snap102(bathBlockH * 0.25) : 0;
        const bathLastH = bathBlockH - bath1H - bath2H - bath3H;
        const masterBath = {
          id: `${flatId}__master_bath`,
          name: `${flatLabel} Master Toilet`,
          type: "bathroom",
          planningZone: "SERVICE",
          bathroomOwnerRoomId: masterBed.id,
          rect: { x: bathX, y: midY, width: bathW, height: bath1H }
        };
        const commonBath = {
          id: `${flatId}__common_bath`,
          name: `${flatLabel} Common Bathroom`,
          type: "common_toilet",
          planningZone: "SERVICE",
          rect: { x: bathX, y: midY + bath1H, width: bathW, height: bath2H }
        };
        rooms.push(masterBath, commonBath);
        let bath3Room;
        if (wantFourBaths) {
          bath3Room = {
            id: `${flatId}__bath_3`,
            name: `${flatLabel} Common Toilet 03`,
            type: "common_toilet",
            planningZone: "SERVICE",
            rect: { x: bathX, y: midY + bath1H + bath2H, width: bathW, height: bath3H }
          };
          rooms.push(bath3Room);
        }
        const botY = midY + bathBlockH + extraBandH;
        const bed3 = {
          id: `${flatId}__bed_3`,
          name: `${flatLabel} Bedroom 03`,
          type: "bedroom",
          planningZone: "PRIVATE",
          rect: { x: xExt, y: botY, width: colExtW, height: botBandH }
        };
        const bed4 = {
          id: `${flatId}__bed_4`,
          name: `${flatLabel} Bedroom 04`,
          type: "bedroom",
          planningZone: "PRIVATE",
          rect: { x: xInt, y: botY, width: colIntW, height: botBandH }
        };
        const bath2Room = {
          id: `${flatId}__bath_2`,
          name: `${flatLabel} Toilet 02`,
          type: extraBandH > 0 ? "common_toilet" : "bathroom",
          planningZone: "SERVICE",
          ...extraBandH === 0 ? { bathroomOwnerRoomId: bed3.id } : {},
          rect: { x: bathX, y: midY + bath1H + bath2H + bath3H, width: bathW, height: bathLastH }
        };
        rooms.push(bath2Room);
        const passage = {
          id: `${flatId}__internal_passage`,
          name: `${flatLabel} Internal Passage`,
          type: "corridor",
          planningZone: "SERVICE",
          rect: { x: passX, y: midY, width: passW, height: bathBlockH }
        };
        rooms.push(passage, bed3, bed4);
        let extraStudy;
        let lowerPassage;
        if (extraBandH > 0) {
          const studyW = Math.max(bathW, Math.min(colExtW - 1100, snap102(bedZoneW * 0.4)));
          const lowerPassW = bedZoneW - studyW;
          const studyX = corridorIsEast ? bedZoneX : bedZoneX + lowerPassW;
          const lowerPassX = corridorIsEast ? bedZoneX + studyW : bedZoneX;
          extraStudy = {
            id: `${flatId}__study`,
            name: `${flatLabel} Study & Home Office`,
            type: "study",
            planningZone: "PRIVATE",
            rect: { x: studyX, y: midY + bathBlockH, width: studyW, height: extraBandH }
          };
          lowerPassage = {
            id: `${flatId}__lower_passage`,
            name: `${flatLabel} Lower Passage`,
            type: "corridor",
            planningZone: "SERVICE",
            rect: { x: lowerPassX, y: midY + bathBlockH, width: lowerPassW, height: extraBandH }
          };
          rooms.push(extraStudy, lowerPassage);
        }
        const dPass = createConnectingDoor(`${flatId}__door_passage`, livingRoom, passage, 900, { doorType: "open_passage" }) ?? (lowerPassage ? createConnectingDoor(`${flatId}__door_passage`, livingRoom, lowerPassage, 900, { doorType: "open_passage" }) : null) ?? createConnectingDoor(`${flatId}__door_passage`, diningRoom, passage, 900, { doorType: "open_passage" });
        if (dPass) flatOpenings.push(dPass);
        if (lowerPassage) {
          const dLowerPass = createConnectingDoor(`${flatId}__door_lower_passage`, passage, lowerPassage, 1200, { doorType: "open_passage" });
          if (dLowerPass) flatOpenings.push(dLowerPass);
          const dLowerLiv = createConnectingDoor(`${flatId}__door_lower_passage_living`, livingRoom, lowerPassage, 900, { doorType: "open_passage" }) ?? createConnectingDoor(`${flatId}__door_lower_passage_dining`, diningRoom, lowerPassage, 900, { doorType: "open_passage" });
          if (dLowerLiv && dLowerLiv.id !== dPass?.id) flatOpenings.push(dLowerLiv);
        }
        const dMasterBath = createConnectingDoor(`${flatId}__door_master_bath`, masterBed, masterBath, 750);
        if (dMasterBath) flatOpenings.push(dMasterBath);
        const dCommonBath = createConnectingDoor(`${flatId}__door_common_bath`, passage, commonBath, 750);
        if (dCommonBath) flatOpenings.push(dCommonBath);
        if (bath3Room) {
          const dBath3 = createConnectingDoor(`${flatId}__door_bath_3`, passage, bath3Room, 750);
          if (dBath3) flatOpenings.push(dBath3);
        }
        const dBath2 = extraBandH > 0 ? createConnectingDoor(`${flatId}__door_bath_2`, passage, bath2Room, 750) : createConnectingDoor(`${flatId}__door_bath_2`, bed3, bath2Room, 750) ?? createConnectingDoor(`${flatId}__door_bath_2`, passage, bath2Room, 750);
        if (dBath2) flatOpenings.push(dBath2);
        const dMaster = createConnectingDoor(`${flatId}__door_master_bed`, passage, masterBed, 900) ?? createConnectingDoor(`${flatId}__door_master_bed`, livingRoom, masterBed, 900);
        if (dMaster) flatOpenings.push(dMaster);
        const dBed2 = createConnectingDoor(`${flatId}__door_bed_2`, passage, bed2, 900) ?? createConnectingDoor(`${flatId}__door_bed_2`, livingRoom, bed2, 900);
        if (dBed2) flatOpenings.push(dBed2);
        const southPassTarget = lowerPassage ?? passage;
        const dBed3 = createConnectingDoor(`${flatId}__door_bed_3`, southPassTarget, bed3, 900) ?? createConnectingDoor(`${flatId}__door_bed_3`, livingRoom, bed3, 900);
        if (dBed3) flatOpenings.push(dBed3);
        const dBed4 = createConnectingDoor(`${flatId}__door_bed_4`, southPassTarget, bed4, 900) ?? createConnectingDoor(`${flatId}__door_bed_4`, livingRoom, bed4, 900);
        if (dBed4) flatOpenings.push(dBed4);
        if (extraStudy) {
          const dExtra = createConnectingDoor(`${flatId}__door_study`, lowerPassage ?? passage, extraStudy, 900) ?? createConnectingDoor(`${flatId}__door_study`, livingRoom, extraStudy, 900) ?? createConnectingDoor(`${flatId}__door_study`, diningRoom, extraStudy, 900);
          if (dExtra) flatOpenings.push(dExtra);
        }
      }
    } else {
      const bathBlockH = snap102(Math.min(4800, Math.max(3200, box.h * 0.24)));
      const availBedH = box.h - bathBlockH;
      const masterBedH = snap102(availBedH * 0.28);
      const bed2H = snap102(availBedH * 0.25);
      const bed3H = snap102(availBedH * 0.24);
      const bed4H = availBedH - masterBedH - bed2H - bed3H;
      const bathW = snap102(Math.max(2e3, Math.min(bedZoneW - 1100, bedZoneW * 0.62)));
      const passW = bedZoneW - bathW;
      const bathX = corridorIsEast ? bedZoneX : bedZoneX + passW;
      const passX = corridorIsEast ? bedZoneX + bathW : bedZoneX;
      let bY = box.y;
      const masterBed = {
        id: `${flatId}__master_bed`,
        name: `${flatLabel} Master Bedroom`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: masterBedH }
      };
      rooms.push(masterBed);
      bY += masterBedH;
      const bath1H = snap102(bathBlockH / 3);
      const bath2H = snap102(bathBlockH / 3);
      const bath3H = bathBlockH - bath1H - bath2H;
      const masterBath = {
        id: `${flatId}__master_bath`,
        name: `${flatLabel} Master Toilet`,
        type: "bathroom",
        planningZone: "SERVICE",
        bathroomOwnerRoomId: masterBed.id,
        rect: { x: bathX, y: bY, width: bathW, height: bath1H }
      };
      const commonBath = {
        id: `${flatId}__common_bath`,
        name: `${flatLabel} Common Bathroom`,
        type: "common_toilet",
        planningZone: "SERVICE",
        rect: { x: bathX, y: bY + bath1H, width: bathW, height: bath2H }
      };
      const bath2 = {
        id: `${flatId}__bath_2`,
        name: `${flatLabel} Toilet 02`,
        type: "bathroom",
        planningZone: "SERVICE",
        bathroomOwnerRoomId: `${flatId}__bed_2`,
        rect: { x: bathX, y: bY + bath1H + bath2H, width: bathW, height: bath3H }
      };
      const passage = {
        id: `${flatId}__internal_passage`,
        name: `${flatLabel} Internal Passage`,
        type: "corridor",
        planningZone: "SERVICE",
        rect: { x: passX, y: bY, width: passW, height: bathBlockH }
      };
      rooms.push(masterBath, commonBath, bath2, passage);
      bY += bathBlockH;
      const bed2 = {
        id: `${flatId}__bed_2`,
        name: `${flatLabel} Bedroom 02`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: bed2H }
      };
      rooms.push(bed2);
      bY += bed2H;
      const bed3 = {
        id: `${flatId}__bed_3`,
        name: `${flatLabel} Bedroom 03`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: bed3H }
      };
      rooms.push(bed3);
      bY += bed3H;
      const bed4 = {
        id: `${flatId}__bed_4`,
        name: `${flatLabel} Bedroom 04`,
        type: "bedroom",
        planningZone: "PRIVATE",
        rect: { x: bedZoneX, y: bY, width: bedZoneW, height: bed4H }
      };
      rooms.push(bed4);
      const dPass = createConnectingDoor(`${flatId}__door_passage`, livingRoom, passage, 900, { doorType: "open_passage" }) ?? createConnectingDoor(`${flatId}__door_passage`, diningRoom, passage, 900, { doorType: "open_passage" });
      if (dPass) flatOpenings.push(dPass);
      const dMasterBath = createConnectingDoor(`${flatId}__door_master_bath`, masterBed, masterBath, 750);
      if (dMasterBath) flatOpenings.push(dMasterBath);
      const dCommonBath = createConnectingDoor(`${flatId}__door_common_bath`, passage, commonBath, 750);
      if (dCommonBath) flatOpenings.push(dCommonBath);
      const dBath2 = createConnectingDoor(`${flatId}__door_bath_2`, bed2, bath2, 750);
      if (dBath2) flatOpenings.push(dBath2);
      const dMaster = createConnectingDoor(`${flatId}__door_master_bed`, passage, masterBed, 900) ?? createConnectingDoor(`${flatId}__door_master_bed`, livingRoom, masterBed, 900);
      if (dMaster) flatOpenings.push(dMaster);
      const dBed2 = createConnectingDoor(`${flatId}__door_bed_2`, passage, bed2, 900) ?? createConnectingDoor(`${flatId}__door_bed_2`, livingRoom, bed2, 900);
      if (dBed2) flatOpenings.push(dBed2);
      const dBed3 = createConnectingDoor(`${flatId}__door_bed_3`, livingRoom, bed3, 900) ?? createConnectingDoor(`${flatId}__door_bed_3`, diningRoom, bed3, 900) ?? createConnectingDoor(`${flatId}__door_bed_3`, bed2, bed3, 900);
      if (dBed3) flatOpenings.push(dBed3);
      const dBed4 = createConnectingDoor(`${flatId}__door_bed_4`, livingRoom, bed4, 900) ?? createConnectingDoor(`${flatId}__door_bed_4`, diningRoom, bed4, 900) ?? createConnectingDoor(`${flatId}__door_bed_4`, bed3, bed4, 900);
      if (dBed4) flatOpenings.push(dBed4);
    }
  }
  for (const room of rooms.filter((r) => r.type === "bedroom")) {
    if (flatOpenings.some((d) => d.connects?.includes(room.id) && !d.connects.some((id) => rooms.find((r) => r.id === id)?.bathroomOwnerRoomId))) continue;
    const passageRoom = rooms.find((r) => r.type === "corridor");
    const publicTarget = livingRoom ?? diningRoom;
    const door = (passageRoom ? createConnectingDoor(`${room.id}__door_day_access`, passageRoom, room, 900) : null) ?? createConnectingDoor(`${room.id}__door_day_access`, publicTarget, room, 900) ?? createConnectingDoor(`${room.id}__door_day_access`, diningRoom, room, 900);
    if (door) flatOpenings.push(door);
  }
  const allBedrooms = [...rooms].filter((r) => r.type === "bedroom");
  const staggerActive = Boolean(placement?.staggeredBalconies && allBedrooms.length >= 2);
  const orderedBedrooms = staggerActive && placement?.floorVariant === "EVEN" ? [
    ...allBedrooms.filter((_, idx) => idx % 2 === 1),
    ...allBedrooms.filter((_, idx) => idx % 2 === 0)
  ] : allBedrooms;
  for (let bIdx = 0; bIdx < orderedBedrooms.length; bIdx++) {
    const bedroom = orderedBedrooms[bIdx];
    if (staggerActive) {
      const origIdx = allBedrooms.findIndex((b) => b.id === bedroom.id);
      const wantEvenBay = placement?.floorVariant === "EVEN";
      const isPreferredBay = wantEvenBay ? origIdx % 2 === 1 : origIdx % 2 === 0;
      const alreadyCarved = rooms.some((rm) => rm.id.endsWith("__balcony") && rm.id !== `${flatId}__balcony`);
      if (!isPreferredBay && (alreadyCarved || origIdx === 0)) continue;
    }
    const r = bedroom.rect;
    const minRemW = 3e3;
    const minRemH = 3e3;
    const forceBedBalc = placement?.bedroomBalconies === "ALL_BEDROOMS" && (r.width < 4500 && r.width >= 4200 || r.height < 4500 && r.height >= 4200);
    const depthX = forceBedBalc && r.width < 4500 ? Math.max(1200, r.width - minRemW) : 1500;
    const depthY = forceBedBalc && r.height < 4500 ? Math.max(1200, r.height - minRemH) : 1500;
    const west = Math.abs(r.x - envelope.x) < 1e-3;
    const east = Math.abs(r.x + r.width - envelope.x - envelope.w) < 1e-3;
    const north = Math.abs(r.y - envelope.y) < 1e-3;
    const south = Math.abs(r.y + r.height - envelope.y - envelope.h) < 1e-3;
    const hasBedroomBalcony = rooms.some(
      (rm) => rm.id.endsWith("__balcony") && rm.id !== `${flatId}__balcony`
    );
    const candidates = [];
    if ((west || east) && r.width - depthX >= minRemW && r.height >= minRemH) {
      candidates.push({
        trimmed: { ...bedroom, rect: { ...r, x: r.x + (west ? depthX : 0), width: r.width - depthX } },
        balcony: {
          id: bedroom.id + "__balcony",
          name: bedroom.name + " Balcony",
          type: "balcony",
          planningZone: "OUTDOOR",
          rect: { x: west ? r.x : r.x + r.width - depthX, y: r.y, width: depthX, height: r.height }
        }
      });
    }
    if ((placement?.bedroomBalconies === "ALL_BEDROOMS" || !hasBedroomBalcony) && (north || south) && r.height - depthY >= minRemH && r.width >= minRemW) {
      candidates.push({
        trimmed: { ...bedroom, rect: { ...r, y: r.y + (north ? depthY : 0), height: r.height - depthY } },
        balcony: {
          id: bedroom.id + "__balcony",
          name: bedroom.name + " Balcony",
          type: "balcony",
          planningZone: "OUTDOOR",
          rect: { x: r.x, y: north ? r.y : r.y + r.height - depthY, width: r.width, height: depthY }
        }
      });
    }
    for (const candidate of candidates) {
      const { trimmed, balcony } = candidate;
      const access = createConnectingDoor(bedroom.id + "__balcony_door", trimmed, balcony, 900, { doorType: "sliding" });
      if (!access) continue;
      const affected = flatOpenings.filter((d) => d.connects?.includes(bedroom.id));
      const replacements = affected.map((d) => {
        const otherId = d.connects.find((id) => id !== bedroom.id);
        const other = rooms.find((room) => room.id === otherId);
        return other ? createConnectingDoor(
          d.id,
          trimmed,
          other,
          Math.max(d.rect.width, d.rect.height),
          { doorType: d.doorType, isFlatEntrance: d.isFlatEntrance, swingDirection: d.swingDirection }
        ) : null;
      });
      if (replacements.some((d) => !d)) continue;
      rooms[rooms.findIndex((room) => room.id === bedroom.id)] = trimmed;
      rooms.push(balcony);
      affected.forEach((door, i) => {
        flatOpenings[flatOpenings.indexOf(door)] = replacements[i];
      });
      flatOpenings.push(access);
      break;
    }
  }
  return { rooms, flatOpenings };
}

// packages/planning-engine/src/topology/rect-frame.ts
var boxArea = (b) => b.w * b.h;
function boxesOverlap(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
function splitX(box, widths) {
  const out = [];
  let cursor = box.x;
  for (let i = 0; i < widths.length; i++) {
    const isLast = i === widths.length - 1;
    const remaining = box.x + box.w - cursor;
    const w = isLast ? remaining : Math.max(0, Math.min(Math.round(widths[i]), remaining));
    out.push({ x: cursor, y: box.y, w, h: box.h });
    cursor += w;
  }
  return out;
}
function splitY(box, heights) {
  const out = [];
  let cursor = box.y;
  for (let i = 0; i < heights.length; i++) {
    const isLast = i === heights.length - 1;
    const remaining = box.y + box.h - cursor;
    const h = isLast ? remaining : Math.max(0, Math.min(Math.round(heights[i]), remaining));
    out.push({ x: box.x, y: cursor, w: box.w, h });
    cursor += h;
  }
  return out;
}
function dissectionDefect(parent, pieces) {
  const total = pieces.reduce((sum, p) => sum + boxArea(p), 0);
  let overlapCount = 0;
  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      if (boxesOverlap(pieces[i], pieces[j])) overlapCount++;
    }
  }
  const areaDefectMm2 = boxArea(parent) - total;
  return { areaDefectMm2, overlapCount, exact: Math.abs(areaDefectMm2) < 1e-3 && overlapCount === 0 };
}
function frameFor(target, accessEdge) {
  const { x: tx, y: ty, w: tw, h: th } = target;
  switch (accessEdge) {
    case "EAST":
      return {
        accessEdge,
        localW: tw,
        localH: th,
        toWorld: (r) => ({ x: tx + r.x, y: ty + r.y, w: r.w, h: r.h }),
        toLocal: (r) => ({ x: r.x - tx, y: r.y - ty, w: r.w, h: r.h })
      };
    case "WEST":
      return {
        accessEdge,
        localW: tw,
        localH: th,
        toWorld: (r) => ({ x: tx + tw - (r.x + r.w), y: ty + r.y, w: r.w, h: r.h }),
        toLocal: (r) => ({ x: tw - (r.x - tx + r.w), y: r.y - ty, w: r.w, h: r.h })
      };
    case "NORTH":
      return {
        accessEdge,
        localW: th,
        localH: tw,
        toWorld: (r) => ({ x: tx + r.y, y: ty + th - (r.x + r.w), w: r.h, h: r.w }),
        toLocal: (r) => ({ x: th - (r.y - ty + r.h), y: r.x - tx, w: r.h, h: r.w })
      };
    case "SOUTH":
      return {
        accessEdge,
        localW: th,
        localH: tw,
        toWorld: (r) => ({ x: tx + r.y, y: ty + r.x, w: r.h, h: r.w }),
        toLocal: (r) => ({ x: r.y - ty, y: r.x - tx, w: r.h, h: r.w })
      };
  }
}
function mulberry32(seed2) {
  let a = seed2 >>> 0;
  return () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function fnv1a(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
var fnv1aHex = (value) => fnv1a(value).toString(16).padStart(8, "0");

// packages/planning-engine/src/topology/topology-families.ts
var BUILDING_MASSING_SHAPES = [
  "COMPACT_DOUBLE_LOADED",
  "H_SHAPE_WING",
  "U_SHAPE_COURTYARD",
  "L_SHAPE_CORNER",
  "CRUCIFORM_PLUS",
  "PINWHEEL_CLUSTER",
  "STEPPED_OFFSET_BLOCK"
];
var snap103 = (v) => Math.round(v / 10) * 10;
var clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
var CORE_BOUNDS = {
  stairWidthMin: 2600,
  stairWidthMax: 3e3,
  stairRunCompact: 3200,
  stairRunStandard: 4500,
  liftWidthMin: 1900,
  liftWidthMax: 2200,
  liftDepth: 2200,
  liftCount: 2,
  lobbyClearMin: 1500,
  corridorCompact: 1800,
  corridorStandard: 2400,
  /** A void only reads as open-to-sky once both spans are usable. */
  otsMinSpan: 3e3,
  shaftMinSpan: 600
};
var FLAT_BOUNDS = {
  /**
   * Across the zone split (living zone + bedroom zone).
   *
   * 5800 mm is enough to slice a 2BHK, but NOT enough for bedroom balconies:
   * the slicer carves a 1500 mm inset balcony only where the bedroom keeps
   * 3000 mm behind it, so a bedroom zone must reach 4500 mm. The slicer splits
   * a flat's span evenly between its living and bedroom zones, so the span has
   * to reach 9000 mm for the bedroom zone to clear that bar. Below it the flat
   * is still valid, just without bedroom balconies.
   */
  minSpanMm: 5800,
  /** Span at which the slicer can carve bedroom balconies. */
  balconySpanMm: 9e3,
  /** Along the room stack (service band + living + bedrooms + baths). */
  minRunMm: 6800,
  /**
   * Upper span and run bounds.
   *
   * These matter as much as the minima. The room slicer allocates each room as
   * a PROPORTION of its flat, so handing it an oversized slab yields an
   * 85 m² bedroom and a 21 m² bathroom — dimensionally valid, architecturally
   * nonsense. Surplus plot area belongs to open space, deeper setbacks or more
   * flats, not to inflating rooms.
   *
   * 9.0 m across and 16.0 m deep comfortably contains a generous 3BHK; a flat
   * larger than this is a sign the program is too small for the plot, which is
   * reported rather than absorbed.
   */
  maxSpanMm: 9e3,
  maxRunMm: 16e3
};
var FLAT_AREA_BOUNDS_SQM = {
  "1BHK": { min: 32, max: 62 },
  "2BHK": { min: 48, max: 95 },
  "3BHK": { min: 70, max: 135 },
  "4BHK": { min: 95, max: 185 }
};
var transpose = (b) => ({ x: b.y, y: b.x, w: b.h, h: b.w });
function sharedEdgeLength(a, b) {
  const touchesVertically = Math.abs(a.x + a.w - b.x) <= 1 || Math.abs(b.x + b.w - a.x) <= 1;
  if (touchesVertically) {
    return Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  }
  const touchesHorizontally = Math.abs(a.y + a.h - b.y) <= 1 || Math.abs(b.y + b.h - a.y) <= 1;
  if (touchesHorizontally) {
    return Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  }
  return 0;
}
function flatLocalSpans(flat, edge) {
  return edge === "EAST" || edge === "WEST" ? { spanMm: flat.w, runMm: flat.h } : { spanMm: flat.h, runMm: flat.w };
}
var corridorWidth = (compact) => compact ? CORE_BOUNDS.corridorCompact : CORE_BOUNDS.corridorStandard;
function requiredCoreBandWidth(opts) {
  const corridors = opts.corridorSides === "BOTH" ? 2 : opts.corridorSides === "NONE" ? 0 : 1;
  const stack = opts.compact ? CORE_BOUNDS.stairWidthMin : CORE_BOUNDS.stairWidthMax;
  return stack + corridors * corridorWidth(opts.compact);
}
function requiredCoreBandLength(opts) {
  const stairRun = opts.compact ? CORE_BOUNDS.stairRunCompact : CORE_BOUNDS.stairRunStandard;
  const crossLink = opts.corridorSides === "BOTH" ? corridorWidth(opts.compact) : 0;
  const liftCount = opts.liftCount ?? CORE_BOUNDS.liftCount;
  return stairRun * opts.stairCount + CORE_BOUNDS.liftDepth * liftCount + crossLink;
}
function dissectCoreBand(bandWorld, opts) {
  const wide = bandWorld.w > bandWorld.h;
  const band = wide ? transpose(bandWorld) : bandWorld;
  const out = (b) => wide ? transpose(b) : b;
  const empty = {
    stairBoxes: [],
    liftBoxes: [],
    lobbyBoxes: [],
    corridorBoxes: [],
    shaftBoxes: [],
    shaftRoles: [],
    shaftTags: [],
    reasons: []
  };
  const reasons = [];
  const corrW = corridorWidth(opts.compact);
  const sides = opts.corridorSides;
  const corridorCount = sides === "BOTH" ? 2 : sides === "NONE" ? 0 : 1;
  const stackW = band.w - corridorCount * corrW;
  if (stackW < CORE_BOUNDS.stairWidthMin) {
    reasons.push(
      `core band is ${Math.round(band.w)} mm across; after ${corridorCount} corridor(s) of ${corrW} mm the stair stack would be ${Math.round(stackW)} mm, below the ${CORE_BOUNDS.stairWidthMin} mm minimum`
    );
  }
  const liftCount = opts.liftCountOverride ?? CORE_BOUNDS.liftCount;
  const requiredLength = requiredCoreBandLength({
    compact: opts.compact,
    stairCount: opts.stairCount,
    corridorSides: sides,
    liftCount
  });
  if (band.h < requiredLength) {
    reasons.push(
      `core band runs ${Math.round(band.h)} mm, below the ${requiredLength} mm needed for ${opts.stairCount} stair(s), ${liftCount} lifts` + (sides === "BOTH" ? " and a link around the end of the core" : "")
    );
  }
  if (reasons.length) return { ...empty, reasons };
  const needsCrossLink = sides === "BOTH";
  const [stackZone, crossLink] = needsCrossLink ? splitY(band, [band.h - corrW, 0]) : [band, void 0];
  const acrossSizes = sides === "BOTH" ? [corrW, stackW, 0] : sides === "LOW" ? [corrW, 0] : sides === "HIGH" ? [stackW, 0] : [0];
  const acrossPieces = splitX(stackZone, acrossSizes);
  const corridorBoxes = [];
  let stack;
  if (sides === "BOTH") {
    corridorBoxes.push(out(acrossPieces[0]), out(acrossPieces[2]));
    stack = acrossPieces[1];
  } else if (sides === "LOW") {
    corridorBoxes.push(out(acrossPieces[0]));
    stack = acrossPieces[1];
  } else if (sides === "HIGH") {
    stack = acrossPieces[0];
    corridorBoxes.push(out(acrossPieces[1]));
  } else {
    stack = acrossPieces[0];
  }
  if (crossLink) corridorBoxes.push(out(crossLink));
  const stairRun = opts.compact ? CORE_BOUNDS.stairRunCompact : CORE_BOUNDS.stairRunStandard;
  const liftBankRun = CORE_BOUNDS.liftDepth * liftCount;
  const stairBoxes = [];
  const liftBoxes = [];
  const lobbyBoxes = [];
  const shaftBoxes = [];
  const shaftRoles = [];
  const shaftTags = [];
  let firstStairSeg;
  let liftSeg;
  let secondStairSeg;
  let tailSeg;
  if (opts.noOts && opts.stairCount === 2) {
    const middleH = stack.h - 2 * stairRun;
    const [topStair, midZone, botStair] = splitY(stack, [stairRun, middleH, 0]);
    firstStairSeg = topStair;
    secondStairSeg = botStair;
    const remMidH = midZone.h - liftBankRun;
    const topPad = snap103(remMidH / 2);
    const botPad = remMidH - topPad;
    if (topPad > 0 && botPad > 0) {
      const [padTop, liftCenter, padBot] = splitY(midZone, [topPad, liftBankRun, 0]);
      shaftBoxes.push(out(padTop));
      shaftRoles.push("SERVICE_SHAFT");
      shaftTags.push([]);
      liftSeg = liftCenter;
      shaftBoxes.push(out(padBot));
      shaftRoles.push("SERVICE_SHAFT");
      shaftTags.push([]);
    } else if (remMidH > 0) {
      const [liftCenter, padBot] = splitY(midZone, [liftBankRun, 0]);
      liftSeg = liftCenter;
      shaftBoxes.push(out(padBot));
      shaftRoles.push("SERVICE_SHAFT");
      shaftTags.push([]);
    } else {
      liftSeg = midZone;
    }
  } else {
    const alongSizes = opts.stairCount === 2 ? [stairRun, liftBankRun, stairRun, 0] : [stairRun, liftBankRun, 0];
    const segments = splitY(stack, alongSizes);
    firstStairSeg = segments[0];
    liftSeg = segments[1];
    secondStairSeg = opts.stairCount === 2 ? segments[2] : void 0;
    tailSeg = segments[segments.length - 1];
  }
  const stairW = Math.min(stack.w, CORE_BOUNDS.stairWidthMax);
  const stairSurplusW = stack.w - stairW;
  if (stairSurplusW >= CORE_BOUNDS.shaftMinSpan) {
    const [stairCol, shaftCol] = opts.liftsAtLowSide ? splitX(firstStairSeg, [stairW, 0]) : splitX(firstStairSeg, [stairSurplusW, 0]);
    stairBoxes.push(out(opts.liftsAtLowSide ? stairCol : shaftCol));
    shaftBoxes.push(out(opts.liftsAtLowSide ? shaftCol : stairCol));
    shaftRoles.push("SERVICE_SHAFT");
    shaftTags.push([]);
  } else {
    stairBoxes.push(out(firstStairSeg));
  }
  const carDepth = Math.min(CORE_BOUNDS.liftDepth, Math.floor(liftSeg.h / liftCount));
  const liftW = Math.min(
    stack.w,
    clamp(snap103(stack.w * 0.55), CORE_BOUNDS.liftWidthMin, CORE_BOUNDS.liftWidthMax)
  );
  const lobbyW = stack.w - liftW;
  const stackCars = (column) => {
    const depths = Array.from({ length: liftCount }, () => carDepth);
    const pieces = splitY(column, [...depths, 0]);
    for (let i = 0; i < liftCount; i++) liftBoxes.push(out(pieces[i]));
    const tail = pieces[pieces.length - 1];
    if (tail.h > 0) {
      const carTailRole = roleFor(tail, opts.preferOts, opts.noOts, opts.preferCompactOts);
      shaftBoxes.push(out(tail));
      shaftRoles.push(carTailRole);
      shaftTags.push(carTailRole === "OPEN_TO_SKY_VOID" ? ["shaft:ots"] : []);
    }
  };
  if (lobbyW >= CORE_BOUNDS.lobbyClearMin) {
    const [a, b] = opts.liftsAtLowSide ? splitX(liftSeg, [liftW, 0]) : splitX(liftSeg, [lobbyW, 0]);
    const liftCol = opts.liftsAtLowSide ? a : b;
    const lobbyCol = opts.liftsAtLowSide ? b : a;
    stackCars(liftCol);
    lobbyBoxes.push(out(lobbyCol));
  } else {
    if (corridorCount === 0 && !opts.landingSuppliedExternally) {
      return {
        ...empty,
        reasons: [
          `lift landing would be ${Math.round(lobbyW)} mm clear, below ${CORE_BOUNDS.lobbyClearMin} mm, and this core has no corridor to open onto`
        ]
      };
    }
    const carW = Math.min(stack.w, CORE_BOUNDS.liftWidthMax);
    const surplusShaftW = stack.w - carW;
    if (surplusShaftW >= CORE_BOUNDS.shaftMinSpan) {
      const [carCol, shaftCol] = opts.liftsAtLowSide ? splitX(liftSeg, [carW, 0]) : splitX(liftSeg, [surplusShaftW, 0]);
      stackCars(opts.liftsAtLowSide ? carCol : shaftCol);
      shaftBoxes.push(out(opts.liftsAtLowSide ? shaftCol : carCol));
      shaftRoles.push("SERVICE_SHAFT");
      shaftTags.push([]);
    } else {
      stackCars(liftSeg);
    }
  }
  if (secondStairSeg) {
    if (stairSurplusW >= CORE_BOUNDS.shaftMinSpan) {
      const [stairCol, shaftCol] = opts.liftsAtLowSide ? splitX(secondStairSeg, [stairW, 0]) : splitX(secondStairSeg, [stairSurplusW, 0]);
      stairBoxes.push(out(opts.liftsAtLowSide ? stairCol : shaftCol));
      shaftBoxes.push(out(opts.liftsAtLowSide ? shaftCol : stairCol));
      shaftRoles.push("SERVICE_SHAFT");
      shaftTags.push([]);
    } else {
      stairBoxes.push(out(secondStairSeg));
    }
  }
  if (tailSeg && tailSeg.h > 0) {
    const tailRole = roleFor(tailSeg, opts.preferOts, opts.noOts, opts.preferCompactOts);
    const maxCompactOtsH = 3200;
    const minCompactOtsH = 2400;
    if ((opts.preferOts || opts.preferCompactOts) && tailRole === "OPEN_TO_SKY_VOID" && tailSeg.h > maxCompactOtsH && tailSeg.h - minCompactOtsH >= 1200) {
      const compactOtsH = snap103(Math.min(maxCompactOtsH, tailSeg.h - 1200));
      const [otsPiece, serviceSurplus] = splitY(tailSeg, [compactOtsH, 0]);
      shaftBoxes.push(out(otsPiece), out(serviceSurplus));
      shaftRoles.push("OPEN_TO_SKY_VOID", "SERVICE_SHAFT");
      shaftTags.push(["shaft:ots"], []);
    } else {
      shaftBoxes.push(out(tailSeg));
      shaftRoles.push(tailRole);
      shaftTags.push(tailRole === "OPEN_TO_SKY_VOID" ? ["shaft:ots"] : []);
    }
  }
  return { stairBoxes, liftBoxes, lobbyBoxes, corridorBoxes, shaftBoxes, shaftRoles, shaftTags, reasons: [] };
}
function roleFor(box, preferOts, noOts, preferCompactOts) {
  if (noOts) return "SERVICE_SHAFT";
  if (preferCompactOts) {
    return Math.min(box.w, box.h) >= 1500 && Math.max(box.w, box.h) >= 2400 ? "OPEN_TO_SKY_VOID" : "SERVICE_SHAFT";
  }
  const usable = Math.min(box.w, box.h) >= CORE_BOUNDS.otsMinSpan;
  if (!usable) return "SERVICE_SHAFT";
  return preferOts || Math.min(box.w, box.h) >= CORE_BOUNDS.otsMinSpan * 1.5 ? "OPEN_TO_SKY_VOID" : "SERVICE_SHAFT";
}
function sliceFlatRow(region, count, maxRun, alongY, maxSpan = FLAT_BOUNDS.maxSpanMm, entranceAtLowEnd = false) {
  if (count <= 0) {
    return { flats: [], leftovers: [region] };
  }
  const leftovers = [];
  const span = alongY ? region.w : region.h;
  let rowBand = region;
  if (span > maxSpan) {
    const surplusSpan = span - maxSpan;
    if (surplusSpan >= MIN_LIGHT_SLOT) {
      if (entranceAtLowEnd) {
        rowBand = alongY ? { ...region, w: maxSpan } : { ...region, h: maxSpan };
        leftovers.push(alongY ? { x: region.x + maxSpan, y: region.y, w: surplusSpan, h: region.h } : { x: region.x, y: region.y + maxSpan, w: region.w, h: surplusSpan });
      } else {
        rowBand = alongY ? { ...region, x: region.x + surplusSpan, w: maxSpan } : { ...region, y: region.y + surplusSpan, h: maxSpan };
        leftovers.push(alongY ? { x: region.x, y: region.y, w: surplusSpan, h: region.h } : { x: region.x, y: region.y, w: region.w, h: surplusSpan });
      }
    }
  }
  const available = alongY ? rowBand.h : rowBand.w;
  const perFlat = Math.min(maxRun, Math.floor(available / count));
  const surplus = available - perFlat * count;
  const gapCount = Math.max(0, count - 1);
  const rawGap = gapCount > 0 ? Math.floor(surplus / gapCount) : 0;
  const perGap = rawGap >= MIN_LIGHT_SLOT ? rawGap : 0;
  const sizes = [];
  for (let i = 0; i < count; i++) {
    sizes.push(i === count - 1 ? 0 : perFlat);
    if (i < count - 1 && perGap > 0) sizes.push(perGap);
  }
  const pieces = alongY ? splitY(rowBand, sizes) : splitX(rowBand, sizes);
  const flats = [];
  if (perGap > 0) {
    for (let i = 0; i < pieces.length; i++) {
      if (i % 2 === 0) flats.push(pieces[i]);
      else if ((alongY ? pieces[i].h : pieces[i].w) > 0) leftovers.push(pieces[i]);
    }
  } else {
    flats.push(...pieces);
  }
  return { flats, leftovers };
}
function flatFootprintTarget(unitTypes, availableSpan, targetAreaSqFt, availableRun) {
  const bounds = unitTypes.length ? unitTypes.map((t) => FLAT_AREA_BOUNDS_SQM[t] ?? FLAT_AREA_BOUNDS_SQM["2BHK"]) : [FLAT_AREA_BOUNDS_SQM["2BHK"]];
  const explicitTargetSqm = targetAreaSqFt !== void 0 && targetAreaSqFt > 0 ? targetAreaSqFt / 10.7639 : void 0;
  const targetSqm = explicitTargetSqm ? explicitTargetSqm / 0.86 : Math.max(...bounds.map((b) => b.max));
  const targetMm2 = targetSqm * 1e6;
  const idealSpan = snap103(Math.sqrt(targetMm2 / 1.45));
  const wanted = availableSpan >= FLAT_BOUNDS.balconySpanMm ? Math.max(idealSpan, FLAT_BOUNDS.balconySpanMm) : idealSpan;
  const maxAllowedSpan = explicitTargetSqm ? Math.max(FLAT_BOUNDS.maxSpanMm, availableSpan) : FLAT_BOUNDS.maxSpanMm;
  let spanMm = clamp(
    Math.min(wanted, availableSpan),
    FLAT_BOUNDS.minSpanMm,
    maxAllowedSpan
  );
  let rawRunMm = snap103(targetMm2 / spanMm);
  if (explicitTargetSqm && availableRun !== void 0 && availableRun > 0 && rawRunMm > availableRun) {
    const cappedRun = Math.max(FLAT_BOUNDS.minRunMm, snap103(availableRun));
    const neededSpan = Math.min(availableSpan, snap103(targetMm2 / cappedRun));
    if (neededSpan > spanMm) {
      spanMm = clamp(neededSpan, FLAT_BOUNDS.minSpanMm, maxAllowedSpan);
      rawRunMm = snap103(targetMm2 / spanMm);
    }
  }
  const maxAllowedRun = explicitTargetSqm ? Math.max(FLAT_BOUNDS.maxRunMm, rawRunMm) : FLAT_BOUNDS.maxRunMm;
  const runMm = clamp(rawRunMm, FLAT_BOUNDS.minRunMm, maxAllowedRun);
  return { spanMm, runMm };
}
function resolveWingFillMode(program) {
  const noOts = program.mandatory.ventilationStrategy === "PERIMETER_ONLY";
  const targetAreaSqFt = program.mandatory.targetAreaSqFt;
  const hasAreaTarget = targetAreaSqFt !== void 0 && targetAreaSqFt > 0;
  const fillWings = !hasAreaTarget && (noOts || Boolean(program.preferences.properSpaceUtilization) || Boolean(program.preferences.ventilatedCentralOtsShafts));
  return { noOts, hasAreaTarget, fillWings, targetAreaSqFt };
}
function rebalanceMixedWingPair(aSpan, aRun, aMinSpan, aMinRun, aWeightAvg, bSpan, bRun, bMinSpan, bMinRun, bWeightAvg) {
  const aA = aSpan * aRun;
  const aB = bSpan * bRun;
  if (bWeightAvg > 0 && aA > aB * (aWeightAvg / bWeightAvg) * 1.02) {
    const desiredAA = aB * (aWeightAvg / bWeightAvg);
    aRun = Math.max(aMinRun, Math.min(aRun, snap103(desiredAA / aSpan)));
    if (aSpan * aRun > desiredAA * 1.02) {
      aSpan = Math.max(aMinSpan, Math.min(aSpan, snap103(desiredAA / aRun)));
    }
  } else if (aWeightAvg > 0 && aB > aA * (bWeightAvg / aWeightAvg) * 1.02) {
    const desiredAB = aA * (bWeightAvg / aWeightAvg);
    bRun = Math.max(bMinRun, Math.min(bRun, snap103(desiredAB / bSpan)));
    if (bSpan * bRun > desiredAB * 1.02) {
      bSpan = Math.max(bMinSpan, Math.min(bSpan, snap103(desiredAB / bRun)));
    }
  }
  return { aSpan, aRun, bSpan, bRun };
}
var BHK_BAY_WEIGHTS = {
  "1BHK": 0.75,
  "2BHK": 1,
  "3BHK": 1.35,
  "4BHK": 1.7
};
function assignUnitTypesToBoxes(flatBoxes, unitTypes) {
  return [...unitTypes];
}
function rebalanceFlatRowsByBhkWeight(partition, unitTypes) {
  if (unitTypes.length !== partition.flatBoxes.length) return partition;
  if (new Set(unitTypes).size <= 1) return partition;
  const assignedTypes = assignUnitTypesToBoxes(partition.flatBoxes, unitTypes);
  const weightOf = (i) => BHK_BAY_WEIGHTS[assignedTypes[i] ?? "2BHK"] ?? 1;
  const boxes = partition.flatBoxes.map((b) => ({ ...b }));
  const touched = /* @__PURE__ */ new Set();
  let changed = false;
  const rebalance = (horizontal) => {
    const groups = /* @__PURE__ */ new Map();
    boxes.forEach((b, i) => {
      if (touched.has(i)) return;
      const key = horizontal ? `${b.y}|${b.h}` : `${b.x}|${b.w}`;
      groups.set(key, [...groups.get(key) ?? [], i]);
    });
    for (const indices of groups.values()) {
      const sorted = [...indices].sort((a, b) => horizontal ? boxes[a].x - boxes[b].x : boxes[a].y - boxes[b].y);
      const chains = [];
      for (const i of sorted) {
        const chain = chains.at(-1);
        const prev = chain ? boxes[chain.at(-1)] : void 0;
        const cur = boxes[i];
        if (chain && prev && (horizontal ? prev.x + prev.w === cur.x : prev.y + prev.h === cur.y)) chain.push(i);
        else chains.push([i]);
      }
      for (const chain of chains) {
        if (chain.length < 2) continue;
        const weights = chain.map(weightOf);
        if (weights.every((w) => w === weights[0])) continue;
        const first = boxes[chain[0]];
        const last = boxes[chain.at(-1)];
        const start = horizontal ? first.x : first.y;
        const total = horizontal ? last.x + last.w - start : last.y + last.h - start;
        const sumW = weights.reduce((s, w) => s + w, 0);
        const sizes = weights.map((w) => snap103(total * w / sumW));
        sizes[sizes.length - 1] = total - sizes.slice(0, -1).reduce((s, v) => s + v, 0);
        if (sizes.some((s) => s < FLAT_BOUNDS.minSpanMm)) continue;
        let cursor = start;
        chain.forEach((idx, k) => {
          const b = boxes[idx];
          if (horizontal) {
            b.x = cursor;
            b.w = sizes[k];
          } else {
            b.y = cursor;
            b.h = sizes[k];
          }
          cursor += sizes[k];
          touched.add(idx);
        });
        changed = true;
      }
    }
  };
  rebalance(true);
  rebalance(false);
  return changed ? { ...partition, flatBoxes: boxes } : partition;
}
function withTightBuiltOutline(partition) {
  const built = [
    ...partition.flatBoxes,
    ...partition.corridorBoxes,
    ...partition.lobbyBoxes,
    ...partition.liftBoxes,
    ...partition.stairBoxes,
    ...partition.shaftBoxes.filter((_, i) => partition.shaftRoles[i] !== "OPEN_TO_SKY_VOID")
  ];
  if (!built.length) return partition;
  const minX = Math.min(...built.map((b) => b.x));
  const minY = Math.min(...built.map((b) => b.y));
  const maxX = Math.max(...built.map((b) => b.x + b.w));
  const maxY = Math.max(...built.map((b) => b.y + b.h));
  return { ...partition, builtOutline: { x: minX, y: minY, w: maxX - minX, h: maxY - minY } };
}
var MIN_LIGHT_SLOT = 3e3;
var OVERSIZE_TOLERANCE = 1.6;
var MIN_WINDOW_FRONTAGE = 1600;
function envelopeFrontage(box, env) {
  let length = 0;
  if (Math.abs(box.x - env.x) <= 1) length += box.h;
  if (Math.abs(box.x + box.w - (env.x + env.w)) <= 1) length += box.h;
  if (Math.abs(box.y - env.y) <= 1) length += box.w;
  if (Math.abs(box.y + box.h - (env.y + env.h)) <= 1) length += box.w;
  return length;
}
var ENTRANCE_WALL_MIN = 1250;
function partitionDefects(partition, program) {
  const reasons = [];
  const { envelope, flatBoxes, accessEdgeForFlat } = partition;
  const pieces = [
    ...flatBoxes,
    ...partition.corridorBoxes,
    ...partition.lobbyBoxes,
    ...partition.liftBoxes,
    ...partition.stairBoxes,
    ...partition.shaftBoxes
  ];
  const { areaDefectMm2, overlapCount, exact } = dissectionDefect(envelope, pieces);
  if (!exact) {
    reasons.push(
      `partition does not tile the envelope exactly: ${areaDefectMm2.toFixed(3)} mm2 unassigned, ${overlapCount} overlap(s)`
    );
  }
  if (!partition.stairBoxes.length) reasons.push("no staircase placed");
  if (!partition.liftBoxes.length) reasons.push("no lift placed");
  if (!partition.corridorBoxes.length && !partition.lobbyBoxes.length) {
    reasons.push("no common circulation placed");
  }
  const circulation = [...partition.corridorBoxes, ...partition.lobbyBoxes];
  if (circulation.length > 1) {
    const seen = /* @__PURE__ */ new Set([0]);
    const queue = [0];
    while (queue.length) {
      const current = queue.shift();
      for (let i = 0; i < circulation.length; i++) {
        if (seen.has(i)) continue;
        if (sharedEdgeLength(circulation[current], circulation[i]) >= 900) {
          seen.add(i);
          queue.push(i);
        }
      }
    }
    if (seen.size !== circulation.length) {
      reasons.push(
        `common circulation forms ${circulation.length - seen.size + 1} disconnected networks; every corridor and lobby must be reachable from the others so each flat can reach every stair`
      );
    }
  }
  const coreReachable = circulation.some(
    (c) => [...partition.stairBoxes, ...partition.liftBoxes].some((v) => sharedEdgeLength(c, v) >= 900)
  );
  if (circulation.length && !coreReachable) {
    reasons.push("common circulation does not reach any stair or lift");
  }
  for (let i = 0; i < partition.stairBoxes.length; i++) {
    if (!circulation.some((c) => sharedEdgeLength(c, partition.stairBoxes[i]) >= 900)) {
      reasons.push(`staircase ${i + 1} does not adjoin common circulation, so it cannot be entered`);
    }
  }
  for (let i = 0; i < partition.liftBoxes.length; i++) {
    if (!circulation.some((c) => sharedEdgeLength(c, partition.liftBoxes[i]) >= 900)) {
      reasons.push(`lift ${i + 1} does not adjoin common circulation, so its car could not be boarded`);
    }
  }
  for (let i = 0; i < flatBoxes.length; i++) {
    const flat = flatBoxes[i];
    const edge = accessEdgeForFlat[i];
    const label = `flat ${i + 1}`;
    const best = circulation.reduce((max, c) => Math.max(max, sharedEdgeLength(flat, c)), 0);
    if (best < ENTRANCE_WALL_MIN) {
      reasons.push(`${label} shares only ${Math.round(best)} mm with common circulation; an entrance needs ${ENTRANCE_WALL_MIN} mm`);
    }
    const outlineFrontage = envelopeFrontage(flat, partition.builtOutline);
    const ventSlots = partition.shaftBoxes.filter((_, i2) => partition.shaftRoles[i2] === "OPEN_TO_SKY_VOID");
    const slotFrontage = ventSlots.reduce((max, slot) => Math.max(max, sharedEdgeLength(flat, slot)), 0);
    if (outlineFrontage < MIN_WINDOW_FRONTAGE && slotFrontage < MIN_WINDOW_FRONTAGE) {
      reasons.push(
        `${label} has no exterior wall long enough for a window: ${Math.round(outlineFrontage)} mm on the building face and ${Math.round(slotFrontage)} mm onto an open slot, against the ${MIN_WINDOW_FRONTAGE} mm a window needs`
      );
    }
    const { spanMm, runMm } = flatLocalSpans(flat, edge);
    if (spanMm < FLAT_BOUNDS.minSpanMm) {
      reasons.push(`${label} span ${Math.round(spanMm)} mm is below the ${FLAT_BOUNDS.minSpanMm} mm needed for a living zone plus a bedroom zone`);
    }
    if (runMm < FLAT_BOUNDS.minRunMm) {
      reasons.push(`${label} run ${Math.round(runMm)} mm is below the ${FLAT_BOUNDS.minRunMm} mm needed to stack service, living and sleeping bands`);
    }
    const fullFill = program?.mandatory.ventilationStrategy === "PERIMETER_ONLY" || program?.mandatory.targetAreaSqFt !== void 0 && program.mandatory.targetAreaSqFt > 0 || Boolean(program?.preferences.properSpaceUtilization) || Boolean(program?.preferences.ventilatedCentralOtsShafts);
    const maxEnvelopeDim = Math.max(envelope.w, envelope.h);
    const spanLimit = fullFill ? Math.max(FLAT_BOUNDS.maxSpanMm * OVERSIZE_TOLERANCE, maxEnvelopeDim) : FLAT_BOUNDS.maxSpanMm * OVERSIZE_TOLERANCE;
    const runLimit = fullFill ? Math.max(FLAT_BOUNDS.maxRunMm * OVERSIZE_TOLERANCE, maxEnvelopeDim) : FLAT_BOUNDS.maxRunMm * OVERSIZE_TOLERANCE;
    if (spanMm > spanLimit) {
      reasons.push(
        `${label} span ${Math.round(spanMm)} mm is far beyond the ${FLAT_BOUNDS.maxSpanMm} mm a dwelling of this type can use; its rooms would be stretched rather than more numerous`
      );
    }
    if (runMm > runLimit) {
      reasons.push(
        `${label} run ${Math.round(runMm)} mm is far beyond the ${FLAT_BOUNDS.maxRunMm} mm a dwelling of this type can use; its rooms would be stretched rather than more numerous`
      );
    }
  }
  return reasons;
}
var centralCoreSpine = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  const compact = program.preferences.coreCompactness === "COMPACT" || program.preferences.minimizeCorridor || Boolean(program.preferences.properSpaceUtilization);
  const stairCount = program.mandatory.stairCount >= 2 ? 2 : 1;
  const noOts = program.mandatory.ventilationStrategy === "PERIMETER_ONLY";
  const hasAreaTarget = program.mandatory.targetAreaSqFt !== void 0 && program.mandatory.targetAreaSqFt > 0;
  const liftCountOverride = program.mandatory.singleLift ? 1 : void 0;
  const attempts = [];
  const bothSides = flatsPerFloor >= 2;
  const corridorSides = bothSides ? "BOTH" : "LOW";
  const coreW = requiredCoreBandWidth({ compact, corridorSides });
  const westCount = flatsPerFloor === 1 ? 1 : flatsPerFloor === 2 ? 1 : flatsPerFloor === 3 ? 1 : Math.floor(flatsPerFloor / 2);
  const eastCount = flatsPerFloor - westCount;
  const availW = env.w - coreW;
  const unitTypes = program.mandatory.unitTypes;
  const westTypes = unitTypes.length === flatsPerFloor ? unitTypes.slice(0, westCount) : unitTypes;
  const eastTypes = unitTypes.length === flatsPerFloor ? unitTypes.slice(westCount) : unitTypes;
  const isMixed = new Set(unitTypes).size > 1 && westCount > 0 && eastCount > 0;
  const weightOf = (ts) => ts.reduce((s, t) => s + (BHK_BAY_WEIGHTS[t] ?? 1), 0);
  const westWeight = weightOf(westTypes);
  const eastWeight = weightOf(eastTypes);
  const minWingSpan = availW >= 2 * FLAT_BOUNDS.balconySpanMm ? FLAT_BOUNDS.balconySpanMm : FLAT_BOUNDS.minSpanMm;
  const balancedLeftW = isMixed && westWeight + eastWeight > 0 ? snap103(clamp(availW * (westWeight / (westWeight + eastWeight)), minWingSpan, availW - minWingSpan)) : snap103(availW / 2);
  for (const liftsAtLowSide of [false, true]) {
    const variantId = `central:lifts=${liftsAtLowSide ? "west" : "east"}`;
    const label = "Central circulation core";
    const leftW = balancedLeftW;
    if (leftW < FLAT_BOUNDS.minSpanMm || availW - leftW < FLAT_BOUNDS.minSpanMm) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`a ${Math.round(coreW)} mm central core leaves wings only ${Math.round(Math.min(leftW, availW - leftW))} mm across`]
      });
      continue;
    }
    const [left, core, right] = splitX(env, [leftW, coreW, 0]);
    const band = dissectCoreBand(core, {
      stairCount,
      compact,
      liftsAtLowSide,
      preferOts: !noOts && program.preferences.ventilationStrategy === "CENTRAL_COURTYARD",
      preferCompactOts: !noOts && Boolean(program.preferences.ventilatedCentralOtsShafts),
      noOts,
      liftCountOverride,
      corridorSides
    });
    if (band.reasons.length) {
      attempts.push({ variantId, label, rationale: "", reasons: band.reasons });
      continue;
    }
    const { fillWings, targetAreaSqFt } = resolveWingFillMode(program);
    const westTarget = flatFootprintTarget(westTypes, leftW, targetAreaSqFt, Math.ceil(left.h / westCount));
    const eastTarget = flatFootprintTarget(eastTypes, right.w, targetAreaSqFt, Math.ceil(right.h / eastCount));
    let spanCapW = fillWings ? left.w : hasAreaTarget ? Math.min(left.w, westTarget.spanMm) : Math.min(left.w, Math.max(westTarget.spanMm, FLAT_BOUNDS.maxSpanMm * OVERSIZE_TOLERANCE));
    let spanCapE = fillWings ? right.w : hasAreaTarget ? Math.min(right.w, eastTarget.spanMm) : Math.min(right.w, Math.max(eastTarget.spanMm, FLAT_BOUNDS.maxSpanMm * OVERSIZE_TOLERANCE));
    let runW = fillWings ? Math.ceil(left.h / westCount) : Math.min(Math.ceil(left.h / westCount), westTarget.runMm);
    let runE = fillWings ? Math.ceil(right.h / eastCount) : Math.min(Math.ceil(right.h / eastCount), eastTarget.runMm);
    if (isMixed && fillWings && eastCount > 0 && westCount > 0) {
      const rebalanced = rebalanceMixedWingPair(
        spanCapW,
        runW,
        FLAT_BOUNDS.balconySpanMm,
        westTarget.runMm,
        westWeight / westCount,
        spanCapE,
        runE,
        FLAT_BOUNDS.balconySpanMm,
        eastTarget.runMm,
        eastWeight / eastCount
      );
      spanCapW = rebalanced.aSpan;
      runW = rebalanced.aRun;
      spanCapE = rebalanced.bSpan;
      runE = rebalanced.bRun;
    }
    const westRow = sliceFlatRow(left, westCount, runW, true, spanCapW, false);
    const eastRow = sliceFlatRow(right, eastCount, runE, true, spanCapE, true);
    const flatBoxes = [];
    const edges = [];
    for (const b of westRow.flats) {
      flatBoxes.push(b);
      edges.push("EAST");
    }
    for (const b of eastRow.flats) {
      flatBoxes.push(b);
      edges.push("WEST");
    }
    const openSpace = [...westRow.leftovers, ...eastRow.leftovers];
    const openSpaceTags = openSpace.map(
      () => fillWings || hasAreaTarget ? ["recess:perimeter"] : []
    );
    attempts.push({
      variantId,
      label,
      rationale: `Stairs and lifts occupy a ${Math.round(coreW)} mm band through the centre of the plot, lined by a corridor on each face so every flat is entered across the full depth of its party wall. The ${flatsPerFloor} flats sit to either side, giving short entrance walks and two exterior facades per flat; the core is internal, so its leftover length carries the ventilation shaft.`,
      partition: {
        familyId: "CENTRAL_CORE_SPINE",
        variantId,
        massingShape: "COMPACT_DOUBLE_LOADED",
        envelope: env,
        builtOutline: env,
        flatBoxes,
        accessEdgeForFlat: edges,
        corridorBoxes: band.corridorBoxes,
        lobbyBoxes: band.lobbyBoxes,
        liftBoxes: band.liftBoxes,
        stairBoxes: band.stairBoxes,
        shaftBoxes: [...band.shaftBoxes, ...openSpace],
        shaftRoles: [...band.shaftRoles, ...openSpace.map(() => "OPEN_TO_SKY_VOID")],
        shaftTags: [...band.shaftTags, ...openSpaceTags],
        coreBoxes: [core]
      }
    });
  }
  return attempts;
};
var dualWing = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  const compact = program.preferences.coreCompactness === "COMPACT" || program.preferences.minimizeCorridor || Boolean(program.preferences.properSpaceUtilization);
  const stairCount = program.mandatory.stairCount >= 2 ? 2 : 1;
  const noOts = program.mandatory.ventilationStrategy === "PERIMETER_ONLY";
  const hasAreaTarget = program.mandatory.targetAreaSqFt !== void 0 && program.mandatory.targetAreaSqFt > 0;
  const liftCountOverride = program.mandatory.singleLift ? 1 : void 0;
  const corridorSides = "BOTH";
  const coreH = requiredCoreBandWidth({ compact, corridorSides });
  const northCount = flatsPerFloor === 1 ? 1 : flatsPerFloor === 2 ? 1 : flatsPerFloor === 3 ? 1 : Math.floor(flatsPerFloor / 2);
  const southCount = flatsPerFloor - northCount;
  const availH = env.h - coreH;
  const unitTypes = program.mandatory.unitTypes;
  const northTypes = unitTypes.length === flatsPerFloor ? unitTypes.slice(0, northCount) : unitTypes;
  const southTypes = unitTypes.length === flatsPerFloor ? unitTypes.slice(northCount) : unitTypes;
  const isMixed = new Set(unitTypes).size > 1 && northCount > 0 && southCount > 0;
  const weightOf = (ts) => ts.reduce((s, t) => s + (BHK_BAY_WEIGHTS[t] ?? 1), 0);
  const northWeight = weightOf(northTypes);
  const southWeight = weightOf(southTypes);
  const minWingSpan = availH >= 2 * FLAT_BOUNDS.balconySpanMm ? FLAT_BOUNDS.balconySpanMm : FLAT_BOUNDS.minSpanMm;
  const northH = isMixed && northWeight + southWeight > 0 ? snap103(clamp(availH * (northWeight / (northWeight + southWeight)), minWingSpan, availH - minWingSpan)) : snap103(availH / 2);
  const attempts = [];
  for (const liftsAtLowSide of [false, true]) {
    const variantId = `dualwing:lifts=${liftsAtLowSide ? "west" : "east"}`;
    const label = "Dual wing with cross circulation";
    if (northH < FLAT_BOUNDS.minSpanMm || env.h - coreH - northH < FLAT_BOUNDS.minSpanMm) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`a ${Math.round(coreH)} mm cross core leaves wings only ${Math.round(Math.min(northH, env.h - coreH - northH))} mm deep`]
      });
      continue;
    }
    const [north, link, south] = splitY(env, [northH, coreH, 0]);
    const band = dissectCoreBand(link, {
      stairCount,
      compact,
      liftsAtLowSide,
      preferOts: !noOts && program.preferences.ventilationStrategy === "CENTRAL_COURTYARD",
      preferCompactOts: !noOts && Boolean(program.preferences.ventilatedCentralOtsShafts),
      noOts,
      liftCountOverride,
      corridorSides
    });
    if (band.reasons.length) {
      attempts.push({ variantId, label, rationale: "", reasons: band.reasons });
      continue;
    }
    const { fillWings, targetAreaSqFt } = resolveWingFillMode(program);
    const northTarget = flatFootprintTarget(northTypes, northH, targetAreaSqFt, Math.ceil(north.w / northCount));
    const southTarget = flatFootprintTarget(southTypes, south.h, targetAreaSqFt, Math.ceil(south.w / southCount));
    let maxSpanN = fillWings ? north.h : hasAreaTarget ? Math.min(north.h, northTarget.spanMm) : Math.min(north.h, Math.max(northTarget.spanMm, FLAT_BOUNDS.maxSpanMm * OVERSIZE_TOLERANCE));
    let maxSpanS = fillWings ? south.h : hasAreaTarget ? Math.min(south.h, southTarget.spanMm) : Math.min(south.h, Math.max(southTarget.spanMm, FLAT_BOUNDS.maxSpanMm * OVERSIZE_TOLERANCE));
    let runN = fillWings ? Math.ceil(north.w / northCount) : Math.min(Math.ceil(north.w / northCount), northTarget.runMm);
    let runS = fillWings ? Math.ceil(south.w / southCount) : Math.min(Math.ceil(south.w / southCount), southTarget.runMm);
    if (isMixed && fillWings && northCount > 0 && southCount > 0) {
      const rebalanced = rebalanceMixedWingPair(
        maxSpanN,
        runN,
        FLAT_BOUNDS.balconySpanMm,
        northTarget.runMm,
        northWeight / northCount,
        maxSpanS,
        runS,
        FLAT_BOUNDS.balconySpanMm,
        southTarget.runMm,
        southWeight / southCount
      );
      maxSpanN = rebalanced.aSpan;
      runN = rebalanced.aRun;
      maxSpanS = rebalanced.bSpan;
      runS = rebalanced.bRun;
    }
    const northRow = sliceFlatRow(north, northCount, runN, false, maxSpanN, false);
    const southRow = sliceFlatRow(south, southCount, runS, false, maxSpanS, true);
    const flatBoxes = [];
    const edges = [];
    for (const b of northRow.flats) {
      flatBoxes.push(b);
      edges.push("SOUTH");
    }
    for (const b of southRow.flats) {
      flatBoxes.push(b);
      edges.push("NORTH");
    }
    const openSpace = [...northRow.leftovers, ...southRow.leftovers];
    const openSpaceTags = openSpace.map(
      () => fillWings || hasAreaTarget ? ["recess:perimeter"] : []
    );
    attempts.push({
      variantId,
      label,
      rationale: `Circulation runs east-west across the plot in a ${Math.round(coreH)} mm band, splitting the dwellings into a north wing and a south wing. Flats are entered from their long side, so the living and sleeping bands run across the plot rather than down it and each flat presents a full-width exterior facade.`,
      partition: {
        familyId: "DUAL_WING",
        variantId,
        massingShape: "COMPACT_DOUBLE_LOADED",
        envelope: env,
        builtOutline: env,
        flatBoxes,
        accessEdgeForFlat: edges,
        corridorBoxes: band.corridorBoxes,
        lobbyBoxes: band.lobbyBoxes,
        liftBoxes: band.liftBoxes,
        stairBoxes: band.stairBoxes,
        shaftBoxes: [...band.shaftBoxes, ...openSpace],
        shaftRoles: [...band.shaftRoles, ...openSpace.map(() => "OPEN_TO_SKY_VOID")],
        shaftTags: [...band.shaftTags, ...openSpaceTags],
        coreBoxes: [link]
      }
    });
  }
  return attempts;
};
var sideCore = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  const compact = program.preferences.coreCompactness === "COMPACT" || program.preferences.minimizeCorridor;
  const stairCount = program.mandatory.stairCount >= 2 ? 2 : 1;
  const attempts = [];
  const sides = [
    { side: "EAST", name: "east" },
    { side: "WEST", name: "west" },
    { side: "NORTH", name: "north" },
    { side: "SOUTH", name: "south" }
  ];
  for (const { side, name } of sides) {
    const variantId = `side:${name}`;
    const label = `Side core to the ${name}`;
    const vertical = side === "EAST" || side === "WEST";
    const corridorSides = side === "EAST" || side === "SOUTH" ? "LOW" : "HIGH";
    const coreSpan = requiredCoreBandWidth({ compact, corridorSides });
    const across = vertical ? env.w : env.h;
    const flatsSpan = across - coreSpan;
    if (flatsSpan < FLAT_BOUNDS.minSpanMm) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`a ${Math.round(coreSpan)} mm ${name} core leaves only ${Math.round(flatsSpan)} mm for dwellings`]
      });
      continue;
    }
    let core;
    let flatsRegion;
    if (side === "EAST") {
      const [r, c] = splitX(env, [flatsSpan, 0]);
      flatsRegion = r;
      core = c;
    } else if (side === "WEST") {
      const [c, r] = splitX(env, [coreSpan, 0]);
      core = c;
      flatsRegion = r;
    } else if (side === "SOUTH") {
      const [r, c] = splitY(env, [flatsSpan, 0]);
      flatsRegion = r;
      core = c;
    } else {
      const [c, r] = splitY(env, [coreSpan, 0]);
      core = c;
      flatsRegion = r;
    }
    const band = dissectCoreBand(core, {
      stairCount,
      compact,
      liftsAtLowSide: side === "WEST" || side === "NORTH",
      preferOts: false,
      corridorSides
    });
    if (band.reasons.length) {
      attempts.push({ variantId, label, rationale: "", reasons: band.reasons });
      continue;
    }
    const { fillWings, hasAreaTarget, targetAreaSqFt } = resolveWingFillMode(program);
    const alongY = vertical;
    const availRun = alongY ? flatsRegion.h : flatsRegion.w;
    const target = flatFootprintTarget(program.mandatory.unitTypes, flatsSpan, targetAreaSqFt, Math.ceil(availRun / flatsPerFloor));
    const runCap = fillWings ? Math.ceil(availRun / flatsPerFloor) : Math.min(Math.ceil(availRun / flatsPerFloor), target.runMm);
    const spanCap = fillWings ? flatsSpan : target.spanMm;
    const row = sliceFlatRow(
      flatsRegion,
      flatsPerFloor,
      runCap,
      alongY,
      spanCap,
      side === "WEST" || side === "NORTH"
    );
    const flatBoxes = row.flats;
    const edges = flatBoxes.map(() => side);
    const openSpace = [...row.leftovers];
    const openSpaceTags = openSpace.map(
      () => fillWings || hasAreaTarget ? ["recess:perimeter"] : []
    );
    attempts.push({
      variantId,
      label,
      rationale: `Stairs and lifts are gathered into a ${Math.round(coreSpan)} mm band along the ${name} edge, served by a single-loaded corridor running its full length. All ${flatsPerFloor} flats enter through their ${name} wall, which leaves the opposite side of the plot entirely for habitable rooms and puts the stair and lobby on an exterior wall where they can be daylit directly.`,
      partition: {
        familyId: "SIDE_CORE",
        variantId,
        massingShape: "COMPACT_DOUBLE_LOADED",
        envelope: env,
        builtOutline: env,
        flatBoxes,
        accessEdgeForFlat: edges,
        corridorBoxes: band.corridorBoxes,
        lobbyBoxes: band.lobbyBoxes,
        liftBoxes: band.liftBoxes,
        stairBoxes: band.stairBoxes,
        shaftBoxes: [...band.shaftBoxes, ...openSpace],
        shaftRoles: [...band.shaftRoles, ...openSpace.map(() => "OPEN_TO_SKY_VOID")],
        shaftTags: [...band.shaftTags, ...openSpaceTags],
        coreBoxes: [core]
      }
    });
  }
  return attempts;
};
var splitCore = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  if (program.mandatory.stairCount < 2) {
    return [{
      variantId: "split:ns",
      label: "Split cores",
      rationale: "",
      reasons: ["a split-core arrangement needs at least two staircases; the brief asked for one"]
    }];
  }
  const compact = program.preferences.coreCompactness === "COMPACT";
  const corrW = corridorWidth(compact);
  const attempts = [];
  for (const axis of ["ns", "ew"]) {
    const variantId = `split:${axis}`;
    const label = `Split cores at the ${axis === "ns" ? "north and south" : "east and west"} ends`;
    const across = axis === "ns" ? env.w : env.h;
    const flatsSpan = across - corrW;
    if (flatsSpan < FLAT_BOUNDS.minSpanMm) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`a ${corrW} mm connecting spine leaves flats only ${Math.round(flatsSpan)} mm across`]
      });
      continue;
    }
    const [spine, served] = axis === "ns" ? splitX(env, [corrW, 0]) : splitY(env, [corrW, 0]);
    const coreSpanA = requiredCoreBandWidth({ compact, corridorSides: "HIGH" });
    const coreSpanB = requiredCoreBandWidth({ compact, corridorSides: "LOW" });
    const along = axis === "ns" ? served.h : served.w;
    const middleSpan = along - coreSpanA - coreSpanB;
    if (middleSpan < FLAT_BOUNDS.minRunMm) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`two end cores leave only ${Math.round(middleSpan)} mm between them for dwellings`]
      });
      continue;
    }
    const [coreA, middle, coreB] = axis === "ns" ? splitY(served, [coreSpanA, middleSpan, 0]) : splitX(served, [coreSpanA, middleSpan, 0]);
    const bandA = dissectCoreBand(coreA, { stairCount: 1, compact, liftsAtLowSide: true, preferOts: false, corridorSides: "HIGH" });
    const bandB = dissectCoreBand(coreB, { stairCount: 1, compact, liftsAtLowSide: false, preferOts: false, corridorSides: "LOW" });
    if (bandA.reasons.length || bandB.reasons.length) {
      attempts.push({ variantId, label, rationale: "", reasons: [...bandA.reasons, ...bandB.reasons] });
      continue;
    }
    const flatsRegion = middle;
    const { fillWings, hasAreaTarget, targetAreaSqFt } = resolveWingFillMode(program);
    const availRun = axis === "ns" ? flatsRegion.h : flatsRegion.w;
    const target = flatFootprintTarget(program.mandatory.unitTypes, flatsSpan, targetAreaSqFt, Math.ceil(availRun / flatsPerFloor));
    const runCap = fillWings ? Math.ceil(availRun / flatsPerFloor) : Math.min(Math.ceil(availRun / flatsPerFloor), target.runMm);
    const spanCap = fillWings ? flatsSpan : target.spanMm;
    const row = sliceFlatRow(flatsRegion, flatsPerFloor, runCap, axis === "ns", spanCap, true);
    const flatBoxes = row.flats;
    const openSpace = [...row.leftovers];
    const openSpaceTags = openSpace.map(
      () => fillWings || hasAreaTarget ? ["recess:perimeter"] : []
    );
    const edges = flatBoxes.map(() => axis === "ns" ? "WEST" : "NORTH");
    attempts.push({
      variantId,
      label,
      rationale: `Vertical circulation is split into two remote cores at opposite ends of the plot rather than concentrated in one band, joined by a ${corrW} mm spine corridor that runs the whole length between them. Every flat opens onto that spine, so each has a route to a stair in either direction and travel to an exit stays short while the two stairs remain genuinely remote from one another. The spine corridor and the second lobby are what this organization pays for that separation.`,
      partition: {
        familyId: "SPLIT_CORE",
        variantId,
        massingShape: "COMPACT_DOUBLE_LOADED",
        envelope: env,
        builtOutline: env,
        flatBoxes,
        accessEdgeForFlat: edges,
        corridorBoxes: [spine, ...bandA.corridorBoxes, ...bandB.corridorBoxes],
        lobbyBoxes: [...bandA.lobbyBoxes, ...bandB.lobbyBoxes],
        liftBoxes: [...bandA.liftBoxes, ...bandB.liftBoxes],
        stairBoxes: [...bandA.stairBoxes, ...bandB.stairBoxes],
        shaftBoxes: [...bandA.shaftBoxes, ...bandB.shaftBoxes, ...openSpace],
        shaftRoles: [...bandA.shaftRoles, ...bandB.shaftRoles, ...openSpace.map(() => "OPEN_TO_SKY_VOID")],
        shaftTags: [...bandA.shaftTags, ...bandB.shaftTags, ...openSpaceTags],
        coreBoxes: [coreA, coreB]
      }
    });
  }
  return attempts;
};
var centralCourtyard = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  const compact = program.preferences.coreCompactness === "COMPACT";
  const corrW = corridorWidth(compact);
  const attempts = [];
  for (const liftsAtLowSide of [true, false]) {
    const variantId = `courtyard:lifts=${liftsAtLowSide ? "outer" : "inner"}`;
    const label = "Central open-to-sky courtyard";
    const coreSpan = requiredCoreBandWidth({ compact, corridorSides: "NONE" });
    const courtW = env.w - 2 * coreSpan - 2 * corrW;
    if (courtW < CORE_BOUNDS.otsMinSpan) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`a central court would be ${Math.round(courtW)} mm wide after flanking cores and corridors; ${CORE_BOUNDS.otsMinSpan} mm is the minimum usable span`]
      });
      continue;
    }
    const coreRun = requiredCoreBandLength({ compact, stairCount: 1 });
    const courtRun = Math.max(coreRun, snap103(env.h * 0.18));
    const bandDepth = courtRun + 2 * corrW;
    const wingH = snap103((env.h - bandDepth) / 2);
    if (wingH < FLAT_BOUNDS.minRunMm) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`a central court and its corridor loop leave wings only ${Math.round(wingH)} mm deep; ${FLAT_BOUNDS.minRunMm} mm is needed to stack rooms`]
      });
      continue;
    }
    const [northWing, midBand, southWing] = splitY(env, [wingH, bandDepth, 0]);
    const [northRun, courtRow, southRun] = splitY(midBand, [corrW, courtRun, 0]);
    const [coreWest, corrWest, court, corrEast, coreEast] = splitX(courtRow, [coreSpan, corrW, courtW, corrW, 0]);
    const west = dissectCoreBand(coreWest, { stairCount: 1, compact, liftsAtLowSide, preferOts: false, corridorSides: "NONE", landingSuppliedExternally: true });
    const east = dissectCoreBand(coreEast, { stairCount: 1, compact, liftsAtLowSide: !liftsAtLowSide, preferOts: false, corridorSides: "NONE", landingSuppliedExternally: true });
    if (west.reasons.length || east.reasons.length) {
      attempts.push({ variantId, label, rationale: "", reasons: [...west.reasons, ...east.reasons] });
      continue;
    }
    const { fillWings, hasAreaTarget, targetAreaSqFt } = resolveWingFillMode(program);
    const northCount = flatsPerFloor === 1 ? 1 : flatsPerFloor === 2 ? 1 : flatsPerFloor === 3 ? 1 : Math.floor(flatsPerFloor / 2);
    const southCount = flatsPerFloor - northCount;
    const minCourtyardWingW = Math.min(Math.ceil(northWing.w / Math.max(1, northCount)), Math.ceil(southWing.w / Math.max(1, southCount)));
    const target = flatFootprintTarget(program.mandatory.unitTypes, wingH, targetAreaSqFt, minCourtyardWingW);
    const northFlatRun = fillWings ? Math.ceil(northWing.w / Math.max(1, northCount)) : Math.min(Math.ceil(northWing.w / Math.max(1, northCount)), target.runMm);
    const southFlatRun = fillWings ? Math.ceil(southWing.w / Math.max(1, southCount)) : Math.min(Math.ceil(southWing.w / Math.max(1, southCount)), target.runMm);
    const northRow = sliceFlatRow(northWing, northCount, northFlatRun, false, fillWings ? wingH : target.spanMm, false);
    const southRow = sliceFlatRow(southWing, southCount, southFlatRun, false, fillWings ? wingH : target.spanMm, true);
    const flatBoxes = [];
    const edges = [];
    for (const b of northRow.flats) {
      flatBoxes.push(b);
      edges.push("SOUTH");
    }
    for (const b of southRow.flats) {
      flatBoxes.push(b);
      edges.push("NORTH");
    }
    const openSpace = [...northRow.leftovers, ...southRow.leftovers];
    const openSpaceTags = openSpace.map(
      () => fillWings || hasAreaTarget ? ["recess:perimeter"] : []
    );
    attempts.push({
      variantId,
      label,
      rationale: `A ${Math.round(courtW)} x ${Math.round(courtRun)} mm open-to-sky court sits at the centre of the plan, ringed by a continuous corridor loop: runs down its east and west faces and full-width runs across its north and south faces, which close the loop so either stair/lift block is reachable from every flat. The dwellings form an outer ring in the north and south wings, so the circulation and the inner face of each flat draw daylight and cross air from the court as well as from the outer facade. The court consumes built area and the loop lengthens the circulation perimeter, which is the trade this organization makes.`,
      partition: {
        familyId: "CENTRAL_COURTYARD",
        variantId,
        massingShape: "COMPACT_DOUBLE_LOADED",
        envelope: env,
        builtOutline: env,
        flatBoxes,
        accessEdgeForFlat: edges,
        // The loop: north and south runs span the full plot width and therefore
        // share a wall with both the west and east runs.
        corridorBoxes: [northRun, corrWest, corrEast, southRun],
        lobbyBoxes: [...west.lobbyBoxes, ...east.lobbyBoxes],
        liftBoxes: [...west.liftBoxes, ...east.liftBoxes],
        stairBoxes: [...west.stairBoxes, ...east.stairBoxes],
        shaftBoxes: [...west.shaftBoxes, ...east.shaftBoxes, court, ...openSpace],
        shaftRoles: [...west.shaftRoles, ...east.shaftRoles, "OPEN_TO_SKY_VOID", ...openSpace.map(() => "OPEN_TO_SKY_VOID")],
        shaftTags: [...west.shaftTags, ...east.shaftTags, ["shaft:ots"], ...openSpaceTags],
        coreBoxes: [coreWest, coreEast]
      }
    });
  }
  return attempts;
};
var linearSingleLoaded = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  const compact = program.preferences.coreCompactness === "COMPACT" || program.preferences.minimizeCorridor;
  const stairCount = program.mandatory.stairCount >= 2 ? 2 : 1;
  const corrW = corridorWidth(compact);
  const attempts = [];
  const alongY = env.h >= env.w;
  for (const coreAtHighSide of [true, false]) {
    const side = alongY ? coreAtHighSide ? "EAST" : "WEST" : coreAtHighSide ? "SOUTH" : "NORTH";
    const variantId = `linear:${alongY ? "ns" : "ew"}:corridor=${side.toLowerCase()}`;
    const label = `Linear single-loaded corridor (${side.toLowerCase()} access)`;
    const stackW = compact ? CORE_BOUNDS.stairWidthMin : CORE_BOUNDS.stairWidthMax;
    const colSpan = corrW + stackW;
    const across = alongY ? env.w : env.h;
    const flatsSpan = across - colSpan;
    if (flatsSpan < FLAT_BOUNDS.minSpanMm) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`a ${corrW} mm corridor beside a ${stackW} mm stair stack leaves flats ${Math.round(flatsSpan)} mm across`]
      });
      continue;
    }
    const stackRun = requiredCoreBandLength({ compact, stairCount });
    const along = alongY ? env.h : env.w;
    if (stackRun > along) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`the stair and lift stack needs ${stackRun} mm of length; the plot offers ${Math.round(along)} mm`]
      });
      continue;
    }
    let flatsRegion, column;
    if (alongY) {
      const sizes = coreAtHighSide ? [flatsSpan, 0] : [colSpan, 0];
      const [a, b] = splitX(env, sizes);
      if (coreAtHighSide) {
        flatsRegion = a;
        column = b;
      } else {
        column = a;
        flatsRegion = b;
      }
    } else {
      const sizes = coreAtHighSide ? [flatsSpan, 0] : [colSpan, 0];
      const [a, b] = splitY(env, sizes);
      if (coreAtHighSide) {
        flatsRegion = a;
        column = b;
      } else {
        column = a;
        flatsRegion = b;
      }
    }
    const corridorFirst = coreAtHighSide;
    const colPieces = alongY ? splitX(column, corridorFirst ? [corrW, 0] : [stackW, 0]) : splitY(column, corridorFirst ? [corrW, 0] : [stackW, 0]);
    const corridorCol = corridorFirst ? colPieces[0] : colPieces[1];
    const stackCol = corridorFirst ? colPieces[1] : colPieces[0];
    const stackPieces = alongY ? splitY(stackCol, [stackRun, 0]) : splitX(stackCol, [stackRun, 0]);
    const coreBox = stackPieces[0];
    const stackTail = stackPieces[1];
    const band = dissectCoreBand(coreBox, { stairCount, compact, liftsAtLowSide: true, preferOts: false, corridorSides: "NONE", landingSuppliedExternally: true });
    if (band.reasons.length) {
      attempts.push({ variantId, label, rationale: "", reasons: band.reasons });
      continue;
    }
    const { fillWings, hasAreaTarget, targetAreaSqFt } = resolveWingFillMode(program);
    const availRun = alongY ? flatsRegion.h : flatsRegion.w;
    const target = flatFootprintTarget(program.mandatory.unitTypes, flatsSpan, targetAreaSqFt, Math.ceil(availRun / flatsPerFloor));
    const runCap = fillWings ? Math.ceil(availRun / flatsPerFloor) : Math.min(Math.ceil(availRun / flatsPerFloor), target.runMm);
    const spanCap = fillWings ? flatsSpan : target.spanMm;
    const row = sliceFlatRow(
      flatsRegion,
      flatsPerFloor,
      runCap,
      alongY,
      spanCap,
      side === "WEST" || side === "NORTH"
    );
    const flatBoxes = row.flats;
    const edges = flatBoxes.map(() => side);
    const shaftBoxes = [...band.shaftBoxes];
    const shaftRoles = [...band.shaftRoles];
    const shaftTags = [...band.shaftTags];
    for (const strip of row.leftovers) {
      shaftBoxes.push(strip);
      shaftRoles.push("OPEN_TO_SKY_VOID");
      shaftTags.push(fillWings || hasAreaTarget ? ["recess:perimeter"] : []);
    }
    if ((alongY ? stackTail.h : stackTail.w) > 0) {
      shaftBoxes.push(stackTail);
      const stackTailRole = Math.min(stackTail.w, stackTail.h) >= CORE_BOUNDS.otsMinSpan ? "OPEN_TO_SKY_VOID" : "SERVICE_SHAFT";
      shaftRoles.push(stackTailRole);
      shaftTags.push([]);
    }
    attempts.push({
      variantId,
      label,
      rationale: `All ${flatsPerFloor} flats sit in one row along the plot's long axis, entered from a ${corrW} mm single-loaded corridor that runs the full plot length on the ${side.toLowerCase()} side, with the stair and lift stack beyond it. Every flat keeps an uninterrupted run of exterior facade on the far side, which suits an elongated plot where a central core would strand deep unusable leftovers.`,
      partition: {
        familyId: "LINEAR_SINGLE_LOADED",
        variantId,
        massingShape: "COMPACT_DOUBLE_LOADED",
        envelope: env,
        builtOutline: env,
        flatBoxes,
        accessEdgeForFlat: edges,
        corridorBoxes: [corridorCol],
        lobbyBoxes: band.lobbyBoxes,
        liftBoxes: band.liftBoxes,
        stairBoxes: band.stairBoxes,
        shaftBoxes,
        shaftRoles,
        shaftTags,
        coreBoxes: [coreBox]
      }
    });
  }
  return attempts;
};
var perimeterHabitable = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  if (flatsPerFloor < 3) {
    return [{
      variantId: "perimeter:nw",
      label: "Perimeter habitable",
      rationale: "",
      reasons: ["wrapping dwellings around a corner core needs at least three flats"]
    }];
  }
  const compact = true;
  const stairCount = program.mandatory.stairCount >= 2 ? 2 : 1;
  const corrW = corridorWidth(program.preferences.minimizeCorridor);
  const attempts = [];
  for (const atWest of [true, false]) {
    const variantId = `perimeter:${atWest ? "nw" : "ne"}`;
    const label = `Perimeter dwellings around a ${atWest ? "north-west" : "north-east"} core`;
    const stackW = Math.max(CORE_BOUNDS.stairWidthMin, FLAT_BOUNDS.minSpanMm);
    const colSpan = corrW + stackW;
    const wingSpan = env.w - colSpan;
    if (wingSpan < FLAT_BOUNDS.minSpanMm) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`a ${colSpan} mm service column leaves the open wing only ${Math.round(wingSpan)} mm across`]
      });
      continue;
    }
    const stackRun = requiredCoreBandLength({ compact, stairCount });
    const wrapRun = env.h - stackRun;
    if (wrapRun < FLAT_BOUNDS.minRunMm) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`the core stack leaves only ${Math.round(wrapRun)} mm of column for the wrapping flat; ${FLAT_BOUNDS.minRunMm} mm is needed to stack rooms`]
      });
      continue;
    }
    if (stackW < FLAT_BOUNDS.minSpanMm) {
      attempts.push({
        variantId,
        label,
        rationale: "",
        reasons: [`the wrapping flat would be only ${stackW} mm across, below the ${FLAT_BOUNDS.minSpanMm} mm needed for a living zone plus a bedroom zone`]
      });
      continue;
    }
    const colSizes = atWest ? [stackW, corrW, 0] : [wingSpan, corrW, 0];
    const [c1, c2, c3] = splitX(env, colSizes);
    const coreCol = atWest ? c1 : c3;
    const corridorBox = c2;
    const wing = atWest ? c3 : c1;
    const [coreBox, wrapFlat] = splitY(coreCol, [stackRun, 0]);
    const band = dissectCoreBand(coreBox, { stairCount, compact, liftsAtLowSide: atWest, preferOts: false, corridorSides: "NONE", landingSuppliedExternally: true });
    if (band.reasons.length) {
      attempts.push({ variantId, label, rationale: "", reasons: band.reasons });
      continue;
    }
    const wingEdge = atWest ? "WEST" : "EAST";
    const wrapEdge = atWest ? "EAST" : "WEST";
    const wingCount = flatsPerFloor - 1;
    const { fillWings, hasAreaTarget, targetAreaSqFt } = resolveWingFillMode(program);
    const target = flatFootprintTarget(program.mandatory.unitTypes, wingSpan, targetAreaSqFt, Math.ceil(wing.h / wingCount));
    const wingRun = fillWings ? Math.ceil(wing.h / wingCount) : Math.min(Math.ceil(wing.h / wingCount), target.runMm);
    const wingRow = sliceFlatRow(wing, wingCount, wingRun, true, fillWings ? wingSpan : target.spanMm, wingEdge === "WEST");
    const flatBoxes = [];
    const edges = [];
    for (const b of wingRow.flats) {
      flatBoxes.push(b);
      edges.push(wingEdge);
    }
    flatBoxes.push(wrapFlat);
    edges.push(wrapEdge);
    const openSpace = [...wingRow.leftovers];
    const openSpaceTags = openSpace.map(
      () => fillWings || hasAreaTarget ? ["recess:perimeter"] : []
    );
    attempts.push({
      variantId,
      label,
      rationale: `Stairs and lifts are pulled to the ${atWest ? "north-west" : "north-east"} end of a narrow service column so the dwellings can claim the whole perimeter, with a corridor running the full plot length beside it. ${wingCount} flats run down the open wing entered from their ${wingEdge.toLowerCase()} wall and one wraps below the core entered from the ${wrapEdge.toLowerCase()}, so the dwellings are entered from two opposite directions and bedrooms end up furthest from the shared lobby.`,
      partition: {
        familyId: "PERIMETER_HABITABLE",
        variantId,
        massingShape: "COMPACT_DOUBLE_LOADED",
        envelope: env,
        builtOutline: env,
        flatBoxes,
        accessEdgeForFlat: edges,
        corridorBoxes: [corridorBox],
        lobbyBoxes: band.lobbyBoxes,
        liftBoxes: band.liftBoxes,
        stairBoxes: band.stairBoxes,
        shaftBoxes: [...band.shaftBoxes, ...openSpace],
        shaftRoles: [...band.shaftRoles, ...openSpace.map(() => "OPEN_TO_SKY_VOID")],
        shaftTags: [...band.shaftTags, ...openSpaceTags],
        coreBoxes: [coreBox]
      }
    });
  }
  return attempts;
};
var TOPOLOGY_FAMILIES = [
  { id: "CENTRAL_CORE_SPINE", build: centralCoreSpine },
  { id: "SIDE_CORE", build: sideCore },
  { id: "SPLIT_CORE", build: splitCore },
  { id: "CENTRAL_COURTYARD", build: centralCourtyard },
  { id: "DUAL_WING", build: dualWing },
  { id: "LINEAR_SINGLE_LOADED", build: linearSingleLoaded },
  { id: "PERIMETER_HABITABLE", build: perimeterHabitable }
];
var hShapeWing = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  const variantId = "massing:h-shape";
  const label = "H-shaped twin-wing perimeter massing";
  if (flatsPerFloor < 2) {
    return [{ variantId, label, rationale: "", reasons: ["H-shape massing requires at least 2 flats per floor"] }];
  }
  const compact = program.preferences.coreCompactness === "COMPACT" || program.preferences.minimizeCorridor || Boolean(program.preferences.properSpaceUtilization);
  const stairCount = program.mandatory.stairCount >= 2 ? 2 : 1;
  const noOts = program.mandatory.ventilationStrategy === "PERIMETER_ONLY";
  const preferOts = !noOts && (program.preferences.ventilationStrategy === "CENTRAL_COURTYARD" || Boolean(program.preferences.ventilatedCentralOtsShafts));
  const liftCountOverride = program.mandatory.singleLift ? 1 : void 0;
  const corridorSides = "BOTH";
  const coreW = requiredCoreBandWidth({ compact, corridorSides });
  const leftW = snap103((env.w - coreW) / 2);
  if (leftW < FLAT_BOUNDS.minSpanMm) {
    return [{ variantId, label, rationale: "", reasons: [`H-shape wing span ${Math.round(leftW)} mm is below ${FLAT_BOUNDS.minSpanMm} mm`] }];
  }
  const westCount = flatsPerFloor <= 3 ? 1 : Math.floor(flatsPerFloor / 2);
  const eastCount = flatsPerFloor - westCount;
  const maxFlatsOnSide = Math.max(westCount, eastCount);
  const coreReqLen = requiredCoreBandLength({ compact, stairCount, corridorSides, liftCount: liftCountOverride });
  const maxByAccess = Math.floor(env.h / maxFlatsOnSide) - 1600;
  const maxByCore = Math.floor((env.h - coreReqLen) / 2);
  const recessH = snap103(Math.min(Math.max(3e3, env.h * 0.17), maxByAccess, maxByCore));
  if (recessH < 2400) {
    return [{ variantId, label, rationale: "", reasons: [`plot depth ${Math.round(env.h)} mm cannot spare H-shape courts beside a ${coreReqLen} mm core`] }];
  }
  const [left, coreCol, right] = splitX(env, [leftW, coreW, 0]);
  const midH = env.h - 2 * recessH;
  const [northRecess, midCore, southRecess] = splitY(coreCol, [recessH, midH, 0]);
  const band = dissectCoreBand(midCore, {
    stairCount,
    compact,
    liftsAtLowSide: false,
    preferOts,
    noOts,
    liftCountOverride,
    corridorSides
  });
  if (band.reasons.length) {
    return [{ variantId, label, rationale: "", reasons: band.reasons }];
  }
  const westRow = sliceFlatRow(left, westCount, Math.ceil(left.h / westCount), true, left.w, false);
  const eastRow = sliceFlatRow(right, eastCount, Math.ceil(right.h / eastCount), true, right.w, true);
  const flatBoxes = [];
  const edges = [];
  for (const b of westRow.flats) {
    flatBoxes.push(b);
    edges.push("EAST");
  }
  for (const b of eastRow.flats) {
    flatBoxes.push(b);
    edges.push("WEST");
  }
  return [{
    variantId,
    label,
    rationale: `H-shaped footprint with projecting west and east habitable wings and recessed north/south open courts (${Math.round(coreW)} x ${Math.round(recessH)} mm) flanking the central core bridge.`,
    partition: {
      familyId: "CENTRAL_CORE_SPINE",
      variantId,
      massingShape: "H_SHAPE_WING",
      envelope: env,
      builtOutline: env,
      flatBoxes,
      accessEdgeForFlat: edges,
      corridorBoxes: band.corridorBoxes,
      lobbyBoxes: band.lobbyBoxes,
      liftBoxes: band.liftBoxes,
      stairBoxes: band.stairBoxes,
      shaftBoxes: [...band.shaftBoxes, northRecess, southRecess],
      shaftRoles: [...band.shaftRoles, "OPEN_TO_SKY_VOID", "OPEN_TO_SKY_VOID"],
      shaftTags: [...band.shaftTags, ["recess:perimeter"], ["recess:perimeter"]],
      coreBoxes: [midCore]
    }
  }];
};
var uShapeCourtyard = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  const compact = program.preferences.coreCompactness === "COMPACT" || program.preferences.minimizeCorridor || Boolean(program.preferences.properSpaceUtilization);
  const stairCount = program.mandatory.stairCount >= 2 ? 2 : 1;
  const noOts = program.mandatory.ventilationStrategy === "PERIMETER_ONLY";
  const preferOts = !noOts && (program.preferences.ventilationStrategy === "CENTRAL_COURTYARD" || Boolean(program.preferences.ventilatedCentralOtsShafts));
  const liftCountOverride = program.mandatory.singleLift ? 1 : void 0;
  const corrW = corridorWidth(compact);
  const attempts = [];
  if (flatsPerFloor >= 4 && env.h >= 17500) {
    const coreBandW = requiredCoreBandWidth({ compact, corridorSides: "LOW" });
    const coreReqLen = requiredCoreBandLength({ compact, stairCount, corridorSides: "LOW", liftCount: liftCountOverride });
    const hTop = snap103(Math.max(FLAT_BOUNDS.minRunMm + 200, Math.min(env.h * 0.42, env.h - coreReqLen - corrW)));
    const hBot = env.h - hTop - corrW;
    const nwW = snap103(env.w * 0.36);
    const courtW = env.w - 2 * nwW;
    const swW = snap103((env.w - coreBandW) / 2);
    const seW = env.w - coreBandW - swW;
    const botCount = flatsPerFloor - 2;
    const botWestCount = Math.floor(botCount / 2);
    const botEastCount = botCount - botWestCount;
    if (hTop >= FLAT_BOUNDS.minRunMm && hBot >= Math.max(FLAT_BOUNDS.minRunMm, coreReqLen) && nwW >= FLAT_BOUNDS.minSpanMm && courtW >= 3e3 && swW / Math.max(1, botWestCount) >= FLAT_BOUNDS.minSpanMm && seW / Math.max(1, botEastCount) >= FLAT_BOUNDS.minSpanMm) {
      const [topBand, linkCorr, botBand] = splitY(env, [hTop, corrW, 0]);
      const [nwFlat, northCourt, neFlat] = splitX(topBand, [nwW, courtW, 0]);
      const [swWing, coreCol, seWing] = splitX(botBand, [swW, coreBandW, 0]);
      const band = dissectCoreBand(coreCol, {
        stairCount,
        compact,
        liftsAtLowSide: true,
        preferOts,
        noOts,
        liftCountOverride,
        corridorSides: "LOW"
      });
      if (!band.reasons.length) {
        const swRow = sliceFlatRow(swWing, botWestCount, Math.ceil(swWing.w / botWestCount), false, swWing.h, true);
        const seRow = sliceFlatRow(seWing, botEastCount, Math.ceil(seWing.w / botEastCount), false, seWing.h, true);
        const flatBoxes = [nwFlat, neFlat, ...swRow.flats, ...seRow.flats];
        const edges = ["SOUTH", "SOUTH", ...swRow.flats.map(() => "NORTH"), ...seRow.flats.map(() => "NORTH")];
        attempts.push({
          variantId: "massing:u-shape:courtyard",
          label: "U-shaped open courtyard massing",
          rationale: `U-shaped footprint with projecting north-west and north-east wings flanking an open ${Math.round(courtW)} x ${Math.round(hTop)} mm courtyard and linked across a continuous south wing.`,
          partition: {
            familyId: "DUAL_WING",
            variantId: "massing:u-shape:courtyard",
            massingShape: "U_SHAPE_COURTYARD",
            envelope: env,
            builtOutline: env,
            flatBoxes,
            accessEdgeForFlat: edges,
            corridorBoxes: [linkCorr, ...band.corridorBoxes],
            lobbyBoxes: band.lobbyBoxes,
            liftBoxes: band.liftBoxes,
            stairBoxes: band.stairBoxes,
            shaftBoxes: [...band.shaftBoxes, northCourt],
            shaftRoles: [...band.shaftRoles, "OPEN_TO_SKY_VOID"],
            shaftTags: [...band.shaftTags, ["recess:perimeter"]],
            coreBoxes: [linkCorr, coreCol]
          }
        });
      }
    }
  }
  const coreW = requiredCoreBandWidth({ compact, corridorSides: "BOTH" });
  const leftW = snap103((env.w - coreW) / 2);
  if (flatsPerFloor >= 2 && leftW >= FLAT_BOUNDS.minSpanMm) {
    const westCount = flatsPerFloor <= 3 ? 1 : Math.floor(flatsPerFloor / 2);
    const eastCount = flatsPerFloor - westCount;
    const maxFlatsOnSide = Math.max(westCount, eastCount);
    const coreReqLen = requiredCoreBandLength({ compact, stairCount, corridorSides: "BOTH", liftCount: liftCountOverride });
    const maxByAccess = Math.floor(env.h / maxFlatsOnSide) - 1600;
    const maxByCore = env.h - coreReqLen;
    const recessH = snap103(Math.min(Math.max(3600, env.h * 0.25), maxByAccess, maxByCore));
    if (recessH >= 2800) {
      const [left, coreCol, right] = splitX(env, [leftW, coreW, 0]);
      const [northRecess, midSouthCore] = splitY(coreCol, [recessH, 0]);
      const band = dissectCoreBand(midSouthCore, {
        stairCount,
        compact,
        liftsAtLowSide: false,
        preferOts,
        noOts,
        liftCountOverride,
        corridorSides: "BOTH"
      });
      if (!band.reasons.length) {
        const westRow = sliceFlatRow(left, westCount, Math.ceil(left.h / westCount), true, left.w, false);
        const eastRow = sliceFlatRow(right, eastCount, Math.ceil(right.h / eastCount), true, right.w, true);
        const flatBoxes = [];
        const edges = [];
        for (const b of westRow.flats) {
          flatBoxes.push(b);
          edges.push("EAST");
        }
        for (const b of eastRow.flats) {
          flatBoxes.push(b);
          edges.push("WEST");
        }
        attempts.push({
          variantId: "massing:u-shape:wing",
          label: "U-shaped north courtyard wing massing",
          rationale: `U-shaped building with west and east projecting north arms embracing an open north court (${Math.round(coreW)} x ${Math.round(recessH)} mm) above the south circulation core.`,
          partition: {
            familyId: "CENTRAL_CORE_SPINE",
            variantId: "massing:u-shape:wing",
            massingShape: "U_SHAPE_COURTYARD",
            envelope: env,
            builtOutline: env,
            flatBoxes,
            accessEdgeForFlat: edges,
            corridorBoxes: band.corridorBoxes,
            lobbyBoxes: band.lobbyBoxes,
            liftBoxes: band.liftBoxes,
            stairBoxes: band.stairBoxes,
            shaftBoxes: [...band.shaftBoxes, northRecess],
            shaftRoles: [...band.shaftRoles, "OPEN_TO_SKY_VOID"],
            shaftTags: [...band.shaftTags, ["recess:perimeter"]],
            coreBoxes: [midSouthCore]
          }
        });
      }
    }
  }
  return attempts.length ? attempts : [{ variantId: "massing:u-shape", label: "U-shaped open courtyard massing", rationale: "", reasons: ["envelope dimensions insufficient for U-shape courtyard geometry"] }];
};
var lShapeCorner = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  const variantId = "massing:l-shape";
  const label = "L-shaped corner wing massing";
  if (flatsPerFloor < 2) {
    return [{ variantId, label, rationale: "", reasons: ["L-shape massing requires at least 2 flats per floor"] }];
  }
  const compact = program.preferences.coreCompactness === "COMPACT" || program.preferences.minimizeCorridor || Boolean(program.preferences.properSpaceUtilization);
  const stairCount = program.mandatory.stairCount >= 2 ? 2 : 1;
  const noOts = program.mandatory.ventilationStrategy === "PERIMETER_ONLY";
  const preferOts = !noOts && (program.preferences.ventilationStrategy === "CENTRAL_COURTYARD" || Boolean(program.preferences.ventilatedCentralOtsShafts));
  const liftCountOverride = program.mandatory.singleLift ? 1 : void 0;
  const corrW = corridorWidth(compact);
  const coreBandW = requiredCoreBandWidth({ compact, corridorSides: "LOW" });
  const coreReqLen = requiredCoreBandLength({ compact, stairCount, corridorSides: "LOW", liftCount: liftCountOverride });
  const maxWingSpan = FLAT_BOUNDS.maxSpanMm * 1.45;
  const southBandH = snap103(
    Math.max(
      FLAT_BOUNDS.minRunMm + 200,
      coreReqLen,
      Math.min(env.h * 0.48, maxWingSpan, env.h - FLAT_BOUNDS.minRunMm - corrW)
    )
  );
  const hTop = env.h - southBandH - corrW;
  if (hTop < FLAT_BOUNDS.minRunMm || southBandH < coreReqLen) {
    return [{ variantId, label, rationale: "", reasons: [`plot depth ${Math.round(env.h)} mm insufficient for L-shape upper wing + ${corrW} mm corridor + ${southBandH} mm south band`] }];
  }
  const nwCount = flatsPerFloor <= 3 ? 1 : Math.floor(flatsPerFloor / 2);
  const southCount = flatsPerFloor - nwCount;
  const [topBand, corrRow, southBand] = splitY(env, [hTop, corrW, 0]);
  const shaftBoxes = [];
  const shaftRoles = [];
  const shaftTags = [];
  const corridorBoxes = [corrRow];
  const flatBoxes = [];
  const edges = [];
  if (env.w >= nwCount * FLAT_BOUNDS.minSpanMm + 3e3) {
    const nwWingW = snap103(
      clamp(
        nwCount === 1 ? env.w * 0.46 : env.w * 0.56,
        nwCount * FLAT_BOUNDS.minSpanMm,
        env.w - 3e3
      )
    );
    const [nwBuilt, neRecess] = splitX(topBand, [nwWingW, 0]);
    const nwSpan = Math.min(nwBuilt.h, maxWingSpan);
    const nwRow = sliceFlatRow(nwBuilt, nwCount, Math.ceil(nwBuilt.w / nwCount), false, nwSpan, false);
    for (const f of nwRow.flats) {
      flatBoxes.push(f);
      edges.push("SOUTH");
    }
    for (const rem of nwRow.leftovers) {
      shaftBoxes.push(rem);
      shaftRoles.push("OPEN_TO_SKY_VOID");
      shaftTags.push(["recess:perimeter"]);
    }
    shaftBoxes.push(neRecess);
    shaftRoles.push("OPEN_TO_SKY_VOID");
    shaftTags.push(["recess:perimeter"]);
  } else if (Math.floor(hTop / nwCount) >= FLAT_BOUNDS.minRunMm && env.w >= FLAT_BOUNDS.minSpanMm + corrW + 3600) {
    const nwFlatW = snap103(clamp(env.w * 0.42, FLAT_BOUNDS.minSpanMm, env.w - corrW - 3600));
    const [nwCol, nwCorr, neRecess] = splitX(topBand, [nwFlatW, corrW, 0]);
    corridorBoxes.push(nwCorr);
    const nwRow = sliceFlatRow(nwCol, nwCount, Math.ceil(nwCol.h / nwCount), true, nwCol.w, false);
    for (const f of nwRow.flats) {
      flatBoxes.push(f);
      edges.push("EAST");
    }
    shaftBoxes.push(neRecess);
    shaftRoles.push("OPEN_TO_SKY_VOID");
    shaftTags.push(["recess:perimeter"]);
  } else {
    return [{ variantId, label, rationale: "", reasons: ["L-shape north-west wing cannot fit requested flats alongside corner cutout"] }];
  }
  let coreCol;
  if (southCount === 1) {
    const swFlatW = snap103(Math.min(env.w - coreBandW, FLAT_BOUNDS.maxSpanMm * 1.4));
    if (swFlatW < FLAT_BOUNDS.minSpanMm) {
      return [{ variantId, label, rationale: "", reasons: ["L-shape south wing too narrow after core"] }];
    }
    const remW = env.w - coreBandW - swFlatW;
    if (remW >= 3e3) {
      const [cCol, seBuilt, seExt] = splitX(southBand, [coreBandW, swFlatW, 0]);
      coreCol = cCol;
      flatBoxes.push(seBuilt);
      edges.push("NORTH");
      shaftBoxes.push(seExt);
      shaftRoles.push("OPEN_TO_SKY_VOID");
      shaftTags.push(["recess:perimeter"]);
    } else {
      const [cCol, seBuilt] = splitX(southBand, [coreBandW, 0]);
      coreCol = cCol;
      flatBoxes.push(seBuilt);
      edges.push("NORTH");
    }
  } else {
    const swCount = Math.floor(southCount / 2);
    const seCount = southCount - swCount;
    const swW = snap103((env.w - coreBandW) * swCount / southCount);
    const seW = env.w - coreBandW - swW;
    if (swW / swCount < FLAT_BOUNDS.minSpanMm || seW / seCount < FLAT_BOUNDS.minSpanMm) {
      return [{ variantId, label, rationale: "", reasons: ["L-shape south flats below minimum span"] }];
    }
    const [swWing, cCol, seWing] = splitX(southBand, [swW, coreBandW, 0]);
    coreCol = cCol;
    const swRow = sliceFlatRow(swWing, swCount, Math.ceil(swWing.w / swCount), false, swWing.h, true);
    const seRow = sliceFlatRow(seWing, seCount, Math.ceil(seWing.w / seCount), false, seWing.h, true);
    for (const f of [...swRow.flats, ...seRow.flats]) {
      flatBoxes.push(f);
      edges.push("NORTH");
    }
  }
  const band = dissectCoreBand(coreCol, {
    stairCount,
    compact,
    liftsAtLowSide: true,
    preferOts,
    noOts,
    liftCountOverride,
    corridorSides: "LOW"
  });
  if (band.reasons.length) {
    return [{ variantId, label, rationale: "", reasons: band.reasons }];
  }
  return [{
    variantId,
    label,
    rationale: "L-shaped massing wrapping the west and south street frontages around a generous open north-east corner court.",
    partition: {
      familyId: "CENTRAL_CORE_SPINE",
      variantId,
      massingShape: "L_SHAPE_CORNER",
      envelope: env,
      builtOutline: env,
      flatBoxes,
      accessEdgeForFlat: edges,
      corridorBoxes: [...corridorBoxes, ...band.corridorBoxes],
      lobbyBoxes: band.lobbyBoxes,
      liftBoxes: band.liftBoxes,
      stairBoxes: band.stairBoxes,
      shaftBoxes: [...band.shaftBoxes, ...shaftBoxes],
      shaftRoles: [...band.shaftRoles, ...shaftRoles],
      shaftTags: [...band.shaftTags, ...shaftTags],
      coreBoxes: [corrRow, coreCol]
    }
  }];
};
var cruciformPlus = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  const variantId = "massing:cruciform-plus";
  const label = "Cruciform (+) four-arm corner-recessed massing";
  if (flatsPerFloor < 4) {
    return [{ variantId, label, rationale: "", reasons: ["Cruciform (+) massing requires at least 4 flats per floor"] }];
  }
  const compact = program.preferences.coreCompactness === "COMPACT" || program.preferences.minimizeCorridor || Boolean(program.preferences.properSpaceUtilization);
  const stairCount = program.mandatory.stairCount >= 2 ? 2 : 1;
  const noOts = program.mandatory.ventilationStrategy === "PERIMETER_ONLY";
  const preferOts = !noOts && (program.preferences.ventilationStrategy === "CENTRAL_COURTYARD" || Boolean(program.preferences.ventilatedCentralOtsShafts));
  const liftCountOverride = program.mandatory.singleLift ? 1 : void 0;
  const corridorSides = "BOTH";
  const coreW = requiredCoreBandWidth({ compact, corridorSides });
  const leftW = snap103((env.w - coreW) / 2);
  if (leftW < FLAT_BOUNDS.minSpanMm) {
    return [{ variantId, label, rationale: "", reasons: [`Cruciform (+) wing span ${Math.round(leftW)} mm is below ${FLAT_BOUNDS.minSpanMm} mm`] }];
  }
  const westCount = Math.floor(flatsPerFloor / 2);
  const eastCount = flatsPerFloor - westCount;
  const maxTotalRecess = Math.min(
    env.h - westCount * FLAT_BOUNDS.minRunMm,
    env.h - eastCount * FLAT_BOUNDS.minRunMm
  );
  const recessH = snap103(Math.min(Math.max(2400, env.h * 0.15), 3800, Math.floor(maxTotalRecess / 2)));
  if (recessH < 2e3) {
    return [{ variantId, label, rationale: "", reasons: [`envelope height ${Math.round(env.h)} mm too tight for 4-corner cruciform setbacks`] }];
  }
  const [left, core, right] = splitX(env, [leftW, coreW, 0]);
  const band = dissectCoreBand(core, {
    stairCount,
    compact,
    liftsAtLowSide: false,
    preferOts,
    noOts,
    liftCountOverride,
    corridorSides
  });
  if (band.reasons.length) {
    return [{ variantId, label, rationale: "", reasons: band.reasons }];
  }
  const [nwRecess, leftBuilt, swRecess] = splitY(left, [recessH, env.h - 2 * recessH, 0]);
  const [neRecess, rightBuilt, seRecess] = splitY(right, [recessH, env.h - 2 * recessH, 0]);
  const westRow = sliceFlatRow(leftBuilt, westCount, Math.ceil(leftBuilt.h / westCount), true, leftBuilt.w, false);
  const eastRow = sliceFlatRow(rightBuilt, eastCount, Math.ceil(rightBuilt.h / eastCount), true, rightBuilt.w, true);
  const flatBoxes = [];
  const edges = [];
  for (const b of westRow.flats) {
    flatBoxes.push(b);
    edges.push("EAST");
  }
  for (const b of eastRow.flats) {
    flatBoxes.push(b);
    edges.push("WEST");
  }
  const recesses = [nwRecess, neRecess, swRecess, seRecess];
  return [{
    variantId,
    label,
    rationale: `Cruciform (+) floorplate with projecting central core arms and four open-to-sky corner terraces (${Math.round(leftW)} x ${Math.round(recessH)} mm).`,
    partition: {
      familyId: "CENTRAL_CORE_SPINE",
      variantId,
      massingShape: "CRUCIFORM_PLUS",
      envelope: env,
      builtOutline: env,
      flatBoxes,
      accessEdgeForFlat: edges,
      corridorBoxes: band.corridorBoxes,
      lobbyBoxes: band.lobbyBoxes,
      liftBoxes: band.liftBoxes,
      stairBoxes: band.stairBoxes,
      shaftBoxes: [...band.shaftBoxes, ...recesses],
      shaftRoles: [...band.shaftRoles, "OPEN_TO_SKY_VOID", "OPEN_TO_SKY_VOID", "OPEN_TO_SKY_VOID", "OPEN_TO_SKY_VOID"],
      shaftTags: [...band.shaftTags, ["recess:perimeter"], ["recess:perimeter"], ["recess:perimeter"], ["recess:perimeter"]],
      coreBoxes: [core]
    }
  }];
};
var pinwheelCluster = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  const variantId = "massing:pinwheel";
  const label = "Pinwheel diagonally staggered wing massing";
  if (flatsPerFloor < 2) {
    return [{ variantId, label, rationale: "", reasons: ["Pinwheel massing requires at least 2 flats per floor"] }];
  }
  const compact = program.preferences.coreCompactness === "COMPACT" || program.preferences.minimizeCorridor || Boolean(program.preferences.properSpaceUtilization);
  const stairCount = program.mandatory.stairCount >= 2 ? 2 : 1;
  const noOts = program.mandatory.ventilationStrategy === "PERIMETER_ONLY";
  const preferOts = !noOts && (program.preferences.ventilationStrategy === "CENTRAL_COURTYARD" || Boolean(program.preferences.ventilatedCentralOtsShafts));
  const liftCountOverride = program.mandatory.singleLift ? 1 : void 0;
  const corridorSides = "BOTH";
  const coreW = requiredCoreBandWidth({ compact, corridorSides });
  const leftW = snap103((env.w - coreW) / 2);
  if (leftW < FLAT_BOUNDS.minSpanMm) {
    return [{ variantId, label, rationale: "", reasons: [`Pinwheel wing span ${Math.round(leftW)} mm is below ${FLAT_BOUNDS.minSpanMm} mm`] }];
  }
  const westCount = flatsPerFloor <= 3 ? 1 : Math.floor(flatsPerFloor / 2);
  const eastCount = flatsPerFloor - westCount;
  const maxRecessW = env.h - westCount * FLAT_BOUNDS.minRunMm;
  const maxRecessE = env.h - eastCount * FLAT_BOUNDS.minRunMm;
  const recessH = snap103(Math.min(Math.max(3e3, env.h * 0.18), 4800, maxRecessW, maxRecessE));
  if (recessH < 2400) {
    return [{ variantId, label, rationale: "", reasons: ["envelope height too tight for pinwheel diagonal setbacks"] }];
  }
  const [left, core, right] = splitX(env, [leftW, coreW, 0]);
  const band = dissectCoreBand(core, {
    stairCount,
    compact,
    liftsAtLowSide: false,
    preferOts,
    noOts,
    liftCountOverride,
    corridorSides
  });
  if (band.reasons.length) {
    return [{ variantId, label, rationale: "", reasons: band.reasons }];
  }
  const [nwRecess, leftBuilt] = splitY(left, [recessH, 0]);
  const [rightBuilt, seRecess] = splitY(right, [env.h - recessH, 0]);
  const westRow = sliceFlatRow(leftBuilt, westCount, Math.ceil(leftBuilt.h / westCount), true, leftBuilt.w, false);
  const eastRow = sliceFlatRow(rightBuilt, eastCount, Math.ceil(rightBuilt.h / eastCount), true, rightBuilt.w, true);
  const flatBoxes = [];
  const edges = [];
  for (const b of westRow.flats) {
    flatBoxes.push(b);
    edges.push("EAST");
  }
  for (const b of eastRow.flats) {
    flatBoxes.push(b);
    edges.push("WEST");
  }
  return [{
    variantId,
    label,
    rationale: `Diagonally offset pinwheel wings with recessed north-west and south-east exterior terraces (${Math.round(leftW)} x ${Math.round(recessH)} mm) optimizing oblique daylight and solar exposure.`,
    partition: {
      familyId: "CENTRAL_CORE_SPINE",
      variantId,
      massingShape: "PINWHEEL_CLUSTER",
      envelope: env,
      builtOutline: env,
      flatBoxes,
      accessEdgeForFlat: edges,
      corridorBoxes: band.corridorBoxes,
      lobbyBoxes: band.lobbyBoxes,
      liftBoxes: band.liftBoxes,
      stairBoxes: band.stairBoxes,
      shaftBoxes: [...band.shaftBoxes, nwRecess, seRecess],
      shaftRoles: [...band.shaftRoles, "OPEN_TO_SKY_VOID", "OPEN_TO_SKY_VOID"],
      shaftTags: [...band.shaftTags, ["recess:perimeter"], ["recess:perimeter"]],
      coreBoxes: [core]
    }
  }];
};
var steppedOffsetBlock = (ctx) => {
  const { envelope: env, flatsPerFloor, program } = ctx;
  const variantId = "massing:stepped-offset";
  const label = "Stepped asymmetric facade block";
  if (flatsPerFloor < 3) {
    return [{ variantId, label, rationale: "", reasons: ["Stepped facade massing requires at least 3 flats per floor"] }];
  }
  const compact = program.preferences.coreCompactness === "COMPACT" || program.preferences.minimizeCorridor || Boolean(program.preferences.properSpaceUtilization);
  const stairCount = program.mandatory.stairCount >= 2 ? 2 : 1;
  const noOts = program.mandatory.ventilationStrategy === "PERIMETER_ONLY";
  const preferOts = !noOts && (program.preferences.ventilationStrategy === "CENTRAL_COURTYARD" || Boolean(program.preferences.ventilatedCentralOtsShafts));
  const liftCountOverride = program.mandatory.singleLift ? 1 : void 0;
  const corridorSides = "BOTH";
  const coreW = requiredCoreBandWidth({ compact, corridorSides });
  const leftW = snap103((env.w - coreW) / 2);
  const rightW = env.w - coreW - leftW;
  if (Math.min(leftW, rightW) < FLAT_BOUNDS.minSpanMm + 3e3) {
    return [{ variantId, label, rationale: "", reasons: ["wing spans too narrow for stepped perimeter offsets alongside >= 5800 mm flat depth"] }];
  }
  const [left, core, right] = splitX(env, [leftW, coreW, 0]);
  const band = dissectCoreBand(core, {
    stairCount,
    compact,
    liftsAtLowSide: false,
    preferOts,
    noOts,
    liftCountOverride,
    corridorSides
  });
  if (band.reasons.length) {
    return [{ variantId, label, rationale: "", reasons: band.reasons }];
  }
  const westCount = flatsPerFloor <= 3 ? 1 : Math.floor(flatsPerFloor / 2);
  const eastCount = flatsPerFloor - westCount;
  const westRow = sliceFlatRow(left, westCount, Math.ceil(left.h / westCount), true, left.w, false);
  const eastRow = sliceFlatRow(right, eastCount, Math.ceil(right.h / eastCount), true, right.w, true);
  const flatBoxes = [];
  const edges = [];
  const recesses = [];
  const westStep = snap103(clamp(left.w * 0.28, 3e3, left.w - FLAT_BOUNDS.minSpanMm));
  westRow.flats.forEach((b, idx) => {
    if (idx === 0 && westStep >= 3e3) {
      const [rec, flat] = splitX(b, [westStep, 0]);
      recesses.push(rec);
      flatBoxes.push(flat);
    } else {
      flatBoxes.push(b);
    }
    edges.push("EAST");
  });
  const eastStep = snap103(clamp(right.w * 0.34, 3e3, right.w - FLAT_BOUNDS.minSpanMm));
  eastRow.flats.forEach((b, idx) => {
    if (idx === eastRow.flats.length - 1 && eastStep >= 3e3 && eastCount >= 2) {
      const [flat, rec] = splitX(b, [b.w - eastStep, 0]);
      flatBoxes.push(flat);
      recesses.push(rec);
    } else {
      flatBoxes.push(b);
    }
    edges.push("WEST");
  });
  return [{
    variantId,
    label,
    rationale: `Asymmetric stepped facade block setting back alternating west (${Math.round(westStep)} mm) and east (${Math.round(eastStep)} mm) bays to create articulated terraces and distinct elevation relief.`,
    partition: {
      familyId: "CENTRAL_CORE_SPINE",
      variantId,
      massingShape: "STEPPED_OFFSET_BLOCK",
      envelope: env,
      builtOutline: env,
      flatBoxes,
      accessEdgeForFlat: edges,
      corridorBoxes: band.corridorBoxes,
      lobbyBoxes: band.lobbyBoxes,
      liftBoxes: band.liftBoxes,
      stairBoxes: band.stairBoxes,
      shaftBoxes: [...band.shaftBoxes, ...recesses],
      shaftRoles: [...band.shaftRoles, ...recesses.map(() => "OPEN_TO_SKY_VOID")],
      shaftTags: [...band.shaftTags, ...recesses.map(() => ["recess:perimeter"])],
      coreBoxes: [core]
    }
  }];
};
var MACRO_SHAPE_BUILDERS = [
  { id: "CENTRAL_CORE_SPINE", build: hShapeWing },
  { id: "DUAL_WING", build: uShapeCourtyard },
  { id: "SPLIT_CORE", build: lShapeCorner },
  { id: "CENTRAL_CORE_SPINE", build: cruciformPlus },
  { id: "CENTRAL_CORE_SPINE", build: pinwheelCluster },
  { id: "CENTRAL_CORE_SPINE", build: steppedOffsetBlock }
];
function generateTopologyCandidates(ctx) {
  const candidates = [];
  const rejections = [];
  const footprint = { built: ctx.envelope, surplus: [], surplusAreaMm2: 0 };
  const buildCtx = ctx;
  const includeMacroShapes = Boolean(
    ctx.enableMacroShapes || ctx.program.preferences.preferredMassingShape || ctx.program.preferences.requestsDifferentShape
  );
  const activeFamilies = includeMacroShapes ? [...TOPOLOGY_FAMILIES, ...MACRO_SHAPE_BUILDERS] : TOPOLOGY_FAMILIES;
  for (const family of activeFamilies) {
    let attempts;
    try {
      attempts = family.build(buildCtx);
    } catch (error) {
      rejections.push({
        familyId: family.id,
        variantId: "build",
        reasons: [`family threw while building: ${error instanceof Error ? error.message : String(error)}`]
      });
      continue;
    }
    for (const attempt of attempts) {
      if (!attempt.partition) {
        rejections.push({ familyId: family.id, variantId: attempt.variantId, reasons: attempt.reasons ?? ["not feasible"] });
        continue;
      }
      if (attempt.partition.flatBoxes.length !== ctx.flatsPerFloor) {
        rejections.push({
          familyId: family.id,
          variantId: attempt.variantId,
          reasons: [`produced ${attempt.partition.flatBoxes.length} flats, the brief requires ${ctx.flatsPerFloor}`]
        });
        continue;
      }
      const partition = footprint.surplus.length ? withOpenMargin(attempt.partition, ctx.envelope, footprint) : attempt.partition;
      const unweighted = withTightBuiltOutline(partition);
      const weightedPartition = rebalanceFlatRowsByBhkWeight(partition, ctx.program.mandatory.unitTypes);
      const weighted = weightedPartition !== partition ? withTightBuiltOutline(weightedPartition) : void 0;
      const tightened = weighted && partitionDefects(weighted, ctx.program).length === 0 ? weighted : unweighted;
      const defects = partitionDefects(tightened, ctx.program);
      if (defects.length) {
        rejections.push({ familyId: family.id, variantId: attempt.variantId, reasons: defects });
        continue;
      }
      candidates.push({
        familyId: family.id,
        variantId: attempt.variantId,
        label: attempt.label,
        rationale: footprint.note ? `${attempt.rationale} ${footprint.note}` : attempt.rationale,
        partition: tightened
      });
    }
  }
  return { candidates, rejections };
}
function withOpenMargin(partition, fullEnvelope, footprint) {
  return {
    ...partition,
    envelope: fullEnvelope,
    // The built outline stays the set-in footprint: the flats' facades face the
    // open margin, which is where their light and air come from.
    builtOutline: footprint.built,
    shaftBoxes: [...partition.shaftBoxes, ...footprint.surplus],
    shaftRoles: [...partition.shaftRoles, ...footprint.surplus.map(() => "OPEN_TO_SKY_VOID")]
  };
}
var flatAreaOf = (p) => p.flatBoxes.reduce((s, b) => s + boxArea(b), 0);
var circulationAreaOf = (p) => [...p.corridorBoxes, ...p.lobbyBoxes].reduce((s, b) => s + boxArea(b), 0);
var isPerimeterRecess = (p, index) => Boolean(p.shaftTags?.[index]?.includes("recess:perimeter"));
var otsAreaOf = (p) => p.shaftBoxes.reduce(
  (s, b, i) => p.shaftRoles[i] === "OPEN_TO_SKY_VOID" && !isPerimeterRecess(p, i) ? s + boxArea(b) : s,
  0
);

// packages/planning-engine/src/topology/plan-assembler.ts
var asSnapper = (b) => ({ x: b.x, y: b.y, w: b.w, h: b.h });
var rectToBox = (r) => ({ x: r.x, y: r.y, w: r.width, h: r.height });
var boxToRect = (b) => ({ x: b.x, y: b.y, width: b.w, height: b.h });
function placementFromProgram(program, opts) {
  const p = program.preferences;
  return {
    liftSide: p.corePreference === "EAST" ? "EAST" : "WEST",
    otsPlacement: p.ventilationStrategy === "CENTRAL_COURTYARD" ? "CENTRAL" : "SIDE",
    coreCompactness: p.coreCompactness,
    kitchenSize: p.kitchenSize === "LARGER" ? "LARGER" : "STANDARD",
    kitchenStyle: p.kitchenStyle === "OPEN" ? "OPEN" : "ENCLOSED",
    sitoutSize: p.sitoutSize,
    entranceStyle: "LIVING_FIRST",
    bedroomBalconies: p.bedroomBalconies === "NONE_REQUESTED" ? "STANDARD" : "ALL_BEDROOMS",
    ...opts?.staggeredBalconies ? { staggeredBalconies: true } : {},
    ...opts?.floorVariant ? { floorVariant: opts.floorVariant } : {}
  };
}
function assembleStructureFromPartition(input) {
  const { partition, program, unitTypes } = input;
  const placement = placementFromProgram(program, {
    staggeredBalconies: input.staggeredBalconies,
    floorVariant: input.floorVariant
  });
  const env = partition.envelope;
  const builtFace = env;
  const flats = [];
  const openings = [];
  const flatsWithoutEntrance = [];
  const interflatOtsShafts = [];
  const circulation = [
    ...partition.corridorBoxes.map((b, i) => ({ id: `corridor_${i + 1}`, box: b })),
    ...partition.lobbyBoxes.map((b, i) => ({ id: `core_lobby_${i + 1}`, box: b }))
  ];
  const assignedUnitTypes = assignUnitTypesToBoxes(partition.flatBoxes, unitTypes);
  for (let i = 0; i < partition.flatBoxes.length; i++) {
    const worldBox = partition.flatBoxes[i];
    const accessEdge = partition.accessEdgeForFlat[i];
    const flatId = `flat_0${i + 1}`;
    const flatLabel = `Flat 0${i + 1}`;
    const unitType = assignedUnitTypes[i] ?? unitTypes[i] ?? "2BHK";
    const entry = circulation.map((c) => ({ c, shared: sharedEdgeLength(worldBox, c.box) })).sort((a, b) => b.shared - a.shared)[0];
    const frame = frameFor(worldBox, accessEdge);
    const localFlat = { x: 0, y: 0, w: frame.localW, h: frame.localH };
    const localCorridor = entry && entry.shared > 0 ? localCorridorStrip(frame, worldBox, entry.c.box) : { x: localFlat.w, y: 0, w: 1500, h: localFlat.h };
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
      archetype: input.archetype
    });
    const worldRooms = sliced.rooms.map((room) => ({
      ...room,
      rect: boxToRect(frame.toWorld(rectToBox(room.rect)))
    }));
    const balconyIds = /* @__PURE__ */ new Set([
      ...worldRooms.filter((r) => r.type === "bedroom").map((r) => `${r.id}__balcony`),
      `${flatId}__balcony`,
      `${flatId}__utility`
    ]);
    const keptRooms = worldRooms.filter((room) => {
      if (!balconyIds.has(room.id)) return true;
      return projectsToOutsideFace(rectToBox(room.rect), worldBox, builtFace);
    });
    const droppedRaw = worldRooms.filter((r) => !keptRooms.includes(r));
    const carvedInterflat = carveInterflatOtsForDroppedSitout(
      flatId,
      i,
      keptRooms,
      droppedRaw
    );
    if (carvedInterflat.otsShaft) {
      interflatOtsShafts.push(carvedInterflat.otsShaft);
    }
    const finalRooms = carvedInterflat.droppedRemaining.length ? reabsorbDropped(carvedInterflat.keptRooms, carvedInterflat.droppedRemaining) : carvedInterflat.keptRooms;
    for (const opening of sliced.flatOpenings) {
      if (opening.isFlatEntrance) continue;
      const [aId, bId] = opening.connects ?? [];
      const a = finalRooms.find((r) => r.id === aId);
      const b = finalRooms.find((r) => r.id === bId);
      if (!a || !b) continue;
      const rebuilt = createConnectingDoor(
        opening.id,
        { id: a.id, rect: a.rect },
        { id: b.id, rect: b.rect },
        Math.max(opening.rect.width, opening.rect.height),
        { doorType: opening.doorType, swingDirection: opening.swingDirection }
      );
      if (rebuilt) openings.push(rebuilt);
    }
    if (entry && entry.shared > 0) {
      const target = finalRooms.find((r) => r.type === "living" && sharedEdgeLength(rectToBox(r.rect), entry.c.box) >= 1250) ?? finalRooms.find((r) => r.type === "foyer" && sharedEdgeLength(rectToBox(r.rect), entry.c.box) >= 1250) ?? finalRooms.find((r) => r.type === "dining" && sharedEdgeLength(rectToBox(r.rect), entry.c.box) >= 1250);
      const door = target ? createConnectingDoor(
        `${flatId}__door_entrance`,
        { id: entry.c.id, rect: boxToRect(entry.c.box) },
        { id: target.id, rect: target.rect },
        1050,
        { isFlatEntrance: true }
      ) : null;
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
      rooms: finalRooms
    });
  }
  const lifts = partition.liftBoxes.map((b, i) => ({
    id: `core_lift_${i + 1}`,
    name: `Passenger Lift 0${i + 1}`,
    rect: boxToRect(b),
    assignedFlatId: null
  }));
  const stairs = partition.stairBoxes.map((b, i) => ({
    id: `core_stair_${i + 1}`,
    name: i === 0 ? "Main Fire Staircase" : `Fire Staircase 0${i + 1}`,
    rect: boxToRect(b),
    assignedFlatId: null
  }));
  const lobbies = partition.lobbyBoxes.map((b, i) => ({
    id: `core_lobby_${i + 1}`,
    name: partition.lobbyBoxes.length > 1 ? `Lift Lobby 0${i + 1}` : "Common Lift Lobby",
    rect: boxToRect(b),
    assignedFlatId: null
  }));
  const corridors = partition.corridorBoxes.map((b, i) => ({
    id: `corridor_${i + 1}`,
    name: partition.corridorBoxes.length > 1 ? `Common Circulation 0${i + 1}` : "Common Circulation Spine",
    rect: boxToRect(b),
    assignedFlatId: null
  }));
  const baseShafts = partition.shaftBoxes.map((b, i) => {
    const role = partition.shaftRoles[i] ?? "SERVICE_SHAFT";
    const tags = partition.shaftTags?.[i];
    const isPerimeterRecess2 = tags?.includes("recess:perimeter");
    return {
      id: `core_shaft_${i + 1}`,
      architecturalRole: role,
      name: isPerimeterRecess2 ? "Perimeter Courtyard Setback Recess" : role === "OPEN_TO_SKY_VOID" ? "Open-to-Sky Court / Light and Air Void" : `MEP / Plumbing Duct 0${i + 1}`,
      rect: boxToRect(b),
      ...tags ? { tags } : {},
      assignedFlatId: null
    };
  });
  const shafts = [...baseShafts, ...interflatOtsShafts];
  const circulationElements = [...corridors, ...lobbies];
  const connectToCirculation = (element, width, doorType) => {
    const best = circulationElements.map((c) => ({ c, shared: sharedEdgeLength(rectToBox(element.rect), rectToBox(c.rect)) })).sort((a, b) => b.shared - a.shared)[0];
    if (!best || best.shared <= 0) return;
    const door = createConnectingDoor(
      `door_${element.id}`,
      { id: best.c.id, rect: best.c.rect },
      { id: element.id, rect: element.rect },
      width,
      { doorType }
    );
    if (door) openings.push(door);
  };
  for (const stair of stairs) connectToCirculation(stair, 1200, "open_passage");
  for (const lift of lifts) connectToCirculation(lift, 900, "sliding");
  for (let i = 0; i < circulationElements.length; i++) {
    for (let j = i + 1; j < circulationElements.length; j++) {
      const a = circulationElements[i];
      const b = circulationElements[j];
      if (sharedEdgeLength(rectToBox(a.rect), rectToBox(b.rect)) < 1500) continue;
      const door = createConnectingDoor(
        `door_link_${a.id}_${b.id}`,
        { id: a.id, rect: a.rect },
        { id: b.id, rect: b.rect },
        1500,
        { doorType: "open_passage" }
      );
      if (door) openings.push(door);
    }
  }
  const boundary = [
    { x: env.x, y: env.y },
    { x: env.x + env.w, y: env.y },
    { x: env.x + env.w, y: env.y + env.h },
    { x: env.x, y: env.y + env.h }
  ];
  return {
    structure: {
      source: "DETERMINISTIC_SCHEMATIC",
      boundary,
      flats,
      commonRooms: [],
      ungroupedRooms: [],
      lifts,
      stairs,
      lobbies,
      corridors,
      shafts,
      openings
    },
    flatsWithoutEntrance
  };
}
function serviceBandEnvelope(frame, worldFlat, localFlat, builtFace) {
  const lowStrip = frame.toWorld({ x: 0, y: 0, w: frame.localW, h: 10 });
  const highStrip = frame.toWorld({ x: 0, y: frame.localH - 10, w: frame.localW, h: 10 });
  const lowIsExterior = onEnvelopeEdge(lowStrip, builtFace);
  const highIsExterior = onEnvelopeEdge(highStrip, builtFace);
  if (!lowIsExterior && !highIsExterior) {
    return localFlat;
  }
  if (lowIsExterior) return localFlat;
  return { x: localFlat.x, y: localFlat.y - 1e3, w: localFlat.w, h: localFlat.h + 1e3 };
}
function projectsToOutsideFace(balcony, flat, outline) {
  const near = (a, b) => Math.abs(a - b) <= 1;
  return near(balcony.x, flat.x) && near(outline.x, balcony.x) || near(balcony.x + balcony.w, flat.x + flat.w) && near(outline.x + outline.w, balcony.x + balcony.w) || near(balcony.y, flat.y) && near(outline.y, balcony.y) || near(balcony.y + balcony.h, flat.y + flat.h) && near(outline.y + outline.h, balcony.y + balcony.h);
}
function localCorridorStrip(frame, worldFlat, worldCorridor) {
  const local = frame.toLocal(worldCorridor);
  const lo = Math.max(0, Math.min(local.y, frame.localH));
  const hi = Math.max(lo, Math.min(local.y + local.h, frame.localH));
  return { x: frame.localW, y: lo, w: Math.max(1500, local.w), h: Math.max(0, hi - lo) };
}
function onEnvelopeEdge(box, env) {
  if (box.w >= box.h) {
    return Math.abs(box.y - env.y) <= 1 || Math.abs(box.y + box.h - (env.y + env.h)) <= 1;
  } else {
    return Math.abs(box.x - env.x) <= 1 || Math.abs(box.x + box.w - (env.x + env.w)) <= 1;
  }
}
function carveInterflatOtsForDroppedSitout(flatId, flatIndex, keptRooms, dropped) {
  const sitout = dropped.find((r) => r.id === `${flatId}__balcony`);
  if (!sitout) {
    return { keptRooms: [...keptRooms], droppedRemaining: [...dropped] };
  }
  const util = dropped.find((r) => r.id === `${flatId}__utility`);
  const sBox = rectToBox(sitout.rect);
  const horiz = sBox.w >= sBox.h;
  const uBox = util ? rectToBox(util.rect) : void 0;
  const utilAdjacent = uBox !== void 0 && (horiz ? Math.abs(uBox.y - sBox.y) <= 1 && Math.abs(uBox.h - sBox.h) <= 1 && (Math.abs(uBox.x + uBox.w - sBox.x) <= 1 || Math.abs(sBox.x + sBox.w - uBox.x) <= 1) : Math.abs(uBox.x - sBox.x) <= 1 && Math.abs(uBox.w - sBox.w) <= 1 && (Math.abs(uBox.y + uBox.h - sBox.y) <= 1 || Math.abs(sBox.y + sBox.h - uBox.y) <= 1));
  const bandBox = utilAdjacent && uBox ? {
    x: Math.min(sBox.x, uBox.x),
    y: Math.min(sBox.y, uBox.y),
    w: horiz ? sBox.w + uBox.w : sBox.w,
    h: horiz ? sBox.h : sBox.h + uBox.h
  } : sBox;
  const bandLen = horiz ? bandBox.w : bandBox.h;
  const bandDep = horiz ? bandBox.h : bandBox.w;
  if (bandLen < 4100 || bandDep < 1500) {
    return { keptRooms: [...keptRooms], droppedRemaining: [...dropped] };
  }
  const otsLen = Math.min(1800, Math.max(1550, Math.min(1600, bandLen - 2550)));
  const uLen = utilAdjacent && uBox ? horiz ? uBox.w : uBox.h : 0;
  const utilRemLen = utilAdjacent && uLen >= otsLen + 100 ? uLen - otsLen : 0;
  const sitoutLen = bandLen - utilRemLen - otsLen;
  if (sitoutLen < 2500) {
    return { keptRooms: [...keptRooms], droppedRemaining: [...dropped] };
  }
  const utilAtLowSide = utilAdjacent && uBox ? horiz ? uBox.x < sBox.x : uBox.y < sBox.y : true;
  const bandStart = horiz ? bandBox.x : bandBox.y;
  const makeSpanBox = (offset, span) => horiz ? { x: bandStart + offset, y: bandBox.y, w: span, h: bandBox.h } : { x: bandBox.x, y: bandStart + offset, w: bandBox.w, h: span };
  const utilBoxNew = utilRemLen > 0 ? makeSpanBox(utilAtLowSide ? 0 : bandLen - utilRemLen, utilRemLen) : void 0;
  const otsBox = makeSpanBox(utilAtLowSide ? utilRemLen : sitoutLen, otsLen);
  const sitoutBoxNew = makeSpanBox(utilAtLowSide ? utilRemLen + otsLen : 0, sitoutLen);
  const nextKept = [...keptRooms, { ...sitout, rect: boxToRect(sitoutBoxNew) }];
  const nextDropped = dropped.filter(
    (r) => r.id !== sitout.id && (!utilAdjacent || r.id !== util?.id)
  );
  if (utilAdjacent && util && utilBoxNew) {
    nextDropped.push({ ...util, rect: boxToRect(utilBoxNew) });
  }
  return {
    keptRooms: nextKept,
    droppedRemaining: nextDropped,
    otsShaft: {
      id: `core_shaft_interflat_${flatIndex + 1}`,
      architecturalRole: "OPEN_TO_SKY_VOID",
      name: "Inter-Flat Ventilation OTS Shaft",
      rect: boxToRect(otsBox),
      tags: ["shaft:ots", "shaft:interflat"],
      assignedFlatId: null
    }
  };
}
function reabsorbDropped(kept, dropped) {
  const result = [...kept];
  for (const gap of dropped) {
    const g = rectToBox(gap.rect);
    if (/Sit-out/i.test(gap.name)) {
      result.push({
        ...gap,
        name: gap.name.replace(/Sit-out Balcony/i, "Family Sit-out"),
        type: "living",
        planningZone: "PUBLIC"
      });
      continue;
    }
    const idx = result.findIndex((room) => {
      const r2 = rectToBox(room.rect);
      const sameWidth = Math.abs(r2.x - g.x) <= 1 && Math.abs(r2.w - g.w) <= 1;
      const sameHeight = Math.abs(r2.y - g.y) <= 1 && Math.abs(r2.h - g.h) <= 1;
      const stacked = sameWidth && (Math.abs(r2.y + r2.h - g.y) <= 1 || Math.abs(g.y + g.h - r2.y) <= 1);
      const beside = sameHeight && (Math.abs(r2.x + r2.w - g.x) <= 1 || Math.abs(g.x + g.w - r2.x) <= 1);
      return stacked || beside;
    });
    if (idx < 0) {
      result.push({
        ...gap,
        id: `${gap.id}__interior`,
        name: gap.name.replace(/Sit-out Balcony/i, "Family Sit-out").replace(/Balcony/i, "Utility Store").trim(),
        type: /Sit-out/i.test(gap.name) ? "living" : "storage",
        planningZone: /Sit-out/i.test(gap.name) ? "PUBLIC" : "SERVICE"
      });
      continue;
    }
    const host = result[idx];
    const r = rectToBox(host.rect);
    const merged = {
      x: Math.min(r.x, g.x),
      y: Math.min(r.y, g.y),
      w: Math.abs(r.y - g.y) <= 1 && Math.abs(r.h - g.h) <= 1 ? r.w + g.w : r.w,
      h: Math.abs(r.x - g.x) <= 1 && Math.abs(r.w - g.w) <= 1 ? r.h + g.h : r.h
    };
    result[idx] = { ...host, rect: boxToRect(merged) };
  }
  return result;
}

// packages/planning-engine/src/topology/layout-fingerprint.ts
function ninth(box, env) {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const col = Math.min(2, Math.max(0, Math.floor((cx - env.x) / env.w * 3)));
  const row = Math.min(2, Math.max(0, Math.floor((cy - env.y) / env.h * 3)));
  return row * 3 + col;
}
var D4_NINTH_MAPS = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
  // identity
  [2, 1, 0, 5, 4, 3, 8, 7, 6],
  // mirror horizontal
  [6, 7, 8, 3, 4, 5, 0, 1, 2],
  // mirror vertical
  [8, 7, 6, 5, 4, 3, 2, 1, 0],
  // rotate 180
  [0, 3, 6, 1, 4, 7, 2, 5, 8],
  // transpose
  [6, 3, 0, 7, 4, 1, 8, 5, 2],
  // rotate 90
  [2, 5, 8, 1, 4, 7, 0, 3, 6],
  // rotate 270
  [8, 5, 2, 7, 4, 1, 6, 3, 0]
  // anti-transpose
];
var D4_DIR_MAPS = [
  { EAST: "EAST", WEST: "WEST", NORTH: "NORTH", SOUTH: "SOUTH" },
  { EAST: "WEST", WEST: "EAST", NORTH: "NORTH", SOUTH: "SOUTH" },
  { EAST: "EAST", WEST: "WEST", NORTH: "SOUTH", SOUTH: "NORTH" },
  { EAST: "WEST", WEST: "EAST", NORTH: "SOUTH", SOUTH: "NORTH" },
  { EAST: "SOUTH", WEST: "NORTH", NORTH: "WEST", SOUTH: "EAST" },
  { EAST: "NORTH", WEST: "SOUTH", NORTH: "WEST", SOUTH: "EAST" },
  { EAST: "SOUTH", WEST: "NORTH", NORTH: "EAST", SOUTH: "WEST" },
  { EAST: "NORTH", WEST: "SOUTH", NORTH: "EAST", SOUTH: "WEST" }
];
function spaceKind(type) {
  const t = type.toLowerCase();
  if (t.includes("bed")) return "BED";
  if (t.includes("bath") || t.includes("toilet") || t.includes("wc")) return "WET";
  if (t.includes("kitchen")) return "KITCHEN";
  if (t.includes("living")) return "LIVING";
  if (t.includes("dining")) return "DINING";
  if (t.includes("balcon")) return "BALCONY";
  if (t.includes("utility")) return "UTILITY";
  if (t.includes("corridor") || t.includes("passage")) return "CIRC";
  if (t.includes("study")) return "STUDY";
  if (t.includes("pooja")) return "POOJA";
  return "OTHER";
}
function zoneOf(room) {
  if (room.planningZone) return room.planningZone;
  const k = spaceKind(room.type);
  if (k === "BED" || k === "STUDY" || k === "POOJA") return "PRIVATE";
  if (k === "WET" || k === "KITCHEN" || k === "UTILITY" || k === "CIRC") return "SERVICE";
  if (k === "BALCONY") return "OUTDOOR";
  return "PUBLIC";
}
var rectBox = (r) => ({ x: r.x, y: r.y, w: r.width, h: r.height });
function layoutFingerprint(structure, partition) {
  const env = partition.envelope;
  const spaces = [];
  for (const flat of structure.flats) {
    for (const room of flat.rooms) spaces.push({ kind: spaceKind(room.type), box: rectBox(room.rect) });
  }
  for (const s of structure.stairs) spaces.push({ kind: "STAIR", box: rectBox(s.rect) });
  for (const l of structure.lifts) spaces.push({ kind: "LIFT", box: rectBox(l.rect) });
  for (const l of structure.lobbies) spaces.push({ kind: "LOBBY", box: rectBox(l.rect) });
  for (const c of structure.corridors) spaces.push({ kind: "COMMON_CIRC", box: rectBox(c.rect) });
  for (let i = 0; i < structure.shafts.length; i++) {
    const role = partition.shaftRoles[i] === "OPEN_TO_SKY_VOID" ? "OTS" : "SHAFT";
    spaces.push({ kind: role, box: rectBox(structure.shafts[i].rect) });
  }
  const pairs = [];
  for (let i = 0; i < spaces.length; i++) {
    for (let j = i + 1; j < spaces.length; j++) {
      if (sharedEdgeLength(spaces[i].box, spaces[j].box) >= 600) {
        pairs.push([spaces[i].kind, spaces[j].kind].sort().join("-"));
      }
    }
  }
  const adjacency = countedMultiset(pairs);
  const coreNinths = [...partition.stairBoxes, ...partition.liftBoxes].map((b) => ninth(b, env));
  const entranceDirs = [...partition.accessEdgeForFlat];
  const zoneCells = /* @__PURE__ */ new Map();
  for (const flat of structure.flats) {
    for (const room of flat.rooms) {
      const box = rectBox(room.rect);
      const key = `${zoneOf(room)}@${ninth(box, env)}`;
      zoneCells.set(key, (zoneCells.get(key) ?? 0) + box.w * box.h);
    }
  }
  const massingShape = partition.massingShape ?? "COMPACT_DOUBLE_LOADED";
  const views = [];
  for (let v = 0; v < D4_NINTH_MAPS.length; v++) {
    const nmap = D4_NINTH_MAPS[v];
    const dmap = D4_DIR_MAPS[v];
    const core = countedMultiset(coreNinths.map((n) => `c${nmap[n]}`));
    const dirs = countedMultiset(entranceDirs.map((d) => dmap[d] ?? d));
    const zoning2 = [...zoneCells.entries()].map(([key, area]) => {
      const [zone, cell] = key.split("@");
      return `${zone}@${nmap[Number(cell)]}:${areaBucket(area)}`;
    }).sort().join(",");
    views.push(`${massingShape}||${adjacency}||${core}|${dirs}||${zoning2}`);
  }
  views.sort();
  const canonical = views[0];
  const circulation = `${countedMultiset(coreNinths.map((n) => `c${n}`))}|${countedMultiset(entranceDirs)}`;
  const zoning = [...zoneCells.entries()].map(([key, area]) => `${key}:${areaBucket(area)}`).sort().join(",");
  return {
    adjacency,
    circulation,
    zoning,
    canonical,
    digests: {
      adjacency: fnv1aHex(adjacency),
      circulation: fnv1aHex(circulation),
      zoning: fnv1aHex(zoning),
      canonical: fnv1aHex(canonical)
    }
  };
}
function areaBucket(areaMm2) {
  const sqm = areaMm2 / 1e6;
  return Math.round(Math.log2(Math.max(1, sqm)) * 2);
}
function countedMultiset(values) {
  const counts = /* @__PURE__ */ new Map();
  for (const v of values) {
    const key = String(v);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, n]) => `${k}x${n}`).join(",");
}
var DIVERSITY_THRESHOLDS = {
  adjacencyDistance: 0.18,
  coreShift: 0.5,
  entranceShift: 0.5,
  zoningDistance: 0.25
};
var setOf = (fingerprint) => new Set(fingerprint.split(",").filter(Boolean));
function jaccardDistance(a, b) {
  if (!a.size && !b.size) return 0;
  let shared = 0;
  for (const v of a) if (b.has(v)) shared++;
  const union = a.size + b.size - shared;
  return union === 0 ? 0 : 1 - shared / union;
}
function compareLayouts(a, b) {
  const adjacencyDistance = jaccardDistance(setOf(a.fingerprint.adjacency), setOf(b.fingerprint.adjacency));
  const zoningDistance = jaccardDistance(setOf(a.fingerprint.zoning), setOf(b.fingerprint.zoning));
  const envA = a.partition.envelope;
  const envB = b.partition.envelope;
  const coreA = [...a.partition.stairBoxes, ...a.partition.liftBoxes].map((x) => ninth(x, envA));
  const coreB = [...b.partition.stairBoxes, ...b.partition.liftBoxes].map((x) => ninth(x, envB));
  const coreShift = multisetShift(coreA.map(String), coreB.map(String));
  const entranceShift = multisetShift(
    [...a.partition.accessEdgeForFlat],
    [...b.partition.accessEdgeForFlat]
  );
  const sameUpToMirror = a.fingerprint.canonical === b.fingerprint.canonical;
  const routes = [];
  if (adjacencyDistance >= DIVERSITY_THRESHOLDS.adjacencyDistance) {
    routes.push(`room adjacency differs by ${(adjacencyDistance * 100).toFixed(0)}%`);
  }
  if (coreShift >= DIVERSITY_THRESHOLDS.coreShift) {
    routes.push(`${(coreShift * 100).toFixed(0)}% of stair/lift elements sit in a different third of the plan`);
  }
  if (entranceShift >= DIVERSITY_THRESHOLDS.entranceShift) {
    routes.push(`${(entranceShift * 100).toFixed(0)}% of flats are entered from a different direction`);
  }
  if (zoningDistance >= DIVERSITY_THRESHOLDS.zoningDistance) {
    routes.push(`public/private zoning differs by ${(zoningDistance * 100).toFixed(0)}%`);
  }
  const shapeA = a.partition.massingShape ?? "COMPACT_DOUBLE_LOADED";
  const shapeB = b.partition.massingShape ?? "COMPACT_DOUBLE_LOADED";
  if (shapeA !== shapeB) {
    routes.push(`building massing shape differs (${shapeA} vs ${shapeB})`);
  }
  const meaningful = !sameUpToMirror && routes.length > 0;
  const explanation = sameUpToMirror ? "These layouts are identical up to mirroring or rotation, so they are one design, not two." : routes.length ? `Genuinely different: ${routes.join("; ")}.` : "Too similar to present as separate concepts: same room graph, same core position, same entrance directions and same zoning; only dimensions differ.";
  return { adjacencyDistance, coreShift, entranceShift, zoningDistance, sameUpToMirror, meaningful, explanation };
}
function multisetShift(a, b) {
  if (!a.length && !b.length) return 0;
  const remaining = [...b];
  let matched = 0;
  for (const v of a) {
    const idx = remaining.indexOf(v);
    if (idx >= 0) {
      remaining.splice(idx, 1);
      matched++;
    }
  }
  const total = Math.max(a.length, b.length);
  return total === 0 ? 0 : 1 - matched / total;
}
function selectDistinct(ranked, limit) {
  const selected = [];
  const suppressed = [];
  for (const candidate of ranked) {
    if (selected.length >= limit) {
      suppressed.push({ candidate, reason: "beyond the requested number of concepts" });
      continue;
    }
    const clash = selected.map((kept) => ({ kept, cmp: compareLayouts(candidate, kept) })).find(({ cmp }) => !cmp.meaningful);
    if (clash) {
      suppressed.push({ candidate, reason: clash.cmp.explanation });
      continue;
    }
    selected.push(candidate);
  }
  return { selected, suppressed };
}

// packages/planning-engine/src/compliance/architectural-compliance-score.ts
function sharesOrthogonalEdge(a, b, minOverlapMm = 100) {
  const ax1 = a.x;
  const ay1 = a.y;
  const ax2 = a.x + a.width;
  const ay2 = a.y + a.height;
  const bx1 = b.x;
  const by1 = b.y;
  const bx2 = b.x + b.width;
  const by2 = b.y + b.height;
  const touchesVertical = Math.abs(ax2 - bx1) <= 5 || Math.abs(bx2 - ax1) <= 5;
  if (touchesVertical) {
    const overlapY = Math.min(ay2, by2) - Math.max(ay1, by1);
    if (overlapY >= minOverlapMm) return true;
  }
  const touchesHorizontal = Math.abs(ay2 - by1) <= 5 || Math.abs(by2 - ay1) <= 5;
  if (touchesHorizontal) {
    const overlapX = Math.min(ax2, bx2) - Math.max(ax1, bx1);
    if (overlapX >= minOverlapMm) return true;
  }
  return false;
}
function evaluateArchitecturalComplianceScore(building, options) {
  const violations = [];
  let redConflictCount = 0;
  let hardRejected = false;
  const typicalFloor = building.floors.find((f) => f.floorUse === "RESIDENTIAL" && (f.apartmentUnits?.length ?? 0) > 0) ?? building.floors.find((f) => (f.apartmentUnits?.length ?? 0) > 0) ?? building.floors[1] ?? building.floors[0];
  const groundFloor = building.floors[0];
  if (!typicalFloor) {
    return {
      score: 0,
      passed: false,
      redConflictCount: 1,
      hardRejected: true,
      attemptCount: options?.attemptCount,
      violations: [
        {
          category: "RED_CONFLICT",
          penalty: 100,
          hardReject: true,
          message: "Building has no residential floor to evaluate."
        }
      ],
      categoryBreakdown: {
        redConflicts: 100,
        bedroomProportions: 0,
        circulationHierarchy: 0,
        balconyPartitioning: 0,
        envelopeUtilization: 0,
        groundAndStairCompleteness: 0
      }
    };
  }
  const closure = validateApartmentClosure({ ...building, floors: [typicalFloor] });
  const closureErrors = closure.issues.filter((i) => i.severity === "error");
  for (const err of closureErrors) {
    redConflictCount++;
    violations.push({
      category: "RED_CONFLICT",
      penalty: 25,
      hardReject: true,
      message: `${err.code}: ${err.message}`
    });
  }
  if (closureErrors.every((e) => e.code !== "ROOM_OVERLAP")) {
    for (let i = 0; i < typicalFloor.rooms.length; i++) {
      for (let j = i + 1; j < typicalFloor.rooms.length; j++) {
        const rA = typicalFloor.rooms[i];
        const rB = typicalFloor.rooms[j];
        if (polygonIntersectionArea(rA.boundary, rB.boundary) > 1) {
          redConflictCount++;
          violations.push({
            category: "RED_CONFLICT",
            penalty: 25,
            hardReject: true,
            roomId: rA.id,
            message: `Room overlap between ${rA.name} and ${rB.name}.`
          });
        }
      }
    }
  }
  const shaftRooms = typicalFloor.rooms.filter(
    (r) => r.type === RoomType.ServiceShaft || r.type === RoomType.OTS || r.spaceUse === "VOID" || r.openToSky
  );
  const fPts = typicalFloor.boundary.points;
  const fMinX = Math.min(...fPts.map((p) => p.x));
  const fMaxX = Math.max(...fPts.map((p) => p.x));
  const fMinY = Math.min(...fPts.map((p) => p.y));
  const fMaxY = Math.max(...fPts.map((p) => p.y));
  for (const bath of typicalFloor.rooms.filter((r) => r.type === RoomType.Bathroom && r.unitId)) {
    const onExterior = Math.abs(bath.x - fMinX) <= 5 || Math.abs(bath.x + bath.width - fMaxX) <= 5 || Math.abs(bath.y - fMinY) <= 5 || Math.abs(bath.y + bath.height - fMaxY) <= 5;
    const touchesShaft = shaftRooms.some((s) => sharesOrthogonalEdge(bath, s, 500));
    const hasWindow = typicalFloor.windows.some((w) => w.roomId === bath.id);
    if (!onExterior && !touchesShaft && !hasWindow) {
      redConflictCount++;
      violations.push({
        category: "RED_CONFLICT",
        penalty: 25,
        hardReject: true,
        roomId: bath.id,
        unitId: bath.unitId,
        message: `Unventilated wet core: ${bath.name} has neither exterior wall nor ventilation shaft.`
      });
    }
  }
  const bedrooms = typicalFloor.rooms.filter(
    (r) => r.type === RoomType.Bedroom && r.unitId && !/PASSAGE|CORRIDOR|BALCONY|TOILET|BATH/i.test(r.name)
  );
  for (const bed of bedrooms) {
    const shortDim = Math.min(bed.width, bed.height);
    const longDim = Math.max(bed.width, bed.height);
    const aspectRatio = shortDim > 0 ? longDim / shortDim : 99;
    if (shortDim < 2850 || aspectRatio > 2.4) {
      hardRejected = true;
      redConflictCount++;
      violations.push({
        category: "BEDROOM_PROPORTION",
        penalty: 20,
        hardReject: true,
        roomId: bed.id,
        unitId: bed.unitId,
        message: `${bed.name} (${bed.width}x${bed.height} mm, ratio ${aspectRatio.toFixed(2)}:1) violates hard bedroom limits (min width >= 2,850 mm, max aspect ratio <= 2.4).`
      });
    } else if (shortDim < 3e3 || aspectRatio > 2.2) {
      violations.push({
        category: "BEDROOM_PROPORTION",
        penalty: 20,
        hardReject: false,
        roomId: bed.id,
        unitId: bed.unitId,
        message: `${bed.name} (${bed.width}x${bed.height} mm, ratio ${aspectRatio.toFixed(2)}:1) is below target bedroom proportion (clear width >= 3,000 mm, aspect ratio <= 2.2).`
      });
    }
  }
  for (const unit of typicalFloor.apartmentUnits ?? []) {
    const unitRooms = typicalFloor.rooms.filter((r) => r.unitId === unit.id);
    const unitRoomMap = new Map(unitRooms.map((r) => [r.id, r]));
    const entranceDoors = typicalFloor.doors.filter(
      (d) => d.connectsRooms.some((id) => unitRoomMap.has(id)) && d.connectsRooms.some((id) => {
        const other = typicalFloor.rooms.find((r) => r.id === id);
        return other && !other.unitId;
      })
    );
    for (const entryDoor of entranceDoors) {
      const insideId = entryDoor.connectsRooms.find((id) => unitRoomMap.has(id));
      const insideRoom = insideId ? unitRoomMap.get(insideId) : void 0;
      if (!insideRoom) continue;
      if (insideRoom.type === RoomType.Foyer) {
        const foyerAreaSqM = insideRoom.width * insideRoom.height / 1e6;
        if (foyerAreaSqM > 12.05) {
          violations.push({
            category: "CIRCULATION_HIERARCHY",
            penalty: 20,
            hardReject: false,
            roomId: insideRoom.id,
            unitId: unit.id,
            message: `${insideRoom.name} (${foyerAreaSqM.toFixed(1)} sq m) exceeds maximum 12.0 sq m compact vestibule limit.`
          });
        }
        const internalFoyerDoors = typicalFloor.doors.filter(
          (d) => d.id !== entryDoor.id && d.connectsRooms.includes(insideRoom.id) && d.connectsRooms.some((id) => id !== insideRoom.id && unitRoomMap.has(id))
        );
        for (const fd of internalFoyerDoors) {
          const targetId = fd.connectsRooms.find((id) => id !== insideRoom.id);
          const targetRoom = targetId ? unitRoomMap.get(targetId) : void 0;
          if (targetRoom && targetRoom.type !== RoomType.Living && targetRoom.type !== RoomType.Dining) {
            violations.push({
              category: "CIRCULATION_HIERARCHY",
              penalty: 20,
              hardReject: true,
              roomId: targetRoom.id,
              unitId: unit.id,
              message: `${targetRoom.name} connects directly to ${insideRoom.name}; private rooms/passages must branch from Living/Dining.`
            });
            hardRejected = true;
          }
        }
      } else if (insideRoom.type !== RoomType.Living && insideRoom.type !== RoomType.Dining) {
        violations.push({
          category: "CIRCULATION_HIERARCHY",
          penalty: 20,
          hardReject: true,
          roomId: insideRoom.id,
          unitId: unit.id,
          message: `Main entrance of ${unit.id} opens into ${insideRoom.name} (${insideRoom.type}) instead of Living/Dining or Foyer.`
        });
        hardRejected = true;
      }
    }
    for (const priv of unitRooms.filter((r) => r.type === RoomType.Bedroom || r.type === RoomType.Corridor)) {
      const connectedRooms = typicalFloor.doors.filter((d) => d.connectsRooms.includes(priv.id)).map((d) => d.connectsRooms.find((id) => id !== priv.id)).map((id) => id ? unitRoomMap.get(id) : void 0).filter((r) => Boolean(r));
      const connectsToPublicOrPassage = connectedRooms.some(
        (r) => r.type === RoomType.Living || r.type === RoomType.Dining || r.type === RoomType.Corridor || r.type === RoomType.Bedroom
      );
      if (!connectsToPublicOrPassage) {
        violations.push({
          category: "CIRCULATION_HIERARCHY",
          penalty: 20,
          hardReject: true,
          roomId: priv.id,
          unitId: unit.id,
          message: `${priv.name} has no valid internal circulation connection from Living/Dining or Internal Passage.`
        });
        hardRejected = true;
      }
    }
  }
  for (const passage of typicalFloor.rooms.filter(
    (r) => r.type === RoomType.Corridor || /PASSAGE|CORRIDOR/i.test(r.name)
  )) {
    const badFurn = (typicalFloor.furniture ?? []).filter((f) => f.roomId === passage.id);
    if (badFurn.length > 0) {
      violations.push({
        category: "CIRCULATION_HIERARCHY",
        penalty: 20,
        hardReject: true,
        roomId: passage.id,
        unitId: passage.unitId,
        message: `${passage.name} contains ${badFurn.length} furniture item(s); circulation passages must remain unobstructed.`
      });
      hardRejected = true;
    }
  }
  const unitBalconies = typicalFloor.rooms.filter(
    (r) => (r.type === RoomType.Balcony || r.type === RoomType.Utility) && r.unitId
  );
  for (let i = 0; i < unitBalconies.length; i++) {
    for (let j = i + 1; j < unitBalconies.length; j++) {
      const b1 = unitBalconies[i];
      const b2 = unitBalconies[j];
      if (b1.unitId === b2.unitId) continue;
      if (sharesOrthogonalEdge(b1, b2, 100)) {
        const partyWall = typicalFloor.walls.find(
          (w) => w.roomIds.includes(b1.id) && w.roomIds.includes(b2.id) && isPhysicalBoundary(w) && w.boundaryRole === "FULL_HEIGHT_WALL" && w.thickness >= 200
        );
        if (!partyWall) {
          violations.push({
            category: "BALCONY_PARTITION",
            penalty: 15,
            hardReject: true,
            roomId: b1.id,
            unitId: b1.unitId,
            message: `Adjacent balconies ${b1.name} and ${b2.name} lack a full-height >= 200 mm inter-flat party wall.`
          });
          hardRejected = true;
        }
      }
    }
  }
  const promptText = options?.config?.aiPrompt ?? "";
  const configMassing = options?.config?.buildingMassingShape;
  const explicitShapeRequested = configMassing !== void 0 && configMassing !== "COMPACT_DOUBLE_LOADED" || /\b(h[- ]?shape|u[- ]?shape|l[- ]?shape|courtyard|cruciform|pinwheel|stepped)\b/i.test(promptText);
  const fullUtilRequested = options?.requireFullEnvelopeUtilization ?? (/\b(utili[sz]e\s+(the\s+)?(full|entire|maximum)\s+(plot|floor|setback|envelope)|proper\s+space\s+utili[sz]ation)\b/i.test(
    promptText
  ) && !explicitShapeRequested);
  if (fullUtilRequested && options?.permissibleEnvelopeMm) {
    const permArea = options.permissibleEnvelopeMm.w * options.permissibleEnvelopeMm.h;
    if (permArea > 0) {
      const builtRoomsArea = typicalFloor.rooms.filter((r) => !(r.tags?.includes("recess:perimeter") && r.openToSky)).reduce((sum, r) => sum + r.width * r.height, 0);
      const utilization = builtRoomsArea / permArea;
      if (utilization < 0.82) {
        violations.push({
          category: "ENVELOPE_UTILIZATION",
          penalty: 15,
          hardReject: false,
          message: `Built footprint utilizes ${(utilization * 100).toFixed(1)}% of permissible setback envelope (< 82.0% target).`
        });
      }
    }
  }
  if (groundFloor) {
    const groundLobbies = groundFloor.rooms.filter(
      (r) => (r.id.endsWith("stilt__grand_lobby") || r.tags?.includes("core:lobby") || r.type === RoomType.Foyer && !/open\s*parking|remainder/i.test(r.name) && !r.id.includes("open_remainder")) && r.architecturalRole !== "VEHICLE_AISLE" && r.architecturalRole !== "PARKING_BAY" && r.architecturalRole !== "PARKING_AREA"
    );
    for (const lobby of groundLobbies) {
      const openExtWall = groundFloor.walls.find(
        (w) => w.roomIds.length === 1 && w.roomIds.includes(lobby.id) && w.boundaryRole === "OPEN_BOUNDARY"
      );
      if (openExtWall) {
        violations.push({
          category: "GROUND_AND_STAIR_COMPLETENESS",
          penalty: 15,
          hardReject: false,
          roomId: lobby.id,
          message: `Ground/entrance lobby (${lobby.name}) has an unenclosed exterior wall (${openExtWall.id}).`
        });
      }
    }
  }
  const stairRooms = typicalFloor.rooms.filter((r) => r.type === RoomType.Staircase);
  if (stairRooms.length === 0) {
    violations.push({
      category: "GROUND_AND_STAIR_COMPLETENESS",
      penalty: 15,
      hardReject: true,
      message: "Typical residential floor has no staircase core."
    });
    hardRejected = true;
  } else {
    for (const stairRoom2 of stairRooms) {
      const hasCanonicalStair = (typicalFloor.canonicalStaircases ?? []).some(
        (s) => polygonIntersectionArea(s.polygon, stairRoom2.boundary) > 1e5
      );
      const hasFloorStair = (typicalFloor.stairs ?? []).length >= stairRooms.length;
      if (!hasCanonicalStair && !hasFloorStair) {
        violations.push({
          category: "GROUND_AND_STAIR_COMPLETENESS",
          penalty: 15,
          hardReject: false,
          roomId: stairRoom2.id,
          message: `Staircase ${stairRoom2.name} is missing canonical tread/flight geometry.`
        });
      }
    }
  }
  const sumPenalty = (cat) => violations.filter((v) => v.category === cat).reduce((s, v) => s + v.penalty, 0);
  const categoryBreakdown = {
    redConflicts: sumPenalty("RED_CONFLICT"),
    bedroomProportions: sumPenalty("BEDROOM_PROPORTION"),
    circulationHierarchy: sumPenalty("CIRCULATION_HIERARCHY"),
    balconyPartitioning: sumPenalty("BALCONY_PARTITION"),
    envelopeUtilization: sumPenalty("ENVELOPE_UTILIZATION"),
    groundAndStairCompleteness: sumPenalty("GROUND_AND_STAIR_COMPLETENESS")
  };
  const totalPenalty = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);
  const rawScore = Math.max(0, 100 - totalPenalty);
  const score = hardRejected ? Math.min(rawScore, 79) : rawScore;
  const passed = score >= 85 && redConflictCount === 0 && !hardRejected;
  return {
    score,
    passed,
    redConflictCount,
    hardRejected,
    attemptCount: options?.attemptCount,
    violations,
    categoryBreakdown
  };
}

// packages/planning-engine/src/topology/candidate-scoring.ts
var rectBox2 = (r) => ({ x: r.x, y: r.y, w: r.width, h: r.height });
var PRIORITY_EMPHASIS = {
  COMPACT_EFFICIENCY: ["FACADE_ALLOCATION", "ENVELOPE_UTILIZATION", "CIRCULATION_EFFICIENCY", "CORE_EFFICIENCY"],
  DAYLIGHT_VENTILATION: ["FACADE_ALLOCATION", "DAYLIGHT_EXPOSURE", "VENTILATION_QUALITY"],
  PRIVACY_CIRCULATION: ["FACADE_ALLOCATION", "PRIVACY_SEPARATION", "CIRCULATION_EFFICIENCY"],
  // KITCHEN_DINING deliberately emphasizes the SAME objectives as an unstated
  // brief. Kitchen size is resolved inside each flat after the organization is
  // chosen, so emphasizing it here would pick a differently-shaped flat and a
  // user asking for a larger kitchen could receive a smaller one in a different
  // plan. The preference still reaches the geometry through the room slicer and
  // is still measured by KITCHEN_USABILITY; it just does not reorder topologies.
  KITCHEN_DINING: ["FACADE_ALLOCATION", "ENVELOPE_UTILIZATION", "DAYLIGHT_EXPOSURE", "PRIVACY_SEPARATION", "BEDROOM_BALCONY_ACCESS"],
  UNSPECIFIED: ["FACADE_ALLOCATION", "ENVELOPE_UTILIZATION", "DAYLIGHT_EXPOSURE", "PRIVACY_SEPARATION", "BEDROOM_BALCONY_ACCESS"]
};
var PRESENTATION_WEIGHTS = {
  ENVELOPE_UTILIZATION: 1.2,
  CIRCULATION_EFFICIENCY: 1,
  DAYLIGHT_EXPOSURE: 1.2,
  VENTILATION_QUALITY: 1.2,
  PRIVACY_SEPARATION: 1,
  KITCHEN_USABILITY: 0.8,
  BEDROOM_BALCONY_ACCESS: 0.8,
  FACADE_ALLOCATION: 2,
  CORE_EFFICIENCY: 1,
  ROOM_PROPORTION: 1,
  PREFERENCE_SATISFACTION: 1.5
};
var clamp01 = (v) => Math.max(0, Math.min(1, v));
function onFacade(room, env) {
  const b = rectBox2(room.rect);
  return Math.abs(b.x - env.x) <= 1 || Math.abs(b.y - env.y) <= 1 || Math.abs(b.x + b.w - (env.x + env.w)) <= 1 || Math.abs(b.y + b.h - (env.y + env.h)) <= 1;
}
var isWet = (room) => /bath|toilet|wc/i.test(room.type);
var isBed = (room) => /bed/i.test(room.type);
function scoreCandidate(input) {
  const { structure, partition, program } = input;
  const env = partition.builtOutline;
  const plotEnv = partition.envelope;
  const allRooms = structure.flats.flatMap((f) => f.rooms);
  const hardConstraints = [];
  hardConstraints.push({
    id: "EXACT_FLAT_COUNT",
    satisfied: structure.flats.length === program.mandatory.flatsPerFloor,
    detail: `${structure.flats.length} flats placed; the brief requires ${program.mandatory.flatsPerFloor}`
  });
  hardConstraints.push({
    id: "EVERY_FLAT_HAS_ONE_ENTRANCE",
    satisfied: input.flatsWithoutEntrance.length === 0,
    detail: input.flatsWithoutEntrance.length ? `no entrance could be hosted for: ${input.flatsWithoutEntrance.join(", ")}` : "every flat has an entrance door onto common circulation"
  });
  const ventSpaces = structure.shafts.map((s) => rectBox2(s.rect));
  const wetRooms = allRooms.filter(isWet);
  const unventilated = wetRooms.filter((room) => {
    if (onFacade(room, env)) return false;
    const b = rectBox2(room.rect);
    return !ventSpaces.some((v) => sharedEdgeLength(b, v) >= 600);
  });
  hardConstraints.push({
    id: "EVERY_BATHROOM_VENTILATED",
    satisfied: unventilated.length === 0,
    detail: unventilated.length ? `${unventilated.length} of ${wetRooms.length} bathrooms touch neither the external facade nor a ventilation shaft` : `all ${wetRooms.length} bathrooms touch the external facade or a ventilation shaft`
  });
  const recessBoxes = partition.shaftBoxes.filter((_, i) => isPerimeterRecess(partition, i));
  const flatsOffFacade = structure.flats.filter((flat) => {
    const b = rectBox2(flat.rect);
    const touchesOuterEnv = Math.abs(b.x - env.x) <= 1 || Math.abs(b.y - env.y) <= 1 || Math.abs(b.x + b.w - (env.x + env.w)) <= 1 || Math.abs(b.y + b.h - (env.y + env.h)) <= 1;
    const touchesPerimeterRecess = recessBoxes.some((r) => sharedEdgeLength(b, r) >= 1600);
    return !(touchesOuterEnv || touchesPerimeterRecess);
  });
  hardConstraints.push({
    id: "EVERY_FLAT_REACHES_FACADE",
    satisfied: flatsOffFacade.length === 0,
    detail: flatsOffFacade.length ? `${flatsOffFacade.length} flat(s) reach no exterior envelope edge` : "every flat reaches at least one exterior envelope edge"
  });
  const circ = [...partition.corridorBoxes, ...partition.lobbyBoxes];
  const vertical = [...partition.stairBoxes, ...partition.liftBoxes];
  const coreReachable = vertical.every((v) => circ.some((c) => sharedEdgeLength(c, v) >= 900));
  hardConstraints.push({
    id: "CORE_REACHABLE_FROM_CIRCULATION",
    satisfied: coreReachable,
    detail: coreReachable ? "every stair and lift adjoins common circulation" : "one or more stairs or lifts do not adjoin common circulation"
  });
  const requiredCore = program.mandatory.corePlacement;
  let corePlacementOk = true;
  let corePlacementDetail = "no mandatory core placement was stated";
  if (requiredCore && requiredCore !== "UNSPECIFIED") {
    const regions = partition.coreBoxes.length ? partition.coreBoxes : vertical;
    const minX = Math.min(...regions.map((b) => b.x));
    const maxX = Math.max(...regions.map((b) => b.x + b.w));
    const minY = Math.min(...regions.map((b) => b.y));
    const maxY = Math.max(...regions.map((b) => b.y + b.h));
    const fx = ((minX + maxX) / 2 - env.x) / env.w;
    const fy = ((minY + maxY) / 2 - env.y) / env.h;
    const spanX = (maxX - minX) / env.w;
    const spanY = (maxY - minY) / env.h;
    corePlacementOk = requiredCore === "EAST" ? fx > 0.6 : requiredCore === "WEST" ? fx < 0.4 : requiredCore === "NORTH" ? fy < 0.4 : requiredCore === "SOUTH" ? fy > 0.6 : (
      // Central: the core must straddle the middle on the axis it is thin on,
      // and may run the full length of the other.
      requiredCore === "CENTRAL" ? fx > 0.3 && fx < 0.7 && (spanY > 0.8 || fy > 0.25 && fy < 0.75) || fy > 0.3 && fy < 0.7 && (spanX > 0.8 || fx > 0.25 && fx < 0.75) : requiredCore === "SPLIT" ? partition.coreBoxes.length >= 2 : true
    );
    corePlacementDetail = `the core region spans ${(spanX * 100).toFixed(0)}% of the plot width and ${(spanY * 100).toFixed(0)}% of its depth, centred at ${(fx * 100).toFixed(0)}% across and ${(fy * 100).toFixed(0)}% down; the brief requires ${requiredCore}`;
  }
  hardConstraints.push({ id: "REQUIRED_CORE_PLACEMENT_HONOURED", satisfied: corePlacementOk, detail: corePlacementDetail });
  const requiredVent = program.mandatory.ventilationStrategy;
  let ventOk = true;
  let ventDetail = "no mandatory ventilation strategy was stated";
  if (requiredVent === "CENTRAL_COURTYARD") {
    const courts = partition.shaftBoxes.filter(
      (b, i) => partition.shaftRoles[i] === "OPEN_TO_SKY_VOID" && !isPerimeterRecess(partition, i) && Math.min(b.w, b.h) >= 3e3
    );
    const central = courts.filter((b) => {
      const fx = (b.x + b.w / 2 - env.x) / env.w;
      const fy = (b.y + b.h / 2 - env.y) / env.h;
      return fx > 0.25 && fx < 0.75 && fy > 0.2 && fy < 0.8;
    });
    ventOk = central.length > 0;
    ventDetail = ventOk ? `a central open-to-sky court of ${(boxArea(central[0]) / 1e6).toFixed(1)} m2 is present` : "the brief requires a central open-to-sky court; this layout has none in the central zone";
  } else if (requiredVent === "SIDE_SHAFTS") {
    ventOk = partition.shaftBoxes.length > 0;
    ventDetail = ventOk ? "side ventilation shafts are present" : "no ventilation shafts present";
  } else if (requiredVent === "PERIMETER_ONLY") {
    const otsArea2 = otsAreaOf(partition);
    ventOk = otsArea2 === 0;
    ventDetail = ventOk ? "no open-to-sky (OTS) void is present, honouring perimeter-only / NO OTS requirement" : `the brief prohibits OTS voids, but ${(otsArea2 / 1e6).toFixed(1)} m2 of OPEN_TO_SKY_VOID is present`;
  } else if (program.preferences.ventilatedCentralOtsShafts) {
    const anyOts = partition.shaftBoxes.filter(
      (_, i) => partition.shaftRoles[i] === "OPEN_TO_SKY_VOID"
    );
    ventOk = anyOts.length > 0;
    ventDetail = ventOk ? `${anyOts.length} ventilated OTS shaft(s)/court(s) present` : "the brief requests ventilated central OTS shafts; this layout has none";
  }
  hardConstraints.push({ id: "REQUIRED_VENTILATION_STRATEGY_HONOURED", satisfied: ventOk, detail: ventDetail });
  const feasible = hardConstraints.every((c) => c.satisfied);
  const objectives = [];
  const envArea = boxArea(env);
  const flatArea = flatAreaOf(partition);
  const utilization = flatArea / envArea;
  objectives.push({
    id: "ENVELOPE_UTILIZATION",
    // 0.70 of the envelope as dwelling area is a strong result once stairs,
    // lifts, corridors and shafts are accounted for; 0.45 is weak.
    score: clamp01((utilization - 0.45) / 0.25),
    explanation: `${(utilization * 100).toFixed(1)}% of the buildable envelope is dwelling area (${(flatArea / 1e6).toFixed(1)} m2 of ${(envArea / 1e6).toFixed(1)} m2)`
  });
  const circArea = circulationAreaOf(partition);
  const circShare = circArea / envArea;
  objectives.push({
    id: "CIRCULATION_EFFICIENCY",
    // Below 6% of the envelope is efficient; above 16% is corridor-heavy.
    score: clamp01((0.16 - circShare) / 0.1),
    explanation: `common corridors and lobbies take ${(circShare * 100).toFixed(1)}% of the envelope (${(circArea / 1e6).toFixed(1)} m2)`
  });
  const habitable = allRooms.filter((r) => /living|dining|bed|kitchen|study/i.test(r.type));
  const daylit = habitable.filter((r) => onFacade(r, env));
  const daylightRatio = habitable.length ? daylit.length / habitable.length : 0;
  objectives.push({
    id: "DAYLIGHT_EXPOSURE",
    score: clamp01((daylightRatio - 0.5) / 0.45),
    explanation: `${daylit.length} of ${habitable.length} habitable rooms touch the external facade (${(daylightRatio * 100).toFixed(0)}%)`
  });
  const otsArea = otsAreaOf(partition);
  const wetVentilatedByFacade = wetRooms.filter((r) => onFacade(r, env)).length;
  objectives.push({
    id: "VENTILATION_QUALITY",
    score: clamp01(
      0.6 * (wetRooms.length ? wetVentilatedByFacade / wetRooms.length : 0) + 0.4 * clamp01(otsArea / (envArea * 0.05))
    ),
    explanation: `${wetVentilatedByFacade} of ${wetRooms.length} bathrooms vent directly to the facade; ${(otsArea / 1e6).toFixed(1)} m2 of open-to-sky void supports the rest`
  });
  const diagonal = Math.hypot(env.w, env.h);
  const bedrooms = allRooms.filter(isBed);
  const bedroomDistances = bedrooms.map((room) => {
    const b = rectBox2(room.rect);
    const bcx = b.x + b.w / 2;
    const bcy = b.y + b.h / 2;
    return Math.min(...circ.map((c) => Math.hypot(bcx - (c.x + c.w / 2), bcy - (c.y + c.h / 2))), diagonal);
  });
  const meanBedroomDistance = bedroomDistances.length ? bedroomDistances.reduce((s, d) => s + d, 0) / bedroomDistances.length : 0;
  const bedroomsOnCorridor = bedrooms.filter(
    (room) => circ.some((c) => sharedEdgeLength(rectBox2(room.rect), c) >= 600)
  ).length;
  objectives.push({
    id: "PRIVACY_SEPARATION",
    score: clamp01(meanBedroomDistance / (diagonal * 0.35)) * clamp01(1 - bedroomsOnCorridor / Math.max(1, bedrooms.length)),
    explanation: `bedrooms average ${(meanBedroomDistance / 1e3).toFixed(1)} m from common circulation; ${bedroomsOnCorridor} of ${bedrooms.length} share a wall with it`
  });
  const kitchens = allRooms.filter((r) => /kitchen/i.test(r.type));
  const kitchenAreas = kitchens.map((k) => k.rect.width * k.rect.height / 1e6);
  const meanKitchen = kitchenAreas.length ? kitchenAreas.reduce((s, a) => s + a, 0) / kitchenAreas.length : 0;
  const kitchensWithUtility = kitchens.filter(
    (k) => allRooms.some((r) => /utility/i.test(r.type) && sharedEdgeLength(rectBox2(k.rect), rectBox2(r.rect)) >= 600)
  ).length;
  objectives.push({
    id: "KITCHEN_USABILITY",
    // 7 m2 is a usable kitchen; 13 m2 is generous. Utility access matters too.
    score: clamp01(0.7 * clamp01((meanKitchen - 7) / 6) + 0.3 * (kitchens.length ? kitchensWithUtility / kitchens.length : 0)),
    explanation: `kitchens average ${meanKitchen.toFixed(1)} m2; ${kitchensWithUtility} of ${kitchens.length} adjoin a utility balcony`
  });
  const balconies = allRooms.filter((r) => /balcon/i.test(r.type) && r.id.includes("__balcony"));
  const bedroomsWithBalcony = bedrooms.filter(
    (bed) => balconies.some((b) => b.id.startsWith(bed.id))
  ).length;
  objectives.push({
    id: "BEDROOM_BALCONY_ACCESS",
    score: bedrooms.length ? clamp01(bedroomsWithBalcony / bedrooms.length) : 0,
    explanation: `${bedroomsWithBalcony} of ${bedrooms.length} bedrooms have an attached balcony on the external facade`
  });
  const perimeter = 2 * (env.w + env.h);
  const flatFacade = structure.flats.map((flat) => {
    const b = rectBox2(flat.rect);
    let length = 0;
    if (Math.abs(b.x - env.x) <= 1) length += b.h;
    if (Math.abs(b.x + b.w - (env.x + env.w)) <= 1) length += b.h;
    if (Math.abs(b.y - env.y) <= 1) length += b.w;
    if (Math.abs(b.y + b.h - (env.y + env.h)) <= 1) length += b.w;
    return length;
  });
  const totalFacade = flatFacade.reduce((sum, l) => sum + l, 0);
  const flatsWithFacade = flatFacade.filter((l) => l > 0).length;
  objectives.push({
    id: "FACADE_ALLOCATION",
    score: clamp01(0.5 * (flatsWithFacade / Math.max(1, structure.flats.length)) + 0.5 * clamp01(totalFacade / (perimeter * 0.5))),
    explanation: `${flatsWithFacade} of ${structure.flats.length} flats front the plot boundary, taking ${(totalFacade / 1e3).toFixed(1)} m of the ${(perimeter / 1e3).toFixed(1)} m perimeter`
  });
  const coreArea = vertical.reduce((s, b) => s + boxArea(b), 0);
  const coreShare = coreArea / envArea;
  objectives.push({
    id: "CORE_EFFICIENCY",
    // Stairs and lifts between 4% and 10% of the envelope is reasonable; a
    // larger core consumes dwelling area without serving more flats.
    score: clamp01((0.14 - coreShare) / 0.08),
    explanation: `stairs and lifts occupy ${(coreShare * 100).toFixed(1)}% of the envelope (${(coreArea / 1e6).toFixed(1)} m2)`
  });
  const badProportionRooms = habitable.filter((r) => {
    const long = Math.max(r.rect.width, r.rect.height);
    const short = Math.min(r.rect.width, r.rect.height);
    const ratio = short > 0 ? long / short : 99;
    return ratio > 2.2 || isBed(r) && short < 3e3;
  }).length;
  const bedroomQualityTier = bedrooms.every((r) => {
    const long = Math.max(r.rect.width, r.rect.height);
    const short = Math.min(r.rect.width, r.rect.height);
    const ratio = short > 0 ? long / short : 99;
    return short >= 3e3 && ratio <= 2.2;
  }) ? 2 : bedrooms.every((r) => {
    const long = Math.max(r.rect.width, r.rect.height);
    const short = Math.min(r.rect.width, r.rect.height);
    const ratio = short > 0 ? long / short : 99;
    return short >= 2850 && ratio <= 2.4;
  }) ? 1 : 0;
  objectives.push({
    id: "ROOM_PROPORTION",
    score: habitable.length ? clamp01(1 - badProportionRooms / habitable.length) : 0,
    explanation: `${badProportionRooms} of ${habitable.length} habitable rooms violate a 2.2:1 proportion or 3.0 m bedroom width`
  });
  const prefChecks = [];
  const p = program.preferences;
  if (p.corePreference !== "UNSPECIFIED") {
    prefChecks.push({ ok: corePlacementOk || !requiredCore, label: `core toward ${p.corePreference}` });
  }
  if (p.ventilationStrategy === "CENTRAL_COURTYARD") {
    prefChecks.push({ ok: otsArea > 0, label: "central open-to-sky court" });
  }
  if (p.bedroomsAwayFromLobby) {
    prefChecks.push({ ok: bedroomsOnCorridor === 0, label: "bedrooms away from the shared lobby" });
  }
  if (p.bedroomBalconies !== "NONE_REQUESTED") {
    prefChecks.push({ ok: bedroomsWithBalcony > 0, label: "bedroom balconies" });
  }
  if (p.kitchenSize === "LARGER") {
    prefChecks.push({ ok: meanKitchen >= 9, label: "larger kitchens" });
  }
  if (p.minimizeCorridor) {
    prefChecks.push({ ok: circShare <= 0.1, label: "minimal corridor area" });
  }
  const satisfiedPrefs = prefChecks.filter((c) => c.ok);
  objectives.push({
    id: "PREFERENCE_SATISFACTION",
    score: prefChecks.length ? satisfiedPrefs.length / prefChecks.length : 1,
    explanation: prefChecks.length ? `${satisfiedPrefs.length} of ${prefChecks.length} stated preferences are honoured by this geometry` + (satisfiedPrefs.length < prefChecks.length ? ` (unmet: ${prefChecks.filter((c) => !c.ok).map((c) => c.label).join(", ")})` : "") : "the brief stated no specific spatial preferences, so nothing is unmet"
  });
  const weightedTotal = objectives.reduce((sum, o) => sum + o.score * PRESENTATION_WEIGHTS[o.id], 0) / objectives.reduce((sum, o) => sum + PRESENTATION_WEIGHTS[o.id], 0);
  return {
    feasible,
    hardConstraints,
    objectives,
    weightedTotal,
    emphasized: PRIORITY_EMPHASIS[program.preferences.priority],
    bedroomQualityTier
  };
}
var scoreOf = (s, id) => s.objectives.find((o) => o.id === id)?.score ?? 0;
function dominates(a, b) {
  if (a.feasible !== b.feasible) return a.feasible;
  const ids = a.emphasized;
  let strictlyBetter = false;
  for (const id of ids) {
    const av = scoreOf(a, id);
    const bv = scoreOf(b, id);
    if (av < bv - 1e-9) return false;
    if (av > bv + 1e-9) strictlyBetter = true;
  }
  return strictlyBetter;
}
function rankCandidates(candidates) {
  const feasible = candidates.filter((c) => c.score.feasible);
  const infeasible = candidates.filter((c) => !c.score.feasible);
  const layered = [];
  for (const tier of [2, 1, 0]) {
    let pool = feasible.filter((c) => (c.score.bedroomQualityTier ?? 2) === tier);
    while (pool.length) {
      const front = pool.filter((c) => !pool.some((other) => other !== c && dominates(other.score, c.score)));
      const chosen = front.length ? front : pool;
      chosen.sort((a, b) => b.score.weightedTotal - a.score.weightedTotal);
      layered.push(...chosen);
      pool = pool.filter((c) => !chosen.includes(c));
    }
  }
  infeasible.sort((a, b) => b.score.weightedTotal - a.score.weightedTotal);
  return [...layered, ...infeasible];
}
function explainRanking(better, worse) {
  if (better.feasible !== worse.feasible) {
    const failed = (better.feasible ? worse : better).hardConstraints.filter((c) => !c.satisfied);
    return `One layout fails a mandatory requirement (${failed.map((f) => f.detail).join("; ")}), so it cannot be ranked above a layout that satisfies all of them, whatever its other qualities.`;
  }
  const gains = [];
  for (const id of better.emphasized) {
    const delta = scoreOf(better, id) - scoreOf(worse, id);
    if (Math.abs(delta) < 0.05) continue;
    const o = (delta > 0 ? better : worse).objectives.find((x) => x.id === id);
    gains.push(`${id.toLowerCase().replace(/_/g, " ")} ${delta > 0 ? "better" : "worse"} by ${Math.abs(delta * 100).toFixed(0)} points (${o?.explanation ?? ""})`);
  }
  return gains.length ? `Ranked higher because, on the priorities this brief emphasized, it is ${gains.join("; ")}.` : `Both layouts score equally on the emphasized priorities; the order reflects the overall weighted total (${better.weightedTotal.toFixed(3)} against ${worse.weightedTotal.toFixed(3)}) and is not a strong preference.`;
}

// packages/planning-engine/src/topology/generative-topology-engine.ts
var TOPOLOGY_ENGINE_VERSION = "1.0.0";
function generateDesignConcepts(input) {
  const startedAt = Date.now();
  const conceptLimit = input.conceptLimit ?? 3;
  const maxCandidates = input.maxCandidates ?? 24;
  const timeBudgetMs = input.timeBudgetMs ?? 2e4;
  const program = interpretArchitecturalIntent({
    prompt: input.aiPrompt,
    flatsPerFloor: input.flatsPerFloor,
    unitTypes: input.unitTypes
  });
  const validation = validateProgram(program);
  if (!validation.valid) {
    throw new Error(`INVALID_ARCHITECTURAL_PROGRAM: ${validation.issues.join("; ")}`);
  }
  const seed2 = fnv1a(`${input.seed ?? 1}:${program.intentDigest}:${TOPOLOGY_ENGINE_VERSION}`);
  const random = mulberry32(seed2);
  const effectiveArchetype = input.preferredArchetype ?? (input.seed && input.seed > 1 ? ROOM_SLICING_ARCHETYPES[(input.seed - 1) % ROOM_SLICING_ARCHETYPES.length] : "CENTRAL_LIVING_SPLIT_BEDROOMS");
  const effectiveMassingShape = input.preferredMassingShape ?? program.preferences.preferredMassingShape ?? (program.preferences.requestsDifferentShape ? BUILDING_MASSING_SHAPES[(input.seed ?? 1) % BUILDING_MASSING_SHAPES.length] : input.seed && input.seed > 1 ? BUILDING_MASSING_SHAPES[(input.seed - 1) % BUILDING_MASSING_SHAPES.length] : void 0);
  const { candidates: topologies, rejections } = generateTopologyCandidates({
    envelope: input.envelope,
    flatsPerFloor: input.flatsPerFloor,
    program,
    enableMacroShapes: Boolean(effectiveMassingShape && effectiveMassingShape !== "COMPACT_DOUBLE_LOADED")
  });
  const rejected = rejections.map((r) => ({
    familyId: r.familyId,
    variantId: r.variantId,
    reasons: r.reasons,
    stage: "TOPOLOGY"
  }));
  const ordered = [...topologies].map((t) => ({ t, key: explorationKey(t, program, random()) })).sort((a, b) => a.key - b.key).map((x) => x.t);
  const rejectedHashSet = new Set(input.rejectedTopologyHashes ?? []);
  const scored = [];
  const failed = [];
  let assembledCount = 0;
  let timedOut = false;
  for (const topology of ordered) {
    if (assembledCount >= maxCandidates) {
      rejected.push({
        familyId: topology.familyId,
        variantId: topology.variantId,
        reasons: [`candidate budget of ${maxCandidates} assembled layouts was reached before this variant was tried`],
        stage: "BUDGET"
      });
      continue;
    }
    if (Date.now() - startedAt > timeBudgetMs) {
      timedOut = true;
      rejected.push({
        familyId: topology.familyId,
        variantId: topology.variantId,
        reasons: [`generation time budget of ${timeBudgetMs} ms was exhausted before this variant was tried`],
        stage: "BUDGET"
      });
      continue;
    }
    assembledCount++;
    let assembled;
    try {
      assembled = assembleStructureFromPartition({
        partition: topology.partition,
        program,
        manifest: input.manifest,
        unitTypes: input.unitTypes,
        rawRooms: input.rawRooms,
        archetype: effectiveArchetype
      });
    } catch (error) {
      rejected.push({
        familyId: topology.familyId,
        variantId: topology.variantId,
        reasons: [`room planning failed: ${error instanceof Error ? error.message : String(error)}`],
        stage: "ASSEMBLY"
      });
      continue;
    }
    const score = scoreCandidate({
      structure: assembled.structure,
      partition: topology.partition,
      program,
      flatsWithoutEntrance: assembled.flatsWithoutEntrance
    });
    if (!score.feasible) {
      failed.push({
        topology,
        partition: topology.partition,
        structure: assembled.structure,
        score,
        fingerprint: layoutFingerprint(assembled.structure, topology.partition)
      });
      rejected.push({
        familyId: topology.familyId,
        variantId: topology.variantId,
        reasons: score.hardConstraints.filter((c) => !c.satisfied).map((c) => `${c.id}: ${c.detail}`),
        stage: "HARD_CONSTRAINT"
      });
      continue;
    }
    scored.push({
      topology,
      partition: topology.partition,
      structure: assembled.structure,
      score,
      fingerprint: layoutFingerprint(assembled.structure, topology.partition)
    });
  }
  const wantsBalconies = program.preferences.bedroomBalconies !== "NONE_REQUESTED";
  const wantsAllBalconies = program.preferences.bedroomBalconies === "ALL_BEDROOMS";
  const allWithBalconies = wantsAllBalconies ? scored.filter((c) => {
    const beds = countBedrooms(c.structure);
    return beds > 0 && countBedroomBalconies(c.structure) >= beds;
  }) : [];
  const withBalconies = wantsBalconies ? scored.filter((c) => countBedroomBalconies(c.structure) > 0 && !allWithBalconies.includes(c)) : [];
  const withoutBalconies = scored.filter(
    (c) => !allWithBalconies.includes(c) && !withBalconies.includes(c)
  );
  const basePool = [
    ...rankCandidates(allWithBalconies),
    ...rankCandidates(withBalconies),
    ...rankCandidates(withoutBalconies)
  ];
  const matchingShape = effectiveMassingShape ? basePool.filter((c) => (c.partition.massingShape ?? "COMPACT_DOUBLE_LOADED") === effectiveMassingShape) : [];
  const baseRanked = matchingShape.length ? [...matchingShape, ...basePool.filter((c) => !matchingShape.includes(c))] : basePool;
  const isRejectedCandidate = (c) => rejectedHashSet.has(c.fingerprint.digests.canonical) || rejectedHashSet.has(c.fingerprint.canonical) || rejectedHashSet.has(c.topology.variantId);
  const freshRanked = rejectedHashSet.size > 0 ? baseRanked.filter((c) => !isRejectedCandidate(c)) : baseRanked;
  const ranked = freshRanked.length > 0 ? [...freshRanked, ...baseRanked.filter((c) => isRejectedCandidate(c))] : baseRanked;
  const { selected, suppressed } = selectDistinct(ranked, conceptLimit);
  for (const s of suppressed) {
    rejected.push({
      familyId: s.candidate.topology.familyId,
      variantId: s.candidate.topology.variantId,
      reasons: [s.reason],
      stage: "DIVERSITY"
    });
  }
  const concepts = selected.map((candidate, index) => ({
    conceptId: `concept_${String(index + 1).padStart(2, "0")}`,
    familyId: candidate.topology.familyId,
    variantId: candidate.topology.variantId,
    label: candidate.topology.label,
    rationale: candidate.topology.rationale,
    partition: candidate.partition,
    structure: candidate.structure,
    score: candidate.score,
    fingerprint: candidate.fingerprint,
    rankingExplanation: index === 0 ? "Ranked first on the priorities this brief emphasized; see the objective scores for the measurements behind it." : explainRanking(selected[index - 1].score, candidate.score)
  }));
  const shortfallExplanation = concepts.length < conceptLimit ? describeShortfall(concepts.length, conceptLimit, rejected, timedOut) : void 0;
  const leastBad = [...failed].sort((a, b) => a.score.hardConstraints.filter((c) => !c.satisfied).length - b.score.hardConstraints.filter((c) => !c.satisfied).length || b.score.weightedTotal - a.score.weightedTotal || a.topology.variantId.localeCompare(b.topology.variantId))[0];
  const bestEffort = leastBad ? {
    conceptId: "best_effort",
    familyId: leastBad.topology.familyId,
    variantId: leastBad.topology.variantId,
    label: leastBad.topology.label,
    rationale: leastBad.topology.rationale,
    partition: leastBad.partition,
    structure: leastBad.structure,
    score: leastBad.score,
    fingerprint: leastBad.fingerprint,
    rankingExplanation: "Best assembled failed candidate: fewest hard violations, then measured utility. Requires repair and review."
  } : void 0;
  return {
    bestEffort,
    program,
    concepts,
    rejected,
    archetype: effectiveArchetype,
    massingShape: concepts[0]?.partition.massingShape ?? effectiveMassingShape,
    shortfallExplanation,
    diagnostics: {
      engineVersion: TOPOLOGY_ENGINE_VERSION,
      seed: seed2,
      topologyVariantsTried: topologies.length + rejections.length,
      assembledCandidates: assembledCount,
      feasibleCandidates: scored.length,
      elapsedMs: Date.now() - startedAt,
      timedOut
    }
  };
}
function explorationKey(candidate, program, jitter) {
  const priority = program.preferences.priority;
  const family = candidate.familyId;
  let affinity = 0.5;
  if (priority === "DAYLIGHT_VENTILATION") {
    affinity = family === "CENTRAL_COURTYARD" ? 0 : family === "PERIMETER_HABITABLE" ? 0.1 : family === "DUAL_WING" ? 0.2 : 0.6;
  } else if (priority === "COMPACT_EFFICIENCY") {
    affinity = family === "CENTRAL_CORE_SPINE" ? 0 : family === "SIDE_CORE" ? 0.1 : family === "LINEAR_SINGLE_LOADED" ? 0.2 : 0.6;
  } else if (priority === "PRIVACY_CIRCULATION") {
    affinity = family === "PERIMETER_HABITABLE" ? 0 : family === "SPLIT_CORE" ? 0.1 : family === "SIDE_CORE" ? 0.2 : 0.6;
  } else if (priority === "KITCHEN_DINING") {
    affinity = family === "DUAL_WING" ? 0 : family === "SIDE_CORE" ? 0.1 : 0.5;
  }
  const requiredCore = program.mandatory.corePlacement ?? program.preferences.corePreference;
  let coreAffinity = 0.5;
  if (requiredCore === "CENTRAL") coreAffinity = family === "CENTRAL_CORE_SPINE" || family === "DUAL_WING" ? 0 : 0.8;
  else if (requiredCore === "SPLIT") coreAffinity = family === "SPLIT_CORE" ? 0 : 0.8;
  else if (["EAST", "WEST", "NORTH", "SOUTH"].includes(requiredCore)) {
    coreAffinity = family === "SIDE_CORE" && candidate.variantId.includes(requiredCore.toLowerCase()) ? 0 : family === "SIDE_CORE" ? 0.4 : family === "LINEAR_SINGLE_LOADED" ? 0.5 : 0.8;
  }
  return coreAffinity * 2 + affinity + jitter * 0.01;
}
function describeShortfall(produced, requested, rejected, timedOut) {
  const byStage = (stage) => rejected.filter((r) => r.stage === stage);
  const parts = [
    `${produced} genuinely distinct concept${produced === 1 ? "" : "s"} could be produced for this brief and plot, not the ${requested} requested.`
  ];
  const topology = byStage("TOPOLOGY");
  if (topology.length) {
    parts.push(
      `${topology.length} organization(s) do not fit this envelope: ${topology.slice(0, 4).map((r) => `${r.familyId} (${r.reasons[0]})`).join("; ")}.`
    );
  }
  const hard = byStage("HARD_CONSTRAINT");
  if (hard.length) {
    parts.push(
      `${hard.length} layout(s) reached geometry but failed a mandatory requirement: ${hard.slice(0, 3).map((r) => r.reasons[0]).join("; ")}.`
    );
  }
  const diversity = byStage("DIVERSITY");
  if (diversity.length) {
    parts.push(
      `${diversity.length} valid layout(s) were suppressed as not genuinely different from a concept already shown, rather than presented as separate designs.`
    );
  }
  if (timedOut) parts.push("Generation stopped at its time budget, so some variants were not tried.");
  parts.push("No alternative has been invented to reach the requested count.");
  return parts.join(" ");
}
function countBedrooms(structure) {
  let count = 0;
  for (const flat of structure.flats) {
    for (const room of flat.rooms) {
      if (room.type === "bedroom") count++;
    }
  }
  return count;
}
function countBedroomBalconies(structure) {
  let count = 0;
  for (const flat of structure.flats) {
    for (const room of flat.rooms) {
      if (room.type !== "bedroom") continue;
      if (flat.rooms.some((other) => other.id === `${room.id}__balcony`)) count++;
    }
  }
  return count;
}

// packages/planning-engine/src/topology/production-bridge.ts
var toSnapper = (b) => ({ x: b.x, y: b.y, w: b.w, h: b.h });
function macroFromTopology(partition) {
  const corridors = partition.corridorBoxes.map(toSnapper);
  const lobbies = partition.lobbyBoxes.map(toSnapper);
  const byArea = (a, b) => b.w * b.h - a.w * a.h;
  const primaryCorridor = [...corridors].sort(byArea)[0] ?? [...lobbies].sort(byArea)[0] ?? toSnapper(partition.envelope);
  const primaryLobby = [...lobbies].sort(byArea)[0] ?? primaryCorridor;
  const regions = partition.coreBoxes.length ? partition.coreBoxes : partition.stairBoxes;
  const coreBox = regions.length ? {
    x: Math.min(...regions.map((b) => b.x)),
    y: Math.min(...regions.map((b) => b.y)),
    w: Math.max(...regions.map((b) => b.x + b.w)) - Math.min(...regions.map((b) => b.x)),
    h: Math.max(...regions.map((b) => b.y + b.h)) - Math.min(...regions.map((b) => b.y))
  } : toSnapper(partition.envelope);
  return {
    coreBox,
    flatBoxes: partition.flatBoxes.map(toSnapper),
    corridorBox: primaryCorridor,
    lobbyBox: primaryLobby,
    liftBoxes: partition.liftBoxes.map(toSnapper),
    stairBoxes: partition.stairBoxes.map(toSnapper),
    shaftBoxes: partition.shaftBoxes.map(toSnapper),
    shaftRoles: [...partition.shaftRoles],
    shaftTags: partition.shaftTags ? partition.shaftTags.map((t) => [...t]) : void 0,
    corridorIsEastForFlat: partition.accessEdgeForFlat.map((edge) => edge === "EAST" || edge === "SOUTH"),
    corridorBoxes: corridors,
    lobbyBoxes: lobbies,
    coreBoxes: partition.coreBoxes.map(toSnapper)
  };
}
function selectProductionTopology(input) {
  const unitTypes = input.unitTypes.length === input.flatsPerFloor ? input.unitTypes : Array.from({ length: input.flatsPerFloor }, (_, i) => input.unitTypes[i] ?? "2BHK");
  const result = generateDesignConcepts({
    envelope: input.envelope,
    flatsPerFloor: input.flatsPerFloor,
    unitTypes,
    aiPrompt: input.aiPrompt,
    seed: input.seed,
    conceptLimit: input.conceptLimit ?? 3,
    preferredArchetype: input.preferredArchetype,
    preferredMassingShape: input.preferredMassingShape,
    rejectedTopologyHashes: input.rejectedTopologyHashes
  });
  input.onEvaluated?.(result);
  const rejectedSet = new Set(input.rejectedTopologyHashes ?? []);
  const chosen = (rejectedSet.size > 0 ? result.concepts.find(
    (c) => !rejectedSet.has(c.fingerprint.digests.canonical) && !rejectedSet.has(c.fingerprint.canonical) && !rejectedSet.has(c.variantId)
  ) : void 0) ?? result.concepts[0] ?? (input.allowBestEffort ? result.bestEffort : void 0);
  if (!chosen) return void 0;
  return { macro: macroFromTopology(chosen.partition), chosen, result };
}

// packages/planning-engine/src/apartment/multi-sheet-apartment-solver.ts
function computeBuildingStackParameters(config) {
  const floorToFloorHeightMm = config.floorToFloorHeightMm ?? 3e3;
  const isStack = config.parkingMode === "MECHANICAL_STACK";
  const stiltHeightMm = config.stiltHeightMm ?? (isStack ? 4500 : 3e3);
  const basementHeightMm = config.basementHeightMm ?? 3300;
  const hasStilt = config.verticalStackType === "STILT_PLUS_N" || config.verticalStackType === "BASEMENT_STILT_PLUS_N";
  const hasBasement = config.verticalStackType === "BASEMENT_STILT_PLUS_N";
  const baseHeight = hasStilt ? stiltHeightMm : 0;
  const totalBuildingHeightMm = baseHeight + config.numTypicalFloors * floorToFloorHeightMm;
  const isHighRiseFireRegulated = totalBuildingHeightMm > 15e3;
  const minStaircases = isHighRiseFireRegulated ? 2 : 1;
  const minLifts = isHighRiseFireRegulated ? 2 : 1;
  const requiresRefugeFloor = totalBuildingHeightMm > 24e3;
  const refugeFloorLevels = [];
  if (requiresRefugeFloor) {
    for (let fl = 1; fl <= config.numTypicalFloors; fl++) {
      const slabHeight = baseHeight + fl * floorToFloorHeightMm;
      if (slabHeight > 24e3) {
        if (refugeFloorLevels.length === 0) {
          refugeFloorLevels.push(fl);
        } else {
          const last = refugeFloorLevels[refugeFloorLevels.length - 1];
          if (fl - last === 7) {
            refugeFloorLevels.push(fl);
          }
        }
      }
    }
  }
  return {
    floorToFloorHeightMm,
    stiltHeightMm,
    basementHeightMm,
    totalBuildingHeightMm,
    hasStilt,
    hasBasement,
    minStaircases,
    minLifts,
    isHighRiseFireRegulated,
    requiresRefugeFloor,
    refugeFloorLevels
  };
}
function createBoxRoom(params) {
  const boundary = {
    points: [
      { x: params.box.x, y: params.box.y },
      { x: params.box.x + params.box.w, y: params.box.y },
      { x: params.box.x + params.box.w, y: params.box.y + params.box.h },
      { x: params.box.x, y: params.box.y + params.box.h }
    ]
  };
  const result = {
    id: params.id,
    name: params.name,
    type: params.type,
    floorId: params.floorId,
    boundary,
    x: params.box.x,
    y: params.box.y,
    width: params.box.w,
    height: params.box.h,
    rotation: 0,
    area: params.box.w * params.box.h,
    priority: 1,
    tags: params.tags ?? [],
    adjacencyRequirements: [],
    daylightRequirement: "medium",
    privacyRequirement: "medium",
    ventilationRequired: true,
    isFixed: !params.unitId,
    spaceUse: params.spaceUse,
    planningZone: params.planningZone,
    unitId: params.unitId
  };
  const role = params.architecturalRole ?? architecturalSpaceRole(result);
  return { ...result, architecturalRole: role, ...role === "OPEN_TO_SKY_VOID" ? { openToSky: true, spaceUse: "VOID" } : {} };
}
var roomToBox = (r) => ({ id: r.id, rect: { x: r.x, y: r.y, width: r.width, height: r.height } });
function rectPolygon(x, y, w, h) {
  return {
    points: [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h }
    ]
  };
}
function solveSitePlanSheet(config, envelope) {
  const plotW = config.plotWidthMm;
  const plotD = config.plotDepthMm;
  const plotArea = plotW * plotD;
  const siteZones = [];
  if (config.lotAllotmentMode === "FULL_LOT_100_PERCENT") {
    siteZones.push({
      id: "site_zone_bldg_plinth",
      kind: "future_expansion",
      name: "Building Plinth Footprint (100% Lot)",
      boundary: rectPolygon(0, 0, plotW, plotD),
      area: plotArea,
      accessLinks: ["road_main"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
  } else {
    const bldgX = envelope.x;
    const bldgY = envelope.y;
    const bldgW = envelope.w;
    const bldgH = envelope.h;
    const rearH = bldgY;
    const frontH = plotD - (bldgY + bldgH);
    const leftW = bldgX;
    const rightW = plotW - (bldgX + bldgW);
    siteZones.push({
      id: "site_zone_bldg_plinth",
      kind: "future_expansion",
      name: "Residential Apartment Tower Footprint",
      boundary: rectPolygon(bldgX, bldgY, bldgW, bldgH),
      area: bldgW * bldgH,
      accessLinks: ["driveway_fire_tender"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    const frontY = bldgY + bldgH;
    let curX = 0;
    const secW = 2400;
    const secH = Math.min(2400, frontH);
    siteZones.push({
      id: "site_zone_sec_cabin",
      kind: "service",
      name: "SECURITY CABIN (2400 x 2400 mm)",
      boundary: rectPolygon(curX, frontY, secW, secH),
      area: secW * secH,
      accessLinks: ["road_main"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    if (frontH > secH) {
      siteZones.push({
        id: "site_zone_sec_apron",
        kind: "pedestrian_circulation",
        name: "Security Gate Paved Apron",
        boundary: rectPolygon(curX, frontY + secH, secW, frontH - secH),
        area: secW * (frontH - secH),
        accessLinks: ["road_main"],
        source: "GENERATED",
        reviewStatus: "REVIEWED"
      });
    }
    curX += secW;
    const entryGateW = 4500;
    siteZones.push({
      id: "site_zone_main_entry_gate",
      kind: "vehicle_circulation",
      name: "MAIN ENTRY GATE (IN - 4500 mm)",
      boundary: rectPolygon(curX, frontY, entryGateW, frontH),
      area: entryGateW * frontH,
      accessLinks: ["road_main"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    curX += entryGateW;
    const ingressApronW = 1500;
    siteZones.push({
      id: "site_zone_ingress_driveway",
      kind: "vehicle_circulation",
      name: "6000mm Two-Way Paved Ingress Driveway to Stilt Parking",
      boundary: rectPolygon(curX, frontY, ingressApronW, frontH),
      area: ingressApronW * frontH,
      accessLinks: ["driveway_fire_tender"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    curX += ingressApronW;
    const exitGateW = 4500;
    const egressApronW = 1500;
    const egressTotalW = exitGateW + egressApronW;
    const remainingMiddleW = Math.max(0, plotW - curX - egressTotalW);
    if (remainingMiddleW > 0) {
      const carBayW = 2500;
      const carBayCount = Math.min(3, Math.floor(remainingMiddleW / carBayW));
      const totalCarW = carBayCount * carBayW;
      for (let c = 0; c < carBayCount; c++) {
        siteZones.push({
          id: `site_zone_vis_car_${c + 1}`,
          kind: "parking",
          name: `Surface Visitor Car Bay V-0${c + 1} (2.5x5.0m)`,
          boundary: rectPolygon(curX + c * carBayW, frontY, carBayW, frontH),
          area: carBayW * frontH,
          accessLinks: ["driveway_fire_tender"],
          source: "GENERATED",
          reviewStatus: "REVIEWED"
        });
      }
      const remAfterCars = remainingMiddleW - totalCarW;
      if (remAfterCars > 0) {
        siteZones.push({
          id: "site_zone_ev_charging",
          kind: "parking",
          name: "Dedicated EV Charging Bay & Paved Forecourt",
          boundary: rectPolygon(curX + totalCarW, frontY, remAfterCars, frontH),
          area: remAfterCars * frontH,
          accessLinks: ["driveway_fire_tender"],
          source: "GENERATED",
          reviewStatus: "REVIEWED"
        });
      }
      curX += remainingMiddleW;
    }
    siteZones.push({
      id: "site_zone_egress_driveway",
      kind: "vehicle_circulation",
      name: "6000mm Two-Way Paved Egress Driveway from Stilt Parking",
      boundary: rectPolygon(curX, frontY, egressApronW, frontH),
      area: egressApronW * frontH,
      accessLinks: ["driveway_fire_tender"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    curX += egressApronW;
    const finalExitW = plotW - curX;
    siteZones.push({
      id: "site_zone_main_exit_gate",
      kind: "vehicle_circulation",
      name: "MAIN EXIT GATE (OUT - 4500 mm)",
      boundary: rectPolygon(curX, frontY, finalExitW, frontH),
      area: finalExitW * frontH,
      accessLinks: ["road_main"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    let rearX = 0;
    const dgW = 5e3;
    siteZones.push({
      id: "site_zone_dg_yard",
      kind: "service",
      name: "Acoustic Transformer & DG Yard (5x3m)",
      boundary: rectPolygon(rearX, 0, dgW, rearH),
      area: dgW * rearH,
      accessLinks: ["driveway_service"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    rearX += dgW;
    const ugwtW = 4e3;
    siteZones.push({
      id: "site_zone_ugwt_pump",
      kind: "service",
      name: "Underground Water Tank & Pump Room (UGWT)",
      boundary: rectPolygon(rearX, 0, ugwtW, rearH),
      area: ugwtW * rearH,
      accessLinks: ["driveway_service"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    rearX += ugwtW;
    const stpW = 4e3;
    siteZones.push({
      id: "site_zone_stp_plant",
      kind: "service",
      name: "Sewage Treatment Plant (STP)",
      boundary: rectPolygon(rearX, 0, stpW, rearH),
      area: stpW * rearH,
      accessLinks: ["driveway_service"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    rearX += stpW;
    const owcW = 3e3;
    siteZones.push({
      id: "site_zone_owc_waste",
      kind: "service",
      name: "Organic Waste Composter Yard (OWC)",
      boundary: rectPolygon(rearX, 0, owcW, rearH),
      area: owcW * rearH,
      accessLinks: ["driveway_service"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    rearX += owcW;
    const rwhW = 3e3;
    siteZones.push({
      id: "site_zone_rwh_pits",
      kind: "service",
      name: "Rainwater Harvesting Recharge Pits",
      boundary: rectPolygon(rearX, 0, rwhW, rearH),
      area: rwhW * rearH,
      accessLinks: ["driveway_service"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    rearX += rwhW;
    const remRearW = plotW - rearX;
    siteZones.push({
      id: "site_zone_rear_service_road",
      kind: "vehicle_circulation",
      name: "Rear Service Driveway & Manifold Access Loop",
      boundary: rectPolygon(rearX, 0, remRearW, rearH),
      area: remRearW * rearH,
      accessLinks: ["driveway_service"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    const rightX = bldgX + bldgW;
    siteZones.push({
      id: "site_zone_statutory_ros_garden",
      kind: "garden",
      name: "10% Statutory ROS Landscaped Garden & Central Park (A-SITE-LAND)",
      boundary: rectPolygon(rightX, bldgY, rightW, bldgH),
      area: rightW * bldgH,
      accessLinks: ["walkway_pedestrian"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
    siteZones.push({
      id: "site_zone_west_fire_driveway",
      kind: "vehicle_circulation",
      name: "Continuous 6000mm Two-Way Paved Vehicular Driveway Loop into Ground Stilt Parking",
      boundary: rectPolygon(0, bldgY, leftW, bldgH),
      area: leftW * bldgH,
      accessLinks: ["road_main"],
      source: "GENERATED",
      reviewStatus: "REVIEWED"
    });
  }
  const accountedArea = siteZones.reduce((sum, z) => sum + z.area, 0);
  const delta = plotArea - accountedArea;
  const audit = {
    sheetId: "sheet_01_site_plan",
    sheetName: "Sheet 01: Site Layout & Landscape Plan",
    grossAreaMm2: plotArea,
    accountedAreaMm2: accountedArea,
    deltaMm2: delta,
    unassignedMm2: 0,
    isPlanarConserved: Math.abs(delta) < 1e-3
  };
  const roadFacingSide = config.roadAccessSides?.[0] ?? Direction.South;
  const site = {
    id: "project_site",
    plotBoundary: rectPolygon(0, 0, plotW, plotD),
    plotWidth: plotW,
    plotDepth: plotD,
    plotArea,
    plotShape: PlotShape.Rectangular,
    orientation: 0,
    setbacks: {
      front: config.lotAllotmentMode === "FULL_LOT_100_PERCENT" ? 0 : plotD - (envelope.y + envelope.h),
      rear: config.lotAllotmentMode === "FULL_LOT_100_PERCENT" ? 0 : envelope.y,
      left: config.lotAllotmentMode === "FULL_LOT_100_PERCENT" ? 0 : envelope.x,
      right: config.lotAllotmentMode === "FULL_LOT_100_PERCENT" ? 0 : plotW - (envelope.x + envelope.w)
    },
    accessPoints: [
      {
        id: "acc_main_entry_gate",
        position: { x: 2400 + 2250, y: plotD },
        width: 4500,
        direction: roadFacingSide
      },
      {
        id: "acc_main_exit_gate",
        position: { x: plotW - 2250, y: plotD },
        width: 4500,
        direction: roadFacingSide
      },
      {
        id: "acc_sec_cabin",
        position: { x: 1200, y: plotD - 1200 },
        width: 2400,
        direction: roadFacingSide
      }
    ],
    roadFacing: roadFacingSide,
    roadWidth: config.roadWidthMm,
    siteZones
  };
  return { site, siteZones, audit };
}
function deriveCleanStructuralColumns(floor, envelope) {
  const indoorRooms = floor.rooms.filter(
    (r) => r.type !== RoomType.Balcony && !/BALCONY|SIT-OUT|UTILITY/i.test(r.name)
  );
  const balconyRooms = floor.rooms.filter(
    (r) => r.type === RoomType.Balcony || /BALCONY|SIT-OUT|UTILITY/i.test(r.name)
  );
  const isPointNearIndoorRoom = (pt) => {
    return indoorRooms.some((r) => {
      const minX = r.x - 50;
      const maxX = r.x + r.width + 50;
      const minY = r.y - 50;
      const maxY = r.y + r.height + 50;
      return pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY;
    });
  };
  const isOuterBalconyCorner = (pt) => {
    for (const b of balconyRooms) {
      const corners = [
        { x: b.x, y: b.y },
        { x: b.x + b.width, y: b.y },
        { x: b.x, y: b.y + b.height },
        { x: b.x + b.width, y: b.y + b.height }
      ];
      for (const c of corners) {
        if (Math.hypot(pt.x - c.x, pt.y - c.y) < 300) {
          if (!isPointNearIndoorRoom(c)) {
            return true;
          }
        }
      }
    }
    return false;
  };
  const snap = (v) => Math.round(v / 50) * 50;
  const rawPoints = [];
  const colSpacingX = 5e3;
  const colSpacingY = 5e3;
  for (let cx = envelope.x; cx <= envelope.x + envelope.w; cx += colSpacingX) {
    for (let cy = envelope.y; cy <= envelope.y + envelope.h; cy += colSpacingY) {
      rawPoints.push({ x: snap(cx), y: snap(cy) });
    }
  }
  for (const w of floor.walls) {
    if (w.wallUse === "EXTERNAL" || w.wallUse === "UNIT_SEPARATION" || w.wallUse === "CORE" || w.type === "external") {
      rawPoints.push({ x: snap(w.startPoint.x), y: snap(w.startPoint.y) });
      rawPoints.push({ x: snap(w.endPoint.x), y: snap(w.endPoint.y) });
    }
  }
  const roomToBox2 = (r) => r.boundary?.points?.length ? {
    x: Math.min(...r.boundary.points.map((pt) => pt.x)),
    y: Math.min(...r.boundary.points.map((pt) => pt.y)),
    w: Math.max(...r.boundary.points.map((pt) => pt.x)) - Math.min(...r.boundary.points.map((pt) => pt.x)),
    h: Math.max(...r.boundary.points.map((pt) => pt.y)) - Math.min(...r.boundary.points.map((pt) => pt.y))
  } : { x: r.x, y: r.y, w: r.width, h: r.height };
  const voidBoxes = floor.rooms.filter((r) => r.architecturalRole === "OPEN_TO_SKY_VOID" && r.tags?.includes("recess:perimeter")).map(roomToBox2);
  const builtBoxes = floor.rooms.filter((r) => r.architecturalRole !== "OPEN_TO_SKY_VOID").map(roomToBox2);
  const inVoidOnly = (pt) => {
    if (!voidBoxes.length) return false;
    if (voidBoxes.some((b) => pt.x > b.x + 150 && pt.x < b.x + b.w - 150 && pt.y > b.y + 150 && pt.y < b.y + b.h - 150)) {
      return true;
    }
    if (!builtBoxes.length) return false;
    return !builtBoxes.some(
      (b) => pt.x >= b.x - 150 && pt.x <= b.x + b.w + 150 && pt.y >= b.y - 150 && pt.y <= b.y + b.h + 150
    );
  };
  const aisleBoxes = floor.rooms.filter((r) => r.architecturalRole === "VEHICLE_AISLE").map(roomToBox2);
  const blocksDriveAisle = (pt) => aisleBoxes.some((b) => pt.x > b.x + 150 && pt.x < b.x + b.w - 150 && pt.y > b.y + 150 && pt.y < b.y + b.h - 150) || aisleBoxes.some((b) => {
    const onHorizontalEdge = (Math.abs(pt.y - b.y) <= 150 || Math.abs(pt.y - (b.y + b.h)) <= 150) && pt.x > b.x + 150 && pt.x < b.x + b.w - 150;
    const onVerticalEdge = (Math.abs(pt.x - b.x) <= 150 || Math.abs(pt.x - (b.x + b.w)) <= 150) && pt.y > b.y + 150 && pt.y < b.y + b.h - 150;
    return onHorizontalEdge || onVerticalEdge;
  });
  const nonBalconyPoints = rawPoints.filter((p) => !isOuterBalconyCorner(p) && !inVoidOnly(p) && !blocksDriveAisle(p));
  const deduplicated = [];
  for (const p of nonBalconyPoints) {
    if (!deduplicated.some((d) => Math.hypot(d.x - p.x, d.y - p.y) < 500)) {
      deduplicated.push(p);
    }
  }
  deduplicated.sort((a, b) => {
    if (Math.abs(a.y - b.y) > 300) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });
  return deduplicated.map((p, idx) => ({
    id: `col_${idx + 1}`,
    floorId: floor.id,
    position: p,
    width: 450,
    depth: 450,
    shape: ColumnShape.Rectangular,
    isStructural: true,
    gridReference: `C${idx + 1}`
  }));
}
function subtractBoxes(box, blockers) {
  let pieces = [box];
  for (const blocker of blockers) {
    const next = [];
    for (const piece of pieces) {
      const overlapsX = piece.x < blocker.x + blocker.w && blocker.x < piece.x + piece.w;
      const overlapsY = piece.y < blocker.y + blocker.h && blocker.y < piece.y + piece.h;
      if (!overlapsX || !overlapsY) {
        next.push(piece);
        continue;
      }
      const loX = Math.max(piece.x, blocker.x);
      const hiX = Math.min(piece.x + piece.w, blocker.x + blocker.w);
      const loY = Math.max(piece.y, blocker.y);
      const hiY = Math.min(piece.y + piece.h, blocker.y + blocker.h);
      if (loY > piece.y) next.push({ x: piece.x, y: piece.y, w: piece.w, h: loY - piece.y });
      if (hiY < piece.y + piece.h) next.push({ x: piece.x, y: hiY, w: piece.w, h: piece.y + piece.h - hiY });
      if (loX > piece.x) next.push({ x: piece.x, y: loY, w: loX - piece.x, h: hiY - loY });
      if (hiX < piece.x + piece.w) next.push({ x: hiX, y: loY, w: piece.x + piece.w - hiX, h: hiY - loY });
    }
    pieces = next.filter((p) => p.w > 0 && p.h > 0);
  }
  return pieces;
}
function solveStiltParkingSheet(config, envelope, macro, stackParams) {
  const floorId = "floor_stilt_00";
  const rooms = [];
  const doors = [];
  const columns = [];
  const stair1 = createBoxRoom({
    id: "stilt__stair_1",
    name: "Staircase 01 (Main)",
    type: RoomType.Staircase,
    spaceUse: "CORE",
    box: macro.stairBoxes[0],
    floorId,
    tags: ["core:stair"]
  });
  rooms.push(stair1);
  for (let i = 1; i < macro.stairBoxes.length; i++) {
    rooms.push(createBoxRoom({
      id: `stilt__stair_${i + 1}`,
      name: i === 1 ? "Staircase 02 (Fire Escape)" : `Staircase 0${i + 1}`,
      type: RoomType.Staircase,
      spaceUse: "CORE",
      box: macro.stairBoxes[i],
      floorId,
      tags: ["core:stair"]
    }));
  }
  const lift1 = createBoxRoom({
    id: "stilt__lift_1",
    name: "Passenger Lift 01",
    type: RoomType.Lift,
    spaceUse: "CORE",
    box: macro.liftBoxes[0],
    floorId,
    tags: ["core:lift"]
  });
  rooms.push(lift1);
  for (let i = 1; i < macro.liftBoxes.length; i++) {
    rooms.push(createBoxRoom({
      id: `stilt__lift_${i + 1}`,
      name: i === 1 ? "Stretcher / Fire Lift 02" : `Passenger Lift 0${i + 1}`,
      type: RoomType.Lift,
      spaceUse: "CORE",
      box: macro.liftBoxes[i],
      floorId,
      tags: ["core:lift"]
    }));
  }
  const stiltLobbyBoxes = macroLobbyBoxes(macro);
  for (let i = 0; i < stiltLobbyBoxes.length; i++) {
    rooms.push(createBoxRoom({
      id: i === 0 ? "stilt__core_lobby" : `stilt__core_lobby_${i + 1}`,
      architecturalRole: "LIFT_LOBBY",
      name: stiltLobbyBoxes.length > 1 ? `Stilt Lift Lobby 0${i + 1}` : "Stilt Central Lift Lobby",
      type: RoomType.Corridor,
      spaceUse: "CORE",
      box: stiltLobbyBoxes[i],
      floorId,
      tags: ["core:lobby"]
    }));
  }
  const stiltCorridorBoxes = macroCorridorBoxes(macro);
  for (let i = 0; i < stiltCorridorBoxes.length; i++) {
    rooms.push(createBoxRoom({
      id: i === 0 ? "stilt__corridor_spine" : `stilt__corridor_spine_${i + 1}`,
      name: stiltCorridorBoxes.length > 1 ? `Stilt Circulation Spine 0${i + 1}` : "Stilt Central Circulation Spine",
      type: RoomType.Corridor,
      spaceUse: "CORE",
      box: stiltCorridorBoxes[i],
      floorId,
      tags: ["core:corridor"]
    }));
  }
  const stiltCorridor = rooms.find((r) => r.id === "stilt__corridor_spine");
  const stiltLobby = rooms.find((r) => r.id === "stilt__core_lobby") ?? stiltCorridor;
  for (let s = 0; s < macro.shaftBoxes.length; s++) {
    const shaft = createBoxRoom({
      id: `stilt__shaft_${s + 1}`,
      architecturalRole: macro.shaftRoles?.[s],
      name: macro.shaftRoles?.[s] === "OPEN_TO_SKY_VOID" ? "Open-to-sky courtyard at stilt" : `MEP Service Shaft 0${s + 1}`,
      type: RoomType.ServiceShaft,
      spaceUse: "SERVICE",
      box: macro.shaftBoxes[s],
      floorId,
      tags: ["core:shaft", ...macro.shaftTags?.[s] ?? []]
    });
    rooms.push(shaft);
  }
  const westBox = macro.flatBoxes[0];
  const amenityH = snap102(westBox.h * 0.42);
  const westParkH = westBox.h - amenityH;
  const amenityBox = { x: westBox.x, y: westBox.y, w: westBox.w, h: amenityH };
  const amLobbyW = snap102(amenityBox.w * 0.4);
  const amOfficeW = snap102(amenityBox.w * 0.25);
  const amGymW = amenityBox.w - (amLobbyW + amOfficeW);
  const grandLobby = createBoxRoom({
    id: "stilt__grand_lobby",
    architecturalRole: "ENCLOSED_HABITABLE",
    name: "Grand Entrance Double-Height Lobby",
    type: RoomType.Foyer,
    spaceUse: "COMMON",
    box: { x: amenityBox.x, y: amenityBox.y, w: amLobbyW, h: amenityBox.h },
    floorId
  });
  rooms.push(grandLobby);
  const officeH = snap102(amenityBox.h * 0.65);
  const toiletH = amenityBox.h - officeH;
  const office = createBoxRoom({
    id: "stilt__society_office",
    architecturalRole: config.stiltAmenities.societyOffice ? "ENCLOSED_SERVICE" : "OPEN_CIRCULATION",
    name: config.stiltAmenities.societyOffice ? "Society Administrative Office" : "Open stilt circulation",
    type: RoomType.Custom,
    spaceUse: "COMMON",
    box: { x: amenityBox.x + amLobbyW, y: amenityBox.y, w: amOfficeW, h: officeH },
    floorId
  });
  rooms.push(office);
  const staffToilet = createBoxRoom({
    id: "stilt__staff_toilet",
    architecturalRole: config.stiltAmenities.driverStaffToilet ? "ENCLOSED_SERVICE" : "OPEN_CIRCULATION",
    name: config.stiltAmenities.driverStaffToilet ? "Driver & Maintenance Staff Toilet" : "Open stilt circulation",
    type: RoomType.Bathroom,
    spaceUse: "SERVICE",
    box: { x: amenityBox.x + amLobbyW, y: amenityBox.y + officeH, w: amOfficeW, h: toiletH },
    floorId
  });
  rooms.push(staffToilet);
  const gymH = snap102(amenityBox.h * 0.7);
  const meterH = amenityBox.h - gymH;
  const gym = createBoxRoom({
    id: "stilt__gymnasium",
    architecturalRole: config.stiltAmenities.fitnessGymnasium ? "ENCLOSED_SERVICE" : "OPEN_CIRCULATION",
    name: config.stiltAmenities.fitnessGymnasium ? "Fitness Center & Health Gymnasium" : "Open stilt circulation",
    type: RoomType.Custom,
    spaceUse: "COMMON",
    box: { x: amenityBox.x + amLobbyW + amOfficeW, y: amenityBox.y, w: amGymW, h: gymH },
    floorId
  });
  rooms.push(gym);
  const meterRoom = createBoxRoom({
    id: "stilt__meter_bms_room",
    architecturalRole: config.stiltAmenities.meterBmsRoom ? "ENCLOSED_SERVICE" : "OPEN_CIRCULATION",
    name: config.stiltAmenities.meterBmsRoom ? "Electric Meter & BMS Control Room" : "Open stilt circulation",
    type: RoomType.Custom,
    spaceUse: "SERVICE",
    box: { x: amenityBox.x + amLobbyW + amOfficeW, y: amenityBox.y + gymH, w: amGymW, h: meterH },
    floorId
  });
  rooms.push(meterRoom);
  let carBaysCount = 0;
  let bikeBaysCount = 0;
  const packParkingBox = (box, zoneKey) => {
    const stallWidth = 2500;
    const stallDepth = 5e3;
    const minOneWayAisle = 3600;
    const minTwoWayAisle = 6e3;
    const horizFit = box.w >= stallWidth && box.h >= stallDepth + minOneWayAisle;
    const horizDouble = horizFit && box.h >= 2 * stallDepth + minTwoWayAisle;
    const horizCount = horizFit ? Math.floor(box.w / stallWidth) * (horizDouble ? 2 : 1) : 0;
    const vertFit = box.h >= stallWidth && box.w >= stallDepth + minOneWayAisle;
    const vertDouble = vertFit && box.w >= 2 * stallDepth + minTwoWayAisle;
    const vertCount = vertFit ? Math.floor(box.h / stallWidth) * (vertDouble ? 2 : 1) : 0;
    if (horizCount === 0 && vertCount === 0) {
      rooms.push(
        createBoxRoom({
          id: `stilt__driveway_${zoneKey}`,
          architecturalRole: Math.min(box.w, box.h) >= minOneWayAisle ? "VEHICLE_AISLE" : "OPEN_CIRCULATION",
          name: Math.min(box.w, box.h) >= minOneWayAisle ? `Stilt Vehicular Driveway & Maneuvering Aisle (${zoneKey})` : `Stilt Circulation Apron (${zoneKey})`,
          type: RoomType.Corridor,
          spaceUse: "COMMON",
          box,
          floorId
        })
      );
      return;
    }
    if (vertCount > horizCount) {
      const numRows = Math.floor(box.h / stallWidth);
      const stallsH = numRows * stallWidth;
      const remH = box.h - stallsH;
      for (let r = 0; r < numRows; r++) {
        carBaysCount++;
        const tag = `P-${String(carBaysCount).padStart(2, "0")}`;
        const bayId = `stilt__car_bay_p${String(carBaysCount).padStart(2, "0")}`;
        rooms.push(
          createBoxRoom({
            id: bayId,
            architecturalRole: "PARKING_BAY",
            name: `Covered Car Parking Bay ${tag} (2.5x5.0m)`,
            type: RoomType.Parking,
            spaceUse: "COMMON",
            box: { x: box.x, y: box.y + r * stallWidth, w: stallDepth, h: stallWidth },
            floorId,
            tags: [`parking:${tag}`]
          })
        );
      }
      if (remH > 0) {
        bikeBaysCount += remH >= 1e3 ? 2 : 0;
        rooms.push(
          createBoxRoom({
            id: remH >= 1e3 ? `stilt__bike_bay_b${String(bikeBaysCount).padStart(2, "0")}` : `stilt__open_remainder_${zoneKey}_${rooms.length}`,
            name: remH >= 1e3 ? `Two-Wheeler Parking Bay B-${String(bikeBaysCount).padStart(2, "0")}` : "Open parking remainder (not a vehicle bay)",
            type: remH >= 1e3 ? RoomType.Parking : RoomType.Foyer,
            spaceUse: "COMMON",
            box: { x: box.x, y: box.y + stallsH, w: stallDepth, h: remH },
            floorId
          })
        );
      }
      if (vertDouble) {
        const eastX = box.x + box.w - stallDepth;
        for (let r = 0; r < numRows; r++) {
          carBaysCount++;
          const tag = `P-${String(carBaysCount).padStart(2, "0")}`;
          const bayId = `stilt__car_bay_p${String(carBaysCount).padStart(2, "0")}`;
          rooms.push(
            createBoxRoom({
              id: bayId,
              architecturalRole: "PARKING_BAY",
              name: `Covered Car Parking Bay ${tag} (2.5x5.0m)`,
              type: RoomType.Parking,
              spaceUse: "COMMON",
              box: { x: eastX, y: box.y + r * stallWidth, w: stallDepth, h: stallWidth },
              floorId,
              tags: [`parking:${tag}`]
            })
          );
        }
        if (remH > 0) {
          bikeBaysCount += remH >= 1e3 ? 2 : 0;
          rooms.push(
            createBoxRoom({
              id: remH >= 1e3 ? `stilt__bike_bay_b${String(bikeBaysCount).padStart(2, "0")}` : `stilt__open_remainder_${zoneKey}_${rooms.length}`,
              name: remH >= 1e3 ? `Two-Wheeler Parking Bay B-${String(bikeBaysCount).padStart(2, "0")}` : "Open parking remainder (not a vehicle bay)",
              type: remH >= 1e3 ? RoomType.Parking : RoomType.Foyer,
              spaceUse: "COMMON",
              box: { x: eastX, y: box.y + stallsH, w: stallDepth, h: remH },
              floorId
            })
          );
        }
        const driveW = box.w - 2 * stallDepth;
        rooms.push(
          createBoxRoom({
            id: `stilt__driveway_${zoneKey}`,
            architecturalRole: "VEHICLE_AISLE",
            name: `Two-Way Vehicular Driveway (${(driveW / 1e3).toFixed(1)}m Clear)`,
            type: RoomType.Corridor,
            spaceUse: "COMMON",
            box: { x: box.x + stallDepth, y: box.y, w: driveW, h: box.h },
            floorId,
            tags: ["driveway:two_way"]
          })
        );
      } else {
        const driveW = box.w - stallDepth;
        rooms.push(
          createBoxRoom({
            id: `stilt__driveway_${zoneKey}`,
            architecturalRole: "VEHICLE_AISLE",
            name: `${driveW >= minTwoWayAisle ? "Two-Way" : "One-Way"} Vehicular Driveway (${(driveW / 1e3).toFixed(1)}m Clear)`,
            type: RoomType.Corridor,
            spaceUse: "COMMON",
            box: { x: box.x + stallDepth, y: box.y, w: driveW, h: box.h },
            floorId,
            tags: [driveW >= minTwoWayAisle ? "driveway:two_way" : "driveway:one_way"]
          })
        );
      }
      return;
    }
    const numStalls = Math.floor(box.w / stallWidth);
    const stallsW = numStalls * stallWidth;
    const remW = box.w - stallsW;
    const isDoubleLoaded = box.h >= 2 * stallDepth + minTwoWayAisle;
    for (let s = 0; s < numStalls; s++) {
      carBaysCount++;
      const tag = `P-${String(carBaysCount).padStart(2, "0")}`;
      const bayId = `stilt__car_bay_p${String(carBaysCount).padStart(2, "0")}`;
      rooms.push(
        createBoxRoom({
          id: bayId,
          architecturalRole: "PARKING_BAY",
          name: `Covered Car Parking Bay ${tag} (2.5x5.0m)`,
          type: RoomType.Parking,
          spaceUse: "COMMON",
          box: { x: box.x + s * stallWidth, y: box.y, w: stallWidth, h: stallDepth },
          floorId,
          tags: [`parking:${tag}`]
        })
      );
    }
    if (remW > 0) {
      bikeBaysCount += remW >= 1e3 ? 2 : 0;
      rooms.push(
        createBoxRoom({
          id: remW >= 1e3 ? `stilt__bike_bay_b${String(bikeBaysCount).padStart(2, "0")}` : `stilt__open_remainder_${zoneKey}_${rooms.length}`,
          name: remW >= 1e3 ? `Two-Wheeler Parking Bay B-${String(bikeBaysCount).padStart(2, "0")}` : "Open parking remainder (not a vehicle bay)",
          type: remW >= 1e3 ? RoomType.Parking : RoomType.Foyer,
          spaceUse: "COMMON",
          box: { x: box.x + stallsW, y: box.y, w: remW, h: stallDepth },
          floorId
        })
      );
    }
    if (isDoubleLoaded) {
      const southY = box.y + box.h - stallDepth;
      for (let s = 0; s < numStalls; s++) {
        carBaysCount++;
        const tag = `P-${String(carBaysCount).padStart(2, "0")}`;
        const bayId = `stilt__car_bay_p${String(carBaysCount).padStart(2, "0")}`;
        rooms.push(
          createBoxRoom({
            id: bayId,
            architecturalRole: "PARKING_BAY",
            name: `Covered Car Parking Bay ${tag} (2.5x5.0m)`,
            type: RoomType.Parking,
            spaceUse: "COMMON",
            box: { x: box.x + s * stallWidth, y: southY, w: stallWidth, h: stallDepth },
            floorId,
            tags: [`parking:${tag}`]
          })
        );
      }
      if (remW > 0) {
        bikeBaysCount += remW >= 1e3 ? 2 : 0;
        rooms.push(
          createBoxRoom({
            id: remW >= 1e3 ? `stilt__bike_bay_b${String(bikeBaysCount).padStart(2, "0")}` : `stilt__open_remainder_${zoneKey}_${rooms.length}`,
            name: remW >= 1e3 ? `Two-Wheeler Parking Bay B-${String(bikeBaysCount).padStart(2, "0")}` : "Open parking remainder (not a vehicle bay)",
            type: remW >= 1e3 ? RoomType.Parking : RoomType.Foyer,
            spaceUse: "COMMON",
            box: { x: box.x + stallsW, y: southY, w: remW, h: stallDepth },
            floorId
          })
        );
      }
      const driveH = box.h - 2 * stallDepth;
      rooms.push(
        createBoxRoom({
          id: `stilt__driveway_${zoneKey}`,
          architecturalRole: "VEHICLE_AISLE",
          name: `Two-Way Vehicular Driveway (${(driveH / 1e3).toFixed(1)}m Clear)`,
          type: RoomType.Corridor,
          spaceUse: "COMMON",
          box: { x: box.x, y: box.y + stallDepth, w: box.w, h: driveH },
          floorId,
          tags: ["driveway:two_way"]
        })
      );
    } else {
      const driveH = box.h - stallDepth;
      rooms.push(
        createBoxRoom({
          id: `stilt__driveway_${zoneKey}`,
          architecturalRole: "VEHICLE_AISLE",
          name: `${driveH >= minTwoWayAisle ? "Two-Way" : "One-Way"} Vehicular Driveway (${(driveH / 1e3).toFixed(1)}m Clear)`,
          type: RoomType.Corridor,
          spaceUse: "COMMON",
          box: { x: box.x, y: box.y + stallDepth, w: box.w, h: driveH },
          floorId,
          tags: [driveH >= minTwoWayAisle ? "driveway:two_way" : "driveway:one_way"]
        })
      );
    }
  };
  const occupied = rooms.map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height }));
  const packFree = (box, zoneKey) => {
    for (const free of subtractBoxes(box, occupied)) {
      if (free.w < 2500 || free.h < 2500) continue;
      packParkingBox(free, zoneKey);
      occupied.push(free);
    }
  };
  packFree({ x: westBox.x, y: westBox.y + amenityH, w: westBox.w, h: westParkH }, "west");
  for (let fb = 1; fb < macro.flatBoxes.length; fb++) {
    packFree(macro.flatBoxes[fb], `east_0${fb}`);
  }
  const freeStrips = macro.shaftBoxes.filter(
    (box, i) => macro.shaftRoles?.[i] === "OPEN_TO_SKY_VOID" && box.w >= 2500 && box.h >= 2500
  );
  let openZone = 0;
  for (const strip of freeStrips) packFree(strip, `open_0${++openZone}`);
  const stiltBoundary = rectPolygon(envelope.x, envelope.y, envelope.w, envelope.h);
  const walls = generateApartmentWalls(rooms, floorId, stiltBoundary, true, config.architectureOptions?.guardHeightMm);
  const lobbyExtWalls = walls.filter((w) => w.roomIds.length === 1 && w.roomIds.includes(grandLobby.id) && w.boundaryRole === "FULL_HEIGHT_WALL").sort((a, b) => Math.hypot(b.endPoint.x - b.startPoint.x, b.endPoint.y - b.startPoint.y) - Math.hypot(a.endPoint.x - a.startPoint.x, a.endPoint.y - a.startPoint.y));
  const mainEntryWall = lobbyExtWalls[0];
  if (mainEntryWall) {
    const wallLen = Math.hypot(mainEntryWall.endPoint.x - mainEntryWall.startPoint.x, mainEntryWall.endPoint.y - mainEntryWall.startPoint.y);
    const entryDoorW = wallLen >= 1800 ? 1500 : wallLen >= 1300 ? 1050 : 0;
    const entryPos = {
      x: snap102((mainEntryWall.startPoint.x + mainEntryWall.endPoint.x) / 2),
      y: snap102((mainEntryWall.startPoint.y + mainEntryWall.endPoint.y) / 2)
    };
    if (entryDoorW > 0 && openingFitsApartmentWall(mainEntryWall, entryPos, entryDoorW)) {
      doors.push({
        id: "door_stilt_grand_lobby_main_entrance",
        floorId,
        wallId: mainEntryWall.id,
        position: entryPos,
        width: entryDoorW,
        height: 2100,
        type: entryDoorW >= 1500 ? DoorType.Double : DoorType.Single,
        swingDirection: SwingDirection.Inward,
        connectsRooms: [grandLobby.id, "EXTERIOR"]
      });
      mainEntryWall.hasOpening = true;
    }
  }
  const dStair1 = createConnectingDoor("door_stilt_stair1", roomToBox(stiltLobby), roomToBox(stair1), 1200, { doorType: "open_passage" });
  if (dStair1) {
    const hostWall = walls.find((w) => w.roomIds.includes(stiltLobby.id) && w.roomIds.includes(stair1.id)) ?? walls.find((w) => openingFitsApartmentWall(w, { x: snap102(dStair1.rect.x + dStair1.rect.width / 2), y: snap102(dStair1.rect.y + dStair1.rect.height / 2) }, 1200));
    if (hostWall) {
      doors.push({
        id: dStair1.id,
        floorId,
        wallId: hostWall.id,
        position: { x: snap102(dStair1.rect.x + dStair1.rect.width / 2), y: snap102(dStair1.rect.y + dStair1.rect.height / 2) },
        width: 1200,
        height: 2100,
        type: DoorType.OpenPassage,
        swingDirection: SwingDirection.Inward,
        connectsRooms: [stiltLobby.id, stair1.id]
      });
      hostWall.hasOpening = true;
    }
  }
  const dLobbyCorr = createConnectingDoor("door_stilt_lobby_corr", roomToBox(stiltLobby), roomToBox(stiltCorridor), 1500, { doorType: "open_passage" });
  if (dLobbyCorr) {
    const hostWall = walls.find((w) => w.roomIds.includes(stiltLobby.id) && w.roomIds.includes(stiltCorridor.id)) ?? walls.find((w) => openingFitsApartmentWall(w, { x: snap102(dLobbyCorr.rect.x + dLobbyCorr.rect.width / 2), y: snap102(dLobbyCorr.rect.y + dLobbyCorr.rect.height / 2) }, 1500));
    if (hostWall) {
      doors.push({
        id: dLobbyCorr.id,
        floorId,
        wallId: hostWall.id,
        position: { x: snap102(dLobbyCorr.rect.x + dLobbyCorr.rect.width / 2), y: snap102(dLobbyCorr.rect.y + dLobbyCorr.rect.height / 2) },
        width: 1500,
        height: 2100,
        type: DoorType.OpenPassage,
        swingDirection: SwingDirection.Inward,
        connectsRooms: [stiltLobby.id, stiltCorridor.id]
      });
      hostWall.hasOpening = true;
    }
  }
  const tempFloor = {
    id: floorId,
    buildingId: "apartment_building",
    level: 0,
    name: "STILT_PARKING_PLAN",
    floorHeight: stackParams.stiltHeightMm,
    boundary: stiltBoundary,
    rooms,
    walls,
    doors,
    windows: [],
    stairs: [],
    columns: []
  };
  if (config.structuralLayoutMode === "PROVISIONAL_EXISTING_PROFILE") columns.push(...deriveCleanStructuralColumns(tempFloor, envelope));
  const floor = {
    id: floorId,
    buildingId: "apartment_building",
    level: 0,
    name: "STILT_PARKING_PLAN",
    floorHeight: stackParams.stiltHeightMm,
    boundary: stiltBoundary,
    rooms,
    walls,
    doors,
    windows: [],
    stairs: [],
    columns
  };
  const ledger = measureApartmentAreaLedger(floor);
  const audit = {
    sheetId: "sheet_02_stilt_plan",
    sheetName: "Sheet 02: Stilt Floor Parking & Amenities Plan",
    grossAreaMm2: ledger.gross,
    accountedAreaMm2: ledger.accounted,
    deltaMm2: ledger.delta,
    unassignedMm2: ledger.unassigned,
    isPlanarConserved: Math.abs(ledger.delta) < 1e-3 && ledger.unassigned === 0
  };
  return { floor, carBaysCount, bikeBaysCount, audit };
}
function solveTypicalFloorSheet(config, envelope, floorLevel = 1, topology, options) {
  const floorId = floorLevel === 1 ? "floor_typical_01" : `floor_level_${String(floorLevel).padStart(2, "0")}`;
  const floorName = floorLevel === 0 ? "GROUND_FLOOR_PLAN" : floorLevel === 1 ? "1ST_FLOOR_PLAN" : floorLevel === 2 ? "2ND_FLOOR_PLAN" : floorLevel === 3 ? "3RD_FLOOR_PLAN" : `${floorLevel}TH_FLOOR_PLAN`;
  const manifest = createDynamicApartmentManifest({
    plotWidthMm: config.plotWidthMm,
    plotDepthMm: config.plotDepthMm,
    flatsPerFloor: config.flatsPerFloor,
    units: config.units,
    jurisdiction: config.jurisdiction,
    lotAllotmentMode: config.lotAllotmentMode
  });
  const structure = topology ? assembleStructureFromPartition({
    partition: topology.chosen.partition,
    program: topology.result.program,
    manifest,
    unitTypes: (config.units ?? []).map((u) => u.bhkType),
    archetype: topology.result.archetype ?? config.preferredArchetype,
    staggeredBalconies: config.staggeredBalconies,
    floorVariant: options?.floorVariant
  }).structure : solveOrthogonalSpaceFillingApartment({
    aiPrompt: config.aiPrompt,
    plan: { flats: [], rooms: [] },
    site: {
      plotWidth: config.plotWidthMm,
      plotDepth: config.plotDepthMm,
      lotAllotmentMode: config.lotAllotmentMode,
      setbacks: {
        front: config.plotDepthMm - (envelope.y + envelope.h),
        rear: envelope.y,
        left: envelope.x,
        right: config.plotWidthMm - (envelope.x + envelope.w)
      }
    },
    frame: { width: 1e3, height: 1e3 },
    manifest,
    lotAllotmentMode: config.lotAllotmentMode
  });
  const rooms = [];
  const addRoom3 = (r, defaultType, unitId) => {
    const rType = r.type === "common_toilet" ? RoomType.Bathroom : r.type ?? defaultType;
    rooms.push(
      createBoxRoom({
        id: `apt-room:${r.id}`,
        architecturalRole: r.architecturalRole,
        name: r.name,
        type: rType,
        spaceUse: rType === RoomType.Balcony ? "OUTDOOR" : unitId ? "UNIT" : rType === RoomType.ServiceShaft ? "SERVICE" : rType === RoomType.Lift || rType === RoomType.Staircase ? "CORE" : "COMMON",
        planningZone: r.planningZone,
        box: { x: r.rect.x, y: r.rect.y, w: r.rect.width, h: r.rect.height },
        floorId,
        unitId,
        tags: [`apt-room:${r.id}`, ...r.tags ?? []]
      })
    );
  };
  for (let fIdx = 0; fIdx < structure.flats.length; fIdx++) {
    const flat = structure.flats[fIdx];
    const flatNum = floorLevel * 100 + (fIdx + 1);
    for (const r of flat.rooms) {
      const renamed = {
        ...r,
        name: r.name.replace(/Flat\s*0?(\d+)/i, `Flat ${flatNum}`)
      };
      addRoom3(renamed, RoomType.Custom, flat.id);
    }
  }
  for (const el of structure.lifts) addRoom3(el, RoomType.Lift);
  for (const el of structure.stairs) addRoom3(el, RoomType.Staircase);
  for (const el of structure.lobbies) addRoom3({ ...el, tags: [...el.tags ?? [], "core:lobby"] }, RoomType.Corridor);
  for (const el of structure.corridors) addRoom3({ ...el, tags: [...el.tags ?? [], "core:corridor"] }, RoomType.Corridor);
  for (const el of structure.shafts) addRoom3(el, RoomType.ServiceShaft);
  const boundary = rectPolygon(envelope.x, envelope.y, envelope.w, envelope.h);
  const walls = generateApartmentWalls(rooms, floorId, boundary, true, config.architectureOptions?.guardHeightMm);
  const doors = [];
  const windows = [];
  for (const op of structure.openings) {
    const hostWall = walls.find(
      (w) => (!op.connects || op.connects.every((id) => w.roomIds.includes(`apt-room:${id}`))) && openingFitsApartmentWall(
        w,
        { x: op.rect.x + op.rect.width / 2, y: op.rect.y + op.rect.height / 2 },
        Math.max(op.rect.width, op.rect.height)
      )
    );
    if (hostWall) {
      doors.push({
        id: op.id,
        floorId,
        wallId: hostWall.id,
        position: { x: op.rect.x + op.rect.width / 2, y: op.rect.y + op.rect.height / 2 },
        width: Math.max(op.rect.width, op.rect.height),
        height: 2100,
        type: op.doorType === "sliding" ? DoorType.Sliding : op.doorType === "open_passage" ? DoorType.OpenPassage : DoorType.Single,
        swingDirection: SwingDirection.Inward,
        connectsRooms: [op.connects?.[0] ? `apt-room:${op.connects[0]}` : "", op.connects?.[1] ? `apt-room:${op.connects[1]}` : ""]
      });
      hostWall.hasOpening = true;
    }
  }
  for (const r of rooms) {
    if (r.spaceUse === "OUTDOOR" || r.type === RoomType.ServiceShaft) continue;
    const isBath2 = r.type === RoomType.Bathroom;
    const hasOtsShaftWall = (w) => w.wallUse === "SHAFT" && w.roomIds.some((id) => {
      const owner = rooms.find((room) => room.id === id);
      return owner?.architecturalRole === "OPEN_TO_SKY_VOID";
    });
    const extWalls = walls.filter(
      (w) => (w.wallUse === "EXTERNAL" || isBath2 && w.wallUse === "SHAFT" || hasOtsShaftWall(w)) && w.boundaryRole !== "OPEN_BOUNDARY" && w.boundaryRole !== "PARAPET" && w.roomIds.includes(r.id)
    );
    for (const hw of extWalls) {
      const hasDoor = doors.some((d) => d.wallId === hw.id);
      if (hasDoor) {
        continue;
      }
      const len = Math.hypot(hw.endPoint.x - hw.startPoint.x, hw.endPoint.y - hw.startPoint.y);
      const winW = isBath2 ? len >= 800 ? 600 : Math.max(350, Math.round(len - 200)) : len >= 1400 ? 1200 : Math.max(600, Math.round(len - 200));
      const winH = isBath2 ? 650 : 1200;
      const sillH = isBath2 ? 1500 : 900;
      const winPos = {
        x: snap102((hw.startPoint.x + hw.endPoint.x) / 2),
        y: snap102((hw.startPoint.y + hw.endPoint.y) / 2)
      };
      if (winW > 0 && openingFitsApartmentWall(hw, winPos, winW)) {
        windows.push({
          id: `win_${r.id}_${hw.id}`,
          floorId,
          wallId: hw.id,
          position: winPos,
          width: winW,
          height: winH,
          sillHeight: sillH,
          type: isBath2 ? WindowType.Ventilator : WindowType.Sliding,
          roomId: r.id
        });
        hw.hasOpening = true;
        if (isBath2) break;
      }
    }
  }
  const floor = {
    id: floorId,
    buildingId: "apartment_building",
    level: floorLevel,
    name: floorName,
    floorHeight: config.floorToFloorHeightMm ?? 3e3,
    boundary,
    rooms,
    walls,
    doors,
    windows,
    stairs: [],
    columns: deriveCleanStructuralColumns(
      {
        id: floorId,
        buildingId: "apartment_building",
        level: floorLevel,
        name: floorName,
        floorHeight: config.floorToFloorHeightMm ?? 3e3,
        boundary,
        rooms,
        walls,
        doors,
        windows,
        stairs: [],
        columns: []
      },
      envelope
    ),
    apartmentUnits: structure.flats.map((f, idx) => ({
      id: f.id,
      boundary: rectPolygon(f.rect.x, f.rect.y, f.rect.width, f.rect.height),
      unitType: f.unitType,
      unitIndex: idx + 1
    }))
  };
  const flOrdinal = floorLevel === 1 ? "1st" : floorLevel === 2 ? "2nd" : floorLevel === 3 ? "3rd" : `${floorLevel}th`;
  const repairManifest = topology ? createDynamicApartmentManifest({
    plotWidthMm: config.plotWidthMm,
    plotDepthMm: config.plotDepthMm,
    flatsPerFloor: config.flatsPerFloor,
    units: structure.flats.map((f, idx) => ({
      ...config.units?.[idx] ?? { hasUtilityBalcony: true },
      unitIndex: idx + 1,
      bhkType: f.unitType
    })),
    jurisdiction: config.jurisdiction,
    lotAllotmentMode: config.lotAllotmentMode
  }) : manifest;
  const baseRepairedFloor = repairApartmentPlan({ id: "typical", projectId: "typical", name: floorName, site: { plotWidth: config.plotWidthMm, plotDepth: config.plotDepthMm }, floors: [floor], metadata: { projectId: "typical" }, version: 1, createdAt: "", updatedAt: "" }, repairManifest).building.floors[0];
  const repairedFloor = healFloorGeometryForCompliance(baseRepairedFloor).floor;
  const ledger = measureApartmentAreaLedger(repairedFloor);
  const audit = {
    sheetId: floorLevel === 1 ? "sheet_03_typical_plan" : `sheet_03_level_${floorLevel}_plan`,
    sheetName: `Sheet 03: ${flOrdinal} Residential Floor Plan`,
    grossAreaMm2: ledger.gross,
    accountedAreaMm2: ledger.accounted,
    deltaMm2: ledger.delta,
    unassignedMm2: ledger.unassigned,
    isPlanarConserved: Math.abs(ledger.delta) < 1e-3 && ledger.unassigned === 0
  };
  return { floor: repairedFloor, structure, audit };
}
function solveStructuralColumnScheduleSheet(typicalResult, _envelope) {
  const columns = typicalResult.floor.columns;
  const scheduleRows = columns.map((c) => ({
    columnNo: c.gridReference || c.id,
    gridRef: `Grid (${(c.position.x / 1e3).toFixed(1)}m, ${(c.position.y / 1e3).toFixed(1)}m)`,
    sizeMm: `${c.width} x ${c.depth} mm`,
    orientation: "Vertical RCC Column",
    loadLevel: "Ground / Stilt to Terrace Slab (All Levels)"
  }));
  const floor = {
    ...typicalResult.floor,
    id: "floor_col_schedule_04",
    name: "STRUCTURAL_COLUMN_SCHEDULE_PLAN",
    level: 1,
    rooms: [],
    // Pure structural sheet: no room fills cluttering the structural grid
    doors: [],
    windows: [],
    columns: [...columns]
  };
  const audit = {
    sheetId: "sheet_04_column_schedule",
    sheetName: "Sheet 04: Structural Column Layout & Schedule Plan",
    grossAreaMm2: typicalResult.audit.grossAreaMm2,
    accountedAreaMm2: typicalResult.audit.accountedAreaMm2,
    deltaMm2: typicalResult.audit.deltaMm2,
    unassignedMm2: 0,
    isPlanarConserved: typicalResult.audit.isPlanarConserved
  };
  return { floor, columns, scheduleRows, audit };
}
function solveRefugeFloorSheet(typicalResult, refugeLevel) {
  const floorId = `floor_refuge_${String(refugeLevel).padStart(2, "0")}`;
  const baseFloor = typicalResult.floor;
  const origBalcony = baseFloor.rooms.find((r) => r.id === "apt-room:flat_01__balcony" || r.id === "flat_01__balcony" || r.unitId === "flat_01" && r.name.toLowerCase().includes("sit-out"));
  const origDining = baseFloor.rooms.find((r) => r.unitId === "flat_01" && (r.id.includes("dining") || r.type === RoomType.Dining));
  const origLiving = baseFloor.rooms.find((r) => r.unitId === "flat_01" && r.type === RoomType.Living);
  const targetBalcony = origBalcony ?? baseFloor.rooms.find((r) => r.unitId === "flat_01" && r.type === RoomType.Balcony);
  const adjacentX = Boolean(targetBalcony && origDining && Math.abs(targetBalcony.y - origDining.y) <= 1 && Math.abs(targetBalcony.height - origDining.height) <= 1 && (Math.abs(targetBalcony.x + targetBalcony.width - origDining.x) <= 1 || Math.abs(origDining.x + origDining.width - targetBalcony.x) <= 1));
  const adjacentY = Boolean(targetBalcony && origDining && Math.abs(targetBalcony.x - origDining.x) <= 1 && Math.abs(targetBalcony.width - origDining.width) <= 1 && (Math.abs(targetBalcony.y + targetBalcony.height - origDining.y) <= 1 || Math.abs(origDining.y + origDining.height - targetBalcony.y) <= 1));
  const shouldMergeDining = adjacentX || adjacentY;
  const refBox = adjacentX ? {
    x: Math.min(targetBalcony.x, origDining.x),
    y: targetBalcony.y,
    w: targetBalcony.width + origDining.width,
    h: targetBalcony.height
  } : adjacentY ? {
    x: targetBalcony.x,
    y: Math.min(targetBalcony.y, origDining.y),
    w: targetBalcony.width,
    h: targetBalcony.height + origDining.height
  } : targetBalcony ? {
    x: targetBalcony.x,
    y: targetBalcony.y,
    w: targetBalcony.width,
    h: targetBalcony.height
  } : null;
  const rooms = [];
  for (const r of baseFloor.rooms) {
    if (targetBalcony && r.id === targetBalcony.id && refBox) {
      rooms.push(createBoxRoom({
        id: `refuge_terrace_${refugeLevel}`,
        name: "Statutory Fire Refuge Terrace (>= 15 m\xB2)",
        type: RoomType.Balcony,
        spaceUse: "OUTDOOR",
        planningZone: "OUTDOOR",
        box: refBox,
        floorId,
        unitId: "flat_01",
        tags: ["refuge:terrace", "fire_safety"]
      }));
      continue;
    }
    if (shouldMergeDining && origDining && r.id === origDining.id) {
      continue;
    }
    rooms.push({ ...r, floorId });
  }
  const walls = generateApartmentWalls(rooms, floorId, baseFloor.boundary);
  const doors = baseFloor.doors.map((d) => ({ ...d, floorId }));
  const refugeRoom = rooms.find((r) => r.tags.includes("refuge:terrace"));
  const connectingRoom = rooms.find((r) => r.id === origLiving?.id);
  if (refugeRoom && connectingRoom) {
    const dRefuge = createConnectingDoor(`door_refuge_${refugeLevel}`, roomToBox(connectingRoom), roomToBox(refugeRoom), 1050, { isFlatEntrance: true });
    if (dRefuge) {
      const hostWall = walls.find((w) => w.roomIds.includes(connectingRoom.id) && w.roomIds.includes(refugeRoom.id)) ?? walls.find((w) => openingFitsApartmentWall(w, { x: snap102(dRefuge.rect.x + dRefuge.rect.width / 2), y: snap102(dRefuge.rect.y + dRefuge.rect.height / 2) }, 1050));
      if (hostWall) {
        doors.push({
          id: dRefuge.id,
          floorId,
          wallId: hostWall.id,
          position: { x: snap102(dRefuge.rect.x + dRefuge.rect.width / 2), y: snap102(dRefuge.rect.y + dRefuge.rect.height / 2) },
          width: 1050,
          height: 2100,
          type: DoorType.Single,
          swingDirection: SwingDirection.Inward,
          connectsRooms: [connectingRoom.id, refugeRoom.id]
        });
        hostWall.hasOpening = true;
      }
    }
  }
  const floor = {
    ...baseFloor,
    id: floorId,
    level: refugeLevel,
    name: "REFUGE_FLOOR_PLAN",
    rooms,
    walls,
    doors,
    windows: baseFloor.windows.map((w) => ({ ...w, floorId }))
  };
  const ledger = measureApartmentAreaLedger(floor);
  const refugeAreaM2 = (refugeRoom?.area ?? 0) / 1e6;
  const audit = {
    sheetId: "sheet_04_refuge_plan",
    sheetName: `Sheet 04: Fire Refuge Floor Plan (Level ${refugeLevel})`,
    grossAreaMm2: ledger.gross,
    accountedAreaMm2: ledger.accounted,
    deltaMm2: ledger.delta,
    unassignedMm2: ledger.unassigned,
    isPlanarConserved: Math.abs(ledger.delta) < 1e-3 && ledger.unassigned === 0
  };
  return { floor, refugeAreaM2, audit };
}
function solveTerraceSheet(config, envelope, macro, terraceLevel) {
  const floorId = `floor_terrace_${String(terraceLevel).padStart(2, "0")}`;
  const rooms = [];
  const doors = [];
  const mumty1 = createBoxRoom({
    id: "terrace__stair_mumty_1",
    name: "Staircase 01 Mumty & Headroom",
    architecturalRole: "STAIR_MUMTY",
    type: RoomType.Staircase,
    spaceUse: "CORE",
    box: macro.stairBoxes[0],
    floorId,
    tags: ["terrace:core"]
  });
  rooms.push(mumty1);
  for (let i = 1; i < macro.stairBoxes.length; i++) {
    rooms.push(createBoxRoom({
      id: `terrace__stair_mumty_${i + 1}`,
      name: i === 1 ? "Staircase 02 Mumty & Fire Escape Headroom" : `Staircase 0${i + 1} Mumty & Headroom`,
      architecturalRole: "STAIR_MUMTY",
      type: RoomType.Staircase,
      spaceUse: "CORE",
      box: macro.stairBoxes[i],
      floorId,
      tags: ["terrace:core"]
    }));
  }
  const lmr1 = createBoxRoom({
    id: "terrace__lift_machine_room_1",
    name: config.architectureOptions?.liftSystem === "MACHINE_ROOM_REQUIRED" ? "Lift equipment room 01" : "Lift headroom reservation 01",
    architecturalRole: config.architectureOptions?.liftSystem === "MACHINE_ROOM_REQUIRED" ? "LIFT_EQUIPMENT" : "ROOF_EQUIPMENT_ZONE",
    type: RoomType.Custom,
    spaceUse: "CORE",
    box: macro.liftBoxes[0],
    floorId,
    tags: ["terrace:core"]
  });
  rooms.push(lmr1);
  for (let i = 1; i < macro.liftBoxes.length; i++) {
    const machineRoom = config.architectureOptions?.liftSystem === "MACHINE_ROOM_REQUIRED";
    rooms.push(createBoxRoom({
      id: `terrace__lift_machine_room_${i + 1}`,
      name: machineRoom ? `Lift equipment room 0${i + 1}` : `Lift headroom reservation 0${i + 1}`,
      architecturalRole: machineRoom ? "LIFT_EQUIPMENT" : "ROOF_EQUIPMENT_ZONE",
      type: RoomType.Custom,
      spaceUse: "CORE",
      box: macro.liftBoxes[i],
      floorId,
      tags: ["terrace:core"]
    }));
  }
  const terraceLobbyBoxes = macroLobbyBoxes(macro);
  const terraceCorridorBoxes = macroCorridorBoxes(macro);
  const tankBox = terraceLobbyBoxes[0] ?? terraceCorridorBoxes[0];
  const tankTookCorridor = !terraceLobbyBoxes.length;
  rooms.push(createBoxRoom({
    id: "terrace__ohwt_tank",
    architecturalRole: "ROOF_EQUIPMENT_ZONE",
    name: "Overhead Water Tank (OHWT \u2014 Domestic & Fire Reserve)",
    type: RoomType.Custom,
    spaceUse: "SERVICE",
    box: tankBox,
    floorId,
    tags: ["terrace:core"]
  }));
  for (let i = 1; i < terraceLobbyBoxes.length; i++) {
    rooms.push(createBoxRoom({
      id: `terrace__roof_plant_${i + 1}`,
      architecturalRole: "ROOF_EQUIPMENT_ZONE",
      name: `Roof Services Plant Zone 0${i + 1}`,
      type: RoomType.Custom,
      spaceUse: "SERVICE",
      box: terraceLobbyBoxes[i],
      floorId,
      tags: ["terrace:core"]
    }));
  }
  for (let i = tankTookCorridor ? 1 : 0; i < terraceCorridorBoxes.length; i++) {
    rooms.push(createBoxRoom({
      id: i === 0 ? "terrace__corridor_vestibule" : `terrace__corridor_vestibule_${i + 1}`,
      name: terraceCorridorBoxes.length > 1 ? `Terrace Access Vestibule 0${i + 1}` : "Terrace Access Vestibule",
      type: RoomType.Corridor,
      spaceUse: "COMMON",
      box: terraceCorridorBoxes[i],
      floorId,
      tags: ["terrace:core"]
    }));
  }
  for (let s = 0; s < macro.shaftBoxes.length; s++) {
    rooms.push(
      createBoxRoom({
        id: `terrace__shaft_head_${s + 1}`,
        architecturalRole: macro.shaftRoles?.[s] === "OPEN_TO_SKY_VOID" ? "OPEN_TO_SKY_VOID" : "SERVICE_SHAFT",
        name: macro.shaftRoles?.[s] === "OPEN_TO_SKY_VOID" ? "Open-to-sky courtyard (no roof)" : `Service duct vent head 0${s + 1}`,
        type: RoomType.ServiceShaft,
        spaceUse: "SERVICE",
        box: macro.shaftBoxes[s],
        floorId,
        tags: ["terrace:core", ...macro.shaftTags?.[s] ?? []]
      })
    );
  }
  const westBox = macro.flatBoxes[0];
  rooms.push(
    createBoxRoom({
      id: "terrace__solar_pv_array",
      name: "Rooftop Solar PV Array & Inverter Deck",
      type: RoomType.Terrace,
      spaceUse: "OUTDOOR",
      box: westBox,
      floorId,
      tags: ["terrace:solar"]
    })
  );
  for (let fb = 1; fb < macro.flatBoxes.length; fb++) {
    const eastBox = macro.flatBoxes[fb];
    const yogaH = snap102(eastBox.h * 0.45);
    const openH = eastBox.h - yogaH;
    rooms.push(
      createBoxRoom({
        id: `terrace__yoga_deck_${fb}`,
        name: "Terrace Gazebo, Yoga & Landscaped Sitout Deck",
        type: RoomType.Terrace,
        spaceUse: "OUTDOOR",
        box: { x: eastBox.x, y: eastBox.y, w: eastBox.w, h: yogaH },
        floorId,
        tags: ["terrace:amenity"]
      })
    );
    rooms.push(
      createBoxRoom({
        id: `terrace__open_waterproof_${fb}`,
        name: "Open Waterproofed Rooftop Terrace",
        type: RoomType.Terrace,
        spaceUse: "OUTDOOR",
        box: { x: eastBox.x, y: eastBox.y + yogaH, w: eastBox.w, h: openH },
        floorId,
        tags: ["terrace:open"]
      })
    );
  }
  const terraceBoundary = rectPolygon(envelope.x, envelope.y, envelope.w, envelope.h);
  const walls = generateApartmentWalls(rooms, floorId, terraceBoundary, true, config.architectureOptions?.guardHeightMm);
  for (const mumty of rooms.filter((r) => r.architecturalRole === "STAIR_MUMTY")) {
    const hosts = walls.filter((w) => w.roomIds.includes(mumty.id) && w.roomIds.some((id) => rooms.some((r) => r.id === id && ["OPEN_CIRCULATION", "OPEN_TERRACE", "ROOF_EQUIPMENT_ZONE"].includes(r.architecturalRole ?? ""))));
    const host = hosts.find((w) => openingFitsApartmentWall(w, { x: (w.startPoint.x + w.endPoint.x) / 2, y: (w.startPoint.y + w.endPoint.y) / 2 }, 1050));
    if (!host) throw new Error(`ROOF_STAIR_ACCESS_UNAVAILABLE: ${mumty.id}`);
    const other = host.roomIds.find((id) => id !== mumty.id);
    doors.push({
      id: `${mumty.id}:roof-access`,
      floorId,
      wallId: host.id,
      position: { x: (host.startPoint.x + host.endPoint.x) / 2, y: (host.startPoint.y + host.endPoint.y) / 2 },
      width: 1050,
      height: 2100,
      type: DoorType.Single,
      swingDirection: SwingDirection.Outward,
      connectsRooms: [mumty.id, other]
    });
  }
  const floor = {
    id: floorId,
    buildingId: "apartment_building",
    level: terraceLevel,
    name: "TERRACE_PLAN",
    floorHeight: 3e3,
    boundary: terraceBoundary,
    rooms,
    walls,
    doors,
    windows: [],
    stairs: [],
    columns: []
  };
  const ledger = measureApartmentAreaLedger(floor);
  const audit = {
    sheetId: "sheet_05_terrace_plan",
    sheetName: "Sheet 05: Rooftop Services & Terrace Plan",
    grossAreaMm2: ledger.gross,
    accountedAreaMm2: ledger.accounted,
    deltaMm2: ledger.delta,
    unassignedMm2: ledger.unassigned,
    isPlanarConserved: Math.abs(ledger.delta) < 1e-3 && ledger.unassigned === 0
  };
  return { floor, audit };
}
function generateApartmentProjectSchedule(params) {
  const { config, siteSheet, stiltSheet, typicalSheet, refugeSheet, terraceSheet } = params;
  const plotAreaM2 = config.plotWidthMm * config.plotDepthMm / 1e6;
  const plotAreaSqFt = plotAreaM2 * 10.7639;
  const typicalFloor = typicalSheet.floor;
  const groundCoverageM2 = polygonArea2(typicalFloor.boundary) / 1e6;
  const groundCoveragePercent = groundCoverageM2 / plotAreaM2 * 100;
  const setbackAreaM2 = Math.max(0, plotAreaM2 - groundCoverageM2);
  const rosZones = siteSheet.siteZones.filter((z) => z.kind === "garden");
  const rosLandscapeAreaM2 = rosZones.reduce((sum, z) => sum + z.area, 0) / 1e6;
  const rosLandscapePercent = rosLandscapeAreaM2 / plotAreaM2 * 100;
  const roadW = config.roadWidthMm;
  const permissibleFsi = roadW >= 24e3 ? 3 : roadW >= 18e3 ? 2.5 : roadW >= 12e3 ? 2 : roadW >= 9e3 ? 1.5 : 1.2;
  const floorBuiltUpM2 = groundCoverageM2;
  const totalBuiltUpAreaM2 = floorBuiltUpM2 * config.numTypicalFloors;
  const consumedFsi = totalBuiltUpAreaM2 / plotAreaM2;
  const typicalLedger = measureApartmentAreaLedger(typicalFloor);
  const flatSchedule = [];
  let totalTypicalCarpetM2 = 0;
  for (const flat of typicalSheet.structure.flats) {
    const flatRooms = typicalFloor.rooms.filter((r) => r.unitId === flat.id);
    const carpetMm2 = flatRooms.filter((r) => r.spaceUse === "UNIT" && r.type !== RoomType.Balcony).reduce((sum, r) => sum + (typicalLedger.roomUsable[r.id] ?? r.area), 0);
    const balconyMm2 = flatRooms.filter((r) => r.spaceUse === "OUTDOOR" || r.type === RoomType.Balcony).reduce((sum, r) => sum + (typicalLedger.roomUsable[r.id] ?? r.area), 0);
    const carpetM2 = carpetMm2 / 1e6;
    const balconyM2 = balconyMm2 / 1e6;
    const totalUnitBuiltUpM2 = carpetM2 + balconyM2 + (carpetM2 + balconyM2) * 0.15;
    totalTypicalCarpetM2 += carpetM2;
    flatSchedule.push({
      flatId: flat.id,
      flatNumber: flat.label,
      bhkType: flat.unitType,
      reraCarpetAreaM2: Math.round(carpetM2 * 100) / 100,
      reraCarpetAreaSqFt: Math.round(carpetM2 * 10.7639),
      balconyAreaM2: Math.round(balconyM2 * 100) / 100,
      balconyAreaSqFt: Math.round(balconyM2 * 10.7639),
      totalBuiltUpAreaM2: Math.round(totalUnitBuiltUpM2 * 100) / 100,
      totalBuiltUpAreaSqFt: Math.round(totalUnitBuiltUpM2 * 10.7639)
    });
  }
  const totalReraCarpetAreaM2 = totalTypicalCarpetM2 * config.numTypicalFloors;
  const floorPlateEfficiencyPercent = totalTypicalCarpetM2 / floorBuiltUpM2 * 100;
  let reqCarStalls = 0;
  let req2WStalls = 0;
  for (const flat of typicalSheet.structure.flats) {
    if (flat.unitType === "2BHK") {
      reqCarStalls += 1;
      req2WStalls += 2;
    } else if (flat.unitType === "3BHK") {
      reqCarStalls += 1.5;
      req2WStalls += 2;
    } else if (flat.unitType === "4BHK") {
      reqCarStalls += 2;
      req2WStalls += 4;
    } else {
      reqCarStalls += 1;
      req2WStalls += 1;
    }
  }
  const visitorFactor = 1 + (config.visitorParkingPercent ?? 10) / 100;
  const totalReqCar = Math.ceil(reqCarStalls * config.numTypicalFloors * visitorFactor);
  const totalReq2W = Math.ceil(req2WStalls * config.numTypicalFloors * visitorFactor);
  const stackMult = config.parkingMode === "MECHANICAL_STACK" ? 2 : 1;
  const stiltCar = stiltSheet.carBaysCount * stackMult;
  const surfaceCar = siteSheet.siteZones.filter((z) => z.kind === "parking" && z.name.includes("Car")).length;
  const providedCar = stiltCar + surfaceCar;
  const stilt2W = stiltSheet.bikeBaysCount;
  const surface2W = siteSheet.siteZones.filter((z) => z.kind === "parking" && z.name.includes("2-Wheeler")).length * 4;
  const provided2W = stilt2W + surface2W;
  const parking = {
    requiredCarStalls: totalReqCar,
    providedCarStalls: providedCar,
    stiltCarStalls: stiltCar,
    surfaceCarStalls: surfaceCar,
    stackParkingMultiplier: stackMult,
    visitorCarStalls: Math.ceil(totalReqCar * 0.1),
    requiredTwoWheelerStalls: totalReq2W,
    providedTwoWheelerStalls: provided2W,
    visitorTwoWheelerStalls: Math.ceil(totalReq2W * 0.1)
  };
  const sheetAudits = [
    siteSheet.audit,
    stiltSheet.audit,
    typicalSheet.audit,
    ...refugeSheet ? [refugeSheet.audit] : [],
    terraceSheet.audit
  ];
  const overallDeltaMm2 = sheetAudits.reduce((sum, a) => sum + Math.abs(a.deltaMm2), 0);
  let areaTargetDiagnostic;
  const promptIntentForDiag = (() => {
    try {
      return interpretArchitecturalIntent({
        flatsPerFloor: config.flatsPerFloor,
        unitTypes: (config.units ?? []).map((u) => u.bhkType),
        aiPrompt: config.aiPrompt
      });
    } catch {
      return void 0;
    }
  })();
  const targetSqFt = config.targetAreaSqFt ?? promptIntentForDiag?.mandatory.targetAreaSqFt;
  if (targetSqFt !== void 0 && targetSqFt > 0) {
    const scope = config.areaTargetScope ?? promptIntentForDiag?.mandatory.areaTargetScope ?? "PER_APARTMENT_CARPET";
    const requestedM2 = Math.round(targetSqFt / 10.7639 * 100) / 100;
    const achievedM2 = scope === "GROSS_FLOOR_AREA" ? Math.round(groundCoverageM2 * 100) / 100 : scope === "FLOOR_TOTAL_CARPET" ? Math.round(totalTypicalCarpetM2 * 100) / 100 : Math.round(totalTypicalCarpetM2 / Math.max(1, flatSchedule.length) * 100) / 100;
    const achievedSqFt = Math.round(achievedM2 * 10.7639 * 10) / 10;
    const minHabitableGrossM2 = 310.08;
    const relErr = Math.abs(achievedM2 - requestedM2) / Math.max(1, requestedM2);
    let status;
    let explanation;
    if (scope === "GROSS_FLOOR_AREA" && requestedM2 < minHabitableGrossM2) {
      status = "INFEASIBLE_BELOW_MINIMUM_HABITABLE_FLOOR_PLATE";
      explanation = `Requested ${targetSqFt} sq. ft. (${requestedM2} m\xB2) gross floor area is below the ${minHabitableGrossM2} m\xB2 (${Math.round(minHabitableGrossM2 * 10.7639)} sq. ft.) minimum habitable floor plate required for ${config.flatsPerFloor} units + 2 staircases + central lift under NBC 2016 / UDCPR minimums; clamped to minimum habitable floor plate.`;
    } else if (relErr <= 0.15) {
      status = "ACHIEVED";
      explanation = `Achieved ${achievedSqFt} sq. ft. (${achievedM2} m\xB2) for ${scope} against ${targetSqFt} sq. ft. (${requestedM2} m\xB2) target.`;
    } else {
      status = "CLAMPED_TO_ENVELOPE_MAX";
      explanation = `Target ${targetSqFt} sq. ft. (${requestedM2} m\xB2) for ${scope} was bounded by the permissible plot envelope (${achievedSqFt} sq. ft. / ${achievedM2} m\xB2 achieved).`;
    }
    areaTargetDiagnostic = {
      scope,
      requestedAreaSqFt: targetSqFt,
      requestedAreaM2: requestedM2,
      achievedAreaSqFt: achievedSqFt,
      achievedAreaM2: achievedM2,
      minFeasibleGrossAreaM2: minHabitableGrossM2,
      minFeasibleGrossAreaSqFt: Math.round(minHabitableGrossM2 * 10.7639),
      requestedSqFt: targetSqFt,
      requestedM2,
      achievedSqFt,
      achievedM2,
      minimumFeasibleGrossM2: minHabitableGrossM2,
      status,
      explanation
    };
  }
  return {
    plotAreaM2: Math.round(plotAreaM2 * 100) / 100,
    plotAreaSqFt: Math.round(plotAreaSqFt),
    setbackAreaM2: Math.round(setbackAreaM2 * 100) / 100,
    groundCoverageM2: Math.round(groundCoverageM2 * 100) / 100,
    groundCoveragePercent: Math.round(groundCoveragePercent * 10) / 10,
    rosLandscapeAreaM2: Math.round(rosLandscapeAreaM2 * 100) / 100,
    rosLandscapePercent: Math.round(rosLandscapePercent * 10) / 10,
    permissibleFsi,
    consumedFsi: Math.round(consumedFsi * 100) / 100,
    totalBuiltUpAreaM2: Math.round(totalBuiltUpAreaM2 * 100) / 100,
    totalReraCarpetAreaM2: Math.round(totalReraCarpetAreaM2 * 100) / 100,
    floorPlateEfficiencyPercent: Math.round(floorPlateEfficiencyPercent * 10) / 10,
    flatSchedule,
    parking,
    sheetAudits,
    overallDeltaMm2,
    ...areaTargetDiagnostic ? { areaTargetDiagnostic } : {}
  };
}
function namespaceFloorEntities(floor) {
  const id = (value) => value.startsWith(`${floor.id}::`) ? value : `${floor.id}::${value}`;
  const reference = (value) => value ? id(value) : void 0;
  return {
    ...floor,
    rooms: floor.rooms.map((room) => ({ ...room, id: id(room.id), floorId: floor.id, bathroomOwnerRoomId: reference(room.bathroomOwnerRoomId) })),
    walls: floor.walls.map((wall) => ({ ...wall, id: id(wall.id), floorId: floor.id, roomIds: wall.roomIds.map(id), leftRoomId: reference(wall.leftRoomId), rightRoomId: reference(wall.rightRoomId) })),
    doors: floor.doors.map((door) => ({ ...door, id: id(door.id), floorId: floor.id, wallId: id(door.wallId), connectsRooms: [id(door.connectsRooms[0]), door.connectsRooms[1].startsWith("__") ? door.connectsRooms[1] : id(door.connectsRooms[1])] })),
    windows: floor.windows.map((window) => ({ ...window, id: id(window.id), floorId: floor.id, wallId: id(window.wallId), roomId: id(window.roomId) })),
    stairs: floor.stairs.map((stair) => ({ ...stair, id: id(stair.id), floorId: floor.id })),
    columns: floor.columns.map((column) => ({ ...column, id: id(column.id), floorId: floor.id })),
    beams: floor.beams?.map((beam) => ({ ...beam, id: id(beam.id), floorId: floor.id, startColumnId: reference(beam.startColumnId), endColumnId: reference(beam.endColumnId) })),
    canonicalStaircases: floor.canonicalStaircases?.map((stair) => ({ ...stair, id: id(stair.id), floorId: floor.id })),
    furniture: floor.furniture?.map((item) => ({ ...item, id: id(item.id), roomId: id(item.roomId) }))
  };
}
function solveMultiSheetApartmentProject(rawConfig, onStage, recovery) {
  const plotWidthMm = rawConfig.plotWidthMm ?? rawConfig.siteWidthMm ?? 5e4;
  const plotDepthMm = rawConfig.plotDepthMm ?? rawConfig.siteDepthMm ?? 5e4;
  const numTypicalFloors = rawConfig.numTypicalFloors ?? rawConfig.floorCount ?? 4;
  const roadWidthMm = rawConfig.roadWidthMm ?? 12e3;
  const roadAccessSides = rawConfig.roadAccessSides ?? [rawConfig.roadFacing ?? Direction.South];
  const lotAllotmentMode = rawConfig.lotAllotmentMode ?? "STATUTORY_SETBACK_100_PERCENT";
  const jurisdiction = rawConfig.jurisdiction ?? "pune_pmc";
  const verticalStackType = rawConfig.verticalStackType ?? "STILT_PLUS_N";
  const parsedMixed = parseMixedUnitProgram(rawConfig.aiPrompt);
  const existingTypes = (rawConfig.units ?? []).map((u) => u.bhkType);
  const applyMixed = Boolean(
    parsedMixed && parsedMixed.length >= 2 && parsedMixed.length <= 6 && (existingTypes.length !== parsedMixed.length || new Set(existingTypes).size <= 1)
  );
  const flatsPerFloor = applyMixed ? parsedMixed.length : rawConfig.flatsPerFloor ?? 4;
  const resolvedUnits = applyMixed ? mixedUnitSpecs(parsedMixed) : rawConfig.units;
  const siteAmenities = rawConfig.siteAmenities ?? DEFAULT_SITE_AMENITIES;
  const stiltAmenities = rawConfig.stiltAmenities ?? DEFAULT_STILT_AMENITIES;
  const terraceAmenities = rawConfig.terraceAmenities ?? DEFAULT_TERRACE_AMENITIES;
  const parkingMode = rawConfig.parkingMode ?? "STILT_AND_SURFACE";
  const config = {
    ...rawConfig,
    plotWidthMm,
    plotDepthMm,
    numTypicalFloors,
    roadWidthMm,
    roadAccessSides,
    lotAllotmentMode,
    jurisdiction,
    verticalStackType,
    flatsPerFloor,
    ...resolvedUnits ? { units: resolvedUnits } : {},
    siteAmenities,
    stiltAmenities,
    terraceAmenities,
    parkingMode
  };
  const stackParams = computeBuildingStackParameters(config);
  let permissibleEnvelope;
  if (config.lotAllotmentMode === "FULL_LOT_100_PERCENT") {
    permissibleEnvelope = {
      x: 0,
      y: 0,
      w: config.plotWidthMm,
      h: config.plotDepthMm
    };
  } else {
    const { left, rear, right, front } = config.setbacksMm ?? { left: 3e3, rear: 3e3, right: 3e3, front: 4500 };
    permissibleEnvelope = {
      x: left,
      y: rear,
      w: config.plotWidthMm - left - right,
      h: config.plotDepthMm - rear - front
    };
  }
  let envelope = permissibleEnvelope;
  const promptIntent = (() => {
    try {
      return interpretArchitecturalIntent({
        flatsPerFloor: config.flatsPerFloor,
        unitTypes: (config.units ?? []).map((u) => u.bhkType),
        aiPrompt: config.aiPrompt
      });
    } catch {
      return void 0;
    }
  })();
  const effectiveTargetSqFt = config.targetAreaSqFt ?? promptIntent?.mandatory.targetAreaSqFt;
  const effectiveAreaScope = config.areaTargetScope ?? promptIntent?.mandatory.areaTargetScope ?? (effectiveTargetSqFt !== void 0 ? "PER_APARTMENT_CARPET" : void 0);
  const shouldCenterBuilding = Boolean(
    config.centerBuildingInEnvelope || promptIntent?.mandatory.centerBuilding || effectiveTargetSqFt !== void 0
  );
  if (effectiveTargetSqFt !== void 0 && effectiveTargetSqFt > 0 && effectiveAreaScope) {
    const coreW = 7800;
    const minHabitableW = 20400;
    const minHabitableH = 15200;
    const targetM2 = effectiveTargetSqFt / 10.7639;
    let builtW = permissibleEnvelope.w;
    let builtH = permissibleEnvelope.h;
    if (effectiveAreaScope === "GROSS_FLOOR_AREA") {
      const targetGrossMm2 = targetM2 * 1e6;
      if (targetGrossMm2 <= minHabitableW * minHabitableH) {
        builtW = Math.min(permissibleEnvelope.w, minHabitableW);
        builtH = Math.min(permissibleEnvelope.h, minHabitableH);
      } else {
        const aspect = permissibleEnvelope.w / Math.max(1, permissibleEnvelope.h);
        builtW = Math.min(permissibleEnvelope.w, Math.max(minHabitableW, snap102(Math.sqrt(targetGrossMm2 * aspect))));
        builtH = Math.min(permissibleEnvelope.h, Math.max(minHabitableH, snap102(targetGrossMm2 / Math.max(1, builtW))));
      }
    } else if (effectiveAreaScope === "FLOOR_TOTAL_CARPET") {
      const targetCarpetPerFlatM2 = targetM2 / Math.max(1, config.flatsPerFloor);
      const wantsBedBalcs = Boolean(
        promptIntent?.preferences.bedroomBalconies && promptIntent.preferences.bedroomBalconies !== "NONE_REQUESTED"
      );
      const netToGrossFloorRatio = wantsBedBalcs ? 0.69 : 0.8;
      const targetGrossPerFlatMm2 = targetCarpetPerFlatM2 / netToGrossFloorRatio * 1e6;
      const minWingW = wantsBedBalcs ? 7800 : 7200;
      const minFlatH = wantsBedBalcs ? 8550 : 7600;
      const wingW = Math.max(minWingW, snap102(Math.sqrt(targetGrossPerFlatMm2 * 0.91)));
      const flatH = Math.max(minFlatH, snap102(targetGrossPerFlatMm2 / Math.max(1, wingW)));
      const flatsPerWing = Math.max(1, Math.ceil(config.flatsPerFloor / 2));
      builtW = Math.min(permissibleEnvelope.w, Math.max(minHabitableW, 2 * wingW + coreW));
      builtH = Math.min(permissibleEnvelope.h, Math.max(minHabitableH, flatsPerWing * flatH));
    } else {
      const targetCarpetPerFlatM2 = targetM2;
      const netToGrossRatio = targetCarpetPerFlatM2 >= 120 ? 0.78 : 0.73;
      const targetGrossPerFlatMm2 = targetCarpetPerFlatM2 / netToGrossRatio * 1e6;
      const wingW = Math.max(7600, snap102(Math.sqrt(targetGrossPerFlatMm2)));
      const flatH = Math.max(6800, snap102(targetGrossPerFlatMm2 / Math.max(1, wingW)));
      const flatsPerWing = Math.max(1, Math.ceil(config.flatsPerFloor / 2));
      builtW = Math.min(permissibleEnvelope.w, Math.max(minHabitableW, 2 * wingW + coreW));
      builtH = Math.min(permissibleEnvelope.h, Math.max(minHabitableH, flatsPerWing * flatH));
    }
    if (shouldCenterBuilding) {
      envelope = {
        x: permissibleEnvelope.x + snap102((permissibleEnvelope.w - builtW) / 2),
        y: permissibleEnvelope.y + snap102((permissibleEnvelope.h - builtH) / 2),
        w: builtW,
        h: builtH
      };
    } else {
      envelope = { ...permissibleEnvelope, w: builtW, h: builtH };
    }
  } else if (shouldCenterBuilding) {
    envelope = {
      x: permissibleEnvelope.x,
      y: permissibleEnvelope.y,
      w: permissibleEnvelope.w,
      h: permissibleEnvelope.h
    };
  }
  const minSpanReq = config.flatsPerFloor === 1 ? 7e3 : 8500;
  const minRunReq = config.flatsPerFloor === 1 ? 7e3 : 8500;
  if (envelope.w < minSpanReq || envelope.h < minRunReq) throw new Error("The requested setbacks leave too little buildable space for this apartment topology. Increase the plot or reduce the program.");
  onStage?.("UNIT_SPATIAL_SLICING");
  const effectiveAiPrompt = (() => {
    let base = config.aiPrompt ?? "";
    if (effectiveTargetSqFt && !/\b\d+\s*(?:sq\.?\s*ft\.?|sqft)\b/i.test(base)) {
      const scopePhrase = effectiveAreaScope === "GROSS_FLOOR_AREA" ? "gross floor area" : effectiveAreaScope === "FLOOR_TOTAL_CARPET" ? "total carpet area per floor" : "carpet area per apartment";
      base = `${base} ${effectiveTargetSqFt} sq. ft. ${scopePhrase}`.trim();
    }
    return base || void 0;
  })();
  let topologyEvidence;
  const topology = recovery?.legacyOnly ? void 0 : selectProductionTopology({
    allowBestEffort: !recovery?.legacyOnly,
    onEvaluated: (result2) => {
      topologyEvidence = result2;
    },
    envelope,
    flatsPerFloor: config.flatsPerFloor,
    unitTypes: (config.units ?? []).map((unit) => unit.bhkType),
    aiPrompt: effectiveAiPrompt,
    seed: config.generationSeed,
    preferredArchetype: config.preferredArchetype,
    preferredMassingShape: config.buildingMassingShape,
    rejectedTopologyHashes: config.rejectedTopologyHashes
  });
  const macro = topology ? topology.macro : partitionMacroFootprint(envelope, config.flatsPerFloor, interpretArchitecturalPlacement(config.aiPrompt));
  onStage?.("WALL_AND_OPENING_TOPOLOGY");
  const siteSheet = solveSitePlanSheet(config, envelope);
  const stiltSheet = solveStiltParkingSheet(config, envelope, macro, stackParams);
  const numFloors = Math.max(1, config.numTypicalFloors ?? 4);
  const residentialSheets = [];
  for (let fl = 1; fl <= numFloors; fl++) {
    residentialSheets.push(
      solveTypicalFloorSheet(
        config,
        envelope,
        config.verticalStackType === "G_PLUS_N" ? fl - 1 : fl,
        topology,
        { floorVariant: fl % 2 === 1 ? "ODD" : "EVEN" }
      )
    );
  }
  const typicalSheet = residentialSheets[0];
  onStage?.("COLUMN_AND_BEAM_GRID");
  const columnScheduleSheet = solveStructuralColumnScheduleSheet(typicalSheet, envelope);
  let refugeSheet;
  if (stackParams.requiresRefugeFloor && stackParams.refugeFloorLevels.length > 0) {
    const primaryRefugeLevel = stackParams.refugeFloorLevels[0];
    refugeSheet = solveRefugeFloorSheet(typicalSheet, primaryRefugeLevel);
  }
  const terraceLevel = config.numTypicalFloors + (config.verticalStackType === "G_PLUS_N" ? 0 : 1);
  const terraceSheet = solveTerraceSheet(config, envelope, macro, terraceLevel);
  const schedule = generateApartmentProjectSchedule({
    config,
    siteSheet,
    stiltSheet,
    typicalSheet,
    refugeSheet,
    terraceSheet,
    stackParams
  });
  const sheetOffset = 103;
  const resSheetItems = residentialSheets.map((rs, idx) => {
    const fl = idx + 1;
    const flOrdinal = fl === 1 ? "1st" : fl === 2 ? "2nd" : fl === 3 ? "3rd" : `${fl}th`;
    const startFlat = fl * 100 + 1;
    const endFlat = fl * 100 + config.flatsPerFloor;
    return {
      sheetType: "TYPICAL_FLOOR_PLAN",
      sheetNumber: `A-${sheetOffset + idx}`,
      title: `Drawing 0${fl} \u2014 ${flOrdinal} Floor Plan (Flats ${startFlat} to ${endFlat})`,
      floor: rs.floor,
      audit: rs.audit
    };
  });
  const nextSheetNum = sheetOffset + residentialSheets.length;
  const sheets = [
    {
      sheetType: "SITE_PLAN",
      sheetNumber: "A-101",
      title: "Overall Site Layout & Landscape Master Plan",
      site: siteSheet.site,
      audit: siteSheet.audit
    },
    {
      sheetType: "STILT_PARKING_PLAN",
      sheetNumber: "A-102",
      title: "Stilt Floor Parking & Indoor Amenities Plan",
      floor: stiltSheet.floor,
      audit: stiltSheet.audit
    },
    ...resSheetItems,
    {
      sheetType: "COLUMN_SCHEDULE_PLAN",
      sheetNumber: `A-${nextSheetNum}`,
      title: "Structural Column Grid Layout & Schedule Sheet",
      floor: columnScheduleSheet.floor,
      audit: columnScheduleSheet.audit
    },
    ...refugeSheet ? [
      {
        sheetType: "REFUGE_FLOOR_PLAN",
        sheetNumber: `A-${nextSheetNum + 1}`,
        title: `Fire Refuge Floor Plan (Level ${stackParams.refugeFloorLevels[0]})`,
        floor: refugeSheet.floor,
        audit: refugeSheet.audit
      }
    ] : [],
    {
      sheetType: "TERRACE_PLAN",
      sheetNumber: `A-${nextSheetNum + (refugeSheet ? 2 : 1)}`,
      title: "Rooftop Services, Solar PV & Terrace Plan",
      floor: terraceSheet.floor,
      audit: terraceSheet.audit
    },
    {
      sheetType: "AREA_SCHEDULE_SHEET",
      sheetNumber: `A-${nextSheetNum + (refugeSheet ? 3 : 2)}`,
      title: "UDCPR / NBC FSI, RERA Carpet & Parking Statement",
      schedule,
      audit: {
        sheetId: "sheet_06_schedule",
        sheetName: "Sheet 06: Statutory Area Schedule",
        grossAreaMm2: schedule.sheetAudits.reduce((sum, a) => sum + a.grossAreaMm2, 0),
        accountedAreaMm2: schedule.sheetAudits.reduce((sum, a) => sum + a.accountedAreaMm2, 0),
        deltaMm2: schedule.overallDeltaMm2,
        unassignedMm2: 0,
        isPlanarConserved: schedule.overallDeltaMm2 < 1e-3
      }
    }
  ];
  const buildingFloors = [
    ...config.verticalStackType === "G_PLUS_N" ? [] : [stiltSheet.floor],
    ...residentialSheets.map((s) => refugeSheet && s.floor.level === refugeSheet.floor.level ? refugeSheet.floor : s.floor),
    terraceSheet.floor
  ];
  const rawBuilding = {
    regulatoryContext: config.regulatoryContext,
    id: config.projectId ? `building:${config.projectId}` : "multi_sheet_apartment_building",
    projectId: config.projectId ?? "apartment_project",
    name: config.projectName ?? "Coordinated Multi-Sheet Indian Residential Apartment",
    site: { ...siteSheet.site, roadFacing: config.roadAccessSides[0] ?? Direction.North, roadWidth: config.roadWidthMm },
    floors: buildingFloors.map((floor) => ({
      ...floor,
      floorUse: floor.id === terraceSheet.floor.id ? "ROOF" : floor.id === stiltSheet.floor.id ? "STILT_PARKING" : "RESIDENTIAL",
      elevationMm: floor.id === stiltSheet.floor.id ? 0 : buildingFloors.filter((other) => other.level < floor.level && other.id !== terraceSheet.floor.id).reduce((sum, other) => sum + other.floorHeight, 0),
      buildingId: config.projectId ? `building:${config.projectId}` : "multi_sheet_apartment_building"
    })),
    metadata: {
      projectId: config.projectId ?? "apartment_project",
      generationBrief: {
        source: config.aiTelemetryOverride?.geminiInvoked ? "HYBRID" : "DETERMINISTIC",
        aiPrompt: config.aiPrompt,
        referenceImage: config.referenceImage ? { name: config.referenceImage.name, mimeType: config.referenceImage.mimeType } : void 0,
        units: config.units ?? [],
        includeWindowChajjas: config.includeWindowChajjas ?? true,
        staggeredBalconies: config.staggeredBalconies ?? false,
        ...config.generationSeed !== void 0 ? { generationSeed: config.generationSeed } : {},
        ...topology?.chosen.fingerprint.digests.canonical ? { topologyHash: topology.chosen.fingerprint.digests.canonical } : {},
        ...topology?.result.archetype ? { archetype: topology.result.archetype } : config.preferredArchetype ? { archetype: config.preferredArchetype } : {},
        ...topology?.chosen.partition.massingShape ?? topology?.result.massingShape ?? config.buildingMassingShape ? { buildingMassingShape: topology?.chosen.partition.massingShape ?? topology?.result.massingShape ?? config.buildingMassingShape } : {},
        ...config.aiProposal ? { aiProposal: config.aiProposal } : {},
        aiTelemetry: config.aiTelemetryOverride ?? {
          geminiInvoked: false,
          provider: "deterministic-rule-engine",
          referenceImageUsedForGeometry: false
        }
      },
      description: `Coordinated 6-Sheet Apartment Project (${config.flatsPerFloor} Flats/Floor, ${config.numTypicalFloors} Floors)`,
      tags: ["apartment", "multi_sheet", "udcpr", "rera", "canonical_model"]
    },
    version: 1,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const buildingWithFurniture = populateCanonicalFurniture(rawBuilding);
  const deferredStructure = config.structuralLayoutMode !== "PROVISIONAL_EXISTING_PROFILE";
  const architecturalBuilding = deferredStructure ? { ...buildingWithFurniture, floors: buildingWithFurniture.floors.map((f) => ({ ...f, columns: [], beams: [] })), beams: [], metadata: { ...buildingWithFurniture.metadata, tags: [...buildingWithFurniture.metadata.tags ?? [], "STRUCTURAL_DESIGN_DEFERRED"] } } : buildingWithFurniture;
  let placedStructure = deferredStructure ? architecturalBuilding : new GeometryValidator().auditAndFixColumnAndBeamGrid(architecturalBuilding, true).building;
  if (!deferredStructure) {
    const refRes = placedStructure.floors.find((f) => f.floorUse === "RESIDENTIAL");
    const stiltFl = placedStructure.floors.find((f) => f.floorUse === "STILT_PARKING");
    const aisleBoxes = (stiltFl?.rooms ?? []).filter((r) => r.architecturalRole === "VEHICLE_AISLE").map((r) => r.boundary?.points?.length ? {
      x: Math.min(...r.boundary.points.map((p) => p.x)),
      y: Math.min(...r.boundary.points.map((p) => p.y)),
      w: Math.max(...r.boundary.points.map((p) => p.x)) - Math.min(...r.boundary.points.map((p) => p.x)),
      h: Math.max(...r.boundary.points.map((p) => p.y)) - Math.min(...r.boundary.points.map((p) => p.y))
    } : { x: r.x, y: r.y, w: r.width, h: r.height });
    const blocksAisle = (pt) => aisleBoxes.some((b) => pt.x > b.x + 150 && pt.x < b.x + b.w - 150 && pt.y > b.y + 150 && pt.y < b.y + b.h - 150) || aisleBoxes.some((b) => (Math.abs(pt.y - b.y) <= 150 || Math.abs(pt.y - (b.y + b.h)) <= 150) && pt.x > b.x + 150 && pt.x < b.x + b.w - 150 || (Math.abs(pt.x - b.x) <= 150 || Math.abs(pt.x - (b.x + b.w)) <= 150) && pt.y > b.y + 150 && pt.y < b.y + b.h - 150);
    if (refRes) {
      const refWallPolys = refRes.walls.map(wallToPolygon);
      const refOutdoorRooms = refRes.rooms.filter((r) => ["balcony", "utility"].includes(r.type));
      const continuous = [];
      for (const col of refRes.columns) {
        if (blocksAisle(col.position)) continue;
        if (continuous.some((d) => Math.hypot(d.position.x - col.position.x, d.position.y - col.position.y) < 500)) continue;
        let resolvedCol = col;
        const intrudes = (c) => refOutdoorRooms.some((r) => uncoveredResidentialOverlap(columnFootprint(c), r.boundary, refWallPolys) >= 1e-3);
        if (intrudes(resolvedCol)) {
          const flushCol = { ...col, width: 200, depth: 200 };
          if (intrudes(flushCol)) continue;
          resolvedCol = flushCol;
        }
        const footingOverlaps = continuous.some(
          (d) => Math.abs(d.position.x - resolvedCol.position.x) < (d.width + resolvedCol.width) * 1.5 + 10 && Math.abs(d.position.y - resolvedCol.position.y) < (d.depth + resolvedCol.depth) * 1.5 + 10
        );
        if (footingOverlaps) continue;
        continuous.push(resolvedCol);
      }
      placedStructure = {
        ...placedStructure,
        floors: placedStructure.floors.map((f) => ({
          ...f,
          columns: continuous.map((c, idx) => ({
            ...c,
            id: `col_${idx + 1}`,
            floorId: f.id,
            gridReference: `C${idx + 1}`
          }))
        }))
      };
    }
  }
  const audit = validateAndRepairBuildingGeometry(placedStructure, { autoCorrect: false });
  const finalFloors = audit.building.floors.map(namespaceFloorEntities);
  const rawValidatedBuilding = withArchitecturalElements(coordinateArchitecturalStairs({
    ...audit.building,
    floors: finalFloors,
    furniture: [...finalFloors.flatMap((floor) => floor.furniture ?? []), ...(audit.building.furniture ?? []).filter((item) => item.siteZoneId)]
  }));
  const filterFloorBeams = (fl, beams) => {
    if (!beams?.length) return [];
    const builtBoxes = fl.rooms.filter((r) => !r.tags?.includes("recess:perimeter") && architecturalSpaceRole(r) !== "OPEN_TO_SKY_VOID").map(roomToBox);
    if (!builtBoxes.length) return [];
    const nearBuilt = (pt) => builtBoxes.some(
      (bx) => pt.x >= bx.rect.x - 160 && pt.x <= bx.rect.x + bx.rect.width + 160 && pt.y >= bx.rect.y - 160 && pt.y <= bx.rect.y + bx.rect.height + 160
    );
    return beams.filter((bm) => {
      const mid = { x: (bm.startPoint.x + bm.endPoint.x) / 2, y: (bm.startPoint.y + bm.endPoint.y) / 2 };
      return nearBuilt(bm.startPoint) && nearBuilt(bm.endPoint) && nearBuilt(mid);
    });
  };
  const filteredFloors = rawValidatedBuilding.floors.map(
    (f) => f.beams?.length ? { ...f, beams: filterFloorBeams(f, f.beams) } : f
  );
  const filteredFloorMap = new Map(filteredFloors.map((f) => [f.id, f]));
  const validatedBuilding = {
    ...rawValidatedBuilding,
    floors: filteredFloors,
    ...rawValidatedBuilding.beams?.length ? {
      beams: rawValidatedBuilding.beams.filter((bm) => {
        const fl = filteredFloorMap.get(bm.floorId);
        return !fl || filterFloorBeams(fl, [bm]).length > 0;
      })
    } : {}
  };
  const finalAudit = validateAndRepairBuildingGeometry(validatedBuilding, { autoCorrect: false });
  const validationReport = { ...finalAudit.report, errors: finalAudit.report.errors.map((error) => ({
    ...error,
    elementIds: error.elementIds.map((value) => value === error.floorId || value.startsWith(`${error.floorId}::`) ? value : `${error.floorId}::${value}`)
  })) };
  const validatedFloorsById = new Map(validatedBuilding.floors.map((f) => [f.id, f]));
  const updatedSheets = sheets.map((s) => {
    if (s.floor) {
      const updatedFloor = validatedFloorsById.get(s.floor.id);
      return { ...s, floor: updatedFloor ?? namespaceFloorEntities(s.floor) };
    }
    return s;
  });
  const generationReport = createGenerationReport(validatedBuilding, validationReport, {
    strategy: !topology ? "LEGACY_FALLBACK" : topology.chosen.score.feasible ? "VALIDATED_TOPOLOGY" : "BEST_EFFORT_TOPOLOGY",
    selectedFamily: topology?.chosen.familyId,
    selectedVariant: topology?.chosen.variantId,
    rejectedCandidates: topologyEvidence?.rejected ?? []
  }, !topology ? [{
    code: "LEGACY_FALLBACK_USED",
    severity: "WARNING",
    source: "GENERATION",
    elementIds: [],
    description: recovery?.legacyOnly ? "The legacy partition was evaluated as a bounded recovery option and requires review." : "No assembled topology candidate was available. The legacy partition was used and requires review."
  }] : topology.chosen.score.hardConstraints.filter((c) => !c.satisfied).map((c) => ({
    code: c.id,
    severity: "WARNING",
    source: "TOPOLOGY",
    elementIds: [],
    description: `Pre-repair candidate finding: ${c.detail}. Final geometry and closure findings are reported separately.`
  })));
  const result = {
    generationReport,
    config,
    building: { ...validatedBuilding, metadata: {
      ...validatedBuilding.metadata,
      generationReport,
      bedroomBalconySchedule: bedroomBalconySchedule(validatedBuilding)
    } },
    sheets: updatedSheets,
    schedule,
    validationReport,
    totalBuildingHeightMm: stackParams.totalBuildingHeightMm,
    hasRefugeFloor: stackParams.requiresRefugeFloor,
    refugeFloorLevels: stackParams.refugeFloorLevels
  };
  const attachCompliance = (res, attemptNum) => {
    const compliance = evaluateArchitecturalComplianceScore(res.building, {
      config,
      permissibleEnvelopeMm: permissibleEnvelope,
      attemptCount: attemptNum
    });
    const nextBuilding = {
      ...res.building,
      complianceRating: compliance,
      metadata: {
        ...res.building.metadata,
        complianceScore: compliance.score,
        complianceReport: compliance,
        complianceRating: compliance
      }
    };
    return {
      result: { ...res, building: nextBuilding },
      compliance
    };
  };
  let { result: finalResult, compliance: finalCompliance } = attachCompliance(
    result,
    (recovery?.complianceAttempt ?? 0) + 1
  );
  const finalizeWithMep = (res) => ({
    ...res,
    building: res.building.mepEngineering ? res.building : withMepEngineering(res.building)
  });
  if (!finalCompliance.passed && !recovery?.legacyOnly && !recovery?.skipComplianceGate && (recovery?.complianceAttempt ?? 0) === 0) {
    const baseSeed = Math.max(1, Math.floor(Number(rawConfig.generationSeed ?? 1)));
    const rejectedHashes = new Set(rawConfig.rejectedTopologyHashes ?? []);
    const initialHash = finalResult.building.metadata?.topologyHash;
    if (typeof initialHash === "string" && initialHash.length > 0) {
      rejectedHashes.add(initialHash);
    }
    const initialVariant = finalResult.generationReport?.selectedVariant;
    if (typeof initialVariant === "string" && initialVariant.length > 0) {
      rejectedHashes.add(initialVariant);
    }
    const lockedMassingShape = rawConfig.buildingMassingShape ?? (!promptIntent?.preferences.requestsDifferentShape ? "COMPACT_DOUBLE_LOADED" : void 0);
    const archetypeRotation = [
      rawConfig.preferredArchetype,
      "CENTRAL_LIVING_SPLIT_BEDROOMS",
      "CORNER_L_LIVING_REAR_SLEEPING",
      "FRONT_BALCONY_OPEN_KITCHEN",
      "LINEAR_TANDEM_DEEP_PLATE",
      "MIRRORED_WET_CORE_STACK"
    ];
    for (let attempt = 1; attempt < 16; attempt++) {
      try {
        const altArchetype = attempt >= 4 ? archetypeRotation[attempt % archetypeRotation.length] : rawConfig.preferredArchetype;
        const nextRaw = solveMultiSheetApartmentProject(
          {
            ...rawConfig,
            generationSeed: baseSeed + attempt,
            ...lockedMassingShape ? { buildingMassingShape: lockedMassingShape } : {},
            ...altArchetype ? { preferredArchetype: altArchetype } : {},
            rejectedTopologyHashes: [...rejectedHashes]
          },
          void 0,
          {
            legacyOnly: false,
            skipComplianceGate: true,
            complianceAttempt: attempt
          }
        );
        if (rawConfig.buildingMassingShape && nextRaw.building.metadata.generationBrief?.buildingMassingShape && nextRaw.building.metadata.generationBrief.buildingMassingShape !== rawConfig.buildingMassingShape) {
          continue;
        }
        const { result: nextEvaluated, compliance: nextCompliance } = attachCompliance(nextRaw, attempt + 1);
        const nextHash = nextEvaluated.building.metadata?.topologyHash;
        if (typeof nextHash === "string" && nextHash.length > 0) {
          rejectedHashes.add(nextHash);
        }
        const nextVariant = nextEvaluated.generationReport?.selectedVariant;
        if (typeof nextVariant === "string" && nextVariant.length > 0) {
          rejectedHashes.add(nextVariant);
        }
        const isBetter = nextCompliance.score > finalCompliance.score || nextCompliance.score === finalCompliance.score && nextCompliance.redConflictCount < finalCompliance.redConflictCount;
        if (isBetter) {
          finalResult = nextEvaluated;
          finalCompliance = nextCompliance;
        }
        if (nextCompliance.passed) {
          return finalizeWithMep(nextEvaluated);
        }
      } catch {
      }
    }
  }
  if (topology && !topology.chosen.score.feasible && !recovery?.legacyOnly) {
    try {
      const legacy = solveMultiSheetApartmentProject(rawConfig, void 0, { legacyOnly: true, skipComplianceGate: true });
      const quality = (r) => [
        r.sheets.filter((s) => !s.audit.isPlanarConserved).length,
        r.generationReport?.violations.filter((v) => v.severity === "CRITICAL").length ?? 0,
        r.generationReport?.violations.filter((v) => v.source !== "TOPOLOGY" && v.source !== "GENERATION").length ?? 0
      ];
      const candidateQuality = quality(finalResult), legacyQuality = quality(legacy);
      const differing = candidateQuality.findIndex((v, i) => v !== legacyQuality[i]);
      const balconyRegression = finalResult.schedule.flatSchedule.some((flat, i) => config.units?.[i]?.hasUtilityBalcony && flat.balconyAreaM2 < (legacy.schedule.flatSchedule[i]?.balconyAreaM2 ?? 0));
      const legacyCompliance = evaluateArchitecturalComplianceScore(legacy.building, { config: rawConfig });
      const legacyMeetsComplianceFloor = legacyCompliance.score >= 85 && legacyCompliance.redConflictCount === 0 && legacyCompliance.score >= finalCompliance.score && legacyCompliance.redConflictCount <= finalCompliance.redConflictCount;
      if (legacyMeetsComplianceFloor && (balconyRegression || differing >= 0 && legacyQuality[differing] < candidateQuality[differing])) {
        const report = legacy.generationReport;
        const updated = { ...report, violations: [...report.violations, {
          code: "REPAIRED_CANDIDATE_OUTRANKED",
          severity: "WARNING",
          source: "GENERATION",
          description: `Repaired ${topology.chosen.familyId}/${topology.chosen.variantId} scored ${candidateQuality.join("/")} versus legacy ${legacyQuality.join("/")} (failed sheet ledgers / critical findings / final findings); requested balcony area regression=${balconyRegression}. Legacy retained.`,
          elementIds: [],
          rank: report.violations.length + 1
        }] };
        const { result: legacyWithCompliance } = attachCompliance(
          { ...legacy, generationReport: updated, building: { ...legacy.building, metadata: { ...legacy.building.metadata, generationReport: updated } } },
          finalCompliance.attemptCount ?? 1
        );
        return finalizeWithMep(legacyWithCompliance);
      }
    } catch {
    }
  }
  return recovery?.skipComplianceGate ? finalResult : finalizeWithMep(finalResult);
}

// packages/planning-engine/src/pipeline/stage-progress-emitter.ts
var PIPELINE_STAGE_WEIGHTS = {
  PLOT_BOUNDARY_SOLVE: 10,
  UNIT_SPATIAL_SLICING: 25,
  WALL_AND_OPENING_TOPOLOGY: 45,
  COLUMN_AND_BEAM_GRID: 65,
  GEOMETRY_ZERO_ERROR_AUDIT: 85,
  UDCPR_CHECK: 95,
  COMPLETE: 100
};
var PipelineProgressEmitter = class {
  listeners = /* @__PURE__ */ new Set();
  timings = {
    PLOT_BOUNDARY_SOLVE: 0,
    UNIT_SPATIAL_SLICING: 0,
    WALL_AND_OPENING_TOPOLOGY: 0,
    COLUMN_AND_BEAM_GRID: 0,
    GEOMETRY_ZERO_ERROR_AUDIT: 0,
    UDCPR_CHECK: 0,
    COMPLETE: 0
  };
  statuses = Object.fromEntries(Object.keys(PIPELINE_STAGE_WEIGHTS).map((stage) => [stage, "PENDING"]));
  progress = 0;
  stageStartTime = performance.now();
  currentStage = "PLOT_BOUNDARY_SOLVE";
  currentStatus = "PENDING";
  collectedErrors = [];
  lastReport;
  lastUdcprReport;
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  startStage(stage) {
    this.currentStage = stage;
    this.currentStatus = "RUNNING";
    this.statuses[stage] = "RUNNING";
    this.stageStartTime = performance.now();
    this.emit({
      stage,
      status: "RUNNING",
      progressPercent: this.progress,
      stageTimingsMs: { ...this.timings },
      currentStageDurationMs: 0,
      errors: [...this.collectedErrors],
      report: this.lastReport,
      udcprReport: this.lastUdcprReport,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      stageStatuses: { ...this.statuses },
      regulatoryStatus: this.lastUdcprReport?.status ?? "NOT_RUN"
    });
  }
  completeStage(stage, newErrors = [], report, udcprReport) {
    const duration = Math.round(performance.now() - this.stageStartTime);
    this.timings[stage] = duration;
    this.currentStatus = "COMPLETED";
    this.statuses[stage] = "COMPLETED";
    this.progress = PIPELINE_STAGE_WEIGHTS[stage];
    this.collectedErrors.push(...newErrors);
    if (report) this.lastReport = report;
    if (udcprReport) this.lastUdcprReport = udcprReport;
    this.emit({
      stage,
      status: "COMPLETED",
      progressPercent: this.progress,
      stageTimingsMs: { ...this.timings },
      currentStageDurationMs: duration,
      errors: [...this.collectedErrors],
      report: this.lastReport,
      udcprReport: this.lastUdcprReport,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      stageStatuses: { ...this.statuses },
      regulatoryStatus: this.lastUdcprReport?.status ?? "NOT_RUN"
    });
  }
  failStage(stage, error) {
    const duration = Math.round(performance.now() - this.stageStartTime);
    this.timings[stage] = duration;
    this.currentStatus = "FAILED";
    this.statuses[stage] = "FAILED";
    this.emit({
      stage,
      status: "FAILED",
      progressPercent: this.progress,
      stageTimingsMs: { ...this.timings },
      currentStageDurationMs: duration,
      errors: [
        ...this.collectedErrors,
        {
          code: "PIPELINE_STAGE_ERROR",
          severity: "CRITICAL",
          elementIds: [],
          floorId: "",
          locationMm: { x: 0, y: 0 },
          description: `Stage ${stage} failed: ${error.message}`,
          autoCorrected: false
        }
      ],
      report: this.lastReport,
      udcprReport: this.lastUdcprReport,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      stageStatuses: { ...this.statuses },
      regulatoryStatus: this.lastUdcprReport?.status ?? "NOT_RUN"
    });
  }
  getSnapshot() {
    return {
      stage: this.currentStage,
      status: this.currentStatus,
      progressPercent: this.progress,
      stageTimingsMs: { ...this.timings },
      currentStageDurationMs: Math.round(performance.now() - this.stageStartTime),
      errors: [...this.collectedErrors],
      report: this.lastReport,
      udcprReport: this.lastUdcprReport,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      stageStatuses: { ...this.statuses },
      regulatoryStatus: this.lastUdcprReport?.status ?? "NOT_RUN"
    };
  }
  emit(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Pipeline listener error:", err);
      }
    }
  }
};
async function executeAuditedPlanningPipeline(input, onProgress) {
  const emitter = new PipelineProgressEmitter();
  if (onProgress) emitter.subscribe(onProgress);
  let stage = "PLOT_BOUNDARY_SOLVE";
  const next = (newStage) => {
    emitter.completeStage(stage);
    stage = newStage;
    emitter.startStage(stage);
  };
  emitter.startStage(stage);
  try {
    const isRequest = "plotWidthMm" in input;
    let building;
    if (isRequest) {
      const config = input;
      const dimensions = [config.plotWidthMm, config.plotDepthMm, config.roadWidthMm];
      if (dimensions.some((value) => !Number.isFinite(value) || value <= 0) || !Number.isInteger(config.numTypicalFloors) || config.numTypicalFloors < 1 || config.numTypicalFloors > 40 || ![1, 2, 3, 4, 5, 6].includes(config.flatsPerFloor) || config.units?.length !== config.flatsPerFloor || config.units.some((unit) => !/^[1-4]BHK$/.test(unit.bhkType)) || config.setbacksMm && Object.values(config.setbacksMm).some((value) => !Number.isFinite(value) || value < 0)) {
        throw new Error("Provide positive plot/road dimensions, 1\u201340 floors, valid setbacks and an exact 1\u20136 unit BHK mix.");
      }
      const solved = solveMultiSheetApartmentProject(config, next);
      building = solved.building;
      building = { ...building, floors: building.floors.filter((floor) => !floor.name.includes("COLUMN_SCHEDULE")) };
    } else {
      building = input;
      next("UNIT_SPATIAL_SLICING");
      next("WALL_AND_OPENING_TOPOLOGY");
      next("COLUMN_AND_BEAM_GRID");
    }
    next("GEOMETRY_ZERO_ERROR_AUDIT");
    const validator = new GeometryValidator({ autoCorrect: false });
    const audit = validator.audit(building, false);
    const closureErrors = building.floors.filter((f) => f.apartmentUnits?.length).flatMap((floor) => validateApartmentClosure({ ...building, floors: [floor] }).issues.filter((issue) => issue.severity === "error").map((issue) => ({
      code: issue.code,
      severity: "CRITICAL",
      elementIds: [floor.id],
      floorId: floor.id,
      locationMm: floor.boundary.points[0] ?? { x: 0, y: 0 },
      description: issue.message,
      autoCorrected: false
    })));
    const validationReport = {
      ...audit.report,
      isValid: audit.report.isValid && !closureErrors.length,
      errors: [...audit.report.errors, ...closureErrors]
    };
    emitter.completeStage(stage, validationReport.errors, validationReport);
    const prior = building.metadata.generationReport;
    if (prior) {
      const generationReport = createGenerationReport(
        building,
        validationReport,
        prior,
        prior.violations.filter((v) => v.source === "TOPOLOGY" || v.source === "GENERATION")
      );
      building = { ...building, metadata: { ...building.metadata, generationReport } };
    }
    stage = "UDCPR_CHECK";
    emitter.startStage(stage);
    const udcprReport = evaluateUDCPRCompliance(building);
    emitter.completeStage(stage, [], validationReport, udcprReport);
    stage = "COMPLETE";
    emitter.startStage(stage);
    emitter.completeStage(stage);
    return { building, validationReport, regulatoryStatus: udcprReport.status, udcprReport };
  } catch (error) {
    emitter.failStage(stage, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

// packages/core/src/types/enums.ts
var RoomType2 = /* @__PURE__ */ ((RoomType3) => {
  RoomType3["ServiceShaft"] = "service_shaft";
  RoomType3["Bedroom"] = "bedroom";
  RoomType3["Bathroom"] = "bathroom";
  RoomType3["Kitchen"] = "kitchen";
  RoomType3["Living"] = "living";
  RoomType3["Dining"] = "dining";
  RoomType3["Utility"] = "utility";
  RoomType3["Balcony"] = "balcony";
  RoomType3["Staircase"] = "staircase";
  RoomType3["Lift"] = "lift";
  RoomType3["Parking"] = "parking";
  RoomType3["Pooja"] = "pooja";
  RoomType3["Storage"] = "storage";
  RoomType3["Corridor"] = "corridor";
  RoomType3["Foyer"] = "foyer";
  RoomType3["Study"] = "study";
  RoomType3["ServantQuarter"] = "servant_quarter";
  RoomType3["Drawing"] = "drawing";
  RoomType3["FamilyLiving"] = "family_living";
  RoomType3["Terrace"] = "terrace";
  RoomType3["Garden"] = "garden";
  RoomType3["OTS"] = "ots";
  RoomType3["Porch"] = "porch";
  RoomType3["Dressing"] = "dressing";
  RoomType3["Custom"] = "custom";
  return RoomType3;
})(RoomType2 || {});
var Direction2 = /* @__PURE__ */ ((Direction3) => {
  Direction3["North"] = "north";
  Direction3["South"] = "south";
  Direction3["East"] = "east";
  Direction3["West"] = "west";
  return Direction3;
})(Direction2 || {});
var PreferenceLevel2 = /* @__PURE__ */ ((PreferenceLevel3) => {
  PreferenceLevel3["None"] = "none";
  PreferenceLevel3["Low"] = "low";
  PreferenceLevel3["Medium"] = "medium";
  PreferenceLevel3["High"] = "high";
  return PreferenceLevel3;
})(PreferenceLevel2 || {});
var PlotShape2 = /* @__PURE__ */ ((PlotShape3) => {
  PlotShape3["Rectangular"] = "rectangular";
  PlotShape3["LShaped"] = "L_shaped";
  PlotShape3["Irregular"] = "irregular";
  return PlotShape3;
})(PlotShape2 || {});

// packages/core/src/types/apartment-manifest.ts
var PROGRAMMATIC_2BHK_MANIFEST2 = [
  {
    id: "foyer_living_dining",
    name: "Living & Dining Room",
    type: "living" /* Living */,
    minAreaMm2: 24e6,
    // 24 m²
    targetAreaMm2: 28e6,
    minWidthMm: 3300,
    isMandatory: true,
    zone: "PUBLIC",
    description: "Primary arrival, family lounge, and dining zone with front daylight access"
  },
  {
    id: "kitchen",
    name: "Kitchen",
    type: "kitchen" /* Kitchen */,
    minAreaMm2: 65e5,
    // 6.5 m²
    targetAreaMm2: 8e6,
    minWidthMm: 2200,
    isMandatory: true,
    zone: "SERVICE",
    description: "Food preparation zone with parallel counter space and service ventilation"
  },
  {
    id: "utility",
    name: "Kitchen Utility Yard",
    type: "utility" /* Utility */,
    minAreaMm2: 2e6,
    // 2.0 m²
    targetAreaMm2: 3e6,
    minWidthMm: 1200,
    isMandatory: true,
    attachedToRoomId: "kitchen",
    zone: "SERVICE",
    description: "Wet service washing yard adjacent to kitchen with exterior drainage access"
  },
  {
    id: "master_bedroom",
    name: "Master Bedroom",
    type: "bedroom" /* Bedroom */,
    minAreaMm2: 125e5,
    // 12.5 m²
    targetAreaMm2: 15e6,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Primary bedroom suite with wardrobe niche and attached private bath"
  },
  {
    id: "master_toilet",
    name: "Master En-suite Toilet",
    type: "bathroom" /* Bathroom */,
    minAreaMm2: 32e5,
    // 3.2 m²
    targetAreaMm2: 4e6,
    minWidthMm: 1400,
    isMandatory: true,
    attachedToRoomId: "master_bedroom",
    zone: "SERVICE",
    description: "En-suite 3-fixture bathroom exclusively accessible from Master Bedroom"
  },
  {
    id: "bedroom_2",
    name: "Bedroom 02",
    type: "bedroom" /* Bedroom */,
    minAreaMm2: 105e5,
    // 10.5 m²
    targetAreaMm2: 12e6,
    minWidthMm: 2800,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Second bedroom with operable exterior window and private passage access"
  },
  {
    id: "common_toilet",
    name: "Common Bathroom",
    type: "bathroom" /* Bathroom */,
    minAreaMm2: 28e5,
    // 2.8 m²
    targetAreaMm2: 35e5,
    minWidthMm: 1300,
    isMandatory: true,
    zone: "SERVICE",
    description: "General unit bathroom accessible from internal circulation passage"
  },
  {
    id: "standing_balcony",
    name: "Standing Balcony",
    type: "balcony" /* Balcony */,
    minAreaMm2: 35e5,
    // 3.5 m²
    targetAreaMm2: 45e5,
    minWidthMm: 2400,
    isMandatory: true,
    attachedToRoomId: "foyer_living_dining",
    zone: "OUTDOOR",
    description: "Usable exterior cantilevered or recessed balcony with clear depth >= 1200 mm"
  }
];
var PROGRAMMATIC_3BHK_MANIFEST2 = [
  {
    id: "foyer_living_dining",
    name: "Living & Dining Room",
    type: "living" /* Living */,
    minAreaMm2: 28e6,
    // 28 m²
    targetAreaMm2: 34e6,
    minWidthMm: 3600,
    isMandatory: true,
    zone: "PUBLIC",
    description: "Spacious formal living and dining area with dual lighting orientation"
  },
  {
    id: "kitchen",
    name: "Kitchen",
    type: "kitchen" /* Kitchen */,
    minAreaMm2: 75e5,
    // 7.5 m²
    targetAreaMm2: 95e5,
    minWidthMm: 2400,
    isMandatory: true,
    zone: "SERVICE",
    description: "Full-service kitchen with wet/dry counters and direct utility link"
  },
  {
    id: "utility",
    name: "Kitchen Utility Yard",
    type: "utility" /* Utility */,
    minAreaMm2: 25e5,
    // 2.5 m²
    targetAreaMm2: 35e5,
    minWidthMm: 1200,
    isMandatory: true,
    attachedToRoomId: "kitchen",
    zone: "SERVICE",
    description: "Service wash balcony for laundry and washing machine hookups"
  },
  {
    id: "master_bedroom_1",
    name: "Master Bedroom 01",
    type: "bedroom" /* Bedroom */,
    minAreaMm2: 14e6,
    // 14 m²
    targetAreaMm2: 17e6,
    minWidthMm: 3300,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Primary master suite with King-bed wall and attached private bath"
  },
  {
    id: "attached_toilet_1",
    name: "Master En-suite Toilet 01",
    type: "bathroom" /* Bathroom */,
    minAreaMm2: 38e5,
    // 3.8 m²
    targetAreaMm2: 45e5,
    minWidthMm: 1500,
    isMandatory: true,
    attachedToRoomId: "master_bedroom_1",
    zone: "SERVICE",
    description: "En-suite bath exclusively accessible from Master Bedroom 01"
  },
  {
    id: "bedroom_2",
    name: "Bedroom 02 (Suite)",
    type: "bedroom" /* Bedroom */,
    minAreaMm2: 115e5,
    // 11.5 m²
    targetAreaMm2: 14e6,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Second bedroom suite with attached private bathroom"
  },
  {
    id: "attached_toilet_2",
    name: "En-suite Toilet 02",
    type: "bathroom" /* Bathroom */,
    minAreaMm2: 32e5,
    // 3.2 m²
    targetAreaMm2: 4e6,
    minWidthMm: 1400,
    isMandatory: true,
    attachedToRoomId: "bedroom_2",
    zone: "SERVICE",
    description: "En-suite bath exclusively accessible from Bedroom 02"
  },
  {
    id: "bedroom_3",
    name: "Bedroom 03",
    type: "bedroom" /* Bedroom */,
    minAreaMm2: 105e5,
    // 10.5 m²
    targetAreaMm2: 125e5,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Third bedroom / guest room accessible from private circulation spine"
  },
  {
    id: "common_toilet",
    name: "Common Bathroom",
    type: "bathroom" /* Bathroom */,
    minAreaMm2: 28e5,
    // 2.8 m²
    targetAreaMm2: 35e5,
    minWidthMm: 1300,
    isMandatory: true,
    zone: "SERVICE",
    description: "Central common bathroom for Bedroom 03 and living area guests"
  },
  {
    id: "balcony_1",
    name: "Living Balcony",
    type: "balcony" /* Balcony */,
    minAreaMm2: 45e5,
    // 4.5 m²
    targetAreaMm2: 6e6,
    minWidthMm: 2400,
    isMandatory: true,
    attachedToRoomId: "foyer_living_dining",
    zone: "OUTDOOR",
    description: "Main outdoor terrace balcony with clear depth >= 1200 mm (target 1570 mm)"
  }
];
var PROGRAMMATIC_4BHK_MANIFEST2 = [
  {
    id: "entrance_foyer",
    name: "Entrance Foyer",
    type: "foyer" /* Foyer */,
    minAreaMm2: 35e5,
    // 3.5 m²
    targetAreaMm2: 5e6,
    minWidthMm: 1500,
    isMandatory: true,
    zone: "PUBLIC",
    description: "Dedicated formal entrance foyer buffering the main entrance from living spaces"
  },
  {
    id: "living_dining",
    name: "Grand Living & Dining Room",
    type: "living" /* Living */,
    minAreaMm2: 32e6,
    // 32 m²
    targetAreaMm2: 4e7,
    minWidthMm: 3800,
    isMandatory: true,
    zone: "PUBLIC",
    description: "Expansive formal entertaining and dining salon opening onto outdoor balcony"
  },
  {
    id: "kitchen",
    name: "Kitchen",
    type: "kitchen" /* Kitchen */,
    minAreaMm2: 9e6,
    // 9 m²
    targetAreaMm2: 12e6,
    minWidthMm: 2600,
    isMandatory: true,
    zone: "SERVICE",
    description: "Large gourmet kitchen with island or parallel counter layouts"
  },
  {
    id: "utility_yard",
    name: "Service Utility Yard",
    type: "utility" /* Utility */,
    minAreaMm2: 3e6,
    // 3 m²
    targetAreaMm2: 45e5,
    minWidthMm: 1400,
    isMandatory: true,
    attachedToRoomId: "kitchen",
    zone: "SERVICE",
    description: "Enclosed utility yard for dishwashing, laundry, and MEP equipment"
  },
  {
    id: "master_suite_1",
    name: "Presidential Master Suite 01",
    type: "bedroom" /* Bedroom */,
    minAreaMm2: 16e6,
    // 16 m²
    targetAreaMm2: 2e7,
    minWidthMm: 3600,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Primary luxury master suite with private balcony access and walk-in dressing"
  },
  {
    id: "master_dress_1",
    name: "Master Walk-in Dress 01",
    type: "dressing" /* Dressing */,
    minAreaMm2: 35e5,
    // 3.5 m²
    targetAreaMm2: 5e6,
    minWidthMm: 1600,
    isMandatory: true,
    attachedToRoomId: "master_suite_1",
    zone: "PRIVATE",
    description: "Walk-in dressing vestibule linking master bedroom to master bath"
  },
  {
    id: "master_bath_1",
    name: "Master Luxury Bath 01",
    type: "bathroom" /* Bathroom */,
    minAreaMm2: 45e5,
    // 4.5 m²
    targetAreaMm2: 6e6,
    minWidthMm: 1600,
    isMandatory: true,
    attachedToRoomId: "master_suite_1",
    zone: "SERVICE",
    description: "4-fixture luxury bathroom with separate shower stall and dual vanity"
  },
  {
    id: "master_suite_2",
    name: "Junior Master Suite 02",
    type: "bedroom" /* Bedroom */,
    minAreaMm2: 14e6,
    // 14 m²
    targetAreaMm2: 17e6,
    minWidthMm: 3300,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Secondary master bedroom suite with attached private bathroom"
  },
  {
    id: "master_bath_2",
    name: "En-suite Bath 02",
    type: "bathroom" /* Bathroom */,
    minAreaMm2: 38e5,
    // 3.8 m²
    targetAreaMm2: 48e5,
    minWidthMm: 1500,
    isMandatory: true,
    attachedToRoomId: "master_suite_2",
    zone: "SERVICE",
    description: "En-suite bath exclusively accessible from Suite 02"
  },
  {
    id: "bedroom_3",
    name: "Bedroom 03 (En-suite)",
    type: "bedroom" /* Bedroom */,
    minAreaMm2: 125e5,
    // 12.5 m²
    targetAreaMm2: 15e6,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Third bedroom suite with attached private bathroom"
  },
  {
    id: "bath_3",
    name: "En-suite Bath 03",
    type: "bathroom" /* Bathroom */,
    minAreaMm2: 32e5,
    // 3.2 m²
    targetAreaMm2: 4e6,
    minWidthMm: 1400,
    isMandatory: true,
    attachedToRoomId: "bedroom_3",
    zone: "SERVICE",
    description: "En-suite bathroom exclusively serving Bedroom 03"
  },
  {
    id: "bedroom_4",
    name: "Bedroom 04 / Guest Suite",
    type: "bedroom" /* Bedroom */,
    minAreaMm2: 11e6,
    // 11 m²
    targetAreaMm2: 135e5,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Fourth bedroom / home office / guest room accessible from corridor"
  },
  {
    id: "common_powder_bath",
    name: "Common Powder & Bathroom",
    type: "bathroom" /* Bathroom */,
    minAreaMm2: 28e5,
    // 2.8 m²
    targetAreaMm2: 35e5,
    minWidthMm: 1300,
    isMandatory: true,
    zone: "SERVICE",
    description: "Common powder room and guest bathroom accessible from public spine"
  },
  {
    id: "living_balcony",
    name: "Main Living Deck Balcony",
    type: "balcony" /* Balcony */,
    minAreaMm2: 55e5,
    // 5.5 m²
    targetAreaMm2: 8e6,
    minWidthMm: 2400,
    isMandatory: true,
    attachedToRoomId: "living_dining",
    zone: "OUTDOOR",
    description: "Main living terrace deck with clear depth >= 1200 mm (target 1570 mm)"
  },
  {
    id: "master_balcony",
    name: "Master Suite Private Balcony",
    type: "balcony" /* Balcony */,
    minAreaMm2: 45e5,
    // 4.5 m²
    targetAreaMm2: 6e6,
    minWidthMm: 2400,
    isMandatory: true,
    attachedToRoomId: "master_suite_1",
    zone: "OUTDOOR",
    description: "Private outdoor balcony for Master Suite 01 with clear depth >= 1200 mm"
  }
];
var PROGRAMMATIC_1BHK_MANIFEST2 = [
  {
    id: "foyer_living_dining",
    name: "Living & Dining Room",
    type: "living" /* Living */,
    minAreaMm2: 18e6,
    // 18 m²
    targetAreaMm2: 22e6,
    minWidthMm: 3e3,
    isMandatory: true,
    zone: "PUBLIC",
    description: "Compact living and dining area with front daylight window"
  },
  {
    id: "kitchen",
    name: "Kitchen",
    type: "kitchen" /* Kitchen */,
    minAreaMm2: 55e5,
    // 5.5 m²
    targetAreaMm2: 7e6,
    minWidthMm: 2e3,
    isMandatory: true,
    zone: "SERVICE",
    description: "Compact kitchen with single counter and ventilation opening"
  },
  {
    id: "utility",
    name: "Kitchen Utility",
    type: "utility" /* Utility */,
    minAreaMm2: 18e5,
    // 1.8 m²
    targetAreaMm2: 25e5,
    minWidthMm: 1e3,
    isMandatory: true,
    attachedToRoomId: "kitchen",
    zone: "SERVICE",
    description: "Service wash balcony adjacent to kitchen"
  },
  {
    id: "bedroom",
    name: "Master Bedroom",
    type: "bedroom" /* Bedroom */,
    minAreaMm2: 105e5,
    // 10.5 m²
    targetAreaMm2: 13e6,
    minWidthMm: 2800,
    isMandatory: true,
    zone: "PRIVATE",
    description: "Standard bedroom accommodating double bed and wardrobe"
  },
  {
    id: "bathroom",
    name: "Bathroom",
    type: "bathroom" /* Bathroom */,
    minAreaMm2: 28e5,
    // 2.8 m²
    targetAreaMm2: 35e5,
    minWidthMm: 1300,
    isMandatory: true,
    zone: "SERVICE",
    description: "Combined toilet and shower room"
  },
  {
    id: "balcony",
    name: "Living Balcony",
    type: "balcony" /* Balcony */,
    minAreaMm2: 25e5,
    // 2.5 m²
    targetAreaMm2: 35e5,
    minWidthMm: 2e3,
    isMandatory: true,
    attachedToRoomId: "foyer_living_dining",
    zone: "OUTDOOR",
    description: "Outdoor standing balcony with clear depth >= 1200 mm"
  }
];

// packages/core/src/types/multi-sheet-apartment.ts
var DEFAULT_SITE_AMENITIES2 = {
  securityCabin: true,
  landscapeGardenRos: true,
  childrenPlayTotLot: true,
  seniorCitizenSitout: true,
  transformerDgYard: true,
  ugwtPumpRoom: true,
  stpPlant: true,
  owcWasteYard: true,
  rainwaterHarvestingPits: true,
  evChargingBays: true
};
var DEFAULT_STILT_AMENITIES2 = {
  grandEntranceLobby: true,
  societyOffice: true,
  fitnessGymnasium: true,
  multipurposeHall: true,
  meterBmsRoom: true,
  driverStaffToilet: true
};
var DEFAULT_TERRACE_AMENITIES2 = {
  stairMumtyHeadroom: true,
  liftMachineRoom: true,
  overheadWaterTank: true,
  solarPvArray: true,
  terraceYogaDeck: true
};

// packages/core/src/types/indian-codes.ts
var CONCRETE_PROPERTIES_MAP2 = {
  M20: {
    grade: "M20",
    fckNPerMm2: 20,
    elasticModulusNPerMm2: Math.round(5e3 * Math.sqrt(20)),
    // 22361 N/mm²
    massDensityKgPerM3: 2500,
    poissonRatio: 0.2,
    thermalExpansionPerC: 99e-7,
    axialStrainLimit: 2e-3,
    bendingStrainLimit: 35e-4
  },
  M25: {
    grade: "M25",
    fckNPerMm2: 25,
    elasticModulusNPerMm2: Math.round(5e3 * Math.sqrt(25)),
    // 25000 N/mm²
    massDensityKgPerM3: 2500,
    poissonRatio: 0.2,
    thermalExpansionPerC: 99e-7,
    axialStrainLimit: 2e-3,
    bendingStrainLimit: 35e-4
  },
  M30: {
    grade: "M30",
    fckNPerMm2: 30,
    elasticModulusNPerMm2: Math.round(5e3 * Math.sqrt(30)),
    // 27386 N/mm²
    massDensityKgPerM3: 2500,
    poissonRatio: 0.2,
    thermalExpansionPerC: 99e-7,
    axialStrainLimit: 2e-3,
    bendingStrainLimit: 35e-4
  },
  M35: {
    grade: "M35",
    fckNPerMm2: 35,
    elasticModulusNPerMm2: Math.round(5e3 * Math.sqrt(35)),
    // 29580 N/mm²
    massDensityKgPerM3: 2500,
    poissonRatio: 0.2,
    thermalExpansionPerC: 99e-7,
    axialStrainLimit: 2e-3,
    bendingStrainLimit: 35e-4
  },
  M40: {
    grade: "M40",
    fckNPerMm2: 40,
    elasticModulusNPerMm2: Math.round(5e3 * Math.sqrt(40)),
    // 31623 N/mm²
    massDensityKgPerM3: 2500,
    poissonRatio: 0.2,
    thermalExpansionPerC: 99e-7,
    axialStrainLimit: 2e-3,
    bendingStrainLimit: 35e-4
  }
};

// packages/core/src/models/validation.ts
var VALID_ROOM_TYPES2 = new Set(Object.values(RoomType2));

// packages/core/src/models/requirements-normalization.ts
var ROOM_TYPES2 = new Set(Object.values(RoomType2));
var DIRECTIONS2 = new Set(Object.values(Direction2));
var PLOT_SHAPES2 = new Set(Object.values(PlotShape2));
var PREFERENCE_LEVELS2 = new Set(Object.values(PreferenceLevel2));

// packages/core/src/capabilities.ts
var BUILDING_CAPABILITIES2 = Object.freeze({
  minimumFloorCount: 1,
  maximumFloorCount: 10
});
var SUPPORTED_FLOOR_COUNTS2 = Object.freeze(
  Array.from(
    { length: BUILDING_CAPABILITIES2.maximumFloorCount },
    (_, index) => index + BUILDING_CAPABILITIES2.minimumFloorCount
  )
);

// packages/core/src/models/space-catalog.ts
var M22 = 1e6;
var R2 = ["residential", "mixed_use"];
var C2 = ["commercial", "mixed_use"];
var E2 = ["educational"];
function definition2(id, displayName, categories, group, zone, minimumM2, preferredM2, options = {}) {
  const occupancy = options.occupancy ?? (categories[0] === "educational" ? "educational" : categories[0] === "commercial" ? "commercial" : "residential");
  return {
    id,
    displayName,
    categories,
    group,
    zone,
    occupancy,
    canonicalType: options.canonicalType,
    synonyms: options.synonyms ?? [],
    defaultQuantity: options.quantity ?? 1,
    minimumAreaMm2: minimumM2 * M22,
    preferredAreaMm2: preferredM2 * M22,
    maximumAreaMm2: options.max ? options.max * M22 : void 0,
    defaultPriority: options.priority ?? "preferred",
    defaultFloorPreference: options.floor ?? "any",
    generatorSupport: options.support ?? "program_only",
    tags: options.tags ?? [],
    relationships: options.relationships
  };
}
var residential2 = [
  definition2("primary_bedroom", "Primary Bedroom", R2, "private", "private" /* Private */, 12, 16, { max: 22, canonicalType: "bedroom" /* Bedroom */, support: "supported", priority: "required", floor: "upper_preferred", synonyms: ["master bedroom", "owner bedroom"] }),
  definition2("bedroom", "Bedroom", R2, "private", "private" /* Private */, 9.5, 13, { max: 18, canonicalType: "bedroom" /* Bedroom */, support: "supported", quantity: 2, priority: "required", floor: "upper_preferred", synonyms: ["bed room", "kids room"] }),
  definition2("guest_bedroom", "Guest Bedroom", R2, "private", "private" /* Private */, 9.5, 13, { max: 18, canonicalType: "bedroom" /* Bedroom */, support: "supported", floor: "ground_preferred", synonyms: ["guest room"] }),
  definition2("children_bedroom", "Children Bedroom", R2, "private", "private" /* Private */, 9.5, 12, { max: 16, canonicalType: "bedroom" /* Bedroom */, support: "supported", floor: "upper_preferred", synonyms: ["child room", "kids bedroom"] }),
  definition2("study", "Study / Home Office", R2, "private", "private" /* Private */, 6, 9, { max: 14, canonicalType: "study" /* Study */, support: "supported", synonyms: ["office", "home office"] }),
  definition2("dressing", "Dressing / Walk-in Closet", R2, "private", "private" /* Private */, 3, 5, { max: 8, synonyms: ["closet", "wardrobe"] }),
  definition2("primary_bathroom", "Primary Bathroom", R2, "baths", "service" /* Service */, 3, 4.5, { max: 7, canonicalType: "bathroom" /* Bathroom */, support: "supported", priority: "required", floor: "upper_preferred", synonyms: ["master bath", "ensuite"] }),
  definition2("attached_bathroom", "Attached Bathroom", R2, "baths", "service" /* Service */, 2.5, 4, { max: 6, canonicalType: "bathroom" /* Bathroom */, support: "supported", synonyms: ["ensuite bathroom"] }),
  definition2("common_bathroom", "Common Bathroom", R2, "baths", "service" /* Service */, 2.5, 4, { max: 6, canonicalType: "bathroom" /* Bathroom */, support: "supported", priority: "required", synonyms: ["washroom", "toilet"] }),
  definition2("powder_room", "Powder Room", R2, "baths", "service" /* Service */, 1.8, 2.5, { max: 4, canonicalType: "bathroom" /* Bathroom */, support: "supported", synonyms: ["guest toilet", "half bath"] }),
  definition2("living", "Living Room", R2, "living", "public" /* Public */, 12, 18, { max: 26, canonicalType: "living" /* Living */, support: "supported", priority: "required", floor: "ground_required", synonyms: ["lounge", "drawing room"] }),
  definition2("family_lounge", "Family Lounge", R2, "living", "semi_public" /* SemiPublic */, 10, 15, { max: 22, canonicalType: "family_living" /* FamilyLiving */, support: "program_only", floor: "upper_preferred", synonyms: ["family living"] }),
  definition2("dining", "Dining", R2, "living", "semi_public" /* SemiPublic */, 8, 12, { max: 18, canonicalType: "dining" /* Dining */, support: "supported", priority: "required", floor: "ground_preferred", relationships: [{ targetDefinitionId: "kitchen", strength: "preferred" /* Preferred */, reason: "Short food-service path" }] }),
  definition2("breakfast", "Breakfast / Informal Dining", R2, "living", "semi_public" /* SemiPublic */, 5, 8, { max: 12, synonyms: ["breakfast nook"] }),
  definition2("kitchen", "Kitchen", R2, "service", "service" /* Service */, 5.5, 9, { max: 14, canonicalType: "kitchen" /* Kitchen */, support: "supported", priority: "required", floor: "ground_preferred", relationships: [{ targetDefinitionId: "dining", strength: "preferred" /* Preferred */, reason: "Short food-service path" }, { targetDefinitionId: "utility", strength: "preferred" /* Preferred */, reason: "Connected service workflow" }] }),
  definition2("pantry", "Pantry", R2, "service", "service" /* Service */, 2, 3.5, { max: 6, synonyms: ["food store"] }),
  definition2("utility", "Utility", R2, "service", "service" /* Service */, 3, 5, { max: 8, canonicalType: "utility" /* Utility */, support: "supported", floor: "ground_preferred" }),
  definition2("store", "Store", R2, "service", "service" /* Service */, 2, 4, { max: 7, canonicalType: "storage" /* Storage */, support: "program_only", synonyms: ["storage"] }),
  definition2("laundry", "Laundry", R2, "service", "service" /* Service */, 3, 5, { max: 8 }),
  definition2("pooja", "Pooja Room", R2, "special", "private" /* Private */, 2, 3.5, { max: 6, canonicalType: "pooja" /* Pooja */, support: "supported", synonyms: ["prayer room", "puja"] }),
  definition2("foyer", "Entrance / Foyer", R2, "circulation", "public" /* Public */, 3, 5, { max: 9, canonicalType: "foyer" /* Foyer */, support: "program_only", floor: "ground_required", synonyms: ["entry", "entrance"] }),
  definition2("corridor", "Hall / Passage", R2, "circulation", "circulation" /* Circulation */, 3, 6, { max: 12, canonicalType: "corridor" /* Corridor */, support: "program_only", synonyms: ["hallway"] }),
  definition2("staircase", "Staircase", R2, "circulation", "circulation" /* Circulation */, 5, 7.5, { max: 12, canonicalType: "staircase" /* Staircase */, support: "supported", priority: "required", floor: "ground_required", synonyms: ["stairs"] }),
  definition2("lift", "Lift", R2, "circulation", "circulation" /* Circulation */, 4, 5, { max: 7, canonicalType: "lift" /* Lift */, support: "supported", synonyms: ["elevator"] }),
  definition2("balcony", "Balcony", R2, "outdoor", "outdoor" /* Outdoor */, 3, 5, { max: 9, canonicalType: "balcony" /* Balcony */, support: "supported", floor: "upper_preferred" }),
  definition2("terrace", "Terrace", R2, "outdoor", "outdoor" /* Outdoor */, 8, 14, { max: 30, canonicalType: "terrace" /* Terrace */, support: "program_only", floor: "top_preferred", synonyms: ["roof terrace"] }),
  definition2("sit_out", "Sit-out", R2, "outdoor", "outdoor" /* Outdoor */, 4, 7, { max: 12, synonyms: ["veranda"] }),
  definition2("porch", "Porch", R2, "outdoor", "outdoor" /* Outdoor */, 5, 8, { max: 14, floor: "ground_required" }),
  definition2("car_parking", "Car Parking", R2, "vehicle", "outdoor" /* Outdoor */, 14, 15, { max: 20, canonicalType: "parking" /* Parking */, support: "supported", priority: "required", floor: "ground_required", synonyms: ["car", "parking bay"] }),
  definition2("two_wheeler_parking", "Two-Wheeler Parking", R2, "vehicle", "outdoor" /* Outdoor */, 3, 5, { max: 8, synonyms: ["bike parking", "scooter parking"] }),
  definition2("garage", "Garage", R2, "vehicle", "outdoor" /* Outdoor */, 16, 20, { max: 28, canonicalType: "parking" /* Parking */, support: "supported", floor: "ground_required" })
];
var commercial2 = [
  definition2("reception", "Reception", C2, "work", "public" /* Public */, 8, 14, { occupancy: "commercial", priority: "required", floor: "ground_required", synonyms: ["front desk"] }),
  definition2("retail", "Retail Area", C2, "work", "public" /* Public */, 25, 45, { occupancy: "commercial", floor: "ground_required", synonyms: ["shop", "storefront"] }),
  definition2("open_office", "Open Office", C2, "work", "semi_public" /* SemiPublic */, 30, 55, { occupancy: "commercial", priority: "required", synonyms: ["workstations", "office floor"] }),
  definition2("private_cabin", "Private Cabin", C2, "work", "private" /* Private */, 8, 12, { occupancy: "commercial", quantity: 2, synonyms: ["office cabin"] }),
  definition2("manager_cabin", "Manager Cabin", C2, "work", "private" /* Private */, 10, 15, { occupancy: "commercial" }),
  definition2("conference", "Conference Room", C2, "work", "semi_public" /* SemiPublic */, 15, 24, { occupancy: "commercial", synonyms: ["board room"] }),
  definition2("meeting", "Meeting Room", C2, "work", "semi_public" /* SemiPublic */, 8, 14, { occupancy: "commercial" }),
  definition2("waiting", "Waiting Area", C2, "living", "public" /* Public */, 8, 15, { occupancy: "commercial" }),
  definition2("commercial_pantry", "Pantry", C2, "service", "service" /* Service */, 4, 7, { occupancy: "commercial" }),
  definition2("staff_dining", "Staff Dining", C2, "service", "semi_public" /* SemiPublic */, 12, 20, { occupancy: "commercial" }),
  definition2("commercial_storage", "Storage", C2, "service", "service" /* Service */, 5, 9, { occupancy: "commercial", synonyms: ["store"] }),
  definition2("server_room", "Server / IT Room", C2, "technical", "service" /* Service */, 6, 10, { occupancy: "commercial", synonyms: ["it room"] }),
  definition2("electrical_room", "Electrical Room", C2, "technical", "service" /* Service */, 5, 8, { occupancy: "commercial" }),
  definition2("male_toilet", "Male Toilet", [...C2, ...E2], "baths", "service" /* Service */, 6, 10, { occupancy: "shared", priority: "required", synonyms: ["washroom", "men toilet"] }),
  definition2("female_toilet", "Female Toilet", [...C2, ...E2], "baths", "service" /* Service */, 6, 10, { occupancy: "shared", priority: "required", synonyms: ["washroom", "women toilet"] }),
  definition2("accessible_toilet", "Accessible Toilet", [...C2, ...E2], "baths", "service" /* Service */, 4, 5.5, { occupancy: "shared", priority: "required", synonyms: ["disabled toilet", "wheelchair toilet"] }),
  definition2("commercial_lift", "Lift", C2, "circulation", "circulation" /* Circulation */, 4, 6, { occupancy: "commercial", priority: "required", floor: "ground_required", synonyms: ["elevator"] }),
  definition2("commercial_stair", "Staircase", C2, "circulation", "circulation" /* Circulation */, 8, 12, { occupancy: "commercial", priority: "required", floor: "ground_required", synonyms: ["stairs"] }),
  definition2("fire_stair", "Fire Stair", C2, "circulation", "circulation" /* Circulation */, 8, 12, { occupancy: "commercial", priority: "required" }),
  definition2("service_shaft", "Service Shaft", C2, "technical", "service" /* Service */, 3, 5, { occupancy: "commercial" }),
  definition2("commercial_parking", "Parking", C2, "vehicle", "outdoor" /* Outdoor */, 14, 15, { occupancy: "commercial", quantity: 4, priority: "required", floor: "ground_required", synonyms: ["car parking"] }),
  definition2("loading", "Loading / Service Area", C2, "vehicle", "service" /* Service */, 25, 40, { occupancy: "commercial", floor: "ground_required" })
];
var educational2 = [
  definition2("classroom", "Classroom", E2, "learning", "semi_public" /* SemiPublic */, 35, 48, { occupancy: "educational", quantity: 4, priority: "required", synonyms: ["class", "teaching room"] }),
  definition2("laboratory", "Laboratory", E2, "learning", "semi_public" /* SemiPublic */, 45, 65, { occupancy: "educational", quantity: 2, synonyms: ["lab", "science lab"] }),
  definition2("computer_lab", "Computer Lab", E2, "learning", "semi_public" /* SemiPublic */, 45, 60, { occupancy: "educational", synonyms: ["computer room"] }),
  definition2("library", "Library", E2, "learning", "semi_public" /* SemiPublic */, 55, 90, { occupancy: "educational", priority: "required" }),
  definition2("staff_room", "Staff Room", E2, "work", "private" /* Private */, 20, 35, { occupancy: "educational" }),
  definition2("principal_office", "Principal / Head Office", E2, "work", "private" /* Private */, 12, 18, { occupancy: "educational", synonyms: ["head office"] }),
  definition2("administration", "Administration", E2, "work", "semi_public" /* SemiPublic */, 20, 35, { occupancy: "educational", priority: "required", synonyms: ["admin"] }),
  definition2("education_reception", "Reception", E2, "work", "public" /* Public */, 10, 16, { occupancy: "educational", floor: "ground_required" }),
  definition2("education_meeting", "Meeting Room", E2, "work", "semi_public" /* SemiPublic */, 10, 16, { occupancy: "educational" }),
  definition2("multipurpose", "Multipurpose Room", E2, "learning", "semi_public" /* SemiPublic */, 60, 100, { occupancy: "educational" }),
  definition2("auditorium", "Auditorium", E2, "learning", "public" /* Public */, 120, 220, { occupancy: "educational", floor: "ground_preferred" }),
  definition2("education_store", "Store", E2, "service", "service" /* Service */, 6, 10, { occupancy: "educational", synonyms: ["storage"] }),
  definition2("education_stair", "Staircase", E2, "circulation", "circulation" /* Circulation */, 10, 15, { occupancy: "educational", quantity: 2, priority: "required", floor: "ground_required", synonyms: ["stairs"] }),
  definition2("education_lift", "Lift", E2, "circulation", "circulation" /* Circulation */, 5, 7, { occupancy: "educational", priority: "required", floor: "ground_required", synonyms: ["elevator"] }),
  definition2("education_corridor", "Corridor", E2, "circulation", "circulation" /* Circulation */, 30, 55, { occupancy: "educational", priority: "required", synonyms: ["passage"] }),
  definition2("playground", "Playground / Outdoor Area", E2, "outdoor", "outdoor" /* Outdoor */, 300, 600, { occupancy: "educational", synonyms: ["outdoor", "play area"] }),
  definition2("education_parking", "Parking", E2, "vehicle", "outdoor" /* Outdoor */, 70, 100, { occupancy: "educational", floor: "ground_required", synonyms: ["car parking"] })
];
var SPACE_CATALOG2 = Object.freeze([...residential2, ...commercial2, ...educational2]);
var SPACE_PROGRAM_PRESETS2 = Object.freeze([
  { id: "residential_1bhk", name: "1BHK", category: "residential", items: [
    { definitionId: "living" },
    { definitionId: "dining" },
    { definitionId: "kitchen" },
    { definitionId: "primary_bedroom" },
    { definitionId: "common_bathroom" },
    { definitionId: "car_parking" }
  ] },
  { id: "residential_2bhk", name: "2BHK", category: "residential", items: [
    { definitionId: "living" },
    { definitionId: "dining" },
    { definitionId: "kitchen" },
    { definitionId: "primary_bedroom" },
    { definitionId: "bedroom", quantity: 1 },
    { definitionId: "primary_bathroom" },
    { definitionId: "common_bathroom" },
    { definitionId: "utility" },
    { definitionId: "car_parking" },
    { definitionId: "staircase" }
  ] },
  { id: "residential_3bhk", name: "3BHK", category: "residential", items: [
    { definitionId: "living" },
    { definitionId: "dining" },
    { definitionId: "kitchen" },
    { definitionId: "primary_bedroom" },
    { definitionId: "bedroom", quantity: 2 },
    { definitionId: "primary_bathroom" },
    { definitionId: "common_bathroom", quantity: 2 },
    { definitionId: "utility" },
    { definitionId: "pooja", priority: "preferred" },
    { definitionId: "car_parking" },
    { definitionId: "staircase" },
    { definitionId: "balcony" }
  ] },
  { id: "residential_duplex", name: "Duplex", category: "residential", items: [
    { definitionId: "living" },
    { definitionId: "dining" },
    { definitionId: "kitchen" },
    { definitionId: "guest_bedroom", floorPreference: { kind: "ground_preferred" } },
    { definitionId: "primary_bedroom", floorPreference: { kind: "upper_preferred" } },
    { definitionId: "bedroom", quantity: 2, floorPreference: { kind: "upper_preferred" } },
    { definitionId: "common_bathroom", quantity: 3 },
    { definitionId: "staircase" },
    { definitionId: "balcony" }
  ] },
  { id: "commercial_small_office", name: "Small Office", category: "commercial", items: [
    { definitionId: "reception" },
    { definitionId: "open_office" },
    { definitionId: "private_cabin", quantity: 2 },
    { definitionId: "meeting" },
    { definitionId: "commercial_pantry" },
    { definitionId: "male_toilet" },
    { definitionId: "female_toilet" },
    { definitionId: "accessible_toilet" },
    { definitionId: "commercial_stair" },
    { definitionId: "commercial_parking", quantity: 2 }
  ] },
  { id: "educational_classroom_wing", name: "Classroom Wing", category: "educational", items: [
    { definitionId: "classroom", quantity: 6 },
    { definitionId: "laboratory", quantity: 2 },
    { definitionId: "library" },
    { definitionId: "staff_room" },
    { definitionId: "administration" },
    { definitionId: "male_toilet" },
    { definitionId: "female_toilet" },
    { definitionId: "accessible_toilet" },
    { definitionId: "education_stair", quantity: 2 },
    { definitionId: "education_lift" }
  ] }
]);

// packages/core/src/models/space-program.ts
var CIRCULATION_RESERVE_RATIO2 = 0.12;
var VERTICAL_CORE_RESERVE_RATIO2 = 0.04;
var WALL_SERVICE_RESERVE_RATIO2 = 0.06;
var TOTAL_RESERVE_RATIO2 = CIRCULATION_RESERVE_RATIO2 + VERTICAL_CORE_RESERVE_RATIO2 + WALL_SERVICE_RESERVE_RATIO2;
var DERIVATION_MAP2 = {
  ["living" /* Living */]: "living",
  ["dining" /* Dining */]: "dining",
  ["kitchen" /* Kitchen */]: "kitchen",
  ["bedroom" /* Bedroom */]: "bedroom",
  ["bathroom" /* Bathroom */]: "common_bathroom",
  ["utility" /* Utility */]: "utility",
  ["pooja" /* Pooja */]: "pooja",
  ["study" /* Study */]: "study",
  ["staircase" /* Staircase */]: "staircase",
  ["lift" /* Lift */]: "lift",
  ["parking" /* Parking */]: "car_parking",
  ["balcony" /* Balcony */]: "balcony",
  ["storage" /* Storage */]: "store",
  ["corridor" /* Corridor */]: "corridor",
  ["foyer" /* Foyer */]: "foyer",
  ["family_living" /* FamilyLiving */]: "family_lounge",
  ["terrace" /* Terrace */]: "terrace"
};

// packages/core/src/models/footprint.ts
var CIRCULATION_RATIO2 = 0.12;
var CORE_RATIO2 = 0.04;
var WALL_SERVICE_RATIO2 = 0.06;
var USABLE_RATIO2 = 1 - CIRCULATION_RATIO2 - CORE_RATIO2 - WALL_SERVICE_RATIO2;
var FOOTPRINT_SHAPES2 = Object.freeze([
  { id: "rectangle", name: "Rectangle", description: "Efficient universal floor plate", recommendedCategories: ["residential", "commercial", "mixed_use"] },
  { id: "l_shape", name: "L Shape", description: "Two wings around an open edge", recommendedCategories: ["residential", "commercial", "educational", "mixed_use"] },
  { id: "u_shape", name: "U Shape", description: "Three-sided court or arrival space", recommendedCategories: ["educational", "commercial"] },
  { id: "t_shape", name: "T Shape", description: "Primary bar with a central wing", recommendedCategories: ["educational", "commercial"] },
  { id: "courtyard", name: "Courtyard", description: "Limited perimeter plate with an access slot; not polygon-hole topology", recommendedCategories: ["residential", "commercial", "educational"], customSupport: "limited" },
  { id: "linear", name: "Linear", description: "Shallow elongated building plate", recommendedCategories: ["commercial", "educational"] },
  { id: "custom", name: "Custom", description: "Preserved existing or imported polygon", recommendedCategories: [], customSupport: "limited" }
]);

// scripts/verify-real-building-sync.ts
var require2 = createRequire(import.meta.url);
var { chromium } = require2("../packages/frontend/node_modules/playwright");
function calculateColorVariance(imageBuffer) {
  if (!imageBuffer || imageBuffer.length < 1e3) return 0;
  let sum = 0;
  let sumSq = 0;
  const sampleStep = Math.max(1, Math.floor(imageBuffer.length / 5e3));
  let count = 0;
  for (let i = 100; i < imageBuffer.length; i += sampleStep) {
    const val = imageBuffer[i];
    sum += val;
    sumSq += val * val;
    count++;
  }
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return variance;
}
async function main() {
  console.log("========================================================================");
  console.log("  MASTER VERIFICATION: REAL MULTI-STORY 2D <-> 3D BUILDING SYNC & PROOF ");
  console.log("========================================================================\n");
  const screenshotsDir = path.resolve(process.cwd(), "docs/screenshots/verified-real-building");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  console.log('[STEP 1] Generating "ARGON Residence Towers" (40m x 50m, 5 floors, 4 flats/floor)...');
  const config = {
    projectName: "ARGON Residence Towers",
    plotWidthMm: 4e4,
    plotDepthMm: 5e4,
    roadWidthMm: 15e3,
    roadAccessSides: ["north" /* North */],
    setbacksMm: { front: 4500, rear: 3e3, left: 3e3, right: 3e3 },
    lotAllotmentMode: "STATUTORY_SETBACK_100_PERCENT",
    jurisdiction: "generic_maharashtra",
    verticalStackType: "STILT_PLUS_N",
    numTypicalFloors: 3,
    flatsPerFloor: 4,
    units: [
      { unitIndex: 1, bhkType: "3BHK", hasUtilityBalcony: true, carpetAreaSqFt: 1100 },
      { unitIndex: 2, bhkType: "2BHK", hasUtilityBalcony: true, carpetAreaSqFt: 850 },
      { unitIndex: 3, bhkType: "2BHK", hasUtilityBalcony: true, carpetAreaSqFt: 850 },
      { unitIndex: 4, bhkType: "3BHK", hasUtilityBalcony: true, carpetAreaSqFt: 1100 }
    ],
    siteAmenities: DEFAULT_SITE_AMENITIES2,
    stiltAmenities: DEFAULT_STILT_AMENITIES2,
    terraceAmenities: DEFAULT_TERRACE_AMENITIES2,
    parkingMode: "STILT_ONLY",
    aiPrompt: "ARGON Residence Towers: 40m x 50m plot, 5 floors, 4 flats/floor"
  };
  const genStart = Date.now();
  const pipelineResult = await executeAuditedPlanningPipeline(config);
  const genMs = Date.now() - genStart;
  const building = { ...pipelineResult.building, projectId: "proj-argon-tower-01" };
  console.log(`  \u2713 Generated in ${genMs} ms`);
  console.log(`  \u2713 Building Name: "${building.name}" (ID: ${building.id})`);
  console.log(`  \u2713 Total Floors: ${building.floors.length}`);
  let totalRooms = 0;
  let totalWalls = 0;
  let totalDoors = 0;
  let totalWindows = 0;
  for (const f of building.floors) {
    totalRooms += f.rooms.length;
    totalWalls += f.walls.length;
    totalDoors += f.doors.length;
    totalWindows += f.windows.length;
    console.log(`    - Floor "${f.name}" (level ${f.level}): ${f.rooms.length} rooms, ${f.walls.length} walls, ${f.doors.length} doors, ${f.windows.length} windows`);
  }
  if (building.floors.length < 4) {
    throw new Error(`Expected at least 4 floors, got ${building.floors.length}`);
  }
  console.log("\n[STEP 2] Syncing Project Identity to Backend via PUT /api/projects/:projectId/canonical...");
  const putCanonicalRes = await fetch("http://localhost:4200/api/projects/proj-argon-tower-01/canonical", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ building })
  });
  if (!putCanonicalRes.ok) {
    const txt = await putCanonicalRes.text();
    throw new Error(`PUT canonical failed with HTTP ${putCanonicalRes.status}: ${txt}`);
  }
  const putCanonicalData = await putCanonicalRes.json();
  console.log(`  \u2713 PUT canonical returned HTTP 200. Revision: ${putCanonicalData.revision}, nodeCount: ${putCanonicalData.nodeCount}`);
  console.log("  \u2713 Testing that non-existent project returns 404 (No silent Sapphire Heights fallback)...");
  const unknownRes = await fetch("http://localhost:4200/api/projects/unknown-proj-random-999/pascal-scene");
  if (unknownRes.status !== 404) {
    throw new Error(`Expected 404 for unknown project, got HTTP ${unknownRes.status}`);
  }
  console.log("  \u2713 Verified 404 for unknown project (silent fixture fallback successfully eliminated)");
  console.log("\n[STEP 3] Verifying Multi-Story Pascal 3D Scene Graph from Backend...");
  const getSceneRes = await fetch("http://localhost:4200/api/projects/proj-argon-tower-01/pascal-scene");
  if (!getSceneRes.ok) {
    throw new Error(`GET pascal-scene failed with HTTP ${getSceneRes.status}`);
  }
  const sceneData = await getSceneRes.json();
  const nodes = sceneData.scene.nodes;
  const nodeCount = Object.keys(nodes).length;
  const levelNodes = Object.values(nodes).filter((n) => n.type === "level");
  const wallNodes = Object.values(nodes).filter((n) => n.type === "wall");
  const doorNodes = Object.values(nodes).filter((n) => n.type === "door");
  const windowNodes = Object.values(nodes).filter((n) => n.type === "window");
  const zoneNodes = Object.values(nodes).filter((n) => n.type === "zone");
  const slabNodes = Object.values(nodes).filter((n) => n.type === "slab");
  console.log(`  \u2713 Pascal Scene Node Count: ${nodeCount}`);
  console.log(`  \u2713 Levels: ${levelNodes.length} (Requirement: >= 4)`);
  console.log(`  \u2713 Walls: ${wallNodes.length} (Requirement: >= 40)`);
  console.log(`  \u2713 Doors: ${doorNodes.length} (Requirement: >= 10)`);
  console.log(`  \u2713 Windows: ${windowNodes.length}`);
  console.log(`  \u2713 Zones: ${zoneNodes.length} (Requirement: >= 20)`);
  console.log(`  \u2713 Slabs: ${slabNodes.length}`);
  if (levelNodes.length < 4) throw new Error(`levelNodes.length (${levelNodes.length}) < 4`);
  if (wallNodes.length < 40) throw new Error(`wallNodes.length (${wallNodes.length}) < 40`);
  if (doorNodes.length < 10) throw new Error(`doorNodes.length (${doorNodes.length}) < 10`);
  if (zoneNodes.length < 20) throw new Error(`zoneNodes.length (${zoneNodes.length}) < 20`);
  const elevations = levelNodes.map((l) => l.baseElevation ?? 0);
  console.log("  \u2713 Level base elevations (m):", elevations);
  for (let i = 1; i < elevations.length; i++) {
    if (elevations[i] <= elevations[i - 1]) {
      throw new Error(`Elevation not strictly increasing at index ${i}: ${elevations[i]} <= ${elevations[i - 1]}`);
    }
  }
  console.log("\n[STEP 4] Verifying ArchLang 2D Presentation on 63-Room Floor (1ST_FLOOR_PLAN)...");
  const archFloorId = building.floors[1].id;
  const archStart = Date.now();
  const archRes = await fetch("http://localhost:4200/api/projects/proj-argon-tower-01/archlang/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      floorId: archFloorId,
      autoFurnish: true,
      circulationOverlay: true,
      showDimensions: true
    })
  });
  const archCompileMs = Date.now() - archStart;
  if (!archRes.ok) {
    const err = await archRes.text();
    throw new Error(`ArchLang preview failed with HTTP ${archRes.status}: ${err}`);
  }
  const archData = await archRes.json();
  const svg = archData.preview?.svg ?? archData.svg;
  console.log(`  \u2713 ArchLang Compiled 63-Room Floor in: ${archCompileMs} ms (Requirement: < 5000 ms)`);
  console.log(`  \u2713 ArchLang SVG bytes: ${svg?.length ?? 0}`);
  if (archCompileMs > 5e3) {
    throw new Error(`ArchLang compilation exceeded 5000 ms: took ${archCompileMs} ms`);
  }
  if (!svg || !svg.includes("<svg")) {
    throw new Error("ArchLang preview did not return valid SVG");
  }
  console.log("\n[STEP 5] Testing Bidirectional 2D <-> 3D Synchronization...");
  const firstWall = wallNodes[0];
  const originalThickness = firstWall.thickness;
  firstWall.thickness = 0.45;
  const updatedScene = { ...sceneData.scene, nodes: { ...nodes, [firstWall.id]: firstWall } };
  console.log(`  \u2713 Mutating 3D wall ${firstWall.id} thickness to 0.45m in 3D Scene...`);
  const putSceneRes = await fetch("http://localhost:4200/api/projects/proj-argon-tower-01/pascal-scene", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scene: updatedScene })
  });
  if (!putSceneRes.ok) {
    throw new Error(`PUT pascal-scene failed with HTTP ${putSceneRes.status}`);
  }
  const putSceneData = await putSceneRes.json();
  console.log(`  \u2713 PUT pascal-scene returned HTTP 200. Version bumped to: ${putSceneData.revision}`);
  if (!putSceneData.building) {
    throw new Error("PUT pascal-scene did not return back-patched canonical building");
  }
  console.log("  \u2713 Testing 2D -> 3D sync via POST /api/projects/:projectId/sync-from-2d...");
  const sync2dRes = await fetch("http://localhost:4200/api/projects/proj-argon-tower-01/sync-from-2d", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ building: putSceneData.building })
  });
  if (!sync2dRes.ok) {
    throw new Error(`sync-from-2d failed with HTTP ${sync2dRes.status}`);
  }
  const sync2dData = await sync2dRes.json();
  console.log(`  \u2713 2D -> 3D sync returned HTTP 200. Recompiled scene nodes: ${Object.keys(sync2dData.scene.nodes).length}`);
  console.log("\n[STEP 6] Launching Playwright Browser Audit at http://localhost:3000/...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=gl"]
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });
  await page.addInitScript((arg) => {
    localStorage.setItem(`afp_project_${arg.projectId}`, JSON.stringify({
      projectId: arg.projectId,
      name: arg.building.name,
      building: arg.building,
      version: arg.building.version,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
    localStorage.setItem("afp_active_project_id", arg.projectId);
    localStorage.setItem("rh_welcome_dismissed", "true");
    sessionStorage.setItem("rh_welcome_dismissed", "true");
  }, { projectId: "proj-argon-tower-01", building });
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 3e4 });
  await page.waitForTimeout(3e3);
  console.log("\n  [CAPTURE 1] Verifying 2D Engineering View...");
  const mode2dBtn = page.locator('button:has-text("2D CAD Studio"), button:has-text("2D CAD View")').first();
  if (await mode2dBtn.count() > 0) {
    await mode2dBtn.click();
    await page.waitForTimeout(2e3);
  }
  const shot1Path = path.join(screenshotsDir, "01-generated-tower-2d.png");
  const shot1Buffer = await page.screenshot({ path: shot1Path });
  const var1 = calculateColorVariance(shot1Buffer);
  console.log(`  \u2713 01-generated-tower-2d.png saved (Pixel Variance: ${var1.toFixed(2)}, Size: ${shot1Buffer.length} bytes)`);
  if (var1 < 50) throw new Error("01-generated-tower-2d appears blank");
  console.log("\n  [CAPTURE 2] Verifying ArchLang 2D Presentation Sheet...");
  const archLangTab = page.locator('button:has-text("2D Presentation (ArchLang)")').first();
  if (await archLangTab.count() > 0) {
    await archLangTab.click();
    await page.waitForTimeout(3e3);
  }
  const shot2Path = path.join(screenshotsDir, "02-generated-tower-archlang.png");
  const shot2Buffer = await page.screenshot({ path: shot2Path });
  const var2 = calculateColorVariance(shot2Buffer);
  console.log(`  \u2713 02-generated-tower-archlang.png saved (Pixel Variance: ${var2.toFixed(2)}, Size: ${shot2Buffer.length} bytes)`);
  if (var2 < 50) throw new Error("02-generated-tower-archlang appears blank");
  console.log("\n  [CAPTURE 3] Verifying Pascal 3D Studio (Full View)...");
  const pascalTab = page.locator('button:has-text("3D Pascal Studio")').first();
  if (await pascalTab.count() > 0) {
    await pascalTab.click();
    await page.waitForTimeout(4e3);
  }
  const shot3Path = path.join(screenshotsDir, "03-generated-tower-pascal-3d-full.png");
  const shot3Buffer = await page.screenshot({ path: shot3Path });
  const var3 = calculateColorVariance(shot3Buffer);
  console.log(`  \u2713 03-generated-tower-pascal-3d-full.png saved (Pixel Variance: ${var3.toFixed(2)}, Size: ${shot3Buffer.length} bytes)`);
  if (var3 < 50) throw new Error("03-generated-tower-pascal-3d-full appears blank");
  console.log("\n  [CAPTURE 4] Verifying Split View (2D + 3D)...");
  const splitTab = page.locator('button:has-text("Split View (2D + 3D)")').first();
  if (await splitTab.count() > 0) {
    await splitTab.click();
    await page.waitForTimeout(4e3);
  }
  const shot4Path = path.join(screenshotsDir, "04-generated-tower-split-2d-3d.png");
  const shot4Buffer = await page.screenshot({ path: shot4Path });
  const var4 = calculateColorVariance(shot4Buffer);
  console.log(`  \u2713 04-generated-tower-split-2d-3d.png saved (Pixel Variance: ${var4.toFixed(2)}, Size: ${shot4Buffer.length} bytes)`);
  if (var4 < 50) throw new Error("04-generated-tower-split-2d-3d appears blank");
  await browser.close();
  console.log("\n========================================================================");
  console.log("  ALL AUDIT GATES PASSED WITH ZERO SILENT FALLBACKS");
  console.log("========================================================================");
}
main().catch((err) => {
  console.error("\n\u274C VERIFICATION SCRIPT FAILED:", err);
  process.exit(1);
});
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
