const { request } = require("@octokit/request");

async function asyncCall() {
  const {createAppAuth} = require("@octokit/auth-app");
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
  // const {data: app} = await requestWithAuth("POST /repos/:owner/:repo/issues", {
  //   owner: "octocat",
  //   repo: "hello-world",
  //   title: "Hello from the engine room"
  // });
  return data;
}

function writeRedis(data) {
  console.log(data);

  const redis=require("redis");
  const rejson = require('redis-rejson');

  rejson(redis); /* important - this must come BEFORE creating the client */
  let client= redis.createClient({
    port:6379,
    host:'localhost'
  });

  client.json_set('githubInstallations', '.', JSON.stringify(data), function (err) {
    if (err) { throw err; }
    client.json_get('githubInstallations', '.', function (err, value) {
      if (err) { throw err; }
      client.quit();
    });
  });
}
asyncCall().then(function(data) {
  writeRedis(data)
});
