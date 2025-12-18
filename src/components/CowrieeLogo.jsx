export default function CowrieLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Define gradients for realistic shell */}
      <defs>
        <linearGradient id="shellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#fefbf3", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "#f5f1e8", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#e8e3d8", stopOpacity: 1 }} />
        </linearGradient>
        <radialGradient id="shellShine" cx="30%" cy="25%">
          <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Main cowrie shell - rounded egg shape */}
      <ellipse
        cx="50"
        cy="48"
        rx="28"
        ry="35"
        fill="url(#shellGradient)"
        stroke="#d4cec1"
        strokeWidth="0.5"
      />

      {/* Shell shine/gloss */}
      <ellipse
        cx="38"
        cy="32"
        rx="18"
        ry="22"
        fill="url(#shellShine)"
      />

      {/* Characteristic cowrie opening/mouth - darker curved slit */}
      <path
        d="M 35 62 Q 50 70 65 62"
        stroke="#2d1810"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Inner mouth shadow for depth */}
      <path
        d="M 36 63 Q 50 68 64 63"
        stroke="#4a3728"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Shell ridges/texture lines for realism */}
      <path
        d="M 40 35 Q 50 30 60 35"
        stroke="rgba(212, 206, 193, 0.6)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 38 48 Q 50 45 62 48"
        stroke="rgba(212, 206, 193, 0.5)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 40 58 Q 50 56 60 58"
        stroke="rgba(212, 206, 193, 0.4)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
