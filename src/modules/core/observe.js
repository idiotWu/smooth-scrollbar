import {
    GLOBAL_ENV,
} from '../../contants/';

import {
    getPrivateProp,
    setPrivateProp,
} from '../utils/';

import {
    update,
} from '../apis/';

/**
 * Initialize mutation observer
 * @private
 */
export function observe() {
    if (typeof GLOBAL_ENV.MutationObserver !== 'function') {
        return;
    }

    const {
        content,
    } = this::getPrivateProp('targets');

    // observe
    const observer = new GLOBAL_ENV.MutationObserver(() => {
        this::update(true);
    });

    observer.observe(content, {
        childList: true,
    });

    this::setPrivateProp('observer', observer);
};
