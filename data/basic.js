export const namedIntervalSemitones = {
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

  // oter notation  "R": "1P",    // Root/unison
  R: 0, // Root/unison
  "♭2": 1, // Minor second
  2: 2, // Major second
  "♭3": 3, // Minor third
  3: 4, // Major third
  4: 5, // Perfect fourth
  "♯4": 6, // Augmented fourth
  "♭5": 6, // Diminished fifth
  5: 7, // Perfect fifth
  "♯5": 8, // Augmented fifth
  "♭6": 8, // Minor sixth
  6: 9, // Major sixth
  "♭7": 10, // Minor seventh
  7: 11, // Major seventh
  8: 12, // Perfect octave
  "♭9": 13, // Minor ninth
  9: 14, // Major ninth
  "♯9": 15, // Augmented ninth
  "♭10": 15, // Minor tenth
  10: 16, // Major tenth
  11: 17, // Perfect eleventh
  "♯11": 18, // Augmented eleventh
  "♭12": 18, // Diminished twelfth
  12: 19, // Perfect twelfth
  "♭13": 20, // Minor thirteenth
  13: 21, // Major thirteenth
  "♭14": 22, // Minor fourteenth
  14: 23, // Major fourteenth
  15: 24, // Perfect double octave
};

export const baseIntervals = {
  root: 0, // Root note (always present)
  third: 4, // Major third
  fifth: 7, // Perfect fifth
  seventh: 11, // Major seventh
  ninth: 14, // Major ninth
  eleventh: 17, // Perfect eleventh
  thirteenth: 21, // Major thirteenth
};

// Mapping of semitones to interval names
export const semitonesToInterval = {
  0: "P1", // Perfect unison
  1: "m2", // Minor second
  2: "M2", // Major second
  3: "m3", // Minor third
  4: "M3", // Major third
  5: "P4", // Perfect fourth
  6: "TT", // Tritone
  7: "P5", // Perfect fifth
  8: "m6", // Minor sixth
  9: "M6", // Major sixth
  10: "m7", // Minor seventh
  11: "M7", // Major seventh
  12: "P8", // Perfect octave
};
