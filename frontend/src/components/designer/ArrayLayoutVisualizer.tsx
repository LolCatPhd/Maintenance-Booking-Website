import React, { useEffect, useRef } from 'react';
import { DesignConfig, LayoutResult } from '../types';

interface ArrayLayoutVisualizerProps {
  config: DesignConfig;
  layoutResult: LayoutResult;
}

export const ArrayLayoutVisualizer: React.FC<ArrayLayoutVisualizerProps> = ({
  config,
  layoutResult
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || layoutResult.totalPanels === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate panel dimensions based on orientation
    // In landscape: length is horizontal (longer), width is vertical (shorter)
    // In portrait: width is horizontal (shorter), length is vertical (longer)
    const panelWidth =
      config.arrayConfig.orientation === 'landscape'
        ? config.panelDimensions.length
        : config.panelDimensions.width;
    const panelHeight =
      config.arrayConfig.orientation === 'landscape'
        ? config.panelDimensions.width
        : config.panelDimensions.length;

    // Mid-clamp spacing between panels (2.5cm = 25mm)
    const midClampSpacing = 25; // mm
    
    // End clamp overhang on rails (35mm on each end)
    const endClampOverhang = 35; // mm

    // Calculate total array dimensions including mid-clamp spacing
    const totalArrayWidth = layoutResult.arrayWidth + (config.arrayConfig.columns - 1) * midClampSpacing;
    const totalArrayHeight = layoutResult.arrayHeight + (config.arrayConfig.rows - 1) * midClampSpacing;
    
    // Rail line length includes array width + mid-clamp spacing + end clamp overhang on both ends
    const railLineLength = totalArrayWidth + (2 * endClampOverhang);

    // Determine if this is a rail system
    const isRailSystem = config.mountingSystem?.name.includes('Long Rail') || false;
    const isNoRailSystem = config.mountingSystem?.name.includes('No Rail') || false;

    // Calculate scale to fit canvas (use full canvas space now that legend is outside)
    const padding = 40;
    const availableWidth = canvas.width - 2 * padding;
    const availableHeight = canvas.height - 2 * padding;

    const scaleX = availableWidth / totalArrayWidth;
    const scaleY = availableHeight / totalArrayHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

    // Center the array
    const scaledArrayWidth = totalArrayWidth * scale;
    const scaledArrayHeight = totalArrayHeight * scale;
    const offsetX = (canvas.width - scaledArrayWidth) / 2;
    const offsetY = (canvas.height - scaledArrayHeight) / 2;

    // Draw panels FIRST (so brackets and rails appear on top)
    ctx.strokeStyle = '#3b82f6'; // blue
    ctx.fillStyle = '#dbeafe'; // light blue
    ctx.lineWidth = 2;

    for (let row = 0; row < config.arrayConfig.rows; row++) {
      for (let col = 0; col < config.arrayConfig.columns; col++) {
        const x = offsetX + col * (panelWidth + midClampSpacing) * scale;
        const y = offsetY + row * (panelHeight + midClampSpacing) * scale;
        const w = panelWidth * scale;
        const h = panelHeight * scale;

        // Fill panel
        ctx.fillRect(x, y, w, h);

        // Draw border
        ctx.strokeRect(x, y, w, h);

        // Draw diagonal lines to represent solar panel cells
        ctx.strokeStyle = '#93c5fd'; // lighter blue
        ctx.lineWidth = 1;
        const cellRows = 6;
        const cellCols = 10;

        for (let i = 1; i < cellRows; i++) {
          const cellY = y + (h / cellRows) * i;
          ctx.beginPath();
          ctx.moveTo(x, cellY);
          ctx.lineTo(x + w, cellY);
          ctx.stroke();
        }

        for (let i = 1; i < cellCols; i++) {
          const cellX = x + (w / cellCols) * i;
          ctx.beginPath();
          ctx.moveTo(cellX, y);
          ctx.lineTo(cellX, y + h);
          ctx.stroke();
        }

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
      }
    }

    // Draw rails AFTER panels (on top) for rail systems
    // Rails extend beyond the panel array by 35mm on each end for end clamps
    if (isRailSystem) {
      ctx.strokeStyle = '#64748b'; // steel grey for rails
      ctx.fillStyle = '#94a3b8'; // lighter steel grey for rail fill
      ctx.lineWidth = 3;

      for (let row = 0; row < config.arrayConfig.rows; row++) {
        const panelY = offsetY + row * (panelHeight + midClampSpacing) * scale;
        const railWidth = railLineLength * scale; // Rails extend beyond array
        const railStartX = offsetX - (endClampOverhang * scale); // Start 35mm before panels
        const railHeight = 10; // Visual height of rail

        // Rails positioned at 20% from panel edges
        const railInset = 0.2 * panelHeight * scale;
        const topRailY = panelY + railInset;
        const bottomRailY = panelY + panelHeight * scale - railInset;

        // Draw top rail (extends beyond panel array)
        ctx.fillRect(railStartX, topRailY - railHeight / 2, railWidth, railHeight);
        ctx.strokeRect(railStartX, topRailY - railHeight / 2, railWidth, railHeight);

        // Draw bottom rail (extends beyond panel array)
        ctx.fillRect(railStartX, bottomRailY - railHeight / 2, railWidth, railHeight);
        ctx.strokeRect(railStartX, bottomRailY - railHeight / 2, railWidth, railHeight);
      }
    }

    // Draw brackets for rail systems (on top of panels and rails)
    if (isRailSystem) {
      ctx.fillStyle = '#dc2626'; // bright red for brackets
      ctx.strokeStyle = '#991b1b'; // darker red outline
      ctx.lineWidth = 2;
      const bracketWidth = 17; // 1.7x wider than original (10 × 1.7 = 17)
      const bracketHeight = 10; // Original height
      const bracketSpacing = 1400; // mm - spacing between brackets

      for (let row = 0; row < config.arrayConfig.rows; row++) {
        const panelY = offsetY + row * (panelHeight + midClampSpacing) * scale;
        const railInset = 0.2 * panelHeight * scale;
        const topRailY = panelY + railInset;
        const bottomRailY = panelY + panelHeight * scale - railInset;
        const numBrackets = Math.ceil(layoutResult.arrayWidth / bracketSpacing);

        for (let i = 0; i < numBrackets; i++) {
          const bracketX = offsetX + i * bracketSpacing * scale;

          // Draw bracket on top rail (rectangular: wider than tall)
          ctx.fillRect(
            bracketX - bracketWidth / 2,
            topRailY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );
          ctx.strokeRect(
            bracketX - bracketWidth / 2,
            topRailY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );

          // Draw bracket on bottom rail (rectangular: wider than tall)
          ctx.fillRect(
            bracketX - bracketWidth / 2,
            bottomRailY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );
          ctx.strokeRect(
            bracketX - bracketWidth / 2,
            bottomRailY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );
        }
      }

      // Draw mid-clamps between panels (on the rails)
      // Total of 2 mid-clamps: 1 on top rail, 1 on bottom rail
      ctx.fillStyle = '#16a34a'; // bright green for mid-clamps
      ctx.strokeStyle = '#166534'; // darker green outline
      const midClampSize = 8;

      for (let row = 0; row < config.arrayConfig.rows; row++) {
        const panelY = offsetY + row * (panelHeight + midClampSpacing) * scale;
        const railInset = 0.2 * panelHeight * scale;
        const topRailY = panelY + railInset;
        const bottomRailY = panelY + panelHeight * scale - railInset;

        // Draw 1 mid-clamp on top rail and 1 on bottom rail between each pair of panels
        for (let col = 0; col < config.arrayConfig.columns - 1; col++) {
          const gapCenterX = offsetX + (col + 1) * panelWidth * scale + col * midClampSpacing * scale + (midClampSpacing * scale) / 2;

          // Mid-clamp on top rail
          ctx.fillRect(
            gapCenterX - midClampSize / 2,
            topRailY - midClampSize / 2,
            midClampSize,
            midClampSize
          );
          ctx.strokeRect(
            gapCenterX - midClampSize / 2,
            topRailY - midClampSize / 2,
            midClampSize,
            midClampSize
          );

          // Mid-clamp on bottom rail
          ctx.fillRect(
            gapCenterX - midClampSize / 2,
            bottomRailY - midClampSize / 2,
            midClampSize,
            midClampSize
          );
          ctx.strokeRect(
            gapCenterX - midClampSize / 2,
            bottomRailY - midClampSize / 2,
            midClampSize,
            midClampSize
          );
        }
      }
    }

    // Draw brackets for no-rail systems (shared between panels)
    if (isNoRailSystem) {
      ctx.fillStyle = '#dc2626'; // bright red for brackets
      ctx.strokeStyle = '#991b1b'; // darker red outline
      ctx.lineWidth = 2;
      const bracketHeight = 8;
      const bracketWidth = 20; // 2.5x wider to show both panels rest on same bracket

      for (let row = 0; row < config.arrayConfig.rows; row++) {
        // Draw single shared brackets between each pair of panels
        for (let col = 0; col < config.arrayConfig.columns - 1; col++) {
          const gapCenterX = offsetX + (col + 1) * panelWidth * scale + col * midClampSpacing * scale + (midClampSpacing * scale) / 2;
          const panelY = offsetY + row * (panelHeight + midClampSpacing) * scale;

          // Brackets are inset by 20% from the panel edges
          const bracketInset = 0.2 * panelHeight * scale;
          const topY = panelY + bracketInset;
          const bottomY = panelY + panelHeight * scale - bracketInset;

          // Single top bracket - both panels rest on this one bracket
          ctx.fillRect(
            gapCenterX - bracketWidth / 2,
            topY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );
          ctx.strokeRect(
            gapCenterX - bracketWidth / 2,
            topY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );

          // Single bottom bracket - both panels rest on this one bracket
          ctx.fillRect(
            gapCenterX - bracketWidth / 2,
            bottomY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );
          ctx.strokeRect(
            gapCenterX - bracketWidth / 2,
            bottomY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );
        }

        // Draw end brackets (at the start and end of each row)
        for (let col = 0; col <= config.arrayConfig.columns; col += config.arrayConfig.columns) {
          const panelX = offsetX + col * (panelWidth + midClampSpacing) * scale;
          const panelY = offsetY + row * (panelHeight + midClampSpacing) * scale;

          // Brackets are inset by 20% from the panel edges
          const bracketInset = 0.2 * panelHeight * scale;
          const topY = panelY + bracketInset;
          const bottomY = panelY + panelHeight * scale - bracketInset;

          // End brackets are same size as shared brackets (wide rectangles)
          ctx.fillRect(
            panelX - bracketWidth / 2,
            topY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );
          ctx.strokeRect(
            panelX - bracketWidth / 2,
            topY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );
          ctx.fillRect(
            panelX - bracketWidth / 2,
            bottomY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );
          ctx.strokeRect(
            panelX - bracketWidth / 2,
            bottomY - bracketHeight / 2,
            bracketWidth,
            bracketHeight
          );
        }
      }

      // Draw mid-clamps between panels for no-rail systems (on top of brackets at 20% position)
      ctx.fillStyle = '#16a34a'; // bright green for mid-clamps
      ctx.strokeStyle = '#166534'; // darker green outline
      const midClampSize = 8;

      for (let row = 0; row < config.arrayConfig.rows; row++) {
        for (let col = 0; col < config.arrayConfig.columns - 1; col++) {
          const gapCenterX = offsetX + (col + 1) * panelWidth * scale + col * midClampSpacing * scale + (midClampSpacing * scale) / 2;
          const panelY = offsetY + row * (panelHeight + midClampSpacing) * scale;

          // Mid-clamps positioned at the bracket locations (20% from edges)
          const bracketInset = 0.2 * panelHeight * scale;
          const topY = panelY + bracketInset;
          const bottomY = panelY + panelHeight * scale - bracketInset;

          // Top mid-clamp (on top bracket)
          ctx.fillRect(
            gapCenterX - midClampSize / 2,
            topY - midClampSize / 2,
            midClampSize,
            midClampSize
          );
          ctx.strokeRect(
            gapCenterX - midClampSize / 2,
            topY - midClampSize / 2,
            midClampSize,
            midClampSize
          );

          // Bottom mid-clamp (on bottom bracket)
          ctx.fillRect(
            gapCenterX - midClampSize / 2,
            bottomY - midClampSize / 2,
            midClampSize,
            midClampSize
          );
          ctx.strokeRect(
            gapCenterX - midClampSize / 2,
            bottomY - midClampSize / 2,
            midClampSize,
            midClampSize
          );
        }
      }
    }

    // Draw end clamps at the far ends of the rails (on the overhang sections)
    ctx.fillStyle = '#8b5cf6'; // purple for end clamps
    ctx.strokeStyle = '#6d28d9'; // darker purple outline
    ctx.lineWidth = 2;
    const endClampSize = 8; // Same size as mid-clamps

    for (let row = 0; row < config.arrayConfig.rows; row++) {
      const panelY = offsetY + row * (panelHeight + midClampSpacing) * scale;

      if (isRailSystem) {
        // End clamps on rails at far left and right (on both top and bottom rails)
        // Positioned on the rail overhang, beyond the panel array
        const railInset = 0.2 * panelHeight * scale;
        const topRailY = panelY + railInset;
        const bottomRailY = panelY + panelHeight * scale - railInset;
        const leftX = offsetX - (endClampOverhang * scale); // Left end of rail
        const rightX = offsetX + totalArrayWidth * scale + (endClampOverhang * scale); // Right end of rail

        // Left end clamps (top and bottom rails)
        ctx.fillRect(
          leftX - endClampSize / 2,
          topRailY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.strokeRect(
          leftX - endClampSize / 2,
          topRailY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.fillRect(
          leftX - endClampSize / 2,
          bottomRailY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.strokeRect(
          leftX - endClampSize / 2,
          bottomRailY - endClampSize / 2,
          endClampSize,
          endClampSize
        );

        // Right end clamps (top and bottom rails)
        ctx.fillRect(
          rightX - endClampSize / 2,
          topRailY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.strokeRect(
          rightX - endClampSize / 2,
          topRailY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.fillRect(
          rightX - endClampSize / 2,
          bottomRailY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.strokeRect(
          rightX - endClampSize / 2,
          bottomRailY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
      } else if (isNoRailSystem) {
        // End clamps on no-rail brackets at far left and right
        const bracketInset = 0.2 * panelHeight * scale;
        const topY = panelY + bracketInset;
        const bottomY = panelY + panelHeight * scale - bracketInset;

        // Left end clamps (top and bottom)
        ctx.fillRect(
          offsetX - endClampSize / 2,
          topY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.strokeRect(
          offsetX - endClampSize / 2,
          topY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.fillRect(
          offsetX - endClampSize / 2,
          bottomY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.strokeRect(
          offsetX - endClampSize / 2,
          bottomY - endClampSize / 2,
          endClampSize,
          endClampSize
        );

        // Right end clamps (top and bottom)
        const rightX = offsetX + (config.arrayConfig.columns) * (panelWidth + midClampSpacing) * scale - midClampSpacing * scale;
        ctx.fillRect(
          rightX - endClampSize / 2,
          topY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.strokeRect(
          rightX - endClampSize / 2,
          topY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.fillRect(
          rightX - endClampSize / 2,
          bottomY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
        ctx.strokeRect(
          rightX - endClampSize / 2,
          bottomY - endClampSize / 2,
          endClampSize,
          endClampSize
        );
      }
    }

    // Draw dimensions
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';

    // Width dimension (including mid-clamp spacing)
    const widthText = `${(totalArrayWidth / 1000).toFixed(2)}m`;
    ctx.fillText(
      widthText,
      canvas.width / 2,
      offsetY + scaledArrayHeight + 25
    );

    // Height dimension (including mid-clamp spacing)
    ctx.save();
    ctx.translate(offsetX - 25, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    const heightText = `${(totalArrayHeight / 1000).toFixed(2)}m`;
    ctx.fillText(heightText, 0, 0);
    ctx.restore();

  }, [config, layoutResult]);

  if (layoutResult.totalPanels === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Array Layout Preview
        </h2>
        <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
          Configure your system to see the layout preview
        </div>
      </div>
    );
  }

  // Determine system type for legend
  const isRailSystem = config.mountingSystem?.name.includes('Long Rail') || false;
  const isNoRailSystem = config.mountingSystem?.name.includes('No Rail') || false;
  const midClampSpacing = 25; // mm

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Array Layout Preview
      </h2>

      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full border border-gray-300 dark:border-gray-600 rounded"
        />
      </div>

      {/* Legend moved outside canvas */}
      {(isRailSystem || isNoRailSystem) && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex flex-wrap gap-6">
            {isRailSystem && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-3.5 bg-gray-400 border-2 border-gray-600 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Rails</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2.5 bg-red-600 border-2 border-red-900 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Brackets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-600 border-2 border-green-900 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mid Clamps</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-purple-600 border-2 border-purple-900 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">End Clamps</span>
                </div>
              </>
            )}
            {isNoRailSystem && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-3 bg-red-600 border-2 border-red-900 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Brackets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-600 border-2 border-green-900 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mid Clamps</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-purple-600 border-2 border-purple-900 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">End Clamps</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <div className="text-gray-600 dark:text-gray-400">Total Panels</div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {layoutResult.totalPanels}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <div className="text-gray-600 dark:text-gray-400">Array Width</div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {((layoutResult.arrayWidth + (config.arrayConfig.columns - 1) * 25) / 1000).toFixed(2)}m
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            (with mid-clamps)
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <div className="text-gray-600 dark:text-gray-400">Array Height</div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {((layoutResult.arrayHeight + (config.arrayConfig.rows - 1) * 25) / 1000).toFixed(2)}m
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            (with mid-clamps)
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <div className="text-gray-600 dark:text-gray-400">Orientation</div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
            {config.arrayConfig.orientation}
          </div>
        </div>
      </div>
    </div>
  );
};
