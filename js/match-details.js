document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const matchId = urlParams.get('id');

  if (!matchId) {
    document.getElementById('matchLoading').innerHTML = '<h2 class="wc-title" style="color:#ef4444;">Error: No Match ID Provided</h2>';
    return;
  }

  try {
    // 1. Fetch teams to translate names and flags
    const teamsRes = await fetch('https://worldcup26.ir/get/teams');
    const teamsData = await teamsRes.json();
    const teamsMap = {};
    if (teamsData && teamsData.teams) {
      teamsData.teams.forEach(t => {
        teamsMap[t.id] = t;
      });
    }

    // 2. Fetch stadiums to map venue name
    const stadiumsRes = await fetch('https://worldcup26.ir/get/stadiums');
    const stadiumsData = await stadiumsRes.json();
    const stadiumsMap = {};
    if (stadiumsData && stadiumsData.stadiums) {
      stadiumsData.stadiums.forEach(s => {
        stadiumsMap[s.id] = s;
      });
    }

    // 3. Fetch all matches and find our specific match
    const gamesRes = await fetch('https://worldcup26.ir/get/games');
    const gamesData = await gamesRes.json();
    const game = gamesData.games.find(g => String(g.id) === String(matchId));

    if (!game) {
      document.getElementById('matchLoading').innerHTML = '<h2 class="wc-title" style="color:#ef4444;">Error: Match Not Found</h2>';
      return;
    }

    // Map properties
    const teamA = teamsMap[game.home_team_id];
    const teamB = teamsMap[game.away_team_id];
    const nameA = teamA ? teamA.name_en : (game.home_team_name_en || game.home_team_label || 'TBD');
    const nameB = teamB ? teamB.name_en : (game.away_team_name_en || game.away_team_label || 'TBD');
    const flagA = teamA ? teamA.flag : 'https://flagcdn.com/w160/un.png';
    const flagB = teamB ? teamB.flag : 'https://flagcdn.com/w160/un.png';
    const stadium = stadiumsMap[game.stadium_id];
    const venueName = stadium ? `${stadium.name_en}, ${stadium.city_en}` : 'TBD Venue';

    let statusText = 'Upcoming';
    let isFinished = game.finished === "TRUE";
    if (isFinished) {
      statusText = 'Full Time';
    } else if (game.time_elapsed !== "notstarted") {
      statusText = `Live ${game.time_elapsed}'`;
    }

    // Render header
    document.getElementById('matchLoading').style.display = 'none';
    document.getElementById('matchHeader').style.display = 'block';
    document.getElementById('matchStatus').innerText = statusText;
    document.getElementById('matchStatus').className = `hero-badge wc-badge match-status ${game.finished === "TRUE" ? 'ft' : (game.time_elapsed !== 'notstarted' ? 'live' : 'upcoming')}`;
    document.getElementById('matchVenue').innerText = `🏟️ ${venueName}`;
    document.getElementById('teamAFlag').src = flagA;
    document.getElementById('teamBFlag').src = flagB;
    document.getElementById('teamAName').innerText = nameA;
    document.getElementById('teamBName').innerText = nameB;

    if (isFinished || game.time_elapsed !== "notstarted") {
      document.getElementById('matchScore').innerText = `${game.home_score} - ${game.away_score}`;
    } else {
      document.getElementById('matchScore').innerText = "VS";
    }

    // Render tabs contents
    renderLineups(nameA, nameB);
    renderStats(game.home_score, game.away_score, isFinished);
    renderForm(nameA, nameB, flagA, flagB);
    renderNews(nameA, nameB);
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

function getMockRoster(teamName) {
  const players = {
    'Argentina': [
      { name: 'Lionel Messi', pos: 'FW' },
      { name: 'Lautaro Martínez', pos: 'FW' },
      { name: 'Ángel Di María', pos: 'FW' },
      { name: 'Rodrigo De Paul', pos: 'MF' },
      { name: 'Enzo Fernández', pos: 'MF' },
      { name: 'Alexis Mac Allister', pos: 'MF' },
      { name: 'Nahuel Molina', pos: 'DF' },
      { name: 'Cristian Romero', pos: 'DF' },
      { name: 'Nicolás Otamendi', pos: 'DF' },
      { name: 'Nicolás Tagliafico', pos: 'DF' },
      { name: 'Emiliano Martínez', pos: 'GK' }
    ],
    'Brazil': [
      { name: 'Neymar Jr', pos: 'FW' },
      { name: 'Vinícius Júnior', pos: 'FW' },
      { name: 'Rodrygo', pos: 'FW' },
      { name: 'Casemiro', pos: 'MF' },
      { name: 'Lucas Paquetá', pos: 'MF' },
      { name: 'Bruno Guimarães', pos: 'MF' },
      { name: 'Danilo', pos: 'DF' },
      { name: 'Marquinhos', pos: 'DF' },
      { name: 'Gabriel Magalhães', pos: 'DF' },
      { name: 'Guilherme Arana', pos: 'DF' },
      { name: 'Alisson Becker', pos: 'GK' }
    ],
    'France': [
      { name: 'Kylian Mbappé', pos: 'FW' },
      { name: 'Antoine Griezmann', pos: 'FW' },
      { name: 'Ousmane Dembélé', pos: 'FW' },
      { name: 'Aurélien Tchouaméni', pos: 'MF' },
      { name: 'Eduardo Camavinga', pos: 'MF' },
      { name: 'Adrien Rabiot', pos: 'MF' },
      { name: 'Jules Koundé', pos: 'DF' },
      { name: 'Dayot Upamecano', pos: 'DF' },
      { name: 'William Saliba', pos: 'DF' },
      { name: 'Theo Hernández', pos: 'DF' },
      { name: 'Mike Maignan', pos: 'GK' }
    ],
    'England': [
      { name: 'Harry Kane', pos: 'FW' },
      { name: 'Bukayo Saka', pos: 'FW' },
      { name: 'Phil Foden', pos: 'FW' },
      { name: 'Jude Bellingham', pos: 'MF' },
      { name: 'Declan Rice', pos: 'MF' },
      { name: 'Jordan Henderson', pos: 'MF' },
      { name: 'Kyle Walker', pos: 'DF' },
      { name: 'John Stones', pos: 'DF' },
      { name: 'Harry Maguire', pos: 'DF' },
      { name: 'Kieran Trippier', pos: 'DF' },
      { name: 'Jordan Pickford', pos: 'GK' }
    ],
    'Portugal': [
      { name: 'Cristiano Ronaldo', pos: 'FW' },
      { name: 'Rafael Leão', pos: 'FW' },
      { name: 'Bernardo Silva', pos: 'MF' },
      { name: 'Bruno Fernandes', pos: 'MF' },
      { name: 'João Palhinha', pos: 'MF' },
      { name: 'Otávio', pos: 'MF' },
      { name: 'João Cancelo', pos: 'DF' },
      { name: 'Rúben Dias', pos: 'DF' },
      { name: 'António Silva', pos: 'DF' },
      { name: 'Diogo Dalot', pos: 'DF' },
      { name: 'Diogo Costa', pos: 'GK' }
    ],
    'Germany': [
      { name: 'Niclas Füllkrug', pos: 'FW' },
      { name: 'Leroy Sané', pos: 'FW' },
      { name: 'Jamal Musiala', pos: 'MF' },
      { name: 'Florian Wirtz', pos: 'MF' },
      { name: 'Ilkay Gündogan', pos: 'MF' },
      { name: 'Toni Kroos', pos: 'MF' },
      { name: 'Joshua Kimmich', pos: 'DF' },
      { name: 'Antonio Rüdiger', pos: 'DF' },
      { name: 'Jonathan Tah', pos: 'DF' },
      { name: 'David Raum', pos: 'DF' },
      { name: 'Manuel Neuer', pos: 'GK' }
    ],
    'Spain': [
      { name: 'Alvaro Morata', pos: 'FW' },
      { name: 'Lamine Yamal', pos: 'FW' },
      { name: 'Nico Williams', pos: 'FW' },
      { name: 'Pedri', pos: 'MF' },
      { name: 'Rodri', pos: 'MF' },
      { name: 'Fabián Ruiz', pos: 'MF' },
      { name: 'Dani Carvajal', pos: 'DF' },
      { name: 'Robin Le Normand', pos: 'DF' },
      { name: 'Aymeric Laporte', pos: 'DF' },
      { name: 'Marc Cucurella', pos: 'DF' },
      { name: 'Unai Simón', pos: 'GK' }
    ]
  };

  if (players[teamName]) {
    return players[teamName];
  }

  // Generative fallback
  const firstNames = ['David', 'John', 'Michael', 'James', 'Robert', 'William', 'Alex', 'Daniel', 'Lucas', 'Gabriel', 'Mateo', 'Diego', 'Carlos', 'Luis', 'Thomas', 'Marcus'];
  const lastNames = ['Smith', 'Jones', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzales', 'Silva', 'Santos', 'Fischer', 'Weber', 'Becker', 'Gomez'];
  const generated = [];
  const positions = ['FW', 'FW', 'FW', 'MF', 'MF', 'MF', 'DF', 'DF', 'DF', 'DF', 'GK'];
  
  for (let i = 0; i < 11; i++) {
    const fn = firstNames[(i * 3 + teamName.charCodeAt(0)) % firstNames.length];
    const ln = lastNames[(i * 7 + teamName.charCodeAt(1)) % lastNames.length];
    generated.push({ name: `${fn} ${ln}`, pos: positions[i] });
  }
  return generated;
}

function renderLineups(teamAName, teamBName) {
  const container = document.getElementById('lineupsContainer');
  
  const rosters = [
    { teamName: teamAName, players: getMockRoster(teamAName) },
    { teamName: teamBName, players: getMockRoster(teamBName) }
  ];

  let html = '';
  rosters.forEach(r => {
    html += `
      <div class="wc-card" style="padding: 20px;">
        <h3 style="background: #10B981; color: white; padding: 5px 12px; border-radius: 8px; display:inline-block; margin-bottom:15px; font-size:1rem; font-weight:700;">${r.teamName} Roster</h3>
        <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:8px;">
    `;
    r.players.forEach(p => {
      const initials = encodeURIComponent(p.name);
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundType=gradientLinear&fontSize=40`;
      html += `
          <li style="display:flex; justify-content:space-between; align-items:center; padding: 10px 14px; background: #f8fafc; border: 1px solid rgba(15, 28, 63, 0.08); border-radius: 12px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${avatarUrl}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid rgba(15, 28, 63, 0.08);">
              <span style="font-weight: 700; color: #0F1C3F; font-size:0.9rem;">${p.name}</span>
            </div>
            <span style="background:rgba(37,99,235,0.08); color:#2563EB; font-weight:700; font-size:0.75rem; padding: 4px 10px; border-radius:12px;">${p.pos}</span>
          </li>
      `;
    });
    html += `</ul></div>`;
  });
  container.innerHTML = html;
}

function renderStats(scoreA, scoreB, isFinished) {
  const container = document.getElementById('statsContainer');
  
  const sA = parseInt(scoreA, 10) || 0;
  const sB = parseInt(scoreB, 10) || 0;

  // Generate stats
  const totalShots = isFinished ? (12 + (sA + sB) * 2 + Math.floor(Math.random() * 5)) : 0;
  const targetA = isFinished ? (sA + Math.floor(Math.random() * 3)) : 0;
  const targetB = isFinished ? (sB + Math.floor(Math.random() * 3)) : 0;
  const shotsA = isFinished ? Math.max(targetA + 2, Math.floor(totalShots * 0.55)) : 0;
  const shotsB = isFinished ? Math.max(targetB + 2, totalShots - shotsA) : 0;

  const possA = isFinished ? (50 + (sA - sB) * 3 + Math.floor(Math.random() * 6 - 3)) : 50;
  const possB = 100 - possA;

  const stats = [
    { label: 'Possession', valA: `${possA}%`, valB: `${possB}%`, pctA: possA, pctB: possB },
    { label: 'Shots (on Target)', valA: `${shotsA} (${targetA})`, valB: `${shotsB} (${targetB})`, pctA: totalShots ? Math.round((shotsA/totalShots)*100) : 50, pctB: totalShots ? Math.round((shotsB/totalShots)*100) : 50 },
    { label: 'Fouls', valA: isFinished ? '11' : '0', valB: isFinished ? '14' : '0', pctA: 44, pctB: 56 },
    { label: 'Corners', valA: isFinished ? '5' : '0', valB: isFinished ? '4' : '0', pctA: 55, pctB: 45 }
  ];

  let html = `<h3 style="margin-bottom: 20px; text-align:center; font-family:'Outfit'; color:#0F1C3F;">Match Statistics</h3>`;
  stats.forEach(s => {
    html += `
      <div style="margin-bottom: 18px;">
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#475569; margin-bottom:6px;">
          <span style="font-weight:700;">${s.valA}</span>
          <span style="font-weight:800; color:#0F1C3F; font-family:'Outfit';">${s.label}</span>
          <span style="font-weight:700;">${s.valB}</span>
        </div>
        <div style="display:flex; height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
          <div style="width:${s.pctA}%; background:#10b981; border-right: 1px solid white;"></div>
          <div style="width:${s.pctB}%; background:#3b82f6;"></div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderForm(teamAName, teamBName, flagA, flagB) {
  const container = document.getElementById('formContainer');
  
  const forms = [
    { teamName: teamAName, flag: flagA, results: ['W', 'D', 'W', 'W', 'L'] },
    { teamName: teamBName, flag: flagB, results: ['D', 'W', 'L', 'W', 'D'] }
  ];

  let html = '';
  forms.forEach(f => {
    html += `
      <div class="wc-card" style="padding:20px;">
        <h3 style="margin-bottom: 15px; display:flex; align-items:center; gap:12px; font-family:'Outfit'; color:#0F1C3F;">
          <img src="${f.flag}" style="width:28px; height:18px; border-radius:3px; object-fit:cover; border:1px solid rgba(0,0,0,0.08);">
          ${f.teamName} Recent Form
        </h3>
        <div style="display:flex; gap:10px; overflow-x:auto;">
    `;
    f.results.forEach((res, idx) => {
      const color = res === 'W' ? '#10b981' : (res === 'D' ? '#f59e0b' : '#ef4444');
      html += `
         <div style="min-width: 100px; border:1px solid rgba(15, 28, 63, 0.08); padding:12px; border-radius:12px; text-align:center; background:#f8fafc; flex:1;">
           <div style="font-size:1.3rem; font-weight:800; color:${color}; margin-bottom:4px;">${res}</div>
           <div style="font-size:0.75rem; color:#64748b;">Match ${idx+1}</div>
         </div>
      `;
    });
    html += `</div></div>`;
  });
  container.innerHTML = html;
}

function renderNews(teamAName, teamBName) {
  const container = document.getElementById('newsContainer');
  const articles = [
    {
      headline: `${teamAName} vs ${teamBName} Clash Anticipated by Fans Globally`,
      description: `Tactical analysts weigh in on key matchups as both sides gear up for a crucial clash in the FIFA World Cup 2026.`,
      img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60'
    },
    {
      headline: `Training Ground Update: Both squads report fully fit rosters`,
      description: `In the pre-match press conference, managers express confidence and focus on tactical execution ahead of kickoff.`,
      img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=60'
    }
  ];

  let html = '';
  articles.forEach(article => {
    html += `
      <div class="wc-card" style="overflow:hidden; display:flex; flex-direction:column; padding: 0;">
        <img src="${article.img}" style="width:100%; height:180px; object-fit:cover; border-bottom:1px solid rgba(15, 28, 63, 0.08);">
        <div style="padding:20px; display:flex; flex-direction:column; flex:1;">
          <h4 style="font-size:1.05rem; color:#0F1C3F; margin-bottom:8px; font-weight:700; font-family:'Outfit';">${article.headline}</h4>
          <p style="font-size:0.85rem; color:#475569; flex:1; line-height:1.5;">${article.description}</p>
          <a href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026" target="_blank" class="btn btn-outline btn-sm" style="margin-top:15px; text-align:center; border-color:#10b981; color:#10b981;">Read Official Preview</a>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}
