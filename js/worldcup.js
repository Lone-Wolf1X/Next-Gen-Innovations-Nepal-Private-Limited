/* =========================================================
   World Cup Predictor JS (With Real Data & Auto Draws)
   ========================================================= */

// --- STATE ---
window.currentUser = null; 
let matchesToRender = [];

// Capture referrer UID from URL (?ref=...)
const urlParams = new URLSearchParams(window.location.search);
const refParam = urlParams.get('ref');
if (refParam) {
  localStorage.setItem('wc_referrer_uid', refParam);
}
let globalLeaderboard = [];
let latestDrawData = null;
let currentPredictorsCount = 0;
const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

// --- UTILS ---
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getColor(index) {
  const idx = Math.abs(index) % 6;
  if (idx === 0) return '#2563EB';
  if (idx === 1) return '#10B981';
  if (idx === 2) return '#F59E0B';
  if (idx === 3) return '#8B5CF6';
  if (idx === 4) return '#EC4899';
  return '#14B8A6';
}

function getRandomColorFromPalette() {
  const rand = Math.floor(Math.random() * 5);
  if (rand === 0) return '#3B82F6';
  if (rand === 1) return '#10B981';
  if (rand === 2) return '#F59E0B';
  if (rand === 3) return '#EF4444';
  return '#8B5CF6';
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', async () => {
  await fetchRealMatches();
  renderMatches();
  await fetchDrawStatus();
  await renderLeaderboard();
  
  await fetchStandings();
  await fetchFixtures();

  // Start countdown timer loop
  setInterval(updateCountdowns, 1000);
});

// --- TAB SWITCHING ---
function switchWCTab(tabId) {
  // Update Tabs
  document.querySelectorAll('.wc-tabs li').forEach(li => li.classList.remove('active'));
  event.target.classList.add('active');
  
  // Update Content Sections
  document.querySelectorAll('.tab-content').forEach(sec => sec.style.display = 'none');
  document.getElementById('tab_' + tabId).style.display = 'block';
  
  // Custom action for spin wheel tab
  if (tabId === 'spinwheel') {
    fetchDrawStatus();
  }
}

// --- FETCH REAL DATA FROM ESPN API ---
async function fetchRealMatches() {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    const data = await res.json();
    
    if (data && data.events && data.events.length > 0) {
      matchesToRender = data.events.map((e, index) => {
        const teamA = e.competitions[0].competitors[0];
        const teamB = e.competitions[0].competitors[1];
        return {
          id: 'real_' + index,
          rawId: e.id,
          teamA: teamA.team.displayName || teamA.team.name,
          flagA: teamA.team.logo || 'https://flagcdn.com/w160/un.png',
          teamB: teamB.team.displayName || teamB.team.name,
          flagB: teamB.team.logo || 'https://flagcdn.com/w160/un.png',
          rawDate: e.date,
          time: new Date(e.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' NPT',
          status: e.status.type.shortDetail
        };
      });
      document.querySelector('.live-pulse').innerText = 'LIVE ESPN DATA';
    } else {
      matchesToRender = [];
      document.querySelector('.live-pulse').innerText = 'NO MATCHES TODAY';
      document.querySelector('.live-pulse').style.background = '#6b7280';
    }
  } catch (err) {
    console.error("Failed to fetch real data", err);
    matchesToRender = [];
    document.querySelector('.live-pulse').innerText = 'API UNAVAILABLE';
  }
}

window.updateAuthUI = function() {
  const panel = document.getElementById('authPanel');
  const dashHeader = document.getElementById('dashboardHeader');
  const heroTitle = document.querySelector('.wc-title');
  const heroSubtitle = document.querySelector('.wc-subtitle');
  const checkinBtn = document.getElementById('checkinBtn');
  const referralCard = document.getElementById('referralCard');
  
  if (window.currentUser) {
    if (panel) panel.style.display = 'none';
    if (dashHeader) dashHeader.style.display = 'block';
    document.body.classList.add('dashboard-active');
    
    document.getElementById('dashName').innerText = window.currentUser.name;
    const flagEl = document.getElementById('dashFlag');
    if (flagEl) {
      if (window.currentUser.country === 'Nepal') {
        flagEl.innerText = '🇳🇵';
      } else if (window.currentUser.country === 'International') {
        flagEl.innerText = '🌎';
      } else {
        flagEl.innerText = '';
      }
    }
    
    document.getElementById('dashAvatar').src = window.currentUser.avatar;
    document.getElementById('dashPoints').innerText = window.currentUser.points;

    // Check-in status
    if (checkinBtn) {
      if (window.currentUser.checkedInToday) {
        checkinBtn.disabled = true;
        checkinBtn.innerText = 'Checked In Today! ✅';
      } else {
        checkinBtn.disabled = false;
        checkinBtn.innerText = '📅 Check-In (+50 pts)';
      }
    }
    
    heroTitle.innerHTML = `My Prediction <span class="highlight-green">Dashboard</span>`;
    heroSubtitle.innerHTML = `Lock in your predictions below and climb the leaderboard to win the Grand Prize.`;
    
    // Enable all prediction buttons
    document.querySelectorAll('.btn-lock').forEach(btn => {
      if(btn.innerText.includes('Login')) {
        btn.disabled = false;
        btn.innerText = 'Lock Prediction';
      }
    });

    // Referral card display
    if (referralCard) {
      referralCard.style.display = 'block';
      const inviteUrl = window.location.origin + window.location.pathname + '?ref=' + window.currentUser.uid;
      document.getElementById('referralUrlInput').value = inviteUrl;
    }

    // Dynamic milestones texts
    const isNepal = (window.currentUser.country === 'Nepal');
    updateMilestoneTexts(isNepal);
  } else {
    if (panel) panel.style.display = 'inline-flex';
    if (dashHeader) dashHeader.style.display = 'none';
    document.body.classList.remove('dashboard-active');
    
    heroTitle.innerHTML = `World Cup Feat <span class="highlight-green">2026</span>`;
    heroSubtitle.innerHTML = `World Cup Feat, organized by Next Gen, ma swagat chha! Yaha match details sab herna sakinchha, saathai predict garera dynamic prize pool direct jitna sakinchha!`;
    
    // Disable all prediction buttons
    document.querySelectorAll('.btn-lock').forEach(btn => {
      if(!btn.classList.contains('locked')) {
        btn.disabled = true;
        btn.innerText = 'Login to Predict';
        btn.style.background = '';
      }
    });

    if (referralCard) referralCard.style.display = 'none';
    updateMilestoneTexts(true);
  }
}

// Copy referral link utility
window.copyReferralLink = function() {
  const copyText = document.getElementById('referralUrlInput');
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value).then(() => {
    const msg = document.getElementById('referralCopyMsg');
    if (msg) {
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 2000);
    }
  });
}

// Welcome modal setup helper
let selectedWelcomeCountry = 'Nepal';
window.setSelectCountry = function(country) {
  selectedWelcomeCountry = country;
  const npCard = document.getElementById('countryNP');
  const intlCard = document.getElementById('countryIntl');
  
  if (country === 'Nepal') {
    npCard.classList.add('selected');
    npCard.style.borderColor = '#10b981';
    npCard.style.boxShadow = '0 0 10px rgba(16,185,129,0.1)';
    intlCard.classList.remove('selected');
    intlCard.style.borderColor = '#e2e8f0';
    intlCard.style.boxShadow = 'none';
  } else {
    intlCard.classList.add('selected');
    intlCard.style.borderColor = '#10b981';
    intlCard.style.boxShadow = '0 0 10px rgba(16,185,129,0.1)';
    npCard.classList.remove('selected');
    npCard.style.borderColor = '#e2e8f0';
    npCard.style.boxShadow = 'none';
  }
}

window.submitWelcomeSetup = async function() {
  if (!window.currentUser) return;
  const wantsNotifications = document.getElementById('wantsNotifications').checked;
  document.getElementById('welcomeModal').style.display = 'none';
  localStorage.setItem('wc_country_set', 'true');

  try {
    // Save notifications consent
    await fetch('/api/worldcup/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: window.currentUser.name,
        email: window.currentUser.email || null,
        notificationsEnabled: wantsNotifications
      })
    });

    // Save country preference
    const res = await fetch('/api/worldcup/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: window.currentUser.idToken,
        country: selectedWelcomeCountry
      })
    });

    if (res.ok) {
      const data = await res.json();
      window.currentUser.country = data.country;
      window.updateAuthUI();
      alert(`Welcome! Your region is set to ${data.country}. Active prize pools have been loaded.`);
    }
  } catch (err) {
    console.error("Failed to submit welcome setup:", err);
  }
}

function updateMilestoneTexts(isNepal) {
  const t1Title = document.querySelector('#tier1Card h5');
  const t1Sub = document.querySelector('#tier1Card p');
  const t2Title = document.querySelector('#tier2Card h5');
  const t2Sub = document.querySelector('#tier2Card p');
  const t3Title = document.querySelector('#tier3Card h5');
  const t3Sub = document.querySelector('#tier3Card p');
  
  if (isNepal) {
    if (t1Title) t1Title.innerHTML = '🥉 Rs. 100 Recharge';
    if (t1Sub) t1Sub.innerHTML = 'Unlocked at 100+ Predictors';
    if (t2Title) t2Title.innerHTML = '🥈 Rs. 500 Recharge';
    if (t2Sub) t2Sub.innerHTML = 'Unlocked at 500+ Predictors';
    if (t3Title) t3Title.innerHTML = '🏆 Grand Gift Hamper';
    if (t3Sub) t3Sub.innerHTML = 'Smartwatch + WC T-Shirt (1000+ Predictors)';
  } else {
    if (t1Title) t1Title.innerHTML = '🥉 Jersey Lucky Entry';
    if (t1Sub) t1Sub.innerHTML = 'Unlocked at 100+ Predictors';
    if (t2Title) t2Title.innerHTML = '🥈 Jersey Hamper Upgrade';
    if (t2Sub) t2Sub.innerHTML = 'Unlocked at 500+ Predictors';
    if (t3Title) t3Title.innerHTML = '🏆 Nepal Team Jersey Set';
    if (t3Sub) t3Sub.innerHTML = 'Top 3 International Leaders (1000+ Predictors)';
  }
}

// --- DAILY CHECK-IN ---
window.wcDailyCheckin = async () => {
  if (!window.currentUser) return;
  const btn = document.getElementById('checkinBtn');
  btn.disabled = true;
  btn.innerText = 'Checking In...';
  
  try {
    const res = await fetch('/api/worldcup/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: window.currentUser.idToken })
    });
    
    if (res.ok) {
      const data = await res.json();
      window.currentUser.points = data.points;
      window.currentUser.checkedInToday = true;
      window.updateAuthUI();
      triggerConfetti();
      alert("🎉 Daily check-in successful! +50 points added.");
    } else {
      const err = await res.json();
      alert(err.error || "Check-in failed");
      btn.disabled = false;
      btn.innerText = '📅 Check-In (+50 pts)';
    }
  } catch (err) {
    console.error("Check-in failed", err);
    alert("Connection error during check-in.");
    btn.disabled = false;
    btn.innerText = '📅 Check-In (+50 pts)';
  }
};

async function submitConsent(wantsNotifications) {
  if (!currentUser) return;
  document.getElementById('welcomeModal').style.display = 'none';

  try {
    await fetch('/api/worldcup/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: currentUser.name,
        email: currentUser.email || null,
        notificationsEnabled: wantsNotifications
      })
    });
    if(wantsNotifications) {
      alert("Awesome! We'll keep you updated on upcoming matches.");
    }
  } catch (err) {
    console.error("Failed to register user to database", err);
  }
}

// --- RENDER MATCHES & COUNTDOWN ---
function renderMatches() {
  const container = document.getElementById('matchesContainer');
  let html = '';

  const now = Date.now();

  matchesToRender.forEach(m => {
    const hasStarted = m.rawDate ? new Date(m.rawDate).getTime() <= now : false;
    const disabledAttr = hasStarted ? 'disabled' : '';
    const btnText = hasStarted ? 'Match Started (Locked)' : 'Login to Predict';
    const btnClass = hasStarted ? 'btn-lock locked' : 'btn-lock';
    const bgStyle = hasStarted ? 'background: #94a3b8; cursor: not-allowed; box-shadow: none;' : '';

    html += `
      <div class="match-card" data-date="${m.rawDate}">
        <div class="match-status">
          ⏳ ${m.time} | ${m.status} 
          <span class="match-countdown" id="cd_${m.id}" style="display:none;"></span>
        </div>
        <div class="match-teams">
          <div class="team">
            <img src="${m.flagA}" alt="${m.teamA}">
            <div class="team-name">${m.teamA}</div>
          </div>
          <div class="match-vs">VS</div>
          <div class="team">
            <img src="${m.flagB}" alt="${m.teamB}">
            <div class="team-name">${m.teamB}</div>
          </div>
        </div>
        <div style="text-align:center; margin-top:12px; margin-bottom: 5px;">
          <button class="btn btn-outline" style="padding: 6px 16px; font-size: 0.8rem; border-color: rgba(15, 28, 63, 0.12);" onclick="viewLineup('${m.rawId}', '${m.teamA.replace(/'/g, "\\'")}', '${m.teamB.replace(/'/g, "\\'")}')">View Lineup & Details</button>
        </div>
        <div class="prediction-inputs">
          <input type="number" id="scoreA_${m.id}" class="score-input" min="0" max="15" value="0" ${disabledAttr}>
          <button class="${btnClass}" id="btn_${m.id}" style="${bgStyle}" onclick="lockPrediction('${m.id}', '${m.teamA.replace(/'/g, "\\'")}', '${m.teamB.replace(/'/g, "\\'")}')" disabled>${btnText}</button>
          <input type="number" id="scoreB_${m.id}" class="score-input" min="0" max="15" value="0" ${disabledAttr}>
        </div>
      </div>
    `;
  });
  
  if(matchesToRender.length === 0) {
    html = `
      <div class="wc-empty-state">
        <h3>No Matches Today ⚽</h3>
        <p>The FIFA World Cup 2026 has not started yet. Check back when the tournament kicks off!</p>
      </div>`;
  }
  
  container.innerHTML = html;
}

function updateCountdowns() {
  const now = new Date().getTime();
  
  matchesToRender.forEach(m => {
    if(!m.rawDate) return;
    const matchTime = new Date(m.rawDate).getTime();
    const diff = matchTime - now;
    const cdSpan = document.getElementById('cd_' + m.id);
    
    if (diff > 0 && diff <= 10800000) {
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mMin = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      if(cdSpan) {
        cdSpan.style.display = 'inline-block';
        cdSpan.innerText = `Starts in: ${h.toString().padStart(2, '0')}:${mMin.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
    } else {
      if(cdSpan) cdSpan.style.display = 'none';
    }
  });

  // Daily Draw Countdown (12:00 PM)
  const drawTimer = document.getElementById('drawTimer');
  if (drawTimer) {
    const rightNow = new Date();
    let target = new Date(rightNow.getFullYear(), rightNow.getMonth(), rightNow.getDate(), 12, 0, 0);
    if (rightNow.getTime() > target.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    
    const diff = target.getTime() - rightNow.getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    drawTimer.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}

// --- FETCH STANDINGS & FIXTURES ---
async function fetchStandings() {
  const container = document.getElementById('standingsContainer');
  try {
    const res = await fetch('https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings');
    const data = await res.json();
    
    if (data && data.children && data.children.length > 0) {
      let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">';
      
      data.children.forEach(group => {
        html += '\n<div class="wc-card" style="margin-bottom: 20px;">\n' +
                '  <h3 style="background: rgba(37, 99, 235, 0.08); color: var(--indigo); padding: 6px 14px; border-radius: 20px; display:inline-block; margin-bottom:15px; font-size:0.95rem; font-weight:700;">' + escapeHtml(group.name) + '</h3>\n' +
                '  <table class="standings-table">\n' +
                '    <thead>\n' +
                '      <tr>\n' +
                '        <th>Team</th>\n' +
                '        <th style="text-align:center;">P</th>\n' +
                '        <th style="text-align:center;">W</th>\n' +
                '        <th style="text-align:center;">D</th>\n' +
                '        <th style="text-align:center;">L</th>\n' +
                '        <th style="text-align:center;">GD</th>\n' +
                '        <th style="text-align:center; color: var(--indigo);">Pts</th>\n' +
                '      </tr>\n' +
                '    </thead>\n' +
                '    <tbody>\n';
        
        group.standings.entries.forEach(entry => {
            const team = entry.team;
            const stats = entry.stats;
            const getStat = (name) => {
              const s = stats.find(x => x.name === name);
              return s ? s.value : 0;
            };
            const p = getStat('gamesPlayed');
            const w = getStat('wins');
            const d = getStat('ties');
            const l = getStat('losses');
            const gd = getStat('pointDifferential');
            const pts = getStat('points');
            const flag = team.logos && team.logos.length > 0 ? team.logos[0].href : 'https://flagcdn.com/w40/un.png';
            
            html += '\n<tr>\n' +
                    '  <td style="display:flex; align-items:center; gap:10px;">\n' +
                    '    <img src="' + escapeHtml(flag) + '" style="width:26px; height:18px; border-radius:4px; border:1px solid rgba(0,0,0,0.08); object-fit:cover;">\n' +
                    '    <span style="font-weight:700; color: var(--text-main); font-family: \'Outfit\', sans-serif;">' + escapeHtml(team.displayName || team.name) + '</span>\n' +
                    '  </td>\n' +
                    '  <td style="text-align:center; font-weight: 500;">' + escapeHtml(p) + '</td>\n' +
                    '  <td style="text-align:center; font-weight: 500;">' + escapeHtml(w) + '</td>\n' +
                    '  <td style="text-align:center; font-weight: 500;">' + escapeHtml(d) + '</td>\n' +
                    '  <td style="text-align:center; font-weight: 500;">' + escapeHtml(l) + '</td>\n' +
                    '  <td style="text-align:center; font-weight: 500;">' + escapeHtml(gd) + '</td>\n' +
                    '  <td style="text-align:center; font-weight:800; color: var(--indigo);">' + escapeHtml(pts) + '</td>\n' +
                    '</tr>\n';
        });
        
        html += '</tbody></table></div>';
      });
      
      html += '</div>';
      container.innerHTML = html;
    } else {
      container.innerHTML = `
        <div class="wc-empty-state">
          <h3>Tournament Groups TBD 🌍</h3>
          <p>Group allocations and standings for the 2026 World Cup will appear here once the qualifiers conclude.</p>
        </div>
      `;
    }
  } catch (err) {
    container.innerHTML = `<p>Standings API unavailable.</p>`;
  }
}

async function fetchFixtures() {
  const container = document.getElementById('fixturesContainer');
  try {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 30);
    
    const formatDate = (d) => d.toISOString().slice(0,10).replace(/-/g, '');
    const datesStr = `${formatDate(today)}-${formatDate(future)}`;
    
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${datesStr}`);
    const data = await res.json();
    
    if (data && data.events && data.events.length > 0) {
      let html = '<div class="fixtures-grid">';
      
      data.events.forEach(e => {
        const teamA = e.competitions[0].competitors[0];
        const teamB = e.competitions[0].competitors[1];
        
        const nameA = teamA.team.displayName || teamA.team.name;
        const flagA = teamA.team.logo || 'https://flagcdn.com/w160/un.png';
        const nameB = teamB.team.displayName || teamB.team.name;
        const flagB = teamB.team.logo || 'https://flagcdn.com/w160/un.png';
        
        const d = new Date(e.date);
        const dayStr = d.toLocaleString([], {weekday:'short', month:'short', day:'numeric'});
        const timeStr = d.toLocaleString([], {hour: '2-digit', minute:'2-digit'}) + ' NPT';
        const status = e.status.type.shortDetail;
        
        html += '\n<div class="fixture-card-modern">\n' +
                '  <div class="date-badge">' + escapeHtml(dayStr) + '</div>\n' +
                '  <div style="text-align:center; font-size:0.8rem; color:#9ca3af; margin-top:5px; margin-bottom:5px;">\n' +
                '    ' + escapeHtml(timeStr) + ' | <span style="color:#10b981;">' + escapeHtml(status) + '</span>\n' +
                '  </div>\n' +
                '  <div class="fixture-teams-modern">\n' +
                '    <div class="fixture-team-modern">\n' +
                '      <img src="' + escapeHtml(flagA) + '" alt="' + escapeHtml(nameA) + '">\n' +
                '      <span>' + escapeHtml(nameA) + '</span>\n' +
                '    </div>\n' +
                '    <div class="fixture-vs-modern">VS</div>\n' +
                '    <div class="fixture-team-modern">\n' +
                '      <img src="' + escapeHtml(flagB) + '" alt="' + escapeHtml(nameB) + '">\n' +
                '      <span>' + escapeHtml(nameB) + '</span>\n' +
                '    </div>\n' +
                '  </div>\n' +
                '  <button class="btn btn-outline" style="width:100%; border-color: #10b981; color: #10b981;" onclick="viewLineup(\'' + escapeHtml(e.id) + '\', \'' + escapeHtml(nameA).replace(/'/g, "\\'") + '\', \'' + escapeHtml(nameB).replace(/'/g, "\\'") + '\')">View Match Details</button>\n' +
                '</div>\n';
      });
      html += '</div>';
      container.innerHTML = html;
    } else {
      container.innerHTML = `
        <div class="wc-empty-state">
          <h3>Full Schedule TBD 📅</h3>
          <p>The official fixture list for the 48 teams will be populated automatically prior to June 2026.</p>
        </div>
      `;
    }
  } catch (err) {
    console.error("Failed to fetch fixtures", err);
  }
}

// --- LOCK PREDICTION & SHARE ---
let currentShareText = '';

async function lockPrediction(matchId, teamA, teamB) {
  if (!window.currentUser) return;
  
  const scoreA = document.getElementById(`scoreA_${matchId}`).value;
  const scoreB = document.getElementById(`scoreB_${matchId}`).value;
  
  if (scoreA === '' || scoreB === '') {
    alert("Please enter both scores before locking.");
    return;
  }
  
  const btn = document.getElementById(`btn_${matchId}`);
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Saving... ⏳';
  btn.disabled = true;

  try {
    const res = await fetch('/api/worldcup/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: window.currentUser.idToken,
        matchId: String(matchId),
        scoreA: parseInt(scoreA, 10),
        scoreB: parseInt(scoreB, 10)
      })
    });

    if (!res.ok) throw new Error("Failed to save prediction");

    // Re-fetch draw status to update current predictor counts
    await fetchDrawStatus();

    btn.innerHTML = 'Update Prediction ✅';
    btn.classList.add('locked');
    btn.disabled = false;

    const preview = document.getElementById('shareCardPreview');
    preview.innerHTML = '<h4>NextGen Predictor</h4>\n' +
                        '<div class="share-match">' + escapeHtml(teamA) + ' vs ' + escapeHtml(teamB) + '</div>\n' +
                        '<div class="share-pred">' + escapeHtml(scoreA) + ' - ' + escapeHtml(scoreB) + '</div>\n' +
                        '<p style="margin-top:10px; font-size:0.8rem; color:#f3f4f6;">Can you beat my prediction?</p>';

    currentShareText = `I predicted ${teamA} ${scoreA} - ${scoreB} ${teamB} on the NextGen Predictor Arena! 🏆 Can you beat my exact score? Play here: https://nextgeninnovationsnepal.com/worldcup`;

    document.getElementById('shareModal').style.display = 'flex';
  } catch (error) {
    console.error(error);
    alert("Error saving prediction. Please try again.");
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

window.viewLineup = function(matchId, teamAName, teamBName) {
  window.location.href = `match-details.html?id=${matchId}`;
}

function closeShareModal() {
  document.getElementById('shareModal').style.display = 'none';
}

function shareToFacebook() {
  const url = encodeURIComponent('https://nextgeninnovationsnepal.com/worldcup');
  const quote = encodeURIComponent(currentShareText);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'width=600,height=400');
}

function copyShareLink() {
  navigator.clipboard.writeText(currentShareText).then(() => {
    alert("Prediction text copied! Paste it on WhatsApp, Instagram, or TikTok.");
  });
}

// --- RENDER LEADERBOARD & PREVIEWS ---
async function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  const listPreview = document.getElementById('leaderboardListPreview');
  let html = '';
  
  try {
    const res = await fetch('/api/worldcup/leaderboard');
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    globalLeaderboard = await res.json();
  } catch (err) {
    console.error(err);
    globalLeaderboard = [];
  }

  if (globalLeaderboard.length === 0) {
    if (list) list.innerHTML = `<li style="justify-content:center; color:#6b7280;">No data yet.</li>`;
    if (listPreview) listPreview.innerHTML = `<li style="justify-content:center; color:#6b7280;">No data yet.</li>`;
    return;
  }

  // Build Leaderboard HTML
  globalLeaderboard.forEach((u, i) => {
    const avatarId = (u.name.length % 70) + 1;
    let rankClass = 'other';
    let rankText = `#${i+1}`;
    if (i === 0) { rankClass = 'gold'; rankText = '🥇'; }
    else if (i === 1) { rankClass = 'silver'; rankText = '🥈'; }
    else if (i === 2) { rankClass = 'bronze'; rankText = '🥉'; }

    html += '\n<li>\n' +
            '  <span class="lb-rank ' + escapeHtml(rankClass) + '">' + escapeHtml(rankText) + '</span>\n' +
            '  <div class="lb-user">\n' +
            '    <img src="https://i.pravatar.cc/150?img=' + escapeHtml(avatarId) + '" alt="' + escapeHtml(u.name) + '">\n' +
            '    <span>' + escapeHtml(u.name) + '</span>\n' +
            '  </div>\n' +
            '  <span class="lb-score">' + escapeHtml(u.points) + ' pts</span>\n' +
            '</li>\n';
  });
  if (list) list.innerHTML = html;

  // Build Mini Preview
  if (listPreview) {
    let previewHtml = '';
    globalLeaderboard.slice(0, 5).forEach((u, i) => {
      const avatarId = (u.name.length % 70) + 1;
      let rankClass = 'other';
      let rankText = `#${i+1}`;
      if (i === 0) { rankClass = 'gold'; rankText = '🥇'; }
      else if (i === 1) { rankClass = 'silver'; rankText = '🥈'; }
      else if (i === 2) { rankClass = 'bronze'; rankText = '🥉'; }

      previewHtml += '\n<li style="padding: 10px 15px; border-radius: 12px; margin-bottom: 8px;">\n' +
                     '  <span class="lb-rank ' + escapeHtml(rankClass) + '" style="width:30px; height:30px; font-size:0.95rem;">' + escapeHtml(rankText) + '</span>\n' +
                     '  <div class="lb-user">\n' +
                     '    <img src="https://i.pravatar.cc/150?img=' + escapeHtml(avatarId) + '" alt="' + escapeHtml(u.name) + '" style="width:32px; height:32px;">\n' +
                     '    <span style="font-size:0.9rem; font-weight:700;">' + escapeHtml(u.name) + '</span>\n' +
                     '  </div>\n' +
                     '  <span class="lb-score" style="font-size:0.8rem; padding:4px 10px;">' + escapeHtml(u.points) + ' pts</span>\n' +
                     '</li>\n';
    });
    listPreview.innerHTML = previewHtml;
  }
}

// --- SPIN DRAW STATUS & POOL SETUP ---
async function fetchDrawStatus() {
  try {
    const res = await fetch('/api/worldcup/draw-status');
    const data = await res.json();
    if (data.success) {
      latestDrawData = data.latestDraw;
      currentPredictorsCount = data.predictorsCountToday || 0;
      updatePrizePoolUI();
      initSpinWheel();
    }
  } catch (err) {
    console.error("Failed to fetch draw status", err);
  }
}

function updatePrizePoolUI() {
  const countSpan = document.getElementById('livePredictorCount');
  const progressBar = document.getElementById('prizeProgressBar');
  
  if (countSpan) countSpan.innerText = currentPredictorsCount;
  if (progressBar) {
    const pct = Math.min((currentPredictorsCount / 1000) * 100, 100);
    progressBar.style.width = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', currentPredictorsCount);
  }

  const t1Card = document.getElementById('tier1Card');
  const t1Badge = document.getElementById('tier1Badge');
  const t2Card = document.getElementById('tier2Card');
  const t2Badge = document.getElementById('tier2Badge');
  const t3Card = document.getElementById('tier3Card');
  const t3Badge = document.getElementById('tier3Badge');

  if (currentPredictorsCount >= 100) {
    t1Card?.classList.add('unlocked');
    if (t1Badge) { t1Badge.innerText = 'UNLOCKED'; t1Badge.className = 'badge bg-success'; }
  } else {
    t1Card?.classList.remove('unlocked');
    if (t1Badge) { t1Badge.innerText = 'LOCKED'; t1Badge.className = 'badge bg-secondary'; }
  }

  if (currentPredictorsCount >= 500) {
    t2Card?.classList.add('unlocked');
    if (t2Badge) { t2Badge.innerText = 'UNLOCKED'; t2Badge.className = 'badge bg-success'; }
  } else {
    t2Card?.classList.remove('unlocked');
    if (t2Badge) { t2Badge.innerText = 'LOCKED'; t2Badge.className = 'badge bg-secondary'; }
  }

  if (currentPredictorsCount >= 1000) {
    t3Card?.classList.add('unlocked');
    if (t3Badge) { t3Badge.innerText = 'UNLOCKED'; t3Badge.className = 'badge bg-success'; }
  } else {
    t3Card?.classList.remove('unlocked');
    if (t3Badge) { t3Badge.innerText = 'LOCKED'; t3Badge.className = 'badge bg-secondary'; }
  }
}

// --- SPIN WHEEL LOGIC (LATEST AUTO DRAW) ---
async function initSpinWheel() {
  const wheel = document.getElementById('spinWheel');
  const spinBtn = document.getElementById('spinBtn');
  const drawTitle = document.getElementById('drawStatusTitle');
  
  if (!latestDrawData) {
    activeWheelNames = ['Predict to Win!', 'Join Arena', 'Spin Arena', 'Daily Draws'];
    if (spinBtn) {
      spinBtn.disabled = true;
      spinBtn.innerText = 'Waiting for 12:00 PM Draw...';
    }
    if (drawTitle) drawTitle.innerText = "🎡 Daily Draw: Pending";
  } else {
    activeWheelNames = latestDrawData.correctPredictors || [];
    if (activeWheelNames.length === 0) {
      activeWheelNames = ['No Exact Predictors', 'Try Today!', 'Predict Arena', 'Next Draw 12PM'];
      if (spinBtn) {
        spinBtn.disabled = true;
        spinBtn.innerText = 'No Predictors Scored Exact Score';
      }
      if (drawTitle) drawTitle.innerText = `🎡 Daily Draw: No Scorers`;
    } else {
      if (spinBtn) {
        spinBtn.disabled = false;
        spinBtn.innerText = 'Watch Draw Replay 🎡';
      }
      if (drawTitle) drawTitle.innerText = `🎡 Draw: ${latestDrawData.matchName}`;
    }
  }

  const segmentAngle = 360 / activeWheelNames.length;
  let gradientStr = [];
  let currentAngle = 0;
  
  if (!wheel) return;
  wheel.innerHTML = '';

  activeWheelNames.forEach((name, i) => {
    const color = getColor(i);
    gradientStr.push(color + ' ' + currentAngle + 'deg ' + (currentAngle + segmentAngle) + 'deg');
    currentAngle += segmentAngle;
    
    const labelAngle = currentAngle + (segmentAngle / 2);
    
    const label = document.createElement('div');
    label.className = 'wheel-segment';
    label.style.transform = 'rotate(' + labelAngle + 'deg)';
    label.innerText = String(name).substring(0, 15);
    wheel.appendChild(label);
  });
  
  wheel.style.background = 'conic-gradient(' + gradientStr.join(', ') + ')';
}

window.watchDrawReplay = function() {
  if (!latestDrawData || activeWheelNames.length === 0 || latestDrawData.winnerName === 'No Winner') return;

  const spinBtn = document.getElementById('spinBtn');
  const wheel = document.getElementById('spinWheel');
  const winnerDisplay = document.getElementById('winnerDisplay');
  const winnerText = document.getElementById('winnerText');

  spinBtn.disabled = true;
  winnerDisplay.style.display = 'none';

  const winnerIndex = activeWheelNames.indexOf(latestDrawData.winnerName);
  if (winnerIndex === -1) return;

  const segmentAngle = 360 / activeWheelNames.length;
  const centerAngle = (winnerIndex * segmentAngle) + (segmentAngle / 2);
  const baseRotation = 360 - centerAngle;
  const extraSpins = 360 * 5; 
  const totalDeg = baseRotation + extraSpins;

  if (!wheel) return;
  wheel.style.transition = 'transform 5s cubic-bezier(0.1, 0.9, 0.1, 1)';
  wheel.style.transform = `rotate(${totalDeg}deg)`;

  setTimeout(() => {
    winnerText.innerText = `${latestDrawData.winnerName} (${latestDrawData.prizeUnlocked})`;
    winnerDisplay.style.display = 'block';
    triggerConfetti();
    spinBtn.innerText = 'Watch Replay Again 🎡';
    spinBtn.disabled = false;
    
    setTimeout(() => {
      wheel.style.transition = 'none';
      wheel.style.transform = `rotate(${baseRotation}deg)`;
    }, 100);
  }, 5000);
}

// --- HIGH PERFORMANCE INLINE CONFETTI ---
function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  let particles = [];
  const cPalette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 5 + 3,
      color: getRandomColorFromPalette(),
      vx: Math.random() * 4 - 2,
      vy: Math.random() * 6 + 3
    });
  }
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    update();
  }
  
  function update() {
    let alive = false;
    particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      if (p.y < canvas.height) alive = true;
    });
    if (alive) {
      requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  }
  draw();
}
