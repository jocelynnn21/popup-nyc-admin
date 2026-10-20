export function TrendChart({ values }: { values: number[] }) {
  const safe = values.length ? values : [0];
  const max = Math.max(...safe, 1);
  const points = safe.map((value, index) => {
    const x = safe.length === 1 ? 50 : (index / (safe.length - 1)) * 100;
    const y = 92 - (value / max) * 76;
    return `${x},${y}`;
  }).join(" ");

  return <svg className="trend-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Seven-day generation activity">
    {[20, 40, 60, 80].map(y => <line x1="0" x2="100" y1={y} y2={y} key={y} />)}
    <polyline points={points} />
    {safe.map((value, index) => {
      const x = safe.length === 1 ? 50 : (index / (safe.length - 1)) * 100;
      const y = 92 - (value / max) * 76;
      return <circle cx={x} cy={y} r="1.8" key={`${index}-${value}`} />;
    })}
  </svg>;
}
