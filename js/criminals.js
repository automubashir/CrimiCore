/* ================================================================
   CrimiCore - Criminal List Page Logic
   Table: Name, Crime, Date of Birth, Gang, Location, View
   Data from API
   ================================================================ */

(function () {
  'use strict';

  /* --- State --- */
  const state = {
    criminals: [],
    filtered: [],
    searchQuery: '',
    currentPage: 1,
    perPage: 10,
    isLoading: true,
    sortColumn: null,
    sortDirection: 'asc'
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
    // dateOfBirth comes as "1980/12/10"
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
     Table Rendering
     ================================================================ */
  function renderTable() {
    const tbody = $('#criminals-tbody');
    if (!tbody) return;

    const start = (state.currentPage - 1) * state.perPage;
    const end = start + state.perPage;
    const page = state.filtered.slice(start, end);

    if (page.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              ${icons.noResults}
              <p class="empty-state-title">No criminals found</p>
              <p class="empty-state-text">Try adjusting your search</p>
            </div>
          </td>
        </tr>`;
      renderPagination();
      updateSortHeaders();
      return;
    }

    tbody.innerHTML = page.map((c, i) => {
      const gang = c.affiliation || '';
      const gangDisplay = gang && gang.toLowerCase() !== 'empty' ? capitalizeFirst(gang) : '<span class="text-muted">None</span>';
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
     Sorting
     ================================================================ */
  function sortData(data) {
    if (!state.sortColumn) return data;

    return [...data].sort((a, b) => {
      let valA, valB;
      switch (state.sortColumn) {
        case 'name':
          valA = (a.criminalName || '').toLowerCase();
          valB = (b.criminalName || '').toLowerCase();
          break;
        case 'crime':
          valA = (a.crimeType || '').toLowerCase();
          valB = (b.crimeType || '').toLowerCase();
          break;
        case 'dob':
          valA = a.dateOfBirth ? new Date(a.dateOfBirth.replace(/\//g, '-')).getTime() : 0;
          valB = b.dateOfBirth ? new Date(b.dateOfBirth.replace(/\//g, '-')).getTime() : 0;
          return state.sortDirection === 'asc' ? valA - valB : valB - valA;
        case 'gang':
          valA = (a.affiliation || '').toLowerCase();
          valB = (b.affiliation || '').toLowerCase();
          break;
        case 'location':
          valA = (a.location || '').toLowerCase();
          valB = (b.location || '').toLowerCase();
          break;
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

    if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

    let html = `<button class="pagination-btn" onclick="goToPage(${state.currentPage - 1})" ${state.currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
    const maxVisible = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
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

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.criminalName && c.criminalName.toLowerCase().includes(q)) ||
        (c.crimeType && c.crimeType.toLowerCase().includes(q)) ||
        (c.affiliation && c.affiliation.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q))
      );
    }

    result = sortData(result);
    state.filtered = result;
    state.currentPage = 1;
    renderTable();
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
     Data Loading
     ================================================================ */
  async function loadData() {
    state.isLoading = true;
    renderSkeletonTable();

    try {
      state.criminals = await DataService.getCriminals();
      state.filtered = [...state.criminals];
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
          applyFilters();
        }, 250);
      });
    }

    $$('.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => handleSort(th.dataset.sort));
    });
  }


  /* ================================================================
     Global Functions
     ================================================================ */
  window.goToPage = function (page) {
    const totalPages = Math.ceil(state.filtered.length / state.perPage);
    if (page < 1 || page > totalPages) return;
    state.currentPage = page;
    renderTable();
    const tableEl = $('.table-container');
    if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  window.CrimiCriminals = { reload: loadData };


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
