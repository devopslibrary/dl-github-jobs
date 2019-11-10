import { Repo } from "../types/repo";
import { Org } from "../types/org";
import { Branch } from "../types/branch";
import { githubRequest } from "../utils/githubRequest";
import { parentLogger } from "../utils/Logger";
const { request } = require("graphql-request");
const logger = parentLogger.child({ module: "getGithubOrgs" });
const { readFileSync } = require("fs");
require("dotenv").config(); // this is important!

async function getGithubBranches(
  client,
  orgs: Org[],
  repos: Repo[]
): Promise<Branch[]> {
  var branches: Branch[] = [];
  for (const repo of repos) {
    // Get org of repo
    const org = orgs.find(org => org.id == repo.orgId);

    // Get Branches
    logger.info("Retrieving branches for " + repo.name);
    const branchesOutput = await githubRequest(
      "GET /repos/" + org.name + "/" + repo.name + "/branches",
      client,
      "repo-" + org.name + "-" + repo.name,
      org.installationId
    );

    for (const r of branchesOutput.data) {
      logger.debug("Branch data as object");
      logger.debug(r);

      // await request(
      //   process.env.DATABASE_API,
      //   readFileSync(__dirname + "/graphql/upsertBranch.graphql", "utf8"),
      //   {
      //     id: repo.id,
      //     name: repo.name,
      //     orgId: repo.orgId,
      //     fullName: repo.fullName,
      //     createdAt: repo.createdAt,
      //     updatedAt: repo.updatedAt,
      //     branches: []
      //   }
      // );
      // repos.push(repo);
      logger.info("getGithubRepos: Finished updating branch: " + r.name);
    }
  }
  return branches;
}

export = getGithubBranches;
