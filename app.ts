import updateAllGithubApplicationInstalls = require("./jobs/updateAllGithubApplicationInstalls");
import updateAllReposInOrg = require("./jobs/updateAllReposInOrg");
require("dotenv").config(); // this is important!

// Run jobs
async function jobs() {
  updateAllGithubApplicationInstalls();
  updateAllReposInOrg();
}
