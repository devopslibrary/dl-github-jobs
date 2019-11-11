import { parentLogger } from "../utils/Logger";
import { Org } from "../types/org";
import { request } from "graphql-request";
import { readFileSync } from "fs";
const logger = parentLogger.child({ module: "getGithubOrgs" });
import { githubRequest } from "../utils/githubRequest";
require("dotenv").config();

async function getGithubOrgs(client): Promise<Org[]> {
  var orgs: Org[] = [];

  // Get Installations
  const data = await githubRequest(
    "GET /app/installations",
    client,
    "installations"
  );

  // Update Database

  for (const install of data.data) {
    // Create Org Object
    const org = {
      name: install.account.login,
      id: install.target_id,
      installationId: install.id,
      createdAt: install.created_at,
      updatedAt: install.updated_at,
      lastSynced: new Date()
    };
    // logger.debug(org);
    request(
      process.env.DATABASE_API,
      readFileSync(__dirname + "/graphql/upsertOrg.graphql", "utf8"),
      {
        id: org.id,
        name: org.name,
        installationId: org.installationId,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        lastSynced: new Date()
      }
    );
    logger.info("Updated data for " + org.name);
    orgs.push(org);
  }

  return orgs;
}

export = getGithubOrgs;
