# DecorOnDemand

This React app uses Vite for development and server-side rendering.

## Commands

- `npm run dev` starts the SSR development server with Vite HMR.
- `npm run build` creates the browser and SSR bundles.
- `npm start` serves the production SSR build.

## Database

The server creates the `decorondemand` MySQL database, its `users` table, and
its `listings` table on startup when they do not already exist. Copy `.env.example` to `.env` and set
your MySQL connection values before starting the server.

Each listing belongs to a user through `listings.user_id`. Listings include a
title, description, category, decimal price, location, optional city and JSON
images, publication status, and created/updated timestamps. Availability is
calculated later from lister responses to bookings rather than stored on a
listing.
Deleting a user also deletes that user's listings.

`POST /api/users` accepts `{ "name": "...", "email": "...", "password": "..." }`. Passwords
are stored as bcrypt hashes and are never returned by the endpoint.

The server renders the initial HTML with React on every request. The browser then
hydrates that markup using `src/main.jsx`, so existing interactive components
continue to work after the first page load.

### Listings API

Listings require the authenticated user's `token` cookie.

Users have an `is_lister` flag. Signup accepts the optional boolean `isLister`
field, which defaults to `false`; the authenticated user's flag is included in
the login response and JWT.

`POST /api/users/register-lister` allows an authenticated user to opt into
listing decor. The account page uses this endpoint for users who are not
already listers.

`POST /api/users/deregister-lister` requires the user's password and only
succeeds when the user has no listings. The database enforces this condition.

`POST /api/users/change-password` requires `currentPassword`, `newPassword`,
and `confirmPassword`. New passwords must be at least eight characters long,
different from the current password, and match their confirmation.

`POST /api/listings` creates a listing. The authenticated user is always used
as `user_id`; clients cannot create a listing on behalf of another user.

```json
{
  "title": "The Rosé Romance",
  "description": "A romantic proposal setup with florals and warm lighting.",
  "category": "Proposal",
  "price": 4999,
  "location": "12 Park Street",
  "city": "New Delhi",
  "images": ["https://example.com/rose-romance.jpg"],
  "listingStatus": "draft"
}
```

Required fields are `title`, `category`, `price`, and `location`.
`GET /api/listings` returns the authenticated user's listings. Listing status
defaults to `draft`.

`GET /api/listings/user/:userId` is a public browsing endpoint for listers. It
returns only that user's published listings; draft and archived listings are
not exposed. Availability will be determined by the booking workflow.

Listings also have an `approval_status` of `pending`, `approved`, or `rejected`.
New listings start as pending. Admins can review them through
`GET /api/listings/admin/approval` and update them with
`PATCH /api/listings/admin/:listingId/approval`. Public listings require both
`listing_status = 'published'` and `approval_status = 'approved'`.

Admin page access is verified through the authenticated HTTP-only JWT cookie.
The client-side Redux flag only controls navigation visibility; it is not used
as the security boundary.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
