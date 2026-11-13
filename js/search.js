const overlay = document.getElementById('searchOverlay');
const openBtn = document.getElementById('searchOpen');
const closeBtn = document.getElementById('searchClose');
const input = document.getElementById('searchInput');
const results = document.getElementById('searchResults');

const index = [...document.querySelectorAll('section[id]')].map(section=>({
  id: section.id,
  title: section.dataset.title || section.querySelector('h2')?.textContent || section.id,
  text: section.innerText.replace(/\s+/g,' ').trim()
}));

function openSearch(){
  overlay.hidden = false;
  setTimeout(()=>input.focus(),30);
}
function closeSearch(){
  overlay.hidden = true;
  input.value = '';
  results.innerHTML = '';
}
openBtn.addEventListener('click',openSearch);
closeBtn.addEventListener('click',closeSearch);
overlay.addEventListener('click',e=>{if(e.target===overlay)closeSearch()});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!overlay.hidden)closeSearch();
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}
});

input.addEventListener('input',()=>{
  const q = input.value.trim().toLowerCase();
  if(q.length<2){results.innerHTML='<p>Digite pelo menos 2 caracteres.</p>';return;}
  const matches = index.filter(item=>item.title.toLowerCase().includes(q)||item.text.toLowerCase().includes(q)).slice(0,20);
  results.innerHTML = matches.length ? matches.map(item=>{
    const pos = item.text.toLowerCase().indexOf(q);
    const snippet = pos>=0 ? item.text.slice(Math.max(0,pos-60),pos+140) : item.text.slice(0,180);
    return `<a href="#${item.id}"><strong>${item.title}</strong><small>${snippet}...</small></a>`;
  }).join('') : '<p>Nenhum resultado encontrado.</p>';
  results.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeSearch));
});
