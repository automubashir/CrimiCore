/* ================================================================
   CrimiCore - Criminal Profile Page Logic
   Skeleton Loading, Dynamic Rendering, Data Source Toggle
   ================================================================ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  /* --- SVG Icons --- */
  const icons = {
    back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    crime: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    gang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    associates: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    gavel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>`,
    alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    warrant: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    marks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    records: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
    dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  };

  /* --- Crime badge class --- */
  function crimeBadgeClass(crime) {
    const map = {
      'burglary': 'badge-burglary', 'drug trafficking': 'badge-drug-trafficking',
      'fraud': 'badge-fraud', 'assault': 'badge-assault',
      'armed robbery': 'badge-armed-robbery', 'homicide': 'badge-homicide',
      'theft': 'badge-theft', 'kidnapping': 'badge-kidnapping',
      'cybercrime': 'badge-cybercrime', 'arson': 'badge-arson',
      'money laundering': 'badge-money-laundering', 'extortion': 'badge-extortion'
    };
    return map[crime.toLowerCase()] || 'badge-burglary';
  }

  function statusClass(s) { return 'status-' + s.toLowerCase(); }

  function riskClass(level) {
    return 'risk-' + level.toLowerCase();
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }


  /* ================================================================
     Skeleton Rendering
     ================================================================ */
  function renderSkeleton() {
    const container = $('#profile-content');
    if (!container) return;

    container.innerHTML = `
      <!-- Profile Header Skeleton -->
      <div class="profile-header">
        <div class="profile-photo-wrapper">
          <div class="skeleton skeleton-profile-photo" style="width:160px;height:200px;border-radius:8px"></div>
        </div>
        <div class="profile-summary" style="flex:1">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
            <div class="skeleton" style="width:220px;height:30px;border-radius:4px"></div>
            <div class="skeleton" style="width:80px;height:22px;border-radius:4px"></div>
          </div>
          <div class="info-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            ${Array.from({ length: 8 }, () => `
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
  function renderProfile(c) {
    const container = $('#profile-content');
    if (!container) return;

    container.innerHTML = `
      <!-- Profile Header -->
      <div class="profile-header animate-fade-in">
        <div class="profile-photo-wrapper">
          <img class="profile-photo" src="${c.photo}" alt="${c.name}"
               onerror="this.outerHTML='<div class=\\'profile-photo avatar-placeholder\\' style=\\'width:160px;height:200px\\'>${getInitials(c.name)}</div>'">
        </div>
        <div class="profile-summary">
          <div class="profile-name-row">
            <h1 class="profile-name">${c.name}</h1>
            <span class="profile-id">ID ${c.id}</span>
            <span class="badge ${crimeBadgeClass(c.crime)}">${c.crime}</span>
            <span class="status-badge ${statusClass(c.status)}" style="font-size:var(--fs-md)">${c.status}</span>
            <span class="risk-badge ${riskClass(c.riskLevel)}">${c.riskLevel} Risk</span>
          </div>
          <div class="info-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="info-item"><span class="info-label">Age:</span><span class="info-value">${c.age}</span></div>
            <div class="info-item"><span class="info-label">DOB:</span><span class="info-value">${formatDate(c.dateOfBirth)}</span></div>
            <div class="info-item"><span class="info-label">Alias:</span><span class="info-value">"${c.alias}"</span></div>
            <div class="info-item"><span class="info-label">Gender:</span><span class="info-value">${c.gender}</span></div>
            <div class="info-item"><span class="info-label">Address:</span><span class="info-value">${c.address}</span></div>
            <div class="info-item"><span class="info-label">Nationality:</span><span class="info-value">${c.nationality}</span></div>
            <div class="info-item"><span class="info-label">Height:</span><span class="info-value">${c.height}</span></div>
            <div class="info-item"><span class="info-label">Weight:</span><span class="info-value">${c.weight}</span></div>
            <div class="info-item"><span class="info-label">Eye Color:</span><span class="info-value">${c.eyeColor}</span></div>
            <div class="info-item"><span class="info-label">Hair Color:</span><span class="info-value">${c.hairColor}</span></div>
            <div class="info-item"><span class="info-label">Last Seen:</span><span class="info-value">${c.lastKnownLocation}</span></div>
          </div>
        </div>
      </div>

      <!-- Profile Sections -->
      <div class="profile-sections animate-slide-up">

        <!-- Crimes -->
        <div class="profile-section">
          <h3>${icons.crime} Crimes / Charges</h3>
          <div class="tag-list">
            ${c.crimes.map(crime => `<span class="tag">${crime}</span>`).join('')}
          </div>
        </div>

        <!-- Gang Affiliation -->
        <div class="profile-section">
          <h3>${icons.gang} Gang Affiliation</h3>
          <p style="color:var(--text-primary);font-size:var(--fs-md)">${c.gangAffiliation || 'None'}</p>
        </div>

        <!-- Known Associates -->
        <div class="profile-section">
          <h3>${icons.associates} Known Associates</h3>
          ${c.knownAssociates.length > 0
        ? c.knownAssociates.map(a => `
              <div class="associate-item">
                <div class="associate-avatar">${getInitials(a.name)}</div>
                <div>
                  <div class="associate-name">${a.name}</div>
                  <div class="associate-relation">${a.relation}</div>
                </div>
              </div>
            `).join('')
        : '<p class="text-muted">No known associates</p>'
      }
        </div>

        <!-- Previous Convictions -->
        <div class="profile-section">
          <h3>${icons.gavel} Previous Convictions</h3>
          ${c.previousConvictions.length > 0
        ? c.previousConvictions.map(pc => `
              <div class="conviction-item">
                <span class="conviction-crime">${pc.crime}</span>
                <span class="conviction-year">${pc.year}</span>
              </div>
            `).join('')
        : '<p class="text-muted">No previous convictions</p>'
      }
        </div>

        <!-- Distinguishing Marks -->
        <div class="profile-section">
          <h3>${icons.marks} Distinguishing Marks</h3>
          ${c.distinguishingMarks.length > 0
        ? `<ul class="profile-list">${c.distinguishingMarks.map(m => `<li>${m}</li>`).join('')}</ul>`
        : '<p class="text-muted">No distinguishing marks recorded</p>'
      }
        </div>

        <!-- Active Warrants -->
        <div class="profile-section">
          <h3>${icons.warrant} Active Warrants</h3>
          ${c.warrants.length > 0
        ? `<ul class="profile-list">${c.warrants.map(w => `<li>${w}</li>`).join('')}</ul>`
        : '<p style="color:var(--status-active)">No active warrants</p>'
      }
        </div>

        <!-- Additional Information -->
        <div class="profile-section profile-section-full">
          <h3>${icons.alert} Additional Information</h3>
          ${c.additionalInfo.length > 0
        ? c.additionalInfo.map(info => `<div class="note-item">${info}</div>`).join('')
        : '<p class="text-muted">No additional information</p>'
      }
        </div>

      </div>
    `;
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }


  /* ================================================================
     Data Loading
     ================================================================ */
  async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      showError('No criminal ID specified');
      return;
    }

    renderSkeleton();

    try {
      const criminal = await DataService.getCriminalById(id);

      if (!criminal) {
        showError(`No record found for ID: ${id}`);
        return;
      }

      renderProfile(criminal);

      // Update page title
      document.title = `${criminal.name} - CrimiCore`;
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
        <a href="index.html" class="btn btn-primary mt-4">Back to Records</a>
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
