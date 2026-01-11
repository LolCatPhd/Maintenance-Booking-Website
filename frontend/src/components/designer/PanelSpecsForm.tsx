import React from 'react';
import { PanelDimensions, PanelOrientation, ArrayConfig } from '../types';

interface PanelSpecsFormProps {
  panelDimensions: PanelDimensions;
  arrayConfig: ArrayConfig;
  onPanelDimensionsChange: (dimensions: PanelDimensions) => void;
  onArrayConfigChange: (config: ArrayConfig) => void;
}

export const PanelSpecsForm: React.FC<PanelSpecsFormProps> = ({
  panelDimensions,
  arrayConfig,
  onPanelDimensionsChange,
  onArrayConfigChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Solar Panel Specifications
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Panel Width (mm)
          </label>
          <input
            type="number"
            min="500"
            max="2500"
            value={panelDimensions.width}
            onChange={(e) =>
              onPanelDimensionsChange({
                ...panelDimensions,
                width: parseInt(e.target.value) || 0
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Panel Height (mm)
          </label>
          <input
            type="number"
            min="500"
            max="2500"
            value={panelDimensions.height}
            onChange={(e) =>
              onPanelDimensionsChange({
                ...panelDimensions,
                height: parseInt(e.target.value) || 0
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Orientation
          </label>
          <select
            value={arrayConfig.orientation}
            onChange={(e) =>
              onArrayConfigChange({
                ...arrayConfig,
                orientation: e.target.value as PanelOrientation
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Rows
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={arrayConfig.rows}
            onChange={(e) =>
              onArrayConfigChange({
                ...arrayConfig,
                rows: parseInt(e.target.value) || 1
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Columns
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={arrayConfig.columns}
            onChange={(e) =>
              onArrayConfigChange({
                ...arrayConfig,
                columns: parseInt(e.target.value) || 1
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
      </div>
    </div>
  );
};
