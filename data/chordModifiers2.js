// Types of operations that can be performed on chord tones
const OperationType = {
  REPLACE: "replace", // Replace a chord tone entirely
  MODIFY: "modify", // Modify a chord tone (sharp/flat)
  ADD: "add", // Add a new tone
  REMOVE: "remove", // Remove a tone
};

// Roles represent positions within the chord
const ChordRole = {
  ROOT: "root",
  THIRD: "third",
  FIFTH: "fifth",
  SEVENTH: "seventh",
  NINTH: "ninth",
  ELEVENTH: "eleventh",
  THIRTEENTH: "thirteenth",
};

// Define the modifier schema
export const modifierSchema = {
  // Quality modifiers (affect basic chord character)
  quality: [
    {
      symbols: ["maj", "M", "major"],
      operation: {
        type: OperationType.REPLACE,
        role: ChordRole.THIRD,
        value: 4, // semitones from root
      },
      priority: 1,
      isDefault: true,
    },
    {
      symbols: ["m", "min", "minor", "-"],
      operation: {
        type: OperationType.REPLACE,
        role: ChordRole.THIRD,
        value: 3, // minor third
      },
      priority: 1,
    },
    {
      symbols: ["dim", "°", "o"],
      operations: [
        {
          type: OperationType.REPLACE,
          role: ChordRole.THIRD,
          value: 3, // minor third
        },
        {
          type: OperationType.REPLACE,
          role: ChordRole.FIFTH,
          value: 6, // diminished fifth
        },
      ],
      priority: 1,
    },
    {
      symbols: ["aug", "+"],
      operations: [
        {
          type: OperationType.REPLACE,
          role: ChordRole.FIFTH,
          value: 8, // augmented fifth
        },
      ],
      priority: 1,
    },
  ],

  // Suspension modifiers
  suspension: [
    {
      symbols: ["sus4", "sus"],
      operation: {
        type: OperationType.REPLACE,
        role: ChordRole.THIRD,
        value: 5, // perfect fourth
      },
      priority: 1,
      excludes: ["quality"],
    },
    {
      symbols: ["sus2"],
      operation: {
        type: OperationType.REPLACE,
        role: ChordRole.THIRD,
        value: 2, // major second
      },
      priority: 1,
      excludes: ["quality"],
    },
  ],

  // Extension modifiers
  extension: [
    {
      symbols: ["maj7", "M7", "Δ"],
      operation: {
        type: OperationType.ADD,
        role: ChordRole.SEVENTH,
        value: 11, // major seventh
      },
      priority: 2,
      requires: ["quality.major"],
    },
    {
      symbols: ["7"],
      operation: {
        type: OperationType.ADD,
        role: ChordRole.SEVENTH,
        value: 10, // minor seventh
      },
      priority: 2,
    },
    {
      symbols: ["9"],
      operations: [
        {
          type: OperationType.ADD,
          role: ChordRole.SEVENTH,
          value: 10, // minor seventh
        },
        {
          type: OperationType.ADD,
          role: ChordRole.NINTH,
          value: 14, // major ninth
        },
      ],
      priority: 2,
    },
    {
      symbols: ["11"],
      operations: [
        {
          type: OperationType.ADD,
          role: ChordRole.SEVENTH,
          value: 10,
        },
        {
          type: OperationType.ADD,
          role: ChordRole.NINTH,
          value: 14,
        },
        {
          type: OperationType.ADD,
          role: ChordRole.ELEVENTH,
          value: 17,
        },
      ],
      priority: 2,
    },
    {
      symbols: ["13"],
      operations: [
        {
          type: OperationType.ADD,
          role: ChordRole.SEVENTH,
          value: 10,
        },
        {
          type: OperationType.ADD,
          role: ChordRole.NINTH,
          value: 14,
        },
        {
          type: OperationType.ADD,
          role: ChordRole.THIRTEENTH,
          value: 21,
        },
      ],
      priority: 2,
    },
  ],

  // Addition modifiers
  addition: [
    {
      symbols: ["add9", "add2"],
      operation: {
        type: OperationType.ADD,
        role: ChordRole.NINTH,
        value: 14,
      },
      priority: 3,
    },
    {
      symbols: ["add11"],
      operation: {
        type: OperationType.ADD,
        role: ChordRole.ELEVENTH,
        value: 17,
      },
      priority: 3,
    },
    {
      symbols: ["add13", "add6"],
      operation: {
        type: OperationType.ADD,
        role: ChordRole.THIRTEENTH,
        value: 21,
      },
      priority: 3,
    },
  ],

  // Alteration modifiers
  alteration: [
    {
      symbols: ["b5", "♭5", "-5"],
      operation: {
        type: OperationType.MODIFY,
        role: ChordRole.FIFTH,
        value: -1,
      },
      priority: 4,
    },
    {
      symbols: ["#5", "♯5", "+5"],
      operation: {
        type: OperationType.MODIFY,
        role: ChordRole.FIFTH,
        value: 1,
      },
      priority: 4,
    },
    {
      symbols: ["b9", "♭9", "-9"],
      operation: {
        type: OperationType.MODIFY,
        role: ChordRole.NINTH,
        value: -1,
      },
      priority: 4,
      requires: ["extension.7"],
    },
    {
      symbols: ["#9", "♯9", "+9"],
      operation: {
        type: OperationType.MODIFY,
        role: ChordRole.NINTH,
        value: 1,
      },
      priority: 4,
      requires: ["extension.7"],
    },
    {
      symbols: ["#11", "♯11", "+11"],
      operation: {
        type: OperationType.MODIFY,
        role: ChordRole.ELEVENTH,
        value: 1,
      },
      priority: 4,
      requires: ["extension.7"],
    },
    {
      symbols: ["b13", "♭13", "-13"],
      operation: {
        type: OperationType.MODIFY,
        role: ChordRole.THIRTEENTH,
        value: -1,
      },
      priority: 4,
      requires: ["extension.7"],
    },
  ],
};

// Example usage:
/*
  const chord = {
    root: "C",
    modifiers: ["m", "7", "b5"],  // Cm7b5
    bass: null  // for slash chords
  };
  
  // Parser would:
  1. Sort modifiers by priority
  2. Check for conflicts/requirements
  3. Apply operations in order
  4. Build final chord structure
  */

export default modifierSchema;
