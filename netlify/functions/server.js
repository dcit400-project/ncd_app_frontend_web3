import server from "../../tts_backend/server.js"; // import the app you exported
import serverless from "serverless-http";

export const handler = serverless(server);
