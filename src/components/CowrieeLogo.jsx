export default function CowrieLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bitestateMark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <rect x="16" y="12" width="68" height="76" rx="16" fill="url(#bitestateMark)" />
      <rect x="28" y="22" width="44" height="8" rx="4" fill="#0b1221" opacity="0.9" />
      <rect x="28" y="36" width="24" height="8" rx="4" fill="#0b1221" opacity="0.9" />
      <rect x="28" y="50" width="34" height="8" rx="4" fill="#0b1221" opacity="0.9" />
      <path
        d="M66 47c7 0 12 5 12 12s-5 12-12 12-12-5-12-12 5-12 12-12Zm0 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"
        fill="#0b1221"
        opacity="0.92"
      />
    </svg>
  );
}
