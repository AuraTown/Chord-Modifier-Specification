import { chordModifiers } from "../../data/chordModifiers.js";

/**
 * Prepares modifier patterns for efficient matching by:
 * 1. Converting symbols and aliases into regex patterns
 * 2. Sorting patterns by length for longest-match-first principle
 * 3. Grouping patterns by category for validation
 */
function prepareModifierPatterns(modifiers) {
  // Group all possible symbols and aliases for each modifier
  const patternsWithMetadata = modifiers.flatMap((modifier) => {
    // Create patterns from both the main symbol and all aliases
    const allSymbols = [
      modifier.Symbol,
      ...(modifier.Aliases?.split(",") || []),
    ];

    return allSymbols.map((symbol) => ({
      // Escape special regex characters and create pattern
      pattern: new RegExp(
        `^${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "i"
      ),
      length: symbol.length,
      // Keep all original modifier metadata for later use
      metadata: modifier,
    }));
  });

  // Sort by length (descending) to ensure longest matches are tried first
  return patternsWithMetadata.sort((a, b) => b.length - a.length);
}

/**
 * Parses a chord symbol into its constituent parts using the provided modifier rules.
 * Example: "Cmaj7" → { root: "C", modifiers: [...] }
 */
const parseChordSymbolInternal = function (chordSymbol, patterns) {
  // First extract the root note (A-G with optional sharp/flat)

  const rootMatch = chordSymbol.match(/^[A-G][#b♯♭]?/);
  if (!rootMatch) {
    throw new Error("Invalid chord: missing root note");
  }

  const root = rootMatch[0];
  let remaining = chordSymbol.slice(root.length);
  const modifiers = [];

  // Keep track of used categories and affected roles for validation
  const usedCategories = new Set();
  const affectedRoles = new Set();

  // Main parsing loop - continue until no text remains
  while (remaining.length > 0) {
    let matchFound = false;

    // Try each pattern in order (longest first)
    for (const { pattern, metadata } of patterns) {
      const match = remaining.match(pattern);
      if (match) {
        // Validate this modifier against what we've already collected
        validateNewModifier(metadata, usedCategories, affectedRoles);

        // Store the modifier with its complete metadata
        modifiers.push({
          type: metadata.Symbol,
          category: metadata.Category,
          role: metadata.AffectedRole,
          operation: metadata.Operation,
          requirements: metadata.Requires,
        });

        // Update our tracking sets
        usedCategories.add(metadata.Category);
        if (Array.isArray(metadata.AffectedRole)) {
          metadata.AffectedRole.forEach((role) => affectedRoles.add(role));
        } else {
          affectedRoles.add(metadata.AffectedRole);
        }

        // Remove the matched portion and continue
        remaining = remaining.slice(match[0].length);
        matchFound = true;
        break;
      }
    }

    if (!matchFound) {
      throw new Error(`Unrecognized modifier in chord: ${remaining}`);
    }
  }

  // Verify all required modifiers are present
  validateRequirements(modifiers);

  return { root, modifiers };
};

/**
 * Validates that a new modifier can be added given what's already been collected.
 * Throws errors for invalid combinations.
 */
function validateNewModifier(modifier, usedCategories, affectedRoles) {
  // Check category conflicts
  if (modifier.Category === "quality" || modifier.Category === "suspension") {
    if (usedCategories.has("quality") || usedCategories.has("suspension")) {
      throw new Error(
        `Cannot combine ${modifier.Symbol} with existing quality/suspension modifiers`
      );
    }
  }

  // Check role conflicts
  if (Array.isArray(modifier.AffectedRole)) {
    for (const role of modifier.AffectedRole) {
      if (affectedRoles.has(role)) {
        throw new Error(`Conflicting modifiers for ${role}`);
      }
    }
  } else if (affectedRoles.has(modifier.AffectedRole)) {
    throw new Error(`Conflicting modifiers for ${modifier.AffectedRole}`);
  }

  // Check explicit conflicts from the rules
  if (modifier.Conflicts) {
    const conflicts = modifier.Conflicts.split(",");
    if (conflicts.some((conflict) => usedCategories.has(conflict))) {
      throw new Error(`Invalid combination with ${modifier.Symbol}`);
    }
  }
}

/**
 * Verifies that all required modifiers are present for the given combination.
 * Example: ♯11 requires a seventh chord.
 */
function validateRequirements(modifiers) {
  for (const modifier of modifiers) {
    if (modifier.requirements) {
      const required = modifier.requirements.split(",");
      for (const req of required) {
        if (
          !modifiers.some((mod) => mod.type === req || mod.category === req)
        ) {
          throw new Error(`${modifier.type} requires ${req} to be present`);
        }
      }
    }
  }
}

/////

/**
 * Converts a semitone number to an interval name
 * e.g., 4 -> "M3" (major third), 3 -> "m3" (minor third)
 */
const semitonesToInterval = {
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

/**
 * Base intervals for a major chord (relative to root)
 * These get modified based on chord quality and modifiers
 */
const baseIntervals = {
  root: 0, // Root note (always present)
  third: 4, // Major third
  fifth: 7, // Perfect fifth
  seventh: 11, // Major seventh
  ninth: 14, // Major ninth (compound interval)
  eleventh: 17, // Perfect eleventh
  thirteenth: 21, // Major thirteenth
};

/**
 * Computes the detailed structure of a chord based on its root and modifiers
 * @param {Object} chordObject - Contains root note and array of modifiers
 * @returns {Object} Detailed chord information including intervals
 */
function getChordDetails(chordObject) {
  // Start with a copy of base intervals
  let intervals = { ...baseIntervals };

  // Track which roles are actually used in the chord
  const activeRoles = new Set(["root"]);

  // First pass: Apply quality modifiers to establish basic chord structure
  const qualityMod = chordObject.modifiers.find(
    (m) => m.category === "quality"
  );
  if (qualityMod) {
    if (Array.isArray(qualityMod.AffectedRole)) {
      qualityMod.AffectedRole.forEach((role, idx) => {
        intervals[role] += qualityMod.Operation[idx];
        activeRoles.add(role);
      });
    } else {
      intervals[qualityMod.AffectedRole] += qualityMod.Operation;
      activeRoles.add(qualityMod.AffectedRole);
    }
  } else {
    // If no quality modifier, assume major
    activeRoles.add("third");
    activeRoles.add("fifth");
  }

  // Handle suspensions (these replace the third)
  const susModifier = chordObject.modifiers.find(
    (m) => m.category === "suspension"
  );
  if (susModifier) {
    activeRoles.delete("third");
    if (susModifier.Operation === "replace_4") {
      intervals.third = 5; // Perfect fourth
    } else if (susModifier.Operation === "replace_2") {
      intervals.third = 2; // Major second
    }
    activeRoles.add("third");
  }

  // Handle extensions (7ths)
  const extensionMod = chordObject.modifiers.find(
    (m) => m.category === "extension"
  );
  if (extensionMod) {
    const [operation, value] = extensionMod.Operation.split(",");
    if (operation === "add") {
      intervals.seventh += parseInt(value);
      activeRoles.add("seventh");
    }
  }

  // Handle additions (add9, add11, etc.)
  const addModifiers = chordObject.modifiers.filter(
    (m) => m.category === "addition"
  );
  for (const mod of addModifiers) {
    activeRoles.add(mod.AffectedRole);
  }

  // Finally, apply alterations (♭5, ♯9, etc.)
  const alterationMods = chordObject.modifiers.filter(
    (m) => m.category === "alteration"
  );
  for (const mod of alterationMods) {
    intervals[mod.AffectedRole] += mod.Operation;
    activeRoles.add(mod.AffectedRole);
  }

  // Convert semitones to interval names, but only for active roles
  const intervalNames = {};
  for (const role of activeRoles) {
    const semitones = intervals[role] % 12; // Normalize to within an octave
    intervalNames[role] = semitonesToInterval[semitones];
  }

  return {
    root: chordObject.root,
    intervals: intervalNames,
    semitones: Object.fromEntries(
      Array.from(activeRoles).map((role) => [role, intervals[role]])
    ),
    modifiers: chordObject.modifiers,
  };
}

/////

let DEFAULT_PATTENRS = [];
function getDefaultPattern() {
  if (DEFAULT_PATTENRS.length === 0) {
    DEFAULT_PATTENRS = prepareModifierPatterns(chordModifiers);
  }
  return DEFAULT_PATTENRS;
}

export function parseChordSymbol(chordSymbol, patterns = getDefaultPattern()) {
  // We load the default patterns from the lib on first use, if none are passed.
  const c = parseChordSymbolInternal(chordSymbol, patterns);
  const d = getChordDetails(c);
  return d;
}

// Prepare patterns once at startup
const patterns = prepareModifierPatterns(chordModifiers);

// Example usage:
try {
  console.log(parseChordSymbol("Cmaj7", patterns));
  console.log(parseChordSymbol("Dm7b5", patterns));
  console.log(parseChordSymbol("Gsus4add9", patterns));
} catch (error) {
  console.error("Error parsing chord:", error.message);
}
