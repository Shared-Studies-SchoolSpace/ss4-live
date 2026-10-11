// Initial Feed Data for SS4 Platform Ecosystem
// Authentic posts with strict chronological timestamps and post indexing:
// October Tournament Poster (postIndex: 0) -> October Aspirants (postIndex: 1) -> September Varsity (postIndex: 2, 3) -> August Tournament (postIndex: 4, 5, 6)

export const INITIAL_FEED_POSTS = [
  {
    id: 'post_admin_october_theboardgames_2026',
    postIndex: 0,
    createdAt: '2026-10-09T08:00:00Z',
    timestamp: '2026-10-09T08:00:00Z',
    postType: 'multimedia',
    mediaType: 'poster',
    imageUrl: '/october-tournament-poster.png',
    categoryClass: 'tournament',
    readTime: '',
    isUnread: true,
    author: {
      name: 'SS4',
      avatarImg: '/ss4_logo_without_text.jpg',
      isAdmin: true,
      time: 'Oct 9, 2026'
    },
    title: 'SS4 Chess League: theBOARDGAMES (October 2026) — Nigeria’s Top University Chess Masters Collide on Lichess!',
    excerpt: `♟️ **SS4 CHESS LEAGUE — theBOARDGAMES**
*Featuring the best chess players from top universities in Nigeria.*

The October 2026 inter-collegiate championship is officially live! Across 23 days of relentless digital warfare, the sharpest collegiate minds and university contenders in Nigeria clash on 64 squares for institutional supremacy and national ranking points.

📅 **TOURNAMENT DETAILS:**
• **Match Window:** 9th – 31st October 2026
• **Hosting Platform:** **Lichess** (Official SS4 Arena & Swiss Lobbies)
• **Participants:** Elite university contenders from Nigeria’s premier tertiary institutions

⚡ **OFFICIAL TIME CONTROLS:**
• **Blitz:** 3 + 0
• **Blitz:** 5 + 0
• **Rapid:** 10 + 0

🏛️ **INSTITUTIONAL BATTLEFIELD:**
Contenders representing Covenant University, UNILORIN, Bells University of Technology, FUTIA, UNIUYO, Babcock, Landmark, UNN, UNICAL, Redeemer’s University, and Benson Idahosa University take the stage.

Will Covenant University's Anuchi Emmanuel defend his August crown, or will a new grandmaster rise to claim the October mantle?

**The Board Remembers.**`,
    tags: ['#theBOARDGAMES', '#SS4ChessLeague', '#OctoberTournament', '#Lichess', '#UniversityChess', '#TheBoardRemembers'],
    likesCount: 46,
    isLiked: false,
    isBookmarked: false,
    embed: {
      type: 'lobby',
      actionLabel: 'Enter Tournament Arena & Live Hub →',
      onAction: () => {
        window.location.href = '/theboardgames';
      },
      calendarEvent: {
        title: 'SS4 Chess League: theBOARDGAMES (October 2026)',
        description: 'Featuring the best chess players from top universities in Nigeria (Oct 9–31, 2026). Hosted online on Lichess. Time Controls: 3+0, 5+0, 10+0. The Board Remembers.',
        startDate: '2026-10-09',
        endDate: '2026-10-31',
        location: 'Online (Lichess)'
      }
    },
    comments: []
  },
  {
    id: 'post_admin_october_aspirants_2026',
    postIndex: 1,
    createdAt: '2026-10-02T09:00:00Z',
    timestamp: '2026-10-02T09:00:00Z',
    postType: 'text',
    categoryLabel: 'Official Announcement',
    categoryClass: 'announcement',
    readTime: '2 min read',
    isUnread: true,
    author: {
      name: 'SS4',
      avatarImg: '/ss4_logo_without_text.jpg',
      isAdmin: true,
      time: 'Oct 2, 2026'
    },
    title: 'SS4 Aspirants Award 2026: First Cycle Applications Open October 30!',
    excerpt: `The official SS4 academic prestige program announcement:

🎓 **SS4 ASPIRANTS AWARD 2026:**
First Cycle Announcement: Applications open **October 30, 2026**!

The Aspirants Award is a prestige recognition program designed to celebrate the highest verified JAMB UTME scorers among our verified SS4 partner secondary schools. Top-performing students receive comprehensive cash prizes, corporate sponsorship recognition, and national academic spotlighting.

• **Eligibility:** Must be a registered SS3 student in an SS4 affiliated secondary school
• **Criterion:** Highest verified score in the Joint Admissions and Matriculation Board (JAMB) UTME
• **Reward:** Comprehensive cash prize and corporate sponsorship packages
• **Recognition:** National highlight across the SS4 platform and partner networks

Many Institutions, One Space. The Board Remembers.`,
    tags: ['#SS4October2026', '#AspirantsAward', '#JAMBExcellence', '#AcademicPrestige', '#TheBoardRemembers'],
    likesCount: 31,
    isLiked: false,
    isBookmarked: false,
    embed: {
      type: 'lobby',
      actionLabel: 'View Aspirants Award Details →',
      onAction: () => {
        window.location.href = '/aspirants-award';
      }
    },
    comments: []
  },
  {
    id: 'post_admin_varsity_lineups_2026',
    postIndex: 2,
    createdAt: '2026-09-16T12:00:00Z',
    timestamp: '2026-09-16T12:00:00Z',
    postType: 'multimedia',
    mediaType: 'poster',
    imageUrl: '/varsity-lineups-poster.jpg',
    categoryClass: 'tournament',
    readTime: '',
    isUnread: true,
    author: {
      name: 'SS4',
      avatarImg: '/ss4_logo_without_text.jpg',
      isAdmin: true,
      time: 'Sept 16, 2026'
    },
    title: 'SS4 Chess League Varsity Tournament: Official 11-Team Squad Lineups Released!',
    excerpt: `The official squad lineups for the SS4 Chess League Varsity Tournament are locked in! 11 top Nigerian institutions, 55 elite contenders, 1 national varsity crown.

🏆 OFFICIAL VARSITY SQUAD ROSTERS:

<h1 style="color: #DC2626; font-size: 1.35rem; font-weight: 900; font-family: 'Outfit', sans-serif; margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.01em;">🚩 1. BELLS UNIVERSITY OF TECHNOLOGY</h1>
<div class="player-name-badge-vertical">01 Anietie Ben</div>
<div class="player-name-badge-vertical">02 Isuekwebo Joel</div>
<div class="player-name-badge-vertical">03 Oyebode Samuel</div>
<div class="player-name-badge-vertical">04 Okoya Oladimeji</div>
<div class="player-name-badge-vertical">05 Henshaw John</div>

<h1 style="color: #EA580C; font-size: 1.35rem; font-weight: 900; font-family: 'Outfit', sans-serif; margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.01em;">⚡ 2. UNIVERSITY OF UYO (UNIUYO)</h1>
<div class="player-name-badge-vertical">01 Jesse Edem</div>
<div class="player-name-badge-vertical">02 Esang Uwe</div>
<div class="player-name-badge-vertical">03 God'swisdom</div>
<div class="player-name-badge-vertical">04 Amakuro Minalabh</div>
<div class="player-name-badge-vertical">05 Peter Eti</div>

<h1 style="color: #D97706; font-size: 1.35rem; font-weight: 900; font-family: 'Outfit', sans-serif; margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.01em;">👑 3. BABCOCK UNIVERSITY</h1>
<div class="player-name-badge-vertical">01 Adedipe Temini</div>
<div class="player-name-badge-vertical">02 Timi David Opeyemi</div>
<div class="player-name-badge-vertical">03 George George</div>
<div class="player-name-badge-vertical">04 Lawore Daniel</div>
<div class="player-name-badge-vertical">05 Ogunsanya Iteoluwaleyi</div>

<h1 style="color: #059669; font-size: 1.35rem; font-weight: 900; font-family: 'Outfit', sans-serif; margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.01em;">🌲 4. FEDERAL UNIVERSITY OF TECHNOLOGY IKOT ABASI (FUTIA)</h1>
<div class="player-name-badge-vertical">01 Thompson Etimbuk Pauli</div>
<div class="player-name-badge-vertical">02 Emmanuel Micheal</div>
<div class="player-name-badge-vertical">03 Bassey Okon Etia</div>
<div class="player-name-badge-vertical">04 David Ituen Ofonime</div>
<div class="player-name-badge-vertical">05 Covenant Ifiok Udobia</div>

<h1 style="color: #0284C7; font-size: 1.35rem; font-weight: 900; font-family: 'Outfit', sans-serif; margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.01em;">🦁 5. UNIVERSITY OF NIGERIA NSUKKA (UNN)</h1>
<div class="player-name-badge-vertical">01 Okoli Tochukwu</div>
<div class="player-name-badge-vertical">02 Ugwu Praise Chinwuba</div>
<div class="player-name-badge-vertical">03 Chukwumaeze Joseph</div>
<div class="player-name-badge-vertical">04 Kenechukwu Micheal</div>
<div class="player-name-badge-vertical">05 AGU DANIEL</div>

<h1 style="color: #2563EB; font-size: 1.35rem; font-weight: 900; font-family: 'Outfit', sans-serif; margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.01em;">✝️ 6. REDEEMER'S UNIVERSITY</h1>
<div class="player-name-badge-vertical">01 Daniel Daniel</div>
<div class="player-name-badge-vertical">02 Odukoya Emmanuel</div>
<div class="player-name-badge-vertical">03 John Akeju</div>
<div class="player-name-badge-vertical">04 David Oladipo</div>
<div class="player-name-badge-vertical">05 Akinduti Damilare</div>

<h1 style="color: #7C3AED; font-size: 1.35rem; font-weight: 900; font-family: 'Outfit', sans-serif; margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.01em;">🎓 7. LANDMARK UNIVERSITY</h1>
<div class="player-name-badge-vertical">01 Omotunde oluwadamilare</div>
<div class="player-name-badge-vertical">02 Mbah Ernest</div>
<div class="player-name-badge-vertical">03 Emmanuel Chisom</div>
<div class="player-name-badge-vertical">04 Edafe Osagie</div>
<div class="player-name-badge-vertical">05 Obi Princewill</div>

<h1 style="color: #DB2777; font-size: 1.35rem; font-weight: 900; font-family: 'Outfit', sans-serif; margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.01em;">⚔️ 8. UNIVERSITY OF ILORIN (UNILORIN)</h1>
<div class="player-name-badge-vertical">01 Kenneth Gilbert</div>
<div class="player-name-badge-vertical">02 Durojaiye Boluwatife</div>
<div class="player-name-badge-vertical">03 Malik Idris</div>
<div class="player-name-badge-vertical">04 Fasiku David</div>
<div class="player-name-badge-vertical">05 Iysa-bello Adegboyega</div>

<h1 style="color: #E11D48; font-size: 1.35rem; font-weight: 900; font-family: 'Outfit', sans-serif; margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.01em;">🏆 9. UNIVERSITY OF CALABAR (UNICAL)</h1>
<div class="player-name-badge-vertical">01 Ita Best James</div>
<div class="player-name-badge-vertical">02 John, Praisesquwakeh Ekwe</div>
<div class="player-name-badge-vertical">03 Bassey, Dean Sonnie</div>
<div class="player-name-badge-vertical">04 Emmanuel Edet</div>
<div class="player-name-badge-vertical">05 Gloria okoro</div>

<h1 style="color: #0D9488; font-size: 1.35rem; font-weight: 900; font-family: 'Outfit', sans-serif; margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.01em;">🏛️ 10. COVENANT UNIVERSITY</h1>
<div class="player-name-badge-vertical">01 Ninuoluwa</div>
<div class="player-name-badge-vertical">02 Anuchi Emmanuel Chijindu</div>
<div class="player-name-badge-vertical">03 Alao David O.</div>
<div class="player-name-badge-vertical">04 Malasowe Ezekiel</div>
<div class="player-name-badge-vertical">05 Divine chigozirim</div>

<h1 style="color: #B45309; font-size: 1.35rem; font-weight: 900; font-family: 'Outfit', sans-serif; margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: -0.01em;">🦅 11. BENSON IDAHOSA UNIVERSITY (BIU)</h1>
<div class="player-name-badge-vertical">01 Akinrogunde Clinton</div>
<div class="player-name-badge-vertical">02 Jeffrey obanor</div>
<div class="player-name-badge-vertical">03 Iheanyichukwu Godswill</div>
<div class="player-name-badge-vertical">04 Ogbewe James Edosa</div>
<div class="player-name-badge-vertical">05 Lawal doyinsola</div>

**Many Institutions, One Space. The Board Remembers.**`,
    tags: ['#SS4VarsityTournament', '#TeamLineups', '#11Universities', '#ChessNigeria', '#TheBoardRemembers'],
    likesCount: 18,
    isLiked: false,
    isBookmarked: false,
    embed: {
      type: 'lobby',
      actionLabel: 'View Team Rosters & Live Hub →',
      onAction: () => {
        window.location.href = '/chess-league/tournament?tab=varsity';
      },
      calendarEvent: {
        title: 'SS4 Chess League Varsity Tournament 2026',
        description: 'Official match play for SS4 Chess League Varsity Tournament featuring 11 university squads (Sept 16–30, 2026). Hosted online on Chess.com & Lichess.',
        startDate: '2026-09-16',
        endDate: '2026-09-30',
        location: 'Online (Chess.com & Lichess)'
      }
    },
    comments: []
  },
  {
    id: 'post_admin_varsity_tournament_2026',
    postIndex: 3,
    createdAt: '2026-09-14T10:00:00Z',
    timestamp: '2026-09-14T10:00:00Z',
    postType: 'multimedia',
    mediaType: 'poster',
    imageUrl: '/varsity-tournament-poster.jpeg',
    categoryClass: 'tournament',
    readTime: '',
    isUnread: false,
    author: {
      name: 'SS4',
      avatarImg: '/ss4_logo_without_text.jpg',
      isAdmin: true,
      time: 'Sept 14, 2026'
    },
    title: 'SS4 Chess League Varsity Tournament 2026: Nigeria’s Top Universities Clash — Rosters Closed!',
    excerpt: 'Nigeria’s premier inter-university chess championship is officially underway. From September 16th to 30th, 2026, the sharpest collegiate minds from top universities across Nigeria will clash in high-stakes 5-player squad battles hosted online on Chess.com and Lichess. The champion university takes home the national varsity crown and 5x 1-Month Chess.com Premium memberships.\n\n• Format: Teams of 5 contenders per institution\n• Match Window: 16th – 30th September 2026\n• Status: Rosters & Line-ups fully confirmed!\n• Match Hosting: Chess.com & Lichess\n\nFor arbiters and corporate university sponsorships, contact directly at 09060515456 or 08161673691.\n\nMany Institutions, One Space. The Board Remembers.',
    tags: ['#SS4VarsityTournament', '#UniversityChess', '#ChessNigeria', '#ChessDotCom', '#Lichess', '#TheBoardRemembers'],
    likesCount: 8,
    isLiked: false,
    isBookmarked: false,
    embed: {
      type: 'lobby',
      actionLabel: null,
      calendarEvent: {
        title: 'SS4 Chess League Varsity Tournament 2026',
        description: 'Nigeria’s premier inter-university chess championship (Sept 16–30, 2026). Teams of 5 contenders per institution hosted online on Chess.com and Lichess. Contact Arbiters: 09060515456 or 08161673691. Many Institutions, One Space. The Board Remembers.',
        startDate: '2026-09-16',
        endDate: '2026-09-30',
        location: 'Online (Chess.com & Lichess)'
      }
    },
    comments: []
  },
  {
    id: 'post_admin_august_champion_2026',
    postIndex: 4,
    createdAt: '2026-09-04T22:30:00Z',
    timestamp: '2026-09-04T22:30:00Z',
    postType: 'multimedia',
    mediaType: 'poster',
    imageUrl: '/august-tournament-champion.png',
    categoryClass: 'tournament',
    readTime: '',
    isUnread: false,
    author: {
      name: 'SS4',
      avatarImg: '/ss4_logo_without_text.jpg',
      isAdmin: true,
      time: 'Sept 4, 2026'
    },
    title: 'Crowned: Anuchi Emmanuel of Covenant University is the SS4 August Tournament Champion!',
    excerpt: `Out of Many Players, One Emerges — CHAMPION OF AUGUST! 🏆♟️

Congratulations to Anuchi Emmanuel (@Robobobobobobob_Emma / @robobobobobobob) from the Department of Electrical Engineering, Covenant University, for claiming the August 2026 SS4 Chess League Championship title!

Following an intense 56-player tournament run spanning 14 groups, Round of 32, Sweet 16, Quarterfinals, and Semifinals, Emmanuel delivered a masterclass performance in the Grand Final to hoist the August trophy.

🏅 TOURNAMENT RECAP:
• Champion: Anuchi Emmanuel (Covenant University — Electrical Engineering)
• Runner-up: Kenneth Gilbert (University of Ilorin — Mathematics)
• Semifinalists: Emmanuel Michael (FUTIA), James Henshaw (Bells Tech)
• Total Field: 56 contenders across 14 university institutions
• Total Battles: 115 fiercely contested matches

Many Institutions, One Space. The Board Remembers.`,
    tags: ['#SS4AugustChampion', '#AnuchiEmmanuel', '#CovenantUniversity', '#ChessNigeria', '#TheBoardRemembers'],
    likesCount: 42,
    isLiked: false,
    isBookmarked: false,
    embed: {
      type: 'lobby',
      actionLabel: 'View August Bracket & Results →',
      onAction: () => {
        window.location.href = '/chess-league/tournament?month=2026-08';
      }
    },
    comments: []
  },
  {
    id: 'post_admin_august_semifinals_2026',
    postIndex: 5,
    createdAt: '2026-09-03T19:00:00Z',
    timestamp: '2026-09-03T19:00:00Z',
    postType: 'multimedia',
    mediaType: 'poster',
    imageUrl: '/august-tournament-semifinals.png',
    categoryClass: 'tournament',
    readTime: '',
    isUnread: false,
    author: {
      name: 'SS4',
      avatarImg: '/ss4_logo_without_text.jpg',
      isAdmin: true,
      time: 'Sept 3, 2026'
    },
    title: 'SS4 Chess League August Semifinals: The Final Four Clash Tonight at 8:00 PM!',
    excerpt: `SS4 CHESS LEAGUE — SEMIFINALS ⚔️
Many Institutions, One Space.

Only four collegiate grandmasters remain standing. Tonight, two spots in the Grand Final are on the line as Nigeria's finest university talents face off over 64 squares!

📅 DATE: Thursday, September 3rd, 2026
⏰ TIME: 8:00 PM WAT
♟️ HOSTED ON: Chess.com & Lichess

🔥 SEMIFINAL FIXTURES:
• BOARD 1:
  Emmanuel Michael (@lkbeast1)
  Aerospace Engineering, Federal University of Technology, Ikot Abasi (FUTIA)
  vs
  Kenneth Gilbert (@Prince_of_pieceX)
  Mathematics, University of Ilorin (UNILORIN)

• BOARD 2:
  James Henshaw (@oblivion1416)
  Mechatronics Engineering, Bells University of Technology
  vs
  Anuchi Emmanuel (@robobobobobobob)
  Electrical Engineering, Covenant University

WHO WILL BE IN THE FINALS?
Many Institutions, One Space. The Board Remembers.`,
    tags: ['#SS4AugustTournament', '#FinalFour', '#Semifinals', '#FUTIA', '#UNILORIN', '#BellsTech', '#CovenantUniversity'],
    likesCount: 29,
    isLiked: false,
    isBookmarked: false,
    comments: []
  },
  {
    id: 'post_admin_august_quarterfinals_2026',
    postIndex: 6,
    createdAt: '2026-09-02T19:00:00Z',
    timestamp: '2026-09-02T19:00:00Z',
    postType: 'multimedia',
    mediaType: 'poster',
    imageUrl: '/august-tournament-quarterfinals.jpg',
    categoryClass: 'tournament',
    readTime: '',
    isUnread: false,
    author: {
      name: 'SS4',
      avatarImg: '/ss4_logo_without_text.jpg',
      isAdmin: true,
      time: 'Sept 2, 2026'
    },
    title: 'SS4 Chess League August Quarterfinals: Elite 8 Contenders Collide Tonight at 8:00 PM!',
    excerpt: `SS4 CHESS LEAGUE — QUARTERFINALS ⚔️
Many Institutions, One Space.

From 56 players down to the Elite 8! The battle for inter-university chess supremacy reaches fever pitch tonight as the quarterfinal showdowns commence over 64 squares.

📅 DATE: Wednesday, September 2nd, 2026
⏰ TIME: 8:00 PM WAT

🔥 QUARTERFINAL FIXTURES:
• BOARD 1:
  Emmanuel Michael (@lkbeast1) — Aerospace Engineering, FUTIA
  vs
  Jesse Edem (@jesse70256) — Biochemistry, UNIUYO

• BOARD 2:
  Kenneth Gilbert (@Prince_of_pieceX) — Mathematics, UNILORIN
  vs
  Princewill Obi (@Mathemachesser-THE-GOAT) — Computer Science, Landmark University

• BOARD 3:
  Akogo Simon (@Akogo) — Computer Science, Babcock University
  vs
  Anuchi Emmanuel (@robobobobobobob) — Electrical Engineering, Covenant University

• BOARD 4:
  Dean Bassey (@deanbassey001) — Medicine and Surgery, UNICAL
  vs
  James Henshaw (@oblivion1416) — Mechatronics Engineering, Bells University of Technology

WHO WILL MAKE IT TO THE FINAL FOUR?
Many Institutions, One Space. The Board Remembers.`,
    tags: ['#SS4Quarterfinals', '#Elite8', '#AugustTournament', '#ChessNigeria', '#TheBoardRemembers'],
    likesCount: 22,
    isLiked: false,
    isBookmarked: false,
    comments: []
  }
];
