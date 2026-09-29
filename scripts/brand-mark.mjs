// The Arterial mark: three fee streams merging into one vault node.
// Drawn in a 64-unit box. src/components/Logo.tsx renders the same shapes.

export const PULSE = "#F2474B";
export const INK = "#EFE8E2";
export const NIGHT = "#12100F";

export function markShapes(color, width = 6.5) {
  return `
  <g fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 7 C13 22 32 20 32 34"/>
    <path d="M32 5 L32 34"/>
    <path d="M51 7 C51 22 32 20 32 34"/>
  </g>
  <circle cx="32" cy="46" r="11" fill="${color}"/>
  <circle cx="32" cy="46" r="4.2" fill="${NIGHT}"/>`;
}
