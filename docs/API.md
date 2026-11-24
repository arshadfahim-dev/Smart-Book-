# API Reference — Smart Book

All API endpoints are served by `server.ts` under `/api/*`. Authenticated routes expect an `Authorization: Bearer <token>` header returned by login, register, or demo endpoints.

## Health

### `GET /api/health`
Returns server readiness and optional AI client status.
- **Response `200`**: `{ "status": "ok", "app": "Smart Book Workspace", "aiReady": false }`

---

## Authentication

### `POST /api/auth/register`
Creates a new `member` account using `crypto.scryptSync` password hashing.
- **Body**: `{ "email": "user@example.com", "displayName": "Alex", "secret": "min6chars" }`
- **Response `201`**: `{ "token": "<hmac-token>", "user": { "uid", "email", "displayName", "photoURL", "role": "member" } }`

### `POST /api/auth/login`
Authenticates an existing member or bootstrapped admin account.
- **Body**: `{ "email": "user@example.com", "secret": "min6chars" }`
- **Response `200`**: `{ "token": "<hmac-token>", "user": { ... } }`

### `POST /api/auth/demo`
Issues a non-privileged `member` session for the seeded demo workspace (`demo@smartbook.local`).
- **Response `200`**: `{ "token": "<hmac-token>", "user": { "uid": "demo-member-01", "role": "member", ... } }`

### `GET /api/auth/me`
*(Requires Auth)* Returns the current authenticated user's profile and role.

---

## User-Scoped Workspace Sync

### `GET /api/workspace`
*(Requires Auth)* Returns the workspace snapshot scoped strictly to `req.user.uid`.

### `PUT /api/workspace`
*(Requires Auth)* Saves the authenticated user's workspace snapshot (`{ "data": { ... } }`) scoped strictly to `req.user.uid`.

---

## Role-Gated Admin Endpoints

### `GET /api/admin/overview`
*(Requires Auth + `role === 'admin'`)* Returns `403 Forbidden` for `member` users. Returns account summary metrics and synced workspace counts for administrators.
