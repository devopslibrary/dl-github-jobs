import { logger } from "../utils/Logger";
import githubRequest = require("../utils/githubRequest");
import { request } from "graphql-request";
const { readFileSync } = require("fs");
require("dotenv").config(); // this is important!

async function updateAllGithubApplicationInstalls() {
  const data = await githubRequest("GET /app/installations");
  logger.info(
    "updateAllGithubApplicationInstalls: Retrieved all installations"
  );
  logger.debug(data);

  for (const install of data.data) {
    // Create Org
    const query = readFileSync(
      __dirname + "/graphql/upsertOrg.graphql",
      "utf8"
    );
    const data = await request(process.env.DATABASE_API, query, {
      id: install.target_id,
      name: install.account.login,
      installationId: install.id,
      createdAt: install.created_at,
      updatedAt: new Date()
    });
    logger.info(
      "updateAllGithubApplicationInstalls: Updated data for " +
        install.account.login
    );
    logger.debug(data);
  }
}

export = updateAllGithubApplicationInstalls;
