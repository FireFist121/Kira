/**
 * Long-form video card (YouTube-style).
 * Props: title, image, views, category, tags[], author, onClick, duration (optional)
 */
export default function VideoCard({
  title = '',
  image = '',
  views = '',
  category = '',
  tags = [],
  author = '',
  onClick,
  duration = '',
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        relative overflow-hidden group flex w-full flex-col bg-[#111] border border-white/5 rounded-2xl
        transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        hover:scale-[1.04] hover:-translate-y-2
        hover:border-[#e5173f]/50
        hover:shadow-[0_24px_60px_-12px_rgba(229,23,63,0.35),0_0_0_1px_rgba(229,23,63,0.15)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5173f]/60
        ${!onClick ? 'cursor-default' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Glowing top border on hover */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e5173f] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-10" />

      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
        {!image && (
          <div className="absolute inset-0 flex h-full items-center justify-center text-neutral-600 px-3 text-center">
            {title || 'No thumbnail'}
          </div>
        )}
        {image && (
          <img
            src={image}
            alt={title || 'Video'}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML += `<div class="absolute inset-0 flex h-full items-center justify-center text-neutral-600 px-3 text-center bg-neutral-900">${title || 'No thumbnail'}</div>`;
            }}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:scale-110 group-hover:brightness-110"
          />
        )}

        {/* Shimmer sweep on hover */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out z-10" />

        {/* Play button overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <div className="rounded-full bg-[#e5173f]/90 p-3.5 shadow-[0_0_30px_rgba(229,23,63,0.6)] scale-75 group-hover:scale-100 transition-transform duration-300 backdrop-blur-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Badges Top Left & Right */}
        <div className="absolute left-2 top-2 z-20 flex gap-2">
          {category && (
            <span className="rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/10">
              {category}
            </span>
          )}
        </div>
        <div className="absolute right-2 top-2 z-20 flex flex-col items-end gap-1">
          {views && (
            <span className="rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md border border-white/10">
              {views} views
            </span>
          )}
          {duration && (
            <span className="rounded-md bg-black/90 px-1.5 py-0.5 text-[10px] font-bold text-white border border-white/10">
              {duration}
            </span>
          )}
        </div>

        {/* Bottom Overlay with Title & Avatar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-12 flex flex-col justify-end text-left translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-white mb-1.5 drop-shadow-md">
            {title}
          </h3>
          <div className="flex items-center gap-1.5">
            <img src="/kira.jpg" alt="Author" className="h-4 w-4 rounded-full object-cover border border-white/20 bg-neutral-800" />
            <span className="text-[11px] font-medium text-neutral-300 drop-shadow-md">{author || 'KIRA'}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
