/* ================================================================
   CrimiCore - Records Page Logic
   Search, Multi-Select Filter, Sort, Pagination, Skeleton Loading
   ================================================================ */

(function () {
  'use strict';

  /* --- State --- */
  const state = {
    criminals: [],
    filtered: [],
    searchQuery: '',
    statusFilters: [],    // empty = show all
    crimeFilters: [],     // empty = show all
    currentPage: 1,
    perPage: 7,
    isLoading: true,
    filterOpen: false,
    sortColumn: null,     // 'id' | 'name' | 'age' | 'crime' | 'status' | 'gang'
    sortDirection: 'asc'  // 'asc' | 'desc'
  };

  /* --- DOM References --- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* --- Crime badge class mapping --- */
  function crimeBadgeClass(crime) {
    const map = {
      'burglary': 'badge-burglary',
      'drug trafficking': 'badge-drug-trafficking',
      'fraud': 'badge-fraud',
      'assault': 'badge-assault',
      'armed robbery': 'badge-armed-robbery',
      'homicide': 'badge-homicide',
      'theft': 'badge-theft',
      'kidnapping': 'badge-kidnapping',
      'cybercrime': 'badge-cybercrime',
      'arson': 'badge-arson',
      'money laundering': 'badge-money-laundering',
      'extortion': 'badge-extortion'
    };
    return map[crime.toLowerCase()] || 'badge-burglary';
  }

  /* --- Status badge class --- */
  function statusClass(status) {
    return 'status-' + status.toLowerCase();
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
        <td><div class="skeleton skeleton-text" style="width:65px;height:14px"></div></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="skeleton skeleton-circle" style="width:32px;height:32px"></div>
            <div class="skeleton skeleton-text" style="width:110px;height:14px"></div>
          </div>
        </td>
        <td><div class="skeleton skeleton-text" style="width:30px;height:14px"></div></td>
        <td><div class="skeleton skeleton-badge"></div></td>
        <td><div class="skeleton skeleton-text" style="width:65px;height:14px"></div></td>
        <td><div class="skeleton skeleton-text" style="width:90px;height:14px"></div></td>
        <td><div class="skeleton skeleton-btn"></div></td>
      </tr>
    `).join('');

    $('#records-tbody').innerHTML = rows;
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
    const total = state.criminals.length;
    const active = state.criminals.filter(c => c.status === 'Active').length;
    const wanted = state.criminals.filter(c => c.status === 'Wanted').length;
    const imprisoned = state.criminals.filter(c => c.status === 'Imprisoned').length;

    const statEls = $$('.stat-value');
    if (statEls[0]) statEls[0].innerHTML = `<h4>${total}</h4><span>Total Records</span>`;
    if (statEls[1]) statEls[1].innerHTML = `<h4>${active}</h4><span>Active Cases</span>`;
    if (statEls[2]) statEls[2].innerHTML = `<h4>${wanted}</h4><span>Wanted</span>`;
    if (statEls[3]) statEls[3].innerHTML = `<h4>${imprisoned}</h4><span>Imprisoned</span>`;
  }


  /* ================================================================
     Table Rendering
     ================================================================ */
  function renderTable() {
    const tbody = $('#records-tbody');
    if (!tbody) return;

    const start = (state.currentPage - 1) * state.perPage;
    const end = start + state.perPage;
    const page = state.filtered.slice(start, end);

    if (page.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              ${icons.noResults}
              <p class="empty-state-title">No records found</p>
              <p class="empty-state-text">Try adjusting your search or filters</p>
            </div>
          </td>
        </tr>`;
      renderPagination();
      updateSortHeaders();
      return;
    }

    tbody.innerHTML = page.map((c, i) => {
      const gang = c.gangAffiliation || 'None';
      const gangClass = gang === 'None' ? 'text-muted' : '';
      return `
        <tr class="animate-fade-in" style="animation-delay:${i * 30}ms">
          <td><span class="text-muted font-medium">${c.id}</span></td>
          <td>
            <div class="criminal-name-cell">
              <img src="${c.photo}" alt="${c.name}" loading="lazy"
                   onerror="this.style.display='none'">
              <span class="font-medium">${highlightMatch(c.name, state.searchQuery)}</span>
            </div>
          </td>
          <td>${c.age}</td>
          <td><span class="badge ${crimeBadgeClass(c.crime)}">${c.crime}</span></td>
          <td><span class="status-badge ${statusClass(c.status)}">${c.status}</span></td>
          <td><span class="${gangClass}">${gang}</span></td>
          <td><button class="btn-view" onclick="viewCriminal('${c.id}')">View Details</button></td>
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
        case 'id':
          valA = parseInt(a.id.replace('CR-', ''));
          valB = parseInt(b.id.replace('CR-', ''));
          return state.sortDirection === 'asc' ? valA - valB : valB - valA;
        case 'age':
          return state.sortDirection === 'asc' ? a.age - b.age : b.age - a.age;
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'crime':
          valA = a.crime.toLowerCase();
          valB = b.crime.toLowerCase();
          break;
        case 'status':
          valA = a.status.toLowerCase();
          valB = b.status.toLowerCase();
          break;
        case 'gang':
          valA = (a.gangAffiliation || 'None').toLowerCase();
          valB = (b.gangAffiliation || 'None').toLowerCase();
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
    let result = [...state.criminals];

    // Search
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.crime.toLowerCase().includes(q) ||
        (c.alias && c.alias.toLowerCase().includes(q))
      );
    }

    // Status filter (multi-select)
    if (state.statusFilters.length > 0) {
      result = result.filter(c => state.statusFilters.includes(c.status));
    }

    // Crime filter (multi-select)
    if (state.crimeFilters.length > 0) {
      result = result.filter(c => state.crimeFilters.includes(c.crime));
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

    const hasFilters = state.statusFilters.length > 0 || state.crimeFilters.length > 0;

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

    state.crimeFilters.forEach(c => {
      chips += `
        <span class="active-chip">
          <span class="active-chip-label">Crime:</span> ${c}
          <button class="active-chip-close" data-type="crime" data-value="${c}">${icons.close}</button>
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
      state.criminals = await DataService.getCriminals();
      state.filtered = [...state.criminals];
      state.isLoading = false;
      renderStats();
      renderFilterDropdown();
      renderTable();
    } catch (error) {
      state.isLoading = false;
      showToast(error.message, 'error');
      $('#records-tbody').innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <p class="empty-state-title">Failed to load data</p>
              <p class="empty-state-text">${error.message}</p>
              <button class="btn btn-primary mt-4" onclick="window.CrimiCore.reload()">Retry</button>
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

    const uniqueStatuses = [...new Set(state.criminals.map(c => c.status))].sort();
    const uniqueCrimes = [...new Set(state.criminals.map(c => c.crime))].sort();

    const activeCount = state.statusFilters.length + state.crimeFilters.length;

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
          <h4>Crime Type</h4>
          <div class="filter-options" id="crime-filters">
            ${uniqueCrimes.map(c => `
              <button class="filter-chip ${state.crimeFilters.includes(c) ? 'active' : ''}"
                      data-filter="crime" data-value="${c}">${c}</button>
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

        if (filterType === 'crime') {
          if (state.crimeFilters.includes(value)) {
            state.crimeFilters = state.crimeFilters.filter(v => v !== value);
          } else {
            state.crimeFilters.push(value);
          }
        }
        return;
      }

      // Filter clear button
      if (target.id === 'filter-clear') {
        state.statusFilters = [];
        state.crimeFilters = [];
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
        } else if (type === 'crime') {
          state.crimeFilters = state.crimeFilters.filter(v => v !== value);
        }
        renderFilterDropdown();
        applyFilters();
        return;
      }

      // Clear all filters button
      if (target.id === 'clear-all-filters') {
        state.statusFilters = [];
        state.crimeFilters = [];
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
  window.viewCriminal = function (id) {
    window.location.href = `details.html?id=${id}`;
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
  window.CrimiCore = { reload: loadData };


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
