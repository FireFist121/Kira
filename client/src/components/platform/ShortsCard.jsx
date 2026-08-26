/**
 * Vertical short / reel card (9:16).
 * Props: title, image, views, tags[], onClick
 */
export default function ShortsCard({
  title = '',
  image = '',
  views = '',
  tags = [],
  onClick,
  className = '',
}) {
  const tagList = Array.isArray(tags) ? tags : []

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        relative overflow-hidden group flex w-full flex-col bg-[#111] border border-white/5 rounded-2xl
        transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        hover:scale-[1.05] hover:-translate-y-2
        hover:border-[#e5173f]/50
        hover:shadow-[0_24px_60px_-12px_rgba(229,23,63,0.4),0_0_0_1px_rgba(229,23,63,0.15)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5173f]/60
        ${!onClick ? 'cursor-default' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Glowing top border on hover */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e5173f] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-10" />

      <div className="relative aspect-[9/16] w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
        {!image && (
          <div className="absolute inset-0 flex h-full items-center justify-center text-neutral-600 px-3 text-center">
            {title || 'No thumbnail'}
          </div>
        )}
        {image && (
          <img
            src={image}
            alt={title || 'Short'}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML += `<div class="absolute inset-0 flex h-full items-center justify-center text-neutral-600 px-3 text-center bg-neutral-900">${title || 'No thumbnail'}</div>`;
            }}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:scale-110 group-hover:brightness-105"
          />
        )}

        {/* Dark gradient overlay base */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Shimmer sweep */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out z-10" />

        {/* Play Icon — pops out on hover */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
          <div className="rounded-full border border-white/25 bg-black/40 p-3.5 text-white/90 backdrop-blur-sm
            transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
            scale-75 opacity-0
            group-hover:scale-100 group-hover:opacity-100
            group-hover:border-white/60 group-hover:bg-[#e5173f]/90
            group-hover:shadow-[0_0_30px_rgba(229,23,63,0.6)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Badges */}
        <span className="absolute left-2 top-2 z-30 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/10">
          SHORT
        </span>
        {views !== '' && views != null ? (
          <span className="absolute right-2 top-2 z-30 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md border border-white/10">
            {views} views
          </span>
        ) : null}

        {/* Bottom title */}
        {title && (
          <div className="absolute inset-x-0 bottom-0 z-20 px-2.5 pb-2.5 pt-8 bg-gradient-to-t from-black/90 to-transparent translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
            <p className="line-clamp-2 text-[11px] font-semibold text-white leading-tight">{title}</p>
          </div>
        )}
      </div>
    </button>
  )
}
