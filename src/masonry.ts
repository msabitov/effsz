import { resolveModule, ruleByPropVals, space } from "./common";


/**
 * Masonry container
 */
export interface IMasonryContainerElement extends HTMLElement {
    get axis(): 'x' | 'y';
    set axis(val: 'x' | 'y');
    get layout(): Record<number, number[]>;
}

/**
 * Masonry container attributes
 */
export interface IMasonryContainerAttrs {
    /**
     * Main axis
     */
    axis: 'x' | 'y';
    /**
     * Number of tracks
     */
    tracks: string;
    /**
     * Slots divider aspect ratio
     * @description
     * Default value is `0.1` for x-axis container and `10` for y-axis
     */
    divratio: string;
    /**
     * Gap between tracks
     */
    trackgap: string;
};

interface IMasonryEvent extends CustomEventInit {
    detail: {
        type: 'change';
    }
};

type TMasonryEventHandler = (event: IMasonryEvent) => void;

export type TUseMasonry = {
    (): {
        /**
         * Observe masonry events
         * @param callback - event handler
         * @param element - HTML element
         */
        observe: (callback: TMasonryEventHandler, element?: HTMLElement) => () => void;
        /**
         * Unobserve masonry events
         * @param callback - event handler
         * @param element - HTML element
         */
        unobserve: (callback: TMasonryEventHandler, element?: HTMLElement) => void;
    };
};

// constants and utils
const MODULE = 'masonry';
const HOST = ':host';
const HOST_X = HOST + '([axis=x])';
const ROOT_CLS_VAL = 'root';
const ROOT_CLS = '.' + ROOT_CLS_VAL;
const ITEM_CLS_VAL = 'item';
const ITEM_CLS = '.' + ITEM_CLS_VAL;
const TRACK_CLS_VAL = 'track';
const TRACK_CLS = '.' + TRACK_CLS_VAL;
const WIDTH = 'width';
const FULL = '100%';
const AUTO = 'auto';
const HEIGHT = 'height';
const DISPLAY = 'display';
const FLEX = 'flex';
const GRID = 'grid';
const GTR = 'grid-template-rows';
const GTC = 'grid-template-columns';
const FULL_W = [WIDTH, FULL];
const FULL_H = [HEIGHT, FULL];
const AUTO_W = [WIDTH, AUTO];
const AUTO_H = [HEIGHT, AUTO];
const DIS_G = [DISPLAY, GRID];
const FDIR = FLEX + '-direction';
const SLOTCHANGE = 'slotchange';

const {
    addListener,
    removeListener,
    dispatch,
    tagName,
    varName,
    varExp,
    getStyleSheet
} = resolveModule(MODULE);

const ATTRS = {
    axis: 'axis',
    tracks: 'tracks',
    divratio: 'divratio',
    trackgap: 'trackgap'
};
const TEMPLATE = `repeat(${varExp([ATTRS.tracks], 2)},1fr)`;
const OBSERVED_ATTRS_KEYS = Object.values(ATTRS);

// css
const RULES = [
    ruleByPropVals(ROOT_CLS, FULL_W, AUTO_H, DIS_G, [
        GTR, AUTO
    ], [
        GTC, TEMPLATE
    ], [
        'gap', `${varExp([ATTRS.trackgap], '0.25rem')}`
    ]),
    ruleByPropVals(space(HOST_X, ROOT_CLS), [
        GTR, TEMPLATE
    ], [
        GTC, AUTO
    ], FULL_H, AUTO_W),
    ruleByPropVals(ITEM_CLS, [
        'contain', 'inline-size'
    ],[
        'overflow', 'hidden'
    ], FULL_W, AUTO_H, DIS_G),
    ruleByPropVals(space(HOST_X, ITEM_CLS), AUTO_W, FULL_H),
    ruleByPropVals(TRACK_CLS, [
        DISPLAY, FLEX
    ], [
        FDIR, 'column'
    ]),
    ruleByPropVals(space(HOST_X, TRACK_CLS), [
        FDIR, 'row'
    ])
];

const DEF_DIVRATIO = {
    x: '0.1',
    y: '10'
};


/**
 * Use masonry container
 */
export const useMasonry: TUseMasonry = () => {
    const custom = globalThis.customElements;
    const doc = globalThis.document;
    if (custom && !custom?.get(tagName)) {
        custom.define(tagName, class Masonry extends HTMLElement implements IMasonryContainerElement {
            static get observedAttributes() {
                return OBSERVED_ATTRS_KEYS;
            }

            protected _layout: Record<number, number[]> = {};

            get axis() {
                return (this.getAttribute('axis') || 'y') as IMasonryContainerElement['axis'];
            }

            set axis(val: 'x' | 'y') {
                if (val === 'x' || val === 'y') this.setAttribute(ATTRS.axis, val);
            }

            get layout() {
                return this._layout;
            }

            // protected methods

            protected _cleanUp: () => void;

            /**
             * Render slots
             */
            protected _render() {
                if (!this.shadowRoot) return
                const tracks = Number(this.getAttribute(ATTRS.tracks)) || 2;
                let result: Record<string, {
                    items: [number | null, string][];
                    sum: number;
                }> = {};
                this._layout = {};
                Array.from(Array(tracks).keys()).forEach(i=> {
                    result[i] = {
                        items: [],
                        sum: 0
                    };
                    this._layout[i] = [];
                });
                let divRatioAttr = this.getAttribute(ATTRS.divratio) || DEF_DIVRATIO[this.axis];
                const [gapA, gapB='1'] = divRatioAttr.split('/');
                let divRatio: number;
                if (this.axis === 'x') divRatio = Number(gapA) / Number(gapB);
                else divRatio = Number(gapB) / Number(gapA);
                const fixedDivRatio = Number(divRatio.toFixed(4));
                result = [...this.children].reduce((acc, child) => {
                    const ind = (child as HTMLElement).getAttribute('slot');
                    if (ind === null) return acc;
                    const sumArray = Object.values(acc).map(i => i.sum);
                    const index = sumArray.indexOf(Math.min(...sumArray));
                    const ratioString = (child as HTMLElement).style.aspectRatio || (child as HTMLElement).dataset.effszAr || '1';
                    const [a,b='1'] = ratioString.split('/')
                    let ratio: number;
                    if (this.axis === 'y') ratio = Number(a) / Number(b);
                    else ratio = Number(b) / Number(a);
                    const fixedRatio = Number((1 / ratio).toFixed(4));
                    this._layout[index].push(Number(ind));
                    acc[index].items.push([Number(ind), ratioString]);
                    acc[index].items.push([null, divRatioAttr]);
                    acc[index].sum += (fixedRatio + fixedDivRatio);
                    return acc;
                }, result);
                this.shadowRoot.children[0].innerHTML = Object.entries(result).map(([_, data]) => {
                    return `<div class="${TRACK_CLS_VAL}">${data.items.map(([i, ratio]) => {
                        const isSeparator = i !== null;
                        let slot = '';
                        if (isSeparator) slot = `<slot name="${i}"></slot>`;
                        return `<div class="${ITEM_CLS_VAL}" style="aspect-ratio:${ratio || 1};">${slot}</div>`
                    }).join('')}</div>`}).join('');
                dispatch(this, 'change');
            }

            // public methods

            connectedCallback() {
                // shadow root
                const shadowRoot = this.attachShadow({ mode: 'open' });
                shadowRoot.innerHTML = `<div class="${ROOT_CLS_VAL}"></div>`;
                shadowRoot.adoptedStyleSheets = [getStyleSheet(RULES)];
                // attrs
                OBSERVED_ATTRS_KEYS.forEach((name) => {
                    const val = this.getAttribute(name);
                    if (val) this.attributeChangedCallback(name, '', val);
                });
                const onChange = () => this._render();
                // observe slotchange
                this.addEventListener(SLOTCHANGE, onChange);
                // observe mutations
                const observer = new MutationObserver(onChange);
                observer.observe(this, {
                    childList: true,
                })
                this._cleanUp = () => {
                    this.removeEventListener(SLOTCHANGE, onChange);
                    observer.disconnect();
                };
                this._render();
            }

            attributeChangedCallback(name: typeof OBSERVED_ATTRS_KEYS[number], _: string, newValue: string) {
                const root = this.shadowRoot?.children[0] as HTMLDivElement;
                if (!root) return;
                switch(name) {
                    case ATTRS.axis:
                    case ATTRS.tracks:
                    case ATTRS.divratio:
                        root.style.setProperty(varName(name), newValue);
                        this._render();
                        break;
                    case ATTRS.trackgap:
                        root.style.setProperty(varName(name), !Number.isNaN(+newValue) ? newValue + 'px' : newValue);
                        break;
                }
            }

            disconnectedCallback() {
                this._cleanUp();
            }
        });
    }
    return {
        observe: (callback: TMasonryEventHandler, element: HTMLElement = doc?.body) => {
            element && addListener(element, callback as unknown as EventListenerOrEventListenerObject);
            return () => element && removeListener(element, callback as unknown as EventListenerOrEventListenerObject);
        },
        unobserve: (callback: TMasonryEventHandler, element: HTMLElement = doc?.body) => removeListener(element, callback as unknown as EventListenerOrEventListenerObject)
    };
};
