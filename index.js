const RANDOM_URL = 'https://thesimpsonsapi.com/api/characters/random';
const CDN_BASE   = 'https://cdn.thesimpsonsapi.com/500';

// 1) fuente principal
async function fetchRandomCharacter() {
  const resp = await fetch(RANDOM_URL, { cache: 'no-store', mode: 'cors' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const raw = Array.isArray(await resp.json()) ? (await resp.json())[0] : await resp.json();

  const image =
    (raw.image && raw.image.startsWith('http')) ? raw.image :
    (raw.portrait_path ? `${CDN_BASE}${raw.portrait_path}` : '') ||
    'https://placehold.co/400x400?text=No+Image';

  return {
    id: raw.id ?? `id_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: raw.name ?? raw.fullName ?? 'Desconocido',
    occupation: Array.isArray(raw.occupation) ? (raw.occupation[0] ?? '—') : (raw.occupation ?? '—'),
    image
  };
}

// 2) fallback alternativo (por si la API principal falla)
async function fetchRandomCharacterFallback() {
  const r = await fetch('https://api.sampleapis.com/simpsons/characters', { cache: 'no-store' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const all = await r.json();
  const p = all[Math.floor(Math.random()*all.length)];
  return {
    id: p.id || `id_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: p.name || 'Desconocido',
    occupation: p.occupation || '—',
    image: (p.image || p.thumbnail || 'https://placehold.co/400x400?text=No+Image')
  };
}

// 3) usa ambas fuentes con “rescate”
async function cargarPersonajes(n = 6) {
  $msg.textContent = '';
  $galeria.innerHTML = '';
  $loader.classList.remove('oculto');
  $btn.disabled = true;

  try {
    const tareas = Array.from({ length: n }, async () => {
      try { return await fetchRandomCharacter(); }
      catch (e) { console.warn('Principal falló, voy a fallback:', e); return await fetchRandomCharacterFallback(); }
    });
    const items = await Promise.all(tareas);
    items.forEach(p => $galeria.appendChild(card(p)));
  } catch (err) {
    console.error(err);
    $msg.textContent = 'No se pudo cargar la galería. Intentá nuevamente.';
    $msg.classList.add('error');
  } finally {
    $loader.classList.add('oculto');
    $btn.disabled = false;
  }
}