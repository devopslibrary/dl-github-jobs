const logger = require("pino")({ level: process.env.LOG_LEVEL || "info" });
const { request } = require("@octokit/request");
const { createAppAuth } = require("@octokit/auth-app");


async function getAllReposInOrg(client) {
  orgs = await client.scan(0, "MATCH", "ghorg:*");
  for (const org of orgs[1]) {
    orgId = org.split(":")[1];
    logger.info("getAllReposInOrg: Scanning org " + orgId + " for repos");

    // Get Installation Id
    const orgData = await client.hgetall(org);
    logger.debug(orgData);
    const installationId = orgData.installation_id
    logger.debug("getAllReposInOrg: Installation Id for " + orgData.name + " is " + installationId)

    // Get Installation Token
    const auth = createAppAuth({
      id: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId: installationId
    });
    const githubRequest = request.defaults({
      request: {
        hook: auth.hook
      },
      mediaType: {
        previews: ["machine-man"]
      }
    });
    const installationAuthentication = await auth({ type: "installation" });

    // Get Repos
    logger.info('getAllReposInOrg: Retrieving repos')
    const repos = await request("GET /orgs/" + orgData.name + "/repos", {
      headers: {
        authorization: `token ${installationAuthentication.token}`,
        accept: "application/vnd.github.machine-man-preview+json"
      },
    });
    logger.debug("Rate Limit Remaining: " + repos.headers['x-ratelimit-remaining'] + "/5000")

    for (const repo of repos.data) {
      client.hmset("ghrepo:" + orgData.target_id + ":repos:" + repo.name, [
        "id",
        repo.id,
        "name",
        repo.name,
        "full_name",
        repo.full_name,
        "git_refs_url",
        repo.git_refs_url
      ]);
    }
    // USE THIS!  scan 0 MATCH ghorg:11233903:repos:*
  }
}

module.exports = getAllReposInOrg;
