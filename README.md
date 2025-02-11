 
# Chord Modifier Specification




# Individual Chord Modifiers Reference

## Basic Quality Modifiers
| Symbol | AffectedRole | Operation | Category  | Requires | Conflicts    | Aliases |
|--------|--------------|-----------|-----------|----------|--------------|---------|
| m      | third        | -1        | quality   | none     | maj,sus,dim  | min, -  |
| dim    | fifth        | -1        | quality   | m        | aug          | o, °    |
| aug    | fifth        | +1        | quality   | M3       | dim          | +       |

## Suspension Modifiers
| Symbol | AffectedRole | Operation  | Category    | Requires | Conflicts    | Aliases |
|--------|--------------|------------|-------------|----------|--------------|---------|
| sus4   | third        | replace_4  | suspension  | none     | m,maj,2      | sus     |
| sus2   | third        | replace_2  | suspension  | none     | m,maj,4      | 2       |

## Seventh Extensions
| Symbol | AffectedRole | Operation | Category   | Requires | Conflicts     | Aliases |
|--------|--------------|-----------|------------|----------|---------------|---------|
| 7      | seventh      | add,-1    | extension  | M3       | maj7          | dom     |
| maj7   | seventh      | add,0     | extension  | M3       | 7             | Δ, M7   |
| ø      | fifth,seventh| -1,-1     | extension  | m        | dim7,m7       | m7b5    |

## Add Modifiers
| Symbol | AffectedRole | Operation | Category | Requires | Conflicts | Aliases |
|--------|--------------|-----------|----------|----------|-----------|---------|
| add9   | ninth        | add,0     | addition | none     | 9         | add2    |
| add11  | eleventh     | add,0     | addition | none     | 11        | none    |
| add13  | thirteenth   | add,0     | addition | none     | 13        | add6    |
| 6      | sixth        | add,0     | addition | none     | 13,m6     | add13   |
| m6     | sixth        | add,0     | addition | m        | 13,6      | madd13  |

## Alteration Modifiers
| Symbol | AffectedRole | Operation | Category   | Requires | Conflicts | Aliases |
|--------|--------------|-----------|------------|----------|-----------|---------|
| ♭5     | fifth        | -1        | alteration | none     | ♯5        | -5      |
| ♯5     | fifth        | +1        | alteration | none     | ♭5        | +5      |
| ♭9     | ninth        | -1        | alteration | 7        | ♯9        | -9      |
| ♯9     | ninth        | +1        | alteration | 7        | ♭9        | +9      |
| ♯11    | eleventh     | +1        | alteration | 7        | none      | +11     |
| ♭13    | thirteenth   | -1        | alteration | 7        | none      | -13     |

## Implementation Rules:

1. Operation Types:
   - -1: Lower by semitone
   - +1: Raise by semitone
   - add,X: Add note at interval X
   - replace_X: Replace with interval X

2. Validation Rules:
   - Only one modifier per AffectedRole allowed
   - Check Requires before applying modifier
   - Check Conflicts with existing modifiers
   - Category restrictions:
     - Only one quality modifier at a time
     - Suspensions exclude quality modifiers
     - Alterations require their base interval

3. Processing Order:
   1. Quality modifiers
   2. Suspensions
   3. Extensions
   4. Additions
   5. Alterations

4. Special Cases:
   - Dim affects both third and fifth when used as quality
   - Half-diminished (ø) combines minor and b5
   - Some modifiers add notes instead of modifying existing ones

## Common Combinations:
- m7: m + 7
- maj7: maj + maj7
- 9: 7 + add9
- 13: 7 + add13
- 7♭9: 7 + ♭9
- m7♭5: m + ø

## Notes:
- "Requires" field ensures logical combinations
- "Conflicts" prevents incompatible modifiers
- Operations assume standard major chord as base
- Add operations don't remove existing notes
- Replace operations substitute for existing notes



# Js logic - using the table 
```
import { chordModifiers } from './modifierRules';

/**
 * Prepares modifier patterns for efficient matching by:
 * 1. Converting symbols and aliases into regex patterns
 * 2. Sorting patterns by length for longest-match-first principle
 * 3. Grouping patterns by category for validation
 */
function prepareModifierPatterns(modifiers) {
    // Group all possible symbols and aliases for each modifier
    const patternsWithMetadata = modifiers.flatMap(modifier => {
        // Create patterns from both the main symbol and all aliases
        const allSymbols = [modifier.Symbol, ...(modifier.Aliases?.split(',') || [])];
        
        return allSymbols.map(symbol => ({
            // Escape special regex characters and create pattern
            pattern: new RegExp(`^${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
            length: symbol.length,
            // Keep all original modifier metadata for later use
            metadata: modifier
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
        throw new Error('Invalid chord: missing root note');
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
                    requirements: metadata.Requires
                });

                // Update our tracking sets
                usedCategories.add(metadata.Category);
                if (Array.isArray(metadata.AffectedRole)) {
                    metadata.AffectedRole.forEach(role => affectedRoles.add(role));
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
    if (modifier.Category === 'quality' || modifier.Category === 'suspension') {
        if (usedCategories.has('quality') || usedCategories.has('suspension')) {
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
        const conflicts = modifier.Conflicts.split(',');
        if (conflicts.some(conflict => usedCategories.has(conflict))) {
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
            const required = modifier.requirements.split(',');
            for (const req of required) {
                if (!modifiers.some(mod => 
                    mod.type === req || mod.category === req
                )) {
                    throw new Error(
                        `${modifier.type} requires ${req} to be present`
                    );
                }
            }
        }
    }
}

// Prepare patterns once at startup
const patterns = prepareModifierPatterns(chordModifiers);

// Example usage:
try {
    console.log(parseChordSymbol('Cmaj7', patterns));
    console.log(parseChordSymbol('Dm7b5', patterns));
    console.log(parseChordSymbol('Gsus4add9', patterns));
} catch (error) {
    console.error('Error parsing chord:', error.message);
}

```

# Pseudocode - witout using the table - to show how it works

```
function parseChordSymbol(chordSymbol) {
    // First extract the root note (A-G with optional sharp/flat)
    const rootMatch = chordSymbol.match(/^[A-G][#b♯♭]?/);
    if (!rootMatch) {
        throw new Error('Invalid chord: missing root note');
    }

    const root = rootMatch[0];
    let remaining = chordSymbol.slice(root.length);
    const modifiers = [];

    // Main parsing loop - keep going until no text remains
    while (remaining.length > 0) {
        let matchFound = false;
        
        // Try matching modifier patterns in order of specificity
        
        // 1. Quality modifiers (longest patterns first)
        if (remaining.match(/^maj/i)) {
            modifiers.push({ type: 'maj', role: 'third' });
            remaining = remaining.slice(3);
            matchFound = true;
        } else if (remaining.match(/^min/i)) {
            modifiers.push({ type: 'm', role: 'third' });
            remaining = remaining.slice(3);
            matchFound = true;
        } else if (remaining.match(/^m/)) {
            modifiers.push({ type: 'm', role: 'third' });
            remaining = remaining.slice(1);
            matchFound = true;
        } else if (remaining.match(/^dim/i)) {
            modifiers.push({ type: 'dim', roles: ['third', 'fifth'] });
            remaining = remaining.slice(3);
            matchFound = true;
        } else if (remaining.match(/^aug/i)) {
            modifiers.push({ type: 'aug', role: 'fifth' });
            remaining = remaining.slice(3);
            matchFound = true;
        }
        
        // 2. Suspensions (before numeric patterns)
        else if (remaining.match(/^sus4/i)) {
            modifiers.push({ type: 'sus4', role: 'third' });
            remaining = remaining.slice(4);
            matchFound = true;
        } else if (remaining.match(/^sus2/i)) {
            modifiers.push({ type: 'sus2', role: 'third' });
            remaining = remaining.slice(4);
            matchFound = true;
        } else if (remaining.match(/^sus/i)) {
            modifiers.push({ type: 'sus4', role: 'third' }); // Default sus = sus4
            remaining = remaining.slice(3);
            matchFound = true;
        }
        
        // 3. Extensions (check maj7 before 7)
        else if (remaining.match(/^maj7/i)) {
            modifiers.push({ type: 'maj7', role: 'seventh' });
            remaining = remaining.slice(4);
            matchFound = true;
        } else if (remaining.match(/^7/)) {
            modifiers.push({ type: '7', role: 'seventh' });
            remaining = remaining.slice(1);
            matchFound = true;
        }
        
        // 4. Add modifiers
        else if (remaining.match(/^add/i)) {
            const addMatch = remaining.match(/^add(\d+)/i);
            if (addMatch) {
                modifiers.push({ 
                    type: 'add', 
                    degree: parseInt(addMatch[1]),
                    role: `degree${addMatch[1]}` 
                });
                remaining = remaining.slice(addMatch[0].length);
                matchFound = true;
            }
        }
        
        // 5. Alterations (sharp/flat with numbers)
        else if (remaining.match(/^[♯#b♭][5679](?!\d)/)) {
            const altMatch = remaining.match(/^([♯#b♭])(\d+)/);
            modifiers.push({ 
                type: 'alteration',
                accidental: altMatch[1].match(/[♯#]/) ? 'sharp' : 'flat',
                degree: parseInt(altMatch[2]),
                role: `degree${altMatch[2]}`
            });
            remaining = remaining.slice(2);
            matchFound = true;
        }

        // If nothing matched but we still have text, that's an error
        if (!matchFound) {
            throw new Error(`Unrecognized modifier: ${remaining}`);
        }
    }

    // Quick validation of collected modifiers
    validateModifierCombination(modifiers);

    return { root, modifiers };
}

function validateModifierCombination(modifiers) {
    // Track what roles have been modified
    const modifiedRoles = new Set();
    
    // Track if we've seen quality or suspension modifiers
    let hasQuality = false;
    let hasSuspension = false;

    for (const mod of modifiers) {
        // Check role conflicts
        if (Array.isArray(mod.roles)) {
            for (const role of mod.roles) {
                if (modifiedRoles.has(role)) {
                    throw new Error(`Conflicting modifiers for ${role}`);
                }
                modifiedRoles.add(role);
            }
        } else if (mod.role) {
            if (modifiedRoles.has(mod.role)) {
                throw new Error(`Conflicting modifiers for ${mod.role}`);
            }
            modifiedRoles.add(mod.role);
        }

        // Check quality/suspension conflicts
        if (mod.type === 'm' || mod.type === 'maj' || mod.type === 'dim' || mod.type === 'aug') {
            if (hasQuality || hasSuspension) {
                throw new Error('Cannot combine multiple quality modifiers');
            }
            hasQuality = true;
        }
        if (mod.type.startsWith('sus')) {
            if (hasQuality || hasSuspension) {
                throw new Error('Cannot combine suspension with quality modifiers');
            }
            hasSuspension = true;
        }
    }
}

// Example usage:
console.log(parseChordSymbol('Cmaj7')); 
console.log(parseChordSymbol('Dm7b5'));
console.log(parseChordSymbol('Gsus4add9'));

```





-----

# Basic Chord Qualities Reference Table

| Symbol | Intervals          | Semitones  | Category    | Optional | Common Notation |
|--------|-------------------|------------|-------------|----------|-----------------|
| maj    | R, M3, P5         | [0,4,7]    | Major      | (5)      | M, Δ, none     |
| m      | R, m3, P5         | [0,3,7]    | Minor      | (5)      | min, -         |
| dim    | R, m3, d5         | [0,3,6]    | Diminished | none     | °, o           |
| aug    | R, M3, A5         | [0,4,8]    | Augmented  | none     | +              |
| sus4   | R, P4, P5         | [0,5,7]    | Suspended  | (5)      | sus            |
| sus2   | R, M2, P5         | [0,2,7]    | Suspended  | (5)      | none           |
| 5      | R, P5             | [0,7]      | Power      | none     | (no 3rd)       |

# Extensions Table

| Symbol | Intervals          | Semitones     | Category   | Optional    | Common Notation |
|--------|-------------------|---------------|------------|-------------|-----------------|
| 7      | R, M3, P5, m7     | [0,4,7,10]    | Dominant   | (5)         | dom            |
| maj7   | R, M3, P5, M7     | [0,4,7,11]    | Major      | (5)         | Δ7, M7         |
| m7     | R, m3, P5, m7     | [0,3,7,10]    | Minor      | (5)         | min7, -7       |
| dim7   | R, m3, d5, d7     | [0,3,6,9]     | Diminished | none        | °7             |
| m7b5   | R, m3, d5, m7     | [0,3,6,10]    | Half-Dim   | none        | ø              |
| mM7    | R, m3, P5, M7     | [0,3,7,11]    | Minor-Maj  | (5)         | m/maj7, -Δ7    |

# Add Table

| Symbol  | Intervals         | Semitones     | Category   | Optional    | Common Notation |
|---------|------------------|---------------|------------|-------------|-----------------|
| add9    | R, M3, P5, M9    | [0,4,7,14]    | Addition   | (5)         | add2           |
| add11   | R, M3, P5, P11   | [0,4,7,17]    | Addition   | (5)         | none           |
| add13   | R, M3, P5, M13   | [0,4,7,21]    | Addition   | (5)         | add6           |
| 6       | R, M3, P5, M6    | [0,4,7,9]     | Addition   | (5)         | add13          |
| m6      | R, m3, P5, M6    | [0,3,7,9]     | Addition   | (5)         | madd13         |

## Implementation Notes:

1. Categories help validate combinations:
   - Only one quality modifier allowed at a time
   - Suspended chords cannot have thirds
   - Power chords exclude thirds

2. Optional notes:
   - (5) indicates fifth can be omitted
   - Fifth is never optional in power chords
   - Fifth is never optional in diminished/augmented chords

3. Interval representations:
   - R = Root
   - m3 = minor third
   - M3 = major third
   - P4 = perfect fourth
   - P5 = perfect fifth
   - m7 = minor seventh
   - M7 = major seventh

4. Converting between representations:
   - Semitones array useful for computational purposes
   - Intervals useful for theoretical analysis
   - Both should be maintained for completeness
  

## Operation Types

### Semitone Modifications
| Operation | Semitones | Example Use Case |
|-----------|-----------|-----------------|
| -1        | Lower by one semitone | Minor third from major (m) |
| -2        | Lower by two semitones | Diminished fifth from perfect fifth (dim) |
| +1        | Raise by one semitone | Augmented fifth from perfect fifth (aug) |
| +2        | Raise by two semitones | Double augmented fourth (rare) |

### Interval Replacements
| Operation | Interval | Semitones from Root | Example Use Case |
|-----------|----------|---------------------|-----------------|
| replace_2  | Major second | 2 | sus2 chord |
| replace_4  | Perfect fourth | 5 | sus4 chord |
| replace_6  | Major sixth | 9 | Specific jazz voicings |

### Addition Operations
| Operation | Description | Example Use Case |
|-----------|-------------|-----------------|
| add       | Adds note without removing others | add9, add11 |
| add_below | Adds note below existing structure | Certain slash chords |

## Complete Operation Table with Examples

| Symbol | Operation | Numeric Value | Base Interval | Result Interval |
|--------|-----------|---------------|---------------|-----------------|
| m      | -1        | 3 → 2        | Major third   | Minor third     |
| dim5   | -1        | 7 → 6        | Perfect fifth | Diminished fifth|
| aug    | +1        | 7 → 8        | Perfect fifth | Augmented fifth |
| dim    | -1, -2    | 3→2, 7→5     | M3, P5        | m3, d5         |
| sus2   | replace_2 | 2            | Major third   | Major second    |
| sus4   | replace_4 | 5            | Major third   | Perfect fourth  |
| ♭9     | -1        | 14 → 13      | Major ninth   | Minor ninth    |
| ♯11    | +1        | 17 → 18      | Perfect 11th  | Aug 11th       |

## Implementation Safety Rules

1. Interval Bounds:
   - Minimum modification: -2 semitones
   - Maximum modification: +2 semitones
   - Any larger intervals should be handled as replacements

2. Replace Operations:
   - Must specify exact interval distance from root
   - Always remove the original interval
   - Cannot be combined with modifications to same interval

3. Addition Operations:
   - Cannot conflict with existing notes
   - Must respect voice leading rules
   - Should check for dissonance thresholds

4. Compound Operations:
   - Apply in left-to-right order within same precedence
   - Track total modification to prevent excessive alteration
   - Cannot exceed ±2 semitones total per note

## Validation Examples

```javascript
// Example validation function
function validateOperation(operation, baseInterval) {
    // Check for excessive modifications
    if (operation.startsWith('+') || operation.startsWith('-')) {
        const mod = parseInt(operation);
        if (Math.abs(mod) > 2) {
            throw new Error('Excessive interval modification');
        }
    }
    
    // Handle replacements
    if (operation.startsWith('replace_')) {
        const interval = parseInt(operation.split('_')[1]);
        // Validate replacement intervals
        if (![2, 4, 6].includes(interval)) {
            throw new Error('Invalid replacement interval');
        }
    }
}
```

## Edge Cases to Handle

1. Double Diminished/Augmented:
   - Rarely used but possible
   - Must be handled as two separate -1 or +1 operations
   - Example: diminished seventh chord (double diminished)

2. Multiple Modifications:
   - Some chords modify same note multiple times
   - Must track cumulative changes
   - Example: altered dominant chord (♭9, ♯9 options)

3. Enharmonic Equivalents:
   - Some modifications result in enharmonically equivalent notes
   - Should normalize to standard form
   - Example: ♯9 vs ♭10
