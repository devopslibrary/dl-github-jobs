import { logger } from "../utils/Logger";
import { Org } from "../types/org";
import githubRequest = require("../utils/githubRequest");
import { request } from "graphql-request";
const { readFileSync } = require("fs");
const { createAppAuth } = require("@octokit/auth-app");
require("dotenv").config(); // this is important!

async function getGithubOrgs(): Promise<Org[]> {
  const data = await githubRequest("GET /app/installations");
  logger.info("getGithubOrgs: Retrieved all installations");
  logger.debug(data);
  var orgs: Org[] = [];

  for (const install of data.data) {
    // Get Installation Token
    const auth = await createAppAuth({
      id: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId: install.id
    });
    const installationAuthentication = await auth({ type: "installation" });

    // Create Org Object
    const org = {
      name: install.account.login,
      id: install.target_id,
      installationId: install.id,
      createdAt: install.created_at,
      updatedAt: new Date(),
      token: installationAuthentication.token
    };
    logger.debug(org);

    // Update Database (Aside from Ephemeral Token)
    const data = await request(
      process.env.DATABASE_API,
      readFileSync(__dirname + "/graphql/upsertOrg.graphql", "utf8"),
      {
        id: org.id,
        name: org.name,
        installationId: org.installationId,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt
      }
    );

    logger.info("getGithubOrgs: Updated data for " + org.name);
    orgs.push(org);
  }
  return orgs;
}

export = getGithubOrgs;
