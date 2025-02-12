// test-chord.js
import { Chord } from "tonal";
import { parseAuraChord3 } from "../src/lib/auraChordParser4.js";

const namedIntervalSemitones = {
  P1: 0,
  m2: 1,
  M2: 2,
  m3: 3,
  M3: 4,
  P4: 5,
  A4: 6,
  d5: 6,
  P5: 7,
  m6: 8,
  M6: 9,
  m7: 10,
  M7: 11,
  P8: 12,
  m9: 13,
  M9: 14,
  m10: 15,
  M10: 16,
  P11: 17,
  A11: 18,
  d12: 18,
  P12: 19,
};

function parseTonalChord(chord) {
  const result = Chord.chord(chord);
  const intervals = result.intervals;
  const semitones = intervals.map((x) => namedIntervalSemitones[x]);
  return {
    name: result.name,
    symbol: result.symbol,
    intervals,
    semitones,
    notes: result.notes,
  };
}

function formatIntervalArray(intervals) {
  if (!Array.isArray(intervals)) {
    return intervals;
  }
  return intervals.join("·");
}

function main() {
  // Get chord from command line argument
  const chord = process.argv[2];

  if (!chord) {
    console.error(
      "Please provide a chord to test. Usage: npm run testChord <chord>"
    );
    process.exit(1);
  }

  try {
    // Get Tonal.js results
    const tonalResult = parseTonalChord(chord);

    // Get Aura parser results
    const auraResult = parseAuraChord3(chord);

    // Calculate if they match
    const intervalsMatch =
      formatIntervalArray(tonalResult.semitones) ===
      formatIntervalArray(auraResult.intervals);

    console.log("\nChord Analysis Comparison:");
    console.log("========================");
    console.log(`Input Chord: ${chord}`);

    console.log("\nTonal.js Analysis:");
    console.log("----------------");
    console.log(`Normalized Name: ${tonalResult.name}`);
    console.log(`Symbol: ${tonalResult.symbol}`);
    console.log(`Notes: ${tonalResult.notes.join(", ")}`);
    console.log(`Intervals: ${tonalResult.intervals.join(", ")}`);
    console.log(`Semitones: ${formatIntervalArray(tonalResult.semitones)}`);

    console.log("\nAura Parser Analysis:");
    console.log("-------------------");
    console.log(auraResult);
    console.table(auraResult.logs);
    console.log(`Intervals: ${formatIntervalArray(auraResult.intervals)}`);

    /*
    console.log('\nComparison:');
    console.log('-----------');
    console.log(`Intervals Match: ${intervalsMatch ? '✅' : '❌'}`);
    */
  } catch (error) {
    console.error("Error parsing chord:", error.message);
    process.exit(1);
  }
}

main();
