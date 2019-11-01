const updateAllGithubApplicationInstalls = require("./jobs/updateAllGithubApplicationInstalls");
const updateAllReposInOrg = require("./jobs/updateAllReposInOrg");
const logger = require("pino")({ level: process.env.LOG_LEVEL || "info" });
const redis = require("async-redis");
const time = require("time-since");
require("dotenv").config(); // this is important!

const client = redis.createClient({
  port: 6379,
  host: process.env.REDIS_HOST
});

// Run jobs
async function jobs() {
  await jobRunner("updateAllGithubApplicationInstalls", 30);
  await jobRunner("updateAllReposInOrg", 30);
  // await client.del("job:updateAllReposInOrg");
}

// My little job runner script
async function jobRunner(jobName, interval) {
  let lastRunTime = await client.get("job:" + jobName);
  if (time.since(lastRunTime).mins() > interval) {
    logger.info("Starting " + jobName + " job!");
    await eval(jobName + "(client)").then(function() {
      logger.info(jobName + " updated DB successfully");
      client.set("job:" + jobName, Date.now());
    });
  } else {
    logger.info(
      "Skipping " +
        jobName +
        "job, waiting " +
        (interval - time.since(lastRunTime).mins()) +
        " min. before running again"
    );
  }
}

// Close Redis at the End
jobs().then(function() {
  client.quit();
});
