/* Régua da transição: mostra, para cada ano de 2026 a 2033, a situação de
   cada tributo. Base: EC 132/2023, ADCT arts. 125 a 129. As barras indicam o
   peso do tributo em relação ao seu papel pleno, não a alíquota. */
(function(){
  const ruler = document.getElementById('regua');
  if (!ruler) return;

  const icmsIss = year => {
    if (year <= 2028) return [1, 'integral'];
    if (year >= 2033) return [0, 'extinto'];
    const tenth = 2038 - year; // 2029 → 9, 2030 → 8, 2031 → 7, 2032 → 6
    return [tenth / 10, `${tenth}/10 da alíquota`];
  };

  const table = {
    pis: year => year <= 2026 ? [1, 'integrais'] : [0, 'extintos'],
    ipi: year => year <= 2026 ? [1, 'integral'] : [0, 'zerado, exceto Zona Franca'],
    icms: icmsIss,
    iss: icmsIss,
    cbs: year => year <= 2026 ? [.08, 'teste de 0,9%'] : year <= 2028 ? [1, 'cobrada, 0,1 ponto a menos'] : [1, 'cobrada'],
    ibs: year => {
      if (year <= 2026) return [.04, 'teste de 0,1%'];
      if (year <= 2028) return [.04, '0,05% estadual + 0,05% municipal'];
      if (year >= 2033) return [1, 'cobrado'];
      return [(year - 2028) / 10, 'sobe para compensar ICMS e ISS'];
    },
    is: year => year <= 2026 ? [0, 'ainda não existe'] : [1, 'cobrado']
  };

  const summaries = {
    2026: 'Ano de teste. Tudo segue como antes, mais CBS de 0,9% e IBS de 0,1% destacados na nota e compensados com PIS e Cofins.',
    2027: 'A CBS substitui PIS e Cofins, o IPI vai a zero e começa o Imposto Seletivo. ICMS e ISS seguem integrais e o IBS continua em teste.',
    2028: 'Mesmo modelo de 2027: CBS cobrada, IBS em teste, ICMS e ISS integrais.',
    2029: 'ICMS e ISS caem para 9/10 da alíquota, e o IBS sobe para compensar.',
    2030: 'ICMS e ISS caem para 8/10 da alíquota, e o IBS sobe para compensar.',
    2031: 'ICMS e ISS caem para 7/10 da alíquota, e o IBS sobe para compensar.',
    2032: 'ICMS e ISS caem para 6/10 da alíquota, e o IBS sobe para compensar.',
    2033: 'ICMS e ISS deixam de existir. Ficam CBS, IBS e Imposto Seletivo.'
  };

  const summary = document.getElementById('reguaResumo');
  const rows = [...ruler.querySelectorAll('[data-tributo]')];

  function show(year){
    summary.textContent = `${year}: ${summaries[year]}`;
    rows.forEach(row => {
      const [weight, state] = table[row.dataset.tributo](year);
      row.querySelector('.ruler-fill').style.transform = `scaleX(${weight})`;
      row.querySelector('.ruler-state').textContent = state;
      row.classList.toggle('is-off', weight === 0);
    });
  }

  ruler.addEventListener('change', event => {
    if (event.target.name === 'anoRegua') show(Number(event.target.value));
  });
  ruler.hidden = false;
  show(Number(ruler.querySelector('input[name="anoRegua"]:checked')?.value || 2026));
})();
