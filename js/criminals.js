/* ================================================================
   CrimiCore - Criminal List Page Logic
   Server-side pagination + filtering via API
   ================================================================ */

(function () {
  'use strict';

  /* --- State --- */
  const state = {
    criminals: [],
    searchQuery: '',
    currentPage: 1,
    perPage: 10,
    isLoading: true,
    sortColumn: null,
    sortDirection: 'asc',
    filters: {
      crimeType: [],
      affiliation: [],
      source: [],
      location: []
    },
    filterOpen: false,
    hasMore: true
  };

  /* --- DOM References --- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* --- SVG Icons --- */
  const icons = {
    chevRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
    noResults: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m15 8-6 6"/><path d="m9 8 6 6"/></svg>`,
    sortAsc: `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L9 7H1L5 2Z"/></svg>`,
    sortDesc: `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L1 3H9L5 8Z"/></svg>`,
    sortNeutral: `<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" opacity="0.3"><path d="M5 1L9 5H1L5 1Z"/><path d="M5 13L1 9H9L5 13Z"/></svg>`
  };

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
  }

  function formatDOB(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr.replace(/\//g, '-'));
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  }


  /* ================================================================
     Skeleton
     ================================================================ */
  function renderSkeletonTable() {
    const rows = Array.from({ length: state.perPage }, () => `
      <tr class="skeleton-row">
        <td><div class="skeleton skeleton-text" style="width:120px;height:14px"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100px;height:14px"></div></td>
        <td><div class="skeleton skeleton-text" style="width:30px;height:14px"></div></td>
        <td><div class="skeleton skeleton-text" style="width:90px;height:14px"></div></td>
        <td><div class="skeleton skeleton-text" style="width:100px;height:14px"></div></td>
        <td><div class="skeleton skeleton-btn"></div></td>
      </tr>
    `).join('');
    $('#criminals-tbody').innerHTML = rows;
  }


  /* ================================================================
     Filter Dropdown
     ================================================================ */
  function getFilterOptions() {
    const crimes = [...new Set(state.criminals.map(c => c.crimeType).filter(Boolean))].sort();
    const gangs = [...new Set(state.criminals.map(c => c.affiliation).filter(a => a && a.toLowerCase() !== 'empty'))].sort();
    const sources = [...new Set(state.criminals.map(c => c.source).filter(Boolean))].sort();
    const locations = [...new Set(state.criminals.map(c => c.location).filter(l => l && l !== 'none, none' && l !== ''))].sort();
    return { crimes, gangs, sources, locations };
  }

  function renderFilterDropdown() {
    const dropdown = $('#filter-dropdown');
    if (!dropdown) return;
    const opts = getFilterOptions();

    dropdown.innerHTML = `
      <h4>Crime Type</h4>
      <div class="filter-section">
        <div class="filter-options">
          ${opts.crimes.slice(0, 12).map(c => `
            <button class="filter-chip ${state.filters.crimeType.includes(c) ? 'active' : ''}" data-filter="crimeType" data-value="${c}">${capitalizeFirst(truncate(c, 25))}</button>
          `).join('')}
        </div>
      </div>
      <h4>Gang / Affiliation</h4>
      <div class="filter-section">
        <div class="filter-options">
          ${opts.gangs.slice(0, 12).map(g => `
            <button class="filter-chip ${state.filters.affiliation.includes(g) ? 'active' : ''}" data-filter="affiliation" data-value="${g}">${capitalizeFirst(truncate(g, 25))}</button>
          `).join('')}
        </div>
      </div>
      <h4>Source</h4>
      <div class="filter-section">
        <div class="filter-options">
          ${opts.sources.slice(0, 10).map(s => `
            <button class="filter-chip ${state.filters.source.includes(s) ? 'active' : ''}" data-filter="source" data-value="${s}">${capitalizeFirst(s)}</button>
          `).join('')}
        </div>
      </div>
      <h4>Location</h4>
      <div class="filter-section">
        <div class="filter-options">
          ${opts.locations.slice(0, 10).map(l => `
            <button class="filter-chip ${state.filters.location.includes(l) ? 'active' : ''}" data-filter="location" data-value="${l}">${capitalizeFirst(truncate(l, 25))}</button>
          `).join('')}
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn btn-secondary btn-sm" id="filter-clear">Clear</button>
        <button class="btn btn-primary btn-sm" id="filter-apply">Apply</button>
      </div>
    `;

    dropdown.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => chip.classList.toggle('active'));
    });

    dropdown.querySelector('#filter-clear').addEventListener('click', () => {
      dropdown.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    });

    dropdown.querySelector('#filter-apply').addEventListener('click', () => {
      ['crimeType', 'affiliation', 'source', 'location'].forEach(key => {
        state.filters[key] = [...dropdown.querySelectorAll(`.filter-chip.active[data-filter="${key}"]`)].map(c => c.dataset.value);
      });
      toggleFilterDropdown(false);
      state.currentPage = 1;
      loadData();
      renderActiveFilters();
    });
  }

  function toggleFilterDropdown(show) {
    const dropdown = $('#filter-dropdown');
    if (!dropdown) return;
    state.filterOpen = show !== undefined ? show : !state.filterOpen;
    dropdown.style.display = state.filterOpen ? 'block' : 'none';
    if (state.filterOpen) renderFilterDropdown();
  }

  function renderActiveFilters() {
    const container = $('#active-filters');
    if (!container) return;

    const labels = { crimeType: 'Crime', affiliation: 'Gang', source: 'Source', location: 'Location' };
    const allFilters = [];
    Object.keys(state.filters).forEach(key => {
      state.filters[key].forEach(v => allFilters.push({ type: key, label: labels[key], value: v }));
    });

    if (allFilters.length === 0) { container.style.display = 'none'; return; }

    container.style.display = 'flex';
    container.innerHTML = allFilters.map(f => `
      <span class="active-chip">
        <span class="active-chip-label">${f.label}:</span> ${capitalizeFirst(truncate(f.value, 20))}
        <button class="active-chip-close" data-type="${f.type}" data-value="${f.value}">&times;</button>
      </span>
    `).join('') + `<button class="active-chip-clear" id="clear-all-filters">Clear All</button>`;

    container.querySelectorAll('.active-chip-close').forEach(btn => {
      btn.addEventListener('click', () => {
        state.filters[btn.dataset.type] = state.filters[btn.dataset.type].filter(v => v !== btn.dataset.value);
        state.currentPage = 1;
        loadData();
        renderActiveFilters();
      });
    });

    container.querySelector('#clear-all-filters').addEventListener('click', () => {
      Object.keys(state.filters).forEach(k => state.filters[k] = []);
      state.currentPage = 1;
      loadData();
      renderActiveFilters();
    });
  }


  /* ================================================================
     Table Rendering
     ================================================================ */
  function renderTable() {
    const tbody = $('#criminals-tbody');
    if (!tbody) return;

    // Client-side search within the current page data
    let visible = [...state.criminals];
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      visible = visible.filter(c =>
        (c.criminalName && c.criminalName.toLowerCase().includes(q)) ||
        (c.crimeType && c.crimeType.toLowerCase().includes(q)) ||
        (c.affiliation && c.affiliation.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q))
      );
    }

    visible = sortData(visible);

    if (visible.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              ${icons.noResults}
              <p class="empty-state-title">No criminals found</p>
              <p class="empty-state-text">Try adjusting your search or filters</p>
            </div>
          </td>
        </tr>`;
      renderPagination();
      updateSortHeaders();
      return;
    }

    tbody.innerHTML = visible.map((c, i) => {
      const gang = c.affiliation || '';
      const gangLink = gang && gang.toLowerCase() !== 'empty'
        ? `<a href="gang-details.html?name=${encodeURIComponent(gang)}" class="text-link">${capitalizeFirst(gang)}</a>`
        : '<span class="text-muted">None</span>';

      return `
        <tr class="animate-fade-in" style="animation-delay:${i * 30}ms">
          <td><span class="font-medium">${highlightMatch(capitalizeFirst(c.criminalName), state.searchQuery)}</span></td>
          <td><span class="text-secondary">${truncate(capitalizeFirst(c.crimeType), 40)}</span></td>
          <td><span class="text-muted">${formatDOB(c.dateOfBirth)}</span></td>
          <td>${gangLink}</td>
          <td><span class="text-secondary">${highlightMatch(capitalizeFirst(c.location), state.searchQuery)}</span></td>
          <td><a href="details.html?name=${encodeURIComponent(c.criminalName)}" class="btn-view">View</a></td>
        </tr>
      `;
    }).join('');

    renderPagination();
    updateSortHeaders();
  }

  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark style="background:rgba(59,130,246,0.3);color:#fff;border-radius:2px;padding:0 2px">$1</mark>');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }


  /* ================================================================
     Sorting (client-side on current page data)
     ================================================================ */
  function sortData(data) {
    if (!state.sortColumn) return data;
    return [...data].sort((a, b) => {
      let valA, valB;
      switch (state.sortColumn) {
        case 'name': valA = (a.criminalName || '').toLowerCase(); valB = (b.criminalName || '').toLowerCase(); break;
        case 'crime': valA = (a.crimeType || '').toLowerCase(); valB = (b.crimeType || '').toLowerCase(); break;
        case 'dob':
          valA = a.dateOfBirth ? new Date(a.dateOfBirth.replace(/\//g, '-')).getTime() : 0;
          valB = b.dateOfBirth ? new Date(b.dateOfBirth.replace(/\//g, '-')).getTime() : 0;
          return state.sortDirection === 'asc' ? valA - valB : valB - valA;
        case 'gang': valA = (a.affiliation || '').toLowerCase(); valB = (b.affiliation || '').toLowerCase(); break;
        case 'location': valA = (a.location || '').toLowerCase(); valB = (b.location || '').toLowerCase(); break;
        default: return 0;
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
      if (state.sortDirection === 'asc') state.sortDirection = 'desc';
      else { state.sortColumn = null; state.sortDirection = 'asc'; }
    } else {
      state.sortColumn = column;
      state.sortDirection = 'asc';
    }
    renderTable();
  }


  /* ================================================================
     Pagination (server-side)
     ================================================================ */
  function renderPagination() {
    const paginationEl = $('#pagination');
    const tableInfo = $('#table-info');
    if (!paginationEl) return;

    if (tableInfo) {
      tableInfo.textContent = state.criminals.length > 0
        ? `Page ${state.currentPage} — ${state.criminals.length} entries loaded`
        : 'No entries to show';
    }

    let html = `<button class="pagination-btn" onclick="goToPage(${state.currentPage - 1})" ${state.currentPage <= 1 ? 'disabled' : ''}>Previous</button>`;
    html += `<button class="pagination-btn active">${state.currentPage}</button>`;
    if (state.hasMore) {
      html += `<button class="pagination-btn" onclick="goToPage(${state.currentPage + 1})">Next ${icons.chevRight}</button>`;
    }
    paginationEl.innerHTML = html;
  }


  /* ================================================================
     Toast
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
     Data Loading (server-side pagination + filters)
     ================================================================ */
  async function loadData() {
    state.isLoading = true;
    renderSkeletonTable();

    try {
      // Build API filters
      const apiFilters = {};
      if (state.filters.crimeType.length === 1) apiFilters.crime_type = state.filters.crimeType[0];
      if (state.filters.affiliation.length === 1) apiFilters.affiliation = state.filters.affiliation[0];
      if (state.filters.source.length === 1) apiFilters.source = state.filters.source[0];
      if (state.filters.location.length === 1) apiFilters.location = state.filters.location[0];

      state.criminals = await DataService.getCriminals(apiFilters, state.currentPage);

      // Client-side multi-select filtering
      if (state.filters.crimeType.length > 1) {
        state.criminals = state.criminals.filter(c => state.filters.crimeType.includes(c.crimeType));
      }
      if (state.filters.affiliation.length > 1) {
        state.criminals = state.criminals.filter(c => state.filters.affiliation.includes(c.affiliation));
      }
      if (state.filters.source.length > 1) {
        state.criminals = state.criminals.filter(c => state.filters.source.includes(c.source));
      }
      if (state.filters.location.length > 1) {
        state.criminals = state.criminals.filter(c => state.filters.location.includes(c.location));
      }

      state.hasMore = state.criminals.length >= 10;
      state.isLoading = false;
      renderTable();
    } catch (error) {
      state.isLoading = false;
      showToast(error.message, 'error');
      $('#criminals-tbody').innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <p class="empty-state-title">Failed to load data</p>
              <p class="empty-state-text">${error.message}</p>
              <button class="btn btn-primary mt-4" onclick="window.CrimiCriminals.reload()">Retry</button>
            </div>
          </td>
        </tr>`;
    }
  }


  /* ================================================================
     Country Dropdown
     ================================================================ */
  function initCountryFilter() {
    const select = $('#country-select');
    if (!select) return;

    select.value = CountryFilter.get();

    select.addEventListener('change', () => {
      CountryFilter.set(select.value);
    });

    CountryFilter.onChange(() => {
      state.currentPage = 1;
      loadData();
    });
  }


  /* ================================================================
     Event Binding
     ================================================================ */
  function bindEvents() {
    const searchInput = $('#search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.searchQuery = e.target.value.trim();
          renderTable();
        }, 250);
      });
    }

    $$('.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => handleSort(th.dataset.sort));
    });

    const filterBtn = $('#filter-btn');
    if (filterBtn) {
      filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFilterDropdown();
      });
    }

    document.addEventListener('click', (e) => {
      const dropdown = $('#filter-dropdown');
      const btn = $('#filter-btn');
      if (state.filterOpen && dropdown && !dropdown.contains(e.target) && btn && !btn.contains(e.target)) {
        toggleFilterDropdown(false);
      }
    });
  }


  /* ================================================================
     Global Functions
     ================================================================ */
  window.goToPage = function (page) {
    if (page < 1) return;
    state.currentPage = page;
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.CrimiCriminals = { reload: loadData };


  /* ================================================================
     Initialize
     ================================================================ */
  function init() {
    bindEvents();
    initCountryFilter();
    loadData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
