/* ================================================================
   CrimiCore - Gang Profile Page Logic
   Fetches members by affiliation, renders profile with sections
   ================================================================ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* --- SVG Icons --- */
  const icons = {
    gang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style="width:10px;height:10px;color:var(--color-primary);flex-shrink:0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    chevRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
    noResults: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m15 8-6 6"/><path d="m9 8 6 6"/></svg>`,
    sortAsc: `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L9 7H1L5 2Z"/></svg>`,
    sortDesc: `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L1 3H9L5 8Z"/></svg>`,
    sortNeutral: `<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" opacity="0.3"><path d="M5 1L9 5H1L5 1Z"/><path d="M5 13L1 9H9L5 13Z"/></svg>`
  };

  /* --- Section state (for members table & articles) --- */
  const sectionState = {
    members: { search: '', page: 1, perPage: 8, sortCol: null, sortDir: 'asc' },
    articles: { search: '', page: 1, perPage: 6 }
  };

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark style="background:rgba(59,130,246,0.3);color:#fff;border-radius:2px;padding:0 2px">$1</mark>');
  }


  /* ================================================================
     Skeleton
     ================================================================ */
  function renderSkeleton() {
    const container = $('#gang-profile-content');
    if (!container) return;

    container.innerHTML = `
      <div class="profile-header">
        <div class="profile-photo-wrapper">
          <div class="skeleton" style="width:160px;height:200px;border-radius:8px"></div>
        </div>
        <div class="profile-summary" style="flex:1">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
            <div class="skeleton" style="width:220px;height:30px;border-radius:4px"></div>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${Array.from({ length: 5 }, () => `
              <div class="skeleton" style="width:70%;height:16px"></div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="profile-sections" style="margin-top:24px">
        ${Array.from({ length: 3 }, () => `
          <div class="profile-section profile-section-full">
            <div class="skeleton" style="width:150px;height:18px;margin-bottom:16px"></div>
            <div class="skeleton" style="width:100%;height:14px;margin-bottom:8px"></div>
            <div class="skeleton" style="width:85%;height:14px"></div>
          </div>
        `).join('')}
      </div>
    `;
  }


  /* ================================================================
     Profile Rendering - Full Sections Layout
     ================================================================ */
  function renderProfile(gangName, members) {
    const container = $('#gang-profile-content');
    if (!container) return;

    // Derive gang info from members
    const locations = [...new Set(members.map(m => m.location).filter(l => l && l !== 'none, none' && l !== ''))];
    const crimes = [...new Set(members.map(m => m.crimeType).filter(Boolean))];
    const sources = [...new Set(members.map(m => m.source).filter(Boolean))];
    const territory = locations[0] || 'Unknown';
    const articles = members.filter(m => m.title);
    const media = members.filter(m => m.imageUrl && m.imageUrl.trim());

    // Gang icon placeholder
    const gangIcon = `
      <div class="profile-photo avatar-placeholder" style="width:160px;height:200px;font-size:2.5rem;display:flex;align-items:center;justify-content:center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:80px;height:80px;color:var(--text-muted)">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>`;

    container.innerHTML = `
      <!-- Gang Header: Icon + Profiling -->
      <div class="profile-header animate-fade-in" style="margin-bottom:var(--sp-8)">
        <div class="profile-photo-wrapper">
          ${gangIcon}
        </div>
        <div class="profile-summary">
          <div class="profile-name-row">
            <h1 class="profile-name">${capitalizeFirst(gangName)}</h1>
            <span class="badge badge-burglary">${members.length} Members</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--sp-3);padding:var(--sp-2) 0">
            <div class="gang-info-row">
              ${icons.star}
              <span class="gang-info-label">Territory:</span>
              <span class="gang-info-value">${capitalizeFirst(territory)}</span>
            </div>
            <div class="gang-info-row">
              ${icons.star}
              <span class="gang-info-label">Members:</span>
              <span class="gang-info-value" style="color:var(--status-active);font-weight:var(--fw-bold)">${members.length}</span>
            </div>
            <div class="gang-info-row">
              ${icons.star}
              <span class="gang-info-label">Sources:</span>
              <span class="gang-info-value">${sources.map(s => capitalizeFirst(s)).join(', ') || 'Unknown'}</span>
            </div>
            <div class="gang-info-row">
              ${icons.star}
              <span class="gang-info-label">Locations:</span>
              <span class="gang-info-value">${locations.slice(0, 5).map(l => capitalizeFirst(l)).join('; ') || 'Unknown'}</span>
            </div>
            <div class="gang-info-row">
              ${icons.star}
              <span class="gang-info-label">Primary Activities:</span>
              <span class="gang-info-value">${crimes.slice(0, 5).map(c => capitalizeFirst(c)).join(', ') || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Members -->
      <div class="gang-section animate-slide-up" id="section-members">
        <div class="gang-section-header">
          <h2 class="gang-section-title">${icons.gang} Members <span class="gang-section-count">${members.length}</span></h2>
          <div class="search-wrapper search-wrapper-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" class="input" id="members-search" placeholder="Search members...">
          </div>
        </div>
        <div class="table-container">
          <table class="data-table" id="members-table">
            <thead>
              <tr>
                <th data-msort="name" class="sortable">Name <span class="sort-icon"></span></th>
                <th data-msort="crime" class="sortable">Crime <span class="sort-icon"></span></th>
                <th data-msort="location" class="sortable">Location <span class="sort-icon"></span></th>
                <th>Source</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody id="members-tbody"></tbody>
          </table>
          <div class="table-footer">
            <span class="table-info" id="members-info"></span>
            <div class="pagination" id="members-pagination"></div>
          </div>
        </div>
      </div>

      <!-- Section: Articles -->
      <div class="gang-section animate-slide-up" id="section-articles" style="animation-delay:100ms">
        <div class="gang-section-header">
          <h2 class="gang-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>
            Articles <span class="gang-section-count">${articles.length}</span>
          </h2>
          <div class="search-wrapper search-wrapper-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" class="input" id="articles-search" placeholder="Search articles...">
          </div>
        </div>
        <div class="news-grid news-grid-3" id="articles-grid"></div>
        <div class="table-footer" style="margin-top:var(--sp-4)">
          <span class="table-info" id="articles-info"></span>
          <div class="pagination" id="articles-pagination"></div>
        </div>
      </div>

      <!-- Section: Media -->
      <div class="gang-section animate-slide-up" id="section-media" style="animation-delay:200ms">
        <div class="gang-section-header">
          <h2 class="gang-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Media <span class="gang-section-count">${media.length}</span>
          </h2>
        </div>
        <div class="media-gallery" id="media-gallery">
          ${media.length > 0
            ? media.map(m => `
              <div class="media-item">
                <img src="${m.imageUrl}" alt="${capitalizeFirst(m.criminalName)}" loading="lazy"
                  onerror="this.parentElement.style.display='none'">
                <div class="media-overlay">
                  <span class="media-name">${capitalizeFirst(m.criminalName)}</span>
                  ${m.source ? `<span class="media-source">${capitalizeFirst(m.source)}</span>` : ''}
                </div>
              </div>
            `).join('')
            : '<p class="text-muted" style="padding:var(--sp-4)">No media available</p>'
          }
        </div>
      </div>
    `;

    // Store members data for sections
    container._members = members;
    container._articles = articles;

    // Render section content
    renderMembersTable(members);
    renderArticlesGrid(articles);

    // Bind section events
    bindSectionEvents(members, articles);
  }


  /* ================================================================
     Members Table (with search + pagination + sort)
     ================================================================ */
  function getFilteredMembers(members) {
    let result = [...members];
    const q = sectionState.members.search.toLowerCase();
    if (q) {
      result = result.filter(m =>
        (m.criminalName && m.criminalName.toLowerCase().includes(q)) ||
        (m.crimeType && m.crimeType.toLowerCase().includes(q)) ||
        (m.location && m.location.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sectionState.members.sortCol) {
      result.sort((a, b) => {
        let valA, valB;
        switch (sectionState.members.sortCol) {
          case 'name': valA = (a.criminalName || '').toLowerCase(); valB = (b.criminalName || '').toLowerCase(); break;
          case 'crime': valA = (a.crimeType || '').toLowerCase(); valB = (b.crimeType || '').toLowerCase(); break;
          case 'location': valA = (a.location || '').toLowerCase(); valB = (b.location || '').toLowerCase(); break;
          default: return 0;
        }
        const cmp = valA.localeCompare(valB);
        return sectionState.members.sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }

  function renderMembersTable(members) {
    const tbody = $('#members-tbody');
    if (!tbody) return;

    const filtered = getFilteredMembers(members);
    const s = sectionState.members;
    const start = (s.page - 1) * s.perPage;
    const end = start + s.perPage;
    const page = filtered.slice(start, end);

    if (page.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="5">
          <div class="empty-state" style="min-height:100px">
            <p class="text-muted">No members match your search</p>
          </div>
        </td></tr>`;
    } else {
      tbody.innerHTML = page.map((m, i) => `
        <tr class="animate-fade-in" style="animation-delay:${i * 20}ms">
          <td><span class="font-medium">${highlightMatch(capitalizeFirst(m.criminalName), s.search)}</span></td>
          <td><span class="text-secondary">${m.crimeType ? truncate(capitalizeFirst(m.crimeType), 50) : 'N/A'}</span></td>
          <td><span class="text-secondary">${highlightMatch(capitalizeFirst(m.location), s.search) || 'Unknown'}</span></td>
          <td><span class="text-muted" style="text-transform:capitalize">${m.source || 'Unknown'}</span></td>
          <td><a href="details.html?name=${encodeURIComponent(m.criminalName)}" class="btn-view">View</a></td>
        </tr>
      `).join('');
    }

    // Sort icons
    $$('#members-table th[data-msort]').forEach(th => {
      const col = th.dataset.msort;
      const iconSpan = th.querySelector('.sort-icon');
      th.classList.remove('sort-active');
      if (col === s.sortCol) {
        th.classList.add('sort-active');
        if (iconSpan) iconSpan.innerHTML = s.sortDir === 'asc' ? icons.sortAsc : icons.sortDesc;
      } else {
        if (iconSpan) iconSpan.innerHTML = icons.sortNeutral;
      }
    });

    // Pagination
    renderSectionPagination('members', filtered.length, s.page, s.perPage);
  }


  /* ================================================================
     Articles Grid (with search + pagination)
     ================================================================ */
  function getFilteredArticles(articles) {
    const q = sectionState.articles.search.toLowerCase();
    if (!q) return articles;
    return articles.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.criminalName && a.criminalName.toLowerCase().includes(q)) ||
      (a.source && a.source.toLowerCase().includes(q))
    );
  }

  function renderArticlesGrid(articles) {
    const grid = $('#articles-grid');
    if (!grid) return;

    const filtered = getFilteredArticles(articles);
    const s = sectionState.articles;
    const start = (s.page - 1) * s.perPage;
    const end = start + s.perPage;
    const page = filtered.slice(start, end);

    if (page.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;min-height:100px">
          <p class="text-muted">${articles.length === 0 ? 'No articles available' : 'No articles match your search'}</p>
        </div>`;
    } else {
      grid.innerHTML = page.map((a, i) => {
        const date = formatDate(a.publishedDate);
        const desc = a.description
          ? truncate(a.description, 120)
          : truncate(capitalizeFirst(a.criminalName) + ' — ' + capitalizeFirst(a.crimeType), 100);
        const title = truncate(capitalizeFirst(a.title), 80);
        const imgUrl = a.imageUrl || '';

        return `
          <div class="news-card animate-fade-in" style="animation-delay:${i * 40}ms">
            ${imgUrl ? `<div class="news-card-img" style="background-image:url('${imgUrl}')">
              <span class="news-card-source">${a.source || 'Unknown'}</span>
            </div>` : `<div class="news-card-img" style="display:flex;align-items:center;justify-content:center;background:var(--bg-elevated)">
              <span class="news-card-source">${a.source || 'Unknown'}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="width:48px;height:48px;color:var(--text-muted)"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>
            </div>`}
            <div class="news-card-body">
              <h4 class="news-card-title">${title}</h4>
              <p class="news-card-desc">${desc}</p>
              <div class="news-card-footer">
                <span class="news-card-date">${icons.calendar} ${date}</span>
                ${a.linkToArticle ? `<a href="${a.linkToArticle}" target="_blank" rel="noopener" class="news-card-link">Read More</a>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    renderSectionPagination('articles', filtered.length, s.page, s.perPage);
  }


  /* ================================================================
     Section Pagination (shared for members & articles)
     ================================================================ */
  function renderSectionPagination(section, totalItems, currentPage, perPage) {
    const totalPages = Math.ceil(totalItems / perPage);
    const paginationEl = $(`#${section}-pagination`);
    const infoEl = $(`#${section}-info`);

    if (infoEl) {
      const start = (currentPage - 1) * perPage + 1;
      const end = Math.min(currentPage * perPage, totalItems);
      infoEl.textContent = totalItems > 0
        ? `Showing ${start} to ${end} of ${totalItems}`
        : 'No entries';
    }

    if (!paginationEl) return;
    if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

    let html = `<button class="pagination-btn" data-section="${section}" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

    if (startPage > 1) {
      html += `<button class="pagination-btn" data-section="${section}" data-page="1">1</button>`;
      if (startPage > 2) html += `<span class="pagination-btn" style="cursor:default">...</span>`;
    }
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-section="${section}" data-page="${i}">${i}</button>`;
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += `<span class="pagination-btn" style="cursor:default">...</span>`;
      html += `<button class="pagination-btn" data-section="${section}" data-page="${totalPages}">${totalPages}</button>`;
    }
    html += `<button class="pagination-btn" data-section="${section}" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;

    paginationEl.innerHTML = html;

    // Bind pagination clicks
    paginationEl.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page < 1 || page > totalPages) return;
        sectionState[section].page = page;
        const container = $('#gang-profile-content');
        if (section === 'members') renderMembersTable(container._members);
        if (section === 'articles') renderArticlesGrid(container._articles);
      });
    });
  }


  /* ================================================================
     Section Event Binding
     ================================================================ */
  function bindSectionEvents(members, articles) {
    // Members search
    const membersSearch = $('#members-search');
    if (membersSearch) {
      let timer;
      membersSearch.addEventListener('input', (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          sectionState.members.search = e.target.value.trim();
          sectionState.members.page = 1;
          renderMembersTable(members);
        }, 250);
      });
    }

    // Members sort
    $$('#members-table th[data-msort]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.msort;
        const s = sectionState.members;
        if (s.sortCol === col) {
          if (s.sortDir === 'asc') { s.sortDir = 'desc'; }
          else { s.sortCol = null; s.sortDir = 'asc'; }
        } else {
          s.sortCol = col;
          s.sortDir = 'asc';
        }
        s.page = 1;
        renderMembersTable(members);
      });
    });

    // Articles search
    const articlesSearch = $('#articles-search');
    if (articlesSearch) {
      let timer;
      articlesSearch.addEventListener('input', (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          sectionState.articles.search = e.target.value.trim();
          sectionState.articles.page = 1;
          renderArticlesGrid(articles);
        }, 250);
      });
    }
  }


  /* ================================================================
     Data Loading
     ================================================================ */
  async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');

    if (!name) {
      showError('No gang name specified');
      return;
    }

    renderSkeleton();

    try {
      const members = await DataService.getCriminalsByAffiliation(name);

      if (!members || members.length === 0) {
        showError(`No records found for gang: ${name}`);
        return;
      }

      renderProfile(name, members);
      document.title = `${capitalizeFirst(name)} - CrimiCore`;
    } catch (error) {
      showError(error.message);
    }
  }

  function showError(message) {
    const container = $('#gang-profile-content');
    if (!container) return;
    container.innerHTML = `
      <div class="empty-state" style="min-height:400px">
        ${icons.alert}
        <p class="empty-state-title">Error Loading Gang Profile</p>
        <p class="empty-state-text">${message}</p>
        <a href="gangs.html" class="btn btn-primary mt-4">Back to Gangs</a>
      </div>
    `;
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
      loadProfile();
    });
  }


  /* ================================================================
     Initialize
     ================================================================ */
  function init() {
    initCountryFilter();
    loadProfile();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
