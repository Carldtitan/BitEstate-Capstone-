import { useState, useCallback } from "react";
import { getRandomListingPhoto } from "../utils/listingPhotos";

const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
    <rect width='100%' height='100%' fill='%23101a2b'/>
    <g fill='%2388bdbc' font-family='Inter, Arial, sans-serif' font-size='28'>
      <text x='50%' y='48%' text-anchor='middle' dominant-baseline='middle'>Image unavailable</text>
    </g>
  </svg>
`)};

export default function ImageWithFallback({ src, alt = "", className, listingId, ...rest }) {
  const normalized = (s) => (s ? (s.startsWith("/") ? s : "/" + s) : s);
  const candidates = [];
  if (src) {
    candidates.push(src);
    candidates.push(normalized(src));
    // also try without leading slash
    if (src.startsWith("/")) candidates.push(src.slice(1));
  }
  // seeded fallback based on listing id (always starts with '/listing-photos/...')
  const seeded = listingId != null ? getRandomListingPhoto(listingId) : null;
  if (seeded) candidates.push(seeded);
  candidates.push(PLACEHOLDER_SVG);

  const [index, setIndex] = useState(0);
  const current = candidates[index] || PLACEHOLDER_SVG;

  const onError = useCallback(() => {
    setIndex((i) => Math.min(i + 1, candidates.length - 1));
  }, [candidates.length]);

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img src={current} alt={alt} className={className} onError={onError} {...rest} />
  );
}
