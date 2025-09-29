-- CreateEnum
CREATE TYPE "public"."PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'LAND', 'PLOT', 'SHOP');

-- CreateEnum
CREATE TYPE "public"."Authority" AS ENUM ('GOVERNMENT', 'PRIVATE', 'BUILDER');

-- CreateEnum
CREATE TYPE "public"."ListingFor" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "public"."PropertyCategory" AS ENUM ('RESIDENTIAL', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "public"."AreaUnit" AS ENUM ('SQFT', 'SQ_YARDS', 'SQ_METERS', 'ACRES', 'HECTARES');

-- CreateEnum
CREATE TYPE "public"."HouseType" AS ENUM ('INDEPENDENT_HOUSE', 'VILLA', 'DUPLEX', 'ROW_HOUSE');

-- CreateTable
CREATE TABLE "public"."Listing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "typeOfProperty" "public"."PropertyType" NOT NULL,
    "authority" "public"."Authority" NOT NULL,
    "listingFor" "public"."ListingFor" NOT NULL,
    "category" "public"."PropertyCategory",
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT NOT NULL,
    "society" TEXT,
    "areaLocality" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "area" DOUBLE PRECISION NOT NULL,
    "areaUnit" "public"."AreaUnit" NOT NULL,
    "pricePerUnit" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,
    "floor" INTEGER,
    "numberOfFloors" INTEGER,
    "rooms" INTEGER,
    "bathrooms" INTEGER,
    "balconies" INTEGER,
    "yearOfConstruction" INTEGER,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_userId_idx" ON "public"."Listing"("userId");

-- CreateIndex
CREATE INDEX "Listing_city_idx" ON "public"."Listing"("city");

-- CreateIndex
CREATE INDEX "Listing_typeOfProperty_idx" ON "public"."Listing"("typeOfProperty");

-- CreateIndex
CREATE INDEX "Listing_listingFor_idx" ON "public"."Listing"("listingFor");

-- CreateIndex
CREATE INDEX "Listing_verified_idx" ON "public"."Listing"("verified");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "public"."Listing"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Listing" ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
