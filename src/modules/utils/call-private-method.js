import { getPrivateMethod } from './get-private-method';

/**
 * Invoke private method
 * @param {string} name
 * @param {...any} [args] - Arguments passed to method
 * @return {any} - The result of execution
 */
export function callPrivateMethod(name, ...args) {
    return this::getPrivateMethod(name)(...args);
};
