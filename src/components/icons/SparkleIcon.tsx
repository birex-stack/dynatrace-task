interface SparkleIconProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Single filled 4-point sparkle (AI glyph).
 * Color via `color` prop or inherited CSS `currentColor`.
 */
export function SparkleIcon({ size = 28, className, color }: SparkleIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill={color ?? 'currentColor'}
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      aria-hidden="true"
    >
      <path d="M10 1.2c.28 3.55 1.7 5.75 5.4 6.3-3.7.55-5.12 2.75-5.4 6.3-.28-3.55-1.7-5.75-5.4-6.3 3.7-.55 5.12-2.75 5.4-6.3Z" />
    </svg>
  );
}
