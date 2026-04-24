import { FiMail } from 'react-icons/fi'
import { FaInstagram, FaDiscord } from 'react-icons/fa'
import './Contact.css'

/** Add your public email here when ready; leave empty to show a placeholder. */
const CONTACT_EMAIL = 'kir4discord@gmail.com'

/** Optional: server invite (https://discord.gg/…). Leave empty to show username only (no link). */
const DISCORD_INVITE_URL = ''

const INSTAGRAM_URL = 'https://www.instagram.com/kir4designs/?hl=en'

const CONTACT_LINKS = [
  {
    key: 'email',
    label: 'Email',
    value: CONTACT_EMAIL.trim() || null,
    href: CONTACT_EMAIL.trim() ? `mailto:${CONTACT_EMAIL.trim()}` : null,
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
    value: DISCORD_INVITE_URL.trim()
      ? DISCORD_INVITE_URL.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
      : 'kir4isdead',
    href: DISCORD_INVITE_URL.trim() || null,
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

export default function Contact() {
  return (
    <section id="contact" className="contact section-pad">
      <div className="container">
        <div className="section-header center reveal">
          <div className="section-label">04 — Contact</div>
          <h2 className="section-title">Let&apos;s Connect</h2>
          <p className="section-sub">
            Reach out via email, Instagram or hop into my Discord — I&apos;m always around.
          </p>
        </div>

        <div className="contact-connect-wrap reveal">
          <div className="contact-connect-card">
            <div className="connect-card-accent" aria-hidden />
            {CONTACT_LINKS.map(item => {
              const isLink = Boolean(item.href)
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

              if (isLink) {
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
                <div key={item.key} className="connect-row connect-row--static" aria-label="Email — add later">
                  {inner}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
