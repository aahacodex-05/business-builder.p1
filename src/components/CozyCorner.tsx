import { firRow } from "./Scenery";

const WINDOW = "M48 250V140a92 92 0 0 1 184 0v110Z";

/** An oversized, recliner-style armchair, 150 wide, standing on the floor at y 388. */
function Armchair({ x, tone }: { x: number; tone: "green" | "caramel" }) {
  return (
    <g className={`cozy__chair cozy__chair--${tone}`} transform={`translate(${x} 0)`}>
      <rect className="cozy__body" x="16" y="214" width="118" height="116" rx="34" />
      <path className="cozy__seam" d="M32 254H118M32 292H118" />
      <rect className="cozy__seat" x="30" y="312" width="90" height="34" rx="14" />
      <rect className="cozy__body" x="34" y="340" width="82" height="38" rx="8" />
      <rect className="cozy__arm" x="0" y="276" width="40" height="102" rx="20" />
      <rect className="cozy__arm" x="110" y="276" width="40" height="102" rx="20" />
      <rect className="cozy__dark" x="12" y="374" width="12" height="14" rx="3" />
      <rect className="cozy__dark" x="126" y="374" width="12" height="14" rx="3" />
    </g>
  );
}

/** Illustration of the shop: big armchairs under a rainy window, a reading lamp and a work table. */
export function CozyCorner() {
  return (
    <svg
      className="cozy"
      viewBox="0 0 680 440"
      role="img"
      aria-label="Two big armchairs under a rainy window beside a reading lamp, and a work table with a laptop and coffee"
    >
      <defs>
        <radialGradient id="cozy-glow">
          <stop offset="0" stopColor="#f3a21c" stopOpacity=".45" />
          <stop offset="1" stopColor="#f3a21c" stopOpacity="0" />
        </radialGradient>
        <clipPath id="cozy-glass">
          <path d={WINDOW} />
        </clipPath>
        <pattern id="cozy-rain" width="18" height="30" patternUnits="userSpaceOnUse">
          <path className="cozy__drop" d="M9 3 7 13" />
        </pattern>
      </defs>

      <circle cx="438" cy="140" r="135" fill="url(#cozy-glow)" />

      <g transform="translate(0 -24)">
        <g clipPath="url(#cozy-glass)">
          <rect className="cozy__sky" x="48" y="48" width="184" height="202" />
          <path className="cozy__mountain" d="M66 250 132 166 146 156 160 168 222 250Z" />
          <path className="cozy__snow" d="M132 166 146 156 160 168 152 174 146 168 139 175Z" />
          <path
            className="cozy__firs"
            transform="translate(48 0)"
            d={firRow({ base: 252, count: 8, minHeight: 34, maxHeight: 70, seed: 3, width: 184 })}
          />
          <rect x="48" y="48" width="184" height="202" fill="url(#cozy-rain)" />
        </g>
        <path className="cozy__frame" d={`${WINDOW}M140 48V250M48 162H232`} />
      </g>

      <ellipse className="cozy__rug" cx="254" cy="394" rx="196" ry="14" />

      <path className="cozy__leaf" d="M82 330C58 300 60 268 70 252 86 276 92 304 82 330ZM82 330C96 296 116 284 132 282 124 306 106 324 82 330ZM82 330C70 310 46 302 34 304 44 322 62 332 82 330Z" />
      <rect className="cozy__pot" x="62" y="326" width="42" height="50" rx="8" />

      <rect className="cozy__dark" x="435" y="138" width="6" height="248" rx="3" />
      <ellipse className="cozy__dark" cx="438" cy="386" rx="30" ry="6" />
      <path className="cozy__shade" d="M407 96H469L483 140H393Z" />

      <Armchair x={96} tone="green" />
      <rect className="cozy__pillow" x="140" y="268" width="50" height="44" rx="14" transform="rotate(-10 165 290)" />
      <rect className="cozy__mug" x="215" y="256" width="22" height="22" rx="5" />
      <path className="cozy__handle" d="M237 261a7 7 0 0 1 0 12" />
      <path className="cozy__steam" d="M221 248c-4-6 4-10 0-16M231 248c-4-6 4-10 0-16" />

      <Armchair x={262} tone="caramel" />

      <rect className="cozy__desk-chair" x="526" y="204" width="64" height="12" rx="6" />
      <rect className="cozy__desk-chair" x="532" y="210" width="6" height="178" rx="3" />
      <rect className="cozy__desk-chair" x="578" y="210" width="6" height="178" rx="3" />
      <rect className="cozy__desk-chair" x="524" y="300" width="68" height="8" rx="4" />
      <rect className="cozy__wood" x="468" y="262" width="172" height="12" rx="6" />
      <rect className="cozy__wood" x="480" y="270" width="8" height="118" rx="3" />
      <rect className="cozy__wood" x="620" y="270" width="8" height="118" rx="3" />
      <rect className="cozy__laptop" x="524" y="222" width="68" height="40" rx="5" />
      <circle className="cozy__shade" cx="558" cy="242" r="6" />
      <rect className="cozy__laptop-base" x="518" y="259" width="80" height="4" rx="2" />
      <rect className="cozy__mug" x="604" y="242" width="20" height="20" rx="5" />
      <path className="cozy__handle" d="M624 247a6 6 0 0 1 0 10" />
    </svg>
  );
}
