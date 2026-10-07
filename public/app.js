const $ = (sel) => document.querySelector(sel);
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let me = null;

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

function build(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

const formatDate = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/* ---------- Routing ---------- */

async function route() {
  const name = location.hash.slice(1).split('?')[0] || 'home';
  me = (await api('/me')).user;

  const views = [...document.querySelectorAll('[data-view]')];
  let view = views.find((v) => v.dataset.view.split(' ').includes(name));
  if (name === 'account' && !me) return (location.hash = 'login');
  if ((name === 'login' || name === 'signup') && me) return (location.hash = 'account');

  views.forEach((v) => (v.hidden = true));
  if (!view) view = views[0];
  view.hidden = false;
  renderNav();

  if (view.dataset.view === 'home') {
    renderPlans($('#plan-list'));
    const target = name !== 'home' && document.getElementById(name);
    target ? target.scrollIntoView() : scrollTo(0, 0);
  } else if (name === 'account') {
    renderAccount();
  } else {
    renderAuth(name);
  }
}

function renderNav() {
  $('#nav').replaceChildren(...(me
    ? [build('a', { href: '#account', className: 'btn', textContent: 'My account' }),
       build('button', { textContent: 'Log out', onclick: logout })]
    : [build('a', { href: '#login', textContent: 'Log in' }),
       build('a', { href: '#signup', className: 'btn', textContent: 'Sign up' })]));
}

async function logout() {
  await api('/logout', { method: 'POST' });
  location.hash = 'home';
}

/* ---------- Plans ---------- */

let plans;
const loadPlans = async () => (plans ??= await api('/plans'));

async function renderPlans(container) {
  await loadPlans();
  container.replaceChildren(...plans.map((p) => build('div', { className: `card plan${p.featured ? ' featured' : ''}` }, [
    build('h3', { textContent: p.name }),
    build('div', { className: 'price', textContent: p.price }),
    build('p', { className: 'muted', textContent: p.summary }),
    build('button', { className: 'btn', textContent: me ? 'Choose plan' : 'Get started', onclick: (e) => choosePlan(p.key, e.target) }),
  ])));
}

async function choosePlan(plan, button) {
  if (!me) return (location.hash = 'signup');
  button.disabled = true;
  try {
    location.href = (await api('/checkout', { method: 'POST', body: { plan } })).url;
  } catch (err) {
    alert(err.message);
    button.disabled = false;
  }
}

/* ---------- Auth ---------- */

function renderAuth(mode) {
  const signup = mode === 'signup';
  const form = $('#auth-form');
  $('#auth-title').textContent = signup ? 'Create your account' : 'Log in';
  form.querySelector('[data-signup]').hidden = !signup;
  form.name.required = signup;
  form.password.autocomplete = signup ? 'new-password' : 'current-password';
  form.querySelector('button').textContent = signup ? 'Create account' : 'Log in';
  form.querySelector('.error').textContent = '';
  $('#auth-switch').innerHTML = signup
    ? 'Already have an account? <a href="#login">Log in</a>'
    : 'New here? <a href="#signup">Create an account</a>';

  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      await api(signup ? '/signup' : '/login', { method: 'POST', body: { ...data, timezone } });
      form.reset();
      location.hash = 'account';
    } catch (err) {
      form.querySelector('.error').textContent = err.message;
    }
  };
}

/* ---------- Account ---------- */

async function renderAccount() {
  await loadPlans();
  $('#me-name').textContent = me.name;
  $('#me-plan').textContent = me.paid
    ? `Plan: ${plans.find((p) => p.key === me.plan)?.name ?? me.plan}. Assistant and alerts are on.`
    : 'No plan yet.';
  $('#billing').hidden = !me.paid;
  $('#billing').onclick = async () => (location.href = (await api('/billing', { method: 'POST' })).url);
  $('#locked').hidden = me.paid;
  $('#unlocked').hidden = !me.paid;

  if (!me.paid) return renderPlans($('#account-plans'));
  renderDeadlines();
  renderAlertSettings();
  renderChat();
}

async function renderDeadlines() {
  const list = await api('/deadlines');
  $('#deadline-list').replaceChildren(...(list.length
    ? list.map((d) => build('li', {}, [
        build('span', {}, [d.title, build('small', { textContent: formatDate(d.due_at) })]),
        build('button', { className: 'link', textContent: 'Remove', onclick: async () => {
          await api(`/deadlines/${d.id}`, { method: 'DELETE' });
          renderDeadlines();
        } }),
      ]))
    : [build('li', { className: 'muted', textContent: 'No upcoming deadlines.' })]));
}

$('#deadline-form').onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  try {
    await api('/deadlines', { method: 'POST', body: { title: form.title.value, due_at: new Date(form.due.value).toISOString() } });
    form.reset();
    form.querySelector('.error').textContent = '';
    renderDeadlines();
  } catch (err) {
    form.querySelector('.error').textContent = err.message;
  }
};

function renderAlertSettings() {
  const boxes = [...$('#alert-form').elements];
  boxes.forEach((b) => (b.checked = me.alertMinutes.includes(Number(b.value))));
  $('#alert-form').onchange = () => api('/settings', {
    method: 'PUT',
    body: { timezone, alertMinutes: boxes.filter((b) => b.checked).map((b) => Number(b.value)) },
  });
}

/* ---------- Assistant ---------- */

const addMessage = (role, text) => {
  const log = $('#chat-log');
  log.append(build('div', { className: `msg ${role}`, textContent: text }));
  log.scrollTop = log.scrollHeight;
};

async function renderChat() {
  const history = await api('/chat');
  $('#chat-log').replaceChildren();
  if (!history.length) addMessage('assistant', `Hi ${me.name}! How can I help your business today?`);
  history.forEach((m) => addMessage(m.role, m.text));
}

$('#chat-form').onsubmit = async (e) => {
  e.preventDefault();
  const input = e.target.message;
  const button = e.target.querySelector('button');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addMessage('user', text);
  button.disabled = true;
  const sender = me.email;
  try {
    const { reply } = await api('/chat', { method: 'POST', body: { message: text } });
    if (me?.email !== sender) return; // logged out while waiting
    addMessage('assistant', reply);
    renderDeadlines();
  } catch (err) {
    if (me?.email === sender) addMessage('assistant', err.message);
  } finally {
    button.disabled = false;
    input.focus();
  }
};

$('#chat-clear').onclick = async () => {
  await api('/chat', { method: 'DELETE' });
  renderChat();
};

addEventListener('hashchange', route);
route();
