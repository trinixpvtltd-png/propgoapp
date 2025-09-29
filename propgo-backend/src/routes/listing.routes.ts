import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
} from "../controllers/listing.controller.js";

const router = Router();

// Public routes (no authentication required)
router.get("/", getListings); // GET all listings with filters
router.get("/:id", getListingById); // GET single listing

// Protected routes (authentication required)
router.use(authenticate);

router.post("/", createListing); // CREATE new listing
router.get("/user/my-listings", getMyListings); // GET current user's listings
router.put("/:id", updateListing); // UPDATE listing
router.delete("/:id", deleteListing); // DELETE listing

export default router;
