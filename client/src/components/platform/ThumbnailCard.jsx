/**
 * Reusable thumbnail / design gallery card.
 * Props: title, image, onClick, className, showTitleOverlay (default true when title)
 */
export default function ThumbnailCard({
  title = '',
  image = '',
  onClick,
  className = '',
  showTitleOverlay = true,
  alt,
}) {
  const hasImage = Boolean(image?.trim())

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        block aspect-video relative overflow-hidden group w-full bg-[#111] border border-white/5 rounded-2xl
        transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        hover:scale-[1.04] hover:-translate-y-2
        hover:border-[#e5173f]/50
        hover:shadow-[0_24px_60px_-12px_rgba(229,23,63,0.35),0_0_0_1px_rgba(229,23,63,0.15)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5173f]/60
        ${!onClick ? 'cursor-default opacity-90' : 'cursor-zoom-in'}
        ${className}
      `}
    >
      {/* Glowing top border on hover */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e5173f] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-10" />

      <div className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-900 flex items-center justify-center">
        {!hasImage && (
          <div className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm text-neutral-500">
            {title || 'Thumbnail'}
          </div>
        )}
        {hasImage && (
          <img
            src={image}
            alt={alt || title || 'Thumbnail'}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML += `<div class="absolute inset-0 flex items-center justify-center px-3 text-center text-sm text-neutral-500 bg-neutral-900">${title || 'Thumbnail'}</div>`;
            }}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:scale-110 group-hover:brightness-110"
          />
        )}

        {/* Shimmer sweep on hover */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out z-10" />

        {showTitleOverlay && title && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 py-3 pt-12 opacity-0 transition-all duration-300 group-hover:opacity-100 flex items-end translate-y-2 group-hover:translate-y-0">
            <p className="line-clamp-2 text-[13px] font-semibold text-white drop-shadow-md">{title}</p>
          </div>
        )}
      </div>
    </button>
  )
}
