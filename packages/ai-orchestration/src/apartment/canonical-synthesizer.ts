/**
 * Master Canonical Synthesizer (§Stage B1 Single-Synthesis Rule).
 *
 * Applies the final geometric, opening, and structural synthesis pass ONCE onto
 * CanonicalBuilding before it is returned, persisted, or passed to downstream views
 * (2D Engineering, 2D Presentation Sheet, Pascal 3D Studio, AutoCAD/DXF, ETABS, and constraint-engine).
 */

import type { Building } from '@ai-floor-planner/core';
import { withMepEngineering } from '@ai-floor-planner/planning-engine';
import { synthesizeBuildingOpenings } from './opening-synthesizer.js';
import { solveBuildingStructuralGrid } from './structural-grid-solver.js';
import { synthesizeBasicInteriors } from './interior-furnishing-engine.js';

export function synthesizeCanonicalBuilding(building: Building): Building {
  if (!building || !building.floors || building.floors.length === 0) {
    return building;
  }

  // 1. Synthesize categorized openings (100% reachability & ventilation)
  const withOpenings = synthesizeBuildingOpenings(building);

  // 2. Synthesize structural column grid and multi-story stairs
  const { building: withStructure } = solveBuildingStructuralGrid(withOpenings);

  // 3. Synthesize collision-free basic house interiors & MEP ceiling fixtures (§Stage B2)
  const withInteriors = synthesizeBasicInteriors(withStructure);

  // 4. Synthesize coordinated Electrical, Plumbing, Reflected Ceiling & Fire Safety MEP plan
  return withMepEngineering(withInteriors);
}
