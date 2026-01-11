import { MountingSystem, RoofType, MountingCategory } from '../types';

export const MOUNTING_SYSTEMS: MountingSystem[] = [
  // KDSolar Flush Mount Systems
  {
    id: 'kdsolar-tile-long-rail',
    name: 'Tile Long Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'rail',
    compatibleRoofTypes: ['tile'],
    description: 'Long rail system for tile roofs'
  },
  {
    id: 'kdsolar-ibr-long-rail',
    name: 'IBR Long Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'rail',
    compatibleRoofTypes: ['ibr'],
    description: 'Long rail system for IBR profile metal roofs'
  },
  {
    id: 'kdsolar-ibr-landscape-no-rail',
    name: 'IBR Landscape No Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'no-rail',
    compatibleRoofTypes: ['ibr'],
    description: 'No-rail landscape system for IBR profile roofs'
  },
  {
    id: 'kdsolar-ibr-portrait-no-rail',
    name: 'IBR Portrait No Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'no-rail',
    compatibleRoofTypes: ['ibr'],
    description: 'No-rail portrait system for IBR profile roofs'
  },
  {
    id: 'kdsolar-diamond-deck-long-rail',
    name: 'Diamond Deck Long Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'rail',
    compatibleRoofTypes: ['diamond-deck'],
    description: 'Long rail system for Diamond Deck metal roofs'
  },
  {
    id: 'kdsolar-diamond-deck-landscape-no-rail',
    name: 'Diamond Deck Landscape No Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'no-rail',
    compatibleRoofTypes: ['diamond-deck'],
    description: 'No-rail landscape system for Diamond Deck roofs'
  },
  {
    id: 'kdsolar-novotexi-long-rail-nonpen',
    name: 'Novotexi Long Rail (Non-penetrating)',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'rail',
    compatibleRoofTypes: ['novotexi-tile'],
    description: 'Non-penetrating long rail for Novotexi tile roofs'
  },
  {
    id: 'kdsolar-novotexi-long-rail-pen',
    name: 'Novotexi Long Rail (Penetrating)',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'rail',
    compatibleRoofTypes: ['novotexi-tile'],
    description: 'Penetrating long rail for Novotexi tile roofs'
  },
  {
    id: 'kdsolar-novotexi-landscape-no-rail-nonpen',
    name: 'Novotexi Landscape No Rail (Non-penetrating)',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'no-rail',
    compatibleRoofTypes: ['novotexi-tile'],
    description: 'Non-penetrating no-rail landscape for Novotexi roofs'
  },
  {
    id: 'kdsolar-novotexi-landscape-no-rail-pen',
    name: 'Novotexi Landscape No Rail (Penetrating)',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'no-rail',
    compatibleRoofTypes: ['novotexi-tile'],
    description: 'Penetrating no-rail landscape for Novotexi roofs'
  },
  {
    id: 'kdsolar-ds700-long-rail',
    name: 'DS700 Long Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'rail',
    compatibleRoofTypes: ['ds700'],
    description: 'Long rail system for DS700 profile metal roofs'
  },
  {
    id: 'kdsolar-ds700-landscape-no-rail',
    name: 'DS700 Landscape No Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'no-rail',
    compatibleRoofTypes: ['ds700'],
    description: 'No-rail landscape system for DS700 roofs'
  },
  {
    id: 'kdsolar-slate-harvey-long-rail',
    name: 'Slate/Harvey Long Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'rail',
    compatibleRoofTypes: ['slate-harvey-tile'],
    description: 'Long rail system for Slate and Harvey tile roofs'
  },
  {
    id: 'kdsolar-standing-seam-long-rail',
    name: 'Standing Seam Long Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'rail',
    compatibleRoofTypes: ['standing-seam'],
    description: 'Long rail system for standing seam metal roofs'
  },
  {
    id: 'kdsolar-standing-seam-landscape-no-rail',
    name: 'Standing Seam Landscape No Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'no-rail',
    compatibleRoofTypes: ['standing-seam'],
    description: 'No-rail landscape system for standing seam roofs'
  },
  {
    id: 'kdsolar-corrugated-long-rail',
    name: 'Corrugated Long Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'rail',
    compatibleRoofTypes: ['corrugated'],
    description: 'Long rail system for corrugated metal roofs'
  },
  {
    id: 'kdsolar-corrugated-landscape-no-rail',
    name: 'Corrugated Landscape No Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'no-rail',
    compatibleRoofTypes: ['corrugated'],
    description: 'No-rail landscape system for corrugated roofs'
  },
  {
    id: 'kdsolar-corrugated-portrait-no-rail',
    name: 'Corrugated Portrait No Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'no-rail',
    compatibleRoofTypes: ['corrugated'],
    description: 'No-rail portrait system for corrugated roofs'
  },
  {
    id: 'kdsolar-cliplock-long-rail',
    name: 'Cliplock Long Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'rail',
    compatibleRoofTypes: ['cliplock'],
    description: 'Long rail system for Cliplock profile roofs'
  },
  {
    id: 'kdsolar-cliplock-landscape-no-rail',
    name: 'Cliplock Landscape No Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'no-rail',
    compatibleRoofTypes: ['cliplock'],
    description: 'No-rail landscape system for Cliplock roofs'
  },
  {
    id: 'kdsolar-cliplock-portrait-no-rail',
    name: 'Cliplock Portrait No Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'no-rail',
    compatibleRoofTypes: ['cliplock'],
    description: 'No-rail portrait system for Cliplock roofs'
  },
  {
    id: 'kdsolar-big-six-long-rail',
    name: 'Big Six Long Rail',
    manufacturer: 'KDSolar',
    category: 'flush-mount',
    type: 'rail',
    compatibleRoofTypes: ['big-six'],
    description: 'Long rail system for Big Six profile metal roofs'
  },

  // KDSolar Tilt Mount Systems
  {
    id: 'kdsolar-ibr-landscape-aframe',
    name: 'IBR Landscape A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['ibr'],
    description: 'Landscape A-frame tilt system for IBR metal roofs'
  },
  {
    id: 'kdsolar-ibr-landscape-tiltup-ac',
    name: 'IBR Landscape Tiltup AC',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['ibr'],
    description: 'Landscape tilt-up system for IBR roofs (Aluminium/Concrete)'
  },
  {
    id: 'kdsolar-ibr-landscape-tiltup-al',
    name: 'IBR Landscape Tiltup AL',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['ibr'],
    description: 'Landscape tilt-up system for IBR roofs (Aluminium)'
  },
  {
    id: 'kdsolar-ibr-portrait-aframe',
    name: 'IBR Portrait A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['ibr'],
    description: 'Portrait A-frame tilt system for IBR metal roofs'
  },
  {
    id: 'kdsolar-ibr-portrait-tiltup-ac',
    name: 'IBR Portrait Tiltup AC',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['ibr'],
    description: 'Portrait tilt-up system for IBR roofs (Aluminium/Concrete)'
  },
  {
    id: 'kdsolar-ibr-portrait-tiltup-al',
    name: 'IBR Portrait Tiltup AL',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['ibr'],
    description: 'Portrait tilt-up system for IBR roofs (Aluminium)'
  },
  {
    id: 'kdsolar-corrugated-landscape-tiltup-ac',
    name: 'Corrugated Landscape Tiltup AC',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['corrugated'],
    description: 'Landscape tilt-up system for corrugated roofs (Aluminium/Concrete)'
  },
  {
    id: 'kdsolar-corrugated-landscape-tiltup-al',
    name: 'Corrugated Landscape Tiltup AL',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['corrugated'],
    description: 'Landscape tilt-up system for corrugated roofs (Aluminium)'
  },
  {
    id: 'kdsolar-corrugated-portrait-tiltup-ac',
    name: 'Corrugated Portrait Tiltup AC',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['corrugated'],
    description: 'Portrait tilt-up system for corrugated roofs (Aluminium/Concrete)'
  },
  {
    id: 'kdsolar-corrugated-portrait-tiltup-al',
    name: 'Corrugated Portrait Tiltup AL',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['corrugated'],
    description: 'Portrait tilt-up system for corrugated metal roofs (Aluminium)'
  },
  {
    id: 'kdsolar-corrugated-landscape-aframe',
    name: 'Corrugated Landscape A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['corrugated'],
    description: 'Landscape A-frame tilt system for corrugated metal roofs'
  },
  {
    id: 'kdsolar-corrugated-portrait-aframe',
    name: 'Corrugated Portrait A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['corrugated'],
    description: 'Portrait A-frame tilt system for corrugated metal roofs'
  },
  {
    id: 'kdsolar-diamond-deck-landscape-aframe',
    name: 'Diamond Deck Landscape A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['diamond-deck'],
    description: 'Landscape A-frame tilt system for Diamond Deck roofs'
  },
  {
    id: 'kdsolar-diamond-deck-portrait-aframe',
    name: 'Diamond Deck Portrait A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['diamond-deck'],
    description: 'Portrait A-frame tilt system for Diamond Deck roofs'
  },
  {
    id: 'kdsolar-novotexi-landscape-aframe',
    name: 'Novotexi Landscape A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['novotexi-tile'],
    description: 'Landscape A-frame tilt system for Novotexi tile roofs'
  },
  {
    id: 'kdsolar-novotexi-portrait-aframe',
    name: 'Novotexi Portrait A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['novotexi-tile'],
    description: 'Portrait A-frame tilt system for Novotexi tile roofs'
  },
  {
    id: 'kdsolar-ds700-landscape-aframe',
    name: 'DS700 Landscape A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['ds700'],
    description: 'Landscape A-frame tilt system for DS700 roofs'
  },
  {
    id: 'kdsolar-ds700-portrait-aframe',
    name: 'DS700 Portrait A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['ds700'],
    description: 'Portrait A-frame tilt system for DS700 roofs'
  },
  {
    id: 'kdsolar-flat-concrete-tier1-landscape',
    name: 'Flat Concrete Tier 1 Landscape A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['flat-concrete-roof'],
    description: 'Single tier landscape A-frame for flat concrete roofs'
  },
  {
    id: 'kdsolar-flat-concrete-tier2-landscape',
    name: 'Flat Concrete Tier 2 Landscape A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['flat-concrete-roof'],
    description: 'Double tier landscape A-frame for flat concrete roofs'
  },
  {
    id: 'kdsolar-flat-concrete-tier3-portrait',
    name: 'Flat Concrete Tier 3 Portrait A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['flat-concrete-roof'],
    description: 'Triple tier portrait A-frame for flat concrete roofs'
  },
  {
    id: 'kdsolar-flat-concrete-tier3-landscape',
    name: 'Flat Concrete Tier 3 Landscape A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['flat-concrete-roof'],
    description: 'Triple tier landscape A-frame for flat concrete roofs'
  },
  {
    id: 'kdsolar-flat-concrete-tier1-portrait',
    name: 'Flat Concrete Tier 1 Portrait A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['flat-concrete-roof'],
    description: 'Single tier portrait A-frame for flat concrete roofs'
  },
  {
    id: 'kdsolar-flat-concrete-tier2-portrait',
    name: 'Flat Concrete Tier 2 Portrait A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['flat-concrete-roof'],
    description: 'Double tier portrait A-frame for flat concrete roofs'
  },
  {
    id: 'kdsolar-cliplock-landscape-tiltup-ac',
    name: 'Cliplock Landscape Tiltup AC',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['cliplock'],
    description: 'Landscape tilt-up system for Cliplock roofs (Aluminium/Concrete)'
  },
  {
    id: 'kdsolar-cliplock-landscape-tiltup-al',
    name: 'Cliplock Landscape Tiltup AL',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['cliplock'],
    description: 'Landscape tilt-up system for Cliplock roofs (Aluminium)'
  },
  {
    id: 'kdsolar-cliplock-portrait-tiltup-ac',
    name: 'Cliplock Portrait Tiltup AC',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['cliplock'],
    description: 'Portrait tilt-up system for Cliplock roofs (Aluminium/Concrete)'
  },
  {
    id: 'kdsolar-cliplock-portrait-tiltup-al',
    name: 'Cliplock Portrait Tiltup AL',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['cliplock'],
    description: 'Portrait tilt-up system for Cliplock roofs (Aluminium)'
  },
  {
    id: 'kdsolar-cliplock-landscape-aframe',
    name: 'Cliplock Landscape A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['cliplock'],
    description: 'Landscape A-frame tilt system for Cliplock roofs'
  },
  {
    id: 'kdsolar-cliplock-portrait-aframe',
    name: 'Cliplock Portrait A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['cliplock'],
    description: 'Portrait A-frame tilt system for Cliplock roofs'
  },
  {
    id: 'kdsolar-big-six-landscape-aframe',
    name: 'Big Six Landscape A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['big-six'],
    description: 'Landscape A-frame tilt system for Big Six profile metal roofs'
  },
  {
    id: 'kdsolar-big-six-portrait-aframe',
    name: 'Big Six Portrait A-Frame',
    manufacturer: 'KDSolar',
    category: 'tilt-mount',
    type: 'rail',
    compatibleRoofTypes: ['big-six'],
    description: 'Portrait A-frame tilt system for Big Six profile metal roofs'
  },

  // KDSolar Ground Mount Systems
  {
    id: 'kdsolar-ground-mount',
    name: 'Ground Mount System',
    manufacturer: 'KDSolar',
    category: 'ground-mount',
    type: 'rail',
    compatibleRoofTypes: ['ibr', 'corrugated', 'standing-seam', 'tile', 'novotexi-tile', 'slate-harvey-tile', 'diamond-deck', 'ds700', 'cliplock', 'big-six', 'flat-concrete-roof'],
    description: 'Ground-mounted racking system'
  }
];

export const ROOF_TYPE_LABELS: Record<RoofType, string> = {
  'ibr': 'IBR',
  'corrugated': 'Corrugated Metal',
  'standing-seam': 'Standing Seam Metal',
  'tile': 'Tile',
  'novotexi-tile': 'Novotexi Tile',
  'slate-harvey-tile': 'Slate / Harvey Tile',
  'diamond-deck': 'Diamond Deck',
  'ds700': 'DS700',
  'cliplock': 'Cliplock',
  'big-six': 'Big Six',
  'flat-concrete-roof': 'Flat Concrete Roof'
};

export const MOUNTING_CATEGORY_LABELS: Record<MountingCategory, string> = {
  'flush-mount': 'Flush Mount System',
  'tilt-mount': 'Tilt Mount System',
  'ground-mount': 'Ground Mount System'
};

export function getMountingSystemsByFilters(
  roofType: RoofType | null,
  category: MountingCategory | null,
  manufacturer: string | null
): MountingSystem[] {
  return MOUNTING_SYSTEMS.filter(system => {
    if (roofType && !system.compatibleRoofTypes.includes(roofType)) {
      return false;
    }
    if (category && system.category !== category) {
      return false;
    }
    if (manufacturer && system.manufacturer !== manufacturer) {
      return false;
    }
    return true;
  });
}

export function getAvailableManufacturers(
  roofType: RoofType | null,
  category: MountingCategory | null
): string[] {
  const systems = getMountingSystemsByFilters(roofType, category, null);
  const manufacturers = [...new Set(systems.map(s => s.manufacturer))];
  return manufacturers.sort();
}

export function getMountingSystemsByRoofType(roofType: RoofType): MountingSystem[] {
  return MOUNTING_SYSTEMS.filter(system =>
    system.compatibleRoofTypes.includes(roofType)
  );
}
