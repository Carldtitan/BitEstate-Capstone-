/**
 * Get a random listing photo
 * Use direct file paths - Parcel serves static assets from src/
 */

// Array of photo filenames (relative to public folder during build)
export const LISTING_PHOTOS = [
  'listing-photos/aubrey-odom-ITzfgP77DTg-unsplash.jpg',
  'listing-photos/austin-Jmi3nWiILOc-unsplash.jpg',
  'listing-photos/brett-jordan-5x_JYiq5PHk-unsplash.jpg',
  '/listing-photos/dan-begel-cmZfiElLkO8-unsplash.jpg',
  'listing-photos/devon-mackay-2TqK32k2ZCc-unsplash.jpg',
  'listing-photos/devon-mackay-fhU7X34rCAE-unsplash.jpg',
  'listing-photos/dillon-kydd-2keCPb73aQY-unsplash.jpg',
  'listing-photos/dillon-kydd-XGvwt544g8k-unsplash.jpg',
  'listing-photos/jason-briscoe-UV81E0oXXWQ-unsplash.jpg',
  'listing-photos/julia-rodriguez-s7Ys6yORjFI-unsplash.jpg',
  'listing-photos/karina-g-O4G2VR9Leb0-unsplash.jpg',
  'listing-photos/kelvin-taylor-cx1xEBnKhf8-unsplash.jpg',
  'listing-photos/kenny-eliason-mGZX2MOPR-s-unsplash.jpg',
  'listing-photos/paul-kapischka-NLbMgDBio4Y-unsplash.jpg',
  'listing-photos/roger-starnes-sr-HCbB3G1BuOY-unsplash.jpg',
  'listing-photos/roger-starnes-sr-pGH1-iHveX0-unsplash.jpg',
  'listing-photos/roger-starnes-sr-RUy7Q-8K6ag-unsplash.jpg',
  'listing-photos/ronnie-george-z11gbBo13ro-unsplash.jpg',
  'listing-photos/sasha-matveeva-EMa3jAiHGyI-unsplash.jpg',
  'listing-photos/sieuwert-otterloo-aren8nutd1Q-unsplash.jpg',
  'listing-photos/sigmund-2BwV9My8xAo-unsplash.jpg',
  'listing-photos/spacejoy-trG8989WjFA-unsplash.jpg',
  'listing-photos/spacejoy-YI2YkyaREHk-unsplash.jpg',
  'listing-photos/the-walters-art-museum-NW9wEO9Ay5U-unsplash.jpg',
  'listing-photos/theo-laflamme-Lm8Tj1f-bXk-unsplash.jpg',
  'listing-photos/todd-kent-178j8tJrNlc-unsplash.jpg',
  'listing-photos/ubeyonroad--1zTWWTqEtA-unsplash.jpg',
  'listing-photos/webaliser-_TPTXZd9mOo-unsplash.jpg',
  'listing-photos/wiseman-mabasa-D1Uxks4j9IQ-unsplash.jpg',
];

// Debug log so you can see the exact URL used for a sample listing in the browser console
if (typeof window !== 'undefined') {
  console.log('Listing photos sample URL:', LISTING_PHOTOS[0]);
}

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
