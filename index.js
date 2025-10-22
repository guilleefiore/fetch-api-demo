// --- Config y utilidades ---
const RANDOM_URL = 'https://thesimpsonsapi.com/api/characters/random';
const CDN_BASE   = 'https://cdn.thesimpsonsapi.com/500'; // para portrait_path

const $galeria = document.getElementById('galeria');
const $btn     = document.getElementById('cargar');
const $loader  = document.getElementById('loader');
const $msg     = document.getElementById('mensaje');
const $buscar  = document.getElementById('buscar');

// Normaliza posibles formatos de respuesta (objeto o array)
function normalize(data) {
  if (Array.isArray(data)) return data[0];
  return data;
}

// Obtiene 1 personaje aleatorio
async function fetchRandomCharacter() {
  const resp = await fetch(RANDOM_URL, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const json = await resp.json();
  const p = normalize(json);

  // Algunas respuestas traen "image" completo; otras requieren armar con portrait_path
  const image =
    p.image?.startsWith('http') ? p.image :
    p.portrait_path ? `${CDN_BASE}${p.portrait_path}` :
    p.thumbnail || '';

  return {
    id: p.id ?? crypto.randomUUID(),
    name: p.name ?? p.fullName ?? 'Desconocido',
    occupation: Array.isArray(p.occupation) ? p.occupation[0] : (p.occupation || '—'),
    image
  };
}

// Crea la tarjeta DOM
function card({ name, occupation, image }) {
  const art = document.createElement('article');
  art.className = 'card';
  art.innerHTML = `
    <img src="${image}" alt="${name}" loading="lazy" onerror="this.src='https://placehold.co/400x400?text=No+Image'">
    <div class="info">
      <div class="nombre">${name}</div>
      <div class="ocupacion">${occupation}</div>
    </div>
  `;
  return art;
}

// Carga N personajes en paralelo
async function cargarPersonajes(n = 6) {
  $msg.textContent = '';
  $msg.classList.remove('error');
  $galeria.innerHTML = '';
  $loader.classList.remove('oculto');
  $btn.disabled = true;

  try {
    const tareas = Array.from({ length: n }, () => fetchRandomCharacter());
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

// Filtro por nombre (simple, en el cliente)
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