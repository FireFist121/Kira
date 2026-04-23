/* ═══════════════════════════════════
   KIRA PORTFOLIO — main.js
   ═══════════════════════════════════ */

/* ─── CUSTOM CURSOR ─── */
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursorTrail');
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  trailX += (e.clientX - trailX) * 0.12;
  trailY += (e.clientY - trailY) * 0.12;
  trail.style.left = trailX + 'px';
  trail.style.top = trailY + 'px';
});

function animateTrail() {
  trail.style.left = trailX + 'px';
  trail.style.top = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

document.querySelectorAll('a, button, .tab, .work-card, .service-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '16px';
    cursor.style.height = '16px';
    trail.style.width = '52px';
    trail.style.height = '52px';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '10px';
    cursor.style.height = '10px';
    trail.style.width = '36px';
    trail.style.height = '36px';
  });
});

/* ─── NAV SCROLL ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ─── HAMBURGER ─── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mob-link').forEach(l => {
  l.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ─── SMOOTH SCROLL NAV ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ─── COUNTER ANIMATION ─── */
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = Math.ceil(target / 50);
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(interval);
  }, 30);
}

function startCounters() {
  animateCounter(document.getElementById('statProjects'), 150, '+');
  animateCounter(document.getElementById('statClients'), 40, '+');
  animateCounter(document.getElementById('statYears'), 3, '+');
}

/* ─── SCROLL REVEAL ─── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

let countersStarted = false;
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      startCounters();
    }
  });
}, { threshold: 0.3 });

/* ─── FETCH & RENDER SERVICES ─── */
async function loadServices() {
  try {
    const res = await fetch('/api/services');
    const { data } = await res.json();
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = data.map(s => `
      <div class="service-card reveal">
        <span class="service-icon">${s.icon}</span>
        <h3 class="service-title">${s.title}</h3>
        <p class="service-desc">${s.description}</p>
        <div class="service-tags">
          ${s.tags.map(t => `<span class="service-tag">${t}</span>`).join('')}
        </div>
      </div>
    `).join('');
    grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } catch (err) {
    console.error('Services load error:', err);
  }
}

/* ─── FETCH & RENDER WORK ─── */
const workColors = [
  'linear-gradient(135deg, #1a0533 0%, #2d0a4e 100%)',
  'linear-gradient(135deg, #0a0a1a 0%, #1a0533 100%)',
  'linear-gradient(135deg, #0d0d20 0%, #220a3d 100%)',
  'linear-gradient(135deg, #18001f 0%, #2a0a3e 100%)',
  'linear-gradient(135deg, #080814 0%, #160a2e 100%)',
  'linear-gradient(135deg, #0a0020 0%, #200a3a 100%)',
];

const allWork = [];
let activeFilter = 'all';
const filterTypes = ['thumbnail', 'thumbnail', 'video', 'thumbnail', 'brand', 'video'];

async function loadWork() {
  try {
    const res = await fetch('/api/thumbnails');
    const { data } = await res.json();
    data.forEach((item, i) => {
      allWork.push({ ...item, type: filterTypes[i] || 'thumbnail' });
    });
    renderWork('all');
  } catch (err) {
    console.error('Work load error:', err);
  }
}

function renderWork(filter) {
  const grid = document.getElementById('workGrid');
  const items = filter === 'all' ? allWork : allWork.filter(w => w.type === filter);
  grid.innerHTML = items.map((item, i) => `
    <div class="work-card reveal" style="animation-delay: ${i * 0.08}s">
      <div class="work-placeholder" style="background: ${workColors[i % workColors.length]}">
        <span class="work-num">0${i + 1}</span>
      </div>
      <div class="work-overlay">
        <div class="work-title">${item.title}</div>
        <div class="work-client">${item.client} · ${item.views} views</div>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* Filter tabs */
document.addEventListener('click', e => {
  if (e.target.classList.contains('tab')) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    activeFilter = e.target.dataset.filter;
    renderWork(activeFilter);
  }
});

/* ─── FETCH & RENDER SKILLS ─── */
async function loadAbout() {
  try {
    const res = await fetch('/api/portfolio');
    const { data } = await res.json();
    const grid = document.getElementById('skillsGrid');
    grid.innerHTML = data.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
  } catch (err) {
    console.error('About load error:', err);
  }
}

/* ─── CONTACT FORM ─── */
async function submitForm() {
  const name = document.getElementById('fname').value.trim();
  const email = document.getElementById('femail').value.trim();
  const message = document.getElementById('fmessage').value.trim();
  const service = document.getElementById('fservice').value;
  const msgEl = document.getElementById('formMsg');
  const btn = document.getElementById('submitBtn');

  if (!name || !email || !message) {
    msgEl.textContent = 'Please fill in all required fields.';
    msgEl.className = 'form-msg error';
    return;
  }

  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = 'Sending...';
  msgEl.textContent = '';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, service })
    });
    const data = await res.json();
    if (data.success) {
      msgEl.textContent = '✦ Message sent! KIRA will hit you back soon.';
      msgEl.className = 'form-msg success';
      document.getElementById('fname').value = '';
      document.getElementById('femail').value = '';
      document.getElementById('fmessage').value = '';
      document.getElementById('fservice').value = '';
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    msgEl.textContent = 'Something went wrong. Try Discord instead.';
    msgEl.className = 'form-msg error';
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn-text').textContent = 'Send Message';
  }
}
window.submitForm = submitForm;

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadServices(), loadWork(), loadAbout()]);

  // Observe all .reveal elements
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Observe stats card
  const statsCard = document.querySelector('.hero-card');
  if (statsCard) counterObserver.observe(statsCard);
});
