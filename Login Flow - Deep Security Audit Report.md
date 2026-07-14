# Login Flow - Deep Security Audit Report

**Audit Date:** March 14, 2026
**Auditor:** Claude (AI Security Auditor)
**Scope:** Full-stack authentication flow across tzk-tazk-ui, tzk-userauth, tzk-gate-way, and all backend microservices
**Database:** MySQL 8 (pos_erp_db_dev)
**Status:** Audit Complete - No Code Modified

---

## Table of Contents

1. [Login Flow Sequence Diagram](#step-1--login-flow-sequence-diagram)
2. [Functional Validation](#step-2--functional-validation)
3. [Security Audit](#step-3--security-audit)
4. [Multi-Tenant Validation](#step-4--multi-tenant-validation)
5. [Token & Session Design](#step-5--token--session-design)
6. [API Contract Review](#step-6--api-contract-review)
7. [Performance & Reliability](#step-7--performance--reliability)
8. [Logging & Monitoring](#step-8--logging--monitoring)
9. [UX Flow Review](#step-9--ux-flow-review)
10. [Final Report & Recommendations](#step-10--final-report--recommendations)

---

## Step 1 - Login Flow Sequence Diagram

### Architecture Overview

```
Frontend (React)          Gateway (:4000)         userauth (:4002)         MySQL (:3306)
     |                        |                        |                        |
     |  POST /login           |                        |                        |
     |  {username, password}  |                        |                        |
     |----------------------->|                        |                        |
     |                        |                        |                        |
     |  Axios interceptor     |                        |                        |
     |  rewrites URL:         |                        |                        |
     |  /login -->            |                        |                        |
     |  /userauthservice/     |                        |                        |
     |  api/login             |                        |                        |
     |                        |  Proxy to :4002        |                        |
     |                        |----------------------->|                        |
     |                        |                        |                        |
     |                        |                        |  SELECT pos_employees   |
     |                        |                        |  JOIN pos_people        |
     |                        |                        |  JOIN pos_company       |
     |                        |                        |----------------------->|
     |                        |                        |                        |
     |                        |                        |  User row returned      |
     |                        |                        |<-----------------------|
     |                        |                        |                        |
     |                        |                        |  bcrypt.compare()      |
     |                        |                        |  password vs hash      |
     |                        |                        |                        |
     |                        |                        |  Check MFA enabled?    |
     |                        |                        |  (pos_app_config)      |
     |                        |                        |----------------------->|
     |                        |                        |<-----------------------|
     |                        |                        |                        |
     |               [If MFA enabled]                  |                        |
     |                        |                        |  Generate 6-digit OTP  |
     |                        |                        |  Store in pos_people   |
     |                        |                        |  .authenticationOTP    |
     |                        |                        |----------------------->|
     |                        |                        |                        |
     |  {mfa: true, message}  |                        |                        |
     |<-----------------------|<-----------------------|                        |
     |                        |                        |                        |
     |  POST /login           |                        |                        |
     |  {username, password,  |                        |                        |
     |   otp}                 |                        |                        |
     |----------------------->|----------------------->|                        |
     |                        |                        |  Verify OTP match      |
     |                        |                        |----------------------->|
     |                        |                        |<-----------------------|
     |                        |                        |                        |
     |               [Auth Success]                    |                        |
     |                        |                        |                        |
     |                        |                        |  jwt.sign() access     |
     |                        |                        |  token (24h, HS256)    |
     |                        |                        |                        |
     |                        |                        |  jwt.sign() refresh    |
     |                        |                        |  token (30d, HS256)    |
     |                        |                        |                        |
     |                        |                        |  INSERT refresh token  |
     |                        |                        |  INTO pos_refreshtokens|
     |                        |                        |----------------------->|
     |                        |                        |                        |
     |                        |                        |  INSERT/UPDATE         |
     |                        |                        |  access_tokens table   |
     |                        |                        |----------------------->|
     |                        |                        |                        |
     |                        |                        |  Fetch modules,        |
     |                        |                        |  subscription, company |
     |                        |                        |----------------------->|
     |                        |                        |<-----------------------|
     |                        |                        |                        |
     |  {accessToken,         |                        |                        |
     |   refreshToken,        |                        |                        |
     |   employee_id,         |                        |                        |
     |   company_id,          |                        |                        |
     |   company_type,        |                        |                        |
     |   modules,             |                        |                        |
     |   subscription_type}   |                        |                        |
     |<-----------------------|<-----------------------|                        |
     |                        |                        |                        |
     |  sessionStorage.setItem|                        |                        |
     |  ('login', JSON.       |                        |                        |
     |   stringify(data +     |                        |                        |
     |   PASSWORD))           |                        |                        |
     |                        |                        |                        |
     |  Navigate to           |                        |                        |
     |  /common/home          |                        |                        |
```

### Token Refresh Flow

```
Frontend                  Gateway                  userauth                 MySQL
     |                        |                        |                        |
     |  API call with expired |                        |                        |
     |  access token          |                        |                        |
     |----------------------->|----------------------->|                        |
     |                        |                        |  jwt.verify() fails    |
     |  403 {token_expired}   |                        |  (expired)             |
     |<-----------------------|<-----------------------|                        |
     |                        |                        |                        |
     |  POST /renewAccessToken|                        |                        |
     |  {refreshToken}        |                        |                        |
     |----------------------->|----------------------->|                        |
     |                        |                        |  Check blacklist       |
     |                        |                        |----------------------->|
     |                        |                        |<-----------------------|
     |                        |                        |                        |
     |                        |                        |  jwt.verify() refresh  |
     |                        |                        |  token valid           |
     |                        |                        |                        |
     |                        |                        |  Generate new access   |
     |                        |                        |  + refresh tokens      |
     |                        |                        |                        |
     |  {accessToken,         |                        |                        |
     |   refreshToken}        |                        |                        |
     |<-----------------------|<-----------------------|                        |
     |                        |                        |                        |
     |  Retry original API    |                        |                        |
     |  call with new token   |                        |                        |
     |----------------------->|                        |                        |
```

### Logout Flow

```
Frontend                  Gateway                  userauth                 MySQL
     |                        |                        |                        |
     |  POST /logout          |                        |                        |
     |  {employee_id,         |                        |                        |
     |   browserId}           |                        |                        |
     |----------------------->|----------------------->|                        |
     |                        |                        |  INSERT access token   |
     |                        |                        |  INTO blacklist        |
     |                        |                        |----------------------->|
     |                        |                        |                        |
     |                        |                        |  Soft-delete refresh   |
     |                        |                        |  token (isDeleted=1)   |
     |                        |                        |----------------------->|
     |                        |                        |                        |
     |                        |                        |  Clear employee token  |
     |                        |                        |  field                 |
     |                        |                        |----------------------->|
     |                        |                        |                        |
     |  200 OK                |                        |                        |
     |<-----------------------|<-----------------------|                        |
     |                        |                        |                        |
     |  sessionStorage.clear()|                        |                        |
     |  Navigate to /signin   |                        |                        |
```

---

## Step 2 - Functional Validation

### Login Scenario Coverage

| # | Scenario | Handled | Implementation | Gap |
|---|----------|---------|----------------|-----|
| 1 | Correct credentials | YES | bcrypt.compare validates password hash, returns tokens + user data | None |
| 2 | Incorrect password | PARTIAL | Returns 401 "Username Or Password Invalid" | No attempt counter persisted in DB |
| 3 | Invalid email/username | PARTIAL | Same 401 response as wrong password (good for anti-enumeration) | Forget-password endpoint leaks user existence |
| 4 | Inactive user | NO | No `account_status` field exists in schema | Only `deleted` flag (binary active/deleted) |
| 5 | Blocked user | NO | No lockout mechanism exists | `loginAttempts` is in-memory only, resets on restart |
| 6 | Expired password | NO | No `password_expires_at` column in database | Passwords never expire |
| 7 | Multiple failed attempts | PARTIAL | In-memory counter logs after 3 attempts | Counter never blocks login, resets on restart |
| 8 | Account lock rules | NO | No DB-level lockout columns | No `locked_until`, no `failed_attempts` in DB |
| 9 | First-time login | PARTIAL | `isClientpswd` flag exists for forced password change | UX flow for first-time unclear |
| 10 | Role-based redirect | YES | Frontend checks `company_type` + `subscription_type` for routing | Working correctly |
| 11 | Multi-company/tenant | YES | `company_id` in JWT payload, all queries filter by company | Working correctly |
| 12 | Company approval | YES | `isApproved` flag checked, returns 402 if not approved | Working correctly |
| 13 | Subscription expired | PARTIAL | Checked in JWT middleware on each request | Admins on WEB bypass subscription check |
| 14 | MFA/OTP | PARTIAL | 6-digit OTP generated, sent via email/SMS | OTP uses Math.random(), no expiry, no attempt limit |

### Detailed Gap Analysis

**Account Status Management:**
The current schema only has a `deleted` flag (0 or 1). There is no concept of:
- Suspended accounts
- Locked accounts (after failed attempts)
- Pending verification accounts
- Inactive accounts (dormant for N days)

**Password Lifecycle:**
No tracking of:
- When password was last changed
- Password expiry enforcement
- Password history (prevents reuse)
- Force password change on next login

---

## Step 3 - Security Audit

### 3.1 CRITICAL Vulnerabilities

---

#### CRITICAL-01: Plaintext Password Stored in SessionStorage

| Field | Details |
|-------|---------|
| **Severity** | CRITICAL |
| **File** | `src/pages/common/auth/Signin/SigninFirebase.js` |
| **Line** | 222 |
| **OWASP** | A02:2021 Cryptographic Failures |

**Code:**
```javascript
const normalizedLoginData = {
  ...loginApi.data,
  company_type: ...,
  password: formdata.password  // CRITICAL: plaintext password stored
};
sessionStorage.setItem('login', JSON.stringify(normalizedLoginData));
```

**Impact:** Any XSS attack steals the user's plaintext password. sessionStorage is fully accessible to JavaScript. Unlike a stolen token (which expires), a stolen password grants permanent access.

**Fix:** Remove `password: formdata.password` from the stored object entirely.

---

#### CRITICAL-02: Hardcoded JWT Secrets Across All Environments

| Field | Details |
|-------|---------|
| **Severity** | CRITICAL |
| **File** | All `src/config/config.json` files across every service |
| **Lines** | 9-10 (local), 43-44 (dev), 77-78 (prod) |
| **OWASP** | A02:2021 Cryptographic Failures |

**Code (identical in all services):**
```json
{
  "local": {
    "access_token_secret": "AccessTokenSecret",
    "refresh_token_secret": "RefreshTokenSecret"
  },
  "dev": {
    "access_token_secret": "AccessTokenSecret",
    "refresh_token_secret": "RefreshTokenSecret"
  },
  "prod": {
    "access_token_secret": "AccessTokenSecret",
    "refresh_token_secret": "RefreshTokenSecret"
  }
}
```

**Impact:** Anyone with repository access can forge valid JWT tokens for any user in any environment. The secret `"AccessTokenSecret"` is a dictionary phrase with only 17 characters of entropy.

**Fix:** Generate cryptographically secure secrets and store in environment variables:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

#### CRITICAL-03: Partner Login Placeholder Secret

| Field | Details |
|-------|---------|
| **Severity** | CRITICAL |
| **File** | `tzk-userauth/src/api/user/user.controller.js` |
| **Line** | 207 |

**Code:**
```javascript
const token = jwt.sign(
  { sub: u.user_id, role_name: "partner", partner_id: u.partner_id },
  'change_me_super_secret',  // Placeholder never changed
  { expiresIn: '7d' }
);
```

**Impact:** The literal string `'change_me_super_secret'` is the production JWT secret for partner authentication. Trivially forgeable.

---

#### CRITICAL-04: Hardcoded AES Encryption Key

| Field | Details |
|-------|---------|
| **Severity** | CRITICAL |
| **File** | `tzk-userauth/src/helpers/encryption.js` |
| **Lines** | 13-14 |

**Code:**
```javascript
const key = CryptoJS.enc.Hex.parse("myvKSFZI6RTJVzYgjm08kG2k3AvgZxbE");
const iv  = CryptoJS.enc.Hex.parse("8af520ae6e0369d8");
```

**Impact:** All API key encryption/decryption uses this hardcoded key. Any extracted API key can be decrypted by anyone with repo access.

---

#### CRITICAL-05: CORS Wildcard with Credentials

| Field | Details |
|-------|---------|
| **Severity** | CRITICAL |
| **File** | All `app.js` files (userauth, com-services, sales, etc.) |

**Code (identical across services):**
```javascript
app.use(cors({
  'origin': '*',          // Allows ANY website
  'credentials': true,    // Allows cookies/auth headers
  'methods': 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
}));
```

**Impact:** Any malicious website can make authenticated API requests on behalf of a logged-in user. The correct whitelist approach is commented out in the codebase but disabled.

---

#### CRITICAL-06: XSS via dangerouslySetInnerHTML in Notifications

| Field | Details |
|-------|---------|
| **Severity** | CRITICAL |
| **File** | `src/@crema/core/AppContentView/index.js` |
| **Line** | 167 |

**Code:**
```javascript
const toastTrigger = (title, body) => {
  toast(
    <div>
      {title} <br />
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
};
```

**Impact:** If notification `body` content comes from the API without sanitization, arbitrary JavaScript can execute in the user's browser, stealing tokens, passwords, and session data.

---

### 3.2 HIGH Vulnerabilities

---

#### HIGH-01: No Brute-Force Protection

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **File** | `tzk-userauth/src/api/user/user.controller.js` |
| **Line** | 292-296 |

**Code:**
```javascript
const loginAttempts = {};  // In-memory, resets on restart

// After failed login:
loginAttempts[req.body.username] = (loginAttempts[req.body.username] || 0) + 1;
if (loginAttempts[req.body.username] >= 3) {
  await User.insertErrorLog(...)  // Only LOGS, never BLOCKS
}
```

**Issues:**
- Counter is in-memory only, resets on server restart
- After 3 failures, it only logs, does not block further attempts
- No account lockout, no exponential backoff, no CAPTCHA trigger
- Rate limiter set to 1000 req/min (effectively no limit for login)

---

#### HIGH-02: Insecure OTP Generation

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **File** | `tzk-userauth/src/api/user/user.controller.js` |
| **Line** | 43 |

**Code:**
```javascript
const otp = Math.floor(100000 + Math.random() * 900000);
```

**Issues:**
- `Math.random()` is not cryptographically secure (predictable with enough samples)
- OTP stored in plaintext in `pos_people.authenticationOTP`
- No OTP expiry timestamp
- No maximum verification attempts
- 6-digit OTP = 1,000,000 combinations, brute-forceable without rate limiting

**Fix:**
```javascript
const crypto = require('crypto');
const otp = crypto.randomInt(100000, 999999);
```

---

#### HIGH-03: Excessive Token Expiration Times

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **File** | `tzk-userauth/src/jwt/index.js` |

| Token Type | Current Expiry | Industry Standard |
|------------|---------------|-------------------|
| Access Token | **24 hours** | 15-30 minutes |
| Refresh Token | **30 days** | 7 days |
| GR Access Token | **2 days** | 15-30 minutes |
| GR Refresh Token | **100 days** | 7-14 days |

**Impact:** A stolen access token is valid for 24 hours. With 100-day GR refresh tokens + weak secrets, the attack window is over 3 months.

---

#### HIGH-04: SQL multipleStatements Enabled

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **File** | `tzk-userauth/src/config/db_connection.js` |

**Code:**
```javascript
const connection = mysql.createConnection({
  multipleStatements: true,  // Allows chained SQL execution
});
```

**Impact:** If any SQL injection exists, `multipleStatements: true` allows executing `DROP TABLE`, `INSERT`, or any additional statements in a single query.

---

#### HIGH-05: Password Passed in URL Query Parameters

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **File** | `src/pages/common/auth/Signin/SigninFirebase.js` |
| **Lines** | 68-71 |

**Code:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const usernameParams = urlParams.get('username');
const encryptPassword = urlParams.get('password');
```

**Impact:** Passwords in URL parameters are logged in browser history, proxy logs, server access logs, and Referer headers.

---

#### HIGH-06: Weak Password Policy

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **File** | `src/components/regexFunction/index.js` |
| **Lines** | 39-44 |

**Code:**
```javascript
export const passwordValidation = (value) => {
  // Strong regex COMMENTED OUT:
  // const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/

  let passwordRegex = /^\S*$/;          // Only checks: no whitespace
  let passwordRegex1 = /^.{6,}$/;       // Only checks: 6+ characters
};
```

**Impact:** Password `"aaaaaa"` passes validation. No uppercase, lowercase, number, or special character requirements.

---

#### HIGH-07: No Security at Gateway Level

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **File** | `tzk-gate-way/index.js` |

**Missing:**
- No `helmet.js` (no security headers)
- No `express-rate-limit` (no DoS protection)
- No JWT validation (pure proxy, trusts everything)
- No request size limits
- No input sanitization

---

#### HIGH-08: Request Bodies Logged Including Passwords

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **File** | `tzk-userauth/src/middlewares/index.js` |

**Code:**
```javascript
const requestData = `Route: ${req.originalUrl}, Method: ${req.method}, ` +
  `Body: ${JSON.stringify(req.body)}`;  // Includes password field!
```

**Impact:** Every POST /login request logs the full body including `{ username, password }` in plaintext to the MySQL `pos_error_info` table.

---

#### HIGH-09: Auto-Login Token Vulnerabilities

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **File** | `tzk-userauth/src/api/user/user.controller.js` |
| **Lines** | 46-109 |

**Issues:**
- `redirect_login` table stores encrypted passwords (additional attack surface)
- 30-second timestamp window for token validity
- No IP or User-Agent binding for auto-login links
- HMAC verification exists but key stored alongside data

---

#### HIGH-10: Console.log Leaks Credentials in Production

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **Files** | Multiple frontend files |

**Examples found:**
```javascript
// SigninFirebase.js:184
console.log('firebaseloginrews', e, formdata);  // Logs username + password

// SigninFirebase.js:186
console.log(loginApi.data, formdata, ...);  // Logs tokens + credentials

// login/index.js:194
console.log('ghghhhhhhhhhhhhhhhhh');  // Debug noise in production
```

---

### 3.3 MEDIUM Vulnerabilities

| # | Vulnerability | File | Details |
|---|-------------|------|---------|
| MED-01 | No CSRF Protection | All HTTP calls | No X-CSRF-Token header, no SameSite cookies, no double-submit pattern |
| MED-02 | Token in Socket.IO Query | `socketManager.js:22` | `query: { Authorization: accessToken }` visible in server logs |
| MED-03 | User Enumeration | `forget_password.model.js:38-41` | Different responses for "user not found" vs "email not found" |
| MED-04 | JWT Algorithm Not Enforced | All `jwt.verify()` calls | Algorithm not specified in verify options |
| MED-05 | Admin Subscription Bypass | All `jwt/index.js` files | `if (role_name === "Administrator" && login_type === "WEB") return next()` |
| MED-06 | Token Blacklist Performance | `jwt/index.js` | Full JWT string stored (not `jti`), DB queried every request, no Redis |
| MED-07 | Token Refresh Race Condition | `http-common.js:370-395` | `refreshTokenPromise` nullified before all waiting requests resolve |

---

### 3.4 Security Controls Checklist

| Security Control | Status | Details |
|-----------------|--------|---------|
| Password hashing | PARTIAL | bcrypt with 10 rounds (should be 12+), sync operations block event loop |
| Timing attack protection | YES | `timingSafeCompare` used for auto-login HMAC verification |
| Brute-force protection | NO | In-memory counter only, never blocks |
| Rate limiting | WEAK | 1000 req/min globally (effectively unlimited) |
| Login throttling | NO | No exponential backoff |
| CAPTCHA support | NO | No CAPTCHA integration |
| SQL injection protection | MOSTLY | Parameterized queries used, but `multipleStatements: true` |
| XSS protection | NO | `dangerouslySetInnerHTML`, no CSP headers |
| CSRF protection | NO | No tokens, no SameSite cookies |
| Secure cookies | NO | Tokens in sessionStorage, not HttpOnly cookies |
| Token expiration | WEAK | 24h access, 30-100d refresh (too long) |
| Refresh token handling | PARTIAL | Stored in DB, but no rotation on use |
| JWT signing algorithm | WEAK | HS256 default (not explicit), weak secrets |
| Secrets in env variables | NO | All secrets in config.json committed to git |
| Helmet security headers | PARTIAL | Enabled in services, missing at gateway |
| Input validation | NO | No express-validator or joi on any endpoint |
| Password complexity | NO | Only 6 chars, no special character requirements |
| Account lockout | NO | No DB-level lockout mechanism |

---

## Step 4 - Multi-Tenant Validation

### Tenant Isolation Assessment

| Check | Status | Implementation |
|-------|--------|----------------|
| company_id in JWT | YES | Included in token payload on login |
| Query-level isolation | YES | All SQL queries filter by `company_id = ?` with parameterized queries |
| Cross-company login prevention | YES | Login query joins `pos_employees` with `pos_company` matching `company_id` |
| Company active status | PARTIAL | `isApproved` checked, but no `suspended` state |
| Subscription validity | PARTIAL | JWT middleware checks `subscriptionEndTime`, but Admins bypass |
| Token contains tenant context | YES | JWT payload includes `company_id`, `company_type`, `subscription_type` |
| Data scope enforcement | YES | RBAC has location-based `data_scope` restrictions (L1/L2/L3 hierarchy) |
| Roles per company | YES | 3-level RBAC: system defaults -> company overrides -> user overrides |

### RBAC Architecture

```
Level 1 (System Defaults)             Level 2 (Company Overrides)          Level 3 (User Overrides)
-------------------------------        --------------------------------     ---------------------------
sa_company_type_roles             -->  pos_company_role_menu_access    -->  pos_user_menu_access
sa_role_menu_access               -->  pos_company_role_report_access  -->  pos_user_report_access
sa_role_report_access             -->  pos_company_role_dashboard_access    pos_user_dashboard_access
sa_role_dashboard_access          -->  pos_company_role_notification_config pos_user_notification_config
sa_role_notification_config       -->  pos_company_role_data_scope
sa_role_data_scope                -->  pos_company_role_field_visibility
sa_role_field_visibility
```

### Tenant Isolation Gap

**Potential Risk:** Some endpoints may trust `req.body.company_id` over `req.user.company_id` (from JWT). If a request sends a different `company_id` in the body than what's in the token, the endpoint might query another tenant's data.

**Recommendation:** Always use `req.user.company_id` from the verified JWT, never from request body/params.

---

## Step 5 - Token & Session Design

### Current JWT Payload Structure

```json
{
  "company_id": 401,
  "employee_id": 1234,
  "role_name": "Administrator",
  "login_type": "WEB",
  "subscriptionEndTime": "2026-12-31T00:00:00.000Z",
  "user_location": [1, 2, 3],
  "iat": 1710400000,
  "exp": 1710486400,
  "iss": "pos.vtt.im"
}
```

### Token Expiration Comparison

| Token Type | Current | Recommended | Reason |
|------------|---------|-------------|--------|
| Access Token | 24 hours | 15-30 minutes | Minimizes attack window if token stolen |
| Refresh Token | 30 days | 7 days | Limits long-term exposure |
| GR Access Token | 2 days | 30 minutes | Same as above |
| GR Refresh Token | 100 days | 14 days | 100 days is excessive by any standard |

### Missing JWT Claims

| Claim | Status | Purpose |
|-------|--------|---------|
| `jti` (JWT ID) | MISSING | Unique token ID for efficient blacklisting |
| `aud` (Audience) | MISSING | Specifies intended service recipient |
| `sub` (Subject) | MISSING | Standard claim for user identifier |
| `nbf` (Not Before) | MISSING | Prevents token use before issue time |

### Token Storage Architecture

**Current (Insecure):**
```
sessionStorage['login'] = {
  accessToken:       "eyJhbG...",       // Stolen via XSS
  refreshToken:      "eyJhbG...",       // Stolen via XSS
  password:          "secret123",       // CRITICAL: plaintext password!
  employee_id:       1234,
  company_id:        401,
  company_type:      "1",
  modules:           [...],
  first_name:        "John",
  ...30+ more fields
}
```

**Recommended Architecture:**
```
HttpOnly Secure Cookie                  sessionStorage (non-sensitive only)
(NOT accessible to JavaScript)          (OK for JavaScript to read)
------------------------------------    ------------------------------------
accessToken                             employee_id
refreshToken                            company_type
                                        modules
Set-Cookie attributes:                  first_name
  HttpOnly                              subscription_type
  Secure
  SameSite=Strict
  Path=/
```

### Logout Flow Issues

| Issue | Details |
|-------|---------|
| Token still valid after logout | Access token added to blacklist, but blacklist checked on every request = perf hit |
| No "logout all devices" | Cannot invalidate all tokens for a user at once |
| Refresh token soft-deleted | `isDeleted=1` but token string remains in DB |
| Frontend clears prematurely | No verification that server-side logout succeeded before clearing |

---

## Step 6 - API Contract Review

### POST /userauthservice/api/login

#### Request Payload

```json
{
  "username": "john@company.com",
  "password": "secret123"
}
```

**Issues:**
- No Content-Type enforcement (should require `application/json`)
- No max-length validation on `username` or `password`
- No express-validator middleware
- No request schema validation (joi/zod)

#### Success Response (200)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "employee_id": 1234,
  "company_id": 401,
  "company_type": "1,2",
  "subscription_type": "1",
  "default_com_type": 0,
  "default_sub_type": 0,
  "first_name": "John",
  "last_name": "Doe",
  "role_name": "Administrator",
  "email": "john@company.com",
  "modules": [{"module_name": "Sales", "module_id": 1}],
  "... 20+ additional fields": "..."
}
```

**Issues:**
- Response returns 30+ fields (over-exposed data)
- No standard response envelope
- Internal IDs, role names, subscription details all exposed

#### Error Responses

| Status Code | Message | Issue |
|-------------|---------|-------|
| 200 | Success | Correct |
| 401 | "Username Or Password Invalid" | Good (generic message) |
| 402 | "Approval Required" | Non-standard use of 402 (Payment Required) |
| 500 | Internal Server Error | May leak stack traces |
| - | - | Missing: 429 (Rate Limited) |
| - | - | Missing: 423 (Locked) |
| - | - | Missing: 503 (Service Unavailable) |

#### Recommended Response Format

```json
// Success:
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": 1234,
      "name": "John Doe",
      "role": "Administrator"
    }
  },
  "meta": {
    "tokenExpiresIn": 1800,
    "refreshExpiresIn": 604800
  }
}

// Error:
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid username or password",
    "status": 401
  }
}
```

---

## Step 7 - Performance & Reliability

### Login Query Execution Steps

| Step | Query Type | Performance Concern |
|------|-----------|-------------------|
| 1 | Find user (SELECT with JOINs: employees + people + company) | Missing compound index on `(company_id, username)` |
| 2 | bcrypt compare (CPU-intensive hash comparison) | Synchronous `bcrypt.compareSync` blocks event loop |
| 3 | Check MFA config (SELECT from pos_app_config) | Additional DB round-trip |
| 4 | Generate/verify OTP (INSERT/SELECT) | Additional DB round-trips |
| 5 | Create tokens (jwt.sign() x2) | CPU-intensive but fast |
| 6 | Store refresh token (INSERT into pos_refreshtokens) | DB write |
| 7 | Store access token (INSERT/UPDATE access_tokens) | DB write |
| 8 | Fetch modules (SELECT with JOINs) | Multiple queries for modules, subscription |

**Total: 6-8 sequential database queries per login.**

### Performance Issues

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| Single DB connection (not pool) | `createConnection()` = single point of failure | Use `createPool()` with connection limits |
| Synchronous bcrypt | `bcrypt.genSaltSync()` blocks Node.js event loop | Use async `bcrypt.hash()`, `bcrypt.compare()` |
| Token blacklist on every request | DB query for every authenticated API call | Use Redis with TTL matching token expiry |
| Sequential DB queries on login | 6-8 round-trips adds latency | Batch queries or use stored procedure |
| No connection pooling limit | Can exhaust DB connections under load | Set pool `connectionLimit: 10` |

### Missing Indexes

```sql
CREATE INDEX idx_emp_company_username ON pos_employees(company_id, username);
CREATE INDEX idx_people_email ON pos_people(email);
CREATE INDEX idx_refreshtokens_token ON pos_refreshtokens(token, isDeleted);
CREATE INDEX idx_blacklist_token ON access_token_blacklist(access_token);
CREATE INDEX idx_login_device_employee ON login_device(employee_id, isActive);
```

---

## Step 8 - Logging & Monitoring

### Current Logging Coverage

| Event | Logged | Location | Issue |
|-------|--------|----------|-------|
| Login success | PARTIAL | Winston -> MySQL `pos_error_info` | Only errors logged, not success |
| Login failure | PARTIAL | In-memory counter + error log after 3 attempts | Not persisted per attempt |
| Token refresh | NO | Not logged | No audit trail |
| Logout | NO | Not explicitly logged | No audit trail |
| Password change | NO | Not logged | No compliance tracking |
| MFA events | NO | OTP generation/verification not logged | No MFA audit trail |
| Suspicious activity | NO | No anomaly detection | No geo-IP, no impossible travel |
| IP address | NO | Not captured on login | Cannot trace attack source |
| Device fingerprint | PARTIAL | device_id/name/version stored | No new device alerts |
| Failed API auth | YES | JWT middleware logs 401/403 | Working |

### Missing: Login Audit Table

**Proposed Schema:**

```sql
CREATE TABLE login_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    employee_id INT,
    username VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    login_type ENUM('WEB', 'MOBILE', 'AUTO_LOGIN', 'API') NOT NULL,
    status ENUM('success', 'failed', 'locked', 'mfa_required',
                'mfa_verified', 'mfa_failed') NOT NULL,
    failure_reason VARCHAR(255),
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_company_date (company_id, created_at),
    INDEX idx_employee_date (employee_id, created_at),
    INDEX idx_ip (ip_address),
    INDEX idx_status (status, created_at)
) ENGINE=InnoDB;
```

### Missing: Real-Time Alert Triggers

- 5+ failed login attempts from same IP within 15 minutes
- Login from new device/browser
- Login from unusual geographic location
- Login outside business hours
- Multiple concurrent sessions
- Rapid token refresh requests (potential token theft)

---

## Step 9 - UX Flow Review

### Login Form Assessment

| UX Element | Status | Issue |
|------------|--------|-------|
| Form validation | BUGGY | Logic error: `if (value === null \|\| '')` always evaluates to true |
| Loading states | YES | Loader modal displayed during API call |
| Error messages | PARTIAL | 401 shows generic message (good), fallback shows `err.message` (leaks internals) |
| Password visibility toggle | YES | Eye icon toggles input type |
| Auto-focus on username | NO | User must click username field |
| Forgot password flow | YES | OTP-based via email |
| Remember me | NO | Not implemented (acceptable) |
| Mobile responsive | YES | MUI components handle responsiveness |
| Disabled state while loading | PARTIAL | Button disabled during request, re-enabled on error |
| Session timeout notification | NO | No warning before token expiry |
| Multi-tab session sync | NO | Each tab has independent sessionStorage |

### Frontend Validation Bugs

**Bug 1: Validation Logic Always True**
```javascript
// File: src/pages/common/login/index.js:259-263
const errorHandaler = () => {
  if (formdata.username === null || '') {   // BUG: '' is truthy in || context
    setFormErrors({...formErrors, username: true});
  }
};

// Should be:
if (formdata.username === null || formdata.username === '') {
```

**Bug 2: Button Enable/Disable Logic**
```javascript
// File: src/pages/common/login/index.js:97-99
if (value !== null && '') {  // BUG: '' is falsy, condition always false
  setdisab(false);
}

// Should be:
if (value !== null && value !== '') {
```

**Bug 3: useEffect Missing Dependency Array**
```javascript
// File: src/pages/common/auth/Signin/SigninFirebase.js:155-157
useEffect(() => {
  requestForToken(() => {}, setToken);
});  // No dependency array = runs on EVERY render

// Should be:
useEffect(() => {
  requestForToken(() => {}, setToken);
}, []);  // Run once on mount
```

---

## Step 10 - Final Report & Recommendations

### Vulnerability Summary

| Severity | Count | Category |
|----------|-------|----------|
| CRITICAL | 6 | Password in storage, hardcoded secrets, CORS wildcard, XSS |
| HIGH | 10 | No brute-force protection, insecure OTP, excessive token expiry, SQL config, password in URL, weak password policy, no gateway security, logging passwords, auto-login risks, console.log leaks |
| MEDIUM | 7 | No CSRF, socket token exposure, user enumeration, JWT algorithm, admin bypass, blacklist performance, token refresh race condition |
| LOW | 5 | Missing auto-focus, debug console.logs, dead code, magic numbers, no session timeout warning |
| **TOTAL** | **28** | |

### Top 10 Priority Fixes

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| 1 | Remove password from sessionStorage (`SigninFirebase.js:222`) | 5 min | Eliminates plaintext credential exposure |
| 2 | Rotate and externalize JWT secrets (all config.json) | 1 hour | Prevents token forgery across all services |
| 3 | Implement DB-level account lockout (add columns to pos_employees) | 2 hours | Stops brute-force attacks |
| 4 | Reduce token expiry (access: 30min, refresh: 7d) | 30 min | Shrinks attack window from 24h to 30min |
| 5 | Fix CORS (uncomment existing whitelist code in all app.js) | 15 min | Prevents cross-origin attacks |
| 6 | Add rate limiting to login endpoint (express-rate-limit) | 30 min | Prevents automated credential attacks |
| 7 | Fix OTP (crypto.randomInt, hash storage, 5-min expiry) | 1 hour | Secures entire MFA flow |
| 8 | Disable multipleStatements in all DB connections | 10 min | Reduces SQL injection blast radius |
| 9 | Add helmet + rate-limit to gateway | 30 min | Adds security headers + DoS protection |
| 10 | Mask passwords in request logging middleware | 30 min | Prevents credential leakage in logs |

### Database Schema Changes Required

```sql
-- 1. Account lockout support
ALTER TABLE pos_employees ADD COLUMN failed_login_attempts INT DEFAULT 0;
ALTER TABLE pos_employees ADD COLUMN locked_until TIMESTAMP NULL;
ALTER TABLE pos_employees ADD COLUMN account_status
    ENUM('active', 'locked', 'suspended', 'inactive', 'pending_verification')
    DEFAULT 'active';

-- 2. Password lifecycle management
ALTER TABLE pos_employees ADD COLUMN password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE pos_employees ADD COLUMN password_expires_at TIMESTAMP NULL;
ALTER TABLE pos_employees ADD COLUMN password_hash_version INT DEFAULT 1;

-- 3. OTP expiry support
ALTER TABLE pos_people ADD COLUMN authentication_otp_expires_at TIMESTAMP NULL;
ALTER TABLE pos_people ADD COLUMN forget_otp_expires_at TIMESTAMP NULL;
ALTER TABLE pos_people ADD COLUMN otp_attempts INT DEFAULT 0;

-- 4. Login audit table
CREATE TABLE login_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    employee_id INT,
    username VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    login_type ENUM('WEB', 'MOBILE', 'AUTO_LOGIN', 'API') NOT NULL,
    status ENUM('success', 'failed', 'locked', 'mfa_required',
                'mfa_verified', 'mfa_failed') NOT NULL,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_date (company_id, created_at),
    INDEX idx_employee_date (employee_id, created_at),
    INDEX idx_ip (ip_address)
) ENGINE=InnoDB;

-- 5. Performance indexes
CREATE INDEX idx_emp_company_username ON pos_employees(company_id, username);
CREATE INDEX idx_people_email ON pos_people(email);
```

### Enterprise Best Practices Still Missing

| Practice | Status | Priority |
|----------|--------|----------|
| HttpOnly Secure cookies for tokens | Not implemented | HIGH |
| CSRF token implementation | Not implemented | HIGH |
| JWT `jti` claim with Redis blacklist | Not implemented | HIGH |
| RS256 (asymmetric) JWT signing | Not implemented | MEDIUM |
| Password history (prevent reuse) | Not implemented | MEDIUM |
| Password expiry policy | Not implemented | MEDIUM |
| Login audit table with IP tracking | Not implemented | HIGH |
| Real-time suspicious activity alerts | Not implemented | MEDIUM |
| Content Security Policy headers | Not implemented | MEDIUM |
| Automated secret rotation | Not implemented | LOW |
| Input validation middleware | Not implemented | HIGH |
| Penetration testing schedule | Not implemented | MEDIUM |
| OWASP dependency scanning | Not implemented | MEDIUM |
| API versioning | Not implemented | LOW |

### OWASP Top 10 (2021) Mapping

| OWASP Category | Findings |
|---------------|----------|
| A01: Broken Access Control | Admin subscription bypass, location check bypass with `null`/`0` |
| A02: Cryptographic Failures | Hardcoded secrets, password in sessionStorage, weak JWT secrets, plaintext OTP |
| A03: Injection | multipleStatements enabled, unencoded SMS URL parameters |
| A04: Insecure Design | No account lockout, no login audit, no rate limiting architecture |
| A05: Security Misconfiguration | CORS wildcard, no helmet at gateway, debug logs in production |
| A06: Vulnerable Components | CryptoJS (deprecated), no dependency scanning |
| A07: Auth Failures | Weak passwords, excessive token expiry, no brute-force protection, insecure OTP |
| A08: Data Integrity | No JWT algorithm enforcement, no token rotation |
| A09: Logging Failures | No login audit table, no IP tracking, passwords in logs |
| A10: SSRF | Socket.IO token in query params, auto-login via URL parameters |

---

### Conclusion

The authentication system is functional but has **critical security gaps** that must be addressed before production deployment. The most urgent issues are:

1. **Plaintext password storage** in the browser (immediate fix, 5 minutes)
2. **Hardcoded JWT secrets** that allow anyone with repo access to forge tokens (1 hour)
3. **Zero brute-force protection** allowing unlimited login attempts (2 hours)

The architectural decisions (storing JWTs in DB, wildcard CORS, in-memory counters) suggest development speed was prioritized over security. A phased remediation plan starting with the top 10 fixes above would significantly improve the security posture within 1-2 days of effort.

---

*This audit was performed by reading all source code across the full stack. No code was modified. No penetration testing was performed. Findings are based on static analysis only.*
