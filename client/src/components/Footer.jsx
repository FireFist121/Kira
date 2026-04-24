import { FiMail, FiMapPin, FiChevronUp } from 'react-icons/fi'
import { FaInstagram, FaDiscord } from 'react-icons/fa'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer-v2">
      {/* Top divider line */}
      <div className="footer-v2-divider" />

      {/* Main footer content */}
      <div className="footer-v2-main">
        {/* Left — Brand */}
        <div className="footer-v2-brand">
          <div className="footer-v2-logo">
            KIR<span className="accent">4</span><span className="footer-v2-dot">.</span>
          </div>
          <p className="footer-v2-tagline">Thumbnail Designer & Editor</p>
        </div>

        {/* Right — Columns */}
        <div className="footer-v2-columns">
          <div className="footer-v2-col">
            <h4 className="footer-v2-col-title">Connect</h4>
            <a href="https://www.instagram.com/kir4designs/?hl=en" target="_blank" rel="noopener noreferrer" className="footer-v2-link">
              <FaInstagram size={14} />
              Instagram
            </a>
            <a href="mailto:kir4discord@gmail.com" className="footer-v2-link">
              <FiMail size={14} />
              Email
            </a>
            <a href="https://discord.gg/kir4" target="_blank" rel="noopener noreferrer" className="footer-v2-link">
              <FaDiscord size={14} />
              Discord
            </a>
          </div>

          <div className="footer-v2-col">
            <h4 className="footer-v2-col-title">Location</h4>
            <span className="footer-v2-location">
              <FiMapPin size={14} />
              Global Remote
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-v2-bottom-divider" />
      <div className="footer-v2-bottom">
        <p className="footer-v2-copy">© {year} Kir4 Designs. All rights reserved.</p>
        <button className="footer-v2-top-btn" onClick={scrollToTop}>
          Back to Top
          <FiChevronUp size={14} />
        </button>
      </div>
    </footer>
  )
}
