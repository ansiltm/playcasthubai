# PlayCastHub — fresh free-tier store

A toy, RC vehicle and collectibles store based on the supplied PlayCastHub project. It retains the existing visual style and admin dashboard while consolidating deployment into one Node service.

## Included

- Homepage, toy categories, product media, manufacturer age labels and safety notes.
- Search, price sorting, in-stock filters, browser-local favourites and cart.
- Email OTP registration, password login, password reset and session invalidation.
- COD order requests, shipping/contact details and order history.
- Admin product/media management, manual sales, fulfilment, payment status and notes.
- Gross-profit reporting using saved purchase costs and paid orders only.
- Brevo HTTPS email integration for OTP, order receipt, status updates and admin alerts.
- MongoDB transactions for stock reservations and cancellations; checkout retry protection.

## Free-tier deployment

| Service | Use | Important limit |
| --- | --- | --- |
| Render Free | One combined Next.js + Express web service | Sleeps after inactivity; shared monthly free instance hours. Not an always-on production guarantee. |
| MongoDB Atlas M0 | Fresh durable database | 512 MB. Choose M0 only, not Flex or a paid dedicated tier. |
| Cloudinary Free | Images and short product videos | Shared storage, bandwidth and transformation allowances. |
| Brevo Free | Email OTP and transactional notifications | Currently 300 sends/day; app defaults to a conservative 250/day cap. Account/sender approval required. |

Use the free `onrender.com` address. A custom domain is optional and normally costs money. No SMS, WhatsApp automation, payment gateway, paid database, cron job or paid worker is required. No credentials are included.

Official references checked 16 October 2026:
- https://render.com/docs/free
- https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/
- https://cloudinary.com/pricing
- https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan
- https://developers.brevo.com/docs/send-a-transactional-email

## Setup

Use Node 22. The two application directories have separate lockfiles.

```sh
npm run setup
```

For local development, copy `.env.example` to `.env`, fill the values privately, then:

```sh
npm run dev
```

Open http://localhost:3000. Backend edits require restarting the dev command. The MongoDB deployment must support transactions (Atlas M0 does; a standalone local mongod does not).

For Render, deploy this branch as one Node web service, region Singapore, plan **Free**:

- Build: `npm run setup && npm run build`
- Start: `npm start`
- Health endpoint: `/healthz`
- Node version: 22
- Set `NODE_ENV=production` and `NEXT_TELEMETRY_DISABLED=1`.

`render.yaml` provides the equivalent configuration. Do not use the old Vercel workflow for this combined app. Existing repository workflows, if retained on the deployment branch, do not automatically deploy this branch to Vercel.

Set these secrets in Render's Environment screen, never in GitHub source or chat:

| Variable | Where it comes from |
| --- | --- |
| `MONGODB_URI` | Fresh Atlas cluster; app-specific user with read/write access only to database `playcasthub` |
| `JWT_SECRET` | At least 32 cryptographically random characters; Blueprint can generate it |
| `BREVO_API_KEY` | Brevo transactional email API key |
| `EMAIL_FROM` | A sender address verified/approved in Brevo |
| `ADMIN_NOTIFICATION_EMAIL` | Store owner's chosen notification address |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard |

Allow the Render service's documented outbound IP ranges in the fresh Atlas project's network access list. Avoid opening the database to all addresses. Do not reuse the old credentials in the uploaded project: both database and Cloudinary secrets were embedded in its source, so rotate those old credentials in their providers.

Brevo must approve transactional sending and the sender. A free mailbox cannot be domain-authenticated; Brevo may rewrite its sender address. A verified sending domain is preferable for delivery. Email API acceptance does not guarantee inbox delivery. Test registration and password reset with your own mailbox before opening the shop.

## First admin and catalogue

1. Register and verify the owner's account normally.
2. From a trusted local checkout with the new database environment configured, run:

```sh
npm run build --prefix backend
npm run admin -- your-verified-email@example.com
```

Alternatively, update that verified user's `role` to `admin` through the connected Atlas tool. Do not expose a public admin-registration endpoint. Sign out and sign back in.

3. Open `/admin` and add real products, actual prices, wholesale costs, stock and media. No fictional inventory or reviews are seeded.
4. Use the age and warning information from each manufacturer's packaging. Grade is not an age recommendation.
5. Confirm your existing return policy, contact details and delivery terms before accepting customers. The supplied project's return-policy text is retained on the product page and needs the owner's review.

## Order behaviour

Prices are calculated by the backend. The checkout now displays the same item total; the old frontend-only 10% tax calculation was removed. Any delivery charge must be agreed with the customer before dispatch; there is no automated delivery-fee or tax-rule engine in this version. Enter product prices appropriately for the store's actual pricing policy.

Status flow:
- pending → confirmed or cancelled
- confirmed → shipped, completed (counter sales), or cancelled
- shipped → delivered → completed
- cancelled/completed are terminal

Cancellation restores stock once in the same transaction. Only cancelled orders may be deleted. Manual sales start unpaid; mark them paid after receiving payment. Order snapshots preserve customer details and purchase costs even when products change.

Orders remain in the dashboard if email sending fails. Notifications are best-effort with no paid queue or background worker; failed emails are logged without customer data. The app does not promise delivery retries after a process restart.

## Validation

```sh
npm run typecheck
npm run build
npm test
npm run test:integration --prefix backend
```

- Production frontend build and backend TypeScript compilation were verified locally.
- Ten focused security tests passed. These cover validation, private-field stripping, JWT configuration, role/session checks, rate-limit boundaries, email requests/failures and escaping. Database/email dependencies are mocked in these tests.
- Twelve integration tests are included for stock concurrency, transaction rollback, idempotency, OTP lifecycle, ownership and password reset. They require a temporary MongoDB replica set via `mongodb-memory-server`; the test binary download was blocked in the preparation environment, so that suite has **not** been verified yet.
- Live Atlas connectivity, Cloudinary uploads, real email delivery, browser behaviour and Render memory usage must still be verified after accounts/secrets are configured.

## Cleanup performed

Removed hardcoded service credentials, duplicate JavaScript email/controllers, unused database-cart API, unauthenticated notification-sending endpoint, obsolete seed scripts, old local upload assets, Vercel app config and unused 3D/map/colour/animation/email dependencies. The cart and favourites remain browser-local. Authentication uses bearer tokens stored in the browser; avoid adding untrusted scripts to the storefront.
