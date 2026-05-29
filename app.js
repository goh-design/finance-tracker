/* ============================================
   FINANCE TRACKER — Main Application Logic
   ============================================ */

const STORAGE_KEYS = {

  WEEKLY_DATA: 'ft_weeklyData',
  ACCOUNT_DATA: 'ft_accountData',
  COLUMNS_DATA: 'ft_columnsData',
  ACCOUNT_COLUMNS_DATA: 'ft_accountColumnsData',
  INVESTMENTS: 'ft_investments',
  BUDGETS: 'ft_budgetLimits',
  THEME: 'ft_theme',
  CURRENCY: 'ft_currency',
};

// ─── Currency Formatter ───
function getCurrencyConfig() {
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
  if (saved === 'USD') return { code: 'USD', symbol: '$' };
  if (saved === 'GBP') return { code: 'GBP', symbol: '£' };
  return { code: 'EUR', symbol: '€' };
}

function currency(val) {
  if (val == null || isNaN(val)) return '—';
  const cfg = getCurrencyConfig();
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: cfg.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

function pct(val) {
  if (val == null || isNaN(val)) return '—';
  return (val >= 0 ? '+' : '') + val.toFixed(2) + ' %';
}

// ─── Default Data ─── (based on the Google Sheet screenshot)
// Season data removed (dead code cleanup)

function getDefaultWeeklyData() {
  return [];
}

function getDefaultAccountData() {
  return [
    { id: crypto.randomUUID(), semaine: '10', date: '2026-03-07', compte_depot: 13000.88, livret_a: 2403.66, livret_jeune: 1600.00, pea: 177.63, compte_titre: 121.90, predissime: 100.27, perp: 35.00, steam: 44.00, total: 17483.34, variation: 0 },
    { id: crypto.randomUUID(), semaine: '11', date: '2026-03-13', compte_depot: 13207.20, livret_a: 2403.66, livret_jeune: 1600.00, pea: 173.69, compte_titre: 121.92, predissime: 99.82, perp: 32.68, steam: 44.00, total: 17682.97, variation: 199.63 },
    { id: crypto.randomUUID(), semaine: '13', date: '2026-03-25', compte_depot: 12767.25, livret_a: 2403.66, livret_jeune: 1600.00, pea: 167.31, compte_titre: 119.46, predissime: 348.18, perp: 18.00, steam: 44.00, total: 17467.86, variation: -215.11 },
    { id: crypto.randomUUID(), semaine: '14', date: '2026-04-01', compte_depot: 1306.05, livret_a: 3203.66, livret_jeune: 1600.00, pea: 168.12, compte_titre: 117.96, predissime: 12349.55, perp: 21.91, steam: 44.00, total: 18825.73, variation: 1357.87 },
    { id: crypto.randomUUID(), semaine: '15', date: '2026-04-12', compte_depot: 561.21, livret_a: 3203.66, livret_jeune: 1600.00, pea: 177.58, compte_titre: 121.84, predissime: 12365.49, perp: 94.00, steam: 30.00, total: 18658.26, variation: -167.47 },
    { id: crypto.randomUUID(), semaine: '16', date: '2026-04-19', compte_depot: 100.00, livret_a: 3203.66, livret_jeune: 1600.00, pea: 679.00, compte_titre: 123.89, predissime: 12355.49, perp: 94.00, steam: 217.00, total: 18373.04, variation: -285.22 }
  ];
}

function getDefaultColumns() {
  return [
    { id: 'mois', label: 'Mois', type: 'text', isSystem: true },
    { id: 'salaire', label: 'Salaire (€)', type: 'number', isSystem: true },
    { id: 'autres_revenus', label: 'Autres revenus (€)', type: 'number', isSystem: true },
    { id: 'total', label: 'Total (€)', type: 'number', isSystem: true },
    { id: 'epargne', label: 'Épargne (€)', type: 'number', isSystem: true },
    { id: 'depenses_fixes', label: 'Dépenses fixes (€)', type: 'number', isSystem: true },
    { id: 'courses', label: 'Courses (€)', type: 'number', isSystem: true },
    { id: 'sorties', label: 'Sorties (€)', type: 'number', isSystem: true },
    { id: 'achats', label: 'Achats (€)', type: 'number', isSystem: true },
    { id: 'reste', label: 'Reste (€)', type: 'number', isSystem: true },
  ];
}

function getDefaultAccountColumns() {
  return [
    { id: 'semaine', label: 'Semaine', type: 'text', isSystem: true },
    { id: 'compte_depot', label: 'Compte dépôt (€)', type: 'number', isSystem: false },
    { id: 'livret_a', label: 'Livret A (€)', type: 'number', isSystem: false },
    { id: 'livret_jeune', label: 'Livret jeune (€)', type: 'number', isSystem: false },
    { id: 'pea', label: 'PEA (€)', type: 'number', isSystem: false },
    { id: 'compte_titre', label: 'Compte titre (€)', type: 'number', isSystem: false },
    { id: 'predissime', label: 'Predissime 9 (€)', type: 'number', isSystem: false },
    { id: 'perp', label: 'PERP (€)', type: 'number', isSystem: false },
    { id: 'steam', label: 'Steam (€)', type: 'number', isSystem: false },
    { id: 'total', label: 'Total (€)', type: 'number', isSystem: true },
    { id: 'variation', label: 'Variation (€)', type: 'number', isSystem: true },
  ];
}

// ─── App State ───
const state = {

  weeklyData: [],
  accountData: [],
  columns: [],
  accountColumns: [],
  investments: {},
  budgetLimits: {},
  currentView: 'dashboard',
  charts: {},
};

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  loadData();
  initNav();
  initTheme();
  initSidebar();
  initModals();
  initImportExport();
  initSettings();
  renderDashboard();
  renderMainTable();
  renderAccountsView();
  initProjections();
  updateLastUpdated();
  // Phase 3
  setTimeout(() => { checkAlerts(); initMonthComparison(); initCloudSync(); }, 300);
});

// ==========================================
//  DATA PERSISTENCE
// ==========================================
function loadData() {
  try {
    const wd = localStorage.getItem(STORAGE_KEYS.WEEKLY_DATA);
    const ad = localStorage.getItem(STORAGE_KEYS.ACCOUNT_DATA);
    const cd = localStorage.getItem(STORAGE_KEYS.COLUMNS_DATA);
    const acd = localStorage.getItem(STORAGE_KEYS.ACCOUNT_COLUMNS_DATA);
    state.weeklyData = wd ? JSON.parse(wd) : getDefaultWeeklyData();
    state.accountData = ad ? JSON.parse(ad) : getDefaultAccountData();
    state.columns = cd ? JSON.parse(cd) : getDefaultColumns();
    state.accountColumns = acd ? JSON.parse(acd) : getDefaultAccountColumns();
    const inv = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    state.investments = inv ? JSON.parse(inv) : {};
    const bl = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    state.budgetLimits = bl ? JSON.parse(bl) : getDefaultBudgetLimits();
    // Force migration if old columns format is detected
    if (!state.columns.find(c => c.id === 'salaire')) {
      state.columns = getDefaultColumns();
      saveData();
    }
    // Force migration for accounts format if not matching
    if (!state.accountColumns.find(c => c.id === 'compte_depot')) {
      state.accountColumns = getDefaultAccountColumns();
      saveData();
    }
    
    // Inject screenshot data once
    if (!localStorage.getItem('ft_seeded_accounts_2')) {
       state.accountData = getDefaultAccountData();
       state.accountColumns = getDefaultAccountColumns();
       localStorage.setItem('ft_seeded_accounts_2', 'true');
       saveData();
    }
  } catch {
    state.weeklyData = getDefaultWeeklyData();
    state.accountData = getDefaultAccountData();
    state.columns = getDefaultColumns();
    state.accountColumns = getDefaultAccountColumns();
    state.investments = {};
    state.budgetLimits = getDefaultBudgetLimits();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEYS.WEEKLY_DATA, JSON.stringify(state.weeklyData));
  localStorage.setItem(STORAGE_KEYS.ACCOUNT_DATA, JSON.stringify(state.accountData));
  localStorage.setItem(STORAGE_KEYS.COLUMNS_DATA, JSON.stringify(state.columns));
  localStorage.setItem(STORAGE_KEYS.ACCOUNT_COLUMNS_DATA, JSON.stringify(state.accountColumns));
  localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(state.investments));
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(state.budgetLimits));
  updateLastUpdated();
}

function updateLastUpdated() {
  const el = document.getElementById('lastUpdated');
  if (el) el.textContent = 'Dernière MAJ: ' + new Date().toLocaleTimeString('fr-FR');
}

// ==========================================
//  NAVIGATION
// ==========================================
function initNav() {
  const navItems = document.querySelectorAll('.nav-item[data-view]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      switchView(view);
      document.getElementById('sidebar').classList.remove('mobile-open');
    });
  });

  // Global search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) return;
      // Search in weekly data
      const weeklyMatch = state.weeklyData.some(r =>
        Object.values(r).some(v => String(v).toLowerCase().includes(q))
      );
      if (weeklyMatch) {
        switchView('table');
        setTimeout(() => {
          const filterEl = document.getElementById('tableFilter');
          if (filterEl) { filterEl.value = q; filterEl.dispatchEvent(new Event('input')); }
        }, 150);
        return;
      }
      // Search in account data
      const accMatch = state.accountData.some(r =>
        Object.values(r).some(v => String(v).toLowerCase().includes(q))
      );
      if (accMatch) { switchView('accounts'); return; }
      showToast(`Aucun résultat pour "${q}"`, 'info');
    }, 400));
  }
}

// ─── Debounce Utility ───
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function switchView(viewName) {
  state.currentView = viewName;
  // Update nav
  document.querySelectorAll('.nav-item[data-view]').forEach(n => n.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if (activeNav) activeNav.classList.add('active');

  // Update views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const activeView = document.getElementById(`view-${viewName}`);
  if (activeView) activeView.classList.add('active');

  // Update breadcrumb
  const bc = document.getElementById('breadcrumb');
  const iconMap = { dashboard: 'layout-dashboard', table: 'file-spreadsheet', accounts: 'landmark', analytics: 'pie-chart', projections: 'line-chart', goals: 'target', simulation: 'atom', import: 'download', settings: 'settings' };
  const textMap = { dashboard: 'Tableau de bord', table: 'Données financières', accounts: 'Comptes & Épargne', analytics: 'Analyses & Bilans', projections: 'Projections', goals: 'Objectifs Financiers', simulation: 'Simulation Monte-Carlo', import: 'Import / Export', settings: 'Paramètres' };
  
  if (bc) {
    const iconEl = bc.querySelector('.breadcrumb-icon');
    if (iconEl) {
      iconEl.innerHTML = `<i data-lucide="${iconMap[viewName] || 'file'}" style="width: 18px; height: 18px;"></i>`;
      lucide.createIcons({ root: bc });
    }
    const textEl = bc.querySelector('.breadcrumb-text');
    if (textEl) textEl.textContent = textMap[viewName] || viewName;
  }

  // Re-render charts on switch (Canvas resize issue)
  if (viewName === 'dashboard') {
    setTimeout(() => {
      renderNetWorthChart();
      renderWeeklyCharts();
    }, 100);
  }
  if (viewName === 'accounts') {
    setTimeout(() => { renderAccountDistChart(); renderAllocationDonut(); }, 100);
  }
  if (viewName === 'analytics') {
    setTimeout(() => initAnalyticsView(), 100);
  }
  if (viewName === 'simulation') {
    setTimeout(() => initSimulationView(), 100);
  }
  if (viewName === 'goals') {
    setTimeout(() => initGoalsView(), 100);
  }
  if (viewName === 'projections') {
    // keep existing projection
  }
}

// ==========================================
//  SIDEBAR
// ==========================================
function initSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  toggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));

  const mobileBtn = document.getElementById('mobileMenuBtn');
  mobileBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));

  // Close on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && e.target !== mobileBtn) {
      sidebar.classList.remove('mobile-open');
    }
  });
}

// ==========================================
//  THEME
// ==========================================
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  setTheme(saved);

  document.getElementById('themeToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  document.getElementById('darkModeToggle').addEventListener('change', (e) => {
    setTheme(e.target.checked ? 'dark' : 'light');
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  const icon = document.querySelector('.theme-icon');
  if (icon) {
    icon.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    lucide.createIcons({ root: icon.parentNode });
  }
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.checked = theme === 'dark';

  // Update charts for theme
  updateChartsTheme();
}

function updateChartsTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#9b9b9b' : '#787774';

  Object.values(state.charts).forEach(chart => {
    if (!chart) return;
    chart.options.scales?.x && (chart.options.scales.x.ticks.color = textColor);
    chart.options.scales?.x && (chart.options.scales.x.grid.color = gridColor);
    chart.options.scales?.y && (chart.options.scales.y.ticks.color = textColor);
    chart.options.scales?.y && (chart.options.scales.y.grid.color = gridColor);
    chart.update('none');
  });
}

// ==========================================
//  DASHBOARD
// ==========================================
function renderDashboard() {
  renderSummaryCards();
  renderNetWorthChart();
  renderWeeklyCharts();
  renderHealthScore();
  renderSavingsRateChart();
  renderMobileWidget();
}

// ─── Helper: compute total expenses for a row ───
function computeExpenses(d) {
  return (parseFloat(d.depenses_fixes) || 0) + (parseFloat(d.courses) || 0)
       + (parseFloat(d.sorties) || 0) + (parseFloat(d.achats) || 0);
}

function renderSummaryCards() {
  const data = state.weeklyData;
  const currentTotalObj = data.reduce((acc, row) => {
    acc.revenu += (parseFloat(row.total) || 0);
    acc.epargne += (parseFloat(row.epargne) || 0);
    acc.depenses += computeExpenses(row);
    acc.reste += (parseFloat(row.reste) || 0);
    return acc;
  }, { revenu: 0, epargne: 0, depenses: 0, reste: 0 });

  // ─── Compute period-over-period changes ───
  const len = data.length;
  let savingsChange = 0, expensesChange = 0, resteChange = 0;
  if (len >= 2) {
    const curr = data[len - 1];
    const prev = data[len - 2];
    const currEp = parseFloat(curr.epargne) || 0;
    const prevEp = parseFloat(prev.epargne) || 0;
    savingsChange = prevEp !== 0 ? ((currEp - prevEp) / Math.abs(prevEp)) * 100 : 0;
    const currDep = computeExpenses(curr);
    const prevDep = computeExpenses(prev);
    expensesChange = prevDep !== 0 ? ((currDep - prevDep) / Math.abs(prevDep)) * 100 : 0;
    const currRe = parseFloat(curr.reste) || 0;
    const prevRe = parseFloat(prev.reste) || 0;
    resteChange = prevRe !== 0 ? ((currRe - prevRe) / Math.abs(prevRe)) * 100 : 0;
  }

  const latestAccount = state.accountData[state.accountData.length - 1];
  const netWorthTotal = latestAccount ? (parseFloat(latestAccount.total) || 0) : 0;
  const netWorthVar = latestAccount ? (parseFloat(latestAccount.variation) || 0) : 0;

  const cardNetWorth = document.getElementById('cardNetWorth');
  if (cardNetWorth) cardNetWorth.textContent = currency(netWorthTotal);
  
  const nwChangeEl = document.getElementById('cardNetWorthChange');
  if (nwChangeEl) {
    nwChangeEl.textContent = (netWorthVar > 0 ? '+' : '') + currency(netWorthVar);
    nwChangeEl.className = 'card-change ' + (netWorthVar >= 0 ? 'positive' : 'negative');
  }

  const cardSavings = document.getElementById('cardSavings');
  if (cardSavings) cardSavings.textContent = currency(currentTotalObj.epargne);

  const cardExpenses = document.getElementById('cardExpenses');
  if (cardExpenses) cardExpenses.textContent = currency(currentTotalObj.depenses);

  const cardReste = document.getElementById('cardReste');
  if (cardReste) cardReste.textContent = currency(currentTotalObj.reste);

  setChangeEl('cardSavingsChange', savingsChange);
  setChangeEl('cardExpensesChange', expensesChange, true);
  setChangeEl('cardResteChange', resteChange);
}

function setChangeEl(id, val, invert = false) {
  const el = document.getElementById(id);
  if (!el) return;
  if (val === 0) {
    el.textContent = '—';
    el.className = 'card-change';
    return;
  }
  const isPositive = invert ? val < 0 : val >= 0;
  el.textContent = (val > 0 ? '+' : '') + val.toFixed(1) + '%';
  el.className = 'card-change ' + (isPositive ? 'positive' : 'negative');
}



// ==========================================
//  CHARTS
// ==========================================
function getChartDefaults() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    gridColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    textColor: isDark ? '#9b9b9b' : '#787774',
  };
}

function renderNetWorthChart() {
  const ctx = document.getElementById('netWorthChart');
  if (!ctx) return;
  if (state.charts.netWorth) state.charts.netWorth.destroy();

  const { gridColor, textColor } = getChartDefaults();
  const labels = state.weeklyData.map(d => d.mois || '');

  // Cumulative épargne
  let cum = 0;
  const epargneData = state.weeklyData.map(d => {
    cum += (parseFloat(d.epargne) || 0);
    return Math.round(cum);
  });

  // Cumulative dépenses
  let cumDep = 0;
  const depensesData = state.weeklyData.map(d => {
    cumDep += (parseFloat(d.depenses_fixes) || 0) + (parseFloat(d.courses) || 0) + (parseFloat(d.sorties) || 0) + (parseFloat(d.achats) || 0);
    return Math.round(cumDep);
  });

  state.charts.netWorth = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Épargne Cumulative',
          data: epargneData,
          borderColor: '#4daa57',
          backgroundColor: 'rgba(77,170,87,0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#4daa57',
        },
        {
          label: 'Dépenses Cumulatives',
          data: depensesData,
          borderColor: '#e03e3e',
          backgroundColor: 'rgba(224,62,62,0.06)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#e03e3e',
        }
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: textColor, font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyle: 'circle', padding: 16 },
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' },
          padding: 12, cornerRadius: 8,
          callbacks: { label: ctx => `${ctx.dataset.label}: ${currency(ctx.parsed.y)}` },
        },
      },
      scales: {
        x: { ticks: { color: textColor, font: { size: 11 }, maxTicksLimit: 20 }, grid: { color: gridColor } },
        y: { ticks: { color: textColor, font: { size: 11 }, callback: v => currency(v) }, grid: { color: gridColor } },
      },
    },
  });

  // Chart range buttons
  document.querySelectorAll('.chart-btn[data-range]').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.chart-btn[data-range]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const range = btn.dataset.range;
      const total = state.weeklyData.length;
      let sliceStart = 0;
      if (range === '3m') sliceStart = Math.max(0, total - 3);
      else if (range === '6m') sliceStart = Math.max(0, total - 6);
      else if (range === '12m') sliceStart = Math.max(0, total - 12);

      const sliced = state.weeklyData.slice(sliceStart);
      state.charts.netWorth.data.labels = sliced.map(d => d.mois || '');

      // Recalculate cumulative épargne from slice
      let cumActive = 0;
      state.weeklyData.slice(0, sliceStart).forEach(d => cumActive += (parseFloat(d.epargne) || 0));
      state.charts.netWorth.data.datasets[0].data = sliced.map(d => { cumActive += (parseFloat(d.epargne) || 0); return Math.round(cumActive); });

      // Recalculate cumulative dépenses from slice
      let cumDepActive = 0;
      state.weeklyData.slice(0, sliceStart).forEach(d => cumDepActive += (parseFloat(d.depenses_fixes) || 0) + (parseFloat(d.courses) || 0) + (parseFloat(d.sorties) || 0) + (parseFloat(d.achats) || 0));
      state.charts.netWorth.data.datasets[1].data = sliced.map(d => { cumDepActive += (parseFloat(d.depenses_fixes) || 0) + (parseFloat(d.courses) || 0) + (parseFloat(d.sorties) || 0) + (parseFloat(d.achats) || 0); return Math.round(cumDepActive); });

      state.charts.netWorth.update();
    };
  });
}

function renderWeeklyCharts() {
  const { gridColor, textColor } = getChartDefaults();
  const last12 = state.weeklyData.slice(-12);
  const labels = last12.map(d => d.mois || '');

  // Reste / Mois
  const ttCtx = document.getElementById('ttWeeklyChart');
  if (ttCtx) {
    if (state.charts.ttWeekly) state.charts.ttWeekly.destroy();
    const resteData = last12.map(d => parseFloat(d.reste) || 0);
    state.charts.ttWeekly = new Chart(ttCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Reste',
          data: resteData,
          backgroundColor: resteData.map(v => v >= 0 ? 'rgba(77,170,87,0.7)' : 'rgba(224,62,62,0.7)'),
          borderRadius: 4,
          borderSkipped: false,
          barPercentage: 0.7,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => currency(ctx.parsed.y) } } },
        scales: {
          x: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { color: textColor, font: { size: 10 }, callback: v => currency(v) }, grid: { color: gridColor } },
        },
      },
    });
  }

  // Repartition Depenses (Stacked Bar)
  const vaCtx = document.getElementById('vaWeeklyChart');
  if (vaCtx) {
    if (state.charts.vaWeekly) state.charts.vaWeekly.destroy();
    state.charts.vaWeekly = new Chart(vaCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Fixes', data: last12.map(d => parseFloat(d.depenses_fixes)||0), backgroundColor: '#e03e3e', borderRadius: 2 },
          { label: 'Courses', data: last12.map(d => parseFloat(d.courses)||0), backgroundColor: '#cb912f', borderRadius: 2 },
          { label: 'Sorties', data: last12.map(d => parseFloat(d.sorties)||0), backgroundColor: '#9b51e0', borderRadius: 2 },
          { label: 'Achats', data: last12.map(d => parseFloat(d.achats)||0), backgroundColor: '#2eaadc', borderRadius: 2 }
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => currency(ctx.parsed.y) } } },
        scales: {
          x: { stacked: true, ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } },
          y: { stacked: true, ticks: { color: textColor, font: { size: 10 }, callback: v => currency(v) }, grid: { color: gridColor } },
        },
      },
    });
  }
}

// ==========================================
//  MAIN DATA TABLE
// ==========================================
function renderMainTable() {
  const thead = document.getElementById('mainTableHead');
  const tbody = document.getElementById('mainTableBody');
  if (!tbody || !thead) return;

  // Render Header
  thead.innerHTML = `
    <tr>
      <th class="sticky-col">#</th>
      ${state.columns.map(col => `<th>${col.label}</th>`).join('')}
      <th class="actions-col">Actions</th>
    </tr>
  `;

  // Render Body
  tbody.innerHTML = state.weeklyData.map((row, idx) => {
    const cells = state.columns.map(col => {
      let val = row[col.id];
      let displayVal = val;
      let extraClass = '';
      if (col.id === 'total' || col.id === 'salaire' || col.id === 'autres_revenus' || col.id === 'epargne') {
        displayVal = (parseFloat(val) || 0).toLocaleString('fr-FR');
        extraClass = 'positive-val';
      } else if (col.id === 'depenses_fixes' || col.id === 'courses' || col.id === 'sorties' || col.id === 'achats') {
        displayVal = (parseFloat(val) || 0).toLocaleString('fr-FR');
        extraClass = 'negative-val';
      } else if (col.id === 'reste') {
        displayVal = (parseFloat(val) || 0).toLocaleString('fr-FR');
        extraClass = (parseFloat(val) || 0) >= 0 ? 'positive-val' : 'negative-val';
      } else if (col.type === 'number') {
        displayVal = (parseFloat(val) || 0).toLocaleString('fr-FR');
      } else {
        displayVal = val || '';
      }
      const editable = (col.id === 'total' || col.id === 'reste') ? 'false' : 'true';
      return `<td contenteditable="${editable}" data-field="${col.id}" class="${extraClass}">${displayVal}</td>`;
    }).join('');

    return `
      <tr data-id="${row.id}">
        <td class="sticky-col">${idx + 1}</td>
        ${cells}
        <td class="actions-col">
          <button class="row-action-btn" onclick="deleteWeeklyRow('${row.id}')" title="Supprimer">
            <i data-lucide="trash-2" style="width:16px;height:16px;pointer-events:none;"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  lucide.createIcons({ root: tbody });

  // Inline editing
  tbody.querySelectorAll('td[contenteditable]').forEach(cell => {
    cell.addEventListener('blur', handleCellEdit);
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); cell.blur(); }
      if (e.key === 'Tab') {
        e.preventDefault();
        const next = e.shiftKey ? cell.previousElementSibling : cell.nextElementSibling;
        if (next && next.contentEditable === 'true') next.focus();
      }
    });
  });

  // Filter — use .oninput to avoid stacking listeners
  const filterEl = document.getElementById('tableFilter');
  if (filterEl) filterEl.oninput = (e) => {
    const q = e.target.value.toLowerCase();
    tbody.querySelectorAll('tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };

  // Buttons — use .onclick to avoid stacking listeners
  const addBtn = document.getElementById('addRowBtn');
  if (addBtn) addBtn.onclick = showAddWeeklyRowModal;
  const manageBtn = document.getElementById('manageColumnsBtn');
  if (manageBtn) manageBtn.onclick = showManageColumnsModal;
  const exportBtn = document.getElementById('exportCsvBtn');
  if (exportBtn) exportBtn.onclick = () => exportTableCSV('weekly');

  // Budget tracker
  initBudgetTracker();
}

// ==========================================
//  BUDGET TRACKER (with sub-categories)
// ==========================================
const BUDGET_CATEGORIES = [
  {
    id: 'depenses_fixes', label: 'Dépenses fixes', color: '#f2994a', icon: 'home',
    subs: [
      { id: 'loyer', label: 'Loyer / Crédit immobilier' },
      { id: 'electricite', label: 'Électricité / Gaz' },
      { id: 'eau', label: 'Eau' },
      { id: 'internet_tel', label: 'Internet / Téléphone' },
      { id: 'assurances', label: 'Assurances' },
      { id: 'abonnements', label: 'Abonnements (streaming, presse…)' },
      { id: 'transport_fixe', label: 'Transport (Navigo, essence…)' },
      { id: 'impots', label: 'Impôts / Taxes' },
      { id: 'charges_copro', label: 'Charges de copropriété' },
      { id: 'frais_bancaires', label: 'Frais bancaires' },
    ]
  },
  {
    id: 'courses', label: 'Courses', color: '#2eaadc', icon: 'shopping-cart',
    subs: [
      { id: 'supermarche', label: 'Supermarché / Alimentaire' },
      { id: 'marche_bio', label: 'Marché / Bio' },
      { id: 'boulangerie', label: 'Boulangerie / Traiteur' },
      { id: 'hygiene', label: 'Hygiène / Cosmétiques' },
      { id: 'menager', label: 'Produits ménagers' },
      { id: 'pharmacie', label: 'Pharmacie / Santé' },
      { id: 'fournitures', label: 'Fournitures de bureau' },
      { id: 'animalerie', label: 'Animalerie' },
    ]
  },
  {
    id: 'sorties', label: 'Sorties', color: '#9b51e0', icon: 'utensils',
    subs: [
      { id: 'restaurant', label: 'Restaurant' },
      { id: 'bar_cafe', label: 'Bar / Café' },
      { id: 'fast_food', label: 'Fast-food / Livraison' },
      { id: 'cinema', label: 'Cinéma / Spectacles' },
      { id: 'culture', label: 'Musées / Expos' },
      { id: 'concerts', label: 'Concerts / Festivals' },
      { id: 'sport_loisirs', label: 'Sport / Loisirs' },
      { id: 'voyages', label: 'Voyages / Week-ends' },
      { id: 'parc_attractions', label: 'Parcs / Attractions' },
    ]
  },
  {
    id: 'achats', label: 'Achats', color: '#e03e3e', icon: 'shopping-bag',
    subs: [
      { id: 'tech', label: 'Tech / Électronique' },
      { id: 'vetements', label: 'Vêtements / Mode' },
      { id: 'chaussures', label: 'Chaussures / Accessoires' },
      { id: 'meubles_deco', label: 'Meubles / Déco' },
      { id: 'electromenager', label: 'Électroménager' },
      { id: 'cadeaux', label: 'Cadeaux' },
      { id: 'livres', label: 'Livres / Formations' },
      { id: 'jeux_video', label: 'Jeux vidéo / Gaming' },
      { id: 'bricolage', label: 'Bricolage / Jardin' },
      { id: 'auto_moto', label: 'Auto / Moto' },
    ]
  },
  {
    id: 'epargne', label: 'Épargne', color: '#4daa57', icon: 'piggy-bank',
    subs: [
      { id: 'livrets', label: 'Livrets (A, jeune, LDDS…)' },
      { id: 'pea_bourse', label: 'PEA / Bourse' },
      { id: 'assurance_vie', label: 'Assurance vie' },
      { id: 'crypto_epargne', label: 'Crypto' },
      { id: 'immobilier_epargne', label: 'SCPI / Immobilier' },
      { id: 'epargne_projet', label: 'Épargne projet' },
    ]
  },
];

function getDefaultBudgetLimits() {
  return {
    depenses_fixes: 800,
    courses: 300,
    sorties: 150,
    achats: 200,
    epargne: 500,
  };
}

function initBudgetTracker() {
  const monthSelect = document.getElementById('budgetMonthSelect');
  if (!monthSelect) return;

  const months = [...new Set(state.weeklyData.map(d => d.mois).filter(Boolean))];
  monthSelect.innerHTML = months.map((m, i) =>
    `<option value="${m}" ${i === months.length - 1 ? 'selected' : ''}>${m}</option>`
  ).join('');

  if (months.length === 0) {
    monthSelect.innerHTML = '<option value="">Aucune donnée</option>';
  }

  monthSelect.addEventListener('change', () => renderBudgetTracker());
  document.getElementById('editBudgetLimitsBtn')?.addEventListener('click', showEditBudgetLimitsModal);

  // Load subcategory data
  const stored = localStorage.getItem('ft_budgetSubcats');
  state.budgetSubcats = stored ? JSON.parse(stored) : {};

  renderBudgetTracker();
}

function saveBudgetSubcats() {
  localStorage.setItem('ft_budgetSubcats', JSON.stringify(state.budgetSubcats));
}

function getSubcatData(month, catId) {
  if (!state.budgetSubcats[month]) return {};
  return state.budgetSubcats[month][catId] || {};
}

function renderBudgetTracker() {
  const container = document.getElementById('budgetCategories');
  const monthSelect = document.getElementById('budgetMonthSelect');
  if (!container || !monthSelect) return;

  const selectedMonth = monthSelect.value;
  const monthData = state.weeklyData.find(d => d.mois === selectedMonth);

  if (!monthData) {
    container.innerHTML = '<p class="placeholder-text">Aucune donnée pour ce mois.</p>';
    document.getElementById('budgetTotalSpent').textContent = '--';
    if (state.charts.budgetDonut) state.charts.budgetDonut.destroy();
    return;
  }

  // Compute totals
  let totalSpent = 0;
  const catData = BUDGET_CATEGORIES.map(cat => {
    const spent = parseFloat(monthData[cat.id]) || 0;
    const limit = state.budgetLimits[cat.id] || 0;
    if (cat.id !== 'epargne') totalSpent += spent;
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    const isOver = pct > 100;
    const subcats = getSubcatData(selectedMonth, cat.id);
    return { ...cat, spent, limit, pct, isOver, subcats };
  });

  document.getElementById('budgetTotalSpent').textContent = currency(totalSpent);

  // Render category bars with expandable sub-categories
  container.innerHTML = catData.map(c => {
    const barPct = Math.min(c.pct, 100);
    const overClass = c.isOver ? 'over' : '';
    const amountColor = c.isOver ? 'color: var(--danger);' : '';
    const limitText = c.limit > 0 ? ` / ${currency(c.limit)}` : '';
    const pctText = c.limit > 0 ? `${Math.round(c.pct)}%` : '';

    // Sub-category items with inline inputs
    const subItems = c.subs.map(sub => {
      const subVal = c.subcats[sub.id] || 0;
      const subPct = c.spent > 0 ? (subVal / c.spent) * 100 : 0;
      return `
        <div class="budget-sub-item">
          <span class="budget-sub-name">${sub.label}</span>
          <div class="budget-sub-bar-wrap">
            <div class="budget-sub-bar">
              <div class="budget-sub-fill" style="width:${subPct}%; background:${c.color}"></div>
            </div>
          </div>
          <div class="budget-sub-input-wrap">
            <input type="number" class="budget-sub-input" data-cat="${c.id}" data-sub="${sub.id}"
                   value="${subVal || ''}" placeholder="0" min="0" step="1">
            <span class="budget-sub-euro">€</span>
          </div>
        </div>
      `;
    }).join('');

    // Compute sub-total for this category
    const subTotal = Object.values(c.subcats).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    const subTotalHtml = subTotal > 0
      ? `<div class="budget-sub-total">Sous-total détaillé : <strong>${currency(subTotal)}</strong> sur ${currency(c.spent)}</div>`
      : '';

    return `
      <div class="budget-cat-item">
        <div class="budget-cat-header" data-cat="${c.id}" role="button" tabindex="0">
          <span class="budget-cat-name">
            <span class="budget-cat-dot" style="background:${c.color}"></span>
            <span class="budget-cat-chevron"><i data-lucide="chevron-right" style="width:14px;height:14px;"></i></span>
            ${c.label}
          </span>
          <span class="budget-cat-amount">
            <span style="${amountColor}">${currency(c.spent)}</span>${limitText}
            ${pctText ? `<span class="budget-cat-pct" style="margin-left:8px; ${c.isOver ? 'color:var(--danger)' : ''}">${pctText}</span>` : ''}
          </span>
        </div>
        <div class="budget-cat-bar">
          <div class="budget-cat-fill ${overClass}" style="width:${barPct}%; background:${c.isOver ? 'var(--danger)' : c.color}"></div>
        </div>
        <div class="budget-sub-panel" data-panel="${c.id}">
          <div class="budget-sub-list">
            ${subItems}
          </div>
          ${subTotalHtml}
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons({ root: container });

  // Accordion toggle
  container.querySelectorAll('.budget-cat-header[data-cat]').forEach(header => {
    header.addEventListener('click', () => {
      const catId = header.dataset.cat;
      const panel = container.querySelector(`.budget-sub-panel[data-panel="${catId}"]`);
      const chevron = header.querySelector('.budget-cat-chevron');
      const isOpen = panel.classList.toggle('open');
      chevron.classList.toggle('rotated', isOpen);
    });
  });

  // Inline sub-category input editing
  container.querySelectorAll('.budget-sub-input').forEach(input => {
    const save = () => {
      const catId = input.dataset.cat;
      const subId = input.dataset.sub;
      const val = parseFloat(input.value) || 0;

      // Save sub-category value
      if (!state.budgetSubcats[selectedMonth]) state.budgetSubcats[selectedMonth] = {};
      if (!state.budgetSubcats[selectedMonth][catId]) state.budgetSubcats[selectedMonth][catId] = {};

      if (val > 0) {
        state.budgetSubcats[selectedMonth][catId][subId] = val;
      } else {
        delete state.budgetSubcats[selectedMonth][catId][subId];
      }
      saveBudgetSubcats();

      // Sum all sub-categories → update the parent category total in weeklyData
      const allInputs = input.closest('.budget-sub-panel').querySelectorAll('.budget-sub-input');
      let newCatTotal = 0;
      allInputs.forEach(inp => newCatTotal += (parseFloat(inp.value) || 0));

      const monthRow = state.weeklyData.find(d => d.mois === selectedMonth);
      if (monthRow) {
        monthRow[catId] = newCatTotal;
        // Recompute total & reste
        const sal = parseFloat(monthRow.salaire) || 0;
        const autres = parseFloat(monthRow.autres_revenus) || 0;
        monthRow.total = sal + autres;
        const fix = parseFloat(monthRow.depenses_fixes) || 0;
        const cour = parseFloat(monthRow.courses) || 0;
        const sort = parseFloat(monthRow.sorties) || 0;
        const ach = parseFloat(monthRow.achats) || 0;
        const ep = parseFloat(monthRow.epargne) || 0;
        monthRow.reste = monthRow.total - fix - cour - sort - ach - ep;
        saveData();
      }

      // Remember which panels are open
      const openPanels = [];
      container.querySelectorAll('.budget-sub-panel.open').forEach(p => openPanels.push(p.dataset.panel));

      // Full re-render to update everything (bars, KPIs, donut)
      renderBudgetTracker();

      // Restore open panels
      openPanels.forEach(panelId => {
        const panel = container.querySelector(`.budget-sub-panel[data-panel="${panelId}"]`);
        const header = container.querySelector(`.budget-cat-header[data-cat="${panelId}"]`);
        if (panel) panel.classList.add('open');
        if (header) {
          const chevron = header.querySelector('.budget-cat-chevron');
          if (chevron) chevron.classList.add('rotated');
        }
      });

      // Re-focus the next input for fast data entry
      const freshInput = container.querySelector(`.budget-sub-input[data-cat="${catId}"][data-sub="${subId}"]`);
      if (freshInput) freshInput.focus();
    };

    input.addEventListener('change', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    });
    // Prevent accordion toggle when clicking input
    input.addEventListener('click', (e) => e.stopPropagation());
  });

  renderBudgetDonut(catData);
}

function showEditSubcatsModal(catId, month) {
  const cat = BUDGET_CATEGORIES.find(c => c.id === catId);
  if (!cat) return;

  const fields = cat.subs.map(sub => ({
    name: sub.id,
    label: sub.label + ' (€)',
    type: 'number'
  }));

  showModal(`${cat.label} — Détail`, fields, (data) => {
    if (!state.budgetSubcats[month]) state.budgetSubcats[month] = {};
    if (!state.budgetSubcats[month][catId]) state.budgetSubcats[month][catId] = {};

    Object.keys(data).forEach(k => {
      const val = parseFloat(data[k]);
      if (!isNaN(val) && val > 0) {
        state.budgetSubcats[month][catId][k] = val;
      } else {
        delete state.budgetSubcats[month][catId][k];
      }
    });

    saveBudgetSubcats();
    renderBudgetTracker();
    showToast(`Détail "${cat.label}" mis à jour`, 'success');
  });

  // Prefill
  setTimeout(() => {
    const existing = getSubcatData(month, catId);
    cat.subs.forEach(sub => {
      const el = document.getElementById('modal_' + sub.id);
      if (el && existing[sub.id]) el.value = existing[sub.id];
    });
  }, 10);
}

function renderBudgetDonut(catData) {
  const ctx = document.getElementById('budgetDonutChart');
  if (!ctx) return;
  if (state.charts.budgetDonut) state.charts.budgetDonut.destroy();

  const spendingCats = catData.filter(c => c.id !== 'epargne' && c.spent > 0);
  if (spendingCats.length === 0) return;

  state.charts.budgetDonut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: spendingCats.map(c => c.label),
      datasets: [{
        data: spendingCats.map(c => c.spent),
        backgroundColor: spendingCats.map(c => c.color),
        borderWidth: 2,
        borderColor: 'var(--bg-card)',
        hoverBorderColor: 'var(--bg-card)',
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: 10,
          cornerRadius: 8,
          titleFont: { family: 'Inter', size: 12 },
          bodyFont: { family: 'Inter', size: 13 },
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label}: ${currency(ctx.parsed)} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

function showEditBudgetLimitsModal() {
  const fields = BUDGET_CATEGORIES.map(c => ({
    name: c.id,
    label: c.label + ' (plafond €)',
    type: 'number'
  }));

  showModal('Définir les Plafonds de Budget', fields, (data) => {
    Object.keys(data).forEach(k => {
      const val = parseFloat(data[k]);
      if (!isNaN(val) && val >= 0) state.budgetLimits[k] = val;
    });
    saveData();
    renderBudgetTracker();
    showToast('Plafonds de budget mis à jour', 'success');
  });

  setTimeout(() => {
    BUDGET_CATEGORIES.forEach(c => {
      const el = document.getElementById('modal_' + c.id);
      if (el && state.budgetLimits[c.id] != null) {
        el.value = state.budgetLimits[c.id];
      }
    });
  }, 10);
}

function handleCellEdit(e) {
  const cell = e.target;
  const row = cell.closest('tr');
  const id = row.dataset.id;
  const field = cell.dataset.field;

  const colDef = state.columns.find(c => c.id === field);
  let finalValue;
  if (colDef && colDef.type === 'text') {
    finalValue = cell.textContent.trim();
  } else {
    const rawValue = cell.textContent.replace(/[^\d.,-]/g, '').replace(',', '.');
    finalValue = parseFloat(rawValue) || 0;
  }

  const item = state.weeklyData.find(d => d.id === id);
  if (item) {
    item[field] = finalValue;

    // Autocalcul
    item.total = (item.salaire || 0) + (item.autres_revenus || 0);
    const toutes_depenses = (item.epargne || 0) + (item.depenses_fixes || 0) + (item.courses || 0) + (item.sorties || 0) + (item.achats || 0);
    item.reste = item.total - toutes_depenses;

    saveData();
    renderMainTable();
    renderDashboard();
    showToast('Valeur mise à jour', 'success');
  }
}

function deleteWeeklyRow(id) {
  if (!confirm('Supprimer cette ligne ?')) return;
  state.weeklyData = state.weeklyData.filter(d => d.id !== id);
  saveData();
  renderMainTable();
  renderDashboard();
  showToast('Ligne supprimée', 'info');
}

function showAddWeeklyRowModal() {
  const fields = state.columns
    .filter(col => col.id !== 'total' && col.id !== 'reste' && col.id !== 'variation')
    .map(col => ({ name: col.id, label: col.label, type: col.type }));

  showModal('Ajouter une ligne', fields, (data) => {
    const newRow = { id: crypto.randomUUID() };
    
    state.columns.forEach(col => {
      if (col.id !== 'total' && col.id !== 'reste' && col.id !== 'variation') {
        if (col.type === 'text') {
          newRow[col.id] = data[col.id] || '';
        } else {
          newRow[col.id] = parseFloat(data[col.id]) || 0;
        }
      }
    });

    newRow.total = (newRow.salaire || 0) + (newRow.autres_revenus || 0);
    const toutes_depenses = (newRow.epargne || 0) + (newRow.depenses_fixes || 0) + (newRow.courses || 0) + (newRow.sorties || 0) + (newRow.achats || 0);
    newRow.reste = newRow.total - toutes_depenses;

    state.weeklyData.push(newRow);
    saveData();
    renderMainTable();
    renderDashboard();
    showToast('Ligne ajoutée avec succès', 'success');
  });
}

function showManageColumnsModal() {
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');
  const confirmBtn = document.getElementById('modalConfirm');
  const cancelBtn = document.getElementById('modalCancel');
  
  modalTitle.textContent = 'Gérer les colonnes (Budget)';
  
  const renderColumnsList = () => {
    return state.columns.map((col, idx) => `
      <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
        <input type="text" id="col_label_${idx}" value="${col.label}" style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-hover); color: var(--text-color);">
        ${col.isSystem ? '<span style="font-size: 12px; color: var(--text-muted);">(Système)</span>' : `<button type="button" class="btn btn-danger" onclick="window.deleteCustomColumn(${idx})" style="padding: 6px 10px;"><i data-lucide="x" style="width:16px;height:16px;"></i></button>`}
      </div>
    `).join('');
  };

  modalBody.innerHTML = `
    <div id="columnsList" style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
      ${renderColumnsList()}
    </div>
    <div style="border-top: 1px solid var(--border-color); padding-top: 15px;">
      <h4>Ajouter une colonne personnalisée</h4>
      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <input type="text" id="newColName" placeholder="Nom de la colonne (ex: Loyer)" style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-hover); color: var(--text-color);">
        <button type="button" class="btn btn-secondary" onclick="window.addCustomColumn()">Ajouter</button>
      </div>
    </div>
  `;

  document.getElementById('modalOverlay').classList.add('active');

  // Attach global temp functions for modal 
  window.deleteCustomColumn = (idx) => {
    if (confirm('Supprimer cette colonne ? Les données liées seront perdues.')) {
      state.columns.splice(idx, 1);
      document.getElementById('columnsList').innerHTML = renderColumnsList();
      lucide.createIcons({ root: document.getElementById('columnsList') });
    }
  };

  window.addCustomColumn = () => {
    const input = document.getElementById('newColName');
    const val = input.value.trim();
    if (!val) return;
    const newId = 'custom_' + Date.now();
    state.columns.push({ id: newId, label: val, type: 'number', isSystem: false });
    input.value = '';
    document.getElementById('columnsList').innerHTML = renderColumnsList();
    lucide.createIcons({ root: document.getElementById('columnsList') });
  };

  // Temporarily replace modal closure to handle cleanup
  const handleConfirm = () => {
    state.columns.forEach((col, idx) => {
      const input = document.getElementById(`col_label_${idx}`);
      if (input) col.label = input.value.trim() || col.label;
    });
    saveData();
    renderMainTable();
    closeModal();
    showToast('Colonnes mises à jour', 'success');
  };

  // We override the click to bypass closeModal default so we can hook it or just add our event
  // Wait, closeModal() might just hide the modal, we need to apply confirm logic.
  // The easiest is removing default event listeners by cloning the buttons.
  const newConfirm = confirmBtn.cloneNode(true);
  const newCancel = cancelBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

  newConfirm.addEventListener('click', () => { handleConfirm(); restoreModalBtns(); });
  newCancel.addEventListener('click', () => { closeModal(); restoreModalBtns(); });

  function restoreModalBtns() {
    delete window.deleteCustomColumn;
    delete window.addCustomColumn;
    // The standard showModal will re-clone these when called anyway, so it's fine.
  }
}

// ==========================================
//  ACCOUNTS VIEW
// ==========================================
function renderAccountsView() {
  renderAccountCards();
  renderAccountsTable();
  renderAccountDistChart();
  renderROICards();
}

function renderROICards() {
  const container = document.getElementById('roiCards');
  if (!container) return;
  const latest = state.accountData[state.accountData.length - 1];
  if (!latest) return;
  
  const investedAccs = state.accountColumns.filter(c => state.investments[c.id] > 0);
  
  if (investedAccs.length === 0) {
    container.innerHTML = '<p class="placeholder-text" style="width: 100%;">Cliquez sur "Définir Capital Investi" pour calculer vos plus-values boursières.</p>';
    return;
  }
  
  container.innerHTML = investedAccs.map(c => {
    const capital = state.investments[c.id] || 0;
    const currentVal = latest[c.id] || 0;
    const plusValue = currentVal - capital;
    const roi = capital > 0 ? (plusValue / capital) * 100 : 0;
    const isPos = plusValue >= 0;
    const color = isPos ? 'var(--positive-color)' : 'var(--negative-color)';
    return `
      <div class="card account-card" style="border-top: 3px solid ${color};">
        <div class="card-label">${c.label}</div>
        <div class="card-value">${currency(currentVal)}</div>
        <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:12px; font-weight:600;">
          <span style="color:var(--text-muted)">Investi: ${currency(capital)}</span>
          <span style="color:${color}">${isPos?'+':''}${currency(plusValue)} (${isPos?'+':''}${roi.toFixed(1)}%)</span>
        </div>
      </div>
    `;
  }).join('');
}

function showEditInvestmentsModal() {
  const fields = state.accountColumns
    .filter(c => c.type === 'number' && c.id !== 'total' && c.id !== 'variation')
    .map(c => ({ name: c.id, label: c.label + ' (Capital Investi)', type: 'number' }));
    
  showModal('Définir le Capital Investi', fields, (data) => {
    Object.keys(data).forEach(k => {
      const val = parseFloat(data[k]);
      if (!isNaN(val) && val > 0) state.investments[k] = val;
      else delete state.investments[k];
    });
    saveData();
    renderROICards();
    showToast('Investissements mis à jour', 'success');
  });
  
  // prefill values
  setTimeout(() => {
    fields.forEach(f => {
      const el = document.getElementById('modal_' + f.name);
      if (el && state.investments[f.name]) {
        el.value = state.investments[f.name];
      }
    });
  }, 10);
}

function renderAccountCards() {
  const container = document.getElementById('accountCards');
  if (!container) return;
  const latest = state.accountData[state.accountData.length - 1];
  if (!latest) { container.innerHTML = '<p class="placeholder-text">Aucune donnée</p>'; return; }

  const colors = ['#2eaadc', '#4daa57', '#6fcf97', '#cb912f', '#9b51e0', '#e03e3e', '#2d9cdb', '#f2c94c'];
  let colorIdx = 0;

  const accounts = state.accountColumns
    .filter(c => c.type === 'number' && c.id !== 'variation')
    .map(c => {
      const color = c.id === 'total' ? '#2d9cdb' : colors[colorIdx++ % colors.length];
      return { label: c.label, value: latest[c.id] || 0, color };
    });

  container.innerHTML = accounts.map(a => `
    <div class="card account-card" style="border-top: 3px solid ${a.color}">
      <div class="card-label">${a.label}</div>
      <div class="card-value">${currency(a.value)}</div>
    </div>
  `).join('');
}

function renderAccountsTable() {
  const thead = document.getElementById('accountsTableHead');
  const tbody = document.getElementById('accountsTableBody');
  if (!tbody || !thead) return;

  // Render Header
  thead.innerHTML = `
    <tr>
      ${state.accountColumns.map(col => `<th>${col.label}</th>`).join('')}
      <th class="actions-col">Actions</th>
    </tr>
  `;

  // Render Body
  tbody.innerHTML = state.accountData.map((row, idx) => {
    const cells = state.accountColumns.map(col => {
      let val = row[col.id];
      let displayVal = val;
      let extraClass = '';
      if (col.id === 'total') {
        displayVal = (parseFloat(val) || 0).toLocaleString('fr-FR');
        extraClass = 'positive-val';
      } else if (col.id === 'variation') {
        displayVal = (parseFloat(val) || 0).toLocaleString('fr-FR');
        extraClass = (parseFloat(val) || 0) >= 0 ? 'positive-val' : 'negative-val';
      } else if (col.type === 'number') {
        displayVal = (parseFloat(val) || 0).toLocaleString('fr-FR');
      } else {
        displayVal = val || '';
      }
      const editable = (col.id === 'total' || col.id === 'variation') ? 'false' : 'true';
      return `<td contenteditable="${editable}" data-field="${col.id}" class="${extraClass}">${displayVal}</td>`;
    }).join('');

    return `
      <tr data-id="${row.id}">
        ${cells}
        <td class="actions-col">
          <button class="row-action-btn" onclick="deleteAccountRow('${row.id}')" title="Supprimer">
            <i data-lucide="trash-2" style="width:16px;height:16px;pointer-events:none;"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  lucide.createIcons({ root: tbody });

  // Inline editing for accounts
  tbody.querySelectorAll('td[contenteditable]').forEach(cell => {
    cell.addEventListener('blur', handleAccountCellEdit);
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); cell.blur(); }
    });
  });

  // Buttons — use .onclick to avoid stacking listeners
  const addBtn = document.getElementById('addAccountEntryBtn');
  if (addBtn) addBtn.onclick = showAddAccountModal;
  const manageBtn = document.getElementById('manageAccountColumnsBtn');
  if (manageBtn) manageBtn.onclick = showManageAccountColumnsModal;
  const investBtn = document.getElementById('editInvestmentsBtn');
  if (investBtn) investBtn.onclick = showEditInvestmentsModal;
  const exportAccBtn = document.getElementById('exportAccountsCsvBtn');
  if (exportAccBtn) exportAccBtn.onclick = () => exportTableCSV('accounts');
}

function showManageAccountColumnsModal() {
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');
  const confirmBtn = document.getElementById('modalConfirm');
  const cancelBtn = document.getElementById('modalCancel');
  
  modalTitle.textContent = 'Gérer les colonnes (Épargne)';
  
  const renderColumnsList = () => {
    return state.accountColumns.map((col, idx) => `
      <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
        <input type="text" id="acc_col_label_${idx}" value="${col.label}" style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-hover); color: var(--text-color);">
        ${col.isSystem ? '<span style="font-size: 12px; color: var(--text-muted);">(Système)</span>' : `<button type="button" class="btn btn-danger" onclick="window.deleteAccCustomColumn(${idx})" style="padding: 6px 10px;"><i data-lucide="x" style="width:16px;height:16px;"></i></button>`}
      </div>
    `).join('');
  };

  modalBody.innerHTML = `
    <div id="accColumnsList" style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
      ${renderColumnsList()}
    </div>
    <div style="border-top: 1px solid var(--border-color); padding-top: 15px;">
      <h4>Ajouter un type de compte</h4>
      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <input type="text" id="newAccColName" placeholder="Nom du compte (ex: Crypto)" style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-hover); color: var(--text-color);">
        <button type="button" class="btn btn-secondary" onclick="window.addAccCustomColumn()">Ajouter</button>
      </div>
    </div>
  `;

  document.getElementById('modalOverlay').classList.add('active');
  lucide.createIcons({ root: modalBody });

  window.deleteAccCustomColumn = (idx) => {
    if (confirm('Supprimer ce compte ? Les données liées seront perdues.')) {
      state.accountColumns.splice(idx, 1);
      document.getElementById('accColumnsList').innerHTML = renderColumnsList();
      lucide.createIcons({ root: document.getElementById('accColumnsList') });
    }
  };

  window.addAccCustomColumn = () => {
    const input = document.getElementById('newAccColName');
    const val = input.value.trim();
    if (!val) return;
    const newId = 'acc_custom_' + Date.now();
    // Insert new type before "total" and "variation" if possible, else push.
    // Total and variation are at the end ideally.
    const insertIdx = state.accountColumns.findIndex(c => c.id === 'total');
    const colObj = { id: newId, label: val, type: 'number', isSystem: false };
    if(insertIdx >= 0) state.accountColumns.splice(insertIdx, 0, colObj);
    else state.accountColumns.push(colObj);
    
    input.value = '';
    document.getElementById('accColumnsList').innerHTML = renderColumnsList();
    lucide.createIcons({ root: document.getElementById('accColumnsList') });
  };

  const handleConfirm = () => {
    state.accountColumns.forEach((col, idx) => {
      const input = document.getElementById(`acc_col_label_${idx}`);
      if (input) col.label = input.value.trim() || col.label;
    });
    recomputeAccountTotals();
    saveData();
    renderAccountsView();
    closeModal();
    showToast('Comptes mis à jour', 'success');
  };

  const newConfirm = confirmBtn.cloneNode(true);
  const newCancel = cancelBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

  newConfirm.addEventListener('click', () => { handleConfirm(); restoreBtns(); });
  newCancel.addEventListener('click', () => { closeModal(); restoreBtns(); });

  function restoreBtns() {
    delete window.deleteAccCustomColumn;
    delete window.addAccCustomColumn;
  }
}

function handleAccountCellEdit(e) {
  const cell = e.target;
  const row = cell.closest('tr');
  const id = row.dataset.id;
  const field = cell.dataset.field;

  const colDef = state.accountColumns.find(c => c.id === field);
  let finalValue;
  if (colDef && colDef.type === 'text') {
    finalValue = cell.textContent.trim();
  } else {
    const rawValue = cell.textContent.replace(/[^\d.,-]/g, '').replace(',', '.');
    finalValue = parseFloat(rawValue) || 0;
  }

  const item = state.accountData.find(d => d.id === id);
  if (item) {
    item[field] = finalValue;
    recomputeAccountTotals();
    saveData();
    renderAccountsView();
    showToast('Valeur mise à jour', 'success');
  }
}

function recomputeAccountTotals() {
  state.accountData.forEach((e, idx) => {
    let totalActuel = 0;
    state.accountColumns.forEach(col => {
      if (col.id !== 'total' && col.id !== 'variation' && col.type === 'number') {
        totalActuel += (parseFloat(e[col.id]) || 0);
      }
    });
    e.total = totalActuel;
    
    if (idx > 0) {
      e.variation = e.total - state.accountData[idx - 1].total;
    } else {
      e.variation = 0;
    }
  });
}

function deleteAccountRow(id) {
  if (!confirm('Supprimer cette entrée ?')) return;
  state.accountData = state.accountData.filter(d => d.id !== id);
  recomputeAccountTotals();
  saveData();
  renderAccountsView();
  showToast('Entrée supprimée', 'info');
}

function showAddAccountModal() {
  const fields = state.accountColumns
    .filter(col => col.id !== 'total' && col.id !== 'variation')
    .map(col => ({ name: col.id, label: col.label, type: col.type }));

  showModal('Ajouter une entrée de compte', fields, (data) => {
    const newEntry = { id: crypto.randomUUID() };
    
    state.accountColumns.forEach(col => {
      if (col.id !== 'total' && col.id !== 'variation') {
        if (col.type === 'text') newEntry[col.id] = data[col.id] || '';
        else newEntry[col.id] = parseFloat(data[col.id]) || 0;
      }
    });

    state.accountData.push(newEntry);
    recomputeAccountTotals();
    saveData();
    renderAccountsView();
    showToast('Entrée ajoutée', 'success');
  });
}

function renderAccountDistChart() {
  const ctx = document.getElementById('accountDistChart');
  if (!ctx) return;
  if (state.charts.accountDist) state.charts.accountDist.destroy();

  const latest = state.accountData[state.accountData.length - 1];
  if (!latest) return;

  const { textColor } = getChartDefaults();

  const labels = state.accountData.map(d => d.semaine || d.date || '');

  const colors = ['#2eaadc', '#4daa57', '#6fcf97', '#cb912f', '#9b51e0', '#e03e3e', '#2d9cdb', '#f2c94c'];
  let colorIdx = 0;

  const datasets = state.accountColumns
    .filter(c => c.type === 'number' && c.id !== 'variation')
    .map(c => {
      const color = c.id === 'total' ? '#2eaadc' : colors[colorIdx++ % colors.length];
      const isTotal = c.id === 'total';
      return {
        label: c.label,
        data: state.accountData.map(d => parseFloat(d[c.id]) || 0),
        borderColor: color,
        backgroundColor: isTotal ? 'rgba(46,170,220,0.08)' : 'transparent',
        fill: isTotal,
        tension: 0.4,
        borderWidth: isTotal ? 2.5 : 1.5,
        pointRadius: isTotal ? 3 : 2,
        pointBackgroundColor: color
      };
    });

  state.charts.accountDist = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: textColor, font: { family: 'Inter', size: 12 }, usePointStyle: true, padding: 16 } },
        tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `${ctx.dataset.label}: ${currency(ctx.parsed.y)}` } },
      },
      scales: {
        x: { ticks: { color: textColor, font: { size: 10 }, maxTicksLimit: 10 }, grid: { display: false } },
        y: { ticks: { color: textColor, font: { size: 10 }, callback: v => (v/1000)+'k€' }, grid: { color: 'rgba(0,0,0,0.04)' } },
      },
    },
  });
}

// ==========================================
//  ANALYTICS & BILANS
// ==========================================
function initAnalyticsView() {
  const select = document.getElementById('analyticsYearSelect');
  if (!select) return;

  // Extract years from weeklyData
  const years = [...new Set(state.weeklyData.map(d => {
    // try to get year from "mois" (ex: "01/2026", "Janvier 2026")
    const match = d.mois?.match(/\d{4}/);
    return match ? match[0] : null;
  }).filter(Boolean))].sort((a,b) => b-a);
  
  const currentVal = select.value;
  select.innerHTML = '<option value="all">Toutes les années</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
  if (years.includes(currentVal) || currentVal === 'all') select.value = currentVal;
  
  // Set listener
  select.onchange = renderAnalyticsView;
  renderAnalyticsView();
}

function renderAnalyticsView() {
  const select = document.getElementById('analyticsYearSelect');
  if (!select) return;
  const year = select.value;
  
  const filtered = year === 'all' 
    ? state.weeklyData 
    : state.weeklyData.filter(d => (d.mois||'').includes(year));

  let totRev = 0, totDep = 0, totEp = 0;
  let sal = 0, autres = 0, fixes = 0, courses = 0, sorties = 0, achats = 0;

  filtered.forEach(r => {
    sal += parseFloat(r.salaire) || 0;
    autres += parseFloat(r.autres_revenus) || 0;
    fixes += parseFloat(r.depenses_fixes) || 0;
    courses += parseFloat(r.courses) || 0;
    sorties += parseFloat(r.sorties) || 0;
    achats += parseFloat(r.achats) || 0;
    totEp += parseFloat(r.epargne) || 0;
  });
  
  totRev = sal + autres;
  totDep = fixes + courses + sorties + achats;
  const rate = totRev > 0 ? (totEp / totRev) * 100 : 0;

  document.getElementById('analyticTotalIn').textContent = currency(totRev);
  document.getElementById('analyticTotalOut').textContent = currency(totDep);
  document.getElementById('analyticTotalSavings').textContent = currency(totEp);
  document.getElementById('analyticSavingsRate').textContent = rate.toFixed(1) + '%';
  
  renderAnalyticsMonthlyChart(filtered);
  renderSankeyChart(sal, autres, totRev, totEp, fixes, courses, sorties, achats);
}

function renderAnalyticsMonthlyChart(data) {
  const ctx = document.getElementById('analyticsMonthlyChart');
  if (!ctx) return;
  if (state.charts.analyticsMonthly) state.charts.analyticsMonthly.destroy();

  const { textColor } = getChartDefaults();

  state.charts.analyticsMonthly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.mois || 'Inconnu'),
      datasets: [
        { label: 'Revenus', data: data.map(d => parseFloat(d.total)||0), backgroundColor: '#2eaadc', borderRadius: 4 },
        { label: 'Dépenses', data: data.map(d => (parseFloat(d.depenses_fixes)||0)+(parseFloat(d.courses)||0)+(parseFloat(d.sorties)||0)+(parseFloat(d.achats)||0)), backgroundColor: '#e03e3e', borderRadius: 4 },
        { label: 'Épargne', data: data.map(d => parseFloat(d.epargne)||0), backgroundColor: '#4daa57', borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: textColor, font: { family: 'Inter' } } },
        tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', callbacks: { label: ctx => `${ctx.dataset.label}: ${currency(ctx.parsed.y)}` } }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor, callback: v => (v/1000)+'k€' }, grid: { color: 'rgba(0,0,0,0.05)' } }
      }
    }
  });
}

function renderSankeyChart(sal, aut, rev, ep, fix, cour, sort, ach) {
  const ctx = document.getElementById('sankeyChart');
  if (!ctx) return;
  if (state.charts.sankey) state.charts.sankey.destroy();

  const colors = {
    'Salaire': '#2d9cdb',
    'Autres': '#56ccf2',
    'Revenus': '#2eaadc',
    'Épargne': '#6fcf97',
    'Dépenses': '#eb5757',
    'Fixes': '#f2994a',
    'Courses': '#f2c94c',
    'Sorties': '#9b51e0',
    'Achats': '#bb6bd9'
  };

  const data = [
    { from: 'Salaire', to: 'Revenus', flow: sal },
    { from: 'Autres', to: 'Revenus', flow: aut },
    { from: 'Revenus', to: 'Épargne', flow: ep },
    { from: 'Revenus', to: 'Dépenses', flow: fix + cour + sort + ach },
    { from: 'Dépenses', to: 'Fixes', flow: fix },
    { from: 'Dépenses', to: 'Courses', flow: cour },
    { from: 'Dépenses', to: 'Sorties', flow: sort },
    { from: 'Dépenses', to: 'Achats', flow: ach }
  ].filter(d => d.flow > 0);

  if (data.length === 0) return;

  state.charts.sankey = new Chart(ctx, {
    type: 'sankey',
    data: {
      datasets: [{
        label: 'Flux Financier',
        data,
        colorFrom: c => colors[c.dataset.data[c.dataIndex].from] || '#999',
        colorTo: c => colors[c.dataset.data[c.dataIndex].to] || '#999',
        colorMode: 'gradient',
        labels: {
          'Salaire': 'Salaire', 'Autres': 'Autres revenus', 'Revenus': 'Revenus Totaux',
          'Épargne': 'Épargne', 'Dépenses': 'Dépenses', 'Fixes': 'Dép. Fixes',
          'Courses': 'Courses', 'Sorties': 'Sorties', 'Achats': 'Achats'
        },
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          callbacks: {
            label: (ctx) => {
              const item = ctx.raw;
              return `${item.from} → ${item.to}: ${currency(item.flow)}`;
            }
          }
        }
      }
    }
  });
}

// ==========================================
//  PROJECTIONS
// ==========================================
function initProjections() {
  document.getElementById('runProjection')?.addEventListener('click', runProjection);
  initPatrimonyEstimation();
}

function runProjection() {
  const years = parseInt(document.getElementById('projYears').value) || 5;
  const rate = parseFloat(document.getElementById('projRate').value) || 7;
  const monthly = parseFloat(document.getElementById('projMonthly').value) || 500;
  const initial = parseFloat(document.getElementById('projInitial').value) || 50000;

  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  const labels = [];
  const data = [];
  const contributionData = [];
  const interestData = [];

  let balance = initial;
  let totalContributions = initial;

  for (let m = 0; m <= months; m++) {
    if (m % 3 === 0 || m === months) { // Quarterly labels
      labels.push(m === 0 ? 'Début' : `${Math.floor(m/12)}a ${m%12}m`);
      data.push(Math.round(balance));
      contributionData.push(Math.round(totalContributions));
      interestData.push(Math.round(balance - totalContributions));
    }
    if (m < months) {
      balance = balance * (1 + monthlyRate) + monthly;
      totalContributions += monthly;
    }
  }

  // Render chart
  const ctx = document.getElementById('projectionChart');
  if (!ctx) return;
  if (state.charts.projection) state.charts.projection.destroy();

  const { gridColor, textColor } = getChartDefaults();

  state.charts.projection = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Valeur totale',
          data,
          borderColor: '#2eaadc',
          backgroundColor: 'rgba(46,170,220,0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          pointRadius: 2,
          pointHoverRadius: 6,
        },
        {
          label: 'Contributions',
          data: contributionData,
          borderColor: '#4daa57',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
          fill: false,
        },
        {
          label: 'Intérêts composés',
          data: interestData,
          borderColor: '#cb912f',
          backgroundColor: 'rgba(203,145,47,0.08)',
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: textColor, font: { family: 'Inter', size: 12 }, usePointStyle: true, padding: 16 } },
        tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8, callbacks: { label: ctx => `${ctx.dataset.label}: ${currency(ctx.parsed.y)}` } },
      },
      scales: {
        x: { ticks: { color: textColor, font: { size: 10 }, maxTicksLimit: 15 }, grid: { color: gridColor } },
        y: { ticks: { color: textColor, font: { size: 10 }, callback: v => currency(v) }, grid: { color: gridColor } },
      },
    },
  });

  // Results
  const finalBalance = data[data.length - 1];
  const totalContrib = contributionData[contributionData.length - 1];
  const totalInterest = interestData[interestData.length - 1];
  const roi = ((finalBalance - initial) / initial * 100).toFixed(1);

  document.getElementById('projectionResults').innerHTML = `
    <div class="projection-stat">
      <div class="label">💰 Valeur Finale</div>
      <div class="value">${currency(finalBalance)}</div>
    </div>
    <div class="projection-stat">
      <div class="label">📥 Total Contributions</div>
      <div class="value">${currency(totalContrib)}</div>
    </div>
    <div class="projection-stat">
      <div class="label">📈 Intérêts Gagnés</div>
      <div class="value" style="color:var(--success)">${currency(totalInterest)}</div>
    </div>
    <div class="projection-stat">
      <div class="label">📊 ROI Total</div>
      <div class="value" style="color:var(--accent)">${roi}%</div>
    </div>
    <div class="projection-stat">
      <div class="label">⏳ Horizon</div>
      <div class="value">${years} ans</div>
    </div>
    <div class="projection-stat">
      <div class="label">📉 Taux Annuel</div>
      <div class="value">${rate}%</div>
    </div>
  `;
}

// ==========================================
//  PATRIMONY ESTIMATION (data-driven)
// ==========================================

function initPatrimonyEstimation() {
  // Populate start selector
  const select = document.getElementById('patriStartSelect');
  if (select) {
    const validData = state.accountData.filter(d => d.total && parseFloat(d.total) > 0);
    select.innerHTML = validData.map((d, i) => {
      const hasDate = d.date && !isNaN(new Date(d.date).getTime());
      const dateStr = hasDate
        ? ` — ${new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : '';
      const label = `S${d.semaine || i + 1}${dateStr} (${currency(parseFloat(d.total))})`;
      return `<option value="${i}">${label}</option>`;
    }).join('');
  }

  document.getElementById('runPatrimonyEstimation')?.addEventListener('click', runPatrimonyEstimation);
}

function runPatrimonyEstimation() {
  const startIdx = parseInt(document.getElementById('patriStartSelect')?.value) || 0;

  const allValid = state.accountData
    .filter(d => d.total && parseFloat(d.total) > 0)
    .map((d, i) => ({
      index: i,
      total: parseFloat(d.total) || 0,
      date: d.date || '',
      semaine: d.semaine || '',
      label: d.semaine ? `S${d.semaine}` : `#${i + 1}`,
    }));

  const accountHistory = allValid.slice(startIdx);

  if (accountHistory.length < 2) {
    showToast('Pas assez de données à partir de ce point (minimum 2 entrées)', 'error');
    return;
  }

  const n = accountHistory.length;
  const currentPatrimony = accountHistory[n - 1].total;

  function isValidDate(str) {
    if (!str) return false;
    const d = new Date(str);
    return !isNaN(d.getTime());
  }

  const allDatesValid = accountHistory.every(d => isValidDate(d.date));

  let daysFromStart;
  let totalDaysSpan;

  if (allDatesValid) {
    const firstDate = new Date(accountHistory[0].date);
    daysFromStart = accountHistory.map(d => (new Date(d.date) - firstDate) / (1000 * 60 * 60 * 24));
    totalDaysSpan = daysFromStart[n - 1];
  } else {
    daysFromStart = accountHistory.map((_, i) => i * 7);
    totalDaysSpan = (n - 1) * 7;
  }

  if (totalDaysSpan === 0) totalDaysSpan = 7;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const x = daysFromStart[i];
    const y = accountHistory[i].total;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }
  const denom = n * sumX2 - sumX * sumX;
  const slopePerDay = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;

  // ─── Growth metrics (simple & intuitive) ───
  const startPatrimony = accountHistory[0].total;
  const totalChange = currentPatrimony - startPatrimony;
  const monthsElapsed = totalDaysSpan / 30.44;
  const avgMonthlyGrowth = monthsElapsed > 0 ? totalChange / monthsElapsed : 0;

  // CAGR = (end/start)^(365/days) - 1
  let annualGrowthRate = 0;
  if (startPatrimony > 0 && totalDaysSpan > 0) {
    annualGrowthRate = (Math.pow(currentPatrimony / startPatrimony, 365.25 / totalDaysSpan) - 1) * 100;
  }

  const intercept = (sumY - slopePerDay * sumX) / n;
  let sumResiduals2 = 0;
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slopePerDay * daysFromStart[i];
    sumResiduals2 += (accountHistory[i].total - predicted) ** 2;
  }
  const residualStd = n > 2 ? Math.sqrt(sumResiduals2 / (n - 2)) : 0;

  const savingsData = state.weeklyData.filter(d => d.epargne && parseFloat(d.epargne) > 0);
  const avgMonthlySavings = savingsData.length > 0
    ? savingsData.reduce((s, d) => s + (parseFloat(d.epargne) || 0), 0) / savingsData.length
    : 0;

  const projMonths = 60;
  const historicalLabels = accountHistory.map(d => d.label);
  const historicalData = accountHistory.map(d => d.total);

  const projectedLabels = [];
  const projectedTrend = [];
  const projectedOptimistic = [];
  const projectedPessimistic = [];

  const lastEntry = accountHistory[n - 1];
  const baseDate = isValidDate(lastEntry.date) ? new Date(lastEntry.date) : new Date();

  for (let m = 0; m <= projMonths; m++) {
    const futureDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + m, 1);
    const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const label = `${monthNames[futureDate.getMonth()]} ${String(futureDate.getFullYear()).slice(2)}`;
    projectedLabels.push(label);

    const daysAhead = m * 30.44;
    const predicted = currentPatrimony + slopePerDay * daysAhead;
    const uncertainty = residualStd * Math.sqrt(1 + daysAhead / totalDaysSpan) * 1.5;

    projectedTrend.push(Math.round(predicted));
    projectedOptimistic.push(Math.round(predicted + uncertainty));
    projectedPessimistic.push(Math.max(0, Math.round(predicted - uncertainty)));
  }

  const est1Y = projectedTrend[Math.min(12, projectedTrend.length - 1)];
  const est5Y = projectedTrend[projectedTrend.length - 1];

  document.getElementById('patriCurrent').textContent = currency(currentPatrimony);

  const growthEl = document.getElementById('patriMonthlyGrowth');
  growthEl.textContent = (avgMonthlyGrowth >= 0 ? '+' : '') + currency(avgMonthlyGrowth);
  growthEl.style.color = avgMonthlyGrowth >= 0 ? 'var(--success)' : 'var(--danger)';

  const rateEl = document.getElementById('patriAnnualRate');
  rateEl.textContent = (annualGrowthRate >= 0 ? '+' : '') + annualGrowthRate.toFixed(1) + '%';
  rateEl.style.color = annualGrowthRate >= 0 ? 'var(--success)' : 'var(--danger)';

  document.getElementById('patriMonthlySavings').textContent = currency(avgMonthlySavings);

  const est1El = document.getElementById('patriEst1Y');
  est1El.textContent = currency(est1Y);
  est1El.style.color = est1Y > currentPatrimony ? 'var(--success)' : 'var(--danger)';

  const est5El = document.getElementById('patriEst5Y');
  est5El.textContent = currency(est5Y);
  est5El.style.color = est5Y > currentPatrimony ? 'var(--success)' : 'var(--danger)';

  renderPatrimonyChart(historicalLabels, historicalData, projectedLabels, projectedTrend, projectedOptimistic, projectedPessimistic);

  renderPatrimonyMilestones(currentPatrimony, avgMonthlyGrowth, baseDate);

  const projInitialEl = document.getElementById('projInitial');
  const projMonthlyEl = document.getElementById('projMonthly');
  if (projInitialEl) projInitialEl.value = Math.round(currentPatrimony);
  if (projMonthlyEl && avgMonthlySavings > 0) projMonthlyEl.value = Math.round(avgMonthlySavings);

  showToast('Estimation calculée à partir de vos données réelles', 'success');
}

function renderPatrimonyChart(histLabels, histData, projLabels, projTrend, projOpt, projPess) {
  const ctx = document.getElementById('patrimonyChart');
  if (!ctx) return;
  if (state.charts.patrimony) state.charts.patrimony.destroy();
  const { gridColor, textColor } = getChartDefaults();

  // Combine labels: historical + projected
  const allLabels = [...histLabels, ...projLabels];

  // Historical line (only over historical range, null for projection range)
  const histLine = [...histData, ...new Array(projLabels.length).fill(null)];

  // Projected lines (null over historical range, values for projection range)
  const pad = new Array(histLabels.length).fill(null);
  // Connect the last historical point to the first projected point
  pad[pad.length - 1] = histData[histData.length - 1];
  const trendLine = [...pad.map((v, i) => i === pad.length - 1 ? v : null), ...projTrend];
  const optLine = [...pad.map((v, i) => i === pad.length - 1 ? v : null), ...projOpt];
  const pessLine = [...pad.map((v, i) => i === pad.length - 1 ? v : null), ...projPess];

  state.charts.patrimony = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allLabels,
      datasets: [
        {
          label: 'Historique',
          data: histLine,
          borderColor: '#2eaadc',
          backgroundColor: 'rgba(46,170,220,0.08)',
          fill: true,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#2eaadc',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.3,
          spanGaps: false,
        },
        {
          label: 'Tendance estimée',
          data: trendLine,
          borderColor: '#4daa57',
          borderWidth: 2.5,
          borderDash: [8, 4],
          pointRadius: 0,
          tension: 0.2,
          fill: false,
          spanGaps: false,
        },
        {
          label: 'Scénario optimiste',
          data: optLine,
          borderColor: 'rgba(77,170,87,0.3)',
          backgroundColor: 'rgba(77,170,87,0.06)',
          fill: '+1',
          borderWidth: 0,
          pointRadius: 0,
          tension: 0.2,
          spanGaps: false,
        },
        {
          label: 'Scénario pessimiste',
          data: pessLine,
          borderColor: 'rgba(224,62,62,0.3)',
          backgroundColor: 'rgba(224,62,62,0.04)',
          fill: false,
          borderWidth: 0,
          pointRadius: 0,
          tension: 0.2,
          spanGaps: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: textColor, font: { family: 'Inter', size: 11 }, usePointStyle: true, padding: 14 },
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => ctx.parsed.y != null ? `${ctx.dataset.label}: ${currency(ctx.parsed.y)}` : '' },
          filter: item => item.parsed.y != null,
        },
      },
      scales: {
        x: { ticks: { color: textColor, font: { size: 10 }, maxTicksLimit: 18 }, grid: { display: false } },
        y: { ticks: { color: textColor, font: { size: 10 }, callback: v => currency(v) }, grid: { color: gridColor } },
      },
    },
  });
}

function renderPatrimonyMilestones(current, monthlyGrowth, now) {
  const container = document.getElementById('patrimonyMilestones');
  if (!container) return;

  if (monthlyGrowth <= 0) {
    container.innerHTML = '<p class="placeholder-text" style="color:var(--warning);">⚠ Votre patrimoine est en baisse. Impossible de calculer des objectifs de progression.</p>';
    return;
  }

  const targets = [20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000, 200000, 500000];
  const milestones = [];

  for (const target of targets) {
    if (target <= current * 0.8) continue; // Skip milestones well below current

    const monthsToReach = (target - current) / monthlyGrowth;
    const reachedDate = new Date(now);
    reachedDate.setMonth(reachedDate.getMonth() + Math.ceil(monthsToReach));

    const isReached = current >= target;
    milestones.push({
      target,
      isReached,
      months: Math.ceil(monthsToReach),
      date: reachedDate,
    });

    if (milestones.length >= 6) break;
  }

  container.innerHTML = `
    <h3><i data-lucide="flag" style="width:16px;height:16px;"></i> Objectifs patrimoniaux</h3>
    <div class="milestone-timeline">
      ${milestones.map(m => {
        const dotClass = m.isReached ? 'reached' : 'future';
        const dateStr = m.isReached
          ? '✓ Atteint'
          : `${m.date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} (~${m.months} mois)`;
        return `
          <div class="milestone-item">
            <div class="milestone-dot ${dotClass}"></div>
            <div class="milestone-content">
              <span class="milestone-label">${currency(m.target)}</span>
              <span class="milestone-date">${dateStr}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  lucide.createIcons({ root: container });
}


// ==========================================
//  PHASE 3.1 — OBJECTIFS FINANCIERS
// ==========================================
let goalsInitialized = false;

function initGoalsView() {
  renderGoals();
  if (goalsInitialized) return;
  goalsInitialized = true;
  const btn = document.getElementById('addGoalBtn');
  if (btn) btn.onclick = showAddGoalModal;
}

function getGoals() {
  try {
    return JSON.parse(localStorage.getItem('ft_goals')) || [];
  } catch { return []; }
}

function saveGoals(goals) {
  localStorage.setItem('ft_goals', JSON.stringify(goals));
}

function renderGoals() {
  const goals = getGoals();
  const container = document.getElementById('goalsContainer');
  if (!container) return;

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  // Summary cards
  const totalSaved = goals.reduce((s, g) => s + (g.saved || 0), 0);
  const totalRemaining = activeGoals.reduce((s, g) => s + Math.max(0, g.target - (g.saved || 0)), 0);
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('goalsActiveCount', activeGoals.length);
  el('goalsCompletedCount', completedGoals.length);
  el('goalsTotalSaved', currency(totalSaved));
  el('goalsTotalRemaining', currency(totalRemaining));

  if (goals.length === 0) {
    container.innerHTML = '<p class="placeholder-text">Ajoutez votre premier objectif financier pour commencer le suivi.</p>';
    return;
  }

  // Compute monthly savings rate for ETA
  const wd = state.weeklyData;
  let monthlySavings = 0;
  if (wd.length >= 2) {
    const totalEpargne = wd.reduce((s, r) => s + (parseFloat(r.epargne) || 0), 0);
    monthlySavings = totalEpargne / wd.length * 4.33;
  }

  container.innerHTML = goals.map(g => {
    const pct = g.target > 0 ? Math.min(100, ((g.saved || 0) / g.target) * 100) : 0;
    const remaining = Math.max(0, g.target - (g.saved || 0));
    let etaStr = '—';
    if (!g.completed && monthlySavings > 0 && remaining > 0) {
      const monthsLeft = remaining / monthlySavings;
      if (monthsLeft < 1) etaStr = '< 1 mois';
      else if (monthsLeft < 12) etaStr = `~${Math.ceil(monthsLeft)} mois`;
      else etaStr = `~${(monthsLeft / 12).toFixed(1)} ans`;
    } else if (g.completed) {
      etaStr = '✓ Atteint';
    }

    const iconMap = { epargne: 'piggy-bank', voyage: 'plane', tech: 'laptop', immobilier: 'home', voiture: 'car', autre: 'target' };
    const icon = iconMap[g.category] || 'target';
    const statusClass = g.completed ? 'goal-completed' : (pct >= 75 ? 'goal-near' : '');

    return `
      <div class="goal-card ${statusClass}" data-id="${g.id}" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <i data-lucide="${icon}" style="width:20px; height:20px; color:var(--accent);"></i>
            <strong style="font-size:15px;">${g.name}</strong>
            <span style="font-size:11px; background:var(--bg-tertiary); padding:2px 8px; border-radius:10px; color:var(--text-secondary);">${g.category || 'autre'}</span>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="row-action-btn" onclick="editGoalSaved('${g.id}')" title="Mettre à jour"><i data-lucide="edit-3" style="width:14px;height:14px;pointer-events:none;"></i></button>
            <button class="row-action-btn" onclick="deleteGoal('${g.id}')" title="Supprimer"><i data-lucide="trash-2" style="width:14px;height:14px;pointer-events:none;"></i></button>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text-secondary); margin-bottom:6px;">
          <span>${currency(g.saved || 0)} / ${currency(g.target)}</span>
          <span>${pct.toFixed(0)}% — ETA: ${etaStr}</span>
        </div>
        <div style="background:var(--bg-tertiary); border-radius:6px; height:10px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background:${g.completed ? 'var(--success)' : 'linear-gradient(90deg, var(--accent), #5ac8fa)'}; border-radius:6px; transition:width 0.5s ease;"></div>
        </div>
      </div>`;
  }).join('');

  lucide.createIcons({ root: container });
}

function showAddGoalModal() {
  showModal('Nouvel Objectif Financier', [
    { id: 'goalName', label: 'Nom', type: 'text', placeholder: 'Ex: Épargne de précaution' },
    { id: 'goalTarget', label: 'Montant cible (€)', type: 'number', value: 5000 },
    { id: 'goalSaved', label: 'Déjà épargné (€)', type: 'number', value: 0 },
    { id: 'goalCategory', label: 'Catégorie', type: 'select', options: [
      { value: 'epargne', label: 'Épargne' },
      { value: 'voyage', label: 'Voyage' },
      { value: 'tech', label: 'Tech / Électronique' },
      { value: 'immobilier', label: 'Immobilier' },
      { value: 'voiture', label: 'Voiture' },
      { value: 'autre', label: 'Autre' },
    ]},
  ], () => {
    const name = document.getElementById('goalName')?.value?.trim();
    const target = parseFloat(document.getElementById('goalTarget')?.value) || 0;
    const saved = parseFloat(document.getElementById('goalSaved')?.value) || 0;
    const category = document.getElementById('goalCategory')?.value || 'autre';
    if (!name || target <= 0) { showToast('Nom et montant requis', 'error'); return; }
    const goals = getGoals();
    goals.push({ id: crypto.randomUUID(), name, target, saved, category, completed: saved >= target, createdAt: new Date().toISOString() });
    saveGoals(goals);
    renderGoals();
    closeModal();
    showToast(`Objectif "${name}" ajouté !`, 'success');
  });
}

window.editGoalSaved = function(id) {
  const goals = getGoals();
  const goal = goals.find(g => g.id === id);
  if (!goal) return;
  const newVal = prompt(`Montant épargné pour "${goal.name}" :`, goal.saved);
  if (newVal === null) return;
  goal.saved = parseFloat(newVal) || 0;
  goal.completed = goal.saved >= goal.target;
  saveGoals(goals);
  renderGoals();
  if (goal.completed) showToast(`🎉 Objectif "${goal.name}" atteint !`, 'success');
};

window.deleteGoal = function(id) {
  if (!confirm('Supprimer cet objectif ?')) return;
  const goals = getGoals().filter(g => g.id !== id);
  saveGoals(goals);
  renderGoals();
  showToast('Objectif supprimé', 'info');
};

// ==========================================
//  PHASE 3.2 — ALLOCATION DONUT CHART
// ==========================================
function renderAllocationDonut() {
  const latest = state.accountData[state.accountData.length - 1];
  if (!latest) return;
  const canvas = document.getElementById('allocationDonutChart');
  if (!canvas) return;

  const accountKeys = state.accountColumns
    .filter(c => c.id !== 'semaine' && c.id !== 'total' && c.id !== 'variation' && c.id !== 'date')
    .map(c => ({ id: c.id, label: c.label.replace(' (€)', '') }));

  const values = accountKeys.map(a => parseFloat(latest[a.id]) || 0);
  const labels = accountKeys.map(a => a.label);
  const total = values.reduce((s, v) => s + v, 0);

  const colors = ['#2eaadc', '#4daa57', '#cb912f', '#e03e3e', '#9b59b6', '#1abc9c', '#e67e22', '#3498db', '#e74c3c'];
  const defaults = getChartDefaults();

  if (state.charts.allocationDonut) state.charts.allocationDonut.destroy();
  state.charts.allocationDonut = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderWidth: 2,
        borderColor: defaults.bgCard,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { color: defaults.textColor, font: { size: 11 }, padding: 12 } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw;
              const p = total > 0 ? ((v / total) * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${currency(v)} (${p}%)`;
            }
          }
        }
      }
    }
  });
}

// ==========================================
//  PHASE 3.3 — SMART ALERTS
// ==========================================
function checkAlerts() {
  const alerts = [];
  const wd = state.weeklyData;

  // Alert: reste à vivre < 100€
  if (wd.length > 0) {
    const lastReste = parseFloat(wd[wd.length - 1].reste) || 0;
    if (lastReste < 100) alerts.push({ type: 'danger', msg: `⚠️ Reste à vivre très bas : ${currency(lastReste)}` });
  }

  // Alert: budget exceeded
  if (state.budgetLimits && wd.length > 0) {
    const lastRow = wd[wd.length - 1];
    const cats = [
      { id: 'depenses_fixes', label: 'Dépenses fixes' },
      { id: 'courses', label: 'Courses' },
      { id: 'sorties', label: 'Sorties' },
      { id: 'achats', label: 'Achats' },
    ];
    cats.forEach(cat => {
      const spent = parseFloat(lastRow[cat.id]) || 0;
      const limit = parseFloat(state.budgetLimits[cat.id]) || 0;
      if (limit > 0 && spent > limit) {
        alerts.push({ type: 'warning', msg: `📊 ${cat.label} dépasse le budget : ${currency(spent)} / ${currency(limit)}` });
      }
    });
  }

  // Alert: patrimony declining 2 consecutive weeks
  if (state.accountData.length >= 3) {
    const last3 = state.accountData.slice(-3);
    if (last3[2].total < last3[1].total && last3[1].total < last3[0].total) {
      alerts.push({ type: 'warning', msg: '📉 Patrimoine en baisse 2 semaines consécutives' });
    }
  }

  // Alert: goal near completion
  const goals = getGoals();
  goals.filter(g => !g.completed).forEach(g => {
    const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
    if (pct >= 90) alerts.push({ type: 'success', msg: `🎯 Objectif "${g.name}" presque atteint (${pct.toFixed(0)}%) !` });
  });

  // Update badge
  const badge = document.getElementById('alertBadge');
  if (badge) {
    badge.textContent = alerts.length;
    badge.style.display = alerts.length > 0 ? 'block' : 'none';
  }

  // Bell click handler
  const bell = document.getElementById('alertBellBtn');
  if (bell) bell.onclick = () => {
    if (alerts.length === 0) { showToast('Aucune alerte', 'info'); return; }
    const body = alerts.map(a => `<div style="padding:8px 0; border-bottom:1px solid var(--border-color); font-size:13px; color:var(--text-${a.type === 'danger' ? 'primary' : 'secondary'})">${a.msg}</div>`).join('');
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = `Alertes (${alerts.length})`;
    if (modalBody) modalBody.innerHTML = body;
    document.getElementById('modalOverlay')?.classList.add('active');
    document.getElementById('modalConfirm').style.display = 'none';
  };

  return alerts;
}

// ==========================================
//  PHASE 3.4 — MONTH COMPARISON
// ==========================================
function initMonthComparison() {
  const sel1 = document.getElementById('compareMonth1');
  const sel2 = document.getElementById('compareMonth2');
  if (!sel1 || !sel2) return;

  // Get unique months from weeklyData
  const months = [...new Set(state.weeklyData.map(r => r.mois).filter(Boolean))];
  if (months.length < 2) return;

  [sel1, sel2].forEach(sel => {
    sel.innerHTML = months.map(m => `<option value="${m}">${m}</option>`).join('');
  });
  if (months.length >= 2) sel2.value = months[months.length - 1];
  if (months.length >= 2 && sel1.value === sel2.value) sel1.value = months[months.length - 2] || months[0];

  const btn = document.getElementById('runComparisonBtn');
  if (btn) btn.onclick = runComparison;
}

function runComparison() {
  const m1 = document.getElementById('compareMonth1')?.value;
  const m2 = document.getElementById('compareMonth2')?.value;
  const container = document.getElementById('comparisonResult');
  if (!m1 || !m2 || !container) return;

  const getMonthData = (month) => {
    const rows = state.weeklyData.filter(r => r.mois === month);
    if (rows.length === 0) return null;
    return {
      revenu: rows.reduce((s, r) => s + (parseFloat(r.total) || 0), 0),
      epargne: rows.reduce((s, r) => s + (parseFloat(r.epargne) || 0), 0),
      depenses: rows.reduce((s, r) => s + computeExpenses(r), 0),
      reste: rows.reduce((s, r) => s + (parseFloat(r.reste) || 0), 0),
      fixes: rows.reduce((s, r) => s + (parseFloat(r.depenses_fixes) || 0), 0),
      courses: rows.reduce((s, r) => s + (parseFloat(r.courses) || 0), 0),
      sorties: rows.reduce((s, r) => s + (parseFloat(r.sorties) || 0), 0),
      achats: rows.reduce((s, r) => s + (parseFloat(r.achats) || 0), 0),
    };
  };

  const d1 = getMonthData(m1);
  const d2 = getMonthData(m2);
  if (!d1 || !d2) { container.innerHTML = '<p class="placeholder-text">Données insuffisantes pour la comparaison.</p>'; return; }

  const diffRow = (label, v1, v2, invert = false) => {
    const diff = v2 - v1;
    const pctDiff = v1 !== 0 ? ((diff / Math.abs(v1)) * 100).toFixed(1) : '—';
    const isGood = invert ? diff < 0 : diff >= 0;
    const color = diff === 0 ? 'var(--text-secondary)' : (isGood ? 'var(--success)' : 'var(--danger)');
    return `<tr>
      <td style="font-weight:500; padding:8px 12px;">${label}</td>
      <td style="padding:8px 12px; text-align:right; font-variant-numeric:tabular-nums;">${currency(v1)}</td>
      <td style="padding:8px 12px; text-align:right; font-variant-numeric:tabular-nums;">${currency(v2)}</td>
      <td style="padding:8px 12px; text-align:right; color:${color}; font-weight:600;">${diff > 0 ? '+' : ''}${currency(diff)} (${diff > 0 ? '+' : ''}${pctDiff}%)</td>
    </tr>`;
  };

  container.innerHTML = `
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead><tr style="border-bottom:2px solid var(--border-color);">
        <th style="text-align:left; padding:8px 12px; color:var(--text-secondary);">Catégorie</th>
        <th style="text-align:right; padding:8px 12px; color:var(--text-secondary);">${m1}</th>
        <th style="text-align:right; padding:8px 12px; color:var(--text-secondary);">${m2}</th>
        <th style="text-align:right; padding:8px 12px; color:var(--text-secondary);">Variation</th>
      </tr></thead>
      <tbody style="line-height:1.6;">
        ${diffRow('💰 Revenus', d1.revenu, d2.revenu)}
        ${diffRow('💎 Épargne', d1.epargne, d2.epargne)}
        ${diffRow('📊 Dépenses totales', d1.depenses, d2.depenses, true)}
        ${diffRow('🏠 Dépenses fixes', d1.fixes, d2.fixes, true)}
        ${diffRow('🛒 Courses', d1.courses, d2.courses, true)}
        ${diffRow('🎭 Sorties', d1.sorties, d2.sorties, true)}
        ${diffRow('🛍️ Achats', d1.achats, d2.achats, true)}
        ${diffRow('✅ Reste', d1.reste, d2.reste)}
      </tbody>
    </table>
  `;
}

// ==========================================
//  PHASE 3.5 — RECURRING EXPENSES
// ==========================================
function getRecurrences() {
  try { return JSON.parse(localStorage.getItem('ft_recurrences')) || []; }
  catch { return []; }
}

function saveRecurrences(list) {
  localStorage.setItem('ft_recurrences', JSON.stringify(list));
}

function applyRecurrences(row) {
  const recurrences = getRecurrences();
  recurrences.forEach(r => {
    if (row[r.field] === undefined || row[r.field] === '' || row[r.field] === 0) {
      row[r.field] = r.amount;
    }
  });
  return row;
}
// ==========================================
//  HEALTH SCORE — Score de santé financière /100
// ==========================================
function renderHealthScore() {
  const wd = state.weeklyData;
  const ad = state.accountData;
  if (wd.length === 0) return;

  // ─── 1. Taux d'épargne (0-25 pts) ───
  const totalRevenu = wd.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
  const totalEpargne = wd.reduce((s, r) => s + (parseFloat(r.epargne) || 0), 0);
  const savingsRate = totalRevenu > 0 ? (totalEpargne / totalRevenu) * 100 : 0;
  // 20%+ = 25pts, 10-20% = linear, <10% = low
  const savingsScore = Math.min(25, Math.round((savingsRate / 20) * 25));

  // ─── 2. Ratio dépenses/revenus (0-25 pts) ───
  const totalDepenses = wd.reduce((s, r) => s + computeExpenses(r), 0);
  const expenseRatio = totalRevenu > 0 ? (totalDepenses / totalRevenu) * 100 : 100;
  // <50% = 25pts, 50-80% = linear, >80% = low
  const expenseScore = Math.min(25, Math.max(0, Math.round(((100 - expenseRatio) / 50) * 25)));

  // ─── 3. Tendance patrimoine (0-20 pts) ───
  let trendScore = 10; // neutral
  if (ad.length >= 3) {
    const recent = ad.slice(-3);
    const t0 = parseFloat(recent[0].total) || 0;
    const t2 = parseFloat(recent[2].total) || 0;
    if (t0 > 0) {
      const growth = ((t2 - t0) / t0) * 100;
      trendScore = Math.min(20, Math.max(0, Math.round(10 + growth)));
    }
  }

  // ─── 4. Reste à vivre (0-15 pts) ───
  const lastReste = wd.length > 0 ? (parseFloat(wd[wd.length - 1].reste) || 0) : 0;
  const resteScore = lastReste >= 500 ? 15 : lastReste >= 200 ? 10 : lastReste >= 0 ? 5 : 0;

  // ─── 5. Objectifs actifs (0-15 pts) ───
  const goals = getGoals();
  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);
  let goalsScore = 0;
  if (goals.length === 0) goalsScore = 5; // neutral if no goals set
  else {
    const completionRate = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;
    goalsScore = Math.min(15, Math.round((completionRate / 100) * 15));
    if (activeGoals.length > 0) goalsScore += 3; // bonus for having active goals
    goalsScore = Math.min(15, goalsScore);
  }

  const totalScore = savingsScore + expenseScore + trendScore + resteScore + goalsScore;

  // ─── Animate gauge ───
  const arc = document.getElementById('gaugeArc');
  const valueEl = document.getElementById('healthScoreValue');
  const labelEl = document.getElementById('healthScoreLabel');
  if (!arc || !valueEl) return;

  const maxDash = 251; // approximate half-circle arc length
  const offset = maxDash - (totalScore / 100) * maxDash;
  arc.style.transition = 'stroke-dashoffset 1.5s ease-out';
  arc.setAttribute('stroke-dashoffset', offset);

  // Animate counter
  let current = 0;
  const step = totalScore / 40;
  const interval = setInterval(() => {
    current = Math.min(current + step, totalScore);
    valueEl.textContent = Math.round(current);
    if (current >= totalScore) clearInterval(interval);
  }, 30);

  // Label
  let label = 'Critique 🔴';
  if (totalScore >= 80) label = 'Excellent 🟢';
  else if (totalScore >= 60) label = 'Bon 🟡';
  else if (totalScore >= 40) label = 'Passable 🟠';
  if (labelEl) labelEl.textContent = label;

  // Breakdown
  const breakdown = document.getElementById('healthBreakdown');
  if (breakdown) {
    const rows = [
      { label: 'Taux d\'épargne', score: savingsScore, max: 25, detail: `${savingsRate.toFixed(1)}%` },
      { label: 'Ratio dépenses', score: expenseScore, max: 25, detail: `${expenseRatio.toFixed(1)}%` },
      { label: 'Tendance patrimoine', score: trendScore, max: 20, detail: trendScore >= 12 ? '📈' : trendScore >= 8 ? '➡️' : '📉' },
      { label: 'Reste à vivre', score: resteScore, max: 15, detail: currency(lastReste) },
      { label: 'Objectifs', score: goalsScore, max: 15, detail: `${completedGoals.length}/${goals.length}` },
    ];
    breakdown.innerHTML = rows.map(r => {
      const pct = (r.score / r.max) * 100;
      const barColor = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
      return `<div class="health-row">
        <span class="health-row-label">${r.label}</span>
        <div class="health-row-bar"><div style="width:${pct}%; background:${barColor}; height:100%; border-radius:3px; transition:width 1s ease;"></div></div>
        <span class="health-row-score">${r.score}/${r.max}</span>
        <span class="health-row-detail">${r.detail}</span>
      </div>`;
    }).join('');
  }
}

// ==========================================
//  SAVINGS RATE CHART — Taux d'épargne /mois
// ==========================================
function renderSavingsRateChart() {
  const wd = state.weeklyData;
  if (wd.length === 0) return;
  const canvas = document.getElementById('savingsRateChart');
  if (!canvas) return;

  // Group by month
  const monthMap = {};
  wd.forEach(r => {
    const key = r.mois || 'Inconnu';
    if (!monthMap[key]) monthMap[key] = { epargne: 0, total: 0 };
    monthMap[key].epargne += (parseFloat(r.epargne) || 0);
    monthMap[key].total += (parseFloat(r.total) || 0);
  });

  const labels = Object.keys(monthMap);
  const rates = labels.map(m => {
    const d = monthMap[m];
    return d.total > 0 ? Math.round((d.epargne / d.total) * 100) : 0;
  });

  const defaults = getChartDefaults();
  const avgRate = rates.length > 0 ? rates.reduce((s, v) => s + v, 0) / rates.length : 0;

  if (state.charts.savingsRate) state.charts.savingsRate.destroy();
  state.charts.savingsRate = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Taux d\'épargne (%)',
          data: rates,
          borderColor: '#4daa57',
          backgroundColor: 'rgba(77, 170, 87, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 7,
          borderWidth: 2.5,
        },
        {
          label: `Moyenne (${avgRate.toFixed(1)}%)`,
          data: labels.map(() => avgRate),
          borderColor: 'rgba(203, 145, 47, 0.6)',
          borderDash: [8, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: defaults.textColor, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}%`
          }
        }
      },
      scales: {
        x: { ticks: { color: defaults.textColor, font: { size: 10 } }, grid: { color: defaults.gridColor } },
        y: {
          ticks: { color: defaults.textColor, callback: (v) => v + '%' },
          grid: { color: defaults.gridColor },
          suggestedMin: 0,
          suggestedMax: 50,
        }
      }
    }
  });
}

// ==========================================
//  MOBILE WIDGET — Résumé compact
// ==========================================
function renderMobileWidget() {
  const widget = document.getElementById('mobileWidget');
  if (!widget) return;

  const ad = state.accountData;
  const wd = state.weeklyData;
  const latestAcc = ad[ad.length - 1];
  const netWorth = latestAcc ? (parseFloat(latestAcc.total) || 0) : 0;
  const variation = latestAcc ? (parseFloat(latestAcc.variation) || 0) : 0;
  const varClass = variation >= 0 ? 'positive' : 'negative';

  // Last week data
  const lastWeek = wd[wd.length - 1];
  const epargne = lastWeek ? (parseFloat(lastWeek.epargne) || 0) : 0;
  const reste = lastWeek ? (parseFloat(lastWeek.reste) || 0) : 0;
  const depenses = lastWeek ? computeExpenses(lastWeek) : 0;

  // Savings rate
  const totalRev = wd.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
  const totalEp = wd.reduce((s, r) => s + (parseFloat(r.epargne) || 0), 0);
  const sRate = totalRev > 0 ? ((totalEp / totalRev) * 100).toFixed(1) : '0';

  // Goals progress
  const goals = getGoals();
  const activeGoals = goals.filter(g => !g.completed);

  widget.innerHTML = `
    <div class="widget-row widget-hero">
      <div class="widget-metric-label">Patrimoine Net</div>
      <div class="widget-metric-value">${currency(netWorth)}</div>
      <div class="widget-metric-change ${varClass}">${variation >= 0 ? '+' : ''}${currency(variation)}</div>
    </div>
    <div class="widget-grid">
      <div class="widget-mini">
        <span class="widget-mini-label">💎 Épargne</span>
        <span class="widget-mini-value">${currency(epargne)}</span>
      </div>
      <div class="widget-mini">
        <span class="widget-mini-label">💸 Dépenses</span>
        <span class="widget-mini-value">${currency(depenses)}</span>
      </div>
      <div class="widget-mini">
        <span class="widget-mini-label">✅ Reste</span>
        <span class="widget-mini-value">${currency(reste)}</span>
      </div>
      <div class="widget-mini">
        <span class="widget-mini-label">📊 Taux épar.</span>
        <span class="widget-mini-value">${sRate}%</span>
      </div>
    </div>
    ${activeGoals.length > 0 ? `
      <div class="widget-goals">
        <div class="widget-mini-label" style="margin-bottom:6px;">🎯 Objectifs actifs (${activeGoals.length})</div>
        ${activeGoals.slice(0, 3).map(g => {
          const pct = g.target > 0 ? Math.min(100, ((g.saved || 0) / g.target) * 100) : 0;
          return `<div style="margin-bottom:4px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">
              <span>${g.name}</span><span>${pct.toFixed(0)}%</span>
            </div>
            <div style="background:var(--bg-tertiary); border-radius:3px; height:4px; overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:var(--accent); border-radius:3px;"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
    ` : ''}
  `;
}

// ==========================================
//  CLOUD SYNC — GitHub Gist Backup/Restore
// ==========================================
const GIST_DESCRIPTION = 'Finance Tracker — Cloud Backup';

function getGHToken() {
  return localStorage.getItem('ft_gh_token') || '';
}

function initCloudSync() {
  const tokenInput = document.getElementById('ghTokenInput');
  const savedToken = getGHToken();
  if (tokenInput && savedToken) tokenInput.value = savedToken;

  // Save token on change
  if (tokenInput) {
    tokenInput.addEventListener('change', () => {
      localStorage.setItem('ft_gh_token', tokenInput.value.trim());
      showToast('Token sauvegardé', 'success');
    });
  }

  document.getElementById('cloudBackupBtn')?.addEventListener('click', cloudBackup);
  document.getElementById('cloudRestoreBtn')?.addEventListener('click', cloudRestore);

  // Show last sync date
  const lastSync = localStorage.getItem('ft_lastSync');
  const statusEl = document.getElementById('cloudSyncStatus');
  if (statusEl && lastSync) {
    statusEl.textContent = `Dernière sync: ${new Date(lastSync).toLocaleString('fr-FR')}`;
  }
}

async function cloudBackup() {
  const token = getGHToken();
  if (!token) { showToast('Entrez votre token GitHub d\'abord', 'error'); return; }

  const statusEl = document.getElementById('cloudSyncStatus');
  if (statusEl) statusEl.textContent = '⏳ Sauvegarde en cours...';

  const data = {
    weeklyData: state.weeklyData,
    accountData: state.accountData,
    columns: state.columns,
    accountColumns: state.accountColumns,
    investments: state.investments,
    budgetLimits: state.budgetLimits,
    goals: getGoals(),
    recurrences: getRecurrences(),
    exportDate: new Date().toISOString(),
  };

  try {
    // Check if gist already exists
    const gistId = localStorage.getItem('ft_gistId');
    let response;

    const body = {
      description: GIST_DESCRIPTION,
      public: false,
      files: { 'finance-tracker-backup.json': { content: JSON.stringify(data, null, 2) } }
    };

    if (gistId) {
      // Update existing gist
      response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      // Create new gist
      response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const result = await response.json();
    localStorage.setItem('ft_gistId', result.id);
    localStorage.setItem('ft_lastSync', new Date().toISOString());
    if (statusEl) statusEl.textContent = `✅ Sauvegardé — ${new Date().toLocaleString('fr-FR')}`;
    showToast('Données sauvegardées sur GitHub Gist !', 'success');
  } catch (err) {
    if (statusEl) statusEl.textContent = '❌ Erreur';
    showToast('Erreur de sync: ' + err.message, 'error');
  }
}

async function cloudRestore() {
  const token = getGHToken();
  if (!token) { showToast('Entrez votre token GitHub d\'abord', 'error'); return; }

  const gistId = localStorage.getItem('ft_gistId');
  if (!gistId) {
    // Try to find gist by description
    showToast('Aucun backup trouvé. Sauvegardez d\'abord.', 'error');
    return;
  }

  const statusEl = document.getElementById('cloudSyncStatus');
  if (statusEl) statusEl.textContent = '⏳ Restauration en cours...';

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const gist = await response.json();
    const content = gist.files['finance-tracker-backup.json']?.content;
    if (!content) throw new Error('Fichier de backup non trouvé dans le Gist');

    const data = JSON.parse(content);
    if (data.weeklyData) state.weeklyData = data.weeklyData;
    if (data.accountData) state.accountData = data.accountData;
    if (data.columns) state.columns = data.columns;
    if (data.accountColumns) state.accountColumns = data.accountColumns;
    if (data.investments) state.investments = data.investments;
    if (data.budgetLimits) state.budgetLimits = data.budgetLimits;
    if (data.goals) saveGoals(data.goals);
    if (data.recurrences) saveRecurrences(data.recurrences);
    saveData();
    renderDashboard();
    renderMainTable();
    renderAccountsView();
    if (statusEl) statusEl.textContent = `✅ Restauré — backup du ${new Date(data.exportDate).toLocaleString('fr-FR')}`;
    showToast('Données restaurées depuis GitHub Gist !', 'success');
  } catch (err) {
    if (statusEl) statusEl.textContent = '❌ Erreur';
    showToast('Erreur de restauration: ' + err.message, 'error');
  }
}

// ==========================================
//  SERVICE WORKER — PWA Registration
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.warn('SW registration failed:', err));
  });
}

// ==========================================
//  MONTE-CARLO SIMULATION ENGINE
// ==========================================

// ─── Presets ───
const SIM_PRESETS = {
  actions_fr: { mu: 7, sigma: 18, S0: 1000, T: 252, label: 'Actions FR (CAC)' },
  sp500:      { mu: 10, sigma: 15, S0: 1000, T: 252, label: 'S&P 500' },
  obligations:{ mu: 3, sigma: 5, S0: 1000, T: 252, label: 'Obligations' },
  crypto:     { mu: 15, sigma: 60, S0: 1000, T: 252, label: 'Crypto (BTC)' },
  immo:       { mu: 4, sigma: 8, S0: 1000, T: 252, label: 'Immobilier' },
};

let simCurrentModel = 'gbm';
let simInitialized = false;

function initSimulationView() {
  if (simInitialized) return;
  simInitialized = true;

  // Model selector toggle
  document.querySelectorAll('.sim-model-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sim-model-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      simCurrentModel = btn.dataset.model;
      // Toggle O-U specific params
      document.querySelectorAll('.sim-ou-param').forEach(el => {
        el.classList.toggle('visible', simCurrentModel === 'ou');
      });
    });
  });

  // Preset buttons
  document.querySelectorAll('.sim-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sim-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = SIM_PRESETS[btn.dataset.preset];
      if (preset) {
        document.getElementById('simS0').value = preset.S0;
        document.getElementById('simMu').value = preset.mu;
        document.getElementById('simSigma').value = preset.sigma;
        document.getElementById('simT').value = preset.T;
      }
    });
  });

  // Run button
  document.getElementById('runSimulation')?.addEventListener('click', executeSimulation);

  // Initialize Lucide icons in this view
  lucide.createIcons({ root: document.getElementById('view-simulation') });
}

// ─── Box-Muller Transform: Generate N(0,1) random numbers ───
function boxMullerRandom() {
  let u1, u2;
  do { u1 = Math.random(); } while (u1 === 0); // avoid log(0)
  u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ─── Geometric Brownian Motion ───
// dS = μ·S·dt + σ·S·dW
// Discretized: S(t+dt) = S(t) × exp( (μ - σ²/2)·dt + σ·√dt·Z )
function simulateGBM(S0, mu, sigma, T, dt) {
  const steps = Math.ceil(T / dt);
  const path = new Float64Array(steps + 1);
  path[0] = S0;

  const drift = (mu - 0.5 * sigma * sigma) * dt;
  const diffusion = sigma * Math.sqrt(dt);

  for (let i = 1; i <= steps; i++) {
    const Z = boxMullerRandom();
    path[i] = path[i - 1] * Math.exp(drift + diffusion * Z);
  }
  return path;
}

// ─── Ornstein-Uhlenbeck Process (Mean Reversion) ───
// dx = θ·(μ - x)·dt + σ·dW
function simulateOU(x0, mu, theta, sigma, T, dt) {
  const steps = Math.ceil(T / dt);
  const path = new Float64Array(steps + 1);
  path[0] = x0;

  const sqrtDt = Math.sqrt(dt);

  for (let i = 1; i <= steps; i++) {
    const Z = boxMullerRandom();
    path[i] = path[i - 1] + theta * (mu - path[i - 1]) * dt + sigma * sqrtDt * Z;
    if (path[i] < 0) path[i] = 0.01; // Floor at near-zero
  }
  return path;
}

// ─── Monte-Carlo Orchestrator ───
function runMonteCarlo(params) {
  const { S0, mu, sigma, T, N, model, theta } = params;
  const dt = 1 / 252; // Daily steps
  const steps = Math.ceil(T * dt > 0 ? T : T); // T is in days already
  const paths = [];

  for (let i = 0; i < N; i++) {
    let path;
    if (model === 'ou') {
      path = simulateOU(S0, S0, theta, sigma * S0, T, 1); // daily steps
    } else {
      path = simulateGBM(S0, mu, sigma, T, 1 / 252);
    }
    paths.push(path);
  }

  // Compute final returns
  const finalReturns = paths.map(p => (p[p.length - 1] - p[0]) / p[0]);

  return { paths, finalReturns };
}

// ─── Value at Risk ───
function computeVaR(returns, confidence) {
  const sorted = [...returns].sort((a, b) => a - b);
  const idx = Math.floor((1 - confidence) * sorted.length);
  return sorted[idx];
}

// ─── Conditional VaR (Expected Shortfall) ───
function computeCVaR(returns, confidence) {
  const sorted = [...returns].sort((a, b) => a - b);
  const cutoff = Math.floor((1 - confidence) * sorted.length);
  if (cutoff === 0) return sorted[0];
  const tail = sorted.slice(0, cutoff);
  return tail.reduce((sum, v) => sum + v, 0) / tail.length;
}

// ─── Mean Reversion Signal Generator ───
function generateMeanReversionSignals(path, mu, sigma, k) {
  const signals = [];
  const threshold = k * sigma;

  for (let i = 1; i < path.length; i++) {
    const deviation = path[i] - mu;
    if (deviation < -threshold && (path[i - 1] - mu) >= -threshold) {
      signals.push({ day: i, type: 'BUY', price: path[i], deviation: deviation / mu * 100 });
    } else if (deviation > threshold && (path[i - 1] - mu) <= threshold) {
      signals.push({ day: i, type: 'SELL', price: path[i], deviation: deviation / mu * 100 });
    }
  }
  return signals;
}

// ─── Main Execution ───
function executeSimulation() {
  const btn = document.getElementById('runSimulation');
  btn.classList.add('running');

  // Read parameters
  const S0 = parseFloat(document.getElementById('simS0').value) || 1000;
  const mu = (parseFloat(document.getElementById('simMu').value) || 7) / 100;
  const sigma = (parseFloat(document.getElementById('simSigma').value) || 18) / 100;
  const T = parseInt(document.getElementById('simT').value) || 252;
  const N = Math.min(parseInt(document.getElementById('simN').value) || 200, 2000);
  const theta = parseFloat(document.getElementById('simTheta').value) || 0.5;
  const k = parseFloat(document.getElementById('simK').value) || 1.5;

  // Run simulation asynchronously to not block UI
  setTimeout(() => {
    try {
      const { paths, finalReturns } = runMonteCarlo({
        S0, mu, sigma, T, N, model: simCurrentModel, theta
      });

      // Compute metrics
      const var95 = computeVaR(finalReturns, 0.95);
      const var99 = computeVaR(finalReturns, 0.99);
      const cvar95 = computeCVaR(finalReturns, 0.95);
      const sortedReturns = [...finalReturns].sort((a, b) => a - b);
      const median = sortedReturns[Math.floor(sortedReturns.length / 2)];
      const best = sortedReturns[sortedReturns.length - 1];
      const worst = sortedReturns[0];

      // Update KPIs
      document.getElementById('simVaR95').textContent = (var95 * 100).toFixed(2) + '%';
      document.getElementById('simVaR95').style.color = 'var(--danger)';
      document.getElementById('simVaR99').textContent = (var99 * 100).toFixed(2) + '%';
      document.getElementById('simVaR99').style.color = 'var(--danger)';
      document.getElementById('simCVaR95').textContent = (cvar95 * 100).toFixed(2) + '%';
      document.getElementById('simCVaR95').style.color = 'var(--warning)';
      document.getElementById('simMedian').textContent = (median >= 0 ? '+' : '') + (median * 100).toFixed(2) + '%';
      document.getElementById('simMedian').style.color = median >= 0 ? 'var(--success)' : 'var(--danger)';
      document.getElementById('simBest').textContent = '+' + (best * 100).toFixed(2) + '%';
      document.getElementById('simBest').style.color = 'var(--success)';
      document.getElementById('simWorst').textContent = (worst * 100).toFixed(2) + '%';
      document.getElementById('simWorst').style.color = 'var(--danger)';

      // Path count
      document.getElementById('simPathCount').textContent = `${N} trajectoires × ${T} jours`;

      // Render charts
      renderSpaghettiChart(paths, T, S0);
      renderDistributionChart(finalReturns, var95, var99);

      // Mean reversion signals
      if (simCurrentModel === 'ou') {
        const signals = generateMeanReversionSignals(paths[0], S0, sigma * S0, k);
        renderSignalTable(signals);
      } else {
        document.getElementById('simSignalBody').innerHTML =
          '<tr><td colspan="4" class="placeholder-text">Sélectionnez le modèle O-U pour générer des signaux.</td></tr>';
      }

      showToast(`Simulation terminée : ${N} trajectoires calculées`, 'success');
    } catch (err) {
      showToast('Erreur de simulation : ' + err.message, 'error');
      console.error(err);
    } finally {
      btn.classList.remove('running');
    }
  }, 50);
}

// ─── Spaghetti Chart (N trajectories) ───
function renderSpaghettiChart(paths, T, S0) {
  const ctx = document.getElementById('spaghettiChart');
  if (!ctx) return;
  if (state.charts.spaghetti) state.charts.spaghetti.destroy();

  const { textColor } = getChartDefaults();
  const N = paths.length;
  const steps = paths[0].length;

  // Generate day labels (subsample for perf)
  const labelStep = Math.max(1, Math.floor(steps / 60));
  const labels = [];
  for (let i = 0; i < steps; i += labelStep) labels.push(`J${i}`);

  // Compute percentile bands
  const p5 = [], p25 = [], p50 = [], p75 = [], p95 = [];
  for (let i = 0; i < steps; i += labelStep) {
    const vals = paths.map(p => p[i]).sort((a, b) => a - b);
    p5.push(vals[Math.floor(0.05 * N)]);
    p25.push(vals[Math.floor(0.25 * N)]);
    p50.push(vals[Math.floor(0.50 * N)]);
    p75.push(vals[Math.floor(0.75 * N)]);
    p95.push(vals[Math.floor(0.95 * N)]);
  }

  // Sample a subset of paths for the spaghetti lines (max 80)
  const sampleCount = Math.min(N, 80);
  const sampleStep = Math.max(1, Math.floor(N / sampleCount));
  const datasets = [];

  for (let i = 0; i < N; i += sampleStep) {
    const data = [];
    for (let j = 0; j < steps; j += labelStep) data.push(paths[i][j]);
    datasets.push({
      data,
      borderColor: `hsla(${(i * 360 / N) % 360}, 60%, 55%, 0.15)`,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1,
      fill: false,
    });
  }

  // Percentile bands
  datasets.push({
    label: 'P95',
    data: p95,
    borderColor: 'rgba(77,170,87,0.5)',
    backgroundColor: 'rgba(77,170,87,0.04)',
    fill: '+1',
    borderWidth: 0,
    pointRadius: 0,
    tension: 0.3,
    order: -3,
  });
  datasets.push({
    label: 'P5',
    data: p5,
    borderColor: 'rgba(224,62,62,0.5)',
    backgroundColor: 'rgba(224,62,62,0.04)',
    fill: false,
    borderWidth: 0,
    pointRadius: 0,
    tension: 0.3,
    order: -2,
  });

  // Median line (bold)
  datasets.push({
    label: 'Médiane (P50)',
    data: p50,
    borderColor: '#2eaadc',
    borderWidth: 3,
    pointRadius: 0,
    tension: 0.3,
    fill: false,
    order: -5,
  });

  // S0 reference line
  datasets.push({
    label: `Prix initial (${currency(S0)})`,
    data: labels.map(() => S0),
    borderColor: 'rgba(155,155,155,0.4)',
    borderWidth: 1.5,
    borderDash: [6, 4],
    pointRadius: 0,
    fill: false,
    order: -4,
  });

  state.charts.spaghetti = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: { family: 'Inter', size: 11 },
            usePointStyle: true,
            padding: 14,
            filter: item => item.text, // only show labeled datasets
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: 12,
          cornerRadius: 8,
          filter: item => item.dataset.label, // only tooltip labeled
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${currency(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { size: 10 }, maxTicksLimit: 20 },
          grid: { display: false }
        },
        y: {
          ticks: { color: textColor, font: { size: 10 }, callback: v => currency(v) },
          grid: { color: 'rgba(0,0,0,0.04)' }
        }
      }
    }
  });
}

// ─── Distribution Histogram ───
function renderDistributionChart(returns, var95, var99) {
  const ctx = document.getElementById('distributionChart');
  if (!ctx) return;
  if (state.charts.distribution) state.charts.distribution.destroy();

  const { textColor } = getChartDefaults();

  // Build histogram bins
  const min = Math.min(...returns);
  const max = Math.max(...returns);
  const binCount = 40;
  const binWidth = (max - min) / binCount;
  const bins = new Array(binCount).fill(0);
  const binLabels = [];

  for (let i = 0; i < binCount; i++) {
    const lo = min + i * binWidth;
    binLabels.push((lo * 100).toFixed(1) + '%');
  }

  returns.forEach(r => {
    let idx = Math.floor((r - min) / binWidth);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx]++;
  });

  // Color bins: red for < VaR95, orange for < VaR99, green for positive, blue for rest
  const barColors = binLabels.map((_, i) => {
    const lo = min + i * binWidth;
    if (lo <= var99) return 'rgba(224,62,62,0.7)';
    if (lo <= var95) return 'rgba(203,145,47,0.6)';
    if (lo >= 0) return 'rgba(77,170,87,0.6)';
    return 'rgba(46,170,220,0.5)';
  });

  state.charts.distribution = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: binLabels,
      datasets: [{
        label: 'Fréquence',
        data: bins,
        backgroundColor: barColors,
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.85)',
          callbacks: {
            title: items => `Rendement: ${items[0].label}`,
            label: ctx => `${ctx.parsed.y} simulations`
          }
        },
        // Custom plugin to draw VaR lines
        annotation: undefined,
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: { size: 9 },
            maxTicksLimit: 12,
            maxRotation: 45,
          },
          grid: { display: false },
          title: { display: true, text: 'Rendement final', color: textColor, font: { size: 11 } }
        },
        y: {
          ticks: { color: textColor, font: { size: 10 } },
          grid: { color: 'rgba(0,0,0,0.04)' },
          title: { display: true, text: 'Fréquence', color: textColor, font: { size: 11 } }
        }
      }
    },
    plugins: [{
      // Draw VaR vertical lines
      afterDraw(chart) {
        const { ctx: c, chartArea, scales } = chart;
        const xScale = scales.x;

        const drawVarLine = (value, color, label) => {
          const pct = (value * 100).toFixed(1) + '%';
          // Find the closest bin
          let xPos = null;
          for (let i = 0; i < binLabels.length; i++) {
            if (parseFloat(binLabels[i]) >= value * 100) {
              xPos = xScale.getPixelForValue(i);
              break;
            }
          }
          if (xPos == null) return;

          c.save();
          c.beginPath();
          c.setLineDash([5, 3]);
          c.strokeStyle = color;
          c.lineWidth = 2;
          c.moveTo(xPos, chartArea.top);
          c.lineTo(xPos, chartArea.bottom);
          c.stroke();

          c.setLineDash([]);
          c.fillStyle = color;
          c.font = 'bold 10px Inter';
          c.textAlign = 'center';
          c.fillText(label, xPos, chartArea.top - 6);
          c.restore();
        };

        drawVarLine(var95, '#cb912f', 'VaR 95%');
        drawVarLine(var99, '#e03e3e', 'VaR 99%');
      }
    }]
  });
}

// ─── Signal Table Renderer ───
function renderSignalTable(signals) {
  const tbody = document.getElementById('simSignalBody');
  if (!tbody) return;

  if (signals.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="placeholder-text">Aucun signal détecté pour ce seuil.</td></tr>';
    return;
  }

  // Limit to 50 most recent signals
  const displayed = signals.slice(-50);

  tbody.innerHTML = displayed.map(s => {
    const cls = s.type === 'BUY' ? 'sim-signal-buy' : 'sim-signal-sell';
    const icon = s.type === 'BUY' ? '↗' : '↘';
    return `
      <tr>
        <td>Jour ${s.day}</td>
        <td class="${cls}">${icon} ${s.type === 'BUY' ? 'ACHAT' : 'VENTE'}</td>
        <td>${currency(s.price)}</td>
        <td class="${cls}">${s.deviation >= 0 ? '+' : ''}${s.deviation.toFixed(2)}%</td>
      </tr>
    `;
  }).join('');
}

// ==========================================
//  MODAL
// ==========================================
function initModals() {
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  const cancelBtn = document.getElementById('modalCancel');

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
}

let modalCallback = null;

function showModal(title, fields, onConfirm) {
  const overlay = document.getElementById('modalOverlay');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  const confirmBtn = document.getElementById('modalConfirm');

  titleEl.textContent = title;
  bodyEl.innerHTML = fields.map(f => `
    <div class="form-group">
      <label for="modal_${f.name}">${f.label}</label>
      <input type="${f.type || 'text'}" id="modal_${f.name}" name="${f.name}" ${f.type === 'number' ? 'step="any"' : ''}>
    </div>
  `).join('');

  overlay.classList.add('active');

  // Remove old listener
  const newConfirm = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

  newConfirm.addEventListener('click', () => {
    const data = {};
    fields.forEach(f => {
      data[f.name] = document.getElementById(`modal_${f.name}`)?.value || '';
    });
    onConfirm(data);
    closeModal();
  });
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

// ==========================================
//  TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
//  IMPORT / EXPORT
// ==========================================
function initImportExport() {
  // Export JSON
  document.getElementById('exportAllJson')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({
      weeklyData: state.weeklyData,
      accountData: state.accountData,
      columnsData: state.columns,
      accountColumnsData: state.accountColumns,
      investments: state.investments,
      budgetLimits: state.budgetLimits,
      exportDate: new Date().toISOString(),
    }, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `finance-tracker-${new Date().toISOString().slice(0,10)}.json`);
    showToast('Données exportées en JSON', 'success');
  });

  // Export CSV
  document.getElementById('exportAllCsv')?.addEventListener('click', () => exportTableCSV('weekly'));

  // Import
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) importFile(file);
    });
  }

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files[0]) importFile(e.target.files[0]);
  });
}

function importFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      // Validate structure
      if (typeof data !== 'object' || data === null) {
        showToast('Format de fichier invalide : objet JSON attendu', 'error');
        return;
      }
      const hasValidData = data.weeklyData || data.accountData || data.columnsData;
      if (!hasValidData) {
        showToast('Aucune donnée reconnue dans le fichier', 'error');
        return;
      }
      if (data.weeklyData && Array.isArray(data.weeklyData)) state.weeklyData = data.weeklyData;
      if (data.accountData && Array.isArray(data.accountData)) state.accountData = data.accountData;
      if (data.columnsData && Array.isArray(data.columnsData)) state.columns = data.columnsData;
      if (data.accountColumnsData && Array.isArray(data.accountColumnsData)) state.accountColumns = data.accountColumnsData;
      if (data.investments && typeof data.investments === 'object') state.investments = data.investments;
      if (data.budgetLimits && typeof data.budgetLimits === 'object') state.budgetLimits = data.budgetLimits;
      saveData();
      renderDashboard();
      renderMainTable();
      renderAccountsView();
      showToast(`Import réussi : ${state.weeklyData.length} entrées financières, ${state.accountData.length} entrées comptes`, 'success');
    } catch (err) {
      showToast('Erreur de lecture : ' + (err.message || 'fichier JSON invalide'), 'error');
    }
  };
  reader.readAsText(file);
}

function exportTableCSV(type) {
  let csv = '';
  let filename = 'finance-data';
  if (type === 'weekly') {
    const headers = state.columns.map(c => `"${c.label}"`).join(',');
    csv = `${headers}\n`;
    state.weeklyData.forEach(r => {
      const rowData = state.columns.map(c => `"${r[c.id] || 0}"`).join(',');
      csv += `${rowData}\n`;
    });
    filename = 'donnees-financieres';
  } else if (type === 'accounts') {
    const headers = state.accountColumns.map(c => `"${c.label}"`).join(',');
    csv = `${headers}\n`;
    state.accountData.forEach(r => {
      const rowData = state.accountColumns.map(c => `"${r[c.id] || 0}"`).join(',');
      csv += `${rowData}\n`;
    });
    filename = 'comptes-epargne';
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}-${new Date().toISOString().slice(0,10)}.csv`);
  showToast('CSV exporté', 'success');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ==========================================
//  SETTINGS
// ==========================================
function initSettings() {
  document.getElementById('resetDataBtn')?.addEventListener('click', () => {
    if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      localStorage.removeItem('ft_budgetSubcats');
      localStorage.removeItem('ft_seeded_accounts_2');
      localStorage.removeItem('ft_goals');
      localStorage.removeItem('ft_recurrences');
      localStorage.removeItem('ft_gistId');
      localStorage.removeItem('ft_lastSync');
      state.weeklyData = getDefaultWeeklyData();
      state.accountData = getDefaultAccountData();
      state.columns = getDefaultColumns();
      state.accountColumns = getDefaultAccountColumns();
      saveData();
      renderDashboard();
      renderMainTable();
      renderAccountsView();
      showToast('Données réinitialisées', 'info');
    }
  });

  document.getElementById('currencySelect')?.addEventListener('change', (e) => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, e.target.value);
    showToast(`Devise changée en ${e.target.value}`, 'success');
    // Re-render everything
    renderDashboard();
    renderMainTable();
    renderAccountsView();
  });
}

// ==========================================
//  KEYBOARD SHORTCUTS
// ==========================================
document.addEventListener('keydown', (e) => {
  // Ctrl+S to save
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    saveData();
    showToast('Données sauvegardées', 'success');
  }
  // Escape to close modal
  if (e.key === 'Escape') {
    closeModal();
  }
});
