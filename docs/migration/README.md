# Migration Pack: `multi-deal-order` Renewal Flow

This documentation pack is the starting point for moving the renewal flow from this repository into a different web application while preserving the important behavior from the `multi-deal-order` branch.

Primary source of truth:
- Git branch: `multi-deal-order`
- Frontend entry point: `public/renewal/uktm/index.html`
- Frontend order flow: `public/renewal/uktm/order.html`
- Frontend confirmation gate: `public/renewal/uktm/assets/js/confirmation.js`
- Renewal API layer: `api/renewal/*`
- Renewal service layer: `api/_services/renewal.js`

What this pack is for:
- Preserve renewal behavior, not current HTML/CSS structure
- Rebuild the flow in another app with a different UI
- Keep validations, token handling, API contracts, payment lifecycle, and edge cases
- Identify branch-specific gaps before reimplementation

What this pack is not:
- A design migration
- A pixel-accurate rewrite guide
- A recommendation to copy the current page templates into the new app

Recommended reading order:
1. `flow-inventory.md`
2. `api-contracts.md`
3. `audit-flow-inventory.md`
4. `source-flow-coverage.md`
5. `target-app-mapping.md`
6. `contract-deltas.md`
7. `renewal-target-schemas.md`
8. `audit-target-schemas.md`
9. `field-mapping.md`
10. `target-typescript-contracts.md`
11. `source-fixtures-and-examples.md`
12. `gap-register.md`
13. `target-implementation-blueprint.md`
14. `parity-checklist.md`
15. `validation-matrix.md`
16. `rebuild-plan.md`

Important branch-specific note:
- `multi-deal-order` adds multi-select renewal UI for additional trademarks, but the current submit payload still sends a single `trademark_number`. Treat the multi-select portion as intended behavior with incomplete backend wiring, not as a finished contract.

Target application:
- `mastercode-io/tmh-commerce-extension`
- Next.js App Router
- React 19
- Tailwind CSS v4
- normalized server-side Zoho commerce adapter
- existing generic request contract for `audit`, `renewal`, `application`, and `support`

Target-side planning references used for this pack:
- `README.md`
- `docs/TMH_Commerce_Extension_Production_Scope_v1.md`
- `docs/TMH_Commerce_Extension_Implementation_Order_v1.md`
- `docs/TMH_Commerce_Extension_Implementation_Workstreams_v1.md`
- `docs/TMH_Commerce_Extension_Blockers_Next_Handoff_TODO_v1.md`
- `docs/TMH_Commerce_Extension_Zoho_Commerce_Custom_API_Contract_v1.md`
