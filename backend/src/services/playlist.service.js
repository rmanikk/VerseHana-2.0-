
import pool, { query } from "../config/database.js";

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validatePlaylistName(name) {
  if (typeof name !== "string" || !name.trim()) {
    throw createError("Playlist name is required.");
  }

  if (name.trim().length > 100) {
    throw createError("Playlist name cannot exceed 100 characters.");
  }

  return name.trim();
}

export async function createPlaylist(userId, name) {
  const validName = validatePlaylistName(name);

  const result = await query(
    `
      INSERT INTO user_playlists (user_id, name)
      VALUES ($1, $2)
      RETURNING *
    `,
    [userId, validName]
  );

  return result.rows[0];
}

export async function getUserPlaylists(userId) {
  const result = await query(
    `
      SELECT
        p.id,
        p.name,
        p.description,
        p.created_at,
        p.updated_at,
        COUNT(ps.song_id)::INTEGER AS song_count

      FROM user_playlists p

      LEFT JOIN user_playlist_songs ps
        ON ps.playlist_id = p.id

      WHERE p.user_id = $1

      GROUP BY p.id

      ORDER BY p.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

export async function renamePlaylist(userId, playlistId, name) {
  const validName = validatePlaylistName(name);

  const result = await query(
    `
      UPDATE user_playlists
      SET
        name = $3,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $1
        AND user_id = $2

      RETURNING *
    `,
    [playlistId, userId, validName]
  );

  if (!result.rows.length) {
    throw createError("Playlist not found.", 404);
  }

  return result.rows[0];
}

export async function deletePlaylist(userId, playlistId) {
  const result = await query(
    `
      DELETE FROM user_playlists
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [playlistId, userId]
  );

  if (!result.rows.length) {
    throw createError("Playlist not found.", 404);
  }

  return result.rows[0];
}

export async function getPlaylistDetails(userId, playlistId) {
  const playlistResult = await query(
    `
      SELECT
        id,
        name,
        description,
        created_at,
        updated_at
      FROM user_playlists
      WHERE id = $1 AND user_id = $2
    `,
    [playlistId, userId]
  );

  if (!playlistResult.rows.length) {
    throw createError("Playlist not found.", 404);
  }

  const songsResult = await query(
    `
      SELECT
        s.id,
        s.artist,
        s.normalized_title,
        s.category,
        s.language_code,
        s.featured_artists,
        s.moods,
        s.genres,
        ps.position,
        ps.added_at

      FROM user_playlist_songs ps

      INNER JOIN verseflow_songs s
        ON s.id = ps.song_id

      WHERE ps.playlist_id = $1

      ORDER BY ps.position ASC
    `,
    [playlistId]
  );

  return {
    ...playlistResult.rows[0],
    songs: songsResult.rows,
  };
}

export async function addSongToPlaylist(
  userId,
  playlistId,
  songId
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the playlist while calculating its next position.
    const playlistResult = await client.query(
      `
        SELECT id
        FROM user_playlists
        WHERE id = $1 AND user_id = $2
        FOR UPDATE
      `,
      [playlistId, userId]
    );

    if (!playlistResult.rows.length) {
      throw createError("Playlist not found.", 404);
    }

    // Confirm that this canonical song exists.
    const songResult = await client.query(
      `
        SELECT id
        FROM verseflow_songs
        WHERE id = $1
      `,
      [songId]
    );

    if (!songResult.rows.length) {
      throw createError("Song not found.", 404);
    }

    // Prevent duplicate songs in the same playlist.
    const existingSong = await client.query(
      `
        SELECT song_id
        FROM user_playlist_songs
        WHERE playlist_id = $1
          AND song_id = $2
      `,
      [playlistId, songId]
    );

    if (existingSong.rows.length) {
      throw createError(
        "This song is already in the playlist.",
        409
      );
    }

    const positionResult = await client.query(
      `
        SELECT COALESCE(MAX(position) + 1, 0) AS next_position
        FROM user_playlist_songs
        WHERE playlist_id = $1
      `,
      [playlistId]
    );

    const position = positionResult.rows[0].next_position;

    await client.query(
      `
        INSERT INTO user_playlist_songs (
          playlist_id,
          song_id,
          position
        )
        VALUES ($1, $2, $3)
      `,
      [playlistId, songId, position]
    );

    await client.query(
      `
        UPDATE user_playlists
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [playlistId]
    );

    await client.query("COMMIT");

    return {
      playlistId,
      songId,
      position,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function removeSongFromPlaylist(
  userId,
  playlistId,
  songId
) {
  const result = await query(
    `
      DELETE FROM user_playlist_songs ps

      USING user_playlists p

      WHERE ps.playlist_id = p.id
        AND p.user_id = $1
        AND p.id = $2
        AND ps.song_id = $3

      RETURNING ps.song_id
    `,
    [userId, playlistId, songId]
  );

  if (!result.rows.length) {
    throw createError(
      "Song not found in this playlist.",
      404
    );
  }

  await query(
    `
      UPDATE user_playlists
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
    `,
    [playlistId, userId]
  );

  return result.rows[0];
}

