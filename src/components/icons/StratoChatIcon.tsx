interface StratoChatIconProps {
  size?: number;
  className?: string;
}

/** Dynatrace Strato ChatIcon paths (viewBox 0 0 20 20). */
export function StratoChatIcon({ size = 16, className }: StratoChatIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      aria-hidden="true"
    >
      <path d="M3 3.5h14a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1h-5.722L5.25 18.5V15H3a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1M3.5 5v8.5h3.25V16l4.306-2.5H16.5V5z" />
      <path d="M5 8.5h2v2H5z" />
      <path d="M9 8.5h2v2H9z" />
      <path d="M13 8.5h2v2h-2z" />
    </svg>
  );
}
