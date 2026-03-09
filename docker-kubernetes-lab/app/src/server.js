import http from "node:http";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const appName = process.env.APP_NAME ?? "Showcase API";
const environment = process.env.NODE_ENV ?? "development";
const startedAt = new Date();
const deployments = [
  {
    name: "api",
    replicas: 2,
    image: "showcase-api:latest",
    probes: ["readiness", "liveness"]
  },
  {
    name: "nginx",
    replicas: 1,
    image: "nginx:1.27-alpine",
    probes: ["reverse-proxy"]
  }
];

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (url.pathname === "/health") {
    sendJson(response, 200, {
      status: "ok",
      service: appName,
      environment,
      uptimeSeconds: Math.round(process.uptime())
    });
    return;
  }

  if (url.pathname === "/deployments") {
    sendJson(response, 200, {
      namespace: "showcase",
      strategy: "rolling-update",
      deployments
    });
    return;
  }

  if (url.pathname === "/metrics") {
    sendJson(response, 200, {
      startedAt: startedAt.toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      memory: process.memoryUsage()
    });
    return;
  }

  sendJson(response, 200, {
    message: "Docker Kubernetes Lab API",
    service: appName,
    environment,
    endpoints: ["/health", "/metrics", "/deployments"]
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`${appName} listening on port ${port}`);
});

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(payload, null, 2));
}
