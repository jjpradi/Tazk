# Error Capture System — Complete Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Database Schema](#database-schema)
4. [Backend Error Capture](#backend-error-capture)
   - [Middleware Layer](#middleware-layer)
   - [Winston Logger](#winston-logger)
   - [MySQL Transport](#mysql-transport)
   - [SQLite Offline Fallback](#sqlite-offline-fallback)
   - [Offline-to-Online Sync](#offline-to-online-sync)
   - [JWT/Auth Failure Logging](#jwtauth-failure-logging)
   - [Process-Level Error Handlers](#process-level-error-handlers)
5. [Gateway Error Capture](#gateway-error-capture)
6. [Frontend Error Capture](#frontend-error-capture)
   - [React Error Boundary](#react-error-boundary)
   - [Axios Interceptor (Network Errors)](#axios-interceptor-network-errors)
   - [PouchDB Offline Queue](#pouchdb-offline-queue)
7. [Error Dashboard (UI)](#error-dashboard-ui)
   - [Dashboard Features](#dashboard-features)
   - [API Endpoints](#api-endpoints)
   - [Redux State](#redux-state)
   - [Priority Calculation](#priority-calculation)
8. [Repos and File Locations](#repos-and-file-locations)
9. [Error Flow Examples](#error-flow-examples)
10. [Known Limitations](#known-limitations)

---

## System Overview

The error capture system is a two-tier logging architecture that ensures no errors are lost, even when the main database is unreachable. Errors are captured from three sources:

- **Backend microservices** (11 repos) — Express middleware, JWT auth, controller errors
- **API Gateway** (tzk-gate-way) — Proxy failures, service unavailability
- **Frontend** (tzk-tazk-ui) — React component crashes, API call failures, network errors

All errors eventually land in a centralized MySQL table (`pos_error_info`) and are viewable in the **Error Dashboard** UI at `/common/ErrorList`.

---

## Architecture Diagram

```
                          ┌──────────────────────────────────────────────┐
                          │              FRONTEND (tzk-tazk-ui)         │
                          │                                              │
                          │  ┌─────────────┐   ┌──────────────────────┐ │
                          │  │  React Error │   │   Axios Response     │ │
                          │  │  Boundary    │   │   Interceptor        │ │
                          │  │  (component  │   │   (network errors,   │ │
                          │  │   crashes)   │   │    API failures)     │ │
                          │  └──────┬───────┘   └──────────┬───────────┘ │
                          │         │                      │             │
                          │         │ POST /createlog      │ store       │
                          │         │                      ▼             │
                          │         │              ┌──────────────┐      │
                          │         │              │   PouchDB    │      │
                          │         │              │  (IndexedDB) │      │
                          │         │              └──────┬───────┘      │
                          │         │                     │ sync on next │
                          │         │                     │ successful   │
                          │         │                     │ API response │
                          └─────────┼─────────────────────┼──────────────┘
                                    │                     │
                                    ▼                     ▼
                          ┌──────────────────────────────────────────────┐
                          │            API GATEWAY (port 4000)           │
                          │                                              │
                          │  ┌─────────────────────────────────────────┐ │
                          │  │  Proxy Error Handler (on.error)         │ │
                          │  │  Express Error Handler (err middleware) │ │
                          │  │  Process Handlers (unhandled/uncaught)  │ │
                          │  │  → console.error (no DB in gateway)     │ │
                          │  └─────────────────────────────────────────┘ │
                          │                     │                        │
                          │              proxy to service                │
                          └─────────────────────┼────────────────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
                    ▼                           ▼                           ▼
         ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
         │  tzk-com-services│       │    tzk-sales      │       │  tzk-accounts    │
         │  (port 4004)     │       │    (port 4006)    │       │  (port 4005)     │
         │                  │       │                   │       │                  │
         │  ... and 8 more microservices (userauth, payroll,    │                  │
         │      products, reports, superadmin, leads,           │                  │
         │      assets, projects)                               │                  │
         └────────┬─────────┘       └────────┬──────────┘       └────────┬─────────┘
                  │                          │                           │
                  │     All services share the same error capture stack  │
                  │                          │                           │
                  ▼                          ▼                           ▼
         ┌─────────────────────────────────────────────────────────────────────────┐
         │                        ERROR CAPTURE STACK                              │
         │                                                                         │
         │  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐                 │
         │  │  secError     │  │  errorHandler │  │  notFound    │                 │
         │  │  Handler      │  │  (Express     │  │  (404 route  │                 │
         │  │  (DB check,   │  │   error       │  │   logging)   │                 │
         │  │   slow API)   │  │   middleware)  │  │              │                 │
         │  └───────┬───────┘  └──────┬────────┘  └──────┬───────┘                │
         │          │                 │                   │                         │
         │          │    ┌────────────┘                   │                         │
         │          │    │    ┌───────────────────────────┘                         │
         │          ▼    ▼    ▼                                                    │
         │  ┌──────────────────────┐       ┌───────────────────────┐              │
         │  │   Winston Logger     │       │   JWT / Auth Helpers  │              │
         │  │   (src/logger.js)    │       │   (auth failure logs) │              │
         │  └──────────┬───────────┘       └───────────┬───────────┘              │
         │             │                               │                           │
         │     ┌───────┴────────┐              logger.log(...)                     │
         │     │                │                      │                           │
         │     ▼                ▼                      │                           │
         │  ┌────────┐  ┌─────────────┐                │                           │
         │  │Console │  │MySQL        │◄───────────────┘                           │
         │  │(error  │  │Transport    │                                            │
         │  │ only)  │  │(winston)    │                                            │
         │  └────────┘  └──────┬──────┘                                            │
         │                     │                                                   │
         │                     │  INSERT INTO pos_error_info                       │
         │                     ▼                                                   │
         │  ┌──────────────────────────────┐                                       │
         │  │   MySQL Database             │                                       │
         │  │   table: pos_error_info      │                                       │
         │  │   table: pos_error_list_map  │                                       │
         │  │   table: pos_developers      │                                       │
         │  └──────────────────────────────┘                                       │
         │                     ▲                                                   │
         │                     │  sync on reconnect                                │
         │  ┌──────────────────┴───────────┐                                       │
         │  │   SQLite (offline_db.sqlite) │                                       │
         │  │   table: error               │                                       │
         │  │   (fallback when MySQL down) │                                       │
         │  └──────────────────────────────┘                                       │
         │                                                                         │
         │  ┌──────────────────────────────┐                                       │
         │  │  process.on handlers         │                                       │
         │  │  - unhandledRejection        │──► logger.log(...) + console.error    │
         │  │  - uncaughtException         │                                       │
         │  └──────────────────────────────┘                                       │
         └─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `pos_error_info` (MySQL — centralized error log)

| Column | Type | Description |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primary key |
| `level` | VARCHAR | `'error'`, `'info'`, `'warn'` |
| `message` | VARCHAR | Error details: route, method, company, stack trace |
| `meta` | VARCHAR | Error category: `'ROUTE NOT FOUND'`, `'auth_failure'`, `'frontend_error'`, `'unhandledRejection'`, `'uncaughtException'`, `'verifyApiKey_error'`, `'Network-error'` |
| `company_id` | INT | Company that triggered the error |
| `company_type` | VARCHAR | Company type from JWT token |
| `exact_location` | VARCHAR | Frontend page path (from `Exactlocation` header) |
| `issueType` | VARCHAR | Issue classification |
| `timestamp` | DATETIME | When the error occurred |
| `createdBy` | INT | Employee ID who triggered the error |
| `createdAt` | DATETIME | Record creation timestamp |

### `pos_error_list_mapping` (MySQL — error assignment tracking)

| Column | Type | Description |
|---|---|---|
| `error_Id` | INT | FK to `pos_error_info.id` |
| `assigned_by` | INT | Who assigned the error |
| `assigned_to` | INT | Developer assigned to fix |
| `assigned_name` | VARCHAR | Developer name |
| `current_status` | VARCHAR | `'pending'` or `'fixed'` |

### `pos_developers` (MySQL — developer list)

| Column | Type | Description |
|---|---|---|
| `company_id` | INT | Company the developer belongs to |
| Other fields | — | Developer info for assignment dropdown |

### `error` (SQLite — local offline fallback, per microservice)

```sql
CREATE TABLE error (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message VARCHAR,
  company_id INTEGER,
  employee_id INTEGER,
  createdAt DATE DEFAULT (datetime('now','localtime'))
);
```

Each microservice maintains its own `offline_db.sqlite` file in its root directory.

---

## Backend Error Capture

### Middleware Layer

Every backend microservice registers three middleware functions in its Express app. These are defined in `src/middlewares/index.js`.

#### 1. `secErrorHandler` — Database Health Check + Slow API Detection

**When it runs:** On every incoming request (registered early in the middleware chain).

**What it does:**
- Checks if the MySQL connection state is `'disconnected'`. If so, logs to SQLite and returns 500.
- Starts a high-resolution timer (`process.hrtime`).
- On `res.finish`, if the request took **more than 2 seconds**, logs a slow-API warning to the Winston logger.

```
File: src/middlewares/index.js → secErrorHandler()
```

**Logged data for slow APIs:**
```
Route: /api/sales/invoice, Method: POST, Response: error,
Company_id: 5, Employee_name: John, Params: {}, Body: {...}
```

#### 2. `errorHandler` — Express Error Middleware

**When it runs:** When any controller or middleware calls `next(err)`.

**What it does:**
- Classifies the error by its `code` property:
  - `ETIMEDOUT` → 503
  - `ECONNREFUSED` → 502
  - `ECONNRESET` → 504
  - `EHOSTUNREACH` → 502
  - `ENETUNREACH` → 502
  - `status === 400` → 400
  - Default → 500
- Logs to Winston logger with full context: route, method, company_id, employee name, params, body, and stack trace.
- Sends JSON response (stack trace hidden in production with `ENV_MODE === 'prod'`).
- Wrapped in try-catch — if the logger itself fails, falls back to `console.error`.

```
File: src/middlewares/index.js → errorHandler()
```

#### 3. `notFound` — Unregistered Route Detection

**When it runs:** At the end of the middleware chain, if no route matched.

**What it does:**
- Checks if `req.route` is null (no route matched).
- Logs to Winston with meta `'ROUTE NOT FOUND'`.
- Returns 404 JSON response.

```
File: src/middlewares/index.js → notFound()
```

#### 4. `verifyApiKey` — API Key Validation Failures

**When it runs:** For requests using API key authentication instead of JWT.

**What it does on failure:**
- Missing key → 500 (logged)
- Invalid/expired key → 403 (logged)
- Exception in validation → 500 (logged with stack trace)

```
File: src/middlewares/index.js → verifyApiKey()
```

---

### Winston Logger

Each microservice configures a Winston logger at `src/logger.js` with two transports:

#### Console Transport (error level only)
```javascript
new winston.transports.Console({
  format: winston.format.simple(),
  level: 'error'
})
```
Acts as a fallback. If the MySQL transport fails, errors still appear in server stdout/logs.

#### MySQL Transport (custom)
```javascript
new winstonMysql(options_custom)
```
Custom transport at `lib/mysql_transport.js`. Inserts directly into `pos_error_info` table.

**Logger error handler** (in `src/middlewares/index.js`):
```javascript
logger.on('error', (err) => {
  console.error('Winston MySQL Error:', err);
});
```
Catches transport-level errors (e.g., MySQL INSERT failures) and outputs them to console so they're not silently lost.

---

### MySQL Transport

**File:** `lib/mysql_transport.js` (identical across all repos)

The custom Winston transport:
1. Creates a MySQL connection pool on initialization.
2. On each `log()` call, gets a connection from the pool.
3. Builds a log object mapping Winston fields to `pos_error_info` columns:
   - `level` → `level`
   - `meta` → `meta` (error category)
   - `message` → `message` (stringified if object)
   - `company_id` → `company_id`
   - `company_type` → `company_type`
   - `exact_location` → `exact_location`
   - `employee_id` → `createdBy`
   - Auto-generated `timestamp`
4. Executes `INSERT INTO pos_error_info SET ?`
5. Releases the connection back to the pool.

**Error handling:** If the INSERT fails, it emits an `'error'` event (caught by `logger.on('error')`) and releases the connection.

---

### SQLite Offline Fallback

**File:** `src/config/sqlite_config.js` (all backend repos)

Each microservice creates a local SQLite database (`offline_db.sqlite`) with a single `error` table. This is used when the main MySQL database is unreachable.

**When errors are written to SQLite:**
- `secErrorHandler` detects `con.state === 'disconnected'` and writes to SQLite:
  ```javascript
  sqlite_db.exec(`INSERT INTO error (id, message, company_id, employee_id)
    VALUES(null, 'database not connected', 3, 11);`)
  ```

---

### Offline-to-Online Sync

**File:** `src/config/db_connection.js` (all backend repos)

When the MySQL connection is established (on startup or reconnect):

1. Reads all rows from SQLite `error` table.
2. Bulk inserts them into MySQL `pos_error_info`.
3. Deletes all rows from SQLite `error` table.

```javascript
connection.connect(function(err) {
  if (err) return;

  sqlite_db.all('SELECT * FROM error;', (err1, res1) => {
    if (res1.length > 0) {
      const data = res1.map(i => ([
        null, i.company_id, i.company_type, i.exact_location,
        'error', i.message, i.createdAt, i.employee_id
      ]));
      connection.query(
        `INSERT INTO pos_error_info (...) VALUES ?`,
        [data],
        (e1, r1) => {
          sqlite_db.run('Delete from error;');
        }
      );
    }
  });
});
```

**This ensures:** Errors that occurred while MySQL was down are retroactively saved to the centralized database and visible in the dashboard once connectivity is restored.

---

### JWT/Auth Failure Logging

Auth failures are now logged to the error system. Previously they returned 401/403 silently with no record.

#### JWT Middleware (`src/jwt/index.js`)

All auth failure responses are logged before sending:

| Scenario | Status | Meta |
|---|---|---|
| Missing Authorization header | 401 | `auth_failure` |
| Null token | 401 | `auth_failure` |
| Expired token | 403 | `auth_failure` |
| Subscription expired (mobile) | 401 | `auth_failure` |
| Subscription expired (web) | 403 | `auth_failure` |
| Blacklisted token | 401 | `auth_failure` |
| Database error during verification | 500 | `auth_failure` |

```javascript
logger.log({
  level: 'error',
  meta: 'auth_failure',
  message: `authorization_header_missing - Route: ${req.originalUrl}`,
  company_id: req.user?.company_id || 0,
  exact_location: req.headers?.['exactlocation'] || '',
  company_type: req.user?.company_type || '',
  employee_id: req.user?.employee_id || 0
});
```

#### Auth Helpers (`src/helpers/auth.js`)

Authorization check failures (user ID mismatch, location mismatch) are logged:

| Function | Scenario | Meta |
|---|---|---|
| `getAuthUserId` | Employee ID doesn't match | `auth_failure` |
| `getAuthUserLocation` | Location not authorized | `auth_failure` |
| `getAuthBodyUserLocation` | Body location not authorized | `auth_failure` |

---

### Process-Level Error Handlers

**File:** `index.js` (all backend repos)

Two handlers catch errors that bypass Express middleware:

```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  try {
    logger.log({
      level: 'error',
      meta: 'unhandledRejection',
      message: String(reason?.stack || reason),
      company_id: 0,
      exact_location: 'process',
      company_type: '',
      employee_id: 0
    });
  } catch (e) { console.error('Logger failed for unhandledRejection:', e); }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  try {
    logger.log({
      level: 'error',
      meta: 'uncaughtException',
      message: String(err?.stack || err),
      company_id: 0,
      exact_location: 'process',
      company_type: '',
      employee_id: 0
    });
  } catch (e) { console.error('Logger failed for uncaughtException:', e); }
});
```

**What these catch:**
- Promises that reject without a `.catch()` handler
- Synchronous exceptions that escape all try-catch blocks
- Timer callbacks (`setTimeout`, `setInterval`) that throw

---

## Gateway Error Capture

**File:** `/Users/venkat/Apps/tzk-gate-way/index.js`

The API Gateway (port 4000) routes requests to backend microservices via `http-proxy-middleware`. It has no database connection, so errors are logged to console only.

### Proxy Error Handler

Catches errors when a backend service is unreachable (connection refused, timeout, etc.):

```javascript
createProxyMiddleware({
  changeOrigin: true,
  router: (req) => { /* ... */ },
  on: {
    error: (err, req, res) => {
      const serviceName = req.url.split("/")[1] || "unknown";
      console.error(`[Gateway Proxy Error] Service: ${serviceName}, Route: ${req.originalUrl}, Error: ${err.message}`);
      if (!res.headersSent) {
        res.status(502).json({ error: "Service unavailable", message: err.message, service: serviceName });
      }
    }
  }
})
```

### Express Error Handler

Catches any errors that propagate through the Express stack:

```javascript
app.use((err, req, res, next) => {
  const serviceName = req.url.split("/")[1] || "unknown";
  console.error(`[Gateway Error] Service: ${serviceName}, Route: ${req.originalUrl}, Method: ${req.method}, Error: ${err.message}`);
  if (!res.headersSent) {
    res.status(502).json({ error: "Gateway error", message: err.message, service: serviceName });
  }
});
```

### Process-Level Handlers

```javascript
process.on("unhandledRejection", (reason) => {
  console.error("[Gateway] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[Gateway] Uncaught Exception:", err);
});
```

---

## Frontend Error Capture

### React Error Boundary

**File:** `src/@crema/core/AppErrorBoundary/index.js`

Wraps the entire app. When any React component throws during render:

1. `getDerivedStateFromError` — Sets error state, shows error UI.
2. `componentDidCatch` — Reports the error to the backend:
   ```javascript
   componentDidCatch(error, errorInfo) {
     if (isRecoverableDynamicImportError(error)) {
       reloadOnceForDynamicImportError();
     }
     reportFrontendError(error, errorInfo?.componentStack);
   }
   ```

### Error Reporter Utility

**File:** `src/utils/errorReporter.js`

```javascript
export function reportFrontendError(error, componentStack) {
  try {
    const loginData = JSON.parse(sessionStorage.getItem('login') || '{}');
    if (!loginData?.accessToken) return; // not logged in, skip

    const errorData = {
      level: 'error',
      meta: 'frontend_error',
      message: `${error?.message || String(error)} | Page: ${window.location.pathname}${componentStack ? ' | Stack: ' + componentStack.slice(0, 500) : ''}`,
      exact_location: window.location.pathname,
      company_type: loginData?.company_type || '',
    };

    http.post('/errorDashboard/createlog', errorData).catch(() => {});
  } catch (e) {
    // Silently fail — error reporting should never break the app
  }
}
```

**Key behaviors:**
- Only reports if user is logged in (has `accessToken` in sessionStorage).
- Silently fails if the API call fails — error reporting never breaks the app.
- Includes the component stack trace (truncated to 500 chars).
- Posts to `POST /errorDashboard/createlog` → inserts into `pos_error_info` with `meta: 'frontend_error'`.

### Axios Interceptor (Network Errors)

**File:** `src/http-common.js` — Response interceptor

Captures API call failures:

1. **Network errors** (`error.message === 'Network Error'`) and other non-filtered errors are stored in PouchDB (IndexedDB).
2. **Bot/scanner routes** are filtered out (`.env`, `/admin`, `phpunit`, etc.).
3. **Auth errors** trigger session cleanup and redirect to `/signin`.
4. **Token expiration** triggers automatic token refresh via `/renewAccessToken`.

```javascript
instance.interceptors.response.use(
  (response) => { /* success: sync PouchDB errors to backend */ },
  (error) => {
    // Store error in PouchDB
    db.put({
      _id: new Date().toISOString(),
      timestamp: moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'),
      message: `${routePath} | ${error.message}`,
      company_type
    });
    // ... handle auth errors, token refresh
  }
);
```

### PouchDB Offline Queue

**File:** `src/http-common.js`

Errors stored in PouchDB are synced to the backend on the next successful API response:

1. On successful response, checks if there are pending errors in PouchDB.
2. Deduplicates by message.
3. Posts to `POST /errorDashboard/insertError` with the error batch.
4. Deletes synced errors from PouchDB.
5. Rate-limited to once per 60 seconds (`POUCHDB_SYNC_INTERVAL`).

```javascript
instance.interceptors.response.use(
  (response) => {
    const now = Date.now();
    if (!handlingPouchDb && now - lastPouchDbSync >= POUCHDB_SYNC_INTERVAL) {
      handlingPouchDb = true;
      lastPouchDbSync = now;
      db.allDocs({ include_docs: true })
        .then(allDocs => {
          const data = allDocs.rows.map(i => ({
            message: i.doc.message,
            timestamp: i.doc.timestamp,
            company_type: i.doc.company_type
          }));
          const payload = [...new Map(data.map(item => [item.message, item])).values()];
          if (payload.length > 0) {
            instance.post('/errorDashboard/insertError', payload);
          }
          return allDocs.rows.map(row => ({ _id: row.id, _rev: row.doc._rev, _deleted: true }));
        })
        .then(deleteDocs => db.bulkDocs(deleteDocs))
        .finally(() => { handlingPouchDb = false; });
    }
    return response;
  }
);
```

---

## Error Dashboard (UI)

### Dashboard Features

**Route:** `/common/ErrorList`
**Component:** `src/pages/common/ErrorDashboardUsers/index.js`

The dashboard provides:
- **Error list** with pagination — grouped by message, showing occurrence count
- **Priority badges** — Highest, High, Medium, Low (auto-calculated)
- **Company name** — decrypted from RSA-encrypted company data
- **Developer assignment** — assign errors to developers, track status
- **Status management** — mark errors as pending or fixed
- **Email reporting** — send error details via email to support@tazk.in
- **Error query** — filter by employee, date range

### API Endpoints

**Base route:** `POST /comservice/api/errorDashboard` (through gateway)

| Endpoint | Method | Description |
|---|---|---|
| `/` | POST | Fetch error dashboard list with pagination. Returns `{data, numRows, pendingCount, fixedCount}` |
| `/developerDetails` | GET | Get list of developers for assignment dropdown |
| `/assignError` | POST | Assign error(s) to a developer. Body: `{errorId, assignee, assignedBy, assigned_name}` |
| `/removeAssig` | POST | Remove developer assignment. Body: `{id}` |
| `/statusChange` | POST | Update error status. Body: `{error_status, id}` |
| `/insertError` | POST | Bulk insert network errors (from PouchDB sync). Body: `[{timestamp, message, company_type}]` |
| `/createlog` | POST | Insert single error log (from frontend error boundary). Body: `{level, meta, message, exact_location, company_type}` |
| `/queryError` | POST | Query errors with filters. Body: `{createdBy, date_time_from, date_time_to}` |
| `/sendMail` | POST | Send error report via email. Body: `{type, content, subject}` |

### Redux State

**Actions:** `src/redux/actions/errorDashboard_actions.js`
**Reducer:** `src/redux/reducers/errorDashboard_reducers.js`

```javascript
{
  error_dashboard_list: [],              // Array of error objects
  error_dashboard_list_count: 0,         // Total error count
  error_dashboard_list_pendingCount: 0,  // Errors not yet fixed
  error_dashboard_list_fixedCount: 0,    // Errors marked as fixed
  developers_details: []                 // Available developers for assignment
}
```

### Priority Calculation

Priority is calculated in the SQL query based on occurrence count and error type:

| Condition | Priority |
|---|---|
| Occurred once | Low |
| Network-error/ROUTE NOT FOUND, >5 occurrences | Highest |
| Network-error/ROUTE NOT FOUND, 3-5 occurrences | High |
| Network-error/ROUTE NOT FOUND, 2 occurrences | Medium |
| Other errors, >5 occurrences | Highest |
| Other errors, 3-5 occurrences | High |
| Other errors, 2 occurrences | Medium |

---

## Repos and File Locations

### Backend Repos (all follow the same pattern)

| Repo | Port | Files |
|---|---|---|
| tzk-userauth | 4002 | `src/logger.js`, `src/middlewares/index.js`, `src/jwt/index.js`, `src/config/sqlite_config.js`, `src/config/db_connection.js`, `lib/mysql_transport.js` |
| tzk-payroll | 4003 | Same as above + `src/helpers/auth.js` |
| tzk-com-services | 4004 | Same + `src/api/error_dashboard/*` (dashboard API) |
| tzk-accounts | 4005 | Same pattern |
| tzk-sales | 4006 | Same pattern |
| tzk-products | 4007 | Same pattern |
| tzk-reports | 4008 | Same pattern (no `helpers/auth.js`) |
| tzk-superadmin | 4009 | Same pattern (no `helpers/auth.js`, no `jwt/index.js`) |
| tzk-leads | 4011 | Same pattern (no `helpers/auth.js`) |
| tzk-assets | 4012 | Same pattern |
| tzk-projects | 4013 | Same pattern |

### Gateway

| Repo | Port | Files |
|---|---|---|
| tzk-gate-way | 4000 | `index.js` (all-in-one, console logging only) |

### Frontend

| Repo | Files |
|---|---|
| tzk-tazk-ui | `src/@crema/core/AppErrorBoundary/index.js`, `src/utils/errorReporter.js`, `src/http-common.js`, `src/services/errorDashboard_services.js`, `src/redux/actions/errorDashboard_actions.js`, `src/redux/reducers/errorDashboard_reducers.js`, `src/pages/common/ErrorDashboardUsers/index.js` |

---

## Error Flow Examples

### Example 1: Controller throws an error

```
1. User hits POST /salesservice/api/sales/invoice
2. Controller throws: TypeError: Cannot read property 'id' of undefined
3. Express catches it → errorHandler middleware runs
4. errorHandler logs:
   - Winston Console: prints error to stdout
   - Winston MySQL: INSERT INTO pos_error_info
     {
       level: 'error',
       meta: 'error',
       message: 'Route: /salesservice/api/sales/invoice, Method: POST, Status: 500, ... STACK: TypeError...',
       company_id: 5,
       company_type: 2,
       exact_location: '/sales/invoice',
       createdBy: 42
     }
5. errorHandler sends 500 JSON response to client
6. Error appears in dashboard at /common/ErrorList
```

### Example 2: Unauthorized access attempt

```
1. Request hits /accountsservice/api/expenses without Authorization header
2. verifyAccessToken in src/jwt/index.js detects missing header
3. Logs: { meta: 'auth_failure', message: 'authorization_header_missing - Route: /accountsservice/api/expenses' }
4. Returns 401: { message: 'authorization_header_missing' }
5. Error appears in dashboard with meta = 'auth_failure'
```

### Example 3: Frontend React component crashes

```
1. User navigates to /sales/invoice
2. InvoiceDialog component throws during render
3. AppErrorBoundary catches the error
4. componentDidCatch runs:
   a. Checks if it's a dynamic import error (for auto-reload)
   b. Calls reportFrontendError(error, componentStack)
5. reportFrontendError:
   a. Reads login data from sessionStorage
   b. POSTs to /errorDashboard/createlog:
      { meta: 'frontend_error', message: 'TypeError: x is not a function | Page: /sales/invoice | Stack: ...', exact_location: '/sales/invoice' }
6. Error appears in dashboard with meta = 'frontend_error'
7. User sees "Ah! Something went wrong." UI with Close button
```

### Example 4: Network outage

```
1. User's browser loses internet connection
2. API call to /salesservice/api/sales fails with Network Error
3. Axios response interceptor catches the error
4. Error is stored in PouchDB (IndexedDB): { message: '/salesservice/api/sales | Network Error', timestamp: '...' }
5. Internet comes back, user makes another API call
6. Axios response interceptor (success path) syncs PouchDB:
   a. Reads all errors from PouchDB
   b. Deduplicates by message
   c. POSTs batch to /errorDashboard/insertError
   d. Clears PouchDB
7. Errors appear in dashboard with issueType = 'Network-error'
```

### Example 5: MySQL database goes down

```
1. MySQL connection drops
2. secErrorHandler detects con.state === 'disconnected'
3. Error is written to SQLite: INSERT INTO error (message, company_id, employee_id)
4. Returns 500: { ERROR: 'Cannot establish connection with Database' }
5. MySQL comes back online, db_connection.js reconnects
6. On connect callback:
   a. Reads all rows from SQLite error table
   b. Bulk inserts into MySQL pos_error_info
   c. Deletes all rows from SQLite error table
7. Previously offline errors now visible in dashboard
```

### Example 6: Unhandled Promise rejection

```
1. Some async code in a controller rejects without a .catch()
2. process.on('unhandledRejection') handler fires
3. Logs to console.error AND to Winston logger:
   { meta: 'unhandledRejection', message: 'Error: some async error\n  at ...', company_id: 0 }
4. Process stays alive (does not crash)
5. Error appears in dashboard with meta = 'unhandledRejection'
```

### Example 7: Backend service unreachable (Gateway)

```
1. Request comes to gateway: GET /salesservice/api/sales
2. Gateway tries to proxy to http://localhost:4006
3. Sales service is down → ECONNREFUSED
4. Proxy onError handler fires:
   console.error: [Gateway Proxy Error] Service: salesservice, Route: /salesservice/api/sales, Error: connect ECONNREFUSED
5. Returns 502: { error: 'Service unavailable', message: 'connect ECONNREFUSED', service: 'salesservice' }
6. Error is logged to gateway console (no DB in gateway)
```

---

## Known Limitations

1. **Gateway errors are console-only** — The gateway has no database connection, so errors are logged to stdout only. To persist these, you would need to either add a logger or forward errors to a backend service.

2. **Frontend errors require login** — The error reporter checks for `accessToken` in sessionStorage. Errors that occur before login (on the signin page, during initial load) are not reported to the backend.

3. **PouchDB sync is rate-limited** — Network errors are synced to the backend at most once every 60 seconds. If the browser tab is closed before sync, errors in PouchDB persist in IndexedDB and will sync on next session.

4. **No log rotation** — The `pos_error_info` table can grow unbounded. There is no automated cleanup or archival. Consider adding a scheduled job to delete or archive errors older than N days.

5. **No real-time alerting** — Errors are stored and viewable in the dashboard, but there is no automatic notification (Slack, email, SMS) when critical errors occur. The `sendMail` endpoint exists but is manual.

6. **Company ID = 0 for process-level errors** — `unhandledRejection` and `uncaughtException` errors don't have request context, so `company_id` is logged as 0. These errors can't be filtered by company in the dashboard.

---

*Last updated: 2026-03-14*
