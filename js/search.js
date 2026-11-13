const dialog = document.getElementById('searchOverlay');
const openBtn = document.getElementById('searchOpen');
const closeBtn = document.getElementById('searchClose');
const input = document.getElementById('searchInput');
const results = document.getElementById('searchResults');
const status = document.getElementById('searchStatus');

/* Busca sem acento e sem diferença de maiúsculas: "aliquota" acha "alíquota". */
const fold = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const escapeHTML = text => text.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

let index = null;
function buildIndex(){
  index = [...document.querySelectorAll('main section[id]')].map(section => {
    const text = section.textContent.replace(/\s+/g, ' ').trim();
    const title = section.dataset.title || section.querySelector('h2, h3')?.textContent.trim() || section.id;
    return {id: section.id, title, text, foldedTitle: fold(title), foldedText: fold(text)};
  });
}

function openSearch(){
  if (!index) buildIndex();
  if (!dialog.open) dialog.showModal();
  input.focus();
  input.select();
}
function closeSearch(){
  if (dialog.open) dialog.close();
}
dialog.addEventListener('close', () => {
  input.value = '';
  results.innerHTML = '';
  status.textContent = '';
  openBtn?.focus();
});

openBtn?.addEventListener('click', openSearch);
closeBtn?.addEventListener('click', closeSearch);
dialog.addEventListener('click', event => { if (event.target === dialog) closeSearch(); });
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'){
    event.preventDefault();
    openSearch();
  }
});

function snippetFor(item, query){
  const pos = item.foldedText.indexOf(query);
  const start = Math.max(0, pos - 60);
  const raw = pos >= 0 ? item.text.slice(start, pos + 140) : item.text.slice(0, 180);
  const prefix = start > 0 ? '…' : '';
  if (pos < 0) return escapeHTML(raw) + '…';
  const rel = pos - start;
  return prefix + escapeHTML(raw.slice(0, rel)) + '<mark>' + escapeHTML(raw.slice(rel, rel + query.length)) + '</mark>' + escapeHTML(raw.slice(rel + query.length)) + '…';
}

input.addEventListener('input', () => {
  const query = fold(input.value.trim());
  if (query.length < 2){
    results.innerHTML = '';
    status.textContent = query.length ? 'Digite pelo menos 2 letras.' : '';
    return;
  }
  const matches = index
    .filter(item => item.foldedTitle.includes(query) || item.foldedText.includes(query))
    .sort((a, b) => Number(b.foldedTitle.includes(query)) - Number(a.foldedTitle.includes(query)))
    .slice(0, 20);
  results.innerHTML = matches.map(item =>
    `<li><a href="#${item.id}"><strong>${escapeHTML(item.title)}</strong><span>${snippetFor(item, query)}</span></a></li>`
  ).join('');
  status.textContent = matches.length
    ? `${matches.length} ${matches.length === 1 ? 'resultado' : 'resultados'}`
    : 'Nenhum resultado. Tente outra palavra, como "crédito" ou "2027".';
});

results.addEventListener('click', event => {
  if (event.target.closest('a')) closeSearch();
});

/* Setas para cima e para baixo percorrem os resultados. */
dialog.addEventListener('keydown', event => {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const items = [...results.querySelectorAll('a')];
  if (!items.length) return;
  event.preventDefault();
  const current = items.indexOf(document.activeElement);
  let next;
  if (event.key === 'ArrowDown') next = current < items.length - 1 ? current + 1 : 0;
  else next = current > 0 ? current - 1 : (current === 0 ? -1 : items.length - 1);
  (next === -1 ? input : items[next]).focus();
});
