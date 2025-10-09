export const LIBRARY = 'effsz';
/**
 * Event types
 */
const EVENT_TYPE = {
    S: 'start',
    M: 'move',
    E: 'end'
} as const;

export const varName = (...parts: string[]) => `--${LIBRARY}-${parts.join('-')}`;
export const tagName = (name: string) => LIBRARY + '-' + name;
export const propVals = (...pairs: [string, string | number][]) => pairs.map(([prop,val]) => prop + ':' + val + ';').join('');
export const rule = (selector: string, content: string) => selector + `{${content}}`;
export const ruleByPropVals = (selector: string, ...content: [string, string | number][]) => selector + `{${propVals(...content)}}`;
export const resolveModule =  <T>(name: string) => {
    const eventName = LIBRARY + name;
    return {
        tagName: LIBRARY + '-' + name,
        dispatch: (element: HTMLElement, type: string, detail: object = {}) => element?.dispatchEvent(new CustomEvent(eventName, {
            bubbles: true,
            detail: {
                ...(detail || {}),
                type
            }
        })),
        removeListener: (element: HTMLElement, callback: EventListenerOrEventListenerObject) => element.removeEventListener(eventName, callback),
        addListener: (element: HTMLElement, callback: EventListenerOrEventListenerObject) => element.addEventListener(eventName, callback),
        varName: (...parts: string[]) => varName(name, ...parts),
        varExp: (parts: string[], rep?: string | number) => `var(${varName(name, ...parts)}${rep !== undefined ? ', ' + rep : ''})`,
        getStyleSheet: (rules: string[]) => {
            const stylesheet = new CSSStyleSheet();
            stylesheet.replaceSync(rules.join(''));
            return stylesheet;
        },
        EVENT_TYPE
    };
};
export const varExp = (name: string, rep?: string | number) => `var(${name}${rep !== undefined ? ', ' + rep : ''})`;
export const attrExp = (attr: string, val?: string | number | null) => `[${attr}${val ? '=' + val : ''}]`;

export const PARAMS = {
    x: {
        min: 'min-width',
        start: 'left',
        val: 'clientX',
        size: 'clientWidth',
        scroll: 'scrollWidth',
        offset: 'scrollLeft'
    },
    y: {
        min: 'min-height',
        start: 'top',
        val: 'clientY',
        size: 'clientHeight',
        scroll: 'scrollHeight',
        offset: 'scrollTop'
    }
} as const;
export const space = (...args: (string | number)[]) => args.join(' ');
export const color = (alpha: number) => `oklch(from currentColor l c h / ${alpha})`;