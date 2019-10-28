const getAllGithubApplicationInstalls = require("./jobs/getAllGithubApplicationInstalls");
const getAllReposInOrg = require("./jobs/getAllReposInOrg");
const logger = require("pino")({ level: process.env.LOG_LEVEL || "info" });
const redis = require("async-redis");
var time = require("time-since");

const client = redis.createClient({
  port: 6379,
  host: "localhost"
});

// Run jobs
async function jobs() {
  await jobRunner("getAllGithubApplicationInstalls", 30);
  await jobRunner("getAllReposInOrg", 30);
  // await client.del("job:getAllReposInOrg");
}

// My little job runner script
async function jobRunner(jobName, interval) {
  let lastRunTime = await client.get("job:" + jobName);
  if (time.since(lastRunTime).mins() > interval) {
    logger.info("Starting " + jobName + " job!");
    await eval(jobName + "(client)").then(function() {
      logger.info(jobName + " updated Redis successfully");
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
