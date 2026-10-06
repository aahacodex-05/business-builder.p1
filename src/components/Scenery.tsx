const WIDTH = 1440;

/** A Douglas fir outline, as [x, y] multiples of its height measured from the tip. */
const FIR: [number, number][] = [
  [0, 0], [0.13, 0.34], [0.06, 0.34], [0.2, 0.64], [0.09, 0.64], [0.26, 0.93], [0.03, 0.93], [0.03, 1],
  [-0.03, 1], [-0.03, 0.93], [-0.26, 0.93], [-0.09, 0.64], [-0.2, 0.64], [-0.06, 0.34], [-0.13, 0.34],
];

/** Deterministic 0–1 noise, so tree lines look hand-placed but render the same every time. */
function noise(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

type Row = { base: number; count: number; minHeight: number; maxHeight: number; seed: number; width?: number };

/** One SVG path for a row of firs standing on `base`. */
export function firRow({ base, count, minHeight, maxHeight, seed, width = WIDTH }: Row) {
  return Array.from({ length: count }, (_, i) => {
    const height = minHeight + noise(seed + i) * (maxHeight - minHeight);
    const x = ((i + 0.2 + noise(seed + i + 500) * 0.6) / count) * width;
    const tip = base - height;
    const points = FIR.map(([dx, dy]) => `${(x + dx * height).toFixed(1)} ${(tip + dy * height).toFixed(1)}`);
    return `M${points.join("L")}Z`;
  }).join("");
}

/** Mt. Hood over two lines of firs, standing on the espresso ground of the next section. */
export function Landscape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path className="scene__hills" d="M0 226C180 188 330 212 470 202S760 174 940 194 1260 212 1440 186V300H0Z" />
      <path className="scene__mountain" d="M560 300 760 120 820 82 850 52 872 40 896 60 942 92 1000 132 1180 300Z" />
      <path className="scene__snow" d="M820 82 850 52 872 40 896 60 942 92 916 101 894 86 872 106 852 88 834 99Z" />
      <path className="scene__firs-far" d={firRow({ base: 262, count: 46, minHeight: 34, maxHeight: 72, seed: 1 })} />
      <path className="scene__firs-near" d={firRow({ base: 300, count: 30, minHeight: 70, maxHeight: 150, seed: 7 })} />
      <rect className="scene__ground" y="286" width="1440" height="14" />
    </svg>
  );
}

/** A strip of firs that grows out of the section below it. */
export function TreeLine({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d={firRow({ base: 120, count: 34, minHeight: 40, maxHeight: 112, seed: 21 })} />
      <rect y="112" width="1440" height="8" />
    </svg>
  );
}
