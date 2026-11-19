
import express from "express";

import {
  createUserPlaylist,
  listUserPlaylists,
  updateUserPlaylist,
  removeUserPlaylist,
  getUserPlaylistDetails,
addUserPlaylistSong,
removeUserPlaylistSong,
} from "../controllers/playlist.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// All playlist routes require authentication.
router.use(authenticateToken);

router.get("/", listUserPlaylists);

router.post("/", createUserPlaylist);

router.patch("/:playlistId", updateUserPlaylist);

router.delete("/:playlistId", removeUserPlaylist);

router.get("/:playlistId", getUserPlaylistDetails);

router.post("/:playlistId/songs", addUserPlaylistSong);

router.delete(
  "/:playlistId/songs/:songId",
  removeUserPlaylistSong
);

export default router;
