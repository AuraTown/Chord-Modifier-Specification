// chord-parser.js
//import { chord } from "@tonaljs/chord";
import { Chord } from "tonal";
import { createObjectCsvWriter } from "csv-writer";

import { namedIntervalSemitones } from "../data/basic.js";

import {
  testChords,
  invalidChords,
  allTestChords,
} from "../data/testChords.js";

import { enkerliQualities } from "../data/enkerliQualities.js";
import { parseEnkerliChord } from "../src/lib/enkerliParser.js";
//import { parseChordSymbol } from "../src/lib/auraChordParser_LEGACY.js";

import { parseAuraChord3, test3 } from "../src/lib/auraChordParser4.js";

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

function parseTonalChord(c) {
  let x = Chord.chord(c);
  //console.log(x);
  let i = x.intervals;
  ///console.log(i);
  let semi = i.map((x) => namedIntervalSemitones[x]);
  // console.log(semi);
  return semi; //  .join("·");
}

function parseEnkerli(c) {
  try {
    //this is a dict, so we can use the key to get the value. Maybe match from the end, then we're left with the root or shash roots?
    let root = c.match(/^[a-g][#b]?/i)?.[0] || "";
    let remaining = c.slice(root.length);
    //let data = enkerliQualities[remaining];
    let data = parseEnkerliChord(c);
    // console.log(data);
    if (!data) return "🤷 ";
    let i = data.intervals;

    let semi = i.map((x) => namedIntervalSemitones[x]);
    //  console.log(i, semi);
    return semi;
    return data;
  } catch (e) {
    return "error + " + e;
  }
}

function parseAura(c) {
  try {
    //this is a dict, so we can use the key to get the value. Maybe match from the end, then we're left with the root or shash roots?
    let root = c.match(/^[a-g][#b]?/i)?.[0] || "";
    let remaining = c.slice(root.length);
    //let data = enkerliQualities[remaining];
    let data = parseAuraChord3(c);
    console.log("parseChordSymbol = ", c, data);
    if (!data) return "🤷 ";
    return data.intervals;

    //let semi = i.map((x) => namedIntervalSemitones[x]);
    console.log(i, semi);
    return semi;
    return data;
  } catch (e) {
    console.log(e);
    return "error + " + e;
  }
}

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
    enkerliMatch: parseEnkerli(chord),
    aura: parseAura(chord),
    tonaljs: parseTonalChord(chord),
  }));

  let resultsJoineed = results.map((x) => {
    //
    // .join("·"); for all props
    return {
      input: x.input,

      aura: formatIntervalArray(x.aura),
      tonal: formatIntervalArray(x.tonaljs),
      enkerli: formatIntervalArray(x.enkerliMatch),
    };
  });
  // Display results in console

  resultsJoineed = resultsJoineed.map((c) => {
    const d = {
      input: c.input,
      aura: c.aura,
      tonalAura: c.tonal == c.aura ? "✅" : "❌",
      tonal: c.tonal,
      enkerli: c.enkerli,
      tonalEnkerli: c.tonal == c.enkerli ? "✅" : "❌",
      auraEnkerli: c.aura == c.enkerli ? "✅" : "❌",
    };
    return d;

    c.tonalEnkerli = c.enkerli == c.tonal ? "✅" : "❌";
    c.tonalAura = c.aura == c.tonal ? "✅" : "❌";
    c.auraEnkerli = c.enkerli == c.aura ? "✅" : "❌";
    return c;
  });

  console.table(resultsJoineed);

  /// aura tabs

  const auraTable = results.map((x) => {
    return {
      input: x.input,
      aura: x.aura,
    };
  });

  // console.table(auraTable);

  //console.log(testImprovedParser());

  // test3();
  // Save to CSV
  const csvWriter = createObjectCsvWriter({
    path: "chord-parsing-results.csv",
    header: [
      { id: "input", title: "Input Chord" },
      { id: "enkerli", title: "Enkeli Match" },
      { id: "custom", title: "Custom Parse" },
      { id: "tonal", title: "Tonal.js Result" },
    ],
  });

  await csvWriter.writeRecords(resultsJoineed);
  console.log("Results saved to chord-parsing-results.csv");
}

// Run the comparison
compareChordParsers().catch(console.error);
