const githubRequest = require("../utils/githubRequest");
const logger = require("pino")({ level: process.env.LOG_LEVEL || "info" });

async function getAllGithubApplicationInstalls(client) {
  const data = await githubRequest("GET /app/installations");
  logger.info("getAllGithubApplicationInstalls: Retrieved all installations from Github");
  logger.info(data);
  data.data.forEach(function(install) {
    client.hmset("ghorg:" + install.target_id, [
      "name",
      install.account.login,
      "installation_id",
      install.id,
      "repository_selection",
      install.repository_selection,
      "access_tokens_url",
      install.access_tokens_url,
      "repositories_url",
      install.repositories_url,
      "html_url",
      install.html_url,
      "app_id",
      install.app_id,
      "target_id",
      install.target_id,
      "target_type",
      install.target_type,
      "created_at",
      install.created_at
    ]);
  });
}

module.exports = getAllGithubApplicationInstalls;
