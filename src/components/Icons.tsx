// Icon paths come from the Figma components (Icon / globe, sun, moon, chev, check).
// They use currentColor so they follow the light and dark themes.

type IconProps = { className?: string; size?: number };

export function GlobeIcon({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M9 2.2998C9.12336 2.2998 9.32224 2.35881 9.58691 2.63867C9.85318 2.92023 10.1298 3.3713 10.3789 3.99414C10.8753 5.23535 11.2002 7.00487 11.2002 9C11.2002 10.9951 10.8753 12.7646 10.3789 14.0059C10.1298 14.6287 9.85318 15.0798 9.58691 15.3613C9.32224 15.6412 9.12336 15.7002 9 15.7002C8.87664 15.7002 8.67776 15.6412 8.41309 15.3613C8.14682 15.0798 7.87023 14.6287 7.62109 14.0059C7.12469 12.7646 6.7998 10.9951 6.7998 9C6.7998 7.00487 7.12469 5.23535 7.62109 3.99414C7.87023 3.3713 8.14682 2.92023 8.41309 2.63867C8.67776 2.35881 8.87664 2.2998 9 2.2998Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M1.5 9H16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SunIcon({ className, size = 16 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="1.76667" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M8 1.33333V2.66667M8 13.3333V14.6667M1.33333 8H2.66667M13.3333 8H14.6667M3.26667 3.26667L4.2 4.2M11.8 11.8L12.7333 12.7333M3.26667 12.7333L4.2 11.8M11.8 4.2L12.7333 3.26667"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MoonIcon({ className, size = 16 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M7.48555 13.9746C10.5677 14.2597 13.3696 12.1214 14 8.91388C11.2681 10.1969 8.60631 9.84049 6.92517 8.12983C5.24402 6.41918 5.10392 3.92448 6.08459 2C3.84306 2.85533 2.23196 4.99364 2.02182 7.48834C1.74162 10.8384 4.1933 13.6895 7.48555 13.9746Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="6" viewBox="0 0 11.8 7.8" fill="none" overflow="visible" aria-hidden="true">
      <path d="M0.9 0.9L5.9 6.9L10.9 0.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className, size = 16 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Figma "Check" badge on the confirmation page (96 x 96). */
export function CheckBadge({ className }: { className?: string }) {
  return (
    <svg className={className} width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect width="96" height="96" rx="48" fill="var(--leaf)" />
      <path d="M26 49L42 65L70 31" stroke="var(--white)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoDot({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="13" fill="var(--leaf)" />
    </svg>
  );
}
