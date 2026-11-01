/* Reference Playground — plain, client-side JavaScript. No frameworks or server. */
const CARD_W = () => window.matchMedia('(max-width: 520px)').matches ? 144 : 165;
const CARD_H = () => window.matchMedia('(max-width: 520px)').matches ? 154 : 171;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const QUESTIONS = [
  'What happens when you combine the form of A with the behavior of B?',
  'What does A have that B is missing?',
  'Could the material of A change the purpose of B?',
  'What if B worked using the structure or rhythm of A?',
  'Where do these two references unexpectedly overlap?',
  'What new object might exist between A and B?'
];

const $ = (selector) => document.querySelector(selector);
const els = {
  board: $('#board'), empty: $('#board-empty'), count: $('#reference-count'),
  fileInput: $('#file-input'), surprise: $('#surprise-button'),
  pairA: $('#pair-a'), pairB: $('#pair-b'),
  featureA: $('#feature-a'), featureB: $('#feature-b'),
  idea: $('#idea-text'), prompt: $('#prompt-text'), nextPrompt: $('#new-prompt'),
  save: $('#save-idea'), list: $('#ideas-list'), ideaCount: $('#idea-count'), toast: $('#toast')
};
const state = {
  references: [], ideas: [], urls: new Map(),
  selected: [null, null], promptIndex: 0, db: null
};
let toastTimer;
function notify(message) {
  els.toast.textContent = message;
  els.toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('visible'), 2900);
}
function id() { return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(); }
function refFor(idValue) { return state.references.find(r => r.id === idValue); }
function labelFor(idValue) { return refFor(idValue)?.name || '(removed reference)'; }

/* IndexedDB keeps imported image blobs and saved ideas after refreshing the browser. */
function openDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('No IndexedDB'));
    const request = indexedDB.open('reference-playground-v1', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('references')) db.createObjectStore('references', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('ideas')) db.createObjectStore('ideas', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function dbRequest(storeName, action, value) {
  if (!state.db) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(storeName, action === 'getAll' ? 'readonly' : 'readwrite');
    const store = tx.objectStore(storeName);
    const request = action === 'getAll' ? store.getAll() :
      action === 'delete' ? store.delete(value) : store.put(value);
    let result;
    request.onsuccess = () => { result = request.result; };
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
async function persist(store, action, value) {
  try { await dbRequest(store, action, value); }
  catch (err) { console.warn('Could not save to browser storage:', err); notify('Storage is full or unavailable. Changes may not survive refresh.'); }
}
async function initialize() {
  try {
    state.db = await openDB();
    const [references, ideas] = await Promise.all([
      dbRequest('references', 'getAll'), dbRequest('ideas', 'getAll')
    ]);
    state.references = (references || []).sort((a,b) => a.createdAt - b.createdAt);
    state.ideas = (ideas || []).sort((a,b) => b.createdAt - a.createdAt);
    for (const ref of state.references) state.urls.set(ref.id, URL.createObjectURL(ref.blob));
  } catch (err) {
    console.warn('Local storage unavailable, continuing in memory:', err);
    notify('Browser storage unavailable; this session will still work.');
  }
  renderBoard(); renderPair(); renderIdeas();
}

function clampPosition(x, y) {
  const maxX = Math.max(0, els.board.clientWidth - CARD_W() - 7);
  const maxY = Math.max(0, els.board.clientHeight - CARD_H() - 7);
  return { x: Math.max(7, Math.min(maxX, Math.round(x))), y: Math.max(7, Math.min(maxY, Math.round(y))) };
}
function suggestedPosition(index, dropped) {
  if (dropped) return clampPosition(dropped.x + (index % 4) * 17, dropped.y + (index % 4) * 17);
  const available = Math.max(165, els.board.clientWidth - 18);
  const columns = Math.max(1, Math.floor(available / (CARD_W() + 25)));
  const col = index % columns, row = Math.floor(index / columns);
  return clampPosition(17 + col * (CARD_W() + 22), 26 + row * (CARD_H() + 17));
}
async function addFiles(files, dropped) {
  let added = 0, rejected = 0;
  for (const file of [...files]) {
    if (!ACCEPTED_TYPES.has(file.type) || file.size > MAX_FILE_BYTES) { rejected++; continue; }
    const position = suggestedPosition(state.references.length, dropped);
    const ref = { id: id(), name: file.name.replace(/\.[^.]+$/, ''), blob: file,
      x: position.x, y: position.y, createdAt: Date.now() + added };
    state.references.push(ref);
    state.urls.set(ref.id, URL.createObjectURL(file));
    await persist('references', 'put', ref);
    added++;
  }
  renderBoard();
  if (added) notify(`Added ${added} reference${added === 1 ? '' : 's'}. Click two to connect them.`);
  if (rejected) notify(`${rejected} file${rejected === 1 ? ' was' : 's were'} skipped. Use JPG, PNG, WEBP or GIF (max 15 MB each).`);
}

function renderBoard() {
  els.board.querySelectorAll('.reference-card').forEach(node => node.remove());
  els.empty.hidden = state.references.length > 0;
  els.count.textContent = `${state.references.length} reference${state.references.length === 1 ? '' : 's'}`;
  els.surprise.disabled = state.references.length < 2;
  $('#clear-board').disabled = state.references.length === 0;
  for (const ref of state.references) {
    const card = document.createElement('div');
    card.className = 'reference-card';
    card.dataset.id = ref.id;
    const pos = clampPosition(ref.x, ref.y);
    card.style.left = pos.x + 'px';
    card.style.top = pos.y + 'px';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Select ${ref.name}; drag to move`);

    const tag = document.createElement('span');
    tag.className = 'card-tag';
    card.append(tag);
    const img = document.createElement('img');
    img.src = state.urls.get(ref.id);
    img.alt = ref.name;
    img.draggable = false;
    card.append(img);
    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = ref.name;
    card.append(name);
    const remove = document.createElement('button');
    remove.className = 'card-delete';
    remove.type = 'button';
    remove.title = `Remove ${ref.name}`;
    remove.setAttribute('aria-label', `Remove ${ref.name}`);
    remove.textContent = '×';
    remove.addEventListener('click', event => { event.stopPropagation(); removeReference(ref.id); });
    card.append(remove);
    attachCardInteractions(card, ref);
    els.board.append(card);
  }
  updateSelectedCardStyles();
}
function attachCardInteractions(card, ref) {
  let pointer = null;
  card.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button')) return;
    pointer = { id: event.pointerId, startX: event.clientX, startY: event.clientY,
      x: ref.x, y: ref.y, moved: false };
    card.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  card.addEventListener('pointermove', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.startX;
    const dy = event.clientY - pointer.startY;
    if (Math.hypot(dx, dy) > 4) pointer.moved = true;
    if (!pointer.moved) return;
    const pos = clampPosition(pointer.x + dx, pointer.y + dy);
    card.classList.add('dragging');
    card.style.left = pos.x + 'px';
    card.style.top = pos.y + 'px';
    ref.x = pos.x; ref.y = pos.y;
  });
  card.addEventListener('pointerup', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const wasMoved = pointer.moved;
    pointer = null;
    card.classList.remove('dragging');
    if (wasMoved) persist('references', 'put', ref);
    else selectReference(ref.id);
  });
  card.addEventListener('pointercancel', () => {
    if (pointer) persist('references', 'put', ref);
    pointer = null;
    card.classList.remove('dragging');
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectReference(ref.id); }
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); removeReference(ref.id); }
  });
}
async function removeReference(idValue) {
  state.references = state.references.filter(ref => ref.id !== idValue);
  const url = state.urls.get(idValue);
  if (url) URL.revokeObjectURL(url);
  state.urls.delete(idValue);
  state.selected = state.selected.map(value => value === idValue ? null : value);
  await persist('references', 'delete', idValue);
  renderBoard(); renderPair(); renderIdeas();
}
function updateSelectedCardStyles() {
  for (const node of els.board.querySelectorAll('.reference-card')) {
    const isA = node.dataset.id === state.selected[0];
    const isB = node.dataset.id === state.selected[1];
    node.classList.toggle('selected-a', isA);
    node.classList.toggle('selected-b', isB);
    node.querySelector('.card-tag').textContent = isA ? 'A' : isB ? 'B' : '';
    node.setAttribute('aria-pressed', isA || isB ? 'true' : 'false');
  }
}
function resetDraft() { els.featureA.value = ''; els.featureB.value = ''; els.idea.value = ''; }
function selectReference(idValue) {
  const [a, b] = state.selected;
  if (a === idValue) state.selected = [b, null];
  else if (b === idValue) state.selected = [a, null];
  else if (!a) state.selected = [idValue, null];
  else if (!b) state.selected = [a, idValue];
  else state.selected = [b, idValue];
  resetDraft(); renderPair(); updateSelectedCardStyles();
}
function randomPair() {
  if (state.references.length < 2) return;
  const ids = state.references.map(r => r.id);
  let first, second;
  let attempts = 0;
  do {
    const firstIndex = Math.floor(Math.random() * ids.length);
    const secondOffset = 1 + Math.floor(Math.random() * (ids.length - 1));
    first = ids[firstIndex];
    second = ids[(firstIndex + secondOffset) % ids.length];
    attempts++;
  } while (ids.length > 2 && attempts < 12 && first === state.selected[0] && second === state.selected[1]);
  state.selected = [first, second];
  resetDraft(); renderPair(); updateSelectedCardStyles();
  els.board.querySelector(`[data-id="${first}"]`)?.scrollIntoView({block:'nearest', inline:'nearest'});
  notify('New pair! Look for one interesting connection.');
}
function showPairSlot(node, ref, letter) {
  const preview = node.querySelector('.pair-slot-preview');
  const label = node.querySelector('.pair-slot-label strong');
  preview.replaceChildren();
  if (ref) {
    const image = document.createElement('img');
    image.src = state.urls.get(ref.id);
    image.alt = ref.name;
    preview.append(image);
    label.textContent = ref.name;
  } else {
    const span = document.createElement('span');
    span.className = 'slot-placeholder';
    span.textContent = letter;
    preview.append(span);
    label.textContent = 'Choose an image';
  }
}
function renderPair() {
  const a = refFor(state.selected[0]), b = refFor(state.selected[1]);
  showPairSlot(els.pairA, a, 'A'); showPairSlot(els.pairB, b, 'B');
  const ready = Boolean(a && b);
  for (const node of [els.featureA, els.featureB, els.idea, els.nextPrompt, els.save]) node.disabled = !ready;
  els.prompt.textContent = QUESTIONS[state.promptIndex];
  updateSelectedCardStyles();
}
async function saveIdea() {
  if (!refFor(state.selected[0]) || !refFor(state.selected[1])) return;
  const text = els.idea.value.trim();
  if (!text) { els.idea.focus(); notify('Write an idea or connection before saving.'); return; }
  const idea = { id: id(), aId: state.selected[0], bId: state.selected[1],
    aName: labelFor(state.selected[0]), bName: labelFor(state.selected[1]),
    featureA: els.featureA.value.trim(), featureB: els.featureB.value.trim(),
    connection: text, createdAt: Date.now() };
  state.ideas.unshift(idea);
  await persist('ideas', 'put', idea);
  renderIdeas();
  els.idea.value = '';
  notify('Idea saved to your explorations.');
}
function renderIdeas() {
  els.list.replaceChildren();
  els.ideaCount.textContent = String(state.ideas.length);
  if (state.ideas.length === 0) {
    const p = document.createElement('p'); p.className = 'no-ideas';
    p.textContent = 'Your saved connections will appear here.';
    els.list.append(p); return;
  }
  for (const idea of state.ideas) {
    const item = document.createElement('article'); item.className = 'idea-item';
    const top = document.createElement('div'); top.className = 'idea-item-header';
    const label = document.createElement('strong'); label.textContent = `${idea.aName} × ${idea.bName}`;
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×';
    remove.title = 'Delete saved idea'; remove.setAttribute('aria-label', 'Delete saved idea');
    remove.addEventListener('click', async () => {
      state.ideas = state.ideas.filter(entry => entry.id !== idea.id);
      await persist('ideas', 'delete', idea.id); renderIdeas();
    });
    top.append(label, remove);
    const text = document.createElement('p'); text.textContent = idea.connection;
    const features = document.createElement('div'); features.className = 'idea-item-meta';
    features.textContent = [idea.featureA, idea.featureB].filter(Boolean).join(' + ') || 'Unlabeled connection';
    item.append(top, text, features);
    if (refFor(idea.aId) && refFor(idea.bId)) {
      const restore = document.createElement('button'); restore.className = 'idea-item-restore';
      restore.type = 'button'; restore.textContent = 'Revisit this pair →';
      restore.addEventListener('click', () => {
        state.selected = [idea.aId, idea.bId];
        renderPair();
        els.featureA.value = idea.featureA;
        els.featureB.value = idea.featureB;
        els.idea.value = idea.connection;
      });
      item.append(restore);
    }
    els.list.append(item);
  }
}

/* Simple SVG drawings are built in for a demo; users provide their own real images. */
const demoArt = [
  { name: 'Geometric radio', bg: '#e2e5db', art: `<rect x="55" y="67" width="220" height="180" rx="17" fill="#f2efe5" stroke="#4c554e" stroke-width="5"/><rect x="76" y="88" width="180" height="76" rx="6" fill="#a2b5a2"/><path d="M86 136h160M90 149h152" stroke="#647665" stroke-width="3"/><circle cx="110" cy="205" r="17" fill="#424a42"/><circle cx="224" cy="205" r="17" fill="#424a42"/><path d="M131 206h71" stroke="#bdc0b5" stroke-width="6"/>` },
  { name: 'Linkage mechanism', bg: '#e9ddd0', art: `<circle cx="104" cy="207" r="50" fill="#c59a73" stroke="#6d5141" stroke-width="6"/><circle cx="104" cy="207" r="8" fill="#644d42"/><path d="M104 207L155 115L239 160" fill="none" stroke="#715747" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><circle cx="155" cy="115" r="13" fill="#e6d3b9" stroke="#55483d" stroke-width="4"/><circle cx="239" cy="160" r="12" fill="#e6d3b9" stroke="#55483d" stroke-width="4"/><path d="M238 159L263 82" stroke="#715747" stroke-width="13" stroke-linecap="round"/><circle cx="263" cy="82" r="14" fill="#e6d3b9" stroke="#55483d" stroke-width="4"/>` },
  { name: 'Folded surfaces', bg: '#e0e8e7', art: `<path d="M58 230L163 51L269 230Z" fill="#9cb9c0" stroke="#576e75" stroke-width="5"/><path d="M163 51L163 230L58 230Z" fill="#c9d9d4"/><path d="M163 51L219 167L163 230" fill="#7799aa"/><path d="M58 230L163 230L269 230" stroke="#577783" stroke-width="5"/><path d="M163 51V230" stroke="#5f7c86" stroke-width="4"/>` },
  { name: 'Kinetic sculpture', bg: '#e7e4ec', art: `<path d="M160 66V248" stroke="#65616b" stroke-width="7"/><path d="M76 250h168" stroke="#65616b" stroke-width="10"/><path d="M160 85L90 128L161 160L239 125L160 85" stroke="#8b808f" fill="none" stroke-width="7"/><path d="M160 160L97 199L160 226L226 199Z" fill="#b0a5b6" stroke="#72687c" stroke-width="5"/><circle cx="160" cy="86" r="9" fill="#6e617a"/><circle cx="90" cy="128" r="9" fill="#6e617a"/><circle cx="239" cy="125" r="9" fill="#6e617a"/>` }
];
async function loadDemo() {
  for (const demo of demoArt) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="${demo.bg}"/>${demo.art}</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const position = suggestedPosition(state.references.length);
    const ref = { id: id(), name: demo.name, blob, x: position.x, y: position.y, createdAt: Date.now() };
    state.references.push(ref);
    state.urls.set(ref.id, URL.createObjectURL(blob));
    await persist('references', 'put', ref);
  }
  renderBoard(); notify('Demo references added. Click two cards or try Surprise me.');
}

$('#add-images').addEventListener('click', () => els.fileInput.click());
$('#empty-add').addEventListener('click', () => els.fileInput.click());
$('#load-demo').addEventListener('click', loadDemo);
els.fileInput.addEventListener('change', event => {
  if (event.target.files?.length) addFiles(event.target.files);
  els.fileInput.value = ''; // Allow selecting the same file again.
});
els.surprise.addEventListener('click', randomPair);
els.nextPrompt.addEventListener('click', () => {
  state.promptIndex = (state.promptIndex + 1) % QUESTIONS.length;
  els.prompt.textContent = QUESTIONS[state.promptIndex];
});
els.save.addEventListener('click', saveIdea);
$('#clear-board').addEventListener('click', async () => {
  if (!window.confirm('Remove all reference images? Saved idea notes will be kept.')) return;
  const ids = state.references.map(r => r.id);
  for (const url of state.urls.values()) URL.revokeObjectURL(url);
  state.urls.clear(); state.references = []; state.selected = [null, null];
  resetDraft();
  for (const idValue of ids) await persist('references', 'delete', idValue);
  renderBoard(); renderPair(); renderIdeas();
});
// Desktop OS file drag-and-drop (the browser must not navigate away).
document.addEventListener('dragover', event => {
  if (event.dataTransfer?.types?.includes('Files')) event.preventDefault();
});
document.addEventListener('drop', event => {
  if (event.dataTransfer?.files?.length) event.preventDefault();
});
els.board.addEventListener('dragenter', event => {
  if (event.dataTransfer?.types?.includes('Files')) { event.preventDefault(); els.board.classList.add('is-over'); }
});
els.board.addEventListener('dragover', event => {
  if (event.dataTransfer?.types?.includes('Files')) {
    event.preventDefault(); event.dataTransfer.dropEffect = 'copy';
    els.board.classList.add('is-over');
  }
});
els.board.addEventListener('dragleave', event => {
  if (!els.board.contains(event.relatedTarget)) els.board.classList.remove('is-over');
});
els.board.addEventListener('drop', event => {
  event.preventDefault(); event.stopPropagation(); els.board.classList.remove('is-over');
  const rect = els.board.getBoundingClientRect();
  if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files,
    { x: event.clientX - rect.left, y: event.clientY - rect.top });
});
// Pasting screenshots also works on desktop.
document.addEventListener('paste', event => {
  if (event.target.closest('input, textarea')) return;
  const files = [...(event.clipboardData?.items || [])]
    .filter(item => item.kind === 'file' && ACCEPTED_TYPES.has(item.type))
    .map(item => item.getAsFile()).filter(Boolean);
  if (files.length) { event.preventDefault(); addFiles(files); }
});
window.addEventListener('resize', () => {
  for (const ref of state.references) {
    const pos = clampPosition(ref.x, ref.y);
    // Keep model coordinates in sync with clamped visual positions.
    ref.x = pos.x; ref.y = pos.y;
    const card = [...els.board.querySelectorAll('.reference-card')].find(node => node.dataset.id === ref.id);
    if (card) { card.style.left = pos.x + 'px'; card.style.top = pos.y + 'px'; }
  }
});
initialize();
