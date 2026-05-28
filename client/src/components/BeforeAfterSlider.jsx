import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * BeforeAfterSlider component for comparing two images.
 * Props:
 *   beforeImage (string) — URL
 *   afterImage (string) — URL
 *   beforeLabel (string) — default "Before"
 *   afterLabel (string) — default "After"
 */
export default function BeforeAfterSlider({
  beforeImage = '',
  afterImage = '',
  beforeLabel = 'Before',
  afterLabel = 'After'
}) {
  const [pos, setPos] = useState(100)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)
  const requestRef = useRef()

  const updatePos = useCallback((clientX) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
    requestRef.current = requestAnimationFrame(() => {
      setPos(percentage)
    })
  }, [])

  const handlePointerDown = (e) => {
    setIsDragging(true)
    updatePos(e.clientX)
  }

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return
    updatePos(e.clientX)
  }, [isDragging, updatePos])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return
    updatePos(e.touches[0].clientX)
  }, [isDragging, updatePos])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('touchmove', handleTouchMove)
    } else {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('touchmove', handleTouchMove)
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('touchmove', handleTouchMove)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isDragging, handlePointerMove, handlePointerUp, handleTouchMove])

  return (
    <div 
      ref={containerRef}
      className="before-after-slider select-none"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        overflow: 'hidden',
        borderRadius: '16px',
        backgroundColor: '#0a0a0a',
        cursor: 'ew-resize',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}
      onPointerDown={handlePointerDown}
    >
      {/* Before Image (Background) */}
      <img 
        src={beforeImage} 
        alt={beforeLabel}
        className="pointer-events-none"
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      {/* After Image (Clipped Overlay) */}
      <img 
        src={afterImage} 
        alt={afterLabel}
        className="pointer-events-none"
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          clipPath: `inset(0 0 0 ${pos}%)`,
          zIndex: 2,
        }}
      />

      {/* Center Handle Bar */}
      <div 
        className="absolute inset-y-0 pointer-events-none z-10"
        style={{ 
          left: `${pos}%`, 
          width: '1px', 
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
          transform: 'translateX(-50%)'
        }}
      />

      {/* Center Handle Button (Minimalist Pill) */}
      <div 
        className="absolute pointer-events-none flex items-center justify-center z-20"
        style={{ 
          left: `${pos}%`, 
          top: '50%',
          transform: 'translate(-50%, -50%)' 
        }}
      >
        <div className="w-[32px] h-[32px] bg-white rounded-md flex items-center justify-center shadow-xl border border-black/5">
          <div className="flex items-center justify-center gap-1">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none px-4 py-1.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold uppercase rounded-full border border-white/10 tracking-widest">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 z-30 pointer-events-none px-4 py-1.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold uppercase rounded-full border border-white/10 tracking-widest">
        {afterLabel}
      </div>

      {/* Percentage indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-white text-[10px] font-mono tracking-tighter bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
        {Math.round(pos)}%
      </div>
    </div>
  )
}
