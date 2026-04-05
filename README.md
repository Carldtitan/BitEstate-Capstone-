# BitEstate Capstone

BitEstate is a document verification app for title and settlement workflows.

## Current Scope
- Google sign-in for authenticated access.
- Admin-only trusted reference registration with on-chain hash logging.
- Document verification against a trusted source version.
- Proof receipts and an audit trail that records who verified what, and when.
- Marketplace placeholder preserved as "Coming Soon".

## What Is Intentionally Excluded
- Buying and selling flows.
- Property marketplace browsing as a live feature.
- Claims that BitEstate replaces county recording or legal ownership checks.

## Notes
- The app uses Sepolia for reference hash registration when a wallet is connected.
- If Firebase is not configured, the app can fall back to local demo behavior for sign-in.
