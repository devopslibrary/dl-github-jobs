import getGithubOrgs = require("./jobs/getGithubOrgs");
import getGithubRepos = require("./jobs/getGithubRepos");
import getGithubBranches = require("./jobs/getGithubBranches");
import redis = require("async-redis");
require("dotenv").config(); // this is important!

// Connect to Redis
const client = redis.createClient({
  port: 6379,
  host: process.env.REDIS_HOST
});

// Run jobs
async function jobs() {
  const orgs = await getGithubOrgs(client);
  const repos = await getGithubRepos(client, orgs);
  //const branches = await getGithubBranches(client, orgs, repos);
}

// Close Redis at the End
jobs().then(function() {
  client.quit();
});
