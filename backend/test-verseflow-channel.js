
import {
  resolveYouTubeChannel,
} from "./src/services/youtube-music.service.js";

const channelUrl = process.argv[2];

if (!channelUrl) {
  console.error(
    "Usage: node test-verseflow-channel.js <YouTube-channel-URL>"
  );
  process.exit(1);
}

try {
  const result = await resolveYouTubeChannel(channelUrl);

  console.log("\nCHANNEL RESOLUTION SUCCESSFUL:");
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("\nCHANNEL RESOLUTION FAILED:");
  console.error(error.message);
  process.exitCode = 1;
}
