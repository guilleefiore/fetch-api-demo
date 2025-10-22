// Fuente con imágenes absolutas y CORS ok
const QUOTES_URL = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=';

const $galeria = document.getElementById('galeria');
const $btn     = document.getElementById('cargar');
const $loader  = document.getElementById('loader');
const $msg     = document.getElementById('mensaje');
const $buscar  = document.getElementById('buscar');

const placeholder = 'https://placehold.co/400x400?text=No+Image';
const safeId = () => `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;

// Pide N personajes con imagen (esta API trae name+image)
async function fetchCharactersWithImages(n = 6) {
  const resp = await fetch(QUOTES_URL + n, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const arr = await resp.json();
  // La API puede repetir personajes; normalizamos a nuestro formato
  return arr.map(it => ({
    id: safeId(),
    name: it.character || 'Desconocido',
    occupation: '—',
    image: it.image || placeholder
  }));
}

function card({ name, occupation, image }) {
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <img src="${image}" alt="${name}" loading="lazy" decoding="async"
         onerror="this.src='${placeholder}'">
    <div class="info">
      <div class="nombre">${name}</div>
      <div class="ocupacion">${occupation}</div>
    </div>`;
  return el;
}

async function cargarPersonajes(n = 6) {
  $msg.textContent = '';
  $msg.classList.remove('error');
  $galeria.innerHTML = '';
  $loader.classList.remove('oculto');
  $btn.disabled = true;

  try {
    const personajes = await fetchCharactersWithImages(n);
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

// Filtro en cliente
$buscar.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  for (const el of $galeria.querySelectorAll('.card')) {
    const name = el.querySelector('.nombre').textContent.toLowerCase();
    el.style.display = name.includes(q) ? '' : 'none';
  }
});

$btn.addEventListener('click', () => cargarPersonajes(6));
cargarPersonajes(6);