const API = '/api';

async function request(path, opts = {}) {
  const headers = opts.headers || {};
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = 'Bearer ' + token;
  opts.headers = headers;
  const res = await fetch(API + path, opts);
  if (!res.ok) throw await res.json();
  return res.json();
}

async function loadPins() {
  try {
    const pins = await request('/pins?mine=0');
    document.getElementById('pins').innerHTML = pins.map(p =>
      `<div class="pin">
        <h3><a href="view.html?id=${p._id}">${p.title}</a></h3>
        <p>Tags: ${p.tags.join(', ')}</p>
        <p>By: ${p.author.username}</p>
      </div>`).join('');
  } catch (err) {
    console.error('Could not load pins', err);
  }
}

async function authHandler(action) {
  document.getElementById('form').onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await request(`/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    localStorage.setItem('token', res.token);
    location.href = 'dashboard.html';
  };
}

async function createHandler() {
  const id = new URLSearchParams(location.search).get('id');
  if (id) {
    const pin = await request('/pins/' + id);
    const form = document.getElementById('form');
    form.title.value = pin.title;
    form.link.value = pin.link;
    form.body.value = pin.body;
    form.tags.value = pin.tags.join(', ');
    form.isPrivate.checked = pin.isPrivate;
  }
  document.getElementById('form').onsubmit = async e => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const path = id ? '/pins/' + id : '/pins';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch('/api' + path, {
      method,
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      body: data
    });
    if (!res.ok) return alert('Failed to save');
    location.href = 'dashboard.html';
  };
}

async function loadUserPins() {
  const pins = await request('/pins?mine=1');
  if (!pins.length) return location.href = 'create.html';
  document.getElementById('pins').innerHTML = pins.map(p =>
    `<div class="pin">
      <h3>${p.title}</h3>
      <button onclick="location.href='create.html?id=${p._id}'">Edit</button>
      <button onclick="del('${p._id}')">Delete</button>
    </div>`).join('');
}

async function viewPin() {
  const id = new URLSearchParams(location.search).get('id');
  const p = await request('/pins/' + id);
  document.getElementById('title').textContent = p.title;
  document.getElementById('body').innerHTML = p.body;
  document.getElementById('link').href = p.link;
  document.getElementById('author').textContent = p.author.username;
  if (p.image) {
    const img = document.getElementById('image');
    img.src = p.image;
    img.style.display = 'block';
  }
}

async function del(id) {
  if (!confirm('Delete this pin?')) return;
  await request('/pins/' + id, { method: 'DELETE' });
  loadUserPins();
}

async function searchByTags(tags) {
  const pins = await request('/pins?tags=' + encodeURIComponent(tags));
  document.getElementById('pins').innerHTML = pins.map(p =>
    `<div class="pin">
      <h3><a href="view.html?id=${p._id}">${p.title}</a></h3>
      <p>Tags: ${p.tags.join(', ')}</p>
      <p>By: ${p.author.username}</p>
    </div>`).join('');
}

async function updateNav() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Auto-clear bad tokens that don't have username/email
    if (!payload.username && !payload.email) {
      localStorage.removeItem('token');
      location.reload();
      return;
    }

    const accountInfo = document.getElementById('accountInfo');
    if (accountInfo) {
      accountInfo.textContent = `Account: ${payload.username || payload.email}`;
    }

    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const createLink = document.getElementById('createLink');

    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (dashboardLink) dashboardLink.style.display = 'inline';
    if (createLink) createLink.style.display = 'inline';
  } catch (err) {
    console.error('Failed to decode token', err);
    localStorage.removeItem('token');
    location.reload();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') loadPins();
  if (page === 'login') authHandler('login');
  if (page === 'register') authHandler('register');
  if (page === 'create') createHandler();
  if (page === 'dashboard') loadUserPins();
  if (page === 'view') viewPin();

  updateNav();
});
