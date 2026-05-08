# BitEstate

BitEstate verifies real estate documents against registered source hashes.

## Product Areas

- Home: directs users to the correct task.
- Verify: compares an uploaded file hash with a registered source.
- Source: registers trusted source hashes on Sepolia.

## Notes
- The demo stores trusted sources and receipts in browser storage with a memory fallback.
- Sepolia writes are optional. If no wallet is connected, sources still save locally for the walkthrough.
- A built-in sample source is available so verification works immediately on a fresh browser.
