# BitEstate

BitEstate verifies real estate documents against registered source hashes.

## Product Areas

- Home: directs users to the correct task.
- Verify: compares an uploaded file hash with a registered source.
- Source: registers trusted source hashes on Sepolia.

## Notes
- Firebase Auth handles sign-in.
- Firestore stores trusted source hashes and verification receipts.
- Sepolia writes are optional. The app never stores the uploaded document file.

## Firebase Setup

Deploy the Firestore rules:

```bash
npm run firebase:deploy-rules
```

Remove the old listing-era collections:

```bash
npm run firebase:clear-old-data
```
