 
# Chord Modifier Specification

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
