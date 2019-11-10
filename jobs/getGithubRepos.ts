import { Repo } from "../types/repo";
import { parentLogger } from "../utils/Logger";
const logger = parentLogger.child({ module: "getGithubRepos" });
import { githubRequest } from "../utils/githubRequest";
const { request } = require("graphql-request");
const { readFileSync } = require("fs");
require("dotenv").config();

async function getGithubRepos(client, orgs): Promise<Repo[]> {
  var repos: Repo[] = [];

  for (const org of orgs) {
    // Get Repos
    logger.info("getGithubRepos: Retrieving repos for " + org.name);
    const data = await githubRequest(
      "GET /orgs/" + org.name + "/repos",
      client,
      "org-" + org.name,
      org.installationId
    );
    for (const r of data.data) {
      const repo = {
        name: r.name, // Repo Name
        id: r.id, // Id within Github
        orgId: org.id, // Id of Org that Repo belongs to
        fullName: r.full_name, // Name of Repo
        createdAt: r.created_at, // When was the Repo created?
        updatedAt: r.updated_at, // When did we last check for updates?
        lastSynced: new Date(),
        defaultBranch: r.default_branch // List of branches
      };

      await request(
        process.env.DATABASE_API,
        readFileSync(__dirname + "/graphql/upsertRepo.graphql", "utf8"),
        {
          id: repo.id,
          name: repo.name,
          orgId: repo.orgId,
          fullName: repo.fullName,
          createdAt: repo.createdAt,
          updatedAt: repo.updatedAt,
          lastSynced: new Date(),
          defaultBranch: r.default_branch
        }
      );
      repos.push(repo);
      logger.info("getGithubRepos: Finished updating repo: " + repo.name);
    }
  }
  return repos;
}

export = getGithubRepos;
