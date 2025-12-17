/**
 * Get a random listing photo
 * Photos are dynamically imported from the assets folder using Parcel's glob feature
 */

// Dynamically import all photos from the assets folder
const photoModules = import.meta.glob('../assets/listing-photos/*.jpg', { eager: true });

// Extract the default exports (image URLs) from the modules
export const LISTING_PHOTOS = Object.values(photoModules).map(m => m.default).filter(Boolean);

// Simple fallback: an inline SVG data URL so the UI never shows a broken-image icon
const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
    <rect width='100%' height='100%' fill='%23101a2b'/>
    <g fill='%2388bdbc' font-family='Inter, Arial, sans-serif' font-size='28'>
      <text x='50%' y='48%' text-anchor='middle' dominant-baseline='middle'>Image unavailable</text>
      <text x='50%' y='58%' text-anchor='middle' dominant-baseline='middle' font-size='18' fill='%2399a7ad'>Please refresh or check the build</text>
    </g>
  </svg>
`)}`;

/**
 * Get a random photo from the listing photos
 * Uses a simple hash based on listing ID for consistency
 * Same listing ID always returns same photo, different IDs get different photos
 */
export function getRandomListingPhoto(listingId) {
  // Support numeric IDs and string IDs (e.g. Firestore doc ids)
  // For strings we compute a deterministic 32-bit hash (FNV-1a) then mix with a prime
  if (listingId == null) return getRandomPhoto();

  const toUint32FromString = (s) => {
    let h = 2166136261; // FNV offset basis
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  let idNum;
  if (typeof listingId === 'number' && Number.isFinite(listingId)) {
    idNum = listingId >>> 0;
  } else if (typeof listingId === 'string' && /^[0-9]+$/.test(listingId)) {
    // numeric string
    idNum = parseInt(listingId, 10) >>> 0;
  } else {
    // fallback: hash the string deterministically
    idNum = toUint32FromString(String(listingId));
  }

  // Guard: if imports failed and there are no photos, return a placeholder
  if (!LISTING_PHOTOS || LISTING_PHOTOS.length === 0) {
    console.warn("Listing photos not available, using placeholder image");
    return PLACEHOLDER_SVG;
  }

  // Multiply by a large prime (Knuth's multiplicative constant) and take unsigned
  const mixed = Math.imul(idNum, 2654435761) >>> 0;
  const index = mixed % LISTING_PHOTOS.length;
  const p = LISTING_PHOTOS[index];
  return p || PLACEHOLDER_SVG;
}

/**
 * Get a truly random photo (not seeded)
 */
export function getRandomPhoto() {
  if (!LISTING_PHOTOS || LISTING_PHOTOS.length === 0) return PLACEHOLDER_SVG;
  return LISTING_PHOTOS[Math.floor(Math.random() * LISTING_PHOTOS.length)];
}
