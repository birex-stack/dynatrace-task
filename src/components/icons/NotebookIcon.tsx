interface NotebookIconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  absoluteStrokeWidth?: boolean;
  color?: string;
}

export function NotebookIcon({
  size = 24,
  strokeWidth = 2,
  className,
  absoluteStrokeWidth,
  color,
}: NotebookIconProps) {
  const sw = absoluteStrokeWidth
    ? (Number(strokeWidth) * 24) / Number(size)
    : strokeWidth;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      focusable="false"
      aria-hidden="true"
    >
      {/* Wider cover — closer to other 24×24 nav glyphs */}
      <rect x="5" y="3" width="16" height="18" rx="2.5" />
      {/* Binding rings */}
      <path d="M3 8h3.5" />
      <path d="M3 12h3.5" />
      <path d="M3 16h3.5" />
      {/* Cover label lines */}
      <path d="M12 10h5.5" />
      <path d="M12 14h5.5" />
    </svg>
  );
}
