const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ComplianceRing({ score }: { score: number }) {
  const color = score >= 90 ? '#27ae60' : score >= 60 ? '#e67e22' : '#c0392b';
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg viewBox="0 0 80 80" width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="#e9ecef" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-lg font-bold text-gray-900" style={{ color }}>
          {score}%
        </div>
        <div className="text-[9px] text-gray-400 uppercase tracking-wide">Score</div>
      </div>
    </div>
  );
}
