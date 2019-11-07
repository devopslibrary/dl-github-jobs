import { logger } from "../utils/Logger";
const githubRequest = require("@octokit/request").request;
import { Repo } from "../types/repo";
const { request } = require("graphql-request");
const { readFileSync } = require("fs");
require("dotenv").config(); // this is important!

async function getGithubRepos(orgs): Promise<Repo[]> {
  var repos: Repo[] = [];

  for (const org of orgs) {
    // Get Repos
    logger.info("getGithubRepos: Retrieving repos for " + org.name);
    const reposOutput = await githubRequest(
      "GET /orgs/" + org.name + "/repos",
      {
        headers: {
          authorization: `token ${org.token}`,
          accept: "application/vnd.github.machine-man-preview+json"
        }
      }
    );
    logger.debug("Repo data from Github");
    logger.debug(reposOutput);
    logger.debug(
      "Rate Limit Remaining: " +
        reposOutput.headers["x-ratelimit-remaining"] +
        "/5000"
    );

    for (const r of reposOutput.data) {
      const repo = {
        name: r.name, // Repo Name
        id: r.id, // Id within Github
        orgId: org.id, // Id of Org that Repo belongs to
        fullName: r.full_name, // Name of Repo
        createdAt: r.created_at, // When was the Repo created?
        updatedAt: new Date(), // When did we last check for updates?
        branches: [] // List of branches
      };
      logger.debug("Repo data as object");
      logger.debug(repo);

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
          branches: []
        }
      );
      repos.push(repo);
      logger.info("getGithubRepos: Finished updating repo: " + repo.name);
    }
  }
  return repos;
}

export = getGithubRepos;
