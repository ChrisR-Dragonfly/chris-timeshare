/* =============================================
   CHRIS' TIMESHARE — script.js
   ============================================= */

// ---- Property Data ----
const PROPERTIES = [
  {
    id: 'timeshare_1',
    name: 'Miami Retreat',
    location: 'Miami, FL',
    sleeps: 6,
    bedrooms: 3,
    amenities: ['pool', 'garage', 'tennis court', 'theater'],
    images: [
      'https://picsum.photos/seed/miami-villa-luxury/800/520',
      'https://picsum.photos/seed/miami-pool-deck/800/520',
      'https://picsum.photos/seed/miami-beach-resort/800/520',
      'https://picsum.photos/seed/miami-interior-living/800/520',
    ],
    description: 'A stunning Miami villa with resort-style amenities, just minutes from South Beach. Enjoy sun-soaked days poolside and vibrant evenings in one of America\'s most iconic cities.',
    pricePerNight: 350,
    badge: 'available',
    badgeText: 'Available',
    // Booked dates in YYYY-MM-DD format (relative to current month for demo)
    bookedOffsets: [3, 4, 5, 14, 15, 16, 17, 26, 27],
  },
  {
    id: 'timeshare_2',
    name: 'Los Angeles Oasis',
    location: 'Los Angeles, CA',
    sleeps: 8,
    bedrooms: 4,
    amenities: ['beachside', 'pool', 'gazebo', 'grill'],
    images: [
      'https://picsum.photos/seed/la-beach-oasis/800/520',
      'https://picsum.photos/seed/la-pool-sunset/800/520',
      'https://picsum.photos/seed/la-gazebo-garden/800/520',
      'https://picsum.photos/seed/la-ocean-terrace/800/520',
    ],
    description: 'Breathtaking beachside living in the heart of Los Angeles. This expansive property offers direct ocean access, al fresco dining under the gazebo, and unforgettable California sunsets.',
    pricePerNight: 450,
    badge: 'limited',
    badgeText: 'Limited Availability',
    bookedOffsets: [1, 2, 10, 11, 12, 22, 23, 24, 25],
  }
];

// Amenity icon mapping
const AMENITY_ICONS = {
  'pool':         '🏊',
  'garage':       '🚗',
  'tennis court': '🎾',
  'theater':      '🎭',
  'beachside':    '🏖️',
  'gazebo':       '⛺',
  'grill':        '🔥',
};

// Calendar state per property
const calendarState = {};

// ---- Helpers ----
function pad(n) { return String(n).padStart(2, '0'); }

function formatDateKey(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getBookedDates(property) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return property.bookedOffsets.map(offset => {
    const d = new Date(year, month, offset + 1);
    return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
  });
}

// ---- Build Calendar HTML ----
function buildCalendar(property, year, month) {
  const bookedDates = getBookedDates(property);
  const today = new Date();
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = `
    <div class="calendar-nav">
      <button class="cal-nav-btn" data-id="${property.id}" data-dir="-1" aria-label="Previous month">
        <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
      </button>
      <h4>${monthNames[month]} ${year}</h4>
      <button class="cal-nav-btn" data-id="${property.id}" data-dir="1" aria-label="Next month">
        <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
      </button>
    </div>
    <div class="calendar-grid">
      <span class="cal-day-name">Su</span>
      <span class="cal-day-name">Mo</span>
      <span class="cal-day-name">Tu</span>
      <span class="cal-day-name">We</span>
      <span class="cal-day-name">Th</span>
      <span class="cal-day-name">Fr</span>
      <span class="cal-day-name">Sa</span>
  `;

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<span class="cal-day empty"></span>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(year, month, day);
    const cellDate = new Date(year, month, day);
    const isToday = (
      cellDate.getFullYear() === today.getFullYear() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getDate() === today.getDate()
    );
    const isPast    = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isBooked  = bookedDates.includes(dateKey);

    let cls = 'cal-day';
    if (isPast)   cls += ' past';
    else if (isBooked) cls += ' booked';
    else cls += ' available';
    if (isToday) cls += ' today';

    html += `<span class="${cls}" title="${dateKey}">${day}</span>`;
  }

  html += `</div>
    <div class="cal-legend">
      <span><span class="legend-dot available"></span> Available</span>
      <span><span class="legend-dot booked"></span> Booked</span>
    </div>
  `;

  return html;
}

// ---- Render Property Cards ----
function renderProperties(filtered) {
  const grid = document.getElementById('propertiesGrid');
  const noResults = document.getElementById('noResults');
  const list = filtered || PROPERTIES;

  if (list.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';

  grid.innerHTML = list.map(prop => {
    // Initialize calendar state
    const now = new Date();
    if (!calendarState[prop.id]) {
      calendarState[prop.id] = { year: now.getFullYear(), month: now.getMonth() };
    }
    const { year, month } = calendarState[prop.id];

    const amenityChips = prop.amenities.map(a => `
      <span class="amenity-chip">
        <span class="amenity-emoji">${AMENITY_ICONS[a] || '✓'}</span>
        ${a.charAt(0).toUpperCase() + a.slice(1)}
      </span>
    `).join('');

    return `
      <article class="property-card" data-id="${prop.id}" data-sleeps="${prop.sleeps}" data-location="${prop.location}">
        <div class="card-image-wrap" id="slideshow-${prop.id}">
          ${prop.images.map((src, i) => `
            <img src="${src}" alt="${prop.name} photo ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" class="slide-img${i === 0 ? ' active' : ''}" />
          `).join('')}
          <span class="card-badge ${prop.badge}">${prop.badgeText}</span>
          <div class="card-image-overlay">
            <button class="card-quick-book" data-id="${prop.id}" data-name="${prop.name}">Quick Book</button>
          </div>
          <button class="slide-arrow slide-prev" data-id="${prop.id}" aria-label="Previous photo">&#8249;</button>
          <button class="slide-arrow slide-next" data-id="${prop.id}" aria-label="Next photo">&#8250;</button>
          <div class="slide-dots">
            ${prop.images.map((_, i) => `<span class="slide-dot${i === 0 ? ' active' : ''}" data-id="${prop.id}" data-index="${i}"></span>`).join('')}
          </div>
        </div>
        <div class="card-body">
          <div class="card-title-row">
            <h3>${prop.name}</h3>
          </div>
          <div class="card-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            ${prop.location}
          </div>
          <div class="card-meta">
            <div class="card-meta-item">
              <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              Sleeps ${prop.sleeps}
            </div>
            <div class="card-meta-item">
              <svg viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>
              ${prop.bedrooms} Bedrooms
            </div>
          </div>
          <p style="font-size:.88rem;color:var(--text-mid);line-height:1.65;">${prop.description}</p>
          <div class="card-amenities">${amenityChips}</div>
          <div class="calendar-wrap">
            <button class="calendar-toggle" data-id="${prop.id}" aria-expanded="false">
              <span>Check Availability</span>
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </button>
            <div class="calendar-body" id="cal-${prop.id}">
              ${buildCalendar(prop, year, month)}
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-book" data-id="${prop.id}" data-name="${prop.name}">Book This Property</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Attach calendar nav events
  document.querySelectorAll('.cal-nav-btn').forEach(btn => {
    btn.addEventListener('click', handleCalNav);
  });
  // Attach calendar toggle
  document.querySelectorAll('.calendar-toggle').forEach(btn => {
    btn.addEventListener('click', handleCalToggle);
  });
  // Attach book buttons
  document.querySelectorAll('.btn-book, .card-quick-book').forEach(btn => {
    btn.addEventListener('click', () => openBookingModal(btn.dataset.id, btn.dataset.name));
  });
}

// ---- Calendar Navigation ----
function handleCalNav(e) {
  e.stopPropagation();
  const id  = this.dataset.id;
  const dir = parseInt(this.dataset.dir, 10);
  const state = calendarState[id];

  state.month += dir;
  if (state.month > 11) { state.month = 0;  state.year++; }
  if (state.month < 0)  { state.month = 11; state.year--; }

  const prop = PROPERTIES.find(p => p.id === id);
  const calBody = document.getElementById(`cal-${id}`);
  calBody.innerHTML = buildCalendar(prop, state.year, state.month);

  // Re-bind nav buttons inside freshly rendered calendar
  calBody.querySelectorAll('.cal-nav-btn').forEach(btn => {
    btn.addEventListener('click', handleCalNav);
  });
}

// ---- Calendar Toggle ----
function handleCalToggle() {
  const id = this.dataset.id;
  const calBody = document.getElementById(`cal-${id}`);
  const isOpen  = calBody.classList.toggle('open');
  this.classList.toggle('open', isOpen);
  this.setAttribute('aria-expanded', String(isOpen));
}

// ---- Search / Filter ----
function applySearch() {
  const dest   = document.getElementById('search-destination').value.trim().toLowerCase();
  const guests = parseInt(document.getElementById('search-guests').value, 10) || 0;
  // Date filtering is visual only (calendar shows availability)

  const filtered = PROPERTIES.filter(p => {
    if (dest   && !p.location.toLowerCase().includes(dest)) return false;
    if (guests && p.sleeps < guests) return false;
    return true;
  });

  renderProperties(filtered);

  if (dest || guests) {
    document.getElementById('properties').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---- Booking Modal ----
function openBookingModal(propertyId, propertyName) {
  const modal = document.getElementById('bookingModal');
  document.getElementById('modalPropertyName').textContent =
    propertyName ? `Booking request for: ${propertyName}` : 'Complete the form below to request your stay';
  document.getElementById('b-property').value = propertyId || '';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Pre-fill dates from search bar
  const checkIn  = document.getElementById('search-checkin').value;
  const checkOut = document.getElementById('search-checkout').value;
  if (checkIn)  document.getElementById('b-checkin').value  = checkIn;
  if (checkOut) document.getElementById('b-checkout').value = checkOut;

  // Focus first input
  setTimeout(() => document.getElementById('b-name').focus(), 100);
}

function closeBookingModal() {
  document.getElementById('bookingModal').classList.remove('active');
  document.body.style.overflow = '';
}

// ---- Toast ----
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 4000);
}

// ---- Form Validation Helper ----
function validateForm(formEl) {
  const inputs = formEl.querySelectorAll('[required]');
  let valid = true;
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = '#e74c3c';
      input.addEventListener('input', () => { input.style.borderColor = ''; }, { once: true });
      valid = false;
    }
  });
  return valid;
}

// ---- Navbar Scroll Effect ----
function handleNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// ---- Set Min Dates for Date Inputs ----
function setMinDates() {
  const today = new Date().toISOString().split('T')[0];
  ['search-checkin', 'search-checkout', 'b-checkin', 'b-checkout'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = today;
  });

  // Auto-advance checkout when checkin changes
  document.getElementById('search-checkin').addEventListener('change', function () {
    const co = document.getElementById('search-checkout');
    if (!co.value || co.value <= this.value) co.value = this.value;
    co.min = this.value;
  });
  document.getElementById('b-checkin').addEventListener('change', function () {
    const co = document.getElementById('b-checkout');
    if (!co.value || co.value <= this.value) co.value = this.value;
    co.min = this.value;
  });
}

// ---- Slideshow ----
const slideshowTimers = {};

function goToSlide(propId, index) {
  const wrap = document.getElementById(`slideshow-${propId}`);
  if (!wrap) return;
  const imgs = wrap.querySelectorAll('.slide-img');
  const dots = wrap.querySelectorAll('.slide-dot');
  const total = imgs.length;
  const next = (index + total) % total;

  imgs.forEach((img, i) => img.classList.toggle('active', i === next));
  dots.forEach((dot, i) => dot.classList.toggle('active', i === next));
}

function startSlideshow(propId, total) {
  let current = 0;
  slideshowTimers[propId] = setInterval(() => {
    current = (current + 1) % total;
    goToSlide(propId, current);
  }, 3500);
}

function initSlideshows() {
  PROPERTIES.forEach(prop => {
    const total = prop.images.length;
    startSlideshow(prop.id, total);

    const wrap = document.getElementById(`slideshow-${prop.id}`);
    if (!wrap) return;

    // Pause on hover
    wrap.addEventListener('mouseenter', () => clearInterval(slideshowTimers[prop.id]));
    wrap.addEventListener('mouseleave', () => {
      clearInterval(slideshowTimers[prop.id]);
      const current = [...wrap.querySelectorAll('.slide-img')].findIndex(img => img.classList.contains('active'));
      slideshowTimers[prop.id] = setInterval(() => {
        const cur = [...wrap.querySelectorAll('.slide-img')].findIndex(img => img.classList.contains('active'));
        goToSlide(prop.id, cur + 1);
      }, 3500);
    });
  });

  // Arrow buttons
  document.querySelectorAll('.slide-prev').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const wrap = document.getElementById(`slideshow-${id}`);
      const cur = [...wrap.querySelectorAll('.slide-img')].findIndex(img => img.classList.contains('active'));
      goToSlide(id, cur - 1);
    });
  });
  document.querySelectorAll('.slide-next').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const wrap = document.getElementById(`slideshow-${id}`);
      const cur = [...wrap.querySelectorAll('.slide-img')].findIndex(img => img.classList.contains('active'));
      goToSlide(id, cur + 1);
    });
  });

  // Dot buttons
  document.querySelectorAll('.slide-dot').forEach(dot => {
    dot.addEventListener('click', e => {
      e.stopPropagation();
      goToSlide(dot.dataset.id, parseInt(dot.dataset.index));
    });
  });
}

// ---- Interactive Map (Leaflet.js) ----
function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  const map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: false,
  });

  // OpenStreetMap tiles (free, no API key needed)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Enable scroll-wheel zoom only when the map is focused / clicked
  mapEl.addEventListener('click',     () => map.scrollWheelZoom.enable());
  mapEl.addEventListener('mouseleave',() => map.scrollWheelZoom.disable());

  // ---- Custom pin icon factory ----
  function makePinIcon(cssClass) {
    return L.divIcon({
      className: '',
      html: `<div class="custom-pin ${cssClass}"><span class="custom-pin-inner">🏠</span></div>`,
      iconSize:   [36, 36],
      iconAnchor: [18, 36],
      popupAnchor:[0, -40],
    });
  }

  // ---- Popup HTML factory ----
  function makePopup(prop) {
    return `
      <img class="map-popup-img" src="${prop.image}" alt="${prop.name}" />
      <div class="map-popup">
        <h3>${prop.name}</h3>
        <div class="popup-loc">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          ${prop.location}
        </div>
        <div class="popup-meta">
          <span>🛏 Sleeps ${prop.sleeps}</span>
          <span>💰 $${prop.pricePerNight}/night</span>
        </div>
        <button class="popup-book" onclick="openBookingModal('${prop.id}','${prop.name}')">Book Now</button>
      </div>
    `;
  }

  // ---- Miami marker ----
  const miami = PROPERTIES[0];
  const miamiMarker = L.marker([25.7617, -80.1918], { icon: makePinIcon('miami') })
    .addTo(map)
    .bindPopup(makePopup(miami), { maxWidth: 260, minWidth: 240 });

  // ---- Los Angeles marker ----
  const la = PROPERTIES[1];
  const laMarker = L.marker([34.0522, -118.2437], { icon: makePinIcon('la') })
    .addTo(map)
    .bindPopup(makePopup(la), { maxWidth: 260, minWidth: 240 });

  // Fit map to show both pins with padding
  map.fitBounds(
    [[25.7617, -118.2437], [34.0522, -80.1918]],
    { padding: [60, 60] }
  );

  // Legend clicks fly to & open the matching popup
  document.getElementById('legend-miami').addEventListener('click', () => {
    map.flyTo([25.7617, -80.1918], 11, { duration: 1.2 });
    setTimeout(() => miamiMarker.openPopup(), 1300);
  });
  document.getElementById('legend-la').addEventListener('click', () => {
    map.flyTo([34.0522, -118.2437], 11, { duration: 1.2 });
    setTimeout(() => laMarker.openPopup(), 1300);
  });

  // Also add "Locations" to the nav
  const navLinks = document.getElementById('navLinks');
  const locLi = document.createElement('li');
  locLi.innerHTML = `<a href="#locations" class="nav-link">Locations</a>`;
  // Insert before "Contact"
  const contactLi = [...navLinks.querySelectorAll('li')].find(li => li.querySelector('a[href="#contact"]'));
  if (contactLi) navLinks.insertBefore(locLi, contactLi);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {

  // Render all properties
  renderProperties();

  // Init slideshows
  initSlideshows();

  // Init map
  initMap();

  // Set min dates
  setMinDates();

  // Navbar scroll
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });
  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // Search button
  document.getElementById('searchBtn').addEventListener('click', applySearch);
  // Search on Enter key in any search field
  document.getElementById('searchBar').addEventListener('keydown', e => {
    if (e.key === 'Enter') applySearch();
  });

  // Clear search
  document.getElementById('clearSearch').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('search-destination').value = '';
    document.getElementById('search-checkin').value     = '';
    document.getElementById('search-checkout').value    = '';
    document.getElementById('search-guests').value      = '';
    renderProperties();
  });

  // Open booking modal — nav button
  document.getElementById('openBookingNav').addEventListener('click', e => {
    e.preventDefault();
    openBookingModal();
  });

  // Open booking modal — footer button
  document.getElementById('footerBookBtn').addEventListener('click', e => {
    e.preventDefault();
    openBookingModal();
  });

  // Close booking modal
  document.getElementById('closeModal').addEventListener('click', closeBookingModal);
  document.getElementById('bookingModal').addEventListener('click', e => {
    if (e.target === document.getElementById('bookingModal')) closeBookingModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeBookingModal();
  });

  // Booking form submit
  document.getElementById('bookingForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(this)) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const checkIn  = document.getElementById('b-checkin').value;
    const checkOut = document.getElementById('b-checkout').value;
    if (checkIn && checkOut && checkOut <= checkIn) {
      document.getElementById('b-checkout').style.borderColor = '#e74c3c';
      showToast('Check-out must be after check-in.', 'error');
      return;
    }

    const propId   = document.getElementById('b-property').value;
    const propName = propId
      ? (PROPERTIES.find(p => p.id === propId)?.name || 'your selected property')
      : 'our property';

    // Simulate submission
    const btn = this.querySelector('button[type="submit"]');
    btn.textContent = 'Submitting…';
    btn.disabled = true;

    setTimeout(() => {
      closeBookingModal();
      this.reset();
      btn.textContent = 'Submit Booking Request';
      btn.disabled = false;
      showToast(`🎉 Booking request for ${propName} received! We'll be in touch shortly.`, 'success');
    }, 900);
  });

  // Contact form submit
  document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(this)) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const btn = this.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      this.reset();
      btn.textContent = 'Send Message';
      btn.disabled = false;
      showToast('✉️ Message sent! We\'ll respond within 24 hours.', 'success');
    }, 800);
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });

});
