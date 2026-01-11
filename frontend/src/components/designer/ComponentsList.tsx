import React from 'react';
import { LayoutResult, MountingComponent } from '../../types/designer';

interface ComponentsListProps {
  layoutResult: LayoutResult;
  mountingSystemName: string | null;
}

export const ComponentsList: React.FC<ComponentsListProps> = ({
  layoutResult,
  mountingSystemName
}) => {
  if (layoutResult.components.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Mounting Components
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select a mounting system to see required components
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Mounting Components
      </h2>

      {mountingSystemName && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            System Selected:
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {mountingSystemName}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-600">
              <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold w-16">
                Image
              </th>
              <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold">
                Component
              </th>
              <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold">
                Part Number
              </th>
              <th className="text-right py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold">
                Quantity
              </th>
              <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold">
                Unit
              </th>
            </tr>
          </thead>
          <tbody>
            {layoutResult.components.map((component: MountingComponent, index: number) => (
              <tr
                key={index}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="py-3 px-2">
                  {component.image && (
                    component.url ? (
                      <a
                        href={component.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:opacity-75 transition-opacity"
                        title={`View ${component.name} on KD Solar`}
                      >
                        <img
                          src={component.image}
                          alt={component.name}
                          className="w-12 h-12 object-contain rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </a>
                    ) : (
                      <img
                        src={component.image}
                        alt={component.name}
                        className="w-12 h-12 object-contain rounded border border-gray-300 dark:border-gray-600"
                      />
                    )
                  )}
                </td>
                <td className="py-3 px-2 text-gray-900 dark:text-gray-100">
                  {component.name}
                </td>
                <td className="py-3 px-2 text-gray-600 dark:text-gray-400 font-mono text-sm">
                  {component.partNumber}
                </td>
                <td className="py-3 px-2 text-gray-900 dark:text-gray-100 text-right font-semibold">
                  {component.quantity}
                </td>
                <td className="py-3 px-2 text-gray-600 dark:text-gray-400 text-sm">
                  {component.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
        <div className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
          Note:
        </div>
        <div className="text-sm text-yellow-700 dark:text-yellow-300">
          These quantities are estimates based on standard installation practices.
          Always verify with manufacturer specifications and local code requirements.
          Add 10-15% extra for waste and contingencies.
        </div>
      </div>
    </div>
  );
};
