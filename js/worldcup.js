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
  // Find all LI elements in the tabs
  const tabs = document.querySelectorAll('.wc-tabs li');
  tabs.forEach(li => li.classList.remove('active'));
  
  // Find which tab was clicked based on its onclick attribute
  const clickedTab = Array.from(tabs).find(li => li.getAttribute('onclick')?.includes(`'${tabId}'`));
  if (clickedTab) {
    clickedTab.classList.add('active');
  } else if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add('active');
  }
  
  // Update Content Sections
  document.querySelectorAll('.tab-content').forEach(sec => sec.style.display = 'none');
  const targetSec = document.getElementById('tab_' + tabId);
  if (targetSec) targetSec.style.display = 'block';
  
  // Custom action for spin wheel tab
  if (tabId === 'spinwheel') {
    fetchDrawStatus();
  }
}

function parseApiDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split(' ');
  if (parts.length < 2) return null;
  const dateParts = parts[0].split('/');
  const timeParts = parts[1].split(':');
  if (dateParts.length < 3 || timeParts.length < 2) return null;
  
  const month = parseInt(dateParts[0], 10) - 1;
  const day = parseInt(dateParts[1], 10);
  const year = parseInt(dateParts[2], 10);
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);
  
  return new Date(year, month, day, hour, minute);
}

// --- WORLD CUP 2026 API DATA ---
let apiTeams = {};

async function fetchTeamsData() {
  try {
    const res = await fetch('https://worldcup26.ir/get/teams');
    const data = await res.json();
    if (data && data.teams) {
      data.teams.forEach(t => {
        apiTeams[t.id] = t;
      });
    }
  } catch (err) {
    console.error("Failed to fetch teams", err);
  }
}

function buildGoogleMatchCard(m, isPredictable = false) {
  let statusClass = m.status;
  let scoreHtml = '';
  
  if (isPredictable && m.status === 'upcoming') {
    scoreHtml = `
      <div class="prediction-inputs">
        <input type="number" id="scoreA_${m.id}" min="0" placeholder="-">
        <span style="color:#94a3b8; font-weight:bold;">:</span>
        <input type="number" id="scoreB_${m.id}" min="0" placeholder="-">
      </div>
    `;
  } else if (m.status === 'upcoming') {
     scoreHtml = `<div class="score-block"><span style="color:#64748b;">-</span><span style="color:#64748b;">-</span></div>`;
  } else {
    scoreHtml = `<div class="score-block"><span>${m.scoreA}</span><span style="color:#4b5563;">-</span><span>${m.scoreB}</span></div>`;
  }

  let timelineHtml = '';
  if (m.events && m.events.length > 0) {
    let eventsA = m.events.filter(e => e.team === 'A').map(e => `<div class="scorer">⚽ ${e.text}</div>`).join('');
    let eventsB = m.events.filter(e => e.team === 'B').map(e => `<div class="scorer">${e.text} ⚽</div>`).join('');
    timelineHtml = `
      <div class="timeline">
        <div class="timeline-team left">${eventsA}</div>
        <div class="timeline-team right">${eventsB}</div>
      </div>
    `;
  }

  let actionHtml = '';
  if (isPredictable && m.status === 'upcoming') {
     actionHtml = `<button class="btn btn-teal" style="width:100%; margin-top:15px; border-radius:12px; font-weight:700;" onclick="lockPrediction('${m.id}', '${m.teamA}', '${m.teamB}')">Lock Prediction</button>`;
  } else if (!isPredictable) {
     actionHtml = `<button class="btn btn-outline" style="width:100%; margin-top:15px; border-radius:12px; border-color:#10b981; color:#10b981;" onclick="viewLineup('${m.id}', '${m.teamA}', '${m.teamB}')">Match Center</button>`;
  }

  return `
    <div class="google-match-card">
      <div class="match-header">
        <span>${m.dateStr}</span>
        <span class="match-status ${statusClass}">${m.statusText}</span>
      </div>
      <div class="match-teams-scores">
        <div class="team-block">
          <img src="${m.flagA}" alt="${m.teamA}" class="team-logo">
          <span class="team-name">${m.teamA}</span>
        </div>
        ${scoreHtml}
        <div class="team-block">
          <img src="${m.flagB}" alt="${m.teamB}" class="team-logo">
          <span class="team-name">${m.teamB}</span>
        </div>
      </div>
      ${timelineHtml}
      ${actionHtml}
    </div>
  `;
}

async function fetchRealMatches() {
  try {
    if (Object.keys(apiTeams).length === 0) {
      await fetchTeamsData();
    }
    
    const res = await fetch('https://worldcup26.ir/get/games');
    const data = await res.json();
    
    if (data && data.games && data.games.length > 0) {
      const validMatches = data.games.filter(g => g.type === 'group' || parseInt(g.home_team_id) > 0);
      
      const now = new Date();
      const todayStr = now.toDateString();
      const upcomingAndLive = validMatches.filter(g => {
        if (g.finished === "TRUE") return false;
        const matchDate = parseApiDate(g.local_date);
        if (!matchDate) return true;
        return matchDate.toDateString() === todayStr;
      });
      const completed = validMatches.filter(g => g.finished === "TRUE");
      
      // Sort completed matches by date descending (most recent first)
      completed.sort((a, b) => {
        const da = parseApiDate(a.local_date);
        const db = parseApiDate(b.local_date);
        return (da && db) ? db.getTime() - da.getTime() : 0;
      });
      
      // Take at most 2 completed matches
      const recentCompleted = completed.slice(0, 2);
      
      // Sort upcoming/live matches by date ascending (chronological)
      upcomingAndLive.sort((a, b) => {
        const da = parseApiDate(a.local_date);
        const db = parseApiDate(b.local_date);
        return (da && db) ? da.getTime() - db.getTime() : 0;
      });

      const filteredGames = [...upcomingAndLive, ...recentCompleted];

      matchesToRender = filteredGames.map(e => {
        let teamA = e.home_team_id === "0" ? e.home_team_label : (apiTeams[e.home_team_id] ? apiTeams[e.home_team_id].name_en : 'TBD');
        let flagA = e.home_team_id === "0" ? 'https://flagcdn.com/w160/un.png' : (apiTeams[e.home_team_id] ? apiTeams[e.home_team_id].flag : 'https://flagcdn.com/w160/un.png');
        let teamB = e.away_team_id === "0" ? e.away_team_label : (apiTeams[e.away_team_id] ? apiTeams[e.away_team_id].name_en : 'TBD');
        let flagB = e.away_team_id === "0" ? 'https://flagcdn.com/w160/un.png' : (apiTeams[e.away_team_id] ? apiTeams[e.away_team_id].flag : 'https://flagcdn.com/w160/un.png');
        
        let status = 'upcoming';
        let statusText = 'Upcoming';
        if (e.finished === "TRUE") {
          status = 'ft';
          statusText = 'Full Time';
        } else if (e.time_elapsed !== "notstarted") {
          status = 'live';
          statusText = `Live ${e.time_elapsed}'`;
        }

        let events = [];
        if (e.home_scorers && e.home_scorers !== "null") {
           e.home_scorers.split(',').forEach(sc => events.push({ team: 'A', text: sc.trim() }));
        }
        if (e.away_scorers && e.away_scorers !== "null") {
           e.away_scorers.split(',').forEach(sc => events.push({ team: 'B', text: sc.trim() }));
        }

        let parsedDate = parseApiDate(e.local_date);
        let rawDateStr = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null;
        let timeStr = e.local_date ? e.local_date.split(' ')[1] : 'TBD';

        return {
          id: e.id,
          rawId: e.id,
          rawDate: rawDateStr,
          time: timeStr || 'TBD',
          dateStr: e.local_date,
          status: status,
          statusText: statusText,
          teamA: teamA, flagA: flagA, scoreA: e.home_score,
          teamB: teamB, flagB: flagB, scoreB: e.away_score,
          events: events
        };
      });
      document.querySelector('.live-pulse').innerText = 'LIVE API DATA';
      document.querySelector('.live-pulse').style.background = '#10b981';
    } else {
      matchesToRender = [];
      document.querySelector('.live-pulse').innerText = 'NO MATCHES';
      document.querySelector('.live-pulse').style.background = '#6b7280';
    }
  } catch (err) {
    console.error("Failed to fetch matches", err);
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
    
    if (window.currentUser.avatar && window.currentUser.avatar.startsWith('emoji:')) {
      const parts = window.currentUser.avatar.split('|');
      const emoji = parts[0].replace('emoji:', '');
      const bg = parts[1] ? parts[1].replace('bg:', '') : '#3b82f6';
      const da = document.getElementById('dashAvatar');
      da.innerHTML = emoji;
      da.style.backgroundColor = bg;
    } else {
      // Legacy or null
      document.getElementById('dashAvatar').innerHTML = '👤';
      document.getElementById('dashAvatar').style.backgroundColor = '#3b82f6';
    }
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
    
    // Re-render matches to reflect logged in state and correct locked buttons
    renderMatches();

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
    
    // Re-render matches to reflect logged out state
    renderMatches();

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
window.submitWelcomeSetup = async function() {
  if (!window.currentUser) return;
  const selectEl = document.getElementById('countrySelect');
  const selectedCountry = selectEl ? selectEl.value : 'Nepal';
  const wantsNotifications = document.getElementById('wantsNotifications').checked;
  
  document.getElementById('welcomeModal').style.display = 'none';
  localStorage.setItem('wc_country_set', 'true');

  try {
    // Save country preference & notifications
    const res = await fetch('/api/worldcup/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: window.currentUser.idToken,
        country: selectedCountry,
        notificationsEnabled: wantsNotifications
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
    await fetch('/api/worldcup/user/update_notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: currentUser.idToken,
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

function isMatchPredictionLocked(m) {
  if (m.status !== 'upcoming') return true;
  if (!m.rawDate) return false;
  const matchTime = new Date(m.rawDate).getTime();
  const now = Date.now();
  // Lock exactly 5 minutes (300,000 ms) before kickoff
  return (matchTime - now <= 300000);
}

// --- RENDER MATCHES & COUNTDOWN ---
function renderMatches() {
  const container = document.getElementById('matchesContainer');
  let html = '';

  matchesToRender.forEach(m => {
    const isLocked = isMatchPredictionLocked(m);
    
    // Check if the match is completed or live
    const isCompletedOrLive = (m.status === 'ft' || m.status === 'live');
    
    let centerHtml = `<div class="match-vs">VS</div>`;
    if (isCompletedOrLive) {
      centerHtml = `<div class="match-score-display" style="font-size: 2rem; font-weight: 800; color: #0b1120 !important; font-family: 'Outfit'; margin: 0 12px; min-width: 60px; text-align: center;">${m.scoreA} - ${m.scoreB}</div>`;
    }

    let predictionAreaHtml = '';
    
    if (isLocked) {
      let userPredHtml = '';
      if (window.currentUser) {
        const myPred = (window.currentUser.predictions) ? window.currentUser.predictions[String(m.id)] : null;
        if (myPred) {
          let predResultBadge = '';
          if (m.status === 'ft') {
            const isExact = (parseInt(myPred.scoreA) === parseInt(m.scoreA) && parseInt(myPred.scoreB) === parseInt(m.scoreB));
            predResultBadge = isExact 
              ? `<span style="display:block; font-size:0.8rem; color:#10B981; font-weight:800; margin-top:5px;">🎯 Exact Match! (+100 pts)</span>`
              : `<span style="display:block; font-size:0.8rem; color:#f59e0b; font-weight:700; margin-top:5px;">Locked (Match: ${m.scoreA}-${m.scoreB})</span>`;
          }
          userPredHtml = `
            <div style="text-align: center; background: rgba(37, 99, 235, 0.05); padding: 8px 12px; border-radius: 12px; border: 1px dashed rgba(37, 99, 235, 0.2); width: 100%;">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-body);">Your Prediction:</span>
              <strong style="font-size: 1rem; color: var(--indigo); font-family: 'Outfit'; margin-left: 5px;">${myPred.scoreA} - ${myPred.scoreB}</strong>
              ${predResultBadge}
            </div>
          `;
        } else {
          userPredHtml = `
            <div style="text-align: center; background: rgba(100, 116, 139, 0.05); padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(100, 116, 139, 0.1); width: 100%;">
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">🔒 Lock Closed (No Prediction)</span>
            </div>
          `;
        }
      } else {
        userPredHtml = `
          <div style="text-align: center; background: rgba(100, 116, 139, 0.05); padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(100, 116, 139, 0.1); width: 100%;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">🔒 Predictions Locked</span>
          </div>
        `;
      }
      
      predictionAreaHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; width: 100%; gap: 10px;">
          ${userPredHtml}
        </div>
      `;
    } else {
      const disabledAttr = !window.currentUser ? 'disabled' : '';
      let btnText = window.currentUser ? 'Lock Prediction' : 'Login to Predict';
      const bgStyle = !window.currentUser ? 'background: #cbd5e1; cursor: not-allowed; box-shadow: none;' : '';
      
      const myPred = (window.currentUser && window.currentUser.predictions) ? window.currentUser.predictions[String(m.id)] : null;
      const valA = myPred ? myPred.scoreA : '';
      const valB = myPred ? myPred.scoreB : '';
      if (myPred) {
        btnText = 'Update Prediction ✅';
      }

      predictionAreaHtml = `
        <div class="prediction-inputs" style="width: 100%; justify-content: center; gap: 12px;">
          <input type="number" id="scoreA_${m.id}" class="score-input" min="0" max="15" value="${valA}" placeholder="-" ${disabledAttr}>
          <button class="btn-lock ${myPred ? 'locked' : ''}" id="btn_${m.id}" style="${bgStyle}" onclick="lockPrediction('${m.id}', '${m.teamA.replace(/'/g, "\\'")}', '${m.teamB.replace(/'/g, "\\'")}')" ${disabledAttr}>${btnText}</button>
          <input type="number" id="scoreB_${m.id}" class="score-input" min="0" max="15" value="${valB}" placeholder="-" ${disabledAttr}>
        </div>
      `;
    }

    html += `
      <div class="match-card" data-date="${m.rawDate}">
        <div class="match-status">
          ⏳ ${m.time} | ${m.statusText} 
          <span class="match-countdown" id="cd_${m.id}" style="display:none;"></span>
        </div>
        <div class="match-teams" style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
          <div class="team" style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 35%;">
            <img src="${m.flagA}" alt="${m.teamA}" style="width: 54px; height: 36px; object-fit: cover; border-radius: 6px; border: 2px solid white; box-shadow: 0 4px 10px rgba(15,28,63,0.06);">
            <div class="team-name" style="font-weight: 700; font-size: 0.95rem; color: #0b1120 !important; text-align: center; font-family: 'Outfit';">${m.teamA}</div>
          </div>
          ${centerHtml}
          <div class="team" style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 35%;">
            <img src="${m.flagB}" alt="${m.teamB}" style="width: 54px; height: 36px; object-fit: cover; border-radius: 6px; border: 2px solid white; box-shadow: 0 4px 10px rgba(15,28,63,0.06);">
            <div class="team-name" style="font-weight: 700; font-size: 0.95rem; color: #0b1120 !important; text-align: center; font-family: 'Outfit';">${m.teamB}</div>
          </div>
        </div>
        <div style="text-align:center; margin-top:12px; margin-bottom: 12px;">
          <button class="btn btn-outline" style="padding: 6px 16px; font-size: 0.8rem; border-color: rgba(15, 28, 63, 0.12); color: var(--text-body); font-weight:600;" onclick="viewLineup('${m.rawId}', '${m.teamA.replace(/'/g, "\\'")}', '${m.teamB.replace(/'/g, "\\'")}')">View Lineup & Details</button>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(15, 28, 63, 0.1); display: flex; width: 100%;">
          ${predictionAreaHtml}
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
    if (Object.keys(apiTeams).length === 0) {
      await fetchTeamsData();
    }
    
    const res = await fetch('https://worldcup26.ir/get/groups');
    const data = await res.json();
    
    if (data && data.groups && data.groups.length > 0) {
      let html = '<div class="standings-grid">';
      
      data.groups.forEach(group => {
        html += '\n<div class="wc-card" style="margin-bottom: 20px;">\n' +
                '  <h3 style="background: rgba(37, 99, 235, 0.08); color: var(--indigo); padding: 6px 14px; border-radius: 20px; display:inline-block; margin-bottom:15px; font-size:0.95rem; font-weight:700;">Group ' + escapeHtml(group.name) + '</h3>\n' +
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
        
        group.teams.forEach(t => {
            const teamInfo = apiTeams[t.team_id];
            const teamName = teamInfo ? teamInfo.name_en : 'TBD';
            const flag = teamInfo ? teamInfo.flag : 'https://flagcdn.com/w40/un.png';
            
            html += '\n<tr>\n' +
                    '  <td style="display:flex; align-items:center; gap:10px;">\n' +
                    '    <img src="' + escapeHtml(flag) + '" style="width:26px; height:18px; border-radius:4px; border:1px solid rgba(0,0,0,0.08); object-fit:cover;">\n' +
                    '    <span style="font-weight:700; color: var(--text-main); font-family: \'Outfit\', sans-serif;">' + escapeHtml(teamName) + '</span>\n' +
                    '  </td>\n' +
                    '  <td style="text-align:center; font-weight: 500;">' + escapeHtml(t.mp) + '</td>\n' +
                    '  <td style="text-align:center; font-weight: 500;">' + escapeHtml(t.w) + '</td>\n' +
                    '  <td style="text-align:center; font-weight: 500;">' + escapeHtml(t.d) + '</td>\n' +
                    '  <td style="text-align:center; font-weight: 500;">' + escapeHtml(t.l) + '</td>\n' +
                    '  <td style="text-align:center; font-weight: 500;">' + escapeHtml(t.gd) + '</td>\n' +
                    '  <td style="text-align:center; font-weight:800; color: var(--indigo);">' + escapeHtml(t.pts) + '</td>\n' +
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
    console.error("Failed to load standings", err);
    container.innerHTML = `<p>Standings API unavailable.</p>`;
  }
}

async function fetchFixtures() {
  const fixturesContainer = document.getElementById('fixturesContainer');
  const resultsContainer = document.getElementById('resultsContainer');
  if (!fixturesContainer) return;
  
  fixturesContainer.innerHTML = '<div style="text-align:center; padding: 40px;"><div class="spinner"></div><p style="margin-top:10px;">Loading Fixtures...</p></div>';
  if (resultsContainer) {
    resultsContainer.innerHTML = '<div style="text-align:center; padding: 40px;"><div class="spinner"></div><p style="margin-top:10px;">Loading Results...</p></div>';
  }

  try {
    if (Object.keys(apiTeams).length === 0) {
      await fetchTeamsData();
    }
    
    const res = await fetch('https://worldcup26.ir/get/games');
    const data = await res.json();
    
    if (data && data.games && data.games.length > 0) {
      // Partition matches
      const fixturesList = data.games.filter(g => g.finished !== "TRUE");
      const resultsList = data.games.filter(g => g.finished === "TRUE");

      // Sort Fixtures chronologically (ascending date)
      fixturesList.sort((a, b) => {
        const da = parseApiDate(a.local_date);
        const db = parseApiDate(b.local_date);
        return (da && db) ? da.getTime() - db.getTime() : 0;
      });

      // Sort Results reverse-chronologically (descending date, most recent first)
      resultsList.sort((a, b) => {
        const da = parseApiDate(a.local_date);
        const db = parseApiDate(b.local_date);
        return (da && db) ? db.getTime() - da.getTime() : 0;
      });

      // Render Fixtures
      if (fixturesList.length > 0) {
        let fHtml = '<div class="fixtures-grid">';
        fixturesList.forEach(e => {
          let teamA = e.home_team_id === "0" ? e.home_team_label : (apiTeams[e.home_team_id] ? apiTeams[e.home_team_id].name_en : 'TBD');
          let flagA = e.home_team_id === "0" ? 'https://flagcdn.com/w160/un.png' : (apiTeams[e.home_team_id] ? apiTeams[e.home_team_id].flag : 'https://flagcdn.com/w160/un.png');
          let teamB = e.away_team_id === "0" ? e.away_team_label : (apiTeams[e.away_team_id] ? apiTeams[e.away_team_id].name_en : 'TBD');
          let flagB = e.away_team_id === "0" ? 'https://flagcdn.com/w160/un.png' : (apiTeams[e.away_team_id] ? apiTeams[e.away_team_id].flag : 'https://flagcdn.com/w160/un.png');
          
          let status = 'upcoming';
          let statusText = 'Upcoming';
          if (e.time_elapsed !== "notstarted") {
            status = 'live';
            statusText = `Live ${e.time_elapsed}'`;
          }

          const matchObj = {
            id: e.id,
            dateStr: e.local_date,
            status: status,
            statusText: statusText,
            teamA: teamA, flagA: flagA, scoreA: e.home_score,
            teamB: teamB, flagB: flagB, scoreB: e.away_score,
            events: []
          };
          
          fHtml += buildGoogleMatchCard(matchObj, false);
        });
        fHtml += '</div>';
        fixturesContainer.innerHTML = fHtml;
      } else {
        fixturesContainer.innerHTML = `
          <div class="wc-empty-state">
            <h3>No Upcoming Fixtures 📅</h3>
            <p>All tournament matches have been completed.</p>
          </div>
        `;
      }

      // Render Results
      if (resultsContainer) {
        if (resultsList.length > 0) {
          let rHtml = '<div class="fixtures-grid">';
          resultsList.forEach(e => {
            let teamA = e.home_team_id === "0" ? e.home_team_label : (apiTeams[e.home_team_id] ? apiTeams[e.home_team_id].name_en : 'TBD');
            let flagA = e.home_team_id === "0" ? 'https://flagcdn.com/w160/un.png' : (apiTeams[e.home_team_id] ? apiTeams[e.home_team_id].flag : 'https://flagcdn.com/w160/un.png');
            let teamB = e.away_team_id === "0" ? e.away_team_label : (apiTeams[e.away_team_id] ? apiTeams[e.away_team_id].name_en : 'TBD');
            let flagB = e.away_team_id === "0" ? 'https://flagcdn.com/w160/un.png' : (apiTeams[e.away_team_id] ? apiTeams[e.away_team_id].flag : 'https://flagcdn.com/w160/un.png');
            
            let status = 'ft';
            let statusText = 'Full Time';

            let events = [];
            if (e.home_scorers && e.home_scorers !== "null") {
               e.home_scorers.split(',').forEach(sc => events.push({ team: 'A', text: sc.trim() }));
            }
            if (e.away_scorers && e.away_scorers !== "null") {
               e.away_scorers.split(',').forEach(sc => events.push({ team: 'B', text: sc.trim() }));
            }

            const matchObj = {
              id: e.id,
              dateStr: e.local_date,
              status: status,
              statusText: statusText,
              teamA: teamA, flagA: flagA, scoreA: e.home_score,
              teamB: teamB, flagB: flagB, scoreB: e.away_score,
              events: events
            };
            
            rHtml += buildGoogleMatchCard(matchObj, false);
          });
          rHtml += '</div>';
          resultsContainer.innerHTML = rHtml;
        } else {
          resultsContainer.innerHTML = `
            <div class="wc-empty-state">
              <h3>No Match Results ⚽</h3>
              <p>Tournament match results will appear here once games conclude.</p>
            </div>
          `;
        }
      }
    } else {
      fixturesContainer.innerHTML = `
        <div class="wc-empty-state">
          <h3>Full Schedule TBD 📅</h3>
          <p>The official fixture list for the 48 teams will be populated automatically prior to June 2026.</p>
        </div>
      `;
      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="wc-empty-state">
            <h3>No Results Yet ⚽</h3>
            <p>Results will be updated in real time once the tournament starts.</p>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error("Failed to load fixtures/results", err);
    fixturesContainer.innerHTML = `<p style="text-align:center; padding: 20px;">Fixtures API unavailable.</p>`;
    if (resultsContainer) {
      resultsContainer.innerHTML = `<p style="text-align:center; padding: 20px;">Results API unavailable.</p>`;
    }
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

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to save prediction");
    }

    const resData = await res.json();
    if (resData.points !== undefined) {
      window.currentUser.points = resData.points;
      if (document.getElementById('dashPoints')) {
        document.getElementById('dashPoints').innerText = resData.points;
      }
    }

    if (!window.currentUser.predictions) {
      window.currentUser.predictions = {};
    }
    window.currentUser.predictions[String(matchId)] = {
      scoreA: parseInt(scoreA, 10),
      scoreB: parseInt(scoreB, 10)
    };

    // Re-render matches to reflect prediction state dynamically
    renderMatches();

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
    alert(error.message || "Error saving prediction. Please try again.");
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
    let rankClass = 'other';
    let rankText = `#${i+1}`;
    if (i === 0) { rankClass = 'gold'; rankText = '🥇'; }
    else if (i === 1) { rankClass = 'silver'; rankText = '🥈'; }
    else if (i === 2) { rankClass = 'bronze'; rankText = '🥉'; }
    
    let avatarHtml = '<div class="bootstrap-avatar" style="width:40px; height:40px; border-radius:50%; background:#3b82f6; display:flex; align-items:center; justify-content:center; font-size:20px; color:#fff;">👤</div>';
    if (u.avatar && u.avatar.startsWith('emoji:')) {
      const parts = u.avatar.split('|');
      const emoji = parts[0].replace('emoji:', '');
      const bg = parts[1] ? parts[1].replace('bg:', '') : '#3b82f6';
      avatarHtml = `<div class="bootstrap-avatar" style="width:40px; height:40px; border-radius:50%; background:${escapeHtml(bg)}; display:flex; align-items:center; justify-content:center; font-size:20px; color:#fff;">${escapeHtml(emoji)}</div>`;
    }

    html += '\n<li class="lb-item">\n' +
            '  <span class="lb-rank ' + escapeHtml(rankClass) + '">' + escapeHtml(rankText) + '</span>\n' +
            '  <div class="lb-user">\n' +
            '    ' + avatarHtml + '\n' +
            '    <div class="lb-user-details">\n' +
            '      <strong class="lb-user-name">' + escapeHtml(u.name) + '</strong>\n' +
            '      <span class="lb-user-country">' + escapeHtml(u.country || "Global") + '</span>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '  <span class="lb-score">' + escapeHtml(u.points) + ' pts</span>\n' +
            '</li>\n';
  });
  if (list) list.innerHTML = html;

  // Build Mini Preview
  if (listPreview) {
    let previewHtml = '';
    globalLeaderboard.slice(0, 5).forEach((u, i) => {
      let rankClass = 'other';
      let rankText = `#${i+1}`;
      if (i === 0) { rankClass = 'gold'; rankText = '🥇'; }
      else if (i === 1) { rankClass = 'silver'; rankText = '🥈'; }
      else if (i === 2) { rankClass = 'bronze'; rankText = '🥉'; }

      let avatarHtml = '<div class="bootstrap-avatar" style="width:32px; height:32px; border-radius:50%; background:#3b82f6; display:flex; align-items:center; justify-content:center; font-size:16px; color:#fff;">👤</div>';
      if (u.avatar && u.avatar.startsWith('emoji:')) {
        const parts = u.avatar.split('|');
        const emoji = parts[0].replace('emoji:', '');
        const bg = parts[1] ? parts[1].replace('bg:', '') : '#3b82f6';
        avatarHtml = `<div class="bootstrap-avatar" style="width:32px; height:32px; border-radius:50%; background:${escapeHtml(bg)}; display:flex; align-items:center; justify-content:center; font-size:16px; color:#fff;">${escapeHtml(emoji)}</div>`;
      }

      previewHtml += '\n<li class="lb-item" style="padding: 10px 15px; border-radius: 12px; margin-bottom: 8px;">\n' +
                     '  <span class="lb-rank ' + escapeHtml(rankClass) + '" style="width:30px; height:30px; font-size:0.95rem;">' + escapeHtml(rankText) + '</span>\n' +
                     '  <div class="lb-user">\n' +
                     '    ' + avatarHtml + '\n' +
                     '    <div class="lb-user-details">\n' +
                     '      <strong class="lb-user-name" style="font-size:0.9rem;">' + escapeHtml(u.name) + '</strong>\n' +
                     '      <span class="lb-user-country" style="font-size:0.75rem;">' + escapeHtml(u.country || "Global") + '</span>\n' +
                     '    </div>\n' +
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

// --- GLOBAL CUSTOM ALERT MODAL OVERRIDE ---
window.alert = function(message) {
  let modal = document.getElementById('customAlertModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'customAlertModal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15, 28, 63, 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: 'Outfit', sans-serif;
    `;
    
    const card = document.createElement('div');
    card.style.cssText = `
      max-width: 440px;
      width: 90%;
      background: #ffffff;
      border: 1px solid rgba(15, 28, 63, 0.08);
      border-radius: 20px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(15, 28, 63, 0.15);
      position: relative;
    `;
    
    // Icon element
    const iconEl = document.createElement('div');
    iconEl.id = 'customAlertIcon';
    iconEl.style.cssText = `
      font-size: 3rem;
      margin-bottom: 12px;
    `;
    
    // Title element
    const titleEl = document.createElement('h3');
    titleEl.id = 'customAlertTitle';
    titleEl.style.cssText = `
      margin-bottom: 8px;
      font-size: 1.4rem;
      font-weight: 800;
      color: #0F1C3F;
    `;
    
    // Message element
    const msgEl = document.createElement('p');
    msgEl.id = 'customAlertMessage';
    msgEl.style.cssText = `
      color: #475569;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 24px;
    `;
    
    // Close button
    const btn = document.createElement('button');
    btn.className = 'btn btn-teal w-100 py-2';
    btn.innerText = 'Okay';
    btn.style.cssText = `
      font-weight: 700;
      border-radius: 30px;
      font-size: 0.95rem;
      border: none;
      background: linear-gradient(135deg, #10B981, #059669);
      color: white;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
      transition: all 0.2s;
    `;
    btn.onclick = () => {
      modal.style.display = 'none';
    };
    
    card.appendChild(iconEl);
    card.appendChild(titleEl);
    card.appendChild(msgEl);
    card.appendChild(btn);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }
  
  const iconEl = document.getElementById('customAlertIcon');
  const titleEl = document.getElementById('customAlertTitle');
  const msgEl = document.getElementById('customAlertMessage');
  
  let icon = '🔔';
  let title = 'Notification';
  
  const msgLower = String(message).toLowerCase();
  if (msgLower.includes('success') || msgLower.includes('successful') || msgLower.includes('welcome') || msgLower.includes('claim') || msgLower.includes('awesome') || msgLower.includes('copied')) {
    icon = '🎉';
    title = 'Success!';
  } else if (msgLower.includes('error') || msgLower.includes('fail') || msgLower.includes('failed') || msgLower.includes('invalid') || msgLower.includes('unauthorized')) {
    icon = '⚠️';
    title = 'Alert';
  } else if (msgLower.includes('lock') || msgLower.includes('predict') || msgLower.includes('score')) {
    icon = '⚽';
    title = 'Prediction Arena';
  }
  
  iconEl.innerText = icon;
  titleEl.innerText = title;
  msgEl.innerText = message;
  
  modal.style.display = 'flex';
};
