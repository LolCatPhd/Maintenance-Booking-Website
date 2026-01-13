-- AlterTable: Add distance tracking fields to Booking
ALTER TABLE "Booking" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "distanceFromBase" DOUBLE PRECISION;

-- AlterTable: Update default maxBookings from 4 to 2
ALTER TABLE "AvailableSlot" ALTER COLUMN "maxBookings" SET DEFAULT 2;
