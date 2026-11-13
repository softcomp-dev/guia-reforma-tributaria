const root = document.documentElement;
const progress = document.getElementById('readingProgress');
const themeToggle = document.getElementById('themeToggle');

function setTheme(theme){
  root.dataset.theme = theme;
  localStorage.setItem('guideTheme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}
setTheme(localStorage.getItem('guideTheme') || 'light');
themeToggle.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

function updateProgress(){
  const total = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${total > 0 ? (scrollY / total) * 100 : 0}%`;
}
addEventListener('scroll', updateProgress, {passive:true});
updateProgress();

document.getElementById('printButton').addEventListener('click', () => print());
document.getElementById('heroPrint').addEventListener('click', () => print());

const money = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value || 0);
const fields = {
  valor: document.getElementById('valorOperacao'),
  principal: document.getElementById('tributoPrincipal'),
  pisCofins: document.getElementById('pisCofins'),
  outras: document.getElementById('outrasExclusoes'),
  cbs: document.getElementById('aliqCbs'),
  ibs: document.getElementById('aliqIbs')
};
function calculate(){
  const valor = Number(fields.valor.value) || 0;
  const exclusions = (Number(fields.principal.value)||0)+(Number(fields.pisCofins.value)||0)+(Number(fields.outras.value)||0);
  const base = Math.max(0, valor - exclusions);
  const cbs = base * (Number(fields.cbs.value)||0) / 100;
  const ibs = base * (Number(fields.ibs.value)||0) / 100;
  document.getElementById('totalExclusoes').textContent = money(exclusions);
  document.getElementById('baseAjustada').textContent = money(base);
  document.getElementById('valorCbs').textContent = money(cbs);
  document.getElementById('valorIbs').textContent = money(ibs);
  document.getElementById('totalIbsCbs').textContent = money(cbs+ibs);
}
Object.values(fields).forEach(el => el.addEventListener('input', calculate));
calculate();

document.querySelectorAll('.interactive-checklist input').forEach((input,index)=>{
  const key = `check-${index}`;
  input.checked = localStorage.getItem(key)==='1';
  input.addEventListener('change',()=>localStorage.setItem(key,input.checked?'1':'0'));
});
