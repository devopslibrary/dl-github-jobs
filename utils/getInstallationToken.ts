import { createAppAuth } from "@octokit/auth-app";
import { parentLogger } from "../utils/Logger";
const logger = parentLogger.child({ module: "getInstallationToken" });
var moment = require("moment");

async function getInstallationToken(
  client,
  installationId: number
): Promise<string> {
  const installationToken = await client.hgetall(installationId);
  if (
    installationToken == null ||
    moment(new Date()).isAfter(installationToken.expiresAt)
  ) {
    logger.debug(
      "installationToken either expired or not present, requesting new one for " +
        installationId
    );
    const auth = createAppAuth({
      id: parseInt(process.env.APP_ID),
      privateKey: process.env.PRIVATE_KEY,
      installationId: installationId
    });
    const installationAuthentication = await auth({ type: "installation" });
    await client.hset(installationId, [
      "token",
      installationAuthentication.token,
      "expiresAt",
      installationAuthentication["expiresAt"]
    ]);
    return installationAuthentication.token;
  } else {
    logger.debug(
      "installationToken has not expired yet, returning current token for " +
        installationId
    );
    return installationToken.token;
  }
}

export = getInstallationToken;
