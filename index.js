// Endpoints
const RANDOM_URL = 'https://thesimpsonsapi.com/api/characters/random';
const CDN_BASE   = 'https://cdn.thesimpsonsapi.com/500'; // para portrait_path
const FALLBACK_URL = 'https://api.sampleapis.com/simpsons/characters';

// DOM
const $galeria = document.getElementById('galeria');
const $btn     = document.getElementById('cargar');
const $loader  = document.getElementById('loader');
const $msg     = document.getElementById('mensaje');
const $buscar  = document.getElementById('buscar');

// Util
const safeId = () => `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const normalize = (d) => (Array.isArray(d) ? d[0] ?? {} : d ?? {});

// Fetch principal
async function fetchRandomCharacter() {
  const resp = await fetch(RANDOM_URL, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const raw = normalize(await resp.json());

  const image =
    (raw.image && raw.image.startsWith('http')) ? raw.image :
    (raw.portrait_path ? `${CDN_BASE}${raw.portrait_path}` : '') ||
    'https://placehold.co/400x400?text=No+Image';

  return {
    id: raw.id ?? safeId(),
    name: raw.name ?? raw.fullName ?? 'Desconocido',
    occupation: Array.isArray(raw.occupation) ? (raw.occupation[0] ?? '—') : (raw.occupation ?? '—')