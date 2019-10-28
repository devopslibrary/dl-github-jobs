const { request } = require("@octokit/request");
const { createAppAuth } = require("@octokit/auth-app");

const auth = createAppAuth({
  id: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  installationId: 123
});
const githubRequest = request.defaults({
  request: {
    hook: auth.hook
  },
  mediaType: {
    previews: ["machine-man"]
  }
});

module.exports = githubRequest;
