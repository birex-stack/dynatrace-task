interface StickyNotePlusIconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

/** Sticky-note with folded corner and plus — one-click capture glyph. */
export function StickyNotePlusIcon({
  size = 16,
  strokeWidth = 1.8,
  className,
  color,
}: StickyNotePlusIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      focusable="false"
      aria-hidden="true"
    >
      <path d="M5 3h12a2 2 0 0 1 2 2v9.2L13.8 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M13.8 21v-5.2a1 1 0 0 1 1-1H21" />
      <path d="M9.5 10.5h5" />
      <path d="M12 8v5" />
    </svg>
  );
}
