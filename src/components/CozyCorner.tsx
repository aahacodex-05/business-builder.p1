import { firRow } from "./Scenery";

const WINDOW = "M48 250V140a92 92 0 0 1 184 0v110Z";

/** Illustration of the shop's lounge: a couch under a rainy window, a reading lamp and a work table. */
export function CozyCorner() {
  return (
    <svg
      className="cozy"
      viewBox="0 0 600 440"
      role="img"
      aria-label="A green couch under a rainy window, with a reading lamp, a laptop and a mug of coffee"
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

      <circle cx="455" cy="140" r="135" fill="url(#cozy-glow)" />

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

      <ellipse className="cozy__rug" cx="290" cy="418" rx="230" ry="16" />

      <path className="cozy__leaf" d="M82 330C58 300 60 268 70 252 86 276 92 304 82 330ZM82 330C96 296 116 284 132 282 124 306 106 324 82 330ZM82 330C70 310 46 302 34 304 44 322 62 332 82 330Z" />
      <rect className="cozy__pot" x="62" y="326" width="42" height="50" rx="8" />

      <rect className="cozy__couch" x="150" y="236" width="250" height="86" rx="24" />
      <rect className="cozy__couch" x="136" y="326" width="278" height="36" rx="12" />
      <rect className="cozy__cushion" x="168" y="294" width="106" height="40" rx="12" />
      <rect className="cozy__cushion" x="276" y="294" width="106" height="40" rx="12" />
      <rect className="cozy__arm" x="128" y="272" width="48" height="92" rx="20" />
      <rect className="cozy__arm" x="374" y="272" width="48" height="92" rx="20" />
      <rect className="cozy__pillow" x="178" y="256" width="54" height="46" rx="14" transform="rotate(-10 205 279)" />
      <rect className="cozy__dark" x="152" y="362" width="10" height="16" rx="3" />
      <rect className="cozy__dark" x="388" y="362" width="10" height="16" rx="3" />

      <rect className="cozy__dark" x="452" y="138" width="6" height="236" rx="3" />
      <ellipse className="cozy__dark" cx="455" cy="376" rx="32" ry="7" />
      <path className="cozy__shade" d="M424 96H486L500 140H410Z" />

      <rect className="cozy__laptop" x="236" y="328" width="78" height="46" rx="5" />
      <circle className="cozy__shade" cx="275" cy="351" r="7" />
      <rect className="cozy__laptop-base" x="228" y="370" width="94" height="5" rx="2" />
      <rect className="cozy__mug" x="336" y="350" width="24" height="22" rx="5" />
      <path className="cozy__handle" d="M360 355a7 7 0 0 1 0 12" />
      <path className="cozy__steam" d="M343 342c-4-6 4-10 0-16M353 342c-4-6 4-10 0-16" />
      <rect className="cozy__wood" x="210" y="374" width="170" height="12" rx="6" />
      <rect className="cozy__wood" x="226" y="384" width="8" height="32" rx="3" />
      <rect className="cozy__wood" x="356" y="384" width="8" height="32" rx="3" />
    </svg>
  );
}
