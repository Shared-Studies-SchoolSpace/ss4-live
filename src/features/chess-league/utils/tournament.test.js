import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { propagateWinners, getGroupData } from './tournament.js';
import augustTournament from '../data/augustTournamentData.json' with { type: 'json' };

describe('Tournament Utils - Interface Dream Regression Suite', () => {
  describe('Fix 1: propagateWinners group stage preservation', () => {
    it('should NOT overwrite or erase Group Stage games 14-27 when propagating winners', () => {
      // In August tournament, Round 1 (index 0) has 28 games and Round 2 (index 1) has 28 games.
      const round2Game14Before = augustTournament.rounds[1].games[14];
      assert.ok(round2Game14Before.p1, 'Game 14 must have p1 before propagation');
      assert.ok(round2Game14Before.p2, 'Game 14 must have p2 before propagation');
      assert.ok(round2Game14Before.winner, 'Game 14 must have a winner before propagation');

      const propagated = propagateWinners(augustTournament.rounds);
      const round2Game14After = propagated[1].games[14];

      assert.strictEqual(
        round2Game14After.p1?.name,
        round2Game14Before.p1.name,
        'Game 14 p1 must remain intact after propagation'
      );
      assert.strictEqual(
        round2Game14After.winner?.name,
        round2Game14Before.winner.name,
        'Game 14 winner must remain intact after propagation'
      );
    });
  });

  describe('Fix 10: getGroupData string winners and dynamic points recalculation', () => {
    it('should correctly credit a win and 1 point when g.winner is a username string', () => {
      const mockTournament = {
        players: [
          { id: 'u1', username: 'player1', name: 'Player One' },
          { id: 'u2', username: 'player2', name: 'Player Two' }
        ],
        groups: [
          {
            label: 'A',
            players: [
              { id: 'u1', username: 'player1', name: 'Player One' },
              { id: 'u2', username: 'player2', name: 'Player Two' }
            ]
          }
        ],
        rounds: [
          {
            roundNum: 1,
            name: 'Group Stage Round 1',
            games: [
              {
                id: 'G1',
                groupLabel: 'A',
                p1: { id: 'u1', username: 'player1', name: 'Player One' },
                p2: { id: 'u2', username: 'player2', name: 'Player Two' },
                winner: 'player1' // String winner format
              }
            ]
          }
        ]
      };

      const groupData = getGroupData(mockTournament);
      const p1Standing = groupData[0].standings.find(s => s.username === 'player1');
      const p2Standing = groupData[0].standings.find(s => s.username === 'player2');

      assert.strictEqual(p1Standing.W, 1, 'Player 1 must have 1 win');
      assert.strictEqual(p1Standing.L, 0, 'Player 1 must have 0 losses');
      assert.strictEqual(p1Standing.Pts, 1, 'Player 1 must have 1 point');

      assert.strictEqual(p2Standing.W, 0, 'Player 2 must have 0 wins');
      assert.strictEqual(p2Standing.L, 1, 'Player 2 must have 1 loss');
      assert.strictEqual(p2Standing.Pts, 0, 'Player 2 must have 0 points');
    });

    it('should dynamically recalculate points even if player object has stale pts property', () => {
      const mockTournament = {
        groups: [
          {
            label: 'A',
            players: [
              { id: 'u1', username: 'player1', name: 'Player One', pts: 0 } // stale pts: 0
            ]
          }
        ],
        rounds: [
          {
            roundNum: 1,
            name: 'Group Stage Round 1',
            games: [
              {
                id: 'G1',
                groupLabel: 'A',
                p1: { id: 'u1', username: 'player1', name: 'Player One' },
                p2: { id: 'u2', username: 'player2', name: 'Player Two' },
                winner: { username: 'player1', name: 'Player One' }
              }
            ]
          }
        ]
      };

      const groupData = getGroupData(mockTournament);
      const p1Standing = groupData[0].standings.find(s => s.username === 'player1');
      assert.strictEqual(p1Standing.Pts, 1, 'Points must be recalculated dynamically from matches, ignoring stale p.pts');
    });
  });
});
