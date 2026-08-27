// ====== ExpenseFlow v4 — Edit, Stats, Signed PDF ======

const STORAGE_KEY = 'expenseflow_data';
const THEME_KEY = 'expenseflow_theme';
const CURRENCY_KEY = 'expenseflow_currency';
const NAME_KEY = 'expenseflow_name';

let expenses = [];
let chart1 = null, chart2 = null, chart3 = null;
let editingId = null;
let searchQuery = '';

const currencies = {
  USD: { symbol: '$', label: 'USD' }, EUR: { symbol: '€', label: 'EUR' },
  GBP: { symbol: '£', label: 'GBP' }, ETB: { symbol: 'Br', label: 'ETB' },
  JPY: { symbol: '¥', label: 'JPY' }, INR: { symbol: '₹', label: 'INR' },
  KES: { symbol: 'KSh', label: 'KES' }, NGN: { symbol: '₦', label: 'NGN' },
  AED: { symbol: 'AED', label: 'AED' }, SAR: { symbol: 'SAR', label: 'SAR' }
};

let currentCurrency = 'USD';
let userName = 'Luel Zelalem';

const categoryEmoji = {
  'Food':'🍔','Groceries':'🛒','Restaurants':'🍽️','Coffee':'☕','Drinks':'🍺','Snacks':'🍫',
  'Transport':'🚗','Fuel':'⛽','Public Transport':'🚌','Taxi/Ride':'🚕','Parking':'🅿️',
  'Shopping':'🛍️','Clothing':'👕','Electronics':'📱','Home':'🏠','Gifts':'🎁',
  'Bills':'📄','Rent':'🏠','Electricity':'⚡','Water':'💧','Internet':'🌐','Phone':'📱','Insurance':'🛡️','Subscriptions':'🔁',
  'Entertainment':'🎬','Movies':'🎥','Music':'🎵','Games':'🎮','Sports':'⚽','Travel':'✈️',
  'Health':'🏥','Medicine':'💊','Doctor':'👨‍⚕️','Gym':'💪',
  'Education':'🎓','Tuition':'🏫','Books':'📚','Courses':'💻',
  'Personal Care':'💄','Charity':'❤️','Other':'📦','Business':'💼','Fees':'🏦','Taxes':'🏛️'
};

const categoryOptions = [
  ['Food','🍔 Food'],['Groceries','🛒 Groceries'],['Restaurants','🍽️ Restaurants'],['Coffee','☕ Coffee'],
  ['Drinks','🍺 Drinks'],['Snacks','🍫 Snacks'],['Transport','🚗 Transport'],['Fuel','⛽ Fuel'],
  ['Public Transport','🚌 Public Transport'],['Taxi/Ride','🚕 Taxi/Ride'],['Parking','🅿️ Parking'],
  ['Shopping','🛍️ Shopping'],['Clothing','👕 Clothing'],['Electronics','📱 Electronics'],['Home','🏠 Home'],
  ['Gifts','🎁 Gifts'],['Bills','📄 Bills'],['Rent','🏠 Rent'],['Electricity','⚡ Electricity'],['Water','💧 Water'],
  ['Internet','🌐 Internet'],['Phone','📱 Phone'],['Insurance','🛡️ Insurance'],['Subscriptions','🔁 Subscriptions'],
  ['Entertainment','🎬 Entertainment'],['Movies','🎥 Movies'],['Music','🎵 Music'],['Games','🎮 Games'],
  ['Sports','⚽ Sports'],['Travel','✈️ Travel'],['Health','🏥 Health'],['Medicine','💊 Medicine'],
  ['Doctor','👨‍⚕️ Doctor'],['Gym','💪 Gym'],['Education','🎓 Education'],['Tuition','🏫 Tuition'],
  ['Books','📚 Books'],['Courses','💻 Courses'],['Personal Care','💄 Personal Care'],['Charity','❤️ Charity'],
  ['Other','📦 Other'],['Business','💼 Business'],['Fees','🏦 Fees'],['Taxes','🏛️ Taxes']
];

// ---- Load/Save ----
function loadAll() {
  const savedExp = localStorage.getItem(STORAGE_KEY);
  if (savedExp) { try { expenses = JSON.parse(savedExp); } catch(e) { expenses = []; } }
  const savedCur = localStorage.getItem(CURRENCY_KEY);
  if (savedCur && currencies[savedCur]) currentCurrency = savedCur;
  const savedName = localStorage.getItem(NAME_KEY);
  if (savedName) userName = savedName;
  document.getElementById('currencySelect').value = currentCurrency;
  document.getElementById('userName').value = userName;
  document.getElementById('footerName').textContent = userName;
}

function saveExpenses() { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); }
function saveName() { localStorage.setItem(NAME_KEY, userName); document.getElementById('footerName').textContent = userName; }

// ---- Format ----
function formatMoney(amount) {
  const c = currencies[currentCurrency];
  if (currentCurrency === 'JPY') return c.symbol + Math.round(amount).toLocaleString('en-US');
  return c.symbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }

// ---- Theme ----
function loadTheme() { applyTheme(localStorage.getItem(THEME_KEY) || 'dark'); }
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeIcon').textContent = theme === 'light' ? '🌙' : '☀️';
  renderCharts();
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'light' ? 'dark' : 'light';
  applyTheme(next); localStorage.setItem(THEME_KEY, next);
}

// ---- Chart Colors ----
function chartColors() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  return isLight
    ? { grid: '#e2e8f0', text: '#64748b', barColors: ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#a855f7','#14b8a6','#f97316','#8b5cf6','#06b6d4','#84cc16'] }
    : { grid: '#334155', text: '#94a3b8', barColors: ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#a855f7','#14b8a6','#f97316','#8b5cf6','#06b6d4','#84cc16'] };
}

// ---- Stats ----
function renderStats() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  document.getElementById('totalSpent').textContent = formatMoney(total);
  document.getElementById('entryCount').textContent = expenses.length.toLocaleString();

  const now = new Date();
  const monthTotal = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + e.amount, 0);
  document.getElementById('monthSpent').textContent = formatMoney(monthTotal);

  const avg = expenses.length > 0 ? total / expenses.length : 0;
  document.getElementById('avgSpent').textContent = formatMoney(avg);

  // Biggest expense
  if (expenses.length > 0) {
    const biggest = expenses.reduce((a, b) => a.amount > b.amount ? a : b);
    document.getElementById('biggestExpense').textContent = formatMoney(biggest.amount);
  } else {
    document.getElementById('biggestExpense').textContent = '—';
  }

  // Top category
  const byCat = {};
  expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('topCategory').textContent = topCat ? topCat[0] : '—';

  // Daily average
  if (expenses.length > 0) {
    const dates = [...new Set(expenses.map(e => e.date.split('T')[0]))];
    const dailyAvg = total / Math.max(dates.length, 1);
    document.getElementById('dailyAvg').textContent = formatMoney(dailyAvg);
    document.getElementById('activeDays').textContent = dates.length;
  } else {
    document.getElementById('dailyAvg').textContent = formatMoney(0);
    document.getElementById('activeDays').textContent = '0';
  }
}

// ---- Insights ----
function renderInsights() {
  const list = document.getElementById('insightsList');
  if (expenses.length === 0) { list.innerHTML = '<li class="insight-item">Add some expenses to see insights!</li>'; return; }

  const insights = [];
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCat = {};
  expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
  const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  // Top category insight
  if (sortedCats.length > 0) {
    const [topName, topAmount] = sortedCats[0];
    const pct = ((topAmount / total) * 100).toFixed(1);
    insights.push(`📌 Your biggest spending category is <strong>${topName}</strong> at ${formatMoney(topAmount)} (${pct}% of total).`);
  }

  // Daily average
  const dates = [...new Set(expenses.map(e => e.date.split('T')[0]))];
  const dailyAvg = total / Math.max(dates.length, 1);
  insights.push(`📊 You spend an average of <strong>${formatMoney(dailyAvg)}</strong> per active day.`);

  // This month vs last month
  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + e.amount, 0);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthTotal = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
  }).reduce((s, e) => s + e.amount, 0);

  if (lastMonthTotal > 0) {
    const change = ((thisMonth - lastMonthTotal) / lastMonthTotal * 100).toFixed(1);
    const direction = change > 0 ? '⬆️ up' : '⬇️ down';
    insights.push(`📅 This month you've spent <strong>${formatMoney(thisMonth)}</strong>, ${direction} ${Math.abs(change)}% vs last month (${formatMoney(lastMonthTotal)}).`);
  } else if (thisMonth > 0) {
    insights.push(`📅 You've spent <strong>${formatMoney(thisMonth)}</strong> this month so far.`);
  }

  // Category breakdown
  if (sortedCats.length >= 2) {
    const [secondName, secondAmount] = sortedCats[1];
    insights.push(`🥈 Your second biggest category is <strong>${secondName}</strong> at ${formatMoney(secondAmount)}.`);
  }

  // Biggest single expense
  const biggest = expenses.reduce((a, b) => a.amount > b.amount ? a : b);
  insights.push(`🏆 Your biggest single expense was <strong>${escapeHtml(biggest.description)}</strong> at ${formatMoney(biggest.amount)} on ${formatDate(biggest.date)}.`);

  list.innerHTML = insights.map(i => `<li class="insight-item">${i}</li>`).join('');
}

// ---- Charts ----
function renderCharts() {
  const colors = chartColors();

  // Doughnut: by category
  const ctx1 = document.getElementById('categoryChart').getContext('2d');
  const byCat = {};
  expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
  const labels1 = Object.keys(byCat), data1 = Object.values(byCat);
  if (chart1) chart1.destroy();
  if (labels1.length > 0) {
    chart1 = new Chart(ctx1, {
      type: 'doughnut',
      data: { labels: labels1, datasets: [{ data: data1, backgroundColor: colors.barColors.slice(0, labels1.length), borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: colors.text, font: { size: 10 }, padding: 8 } } } }
    });
  }

  // Line: last 7 days trend
  const ctx2 = document.getElementById('trendChart').getContext('2d');
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d);
  }
  const dayLabels = days.map(d => d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }));
  const dayData = days.map(d => {
    return expenses.filter(e => {
      const ed = new Date(e.date);
      return ed.toDateString() === d.toDateString();
    }).reduce((s, e) => s + e.amount, 0);
  });
  if (chart2) chart2.destroy();
  if (expenses.length > 0) {
    chart2 = new Chart(ctx2, {
      type: 'line',
      data: { labels: dayLabels, datasets: [{ label: 'Daily Spending', data: dayData, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#6366f1' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: colors.text, font: { size: 10 } } } }, scales: { x: { ticks: { color: colors.text, font: { size: 9 } }, grid: { color: colors.grid } }, y: { ticks: { color: colors.text, font: { size: 9 } }, grid: { color: colors.grid } } } }
    });
  }

  // Bar: category amounts
  const ctx3 = document.getElementById('barChart').getContext('2d');
  if (chart3) chart3.destroy();
  if (labels1.length > 0) {
    chart3 = new Chart(ctx3, {
      type: 'bar',
      data: { labels: labels1, datasets: [{ data: data1, backgroundColor: colors.barColors.slice(0, labels1.length), borderRadius: 6, borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { color: colors.text, font: { size: 9 } }, grid: { color: colors.grid } }, y: { ticks: { color: colors.text, font: { size: 9 } }, grid: { display: false } } } }
    });
  }
}

// ---- Render List ----
function renderList() {
  const ul = document.getElementById('expenseList');
  if (expenses.length === 0) { ul.innerHTML = '<li class="empty-state">No expenses yet. Add one above! 👆</li>'; return; }

  let filtered = expenses.slice().reverse();
  if (searchQuery) {
    filtered = filtered.filter(e =>
      e.description.toLowerCase().includes(searchQuery) ||
      e.category.toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) { ul.innerHTML = '<li class="empty-state">No results found. 🔍</li>'; return; }

  ul.innerHTML = filtered.map(e => `
    <li>
      <div class="expense-info">
        <span class="expense-desc">${categoryEmoji[e.category] || '📦'} ${escapeHtml(e.description)}</span>
        <span class="expense-meta">${e.category} · ${formatDate(e.date)}</span>
      </div>
      <div class="expense-actions">
        <span class="expense-amount">${formatMoney(e.amount)}</span>
        <button class="btn-edit" onclick="openEdit('${e.id}')" title="Edit">✏️</button>
        <button class="btn-delete" onclick="deleteExpense('${e.id}')" title="Delete">✕</button>
      </div>
    </li>
  `).join('');
}

// ---- Add Expense ----
function addExpense(desc, amount, cat) {
  expenses.push({ id: Date.now().toString() + Math.random().toString(36).slice(2, 6), description: desc, amount: parseFloat(amount), category: cat, date: new Date().toISOString() });
  saveExpenses(); renderAll();
}

// ---- Edit Expense ----
function openEdit(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  editingId = id;
  document.getElementById('editDescription').value = e.description;
  document.getElementById('editAmount').value = e.amount;
  // Populate category dropdown
  const sel = document.getElementById('editCategory');
  sel.innerHTML = categoryOptions.map(([v, l]) => `<option value="${v}" ${v === e.category ? 'selected' : ''}>${l}</option>`).join('');
  // Set date
  document.getElementById('editDate').value = e.date.split('T')[0];
  document.getElementById('editModal').style.display = 'flex';
}

function closeEdit() {
  editingId = null;
  document.getElementById('editModal').style.display = 'none';
}

function saveEdit(e) {
  e.preventDefault();
  if (!editingId) return;
  const exp = expenses.find(x => x.id === editingId);
  if (!exp) return;
  exp.description = document.getElementById('editDescription').value.trim();
  exp.amount = parseFloat(document.getElementById('editAmount').value);
  exp.category = document.getElementById('editCategory').value;
  const dateVal = document.getElementById('editDate').value;
  if (dateVal) exp.date = new Date(dateVal).toISOString();
  saveExpenses(); closeEdit(); renderAll();
}

// ---- Delete ----
function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveExpenses(); renderAll();
}

// ---- PDF Download with Signature ----
function downloadPDF() {
  if (expenses.length === 0) { alert('No expenses to download. Add some first! 👆'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const c = currencies[currentCurrency];
  const colors = chartColors();

  // === HEADER ===
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('ExpenseFlow', 14, 18);
  doc.setFontSize(10);
  doc.text('Personal Expense Report', 14, 27);
  doc.text('Generated: ' + new Date().toLocaleString('en-US'), 14, 34);

  // === SUMMARY STATS ===
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.text('Summary Statistics', 14, 52);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const avg = expenses.length > 0 ? total / expenses.length : 0;
  const dates = [...new Set(expenses.map(e => e.date.split('T')[0]))];
  const dailyAvg = total / Math.max(dates.length, 1);

  const byCat = {};
  expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
  const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCats[0];
  const biggest = expenses.reduce((a, b) => a.amount > b.amount ? a : b);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  let yPos = 60;

  // Stats grid (2 columns)
  const stats = [
    ['Total Spent', formatMoney(total)],
    ['Number of Entries', expenses.length.toString()],
    ['Average per Entry', formatMoney(avg)],
    ['Daily Average', formatMoney(dailyAvg)],
    ['Active Days', dates.length.toString()],
    ['Top Category', topCat ? topCat[0] : 'N/A'],
    ['Biggest Expense', formatMoney(biggest.amount)],
    ['Currency', c.label]
  ];

  for (let i = 0; i < stats.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 14 + col * 95;
    const y = 60 + row * 10;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(stats[i][0] + ':', x, y);
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(stats[i][1], x + 55, y);
  }

  // === CATEGORY BREAKDOWN ===
  yPos = 104;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Category Breakdown', 14, yPos);
  yPos += 6;

  doc.setFontSize(10);
  sortedCats.forEach(([cat, amount]) => {
    const pct = ((amount / total) * 100).toFixed(1);
    doc.setTextColor(99, 102, 241);
    doc.text(cat, 14, yPos);
    doc.setTextColor(80, 80, 80);
    doc.text(formatMoney(amount) + ' (' + pct + '%)', 100, yPos);
    // Visual bar
    const barWidth = (amount / total) * 80;
    doc.setFillColor(99, 102, 241);
    doc.rect(14, yPos + 1, barWidth, 2, 'F');
    yPos += 9;
  });

  // === EXPENSE TABLE ===
  yPos += 4;
  const tableData = expenses.slice().reverse().map((e, i) => [
    (i + 1).toString(), e.description, e.category, formatDate(e.date), formatMoney(e.amount)
  ]);

  doc.autoTable({
    head: [['#', 'Description', 'Category', 'Date', 'Amount']],
    body: tableData,
    startY: yPos,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles: { 0: { cellWidth: 12 }, 4: { halign: 'right' } }
  });

  // === TOTAL ===
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setTextColor(99, 102, 241);
  doc.text('Total: ' + formatMoney(total), 14, finalY);

  // === SIGNATURE ===
  const sigY = finalY + 20;

  // Signature line
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(120, sigY, 196, sigY);

  // Signature text
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text(userName, 120, sigY - 3);

  // Label
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Signed by: ' + userName, 120, sigY + 5);
  doc.text('Date: ' + new Date().toLocaleDateString('en-US'), 120, sigY + 10);

  // === FOOTER ===
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by ExpenseFlow — github.com/luelzelalem848-max/expenseflow', 14, 288);

  doc.save(`expenseflow-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ---- Render All ----
function renderAll() { renderStats(); renderInsights(); renderCharts(); renderList(); }

// ---- Event Listeners ----
document.getElementById('expenseForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const desc = document.getElementById('description').value.trim();
  const amount = document.getElementById('amount').value;
  const cat = document.getElementById('category').value;
  if (!desc || !amount || !cat) return;
  addExpense(desc, amount, cat);
  document.getElementById('description').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('category').value = '';
  document.getElementById('description').focus();
});

document.getElementById('currencySelect').addEventListener('change', function(e) {
  currentCurrency = e.target.value;
  localStorage.setItem(CURRENCY_KEY, currentCurrency);
  renderAll();
});

document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('downloadPdf').addEventListener('click', downloadPDF);
document.getElementById('searchInput').addEventListener('input', function(e) { searchQuery = e.target.value.toLowerCase(); renderList(); });

// Edit modal
document.getElementById('editForm').addEventListener('submit', saveEdit);
document.getElementById('closeEdit').addEventListener('click', closeEdit);
document.getElementById('editModal').addEventListener('click', function(e) { if (e.target === this) closeEdit(); });

// Profile modal
document.getElementById('profileBtn').addEventListener('click', function() {
  document.getElementById('userName').value = userName;
  document.getElementById('profileModal').style.display = 'flex';
});
document.getElementById('closeProfile').addEventListener('click', function() { document.getElementById('profileModal').style.display = 'none'; });
document.getElementById('profileForm').addEventListener('submit', function(e) {
  e.preventDefault();
  userName = document.getElementById('userName').value.trim() || 'Luel Zelalem';
  saveName();
  document.getElementById('profileModal').style.display = 'none';
});

// ---- Init ----
loadTheme();
loadAll();
renderAll();
