/* ─────────────────────────────────────────────────────────────────────────────
   EstateHub — SPA Client
   Single vanilla JS file: routing, auth, properties, favourites, UI helpers.
───────────────────────────────────────────────────────────────────────────── */

const API = ''; // Same origin — Express serves both API and static files

// ── State ─────────────────────────────────────────────────────────────────────
let currentUser = null;       // { id, name, email, role }
let allProperties = [];       // Array<Property>
let favouriteIds = new Set(); // Set<string> of favourited property _id strings

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const user  = localStorage.getItem('user');

  if (token && user) {
    currentUser = JSON.parse(user);
    showDashboard();
    loadDashboard();
  } else {
    showAuth();
  }

  setupForms();
});

// ── Routing ───────────────────────────────────────────────────────────────────
function showAuth() {
  document.getElementById('view-auth').classList.remove('hidden');
  document.getElementById('view-dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('view-auth').classList.add('hidden');
  document.getElementById('view-dashboard').classList.remove('hidden');
  document.getElementById('welcome-title').textContent = `Welcome, ${currentUser.name}`;
}

// ── Tab Switch ────────────────────────────────────────────────────────────────
function switchTab(tab) {
  const loginForm    = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const tabLogin     = document.getElementById('tab-login');
  const tabRegister  = document.getElementById('tab-register');

  clearErrors();

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    tabLogin.setAttribute('aria-selected', 'true');
    tabRegister.setAttribute('aria-selected', 'false');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    tabLogin.setAttribute('aria-selected', 'false');
    tabRegister.setAttribute('aria-selected', 'true');
  }
}

// ── Forms Setup ───────────────────────────────────────────────────────────────
function setupForms() {
  document.getElementById('form-login').addEventListener('submit', handleLogin);
  document.getElementById('form-register').addEventListener('submit', handleRegister);
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  clearErrors();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn      = document.getElementById('login-submit-btn');

  // Client-side checks for immediate UX feedback
  let valid = true;
  if (!email) { setError('login-email-error', 'Email is required'); valid = false; }
  if (!password) { setError('login-password-error', 'Password is required'); valid = false; }
  if (!valid) return;

  btn.disabled = true;
  btn.textContent = 'Signing in…';

  try {
    const res  = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError('login-form-error', data.error || 'Login failed');
      return;
    }

    // Persist auth
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;

    showDashboard();
    loadDashboard();
  } catch {
    setError('login-form-error', 'Network error — please try again');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  clearErrors();

  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const btn      = document.getElementById('reg-submit-btn');

  // Client-side validation
  let valid = true;
  if (!name)    { setError('reg-name-error', 'Name is required');  valid = false; }
  if (!email)   { setError('reg-email-error', 'Email is required'); valid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError('reg-email-error', 'Enter a valid email address');   valid = false;
  }
  if (!password)          { setError('reg-password-error', 'Password is required'); valid = false; }
  else if (password.length < 8) { setError('reg-password-error', 'Minimum 8 characters');   valid = false; }
  if (password !== confirm) { setError('reg-confirm-error', 'Passwords do not match');     valid = false; }
  if (!valid) return;

  btn.disabled = true;
  btn.textContent = 'Creating account…';

  try {
    const res  = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError('reg-form-error', data.error || 'Registration failed');
      return;
    }

    showToast('Account created! Please sign in. ✓', 'success');
    switchTab('login');
    document.getElementById('login-email').value = email;
  } catch {
    setError('reg-form-error', 'Network error — please try again');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

// ── LOGOUT ────────────────────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  allProperties = [];
  favouriteIds.clear();
  clearErrors();
  showAuth();
}

// ── DASHBOARD DATA LOADING ────────────────────────────────────────────────────
async function loadDashboard() {
  renderSkeletons('all-properties-grid', 10);
  renderSkeletons('favourites-grid', 3);

  try {
    const [propsRes, favsRes] = await Promise.all([
      authFetch('/api/properties'),
      authFetch('/api/favourites'),
    ]);

    if (!propsRes.ok || !favsRes.ok) {
      if (propsRes.status === 401 || favsRes.status === 401) { logout(); return; }
      showToast('Failed to load data ', 'error');
      return;
    }

    allProperties = await propsRes.json();
    const favProps = await favsRes.json();
    favouriteIds   = new Set(favProps.map(p => p._id));

    renderAllProperties();
    renderFavourites();
  } catch {
    showToast('Network error — could not load properties', 'error');
  }
}

// ── RENDER: ALL PROPERTIES ────────────────────────────────────────────────────
function renderAllProperties() {
  const grid = document.getElementById('all-properties-grid');
  grid.innerHTML = '';

  // Update count badge if the element exists
  const count = document.getElementById('all-props-count');
  if (count) count.textContent = `${allProperties.length} listings`;

  if (allProperties.length === 0) {
    grid.innerHTML = '<p class="empty-state">No properties available.</p>';
    return;
  }

  for (const prop of allProperties) {
    grid.appendChild(buildCard(prop, true));
  }
}

// ── RENDER: FAVOURITES ────────────────────────────────────────────────────────
function renderFavourites() {
  const grid  = document.getElementById('favourites-grid');
  const empty = document.getElementById('favourites-empty');
  grid.innerHTML = '';

  const favProps = allProperties.filter(p => favouriteIds.has(p._id));

  if (favProps.length === 0) {
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    for (const prop of favProps) {
      grid.appendChild(buildFavouriteItem(prop));
    }
  }
}

// ── BUILD FAVOURITE ITEM ──────────────────────────────────────────────────────
function buildFavouriteItem(prop) {
  const item = document.createElement('div');
  item.className = 'fav-item';
  item.id = `fav-item-${prop._id}`;

  const imageHtml = prop.image_url
    ? `<img src="${escHtml(prop.image_url)}" alt="${escHtml(prop.title)}" loading="lazy" />`
    : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:1.5rem;color:#d5d5d5;">🏠</div>`;

  item.innerHTML = `
    <div class="fav-item-image">${imageHtml}</div>
    <div class="fav-item-content">
      <div class="fav-item-title">${escHtml(prop.title)}</div>
      <div class="fav-item-location">${escHtml(prop.location)}</div>
      <div class="fav-item-price">${formatPrice(prop.price)}</div>
    </div>
  `;
  return item;
}

// ── BUILD CARD ────────────────────────────────────────────────────────────────
function buildCard(prop, showFavBtn) {
  const isFav = favouriteIds.has(prop._id);
  const card  = document.createElement('div');
  card.className = 'prop-card';
  card.id = `card-${prop._id}`;

  const imageHtml = prop.image_url
    ? `<img src="${escHtml(prop.image_url)}" alt="${escHtml(prop.title)}" loading="lazy" />`
    : `<div class="prop-image-placeholder">🏠</div>`;

  const favBtnHtml = showFavBtn
    ? `<button
         class="prop-fav-btn ${isFav ? 'saved' : ''}"
         id="fav-btn-${prop._id}"
         onclick="toggleFavourite('${prop._id}')"
         aria-label="${isFav ? 'Remove from favourites' : 'Add to favourites'}"
       >${isFav ? '❤️' : '♡'}</button>`
    : '';

  const beds  = prop.beds  ?? 3;
  const baths = prop.baths ?? 2;
  const sqft  = prop.sqft  ? prop.sqft.toLocaleString() : '—';
  const type  = prop.type  || 'Property';

  card.innerHTML = `
    <div class="prop-image-wrap">
      ${imageHtml}
      ${favBtnHtml}
      <div class="prop-type-badge">${escHtml(type)}</div>
      <div class="prop-verified-badge">VERIFIED</div>
    </div>
    <div class="prop-body">
      <div class="prop-header">
        <div class="prop-title-price">
          <h3 class="prop-title">${escHtml(prop.title)}</h3>
          <p class="prop-price">${formatPrice(prop.price)}</p>
        </div>
      </div>
      <p class="prop-location">📍 ${escHtml(prop.location)}</p>
      <div class="prop-specs">
        <div class="prop-spec">🛏️ ${beds} Bed${beds !== 1 ? 's' : ''}</div>
        <div class="prop-spec">🚿 ${baths} Bath${baths !== 1 ? 's' : ''}</div>
        <div class="prop-spec">📐 ${sqft} sqft</div>
      </div>
    </div>
  `;
  return card;
}

// ── TOGGLE FAVOURITE (Optimistic UI) ─────────────────────────────────────────
async function toggleFavourite(propertyId) {
  const btn       = document.getElementById(`fav-btn-${propertyId}`);
  // propertyId is a MongoDB _id string like '64abc...'
  const wasFav    = favouriteIds.has(propertyId);
  const method    = wasFav ? 'DELETE' : 'POST';

  // ── Optimistic update ──
  if (wasFav) {
    favouriteIds.delete(propertyId);
  } else {
    favouriteIds.add(propertyId);
  }
  updateFavBtn(btn, !wasFav);
  renderFavourites();

  btn.disabled = true;

  try {
    const res = await authFetch(`/api/favourites/${propertyId}`, { method });

    if (!res.ok) {
      // Roll back
      if (wasFav) { favouriteIds.add(propertyId); } else { favouriteIds.delete(propertyId); }
      updateFavBtn(btn, wasFav);
      renderFavourites();
      const data = await res.json();
      showToast(data.error || 'Something went wrong ✗', 'error');
    } else {
      const action = wasFav ? 'Removed from favourites' : 'Added to favourites';
      showToast(`${action} ✓`, 'success');
    }
  } catch {
    // Roll back
    if (wasFav) { favouriteIds.add(propertyId); } else { favouriteIds.delete(propertyId); }
    updateFavBtn(btn, wasFav);
    renderFavourites();
    showToast('Network error ✗', 'error');
  } finally {
    btn.disabled = false;
  }
}

function updateFavBtn(btn, isFav) {
  if (!btn) return;
  btn.className      = `prop-fav-btn ${isFav ? 'saved' : ''}`;
  btn.textContent    = isFav ? '❤️' : '♡';
  btn.setAttribute('aria-label', isFav ? 'Remove from favourites' : 'Add to favourites');
}

// ── SKELETON LOADING ──────────────────────────────────────────────────────────
function renderSkeletons(gridId, count) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'skeleton-card skeleton';
    grid.appendChild(el);
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  return fetch(`${API}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

function escHtml(str) {
  // Escape HTML to prevent XSS when injecting property data into innerHTML
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── FORM ERRORS ───────────────────────────────────────────────────────────────
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => (el.textContent = ''));
  document.querySelectorAll('input').forEach(el => el.classList.remove('invalid'));
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast     = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── SEARCH FILTER ─────────────────────────────────────────────────────────────
function filterProperties(query) {
  const q = query.trim().toLowerCase();
  const grid = document.getElementById('all-properties-grid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.prop-card');
  cards.forEach(card => {
    const title    = (card.querySelector('.prop-title')?.textContent || '').toLowerCase();
    const location = (card.querySelector('.prop-location')?.textContent || '').toLowerCase();
    const type     = (card.querySelector('.prop-type-badge')?.textContent || '').toLowerCase();
    const matches  = !q || title.includes(q) || location.includes(q) || type.includes(q);
    card.style.display = matches ? '' : 'none';
  });
}

// ── MOBILE NAV ────────────────────────────────────────────────────────────────
function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  if (nav) nav.classList.toggle('open');
}

// Expose globals needed by inline event handlers (onclick="…")
window.switchTab       = switchTab;
window.logout          = logout;
window.toggleFavourite = toggleFavourite;
window.filterProperties = filterProperties;
window.toggleMobileNav  = toggleMobileNav;
