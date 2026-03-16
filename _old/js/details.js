/* ================================================================
   CrimiCore - Criminal Profile Page Logic
   Fetches by name from API, renders profile
   ================================================================ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  /* --- SVG Icons --- */
  const icons = {
    crime: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    gang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    location: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    news: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>`
  };

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr.replace(/\//g, '-'));
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }


  /* ================================================================
     Skeleton
     ================================================================ */
  function renderSkeleton() {
    const container = $('#profile-content');
    if (!container) return;

    container.innerHTML = `
      <div class="profile-header">
        <div class="profile-photo-wrapper">
          <div class="skeleton" style="width:160px;height:200px;border-radius:8px"></div>
        </div>
        <div class="profile-summary" style="flex:1">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
            <div class="skeleton" style="width:220px;height:30px;border-radius:4px"></div>
            <div class="skeleton" style="width:80px;height:22px;border-radius:4px"></div>
          </div>
          <div class="info-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            ${Array.from({ length: 6 }, () => `
              <div style="display:flex;gap:12px">
                <div class="skeleton" style="width:80px;height:14px"></div>
                <div class="skeleton" style="width:120px;height:14px"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="profile-sections" style="margin-top:24px">
        ${Array.from({ length: 2 }, () => `
          <div class="profile-section">
            <div class="skeleton" style="width:150px;height:18px;margin-bottom:16px"></div>
            <div class="skeleton" style="width:100%;height:14px;margin-bottom:8px"></div>
            <div class="skeleton" style="width:85%;height:14px"></div>
          </div>
        `).join('')}
      </div>
    `;
  }


  /* ================================================================
     Profile Rendering
     ================================================================ */
  function renderProfile(c) {
    const container = $('#profile-content');
    if (!container) return;

    const hasImage = c.imageUrl && c.imageUrl.trim();
    const photoHTML = hasImage
      ? `<img class="profile-photo" src="${c.imageUrl}" alt="${c.criminalName}"
             onerror="this.outerHTML='<div class=\\'profile-photo avatar-placeholder\\' style=\\'width:160px;height:200px\\'>${getInitials(c.criminalName)}</div>'">`
      : `<div class="profile-photo avatar-placeholder" style="width:160px;height:200px">${getInitials(c.criminalName)}</div>`;

    const affiliation = c.affiliation && c.affiliation.toLowerCase() !== 'empty' ? c.affiliation : '';
    const gangLink = affiliation
      ? `<a href="gang-details.html?name=${encodeURIComponent(affiliation)}" class="text-link">${capitalizeFirst(affiliation)}</a>`
      : '<span class="text-muted">None</span>';

    container.innerHTML = `
      <!-- Profile Header -->
      <div class="profile-header animate-fade-in">
        <div class="profile-photo-wrapper">
          ${photoHTML}
        </div>
        <div class="profile-summary">
          <div class="profile-name-row">
            <h1 class="profile-name">${capitalizeFirst(c.criminalName)}</h1>
            <span class="badge badge-burglary">${capitalizeFirst(c.crimeType ? c.crimeType.substring(0, 30) : 'Unknown')}${c.crimeType && c.crimeType.length > 30 ? '...' : ''}</span>
          </div>
          <div class="info-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="info-item"><span class="info-label">Location:</span><span class="info-value">${capitalizeFirst(c.location) || 'Unknown'}</span></div>
            <div class="info-item"><span class="info-label">Source:</span><span class="info-value" style="text-transform:capitalize">${c.source || 'Unknown'}</span></div>
            <div class="info-item"><span class="info-label">Published:</span><span class="info-value">${formatDate(c.publishedDate)}</span></div>
            ${c.country ? `<div class="info-item"><span class="info-label">Country:</span><span class="info-value">${capitalizeFirst(c.country)}</span></div>` : ''}
            ${c.publishedBy ? `<div class="info-item"><span class="info-label">Published By:</span><span class="info-value">${capitalizeFirst(c.publishedBy)}</span></div>` : ''}
          </div>
        </div>
      </div>

      <!-- Profile Sections -->
      <div class="profile-sections animate-slide-up">

        <!-- Crime Details -->
        <div class="profile-section">
          <h3>${icons.crime} Crime Details</h3>
          <p style="color:var(--text-primary);font-size:var(--fs-md);line-height:var(--lh-relaxed)">${capitalizeFirst(c.crimeType) || 'No crime details available'}</p>
        </div>

        <!-- Gang Affiliation -->
        <div class="profile-section">
          <h3>${icons.gang} Gang Affiliation</h3>
          <p style="font-size:var(--fs-md)">${gangLink}</p>
        </div>

        ${c.linkToArticle ? `
        <!-- Source Article -->
        <div class="profile-section">
          <h3>${icons.link} Source Article</h3>
          <a href="${c.linkToArticle}" target="_blank" rel="noopener" class="text-link" style="font-size:var(--fs-md);word-break:break-all">${c.linkToArticle}</a>
        </div>
        ` : ''}

        ${c.title ? `
        <!-- News Title -->
        <div class="profile-section">
          <h3>${icons.news} News Title</h3>
          <p style="color:var(--text-primary);font-size:var(--fs-md);line-height:var(--lh-relaxed)">${capitalizeFirst(c.title)}</p>
        </div>
        ` : ''}

        ${c.description ? `
        <!-- Description -->
        <div class="profile-section profile-section-full">
          <h3>${icons.alert} Description</h3>
          <p style="color:var(--text-secondary);font-size:var(--fs-md);line-height:var(--lh-relaxed);white-space:pre-line">${c.description}</p>
        </div>
        ` : ''}

      </div>
    `;
  }


  /* ================================================================
     Data Loading
     ================================================================ */
  async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');

    if (!name) {
      showError('No criminal name specified');
      return;
    }

    renderSkeleton();

    try {
      const results = await DataService.getCriminalByName(name);

      if (!results || results.length === 0) {
        showError(`No record found for: ${name}`);
        return;
      }

      const criminal = results[0];
      renderProfile(criminal);
      document.title = `${capitalizeFirst(criminal.criminalName)} - CrimiCore`;
    } catch (error) {
      showError(error.message);
    }
  }

  function showError(message) {
    const container = $('#profile-content');
    if (!container) return;
    container.innerHTML = `
      <div class="empty-state" style="min-height:400px">
        ${icons.alert}
        <p class="empty-state-title">Error Loading Profile</p>
        <p class="empty-state-text">${message}</p>
        <a href="criminals.html" class="btn btn-primary mt-4">Back to Criminals</a>
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
