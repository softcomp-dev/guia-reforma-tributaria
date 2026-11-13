/* Armazenamento seguro: em janelas privadas ou com dados bloqueados o
   localStorage lança exceção, e isso não pode derrubar o resto do script. */
const store = {
  get(key){ try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value){ try { localStorage.setItem(key, value); } catch { /* sem armazenamento: segue sem salvar */ } }
};

const root = document.documentElement;
const progress = document.getElementById('readingProgress');
const themeToggle = document.getElementById('themeToggle');

/* Tema: o valor inicial já foi aplicado por um script no <head> (evita o
   flash de tema claro). Aqui só sincronizamos o botão e tratamos a troca. */
function applyTheme(theme, persist){
  root.dataset.theme = theme;
  if (persist) store.set('guideTheme', theme);
  if (themeToggle){
    const dark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(dark));
  }
}
applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light', false);
themeToggle?.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));

/* Barra de progresso: anima só transform (scaleX), sem recalcular layout. */
let progressFrame = 0;
function updateProgress(){
  progressFrame = 0;
  const total = root.scrollHeight - innerHeight;
  const ratio = total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0;
  if (progress) progress.style.transform = `scaleX(${ratio})`;
}
addEventListener('scroll', () => { if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress); }, {passive:true});
addEventListener('resize', updateProgress, {passive:true});
updateProgress();

document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => print()));

/* Simulador: aceita números no formato brasileiro ("10.000,50") e também
   "10000.50". Valores negativos viram zero. */
function parseBR(raw){
  let text = String(raw ?? '').trim().replace(/\s|R\$|%/g, '');
  if (!text) return 0;
  if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, ''); // "20.000" = vinte mil
  const value = Number(text);
  return Number.isFinite(value) && value > 0 ? value : 0;
}
const money = value => new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'}).format(value || 0);
const decimal = (value, digits) => new Intl.NumberFormat('pt-BR', {minimumFractionDigits:digits, maximumFractionDigits:digits}).format(value || 0);

const calcFields = {
  valor: document.getElementById('valorOperacao'),
  principal: document.getElementById('tributoPrincipal'),
  pisCofins: document.getElementById('pisCofins'),
  outras: document.getElementById('outrasExclusoes'),
  cbs: document.getElementById('aliqCbs'),
  ibs: document.getElementById('aliqIbs')
};
const calcOut = id => document.getElementById(id);

function calculate(){
  if (!calcFields.valor) return;
  const valor = parseBR(calcFields.valor.value);
  const exclusions = parseBR(calcFields.principal.value) + parseBR(calcFields.pisCofins.value) + parseBR(calcFields.outras.value);
  const base = Math.max(0, valor - exclusions);
  /* Cada tributo é arredondado em centavos, como aparece na nota fiscal. */
  const cents = value => Math.round(Number((value * 100).toPrecision(12))) / 100;
  const cbs = cents(base * parseBR(calcFields.cbs.value) / 100);
  const ibs = cents(base * parseBR(calcFields.ibs.value) / 100);
  const set = (id, text) => { const el = calcOut(id); if (el) el.textContent = text; };
  set('totalExclusoes', money(exclusions));
  set('baseAjustada', money(base));
  set('valorCbs', money(cbs));
  set('valorIbs', money(ibs));
  set('totalIbsCbs', money(cbs + ibs));
  const warning = calcOut('calcAviso');
  if (warning) warning.hidden = !(valor > 0 && exclusions > valor);
}
Object.values(calcFields).forEach(input => {
  if (!input) return;
  input.addEventListener('input', calculate);
  input.addEventListener('blur', () => {
    if (input.value.trim() !== '') input.value = decimal(parseBR(input.value), 2);
    calculate();
  });
});
calculate();

/* Checklists: a chave vem do texto do item, não da posição, para que
   reordenar a lista não troque as marcações. */
const slug = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
document.querySelectorAll('.interactive-checklist').forEach(list => {
  const group = list.closest('section[id]')?.id || 'lista';
  list.querySelectorAll('input[type="checkbox"]').forEach(input => {
    const key = `check:${group}:${slug(input.closest('label')?.textContent || '')}`;
    input.checked = store.get(key) === '1';
    input.addEventListener('change', () => store.set(key, input.checked ? '1' : '0'));
  });
});
