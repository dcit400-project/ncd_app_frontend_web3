import server from "../../tts-plugin/server.js"; // import the app you exported
import serverless from "serverless-http";

export const handler = serverless(server);
