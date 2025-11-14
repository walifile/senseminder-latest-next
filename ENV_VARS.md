# Environment Variable Checklist

Keep this file at the repository root and update it whenever an environment configuration changes. It is the single source of truth for what must be configured, where it lives, and whether the value is safe for the browser.

---

## 1. Client-Facing (`NEXT_PUBLIC_*`)
These values are bundled into the browser. Only expose URLs or publishable keys. Anything that grants access (secrets, tokens, private keys) must not have the `NEXT_PUBLIC_` prefix.

| Category | Variable(s) | Purpose / Notes |
| --- | --- | --- |
| Auth | `NEXT_PUBLIC_AUTH_REDIRECT_URL`, `NEXT_PUBLIC_OAUTH_DOMAIN`, `NEXT_PUBLIC_USER_POOL_CLIENT_ID`, `NEXT_PUBLIC_USER_POOL_ID` | Redirect URLs and Cognito IDs are safe. Use environment-specific values (dev/staging/prod). |
| Social Sign-In | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Only the client ID is public; keep the secret server-side (see section 2). |
| Core APIs | `NEXT_PUBLIC_BASE_API_URL`, `NEXT_PUBLIC_ASSIGN_API_URL`, `NEXT_PUBLIC_BILLING_API_URL`, `NEXT_PUBLIC_CONTACT_URL`, `NEXT_PUBLIC_ESTIMATION_URL`, `NEXT_PUBLIC_FETCH_PC_URL`, `NEXT_PUBLIC_VM_*` (all VM URLs), `NEXT_PUBLIC_FIRST_TIME_TOKEN_URL`, `NEXT_PUBLIC_PROFILE_API_URL`, `NEXT_PUBLIC_USER_MANAGEMENT_API`, `NEXT_PUBLIC_SUPPORT_API_BASE`, `NEXT_PUBLIC_SMART_PC_CONFIG_URL`, `NEXT_PUBLIC_NOTIFICATION_API`, `NEXT_PUBLIC_PROMO_API_URL`, `NEXT_PUBLIC_STORAGE_PING_URL` | Plain API Gateway endpoints. No secrets should be embedded in the URL query string. |
| Utilities | `NEXT_PUBLIC_IPIFY_URL` | No token required. |
| Realtime | `NEXT_PUBLIC_WEBSOCKET_URL` | Gateway URL only. |
| Payments | `NEXT_PUBLIC_STRIPE_PK` | Stripe publishable key only. Secret key lives server-side. |
| Misc | `NEXT_PUBLIC_FEEDBACK_API_URL`, `NEXT_PUBLIC_FEEDBACK_TRIGGER_API_URL`, `NEXT_PUBLIC_NEWSLETTER_API_URL`, `NEXT_PUBLIC_LEGAL_DOCUMENTS_URL`, `NEXT_PUBLIC_IDLE_API_URL`, `NEXT_PUBLIC_CLIENT_SESSION_API`, `NEXT_PUBLIC_SECURITY_QUESTION_API`, `NEXT_PUBLIC_RESIZE_API_URL` (only if no key is embedded) | Verify each endpoint does not require a private token. If it does, add a backend proxy and move the secret to section 2. |
| Environment flag | `NEXT_PUBLIC_CURRENT_ENVIRONMENT` | Optional helper for logging/feature flags. |

> **Reminder:** Do not place third-party tokens in these URLs (e.g., `ipinfo.io` token). Use server-side env vars and route through backend APIs instead.

---

## 2. Server-Only (No `NEXT_PUBLIC_` Prefix)
Load these via AWS Secrets Manager, Parameter Store, Amplify console env vars, or `.env.local` during development. Never expose them in frontend bundles or commit them to Git.

| Variable | Purpose / Usage | Suggested Location |
| --- | --- | --- |
| `GOOGLE_CLIENT_SECRET` | OAuth code-for-token exchange | Server-only auth route |
| `APPLE_CLIENT_ID`, `APPLE_PRIVATE_KEY` | Apple Sign-In configuration | Secrets Manager |
| `PING_API_KEY` | Storage ping Lambda/auth header | Backend proxy route |
| `IPINFO_TOKEN` | Injected when calling ipinfo | Backend proxy |
| `STRIPE_SECRET_KEY` | Stripe server-side API | Backend checkout webhooks |
| `MFA_API_KEY` (if used) | For MFA recovery services | Backend-only |
| `PROMO_API_KEY` (if promo API needs auth) | Coupon/promo API access | Backend |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Only if you run CLI tools locally or serverless functions that need static credentials | Local dev or CI secret store |
| `SESSION_COOKIE_SECRET`, `JWT_SECRET` (if applicable) | Any custom cookie/jwt signing secrets | Backend |
| `DATABASE_URL` / `PRISMA_*` (if database is introduced) | DB connectivity | Backend |

When you add new integrations (Auth0, Slack, etc.), document their secrets here and ensure only server-side code reads them.

---

## 3. Usage & Workflow

1. Copy `.env.example` ➜ `.env.local` for local development. **Never** commit `.env.local`.
2. Populate public variables (section 1) as needed in `.env.local`.  
3. Add server-only values (section 2) to `.env.local` for development and to your hosting platform’s secure env store for staging/prod.  
4. Whenever you introduce a new variable, update both `.env.example` and this checklist.

---

## 4. Deployment Notes

- **Amplify / Vercel / Netlify**: configure secret env vars through the platform UI or CLI (typically under “Environment variables”). Only public URLs should live in build-time `.env.production`.
- **AWS Lambda / API routes**: read secrets via `process.env`. Consider AWS Secrets Manager/Parameter Store if you need rotation/auditing.
- **CI/CD (GitHub Actions, Bitbucket Pipelines)**: store secrets in their encrypted secret storage and inject them during build.
- **Version control hygiene**: `.env*` is ignored via `.gitignore`. Do not commit real values or screenshots/logs showing secrets. Rotate any key that was previously exposed.

---

## 5. Quick Audit Checklist

- [ ] Does any `NEXT_PUBLIC_*` variable include a token, password, or private key? If yes, move it to section 2.
- [ ] Are production/staging secrets only stored in encrypted provider config (not `.env` files)?
- [ ] Do server routes use proxy endpoints when third-party APIs require authentication?
- [ ] Are secrets rotated after an accidental leak?

Maintain this document so new team members immediately know which values to touch when environments change.
