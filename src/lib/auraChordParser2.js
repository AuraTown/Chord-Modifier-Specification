// chord-operations.js
//import modifierSchema from "./modifierSchema";

import { modifierSchema } from "../../data/chordModifiers2.js";

/**
 * Maps chord positions to array indices
 */
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
  const result = [...intervals];
  const index = ROLE_TO_INDEX[operation.role];

  switch (operation.type) {
    case "replace":
      // Ensure array is long enough
      while (result.length <= index) {
        result.push(0);
      }
      result[index] = operation.value;
      break;

    case "modify":
      // Ensure array is long enough
      while (result.length <= index) {
        result.push(0);
      }
      result[index] += operation.value;
      break;

    case "add":
      // Ensure array is long enough
      while (result.length <= index) {
        result.push(0);
      }
      result[index] = operation.value;
      break;

    case "remove":
      if (index < result.length) {
        result.splice(index, 1);
      }
      break;
  }

  return result;
}

function findMatchingModifiers(symbols) {
  const matches = [];

  // Search through each category in the schema
  for (const [category, modifiers] of Object.entries(modifierSchema)) {
    for (const modifier of modifiers) {
      // Check if any of the modifier's symbols match
      if (symbols.some((symbol) => modifier.symbols.includes(symbol))) {
        matches.push({
          ...modifier,
          category,
        });
      }
    }
  }

  // Sort by priority
  return matches.sort((a, b) => a.priority - b.priority);
}

function processOperations(intervals, operations) {
  const logs = [];
  let result = [...intervals];

  for (const operation of operations) {
    const beforeState = [...result];
    result = applyOperation(result, operation);
    logs.push({
      operation,
      before: beforeState,
      after: [...result],
    });
  }

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

export function testImprovedParser() {
  const testCases = [
    "Cmaj7", // Should match major seventh
    "Dm7", // Should match minor seventh
    "Em", // Should match minor
    "Faug", // Should match augmented
    "G7b9", // Should match dominant seventh flat ninth
    "Am7b5", // Should match half-diminished seventh
    "Bdim7", // Should match diminished seventh
  ];

  const result = transformChord(["7", "b9", "#11"]);
  console.log(result.intervals); // '0·4·7·10·13·18'

  const minorResult = transformChord(["m", "7"]);
  console.log(minorResult.intervals); // '0·3·7·10'
}
