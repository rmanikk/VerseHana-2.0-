
import {
  createPlaylist,
  getUserPlaylists,
  renamePlaylist,
  deletePlaylist,
  getPlaylistDetails,
addSongToPlaylist,
removeSongFromPlaylist,
} from "../services/playlist.service.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createUserPlaylist(req, res, next) {
  try {
    const playlist = await createPlaylist(
      req.user.id,
      req.body.name
    );

    return res.status(201).json({
      success: true,
      message: "Playlist created successfully.",
      playlist,
    });
  } catch (error) {
    next(error);
  }
}

export async function listUserPlaylists(req, res, next) {
  try {
    const playlists = await getUserPlaylists(req.user.id);

    return res.status(200).json({
      success: true,
      count: playlists.length,
      playlists,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserPlaylist(req, res, next) {
  try {
    const { playlistId } = req.params;

    if (!UUID_PATTERN.test(playlistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID.",
      });
    }

    const playlist = await renamePlaylist(
      req.user.id,
      playlistId,
      req.body.name
    );

    return res.status(200).json({
      success: true,
      message: "Playlist renamed successfully.",
      playlist,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeUserPlaylist(req, res, next) {
  try {
    const { playlistId } = req.params;

    if (!UUID_PATTERN.test(playlistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID.",
      });
    }

    await deletePlaylist(req.user.id, playlistId);

    return res.status(200).json({
      success: true,
      message: "Playlist deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserPlaylistDetails(req, res, next) {
  try {
    const { playlistId } = req.params;

    if (!UUID_PATTERN.test(playlistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID.",
      });
    }

    const playlist = await getPlaylistDetails(
      req.user.id,
      playlistId
    );

    return res.status(200).json({
      success: true,
      playlist,
    });
  } catch (error) {
    next(error);
  }
}

export async function addUserPlaylistSong(req, res, next) {
  try {
    const { playlistId } = req.params;
    const { songId } = req.body;

    if (!UUID_PATTERN.test(playlistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID.",
      });
    }

    if (typeof songId !== "string" || !UUID_PATTERN.test(songId)) {
      return res.status(400).json({
        success: false,
        message: "A valid song ID is required.",
      });
    }

    const result = await addSongToPlaylist(
      req.user.id,
      playlistId,
      songId
    );

    return res.status(201).json({
      success: true,
      message: "Song added to playlist.",
      result,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeUserPlaylistSong(req, res, next) {
  try {
    const { playlistId, songId } = req.params;

    if (
      !UUID_PATTERN.test(playlistId) ||
      !UUID_PATTERN.test(songId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist or song ID.",
      });
    }

    await removeSongFromPlaylist(
      req.user.id,
      playlistId,
      songId
    );

    return res.status(200).json({
      success: true,
      message: "Song removed from playlist.",
    });
  } catch (error) {
    next(error);
  }
}
