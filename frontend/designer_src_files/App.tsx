import { useState, useEffect } from 'react';
import {
  PanelDimensions,
  ArrayConfig,
  RoofType,
  MountingCategory,
  MountingSystem,
  DesignConfig,
  LayoutResult
} from './types';
import { PanelSpecsForm } from './components/PanelSpecsForm';
import { RoofTypeSelector } from './components/RoofTypeSelector';
import { MountingCategorySelector } from './components/MountingCategorySelector';
import { ManufacturerSelector } from './components/ManufacturerSelector';
import { MountingSystemSelector } from './components/MountingSystemSelector';
import { ArrayLayoutVisualizer } from './components/ArrayLayoutVisualizer';
import { ComponentsList } from './components/ComponentsList';
import { calculateLayout } from './utils/componentCalculator';

function App() {
  // Default values (standard 400W panel dimensions)
  // Width is the shorter dimension, length is the longer dimension
  const [panelDimensions, setPanelDimensions] = useState<PanelDimensions>({
    width: 1134,
    length: 1722
  });

  const [arrayConfig, setArrayConfig] = useState<ArrayConfig>({
    rows: 2,
    columns: 5,
    orientation: 'portrait'
  });

  const [roofType, setRoofType] = useState<RoofType | null>('ibr');
  const [mountingCategory, setMountingCategory] = useState<MountingCategory | null>(null);
  const [manufacturer, setManufacturer] = useState<string | null>(null);
  const [mountingSystem, setMountingSystem] = useState<MountingSystem | null>(null);
  const [layoutResult, setLayoutResult] = useState<LayoutResult>({
    arrayWidth: 0,
    arrayHeight: 0,
    totalPanels: 0,
    components: []
  });

  // Recalculate layout whenever configuration changes
  useEffect(() => {
    const config: DesignConfig = {
      panelDimensions,
      arrayConfig,
      roofType: roofType || 'ibr',
      mountingSystem
    };

    const result = calculateLayout(config);
    setLayoutResult(result);
  }, [panelDimensions, arrayConfig, roofType, mountingSystem]);

  // Reset downstream selections when roof type changes
  const handleRoofTypeChange = (newRoofType: RoofType) => {
    setRoofType(newRoofType);
    setMountingCategory(null);
    setManufacturer(null);
    setMountingSystem(null);
  };

  // Reset downstream selections when mounting category changes
  const handleMountingCategoryChange = (newCategory: MountingCategory) => {
    setMountingCategory(newCategory);
    setManufacturer(null);
    setMountingSystem(null);
  };

  // Reset mounting system when manufacturer changes
  const handleManufacturerChange = (newManufacturer: string) => {
    setManufacturer(newManufacturer);
    setMountingSystem(null);
  };

  // Reset mounting system when orientation changes if incompatible
  const handleArrayConfigChange = (newConfig: ArrayConfig) => {
    // Check if orientation changed
    if (newConfig.orientation !== arrayConfig.orientation && mountingSystem) {
      const systemName = mountingSystem.name.toLowerCase();
      const isLandscapeSystem = systemName.includes('landscape');
      const isPortraitSystem = systemName.includes('portrait');

      // Clear mounting system if it's incompatible with new orientation
      if (
        (isLandscapeSystem && newConfig.orientation === 'portrait') ||
        (isPortraitSystem && newConfig.orientation === 'landscape')
      ) {
        setMountingSystem(null);
      }
    }

    setArrayConfig(newConfig);
  };

  const config: DesignConfig = {
    panelDimensions,
    arrayConfig,
    roofType: roofType || 'ibr',
    mountingSystem
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Solar Mounting Designer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Design solar panel layouts and calculate mounting component quantities
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            <PanelSpecsForm
              panelDimensions={panelDimensions}
              arrayConfig={arrayConfig}
              onPanelDimensionsChange={setPanelDimensions}
              onArrayConfigChange={handleArrayConfigChange}
            />

            <RoofTypeSelector
              selectedRoofType={roofType}
              onRoofTypeChange={handleRoofTypeChange}
            />

            <MountingCategorySelector
              selectedCategory={mountingCategory}
              onCategoryChange={handleMountingCategoryChange}
            />

            <ManufacturerSelector
              roofType={roofType}
              category={mountingCategory}
              selectedManufacturer={manufacturer}
              onManufacturerChange={handleManufacturerChange}
            />

            <MountingSystemSelector
              roofType={roofType}
              category={mountingCategory}
              manufacturer={manufacturer}
              selectedSystem={mountingSystem}
              orientation={arrayConfig.orientation}
              onSystemChange={setMountingSystem}
            />
          </div>

          {/* Right Column - Outputs */}
          <div className="space-y-6">
            <ArrayLayoutVisualizer
              config={config}
              layoutResult={layoutResult}
            />

            <ComponentsList
              layoutResult={layoutResult}
              mountingSystemName={mountingSystem?.name || null}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Developed for solar installers to streamline component estimation.
            Always consult manufacturer specifications and local building codes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
