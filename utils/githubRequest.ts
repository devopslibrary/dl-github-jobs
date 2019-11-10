import { request } from "@octokit/request";
import { createAppAuth } from "@octokit/auth-app";
import { parentLogger } from "./Logger";
const logger = parentLogger.child({ module: "getInstallationToken" });
import getInstallationToken = require("./getInstallationToken");

export async function githubRequest(
  endpoint: string,
  client,
  key: string,
  installationId: number = null
) {
  // If no org passed in, auth machine to machine

  // Auth using machine to machine private key
  const auth = createAppAuth({
    id: +process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY
  });
  var authHeadersWithKey = request.defaults({
    request: {
      hook: auth.hook
    },
    mediaType: {
      previews: ["machine-man"]
    }
  });

  // Check to see if we need to update, or if already up-to-date using Etag
  // More information here https://developer.github.com/v3/#conditional-requests
  const lastEtag = await client.hget(key, "etag");
  logger.debug("Last ETag: " + lastEtag);
  // If we don't have an ETag stored in Redis, we definitely need to sync
  var data = "";
  try {
    if (installationId) {
      // Get Installation Token
      const token = await getInstallationToken(client, installationId);
      this.data = await request(endpoint, {
        headers: {
          authorization: `token ${token}`,
          accept: "application/vnd.github.machine-man-preview+json",
          "If-None-Match": lastEtag
        }
      });
    } else {
      this.data = await authHeadersWithKey(endpoint, {
        headers: {
          "If-None-Match": lastEtag
        }
      });
    }
    // Log rate limit
    logger.debug(
      "Rate Limit Remaining: " +
        this.data.headers["x-ratelimit-remaining"] +
        "/5000"
    );

    // Update ETag and Data
    await client.hset(key, [
      "etag",
      this.data.headers.etag,
      "data",
      JSON.stringify(this.data)
    ]);
    return this.data;
  } catch (error) {
    // A 304 means that we have up-to-date etag, which is good!
    if (error.status === 304) {
      logger.debug("Returning cached data as Etag has not changed!");
      const stringData = await client.hget(key, "data");
      return await JSON.parse(stringData);
    } else {
      logger.error(error);
    }
  }
}
