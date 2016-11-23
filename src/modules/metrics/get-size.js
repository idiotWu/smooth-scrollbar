import {
    getPrivateProp,
} from '../namespace/';

/**
 * Get container and content size
 * @public
 * @api
 * @return {object} - an object contains container and content's width and height
 */
export function getSize() {
    const {
        container,
        content,
    } = this::getPrivateProp('targets');

    return {
        container: {
            // requires `overflow: hidden`
            width: container.clientWidth,
            height: container.clientHeight,
        },
        content: {
            // border width should be included
            width: content.offsetWidth - content.clientWidth + content.scrollWidth,
            height: content.offsetHeight - content.clientHeight + content.scrollHeight,
        },
    };
};
