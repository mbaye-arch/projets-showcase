# Commandes Utiles

## Docker

```bash
docker build -t showcase-api:latest ./app
docker run --rm -p 3000:3000 showcase-api:latest
```

## Local Node.js

```bash
cd app
PORT=3070 APP_NAME="Docker Kubernetes Lab" NODE_ENV=production node src/server.js
curl http://127.0.0.1:3070/health
curl http://127.0.0.1:3070/deployments
```

## Docker Compose

```bash
docker compose up --build
docker compose down
```

## Kubernetes

```bash
kubectl apply -f k8s/
kubectl get pods -n showcase
kubectl describe deployment showcase-api -n showcase
kubectl logs -n showcase deployment/showcase-api
kubectl port-forward -n showcase service/showcase-api 8080:80
```

## Nettoyage

```bash
kubectl delete namespace showcase
docker compose down --volumes
```
