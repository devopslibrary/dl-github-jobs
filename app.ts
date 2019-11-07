import getGithubOrgs = require("./jobs/getGithubOrgs");
import getGithubRepos = require("./jobs/getGithubRepos");
import getGithubBranches = require("./jobs/getGithubBranches");
require("dotenv").config(); // this is important!

// Run jobs
async function jobs() {
  const orgs = await getGithubOrgs();
  // const repos = await getGithubRepos(orgs);
  // await getGithubBranches(orgs, repos);
}

jobs();
