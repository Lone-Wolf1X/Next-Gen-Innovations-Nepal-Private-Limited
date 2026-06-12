document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const matchId = urlParams.get('id');

  if (!matchId) {
    document.getElementById('matchLoading').innerHTML = '<h2 class="wc-title" style="color:#ef4444;">Error: No Match ID Provided</h2>';
    return;
  }

  try {
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${matchId}`);
    const data = await response.json();
    renderMatchHeader(data);
    renderLineups(data);
    renderStats(data);
    renderForm(data);
    renderNews(data);
  } catch (err) {
    console.error(err);
    document.getElementById('matchLoading').innerHTML = '<h2 class="wc-title" style="color:#ef4444;">Failed to load match data.</h2>';
  }
});

function switchDetailsTab(tabId) {
  document.querySelectorAll('.wc-tabs li').forEach(li => li.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(sec => sec.style.display = 'none');
  document.getElementById('tab_' + tabId).style.display = 'block';
}

function renderMatchHeader(data) {
  document.getElementById('matchLoading').style.display = 'none';
  document.getElementById('matchHeader').style.display = 'block';

  const comp = data.header.competitions[0];
  const teamA = comp.competitors[0];
  const teamB = comp.competitors[1];

  document.getElementById('matchStatus').innerText = comp.status.type.detail;
  document.getElementById('matchVenue').innerText = "🏟️ " + (data.gameInfo?.venue?.fullName || "TBD");

  document.getElementById('teamAFlag').src = teamA.team.logos ? teamA.team.logos[0].href : 'https://flagcdn.com/w160/un.png';
  document.getElementById('teamBFlag').src = teamB.team.logos ? teamB.team.logos[0].href : 'https://flagcdn.com/w160/un.png';

  document.getElementById('teamAName').innerText = teamA.team.displayName;
  document.getElementById('teamBName').innerText = teamB.team.displayName;

  if (comp.status.type.state === "pre") {
    document.getElementById('matchScore').innerText = "VS";
    document.getElementById('matchScore').style.color = "#4b5563";
  } else {
    document.getElementById('matchScore').innerText = `${teamA.score} - ${teamB.score}`;
  }
}

function renderLineups(data) {
  const container = document.getElementById('lineupsContainer');
  let html = '';

  if (data.rosters && data.rosters.length > 0) {
    data.rosters.forEach(roster => {
      html += `
        <div class="wc-card" style="padding: 20px;">
          <h3 style="background: #10B981; color: white; padding: 5px 10px; border-radius: 4px; display:inline-block; margin-bottom:15px; font-size:1.1rem;">${roster.team.displayName} Roster</h3>
          <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:8px;">
      `;
      if (roster.roster && roster.roster.length > 0) {
        roster.roster.forEach(player => {
          const headshotUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/${player.athlete.id}.png&w=96&h=96&scale=crop`;
          const initials = encodeURIComponent(player.athlete.displayName);
          const fallbackUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${initials}`;
          
          html += `
            <li style="display:flex; justify-content:space-between; align-items:center; padding: 10px 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; transition: transform 0.2s;">
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${headshotUrl}" onerror="this.onerror=null; this.src='${fallbackUrl}';" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid #e2e8f0; background:#f3f4f6;">
                <span style="font-weight: 700; color:#1f2937;">${player.athlete.displayName}</span>
              </div>
              <span style="background:rgba(37,99,235,0.08); color:var(--indigo); font-weight:700; font-size:0.75rem; padding: 4px 10px; border-radius:12px;">${player.position.abbreviation}</span>
            </li>
          `;
        });
      } else {
        html += `<li style="padding:10px; color:#6b7280;">Roster not announced yet.</li>`;
      }
      html += `</ul></div>`;
    });
  } else {
    html = `<div style="grid-column: span 2; padding:30px; background:#fef3c7; color:#d97706; border-radius:8px; text-align:center;">Official Lineups have not been released by ESPN yet. Please check back closer to kickoff.</div>`;
  }
  container.innerHTML = html;
}

function renderStats(data) {
  const container = document.getElementById('statsContainer');
  if (data.boxscore && data.boxscore.teams && data.boxscore.teams.length > 0) {
    let html = `<h3 style="margin-bottom: 20px; text-align:center;">Match Statistics</h3>`;
    
    const teamA = data.boxscore.teams[0];
    const teamB = data.boxscore.teams[1];
    
    // ESPN provides stats as an array of objects for each team
    if (teamA.statistics && teamB.statistics) {
      teamA.statistics.forEach((statA, index) => {
        const statB = teamB.statistics[index];
        html += `
          <div style="margin-bottom: 15px;">
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#4b5563; margin-bottom:5px;">
              <span>${statA.displayValue}</span>
              <span style="font-weight:bold; color:#111827;">${statA.label}</span>
              <span>${statB.displayValue}</span>
            </div>
            <div style="display:flex; height:8px; background:#e5e7eb; border-radius:4px; overflow:hidden;">
              <div style="width:50%; background:#10b981; border-right: 1px solid white;"></div>
              <div style="width:50%; background:#3b82f6;"></div>
            </div>
          </div>
        `;
      });
    } else {
      html += `<p style="text-align:center; color:#6b7280;">Statistics are currently unavailable.</p>`;
    }
    container.innerHTML = html;
  } else {
    container.innerHTML = `<div style="padding:30px; text-align:center; color:#6b7280;">Match Statistics will appear here once the match starts.</div>`;
  }
}

function renderForm(data) {
  const container = document.getElementById('formContainer');
  let html = '';
  
  if (data.boxscore && data.boxscore.form && data.boxscore.form.length > 0) {
    data.boxscore.form.forEach(f => {
      html += `
        <div class="wc-card" style="padding:20px;">
          <h3 style="margin-bottom: 15px; display:flex; align-items:center; gap:10px;">
            <img src="${f.team.logo}" style="width:24px;">
            ${f.team.displayName} Recent Form
          </h3>
          <div style="display:flex; gap:10px; overflow-x:auto;">
      `;
      f.events.forEach(ev => {
         const isWin = ev.result === "W";
         const isDraw = ev.result === "D";
         const color = isWin ? '#10b981' : (isDraw ? '#f59e0b' : '#ef4444');
         html += `
           <div style="min-width: 120px; border:1px solid #e5e7eb; padding:10px; border-radius:8px; text-align:center;">
             <div style="font-size:1.2rem; font-weight:bold; color:${color}; margin-bottom:5px;">${ev.result}</div>
             <div style="font-size:0.75rem; color:#6b7280;">vs ${ev.opponent.abbreviation}</div>
             <div style="font-size:0.8rem; font-weight:600; margin-top:5px;">${ev.score}</div>
           </div>
         `;
      });
      html += `</div></div>`;
    });
  } else {
    html = `<div class="wc-card" style="padding:30px; text-align:center; color:#6b7280;">Form data is currently unavailable.</div>`;
  }
  
  container.innerHTML = html;
}

function renderNews(data) {
  const container = document.getElementById('newsContainer');
  let html = '';
  
  if (data.news && data.news.length > 0) {
    data.news.forEach(article => {
       const img = article.images && article.images.length > 0 ? article.images[0].url : 'logo/logo.svg';
       html += `
         <div class="wc-card" style="overflow:hidden; display:flex; flex-direction:column;">
           <img src="${img}" style="width:100%; height:180px; object-fit:cover; border-bottom:1px solid #e5e7eb;">
           <div style="padding:15px; display:flex; flex-direction:column; flex:1;">
             <h4 style="font-size:1.1rem; color:#111827; margin-bottom:10px;">${article.headline}</h4>
             <p style="font-size:0.85rem; color:#4b5563; flex:1;">${article.description}</p>
             <a href="${article.links.web.href}" target="_blank" class="btn btn-outline btn-sm" style="margin-top:15px; text-align:center;">Read Full Article</a>
           </div>
         </div>
       `;
    });
  } else {
    html = `<div style="grid-column:span 2; padding:30px; text-align:center; color:#6b7280; background:white; border-radius:12px;">No related news found for this match.</div>`;
  }
  
  container.innerHTML = html;
}
