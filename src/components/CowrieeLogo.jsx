export default function CowrieLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Define gradients */}
      <defs>
        <linearGradient id="cowrieGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#22d3ee", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#14b8a6", stopOpacity: 1 }} />
        </linearGradient>
        <radialGradient id="cowrieShine" cx="35%" cy="35%">
          <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 0.4 }} />
          <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Main cowrie shell body - smooth oval */}
      <ellipse
        cx="50"
        cy="42"
        rx="32"
        ry="38"
        fill="url(#cowrieGradient)"
        stroke="#0b8c8c"
        strokeWidth="1"
      />

      {/* Shell shine/gloss effect */}
      <ellipse
        cx="50"
        cy="42"
        rx="32"
        ry="38"
        fill="url(#cowrieShine)"
      />

      {/* Cowrie opening/slit at bottom */}
      <ellipse
        cx="50"
        cy="68"
        rx="14"
        ry="8"
        fill="#0b1221"
        opacity="0.6"
      />

      {/* Opening detail - curved lines */}
      <path
        d="M 38 68 Q 50 72 62 68"
        stroke="#22d3ee"
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />

      {/* Ridge detail for depth */}
      <path
        d="M 35 45 Q 50 38 65 45"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
