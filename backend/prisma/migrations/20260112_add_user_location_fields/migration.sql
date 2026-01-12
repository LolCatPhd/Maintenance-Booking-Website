-- AlterTable
ALTER TABLE "User" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "formattedAddress" TEXT,
ADD COLUMN     "streetAddress" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "postalCode" TEXT;
