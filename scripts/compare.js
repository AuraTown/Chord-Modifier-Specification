// chord-parser.js
//import { chord } from "@tonaljs/chord";
import { Chord } from "tonal";
import { createObjectCsvWriter } from "csv-writer";
/*
const namedIntervalSemitones = {
  // show munber of semitones
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
  m13: 20,
  M13: 21,
  m14: 22,
  M14: 23,
  P15: 24,
  m16: 25,
  M16: 26,
  m17: 27,
  M17: 28,
  P18: 29,
  A18: 30,
  d19: 30,
  P19: 31,
  m20: 32,
  M20: 33,
  m21: 34,
};
*/
const namedIntervalSemitones = {
  "1P": 0, // Perfect unison
  "2m": 1, // Minor second
  "2M": 2, // Major second
  "3m": 3, // Minor third
  "3M": 4, // Major third
  "4P": 5, // Perfect fourth
  "4A": 6, // Augmented fourth / Tritone
  "5d": 6, // Diminished fifth / Tritone
  "5P": 7, // Perfect fifth
  "5A": 8, // Augmented fifth
  "6m": 8, // Minor sixth
  "6M": 9, // Major sixth
  "7m": 10, // Minor seventh
  "7M": 11, // Major seventh
  "8P": 12, // Perfect octave
  "9m": 13, // Minor ninth
  "9M": 14, // Major ninth
  "9A": 15, // Augmented ninth
  "10m": 15, // Minor tenth
  "10M": 16, // Major tenth
  "11P": 17, // Perfect eleventh
  "11A": 18, // Augmented eleventh
  "12d": 18, // Diminished twelfth
  "12P": 19, // Perfect twelfth
  "13m": 20, // Minor thirteenth
  "13M": 21, // Major thirteenth
  "14m": 22, // Minor fourteenth
  "14M": 23, // Major fourteenth
  "15P": 24, // Perfect double octave
};
function parseTonalChord(c) {
  let x = Chord.chord(c);
  console.log(x);
  let i = x.intervals;
  console.log(i);
  let semi = i.map((x) => namedIntervalSemitones[x]);
  console.log(semi);
  return semi; //  .join("·");
}

import { enkerliQualities } from "../data/enkerliQualities.js";

function parseEnkerliChord(c) {
  try {
    //this is a dict, so we can use the key to get the value. Maybe match from the end, then we're left with the root or shash roots?
    let root = c.match(/^[a-g][#b]?/i)?.[0] || "";
    let remaining = c.slice(root.length);
    let data = enkerliQualities[remaining];

    let i = data.intervals;
    let semi = i.map((x) => namedIntervalSemitones[x]);
    return data;
  } catch (e) {
    return "error + ";
  }
}

// Test chord array with various types
export const testChords = [
  // Basic major chords and extensions
  "Cmaj",
  "CM",
  "Cmaj7",
  "CM7",
  "Cmaj9",
  "Cmaj11",
  "Cmaj13",
  // Minor chords and extensions
  "Cm",
  "Cmin",
  "Cm7",
  "Cmin7",
  "Cm9",
  "Cm11",
  "Cm13",
  // Dominant chords
  "C7",
  "C9",
  "C11",
  "C13",
  "C7b9",
  "C7#9",
  // Augmented and diminished
  "Caug",
  "C+",
  "Cdim",
  "C°",
  "Cm7b5",
  "C∅",
  // Complex extensions
  "C6/9",
  "C6add9",
  "Cmaj7#11",
  "C7alt",
];

// Enkeli chord qualities dictionary
const chordQualities = {
  maj: ["maj", "M"],
  min: ["m", "min", "-"],
  dim: ["dim", "°"],
  aug: ["aug", "+"],
  7: ["7"],
  maj7: ["maj7", "M7"],
  min7: ["m7", "min7"],
  dim7: ["dim7", "°7"],
  m7b5: ["m7b5", "ø", "∅"],
  sus4: ["sus4", "sus"],
  sus2: ["sus2"],
  6: ["6"],
  9: ["9"],
  11: ["11"],
  13: ["13"],
};

// Custom chord parser function
function parseChord(input) {
  // Remove any spaces and convert to lowercase for consistent processing
  const chord = input.replace(/\s+/g, "").toLowerCase();

  // Extract root note
  const root = chord.match(/^[a-g][#b]?/i)?.[0] || "";
  const remaining = chord.slice(root.length);

  // Match against chord qualities
  for (const [quality, symbols] of Object.entries(chordQualities)) {
    if (symbols.some((symbol) => remaining.startsWith(symbol.toLowerCase()))) {
      return {
        root,
        quality,
        remaining: remaining.slice(quality.length),
      };
    }
  }

  return {
    root,
    quality: "unknown",
    remaining,
  };
}

function formatIntervalArray(intervals) {
  // if not an array, resutn it as is
  if (!Array.isArray(intervals)) {
    return intervals;
  }
  // if it is an array, join it with a dot
  return intervals.join("·");
}

// Function to run comparisons and generate results
async function compareChordParsers() {
  const results = testChords.map((chord) => ({
    input: chord,
    enkerliMatch: parseEnkerliChord(chord),
    customParse: parseChord(chord),
    tonaljs: parseTonalChord(chord),
  }));

  const resultsJoineed = results.map((x) => {
    //
    // .join("·"); for all props
    return {
      input: x.input,
      enkerliMatch: formatIntervalArray(x.enkerliMatch),
      customParse: formatIntervalArray(x.customParse),
      tonaljs: formatIntervalArray(x.tonaljs),
    };
  });
  // Display results in console
  console.table(resultsJoineed);

  // Save to CSV
  const csvWriter = createObjectCsvWriter({
    path: "chord-parsing-results.csv",
    header: [
      { id: "input", title: "Input Chord" },
      { id: "enkerliMatch", title: "Enkeli Match" },
      { id: "customParse", title: "Custom Parse" },
      { id: "tonaljs", title: "Tonal.js Result" },
    ],
  });

  await csvWriter.writeRecords(resultsJoineed);
  console.log("Results saved to chord-parsing-results.csv");
}

// Run the comparison
compareChordParsers().catch(console.error);
