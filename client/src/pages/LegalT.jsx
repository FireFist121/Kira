import './Legal.css'

export default function TermsOfUse() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-card">
          <div className="legal-header">
            <h1 className="legal-title">Terms of Use</h1>
            <p className="legal-date">Last Updated: May 2026</p>
          </div>

          <div className="legal-content">
            <p>Welcome to KIR4.</p>
            <p>By accessing or using this website, you agree to comply with these Terms of Use.</p>

            <div className="legal-divider" />

            <h2>Use of Website</h2>
            <p>
              This website is a graphic design and creative portfolio intended to showcase creative work, 
              including YouTube video content and related media.
            </p>
            <p>Users agree to use this website lawfully and responsibly.</p>

            <div className="legal-divider" />

            <h2>YouTube API Services</h2>
            <p>This website uses YouTube API Services.</p>
            <p>By using this website, users also agree to be bound by:</p>
            <ul>
              <li>
                <strong>YouTube Terms of Service:</strong><br />
                <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">https://www.youtube.com/t/terms</a>
              </li>
              <li>
                <strong>Google Privacy Policy:</strong><br />
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>
              </li>
            </ul>

            <div className="legal-divider" />

            <h2>Intellectual Property</h2>
            <p>
              All original graphics, designs, branding, and creative assets displayed on this website are owned by KIR4 unless otherwise stated.
            </p>
            <p>Users may not reproduce, redistribute, or commercially use content without permission.</p>

            <div className="legal-divider" />

            <h2>Third-Party Content</h2>
            <p>Some content displayed through YouTube API Services belongs to respective copyright owners.</p>
            <p>All trademarks, logos, and media remain property of their respective owners.</p>

            <div className="legal-divider" />

            <h2>Disclaimer</h2>
            <p>This website and its content are provided "as is" without warranties of any kind.</p>
            <p>We do not guarantee uninterrupted availability or error-free operation.</p>

            <div className="legal-divider" />

            <h2>Limitation of Liability</h2>
            <p>KIR4 shall not be liable for any damages arising from use of this website or reliance on its content.</p>

            <div className="legal-divider" />

            <h2>Changes to Terms</h2>
            <p>We reserve the right to update these Terms at any time.</p>
            <p>Continued use of the website constitutes acceptance of revised terms.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
