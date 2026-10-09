import type { Kind } from "@/data/menu";

/** Stand-in artwork for a menu item until real product photos are added. */
export function ItemArt({ kind }: { kind: Kind }) {
  return (
    <div className="item-art drizzle drizzle--light" aria-hidden="true">
      <svg viewBox="0 0 400 400">
        <circle className="item-art__sun" cx="200" cy="200" r="140" />
        {kind === "drink" ? (
          <g>
            <path className="item-art__steam" d="M170 140c-10-14 10-22 0-38M200 140c-10-14 10-22 0-38M230 140c-10-14 10-22 0-38" />
            <ellipse className="item-art__paper" cx="200" cy="300" rx="104" ry="14" />
            <path className="item-art__paper" d="M128 158h144v86a50 50 0 0 1-50 50h-44a50 50 0 0 1-50-50Z" />
            <path className="item-art__handle" d="M272 182h14a28 28 0 0 1 0 56h-14" />
            <circle className="item-art__badge" cx="200" cy="226" r="28" />
            <circle className="item-art__sun" cx="200" cy="226" r="17" />
          </g>
        ) : (
          <g>
            <path className="item-art__kraft" d="M126 150h148l14 158H112Z" />
            <path className="item-art__fold" d="M126 150h148v26H126Z" />
            <circle className="item-art__badge" cx="200" cy="242" r="34" />
            <circle className="item-art__sun" cx="200" cy="242" r="21" />
          </g>
        )}
      </svg>
    </div>
  );
}
