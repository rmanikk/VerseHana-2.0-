
import pool from "../config/database.js";

const SONG_MERGES = [
  {
    canonicalId: "a5d403f4-be26-4bc4-9752-07ecdbc3c789",
    duplicateId: "d904b78a-2a27-41f7-a144-4513a556862a",
    normalizedTitle: "Herai Basai",
  },
  {
    canonicalId: "76efde1f-f6bd-44d2-b111-e440db43187d",
    duplicateId: "1b12a29e-6845-47b7-bb03-f941a9f785b0",
    normalizedTitle: "Muskuraye",
  },
  {
    canonicalId: "6c75c859-425d-4f16-b58a-3e4acc07c30d",
    duplicateId: "ad56291e-7cc9-4e01-a96b-802b09224468",
    normalizedTitle: "Ghaamchhaya",
  },
];

function mergeStrings(...arrays) {
  return [
    ...new Set(
      arrays
        .flat()
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ];
}

function mergeJsonArrays(...arrays) {
  const values = arrays.flatMap((value) =>
    Array.isArray(value) ? value : []
  );

  const unique = new Map();

  for (const value of values) {
    unique.set(JSON.stringify(value), value);
  }

  return [...unique.values()];
}

export async function repairVerseFlowSongGroups() {
  const client = await pool.connect();

  const results = {
    success: false,
    mergedSongs: 0,
    movedCandidates: 0,
    groups: [],
  };

  try {
    await client.query("BEGIN");

    const allIds = SONG_MERGES.flatMap((merge) => [
      merge.canonicalId,
      merge.duplicateId,
    ]);

    const songResult = await client.query(
      `
        SELECT *
        FROM verseflow_songs
        WHERE id = ANY($1::uuid[])
        FOR UPDATE
      `,
      [allIds]
    );

    if (songResult.rows.length !== allIds.length) {
      throw new Error(
        "Expected song records were not all found. No changes were made."
      );
    }

    const songsById = new Map(
      songResult.rows.map((song) => [song.id, song])
    );

    for (const merge of SONG_MERGES) {
      const canonical = songsById.get(merge.canonicalId);
      const duplicate = songsById.get(merge.duplicateId);

      if (
        canonical.artist !== "Yabesh Thapa" ||
        duplicate.artist !== "Yabesh Thapa" ||
        canonical.category !== "nepali" ||
        duplicate.category !== "nepali"
      ) {
        throw new Error(
          `Song identity validation failed for ${merge.normalizedTitle}.`
        );
      }

      const candidatesResult = await client.query(
        `
          SELECT
            id,
            song_id,
            language_code,
            featured_artists,
            moods,
            genres
          FROM verseflow_candidates
          WHERE song_id = ANY($1::uuid[])
          FOR UPDATE
        `,
        [[merge.canonicalId, merge.duplicateId]]
      );

      const candidates = candidatesResult.rows;

      const featuredArtists = mergeStrings(
        canonical.featured_artists || [],
        duplicate.featured_artists || [],
        ...candidates.map((candidate) =>
          candidate.featured_artists || []
        )
      );

      const moods = mergeJsonArrays(
        canonical.moods,
        duplicate.moods,
        ...candidates.map((candidate) => candidate.moods)
      );

      const genres = mergeJsonArrays(
        canonical.genres,
        duplicate.genres,
        ...candidates.map((candidate) => candidate.genres)
      );

      const languageCode =
        canonical.language_code ||
        duplicate.language_code ||
        candidates.find((candidate) => candidate.language_code)
          ?.language_code ||
        null;

      await client.query(
        `
          UPDATE verseflow_songs
          SET
            normalized_title = $1,
            language_code = $2,
            featured_artists = $3,
            moods = $4::jsonb,
            genres = $5::jsonb,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $6
        `,
        [
          merge.normalizedTitle,
          languageCode,
          featuredArtists,
          JSON.stringify(moods),
          JSON.stringify(genres),
          merge.canonicalId,
        ]
      );

      const moved = await client.query(
        `
          UPDATE verseflow_candidates
          SET
            song_id = $1,
            normalized_song_title = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE song_id = $3
             OR song_id = $1
        `,
        [
          merge.canonicalId,
          merge.normalizedTitle,
          merge.duplicateId,
        ]
      );

      await client.query(
        `
          DELETE FROM verseflow_songs
          WHERE id = $1
        `,
        [merge.duplicateId]
      );

      results.mergedSongs++;
      results.movedCandidates += moved.rowCount;

      results.groups.push({
        title: merge.normalizedTitle,
        canonicalSongId: merge.canonicalId,
        candidatesLinked: moved.rowCount,
      });
    }

    await client.query("COMMIT");

    results.success = true;

    return results;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
