import { chordModifiers } from "../data/chordModifiers";

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
function parseChordSymbol(chordSymbol, patterns) {
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
}

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
