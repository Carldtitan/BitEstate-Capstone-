/**
 * Get a random listing photo
 * Photos are imported to ensure Parcel bundles them correctly
 */

// Import all photos
import photo1 from '../assets/listing-photos/aubrey-odom-ITzfgP77DTg-unsplash.jpg';
import photo2 from '../assets/listing-photos/austin-Jmi3nWiILOc-unsplash.jpg';
import photo3 from '../assets/listing-photos/brett-jordan-5x_JYiq5PHk-unsplash.jpg';
import photo4 from '../assets/listing-photos/dan-begel-cmZfiElLkO8-unsplash.jpg';
import photo5 from '../assets/listing-photos/devon-mackay-2TqK32k2ZCc-unsplash.jpg';
import photo6 from '../assets/listing-photos/devon-mackay-fhU7X34rCAE-unsplash.jpg';
import photo7 from '../assets/listing-photos/dillon-kydd-2keCPb73aQY-unsplash.jpg';
import photo8 from '../assets/listing-photos/dillon-kydd-XGvwt544g8k-unsplash.jpg';
import photo9 from '../assets/listing-photos/jason-briscoe-UV81E0oXXWQ-unsplash.jpg';
import photo10 from '../assets/listing-photos/julia-rodriguez-s7Ys6yORjFI-unsplash.jpg';
import photo11 from '../assets/listing-photos/karina-g-O4G2VR9Leb0-unsplash.jpg';
import photo12 from '../assets/listing-photos/kelvin-taylor-cx1xEBnKhf8-unsplash.jpg';
import photo13 from '../assets/listing-photos/kenny-eliason-mGZX2MOPR-s-unsplash.jpg';
import photo14 from '../assets/listing-photos/paul-kapischka-NLbMgDBio4Y-unsplash.jpg';
import photo15 from '../assets/listing-photos/roger-starnes-sr-HCbB3G1BuOY-unsplash.jpg';
import photo16 from '../assets/listing-photos/roger-starnes-sr-pGH1-iHveX0-unsplash.jpg';
import photo17 from '../assets/listing-photos/roger-starnes-sr-RUy7Q-8K6ag-unsplash.jpg';
import photo18 from '../assets/listing-photos/ronnie-george-z11gbBo13ro-unsplash.jpg';
import photo19 from '../assets/listing-photos/sasha-matveeva-EMa3jAiHGyI-unsplash.jpg';
import photo20 from '../assets/listing-photos/sieuwert-otterloo-aren8nutd1Q-unsplash.jpg';
import photo21 from '../assets/listing-photos/sigmund-2BwV9My8xAo-unsplash.jpg';
import photo22 from '../assets/listing-photos/spacejoy-trG8989WjFA-unsplash.jpg';
import photo23 from '../assets/listing-photos/spacejoy-YI2YkyaREHk-unsplash.jpg';
import photo24 from '../assets/listing-photos/the-walters-art-museum-NW9wEO9Ay5U-unsplash.jpg';
import photo25 from '../assets/listing-photos/theo-laflamme-Lm8Tj1f-bXk-unsplash.jpg';
import photo26 from '../assets/listing-photos/todd-kent-178j8tJrNlc-unsplash.jpg';
import photo27 from '../assets/listing-photos/ubeyonroad--1zTWWTqEtA-unsplash.jpg';
import photo28 from '../assets/listing-photos/webaliser-_TPTXZd9mOo-unsplash.jpg';
import photo29 from '../assets/listing-photos/wiseman-mabasa-D1Uxks4j9IQ-unsplash.jpg';

// Array of imported photos
export const LISTING_PHOTOS = [
  photo1, photo2, photo3, photo4, photo5, photo6, photo7, photo8, photo9, photo10,
  photo11, photo12, photo13, photo14, photo15, photo16, photo17, photo18, photo19, photo20,
  photo21, photo22, photo23, photo24, photo25, photo26, photo27, photo28, photo29,
];

/**
 * Get a random photo from the listing photos
 * Uses a seeded random based on listing ID for consistency
 * Same listing ID always returns same photo, different IDs get different photos
 */
export function getRandomListingPhoto(listingId) {
  // Create a consistent hash from the listing ID
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
