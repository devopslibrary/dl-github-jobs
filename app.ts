import updateAllGithubApplicationInstalls = require("./jobs/updateAllGithubApplicationInstalls");
import updateAllReposInOrg = require("./jobs/updateAllReposInOrg");
import redis = require("async-redis");
require("dotenv").config(); // this is important!

const client = redis.createClient({
  port: 6379,
  host: process.env.REDIS_HOST
});

// Run jobs
async function jobs() {
  updateAllGithubApplicationInstalls(client);
  updateAllReposInOrg(client);
}

// Close Redis at the End
jobs().then(function() {
  client.quit();
});
