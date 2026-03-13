/* ================================================================
   CrimiCore - Criminal Gangs Page Logic
   Search, Multi-Select Filter, Sort, Pagination, Skeleton Loading
   ================================================================ */

(function () {
  'use strict';

  /* --- State --- */
  const state = {
    gangs: [],
    filtered: [],
    searchQuery: '',
    statusFilters: [],     // empty = show all
    threatFilters: [],     // empty = show all
    currentPage: 1,
    perPage: 7,
    isLoading: true,
    filterOpen: false,
    sortColumn: null,
    sortDirection: 'asc'
  };

  /* --- DOM References --- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* --- Threat Level badge class --- */
  function threatBadgeClass(level) {
    const map = {
      'low': 'risk-low',
      'medium': 'risk-medium',
      'high': 'risk-high',
      'critical': 'risk-critical'
    };
    return map[level.toLowerCase()] || 'risk-medium';
  }

  /* --- Status badge class --- */
  function gangStatusClass(status) {
    const map = {
      'active': 'status-active',
      'under investigation': 'status-wanted',
      'disrupted': 'status-arrested',
      'disbanded': 'status-imprisoned',
      'inactive': 'status-parole'
    };
    return map[status.toLowerCase()] || 'status-active';
  }

  /* --- SVG Icons --- */
  const icons = {
    filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    chevRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
    noResults: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m15 8-6 6"/><path d="m9 8 6 6"/></svg>`,
    sortAsc: `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L9 7H1L5 2Z"/></svg>`,
    sortDesc: `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L1 3H9L5 8Z"/></svg>`,
    sortNeutral: `<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" opacity="0.3"><path d="M5 1L9 5H1L5 1Z"/><path d="M5 13L1 9H9L5 13Z"/></svg>`,
    close: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 3L3 9M3 3l6 6"/></svg>`
  };


  /* ================================================================
     Skeleton Rendering
     ================================================================ */
  function renderSkeletonTable() {
    const rows = Array.from({ length: state.perPage }, () => `
      <tr class="skeleton-row">
        <td><div class="skeleton skeleton-text" style="width:110px;height:14px"></div></td>
        <!-- <td><div class="skeleton skeleton-text" style="width:100px;height:14px"></div></td> -->

        <td><div class="skeleton skeleton-text" style="width:30px;height:14px"></div></td>
        <td><div class="skeleton skeleton-text" style="width:120px;height:14px"></div></td>
        <td><div class="skeleton skeleton-badge"></div></td>

        <!-- <td><div class="skeleton skeleton-badge"></div></td> -->
        <!-- <td><div class="skeleton skeleton-text" style="width:65px;height:14px"></div></td> -->
        <!-- <td><div class="skeleton skeleton-btn"></div></td> -->
      </tr>
    `).join('');

    $('#gangs-tbody').innerHTML = rows;
  }

  function renderSkeletonStats() {
    $$('.stat-value').forEach(el => {
      el.innerHTML = `<div class="skeleton skeleton-text" style="width:40px;height:24px;margin-bottom:4px"></div>`;
    });
  }


  /* ================================================================
     Stats
     ================================================================ */
  function renderStats() {
    const total = state.gangs.length;
    const totalMembers = state.gangs.reduce((sum, g) => sum + g.memberCount, 0);
    const wantedGangs = state.gangs.filter(g => g.threatLevel === 'Critical').length;
    const highRisk = state.gangs.filter(g => g.threatLevel === 'High' || g.threatLevel === 'Critical').length;

    const statTotal = $('#stat-total');
    const statMembers = $('#stat-members');
    const statWanted = $('#stat-wanted');
    const statRisk = $('#stat-risk');

    if (statTotal) statTotal.innerHTML = `<h4>${total}</h4><span>Total Gangs</span>`;
    if (statMembers) statMembers.innerHTML = `<h4>${totalMembers}</h4><span>Total Members</span>`;
    if (statWanted) statWanted.innerHTML = `<h4>${wantedGangs}</h4><span>Critical Threat</span>`;
    if (statRisk) statRisk.innerHTML = `<h4>${highRisk}</h4><span>High+ Risk</span>`;
  }


  /* ================================================================
     Table Rendering
     ================================================================ */
  function renderTable() {
    const tbody = $('#gangs-tbody');
    if (!tbody) return;

    const start = (state.currentPage - 1) * state.perPage;
    const end = start + state.perPage;
    const page = state.filtered.slice(start, end);

    if (page.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              ${icons.noResults}
              <p class="empty-state-title">No gangs found</p>
              <p class="empty-state-text">Try adjusting your search or filters</p>
            </div>
          </td>
        </tr>`;
      renderPagination();
      updateSortHeaders();
      return;
    }

    tbody.innerHTML = page.map((g, i) => {
      const crimes = g.primaryCrimes.slice(0, 2).join(', ');
      const moreCount = g.primaryCrimes.length > 2 ? ` +${g.primaryCrimes.length - 2}` : '';
      return `
        <tr class="animate-fade-in" style="animation-delay:${i * 30}ms">
          <td><span class="font-medium">${highlightMatch(g.name, state.searchQuery)}</span></td>
          <td>
            <div>
              <span class="font-medium">${highlightMatch(g.leader, state.searchQuery)}</span>
              <div class="text-xs text-muted" style="margin-top:2px">"${g.leaderAlias}"</div>
            </div>
          </td>
          <td><span class="font-semibold">${g.memberCount}</span></td>
          <td><span class="text-secondary">${highlightMatch(g.territory, state.searchQuery)}</span></td>
          <td><span class="text-sm">${crimes}${moreCount ? `<span class="text-muted">${moreCount}</span>` : ''}</span></td>
          <td><span class="risk-badge ${threatBadgeClass(g.threatLevel)}">${g.threatLevel}</span></td>
          <td><span class="status-badge ${gangStatusClass(g.status)}">${g.status}</span></td>
          <td><button class="btn-view" onclick="viewGang('${g.id}')">View Details</button></td>
        </tr>
      `;
    }).join('');

    renderPagination();
    updateSortHeaders();
  }

  /* --- Highlight search match --- */
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark style="background:rgba(59,130,246,0.3);color:#fff;border-radius:2px;padding:0 2px">$1</mark>');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }


  /* ================================================================
     Sorting
     ================================================================ */
  function sortData(data) {
    if (!state.sortColumn) return data;

    return [...data].sort((a, b) => {
      let valA, valB;

      switch (state.sortColumn) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'leader':
          valA = a.leader.toLowerCase();
          valB = b.leader.toLowerCase();
          break;
        case 'members':
          return state.sortDirection === 'asc' ? a.memberCount - b.memberCount : b.memberCount - a.memberCount;
        case 'territory':
          valA = a.territory.toLowerCase();
          valB = b.territory.toLowerCase();
          break;
        case 'crimes':
          valA = a.primaryCrimes[0].toLowerCase();
          valB = b.primaryCrimes[0].toLowerCase();
          break;
        case 'threat':
          const threatOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
          valA = threatOrder[a.threatLevel.toLowerCase()] || 0;
          valB = threatOrder[b.threatLevel.toLowerCase()] || 0;
          return state.sortDirection === 'asc' ? valA - valB : valB - valA;
        case 'status':
          valA = a.status.toLowerCase();
          valB = b.status.toLowerCase();
          break;
        default:
          return 0;
      }

      const cmp = valA.localeCompare(valB);
      return state.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  function updateSortHeaders() {
    $$('.data-table th[data-sort]').forEach(th => {
      const col = th.dataset.sort;
      const iconSpan = th.querySelector('.sort-icon');

      th.classList.remove('sort-active');

      if (col === state.sortColumn) {
        th.classList.add('sort-active');
        if (iconSpan) iconSpan.innerHTML = state.sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc;
      } else {
        if (iconSpan) iconSpan.innerHTML = icons.sortNeutral;
      }
    });
  }

  function handleSort(column) {
    if (state.sortColumn === column) {
      if (state.sortDirection === 'asc') {
        state.sortDirection = 'desc';
      } else {
        state.sortColumn = null;
        state.sortDirection = 'asc';
      }
    } else {
      state.sortColumn = column;
      state.sortDirection = 'asc';
    }
    applyFilters();
  }


  /* ================================================================
     Pagination
     ================================================================ */
  function renderPagination() {
    const totalPages = Math.ceil(state.filtered.length / state.perPage);
    const paginationEl = $('#pagination');
    const tableInfo = $('#table-info');
    if (!paginationEl) return;

    const start = (state.currentPage - 1) * state.perPage + 1;
    const end = Math.min(state.currentPage * state.perPage, state.filtered.length);
    if (tableInfo) {
      tableInfo.textContent = state.filtered.length > 0
        ? `Showing ${start} to ${end} of ${state.filtered.length} entries`
        : 'No entries to show';
    }

    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }

    let html = `<button class="pagination-btn" onclick="goToPage(${state.currentPage - 1})" ${state.currentPage === 1 ? 'disabled' : ''}>Previous</button>`;

    const maxVisible = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      html += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
      if (startPage > 2) html += `<span class="pagination-btn" style="cursor:default">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="pagination-btn ${i === state.currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += `<span class="pagination-btn" style="cursor:default">...</span>`;
      html += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    html += `<button class="pagination-btn" onclick="goToPage(${state.currentPage + 1})" ${state.currentPage === totalPages ? 'disabled' : ''}>Next ${icons.chevRight}</button>`;

    paginationEl.innerHTML = html;
  }


  /* ================================================================
     Filter & Search
     ================================================================ */
  function applyFilters() {
    let result = [...state.gangs];

    // Search
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.leader.toLowerCase().includes(q) ||
        g.leaderAlias.toLowerCase().includes(q) ||
        g.territory.toLowerCase().includes(q) ||
        g.primaryCrimes.some(c => c.toLowerCase().includes(q))
      );
    }

    // Status filter (multi-select)
    if (state.statusFilters.length > 0) {
      result = result.filter(g => state.statusFilters.includes(g.status));
    }

    // Threat filter (multi-select)
    if (state.threatFilters.length > 0) {
      result = result.filter(g => state.threatFilters.includes(g.threatLevel));
    }

    // Sort
    result = sortData(result);

    state.filtered = result;
    state.currentPage = 1;
    renderTable();
    renderActiveFilters();
  }


  /* ================================================================
     Active Filter Chips (displayed above table)
     ================================================================ */
  function renderActiveFilters() {
    const container = $('#active-filters');
    if (!container) return;

    const hasFilters = state.statusFilters.length > 0 || state.threatFilters.length > 0;

    if (!hasFilters) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';

    let chips = '';

    state.statusFilters.forEach(s => {
      chips += `
        <span class="active-chip">
          <span class="active-chip-label">Status:</span> ${s}
          <button class="active-chip-close" data-type="status" data-value="${s}">${icons.close}</button>
        </span>`;
    });

    state.threatFilters.forEach(t => {
      chips += `
        <span class="active-chip">
          <span class="active-chip-label">Threat:</span> ${t}
          <button class="active-chip-close" data-type="threat" data-value="${t}">${icons.close}</button>
        </span>`;
    });

    chips += `<button class="active-chip-clear" id="clear-all-filters">Clear All</button>`;

    container.innerHTML = chips;
  }


  /* ================================================================
     Toast Notifications
     ================================================================ */
  function showToast(message, type = 'info') {
    let container = $('#toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }


  /* ================================================================
     Data Loading
     ================================================================ */
  async function loadData() {
    state.isLoading = true;
    renderSkeletonTable();
    renderSkeletonStats();

    try {
      state.gangs = await DataService.getGangs();
      state.filtered = [...state.gangs];
      state.isLoading = false;
      renderStats();
      renderFilterDropdown();
      renderTable();
    } catch (error) {
      state.isLoading = false;
      showToast(error.message, 'error');
      $('#gangs-tbody').innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <p class="empty-state-title">Failed to load data</p>
              <p class="empty-state-text">${error.message}</p>
              <button class="btn btn-primary mt-4" onclick="window.CrimiGangs.reload()">Retry</button>
            </div>
          </td>
        </tr>`;
    }
  }


  /* ================================================================
     Filter Dropdown (Multi-Select)
     ================================================================ */
  function renderFilterDropdown() {
    const wrapper = $('#filter-wrapper');
    if (!wrapper) return;

    const uniqueStatuses = [...new Set(state.gangs.map(g => g.status))].sort();
    const uniqueThreats = ['Low', 'Medium', 'High', 'Critical'];

    const activeCount = state.statusFilters.length + state.threatFilters.length;

    wrapper.innerHTML = `
      <button class="btn btn-primary btn-sm" id="filter-btn">
        ${icons.filter} Filter${activeCount > 0 ? ` (${activeCount})` : ''}
      </button>
      <div class="filter-dropdown" id="filter-dropdown" style="display:none">
        <div class="filter-section">
          <h4>Status</h4>
          <div class="filter-options" id="status-filters">
            ${uniqueStatuses.map(s => `
              <button class="filter-chip ${state.statusFilters.includes(s) ? 'active' : ''}"
                      data-filter="status" data-value="${s}">${s}</button>
            `).join('')}
          </div>
        </div>
        <div class="filter-section">
          <h4>Threat Level</h4>
          <div class="filter-options" id="threat-filters">
            ${uniqueThreats.map(t => `
              <button class="filter-chip ${state.threatFilters.includes(t) ? 'active' : ''}"
                      data-filter="threat" data-value="${t}">${t}</button>
            `).join('')}
          </div>
        </div>
        <div class="filter-actions">
          <button class="btn btn-ghost btn-sm" id="filter-clear">Clear</button>
          <button class="btn btn-primary btn-sm" id="filter-apply">Apply</button>
        </div>
      </div>
    `;
  }


  /* ================================================================
     Event Binding
     ================================================================ */
  function bindEvents() {
    // Search (debounced)
    const searchInput = $('#search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.searchQuery = e.target.value.trim();
          applyFilters();
        }, 250);
      });
    }

    // Sort headers
    $$('.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        handleSort(th.dataset.sort);
      });
    });

    // --- All click-based interactions via single delegated listener ---
    document.addEventListener('click', (e) => {
      const target = e.target;
      const wrapper = $('#filter-wrapper');

      // Filter button toggle
      if (target.closest('#filter-btn')) {
        e.stopPropagation();
        const dd = $('#filter-dropdown');
        if (!dd) return;
        state.filterOpen = !state.filterOpen;
        dd.style.display = state.filterOpen ? 'block' : 'none';
        return;
      }

      // Filter chip toggle (multi-select)
      const chip = target.closest('.filter-chip');
      if (chip) {
        const filterType = chip.dataset.filter;
        const value = chip.dataset.value;

        chip.classList.toggle('active');

        if (filterType === 'status') {
          if (state.statusFilters.includes(value)) {
            state.statusFilters = state.statusFilters.filter(v => v !== value);
          } else {
            state.statusFilters.push(value);
          }
        }

        if (filterType === 'threat') {
          if (state.threatFilters.includes(value)) {
            state.threatFilters = state.threatFilters.filter(v => v !== value);
          } else {
            state.threatFilters.push(value);
          }
        }
        return;
      }

      // Filter clear button
      if (target.id === 'filter-clear') {
        state.statusFilters = [];
        state.threatFilters = [];
        if (wrapper) {
          wrapper.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        }
        return;
      }

      // Filter apply button
      if (target.id === 'filter-apply') {
        state.filterOpen = false;
        const dd = $('#filter-dropdown');
        if (dd) dd.style.display = 'none';
        renderFilterDropdown();
        applyFilters();
        return;
      }

      // Active chip close (X) button
      const closeBtn = target.closest('.active-chip-close');
      if (closeBtn) {
        const type = closeBtn.dataset.type;
        const value = closeBtn.dataset.value;
        if (type === 'status') {
          state.statusFilters = state.statusFilters.filter(v => v !== value);
        } else if (type === 'threat') {
          state.threatFilters = state.threatFilters.filter(v => v !== value);
        }
        renderFilterDropdown();
        applyFilters();
        return;
      }

      // Clear all filters button
      if (target.id === 'clear-all-filters') {
        state.statusFilters = [];
        state.threatFilters = [];
        renderFilterDropdown();
        applyFilters();
        return;
      }

      // Close filter dropdown on outside click
      if (state.filterOpen && wrapper && !wrapper.contains(target)) {
        state.filterOpen = false;
        const dd = $('#filter-dropdown');
        if (dd) dd.style.display = 'none';
      }
    });
  }


  /* ================================================================
     Global Functions (called from HTML onclick)
     ================================================================ */
  window.viewGang = function (id) {
    window.location.href = `gang-details.html?id=${id}`;
  };

  window.goToPage = function (page) {
    const totalPages = Math.ceil(state.filtered.length / state.perPage);
    if (page < 1 || page > totalPages) return;
    state.currentPage = page;
    renderTable();
    const tableEl = $('.table-container');
    if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Expose reload for error retry
  window.CrimiGangs = { reload: loadData };


  /* ================================================================
     Initialize
     ================================================================ */
  function init() {
    bindEvents();
    loadData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
