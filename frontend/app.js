const http = require("node:http");
const next = require("next");

const nextApp = next({
  dev: false,
  dir: __dirname,
});

const handle = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
    const server = http.createServer((request, response) => {
      handle(request, response);
    });

    server.listen(process.env.PORT || 3000, () => {
      console.log("Leave Manager frontend started");
    });
  })
  .catch((error) => {
    console.error("Next.js startup failed:", error);
    process.exit(1);
  });
