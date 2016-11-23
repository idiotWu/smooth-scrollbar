export function toArray(arrayLike, mapFn) {
    if (typeof Array.from === 'function') {
        return Array.from(arrayLike, mapFn);
    }

    const arr = Array.prototype.slice.call(arrayLike);

    return typeof mapFn === 'function' ? arr.map(mapFn) : arr;
}
