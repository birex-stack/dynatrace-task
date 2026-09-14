interface AppLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

/** App mark from product icon asset (40×36 in nav). */
export function AppLogo({ width = 40, height = 36, className }: AppLogoProps) {
  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}app-icon.png?v=hex`}
      alt=""
      width={width}
      height={height}
      draggable={false}
      aria-hidden
    />
  );
}
