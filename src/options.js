export const DEFAULT_OPTIONS = {
    speed: 1, // scroll speed scale
    fricton: 10, // fricton factor, percent
    inflection: 10, // inflection point
    sensitivity: 0.1 // wheel sensitivity, [0.1, 1]
};

export const OPTION_LIMIT = {
    fricton: [1, 99],
    inflection: [10, Infinity],
    speed: [0, Infinity],
    sensitivity: [0.1, 1]
};