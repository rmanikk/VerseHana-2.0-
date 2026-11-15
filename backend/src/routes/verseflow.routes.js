
import express from "express";

import {
  createArtistChannel,
  listArtistChannels,
  verifyArtistChannel,
  deactivateArtist,
} from "../controllers/verseflow-artist.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  requireAdmin,
} from "../middleware/admin.middleware.js";

const router = express.Router();

// All VerseFlow artist management routes require admin access.
router.use(authenticateToken, requireAdmin);

router.post("/artists", createArtistChannel);

router.get("/artists", listArtistChannels);

router.patch(
  "/artists/:channelId/verification",
  verifyArtistChannel
);

router.patch(
  "/artists/:channelId/deactivate",
  deactivateArtist
);

export default router;
