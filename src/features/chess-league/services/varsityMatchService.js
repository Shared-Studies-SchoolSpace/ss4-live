import { supabase } from '../../../supabase.js';
import { VARSITY_S2_EVENTS } from '../data/varsitySeason2Data.js';

const SETTINGS_KEY = 'varsity_season2_events';
const LOCAL_STORAGE_KEY = 'ss4_varsity_season2_events';
const UPDATE_EVENT_NAME = 'ss4-varsity-events-updated';

/**
 * Extract Lichess tournament ID from raw input or URL
 */
export function extractTournamentId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/lichess\.org\/tournament\/([a-zA-Z0-9_-]{8,12})/);
  if (match && match[1]) return match[1];
  const directId = trimmed.match(/^([a-zA-Z0-9_-]{8,12})$/);
  if (directId && directId[1]) return directId[1];
  return trimmed;
}

/**
 * Synchronous read from localStorage with fallback to default VARSITY_S2_EVENTS
 */
export function getStoredEvents() {
  if (typeof window === 'undefined') return VARSITY_S2_EVENTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read cached varsity events:', err);
  }
  return VARSITY_S2_EVENTS;
}

/**
 * Fetch latest events from Supabase settings table, syncing to localStorage
 */
export async function fetchVarsityEvents() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('data')
      .eq('id', SETTINGS_KEY)
      .maybeSingle();

    if (!error && data?.data?.events && Array.isArray(data.data.events) && data.data.events.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.data.events));
        window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: data.data.events }));
      }
      return data.data.events;
    }
  } catch (err) {
    console.warn('Could not fetch varsity events from cloud:', err);
  }
  return getStoredEvents();
}

/**
 * Persist events to Supabase and localStorage, then broadcast
 */
export async function saveVarsityEvents(events) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: events }));
  }

  try {
    const { error } = await supabase
      .from('settings')
      .upsert({
        id: SETTINGS_KEY,
        data: { events },
      });

    if (error) {
      console.warn('Supabase save error (saved locally):', error.message);
    }
  } catch (err) {
    console.warn('Could not upsert varsity events:', err);
  }

  return events;
}

/**
 * Add or update a match day (e.g. Day 3)
 */
export async function addOrUpdateMatchDay(formData) {
  const currentEvents = await fetchVarsityEvents();
  const tournamentId = extractTournamentId(formData.link || formData.id);
  const link = formData.link?.startsWith('http')
    ? formData.link.trim()
    : `https://lichess.org/tournament/${tournamentId}`;

  const matchDay = parseInt(formData.matchDay, 10);
  const day = parseInt(formData.day, 10);

  const newEvent = {
    key: `MD${matchDay}`,
    matchDay,
    day,
    weekday: formData.weekday || 'TBA',
    dateStr: formData.dateStr || `Day ${matchDay}`,
    timeRange: formData.timeRange || '8:00–9:00 PM',
    title: formData.title || `SCL Varsity Games · Matchday ${matchDay}`,
    shortTitle: `Match Day ${matchDay}`,
    gridLabel: `Day ${matchDay}`,
    gridLabelShort: `MD${matchDay}`,
    phase: 'League Stage',
    stage: `League Day ${matchDay} of 4`,
    timeControl: formData.timeControl || '3+0 Blitz',
    institutionsCount: formData.institutionsCount || 15,
    playersPerTeam: formData.playersPerTeam || 5,
    status: formData.status || 'UPCOMING',
    isCompleted: false,
    isLive: false,
    startTime: formData.startTime || null,
    endTime: formData.endTime || null,
    id: tournamentId,
    link,
    highlightsUrl: formData.highlightsUrl || null,
    highlightsVideoId: formData.highlightsVideoId || null,
    description: formData.description || `League Match ${matchDay} on Lichess.`,
    podium: null,
    standings: null,
    starPlayers: null,
  };

  const existingIdx = currentEvents.findIndex((e) => e.matchDay === matchDay || e.id === tournamentId);
  let updated;
  if (existingIdx >= 0) {
    updated = [...currentEvents];
    updated[existingIdx] = { ...updated[existingIdx], ...newEvent };
  } else {
    updated = [...currentEvents, newEvent];
  }

  // Sort by matchDay ascending
  updated.sort((a, b) => a.matchDay - b.matchDay);

  return saveVarsityEvents(updated);
}

/**
 * Remove a match day (guards Day 1 & 2)
 */
export async function removeMatchDay(matchDay) {
  const currentEvents = await fetchVarsityEvents();
  if (matchDay <= 2) {
    throw new Error('Day 1 and Day 2 are official verified records and cannot be removed.');
  }
  const updated = currentEvents.filter((e) => e.matchDay !== matchDay);
  return saveVarsityEvents(updated);
}

/**
 * Subscribe to real-time events updates across Supabase and current window
 */
export function subscribeToVarsityEvents(onUpdate) {
  const handleLocal = (e) => {
    if (e.detail && Array.isArray(e.detail)) {
      onUpdate(e.detail);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(UPDATE_EVENT_NAME, handleLocal);
  }

  const channelId = `varsity-events-${Math.random().toString(36).substring(2, 9)}`;
  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'settings', filter: `id=eq.${SETTINGS_KEY}` },
      (payload) => {
        if (payload.new?.data?.events) {
          onUpdate(payload.new.data.events);
        }
      }
    )
    .subscribe();

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(UPDATE_EVENT_NAME, handleLocal);
    }
    supabase.removeChannel(channel);
  };
}
