import './style.css';
import { calculate } from './calculations.js';
const names = ['Social media', 'WWW', 'Telewizja', 'Radio'];
const icons = ['◎', '↗', '▣', '◉'];
const key = 'marketing-plan-v1';
const empty = () => ({ budget: '', rows: names.map(() => ({ share: '0', roi: '' })) });
let state = empty();
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved && typeof saved.budget === 'string' && Array.isArray(saved.rows) && saved.rows.length === 4 && saved.rows.every(r => typeof r.share === 'string' && typeof r.roi === 'string')) state = saved;
} catch { storageAvailable = false; }
const money = value => Number.isFinite(value) ? new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value) : '—';
const percent = value => Number.isFinite(value) ? new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 }).format(value) + '%' : '—';
document.querySelector('#app').innerHTML = `
<header class="topbar"><a class="brand" href="/" aria-label="Planer — strona główna"><span class="brand-icon">◔</span> planer<span class="brand-dot">.</span></a><span class="top-label">TWÓJ MARKETING W LICZBACH</span></header>
<main><div class="intro"><span class="eyebrow">PLANOWANIE / BUDŻET ROCZNY</span><h1>Dobry plan.<br><span>Większy potencjał.</span></h1><p>Podziel budżet między kanały i sprawdź, jaki zwrot<br class="desktop"> może przynieść Twoja inwestycja.</p></div>
<div class="workspace"><section class="planner" aria-label="Plan budżetu"><div class="section-heading"><div><span class="step">01</span><h2>Twój roczny budżet</h2></div><span class="badge">PLN</span></div><label class="sr-only" for="budget">Roczny budżet w PLN</label><div class="budget-box"><input id="budget" inputmode="decimal" placeholder="np. 100 000" aria-describedby="budget-error"><span>PLN / rok</span></div><p class="error" id="budget-error"></p>
<div class="section-heading allocation-heading"><div><span class="step">02</span><h2>Podział na kanały</h2></div></div><p class="hint">Przydziel 100% budżetu i określ oczekiwany ROI.</p>
<div class="table-head"><span>KANAŁ</span><span>BUDŻET %</span><span>ROI %</span></div>
<div class="channels">${names.map((name, i) => `<div class="channel" style="--channel:var(--c${i})"><div class="channel-name"><span class="channel-icon" aria-hidden="true">${icons[i]}</span><div><strong>${name}</strong><span id="amount-${i}" class="amount">—</span></div></div><div class="field"><label class="sr-only" for="share-${i}">Udział budżetu: ${name}</label><div class="input-wrap"><input id="share-${i}" inputmode="decimal" aria-describedby="share-error-${i}"><span>%</span></div><p class="error" id="share-error-${i}"></p></div><div class="field"><label class="sr-only" for="roi-${i}">Oczekiwany ROI: ${name}</label><div class="input-wrap"><input id="roi-${i}" inputmode="decimal" placeholder="—" aria-describedby="roi-help roi-error-${i}"><span>%</span></div><p class="error" id="roi-error-${i}"></p></div><span class="channel-profit" id="profit-${i}"></span></div>`).join('')}</div>
<div class="allocation-status"><span id="allocation-message" role="status"></span><strong id="allocation-total"></strong></div><div class="allocation-bar" id="allocation-bar" aria-hidden="true"></div><p class="roi-help" id="roi-help"><span>ⓘ</span> ROI 20% oznacza 20 zł zysku po odjęciu kosztu inwestycji 100 zł.</p></section>
<aside class="summary"><span class="eyebrow">TWÓJ PLAN W SKRÓCIE</span><h2>Potencjał Twojego<br>budżetu.</h2><div class="chart" id="chart"><div><span id="chart-total">0%</span><small>przydzielono</small></div></div><div class="legend">${names.map((n,i)=>`<span><i style="background:var(--c${i})"></i>${n}</span>`).join('')}</div><div class="summary-line"><span>Roczny budżet</span><strong id="summary-budget">—</strong></div><div class="summary-line"><span id="remaining-label">Do przydzielenia</span><strong id="remaining">—</strong></div><div class="forecast"><span>PROGNOZOWANY ZYSK</span><strong id="summary-profit">—</strong><div>Oczekiwany ROI <b id="summary-roi">—</b></div></div><p id="forecast-note">Uzupełnij plan, aby zobaczyć prognozę.</p><p class="disclaimer">Prognoza opiera się na Twoich założeniach. Rzeczywiste wyniki kampanii mogą się różnić.</p></aside></div>
<div class="bottom-actions"><span id="save-status" role="status"></span><div><button id="example" class="example">Wczytaj przykład ↗</button><button id="clear">Wyczyść plan</button></div></div><footer><span>Małe decyzje. Przemyślane inwestycje.</span><span>PLANER BUDŻETU MARKETINGOWEGO</span></footer></main>
<dialog id="clear-dialog"><h2>Wyczyścić plan?</h2><p>Budżet, udziały i założenia ROI zostaną usunięte.</p><div><button id="cancel-clear">Anuluj</button><button id="confirm-clear">Wyczyść plan</button></div></dialog>`;
const el = id => document.getElementById(id);
function syncInputs() { el('budget').value = state.budget; state.rows.forEach((r,i) => { el(`share-${i}`).value = r.share; el(`roi-${i}`).value = r.roi; }); }
function render() {
  const data = calculate(state.budget, state.rows);
  const fields = ['budget', ...names.flatMap((_,i) => [`share-${i}`, `roi-${i}`])];
  for (const id of fields) {
    const error = data.errors[id] || '';
    el(id === 'budget' ? 'budget-error' : id.replace('-', '-error-')).textContent = error;
    el(id).setAttribute('aria-invalid', String(Boolean(error)));
  }
  data.rows.forEach((r,i) => { el(`amount-${i}`).textContent = data.errors.budget || data.errors[`share-${i}`] ? '—' : money(r.amount); el(`profit-${i}`).textContent = !data.errors.budget && !data.errors[`share-${i}`] && !data.errors[`roi-${i}`] ? `Zysk: ${money(r.profit)}` : ''; });
  const total = data.total;
  el('allocation-total').textContent = percent(total);
  el('chart-total').textContent = percent(total);
  el('allocation-message').textContent = !Number.isFinite(total) ? 'Popraw udziały budżetu' : total === 100 ? '✓ Cały budżet przydzielony' : total < 100 ? `Pozostało do przydzielenia: ${percent(100-total)}` : `Przekroczono budżet o ${percent(total-100)}`;
  el('allocation-message').className = total === 100 ? 'complete' : '';
  let position = 0;
  const stops = data.rows.map((r,i) => { const start = position; position += Math.max(0, Number.isFinite(r.share) ? r.share : 0); return `var(--c${i}) ${Math.min(start,100)}% ${Math.min(position,100)}%`; });
  el('chart').style.background = `conic-gradient(${stops.join(',')}, #e7ece7 ${Math.min(position,100)}% 100%)`;
  el('allocation-bar').innerHTML = data.rows.map((r,i) => `<span style="background:var(--c${i});width:${Math.min(100,Math.max(0, Number.isFinite(r.share) ? r.share : 0))}%"></span>`).join('');
  el('summary-budget').textContent = data.errors.budget ? '—' : money(data.budget);
  el('remaining-label').textContent = total > 100 ? 'Przekroczenie' : 'Do przydzielenia';
  el('remaining').textContent = !data.errors.budget && Number.isFinite(total) ? money(data.budget * Math.abs(100-total) / 100) : '—';
  el('summary-profit').textContent = data.valid ? money(data.profit) : '—';
  el('summary-roi').textContent = data.valid ? percent(data.roi) : '—';
  el('forecast-note').textContent = data.valid ? 'Twój plan jest kompletny. Oto prognoza rocznego zysku.' : 'Uzupełnij poprawne dane i przydziel 100% budżetu, aby zobaczyć prognozę.';
  el('save-status').textContent = storageAvailable ? '✓ Plan zapisywany w tej przeglądarce' : 'Zapis lokalny niedostępny — plan działa w tej sesji';
}
function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch { storageAvailable = false; } render(); }
el('budget').addEventListener('input', e => { state.budget = e.target.value; save(); });
state.rows.forEach((_,i) => ['share','roi'].forEach(field => el(`${field}-${i}`).addEventListener('input', e => { state.rows[i][field] = e.target.value; save(); })));
el('example').onclick = () => { state = { budget:'100000', rows:[{share:'40',roi:'30'},{share:'30',roi:'20'},{share:'20',roi:'10'},{share:'10',roi:'5'}] }; syncInputs(); save(); };
el('clear').onclick = () => el('clear-dialog').showModal();
el('cancel-clear').onclick = () => el('clear-dialog').close();
el('confirm-clear').onclick = () => { state = empty(); syncInputs(); try { localStorage.removeItem(key); } catch { storageAvailable = false; } render(); el('clear-dialog').close(); el('budget').focus(); };
syncInputs(); render();
