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
    const branchList = await githubRequest(
      "GET /repos/" + org.name + "/" + repo.name + "/branches",
      client,
      "repo-" + org.name + "-" + repo.name,
      org.installationId
    );

    for (const b of branchList.data) {
      logger.debug(b.name);
      const branchData = await githubRequest(
        "GET /repos/" + org.name + "/" + repo.name + "/branches/" + b.name,
        client,
        "branch-" + org.name + "-" + repo.name + "-" + b.name,
        org.installationId
      );

      // Create Org Object
      const branch = {
        id: branchData.data.commit.node_id,
        name: branchData.data.name,
        repoId: repo.id,
        lastCommitDate: new Date(branchData.data.commit.commit.committer.date),
        protected: branchData.data.protected,
        lastSynced: new Date()
      };

      // Update Database
      await request(
        process.env.DATABASE_API,
        readFileSync(__dirname + "/graphql/upsertBranch.graphql", "utf8"),
        {
          id: branch.id,
          name: branch.name,
          repoId: branch.repoId,
          lastCommitDate: branch.lastCommitDate,
          protected: branch.protected,
          lastSynced: branch.lastSynced
        }
      );
      branches.push(branch);
      logger.info("getGithubRepos: Finished updating branch: " + branch.name);
    }
  }
  return branches;
}

export = getGithubBranches;
