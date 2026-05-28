import './Legal.css'

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-card">
          <div className="legal-header">
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="legal-date">Last Updated: May 2026</p>
          </div>

          <div className="legal-content">
            <p>
              KIR4 ("we", "our", or "us") operates a graphic design portfolio website that showcases creative work, 
              including YouTube video content integrated using YouTube API Services.
            </p>
            <p>
              By using this website, you acknowledge and agree to this Privacy Policy.
            </p>

            <div className="legal-divider" />

            <h2>Use of YouTube API Services</h2>
            <p>
              This website uses YouTube API Services to display YouTube videos, channel information, video statistics, 
              thumbnails, titles, view counts, and other publicly available YouTube content.
            </p>
            <p>
              By using this website, you also agree to be bound by the:
            </p>
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

            <h2>Information We Collect</h2>
            <p>Our website may access or collect the following information:</p>
            <ul>
              <li>Public YouTube video metadata</li>
              <li>Public channel information</li>
              <li>Video statistics such as views, likes, and upload dates</li>
              <li>Device/browser information</li>
              <li>IP address</li>
              <li>Usage analytics</li>
              <li>Cookies and local storage data</li>
            </ul>
            <p>
              We do not collect or store sensitive personal information from users through YouTube API Services.
            </p>

            <div className="legal-divider" />

            <h2>How We Use Information</h2>
            <p>The collected information is used to:</p>
            <ul>
              <li>Display YouTube videos and related content</li>
              <li>Show real-time YouTube statistics</li>
              <li>Improve website performance and user experience</li>
              <li>Analyze website traffic and engagement</li>
              <li>Maintain security and functionality</li>
            </ul>

            <div className="legal-divider" />

            <h2>Data Sharing</h2>
            <p>We do not sell user data.</p>
            <p>Information may be shared with:</p>
            <ul>
              <li>Google/YouTube services as required for API functionality</li>
              <li>Analytics or hosting providers necessary for website operation</li>
              <li>Legal authorities if required by law</li>
            </ul>

            <div className="legal-divider" />

            <h2>Cookies and Similar Technologies</h2>
            <p>
              This website may use cookies, local storage, and similar technologies to:
            </p>
            <ul>
              <li>Improve website functionality</li>
              <li>Remember preferences</li>
              <li>Analyze traffic and performance</li>
              <li>Load YouTube embedded content properly</li>
            </ul>
            <p>
              Third-party services such as YouTube and Google may also place cookies on users' devices.
              Users can control cookies through their browser settings.
            </p>

            <div className="legal-divider" />

            <h2>Third-Party Services</h2>
            <p>This website uses third-party services including:</p>
            <ul>
              <li>YouTube API Services</li>
              <li>Google services</li>
              <li>Website hosting providers</li>
              <li>Analytics providers</li>
            </ul>
            <p>These services may collect information according to their own privacy policies.</p>

            <div className="legal-divider" />

            <h2>Data Security</h2>
            <p>
              We take reasonable measures to protect information and maintain website security. 
              However, no online transmission or storage system is completely secure.
            </p>

            <div className="legal-divider" />

            <h2>Contact</h2>
            <p>
              If you have any questions regarding this Privacy Policy, you may contact:<br />
              <a href="mailto:kir4discord@gmail.com">kir4discord@gmail.com</a>
            </p>

            <div className="legal-divider" />

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. 
              Changes will be reflected on this page with an updated revision date.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
