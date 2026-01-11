export type PanelOrientation = 'portrait' | 'landscape';

export type RoofType =
  | 'ibr'
  | 'corrugated'
  | 'standing-seam'
  | 'tile'
  | 'novotexi-tile'
  | 'slate-harvey-tile'
  | 'diamond-deck'
  | 'ds700'
  | 'cliplock'
  | 'big-six'
  | 'flat-concrete-roof';

export type MountingSystemType = 'rail' | 'no-rail';

export type MountingCategory = 'flush-mount' | 'tilt-mount' | 'ground-mount';

export interface PanelDimensions {
  width: number;  // in mm (shorter dimension)
  length: number; // in mm (longer dimension)
}

export interface ArrayConfig {
  rows: number;
  columns: number;
  orientation: PanelOrientation;
}

export interface MountingComponent {
  name: string;
  partNumber: string;
  quantity: number;
  unit: string;
  image?: string;
  url?: string;
}

export interface MountingSystem {
  id: string;
  name: string;
  manufacturer: string;
  category: MountingCategory;
  type: MountingSystemType;
  compatibleRoofTypes: RoofType[];
  description: string;
}

export interface LayoutResult {
  arrayWidth: number;  // in mm
  arrayHeight: number; // in mm
  totalPanels: number;
  components: MountingComponent[];
}

export interface DesignConfig {
  panelDimensions: PanelDimensions;
  arrayConfig: ArrayConfig;
  roofType: RoofType;
  mountingSystem: MountingSystem | null;
}
