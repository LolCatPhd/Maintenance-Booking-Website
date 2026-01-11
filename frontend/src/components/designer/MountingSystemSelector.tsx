import React from 'react';
import { MountingSystem, RoofType, MountingCategory, PanelOrientation } from '../types';
import { getMountingSystemsByFilters } from '../data/mountingSystems';

interface MountingSystemSelectorProps {
  roofType: RoofType | null;
  category: MountingCategory | null;
  manufacturer: string | null;
  selectedSystem: MountingSystem | null;
  orientation: PanelOrientation;
  onSystemChange: (system: MountingSystem) => void;
}

export const MountingSystemSelector: React.FC<MountingSystemSelectorProps> = ({
  roofType,
  category,
  manufacturer,
  selectedSystem,
  orientation,
  onSystemChange
}) => {
  if (!manufacturer) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Mounting System
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please select a manufacturer first
        </p>
      </div>
    );
  }

  const allSystems = getMountingSystemsByFilters(roofType, category, manufacturer);

  // Filter systems based on orientation
  const availableSystems = allSystems.filter((system: MountingSystem) => {
    const name = system.name.toLowerCase();

    // If system name contains "landscape", only show for landscape orientation
    if (name.includes('landscape')) {
      return orientation === 'landscape';
    }

    // If system name contains "portrait", only show for portrait orientation
    if (name.includes('portrait')) {
      return orientation === 'portrait';
    }

    // If neither landscape nor portrait in name, show for both orientations
    return true;
  });

  if (availableSystems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Mounting System
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No mounting systems available for the selected configuration
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Mounting System
      </h2>

      <div className="space-y-3">
        {availableSystems.map((system: MountingSystem) => (
          <button
            key={system.id}
            onClick={() => onSystemChange(system)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedSystem?.id === system.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {system.name}
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  system.type === 'rail'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}
              >
                {system.type === 'rail' ? 'Rail' : 'No-Rail'}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {system.manufacturer}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              {system.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
