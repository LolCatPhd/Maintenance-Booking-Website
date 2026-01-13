-- AlterTable
ALTER TABLE "SolarSystem" ADD COLUMN     "inverterModel" TEXT,
ADD COLUMN     "batteryModel" TEXT,
ADD COLUMN     "batteryQuantity" INTEGER,
ADD COLUMN     "solarPanelWattage" TEXT,
ADD COLUMN     "solarPanelQuantity" INTEGER,
ADD COLUMN     "monitoringPlatformUrl" TEXT;
