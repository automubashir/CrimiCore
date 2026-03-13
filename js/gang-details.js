/* ================================================================
   CrimiCore - Gang Profile Page Logic
   Fetches members by affiliation, renders profile with tabs
   ================================================================ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  /* --- SVG Icons --- */
  const icons = {
    gang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style="width:10px;height:10px;color:var(--color-primary);flex-shrink:0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  };

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, l => l.toUpperCase());
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
          <div class="skeleton" style="width:200px;height:36px;border-radius:4px;margin-bottom:16px"></div>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${Array.from({ length: 5 }, () => `
              <div class="skeleton" style="width:70%;height:16px"></div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="profile-sections" style="margin-top:24px">
        <div class="profile-section profile-section-full">
          <div class="skeleton" style="width:150px;height:18px;margin-bottom:16px"></div>
          ${Array.from({ length: 3 }, () => `
            <div class="skeleton" style="width:100%;height:14px;margin-bottom:8px"></div>
          `).join('')}
        </div>
      </div>
    `;
  }


  /* ================================================================
     Profile Rendering
     ================================================================ */
  function renderProfile(gangName, members) {
    const container = $('#gang-profile-content');
    if (!container) return;

    // Derive gang info from members
    const locations = [...new Set(members.map(m => m.location).filter(l => l && l !== 'none, none' && l !== ''))];
    const crimes = [...new Set(members.map(m => m.crimeType).filter(Boolean))];
    const sources = [...new Set(members.map(m => m.source).filter(Boolean))];
    const territory = locations[0] || 'Unknown';

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

    // Tabs
    const tabsHTML = `
      <div class="gang-tabs" style="display:flex;gap:0;margin-bottom:var(--sp-6);border-bottom:2px solid var(--border-color)">
        <button class="gang-tab active" data-tab="profiling">Profiling</button>
        <button class="gang-tab" data-tab="members">Members</button>
        <button class="gang-tab" data-tab="activities">Activities</button>
      </div>`;

    // Profiling tab content (like reference image - bullet list with stars)
    const profilingHTML = `
      <div class="gang-tab-content" id="tab-profiling">
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
      </div>`;

    // Members tab content
    const membersHTML = `
      <div class="gang-tab-content" id="tab-members" style="display:none">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Crime</th>
                <th>Location</th>
                <th>Source</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              ${members.map(m => `
                <tr>
                  <td><span class="font-medium">${capitalizeFirst(m.criminalName)}</span></td>
                  <td><span class="text-secondary">${m.crimeType ? capitalizeFirst(m.crimeType).substring(0, 50) : 'N/A'}${m.crimeType && m.crimeType.length > 50 ? '...' : ''}</span></td>
                  <td><span class="text-secondary">${capitalizeFirst(m.location) || 'Unknown'}</span></td>
                  <td><span class="text-muted" style="text-transform:capitalize">${m.source || 'Unknown'}</span></td>
                  <td><a href="details.html?name=${encodeURIComponent(m.criminalName)}" class="btn-view">View</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    // Activities tab content (news articles from members)
    const activitiesHTML = `
      <div class="gang-tab-content" id="tab-activities" style="display:none">
        ${members.filter(m => m.title).length > 0
          ? members.filter(m => m.title).map(m => `
            <div class="note-item" style="border-bottom:1px solid var(--border-color);padding:var(--sp-3) 0">
              <div style="flex:1">
                <div class="font-medium" style="margin-bottom:4px">${capitalizeFirst(m.title)}</div>
                <div class="text-muted text-sm">${m.publishedDate ? new Date(m.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : ''} | ${capitalizeFirst(m.source || '')}</div>
                ${m.linkToArticle ? `<a href="${m.linkToArticle}" target="_blank" rel="noopener" class="text-link text-sm" style="display:inline-block;margin-top:4px">Read Article</a>` : ''}
              </div>
            </div>
          `).join('')
          : '<p class="text-muted">No activity reports available</p>'
        }
      </div>`;

    container.innerHTML = `
      <!-- Gang Header -->
      <div class="profile-header animate-fade-in" style="margin-bottom:var(--sp-6)">
        <div class="profile-photo-wrapper">
          ${gangIcon}
        </div>
        <div class="profile-summary">
          <div class="profile-name-row">
            <h1 class="profile-name">${capitalizeFirst(gangName)}</h1>
          </div>
          ${tabsHTML}
          ${profilingHTML}
          ${membersHTML}
          ${activitiesHTML}
        </div>
      </div>
    `;

    // Bind tab clicks
    container.querySelectorAll('.gang-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.gang-tab').forEach(t => t.classList.remove('active'));
        container.querySelectorAll('.gang-tab-content').forEach(c => c.style.display = 'none');
        tab.classList.add('active');
        const target = container.querySelector(`#tab-${tab.dataset.tab}`);
        if (target) target.style.display = 'block';
      });
    });
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
     Initialize
     ================================================================ */
  function init() {
    loadProfile();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
