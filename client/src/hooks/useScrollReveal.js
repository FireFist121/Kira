import { useEffect } from 'react'

export default function useScrollReveal(deps = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    const targets = document.querySelectorAll('.reveal')
    targets.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, deps)
}
