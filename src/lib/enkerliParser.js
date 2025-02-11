// First, we'll create a more efficient way to handle chord matching
// by pre-processing the chord qualities dictionary

import { enkerliQualities } from "../../data/enkerliQualities.js";

import { namedIntervalSemitones } from "../../data/basic.js";

// Create a mapping of all possible aliases to their primary quality names
const aliasToQuality = {};
const sortedQualities = {};

// Pre-process the chord qualities to create efficient lookups
function initializeChordMappings() {
  // First, sort all aliases by length (longest first) to ensure proper matching
  Object.entries(enkerliQualities).forEach(([quality, data]) => {
    if (data.aliases) {
      // Sort aliases by length (descending) and store them
      sortedQualities[quality] = {
        ...data,
        aliases: [...data.aliases].sort((a, b) => b.length - a.length),
      };

      // Create mappings for each alias to its primary quality
      data.aliases.forEach((alias) => {
        aliasToQuality[alias.toLowerCase()] = quality;
      });
    }
  });
}

// Initialize our mappings
initializeChordMappings();

// Normalize chord notation for consistent parsing
function normalizeChordNotation(chord) {
  return chord
    .replace(/maj/i, "M")
    .replace(/min/i, "m")
    .replace(/∆/g, "M")
    .replace(/Δ/g, "M")
    .replace(/-/g, "m");
}

function parseEnkerliChord(chordInput) {
  try {
    // Extract root note using regex
    const root = chordInput.match(/^[A-Ga-g][#b]?/)?.[0] || "";
    let remaining = normalizeChordNotation(chordInput.slice(root.length));

    // First try exact match in enkerliQualities
    let matchedQuality = enkerliQualities[remaining];

    // If no exact match, try normalized aliases
    if (!matchedQuality) {
      const normalizedRemaining = remaining; //.toLowerCase();
      const qualityFromAlias = aliasToQuality[normalizedRemaining];

      if (qualityFromAlias) {
        matchedQuality = enkerliQualities[qualityFromAlias];
      } else {
        // Try progressive matching for complex chords
        // Sort potential matches by length (longest first) to catch most specific match
        const potentialMatches = Object.entries(sortedQualities)
          .filter(([_, data]) =>
            data.aliases.some((alias) =>
              normalizedRemaining.startsWith(alias.toLowerCase())
            )
          )
          .sort((a, b) => b[0].length - a[0].length);

        if (potentialMatches.length > 0) {
          matchedQuality = enkerliQualities[potentialMatches[0][0]];
        }
      }
    }

    if (!matchedQuality) {
      return null; // No match found
    }

    // Convert intervals to semitones using the provided mapping
    const semitones = matchedQuality.intervals.map((interval) => {
      const semitone = namedIntervalSemitones[interval];
      if (semitone === undefined) {
        throw new Error(`Unknown interval: ${interval}`);
      }
      return semitone;
    });

    return {
      root,
      quality: matchedQuality.fullName,
      intervals: matchedQuality.intervals,
      semitones,
      forteNumber: matchedQuality.forteNumber,
    };
  } catch (error) {
    console.error("Error parsing chord:", error);
    return null;
  }
}

// Test function to demonstrate the improved parser
function testImprovedParser() {
  const testCases = [
    "Cmaj7", // Should match major seventh
    "Dm7", // Should match minor seventh
    "Em", // Should match minor
    "Faug", // Should match augmented
    "G7b9", // Should match dominant seventh flat ninth
    "Am7b5", // Should match half-diminished seventh
    "Bdim7", // Should match diminished seventh
  ];

  testCases.forEach((chord) => {
    const result = parseEnkerliChord(chord);
    console.log(`\nTesting chord: ${chord}`);
    console.log("Result:", result);
  });
}

export { parseEnkerliChord, testImprovedParser };
