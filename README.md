# TMH Commerce Extension

This repository is the TMH-specific commerce and account extension for subscription, preferences, payment, and request flows. It is no longer being developed as a general portal or workspace product.

Planning and execution artifacts for the refocus live in `docs/`, especially:

- `TMH_Commerce_Extension_Production_Scope_v1.md`
- `TMH_Commerce_Extension_Implementation_Order_v1.md`
- `TMH_Commerce_Extension_Implementation_Workstreams_v1.md`
- `TMH_Commerce_Extension_Implementation_Tracker.md`

## Local Development

Install dependencies and start the Next.js app:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Commands

- `npm run dev`: start the local development server
- `npm run build`: create a production build
- `npm run start`: run the production server
- `npm run lint`: run ESLint

## Optional Environment Variables

- `DEV_MODE`: when set to `true`, the notification settings page still calls CRM but also exposes the raw upstream response in a debug card
- `TMH_GENERAL_ENQUIRY_BOOKING_URL`: external booking link used by the shared `Schedule a Call` action; defaults to `https://bookings.thetrademarkhelpline.com/#/general-enquiry`

## Current Implementation Focus

The current implementation sequence is:

1. scope and surface cleanup
2. Zoho and integration boundary cleanup
3. monitoring subscription production path
4. preferences flow hardening
5. account visibility surfaces
6. request flows
7. production hardening and supportability
