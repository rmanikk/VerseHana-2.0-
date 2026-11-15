
import {
  registerArtistChannel,
  getArtistChannels,
  updateArtistChannelVerification,
  deactivateArtistChannel,
} from "../services/verseflow-artist-channel.service.js";

import {
  resolveYouTubeChannel,
} from "../services/youtube-music.service.js";

export async function createArtistChannel(req, res, next) {
  try {
    const {
      channelUrl,
      category,
      languageCode,
    } = req.body;

    if (!channelUrl || !category) {
      return res.status(400).json({
        success: false,
        message: "YouTube channel URL and category are required.",
      });
    }

    // Resolve the supplied YouTube URL automatically.
    const resolvedChannel = await resolveYouTubeChannel(channelUrl);

    // Register the verified channel details in PostgreSQL.
    const artist = await registerArtistChannel({
      artistName: resolvedChannel.channelName,
      channelId: resolvedChannel.channelId,
      channelUrl: resolvedChannel.channelUrl,
      category,
      languageCode: languageCode || null,
    });

    return res.status(201).json({
      success: true,
      message: "Artist channel registered successfully.",
      artist,
    });
  } catch (error) {
    next(error);
  }
}

export async function listArtistChannels(req, res, next) {
  try {
    const {
      category,
      verificationStatus,
      activeOnly,
    } = req.query;

    const artists = await getArtistChannels({
      category: category || null,
      verificationStatus: verificationStatus || null,
      activeOnly: activeOnly !== "false",
    });

    return res.status(200).json({
      success: true,
      count: artists.length,
      artists,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyArtistChannel(req, res, next) {
  try {
    const { channelId } = req.params;
    const { verificationStatus } = req.body;

    const artist = await updateArtistChannelVerification({
      channelId,
      verificationStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Artist channel verification updated.",
      artist,
    });
  } catch (error) {
    next(error);
  }
}

export async function deactivateArtist(req, res, next) {
  try {
    const artist = await deactivateArtistChannel(
      req.params.channelId
    );

    return res.status(200).json({
      success: true,
      message: "Artist channel deactivated.",
      artist,
    });
  } catch (error) {
    next(error);
  }
}
