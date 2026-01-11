import {
  MountingComponent,
  DesignConfig,
  LayoutResult
} from '../types/designer';
import { componentUrls } from '../data/componentUrls';
import { PLACEHOLDER_ICON } from '../data/componentImages';

/**
 * Component mappings based on Excel tick marks
 * Maps system name to list of component part numbers
 */
const FLUSH_MOUNT_COMPONENTS: Record<string, string[]> = {
  'Tile Long Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-TILE-P', 'ZP-SCREW-TPS-6.35X60'],
  'IBR Landscape No Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'CLASS3-STITCH-14X22', 'KDS-IBR78-PCSLOT'],
  'IBR Long Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'CLASS3-STITCH-14X22', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-PC30', 'KDS-IBR78-PCSLOT'],
  'IBR Portrait No Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'CLASS3-STITCH-14X22', 'KDS-IBR250-ADJ2F-PCSLOT'],
  'Diamond Deck Landscape No Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-DD120-PCSLOT'],
  'Diamond Deck Long Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-PC30', 'KDS-DD120-PCSLOT'],
  'Novotexi Landscape No Rail (Non-penetrating)': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-NOVOT78-PCSLOT'],
  'Novotexi Landscape No Rail (Penetrating)': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'CLASS3-STITCH-14X22', 'KDS-NOVOT78-PCSLOT-PEN'],
  'Novotexi Long Rail (Non-penetrating)': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-PC30', 'KDS-NOVOT78-PCSLOT'],
  'Novotexi Long Rail (Penetrating)': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'CLASS3-STITCH-14X22', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-PC30', 'KDS-NOVOT78-PCSLOT-PEN'],
  'DS700 Landscape No Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-DS700-78-PCSLOT'],
  'DS700 Long Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-PC30', 'KDS-DS700-78-PCSLOT'],
  'Slate / Harvey Long Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-SLATE/HARVEY-1-KIT'],
  'Standing Seam Landscape No Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-SS120-4.52H-PCSLOT'],
  'Standing Seam Long Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-PC30', 'KDS-SS120-4.52H-PCSLOT'],
  'Corrugated Landscape No Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'CLASS3-STITCH-14X22', 'KDS-COR78-PCSLOT'],
  'Corrugated Long Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'CLASS3-STITCH-14X22', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-PC30', 'KDS-COR78-PCSLOT'],
  'Corrugated Portrait No Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'CLASS3-STITCH-14X22', 'KDS-COR200-PCSLOT'],
  'Cliplock Long Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-PC30', 'KDS-CL78-PCSLOT'],
  'Cliplock Landscape No Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-CL78-PCSLOT'],
  'Cliplock Portrait No Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-CL78-PCSLOT-500NRP'],
  'Big Six Long Rail': ['KDS-MC35-40P', 'KDS-END CLAMP-P', 'KDS-EARTH-BAR-MP', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-HANG-BOLT-BRACKET-P', 'KDS-HANG-BOLT-M10X200W']
};

const TILT_MOUNT_COMPONENTS: Record<string, string[]> = {
  'IBR Landscape A-Frame': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-A', 'KDS-AF13-25ADJ-LS-2PP-1135', 'KDS-BNWT-DBL', 'KDS-IBR120-PCSLOT'],
  'IBR Landscape Tiltup AC': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-IBR120-15TILT-LS-F-AC', 'KDS-IBR120-15TILT-LS-R-AC'],
  'IBR Landscape Tiltup AL': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-IBR250-2F-15TILT-LS-R-AL', 'KDS-IBR250-2F-15TILT-LS-F-AL'],
  'IBR Portrait A-Frame': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-AF13-25ADJ-PORT-BNW', 'KDS-BNWT-DBL', 'KDS-IBR120-PCSLOT', 'KDS-IBR250-ADJ2F-PCSLOT'],
  'IBR Portrait Tiltup AC': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-IBR120-15TILT-P-R-AC', 'KDS-IBR120-15TILT-P-F-AC'],
  'IBR Portrait Tiltup AL': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-IBR250-2F-15TILT-P-R-AL', 'KDS-IBR250-2F-15TILT-P-F-AL'],
  'Corrugated Portrait Tiltup AL': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-COR200-15TILT-P-R-AL', 'KDS-COR200-15TILT-P-F-AL'],
  'Diamond Deck Landscape A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-A', 'KDS-AF13-25ADJ-LS-2PP-1135', 'KDS-BNWT-DBL', 'KDS-DD120-PCSLOT'],
  'Diamond Deck Portrait A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-AF13-25ADJ-PORT-BNW', 'KDS-BNWT-DBL', 'KDS-DD120-PCSLOT'],
  'Novotexi Landscape A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-A', 'KDS-AF13-25ADJ-LS-2PP-1135', 'KDS-BNWT-DBL', 'KDS-NOVOT120-PCSLOT'],
  'Novotexi Portrait A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-AF13-25ADJ-PORT-BNW', 'KDS-BNWT-DBL', 'KDS-NOVOT120-PCSLOT'],
  'DS700 Landscape A-Frame': ['KDS-DS700-120-PCSLOT'],
  'DS700 Portrait A-Frame': ['KDS-DS700-120-PCSLOT'],
  'Flat Concrete Tier 1 Landscape A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-BALLAST-HOLD', 'KDS-BALLAST-12', 'KDS-RWD-BH-LS', 'EPDM1.5-PSA-1190X50', 'KDS-END CLAMP-A', 'CLASS3-TEK-SCREW-No.12x25mm-NS', 'KDS-AF13-25ADJ-LS-2PP-1135'],
  'Flat Concrete Tier 2 Landscape A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-BALLAST-12', 'KDS-RWD-BH-LS', 'EPDM1.5-PSA-1190X50', 'KDS-END CLAMP-A', 'KDS-GUSSET-P-F-BH', 'KDS-AF15FX-GUSS-LS-BNW'],
  'Flat Concrete Tier 3 Portrait A-Frame': ['KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'SS304-WASHER-FLAT-M12', 'SS304-NUT-M12', 'SS304-THREAD-M12', 'KDS-SAFE-FIX300', 'KDS-AF15FX-HW-PORT-BNW'],
  'Flat Concrete Tier 3 Landscape A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-A', 'SS304-WASHER-FLAT-M12', 'SS304-NUT-M12', 'SS304-THREAD-M12', 'KDS-SAFE-FIX300', 'KDS-AF15FX-HW-LS-BNW'],
  'Flat Concrete Tier 1 Portrait A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-BALLAST-HOLD', 'KDS-BALLAST-12', 'CLASS3-TEK-SCREW-No.12x25mm-NS', 'KDS-MC35-40P', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'EPDM1.5-PSA-1730x50', 'KDS-RWD-BH-PORT', 'KDS-AF13-25ADJ-PORT-BNW'],
  'Flat Concrete Tier 2 Portrait A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-BALLAST-12', 'CLASS3-TEK-SCREW-No.12x25mm-NS', 'KDS-GUSSET-P-F-BH', 'KDS-MC35-40P', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'EPDM1.5-PSA-1730x50', 'KDS-RWD-BH-PORT', 'KDS-AF15FX-GUSS-PORT-BNW'],
  'Corrugated Landscape Tiltup AC': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-COR120-15TILT-LS-R-AC', 'KDS-COR120-15TILT-LS-F-AC'],
  'Corrugated Landscape Tiltup AL': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-COR200-15TILT-LS-R-AL', 'KDS-COR200-15TILT-LS-F-AL'],
  'Corrugated Portrait Tiltup AC': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-COR120-15TILT-P-R-AC', 'KDS-COR120-15TILT-P-F-AC'],
  'Corrugated Landscape A-Frame': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-A', 'KDS-AF13-25ADJ-LS-2PP-1135', 'KDS-BNWT-DBL', 'KDS-COR120-PCSLOT'],
  'Corrugated Portrait A-Frame': ['CLASS3-STITCH-14X22', 'KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-AF13-25ADJ-PORT-BNW', 'KDS-BNWT-DBL', 'KDS-COR120-PCSLOT', 'KDS-COR200-PCSLOT'],
  'Cliplock Landscape Tiltup AC': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-CL120-15TILT-LS-R-AC', 'KDS-CL120-15TILT-LS-F-AC'],
  'Cliplock Landscape Tiltup AL': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-CL120-15TILT-LS-R-AL', 'KDS-CL120-15TILT-LS-F-AL'],
  'Cliplock Portrait Tiltup AC': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-CL120-15TILT-P-R-AC', 'KDS-CL120-15TILT-P-F-AC'],
  'Cliplock Portrait Tiltup AL': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-CL120-15TILT-P-R-AL', 'KDS-CL120-15TILT-P-F-AL'],
  'Cliplock Landscape A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-A', 'KDS-AF13-25ADJ-LS-2PP-1135', 'KDS-BNWT-DBL', 'KDS-CL120-PCSLOT'],
  'Cliplock Portrait A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-AF13-25ADJ-PORT-BNW', 'KDS-BNWT-DBL', 'KDS-CL120-PCSLOT'],
  'Big Six Landscape A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-A', 'KDS-AF13-25ADJ-LS-2PP-1135', 'KDS-HANG-BOLT-M10X200W'],
  'Big Six Portrait A-Frame': ['KDS-EARTH-BAR-MP', 'KDS-END CLAMP-P', 'KDS-MC35-40P', 'KDS-RAIL-LT', 'KDS-U-JOIN', 'KDS-AF13-25ADJ-PORT-BNW', 'KDS-HANG-BOLT-M10X200W']
};

/**
 * Available KDS rail lengths (in mm)
 */
const AVAILABLE_RAIL_LENGTHS = [
  { partNumber: 'KDS-RAIL-LT-4400mm', length: 4400 },
  { partNumber: 'KDS-RAIL-LT-4720mm', length: 4720 },
  { partNumber: 'KDS-RAIL-LT-6600mm', length: 6600 }
];

/**
 * Optimization criteria for rail selection
 * Note: Currently using MixedRailConfiguration instead
 */
// interface RailConfiguration {
//   partNumber: string;
//   length: number;
//   railsNeeded: number;
//   joinersNeeded: number;
//   totalWaste: number;
//   wastePercentage: number;
// }

/**
 * Mixed rail configuration (allows multiple rail types)
 */
interface MixedRailConfiguration {
  rails: Array<{ partNumber: string; length: number; quantity: number }>;
  totalRails: number;
  totalJoiners: number;
  totalWaste: number;
  wastePercentage: number;
  totalLength: number;
}

/**
 * Calculate optimal rail configuration for a given rail line length
 * Now supports mixing different rail lengths for minimal waste
 * Prioritizes: 1) Minimize waste, 2) Minimize joiners, 3) Minimize rail types
 */
function selectOptimalMixedRails(railLineLength: number): MixedRailConfiguration {
  const configurations: MixedRailConfiguration[] = [];

  // Strategy 1: Single rail type (original approach)
  for (const rail of AVAILABLE_RAIL_LENGTHS) {
    const railsNeeded = Math.ceil(railLineLength / rail.length);
    const totalLength = railsNeeded * rail.length;
    const totalWaste = totalLength - railLineLength;
    const wastePercentage = (totalWaste / totalLength) * 100;

    configurations.push({
      rails: [{ partNumber: rail.partNumber, length: rail.length, quantity: railsNeeded }],
      totalRails: railsNeeded,
      totalJoiners: railsNeeded - 1,
      totalWaste,
      wastePercentage,
      totalLength
    });
  }

  // Strategy 2: Mixed rail lengths for optimal fit
  // Try combinations of two different rail types
  for (let i = 0; i < AVAILABLE_RAIL_LENGTHS.length; i++) {
    for (let j = i + 1; j < AVAILABLE_RAIL_LENGTHS.length; j++) {
      const rail1 = AVAILABLE_RAIL_LENGTHS[i];
      const rail2 = AVAILABLE_RAIL_LENGTHS[j];

      // Try different quantities of rail1 (0 to reasonable max)
      const maxRail1 = Math.ceil(railLineLength / rail1.length) + 1;
      
      for (let qty1 = 1; qty1 <= maxRail1; qty1++) {
        const lengthFromRail1 = qty1 * rail1.length;
        const remainingLength = railLineLength - lengthFromRail1;
        
        if (remainingLength <= 0) continue; // Only rail1 needed
        
        const qty2 = Math.ceil(remainingLength / rail2.length);
        const totalLength = lengthFromRail1 + (qty2 * rail2.length);
        const totalWaste = totalLength - railLineLength;
        
        if (totalWaste < 0) continue; // Invalid combination
        
        const totalRails = qty1 + qty2;
        const wastePercentage = (totalWaste / totalLength) * 100;

        configurations.push({
          rails: [
            { partNumber: rail1.partNumber, length: rail1.length, quantity: qty1 },
            { partNumber: rail2.partNumber, length: rail2.length, quantity: qty2 }
          ],
          totalRails,
          totalJoiners: totalRails - 1,
          totalWaste,
          wastePercentage,
          totalLength
        });
      }

      // Also try rail2 first, then rail1
      const maxRail2 = Math.ceil(railLineLength / rail2.length) + 1;
      
      for (let qty2 = 1; qty2 <= maxRail2; qty2++) {
        const lengthFromRail2 = qty2 * rail2.length;
        const remainingLength = railLineLength - lengthFromRail2;
        
        if (remainingLength <= 0) continue;
        
        const qty1 = Math.ceil(remainingLength / rail1.length);
        const totalLength = lengthFromRail2 + (qty1 * rail1.length);
        const totalWaste = totalLength - railLineLength;
        
        if (totalWaste < 0) continue;
        
        const totalRails = qty1 + qty2;
        const wastePercentage = (totalWaste / totalLength) * 100;

        configurations.push({
          rails: [
            { partNumber: rail2.partNumber, length: rail2.length, quantity: qty2 },
            { partNumber: rail1.partNumber, length: rail1.length, quantity: qty1 }
          ],
          totalRails,
          totalJoiners: totalRails - 1,
          totalWaste,
          wastePercentage,
          totalLength
        });
      }
    }
  }

  // Sort by: 1) Least waste percentage, 2) Fewest joiners, 3) Fewest rail types
  configurations.sort((a, b) => {
    // Primary: minimize waste percentage
    if (Math.abs(a.wastePercentage - b.wastePercentage) > 0.1) {
      return a.wastePercentage - b.wastePercentage;
    }
    // Secondary: minimize joiners
    if (a.totalJoiners !== b.totalJoiners) {
      return a.totalJoiners - b.totalJoiners;
    }
    // Tertiary: prefer fewer rail types
    return a.rails.length - b.rails.length;
  });

  return configurations[0];
}

/**
 * Component display names, units, and images
 */
const COMPONENT_INFO: Record<string, { name: string; unit: string; image: string }> = {
  'KDS-MC35-40P': { name: 'Mid Clamps', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-END CLAMP-P': { name: 'End Clamps (Portrait)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-END CLAMP-A': { name: 'End Clamps (Angle)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-EARTH-BAR-MP': { name: 'Earth Bar (Module)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'CLASS3-STITCH-14X22': { name: 'Self-Tapping Screws', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-IBR78-PCSLOT': { name: 'IBR Roof Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-IBR250-ADJ2F-PCSLOT': { name: 'IBR Adjustable Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-RAIL-LT': { name: 'KDS Rails (Light)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-RAIL-LT-4400mm': { name: 'KDS Rails (Light) 4400mm', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-RAIL-LT-4720mm': { name: 'KDS Rails (Light) 4720mm', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-RAIL-LT-6600mm': { name: 'KDS Rails (Light) 6600mm', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-U-JOIN': { name: 'Rail Joiners (U-Joint)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-PC30': { name: 'Shared Rails (PC30)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-COR78-PCSLOT': { name: 'Corrugated Roof Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-COR200-PCSLOT': { name: 'Corrugated Portrait Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-CL78-PCSLOT': { name: 'Cliplock Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-CL78-PCSLOT-500NRP': { name: 'Cliplock Portrait Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-DD120-PCSLOT': { name: 'Diamond Deck Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-NOVOT78-PCSLOT': { name: 'Novotexi Brackets (Non-penetrating)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-NOVOT78-PCSLOT-PEN': { name: 'Novotexi Brackets (Penetrating)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-HANG-BOLT-BRACKET-P': { name: 'Hang Bolt Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-HANG-BOLT-M10X200W': { name: 'Hang Bolts M10x200', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-DS700-78-PCSLOT': { name: 'DS700 Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-SLATE/HARVEY-1-KIT': { name: 'Slate/Harvey Kit', unit: 'kits', image: PLACEHOLDER_ICON },
  'KDS-SS120-4.52H-PCSLOT': { name: 'Standing Seam Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-IBR120-15TILT-LS-F-AC': { name: 'Tilt-up Front Brackets (AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-IBR120-15TILT-LS-R-AC': { name: 'Tilt-up Rear Brackets (AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-BALLAST-HOLD': { name: 'Ballast Holders', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-BALLAST-12': { name: 'Ballast Blocks', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-RWD-BH-LS': { name: 'A-Frame Rear Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'EPDM1.5-PSA-1190X50': { name: 'EPDM Protection Mat', unit: 'meters', image: PLACEHOLDER_ICON },
  'CLASS3-TEK-SCREW-No.12x25mm-NS': { name: 'Tek Screws for Metal Roof', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-AF13-25ADJ-LS-2PP-1135': { name: 'A-Frame Front Brackets (15° Adjustable)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-GUSSET-P-F-BH': { name: 'A-Frame Gussets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-AF15FX-GUSS-LS-BNW': { name: 'A-Frame Gussets (Fixed)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'SS304-WASHER-FLAT-M12': { name: 'M12 Flat Washers (Stainless)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'SS304-NUT-M12': { name: 'M12 Nuts (Stainless)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'SS304-THREAD-M12': { name: 'M12 Threaded Rods (Stainless)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-SAFE-FIX300': { name: 'Ground Mounting Posts', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-AF15FX-HW-PORT-BNW': { name: 'A-Frame Hardware (Portrait)', unit: 'sets', image: PLACEHOLDER_ICON },
  'KDS-AF15FX-HW-LS-BNW': { name: 'A-Frame Hardware (Landscape)', unit: 'sets', image: PLACEHOLDER_ICON },
  'KDS-TILE-P': { name: 'Tile Roof Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'ZP-SCREW-TPS-6.35X60': { name: 'Tile Fixing Screws 6.35x60', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-BNWT-DBL': { name: 'Double Ballast Nuts/Washers', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-IBR120-PCSLOT': { name: 'IBR 120mm Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-IBR250-2F-15TILT-LS-R-AL': { name: 'IBR Tilt-up Rear Brackets (Landscape AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-IBR250-2F-15TILT-LS-F-AL': { name: 'IBR Tilt-up Front Brackets (Landscape AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-IBR120-15TILT-P-R-AC': { name: 'IBR Tilt-up Rear Brackets (Portrait AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-IBR120-15TILT-P-F-AC': { name: 'IBR Tilt-up Front Brackets (Portrait AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-IBR250-2F-15TILT-P-R-AL': { name: 'IBR Tilt-up Rear Brackets (Portrait AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-IBR250-2F-15TILT-P-F-AL': { name: 'IBR Tilt-up Front Brackets (Portrait AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-COR200-15TILT-P-R-AL': { name: 'Corrugated Tilt-up Rear Brackets (Portrait AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-COR200-15TILT-P-F-AL': { name: 'Corrugated Tilt-up Front Brackets (Portrait AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-NOVOT120-PCSLOT': { name: 'Novotexi 120mm Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-DS700-120-PCSLOT': { name: 'DS700 120mm Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'EPDM1.5-PSA-1730x50': { name: 'EPDM Protection Mat (1730mm)', unit: 'meters', image: PLACEHOLDER_ICON },
  'KDS-RWD-BH-PORT': { name: 'A-Frame Rear Brackets (Portrait)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-AF13-25ADJ-PORT-BNW': { name: 'A-Frame Front Brackets (Portrait Adjustable)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-AF15FX-GUSS-PORT-BNW': { name: 'A-Frame Gussets (Portrait)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-COR120-15TILT-LS-R-AC': { name: 'Corrugated Tilt-up Rear Brackets (Landscape AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-COR120-15TILT-LS-F-AC': { name: 'Corrugated Tilt-up Front Brackets (Landscape AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-COR200-15TILT-LS-R-AL': { name: 'Corrugated Tilt-up Rear Brackets (Landscape AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-COR200-15TILT-LS-F-AL': { name: 'Corrugated Tilt-up Front Brackets (Landscape AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-COR120-15TILT-P-R-AC': { name: 'Corrugated Tilt-up Rear Brackets (Portrait AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-COR120-15TILT-P-F-AC': { name: 'Corrugated Tilt-up Front Brackets (Portrait AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-COR120-PCSLOT': { name: 'Corrugated 120mm Brackets', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-CL120-15TILT-LS-R-AC': { name: 'Cliplock Tilt-up Rear Brackets (Landscape AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-CL120-15TILT-LS-F-AC': { name: 'Cliplock Tilt-up Front Brackets (Landscape AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-CL120-15TILT-LS-R-AL': { name: 'Cliplock Tilt-up Rear Brackets (Landscape AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-CL120-15TILT-LS-F-AL': { name: 'Cliplock Tilt-up Front Brackets (Landscape AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-CL120-15TILT-P-R-AC': { name: 'Cliplock Tilt-up Rear Brackets (Portrait AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-CL120-15TILT-P-F-AC': { name: 'Cliplock Tilt-up Front Brackets (Portrait AC)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-CL120-15TILT-P-R-AL': { name: 'Cliplock Tilt-up Rear Brackets (Portrait AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-CL120-15TILT-P-F-AL': { name: 'Cliplock Tilt-up Front Brackets (Portrait AL)', unit: 'pieces', image: PLACEHOLDER_ICON },
  'KDS-CL120-PCSLOT': { name: 'Cliplock 120mm Brackets', unit: 'pieces', image: PLACEHOLDER_ICON }
};

/**
 * Calculate the total array dimensions and required mounting components
 */
export function calculateLayout(config: DesignConfig): LayoutResult {
  const { panelDimensions, arrayConfig, mountingSystem } = config;

  if (!mountingSystem) {
    return {
      arrayWidth: 0,
      arrayHeight: 0,
      totalPanels: 0,
      components: []
    };
  }

  // Calculate panel dimensions based on orientation
  // In landscape: length is horizontal (longer), width is vertical (shorter)
  // In portrait: width is horizontal (shorter), length is vertical (longer)
  const panelWidth = arrayConfig.orientation === 'landscape'
    ? panelDimensions.length
    : panelDimensions.width;
  const panelHeight = arrayConfig.orientation === 'landscape'
    ? panelDimensions.width
    : panelDimensions.length;

  // Calculate array dimensions (in mm)
  const arrayWidth = panelWidth * arrayConfig.columns;
  const arrayHeight = panelHeight * arrayConfig.rows;
  const totalPanels = arrayConfig.rows * arrayConfig.columns;

  // Calculate components based on mounting system category
  let components: MountingComponent[] = [];

  if (mountingSystem.category === 'flush-mount') {
    components = calculateFlushMountComponents(config, arrayWidth, arrayHeight, totalPanels);
  } else if (mountingSystem.category === 'tilt-mount') {
    components = calculateTiltMountComponents(config, arrayWidth, arrayHeight, totalPanels);
  } else if (mountingSystem.category === 'ground-mount') {
    components = calculateGroundMountComponents(config, arrayWidth, arrayHeight, totalPanels);
  }

  return {
    arrayWidth,
    arrayHeight,
    totalPanels,
    components
  };
}

/**
 * Calculate components for flush mount systems based on Excel tick marks
 * 
 * RAIL SYSTEM ARCHITECTURE:
 * - Each row has 2 rail lines: "top rail line" and "bottom rail line" (at 20% and 80% from edges)
 * - Rail line length = arrayWidth + (columns - 1) × 25mm + 2 × 35mm
 *   - 25mm per gap for mid-clamp spacing
 *   - 35mm overhang on each end for end clamps
 * - Number of rails needed = ceil(rail line length / standard rail length) per rail line
 * - Rail joiners per rail line = (rails per line - 1)
 * - Mid-clamps go between panels on BOTH rail lines (1 per gap per rail line)
 * - End clamps go at the far ends of BOTH rail lines (2 per row × 2 rail lines), on the overhang
 * - Roof brackets support the rail lines at ~1.4m spacing on BOTH rail lines
 * - Shared rails (PC30) match the quantity of roof brackets
 * - Self-tapping screws: 4 per bracket
 * 
 * NO-RAIL SYSTEM ARCHITECTURE:
 * - Panels rest directly on shared brackets (no rails)
 * - Shared brackets between panels: (columns - 1) × 2 positions × rows
 * - End brackets at row ends: 2 ends × 2 positions × rows
 * - Total brackets = shared brackets + end brackets
 * - Mid-clamps secure panels to shared brackets (2 per gap: top and bottom)
 * - Self-tapping screws: 4 per bracket
 */
function calculateFlushMountComponents(
  config: DesignConfig,
  arrayWidth: number,
  _arrayHeight: number,
  totalPanels: number
): MountingComponent[] {
  const { arrayConfig, mountingSystem } = config;
  const components: MountingComponent[] = [];

  if (!mountingSystem) return components;

  // Get component list for this system from tick marks
  const componentList = FLUSH_MOUNT_COMPONENTS[mountingSystem.name] || [];

  if (componentList.length === 0) {
    return components;
  }

  // Determine if this is a rail or no-rail system
  const isRailSystem = mountingSystem.name.includes('Long Rail');
  const isNoRailSystem = mountingSystem.name.includes('No Rail');

  // RAIL LINE CALCULATIONS (for rail systems)
  // Rail line length includes array width + mid-clamp spacing + end clamp overhang (35mm each end)
  const midClampSpacing = 25; // mm
  const endClampOverhang = 35; // mm (required space for end clamps on each end)
  const railLineLength = arrayWidth + (arrayConfig.columns - 1) * midClampSpacing + (2 * endClampOverhang); // mm
  
  // Select optimal rail configuration (may include mixed rail lengths)
  const optimalRailConfig = selectOptimalMixedRails(railLineLength);
  const totalRailsPerLine = optimalRailConfig.totalRails;
  const joinersPerLine = optimalRailConfig.totalJoiners;
  
  // Total rail lines = 2 per row (top and bottom)
  const totalRailLines = 2 * arrayConfig.rows;

  // Calculate quantities for each component
  for (const partNumber of componentList) {
    const info = COMPONENT_INFO[partNumber];
    if (!info) continue;

    let quantity = 0;
    let unit = info.unit;

    switch (partNumber) {
      case 'KDS-MC35-40P':
        // Mid clamps - secure panels to rails/brackets
        if (isRailSystem) {
          // RAIL SYSTEM: 2 rails per row, 1 mid-clamp per gap per rail
          // Formula: (columns - 1) gaps × 2 rails × rows
          // Example: (5-1) × 2 × 2 = 16 mid-clamps
          quantity = (arrayConfig.columns - 1) * 2 * arrayConfig.rows;
        } else if (isNoRailSystem) {
          // NO-RAIL SYSTEM: 2 mid-clamps per gap (top and bottom bracket)
          // Formula: (columns - 1) gaps × 2 positions × rows
          // Example: (5-1) × 2 × 2 = 16 mid-clamps
          quantity = (arrayConfig.columns - 1) * 2 * arrayConfig.rows;
        }
        break;

      case 'KDS-END CLAMP-P':
      case 'KDS-END CLAMP-A':
        // End clamps - secure the panels at the far left and right edges
        if (isRailSystem) {
          // RAIL SYSTEM: 2 end clamps per row (left and right) × 2 rails (top and bottom)
          // Formula: 2 ends × 2 rails × rows
          // Example: 2 × 2 × 2 = 8 end clamps
          quantity = 2 * 2 * arrayConfig.rows;
        } else if (isNoRailSystem) {
          // NO-RAIL SYSTEM: 2 end clamps per row (left and right) × 2 brackets (top and bottom)
          // Formula: 2 ends × 2 positions × rows
          // Example: 2 × 2 × 2 = 8 end clamps
          quantity = 2 * 2 * arrayConfig.rows;
        }
        break;

      case 'KDS-EARTH-BAR-MP':
        // Earth bars - one per two rows (electrical grounding)
        quantity = Math.ceil(arrayConfig.rows / 2);
        break;

      case 'CLASS3-STITCH-14X22':
        // Self-tapping screws - secure brackets to roof
        // 4 screws per bracket
        if (isRailSystem) {
          // RAIL SYSTEM: 4 screws per bracket × brackets on all rail lines
          const bracketSpacing = 1400; // mm
          const bracketsPerRailLine = Math.ceil(railLineLength / bracketSpacing);
          // Formula: bracketsPerRailLine × total rail lines × 4 screws
          quantity = bracketsPerRailLine * totalRailLines * 4;
        } else {
          // NO-RAIL SYSTEM: 4 screws per bracket × 2 brackets per panel (top and bottom)
          quantity = totalPanels * 2 * 4;
        }
        break;

      case 'KDS-RAIL-LT':
        // Rails - automatically select optimal rail length configuration
        // May include multiple rail types for optimal waste reduction
        if (isRailSystem) {
          // Add each rail type in the optimal configuration
          for (const railType of optimalRailConfig.rails) {
            const railInfo = COMPONENT_INFO[railType.partNumber];
            if (railInfo) {
              const totalQuantity = railType.quantity * totalRailLines;
              const railLengthM = (railLineLength / 1000).toFixed(2);
              const avgWastePerRail = (optimalRailConfig.totalWaste / optimalRailConfig.totalRails).toFixed(0);
              
              components.push({
                name: railInfo.name,
                partNumber: railType.partNumber,
                quantity: totalQuantity,
                unit: `pieces (${railType.length}mm rails, ${railLengthM}m total per line, ~${avgWastePerRail}mm avg offcut)`,
                image: railInfo.image,
                url: componentUrls[railType.partNumber] || componentUrls['KDS-RAIL-LT']
              });
            }
          }
        }
        // Skip adding to components in the normal flow since we already added it
        quantity = 0;
        break;

      case 'KDS-RAIL-LT-4400mm':
      case 'KDS-RAIL-LT-4720mm':
      case 'KDS-RAIL-LT-6600mm':
        // These are handled by the KDS-RAIL-LT case above
        quantity = 0;
        break;

      case 'KDS-U-JOIN':
        // Rail joiners - one joiner between each pair of rails in a rail line
        // Formula: joinersPerLine × total rail lines
        // If only 1 rail needed per line, no joiners required
        if (totalRailsPerLine > 1) {
          quantity = joinersPerLine * totalRailLines;
        } else {
          quantity = 0;
        }
        break;

      case 'KDS-PC30':
        // Shared rails (PC30) - these go between panels at bracket locations
        // Quantity should match the number of roof brackets
        if (isRailSystem) {
          const bracketSpacing = 1400; // mm
          const bracketsPerRailLine = Math.ceil(railLineLength / bracketSpacing);
          // Same quantity as brackets: bracketsPerRailLine × total rail lines
          quantity = bracketsPerRailLine * totalRailLines;
        }
        break;

      case 'KDS-IBR78-PCSLOT':
      case 'KDS-IBR120-PCSLOT':
      case 'KDS-IBR250-ADJ2F-PCSLOT':
      case 'KDS-COR78-PCSLOT':
      case 'KDS-COR120-PCSLOT':
      case 'KDS-COR200-PCSLOT':
      case 'KDS-CL78-PCSLOT':
      case 'KDS-CL120-PCSLOT':
      case 'KDS-CL78-PCSLOT-500NRP':
      case 'KDS-DD120-PCSLOT':
      case 'KDS-NOVOT78-PCSLOT':
      case 'KDS-NOVOT120-PCSLOT':
      case 'KDS-NOVOT78-PCSLOT-PEN':
      case 'KDS-DS700-78-PCSLOT':
      case 'KDS-DS700-120-PCSLOT':
      case 'KDS-SS120-4.52H-PCSLOT':
        // Roof brackets - secure rail lines to roof structure
        if (isRailSystem) {
          // RAIL SYSTEM: Brackets spaced at ~1.4m intervals on BOTH rail lines
          const bracketSpacing = 1400; // mm
          const bracketsPerRailLine = Math.ceil(railLineLength / bracketSpacing);
          // Formula: bracketsPerRailLine × total rail lines
          // Example: For 8.635m rail line: ceil(8635/1400) = 7 brackets per rail line
          //          7 × 4 rail lines (2 rows × 2 lines) = 28 brackets total
          quantity = bracketsPerRailLine * totalRailLines;
        } else if (isNoRailSystem) {
          // NO-RAIL SYSTEM: Shared brackets between panels + end brackets
          // Architecture: Panels rest on shared brackets positioned at gaps
          // 
          // Shared brackets (between panels): (columns - 1) gaps × 2 positions (top/bottom) × rows
          // End brackets (at row ends): 2 ends × 2 positions (top/bottom) × rows
          // 
          // Example for 2 rows × 4 columns:
          //   Shared: (4-1) × 2 × 2 = 12 brackets
          //   End: 2 × 2 × 2 = 8 brackets
          //   Total: 12 + 8 = 20 brackets
          const sharedBrackets = (arrayConfig.columns - 1) * 2 * arrayConfig.rows;
          const endBrackets = 2 * 2 * arrayConfig.rows;
          quantity = sharedBrackets + endBrackets;
        }
        break;

      case 'KDS-HANG-BOLT-BRACKET-P':
      case 'KDS-HANG-BOLT-M10X200W':
        // Hang bolts for special roof types (e.g., tile, Big Six)
        // 2 hang bolts per row × 2 rails
        quantity = 2 * 2 * arrayConfig.rows;
        break;

      case 'KDS-SLATE/HARVEY-1-KIT':
        // Slate/Harvey mounting kit - 2 per row (one per rail)
        quantity = 2 * arrayConfig.rows;
        break;

      case 'KDS-TILE-P':
        // Tile roof brackets - spaced at ~1.4m on both rail lines
        if (isRailSystem) {
          const bracketSpacing = 1400; // mm
          const bracketsPerRailLine = Math.ceil(railLineLength / bracketSpacing);
          quantity = bracketsPerRailLine * totalRailLines;
        }
        break;

      case 'ZP-SCREW-TPS-6.35X60':
        // Tile fixing screws - 2 screws per bracket
        if (isRailSystem) {
          const bracketSpacing = 1400; // mm
          const bracketsPerRailLine = Math.ceil(railLineLength / bracketSpacing);
          quantity = bracketsPerRailLine * totalRailLines * 2; // ×2 for 2 screws per bracket
        }
        break;

      default:
        quantity = 1;
    }

    if (quantity > 0) {
      components.push({
        name: info.name,
        partNumber: partNumber,
        quantity: quantity,
        unit: unit,
        image: info.image,
        url: componentUrls[partNumber]
      });
    }
  }

  return components;
}

/**
 * Calculate components for tilt mount systems based on Excel tick marks
 */
function calculateTiltMountComponents(
  config: DesignConfig,
  arrayWidth: number,
  _arrayHeight: number,
  totalPanels: number
): MountingComponent[] {
  const { arrayConfig, mountingSystem } = config;
  const components: MountingComponent[] = [];

  if (!mountingSystem) return components;

  // Get component list for this system from tick marks
  const componentList = TILT_MOUNT_COMPONENTS[mountingSystem.name] || [];

  if (componentList.length === 0) {
    return components;
  }

  // Determine tier level from system name
  const tierMatch = mountingSystem.name.match(/Tier (\d+)/);
  const tierLevel = tierMatch ? parseInt(tierMatch[1]) : 1;

  // Calculate quantities for each component
  for (const partNumber of componentList) {
    const info = COMPONENT_INFO[partNumber];
    if (!info) continue;

    let quantity = 0;
    let unit = info.unit;

    switch (partNumber) {
      case 'KDS-RAIL-LT': {
        // Rails for tilt system
        quantity = tierLevel * arrayConfig.columns;
        const railLengthM = (arrayWidth / 1000).toFixed(2);
        unit = `pieces (${railLengthM}m each)`;
        break;
      }

      case 'KDS-U-JOIN':
        // Rail joiners
        const totalRailLength = tierLevel * arrayConfig.columns * (arrayWidth / 1000);
        quantity = Math.ceil(totalRailLength / 3);
        break;

      case 'KDS-MC35-40P':
        // Mid clamps
        quantity = (arrayConfig.columns - 1) * tierLevel * arrayConfig.rows;
        break;

      case 'KDS-END CLAMP-P':
        // End clamps
        quantity = tierLevel * 2 * arrayConfig.rows;
        break;

      case 'KDS-END CLAMP-A':
        // End clamps for A-frame
        quantity = tierLevel * 2;
        break;

      case 'KDS-EARTH-BAR-MP':
        // Earth bar
        quantity = Math.ceil((tierLevel * arrayConfig.columns) / 2);
        break;

      case 'CLASS3-STITCH-14X22':
      case 'CLASS3-TEK-SCREW-No.12x25mm-NS':
        // Screws
        quantity = totalPanels * 8;
        break;

      case 'KDS-IBR120-15TILT-LS-F-AC':
      case 'KDS-IBR120-15TILT-LS-R-AC':
      case 'KDS-IBR250-2F-15TILT-LS-F-AL':
      case 'KDS-IBR250-2F-15TILT-LS-R-AL':
      case 'KDS-IBR120-15TILT-P-F-AC':
      case 'KDS-IBR120-15TILT-P-R-AC':
      case 'KDS-IBR250-2F-15TILT-P-F-AL':
      case 'KDS-IBR250-2F-15TILT-P-R-AL':
      case 'KDS-COR120-15TILT-LS-F-AC':
      case 'KDS-COR120-15TILT-LS-R-AC':
      case 'KDS-COR200-15TILT-LS-F-AL':
      case 'KDS-COR200-15TILT-LS-R-AL':
      case 'KDS-COR120-15TILT-P-F-AC':
      case 'KDS-COR120-15TILT-P-R-AC':
      case 'KDS-COR200-15TILT-P-F-AL':
      case 'KDS-COR200-15TILT-P-R-AL':
      case 'KDS-CL120-15TILT-LS-F-AC':
      case 'KDS-CL120-15TILT-LS-R-AC':
      case 'KDS-CL120-15TILT-LS-F-AL':
      case 'KDS-CL120-15TILT-LS-R-AL':
      case 'KDS-CL120-15TILT-P-F-AC':
      case 'KDS-CL120-15TILT-P-R-AC':
      case 'KDS-CL120-15TILT-P-F-AL':
      case 'KDS-CL120-15TILT-P-R-AL':
        // Tilt brackets (front and rear)
        quantity = arrayConfig.columns;
        break;

      case 'KDS-BALLAST-12':
        // Ballast blocks
        quantity = arrayConfig.columns * 4 * tierLevel;
        break;

      case 'KDS-BALLAST-HOLD':
        // Ballast holders
        quantity = arrayConfig.columns * 2;
        break;

      case 'KDS-RWD-BH-LS':
      case 'KDS-RWD-BH-PORT':
        // Rear brackets (landscape and portrait)
        quantity = arrayConfig.columns;
        break;

      case 'EPDM1.5-PSA-1190X50':
      case 'EPDM1.5-PSA-1730x50':
        // EPDM mat (both widths)
        quantity = Math.ceil(arrayWidth / 1000);
        unit = 'meters';
        break;

      case 'KDS-AF13-25ADJ-LS-2PP-1135':
      case 'KDS-AF13-25ADJ-PORT-BNW':
        // A-frame brackets (landscape and portrait)
        quantity = arrayConfig.columns;
        break;

      case 'KDS-GUSSET-P-F-BH':
      case 'KDS-AF15FX-GUSS-LS-BNW':
      case 'KDS-AF15FX-GUSS-PORT-BNW':
        // Gussets (landscape and portrait)
        quantity = arrayConfig.columns * 2;
        break;

      case 'KDS-BNWT-DBL':
        // Double ballast nuts/washers - used with A-frame systems
        quantity = arrayConfig.columns * 2;
        break;

      case 'SS304-WASHER-FLAT-M12':
      case 'SS304-NUT-M12':
        // Hardware
        quantity = totalPanels * 4;
        break;

      case 'SS304-THREAD-M12':
        // Threaded rods
        quantity = totalPanels * 2;
        break;

      case 'KDS-SAFE-FIX300': {
        // Ground posts
        const railLengthM = arrayWidth / 1000;
        const postsPerRail = Math.ceil(railLengthM / 2);
        quantity = postsPerRail * tierLevel;
        break;
      }

      case 'KDS-AF15FX-HW-PORT-BNW':
      case 'KDS-AF15FX-HW-LS-BNW':
        // A-frame hardware sets
        quantity = arrayConfig.columns;
        break;

      default:
        quantity = 1;
    }

    if (quantity > 0) {
      components.push({
        name: info.name,
        partNumber: partNumber,
        quantity: quantity,
        unit: unit,
        image: info.image,
        url: componentUrls[partNumber]
      });
    }
  }

  return components;
}

/**
 * Calculate components for ground mount systems
 * Note: Ground mount has no components in Excel tick marks
 */
function calculateGroundMountComponents(
  config: DesignConfig,
  arrayWidth: number,
  _arrayHeight: number,
  _totalPanels: number
): MountingComponent[] {
  const { arrayConfig } = config;
  const components: MountingComponent[] = [];

  // Ground mount has no tick marks in Excel, so return empty or basic components
  // Using basic rail system components as fallback
  const railLengthM = arrayWidth / 1000;

  components.push({
    name: 'KDS Rails (Light)',
    partNumber: 'KDS-RAIL-LT',
    quantity: arrayConfig.rows,
    unit: `pieces (${railLengthM.toFixed(2)}m each)`,
    image: PLACEHOLDER_ICON,
    url: componentUrls['KDS-RAIL-LT']
  });

  components.push({
    name: 'Mid Clamps',
    partNumber: 'KDS-MC35-40P',
    quantity: (arrayConfig.columns - 1) * arrayConfig.rows,
    unit: 'pieces',
    image: PLACEHOLDER_ICON,
    url: componentUrls['KDS-MC35-40P']
  });

  components.push({
    name: 'End Clamps (Portrait)',
    partNumber: 'KDS-END CLAMP-P',
    quantity: arrayConfig.rows * 2,
    unit: 'pieces',
    image: PLACEHOLDER_ICON,
    url: componentUrls['KDS-END CLAMP-P']
  });

  components.push({
    name: 'Ground Mounting Posts',
    partNumber: 'KDS-SAFE-FIX300',
    quantity: Math.ceil(railLengthM / 2) * arrayConfig.rows,
    unit: 'pieces',
    image: PLACEHOLDER_ICON,
    url: componentUrls['KDS-SAFE-FIX300']
  });

  components.push({
    name: 'Earth Bar (Module)',
    partNumber: 'KDS-EARTH-BAR-MP',
    quantity: Math.ceil(arrayConfig.rows / 2),
    unit: 'pieces',
    image: PLACEHOLDER_ICON,
    url: componentUrls['KDS-EARTH-BAR-MP']
  });

  return components;
}
