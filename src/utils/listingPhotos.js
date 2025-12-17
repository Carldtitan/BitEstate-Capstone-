/**
 * Get a random listing photo
 * Photos should be placed in src/assets/listing-photos/
 * Name them: photo1.jpg, photo2.jpg, photo3.jpg, etc.
 */

// List of available stock photos in src/assets/listing-photos/
// Add more as you add photos to the folder
export const LISTING_PHOTOS = Array.from({ length: 25 }, (_, i) => 
  `/assets/listing-photos/photo${i + 1}.jpg`
);

/**
 * Get a random photo from the listing photos folder
 * Uses a seeded random based on listing ID for consistency
 */
export function getRandomListingPhoto(listingId) {
  // Create a consistent hash from the listing ID
  // This ensures the same listing always shows the same photo
  let hash = 0;
  for (let i = 0; i < listingId.toString().length; i++) {
    const char = listingId.toString().charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % LISTING_PHOTOS.length;
  return LISTING_PHOTOS[index];
}

/**
 * Get a random photo without seeding
 * Truly random selection
 */
export function getRandomPhoto() {
  return LISTING_PHOTOS[Math.floor(Math.random() * LISTING_PHOTOS.length)];
}
