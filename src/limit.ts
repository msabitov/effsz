import {
    PARAMS,
    resolveModule, ruleByPropVals
} from './common';

/**
 * Limit container
 */
export interface ILimitContainerElement extends HTMLElement {
    /**
     * Split axis
     */
    get axis(): 'x' | 'y';
    /**
     * Visible elements count
     */
    get limitCount(): number;
    /**
     * Is container hiding some children
     */
    get isLimited(): boolean;
}
/**
 * Limit container attributes
 */
export interface ILimitContainerAttrs {
    /**
     * Flex direction
     */
    fdir: 'r' | 'rr' | 'c' | 'cr';
    /**
     * Gap in px
     */
    gap: string;
}

const MODULE = 'limit';

const {
    addListener,
    removeListener,
    dispatch,
    tagName,
    varName,
    varExp,
    getStyleSheet,
    EVENT_TYPE
} = resolveModule(MODULE);

// constants
const POINTER_EVENTS = 'pointer-events';
const NONE = 'none';
const AUTO = 'auto';
const VISIBILITY = 'visibility';
const VISIBLE = 'visible';
const DISPLAY = 'display';
const HIDDEN = 'hidden';
const FLEX_BASIS = 'flex-basis';
const GAP = 'gap';
const FDIR = 'fdir';
const COLUMN = 'column';
const ROW = 'row';
const MIN_ = 'min-';
const _REVERSE = '-reverse';
const HEIGHT = 'height';
const WIDTH = 'width';
const FULL = '100%';
const FIT_CONTENT = 'fit-content';
const HOST = ':host';
const OVERFLOW = 'overflow';
const HEIGHT_FULL = [HEIGHT, FULL] as [string, string];
const OVER_H = [
    OVERFLOW, HIDDEN
] as [string, string];
const DIS_IF = [
    DISPLAY, 'inline-flex'
] as [string, string];
const DIS_F = [
    DISPLAY, 'flex'
] as [string, string];
const PE_N = [POINTER_EVENTS, NONE] as [string, string];
const DIR_FDIR = ['flex-direction', varExp([FDIR])] as [string, string];
const ATTRS = {
    gap: GAP
} as const;

const RULES = [
    ruleByPropVals(HOST,
        OVER_H, [DISPLAY, 'flex'], ['position', 'relative'], DIR_FDIR, [WIDTH, FULL], [HEIGHT, AUTO]
    ),
    ruleByPropVals(':host([fdir=r])', [varName(FDIR), ROW]),
    ruleByPropVals(':host([fdir=rr])', [varName(FDIR), ROW + _REVERSE]),
    ruleByPropVals(':host([fdir=c])', [varName(FDIR), COLUMN], HEIGHT_FULL, [WIDTH, AUTO]),
    ruleByPropVals(':host([fdir=cr])', [varName(FDIR), COLUMN + _REVERSE], [HEIGHT, FULL], [WIDTH, AUTO]),
    ruleByPropVals('#outer', OVER_H, DIS_F, DIR_FDIR),
    ruleByPropVals('#inner', DIS_IF, DIR_FDIR, [GAP, `calc(1px * ${varExp([GAP])})`]),
    ruleByPropVals('#end', DIS_IF, DIR_FDIR, [FLEX_BASIS, 0], OVER_H, PE_N, [MIN_ + WIDTH, FIT_CONTENT]),
    ruleByPropVals('::slotted(*)', OVER_H, ['flex', '0 0 auto']) 
];

export type TUseLimit = {
    (): {
        /**
         * Observe limit events
         * @param callback - event handler
         * @param element - HTML element
         */
        observe: (callback: EventListenerOrEventListenerObject, element?: HTMLElement) => () => void;
        /**
         * Unobserve limit events
         * @param callback - event handler
         * @param element - HTML element
         */
        unobserve: (callback: EventListenerOrEventListenerObject, element?: HTMLElement) => void;
    };
};

/**
 * Use limit container
 */
export const useLimit: TUseLimit = () => {
    const custom = globalThis.customElements;
    const doc = globalThis.document;
    if (custom && !custom?.get(tagName)) {
        custom.define(tagName, class Limit extends HTMLElement implements ILimitContainerElement {
            static observedAttributes = Object.keys(ATTRS) as (keyof typeof ATTRS)[];

            protected _state = {
                limit: 0
            };

            get axis() {
                const fdir = this.getAttribute('fdir');
                return (fdir === 'c' || fdir === 'cr') ? 'y' : 'x';
            }

            get limitCount() {
                return this._state.limit;
            }

            get isLimited() {
                const slot = (this.shadowRoot as any)?.getElementById('inner').firstElementChild as HTMLSlotElement;
                return slot.assignedElements().length > this.limitCount;
            }

            protected _limitCleanUp: Function = () => undefined;

            // public methods

            connectedCallback() {
                const shadowRoot = this.attachShadow({ mode: 'open' });
                shadowRoot.innerHTML = `<div id='start'></div><div id='outer'><div id='inner'><slot></slot></div></div><div id='end'><slot name='limit'></slot></div>`;
                shadowRoot.adoptedStyleSheets = [
                    getStyleSheet(RULES),
                    new CSSStyleSheet()
                ];
                Limit.observedAttributes.forEach((name) => {
                    const value = this.getAttribute(name);
                    this.attributeChangedCallback(name, '', value || '');
                })
                const resizeObserver = new ResizeObserver(this._limit);
                resizeObserver.observe(shadowRoot.firstElementChild as Element);
                resizeObserver.observe(this);
                const onSlotChange = () => this._limit();
                this._limitCleanUp = () => {
                    this.removeEventListener('slotchange', onSlotChange);
                    resizeObserver.unobserve(shadowRoot.firstElementChild as Element);
                    resizeObserver.unobserve(this)
                };
            }

            dissconnectedCallback() {
                this._limitCleanUp();
            }

            attributeChangedCallback(
                name: keyof typeof ATTRS,
                oldValue: string,
                newValue: string
            ) {
                if (!this.shadowRoot) return;
                else if (newValue) (this.shadowRoot?.children[1] as HTMLElement).style.setProperty(varName(name), newValue);
                else (this.shadowRoot?.children[1] as HTMLElement).style.removeProperty(varName(name));
                this._limit();
            }

            protected _limit = () => {
                const [_, content, limit] = this.shadowRoot?.children as HTMLCollection;
                const children: Element[] = (content.children[0]?.children[0] as HTMLSlotElement)?.assignedElements?.();
                if (!children) return;
                const axis = this.axis;
                const property = PARAMS[axis].size;
                const endChilds: Element[] = (limit.firstElementChild as HTMLSlotElement)?.assignedElements() || [];
                const endSize = endChilds.reduce((acc, ch) => acc + ch[property], 0)
                const redSize = this[property] - endSize;
                const size = this[property];
                const gap = Number(this.getAttribute('gap')) || 0;
                let sum = 0;
                let counter = 1;
                let counterWithEnd = children.length;
                for (const child of Array.from(children)) {
                    sum += child[property];
                    if (counterWithEnd === children.length && sum >= redSize) counterWithEnd = counter;
                    if (sum >= size) break;
                    else {
                        sum += gap;
                        counter++;
                    }
                }
                if (sum < size) {
                    this.shadowRoot?.adoptedStyleSheets[1].replaceSync( ruleByPropVals('#end', [MIN_ + WIDTH, 0], [MIN_ + HEIGHT, 0]));
                    if (children.length !== this._state.limit) {
                        this._state.limit = children.length;
                    }
                    dispatch(this, EVENT_TYPE.M, {
                        limit: this._state.limit
                    });
                    return;
                }
                const nextLimit = counterWithEnd - 1;
                if (nextLimit !== this._state.limit) {
                    this._state.limit = nextLimit;
                    dispatch(this, EVENT_TYPE.M, {
                        limit: this._state.limit
                    });
                }
                this.shadowRoot?.adoptedStyleSheets[1].replaceSync([
                    ruleByPropVals(`::slotted(*:not([slot=limit]):nth-child(n+${counterWithEnd}))`,
                        [VISIBILITY, HIDDEN],
                        PE_N
                    ),
                    ruleByPropVals('#end',
                        [FLEX_BASIS, AUTO],
                        [VISIBILITY, VISIBLE],
                        [POINTER_EVENTS, AUTO],
                        [PARAMS[axis].min, FIT_CONTENT]
                    )].join('')
                );
            }
        });
    }
    return {
        observe: (callback: EventListenerOrEventListenerObject, element: HTMLElement = doc?.body) => {
            element && addListener(element, callback);
            return () => element && removeListener(element, callback);
        },
        unobserve: (callback: EventListenerOrEventListenerObject, element: HTMLElement = doc?.body) => removeListener(element, callback)
    };
};
