/**
 * SS4 Chess League: Varsity Tournament Season 2 (Nov. '26)
 * Single source of truth for verified Season 2 tournament metadata,
 * clickable match calendar, official overall standings, and star players.
 */

export const VARSITY_S2_METADATA = {
  id: 'varsity-nov-2026-s2',
  title: 'SS4 Varsity Games',
  fullTitle: "SS4 Chess League: Varsity Tournament Nov. '26",
  season: 'Season 2',
  editionLabel: "Nov. '26",
  tagline: 'Featuring the best chess players from top Universities in Nigeria.',
  motto: 'Many Institutions. One Space.',
  dateWindow: '18th – 30th November 2026',
  dateWindowShort: '18 – 30 Nov',
  platform: 'Lichess',
  institutionsCount: 15,
  playersPerTeam: 5,
  leagueDaysTotal: 4,
  leagueDaysCompleted: 1,
  qualificationCutoff: 8,
  qualificationNote: 'Top 8 qualify for the Quarter-Finals',
  posterUrl: '/varsity-nov-2026-poster.png',
  youtubeChannel: 'https://youtube.com/@sharedstudyschoolspace',
  youtubeChannelLabel: 'youtube.com/@sharedstudyschoolspace',
};

/**
 * Official Overall Standings — After League Day 1 of 4
 * Top 8 institutions qualify for the Quarter-Finals.
 */
export const VARSITY_S2_STANDINGS = [
  { rank: 1, id: 'unilag', shortName: 'UNILAG', name: 'University of Lagos', d1: 172, d2: null, d3: null, d4: null, total: 172, qualifiesQF: true },
  { rank: 2, id: 'futa', shortName: 'FUTA', name: 'Federal University of Technology, Akure', d1: 138, d2: null, d3: null, d4: null, total: 138, qualifiesQF: true },
  { rank: 3, id: 'unilorin', shortName: 'UNILORIN', name: 'University of Ilorin', d1: 119, d2: null, d3: null, d4: null, total: 119, qualifiesQF: true },
  { rank: 4, id: 'uniben', shortName: 'UNIBEN', name: 'University of Benin', d1: 112, d2: null, d3: null, d4: null, total: 112, qualifiesQF: true },
  { rank: 5, id: 'delsu', shortName: 'DELSU', name: 'Delta State University', d1: 109, d2: null, d3: null, d4: null, total: 109, qualifiesQF: true },
  { rank: 6, id: 'uniuyo', shortName: 'UNIUYO', name: 'University of Uyo', d1: 102, d2: null, d3: null, d4: null, total: 102, qualifiesQF: true },
  { rank: 7, id: 'absu', shortName: 'ABSU', name: 'Abia State University', d1: 97, d2: null, d3: null, d4: null, total: 97, qualifiesQF: true },
  { rank: 8, id: 'atbu', shortName: 'ATBU', name: 'Abubakar Tafawa Balewa University', d1: 95, d2: null, d3: null, d4: null, total: 95, qualifiesQF: true },
  { rank: 9, id: 'rsu', shortName: 'RSU', name: 'Rivers State University', d1: 77, d2: null, d3: null, d4: null, total: 77, qualifiesQF: false },
  { rank: 10, id: 'udus', shortName: 'UDUS', name: 'Usmanu Danfodiyo University, Sokoto', d1: 61, d2: null, d3: null, d4: null, total: 61, qualifiesQF: false },
  { rank: 11, id: 'unn', shortName: 'UNN', name: 'University of Nigeria, Nsukka', d1: 61, d2: null, d3: null, d4: null, total: 61, qualifiesQF: false },
  { rank: 12, id: 'bells', shortName: 'BELLS', name: 'Bells University of Technology', d1: 60, d2: null, d3: null, d4: null, total: 60, qualifiesQF: false },
  { rank: 13, id: 'mouau', shortName: 'MOUAU', name: 'Michael Okpara University of Agriculture, Umudike', d1: 48, d2: null, d3: null, d4: null, total: 48, qualifiesQF: false },
  { rank: 14, id: 'futminna', shortName: 'FUTMINNA', name: 'Federal University of Technology, Minna', d1: 34, d2: null, d3: null, d4: null, total: 34, qualifiesQF: false },
  { rank: 15, id: 'fubk', shortName: 'FUBK', name: 'Federal University Birnin Kebbi', d1: 33, d2: null, d3: null, d4: null, total: 33, qualifiesQF: false },
];

/**
 * Verified Official Star Players — League Day 1
 */
export const VARSITY_S2_STAR_PLAYERS = [
  {
    id: 'md1-top-scorer',
    category: 'Top Scorer',
    matchDay: 1,
    matchDayLabel: 'League Day 1',
    institutionId: 'unilag',
    university: 'University of Lagos',
    shortName: 'UNILAG',
    name: 'Abiamunwe Goodness',
    handle: 'abiamuwegoodness',
    rating: 2205,
    metrics: [
      { label: 'Arena Points', value: '57', highlight: true },
      { label: "Of UNILAG's Total", value: '33%' },
      { label: 'Games', value: '19' },
    ],
  },
  {
    id: 'md1-best-performance',
    category: 'Best Performance',
    matchDay: 1,
    matchDayLabel: 'League Day 1',
    institutionId: 'delsu',
    university: 'Delta State University',
    shortName: 'DELSU',
    name: 'Moses Uzum',
    handle: 'uzum3',
    rating: 2327,
    metrics: [
      { label: 'Performance', value: '2483', highlight: true },
      { label: 'Arena Points', value: '37' },
      { label: 'Games', value: '13' },
    ],
  },
];

/**
 * Verified Match Events (Season 2)
 */
export const VARSITY_S2_EVENTS = [
  {
    key: 'MD1',
    matchDay: 1,
    day: 18,
    weekday: 'Wed',
    dateStr: 'Wed, 18 Nov',
    timeRange: '8:00–9:00 PM',
    title: 'SS4 Varsity Games · League Match Day 1',
    shortTitle: 'Match Day 1',
    gridLabel: 'Day 1',
    gridLabelShort: 'MD1',
    phase: 'League Stage',
    stage: 'League Day 1 of 4',
    timeControl: '3+0 Blitz',
    institutionsCount: 15,
    playersPerTeam: 5,
    status: 'COMPLETED',
    isCompleted: true,
    isLive: false,
    id: 'wfufA03G',
    link: 'https://lichess.org/tournament/wfufA03G',
    highlightsUrl: 'https://youtube.com/shorts/iSLqvMT9urk?feature=share',
    highlightsVideoId: 'iSLqvMT9urk',
    description: 'League Match Day 1 (3+0 Blitz · 15 Institutions · 5 Players each) on Lichess has concluded. UNILAG leads the table with 172 pts ahead of FUTA (138 pts) and UNILORIN (119 pts).',
    podium: VARSITY_S2_STANDINGS.slice(0, 3).map((team, idx) => ({
      rank: team.rank,
      label: idx === 0 ? '1st Place' : idx === 1 ? '2nd Place' : '3rd Place',
      shortName: team.shortName,
      name: team.name,
      score: team.d1,
    })),
    standings: VARSITY_S2_STANDINGS.map((team) => ({
      rank: team.rank,
      id: team.id,
      shortName: team.shortName,
      name: team.name,
      score: team.d1,
      qualifiesQF: team.qualifiesQF,
    })),
    starPlayers: VARSITY_S2_STAR_PLAYERS,
  },
  {
    key: 'MD2',
    matchDay: 2,
    day: 20,
    weekday: 'Fri',
    dateStr: 'Fri, 20 Nov',
    timeRange: '8:00–9:00 PM',
    title: 'SCL Varsity Games · Matchday 2',
    shortTitle: 'Match Day 2',
    gridLabel: 'Day 2',
    gridLabelShort: 'MD2',
    phase: 'League Stage',
    stage: 'League Day 2 of 4',
    timeControl: '3+0 Blitz',
    institutionsCount: 15,
    playersPerTeam: 5,
    status: 'COMPLETED',
    isCompleted: true,
    isLive: false,
    startTime: '2026-11-20T20:00:00+01:00',
    endTime: '2026-11-20T21:00:00+01:00',
    id: 'CnYWk8AG',
    link: 'https://lichess.org/tournament/CnYWk8AG',
    highlightsUrl: null,
    highlightsVideoId: null,
    description: 'League Match Day 2 (3+0 Blitz · 15 Institutions · 5 Players each) on Lichess has concluded.',
    podium: null,
    standings: null,
    starPlayers: null,
  },
  {
    key: 'MD3',
    matchDay: 3,
    day: 22,
    weekday: 'Sun',
    dateStr: 'Sun, 22 Nov',
    timeRange: '8:00–9:00 PM',
    title: 'SCL Varsity Games · Matchday 3',
    shortTitle: 'Match Day 3',
    gridLabel: 'Day 3',
    gridLabelShort: 'MD3',
    phase: 'League Stage',
    stage: 'League Day 3 of 4',
    timeControl: '3+0 Blitz',
    institutionsCount: 15,
    playersPerTeam: 5,
    status: 'UPCOMING',
    isCompleted: false,
    isLive: false,
    startTime: '2026-11-22T20:00:00+01:00',
    endTime: '2026-11-22T21:00:00+01:00',
    id: 'VPQtOc6R',
    link: 'https://lichess.org/tournament/VPQtOc6R',
    highlightsUrl: null,
    highlightsVideoId: null,
    description: 'In less than 2 hours, League Match 3 kicks off. Sun 22 Nov · 8:00–9:00 PM · 3+0 Blitz on Lichess.',
    podium: null,
    standings: null,
    starPlayers: null,
  },
];

export function isVarsityEventLive(event, now = Date.now()) {
  if (!event) return false;
  if (event.isLive) return true;
  if (event.startTime && event.endTime) {
    const start = new Date(event.startTime).getTime();
    const end = new Date(event.endTime).getTime();
    return now >= start && now <= end;
  }
  return false;
}

export function isVarsityEventCompleted(event, now = Date.now()) {
  if (!event) return false;
  if (event.isCompleted) return true;
  if (event.endTime) {
    return now > new Date(event.endTime).getTime();
  }
  return false;
}

export function getCurrentLiveVarsityMatch(now = Date.now(), events = VARSITY_S2_EVENTS) {
  for (const ev of events) {
    if (isVarsityEventLive(ev, now)) {
      return ev;
    }
  }
  return null;
}

export function buildCalendarDays(events = VARSITY_S2_EVENTS) {
  return events.map((ev, idx) => {
    const isLive = isVarsityEventLive(ev);
    const isCompleted = isVarsityEventCompleted(ev);
    const status = isLive ? 'LIVE' : isCompleted ? 'COMPLETED' : ev.status || 'UPCOMING';
    const day = ev.day;
    const weekday = ev.weekday || new Date(2026, 10, day).toLocaleDateString('en-US', { weekday: 'short' });
    return {
      day,
      dayIndex: idx + 1,
      weekday,
      hasMatch: true,
      matchDay: ev.matchDay,
      title: ev.title,
      shortTitle: ev.shortTitle,
      phase: ev.phase,
      stage: ev.stage,
      status,
      isCompleted,
      isLive,
      timeRange: ev.timeRange,
      timeControl: ev.timeControl,
      institutionsCount: ev.institutionsCount,
      playersPerTeam: ev.playersPerTeam,
      arenaLink: ev.link,
      arenaId: ev.id,
      highlightsUrl: ev.highlightsUrl,
      highlightsVideoId: ev.highlightsVideoId,
      description: ev.description,
      podium: ev.podium,
      standings: ev.standings,
      starPlayers: ev.starPlayers,
      gridLabel: ev.gridLabel,
      gridLabelShort: ev.gridLabelShort,
      key: ev.key,
      startTime: ev.startTime || null,
      endTime: ev.endTime || null,
    };
  });
}

/**
 * Clickable Tournament Calendar: Confirmed match days only (Day 1 & Day 2)
 * Unplayed/unscheduled days are omitted until confirmed and uploaded.
 */
export const VARSITY_S2_CALENDAR_DAYS = buildCalendarDays(VARSITY_S2_EVENTS);
