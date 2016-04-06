export const DEFAULT_OPTIONS = {
    speed: 1,        // scroll speed scale
    fricton: 10,     // fricton factor, percent
    ignoreEvents: [] // events names to be ignored
};

export const OPTION_LIMIT = {
    fricton: [1, 99],
    speed: [0, Infinity]
};