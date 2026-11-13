/* Movimento de entrada: as partes de cada seção sobem e aparecem em sequência,
   uma única vez. Só transform e opacity. Sem script, ou com preferência por
   menos movimento, nada fica escondido. */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches || !('IntersectionObserver' in window)) return;

  const targets = [
    '.part-copy', '.part-figure',
    '.section-title', '.lead', '.intro-note', '.note',
    '.facts > div', '.runin-list > li', '.years > li', '.receipt', '.chain > li',
    '.pair-col', '.sheet', '.menu-sheet', '.three-defs > div', '.interactive-checklist > label',
    '.ruler', '.table-wrap', '.calculator', '.steps', '.notice', '.runin-text p', '.sources > li',
    '.footer-card', '.footer-credits'
  ].join(',');

  const elements = [...document.querySelectorAll(`main ${targets.split(',').join(', main ')}`)]
    .filter(el => !el.closest('.hero'));

  // Elementos que já estão na tela ao carregar não esperam: entram junto com a página.
  document.documentElement.classList.add('motion-ready');
  elements.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(entries => {
    const entering = entries.filter(entry => entry.isIntersecting).map(entry => entry.target);
    entering.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    entering.forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index, 6) * 70}ms`;
      el.classList.add('is-in');
      observer.unobserve(el);
      // limpa o atraso depois da entrada, para não atrasar hovers futuros
      setTimeout(() => { el.style.transitionDelay = ''; }, 1200);
    });
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.08});

  elements.forEach(el => observer.observe(el));

  // Se a pessoa ativar "reduzir movimento" no meio da leitura, mostra tudo.
  reduce.addEventListener?.('change', () => {
    if (reduce.matches) elements.forEach(el => el.classList.add('is-in'));
  });
})();
