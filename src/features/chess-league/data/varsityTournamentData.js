/**
 * SS4 Chess League: Varsity Tournament - Single Source of Truth
 * Aggregated official tournament data from official posters & match reports.
 * Designed to progressively accept additional rounds, stages, and tournaments.
 */

export const VARSITY_TOURNAMENT_METADATA = {
  id: 'varsity-september-2026',
  title: 'SS4 Chess League: Varsity Tournament',
  season: 'September 2026',
  tagline: 'Many Institutions, One Space.',
  motto: 'The Board Remembers.',
  participatingInstitutionsCount: 11,
  officialPlatforms: {
    gameplay: 'Lichess',
    timeControl: '10+0 Rapid',
    ceremony: 'Zoom'
  }
};

/**
 * Chronological Leaderboard Snapshots
 * Captures progressive rounds and score increases across tournament dates.
 */
export const VARSITY_LEADERBOARD_STAGES = [
  {
    id: 'stage-sept-16-session-1',
    date: '2026-09-16',
    displayDate: 'September 16, 2026',
    stageLabel: 'Session 1 Leaderboard',
    description: 'Opening session leaderboard state on September 16, 2026.',
    standings: [
      { rank: 1, teamId: 'uniuyo', teamName: 'University of Uyo', shortName: 'UNIUYO', playersActive: 5, totalPoints: 135, rankChange: '-' },
      { rank: 2, teamId: 'unilorin', teamName: 'University of Ilorin', shortName: 'UNILORIN', playersActive: 5, totalPoints: 93, rankChange: '-' },
      { rank: 3, teamId: 'unical', teamName: 'University of Calabar', shortName: 'UNICAL', playersActive: 4, totalPoints: 78, rankChange: '-' },
      { rank: 4, teamId: 'bells', teamName: 'Bells University of Technology', shortName: 'BELLS', playersActive: 3, totalPoints: 51, rankChange: '-' },
      { rank: 5, teamId: 'biu', teamName: 'Benson Idahosa University', shortName: 'BIU', playersActive: 4, totalPoints: 49, rankChange: '-' },
      { rank: 6, teamId: 'redeemers', teamName: "Redeemer's University", shortName: 'REDEEMERS', playersActive: 4, totalPoints: 45, rankChange: '-' },
      { rank: 7, teamId: 'landmark', teamName: 'Landmark University', shortName: 'LANDMARK', playersActive: 5, totalPoints: 44, rankChange: '-' },
      { rank: 8, teamId: 'babcock', teamName: 'Babcock University', shortName: 'BABCOCK', playersActive: 4, totalPoints: 43, rankChange: '-' },
      { rank: 9, teamId: 'covenant', teamName: 'Covenant University', shortName: 'COVENANT', playersActive: 4, totalPoints: 40, rankChange: '-' },
      { rank: 10, teamId: 'unn', teamName: 'University of Nigeria Nsukka', shortName: 'UNN', playersActive: 3, totalPoints: 27, rankChange: '-' },
      { rank: 11, teamId: 'futia', teamName: 'Federal University of Technology Ikot Abasi', shortName: 'FUTIA', playersActive: 2, totalPoints: 26, rankChange: '-' }
    ]
  },
  {
    id: 'stage-sept-16-session-2',
    date: '2026-09-16',
    displayDate: 'September 16, 2026',
    stageLabel: 'Session 2 Leaderboard (Post-Covenant Surge)',
    description: 'Updated September 16 leaderboard after Covenant completed full 5-player matches, surging to 54 points.',
    standings: [
      { rank: 1, teamId: 'uniuyo', teamName: 'University of Uyo', shortName: 'UNIUYO', playersActive: 5, totalPoints: 135, rankChange: '-' },
      { rank: 2, teamId: 'unilorin', teamName: 'University of Ilorin', shortName: 'UNILORIN', playersActive: 5, totalPoints: 93, rankChange: '-' },
      { rank: 3, teamId: 'unical', teamName: 'University of Calabar', shortName: 'UNICAL', playersActive: 4, totalPoints: 78, rankChange: '-' },
      { rank: 4, teamId: 'covenant', teamName: 'Covenant University', shortName: 'COVENANT', playersActive: 5, totalPoints: 54, rankChange: '▲5' },
      { rank: 5, teamId: 'bells', teamName: 'Bells University of Technology', shortName: 'BELLS', playersActive: 3, totalPoints: 51, rankChange: '▼1' },
      { rank: 6, teamId: 'biu', teamName: 'Benson Idahosa University', shortName: 'BIU', playersActive: 4, totalPoints: 49, rankChange: '▼1' },
      { rank: 7, teamId: 'redeemers', teamName: "Redeemer's University", shortName: 'REDEEMERS', playersActive: 4, totalPoints: 45, rankChange: '▼1' },
      { rank: 8, teamId: 'landmark', teamName: 'Landmark University', shortName: 'LANDMARK', playersActive: 5, totalPoints: 44, rankChange: '▼1' },
      { rank: 9, teamId: 'babcock', teamName: 'Babcock University', shortName: 'BABCOCK', playersActive: 4, totalPoints: 43, rankChange: '▼1' },
      { rank: 10, teamId: 'unn', teamName: 'University of Nigeria Nsukka', shortName: 'UNN', playersActive: 3, totalPoints: 27, rankChange: '-' },
      { rank: 11, teamId: 'futia', teamName: 'Federal University of Technology Ikot Abasi', shortName: 'FUTIA', playersActive: 2, totalPoints: 26, rankChange: '-' }
    ]
  },
  {
    id: 'stage-sept-18',
    date: '2026-09-18',
    displayDate: '18th September, 2026',
    stageLabel: 'September 18 Leaderboard',
    description: 'Official round standings on September 18, 2026, showing movement deltas and cumulative scoring.',
    standings: [
      { rank: 1, teamId: 'uniuyo', teamName: 'University of Uyo', shortName: 'UNIUYO', playersActive: 5, totalPoints: 206, rankChange: '-', pointsGained: 71 },
      { rank: 2, teamId: 'unilorin', teamName: 'University of Ilorin', shortName: 'UNILORIN', playersActive: 5, totalPoints: 172, rankChange: '-', pointsGained: 79 },
      { rank: 3, teamId: 'unical', teamName: 'University of Calabar', shortName: 'UNICAL', playersActive: 5, totalPoints: 156, rankChange: '-', pointsGained: 78 },
      { rank: 4, teamId: 'biu', teamName: 'Benson Idahosa University', shortName: 'BIU', playersActive: 5, totalPoints: 126, rankChange: '▲1', pointsGained: 77 },
      { rank: 5, teamId: 'babcock', teamName: 'Babcock University', shortName: 'BABCOCK', playersActive: 5, totalPoints: 108, rankChange: '▲3', pointsGained: 65 },
      { rank: 6, teamId: 'landmark', teamName: 'Landmark University', shortName: 'LANDMARK', playersActive: 5, totalPoints: 105, rankChange: '▲1', pointsGained: 61 },
      { rank: 7, teamId: 'redeemers', teamName: "Redeemer's University", shortName: 'REDEEMERS', playersActive: 5, totalPoints: 94, rankChange: '▼1', pointsGained: 49 },
      { rank: 8, teamId: 'bells', teamName: 'Bells University of Technology', shortName: 'BELLS', playersActive: 5, totalPoints: 93, rankChange: '▼4', pointsGained: 42 },
      { rank: 9, teamId: 'covenant', teamName: 'Covenant University', shortName: 'COVENANT', playersActive: 5, totalPoints: 54, rankChange: '-', pointsGained: 0 },
      { rank: 10, teamId: 'futia', teamName: 'Federal University of Technology Ikot Abasi', shortName: 'FUTIA', playersActive: 3, totalPoints: 52, rankChange: '▲1', pointsGained: 26 },
      { rank: 11, teamId: 'unn', teamName: 'University of Nigeria Nsukka', shortName: 'UNN', playersActive: 4, totalPoints: 51, rankChange: '▼1', pointsGained: 24 }
    ]
  },
  {
    id: 'stage-matchday-5',
    date: '2026-09-25',
    displayDate: 'League Matchday 5',
    stageLabel: 'League Matchday 5 (Final League Stage Standings)',
    description: 'Final League Stage standings determining the Top 4 Semifinals qualifiers. UNILORIN surges into 1st place with 2 match wins.',
    standings: [
      { rank: 1, teamId: 'unilorin', teamName: 'University of Ilorin', shortName: 'UNILORIN', totalPoints: 486, rankChange: '▲1', note: '2 WINS', qualifiedForSemifinals: true },
      { rank: 2, teamId: 'uniuyo', teamName: 'University of Uyo', shortName: 'UNIUYO', totalPoints: 474, rankChange: '▼1', note: '2 WINS', qualifiedForSemifinals: true },
      { rank: 3, teamId: 'unical', teamName: 'University of Calabar', shortName: 'UNICAL', totalPoints: 342, rankChange: '-', qualifiedForSemifinals: true },
      { rank: 4, teamId: 'biu', teamName: 'Benson Idahosa University', shortName: 'BIU', totalPoints: 328, rankChange: '-', qualifiedForSemifinals: true },
      { rank: 5, teamId: 'bells', teamName: 'Bells University of Technology', shortName: 'BELLS', totalPoints: 299, rankChange: '-', note: '1 WIN' },
      { rank: 6, teamId: 'redeemers', teamName: "Redeemer's University", shortName: 'REDEEMERS', totalPoints: 223, rankChange: '-' },
      { rank: 7, teamId: 'landmark', teamName: 'Landmark University', shortName: 'LANDMARK', totalPoints: 207, rankChange: '-' },
      { rank: 8, teamId: 'babcock', teamName: 'Babcock University', shortName: 'BABCOCK', totalPoints: 197, rankChange: '-' },
      { rank: 9, teamId: 'unn', teamName: 'University of Nigeria Nsukka', shortName: 'UNN', totalPoints: 118, rankChange: '▲1' },
      { rank: 10, teamId: 'covenant', teamName: 'Covenant University', shortName: 'COVENANT', totalPoints: 113, rankChange: '▼1' },
      { rank: 11, teamId: 'futia', teamName: 'Federal University of Technology Ikot Abasi', shortName: 'FUTIA', totalPoints: 52, rankChange: '-' }
    ]
  }
];

/**
 * Semifinals Fixtures & Match Results
 * Seed 1 (UNILORIN) vs Seed 4 (BIU)
 * Seed 2 (UNIUYO) vs Seed 3 (UNICAL)
 */
export const VARSITY_SEMIFINALS = {
  id: 'varsity-semifinals-sept-2026',
  title: "SS4 Chess League Varsity Tournament Sept. '26: Semifinals",
  tagline: 'Many Institutions, One Space.',
  teaser: 'WHO WILL BE THE LAST TWO CONTENDERS?',
  platform: 'Lichess',
  timeControl: '10+0 Rapid',
  matches: [
    {
      matchId: 'semi-match-1',
      roundLabel: 'Semifinal 1',
      date: '2026-09-27',
      displayDate: 'Sunday, 27th September, 2026',
      time: '8:00 PM (WAT)',
      teamA: {
        teamId: 'unilorin',
        teamName: 'University of Ilorin',
        shortName: 'UNILORIN',
        score: 3,
        winner: true
      },
      teamB: {
        teamId: 'biu',
        teamName: 'Benson Idahosa University',
        shortName: 'BIU',
        score: 2,
        winner: false
      },
      result: '3 - 2',
      winnerId: 'unilorin',
      boards: [
        {
          board: 1,
          playerA: { name: 'Iysa Bello', handle: 'iysabello' },
          scoreA: 2,
          scoreB: 0,
          playerB: { name: 'Clinton Ayodele', handle: 'Fidelishickman' },
          winner: 'teamA'
        },
        {
          board: 2,
          playerA: { name: 'Fasiku David', handle: 'Kryptonflash' },
          scoreA: 2,
          scoreB: 0,
          playerB: { name: 'Iheanyichukwu Godswill', handle: 'Gmajor' },
          winner: 'teamA'
        },
        {
          board: 3,
          playerA: { name: 'Malik Idrees', handle: 'able_planner1' },
          scoreA: 0,
          scoreB: 2,
          playerB: { name: 'Jeffery', handle: 'Punstar' },
          winner: 'teamB'
        },
        {
          board: 4,
          playerA: { name: 'Kenneth Gilbert', handle: 'Fastandmaybefurious' },
          scoreA: 0,
          scoreB: 2,
          playerB: { name: 'Ogbewe James Edosa', handle: 'EdosaJames' },
          winner: 'teamB'
        },
        {
          board: 5,
          playerA: { name: 'Durojaye Boluwatife', handle: 'Jaiyeblexxy' },
          scoreA: 2,
          scoreB: 0,
          playerB: { name: 'Lawal Doyinsola', handle: 'Doybest' },
          winner: 'teamA'
        }
      ]
    },
    {
      matchId: 'semi-match-2',
      roundLabel: 'Semifinal 2',
      date: '2026-09-28',
      displayDate: 'Monday, 28th September, 2026',
      time: '8:00 PM (WAT)',
      teamA: {
        teamId: 'uniuyo',
        teamName: 'University of Uyo',
        shortName: 'UNIUYO',
        score: 1.5,
        winner: false
      },
      teamB: {
        teamId: 'unical',
        teamName: 'University of Calabar',
        shortName: 'UNICAL',
        score: 3.5,
        winner: true
      },
      result: '1.5 - 3.5',
      winnerId: 'unical',
      boards: [
        {
          board: 1,
          playerA: { name: 'Amakuro Minalabh', handle: 'D-GENIUS' },
          scoreA: 2,
          scoreB: 0,
          playerB: { name: 'Praiseosuwakeh John', handle: 'PRAISE-09' },
          winner: 'teamA'
        },
        {
          board: 2,
          playerA: { name: 'Esamah Testimony', handle: 'YOLOWORSHIPPER' },
          scoreA: 0,
          scoreB: 2,
          playerB: { name: 'Dean Sonnie Bassey', handle: 'DEANBASSEY001' },
          winner: 'teamB'
        },
        {
          board: 3,
          playerA: { name: 'Peter Eti', handle: 'MINATOE5' },
          scoreA: 1.5,
          scoreB: 1.5,
          playerB: { name: 'Precious Ekwe John', handle: 'SCRABBLEPLAYER28' },
          winner: 'draw'
        },
        {
          board: 4,
          playerA: { name: 'Jesse Edem', handle: 'TYRANT' },
          scoreA: 1.5,
          scoreB: 1.5,
          playerB: { name: 'Ita Best James', handle: 'BESTMVH001' },
          winner: 'draw'
        },
        {
          board: 5,
          playerA: { name: 'Joseph Esang', handle: 'EMJAYCHESS' },
          scoreA: 0,
          scoreB: 2,
          playerB: { name: 'Ezekiel David Samuel', handle: 'EZEKIELGUKESH' },
          winner: 'teamB'
        }
      ]
    }
  ]
};

/**
 * Finals Showdown & Closing Ceremony
 * Finalists: University of Calabar (UNICAL) vs University of Ilorin (UNILORIN)
 */
export const VARSITY_FINALS_SHOWDOWN = {
  id: 'varsity-finals-2026-09-30',
  title: 'SS4 Chess League Varsity Tournament Finals: The Final Showdown',
  date: '2026-09-30',
  displayDate: 'Wednesday, 30th September, 2026',
  matchTime: '8:00 PM (WAT)',
  matchPlatform: 'Lichess',
  timeControl: '10+0 Rapid',
  format: 'Best of 3',
  finalists: {
    teamA: {
      teamId: 'unical',
      teamName: 'University of Calabar',
      shortName: 'UNICAL',
      logoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=120&h=120&fit=crop',
      color: '#E11D48'
    },
    teamB: {
      teamId: 'unilorin',
      teamName: 'University of Ilorin',
      shortName: 'UNILORIN',
      logoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=120&h=120&fit=crop',
      color: '#DB2777'
    }
  },
  closingCeremony: {
    time: '9:30 PM (WAT)',
    platform: 'Zoom',
    agenda: 'Championship • Individual & Team Awards'
  },
  tagline: '- The Board Remembers. -'
};

/**
 * Team Lineups (Full 5-Board Rosters Across 11 Institutions)
 * Enriched with confirmed Lichess tournament handles from match sheets.
 */
export const VARSITY_LINEUPS = [
  {
    teamId: 'bells',
    teamName: 'Bells University of Technology',
    shortName: 'BELLS',
    players: [
      { board: 1, name: 'Anietie Ben', handle_c: 'Jude_Ben', handle_l: 'Jhudex', platform: 'lichess' },
      { board: 2, name: 'Isuekevbo Joel', handle_c: 'MaouTanner', handle_l: 'Uduehi', platform: 'chesscom' },
      { board: 3, name: 'Oyebode Samuel', handle_c: 'TheWeehfhi', handle_l: 'Weehfhi_Plays', platform: 'chesscom' },
      { board: 4, name: 'Okoya Oladimeji', handle_c: 'OkoyaOluwadamilare', handle_l: 'OkoyaOluwadamilare', platform: 'chesscom' },
      { board: 5, name: 'Henshaw John', handle_c: 'Shin_12', handle_l: 'Shin_12', platform: 'chesscom' }
    ]
  },
  {
    teamId: 'uniuyo',
    teamName: 'University of Uyo',
    shortName: 'UNIUYO',
    players: [
      { board: 1, name: 'Amakuro Minalabh', handle_c: 'AmakuroM', handle_l: 'D-GENIUS', platform: 'lichess' },
      { board: 2, name: 'Esamah Testimony', handle_c: 'EsangUwe_26', handle_l: 'YOLOWORSHIPPER', platform: 'lichess' },
      { board: 3, name: 'Peter Eti', handle_c: 'Minatoe5', handle_l: 'MINATOE5', platform: 'lichess' },
      { board: 4, name: 'Jesse Edem', handle_c: 'Jesse70256', handle_l: 'TYRANT', platform: 'lichess' },
      { board: 5, name: 'Joseph Esang', handle_c: 'EsangUwe_26', handle_l: 'EMJAYCHESS', platform: 'lichess' }
    ]
  },
  {
    teamId: 'babcock',
    teamName: 'Babcock University',
    shortName: 'BABCOCK',
    players: [
      { board: 1, name: 'Adedipe Temini', handle_c: 'Godhasbachir', handle_l: 'Truthwithtemi', platform: 'lichess' },
      { board: 2, name: 'Timi David Opeyemi', handle_c: 'TimiDavidOp', handle_l: 'TimiDavid', platform: 'lichess' },
      { board: 3, name: 'George George', handle_c: 'Georgie_jn', handle_l: 'GeorgeG', platform: 'chesscom' },
      { board: 4, name: 'Lawore Daniel', handle_c: 'dannylaw23', handle_l: 'DannyLaw', platform: 'lichess' },
      { board: 5, name: 'Ogunsanya Iteoluwaleyi', handle_c: 'Iteoluwaleyi', handle_l: 'OgunsanyaI', platform: 'chesscom' }
    ]
  },
  {
    teamId: 'futia',
    teamName: 'Federal University of Technology Ikot Abasi',
    shortName: 'FUTIA',
    players: [
      { board: 1, name: 'Thompson Etimbuk Paul', handle_c: 'Bayron-sage7', handle_l: 'Bayron-sage_7', platform: 'lichess' },
      { board: 2, name: 'Emmanuel Micheal', handle_c: 'Ikbeast1', handle_l: 'EmmaMichael', platform: 'chesscom' },
      { board: 3, name: 'Bassey Okon Etia', handle_c: 'BOE200', handle_l: 'BasseyEtia', platform: 'chesscom' },
      { board: 4, name: 'David Ituen Ofonime', handle_c: 'ItuenDavid', handle_l: 'DavidItuen', platform: 'chesscom' },
      { board: 5, name: 'Covenant Ifiok Udobia', handle_c: 'Anonix_01', handle_l: 'Anonix_01', platform: 'chesscom' }
    ]
  },
  {
    teamId: 'unn',
    teamName: 'University of Nigeria Nsukka',
    shortName: 'UNN',
    players: [
      { board: 1, name: 'Okoli Tochukwu', handle_c: 'HAKAI_026', handle_l: 'HAKAI026', platform: 'lichess' },
      { board: 2, name: 'Ugwu Praise Chinwuba', handle_c: 'PraiseChinwuba', handle_l: 'PraiseUgwu', platform: 'chesscom' },
      { board: 3, name: 'Chukwumaeze Joseph', handle_c: 'joeblaq104', handle_l: 'JoeChukwuma', platform: 'chesscom' },
      { board: 4, name: 'Kenechukwu Micheal', handle_c: 'Kenemichael', handle_l: 'KeneMichael', platform: 'chesscom' },
      { board: 5, name: 'AGU DANIEL', handle_c: 'Yari-bem', handle_l: 'YariBem05', platform: 'lichess' }
    ]
  },
  {
    teamId: 'redeemers',
    teamName: "Redeemer's University",
    shortName: 'REDEEMERS',
    players: [
      { board: 1, name: 'Daniel Daniel', handle_c: 'DanielSquare', handle_l: 'Daniel2', platform: 'lichess' },
      { board: 2, name: 'Odukoya Emmanuel', handle_c: 'EmmaOdukoya', handle_l: 'OdukoyaE', platform: 'chesscom' },
      { board: 3, name: 'John Akeju', handle_c: 'AkejuJohn', handle_l: 'JohnAkeju', platform: 'chesscom' },
      { board: 4, name: 'David Oladipo', handle_c: 'DavidOladipo', handle_l: 'OladipoD', platform: 'chesscom' },
      { board: 5, name: 'Akinduti Damilare', handle_c: 'DamilareA', handle_l: 'AkindutiD', platform: 'chesscom' }
    ]
  },
  {
    teamId: 'landmark',
    teamName: 'Landmark University',
    shortName: 'LANDMARK',
    players: [
      { board: 1, name: 'Omotunde oluwadamilare', handle_c: 'OmotundeDami', handle_l: 'OluwadamilareO', platform: 'chesscom' },
      { board: 2, name: 'Mbah Ernest', handle_c: 'ErnestMbah', handle_l: 'MbahErnest', platform: 'chesscom' },
      { board: 3, name: 'Emmanuel Chisom', handle_c: 'ChisomEmma', handle_l: 'EmmanuelChisom', platform: 'chesscom' },
      { board: 4, name: 'Edafe Osagie', handle_c: 'EdafeOsagie', handle_l: 'OsagieEdafe', platform: 'chesscom' },
      { board: 5, name: 'Obi Princewill', handle_c: 'Mathemachesser-the-GOAT', handle_l: 'Mathemachesser', platform: 'lichess' }
    ]
  },
  {
    teamId: 'unilorin',
    teamName: 'University of Ilorin',
    shortName: 'UNILORIN',
    players: [
      { board: 1, name: 'Iysa Bello', handle_c: 'AdegboyegaIB', handle_l: 'iysabello', platform: 'lichess' },
      { board: 2, name: 'Fasiku David', handle_c: 'DavidFasiku', handle_l: 'Kryptonflash', platform: 'lichess' },
      { board: 3, name: 'Malik Idrees', handle_c: 'MalikIdris_01', handle_l: 'able_planner1', platform: 'lichess' },
      { board: 4, name: 'Kenneth Gilbert', handle_c: 'Prince_of_pieceX', handle_l: 'Fastandmaybefurious', platform: 'lichess' },
      { board: 5, name: 'Durojaye Boluwatife', handle_c: 'TifeDurojaiye', handle_l: 'Jaiyeblexxy', platform: 'lichess' }
    ]
  },
  {
    teamId: 'unical',
    teamName: 'University of Calabar',
    shortName: 'UNICAL',
    players: [
      { board: 1, name: 'Praiseosuwakeh John', handle_c: 'fishytactician', handle_l: 'PRAISE-09', platform: 'lichess' },
      { board: 2, name: 'Dean Sonnie Bassey', handle_c: 'deanbassey001', handle_l: 'DEANBASSEY001', platform: 'lichess' },
      { board: 3, name: 'Precious Ekwe John', handle_c: 'fishytactician', handle_l: 'SCRABBLEPLAYER28', platform: 'lichess' },
      { board: 4, name: 'Ita Best James', handle_c: 'Bestmvh', handle_l: 'BESTMVH001', platform: 'lichess' },
      { board: 5, name: 'Ezekiel David Samuel', handle_c: 'NobbieFF', handle_l: 'EZEKIELGUKESH', platform: 'lichess' },
      { board: 6, name: 'Gloria okoro', handle_c: 'Gloria0726', handle_l: 'Glorrreeeyy', platform: 'lichess' }
    ]
  },
  {
    teamId: 'covenant',
    teamName: 'Covenant University',
    shortName: 'COVENANT',
    players: [
      { board: 1, name: 'Ninuoluwa', handle_c: 'Ninuoluwa', handle_l: 'Ninuoluwa', platform: 'lichess' },
      { board: 2, name: 'Anuchi Emmanuel Chijindu', handle_c: 'Robobobobobobob', handle_l: 'ChijinduAnuchi', platform: 'chesscom' },
      { board: 3, name: 'Alao David O.', handle_c: 'AlaoDavid', handle_l: 'DavidAlao', platform: 'chesscom' },
      { board: 4, name: 'Malasowe Ezekiel', handle_c: 'meeeot', handle_l: 'MalasoweE', platform: 'chesscom' },
      { board: 5, name: 'Divine chigozirim', handle_c: 'DivineChigo', handle_l: 'ChigozirimD', platform: 'chesscom' }
    ]
  },
  {
    teamId: 'biu',
    teamName: 'Benson Idahosa University',
    shortName: 'BIU',
    players: [
      { board: 1, name: 'Clinton Ayodele', handle_c: 'ClintonAkin', handle_l: 'Fidelishickman', platform: 'lichess' },
      { board: 2, name: 'Iheanyichukwu Godswill', handle_c: 'GodswillIhe', handle_l: 'Gmajor', platform: 'lichess' },
      { board: 3, name: 'Jeffery', handle_c: 'ObanorJeffrey', handle_l: 'Punstar', platform: 'lichess' },
      { board: 4, name: 'Ogbewe James Edosa', handle_c: 'EdosaOgbewe', handle_l: 'EdosaJames', platform: 'lichess' },
      { board: 5, name: 'Lawal Doyinsola', handle_c: 'DoyinsolaLawal', handle_l: 'Doybest', platform: 'lichess' }
    ]
  }
];

/**
 * Accessor Helpers
 */
export function getLeaderboardStage(stageId) {
  return VARSITY_LEADERBOARD_STAGES.find(s => s.id === stageId) || VARSITY_LEADERBOARD_STAGES[VARSITY_LEADERBOARD_STAGES.length - 1];
}

export function getLatestLeaderboard() {
  return VARSITY_LEADERBOARD_STAGES[VARSITY_LEADERBOARD_STAGES.length - 1];
}

export function getSemifinals() {
  return VARSITY_SEMIFINALS;
}

export function getFinalsShowdown() {
  return VARSITY_FINALS_SHOWDOWN;
}

export function getTeamHistory(teamId) {
  return VARSITY_LEADERBOARD_STAGES.map(stage => {
    const entry = stage.standings.find(s => s.teamId === teamId);
    return {
      stageId: stage.id,
      date: stage.date,
      displayDate: stage.displayDate,
      rank: entry?.rank || null,
      totalPoints: entry?.totalPoints || 0,
      playersActive: entry?.playersActive || 0,
      rankChange: entry?.rankChange || '-'
    };
  });
}
