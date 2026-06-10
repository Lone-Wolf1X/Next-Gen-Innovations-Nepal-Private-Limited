/* =========================================================
   World Cup Predictor JS (With Real Data Integration)
   ========================================================= */

// --- STATE ---
window.currentUser = null; 
let matchesToRender = [];

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', async () => {
  await fetchRealMatches();
  renderMatches();
  renderLeaderboard();
  initSpinWheel();
  
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
  
  if (window.currentUser) {
    panel.style.display = 'none';
    dashHeader.style.display = 'block';
    document.body.classList.add('dashboard-active');
    
    document.getElementById('dashName').innerText = window.currentUser.name;
    document.getElementById('dashAvatar').src = window.currentUser.avatar;
    document.getElementById('dashPoints').innerText = window.currentUser.points;
    
    heroTitle.innerHTML = `My Prediction <span class="highlight-green">Dashboard</span>`;
    heroSubtitle.innerHTML = `Lock in your predictions below and climb the leaderboard to win the Grand Prize.`;
    
    // Enable all prediction buttons
    document.querySelectorAll('.btn-lock').forEach(btn => {
      if(btn.innerText.includes('Login')) {
        btn.disabled = false;
        btn.innerText = 'Lock Prediction';
      }
    });
  } else {
    panel.style.display = 'inline-flex';
    dashHeader.style.display = 'none';
    document.body.classList.remove('dashboard-active');
    
    heroTitle.innerHTML = `World Cup Predictor <span class="highlight-green">Arena</span>`;
    heroSubtitle.innerHTML = `Predict the exact score of today's matches. Stand a chance to win a <b>Smartwatch</b>, Next Gen T-Shirts, and a Daily <b>100 NPR Recharge</b> via the Spin Wheel!`;
    
    // Disable all prediction buttons
    document.querySelectorAll('.btn-lock').forEach(btn => {
      btn.disabled = true;
      btn.innerText = 'Login to Predict';
      btn.style.background = '';
    });
  }
}

async function submitConsent(wantsNotifications) {
  if (!currentUser) return;
  document.getElementById('welcomeModal').style.display = 'none';

  // Send user to our Admin Database
  try {
    await fetch('/api/worldcup/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: currentUser.name,
        email: currentUser.email || null, // in real auth, this comes from google
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

  matchesToRender.forEach(m => {
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
        <div style="text-align:center; margin-top:10px;">
          <button class="btn btn-outline" style="padding:4px 12px; font-size:0.75rem;" onclick="viewLineup('${m.rawId}', '${m.teamA.replace(/'/g, "\\'")}', '${m.teamB.replace(/'/g, "\\'")}')">View Lineup & Details</button>
        </div>
        <div class="prediction-inputs">
          <input type="number" id="scoreA_${m.id}" class="score-input" min="0" max="15" value="0">
          <button class="btn-lock" id="btn_${m.id}" onclick="lockPrediction('${m.id}', '${m.teamA.replace(/'/g, "\\'")}', '${m.teamB.replace(/'/g, "\\'")}')" disabled>Login to Predict</button>
          <input type="number" id="scoreB_${m.id}" class="score-input" min="0" max="15" value="0">
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
    
    // If within 3 hours (10800000 ms) and not passed
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
        html += `
          <div class="wc-card">
            <h3 style="background: #10B981; color: white; padding: 5px 10px; border-radius: 4px; display:inline-block; margin-bottom:15px; font-size:1rem;">${group.name}</h3>
            <table style="width:100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <tr style="border-bottom: 1px solid #ddd;">
                <th style="padding: 8px 4px;">Team</th>
                <th style="padding: 8px 4px; text-align:center;">P</th>
                <th style="padding: 8px 4px; text-align:center;">W</th>
                <th style="padding: 8px 4px; text-align:center;">D</th>
                <th style="padding: 8px 4px; text-align:center;">L</th>
                <th style="padding: 8px 4px; text-align:center;">GD</th>
                <th style="padding: 8px 4px; text-align:center;">Pts</th>
              </tr>
        `;
        
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
            
            html += `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 4px; display:flex; align-items:center; gap:8px;">
                  <img src="${flag}" style="width:24px; height:16px; border-radius:2px; border:1px solid #ddd; object-fit:cover;">
                  <span style="font-weight:600; color:#111827;">${team.displayName || team.name}</span>
                </td>
                <td style="padding: 8px 4px; text-align:center;">${p}</td>
                <td style="padding: 8px 4px; text-align:center;">${w}</td>
                <td style="padding: 8px 4px; text-align:center;">${d}</td>
                <td style="padding: 8px 4px; text-align:center;">${l}</td>
                <td style="padding: 8px 4px; text-align:center;">${gd}</td>
                <td style="padding: 8px 4px; text-align:center; font-weight:800; color:#2563EB;">${pts}</td>
              </tr>
            `;
        });
        
        html += `</table></div>`;
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
    // Get matches for next 30 days
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
        
        html += `
          <div class="fixture-card-modern">
            <div class="date-badge">${dayStr}</div>
            
            <div style="text-align:center; font-size:0.8rem; color:#9ca3af; margin-top:5px; margin-bottom:5px;">
              ${timeStr} | <span style="color:#10b981;">${status}</span>
            </div>
            
            <div class="fixture-teams-modern">
              <div class="fixture-team-modern">
                <img src="${flagA}" alt="${nameA}">
                <span>${nameA}</span>
              </div>
              <div class="fixture-vs-modern">VS</div>
              <div class="fixture-team-modern">
                <img src="${flagB}" alt="${nameB}">
                <span>${nameB}</span>
              </div>
            </div>
            
            <button class="btn btn-outline" style="width:100%; border-color: #10b981; color: #10b981;" onclick="viewLineup('${e.id}', '${nameA.replace(/'/g, "\\'")}', '${nameB.replace(/'/g, "\\'")}')">View Match Details</button>
          </div>
        `;
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
  
  // Change button state to loading
  const btn = document.getElementById(`btn_${matchId}`);
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Saving... ⏳';
  btn.disabled = true;

  try {
    // Send to backend
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

    // Change button state to locked
    btn.innerHTML = 'Locked! ✅';
    btn.style.background = '#10B981';

    // Generate share card
    const preview = document.getElementById('shareCardPreview');
    preview.innerHTML = `
      <h4>NextGen Predictor</h4>
      <div class="share-match">${teamA} vs ${teamB}</div>
      <div class="share-pred">${scoreA} - ${scoreB}</div>
      <p style="margin-top:10px; font-size:0.8rem; color:#f3f4f6;">Can you beat my prediction?</p>
    `;

    currentShareText = `I predicted ${teamA} ${scoreA} - ${scoreB} ${teamB} on the NextGen Predictor Arena! 🏆 Can you beat my exact score? Play here: https://nextgeninnovationsnepal.com/worldcup`;

    // Show modal
    document.getElementById('shareModal').style.display = 'flex';
  } catch (error) {
    console.error(error);
    alert("Error saving prediction. Please try again.");
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// --- LINEUPS & DETAILS ---
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

// --- RENDER LEADERBOARD ---
let globalLeaderboard = [];
async function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  let html = '';
  
  try {
    const res = await fetch('/api/worldcup/leaderboard');
    if (!res.ok) throw new Error("Failed to fetch");
    globalLeaderboard = await res.json();
  } catch (err) {
    console.error(err);
    globalLeaderboard = [];
  }

  if (globalLeaderboard.length === 0) {
    list.innerHTML = `<li style="justify-content:center; color:#6b7280;">No data yet.</li>`;
    return;
  }

  globalLeaderboard.forEach((u, i) => {
    // Generate a consistent avatar based on name length
    const avatarId = (u.name.length % 70) + 1;
    html += `
      <li>
        <span class="lb-rank">#${i+1}</span>
        <div class="lb-user">
          <img src="https://i.pravatar.cc/150?img=${avatarId}" alt="${u.name}">
          <span style="color:#111827;">${u.name}</span>
        </div>
        <span class="lb-score">${u.points} pts</span>
      </li>
    `;
  });
  
  list.innerHTML = html;
}

// --- SPIN WHEEL LOGIC ---
const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
let activeWheelNames = [];

async function initSpinWheel() {
  const wheel = document.getElementById('spinWheel');
  const spinBtn = document.getElementById('spinBtn');
  
  // Wait for leaderboard if empty (in case it wasn't fetched yet)
  if (globalLeaderboard.length === 0) {
    try {
      const res = await fetch('/api/worldcup/leaderboard');
      globalLeaderboard = await res.json();
    } catch(e) {}
  }

  // Pick top users or fallbacks
  activeWheelNames = globalLeaderboard.slice(0, 8).map(u => u.name);
  if (activeWheelNames.length === 0) {
    activeWheelNames = ['Predict to Win!', 'No Players Yet', 'Join Arena', 'Wait for Matches'];
    spinBtn.disabled = true;
    spinBtn.innerText = 'Wheel Locked (No Players)';
  } else {
    spinBtn.disabled = false;
    spinBtn.innerText = 'Spin for Daily ₹100 Recharge!';
  }

  const segmentAngle = 360 / activeWheelNames.length;
  let gradientStr = [];
  let currentAngle = 0;
  
  // Clear previous labels
  wheel.innerHTML = '';

  for(let i=0; i<activeWheelNames.length; i++) {
    gradientStr.push(`${colors[i%colors.length]} ${currentAngle}deg ${currentAngle + segmentAngle}deg`);
    currentAngle += segmentAngle;
    
    const labelAngle = currentAngle + (segmentAngle / 2);
    
    // Add text label
    const label = document.createElement('div');
    label.className = 'wheel-segment';
    label.style.transform = `rotate(${labelAngle}deg)`;
    label.innerText = activeWheelNames[i].substring(0, 15);
    wheel.appendChild(label);
  }
  
  wheel.style.background = `conic-gradient(${gradientStr.join(', ')})`;
}

function spinTheWheel() {
  if (activeWheelNames.length === 0 || activeWheelNames.includes('Predict to Win!')) return;

  const spinBtn = document.getElementById('spinBtn');
  const wheel = document.getElementById('spinWheel');
  const winnerDisplay = document.getElementById('winnerDisplay');
  const winnerText = document.getElementById('winnerText');

  spinBtn.disabled = true;
  winnerDisplay.style.display = 'none';

  // Pick a random winner index first
  const winnerIndex = Math.floor(Math.random() * activeWheelNames.length);
  const segmentAngle = 360 / activeWheelNames.length;
  
  // Calculate center of winner's segment
  const centerAngle = (winnerIndex * segmentAngle) + (segmentAngle / 2);
  
  // To bring this segment to the TOP (0deg), we rotate backwards
  const baseRotation = 360 - centerAngle;
  const extraSpins = 360 * 5; // Spin 5 times
  const totalDeg = baseRotation + extraSpins;

  // Temporarily disable transition if we reset it
  wheel.style.transition = 'transform 5s cubic-bezier(0.1, 0.9, 0.1, 1)';
  wheel.style.transform = `rotate(${totalDeg}deg)`;

  setTimeout(() => {
    winnerText.innerText = activeWheelNames[winnerIndex];
    winnerDisplay.style.display = 'block';
    spinBtn.innerText = 'Spin Again';
    spinBtn.disabled = false;
    
    // Reset wheel transform without animation so it spins again properly next time
    setTimeout(() => {
      wheel.style.transition = 'none';
      wheel.style.transform = `rotate(${baseRotation}deg)`;
    }, 100);
  }, 5000);
}
