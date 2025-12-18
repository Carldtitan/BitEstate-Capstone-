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

      {/* Main cowrie shell - more horizontal rounded shape */}
      <ellipse
        cx="50"
        cy="50"
        rx="35"
        ry="26"
        fill="url(#shellGradient)"
        stroke="#d4cec1"
        strokeWidth="0.5"
      />

      {/* Shell shine/gloss */}
      <ellipse
        cx="38"
        cy="38"
        rx="22"
        ry="16"
        fill="url(#shellShine)"
      />

      {/* Characteristic cowrie opening/mouth - darker curved slit */}
      <path
        d="M 32 58 Q 50 65 68 58"
        stroke="#2d1810"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Inner mouth shadow for depth */}
      <path
        d="M 33 59 Q 50 64 67 59"
        stroke="#4a3728"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Shell ridges/texture lines for realism */}
      <path
        d="M 35 38 Q 50 33 65 38"
        stroke="rgba(212, 206, 193, 0.6)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 32 50 Q 50 47 68 50"
        stroke="rgba(212, 206, 193, 0.5)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 35 60 Q 50 58 65 60"
        stroke="rgba(212, 206, 193, 0.4)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
