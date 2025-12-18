export default function CowrieLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="simpleShell" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#faf8f3", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#ede9e0", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Main shell body - simple horizontal ellipse, centered */}
      <ellipse
        cx="50"
        cy="42"
        rx="38"
        ry="28"
        fill="url(#simpleShell)"
        stroke="#ccc8c0"
        strokeWidth="0.8"
      />

      {/* Simple shine on top */}
      <ellipse
        cx="40"
        cy="30"
        rx="18"
        ry="12"
        fill="white"
        opacity="0.4"
      />

      {/* Dark curved mouth - the defining feature */}
      <path
        d="M 25 58 Q 50 68 75 58"
        stroke="#3d3531"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
