import { chordModifiers } from "../../data/chordModifiers.js";

/**
 * Prepares modifier patterns for efficient matching by:
 * 1. Converting symbols and aliases into regex patterns
 * 2. Sorting patterns by length for longest-match-first principle
 * 3. Grouping patterns by category for validation
 */
function prepareModifierPatterns(modifiers) {
  console.log("🔧 Preparing modifier patterns...");

  const patternsWithMetadata = modifiers.flatMap((modifier) => {
    const allSymbols = [
      modifier.Symbol,
      ...(modifier.Aliases?.split(",") || []),
    ].map((s) => s.trim());

    console.log(`\n📝 Processing modifier: ${modifier.Symbol}`);
    console.log(`   Category: ${modifier.Category}`);
    console.log(`   Affects: ${modifier.AffectedRole}`);
    console.log(`   Aliases: ${allSymbols.join(", ")}`);
    console.log(`   Operation: ${modifier.Operation}`);

    if (modifier.Requires) {
      console.log(`   Requirements: ${modifier.Requires}`);
    }
    if (modifier.Conflicts) {
      console.log(`   Conflicts: ${modifier.Conflicts}`);
    }

    return allSymbols.map((symbol) => ({
      pattern: new RegExp(
        `^${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "i"
      ),
      length: symbol.length,
      metadata: modifier,
    }));
  });

  const sortedPatterns = patternsWithMetadata.sort(
    (a, b) => b.length - a.length
  );
  console.log("\n📊 Pattern Summary:");
  console.table(
    sortedPatterns.map((p) => ({
      pattern: p.pattern.toString(),
      length: p.length,
      category: p.metadata.Category,
      affects: p.metadata.AffectedRole,
      operation: p.metadata.Operation,
    }))
  );

  return sortedPatterns;
}

/**
 * Validates that a new modifier can be combined with existing ones
 * @param {Object} modifier - The new modifier to validate
 * @param {Set} usedCategories - Categories already present in the chord
 * @param {Set} affectedRoles - Chord roles already modified
 */
function validateNewModifier(modifier, usedCategories, affectedRoles) {
  console.log(`\n🔍 Validating new modifier: ${modifier.Symbol}`);
  console.log("   Current state:");
  console.table({
    currentCategories: Array.from(usedCategories),
    currentRoles: Array.from(affectedRoles),
  });

  // Check quality/suspension conflicts
  if (modifier.Category === "quality" || modifier.Category === "suspension") {
    if (usedCategories.has("quality") || usedCategories.has("suspension")) {
      console.error("❌ Quality/suspension conflict detected!");
      throw new Error(
        `Cannot combine ${modifier.Symbol} with existing quality/suspension modifiers`
      );
    }
  }

  // Check role conflicts
  if (Array.isArray(modifier.AffectedRole)) {
    for (const role of modifier.AffectedRole) {
      if (affectedRoles.has(role)) {
        console.error(`❌ Role conflict detected for: ${role}`);
        throw new Error(`Conflicting modifiers for ${role}`);
      }
    }
  } else if (affectedRoles.has(modifier.AffectedRole)) {
    console.error(`❌ Role conflict detected for: ${modifier.AffectedRole}`);
    throw new Error(`Conflicting modifiers for ${modifier.AffectedRole}`);
  }

  // Check explicit conflicts
  if (modifier.Conflicts) {
    const conflicts = modifier.Conflicts.split(",").map((c) => c.trim());
    console.log(`   Checking conflicts: ${conflicts.join(", ")}`);
    if (conflicts.some((conflict) => usedCategories.has(conflict))) {
      console.error("❌ Category conflict detected!");
      throw new Error(`Invalid combination with ${modifier.Symbol}`);
    }
  }

  console.log("✅ Modifier validation passed");
}

/**
 * Verifies that all required modifiers are present
 * @param {Array} modifiers - Array of parsed modifiers
 */
function validateRequirements(modifiers) {
  console.log("\n🔍 Validating modifier requirements");

  for (const modifier of modifiers) {
    if (modifier.requirements) {
      const required = modifier.requirements.split(",").map((r) => r.trim());
      console.log(
        `   Checking requirements for ${modifier.type}: ${required.join(", ")}`
      );

      for (const req of required) {
        const hasRequirement = modifiers.some(
          (mod) => mod.type === req || mod.category === req
        );

        if (!hasRequirement) {
          console.error(`❌ Missing requirement: ${req} for ${modifier.type}`);
          throw new Error(`${modifier.type} requires ${req} to be present`);
        }
        console.log(`   ✅ Requirement satisfied: ${req}`);
      }
    }
  }
  console.log("✅ All requirements validated successfully");
}

/**
 * Internal function to parse a chord symbol into its components
 * @param {string} chordSymbol - The chord symbol to parse
 * @param {Array} patterns - Prepared modifier patterns
 * @returns {Object} Parsed chord structure
 */
function parseChordSymbolInternal(chordSymbol, patterns) {
  console.log(`\n🎼 ----------------------------------------`);
  console.log(`\n🎼 Parsing chord symbol: "${chordSymbol}"`);

  // Extract root note
  const rootMatch = chordSymbol.match(/^[A-G][#b♯♭]?/);
  if (!rootMatch) {
    console.error("❌ No valid root note found!");
    throw new Error("Invalid chord: missing root note");
  }

  const root = rootMatch[0];
  console.log(`🎵 Root note: ${root}`);

  let remaining = chordSymbol.slice(root.length);
  console.log(`📝 Remaining to parse: "${remaining}"`);

  const modifiers = [];
  const usedCategories = new Set();
  const affectedRoles = new Set();

  // Parse remaining modifiers
  while (remaining.length > 0) {
    console.log(`\n🔍 Analyzing remaining portion: "${remaining}"`);
    let matchFound = false;

    for (const { pattern, metadata } of patterns) {
      const match = remaining.match(pattern);
      if (match) {
        console.log(`✅ Found match: "${match[0]}" (${metadata.Category})`);
        console.log(`   Symbol: ${metadata.Symbol}`);
        console.log(`   Affects: ${metadata.AffectedRole}`);
        console.log(`   Operation: ${metadata.Operation}`);

        try {
          validateNewModifier(metadata, usedCategories, affectedRoles);

          modifiers.push({
            type: metadata.Symbol,
            category: metadata.Category,
            role: metadata.AffectedRole,
            operation: metadata.Operation,
            requirements: metadata.Requires,
          });

          console.log("✨ Modifier validated and added successfully");
          console.log("📊 Current state:");
          console.table({
            usedCategories: Array.from(usedCategories),
            affectedRoles: Array.from(affectedRoles),
          });

          // Update tracking sets
          usedCategories.add(metadata.Category);
          if (Array.isArray(metadata.AffectedRole)) {
            metadata.AffectedRole.forEach((role) => affectedRoles.add(role));
          } else {
            affectedRoles.add(metadata.AffectedRole);
          }

          remaining = remaining.slice(match[0].length);
          matchFound = true;
          break;
        } catch (error) {
          console.warn(`⚠️ Validation failed: ${error.message}`);
          throw error;
        }
      }
    }

    if (!matchFound) {
      console.error(`❌ No valid modifier found for: "${remaining}"`);
      throw new Error(`Unrecognized modifier in chord: ${remaining}`);
    }
  }

  console.log("\n🔍 Validating final requirements...");
  validateRequirements(modifiers);

  console.log("\n✅ Final parsed chord structure:");
  console.table({
    root,
    modifiers: modifiers.map((m) => `${m.type} (${m.category})`),
  });

  return { root, modifiers };
}

/**
 * Computes detailed chord structure including intervals
 * @param {Object} chordObject - Parsed chord object
 * @returns {Object} Detailed chord information
 */
function getChordDetails(chordObject) {
  console.log("\n🎵 Computing chord details");
  console.log("   Input:", JSON.stringify(chordObject, null, 2));

  let intervals = { ...baseIntervals };
  const activeRoles = new Set(["root"]);

  console.log("\n📊 Initial intervals:");
  console.table(intervals);

  // Apply quality modifiers
  const qualityMod = chordObject.modifiers.find(
    (m) => m.category === "quality"
  );
  if (qualityMod) {
    console.log(`\n🔧 Applying quality modifier: ${qualityMod.type}`);
    if (Array.isArray(qualityMod.role)) {
      qualityMod.role.forEach((role, idx) => {
        const op = Array.isArray(qualityMod.operation)
          ? qualityMod.operation[idx]
          : qualityMod.operation;
        console.log(`   Modifying ${role} by ${op}`);
        intervals[role] += op;
        activeRoles.add(role);
      });
    } else {
      console.log(`   Modifying ${qualityMod.role} by ${qualityMod.operation}`);
      intervals[qualityMod.role] += qualityMod.operation;
      activeRoles.add(qualityMod.role);
    }
  } else {
    console.log("   No quality modifier - assuming major triad");
    activeRoles.add("third");
    activeRoles.add("fifth");
  }

  // Handle suspensions
  const susModifier = chordObject.modifiers.find(
    (m) => m.category === "suspension"
  );
  if (susModifier) {
    console.log(`\n🔧 Applying suspension: ${susModifier.type}`);
    activeRoles.delete("third");
    if (susModifier.operation === "replace_4") {
      intervals.third = 5; // Perfect fourth
    } else if (susModifier.operation === "replace_2") {
      intervals.third = 2; // Major second
    }
    activeRoles.add("third");
  }

  // Apply extensions
  const extensionMod = chordObject.modifiers.find(
    (m) => m.category === "extension"
  );
  if (extensionMod) {
    console.log(`\n🔧 Applying extension: ${extensionMod.type}`);
    const [operation, value] = extensionMod.operation.split(",");
    if (operation === "add") {
      intervals.seventh += parseInt(value);
      activeRoles.add("seventh");
    }
  }

  // Handle additions
  const addModifiers = chordObject.modifiers.filter(
    (m) => m.category === "addition"
  );
  if (addModifiers.length > 0) {
    console.log("\n🔧 Applying additions:");
    for (const mod of addModifiers) {
      console.log(`   Adding ${mod.role}`);
      activeRoles.add(mod.role);
    }
  }

  // Apply alterations
  const alterationMods = chordObject.modifiers.filter(
    (m) => m.category === "alteration"
  );
  if (alterationMods.length > 0) {
    console.log("\n🔧 Applying alterations:");
    for (const mod of alterationMods) {
      console.log(`   Modifying ${mod.role} by ${mod.operation}`);
      intervals[mod.role] += mod.operation;
      activeRoles.add(mod.role);
    }
  }

  // Convert semitones to interval names
  const intervalNames = {};
  for (const role of activeRoles) {
    const semitones = intervals[role] % 12;
    intervalNames[role] = semitonesToInterval[semitones];
  }

  const result = {
    root: chordObject.root,
    intervals: intervalNames,
    semitones: Object.fromEntries(
      Array.from(activeRoles).map((role) => [role, intervals[role]])
    ),
    modifiers: chordObject.modifiers,
  };

  console.log("\n✨ Final chord details:");
  console.table(result);

  return result;
}

// Cache for default patterns
let DEFAULT_PATTERNS = [];

/**
 * Gets or creates default modifier patterns
 * @returns {Array} Prepared modifier patterns
 */
function getDefaultPatterns() {
  if (DEFAULT_PATTERNS.length === 0) {
    console.log("🔄 Initializing default patterns");
    DEFAULT_PATTERNS = prepareModifierPatterns(chordModifiers);
  }
  return DEFAULT_PATTERNS;
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
