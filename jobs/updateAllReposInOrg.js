const logger = require("pino")({ level: process.env.LOG_LEVEL || "info" });
const githubRequest = require("@octokit/request").request;
const { createAppAuth } = require("@octokit/auth-app");
const {request, GraphQLClient} = require('graphql-request')
const {readFileSync} = require('fs')
require("dotenv").config(); // this is important!

async function updateAllReposInOrg(client) {
  // Get Orgs
  const query = readFileSync(__dirname + '/graphql/getOrgs.graphql', 'utf8')
  const orgs = await request(process.env.DATABASE_API, query);

  for (const org of orgs.allOrgs.nodes) {
    logger.info("updateAllReposInOrg: Scanning org " + org.id + " for repos");
    logger.debug(org);

    // Get Installation Token
    const auth = createAppAuth({
      id: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId: org.installationId
    });
    const gh = githubRequest.defaults({
      request: {
        hook: auth.hook
      },
      mediaType: {
        previews: ["machine-man"]
      }
    });
    const installationAuthentication = await auth({ type: "installation" });

    // Get Repos
    logger.info("updateAllReposInOrg: Retrieving repos");
    const repos = await githubRequest("GET /orgs/" + org.name + "/repos", {
      headers: {
        authorization: `token ${installationAuthentication.token}`,
        accept: "application/vnd.github.machine-man-preview+json"
      }
    });
    logger.debug(repos);
    logger.debug(
      "Rate Limit Remaining: " +
        repos.headers["x-ratelimit-remaining"] +
        "/5000"
    );

    for (const repo of repos.data) {
      const query = readFileSync(__dirname + '/graphql/upsertRepo.graphql', 'utf8')
      const data = await request(process.env.DATABASE_API, query, {
        id: repo.id,
        name: repo.name,
        orgId: org.id,
        fullName: repo.full_name,
        createdAt: repo.created_at,
        updatedAt: new Date()
      });
    }
  }
}

module.exports = updateAllReposInOrg;
