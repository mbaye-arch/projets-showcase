# API Examples

## Health

```bash
curl http://127.0.0.1:6070/health
```

## List tasks

```bash
curl http://127.0.0.1:6070/api/tasks
```

## Filter tasks

```bash
curl "http://127.0.0.1:6070/api/tasks?status=open"
```

## Get task

```bash
curl http://127.0.0.1:6070/api/tasks/T001
```

## Stats

```bash
curl http://127.0.0.1:6070/api/stats
```

## Docs

```bash
curl http://127.0.0.1:6070/api/docs
```

## Validation error

```bash
curl "http://127.0.0.1:6070/api/tasks?status=blocked"
```

## Create task

```bash
curl -X POST http://127.0.0.1:6070/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Prepare dashboard export","owner":"Amina","status":"open","priority":"high"}'
```
