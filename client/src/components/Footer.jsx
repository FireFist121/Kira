import { useState } from 'react'
import { FiMail, FiMapPin, FiChevronUp, FiCopy, FiCheck, FiX } from 'react-icons/fi'
import { FaInstagram, FaDiscord } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  const email = 'kir4discord@gmail.com'
  const discordId = 'kir4isdead'
  
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedDc, setCopiedDc] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyDc = () => {
    navigator.clipboard.writeText(discordId)
    setCopiedDc(true)
    setTimeout(() => setCopiedDc(false), 2000)
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
            <button className="footer-v2-link-btn" onClick={() => setShowEmailModal(true)}>
              <FiMail size={14} />
              Email
            </button>
            <button className="footer-v2-link-btn" onClick={() => setShowDiscordModal(true)}>
              <FaDiscord size={14} />
              Discord
            </button>
          </div>

          <div className="footer-v2-col">
            <h4 className="footer-v2-col-title">Legal</h4>
            <Link to="/privacy" className="footer-v2-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-v2-link">Terms of Use</Link>
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

      {/* ─── EMAIL COPY MODAL ─── */}
      {showEmailModal && (
        <div className="email-modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="email-modal-card" onClick={e => e.stopPropagation()}>
            <button className="email-modal-close" onClick={() => setShowEmailModal(false)}>
              <FiX />
            </button>
            <div className="email-modal-icon">
              <FiMail />
            </div>
            <h3 className="email-modal-title">Copy Email</h3>
            <p className="email-modal-text">Feel free to reach out for business inquiries.</p>
            
            <div className="email-copy-box" onClick={handleCopy}>
              <span className="email-address">{email}</span>
              <button className={`email-copy-btn ${copied ? 'copied' : ''}`}>
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            {copied && <span className="copy-success-msg">Copied to clipboard!</span>}
          </div>
        </div>
      )}

      {/* ─── DISCORD COPY MODAL ─── */}
      {showDiscordModal && (
        <div className="email-modal-overlay" onClick={() => setShowDiscordModal(false)}>
          <div className="email-modal-card" onClick={e => e.stopPropagation()}>
            <button className="email-modal-close" onClick={() => setShowDiscordModal(false)}>
              <FiX />
            </button>
            <div className="email-modal-icon discord">
              <FaDiscord />
            </div>
            <h3 className="email-modal-title">Copy Discord ID</h3>
            <p className="email-modal-text">Add me on Discord to discuss your project.</p>
            
            <div className="email-copy-box" onClick={handleCopyDc}>
              <span className="email-address">{discordId}</span>
              <button className={`email-copy-btn ${copiedDc ? 'copied' : ''}`}>
                {copiedDc ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            {copiedDc && <span className="copy-success-msg">Copied to clipboard!</span>}
          </div>
        </div>
      )}
    </footer>
  )
}
