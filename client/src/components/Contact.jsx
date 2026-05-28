import { useState } from 'react'
import { FiMail, FiCopy, FiCheck, FiX } from 'react-icons/fi'
import { FaInstagram, FaDiscord } from 'react-icons/fa'
import './Contact.css'

/** Add your public email here when ready; leave empty to show a placeholder. */
const CONTACT_EMAIL = 'kir4discord@gmail.com'
const DISCORD_ID = 'kir4isdead'

const INSTAGRAM_URL = 'https://www.instagram.com/kir4designs/?hl=en'

export default function Contact() {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedDc, setCopiedDc] = useState(false)

  const handleCopyEmail = (e) => {
    e.preventDefault()
    navigator.clipboard.writeText(CONTACT_EMAIL)
    setCopied(true)
    setShowEmailModal(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyDc = (e) => {
    e.preventDefault()
    navigator.clipboard.writeText(DISCORD_ID)
    setCopiedDc(true)
    setShowDiscordModal(true)
    setTimeout(() => setCopiedDc(false), 2000)
  }

  const CONTACT_LINKS = [
    {
      key: 'email',
      label: 'Email',
      value: CONTACT_EMAIL.trim() || null,
      onClick: handleCopyEmail,
      icon: <FiMail />,
      iconClass: 'connect-icon--mail',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      value: '@kir4designs',
      href: INSTAGRAM_URL,
      icon: <FaInstagram />,
      iconClass: 'connect-icon--ig',
    },
    {
      key: 'discord',
      label: 'Discord',
      value: DISCORD_ID,
      onClick: handleCopyDc,
      icon: <FaDiscord />,
      iconClass: 'connect-icon--dc',
    },
  ]

  function LinkArrow() {
    return (
      <svg className="connect-row-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M7 17 17 7M17 7h-6M17 7v6" />
      </svg>
    )
  }

  return (
    <section id="contact" className="contact section-pad">
      <div className="container">
        <div className="section-header center reveal">
          <div className="section-label">04 — Contact</div>
          <h2 className="section-title">Let&apos;s Connect</h2>
          <p className="section-sub">
            Reach out via email, Instagram or Discord — I&apos;m always around.
          </p>
        </div>

        <div className="contact-connect-wrap reveal">
          <div className="contact-connect-card">
            <div className="connect-card-accent" aria-hidden />
            {CONTACT_LINKS.map(item => {
              const isLink = Boolean(item.href || item.onClick)
              const display = item.value ?? '—'

              const inner = (
                <>
                  <div className={`connect-icon-wrap ${item.iconClass}`}>{item.icon}</div>
                  <div className="connect-row-text">
                    <div className="connect-label">{item.label}</div>
                    <div className={`connect-value ${!item.value ? 'connect-value--empty' : ''}`}>
                      {display}
                    </div>
                  </div>
                  {isLink && <LinkArrow />}
                </>
              )

              if (item.onClick) {
                return (
                  <button
                    key={item.key}
                    className="connect-row connect-row--link"
                    onClick={item.onClick}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    {inner}
                  </button>
                )
              }

              if (item.href) {
                return (
                  <a
                    key={item.key}
                    className="connect-row connect-row--link"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {inner}
                  </a>
                )
              }

              return (
                <div key={item.key} className="connect-row connect-row--static">
                  {inner}
                </div>
              )
            })}
          </div>
        </div>
      </div>

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
            
            <div className="email-copy-box" onClick={() => {
              navigator.clipboard.writeText(CONTACT_EMAIL)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}>
              <span className="email-address">{CONTACT_EMAIL}</span>
              <button className={`email-copy-btn ${copied ? 'copied' : ''}`}>
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            {copied && <span className="copy-success-msg">Copied to clipboard!</span>}
          </div>
        </div>
      )}

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
            
            <div className="email-copy-box" onClick={() => {
              navigator.clipboard.writeText(DISCORD_ID)
              setCopiedDc(true)
              setTimeout(() => setCopiedDc(false), 2000)
            }}>
              <span className="email-address">{DISCORD_ID}</span>
              <button className={`email-copy-btn ${copiedDc ? 'copied' : ''}`}>
                {copiedDc ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            {copiedDc && <span className="copy-success-msg">Copied to clipboard!</span>}
          </div>
        </div>
      )}
    </section>
  )
}
