// Endpoints
const RANDOM_URL   = 'https://thesimpsonsapi.com/api/characters/random';
const CDN_BASE     = 'https://cdn.thesimpsonsapi.com/500';
const FALLBACK_URL = 'https://api.sampleapis.com/simpsons/characters';

// DOM
const $galeria = document.getElementById('galeria');
const $btn     = document.getElementById('cargar');
const $loader  = document.getElementById('loader');
const $msg     = document.getElementById('mensaje');
const $buscar  = document.getElementById('buscar');

// Utilidades
const safeId = () => `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const normalize = (d) => (Array.isArray(d) ? d[0] ?? {} : d ?? {});
const placeholder = 'https://placehold.co/400x400?text=No+Image';

// Fuente principal
async function fetchRandomCharacter() {
  const resp = await fetch(RANDOM_URL, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const raw = normalize(await resp.json());

  // Buscar cualquier campo con imagen posible
  const possibleImage =
    raw.image ||
    raw.imageUrl ||
    raw.picture ||
    raw.portrait ||
    raw.portrait_path ||
    raw.thumbnail ||
    raw.gallery ||
    '';

  const image = possibleImage.startsWith('http')
    ? possibleImage
    : possibleImage
    ? `${CDN_BASE}${possibleImage}`
    : 'https://placehold.co/400x400?text=No+Image';

  return {
    id: raw.id ?? safeId(),
    name: raw.name ?? raw.fullName ?? 'Desconocido',
    occupation: Array.isArray(raw.occupation) ? (raw.occupation[0] ?? '—') : (raw.occupation ?? '—'),
    image
  };
}

// Fallback
async function fetchRandomCharacterFallback() {
  const resp = await fetch(FALLBACK_URL, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const all = await resp.json();
  const p = all[Math.floor(Math.random() * all.length)] ?? {};
  return {
    id: p.id ?? safeId(),
    name: p.name ?? 'Desconocido',
    occupation: p.occupation ?? '—',
    image: p.image || p.thumbnail || placeholder
  };
}

// Card
function card({ name, occupation, image }) {
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <img src="${image}" alt="${name}" loading="lazy"
         onerror="this.src='${placeholder}'">
    <div class="info">
      <div class="nombre">${name}</div>
      <div class="ocupacion">${occupation}</div>
    </div>`;
  return el;
}

// Cargar N personajes con fallback
async function cargarPersonajes(n = 6) {
  $msg.textContent = '';
  $msg.classList.remove('error');
  $galeria.innerHTML = '';
  $loader.classList.remove('oculto');
  $btn.disabled = true;

  try {
    const tareas = Array.from({ length: n }, async () => {
      try { return await fetchRandomCharacter(); }
      catch { return await fetchRandomCharacterFallback(); }
    });
    const personajes = await Promise.all(tareas);
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

// Filtro
$buscar.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  for (const el of $galeria.querySelectorAll('.card')) {
    const name = el.querySelector('.nombre').textContent.toLowerCase();
    el.style.display = name.includes(q) ? '' : 'none';
  }
});

// Eventos
$btn.addEventListener('click', () => cargarPersonajes(6));

// Primera carga
cargarPersonajes(6);