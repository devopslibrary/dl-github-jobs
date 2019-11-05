import { request } from "@octokit/request";
import { createAppAuth } from "@octokit/auth-app";

async function githubRequest(url) {
  const auth = createAppAuth({
    id: +process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    installationId: 123
  });
  const gRequest = request.defaults({
    request: {
      hook: auth.hook
    },
    mediaType: {
      previews: ["machine-man"]
    }
  });
  return await gRequest(url);
}
export = githubRequest;
