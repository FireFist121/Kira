export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'latest', label: 'Latest' },
  { value: 'views', label: 'Most viewed' },
]

function SearchIcon() {
  return (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function SelectIcon() {
  return (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function PlatformFilterBar({
  searchQuery,
  onSearchChange,
  sort,
  onSortChange,
  category,
  onCategoryChange,
  categories = ['All'],
  formatCategoryLabel = (v) => v,
}) {
  return (
    <div className="mb-12 flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 backdrop-blur-md sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">

      {/* Search */}
      <div className="min-w-0 flex-1">
        <label htmlFor="platform-search" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          Search
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
            <SearchIcon />
          </span>
          <input
            id="platform-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, tag or category..."
            className="w-full rounded-full border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 outline-none
              transition-all duration-300
              hover:bg-black/35 hover:border-[#e5173f]/60 hover:shadow-[0_0_15px_rgba(229,23,63,0.2)]
              focus:border-[#e5173f] focus:bg-black/30 focus:ring-1 focus:ring-[#e5173f]/50
              focus:shadow-[0_0_20px_rgba(229,23,63,0.3)]"
          />
        </div>
      </div>

      {/* Sort & Category row */}
      <div className="flex flex-wrap items-end gap-3 sm:gap-4">
        {/* Sort */}
        <div className="min-w-[140px] flex-1 sm:flex-none sm:min-w-[160px]">
          <label htmlFor="platform-sort" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Sort
          </label>
          <div className="relative">
            <select
              id="platform-sort"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-full border border-white/10 bg-black/20 px-4 py-2.5 pr-10 text-sm text-white outline-none
                transition-all duration-300
                hover:bg-black/35 hover:border-[#e5173f]/60 hover:shadow-[0_0_15px_rgba(229,23,63,0.2)]
                focus:border-[#e5173f] focus:bg-black/30
                focus:shadow-[0_0_20px_rgba(229,23,63,0.3)]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-neutral-900">
                  {o.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-500">
              <SelectIcon />
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="min-w-[140px] flex-1 sm:flex-none sm:min-w-[160px]">
          <label htmlFor="platform-category" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Category
          </label>
          <div className="relative">
            <select
              id="platform-category"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-full border border-white/10 bg-black/20 px-4 py-2.5 pr-10 text-sm text-white outline-none capitalize
                transition-all duration-300
                hover:bg-black/35 hover:border-[#e5173f]/60 hover:shadow-[0_0_15px_rgba(229,23,63,0.2)]
                focus:border-[#e5173f] focus:bg-black/30
                focus:shadow-[0_0_20px_rgba(229,23,63,0.3)]"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-neutral-900 capitalize">
                  {c === 'All' ? 'All' : formatCategoryLabel(c)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-500">
              <SelectIcon />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
