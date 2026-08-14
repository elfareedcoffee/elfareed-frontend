export function Stamp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle
        cx="60"
        cy="60"
        r="56"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="5 3"
      />
      <circle cx="60" cy="60" r="47" fill="none" stroke="currentColor" strokeWidth="1" />
      <text
        x="60"
        y="52"
        textAnchor="middle"
        fill="currentColor"
        style={{ font: '26px "Rakkas", serif' }}
      >
        بن
      </text>
      <text
        x="60"
        y="80"
        textAnchor="middle"
        fill="currentColor"
        style={{ font: '24px "Rakkas", serif' }}
      >
        الفريد
      </text>
      <path d="M28 60 H40 M80 60 H92" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
