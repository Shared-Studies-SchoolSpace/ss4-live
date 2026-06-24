import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useTournament } from '../hooks/useTournament';
import { TournamentHero } from '../components/tournament/TournamentHero';
import { BracketTab } from '../components/tournament/BracketTab';
import { TournamentPlayerModal } from '../components/tournament/TournamentPlayerModal';

const ADMIN_PIN = '1926';

const SCHEDULE = [
  { label: 'Day 1', desc: 'Round 1',  date: 'June 24' },
  { label: 'Day 2', desc: 'Round 2',  date: 'June 25' },
  { label: 'Day 3', desc: 'Round 3',  date: 'June 26' },
  { label: 'Day 4', desc: 'Quarterfinals',date: 'June 27' },
  { label: 'Day 5', desc: 'Semifinals',   date: 'June 28' },
  { label: 'Day 6', desc: 'Rest / Tiebreaks', date: 'June 29' },
  { label: 'Day 7', desc: 'Final',        date: 'June 30' },
];

export default function ChessTournamentPage() {
  const [selectedMonthYear, setSelectedMonthYear] = useState('2026-06');
  const [activeTab, setActiveTab]   = useState('bracket');
  const [isAdmin, setIsAdmin]       = useState(false);
  const [pinModal, setPinModal]     = useState(false);
  const [pinInput, setPinInput]     = useState('');
  const [pinErr, setPinErr]         = useState('');
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);

  const { tournament, history, isDbFallback, initialize, logResult, saveGameLink, advanceRound, reset, clearMocks } = useTournament(selectedMonthYear);

  const submitPin = () => {
    if (pinInput === ADMIN_PIN) { setIsAdmin(true); setPinModal(false); toast.success('Admin unlocked'); }
    else { setPinErr('Wrong PIN'); setPinInput(''); }
  };

  const TABS = [
    { id: 'bracket',    label: 'Bracket'   },
    { id: 'results',    label: 'Results'   },
    { id: 'fixtures',   label: 'Fixtures'  },
    { id: 'rules',      label: 'Rules & Schedule' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F6F4F0]">
      <ToastContainer position="bottom-right" />

      <TournamentHero
        tournament={tournament}
        selectedMonthYear={selectedMonthYear}
        history={history}
        onMonthChange={setSelectedMonthYear}
        onTitleDoubleClick={() => { setPinInput(''); setPinErr(''); setPinModal(true); }}
      />

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-6 md:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto flex gap-6 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`py-4 text-sm font-black whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === t.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-[#111111]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* DB status pill */}
      {isDbFallback && (
        <div className="bg-amber-50 border-b border-amber-100 text-center py-2 px-4">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Offline — changes stored locally</p>
        </div>
      )}

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-0 py-10">

        {/* BRACKET */}
        {activeTab === 'bracket' && (
          <BracketTab
            tournament={tournament}
            isAdmin={isAdmin}
            onLogResult={(gameId, winner, link) => logResult(gameId, winner, link)}
            onSaveGameLink={saveGameLink}
            onAdvanceRound={advanceRound}
            onInitialize={initialize}
            onPlayerClick={setSelectedPlayerForModal}
          />
        )}

        {/* RESULTS */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {!tournament ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                <p className="text-gray-400 py-10 text-base font-bold">No tournament results available.</p>
              </div>
            ) : (() => {
              const roundsWithResults = tournament.rounds.map(r => {
                const completedGames = r.games.filter(g => g.winner && g.p1 && g.p2 && g.p2.username !== 'bye');
                return { ...r, completedGames };
              }).filter(r => r.completedGames.length > 0);

              if (roundsWithResults.length === 0) {
                return (
                  <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                    <p className="text-gray-400 py-10 text-base font-bold">No matches have been completed yet.</p>
                  </div>
                );
              }

              return roundsWithResults.map(r => (
                <div key={r.roundNum} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
                    <h3 className="font-space font-black text-lg text-[#111111]">{r.name}</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                      {r.completedGames.length} Completed
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {r.completedGames.map((g) => {
                      const isP1Winner = g.winner?.username === g.p1?.username;
                      const isP2Winner = g.winner?.username === g.p2?.username;
                      return (
                        <div key={g.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            {/* Player 1 */}
                            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                              isP1Winner ? 'bg-emerald-50/40 border-emerald-100' : 'bg-gray-50/50 border-gray-100'
                            }`}>
                              <div className="min-w-0 flex-1">
                                <button
                                  onClick={() => setSelectedPlayerForModal(g.p1)}
                                  className="text-sm font-black text-[#111111] hover:text-brand-primary hover:underline truncate text-left cursor-pointer outline-none block"
                                >
                                  {g.p1?.name}
                                </button>
                                <span className="text-[10px] font-bold text-gray-400 block truncate">
                                  {g.p1?.school} {g.p1?.rating ? `(${g.p1.rating})` : ''}
                                </span>
                              </div>
                              {isP1Winner && (
                                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-1 rounded shrink-0 ml-2">
                                  Winner
                                </span>
                              )}
                            </div>

                            {/* Player 2 */}
                            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                              isP2Winner ? 'bg-emerald-50/40 border-emerald-100' : 'bg-gray-50/50 border-gray-100'
                            }`}>
                              <div className="min-w-0 flex-1">
                                <button
                                  onClick={() => setSelectedPlayerForModal(g.p2)}
                                  className="text-sm font-black text-[#111111] hover:text-brand-primary hover:underline truncate text-left cursor-pointer outline-none block"
                                >
                                  {g.p2?.name}
                                </button>
                                <span className="text-[10px] font-bold text-gray-400 block truncate">
                                  {g.p2?.school} {g.p2?.rating ? `(${g.p2.rating})` : ''}
                                </span>
                              </div>
                              {isP2Winner && (
                                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-1 rounded shrink-0 ml-2">
                                  Winner
                                </span>
                              )}
                            </div>
                          </div>

                          {g.gameLink && (
                            <a
                              href={g.gameLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-black text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 px-4 py-2.5 rounded-xl transition-colors text-center shrink-0 border border-brand-primary/10"
                            >
                              View Game
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
        {/* FIXTURES */}
        {activeTab === 'fixtures' && (
          <div className="space-y-6">
            {!tournament ? (
              <p className="text-center text-gray-400 py-20 text-base font-bold">No fixtures generated yet.</p>
            ) : tournament.rounds.map(r => {
              const active = r.games.filter(g => g.p1 && g.p2 && g.p2.username !== 'bye');
              if (!active.length) return null;
              return (
                <div key={r.roundNum} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
                    <h3 className="font-space font-black text-lg text-[#111111]">{r.name}</h3>
                    <span className="text-xs font-bold text-brand-primary bg-brand-primary/5 px-3 py-1.5 rounded-full">{r.date}</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {active.map((g, i) => (
                      <div key={g.id} className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => setSelectedPlayerForModal(g.p1)}
                            className="text-sm md:text-base font-bold text-[#111111] hover:text-brand-primary hover:underline truncate text-left cursor-pointer outline-none"
                          >
                            {g.p1?.name}
                          </button>
                          <span className="text-xs font-black text-brand-accent shrink-0 select-none">VS</span>
                          <button
                            onClick={() => setSelectedPlayerForModal(g.p2)}
                            className="text-sm md:text-base font-bold text-[#111111] hover:text-brand-primary hover:underline truncate text-left cursor-pointer outline-none"
                          >
                            {g.p2?.name}
                          </button>
                        </div>
                        {g.winner
                          ? <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg shrink-0">Won: {g.winner.name}</span>
                          : <span className="text-xs bg-amber-50 text-amber-600 font-bold px-3 py-1.5 rounded-lg shrink-0">Pending</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* RULES & SCHEDULE */}
        {activeTab === 'rules' && (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left/Middle Column: Scrollable Rulebook */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm max-h-[800px] overflow-y-auto no-scrollbar space-y-6">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-brand-accent uppercase mb-1">Official Rulebook</p>
                <h2 className="font-space font-black text-3xl text-[#111111] mb-2 uppercase">SCL Tournament Rules</h2>
                <p className="text-sm text-gray-500 italic">Read carefully. Ignorance of these rules is not an excuse, but honest mistakes have a fair appeal window.</p>
              </div>

              <div className="space-y-6 divide-y divide-gray-100 text-sm text-gray-600 leading-relaxed">
                {/* SECTION 1 */}
                <div className="pt-5 first:pt-0">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 1: Overview</h3>
                  <p className="mb-2">The SS4 Chess League (SCL) is a monthly inter-institutional chess tournament open to students across multiple universities and colleges. It operates as a single-elimination knockout competition, styled after football cup tournaments.</p>
                  <ul className="space-y-1.5 bg-gray-50 p-3 rounded-xl font-medium">
                    <li>· <strong>Format:</strong> Single Elimination Knockout</li>
                    <li>· <strong>Platform:</strong> Chess.com (all games)</li>
                    <li>· <strong>Duration:</strong> June 24 – 30, 2026</li>
                    <li>· <strong>One round per day</strong></li>
                    <li>· <strong>Kick-off time:</strong> 8:00 PM WAT daily</li>
                  </ul>
                </div>

                {/* SECTION 2 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 2: Eligibility &amp; Registration</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>2.1</strong> Open to students of any institution. Register via the official Google Form before the deadline.</li>
                    <li><strong>2.2</strong> Registration deadline: June 22nd, 11:59 PM. No late registrations.</li>
                    <li><strong>2.3</strong> You must provide a valid, active Chess.com username (yours alone).</li>
                    <li><strong>2.4</strong> Provide correct WhatsApp number, full name, school, and department.</li>
                    <li><strong>2.5</strong> One registration per person. Duplicates = disqualification of both.</li>
                    <li><strong>2.6</strong> By registering, you confirm availability to play June 24–30, 6 PM – 10 PM daily.</li>
                  </ul>
                </div>

                {/* SECTION 3 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 3: Seeding &amp; Bracket</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>3.1</strong> Seeded by Chess.com Rapid rating (minimum 20 rated games).</li>
                    <li><strong>3.2</strong> Provisional (less than 20 games) or unrated players go to bottom of bracket (random order).</li>
                    <li><strong>3.3</strong> Byes go to highest-rated non-provisional players to reach the nearest power of 2.</li>
                    <li><strong>3.4</strong> Same-school players are drawn as far apart as possible; can only meet in later rounds.</li>
                    <li><strong>3.5</strong> Full bracket live on official SCL page from June 23rd (link pinned in group).</li>
                  </ul>
                </div>

                {/* SECTION 4 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 4: Match Rules</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>4.1</strong> All games on Chess.com with your registered username only.</li>
                    <li><strong>4.2</strong> Time control: 10+0 Rapid (10 minutes, no increment).</li>
                    <li><strong>4.3</strong> Colours: White = left side of pairing message · Black = right side. Colours alternate across rounds fairly.</li>
                    <li><strong>4.4</strong> Game must be Standard rated Rapid (not unrated, bullet, or blitz).</li>
                    <li><strong>4.5</strong> White player sends challenge to Black player’s Chess.com username.</li>
                    <li><strong>4.6</strong> Results pulled automatically via Chess.com API; no manual reporting needed.</li>
                  </ul>
                </div>

                {/* SECTION 5 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 5: Draw Rule</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>5.1</strong> If a game ends in a draw, a Best of 3 tiebreak applies immediately.</li>
                    <li><strong>5.2</strong> Best of 3: first to win 2 games advances.</li>
                    <li><strong>5.3</strong> Tiebreak time control: Game 1: original 10+0 · Game 2: 10+0 · Game 3 (if needed): 5+3 (5 minutes, 3-second increment) to prevent endless draws.</li>
                    <li><strong>5.4</strong> Colours alternate: Game 1: original assignment · Game 2: reversed · Game 3 (if needed): original again.</li>
                    <li><strong>5.5</strong> All tiebreak games must be completed by 11:00 PM WAT same night.</li>
                    <li><strong>5.6</strong> If still tied after 3 tiebreak games (extremely rare): Armageddon: White gets 5+0, Black gets 4+0, draw = Black wins (guarantees a winner before 11:15 PM WAT).</li>
                  </ul>
                </div>

                {/* SECTION 6 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 6: Scheduling &amp; Grace Period</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>6.1</strong> Every round starts at 8:00 PM WAT on its assigned date. **Round 1 lasts from 8:00 PM WAT (June 24) to 12:00 PM (noon) tomorrow (June 25)**. Other rounds: R2: June 25 · R3: June 26 · R4: June 27 · QF: June 28 · SF: June 29 · Final: June 30.</li>
                    <li><strong>6.2</strong> When pairings are posted, immediately contact your opponent to agree on a start time. For Round 1, agree on a time between 8:00 PM June 24 and 12:00 PM June 25. For subsequent rounds, agree on a time between 8:00 PM – 11:00 PM WAT same night.</li>
                    <li><strong>6.3</strong> Grace period closes at 11:00 PM WAT (or 12:00 PM tomorrow for Round 1). Both players must be ready.</li>
                    <li><strong>6.4</strong> Early play (before 8:00 PM WAT) allowed only with admin approval requested before 6:00 PM WAT that day.</li>
                  </ul>
                </div>

                {/* SECTION 7 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 7: Forfeit Rules</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>7.1</strong> One player absent: If opponent does not respond to WhatsApp and is not online by 10:30 PM WAT: Screenshot your unanswered message(s) and send to admin immediately. You receive a walkover win.</li>
                    <li><strong>7.2</strong> Both players absent: Both disqualified. Highest-rated first-round loser from same bracket quarter becomes lucky loser. If no eligible player, admin awards a bye.</li>
                    <li><strong>7.3</strong> Responsibility: You must check the group and contact your opponent. "I did not see the message" is not an excuse.</li>
                    <li><strong>7.4</strong> Admin forfeit decisions are final but may be reviewed within the appeal window.</li>
                  </ul>
                </div>

                {/* SECTION 8 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 8: Fair Play &amp; Conduct</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>8.1</strong> Engine use is strictly forbidden. No computer assistance, databases, or analysis tools during games.</li>
                    <li><strong>8.2</strong> Chess.com Fair Play system monitors all games. If flagged: Immediate disqualification, opponent advances, permanent ban from all future SCL tournaments. No warnings. No appeals for engine use.</li>
                    <li><strong>8.3</strong> You must play on your registered Chess.com username. Playing on another account = permanent ban.</li>
                    <li><strong>8.4</strong> Allowing someone else to play on your account = permanent ban for both.</li>
                    <li><strong>8.5</strong> Respectful conduct required in chat, WhatsApp group, and DMs. Offenses lead to warnings or disqualification.</li>
                    <li><strong>8.6</strong> Conduct complaints require screenshots as evidence. No evidence = no action.</li>
                  </ul>
                </div>

                {/* SECTION 9 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 9: School Leaderboard</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>9.1</strong> Every player represents their school. Results contribute to a School Leaderboard.</li>
                    <li><strong>9.2</strong> Performance Above Expected (PAE): Exceeding expectation based on seed = positive PAE for school. Underperforming = negative PAE.</li>
                    <li><strong>9.3</strong> Schools need at least 2 registered players to appear on the leaderboard.</li>
                    <li><strong>9.4</strong> Same-school matchups are PAE-neutral. Both players' expected rounds are extended by one.</li>
                    <li><strong>9.5</strong> Leaderboard link pinned in group; check after every round.</li>
                  </ul>
                </div>

                {/* SECTION 10 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 10: Prizes</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>10.1</strong> Champion: Chess.com Diamond Premium (1 month), Official SCL Champion title, permanent spot on SCL leaderboard.</li>
                    <li><strong>10.2</strong> Runner-up and future tournament prizes announced as SCL grows.</li>
                    <li><strong>10.3</strong> Prize is non-transferable and non-negotiable.</li>
                  </ul>
                </div>

                {/* SECTION 11 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 11: Admin &amp; Disputes</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>11.1</strong> The SCL admin has full authority over all tournament decisions (forfeits, conduct, bracket corrections, prizes).</li>
                    <li><strong>11.2</strong> Dispute window: Within 2 hours of the incident OR before 12:00 AM midnight (whichever is earlier).</li>
                    <li><strong>11.3</strong> Limited appeal: May appeal a non-cheating decision once per tournament with new evidence. Admin decision on appeal is final.</li>
                    <li><strong>11.4</strong> Admin reserves the right to amend rules before the tournament starts.</li>
                    <li><strong>11.5</strong> Admin contact: <strong>07071724882</strong> (WhatsApp)</li>
                  </ul>
                </div>

                {/* SECTION 12 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 12: General</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>12.1</strong> Participation = full acceptance of all rules above.</li>
                    <li><strong>12.2</strong> SCL reserves the right to disqualify any player for conduct unbecoming of the competition.</li>
                    <li><strong>12.3</strong> These rules apply from registration confirmation until tournament conclusion.</li>
                  </ul>
                  <p className="mt-4 font-space font-black text-[#111111] tracking-widest text-center">THE BOARD REMEMBERS.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Schedule & Support Panel */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-bold tracking-[0.2em] text-brand-accent uppercase mb-2">June 2026</p>
                <h2 className="font-space font-black text-xl text-[#111111] mb-4">Daily Schedule</h2>
                <div className="space-y-2.5">
                  {SCHEDULE.map(s => (
                    <div key={s.label} className="flex items-center justify-between p-3.5 bg-[#F6F4F0] rounded-xl">
                      <div>
                        <p className="text-sm font-black text-[#111111]">{s.label}</p>
                        <p className="text-xs text-gray-500">{s.desc}</p>
                      </div>
                      <span className="text-xs font-bold text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-lg shrink-0">{s.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6 text-center">
                <p className="text-xs font-bold tracking-[0.2em] text-brand-primary uppercase mb-2">Official Contact</p>
                <h3 className="font-space font-black text-lg text-[#111111] mb-1.5">Need Assistance?</h3>
                <p className="text-sm text-gray-500 mb-4">Contact tournament support directly on WhatsApp.</p>
                <a href="https://wa.me/2347071724882" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white text-sm font-bold px-6 py-3.5 rounded-full w-full hover:bg-brand-primary/95 transition-all shadow-md">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.457 3.48 1.328 5l-1.352 4.938 5.056-1.326c1.472.802 3.128 1.226 4.816 1.226 5.506 0 9.988-4.482 9.988-9.988 0-5.506-4.482-9.988-9.988-9.988zm-3.328 5.766c.228 0 .438.006.63.024.198.018.36.036.528.378.228.468.78 1.902.846 2.04.066.138.108.3.006.504-.102.204-.15.33-.3.504-.15.174-.318.39-.456.522-.15.144-.306.3-.132.6.174.3.774 1.278 1.662 2.064.9.792 1.656 1.038 1.89 1.152.234.114.372.096.51-.06.138-.156.6-1.038.756-1.254.156-.216.312-.18.528-.096.216.084 1.368.648 1.602.768.234.12.39.18.45.282.06.102.06.582-.162 1.218-.222.636-1.296 1.242-1.788 1.296-.492.054-.972.192-3.138-.654-2.61-.99-4.29-3.642-4.422-3.816-.132-.174-1.074-1.428-1.074-2.73 0-1.302.678-1.944.918-2.19.24-.246.48-.306.642-.306z" />
                  </svg>
                  Message Support
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN */}
        {activeTab === 'admin' && isAdmin && (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="font-space font-black text-2xl text-[#111111]">Admin Panel</h2>
              <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">Unlocked</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6 space-y-3">
                <p className="font-space font-black text-base text-[#111111]">Initialize Bracket</p>
                <p className="text-sm text-gray-500">Seed {selectedMonthYear} tournament with 53 registered players.</p>
                <button onClick={() => { if (window.confirm('Initialize?')) initialize(); }} className="bg-brand-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-brand-primary/90 transition-colors">
                  Generate Bracket
                </button>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-3">
                <p className="font-space font-black text-base text-[#111111]">Reset Bracket</p>
                <p className="text-sm text-gray-500">Wipe all results and reshuffle pairings.</p>
                <button onClick={() => { if (window.confirm('Reset? This cannot be undone.')) reset(); }} className="bg-red-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-red-500 transition-colors">
                  Reset Tournament
                </button>
              </div>
            </div>
            {/* Test cleanup — user requested */}
            <div className="border border-dashed border-amber-200 bg-amber-50/30 rounded-2xl p-5 space-y-3">
              <p className="font-space font-black text-base text-amber-900">Test Data Cleanup</p>
              <p className="text-sm text-amber-700">Removes April &amp; May 2026 mock archives from local storage after testing.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={clearMocks} className="text-sm font-bold bg-amber-600 text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-amber-500 transition-colors">
                  Clear Mock History
                </button>
                <button onClick={() => { setIsAdmin(false); toast.info('Admin locked'); }} className="text-sm font-bold bg-gray-200 text-gray-600 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-300 transition-colors">
                  Lock Panel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* PIN modal */}
      {pinModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPinModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-xs w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <p className="font-space font-black text-lg text-[#111111] mb-1">Admin Login</p>
            <p className="text-xs text-gray-400 mb-6">Enter your 4-digit PIN</p>
            <input type="password" inputMode="numeric" maxLength={8} autoFocus
              value={pinInput} onChange={e => { setPinInput(e.target.value); setPinErr(''); }}
              onKeyDown={e => e.key === 'Enter' && submitPin()}
              className={`w-36 text-center px-4 py-3 text-xl font-black tracking-[0.4em] bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary mb-2 ${pinErr ? 'border-red-300' : 'border-gray-200'}`}
              placeholder="····"
            />
            {pinErr && <p className="text-xs text-red-500 mb-3">{pinErr}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setPinModal(false)} className="flex-1 text-xs font-bold py-2.5 bg-gray-100 text-gray-500 rounded-xl cursor-pointer hover:bg-gray-200">Cancel</button>
              <button onClick={submitPin} className="flex-1 text-xs font-bold py-2.5 bg-brand-primary text-white rounded-xl cursor-pointer hover:bg-brand-primary/90">Unlock</button>
            </div>
          </div>
        </div>
      )}
      {/* Player details modal */}
      {selectedPlayerForModal && (
        <TournamentPlayerModal 
          player={selectedPlayerForModal} 
          onClose={() => setSelectedPlayerForModal(null)} 
        />
      )}
    </div>
  );
}
