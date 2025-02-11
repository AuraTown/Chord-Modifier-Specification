// modifierRules.js

// Quality modifiers form the base character of the chord
// They should be parsed first to establish the chord's foundation
const qualityModifiers = [
  {
    Symbol: "maj",
    AffectedRole: "third",
    Operation: 0,
    Category: "quality",
    Requires: "",
    Conflicts: "min,dim,aug,sus",
    Aliases: "M,maj,major",
    ModifierType: "quality",
  },
  {
    Symbol: "m",
    AffectedRole: "third",
    Operation: -1,
    Category: "quality",
    Requires: "",
    Conflicts: "maj,dim,aug,sus",
    Aliases: "min,minor,-",
    ModifierType: "quality",
  },
  {
    Symbol: "dim",
    AffectedRole: ["third", "fifth"],
    Operation: [-1, -1],
    Category: "quality",
    Requires: "",
    Conflicts: "maj,min,aug,sus",
    Aliases: "°,o",
    ModifierType: "quality",
  },
  {
    Symbol: "aug",
    AffectedRole: "fifth",
    Operation: 1,
    Category: "quality",
    Requires: "M3",
    Conflicts: "dim",
    Aliases: "+",
    ModifierType: "quality",
  },
];

// Suspension modifiers replace the third
// They should be parsed before numeric modifiers to avoid confusion
const suspensionModifiers = [
  {
    Symbol: "sus4",
    AffectedRole: "third",
    Operation: "replace_4",
    Category: "suspension",
    Requires: "",
    Conflicts: "quality",
    Aliases: "sus",
    ModifierType: "suspension",
  },
  {
    Symbol: "sus2",
    AffectedRole: "third",
    Operation: "replace_2",
    Category: "suspension",
    Requires: "",
    Conflicts: "quality",
    Aliases: "",
    ModifierType: "suspension",
  },
];

// Extension modifiers add sevenths and are fundamental to extended harmony
const extensionModifiers = [
  {
    Symbol: "maj7",
    AffectedRole: "seventh",
    Operation: "add,0",
    Category: "extension",
    Requires: "M3",
    Conflicts: "7",
    Aliases: "M7,Δ,maj7",
    ModifierType: "extension",
  },
  {
    Symbol: "7",
    AffectedRole: "seventh",
    Operation: "add,-1",
    Category: "extension",
    Requires: "",
    Conflicts: "maj7",
    Aliases: "dom",
    ModifierType: "extension",
  },
];

// Add modifiers extend the chord without altering existing notes
const addModifiers = [
  {
    Symbol: "add9",
    AffectedRole: "ninth",
    Operation: "add,0",
    Category: "addition",
    Requires: "",
    Conflicts: "9",
    Aliases: "add2",
    ModifierType: "addition",
  },
  {
    Symbol: "add11",
    AffectedRole: "eleventh",
    Operation: "add,0",
    Category: "addition",
    Requires: "",
    Conflicts: "11",
    Aliases: "",
    ModifierType: "addition",
  },
  {
    Symbol: "add13",
    AffectedRole: "thirteenth",
    Operation: "add,0",
    Category: "addition",
    Requires: "",
    Conflicts: "13",
    Aliases: "add6",
    ModifierType: "addition",
  },
];

// Alteration modifiers change specific chord tones
// They should be parsed after establishing the basic chord structure
const alterationModifiers = [
  {
    Symbol: "♭5",
    AffectedRole: "fifth",
    Operation: -1,
    Category: "alteration",
    Requires: "",
    Conflicts: "♯5",
    Aliases: "b5,-5",
    ModifierType: "alteration",
  },
  {
    Symbol: "♯5",
    AffectedRole: "fifth",
    Operation: 1,
    Category: "alteration",
    Requires: "",
    Conflicts: "♭5",
    Aliases: "#5,+5",
    ModifierType: "alteration",
  },
  {
    Symbol: "♭9",
    AffectedRole: "ninth",
    Operation: -1,
    Category: "alteration",
    Requires: "7",
    Conflicts: "♯9",
    Aliases: "b9,-9",
    ModifierType: "alteration",
  },
  {
    Symbol: "♯9",
    AffectedRole: "ninth",
    Operation: 1,
    Category: "alteration",
    Requires: "7",
    Conflicts: "♭9",
    Aliases: "#9,+9",
    ModifierType: "alteration",
  },
  {
    Symbol: "♯11",
    AffectedRole: "eleventh",
    Operation: 1,
    Category: "alteration",
    Requires: "7",
    Conflicts: "",
    Aliases: "#11,+11",
    ModifierType: "alteration",
  },
  {
    Symbol: "♭13",
    AffectedRole: "thirteenth",
    Operation: -1,
    Category: "alteration",
    Requires: "7",
    Conflicts: "",
    Aliases: "b13,-13",
    ModifierType: "alteration",
  },
];

// Combine all modifiers in the order they should be parsed
// This ordering is crucial for correct chord symbol interpretation
export const chordModifiers = [
  ...qualityModifiers, // Parse quality first to establish chord base
  ...suspensionModifiers, // Then check for suspensions
  ...extensionModifiers, // Then add extensions
  ...addModifiers, // Then handle additions
  ...alterationModifiers, // Finally apply alterations
];

// Export individual categories for when specific modifier types are needed
export {
  qualityModifiers,
  suspensionModifiers,
  extensionModifiers,
  addModifiers,
  alterationModifiers,
};
