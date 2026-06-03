/**
 * Tournament Engine
 * Handles fixture generation for League and Knockout formats.
 */

export interface Team {
  id: string;
  name: string;
}

export interface Fixture {
  teamAId: string;
  teamBId: string;
  round?: string;
  matchType: 'league' | 'knockout';
}

/**
 * Generates Round Robin fixtures for a league stage.
 * Using the Circle Method algorithm.
 */
export const generateLeagueFixtures = (teams: Team[]): Fixture[] => {
  const fixtures: Fixture[] = [];
  const tempTeams = [...teams];

  if (tempTeams.length % 2 !== 0) {
    tempTeams.push({ id: 'bye', name: 'BYE' });
  }

  const numTeams = tempTeams.length;
  const numRounds = numTeams - 1;
  const halfSize = numTeams / 2;

  const teamIndices = tempTeams.map((_, i) => i);

  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < halfSize; i++) {
      const first = teamIndices[i];
      const second = teamIndices[numTeams - 1 - i];

      if (tempTeams[first].id !== 'bye' && tempTeams[second].id !== 'bye') {
        fixtures.push({
          teamAId: tempTeams[first].id,
          teamBId: tempTeams[second].id,
          matchType: 'league',
          round: `Round ${round + 1}`,
        });
      }
    }

    // Rotate indices (keep first element fixed)
    teamIndices.splice(1, 0, teamIndices.pop()!);
  }

  return fixtures;
};

/**
 * Generates initial knockout brackets based on team count.
 * Supports power-of-2 team counts for clean brackets.
 */
export const generateKnockoutBrackets = (teams: Team[], stage: string = 'QF'): Fixture[] => {
  const fixtures: Fixture[] = [];
  const numMatches = teams.length / 2;

  for (let i = 0; i < numMatches; i++) {
    fixtures.push({
      teamAId: teams[i * 2].id,
      teamBId: teams[i * 2 + 1].id,
      matchType: 'knockout',
      round: stage,
    });
  }

  return fixtures;
};

/**
 * Calculates Net Run Rate (NRR)
 * Formula: (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
 */
export const calculateNRR = (
  runsScored: number,
  oversFaced: number,
  runsConceded: number,
  oversBowled: number
): number => {
  const scoredRate = oversFaced > 0 ? runsScored / oversFaced : 0;
  const concededRate = oversBowled > 0 ? runsConceded / oversBowled : 0;
  return Number((scoredRate - concededRate).toFixed(3));
};
