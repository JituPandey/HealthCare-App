// Utilities
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function toast(msg, timeout = 2800){
  const t = $('#toast');
  if(!t) return;
  t.textContent = msg;
  t.hidden = false;
  setTimeout(()=> t.hidden = true, timeout);
}

// API helpers
const API_BASE = window.location.origin;

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function saveAppointment(appointmentData) {
  return await apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  });
}

async function saveContact(contactData) {
  return await apiCall('/contacts', {
    method: 'POST',
    body: JSON.stringify(contactData)
  });
}

async function getAppointments() {
  const result = await apiCall('/appointments');
  return result.data || [];
}

async function getContacts() {
  const result = await apiCall('/contacts');
  return result.data || [];
}

async function getStats() {
  const result = await apiCall('/admin/stats');
  return result.data;
}

function setYear(){
  const y = $('#year');
  if(y) y.textContent = new Date().getFullYear();
}

// Mobile nav
function setupNav(){
  const btn = $('.nav-toggle');
  const nav = $('#primary-nav');
  if(!btn || !nav) return;
  const hide = () => { nav.setAttribute('hidden', ''); btn.setAttribute('aria-expanded','false'); };
  const show = () => { nav.removeAttribute('hidden'); };

  const mq = window.matchMedia('(max-width: 560px)');
  const apply = () => {
    if(mq.matches){
      // mobile: start hidden
      hide();
    } else {
      // desktop: always show nav, collapsed state irrelevant
      show();
      btn.setAttribute('aria-expanded','false');
    }
  };
  apply();
  mq.addEventListener('change', apply);

  btn.addEventListener('click', () => {
    if(!mq.matches) return; // toggle only on mobile
    if(nav.hasAttribute('hidden')){ show(); btn.setAttribute('aria-expanded','true'); }
    else { hide(); }
  });
  // Close on link click (mobile)
  nav.addEventListener('click', (e)=>{
    if(e.target.closest('a')) hide();
  });
}

// Search filtering for services and doctors
function setupSearch(){
  const input = $('#globalSearch');
  const collections = $$('[data-collection]');
  const map = new Map();
  collections.forEach(col => {
    const key = col.getAttribute('data-collection');
    map.set(key, {
      items: $$('.card', col).map(el => ({
        el,
        text: (el.getAttribute('data-name') || '').toLowerCase() + ' ' + (el.getAttribute('data-tags') || '').toLowerCase()
      })),
      empty: $(`.no-results[data-for="${key}"]`)
    });
  });

  function filter(v){
    const q = v.trim().toLowerCase();
    map.forEach(({items, empty}) => {
      let visibleCount = 0;
      items.forEach(it => {
        const show = q === '' || it.text.includes(q);
        it.el.style.display = show ? '' : 'none';
        if(show) visibleCount++;
      });
      if(empty) empty.hidden = visibleCount !== 0;
    });
  }

  if(input){
    input.addEventListener('input', (e)=> filter(e.target.value));
  }
}

// Appointment form
function setupAppointmentForm(){
  const form = $('#appointmentForm');
  if(!form) return;
  const nameI = $('#apName');
  const emailI = $('#apEmail');
  const phoneI = $('#apPhone');
  const doctorS = $('#apDoctor');
  const dateI = $('#apDate');
  const timeI = $('#apTime');
  const success = $('#apSuccess');

  // Set min date to today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  dateI.min = `${yyyy}-${mm}-${dd}`;

  function setError(input, msg){
    const field = input.closest('.field');
    const small = field.querySelector('.error');
    small.textContent = msg || '';
    
    // Visual feedback
    field.classList.toggle('has-error', !!msg);
    field.classList.toggle('has-success', !msg && input.value.trim());
  }

  function validate(){
    let ok = true;
    const name = nameI.value.trim();
    const email = emailI.value.trim();
    const phone = phoneI.value.trim();
    const doctor = doctorS.value;
    const date = dateI.value;
    const time = timeI.value;

    // Name
    if(name.length < 2){ ok = false; setError(nameI, 'Please enter your full name.'); } else setError(nameI);
    // Email
    const emailRE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRE.test(email)){ ok = false; setError(emailI, 'Enter a valid email.'); } else setError(emailI);
    // Phone
    const phoneRE = /^[+\d][\d\s()-]{6,}$/;
    if(!phoneRE.test(phone)){ ok = false; setError(phoneI, 'Enter a valid phone number.'); } else setError(phoneI);
    // Doctor
    if(!doctor){ ok = false; setError(doctorS, 'Select a doctor.'); } else setError(doctorS);
    // Date
    if(!date){ ok = false; setError(dateI, 'Choose a date.'); } else setError(dateI);
    // Time
    if(!time){ ok = false; setError(timeI, 'Choose a time.'); } else setError(timeI);

    return ok;
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!validate()) return;
    
    // Add loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simulate async operation
    setTimeout(async () => {
      try {
        // Save to backend
        const formData = {
          name: nameI.value.trim(),
          email: emailI.value.trim(),
          phone: phoneI.value.trim(),
          doctor: doctorS.value,
          date: dateI.value,
          time: timeI.value
        };
        
        const result = await saveAppointment(formData);
        success.hidden = false;
        toast(result.message || `Appointment booked with ${formData.doctor}!`);
        form.reset();
        // Re-apply min date after reset
        dateI.min = `${yyyy}-${mm}-${dd}`;
        updateDataCount();
      } catch (error) {
        toast(`Error: ${error.message}`);
      }
      
      // Remove loading state
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }, 1000);
  });
}

// Contact form
function setupContactForm(){
  const form = $('#contactForm');
  if(!form) return;
  const nameI = $('#ctName');
  const emailI = $('#ctEmail');
  const msgI = $('#ctMsg');
  const success = $('#ctSuccess');

  function setError(input, msg){
    const small = input.closest('.field')?.querySelector('.error');
    if(small) small.textContent = msg || '';
  }

  function validate(){
    let ok = true;
    if(nameI.value.trim().length < 2){ ok = false; setError(nameI, 'Please enter your name.'); } else setError(nameI);
    const emailRE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRE.test(emailI.value.trim())){ ok = false; setError(emailI, 'Enter a valid email.'); } else setError(emailI);
    if(msgI.value.trim().length < 5){ ok = false; setError(msgI, 'Message is too short.'); } else setError(msgI);
    return ok;
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!validate()) return;
    
    // Add loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simulate async operation
    setTimeout(async () => {
      try {
        // Save to backend
        const formData = {
          name: nameI.value.trim(),
          email: emailI.value.trim(),
          message: msgI.value.trim()
        };
        
        const result = await saveContact(formData);
        success.hidden = false;
        toast(result.message || 'Message sent successfully!');
        form.reset();
        updateDataCount();
      } catch (error) {
        toast(`Error: ${error.message}`);
      }
      
      // Remove loading state
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }, 800);
  });
}

// Book buttons preselect doctor in form
function setupDoctorBooking(){
  $$('.book-btn').forEach(btn => {
    btn.addEventListener('click', ()=>{
      const name = btn.getAttribute('data-doctor');
      const select = $('#apDoctor');
      if(select){
        select.value = name;
      }
      // Scroll to form
      document.getElementById('appointments')?.scrollIntoView({behavior:'smooth'});
      toast(`Booking for ${name}`);
    });
  });
}

// Enhance avatars with initials and icons
function setupAvatars(){
  $$('.avatar').forEach(a => {
    const init = a.getAttribute('data-initials') || '';
    const specialty = a.getAttribute('data-specialty') || '';
    
    // If it's not an animated avatar, just add initials
    if(!a.classList.contains('avatar-animated')) {
      a.textContent = init;
      return;
    }
    
    // For animated avatars, the icon is already in HTML
    // Add specialty-based background colors
    const bg = a.querySelector('.avatar-bg');
    if(bg) {
      const colors = {
        cardiology: 'linear-gradient(135deg, #fee2e2, #fecaca)',
        pediatrics: 'linear-gradient(135deg, #fef3c7, #fed7aa)', 
        dermatology: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
        orthopedics: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        neurology: 'linear-gradient(135deg, #e0f2fe, #bae6fd)'
      };
      bg.style.background = colors[specialty] || bg.style.background;
    }
  });
}

// Data management panel
function createDataPanel() {
  const panel = document.createElement('div');
  panel.id = 'dataPanel';
  panel.className = 'data-panel';
  panel.innerHTML = `
    <div class="panel-header">
      <h3>📊 Stored Data</h3>
      <button class="panel-close" aria-label="Close panel">×</button>
    </div>
    <div class="panel-content">
      <div class="data-section">
        <h4>Appointments (<span id="appointmentCount">0</span>)</h4>
        <div id="appointmentList" class="data-list"></div>
      </div>
      <div class="data-section">
        <h4>Messages (<span id="contactCount">0</span>)</h4>
        <div id="contactList" class="data-list"></div>
      </div>
      <button id="clearData" class="btn btn-secondary">Clear All Data</button>
    </div>
  `;
  document.body.appendChild(panel);
  
  // Event listeners
  panel.querySelector('.panel-close').onclick = () => panel.hidden = true;
  panel.querySelector('#clearData').onclick = async () => {
    if(confirm('Clear all stored data from server?')) {
      try {
        await apiCall('/admin/clear', { method: 'DELETE' });
        updateDataDisplay();
        updateDataCount();
        toast('All data cleared from server');
      } catch (error) {
        toast(`Error: ${error.message}`);
      }
    }
  };
  
  return panel;
}

async function updateDataDisplay() {
  try {
    const appointments = await getAppointments();
    const contacts = await getContacts();
    
    const appointmentList = $('#appointmentList');
    const contactList = $('#contactList');
    
    if(appointmentList) {
      appointmentList.innerHTML = appointments.map(apt => `
        <div class="data-item">
          <strong>${apt.name}</strong> - ${apt.doctor}<br>
          <small>${apt.date} at ${apt.time} | ${apt.email}</small>
          <div class="status-badge status-${apt.status}">${apt.status}</div>
        </div>
      `).join('') || '<p class="muted">No appointments stored</p>';
    }
    
    if(contactList) {
      contactList.innerHTML = contacts.map(msg => `
        <div class="data-item">
          <strong>${msg.name}</strong>
          <div class="status-badge status-${msg.status}">${msg.status}</div><br>
          <small>${msg.email}</small><br>
          <p>${msg.message}</p>
        </div>
      `).join('') || '<p class="muted">No messages stored</p>';
    }
    
    const appointmentCount = $('#appointmentCount');
    const contactCount = $('#contactCount');
    if(appointmentCount) appointmentCount.textContent = appointments.length;
    if(contactCount) contactCount.textContent = contacts.length;
  } catch (error) {
    console.error('Error updating data display:', error);
    toast('Error loading data from server');
  }
}

async function updateDataCount() {
  try {
    const stats = await getStats();
    const total = stats.appointments.total + stats.contacts.total;
    
    let badge = $('#dataBadge');
    if(!badge && total > 0) {
      badge = document.createElement('span');
      badge.id = 'dataBadge';
      badge.className = 'data-badge';
      document.body.appendChild(badge);
    }
    
    if(badge) {
      badge.textContent = total;
      badge.hidden = total === 0;
    }
  } catch (error) {
    console.error('Error updating data count:', error);
  }
}

function setupDataPanel() {
  const panel = createDataPanel();
  panel.hidden = true;
  
  // Add floating action button
  const fab = document.createElement('button');
  fab.className = 'fab';
  fab.innerHTML = '📁';
  fab.title = 'View stored data';
  fab.onclick = () => {
    updateDataDisplay();
    panel.hidden = false;
  };
  document.body.appendChild(fab);
  
  updateDataCount();
}

// Background switcher
function setupBackgroundSwitcher() {
  const buttons = $$('.bg-option');
  const body = document.body;
  
  // Set default
  body.className = 'bg-glass';
  buttons.find(btn => btn.dataset.bg === 'glass')?.classList.add('active');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const bgType = btn.dataset.bg;
      
      // Remove all bg classes
      body.className = body.className.replace(/bg-\w+/g, '');
      
      // Add new bg class
      body.classList.add(`bg-${bgType}`);
      
      // Update active button
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Toast feedback
      const bgNames = {
        glass: 'Glass Morphism',
        mesh: 'Mesh Gradient', 
        minimal: 'Minimal Clean',
        medical: 'Medical Theme'
      };
      toast(`Background: ${bgNames[bgType]}`);
    });
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  setYear();
  setupNav();
  setupSearch();
  setupAppointmentForm();
  setupContactForm();
  setupDoctorBooking();
  setupAvatars();
  setupDataPanel();
  setupBackgroundSwitcher();
  
  // Add scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1 });
  
  $$('.card, .hero-content, .section-header').forEach(el => {
    observer.observe(el);
  });
});
