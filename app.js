const { request } = require("@octokit/request");

async function asyncCall() {
  const { createAppAuth } = require("@octokit/auth-app");
  const auth = createAppAuth({
    id: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    installationId: 123
  });
  const requestWithAuth = request.defaults({
    request: {
      hook: auth.hook
    },
    mediaType: {
      previews: ["machine-man"]
    }
  });

  const data = await requestWithAuth("GET /app/installations");
  return data;
}

function writeRedis(data) {
  console.log(data);

  const redis = require("redis");
  const rejson = require("redis-rejson");

  rejson(redis); /* important - this must come BEFORE creating the client */
  let client = redis.createClient({
    port: 6379,
    host: "redis"
  });

  data.data.forEach(function(install) {
    client.hmset("ghorg:" + install.target_id, [
      "id",
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

  client.quit();
}
asyncCall().then(function(data) {
  writeRedis(data);
});
