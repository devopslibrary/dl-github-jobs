const githubRequest = require("../utils/githubRequest");
const logger = require("pino")({level: process.env.LOG_LEVEL || "info"});
const {request, GraphQLClient} = require('graphql-request')
const {readFileSync} = require('fs')
require("dotenv").config(); // this is important!

async function updateAllGithubApplicationInstalls(client) {
  const data = await githubRequest("GET /app/installations");
  logger.info(
    "updateAllGithubApplicationInstalls: Retrieved all installations"
  );
  logger.info(data);

  for (const install of data.data) {
    // Create Org
    const query = readFileSync(__dirname + '/graphql/upsertOrg.graphql', 'utf8')
    const data = await request(process.env.DATABASE_API, query, {
      id: install.target_id,
      name: install.account.login,
      installationId: install.id,
      createdAt: install.created_at,
      updatedAt: new Date()
    });
    console.debug('updateAllGithubApplicationInstalls: Updated data: ')
    console.debug(data)
  }
}

module.exports = updateAllGithubApplicationInstalls;
