/**
 * Get a random listing photo
 * Photos are placed in src/assets/listing-photos/
 * System automatically uses all available photos
 */

// List of actual stock photos in src/assets/listing-photos/
export const LISTING_PHOTOS = [
  '/assets/listing-photos/aubrey-odom-ITzfgP77DTg-unsplash.jpg',
  '/assets/listing-photos/austin-Jmi3nWiILOc-unsplash.jpg',
  '/assets/listing-photos/brett-jordan-5x_JYiq5PHk-unsplash.jpg',
  '/assets/listing-photos/dan-begel-cmZfiElLkO8-unsplash.jpg',
  '/assets/listing-photos/devon-mackay-2TqK32k2ZCc-unsplash.jpg',
  '/assets/listing-photos/devon-mackay-fhU7X34rCAE-unsplash.jpg',
  '/assets/listing-photos/dillon-kydd-2keCPb73aQY-unsplash.jpg',
  '/assets/listing-photos/dillon-kydd-XGvwt544g8k-unsplash.jpg',
  '/assets/listing-photos/jason-briscoe-UV81E0oXXWQ-unsplash.jpg',
  '/assets/listing-photos/julia-rodriguez-s7Ys6yORjFI-unsplash.jpg',
  '/assets/listing-photos/karina-g-O4G2VR9Leb0-unsplash.jpg',
  '/assets/listing-photos/kelvin-taylor-cx1xEBnKhf8-unsplash.jpg',
  '/assets/listing-photos/kenny-eliason-mGZX2MOPR-s-unsplash.jpg',
  '/assets/listing-photos/paul-kapischka-NLbMgDBio4Y-unsplash.jpg',
  '/assets/listing-photos/roger-starnes-sr-HCbB3G1BuOY-unsplash.jpg',
  '/assets/listing-photos/roger-starnes-sr-pGH1-iHveX0-unsplash.jpg',
  '/assets/listing-photos/roger-starnes-sr-RUy7Q-8K6ag-unsplash.jpg',
  '/assets/listing-photos/ronnie-george-z11gbBo13ro-unsplash.jpg',
  '/assets/listing-photos/sasha-matveeva-EMa3jAiHGyI-unsplash.jpg',
  '/assets/listing-photos/sieuwert-otterloo-aren8nutd1Q-unsplash.jpg',
  '/assets/listing-photos/sigmund-2BwV9My8xAo-unsplash.jpg',
  '/assets/listing-photos/spacejoy-trG8989WjFA-unsplash.jpg',
  '/assets/listing-photos/spacejoy-YI2YkyaREHk-unsplash.jpg',
  '/assets/listing-photos/the-walters-art-museum-NW9wEO9Ay5U-unsplash.jpg',
  '/assets/listing-photos/theo-laflamme-Lm8Tj1f-bXk-unsplash.jpg',
  '/assets/listing-photos/todd-kent-178j8tJrNlc-unsplash.jpg',
  '/assets/listing-photos/ubeyonroad--1zTWWTqEtA-unsplash.jpg',
  '/assets/listing-photos/webaliser-_TPTXZd9mOo-unsplash.jpg',
  '/assets/listing-photos/wiseman-mabasa-D1Uxks4j9IQ-unsplash.jpg',
];

/**
 * Get a random photo from the listing photos folder
 * Uses a seeded random based on listing ID for consistency
 * Same listing ID always returns same photo, different IDs get different photos
 */
export function getRandomListingPhoto(listingId) {
  // Create a consistent hash from the listing ID
  // This ensures the same listing always shows the same photo
  let hash = 0;
  const idStr = listingId.toString();
  for (let i = 0; i < idStr.length; i++) {
    const char = idStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % LISTING_PHOTOS.length;
  return LISTING_PHOTOS[index];
}

/**
 * Get a truly random photo (not seeded)
 */
export function getRandomPhoto() {
  return LISTING_PHOTOS[Math.floor(Math.random() * LISTING_PHOTOS.length)];
}
