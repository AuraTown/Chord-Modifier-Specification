 
# Chord Modifier Specification


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
