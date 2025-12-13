# BitEstate Capstone

Blockchain-backed real estate demo with document verification, Cowries wallet purchasing, and Google sign-in.

## Features
- Modern Airbnb-inspired UI with hero, cards, and responsive grid.
- SHA-256 PDF comparison for exact matches on the Verify page.
- Cowries wallet (random starting balance per user) to buy verified listings.
- 50 seeded listings with prices in USD and Cowries.
- Upload + on-chain hash logging (mock fallback).
- Google authentication via Firebase (or local demo login fallback).

## Run locally
```
cd BitEstate-Capstone--main
npm install
npm start
```

## Environment variables
Create a `.env` (Parcel reads `process.env.*`) with:
```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_APP_ID=
RPC_URL=          # optional testnet RPC
CONTRACT_ADDRESS= # deployed contract that supports registerDocumentHash/isRegistered
```

If Firebase values are omitted, the app falls back to a local demo login. If RPC/contract are missing, blockchain calls run in mock mode.
