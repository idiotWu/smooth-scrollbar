import $debounce from 'lodash-es/debounce';

export function debounce(...options) {
  return (_proto: any, key: string, descriptor: PropertyDescriptor) => {
    const fn = descriptor.value;

    return {
      get() {
        if (!this.hasOwnProperty(key)) {
          Object.defineProperty(this, key, {
            value: $debounce(fn, ...options),
          });
        }

        return this[key];
      },
    };
  };
}
