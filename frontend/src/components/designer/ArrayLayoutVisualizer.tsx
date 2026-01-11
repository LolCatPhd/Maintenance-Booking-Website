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
    const panelWidth =
      config.arrayConfig.orientation === 'landscape'
        ? config.panelDimensions.width
        : config.panelDimensions.height;
    const panelHeight =
      config.arrayConfig.orientation === 'landscape'
        ? config.panelDimensions.height
        : config.panelDimensions.width;

    // Mid-clamp spacing between panels (2.5cm = 25mm)
    const midClampSpacing = 25; // mm

    // Calculate total array dimensions including mid-clamp spacing
    const totalArrayWidth = layoutResult.arrayWidth + (config.arrayConfig.columns - 1) * midClampSpacing;
    const totalArrayHeight = layoutResult.arrayHeight + (config.arrayConfig.rows - 1) * midClampSpacing;

    // Determine if this is a rail system
    const isRailSystem = config.mountingSystem?.name.includes('Long Rail') || false;
    const isNoRailSystem = config.mountingSystem?.name.includes('No Rail') || false;

    // Calculate scale to fit canvas
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

    // Draw rails first (behind panels) for rail systems
    if (isRailSystem) {
      ctx.strokeStyle = '#64748b'; // slate gray for rails
      ctx.fillStyle = '#cbd5e1'; // light slate for rail fill
      ctx.lineWidth = 3;

      for (let row = 0; row < config.arrayConfig.rows; row++) {
        const railY = offsetY + row * (panelHeight + midClampSpacing) * scale + (panelHeight * scale) / 2;
        const railWidth = totalArrayWidth * scale;
        const railHeight = 8; // Visual height of rail

        // Draw rail as a rectangle
        ctx.fillRect(offsetX, railY - railHeight / 2, railWidth, railHeight);
        ctx.strokeRect(offsetX, railY - railHeight / 2, railWidth, railHeight);
      }
    }

    // Draw brackets for rail systems
    if (isRailSystem) {
      ctx.fillStyle = '#475569'; // darker slate for brackets
      const bracketSize = 6;
      const bracketSpacing = 1400; // mm - spacing between brackets

      for (let row = 0; row < config.arrayConfig.rows; row++) {
        const railY = offsetY + row * (panelHeight + midClampSpacing) * scale + (panelHeight * scale) / 2;
        const numBrackets = Math.ceil(layoutResult.arrayWidth / bracketSpacing);

        for (let i = 0; i < numBrackets; i++) {
          const bracketX = offsetX + i * bracketSpacing * scale;

          // Draw bracket as a small square
          ctx.fillRect(
            bracketX - bracketSize / 2,
            railY - bracketSize / 2,
            bracketSize,
            bracketSize
          );
        }
      }
    }

    // Draw brackets for no-rail systems (at panel corners)
    if (isNoRailSystem) {
      ctx.fillStyle = '#475569'; // darker slate for brackets
      const bracketSize = 5;

      for (let row = 0; row < config.arrayConfig.rows; row++) {
        for (let col = 0; col < config.arrayConfig.columns; col++) {
          const panelX = offsetX + col * (panelWidth + midClampSpacing) * scale;
          const panelY = offsetY + row * (panelHeight + midClampSpacing) * scale;

          // Draw bracket at each corner of the panel
          const corners = [
            { x: panelX, y: panelY },
            { x: panelX + panelWidth * scale, y: panelY },
            { x: panelX, y: panelY + panelHeight * scale },
            { x: panelX + panelWidth * scale, y: panelY + panelHeight * scale }
          ];

          corners.forEach(corner => {
            ctx.fillRect(
              corner.x - bracketSize / 2,
              corner.y - bracketSize / 2,
              bracketSize,
              bracketSize
            );
          });
        }
      }
    }

    // Draw panels
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

    // Add legend for visual elements
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';

    let legendY = offsetY + scaledArrayHeight + 45;

    if (isRailSystem) {
      // Rail indicator
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(offsetX, legendY - 6, 20, 8);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX, legendY - 6, 20, 8);

      ctx.fillStyle = '#1f2937';
      ctx.fillText('Rails', offsetX + 25, legendY);

      // Bracket indicator
      ctx.fillStyle = '#475569';
      ctx.fillRect(offsetX + 80, legendY - 4, 6, 6);
      ctx.fillText('Brackets', offsetX + 90, legendY);

      legendY += 20;
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Bracket spacing: ~1.4m along rails`, offsetX, legendY);
    } else if (isNoRailSystem) {
      // Bracket indicator
      ctx.fillStyle = '#475569';
      ctx.fillRect(offsetX, legendY - 4, 5, 5);
      ctx.fillStyle = '#1f2937';
      ctx.fillText('Brackets (at panel corners)', offsetX + 10, legendY);
    }

    // Mid-clamp spacing note
    legendY += 20;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Mid-clamp spacing: ${midClampSpacing}mm between panels`, offsetX, legendY);

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
