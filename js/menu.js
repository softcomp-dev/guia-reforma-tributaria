const sidebar = document.getElementById('sidebar');
const mobileMenuButton = document.getElementById('mobileMenuButton');
const backdrop = document.getElementById('menuBackdrop');
const compact = matchMedia('(max-width: 1020px)');

/* No celular o menu fica fora da tela; com `inert` os links escondidos
   deixam de receber foco pelo Tab e de ser lidos pelo leitor de tela. */
function setMenu(open, {returnFocus = true} = {}){
  const isCompact = compact.matches;
  sidebar.classList.toggle('open', open && isCompact);
  sidebar.inert = isCompact && !open;
  mobileMenuButton?.setAttribute('aria-expanded', String(open && isCompact));
  mobileMenuButton?.setAttribute('aria-label', open && isCompact ? 'Fechar menu' : 'Abrir menu');
  if (backdrop) backdrop.hidden = !(open && isCompact);
  document.body.classList.toggle('menu-open', open && isCompact);
  if (open && isCompact) sidebar.querySelector('a, summary')?.focus();
  else if (isCompact && returnFocus && sidebar.contains(document.activeElement)) mobileMenuButton?.focus();
}

mobileMenuButton?.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
backdrop?.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sidebar.classList.contains('open')) setMenu(false);
});
sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false, {returnFocus:false})));
compact.addEventListener('change', () => setMenu(false, {returnFocus:false}));
setMenu(false, {returnFocus:false});

/* Item ativo no menu conforme a seção visível; abre o grupo da parte atual. */
const links = [...sidebar.querySelectorAll('a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const href = `#${entry.target.id}`;
    links.forEach(link => {
      const active = link.getAttribute('href') === href;
      link.classList.toggle('active', active);
      if (active){
        link.setAttribute('aria-current', 'location');
        const group = link.closest('details');
        if (group && !group.open) group.open = true;
      } else {
        link.removeAttribute('aria-current');
      }
    });
  });
}, {rootMargin:'-25% 0px -65% 0px', threshold:0});
sections.forEach(section => observer.observe(section));
