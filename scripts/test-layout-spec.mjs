// Test layout geometry for 30x50 2BHK
const plot = { width: 9144, depth: 15240 };
const footprint = { minX: 1000, maxX: 8140, minY: 1500, maxY: 14000 };
// Width: 7140mm, Depth: 12500mm

const rooms = [
  // 1. Entrance Porch
  { id: 'r_porch', name: 'Entrance Porch', type: 'foyer', x: 1000, y: 1500, w: 3200, h: 2200 },
  // 2. Sit-out Balcony
  { id: 'r_balcony', name: 'Front Balcony', type: 'balcony', x: 3200, y: 1500, w: 4940, h: 2200 },
  // 3. Living & Dining
  { id: 'r_living', name: 'Living & Dining Room', type: 'living_dining', x: 1000, y: 3700, w: 4400, h: 5300 },
  // 4. Kitchen
  { id: 'r_kitchen', name: 'Kitchen', type: 'kitchen', x: 5400, y: 3700, w: 2740, h: 3300 },
  // 5. Utility
  { id: 'r_utility', name: 'Utility / Wash', type: 'utility', x: 5400, y: 7000, w: 2740, h: 2000 },
  // 6. Central Hallway
  { id: 'r_hallway', name: 'Hallway', type: 'corridor', x: 3200, y: 9000, w: 1400, h: 1800 },
  // 7. Common Bath
  { id: 'r_bath_common', name: 'Common Bathroom', type: 'common_toilet', x: 4600, y: 9000, w: 3540, h: 1800 },
  // 8. Bedroom 2
  { id: 'r_bed_2', name: 'Bedroom 2', type: 'bedroom', x: 1000, y: 9000, w: 3200, h: 5000 }, // wait, y: 9000 to 14000 = 5000h
  // 9. Master Bedroom
  { id: 'r_bed_master', name: 'Master Bedroom', type: 'master_bedroom', x: 4200, y: 10800, w: 3940, h: 3200 },
  // 10. Attached Master Bath
  { id: 'r_bath_master', name: 'Attached Bath', type: 'master_toilet', x: 2600, y: 10800, w: 1600, h: 3200 } // or similar
];

console.log('Room count:', rooms.length);
let totalArea = 0;
for (const r of rooms) {
  const area = (r.w * r.h) / 1e6;
  totalArea += area;
  console.log(`  ${r.name.padEnd(22)}: ${r.w}x${r.h} mm (${area.toFixed(1)} m²) [${r.x},${r.y}]`);
}
console.log('Total room carpet area:', totalArea.toFixed(1), 'm²');
