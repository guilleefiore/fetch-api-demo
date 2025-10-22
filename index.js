const RANDOM_URL = 'https://thesimpsonsapi.com/api/characters/random';
const CDN_BASE   = 'https://cdn.thesimpsonsapi.com/500';

const $galeria = document.getElementById('galeria');
const $btn     = document.getElementById('cargar');
const $loader  = document.getElementById('loader');
const $msg     = document.getElementById('mensaje');
const $buscar  = document.getElementById('buscar');

window.addEventListener('error', e => console.error('JS Error:', e.error || e.message));
window.addEventListener('unhandledrejection', e => console.error('Promise Rejection:', e.reason));

const safeId = () => `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const normalize = d => Array.isArray(d) ? d[0] : d;

async function fetchRandomCharacter() {
  const resp = await fetch(RANDOM_URL, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const raw = normalize(await resp.json()) || {};

  const image =
    (raw.image && raw.image.startsWith('http')) ? raw.image :
    (raw.portrait_path ? `${CDN_BASE}${raw.portrait_path}` : '') ||
    'https://placehold.co/400x400?text=No+Image';

  return {
    id: raw.id ?? safeId(),
    name: raw.name ?? raw.fullName ?? 'Desconocido',
    occupation: Array.isArray(raw.occupation) ? (raw.occupation[0] ?? '—') : (raw.occupation ?? '—'),
    image
  };
}

function card({ name, occupation, image }) {
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <img src="${image}" alt="${name}" loading="lazy"
         onerror="this.src='https://placehold.co/400x400?text=No+Image'">
    <div class="info">
      <div class="nombre">${name}</div>
      <div class="ocupacion">${occupation}</div>
    </div>`;
  return el;
}

async function cargarPersonajes(n = 6) {
  $msg.textContent = '';
  $galeria.innerHTML = '';
  $loader.classList.remove('oculto');
  $btn.disabled = true;

  try {
    const tareas = Array.from({ length: n }, () => fetchRandomCharacter());
    const personajes = await Promise.all(tareas);
    console.table(personajes);
    personajes.forEach(p => $galeria.appendChild(card(p)));
  } catch (err) {
    console.error(err);
    $msg.textContent = 'No se pudo cargar la galería. Intentá nuevamente.';
    $msg.classList.add('error');
  } finally {
    $loader.classList.add('oculto');
    $btn.disabled = false;
  }
}

$buscar?.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  for (const el of $galeria.querySelectorAll('.card')) {
    const name = el.querySelector('.nombre').textContent.toLowerCase();
    el.style.display = name.includes(q) ? '' : 'none';
  }
});

$btn.addEventListener('click', () => cargarPersonajes(6));
cargarPersonajes(6);