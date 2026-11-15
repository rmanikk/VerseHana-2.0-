
import {
  getChannelVideos,
} from "./src/services/youtube-music.service.js";

const channelId = process.argv[2];

if (!channelId) {
  console.error("Usage: node test-verseflow-videos.js <channel-id>");
  process.exit(1);
}

try {
  const result = await getChannelVideos(channelId, 10);

  console.log("\nDIAGNOSTIC RESULT:");
  console.dir(result, { depth: 4 });

} catch (error) {
  console.error("\nCHANNEL VIDEO DIAGNOSTIC FAILED");
  console.error(error);
  process.exitCode = 1;
}
