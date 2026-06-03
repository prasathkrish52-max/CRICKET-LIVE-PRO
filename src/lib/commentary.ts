/**
 * Commentary Generator
 * Converts ball event data into professional cricket commentary.
 */

export interface BallEvent {
  over_number: number;
  ball_number: number;
  runs_scored: number;
  is_wicket: boolean;
  wicket_type?: string;
  extra_type?: "wide" | "no_ball" | "bye" | "leg_bye";
  extra_runs: number;
  batsman_name?: string;
  bowler_name?: string;
}

export const generateCommentaryText = (ball: BallEvent): string => {
  const { 
    runs_scored, 
    is_wicket, 
    wicket_type, 
    extra_type, 
    extra_runs, 
    batsman_name = "The batsman", 
    bowler_name = "the bowler" 
  } = ball;

  // Handle Wickets
  if (is_wicket) {
    const type = wicket_type ? wicket_type.toUpperCase() : "OUT";
    return `OUT! ${batsman_name} is ${type}. ${bowler_name} strikes!`;
  }

  // Handle Extras
  if (extra_type) {
    const type = extra_type.toUpperCase();
    if (type === "WIDE") return `Wide ball! ${bowler_name} sprays it down the leg side.`;
    if (type === "NO_BALL") return `No Ball! ${bowler_name} oversteps. Free hit to follow!`;
    return `${extra_runs} ${type}. Smart running by ${batsman_name}.`;
  }

  // Handle Regular Runs
  if (runs_scored === 6) {
    return `SIX! ${batsman_name} smokes it over the boundary! What a hit.`;
  }
  if (runs_scored === 4) {
    return `FOUR! Cracking shot from ${batsman_name}. Finds the gap and races away.`;
  }
  if (runs_scored === 1) {
    return `${batsman_name} pushes it into the gap for a quick single.`;
  }
  if (runs_scored === 2 || runs_scored === 3) {
    return `Good running! ${batsman_name} and partner scamper for ${runs_scored} runs.`;
  }
  
  // Dot Ball
  const dotPhrases = [
    `No run. ${batsman_name} defends it solidly.`,
    `Dot ball. ${bowler_name} keeps it tight.`,
    `Beaten! ${batsman_name} plays and misses.`,
    `Straight to the fielder. No run.`
  ];
  return dotPhrases[Math.floor(Math.random() * dotPhrases.length)];
};
