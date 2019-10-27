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
  console.log(data);
}
console.log("hi");
asyncCall();
