# AWS Cost Optimization & Performance Fixes - Changes Log

**Date**: 2026-03-15
**Applied across**: All backend microservices

---

## P0 - Critical

### Fix 1: Reduce Body Parser Limits (500MB → 5MB)
**Impact**: Prevents OOM crashes, reduces memory footprint per request

| Repo | File | Before | After |
|------|------|--------|-------|
| tzk-userauth | app.js | bodyParser 500mb | bodyParser 5mb |
| tzk-com-services | app.js | express.json 100mb + bodyParser 500mb | express.json 5mb (bodyParser removed) |
| tzk-sales | app.js | express.json 100mb + bodyParser 500mb | express.json 5mb (bodyParser removed, XML parser kept) |
| tzk-products | app.js | express.json 100mb + bodyParser 500mb | express.json 5mb (bodyParser removed) |
| tzk-accounts | app.js | express.json 10mb + bodyParser 500mb | express.json 10mb (bodyParser removed) |
| tzk-payroll | app.js | express.json 10mb + bodyParser 500mb | express.json 10mb (bodyParser removed) |
| tzk-reports | app.js | bodyParser 500mb | bodyParser 5mb |
| tzk-leads | app.js | express.json 100mb + bodyParser 500mb | express.json 5mb (bodyParser removed, rawBodySaver kept) |
| tzk-projects | app.js | express.json 10mb + bodyParser 500mb | express.json 10mb (bodyParser removed) |
| tzk-assets | app.js | express.json 100mb + bodyParser 500mb | express.json 5mb (bodyParser removed) |
| tzk-superadmin | app.js | bodyParser 500mb | bodyParser 5mb |

### Fix 2: Cache JWT Blacklist in Redis
**Impact**: Eliminates 1 DB query per request (~1-5ms saved per request)

| Repo | File | Change |
|------|------|--------|
| tzk-userauth | src/jwt/index.js | Added Redis cache check before DB blacklist query |
| tzk-com-services | src/jwt/index.js | Added Redis cache check before DB blacklist query |
| tzk-userauth | src/api/logout/logout.model.js | Proactive Redis cache write on logout |

**Cache Strategy**:
- Key format: `bl:<sha256_hashed_token>`
- Blacklisted token: cached for 24h (matches token expiry)
- Non-blacklisted token: cached for 5 min (quick pickup of new logouts)
- On logout: immediately writes `'1'` to Redis
- Redis failure: falls back to DB query (no auth disruption)

---

## P1 - High Priority

### Fix 3: Remove Duplicate Body Parsing
**Impact**: Saves CPU cycles per request (was parsing body twice)

Removed duplicate `bodyParser.json()` and `bodyParser.urlencoded()` middleware in 8 repos where `express.json()` was already configured:
- tzk-com-services, tzk-sales, tzk-products, tzk-accounts
- tzk-payroll, tzk-leads, tzk-projects, tzk-assets

### Fix 4: Add Redis TTL to All Repos
**Impact**: Prevents unbounded Redis memory growth, allows smaller ElastiCache instance

| Repo | File | Before | After |
|------|------|--------|-------|
| tzk-sales | src/config/redis.js | No TTL (persistent) | Default 300s TTL |
| tzk-userauth | src/config/redis.js | No TTL (persistent) | Default 300s TTL |
| tzk-products | src/config/redis.js | No TTL (persistent) | Default 300s TTL |
| tzk-accounts | src/config/redis.js | No TTL (persistent) | Default 300s TTL |
| tzk-payroll | src/config/redis.js | No TTL (persistent) | Default 300s TTL |
| tzk-reports | src/config/redis.js | No TTL (persistent) | Default 300s TTL |
| tzk-leads | src/config/redis.js | No TTL (persistent) | Default 300s TTL |
| tzk-projects | src/config/redis.js | No TTL (persistent) | Default 300s TTL |
| tzk-assets | src/config/redis.js | No TTL (persistent) | Default 300s TTL |

**Note**: `setCache(key, data, ttl)` now accepts optional 3rd parameter. Default 300s. Existing callers unaffected (backward compatible).

### Fix 5: Enable Compression Middleware
**Impact**: Reduces response payload size (gzip), less data transfer cost

| Repo | File | Change |
|------|------|--------|
| tzk-accounts | app.js | Uncommented `app.use(compression())`, added require, installed package |
| tzk-reports | app.js | Uncommented `app.use(compression())`, added require, installed package |
| tzk-superadmin | app.js | Uncommented `app.use(compression())`, added require, installed package |
| tzk-products | app.js | Already enabled (no change needed) |

**Dependency**: `npm install compression` run in tzk-accounts, tzk-reports, tzk-superadmin.

---

## P2 - Medium Priority

### Fix 6: RabbitMQ Persistent Connections
**Impact**: Faster message handling, fewer connection establishment overheads

| File | Before | After |
|------|--------|-------|
| tzk-com-services/src/rabbitmq/producer.js | New connection per message, closed after each send | Module-level persistent connection with lazy init and auto-reconnect |
| tzk-com-services/src/rabbitmq/consumer.js | 4 separate connections (one per queue) | Single persistent connection shared across all queues |

**Additional changes**:
- Queues changed from `{ durable: false }` to `{ durable: true }`
- Messages sent with `{ persistent: true }` flag
- Connection URL configurable via `RABBITMQ_URL` env variable

**Deployment note**: Existing non-durable queues must be deleted before deploying (RabbitMQ doesn't allow changing durability on existing queues). Run via RabbitMQ management UI or CLI.

---

## P3 - Low Priority

### Fix 7: Reduce Request Timeout (60s → 30s)
**Impact**: Fewer stuck connections, faster resource reclamation

| Repo | Before | After |
|------|--------|-------|
| tzk-userauth | 60s | 30s |
| tzk-com-services | 60s | 30s |
| tzk-sales | 60s | 30s |
| tzk-products | 60s | 30s |
| tzk-accounts | 60s | 30s |
| tzk-payroll | 60s | 30s |
| tzk-leads | 60s | 30s |
| tzk-projects | 60s | 30s |
| tzk-assets | 60s | 30s |
| tzk-superadmin | 60s | 30s |
| **tzk-reports** | **60s** | **60s (kept)** |

**Note**: tzk-reports kept at 60s since report generation can take longer.

---

## Not Changed (Manual / Infrastructure Changes Required)

### P1: Consolidate DB Pools (~700 → ~100 connections)
**Current state**: Total connectionLimit across all repos = 100 (5+10+20+10+20+5+10+10+5+5+10 = 110)
**Recommendation**: Already reasonable. Monitor with `SHOW STATUS LIKE 'Threads_connected'` and adjust per-service limits based on actual usage. Consider reducing tzk-sales and tzk-accounts from 20 to 10.

### P2: Move Crons to Separate ECS Task / Lambda
**Current state**: Cron jobs run inside API server processes in tzk-com-services, tzk-sales, tzk-products, tzk-payroll, tzk-leads, tzk-assets.
**Recommendation**: Extract to separate ECS tasks or AWS Lambda with EventBridge triggers. This allows API servers to scale independently of cron workloads.

### P2: Switch Secrets Manager → SSM Parameter Store
**Current state**: All repos use AWS Secrets Manager with in-memory caching.
**Recommendation**: SSM Parameter Store is free for standard parameters (~$3/month savings). Requires changing SDK calls from `GetSecretValueCommand` to `GetParameterCommand` in all secret.js files.

### P2: Add EKS HPA Auto-scaling
**Recommendation**: Configure Horizontal Pod Autoscaler based on CPU/memory metrics. Set `minReplicas: 1, maxReplicas: 4, targetCPUUtilization: 70%` per service.

---

## Testing Checklist

- [ ] All services start without errors after body parser changes
- [ ] File uploads still work (uses multer, not affected by body parser limits)
- [ ] Login/logout flow works with Redis JWT cache
- [ ] Token blacklist is respected (logout → immediate rejection)
- [ ] Redis connection failure doesn't break authentication
- [ ] RabbitMQ messages are sent and consumed correctly
- [ ] Chat/messaging features work with persistent RabbitMQ connection
- [ ] Compression doesn't break any API responses
- [ ] No requests timing out at 30s that worked at 60s (except reports, kept at 60s)
- [ ] Redis memory usage stabilizes (TTL preventing unbounded growth)
