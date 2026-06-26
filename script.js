// ====== HERO PARTICLES ======
const particleContainer = document.getElementById('heroParticles');
if (particleContainer) {
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = '-10px';
    p.style.animationDuration = (4 + Math.random() * 8) + 's';
    p.style.animationDelay = (Math.random() * 6) + 's';
    p.style.width = (2 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    particleContainer.appendChild(p);
  }
}

// ====== NAVBAR SCROLL EFFECT ======
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ====== MOBILE MENU ======
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('open');
});

// Keyboard accessibility for hamburger
hamburger.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('open');
  }
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    hamburger.classList.remove('open');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
    hamburger.classList.remove('open');
  }
});

// ====== SCROLL ANIMATIONS ======
const fadeElements = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

fadeElements.forEach(el => observer.observe(el));

// ====== CUSTOM DATE PICKER ======
const dateInput = document.getElementById('date');
const datePickerOverlay = document.getElementById('datePickerOverlay');
const datePickerPopup = document.getElementById('datePickerPopup');
const dpGrid = document.getElementById('dpGrid');
const dpMonthYear = document.getElementById('dpMonthYear');
const dpPrev = document.getElementById('dpPrev');
const dpNext = document.getElementById('dpNext');
const dpToday = document.getElementById('dpToday');
const dpClear = document.getElementById('dpClear');

let dpCurrentDate = new Date();
let dpSelectedDate = null;
let dpViewDate = new Date();

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function openDatePicker() {
  datePickerOverlay.classList.add('active');
  datePickerPopup.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderCalendar();
}

function closeDatePicker() {
  datePickerOverlay.classList.remove('active');
  datePickerPopup.classList.remove('active');
  document.body.style.overflow = '';
}

function renderCalendar() {
  const year = dpViewDate.getFullYear();
  const month = dpViewDate.getMonth();
  dpMonthYear.textContent = monthNames[month] + ' ' + year;

  dpGrid.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = day;
    btn.classList.add('other-month');
    btn.disabled = true;
    dpGrid.appendChild(btn);
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = day;

    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    // Disable past dates
    if (date < today) {
      btn.disabled = true;
    }

    // Highlight today
    if (date.getTime() === today.getTime()) {
      btn.classList.add('today');
    }

    // Highlight selected
    if (dpSelectedDate && date.getTime() === dpSelectedDate.getTime()) {
      btn.classList.add('selected');
    }

    btn.addEventListener('click', () => {
      dpSelectedDate = new Date(year, month, day);
      dateInput.value = formatDate(dpSelectedDate);
      closeDatePicker();
    });

    dpGrid.appendChild(btn);
  }

  // Next month days to fill grid
  const totalCells = dpGrid.children.length;
  const remaining = 42 - totalCells; // 6 rows × 7 cols
  for (let day = 1; day <= remaining; day++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = day;
    btn.classList.add('other-month');
    btn.disabled = true;
    dpGrid.appendChild(btn);
  }
}

function formatDate(date) {
  const d = date.getDate();
  const m = monthNames[date.getMonth()];
  const y = date.getFullYear();
  return d + ' ' + m + ' ' + y;
}

if (dateInput) {
  dateInput.addEventListener('click', openDatePicker);
  dateInput.addEventListener('focus', openDatePicker);
}

if (datePickerOverlay) {
  datePickerOverlay.addEventListener('click', closeDatePicker);
}

if (dpPrev) {
  dpPrev.addEventListener('click', () => {
    dpViewDate.setMonth(dpViewDate.getMonth() - 1);
    renderCalendar();
  });
}

if (dpNext) {
  dpNext.addEventListener('click', () => {
    dpViewDate.setMonth(dpViewDate.getMonth() + 1);
    renderCalendar();
  });
}

if (dpToday) {
  dpToday.addEventListener('click', () => {
    const today = new Date();
    dpSelectedDate = today;
    dpViewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    dateInput.value = formatDate(today);
    closeDatePicker();
  });
}

if (dpClear) {
  dpClear.addEventListener('click', () => {
    dpSelectedDate = null;
    dateInput.value = '';
    closeDatePicker();
  });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && datePickerPopup.classList.contains('active')) {
    closeDatePicker();
  }
});

// ====== BOOKING FORM → WHATSAPP REDIRECT ======
const WHATSAPP_NUMBER = '917990050914';

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const tripType = document.getElementById('tripType').value;
    const date = document.getElementById('date').value;
    const pickup = document.getElementById('pickup').value.trim();
    const drop = document.getElementById('drop').value.trim();

    // Build WhatsApp message
    const message =
`🚗 *New Booking Request — Preet Travels*

👤 *Name:* ${name}
📞 *Phone:* ${phone}
🗂️ *Trip Type:* ${tripType}
📅 *Date:* ${date || 'Not specified'}
📍 *Pickup:* ${pickup}
📍 *Drop:* ${drop}

Looking forward to a comfortable ride! 🙏`;

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(waUrl, '_blank');
  });
}

// ====== SMOOTH SCROLL FOR ANCHOR LINKS ======
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });
});

// ====== GALLERY CAROUSEL ======
const slides = document.querySelectorAll('.gallery-slide');
const dots = document.querySelectorAll('.gallery-dots .dot');
const prevBtn = document.getElementById('galleryPrev');
const nextBtn = document.getElementById('galleryNext');
let currentSlide = 0;
let autoPlayTimer;

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function startAutoPlay() {
  autoPlayTimer = setInterval(() => goToSlide(currentSlide + 1), 4000);
}

function resetAutoPlay() {
  clearInterval(autoPlayTimer);
  startAutoPlay();
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetAutoPlay(); });
}
if (nextBtn) {
  nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoPlay(); });
}
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => { goToSlide(i); resetAutoPlay(); });
});

startAutoPlay();

// Touch swipe for gallery
let touchStartX = 0;
let touchEndX = 0;
const galleryTrack = document.getElementById('galleryTrack');

if (galleryTrack) {
  galleryTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  galleryTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSlide(currentSlide + 1);
      } else {
        goToSlide(currentSlide - 1);
      }
      resetAutoPlay();
    }
  }, { passive: true });
}
