// Test array of chord symbols for parser validation
export const testChords = [
  // Basic major chords and extensions
  "Cm",
  "Cmaj",
  "CM",
  "Cmaj7",
  "CM7",

  "CM7b9",

  // Minor chords and extensions
  "Cm",
  "Cmin",
  "Cm7",
  "Cm9",
  "Cm11",

  // Minor chords with alterations
  "Cm7b5",

  "CmM7",
  "Cm7#5",
  "Cm7b9",

  // Dominant chords and extensions
  "C7",
  "C9",

  "C7sus4",

  // Dominant chords with alterations
  "C7#5",
  "C7b9",
  "C7#9",

  "C7b9#11",

  // Suspended chords
  "Csus",
  "Csus4",
  "Csus2",

  // Diminished and augmented
  "Cdim",

  "Caug",
  "C+",
  "C°",

  // Slash chords
  "C/E",
  "Cmaj7/E",
  "Cm7/Eb",
  "C7/Bb",
  "Csus4/G",
  "Cadd9/G",
  "CM7/B",

  // B♭ chords to test flat notation
  "Bb",
  "Bbmaj7",
  "Bbm7",
  "Bb7#11",
  "Bb/D",
  "Bbsus4/Ab",

  /// problematic cases:
  "Cmaj9",
  "Cmaj11",
  "Cmaj13",

  "Cmaj7#11",
  "Cmaj9#11",
  "Cmaj13#11",
  "CM7#5",

  "Csus4b9",

  // Add chords
  "Cadd9",
  "CM7add13",
  "Cmadd9",
  "C7add13",

  "Cdim7",
  "Cm13",
  "Cm9b5",

  "C7#11",
  "C7b13",

  "C7#9b13",

  "C11",
  "C13",
  "C13#11", //introduced after changing the array logic.

  "C13#13",
];

// Invalid chord combinations for testing error handling
export const invalidChords = [
  "Cmajm", // Conflicting quality modifiers
  "Csus4sus2", // Conflicting suspensions
  "Cm7maj7", // Conflicting sevenths
  "C7maj7", // Conflicting sevenths
  "Cdimmaj", // Conflicting quality
  "Csus3", // Invalid suspension
  "Cadd1", // Invalid add
  "C7#9#9", // Duplicate alteration
  "Cmaj7##11", // Invalid double sharp
  "C/H", // Invalid slash note
  "Cm/B#", // Invalid enharmonic
];

export const allTestChords = [...testChords, ...invalidChords];
