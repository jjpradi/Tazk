# Security Fixes - Changes Log

**Date:** 2026-03-14
**Branch:** uvdev3
**Scope:** All microservices (tzk-userauth, tzk-com-services, tzk-sales, tzk-reports, tzk-products, tzk-accounts, tzk-payroll, tzk-gate-way, tzk-tazk-ui, tzk-assets, tzk-leads, tzk-projects)

---

## Fix 1: Remove Password from sessionStorage

**Risk:** Critical — plaintext password stored client-side
**Files Changed:**
- `tzk-tazk-ui/src/pages/common/auth/Signin/SigninFirebase.js` — Removed `password` from `normalizedLoginData` object stored in sessionStorage
- `tzk-tazk-ui/src/@crema/core/AppLocations/index.js` — Removed `password: storage.password` from `handleSwitch` formdata

**Note:** The company-switch flow in `AppLocations` previously re-sent the password for re-authentication. After this fix, the password field is no longer available. Backend may need a token-based company-switch endpoint in the future.

---

## Fix 2: JWT Secrets Externalized to Environment Variables

**Risk:** Critical — hardcoded secrets in source code
**Files Changed (7 services):**
- `tzk-userauth/src/config/db_config.js`
- `tzk-com-services/src/config/db_config.js`
- `tzk-sales/src/config/db_config.js`
- `tzk-reports/src/config/db_config.js`
- `tzk-products/src/config/db_config.js`
- `tzk-accounts/src/config/db_config.js`
- `tzk-payroll/src/config/db_config.js`
- `tzk-userauth/src/api/user/user.controller.js` — Replaced hardcoded `'change_me_super_secret'` in `partnerLogin` with `access_token_secret` from config

**How it works:** Each service reads `process.env.ACCESS_TOKEN_SECRET` and `process.env.REFRESH_TOKEN_SECRET`, falling back to `config.json` values if env vars are not set. This allows production deployments to inject secrets via environment without breaking existing dev setups.

---

## Fix 3: Database-Level Account Lockout

**Risk:** High — no brute-force protection
**Files Changed:**
- `tzk-userauth/src/api/user/user.sql.js` — Added 4 queries: `check_account_lockout`, `increment_failed_attempts`, `lock_account`, `reset_failed_attempts`
- `tzk-userauth/src/api/user/user.model.js` — Added 5 static methods: `checkAccountLockout`, `checkAccountLockoutPromise`, `incrementFailedAttempts`, `lockAccount`, `resetFailedAttempts`
- `tzk-userauth/src/api/user/user.controller.js` — Integrated lockout flow into `getLogin`: checks lockout before auth, increments on failure, locks after 5 attempts (30-min lockout), resets on success. Removed in-memory `loginAttempts` map.

**DB Migration Required:**
```sql
ALTER TABLE pos_employees ADD COLUMN failed_login_attempts INT DEFAULT 0;
ALTER TABLE pos_employees ADD COLUMN locked_until DATETIME NULL;
```

---

## Fix 4: Token Expiry Reduced

**Risk:** High — tokens valid for excessively long periods
**Files Changed:**
- `tzk-userauth/src/jwt/index.js`
  - Access token: `24h` → `4h`
  - GR access token: `2d` → `4h`
  - GR refresh token: `100d` → `30d`
  - GR refresh token (promise): `100d` → `30d`

---

## Fix 5: CORS Whitelist

**Risk:** High — `origin: '*'` allowed any domain
**Files Changed (6 services):**
- `tzk-userauth/app.js`
- `tzk-com-services/app.js`
- `tzk-sales/app.js`
- `tzk-reports/app.js`
- `tzk-products/app.js`
- `tzk-accounts/app.js`

**Skipped:** `tzk-payroll` — already had CORS whitelist implementation

**How it works:** Reads `process.env.CORS_ALLOWED_ORIGINS` as comma-separated list. If set, only those origins are allowed. If empty/unset, falls back to `origin: true` (allow all) for backward compatibility during rollout.

---

## Fix 6: Login Rate Limiting

**Risk:** High — no rate limiting on auth endpoints
**Files Changed:**
- `tzk-userauth/src/api/user/user.routes.js` — Added `loginLimiter` (10 requests per 15 minutes) to `/login`, `/verifyOtp`, `/resendOtp` routes
- `tzk-userauth/src/api/forget_password/forget_password.routes.js` — Added `passwordResetLimiter` (10 requests per 15 minutes) to `/sendMail`, `/verifyOtp`, `/updatePassword` routes

**Dependency:** `express-rate-limit` (already installed in tzk-userauth)

---

## Fix 7: Secure OTP Generation + Expiry

**Risk:** High — predictable OTPs, no expiry
**Files Changed:**
- `tzk-userauth/src/api/user/user.model.js` — Replaced 4 instances of `Math.floor(100000 + Math.random() * 900000)` with `crypto.randomInt(100000, 999999)`. Added OTP clearing after successful multi-factor verification.
- `tzk-userauth/src/api/user/user.sql.js` — Added `otp_created_at = NOW()` to OTP insert/update queries. Added 5-minute expiry check (`otp_created_at >= NOW() - INTERVAL 5 MINUTE`) to OTP verification queries. Added `clearAuthOtpSql` query.
- `tzk-userauth/src/api/forget_password/forget_password.model.js` — Replaced `Math.random()` with `crypto.randomInt()`
- `tzk-userauth/src/api/forget_password/forget_password.sql.js` — Added `otp_created_at` tracking and 5-minute expiry check to verification queries. Added `clearOtpSql` for cleanup after use.

**DB Migration Required:**
```sql
ALTER TABLE pos_people ADD COLUMN otp_created_at DATETIME NULL DEFAULT NULL;
```

---

## Fix 8: Disable multipleStatements in MySQL

**Risk:** High — SQL injection vector
**Files Changed (27 files across 9 services):**

| Service | Files |
|---------|-------|
| tzk-userauth | `src/config/db_config.js` |
| tzk-com-services | `src/config/db_config.js`, `src/helpers/db_connection.js`, `src/helpers/db_encrypt_connection.js` |
| tzk-sales | `src/config/db_config.js`, `src/helpers/db_connection.js`, `src/helpers/db_encrypt_connection.js` |
| tzk-products | `src/config/db_config.js`, `src/helpers/db_connection.js`, `src/helpers/db_encrypt_connection.js` |
| tzk-accounts | `src/config/db_config.js`, `src/helpers/db_connection.js`, `src/helpers/db_encrypt_connection.js` |
| tzk-reports | `src/config/db_config.js`, `src/helpers/db_connection.js`, `src/helpers/db_encrypt_connection.js` |
| tzk-assets | `src/config/db_config.js`, `src/helpers/db_connection.js`, `src/helpers/db_encrypt_connection.js` |
| tzk-projects | `src/config/db_config.js`, `src/helpers/db_connection.js`, `src/helpers/db_encrypt_connection.js` |
| tzk-superadmin | `src/config/db_config.js`, `src/helpers/db_connection.js`, `src/helpers/db_encrypt_connection.js` |

**Skipped:**
- `tzk-payroll` — Uses `CALL ProcessShiftBreaks(@msg); SELECT @msg` (stored procedure with multi-statement)
- `tzk-leads` — Uses `SET SESSION group_concat_max_len` (multi-statement required)

---

## Fix 9: Gateway Security Hardening

**Risk:** High — no security headers, no rate limiting at gateway
**Files Changed:**
- `tzk-gate-way/index.js` — Added `helmet()` middleware, CORS whitelist (same pattern as services), rate limiter (200 requests/minute per IP)
- `tzk-gate-way/package.json` — Added `helmet` and `express-rate-limit` dependencies

---

## Fix 10: Password Masking in Logs

**Risk:** Medium — passwords logged in plaintext via request logging middleware
**Files Changed (7 services):**
- `tzk-userauth/src/middlewares/index.js`
- `tzk-com-services/src/middlewares/index.js`
- `tzk-sales/src/middlewares/index.js`
- `tzk-reports/src/middlewares/index.js`
- `tzk-products/src/middlewares/index.js`
- `tzk-accounts/src/middlewares/index.js`
- `tzk-payroll/src/middlewares/index.js`

**Masked fields:** `password`, `oldPassword`, `newPassword`, `otp`, `authenticationOTP`, `forgetOTP`, `accessToken`, `refreshToken`

**How it works:** A `maskSensitiveFields()` function creates a shallow copy of `req.body` and replaces sensitive field values with `'***'` before logging.

---

## Required DB Migrations (Run Before Deployment)

```sql
-- Fix 3: Account lockout columns
ALTER TABLE pos_employees ADD COLUMN failed_login_attempts INT DEFAULT 0;
ALTER TABLE pos_employees ADD COLUMN locked_until DATETIME NULL;

-- Fix 7: OTP expiry tracking
ALTER TABLE pos_people ADD COLUMN otp_created_at DATETIME NULL DEFAULT NULL;
```

---

## Required Environment Variables (Production)

| Variable | Used By | Description |
|----------|---------|-------------|
| `ACCESS_TOKEN_SECRET` | All 7 services | JWT access token signing secret |
| `REFRESH_TOKEN_SECRET` | All 7 services | JWT refresh token signing secret |
| `CORS_ALLOWED_ORIGINS` | 6 services + gateway | Comma-separated allowed origins (e.g., `https://app.example.com,https://admin.example.com`) |

---

## Testing Checklist

- [ ] Login flow works (email + password)
- [ ] OTP verification works within 5-minute window
- [ ] OTP is rejected after 5 minutes
- [ ] Account locks after 5 failed attempts
- [ ] Account unlocks after 30 minutes
- [ ] Company switching works without password in sessionStorage
- [ ] Token refresh works with 30-day refresh token
- [ ] Access token expires after 4 hours
- [ ] CORS blocks unauthorized origins (when env var is set)
- [ ] Rate limiting returns 429 after 10 rapid login attempts
- [ ] All reports load correctly
- [ ] Gateway helmet headers present in responses
- [ ] Logs do not contain plaintext passwords
- [ ] No SQL errors from services with multipleStatements disabled
- [ ] Toast notifications render safely (no script execution in HTML body)
- [ ] Template preview renders safely with sanitized HTML

---

## Fix 11: XSS Prevention — Sanitize dangerouslySetInnerHTML

**Risk:** Critical — arbitrary JavaScript execution via unsanitized HTML
**Files Changed:**
- `tzk-tazk-ui/src/@crema/core/AppContentView/index.js` — Added `DOMPurify.sanitize(body)` to toast notification HTML rendering
- `tzk-tazk-ui/src/pages/common/docTemplates/TemplateEditor.js` — Added `DOMPurify.sanitize(previewHtml)` to template preview rendering

**How it works:** All `dangerouslySetInnerHTML` usages that render dynamic content are now wrapped with `DOMPurify.sanitize()`, which strips `<script>` tags, event handlers (`onerror`, `onclick`, etc.), and other XSS vectors while preserving safe HTML formatting. DOMPurify was already installed in the project.

---

## Fix 12: Remove Password from URL Query Parameters

**Risk:** High — passwords in URLs are logged in browser history, proxy logs, server access logs, and Referer headers
**Files Changed:**
- `tzk-tazk-ui/src/pages/common/auth/Signin/SigninFirebase.js` — Removed `urlParams.get('password')` and `urlParams.get('username')` reads. Added `useEffect` that strips `password` and `username` params from the URL on mount using `window.history.replaceState()`, preventing them from persisting in browser history.

**Notes:** The URL-based username/password login (`initialSubscriptionLoginPage`) was dead code — defined but never used in the component. The secure token-based auto-login flow (`token`, `sig`, `ts` params at lines 138-169) already handles this use case properly and cleans up the URL after use.

---

## Fix 13: Gateway Request Size Limit

**Risk:** High — no request size limits allows oversized payloads / DoS
**Files Changed:**
- ~~`tzk-gate-way/index.js` — Added `express.json({ limit: '10mb' })` and `express.urlencoded({ extended: true, limit: '10mb' })` middleware~~

**REVERTED:** `express.json()` / `express.urlencoded()` in a reverse proxy consumes the request body stream before `http-proxy-middleware` can forward it, causing requests to hang or arrive empty at backend services. Removed from gateway — request size limits are enforced by each backend service's own body parser instead.

---

## Fix 14: Auto-Login Token Hardening

**Risk:** High — auto-login tokens had too-wide time window and were not cleaned up
**Files Changed:**
- `tzk-userauth/src/api/user/user.controller.js` — Tightened timestamp window from 30s to 15s. Changed token invalidation from `UPDATE used=1` to `DELETE` (hard-delete after use). Added cleanup of expired/used tokens on each auto-login attempt.
- `tzk-com-services/src/api/company/company.controller.js` — Matched token creation expiry to 15 seconds (from 30s)

---

## Fix 15: Remove Credential-Leaking Console.logs

**Risk:** High — console.log in production leaks credentials, tokens, and API responses to browser DevTools
**Files Changed:**
- `tzk-tazk-ui/src/pages/common/auth/Signin/SigninFirebase.js` — Removed 7 console.logs that exposed formdata (username/password), loginApi responses, tokens, and debug noise
- `tzk-tazk-ui/src/pages/common/login/index.js` — Removed 2 console.logs (debug noise and error leak)
- `tzk-tazk-ui/src/pages/common/CompanyInfo/CompanyInfo.js` — Removed console.log exposing loginApi response and formdata with credentials
- `tzk-tazk-ui/src/@crema/core/AppLocations/index.js` — Removed console.log exposing loginApi response data

**Note:** `CompanyInfo.js` also contains a hardcoded password (`admin@123`) at line 2000 used for admin auto-login during company switching. This is a separate architectural issue that requires backend changes to eliminate.

---

## Fix 16: Move Socket.IO Token from Query to Auth (MED-02)

**Risk:** Medium — token in query params is logged in server logs, browser history, and proxy logs
**Files Changed:**
- `tzk-tazk-ui/src/utils/socketManager.js` — Changed `query: { Authorization: accessToken }` to `auth: { Authorization: accessToken }`. Socket.IO `auth` option sends credentials in the handshake body, not URL params.
- `tzk-com-services/src/socket/socketAuth.js` — Updated to read from `socket.handshake.auth.Authorization` first, falling back to `socket.handshake.query.Authorization` for backward compatibility.

---

## Fix 17: Prevent User Enumeration in Forgot Password (MED-03)

**Risk:** Medium — different error messages reveal whether a username exists
**Files Changed:**
- `tzk-userauth/src/api/forget_password/forget_password.model.js` — Unified both "not found" and "mail not found" responses to the same message: `"If this account exists, a reset link has been sent"`. Attacker can no longer distinguish valid vs invalid usernames.

---

## Fix 18: Enforce JWT Algorithm HS256 (MED-04)

**Risk:** Medium — without algorithm enforcement, attackers can exploit algorithm substitution (e.g., "none" algorithm)
**Files Changed (all 10 services):**
- `tzk-userauth/src/jwt/index.js` — Added `{ algorithms: ['HS256'] }` to all 4 `jwt.verify()` calls
- `tzk-com-services/src/jwt/index.js` — Added to all 4 `jwt.verify()` calls
- `tzk-com-services/src/socket/socketAuth.js` — Added to socket auth verify
- `tzk-sales/src/jwt/index.js` — Added to all `jwt.verify()` calls
- `tzk-products/src/jwt/index.js` — Added to all `jwt.verify()` calls
- `tzk-accounts/src/jwt/index.js` — Added to all `jwt.verify()` calls
- `tzk-reports/src/jwt/index.js` — Added to all `jwt.verify()` calls
- `tzk-payroll/src/jwt/index.js` — Added to all `jwt.verify()` calls
- `tzk-leads/src/jwt/index.js` — Added to all `jwt.verify()` calls
- `tzk-assets/src/jwt/index.js` — Added to all `jwt.verify()` calls
- `tzk-projects/src/jwt/index.js` — Added to all `jwt.verify()` calls

---

## Fix 19: Token Blacklist Stores Hash Instead of Full JWT (MED-06)

**Risk:** Medium — storing full JWT strings means a DB breach exposes all tokens
**Files Changed:**
- `tzk-userauth/src/api/logout/logout.model.js` — Hashes token with SHA-256 before inserting into `access_token_blacklist`
- `tzk-userauth/src/jwt/index.js` — Hashes token before querying blacklist
- `tzk-com-services/src/jwt/index.js` — Hashes token before querying blacklist
- All 8 other service jwt/index.js files — Same hashToken change for blacklist queries

**How it works:** `crypto.createHash('sha256').update(token).digest('hex')` produces a fixed-length hash. The blacklist stores and queries by hash, so even if the DB is compromised, the actual JWT tokens cannot be recovered.

**DB Migration:** After deploying, truncate the old blacklist table since existing entries store full tokens:
```sql
TRUNCATE TABLE access_token_blacklist;
```

---

## Fix 20: Token Refresh Race Condition (MED-07)

**Risk:** Medium — rejected refresh promise was never cleared, causing cascading failures
**Files Changed:**
- `tzk-tazk-ui/src/http-common.js` — Moved `refreshTokenPromise = null` from `.then()` to `.finally()`, ensuring the promise is cleared on both success AND error. This prevents a rejected promise from being reused by subsequent requests.

---

## Fix MED-01 & MED-05: Documented (No Code Change)

- **MED-01 (CSRF):** Already mitigated — the app uses Bearer token auth exclusively (no cookies for auth). CSRF attacks only work when browsers auto-attach credentials (cookies). Bearer tokens in `Authorization` header are not auto-attached by browsers.
- **MED-05 (Admin bypass):** This is an **intentional business feature** — Administrators on WEB bypass subscription expiry checks. Added documentation comment in code.

---

## Fix 21: Tenant Isolation — Enforce JWT company_id

**Risk:** Critical — endpoints trusting `req.body.company_id` over JWT allows cross-tenant data access
**Changes:**

**A) Unprotected routes secured (tzk-com-services):**
- `tzk-com-services/src/api/company/company.routes.js` — Added `JWT.verifyAccessToken` middleware to `/updateDefault` and `/multitypes` routes that were previously unprotected

**B) Tenant guard in verifyAccessToken (all 10 services):**
- `tzk-userauth/src/jwt/index.js`
- `tzk-com-services/src/jwt/index.js`
- `tzk-sales/src/jwt/index.js`
- `tzk-products/src/jwt/index.js`
- `tzk-accounts/src/jwt/index.js`
- `tzk-reports/src/jwt/index.js`
- `tzk-payroll/src/jwt/index.js`
- `tzk-assets/src/jwt/index.js`
- `tzk-leads/src/jwt/index.js`
- `tzk-projects/src/jwt/index.js`

**How it works:** After JWT verification succeeds and `req.user` is set, the guard automatically overwrites `req.body.company_id` and `req.query.company_id` with the value from the JWT token (`req.user.company_id`). This runs inside `verifyAccessToken`, so every authenticated route automatically gets tenant isolation — no individual endpoint changes needed.

```javascript
if (user.company_id) {
  if (req.body && req.body.company_id !== undefined) req.body.company_id = user.company_id;
  if (req.query && req.query.company_id !== undefined) req.query.company_id = String(user.company_id);
}
```

**Design:** The guard only overwrites when the client sends a `company_id` (checked with `!== undefined`), so endpoints that don't use company_id are unaffected. It preserves the JWT value as the source of truth for multi-tenant queries.

---

## Fix 22: Logout Flow — Blacklist Perf, Logout All Devices, Hard-Delete Refresh Tokens, Frontend Verification

**Risk:** Medium — token remains valid after logout; no multi-device logout; refresh token data leaks; frontend clears prematurely

**A) Blacklist performance + cleanup:**
- `tzk-userauth/src/api/logout/logout.sql.js` — Added `cleanup_expired_blacklist` query that removes blacklist entries older than 25 hours (access tokens expire in 4h, so 25h is generous). This runs on every logout to keep the table small.
- `tzk-userauth/src/services/events/delete_expired_refresh_token.sql` — Updated MySQL scheduled event to also clean up expired blacklist entries alongside expired refresh tokens.

**DB migration required:**
```sql
-- Add index on access_token_blacklist for faster lookups
ALTER TABLE access_token_blacklist ADD INDEX idx_access_token (access_token);
-- Add index on created_at for cleanup queries
ALTER TABLE access_token_blacklist ADD INDEX idx_created_at (created_at);
-- Add employee_id column to pos_refreshtokens if not present (needed for logout-all)
-- ALTER TABLE pos_refreshtokens ADD COLUMN employee_id INT DEFAULT NULL;
-- ALTER TABLE pos_refreshtokens ADD INDEX idx_employee_id (employee_id);
```

**B) Logout all devices — new endpoint:**
- `tzk-userauth/src/api/logout/logout.routes.js` — Added `POST /logoutAll` route protected by `JWT.verifyAccessToken`
- `tzk-userauth/src/api/logout/logout.controller.js` — Added `logoutAll` handler with transaction
- `tzk-userauth/src/api/logout/logout.model.js` — Added `logoutAll()` static method that deletes all web tokens + refresh tokens for the employee
- `tzk-tazk-ui/src/services/login_services.js` — Added `logoutAll()` frontend service method

**C) Refresh token hard-delete (replaces soft-delete):**
- `tzk-userauth/src/api/user/user.sql.js` — Changed `delete_refresh_token` from `UPDATE SET isDeleted=1` to `DELETE FROM`. Changed `find_refresh_token` to remove `isDeleted=0` filter (hard-deleted rows won't exist).
- `tzk-userauth/src/api/logout/logout.model.js` — Logout now also hard-deletes all refresh tokens for the employee
- `tzk-userauth/src/services/events/delete_expired_refresh_token.sql` — Changed from soft-delete to hard-delete in scheduled event

**D) Frontend — verify server logout before clearing client state:**
- `tzk-tazk-ui/src/@crema/services/auth/firebase/FirebaseAuthProvider.js` — Restructured `logout()`: only clears sessionStorage, Redux store, and sockets *after* server returns 200. On error, still clears client state (user shouldn't be stuck), but the distinction ensures the access token gets blacklisted server-side before the client forgets it.
- `tzk-tazk-ui/src/components/Layout/Header.js` — Header's logout was skipping the server call entirely (just clearing sessionStorage). Now calls `login_services.logout()` first to blacklist the access token server-side, then clears client state.
- `tzk-tazk-ui/src/@crema/core/AppLayout/components/UserInfo/index.js` — Removed redundant `socketManager.disconnectAll()` setTimeout (already handled inside `logout()`) and removed `console.log("LLLOGOUTT")`
- `tzk-tazk-ui/src/services/login_services.js` — Removed leftover `console.log('settttttlogin')`

**Existing functionality preserved:**
- Regular logout flow unchanged — same endpoint, same request body
- Token blacklist check in `verifyAccessToken` unchanged — periodic cleanup just keeps the table smaller
- Refresh token renewal flow works the same — `find_refresh_token` query still returns valid tokens (hard-deleted rows simply won't exist)
- Frontend fallback: if server logout fails, client still clears state and redirects to signin

---

## Fix 23: Comprehensive Login Audit Logging & Monitoring

**Risk:** High — no audit trail for security events, no IP tracking, no anomaly detection

**DB migration required:**
```sql
CREATE TABLE login_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL DEFAULT 0,
    employee_id INT,
    username VARCHAR(255) NOT NULL DEFAULT '',
    ip_address VARCHAR(45) NOT NULL DEFAULT '',
    user_agent TEXT,
    login_type ENUM('WEB', 'MOBILE', 'AUTO_LOGIN', 'API') NOT NULL DEFAULT 'WEB',
    status VARCHAR(50) NOT NULL,
    failure_reason VARCHAR(255),
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_company_date (company_id, created_at),
    INDEX idx_employee_date (employee_id, created_at),
    INDEX idx_ip (ip_address),
    INDEX idx_status (status, created_at)
) ENGINE=InnoDB;
```

**A) Audit logger module (new file):**
- `tzk-userauth/src/helpers/auditLog.js` — Provides `logAudit(params)` and `getClientInfo(req)` helpers. Fire-and-forget (never blocks main flow). Logs to `login_audit` table. Includes built-in alert: if 5+ failed logins from same IP in 15 minutes, logs a `security_alert` to `pos_error_info` via Winston.

**B) IP address capture — trust proxy:**
- `tzk-gate-way/index.js` — Added `app.set('trust proxy', 1)` so Express resolves `req.ip` to the real client IP from `X-Forwarded-For` header
- `tzk-userauth/app.js` — Added `app.set('trust proxy', 1)` to match

**C) Events now audited (tzk-userauth):**

| Event | Status Value | File |
|-------|-------------|------|
| Login success (WEB) | `success` | `user.controller.js` |
| Login success (MOBILE) | `success` | `user.controller.js` |
| Login success (AUTO_LOGIN) | `success` | `user.controller.js` |
| Login failed (wrong password) | `failed` | `user.controller.js` |
| Account locked | `locked` | `user.controller.js` |
| MFA OTP sent | `mfa_required` | `user.controller.js` |
| MFA OTP verified | `mfa_verified` | `user.controller.js` |
| MFA OTP failed | `mfa_failed` | `user.controller.js` |
| Password change success | `password_change` | `user.controller.js` |
| Password change failed | `password_change_failed` | `user.controller.js` |
| Password reset request | `password_reset_request` | `forget_password.controller.js` |
| Password reset complete | `password_reset_complete` | `forget_password.controller.js` |
| Token refresh | `token_refresh` | `token.controller.js` |
| Token refresh failed | `token_refresh_failed` | `token.controller.js` |
| Logout | `logout` | `logout.controller.js` |
| Logout all devices | `logout` (session_id: `logout_all_devices`) | `logout.controller.js` |

**D) Real-time alert triggers:**
- 5+ failed logins from same IP in 15 min → Winston `security_alert` logged to `pos_error_info` (built into `auditLog.js`)
- All events capture `ip_address` and `user_agent` for forensic analysis
- Queries available for monitoring: unusual IPs, concurrent sessions, rapid refresh attempts

**Files changed:**
- `tzk-userauth/src/helpers/auditLog.js` (new)
- `tzk-userauth/src/api/user/user.controller.js` — Added audit logging at all login success/failure/lockout/MFA points
- `tzk-userauth/src/api/refresh_token/token.controller.js` — Added audit logging for token refresh success/failure
- `tzk-userauth/src/api/logout/logout.controller.js` — Added audit logging for logout and logoutAll
- `tzk-userauth/src/api/forget_password/forget_password.controller.js` — Added audit logging for password reset request/complete
- `tzk-userauth/app.js` — Added `trust proxy`
- `tzk-gate-way/index.js` — Added `trust proxy`

**Existing functionality preserved:**
- All audit logging is fire-and-forget — if the audit INSERT fails, the main request continues normally
- No changes to request/response payloads
- No changes to authentication logic
- IP capture is passive (uses existing Express `req.ip`)
- Alert system logs to existing `pos_error_info` table via Winston (no new notification system required)

---

## Fix 24: Login Form UX — Validation Bugs & Error Message Leak

**Risk:** Low-Medium — broken validation logic, error messages leak internal details

**A) Bug 1 — `errorHandaler()` validation always true:**
- `tzk-tazk-ui/src/pages/common/login/index.js` line 257 — `if (formdata.username === null || '')` is always truthy because `''` is evaluated as the second operand of `||`, not compared to `formdata.username`. Fixed to `if (formdata.username === null || formdata.username === '')`. Same fix for `formdata.password` on line 259.

**B) Bug 2 — `handleChange()` button enable logic always false:**
- `tzk-tazk-ui/src/pages/common/login/index.js` line 97 — `if (value !== null && '')` is always falsy because `''` is falsy in `&&` context, so the submit button never re-enables after being disabled. Fixed to `if (value !== null && value !== '')`.

**C) Bug 3 — `useEffect` missing dependency array (runs every render):**
- `tzk-tazk-ui/src/pages/common/login/index.js` line 155 — `useEffect(() => { requestForToken(...) })` had no dependency array, causing Firebase token request on every re-render. Fixed to `useEffect(() => { ... }, [])`.
- Note: `SigninFirebase.js` already had this fix (`,[])` on line 179).

**D) Error message leak — internal error details shown to user:**
- `tzk-tazk-ui/src/pages/common/login/index.js` line 249 — Catch-all error showed `err.message` which can leak internal details (stack traces, DB errors). Changed to generic `'Something went wrong. Please try again.'`.
- `tzk-tazk-ui/src/pages/common/auth/Signin/SigninFirebase.js` line 359 — 500 error showed `err.response?.statusText` (e.g. "Internal Server Error"). Changed to generic `'Something went wrong. Please try again.'`.

**Existing functionality preserved:**
- Validation logic now works correctly — previously was effectively no-op
- Button disable/enable now works correctly — previously button stayed disabled after first disable
- Firebase token request runs once on mount instead of every render (reduces unnecessary API calls)
- All user-facing error messages remain friendly and non-technical

---

## Fix 25: RSA Private Key Newline Fix — Decryption Failures Across All Services

**Risk:** High — All RSA decryption (names, emails, company names, etc.) fails with `oaep decoding error`
**Root Cause:** Private keys stored in `pos_keys` table contain literal `\n` strings instead of real newline characters. Node.js `crypto.privateDecrypt()` requires real newlines in PEM format.
**Fix:** Added `.replace(/\\n/g, '\n')` when reading `private_key` from the database, converting literal `\n` to real newlines before passing to `crypto.privateDecrypt()`.

**Files Changed (8 services, 15 files):**

**tzk-com-services:**
- `src/api/company/company.model.js` (line 1184) — `Decryption` static method
- `src/api/company/company.model.js` (line 2454) — company name decryption loop
- `src/api/customer/customer.model.js` (line 2683) — `BulkDecryption` for customer data
- `src/api/error_dashboard/errorDashboard.model.js` (lines 42-43) — error dashboard decryption
- `src/api/DashboardData/payroll/payrollDashboard.model.js` (line 26) — payroll dashboard
- `src/api/DashboardData/Sales/salesDashboard.model.js` (line 25) — sales dashboard
- `src/api/DashboardData/Project/projectDashboard.model.js` (line 24) — project dashboard
- `src/api/DashboardData/PointOfSale/posDashboard.model.js` (line 36) — POS dashboard

**tzk-payroll:**
- `src/api/shifts/shifts.model.js` (line 2426) — `BulkDecryption` for attendance/shift reports
- `src/cron/cronFunctions.js` (line 65) — cron job decryption

**tzk-accounts:**
- `src/api/ledger/ledger.model.js` (line 557) — ledger decryption
- `src/api/paymentReceipt/paymentReceipt.model.js` (line 453) — payment receipt decryption

**tzk-sales:**
- `src/cron/cronFunctions.js` (line 39) — cron job decryption

**tzk-products:**
- `src/cron/cronFunctions.js` (line 34) — cron job decryption

**tzk-superadmin:**
- `src/api/superAdmin/super_admin.model.js` — 11 locations (lines 68, 275, 376, 525, 598, 611, 639, 684, 804, 915, 931)
- `src/api/superAdmin/settings.model.js` (line 97) — settings decryption
- `src/cron/notificationGenerator.js` (line 18) — notification cron
- `src/cron/followUpReminder.js` (line 16) — follow-up reminder cron

**Existing functionality preserved:**
- No change to decryption logic — only the key format is normalized before use
- If the key already has real newlines, the replace is a no-op (safe)
- Empty/null keys are handled with fallback to empty string before replace

---

## Fix 26: Login Audit Logs UI — View Audit Logs in Application

**Purpose:** Provide UI to view login audit logs created by Fix 23
**Access:**
- **Superadmin:** New parent menu item "Login Audit Logs" in sidebar → `/superadmin/loginAuditLogs`
- **Company Admin:** Under Reports → Logs section → "Login Audit Logs" → `/reports/loginAuditLogs`
- Tenant isolation: each company sees only their own logs

**Backend (tzk-userauth):**
- `src/api/loginAudit/loginAudit.sql.js` — SQL queries for login_audit table
- `src/api/loginAudit/loginAudit.model.js` — Model with pagination, search, filters (date range, status, login_type, IP), tenant isolation via JWT company_id
- `src/api/loginAudit/loginAudit.controller.js` — Controller
- `src/api/loginAudit/loginAudit.routes.js` — POST `/` route (protected by JWT)
- `src/routes.js` — Registered `/userauthservice/api/loginAudit` route
- `src/api/routesConfig/superAdmin.js` — Added "Login Audit Logs" menu item (head_8)

**Frontend (tzk-tazk-ui):**
- `src/pages/reports/LoginAuditLogs/index.js` — New page component with DataGrid, filters (date range, status, login type, IP address), search, CSV export, color-coded status chips
- `src/redux/actionTypes/index.js` — Added `GET_LOGIN_AUDIT_LOGS`, `SET_LOGIN_AUDIT_LOGS`
- `src/redux/actions/reports_actions.js` — Added `loginAuditLogsAction`, `getLoginAuditLogsAction`, `setLoginAuditLogsAction`
- `src/redux/reducers/reports_reducers.js` — Added `getLoginAuditLogs` state
- `src/redux/sagas/handlers/searchHandlers.js` — Added `handleGetSearchLoginAuditLogs` saga handler
- `src/redux/sagas/rootSaga.js` — Added debounce watcher for `SET_LOGIN_AUDIT_LOGS`
- `src/services/reports_services.js` — Added `loginAuditLogs()` method
- `src/utils/customFetchApiUrls.js` — Added `GET_LOGIN_AUDIT_LOGS` URL
- `src/utils/routesprefix.js` — Added `loginAudit` prefix
- `src/pages/allRoutes.js` — Added routes for both superadmin and reports paths

**Menu Configuration (tzk-com-services):**
- `src/api/userRole/routesConfig/pointOfSale.js` — Added "Logs" report category with "Login Audit Logs"
- `src/api/userRole/routesConfig/sales.js` — Added "Logs" report category
- `src/api/userRole/routesConfig/payroll.js` — Added "Logs" report category

**Filters available:**
- Date range (From/To)
- Status (success, failed, locked, mfa_required, mfa_verified, mfa_failed, logout, password_change, etc.)
- Login Type (WEB, MOBILE, AUTO_LOGIN, API)
- IP Address
- Free text search (username, IP, failure reason)
