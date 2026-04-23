import './Services.css'

export default function Services({ services = [] }) {
  return (
    <section id="services" className="services section-pad">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-label">01 — Services</div>
          <h2 className="section-title">What I Do</h2>
          <p className="section-sub">Built for impact, designed for results.</p>
        </div>

        <div className="services-grid">
          {services.map((s, i) => (
            <div
              key={s.id}
              className="service-card reveal glass"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="service-card-top">
                <span className="service-icon">{s.icon}</span>
                <span className="service-num">0{i + 1}</span>
              </div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.description}</p>
              <div className="service-tags">
                {s.tags.map(t => (
                  <span key={t} className="service-tag">{t}</span>
                ))}
              </div>
              <div className="service-hover-line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
