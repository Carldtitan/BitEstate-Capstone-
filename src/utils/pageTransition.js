/**
 * Page transition utilities for smooth navigation
 */

export function usePageTransition() {
  return {
    fadeIn: "fadeIn 0.4s ease-out",
    slideUp: "slideUp 0.5s ease-out",
    slideDown: "slideDown 0.5s ease-out",
  };
}

export function PageTransition({ children, delay = 0 }) {
  const style = {
    animation: `slideUp 0.5s ease-out ${delay}s backwards`,
  };

  return <div style={style}>{children}</div>;
}
