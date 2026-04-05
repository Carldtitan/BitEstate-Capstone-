# BitEstate Capstone

BitEstate is a live demo with a home page plus verify, source, and marketplace:

- Home: the front door.
- Verify: SHA256 match + Sepolia check.
- Source: unlock with the device code, then write the source hash on chain.
- Marketplace: frozen preview only.

## Current Scope
- Google sign-in for the registry path.
- Wallet connection for Sepolia writes.
- Trusted source registration and verification receipts.
- Locked marketplace preview that cannot be used.

## Notes
- The app uses Sepolia for the write path.
- If Firebase is not configured, sign-in falls back to the local demo user.
