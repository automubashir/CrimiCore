/* ================================================================
   CrimiCore - Gang Profile Page Logic
   Skeleton Loading, Dynamic Rendering
   ================================================================ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  /* --- SVG Icons --- */
  const icons = {
    back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
    gang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    crime: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    members: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    territory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    allies: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>`,
    rivals: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    records: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`
  };

  /* --- Threat Level badge class --- */
  function threatBadgeClass(level) {
    return 'risk-' + level.toLowerCase();
  }

  /* --- Gang Status badge class --- */
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

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }


  /* ================================================================
     Skeleton Rendering
     ================================================================ */
  function renderSkeleton() {
    const container = $('#gang-profile-content');
    if (!container) return;

    container.innerHTML = `
      <!-- Profile Header Skeleton -->
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

      <!-- Sections Skeleton -->
      <div class="profile-sections" style="margin-top:24px">
        ${Array.from({ length: 4 }, () => `
          <div class="profile-section">
            <div class="skeleton" style="width:150px;height:18px;margin-bottom:16px"></div>
            <div class="skeleton" style="width:100%;height:14px;margin-bottom:8px"></div>
            <div class="skeleton" style="width:85%;height:14px;margin-bottom:8px"></div>
            <div class="skeleton" style="width:70%;height:14px"></div>
          </div>
        `).join('')}
      </div>
    `;
  }


  /* ================================================================
     Profile Rendering
     ================================================================ */
  function renderProfile(g) {
    const container = $('#gang-profile-content');
    if (!container) return;

    // Generate a gang icon placeholder (no photo for gangs)
    const gangIcon = `
      <div class="profile-photo avatar-placeholder" style="width:160px;height:200px;font-size:2.5rem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:80px;height:80px;color:var(--text-muted)">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>`;

    container.innerHTML = `
      <!-- Profile Header -->
      <div class="profile-header animate-fade-in">
        <div class="profile-photo-wrapper">
          ${gangIcon}
        </div>
        <div class="profile-summary">
          <div class="profile-name-row">
            <h1 class="profile-name">${g.name}</h1>
            <span class="profile-id">${g.id}</span>
            <span class="risk-badge ${threatBadgeClass(g.threatLevel)}">${g.threatLevel} Threat</span>
            <span class="status-badge ${gangStatusClass(g.status)}" style="font-size:var(--fs-md)">${g.status}</span>
          </div>
          <div class="info-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="info-item"><span class="info-label">Leader:</span><span class="info-value">${g.leader}</span></div>
            <div class="info-item"><span class="info-label">Alias:</span><span class="info-value">"${g.leaderAlias}"</span></div>
            <div class="info-item"><span class="info-label">Territory:</span><span class="info-value">${g.territory}</span></div>
            <div class="info-item"><span class="info-label">Founded:</span><span class="info-value">${g.foundedYear}</span></div>
            <div class="info-item"><span class="info-label">Members:</span><span class="info-value font-semibold">${g.memberCount}</span></div>
            <div class="info-item"><span class="info-label">Last Activity:</span><span class="info-value">${formatDate(g.lastActivity)}</span></div>
          </div>
        </div>
      </div>

      <!-- Profile Sections -->
      <div class="profile-sections animate-slide-up">

        <!-- Description -->
        <div class="profile-section profile-section-full">
          <h3>${icons.records} Intelligence Summary</h3>
          <p style="color:var(--text-primary);font-size:var(--fs-md);line-height:var(--lh-relaxed)">${g.description}</p>
        </div>

        <!-- Primary Crimes -->
        <div class="profile-section">
          <h3>${icons.crime} Primary Crimes</h3>
          <div class="tag-list">
            ${g.primaryCrimes.map(crime => `<span class="tag">${crime}</span>`).join('')}
          </div>
        </div>

        <!-- Known Members -->
        <div class="profile-section">
          <h3>${icons.members} Known Members</h3>
          ${g.knownMembers.length > 0
            ? g.knownMembers.map(member => `
              <div class="associate-item">
                <div class="associate-avatar">${getInitials(member)}</div>
                <div>
                  <div class="associate-name">${member}</div>
                  ${g.associatedCriminals.length > 0
                    ? `<div class="associate-relation text-xs">Criminal Record Linked</div>`
                    : ''
                  }
                </div>
              </div>
            `).join('')
            : '<p class="text-muted">No known members on file</p>'
          }
        </div>

        <!-- Allies -->
        <div class="profile-section">
          <h3>${icons.allies} Allied Organizations</h3>
          ${g.allies.length > 0
            ? `<div class="tag-list">${g.allies.map(a => `<span class="tag" style="border-color:var(--status-active);color:var(--status-active)">${a}</span>`).join('')}</div>`
            : '<p class="text-muted">No known alliances</p>'
          }
        </div>

        <!-- Rivals -->
        <div class="profile-section">
          <h3>${icons.rivals} Rival Organizations</h3>
          ${g.rivals.length > 0
            ? `<div class="tag-list">${g.rivals.map(r => `<span class="tag" style="border-color:var(--color-danger);color:var(--color-danger)">${r}</span>`).join('')}</div>`
            : '<p class="text-muted">No known rivals</p>'
          }
        </div>

        <!-- Associated Criminal Records -->
        <div class="profile-section profile-section-full">
          <h3>${icons.gang} Linked Criminal Records</h3>
          ${g.associatedCriminals.length > 0
            ? `<div class="tag-list">${g.associatedCriminals.map(id => `
                <a href="details.html?id=${id}" class="tag" style="cursor:pointer;border-color:var(--color-primary);color:var(--color-primary);text-decoration:none">
                  ${id} — View Record
                </a>
              `).join('')}</div>`
            : '<p class="text-muted">No linked criminal records</p>'
          }
        </div>

      </div>
    `;
  }


  /* ================================================================
     Data Loading
     ================================================================ */
  async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      showError('No gang ID specified');
      return;
    }

    renderSkeleton();

    try {
      const gang = await DataService.getGangById(id);

      if (!gang) {
        showError(`No record found for ID: ${id}`);
        return;
      }

      renderProfile(gang);

      // Update page title
      document.title = `${gang.name} - CrimiCore`;
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
