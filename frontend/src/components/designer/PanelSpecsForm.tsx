import React from 'react';
import { PanelDimensions, PanelOrientation, ArrayConfig } from '../../types/designer';

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
            Panel Width (mm) <span className="text-xs text-gray-500">(shorter dimension)</span>
          </label>
          <input
            type="number"
            min="500"
            max="2500"
            value={panelDimensions.width}
            onChange={(e) => {
              const newWidth = parseInt(e.target.value) || 0;
              // Enforce width <= length
              if (newWidth <= panelDimensions.length) {
                onPanelDimensionsChange({
                  ...panelDimensions,
                  width: newWidth
                });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
          {panelDimensions.width > panelDimensions.length && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Width must be less than or equal to length
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Panel Length (mm) <span className="text-xs text-gray-500">(longer dimension)</span>
          </label>
          <input
            type="number"
            min="500"
            max="2500"
            value={panelDimensions.length}
            onChange={(e) => {
              const newLength = parseInt(e.target.value) || 0;
              // Enforce width <= length
              if (newLength >= panelDimensions.width) {
                onPanelDimensionsChange({
                  ...panelDimensions,
                  length: newLength
                });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
          {panelDimensions.length < panelDimensions.width && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Length must be greater than or equal to width
            </p>
          )}
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
