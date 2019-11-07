import { logger } from "../utils/Logger";
const githubRequest = require("@octokit/request").request;
import { Repo } from "../types/repo";
import { Org } from "../types/org";
import { Branch } from "../types/branch";
const { request } = require("graphql-request");
const { readFileSync } = require("fs");
require("dotenv").config(); // this is important!

async function getGithubBranches(orgs: Org[], repos: Repo[]): Promise<Repo[]> {
  var branches: Branch[] = [];
  for (const repo of repos) {
    // Get org of repo
    const org = orgs.find(org => org.id == repo.orgId);

    // Get Branches
    logger.info("getGithubBranches: Retrieving branches for " + repo.name);
    const branchesOutput = await githubRequest(
      "GET /repos/" + org.name + "/" + repo.name + "/branches",
      {
        headers: {
          authorization: `token ${org.token}`,
          accept: "application/vnd.github.machine-man-preview+json"
        }
      }
    );
    logger.debug("Branch data from Github");
    logger.debug(branchesOutput);
    logger.debug(
      "Rate Limit Remaining: " +
        branchesOutput.headers["x-ratelimit-remaining"] +
        "/5000"
    );

    for (const r of branchesOutput.data) {
      const branch = {};
      logger.debug("Branch data as object");
      logger.debug(r);

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

export = getGithubBranches;
