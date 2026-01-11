import React from 'react';
import { RoofType } from '../types/designer.ts';
import { ROOF_TYPE_LABELS } from '../data/mountingSystems.ts';

interface RoofTypeSelectorProps {
  selectedRoofType: RoofType | null;
  onRoofTypeChange: (roofType: RoofType) => void;
}

export const RoofTypeSelector: React.FC<RoofTypeSelectorProps> = ({
  selectedRoofType,
  onRoofTypeChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Roof Type
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(Object.keys(ROOF_TYPE_LABELS) as RoofType[]).map((roofType) => (
          <button
            key={roofType}
            onClick={() => onRoofTypeChange(roofType)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedRoofType === roofType
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {ROOF_TYPE_LABELS[roofType]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
