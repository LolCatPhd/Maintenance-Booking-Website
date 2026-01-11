import React from 'react';
import { MountingCategory } from '../../types/designer';
import { MOUNTING_CATEGORY_LABELS } from '../../data/mountingSystems';

interface MountingCategorySelectorProps {
  selectedCategory: MountingCategory | null;
  onCategoryChange: (category: MountingCategory) => void;
}

export const MountingCategorySelector: React.FC<MountingCategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Mounting Category
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(Object.keys(MOUNTING_CATEGORY_LABELS) as MountingCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedCategory === category
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {MOUNTING_CATEGORY_LABELS[category]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
