# Netlify deployment

Import this Git repository and deploy the branch containing `netlify.toml`.
The root configuration selects `frontend` as the base, `.next` as publish
directory, and `backend/netlify` as the Functions source. Do not drag and drop
the source folder: the build must run to generate Next.js routes and Functions.

The build installs and compiles the backend before building the frontend.
The Next.js adapter serves the frontend, while `/api/*` is handled by the
Express Function. No separate API URL is needed by the frontend.

Set runtime variables in the Netlify dashboard (available to Functions):
`MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`, `BREVO_API_KEY`, `EMAIL_FROM`,
`ADMIN_NOTIFICATION_EMAIL`, and `EMAIL_DAILY_LIMIT=250`.
Never prefix secrets with `NEXT_PUBLIC_` or commit real values.
Use replacement credentials for any secrets previously exposed in source/chat.
The Gmail SMTP variables from the old app do not configure this version's
Brevo HTTPS email provider. Brevo requires a verified sender.

The MongoDB URI should point to the existing `playcasthub` database, preserving
products, customers and orders. Atlas must allow the hosting platform's
connections; do not change its network access without reviewing the scope.
Each Function instance reuses a connection with at most five pooled sockets;
monitor Atlas connection counts as traffic increases.

Before customer launch, verify `/healthz`, `/api/products`, registration email,
login, admin authorization, checkout and inventory transitions against a test
product. Local tests mock database initialization and do not prove live Atlas
connectivity or email delivery. Netlify request payload limits also apply to
media uploads; large uploads need direct signed Cloudinary uploads before use.

Free plans have usage quotas. Stay on the free plan with no paid add-ons.
Delivery charges, shop contact details and return policy need owner verification.
