import { modifierSchema } from "../../data/chordModifiers2.js";

import { ChordLogger, LogConfig } from "./chordLogger.js";

/**
 * Converts a modifier symbol to a regex-safe pattern
 * @param {string} symbol - Modifier symbol
 * @returns {string} Regex-safe pattern
 */
function symbolToPattern(symbol) {
  // Escape special regex characters and handle special cases
  return symbol
    .replace(/[+]/g, "\\+") // Escape + symbol
    .replace(/^m(?!aj)/, "m(?!aj)") // Handle 'm' vs 'maj' distinction
    .replace(/[°ø]/g, symbol); // Keep special symbols as is - they're unique
}

/**
 * Creates a mapping of patterns to symbols from the modifier schema
 * @returns {Array<{pattern: RegExp, symbol: string}>}
 */
function createModifierPatterns() {
  const patterns = [];

  // Go through each category in the schema
  for (const [category, modifiers] of Object.entries(modifierSchema)) {
    for (const modifier of modifiers) {
      // Create patterns for each symbol in the modifier
      for (const symbol of modifier.symbols) {
        patterns.push({
          pattern: new RegExp(symbolToPattern(symbol)),
          symbol: symbol,
          priority: modifier.priority || 0,
        });
      }
    }
  }

  // Sort patterns by length (longer patterns first) and then by priority
  // This ensures "maj7" is checked before "maj" and "m"
  return patterns.sort((a, b) => {
    const lenDiff = b.symbol.length - a.symbol.length;
    return lenDiff !== 0 ? lenDiff : a.priority - b.priority;
  });
}

// Create patterns once at module level
const MODIFIER_PATTERNS = createModifierPatterns();

/**
 * Detects all chord modifiers in a chord string
 * @param {string} chordString - Input chord string (e.g. "Cm7b5")
 * @returns {Array<string>} Array of detected modifier symbols
 */
export function detectChordModifiers(chordString) {
  // Remove root note (assumes first character is root note, optionally followed by # or b)
  const withoutRoot = chordString.replace(/^[A-G][#b]?/, "");

  const foundModifiers = [];
  let remaining = withoutRoot;

  // Keep checking for patterns until no more matches are found
  while (remaining.length > 0) {
    let matchFound = false;

    for (const { pattern, symbol } of MODIFIER_PATTERNS) {
      const match = remaining.match(pattern);
      if (match && match.index === 0) {
        foundModifiers.push(symbol);
        remaining = remaining.slice(match[0].length);
        matchFound = true;
        break;
      }
    }

    // If no pattern matched at the start of the remaining string,
    // move forward one character
    if (!matchFound) {
      remaining = remaining.slice(1);
    }
  }

  return foundModifiers;
}

/**
 * Comprehensive chord parsing function that returns detailed information
 * @param {string} chordString - Input chord string (e.g. "Cm7b5")
 * @returns {Object} Parsed chord information
 */
export function parseAuraChord3(chordString) {
  console.log("===========================================");
  console.log("======================" + chordString + "=====================");
  // Extract root note
  const rootMatch = chordString.match(/^[A-G][#b]?/);
  const rootNote = rootMatch ? rootMatch[0] : null;

  if (!rootNote) {
    throw new Error(
      `Invalid chord string: ${chordString}. Must start with a root note A-G.`
    );
  }

  // Detect modifiers
  const detectedModifiers = detectChordModifiers(chordString);

  // Transform the chord using the detected modifiers
  const { intervals, logs } = transformChord(detectedModifiers);

  return {
    input: chordString,
    root: rootNote,

    foundModifiers: detectedModifiers,
    appliedOperations: logs.map((log) => log.operation),
    intervals: intervals,
    formatted: formatIntervals(intervals),
    logs,
  };
}

const ROLE_TO_INDEX = {
  root: 0,
  third: 1,
  fifth: 2,
  seventh: 3,
  ninth: 4,
  eleventh: 5,
  thirteenth: 6,
};

function applyOperation(intervals, operation) {
  ChordLogger.startOperation("Apply Operation");
  ChordLogger.operation("Operation details:", operation);
  ChordLogger.operation("Initial intervals:", intervals);

  const result = [...intervals];
  const index = ROLE_TO_INDEX[operation.role];

  ChordLogger.operation(`Target index for ${operation.role}:`, index);
  ChordLogger.operation("Array length before:", result.length);

  switch (operation.type) {
    case "add":
      // For "add" operations, we don't want to fill in intermediate intervals
      // We just want to add the specific interval at its position
      if (index >= result.length) {
        result[index] = operation.value;
      } else {
        // If we're adding at an existing position, we should insert rather than replace
        result.splice(index, 0, operation.value);
      }
      break;

    case "replace":
    case "modify":
      // For replace and modify operations, we do want to ensure all intermediate intervals exist
      if (index >= result.length) {
        const defaultIntervals = [0, 4, 7, 10, 14, 17, 21];
        while (result.length <= index) {
          result.push(defaultIntervals[result.length] || 0);
        }
      }

      if (operation.type === "replace") {
        ChordLogger.operation(`Replacing value at index ${index}:`, {
          old: result[index],
          new: operation.value,
        });
        result[index] = operation.value;
      } else {
        ChordLogger.operation(`Modifying value at index ${index}:`, {
          old: result[index],
          modification: operation.value,
          new: result[index] + operation.value,
        });
        result[index] += operation.value;
      }
      break;

    case "remove":
      if (index < result.length) {
        ChordLogger.operation(
          `Removing value at index ${index}:`,
          result[index]
        );
        result.splice(index, 1);
      }
      break;
  }

  // Remove any undefined values that might have been created
  const cleanResult = result.filter((interval) => interval !== undefined);

  ChordLogger.operation("Final intervals:", cleanResult);
  ChordLogger.endOperation("Apply Operation");
  return cleanResult;
}
function findMatchingModifiers(symbols) {
  ChordLogger.startOperation("Find Matching Modifiers");
  ChordLogger.matcher("Input symbols:", symbols);

  const matches = [];

  for (const [category, modifiers] of Object.entries(modifierSchema)) {
    for (const modifier of modifiers) {
      if (symbols.some((symbol) => modifier.symbols.includes(symbol))) {
        ChordLogger.matcher(`Found match in ${category}:`, modifier);
        matches.push({
          ...modifier,
          category,
        });
      }
    }
  }

  const sortedMatches = matches.sort((a, b) => a.priority - b.priority);
  ChordLogger.matcher("Sorted matches:", sortedMatches);
  ChordLogger.endOperation("Find Matching Modifiers");
  return sortedMatches;
}

function processOperations(intervals, operations) {
  ChordLogger.startOperation("Process Operations");
  ChordLogger.transform("Initial intervals:", intervals);
  ChordLogger.transform("Operations to process:");
  console.log(operations);

  const logs = [];
  let result = [...intervals];

  operations.forEach((operation, i) => {
    ChordLogger.transform(`Processing operation ${i + 1}/${operations.length}`);
    const beforeState = [...result];
    result = applyOperation(result, operation);
    logs.push({
      operation,
      before: beforeState,
      after: [...result],
    });
  });

  ChordLogger.transform("Final result:", result);
  ChordLogger.endOperation("Process Operations");
  return { intervals: result, logs };
}

export function transformChord(modifiers, startingIntervals = [0, 4, 7]) {
  // Find matching modifiers
  const matchedModifiers = findMatchingModifiers(modifiers);

  // Collect all operations
  const operations = matchedModifiers.flatMap((modifier) => {
    if (Array.isArray(modifier.operations)) {
      return modifier.operations;
    }
    return modifier.operation ? [modifier.operation] : [];
  });

  // Process operations
  return processOperations(startingIntervals, operations);
}

export function formatIntervals(intervals) {
  return intervals.join("·");
}

// Example usage:
export function test3() {
  const chord = parseAuraChord3("Cm7b5");

  console.log(parseAuraChord3("Cmaj7"));
  console.log(parseAuraChord3("Cm"));
  // Output:
  /*
  {
    input: 'Cm7b5',
    root: 'C',
    foundModifiers: ['m', '7', 'b5'],
    appliedOperations: [...],
    intervals: [0, 3, 6, 10],
    formatted: '0·3·6·10'
  }
    */

  // Test special cases
  const tests = [
    "Cmaj7", // Major seventh
    "Dm7", // Minor seventh
    "Em", // Minor
    "Faug", // Augmented
    "F+", // Augmented (alternative)
    "G7b9", // Dominant seventh flat ninth
    "Am7b5", // Half-diminished seventh
    "Aø", // Half-diminished (alternative)
    "Bdim7", // Diminished seventh
    "B°", // Diminished (alternative)
  ];
}
