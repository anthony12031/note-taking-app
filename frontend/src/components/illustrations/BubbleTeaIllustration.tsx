export function BubbleTeaIllustration() {
  return (
    <svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="60" cy="102" rx="34" ry="9" fill="#E8D4C4" opacity={0.5} />
      <path
        d="M42 38 L78 38 L72 92 Q70 100 60 100 Q50 100 48 92 Z"
        fill="#F0DDD6"
        stroke="#C97B84"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M44 48 L76 48"
        stroke="#E8C4B8"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <circle cx="52" cy="72" r="6" fill="#D4A574" opacity={0.85} />
      <circle cx="64" cy="80" r="5" fill="#C97B84" opacity={0.7} />
      <circle cx="58" cy="62" r="5" fill="#E85D04" opacity={0.5} />
      <circle cx="68" cy="66" r="4" fill="#5C7A5C" opacity={0.45} />
      <path
        d="M54 32 Q60 22 66 32"
        stroke="#8B6914"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="60" cy="34" rx="8" ry="4" fill="#C4A574" />
      <circle cx="52" cy="52" r="2.5" fill="#3D3428" />
      <circle cx="64" cy="52" r="2.5" fill="#3D3428" />
      <path
        d="M54 60 Q60 64 66 60"
        stroke="#3D3428"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
