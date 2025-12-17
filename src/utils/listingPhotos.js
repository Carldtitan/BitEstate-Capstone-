/**
 * Get a random listing photo
 * Use public CDN images for reliability across environments (localhost, Vercel, etc.)
 */

// Free stock photos from public CDN (Unsplash via CDN)
// These URLs are publicly available and work everywhere
export const LISTING_PHOTOS = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507652313519-d4dc28e7e4df?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1508873699372-f003971e4bcc?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1513161455079-7ef1a826e90d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1522331289122-9ba5e6cfe1eb?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1523217311519-3e73ea694f0f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1533090161767-e6ffb9bedf60?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1505576399279-565b52f4ac71?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1512174786901-a088e8e5b318?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1549887534-f3760632-d7dd-4f20-a93f-4e8f27ce97b4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1516567867245-4c5a2e61e219?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1512217867899-ab841d3c1f75?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507652313519-d4dc28e7e4df?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1518896552869-9a7a52c78b69?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1522184212e51-6a9ac8a45fe5?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1514981891620-a86b8c5200b7?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1494145904049-0dca7b1dd15d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1502895917128-be aa5c11b504?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1530268729831-4ca8f14ec9f7?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1494145904049-0dca7b1dd15d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1502893691121-c1181d8b0bc8?w=400&h=300&fit=crop',
];

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
