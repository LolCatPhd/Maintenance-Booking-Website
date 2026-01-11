import React from 'react';
import { RoofType, MountingCategory } from '../types';
import { getAvailableManufacturers } from '../data/mountingSystems';

interface ManufacturerSelectorProps {
  roofType: RoofType | null;
  category: MountingCategory | null;
  selectedManufacturer: string | null;
  onManufacturerChange: (manufacturer: string) => void;
}

export const ManufacturerSelector: React.FC<ManufacturerSelectorProps> = ({
  roofType,
  category,
  selectedManufacturer,
  onManufacturerChange
}) => {
  if (!category) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Manufacturer
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please select a mounting category first
        </p>
      </div>
    );
  }

  const availableManufacturers = getAvailableManufacturers(roofType, category);

  if (availableManufacturers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Manufacturer
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No manufacturers available for the selected configuration
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Manufacturer
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableManufacturers.map((manufacturer: string) => (
          <button
            key={manufacturer}
            onClick={() => onManufacturerChange(manufacturer)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedManufacturer === manufacturer
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {manufacturer}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
