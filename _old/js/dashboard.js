/* ================================================================
   CrimiCore - Dashboard Page Logic
   Stats, Donut Chart, Bar Chart, High-Risk Table
   ================================================================ */

(function () {
  'use strict';

  const STATUS_COLORS = {
    'Active': '#22c55e',
    'Arrested': '#3b82f6',
    'Wanted': '#f59e0b',
    'Imprisoned': '#8b5cf6',
    'Parole': '#06b6d4'
  };

  const CRIME_COLORS = {
    'Burglary': '#ef4444',
    'Drug Trafficking': '#f97316',
    'Fraud': '#eab308',
    'Assault': '#22c55e',
    'Armed Robbery': '#f97316',
    'Homicide': '#dc2626',
    'Theft': '#0ea5e9',
    'Kidnapping': '#a855f7',
    'Cybercrime': '#6366f1',
    'Arson': '#f43f5e',
    'Money Laundering': '#14b8a6',
    'Extortion': '#e11d48'
  };

  function countByField(data, field) {
    const counts = {};
    data.forEach(c => {
      counts[c[field]] = (counts[c[field]] || 0) + 1;
    });
    return counts;
  }

  /* --- Stats --- */
  function renderStats(data) {
    document.getElementById('total').textContent = data.length;
    document.getElementById('active').textContent =
      data.filter(c => c.status === 'Active').length;
    document.getElementById('wanted').textContent =
      data.filter(c => c.status === 'Wanted').length;
    document.getElementById('imprisoned').textContent =
      data.filter(c => c.status === 'Imprisoned').length;
  }

  /* --- Donut Chart (CSS conic-gradient) --- */
  function renderDonutChart(statusCounts, total) {
    let gradientParts = [];
    let offset = 0;

    const entries = Object.entries(statusCounts);
    entries.forEach(([status, count]) => {
      const pct = (count / total) * 100;
      const color = STATUS_COLORS[status] || '#64748b';
      gradientParts.push(`${color} ${offset}% ${offset + pct}%`);
      offset += pct;
    });

    const legendItems = entries.map(([status, count]) => `
      <div class="legend-item">
        <div class="legend-left">
          <span class="legend-dot" style="background:${STATUS_COLORS[status] || '#64748b'}"></span>
          <span class="legend-label">${status}</span>
        </div>
        <span class="legend-value">${count}</span>
      </div>
    `).join('');

    return `
      <div class="chart-card">
        <h3>Status Distribution</h3>
        <div class="donut-wrapper">
          <div class="donut-chart" style="background:conic-gradient(${gradientParts.join(', ')})">
            <div class="donut-hole">
              <span class="donut-hole-value">${total}</span>
              <span class="donut-hole-label">Total</span>
            </div>
          </div>
          <div class="chart-legend">
            ${legendItems}
          </div>
        </div>
      </div>
    `;
  }

  /* --- Horizontal Bar Chart --- */
  function renderBarChart(crimeCounts, total) {
    const sorted = Object.entries(crimeCounts)
      .sort((a, b) => b[1] - a[1]);

    const max = sorted[0] ? sorted[0][1] : 1;

    const bars = sorted.map(([crime, count]) => {
      const pct = (count / max) * 100;
      const color = CRIME_COLORS[crime] || '#64748b';
      return `
        <div class="bar-item">
          <div class="bar-label-row">
            <span class="bar-label">${crime}</span>
            <span class="bar-count">${count}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="chart-card">
        <h3>Crimes Breakdown</h3>
        <div class="bar-chart">
          ${bars}
        </div>
      </div>
    `;
  }

  /* --- High Risk Criminals Table --- */
  function renderRiskTable(data) {
    const riskOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    const highRisk = data
      .filter(c => c.riskLevel === 'Critical' || c.riskLevel === 'High')
      .sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

    const rows = highRisk.map(c => `
      <tr>
        <td><span style="color:var(--text-muted)">${c.id}</span></td>
        <td style="font-weight:var(--fw-medium)">${c.name}</td>
        <td><span class="badge badge-${c.crime.toLowerCase().replace(/\s+/g, '-')}">${c.crime}</span></td>
        <td><span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span></td>
        <td><span class="risk-badge risk-${c.riskLevel.toLowerCase()}">${c.riskLevel}</span></td>
        <td><a href="details.html?id=${c.id}" class="btn-view">View</a></td>
      </tr>
    `).join('');

    return `
      <div class="chart-card chart-card-full">
        <h3>High Risk Criminals</h3>
        <table class="risk-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Crime</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length > 0 ? rows : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">No high risk criminals</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  /* --- Skeleton for charts --- */
  function renderChartsSkeleton() {
    const container = document.getElementById('dashboard-charts');
    if (!container) return;
    container.innerHTML = `
      <div class="chart-card">
        <div class="skeleton" style="width:160px;height:20px;margin-bottom:20px"></div>
        <div class="donut-wrapper">
          <div class="skeleton skeleton-circle" style="width:180px;height:180px"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:12px">
            <div class="skeleton" style="width:100%;height:14px"></div>
            <div class="skeleton" style="width:85%;height:14px"></div>
            <div class="skeleton" style="width:90%;height:14px"></div>
            <div class="skeleton" style="width:70%;height:14px"></div>
          </div>
        </div>
      </div>
      <div class="chart-card">
        <div class="skeleton" style="width:140px;height:20px;margin-bottom:20px"></div>
        <div style="display:flex;flex-direction:column;gap:16px">
          ${Array.from({ length: 6 }, (_, i) => `
            <div>
              <div class="skeleton" style="width:${80 + i * 5}px;height:12px;margin-bottom:8px"></div>
              <div class="skeleton" style="width:100%;height:8px;border-radius:99px"></div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="chart-card chart-card-full">
        <div class="skeleton" style="width:180px;height:20px;margin-bottom:20px"></div>
        ${Array.from({ length: 4 }, () => `
          <div style="display:flex;gap:16px;margin-bottom:12px">
            <div class="skeleton" style="width:60px;height:14px"></div>
            <div class="skeleton" style="width:120px;height:14px"></div>
            <div class="skeleton" style="width:80px;height:22px;border-radius:4px"></div>
            <div class="skeleton" style="width:60px;height:14px"></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* --- Stats skeleton --- */
  function renderStatsSkeleton() {
    ['total', 'active', 'wanted', 'imprisoned'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<div class="skeleton" style="width:40px;height:28px;display:inline-block"></div>';
    });
  }

  /* --- Load Dashboard --- */
  async function loadDashboard() {
    renderStatsSkeleton();
    renderChartsSkeleton();

    try {
      const data = await DataService.getCriminals();
      const total = data.length;
      const statusCounts = countByField(data, 'status');
      const crimeCounts = countByField(data, 'crime');

      renderStats(data);

      const container = document.getElementById('dashboard-charts');
      if (container) {
        container.innerHTML =
          renderDonutChart(statusCounts, total) +
          renderBarChart(crimeCounts, total) +
          renderRiskTable(data);

        container.classList.add('animate-fade-in');
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  loadDashboard();

})();
