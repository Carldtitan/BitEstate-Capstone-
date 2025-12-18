export default function CowrieLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="simpleShell" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#faf8f3", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#ede9e0", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Main shell body - simple horizontal ellipse */}
      <ellipse
        cx="60"
        cy="45"
        rx="45"
        ry="32"
        fill="url(#simpleShell)"
        stroke="#ccc8c0"
        strokeWidth="1"
      />

      {/* Simple shine on top */}
      <ellipse
        cx="45"
        cy="30"
        rx="20"
        ry="14"
        fill="white"
        opacity="0.35"
      />

      {/* Dark curved mouth - the defining feature */}
      <path
        d="M 30 60 Q 60 72 90 60"
        stroke="#3d3531"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
