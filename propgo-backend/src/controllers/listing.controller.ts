import { type Response } from "express";
import { type AuthRequest } from "../middleware/auth.middleware.js";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// POST /api/listings - Create a new listing
export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      typeOfProperty,
      authority,
      listingFor,
      category,
      title,
      description,
      address,
      society,
      areaLocality,
      city,
      district,
      state,
      pincode,
      latitude,
      longitude,
      area,
      areaUnit,
      pricePerUnit,
      totalPrice,
      floor,
      numberOfFloors,
      rooms,
      bathrooms,
      balconies,
      yearOfConstruction,
      amenities,
    } = req.body;

    // Validation
    if (
      !typeOfProperty ||
      !authority ||
      !listingFor ||
      !title ||
      !address ||
      !city ||
      !district ||
      !state ||
      !pincode ||
      !area ||
      !areaUnit
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Validate pricing: either pricePerUnit or totalPrice must be provided
    if (!pricePerUnit && !totalPrice) {
      return res.status(400).json({
        error: "Either pricePerUnit or totalPrice is required",
      });
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        userId,
        typeOfProperty,
        authority,
        listingFor,
        category: category || null,
        title,
        description: description || "",
        address,
        society: society || null,
        areaLocality,
        city,
        district,
        state,
        pincode,
        latitude: latitude || null,
        longitude: longitude || null,
        area: parseFloat(area),
        areaUnit,
        pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : null,
        totalPrice: totalPrice ? parseFloat(totalPrice) : null,
        floor: floor ? parseInt(floor) : null,
        numberOfFloors: numberOfFloors ? parseInt(numberOfFloors) : null,
        rooms: rooms ? parseInt(rooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        balconies: balconies ? parseInt(balconies) : null,
        yearOfConstruction: yearOfConstruction
          ? parseInt(yearOfConstruction)
          : null,
        amenities: amenities || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Listing created successfully",
      listing,
    });
  } catch (error) {
    console.error("Create listing error:", error);
    res.status(500).json({
      error: "Failed to create listing",
    });
  }
};

// GET /api/listings - Get all listings with filters
export const getListings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      city,
      typeOfProperty,
      listingFor,
      verified,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      rooms,
      page = "1",
      limit = "10",
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    // Build where clause
    const where: any = {};

    if (city) where.city = { contains: city as string, mode: "insensitive" };
    if (typeOfProperty) where.typeOfProperty = typeOfProperty;
    if (listingFor) where.listingFor = listingFor;
    if (verified !== undefined) where.verified = verified === "true";
    if (rooms) where.rooms = parseInt(rooms as string);

    // Price filtering
    if (minPrice || maxPrice) {
      where.OR = [
        {
          pricePerUnit: {
            ...(minPrice && { gte: parseFloat(minPrice as string) }),
            ...(maxPrice && { lte: parseFloat(maxPrice as string) }),
          },
        },
        {
          totalPrice: {
            ...(minPrice && { gte: parseFloat(minPrice as string) }),
            ...(maxPrice && { lte: parseFloat(maxPrice as string) }),
          },
        },
      ];
    }

    // Area filtering
    if (minArea || maxArea) {
      where.area = {
        ...(minArea && { gte: parseFloat(minArea as string) }),
        ...(maxArea && { lte: parseFloat(maxArea as string) }),
      };
    }

    // Get listings
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      message: "Listings retrieved successfully",
      listings,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Get listings error:", error);
    res.status(500).json({
      error: "Failed to retrieve listings",
    });
  }
};

// GET /api/listings/:id - Get single listing by ID
export const getListingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        error: "Listing not found",
      });
    }

    res.json({
      message: "Listing retrieved successfully",
      listing,
    });
  } catch (error) {
    console.error("Get listing error:", error);
    res.status(500).json({
      error: "Failed to retrieve listing",
    });
  }
};

// PUT /api/listings/:id - Update listing
export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return res.status(404).json({
        error: "Listing not found",
      });
    }

    if (existingListing.userId !== userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({
        error: "You don't have permission to update this listing",
      });
    }

    // Update listing
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        ...req.body,
        // Convert numeric fields
        ...(req.body.area && { area: parseFloat(req.body.area) }),
        ...(req.body.pricePerUnit && {
          pricePerUnit: parseFloat(req.body.pricePerUnit),
        }),
        ...(req.body.totalPrice && {
          totalPrice: parseFloat(req.body.totalPrice),
        }),
        ...(req.body.floor && { floor: parseInt(req.body.floor) }),
        ...(req.body.numberOfFloors && {
          numberOfFloors: parseInt(req.body.numberOfFloors),
        }),
        ...(req.body.rooms && { rooms: parseInt(req.body.rooms) }),
        ...(req.body.bathrooms && { bathrooms: parseInt(req.body.bathrooms) }),
        ...(req.body.balconies && { balconies: parseInt(req.body.balconies) }),
        ...(req.body.yearOfConstruction && {
          yearOfConstruction: parseInt(req.body.yearOfConstruction),
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.json({
      message: "Listing updated successfully",
      listing: updated,
    });
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({
      error: "Failed to update listing",
    });
  }
};

// DELETE /api/listings/:id - Delete listing
export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return res.status(404).json({
        error: "Listing not found",
      });
    }

    if (existingListing.userId !== userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({
        error: "You don't have permission to delete this listing",
      });
    }

    // Delete listing
    await prisma.listing.delete({
      where: { id },
    });

    res.json({
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete listing error:", error);
    res.status(500).json({
      error: "Failed to delete listing",
    });
  }
};

// GET /api/listings/user/my-listings - Get current user's listings
export const getMyListings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const listings = await prisma.listing.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "Your listings retrieved successfully",
      listings,
    });
  } catch (error) {
    console.error("Get my listings error:", error);
    res.status(500).json({
      error: "Failed to retrieve your listings",
    });
  }
};
