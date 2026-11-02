const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function IconTrain(): JSX.Element {
  return (
    <svg {...base}>
      <path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />
    </svg>
  );
}

export function IconHistory(): JSX.Element {
  return (
    <svg {...base}>
      <path d="M4 19V11M10 19V5M16 19v-6M22 19H2" />
    </svg>
  );
}

export function IconGuide(): JSX.Element {
  return (
    <svg {...base}>
      <path d="M5 4.5h10.5L19 8v11.5H5z" />
      <path d="M8.5 10.5h7M8.5 14h7" />
    </svg>
  );
}

export function IconSettings(): JSX.Element {
  return (
    <svg {...base}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.4 3.6-5.5 7-5.5s6.2 2.1 7 5.5" />
    </svg>
  );
}

export function IconClock(): JSX.Element {
  return (
    <svg {...base} width={15} height={15}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2M9.5 2.5h5" />
    </svg>
  );
}

export function IconCheck(): JSX.Element {
  return (
    <svg {...base} width={18} height={18} strokeWidth={2.4}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
