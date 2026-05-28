import { useEffect } from 'react'
import { FaInstagram, FaDiscord } from 'react-icons/fa'
import './About.css'

export default function About({ data = {} }) {
  const { bio1, bio2, skills = [], available, stats = {} } = data

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('#about .reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-inner">

          {/* ── LEFT ── */}
          <div className="about-left">
            <div className="about-header reveal">
              <div className="about-label">03 — About</div>
              <h2 className="about-massive-title">
                <span className="about-massive-line1">ABOUT</span>
                <span className="about-massive-line2">ME</span>
              </h2>
            </div>

            <p className="about-text reveal">
              {bio1 || "I'm KIR4 — a thumbnail designer & video editor who turns content into clicks. I design visuals that stop the scroll and craft edits that keep audiences hooked from first frame to last."}
            </p>
            <p className="about-text reveal">
              {bio2 || "With 3+ years in the game, I've worked with creators across YouTube, Instagram, and beyond — delivering high-impact thumbnails, cinematic edits, and motion graphics that elevate every channel I touch."}
            </p>

            <div className="skills-wrap reveal">
              {(skills.length ? skills : ['Photoshop', 'Premiere Pro', 'After Effects', 'Illustrator', 'Figma', 'Blender']).map(s => (
                <span key={s} className="skill-chip">{s}</span>
              ))}
            </div>

            <div className="about-socials reveal">
              <a
                href="https://www.instagram.com/kir4designs/?hl=en"
                target="_blank" rel="noopener noreferrer"
                className="social-link"
              >
              <FaInstagram size={14} />
                @kir4designs
              </a>
              <a
                href="#contact"
                className="social-link"
              >
                <FaDiscord size={14} />
                kir4isdead
              </a>
            </div>
          </div>

          {/* ── RIGHT CARD ── */}
          <div className="about-right reveal">
            <div className="id-card">
              <div className="id-card-accent-top" />
              <div className="id-card-body">
                <div className="about-avatar-container">
                  <img
                    src="/kira.jpg"
                    alt="KIR4"
                    className="about-avatar-img"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="id-fallback" style={{ display: 'none' }}>
                    KIR<span className="accent">4</span>
                  </div>
                </div>

                <div className="id-divider" />

                <div className="id-stats">
                  {[
                    { num: stats.projects || '150+', label: 'Projects' },
                    { num: stats.clients  || '40+',  label: 'Clients'  },
                    { num: stats.years    || '3+',   label: 'Years'    },
                  ].map(s => (
                    <div key={s.label} className="id-stat">
                      <div className="id-stat-num">{s.num}</div>
                      <div className="id-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
