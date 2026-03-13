/* ================================================================
   CrimiCore - Activities Page Logic
   Recent News Cards with Filters
   ================================================================ */

(function () {
  'use strict';

  /* --- State --- */
  const state = {
    activities: [],
    filtered: [],
    searchQuery: '',
    currentPage: 1,
    perPage: 8,
    isLoading: true
  };

  /* --- DOM References --- */
  const $ = (sel) => document.querySelector(sel);

  /* --- SVG Icons --- */
  const icons = {
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    noResults: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m15 8-6 6"/><path d="m9 8 6 6"/></svg>`,
    chevRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`
  };


  /* ================================================================
     Skeleton Rendering
     ================================================================ */
  function renderSkeletonCards() {
    const grid = $('#news-grid');
    if (!grid) return;

    grid.innerHTML = Array.from({ length: state.perPage }, () => `
      <div class="news-card">
        <div class="skeleton" style="width:100%;height:180px;border-radius:var(--radius-md)"></div>
        <div style="padding:16px">
          <div class="skeleton" style="width:85%;height:18px;margin-bottom:10px"></div>
          <div class="skeleton" style="width:100%;height:14px;margin-bottom:6px"></div>
          <div class="skeleton" style="width:70%;height:14px;margin-bottom:14px"></div>
          <div class="skeleton" style="width:40%;height:12px"></div>
        </div>
      </div>
    `).join('');
  }

  function renderSkeletonStats() {
    const els = document.querySelectorAll('.stat-value');
    els.forEach(el => {
      el.innerHTML = `<div class="skeleton skeleton-text" style="width:40px;height:24px;margin-bottom:4px"></div>`;
    });
  }


  /* ================================================================
     Stats
     ================================================================ */
  function renderStats() {
    const total = state.activities.length;
    const sources = [...new Set(state.activities.map(a => a.source))].length;
    const locations = [...new Set(state.activities.filter(a => a.location).map(a => a.location))].length;
    const today = new Date().toDateString();
    const recent = state.activities.filter(a => {
      if (!a.publishedDate) return false;
      return new Date(a.publishedDate).toDateString() === today;
    }).length;

    const statTotal = $('#stat-total');
    const statSources = $('#stat-sources');
    const statLocations = $('#stat-locations');
    const statRecent = $('#stat-recent');

    if (statTotal) statTotal.innerHTML = `<h4>${total}</h4><span>Total News</span>`;
    if (statSources) statSources.innerHTML = `<h4>${sources}</h4><span>Sources</span>`;
    if (statLocations) statLocations.innerHTML = `<h4>${locations}</h4><span>Locations</span>`;
    if (statRecent) statRecent.innerHTML = `<h4>${recent}</h4><span>Today</span>`;
  }


  /* ================================================================
     News Cards Rendering
     ================================================================ */
  function renderCards() {
    const grid = $('#news-grid');
    if (!grid) return;

    const start = (state.currentPage - 1) * state.perPage;
    const end = start + state.perPage;
    const page = state.filtered.slice(start, end);

    if (page.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          ${icons.noResults}
          <p class="empty-state-title">No news found</p>
          <p class="empty-state-text">Try adjusting your search</p>
        </div>`;
      renderPagination();
      return;
    }

    grid.innerHTML = page.map((a, i) => {
      const date = formatDate(a.publishedDate);
      const description = truncate(capitalizeFirst(a.criminalName) + ' — ' + capitalizeFirst(a.crimeType), 100);
      const title = truncate(capitalizeFirst(a.title), 80);
      const imgUrl = a.imageUrl || '';

      return `
        <div class="news-card animate-fade-in" style="animation-delay:${i * 40}ms">
          <div class="news-card-img" style="background-image:url('${imgUrl}')">
            <span class="news-card-source">${a.source || 'Unknown'}</span>
          </div>
          <div class="news-card-body">
            <h4 class="news-card-title">${title}</h4>
            <p class="news-card-desc">${description}</p>
            <div class="news-card-footer">
              <span class="news-card-date">${icons.calendar} ${date}</span>
              ${a.linkToArticle ? `<a href="${a.linkToArticle}" target="_blank" rel="noopener" class="news-card-link">Read More</a>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    renderPagination();
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
    let result = [...state.activities];

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(a =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.criminalName && a.criminalName.toLowerCase().includes(q)) ||
        (a.crimeType && a.crimeType.toLowerCase().includes(q)) ||
        (a.location && a.location.toLowerCase().includes(q)) ||
        (a.source && a.source.toLowerCase().includes(q))
      );
    }

    state.filtered = result;
    state.currentPage = 1;
    renderCards();
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
    renderSkeletonCards();
    renderSkeletonStats();

    try {
      state.activities = await DataService.getActivities();
      // Sort by published date descending (newest first)
      state.activities.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      state.filtered = [...state.activities];
      state.isLoading = false;
      renderStats();
      renderCards();
    } catch (error) {
      state.isLoading = false;
      showToast(error.message, 'error');
      const grid = $('#news-grid');
      if (grid) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            <p class="empty-state-title">Failed to load data</p>
            <p class="empty-state-text">${error.message}</p>
            <button class="btn btn-primary mt-4" onclick="window.CrimiCore.reload()">Retry</button>
          </div>`;
      }
    }
  }


  /* ================================================================
     Helpers
     ================================================================ */
  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
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
        }, 300);
      });
    }
  }


  /* ================================================================
     Global Functions
     ================================================================ */
  window.goToPage = function (page) {
    const totalPages = Math.ceil(state.filtered.length / state.perPage);
    if (page < 1 || page > totalPages) return;
    state.currentPage = page;
    renderCards();
    const grid = $('#news-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

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
